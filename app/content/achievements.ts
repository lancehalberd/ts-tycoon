import { getArea } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { TrophyAltar } from 'app/content/areas';
import { mainContext } from 'app/dom';
import { TROPHY_SIZE } from 'app/gameConstants';
import { drawRectangleBackground, requireImage } from 'app/images';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { drawFrame } from 'app/utils/animations';
import { isPointInShortRect, r } from 'app/utils/index';

import {
    Character, Frame, JobAchievement, ShortRectangle,
} from 'app/types';


let isAltarTrophyAvailable = false;
let choosingTrophyAltar: TrophyAltar = null;
interface TrophyPopup extends ShortRectangle {
    dismissed: boolean,
    trophy: JobAchievement,
    time: number,
    onClick: Function,
}
const trophyPopups: TrophyPopup[] = [];
const trophyPopupWidth = 160;
const trophyPopupHeight = 80;

export function getDefaultAltarTrophies(): {[key: string]: JobAchievement} {
    return {
        'level-juggler': new JobAchievement('juggler',
            [{'+accuracy': 1}, {'%attackSpeed': 0.1}, {'+attackSpeed': 0.1}, {'*attackSpeed': 1.1}]),
        'level-ranger': new JobAchievement('ranger',
            [{'+accuracy': 2}, {'+ranged:range': 0.5}, {'+ranged:range': 0.5, '+ranged:physicalDamage': 5}, {'*ranged:damage': 1.1}]),
        'level-sniper': new JobAchievement('sniper',
            [{'+accuracy': 3}, {'%critChance': 0.1}, {'+critChance': 0.02}, {'*critChance': 1.1}]),

        'level-priest': new JobAchievement('priest',
            [{'+healthRegen': 2}, {'+healthRegen': ['{maxHealth}', '/', 100]}, {'%healthRegen': 0.1}, {'*healthRegen': 1.1}]),
        'level-wizard': new JobAchievement('wizard',
            [{'+magicPower': 2}, {'+spell:area': 0.5}, {'%spell:area': 0.1}, {'*spell:area': 1.1}]),
        'level-sorcerer': new JobAchievement('sorcerer',
            [{'+magicDamage': 1}, {'%magicDamage': 0.1}, {'+magicDamage': ['{level}', '/', 8]}, {'*magicDamage': 1.1}]),

        'level-blackbelt': new JobAchievement('blackbelt',
            [{'+maxHealth': 15}, {'%maxHealth': 0.1}, {'+maxHealth': ['{level}', '*', 3]}, {'*maxHealth': 1.1}]),
        'level-warrior': new JobAchievement('warrior',
            [{'+armor': 2}, {'%armor': 0.1}, {'+armor': ['{level}', '/', 2]}, {'*armor': 1.1}]),
        'level-samurai': new JobAchievement('samurai',
            [{'+physicalDamage': 2}, {'%physicalDamage': 0.1}, {'+physicalDamage': ['{level}', '/', 4]}, {'*physicalDamage': 1.1}]),

        'level-corsair': new JobAchievement('corsair',
            [{'+critAccuracy': .1}, {'%critAccuracy': 0.1}, {'+critAccuracy': 0.2}, {'*critAccuracy': 1.1}]),
        'level-assassin': new JobAchievement('assassin',
            [{'+critDamage': .05}, {'%critDamage': 0.1}, {'+critDamage': 0.1}, {'*critDamage': 1.1}]),
        'level-ninja': new JobAchievement('ninja',
            [{'+speed': 5}, {'%speed': 0.1}, {'+speed': 10}, {'*speed': 1.1}]),

        'level-paladin': new JobAchievement('paladin',
            [{'+block': 2, '+magicBlock': 1}, {'%block': 0.1, '%magicBlock': 0.1}, {'+block': ['{level}', '/', 2], '+magicBlock': ['{level}', '/', 4]}, {'*block': 1.1, '*magicBlock': 1.1}]),
        'level-darkknight': new JobAchievement('darkknight',
            [{'+magicResist': .01}, {'%magicResist': 0.1}, {'+magicResist': 0.02}, {'*magicResist': 1.1}]),
        'level-enhancer': new JobAchievement('enhancer',
            [{'+dexterity': 1, '+strength': 1, '+intelligence': 1}, {'%dexterity': 1.05, '%strength': 1.05, '%intelligence': 1.05},
             {'+dexterity': 2, '+strength': 2, '+intelligence': 2}, {'*dexterity': 1.05, '*strength': 1.05, '*intelligence': 1.05}]),

        'level-dancer': new JobAchievement('dancer',
            [{'+evasion': 2}, {'%evasion': 0.1}, {'+evasion': ['{level}', '/', 2]}, {'*evasion': 1.1}]),
        'level-bard': new JobAchievement('bard',
            [{'+duration': 0.5}, {'%duration': 0.1}, {'+duration': 1}, {'*duration': 1.1}]),
        'level-sage': new JobAchievement('sage',
            [{'+magicPower': 5}, {'%magicPower': .1}, {'+magicPower': 10}, {'*magicPower': 1.1}]),

        'level-fool': new JobAchievement('fool',
            [{'+critDamage': 0.2, '-critChance': 0.01}, {'%critDamage': 0.4, '%critChance': -0.4},
            {'+critDamage': 1, '-critChance': 0.05}, {'*critDamage': 1.2, '*critChance': 0.8}]),
        'level-master': new JobAchievement('master',
            [{'+weaponRange': 0.5}, {'%weaponRange': 0.1}, {'+weaponRange': 1}, {'*weaponRange': 1.1}]),
    };
}


/**
 * The achievement system allows player to unlock decorations for their guild by meeting
 * certain criteria, like leveling a job a certain amount or killing a certain number of enemies.
 *
 * The decorations are either wall decorations that can be hung in specified locations on walls,
 * or trophies that can be placed on specific pedestals.
 */
export function getChoosingTrophyAltar() {
    return choosingTrophyAltar;
}
export function setChoosingTrophyAltar(trophyAltar: TrophyAltar) {
    choosingTrophyAltar = trophyAltar
}
export function selectTrophy(selectedTrophy: JobAchievement, character: Character) {
    // A trophy must be at least level 1 to be used.
    if (!(selectedTrophy.level > 0)) {
        return;
    }
    const existingTrophy = choosingTrophyAltar.trophy;
    // If the selected trophy was already placed somewhere, remove it and get
    // a reference to the old altar it was in, in case we need to swap something there.
    const oldAltar: TrophyAltar = detachTrophy(selectedTrophy);
    // remove whatever trophy is currently there, if any.
    if (existingTrophy && existingTrophy !== selectedTrophy) {
        // If we moved another trophy to replace this trophy, move this trophy
        // back to the old trophies altar.
        if (oldAltar) {
            existingTrophy.areaKey = oldAltar.area.key;
            existingTrophy.objectKey = oldAltar.key;
            oldAltar.trophy = existingTrophy;
        } else {
            existingTrophy.areaKey = null;
            existingTrophy.objectKey = null;
            choosingTrophyAltar.trophy = null;
            removeTrophyBonuses(existingTrophy);
        }
    }
    // If this is not the removed trophy, add this trophy to the altar.
    if (existingTrophy !== selectedTrophy) {
        addTrophyToAltar(choosingTrophyAltar, selectedTrophy);
    }
    choosingTrophyAltar = null;
    recomputeAllCharacterDirtyStats();
    checkIfAltarTrophyIsAvailable();
    saveGame();
}
function detachTrophy(trophy: JobAchievement): TrophyAltar {
    // It is possible the area or altar assigned no longer exists after a game update.
    const area = getArea('guild', trophy.areaKey);
    if (!area) {
        return null;
    }
    const trophyAltar = area.objectsByKey[trophy.objectKey] as TrophyAltar;
    if (!trophyAltar) {
        return null;
    }
    trophyAltar.trophy = null;
    trophy.areaKey = null;
    trophy.objectKey = null;
    removeTrophyBonuses(trophy);
    return trophyAltar;
}
export function addTrophyToAltar(altar: TrophyAltar, trophy: JobAchievement) {
    trophy.areaKey = altar.area.key;
    trophy.objectKey = altar.key;
    altar.trophy = trophy;
    addTrophyBonuses(trophy);
}

export const trophySelectionRectangle = r(60, 25, 200, 150);
interface TrophySelection extends ShortRectangle {
    trophy: JobAchievement;
    isPointOver: (x: number, y: number) => boolean,
    onClick: () => void,
    helpMethod: () => string,
}
const trophySelections: TrophySelection[] = [];
function initializeTrophySelections() {
    const { altarTrophies } = getState();
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        trophySelections.push({
            trophy,
            isPointOver: isPointOverShortRectangle,
            x: 0, y: 0, w: TROPHY_SIZE, h: TROPHY_SIZE,
            onClick: () => trophy.onClick(),
            helpMethod: () => trophy.helpMethod(),
        });
    }
}
function isPointOverShortRectangle(this: ShortRectangle, x: number, y: number): boolean {
    return isPointInShortRect(x, y, this);
}
const checkFrame: Frame = {image: requireImage('gfx/militaryIcons.png'), x: 68, y: 90, w: 16, h: 16};
export function drawTrophySelection() {
    if (!trophySelections.length) {
        initializeTrophySelections();
    }
    drawRectangleBackground(mainContext, trophySelectionRectangle);
    const trophySpacing = 5;
    let x = 5;
    let y = 5;
    for (const trophySelection of trophySelections) {
        const trophy = trophySelection.trophy;
        trophySelection.x = trophySelectionRectangle.x + x;
        trophySelection.y = trophySelectionRectangle.y + y;
        trophy.render(mainContext, trophySelection);
        const area = trophy.areaKey && getArea('guild', trophy.areaKey);
        if (area && area.objectsByKey[trophy.objectKey]) {
            const target: ShortRectangle = {
                x: trophySelection.x + trophySelection.w - 5,
                y: trophySelection.y + trophySelection.h - 5,
                w: 6, h: 6
            };
            mainContext.fillStyle = 'white';
            mainContext.strokeStyle = 'black';
            mainContext.lineWidth = 2;
            mainContext.beginPath();
            mainContext.arc(target.x + target.w / 2, target.y + target.h / 2, 4, 0, 2 * Math.PI);
            mainContext.fill();
            mainContext.stroke();
            drawFrame(mainContext, checkFrame, target);
        }
        x += TROPHY_SIZE + trophySpacing;
        if (x + TROPHY_SIZE + trophySpacing > trophySelectionRectangle.w - 5) {
            x = 5;
            y += TROPHY_SIZE + trophySpacing;
        }
    }
}
export function getTrophyPopupTarget(x: number, y: number): TrophySelection {
    for (const trophySelection of trophySelections) {
        if (isPointInShortRect(x, y, trophySelection)) {
            return trophySelection;
        }
    }
    return null;
}

export function updateTrophy(trophyKey: string, value: number) {
    const { altarTrophies } = getState();
    const trophy = altarTrophies[trophyKey];
    trophy.value = Math.max(trophy.value, value);
    let i = 0;
    for (; i < trophy.bonusesArray.length; i++) {
        if (trophy.bonusesArray[i].target > trophy.value) {
            break;
        }
    }
    if (i === trophy.level) return;
    // If we are changing the level of the trophy, and the trophy is on display, we need to
    // remove its bonuses, then add them again after changing the level.
    if (trophy.areaKey) {
        removeTrophyBonuses(trophy);
    }
    trophy.level = i;
    if (trophy.areaKey) {
        addTrophyBonuses(trophy, true);
    }
    // This may be a newly available trophy, so update trophy availability.
    checkIfAltarTrophyIsAvailable();
    showTrophyPopup(trophy);
}

function addTrophyBonuses(trophy: JobAchievement, recompute = false) {
    const state = getState();
    for (let i = 0; i < trophy.bonusesArray.length && i < trophy.level; i++) {
        const bonusSource = trophy.bonusesArray[i];
        if (state.guildBonusSources.indexOf(bonusSource) >= 0) {
            console.log(bonusSource);
            console.log(state.guildBonusSources);
            throw new Error('bonus source was already present in guildBonusSources!');
        }
        state.guildBonusSources.push(bonusSource);
        for (const character of state.characters) {
            addBonusSourceToObject(character.hero.variableObject, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}
function removeTrophyBonuses(trophy: JobAchievement, recompute = false) {
    const state = getState();
    for (let i = 0; i < trophy.bonusesArray.length && i < trophy.level; i++) {
        const bonusSource = trophy.bonusesArray[i];
        if (state.guildBonusSources.indexOf(bonusSource) < 0) {
            console.log(bonusSource);
            console.log(state.guildBonusSources);
            throw new Error('bonus source was not found in guildBonusSources!');
        }
        state.guildBonusSources.splice(state.guildBonusSources.indexOf(bonusSource), 1);
        for (const character of state.characters) {
            removeBonusSourceFromObject(character.hero.variableObject, bonusSource);
            //console.log(bonusSource.bonuses);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}

export function getIsAltarTrophyAvailable(): boolean {
    return isAltarTrophyAvailable;
}
export function checkIfAltarTrophyIsAvailable() {
    const { altarTrophies } = getState();
    isAltarTrophyAvailable = false;
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        if (trophy.level > 0 && !trophy.areaKey) {
            isAltarTrophyAvailable = true;
            break;
        }
    }
}

// Show a popup when the player unlocks a new trophy.
function showTrophyPopup(trophy: JobAchievement) {
    let lastPopup: TrophyPopup;
    if (trophyPopups.length) {
        lastPopup = trophyPopups[trophyPopups.length - 1];
    }
    trophyPopups.push({
        x: Math.min(800, (lastPopup ? lastPopup.x : 800)) - 5 - trophyPopupWidth,
        y: 600,
        w: trophyPopupWidth, h: trophyPopupHeight,
        trophy,
        'time': 0,
        dismissed: false,
        onClick() {
            this.dismissed = true;
        }
    });
}
export function updateTrophyPopups() {
    let previousPopup: TrophyPopup;
    for (const trophyPopup of trophyPopups) {
        if (!trophyPopup.dismissed && previousPopup && trophyPopup.x < previousPopup.x - 5 - trophyPopupWidth) {
            trophyPopup.x = Math.min(trophyPopup.x + 10, 800 - 5 - trophyPopupWidth);
        }
        previousPopup = trophyPopup;
        if (trophyPopup.dismissed) {
            if (trophyPopup.x < 800) {
                trophyPopup.x += 10;
            } else {
                trophyPopups.splice(trophyPopups.indexOf(trophyPopup), 1);
            }
            continue;
        }
        if (trophyPopup.y > 600 - 5 - trophyPopupHeight) {
            trophyPopup.y -= 10;
        } else if (trophyPopup.time < 5) {
            trophyPopup.time += .02;
        } else {
            trophyPopup.dismissed = true;
        }
    }
}

export function drawTrophyPopups() {
    for (const trophyPopup of trophyPopups) {
        mainContext.save();
        mainContext.globalAlpha = .4;
        mainContext.fillStyle = 'black';
        mainContext.fillRect(trophyPopup.x, trophyPopup.y, trophyPopup.w, trophyPopup.y);
        mainContext.restore();
        mainContext.strokeStyle = 'white';
        mainContext.strokeRect(trophyPopup.x, trophyPopup.y, trophyPopup.w, trophyPopup.y);
        trophyPopup.trophy.render(mainContext, {'x': trophyPopup.x + 5, 'y': trophyPopup.y + (trophyPopupHeight - TROPHY_SIZE) / 2, 'w': TROPHY_SIZE, 'h': TROPHY_SIZE});
        mainContext.textAlign = 'left'
        mainContext.textBaseline = 'middle';
        mainContext.fillText('Unlocked', trophyPopup.x + 5 + TROPHY_SIZE + 5, trophyPopup.y + 20);
        mainContext.fillStyle = 'white';
        mainContext.font = '18px sans-serif';
        const titleParts = trophyPopup.trophy.title.split(' ');
        let line = titleParts.shift();
        const textLeft = trophyPopup.x + 5 + TROPHY_SIZE + 5;
        let textBaseLine = trophyPopup.y + 40;
        while (titleParts.length) {
            const metrics = mainContext.measureText(line + ' ' + titleParts[0]);
            if (textLeft + metrics.width + 5 > trophyPopup.x + trophyPopup.w) {
                mainContext.fillText(line, textLeft, textBaseLine);
                textBaseLine += 20;
                line = titleParts.shift();
            } else {
                line += ' ' + titleParts.shift();
            }
        }
        if (line) mainContext.fillText(line, textLeft, textBaseLine);
    }
}
