import { addBonusSourceToObject, recomputeDirtyStats, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { FixedObject } from 'app/content/furniture';
import { characterClasses } from 'app/content/jobs';
import { bodyDiv, divider, mainContext, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { drawImage, drawOutlinedImage, drawRectangleBackground, drawSolidTintedImage, requireImage } from 'app/images';
import { getCanvasCoords, getTargetLocation } from 'app/main';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { isPointInRectObject, rectangle } from 'app/utils/index';

import { Bonuses } from 'app/types/bonuses';
import { Color } from 'app/types';
import { JobKey } from 'app/types/jobs';


let isAltarTrophyAvailable = false;
let choosingTrophyAltar: TrophyAltar = null;

const trophyPopups = [];
const trophyPopupWidth = 160;
const trophyPopupHeight = 80;

interface AchievementBonus {
    target: number,
    bonuses: Bonuses,
}
interface TrophyAltar extends FixedObject {
    trophy: JobAchievement,
}

class JobAchievement {
    jobKey: JobKey;
    title: string;
    level: number;
    value: number;
    // These coordinates get set during drawTrophySelection.
    left: number;
    top: number;
    width: number;
    height: number;
    bonusesArray: AchievementBonus[];
    // These fields track where the trophy is displayed if it is displayed.
    areaKey?: string;
    objectKey?: string;
    constructor(jobKey: JobKey, bonuses: [Bonuses, Bonuses, Bonuses, Bonuses]) {
        const job = characterClasses[jobKey];
        this.jobKey = jobKey;
        this.title = job.name + ' Trophy';
        this.level = 0;
        this.value = 0;
        this.width = trophySize;
        this.height = trophySize;
        this.bonusesArray = [
            {target: 2, bonuses: bonuses[0]},
            {target: 10, bonuses: bonuses[1]},
            {target: 30, bonuses: bonuses[2]},
            {target: 60, bonuses: bonuses[3]},
        ];
    }
    draw(context, target) {
        const jobTrophyImage = characterClasses[this.jobKey].achievementImage;
        if (this.level === 0 ) {
            context.save();
            drawSolidTintedImage(context, jobTrophyImage, '#666', {'left': 0, 'top': 0, 'width': 40, 'height': 40}, target);
            context.restore();
            return;
        }
        let color: Color;
        if (this.level === 5) {
            // glow based on cursor distance
            var g = '30';
            const canvasCoords = getCanvasCoords();
            if (canvasCoords) {
                var dx = canvasCoords[0] - (target.left + target.width / 2);
                var dy = canvasCoords[1] - (target.top + target.height / 2);
                g = Math.max(48, Math.round(112 - Math.max(0, (dx * dx + dy * dy) / 100 - 20))).toString(16);
            }
            // glow in time
            //var g = Math.round(64 + 32 * (1 + Math.sin(now() / 400)) / 2).toString(16);
            if (g.length < 2) g = '0' + g;
            color ='#FF' + g + 'FF';
        } else {
            color = ['#C22', '#F84', '#CCD', '#FC0', '#F4F'][this.level - 1];
        }
        drawSolidTintedImage(context, jobTrophyImage, color, {'left': 0, 'top': 0, 'width': 40, 'height': 40}, target);
        drawImage(context, jobTrophyImage, {'left': 41, 'top': 0, 'width': 40, 'height': 40}, target);
    }
    drawWithOutline(context, color, thickness, target) {
        const jobTrophyImage = characterClasses[this.jobKey].achievementImage;
        drawOutlinedImage(context, jobTrophyImage, 'white', 2, {'left': 0, 'top': 0, 'width': 40, 'height': 40}, target);
        //drawSourceWithOutline(context, jobIcons[this.jobKey], color, thickness, target);
        this.draw(context, target);
    }
    helpMethod() {
        if (this.value === 0) return titleDiv('Mysterious Trophy') + bodyDiv('???');
        const state = getState();
        const parts = [];
        for (let i = 0; i < this.bonusesArray.length; i++) {
            const textColor = (this.level > i) ? 'white' : '#888';
            const levelData = this.bonusesArray[i];
            const levelText = '<div style="color: ' + textColor + ';">Level ' + levelData.target + ':<div>'
                + bonusSourceHelpText(levelData, state.selectedCharacter.adventurer)
                + '</div></div>';
            parts.push(levelText);
        }
        return titleDiv(this.title) + bodyDiv('Highest Level: ' + this.value + divider + parts.join('<br />'));
    }
    onClick(character) {
        selectTrophy(this, character);
    }
}

const trophySize = 50;
let altarTrophies: {[key: string]: JobAchievement};

export function addAltarTrophies() {
    altarTrophies = {
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
function selectTrophy(achievement, character) {
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
export function addTrophyToAltar(altar, trophy) {
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
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        trophy.left = trophySelectionRectangle.left + left;
        trophy.top = trophySelectionRectangle.top + top;
        trophy.draw(mainContext, trophy);
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
        left += trophySize + trophySpacing;
        if (left + trophySize + trophySpacing > trophySelectionRectangle.width - 10) {
            left = 10;
            top += trophySize + trophySpacing;
        }
    }
}
export function getTrophyPopupTarget(x, y) {
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        if (isPointInRectObject(x, y, trophy)) return trophy;
    }
    return null;
}

export function updateTrophy(trophyKey, value) {
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

function addTrophyBonuses(trophy, recompute = false) {
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
            addBonusSourceToObject(character.adventurer, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}
function removeTrophyBonuses(trophy, recompute = false) {
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
            removeBonusSourceFromObject(character.adventurer, bonusSource);
            //console.log(bonusSource.bonuses);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}

export function getIsAltarTrophyAvailable() {
    return isAltarTrophyAvailable;
}
export function checkIfAltarTrophyIsAvailable() {
    isAltarTrophyAvailable = false;
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        if (trophy.level >0 && !trophy.areaKey) {
            isAltarTrophyAvailable = true;
            break;
        }
    }
}

function showTrophyPopup(trophy) {
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
        trophyPopup.trophy.draw(mainContext, {'left': trophyPopup.left + 5, 'top': trophyPopup.top + (trophyPopupHeight - trophySize) / 2, 'width': trophySize, 'height': trophySize});
        mainContext.textAlign = 'left'
        mainContext.textBaseline = 'middle';
        mainContext.fillText('Unlocked', trophyPopup.left + 5 + trophySize + 5, trophyPopup.top + 20);
        mainContext.fillStyle = 'white';
        mainContext.font = '18px sans-serif';
        const titleParts = trophyPopup.trophy.title.split(' ');
        let line = titleParts.shift();
        const textLeft = trophyPopup.left + 5 + trophySize + 5;
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
