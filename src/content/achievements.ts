import { addBonusSourceToObject, recomputeDirtyStats, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { characterClasses } from 'app/content/jobs';
import { bodyDiv, divider, mainContext, titleDiv } from 'app/dom';
import { TROPHY_SIZE } from 'app/gameConstants';
import { drawImage, drawOutlinedImage, drawRectangleBackground, drawSolidTintedImage, requireImage } from 'app/images';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { isPointInRectObject, rectangle } from 'app/utils/index';

import { Bonuses } from 'app/types/bonuses';
import { Character, Color, FixedObject, JobAchievement, TrophyAltar } from 'app/types';
import { JobKey } from 'app/types/jobs';


let isAltarTrophyAvailable = false;
let choosingTrophyAltar: TrophyAltar = null;

const trophyPopups: {
    left: number, top: number,
    width: number, height: number,
    dismissed: boolean,
    trophy: JobAchievement,
    time: number,
    onClick: Function,
}[] = [];
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
export function selectTrophy(achievement: JobAchievement, character: Character) {
    // A trophy must be at least level 1 to be used.
    if (!(achievement.level > 0)) return;
    // If this trophy is already placed somewhere, remove it.
    let oldAltar = null;
    const currentTrophy = choosingTrophyAltar.trophy;
    if (achievement.areaKey) {
        oldAltar = getState().guildAreas[achievement.areaKey].objectsByKey[achievement.objectKey];
        oldAltar.trophy = null;
        achievement.areaKey = null;
        achievement.objectKey = null;
        removeTrophyBonuses(achievement);
    }
    // remove whatever trophy is currently there, if any.
    if (currentTrophy && currentTrophy !== achievement) {
        // If we moved another trophy to replace this trophy, move this trophy
        // back to the old trophies altar.
        if (oldAltar) {
            currentTrophy.areaKey = oldAltar.area.key;
            currentTrophy.objectKey = oldAltar.key;
            oldAltar.trophy = currentTrophy;
        } else {
            currentTrophy.areaKey = null;
            currentTrophy.objectKey = null;
            choosingTrophyAltar.trophy = null;
            removeTrophyBonuses(currentTrophy);
        }
    }
    // If this is not the removed trophy, add this trophy to the altar.
    if (currentTrophy !== achievement) {
        addTrophyToAltar(choosingTrophyAltar, achievement);
    }
    choosingTrophyAltar = null;
    recomputeAllCharacterDirtyStats();
    checkIfAltarTrophyIsAvailable();
    saveGame();
}
export function addTrophyToAltar(altar: TrophyAltar, trophy: JobAchievement) {
    trophy.areaKey = altar.area.key;
    trophy.objectKey = altar.key;
    altar.trophy = trophy;
    addTrophyBonuses(trophy);
}

export const trophySelectionRectangle = rectangle(195, 100, 410, 300);
export function drawTrophySelection() {
    drawRectangleBackground(mainContext, trophySelectionRectangle);
    const trophySpacing = 5;
    const checkSource = {'left': 68, 'top': 90, 'width': 16, 'height': 16};
    let left = 10;
    let top = 10;
    const { altarTrophies } = getState();
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        trophy.left = trophySelectionRectangle.left + left;
        trophy.top = trophySelectionRectangle.top + top;
        trophy.render(mainContext, trophy);
        if (trophy.areaKey) {
            const target = {'left': trophy.left + trophy.width - 20, 'top': trophy.top + trophy.height - 20, 'width': 16, 'height': 16};
            mainContext.fillStyle = 'white';
            mainContext.strokeStyle = 'black';
            mainContext.lineWidth = 2;
            mainContext.beginPath();
            mainContext.arc(target.left + target.width / 2, target.top + target.height / 2, 10, 0, 2*Math.PI);
            mainContext.fill();
            mainContext.stroke();
            drawImage(mainContext, requireImage('gfx/militaryIcons.png'), checkSource, target);
        }
        left += TROPHY_SIZE + trophySpacing;
        if (left + TROPHY_SIZE + trophySpacing > trophySelectionRectangle.width - 10) {
            left = 10;
            top += TROPHY_SIZE + trophySpacing;
        }
    }
}
export function getTrophyPopupTarget(x: number, y: number) {
    const { altarTrophies } = getState();
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        if (isPointInRectObject(x, y, trophy)) return trophy;
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
    let lastPopup;
    if (trophyPopups.length) {
        lastPopup = trophyPopups[trophyPopups.length - 1];
    }
    trophyPopups.push({
        'left': Math.min(800, (lastPopup ? lastPopup.left : 800)) - 5 - trophyPopupWidth,
        'top': 600,
        'width': trophyPopupWidth, 'height': trophyPopupHeight,
        trophy,
        'time': 0,
        dismissed: false,
        onClick() {
            this.dismissed = true;
        }
    });
}
export function updateTrophyPopups() {
    let previousPopup;
    for (const trophyPopup of trophyPopups) {
        if (!trophyPopup.dismissed && previousPopup && trophyPopup.left < previousPopup.left - 5 - trophyPopupWidth) {
            trophyPopup.left = Math.min(trophyPopup.left + 10, 800 - 5 - trophyPopupWidth);
        }
        previousPopup = trophyPopup;
        if (trophyPopup.dismissed) {
            if (trophyPopup.left < 800) {
                trophyPopup.left += 10;
            } else {
                trophyPopups.splice(trophyPopups.indexOf(trophyPopup), 1);
            }
            continue;
        }
        if (trophyPopup.top > 600 - 5 - trophyPopupHeight) {
            trophyPopup.top -= 10;
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
        mainContext.fillRect(trophyPopup.left, trophyPopup.top, trophyPopup.width, trophyPopup.height);
        mainContext.restore();
        mainContext.strokeStyle = 'white';
        mainContext.strokeRect(trophyPopup.left, trophyPopup.top, trophyPopup.width, trophyPopup.height);
        trophyPopup.trophy.render(mainContext, {'left': trophyPopup.left + 5, 'top': trophyPopup.top + (trophyPopupHeight - TROPHY_SIZE) / 2, 'width': TROPHY_SIZE, 'height': TROPHY_SIZE});
        mainContext.textAlign = 'left'
        mainContext.textBaseline = 'middle';
        mainContext.fillText('Unlocked', trophyPopup.left + 5 + TROPHY_SIZE + 5, trophyPopup.top + 20);
        mainContext.fillStyle = 'white';
        mainContext.font = '18px sans-serif';
        const titleParts = trophyPopup.trophy.title.split(' ');
        let line = titleParts.shift();
        const textLeft = trophyPopup.left + 5 + TROPHY_SIZE + 5;
        let textBaseLine = trophyPopup.top + 40;
        while (titleParts.length) {
            const metrics = mainContext.measureText(line + ' ' + titleParts[0]);
            if (textLeft + metrics.width + 5 > trophyPopup.left + trophyPopup.width) {
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
