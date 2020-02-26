import { addMonstersToArea, messageCharacter } from 'app/adventure';
import { readBoardFromData, totalCostForNextLevel } from 'app/character';
import { abilities } from 'app/content/abilities';
import { fixedObject } from 'app/content/furniture';
import { map } from 'app/content/mapData';
import { bossMonsterBonuses, easyBonuses, hardBonuses, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { bodyDiv, divider, mainContext, queryAll, titleDiv, toggleElements } from 'app/dom';
import { drawBoardPreview } from 'app/drawBoard';
import { ADVENTURE_WIDTH, GROUND_Y, MAX_LEVEL, RANGE_UNIT, MIN_Z } from 'app/gameConstants';
import { drawImage, requireImage } from 'app/images';
import { getJewelTiewerForLevel } from 'app/jewels';
import { coinsLoot, jewelLoot } from 'app/loot';
import { getState } from 'app/state';
import { showChooseBlessing} from 'app/ui/chooseBlessing';
import { abbreviate } from 'app/utils/formatters';
import { getThetaDistance, rectangle, removeElementFromArray } from 'app/utils/index';
import { centerShapesInRectangle, isPointInPoints } from 'app/utils/polygon';
import Random from 'app/utils/Random';


import {
    Actor, Area, Board, BoardData, BonusSource, Character, FixedObject, Hero, JewelComponents,
    Level, LevelData, LevelDifficulty, MonsterSpawn, Range, ShapeData, ShapeType,
} from 'app/types';

export const closedChestSource = {image: requireImage('gfx/chest-closed.png'), source: rectangle(0, 0, 32, 32)};
export const openChestSource = {image: requireImage('gfx/chest-open.png'), source: rectangle(0, 0, 32, 32)};
export function instantiateLevel(
    levelData: LevelData,
    levelDifficulty: LevelDifficulty = 'normal',
    difficultyCompleted = false,
    level = 0
): Level {
    level = level || levelData.level;
    const levelDegrees = (360 + 180 * Math.atan2(levelData.coords[1], levelData.coords[0]) / Math.PI) % 360;
    const possibleMonsters = levelData.monsters.slice();
    const strengthMonsters = ['skeleton','skeletalBuccaneer','undeadPaladin','undeadWarrior', 'stealthyCaterpillar'];
    const strengthEventMonsters = ['dragon','giantSkeleton', 'butcher', 'alphaWolf', 'battlefly', 'motherfly'];
    const strengthBosses = ['skeletonOgre', 'dragon', 'packLeader', 'necrognomekhan'];
    const intelligenceMonsters = ['gnome', 'gnomeCleric', 'gnomeWizard', 'bat', 'vampireBat'];
    const intelligenceEventMonsters = ['dragon','giantSkeleton', 'butcher', 'frostGiant', 'battlefly', 'gnomecromancer'];
    const intelligenceBosses = ['skeletonOgre', 'lightningBug', 'frostGiant', 'necrognomekhan', 'giantSpider'];
    const dexterityMonsters = ['spider', 'jumpingSpider', 'wolf', 'caterpillar', 'spongeyCaterpillar'];
    const dexterityEventMonsters = ['dragon','giantSkeleton', 'alphaWolf', 'motherfly', 'battlefly', 'gnomecromancer'];
    const dexterityBosses = ['lightningBug', 'dragon', 'frostGiant', 'packLeader', 'giantSpider'];
    const allMonsters = strengthMonsters.concat(strengthEventMonsters).concat(strengthBosses)
                        .concat(intelligenceMonsters).concat(intelligenceEventMonsters).concat(intelligenceBosses)
                        .concat(dexterityMonsters).concat(dexterityEventMonsters).concat(dexterityBosses);
    for (const monsterKey of allMonsters) {
        if (!monsters[monsterKey]) {
            throw new Error('Invalid monster key: ' + monsterKey);
        }
    }
    if (!possibleMonsters.length) {
        const desiredNumberOfMonsters = Math.min(4, Math.floor(Math.sqrt(level)));
        while (possibleMonsters.length < desiredNumberOfMonsters) {
            const roll = (360 + levelDegrees - 30 + Math.random() * 60) % 360;
            if (roll >= 330 || roll < 90) { // Strength
                possibleMonsters.push(Random.removeElement(strengthMonsters))
            } else if (roll < 210) { // Intelligence
                possibleMonsters.push(Random.removeElement(intelligenceMonsters))
            } else { //Dexterity
                possibleMonsters.push(Random.removeElement(dexterityMonsters))
            }
        }
        //console.log(JSON.stringify(monsters));
    }
    const events = levelData.events.slice();
    if (!events.length) {
        let eventMonsters, bossMonsters;
        const roll = (360 + levelDegrees - 30 + Math.random() * 60) % 360;
        if (roll >= 330 || roll < 90) { // strength
            eventMonsters = strengthEventMonsters;
            bossMonsters = strengthBosses;
        } else if (roll < 210) { // int
            eventMonsters = intelligenceEventMonsters;
            bossMonsters = intelligenceBosses;
        } else { //Dexterity
            eventMonsters = dexterityEventMonsters;
            bossMonsters = dexterityBosses;
        }
        events.push([Random.element(possibleMonsters), Random.element(possibleMonsters), Random.element(eventMonsters)]);
        events.push([Random.element(possibleMonsters), Random.element(possibleMonsters), Random.element(eventMonsters), Random.element(eventMonsters)]);
        events.push([Random.element(possibleMonsters), Random.element(eventMonsters), Random.element(eventMonsters), Random.element(eventMonsters)]);
        events.push([Random.element(possibleMonsters), Random.element(eventMonsters), Random.element(bossMonsters)]);
        //console.log(JSON.stringify(events));
    }
    const minMonstersPerArea = Math.ceil(Math.min(4, 1.5 * level / events.length));
    const maxMonstersPerArea = Math.floor(Math.min(10, 4 * level / events.length));

    const eventsLeft = events;
    const areas = new Map();
    let lastArea;
    const levelBonuses: BonusSource[] = (levelData.enemySkills || []).map(abilityKey => abilities[abilityKey]);
    if (levelDifficulty === 'easy') levelBonuses.push(easyBonuses);
    else if (levelDifficulty === 'hard' || levelDifficulty === 'endless') levelBonuses.push(hardBonuses);
    let maxLoops = 2000;
    // most objects are always enabled in levels.
    const isEnabled = () => true;
    while (true) {
        const area: Area = {
            key: `area${areas.size}`,
            isBossArea: false,
            left: 0,
            width: ADVENTURE_WIDTH,
            backgroundPatterns: {0: levelData.background},
            objects: [],
            drawMinimapIcon: eventsLeft.length > 1 ? drawMinimapMonsterIcon : drawMinimapBossIcon,
            areas,
            time: 0,
            projectiles: [],
            effects: [],
            cameraX: 0,
            allies: [],
            enemies: [],
            treasurePopups: [],
            textPopups: [],
        };
        if (lastArea) {
            area.objects.push(fixedObject('woodBridge', [12, 0, 0], {'xScale': -1, isEnabled, exit: {areaKey: lastArea.key, x: lastArea.width - 150, z: 0}}));
        } else {
            area.objects.push(fixedObject('stoneBridge', [12, 0, 0], {'xScale': -1, isEnabled, exit: {areaKey: 'worldMap'}}));
        }
        areas.set(area.key, area);
        lastArea = area;
        if (!eventsLeft.length) break;
        const eventMonsters = eventsLeft.shift().slice();
        area.isBossArea = !eventsLeft.length;
        const numberOfMonsters = Random.range(minMonstersPerArea, maxMonstersPerArea);
        const areaMonsters: MonsterSpawn[] = [];
        // Add random monsters to the beginning of the area to fill it up the desired amount.
        while (areaMonsters.length < numberOfMonsters - eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: Random.element(possibleMonsters),
                level,
                location: [area.width + Random.range(0, RANGE_UNIT * 6), 0, 20]
            };
            areaMonsters.push(monster);
            area.width = monster.location[0] + RANGE_UNIT * 2;
            if (maxLoops-- < 0) debugger;
        }
        // Add the predtermined monsters towards the end of the area.
        while (eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: eventMonsters.shift(),
                level,
                location: [area.width + Random.range(0, RANGE_UNIT * 6), 0, 20]
            };
            if (area.isBossArea) {
                monster.bonusSources = [bossMonsterBonuses];
                monster.rarity = 0; // Bosses cannot be enchanted or imbued.
            }
            areaMonsters.push(monster);
            area.width = monster.location[0] + RANGE_UNIT * 2;
            if (maxLoops-- < 0) debugger;
        }
        addMonstersToArea(area, areaMonsters, levelBonuses);
        area.width += 100;
        area.objects.push(fixedObject('woodBridge', [area.width - 12, 0, 0], {isEnabled() {
            return !this.area.isBossArea || !this.area.enemies.length;
        }, exit: {areaKey: levelData.noTreasure ? 'worldMap' : `area${areas.size}`, x: 150, z: 0}}));
        if (maxLoops-- < 0) debugger;
    };
    // lastArea is now an empty area for adding the treasure chest + shrine.
    lastArea.isShrineArea = true;
    var loot = [];
    var pointsFactor = difficultyCompleted ? 1 : 4;
    var maxCoinsPerNormalEnemy = Math.floor(level * Math.pow(1.15, level));
    // coins are granted at the end of each level, but diminished after the first completion.
    loot.push(coinsLoot([pointsFactor * maxCoinsPerNormalEnemy * 10, pointsFactor * maxCoinsPerNormalEnemy * 15]));

    var chest, initialChestIcon, completedChestIcon;
    if (!difficultyCompleted) {
        // Special Loot drops are given only the first time an adventurer complets an area on a given difficulty.
        // This is the minimum distance the level is from one of the main str/dex/int leylines.
        // Levels within 30 degrees of these leylines use 'basic'(triangle based) shapes for the jewels, other levels
        // will likely have non-triangle based shapes.
        var redComponent = Math.max(0, 120 - getThetaDistance(30, levelDegrees));
        var blueComponent = Math.max(0, 120 - getThetaDistance(150, levelDegrees));
        var greenComponent = Math.max(0, 120 - getThetaDistance(270, levelDegrees));
        var allComponent = Math.abs(levelData.coords[2]) / 60;
        // component can be as high as 120 so if it is at least 90 we are within 30 degrees of a primary leyline
        var maxComponent = Math.max(redComponent, blueComponent, greenComponent);
        const tier = getJewelTiewerForLevel(level);
        var components: [Range, Range, Range] = [
            [(redComponent + allComponent) * 0.9, (redComponent + allComponent) * 1.1],
            [(greenComponent + allComponent) * 0.9, (greenComponent + allComponent) * 1.1],
            [(blueComponent + allComponent) * 0.9, (blueComponent + allComponent) * 1.1]
        ];
        let shapeTypes: ShapeType[];
        if (maxComponent < 90) {
            shapeTypes = ['rhombus']
            if (levelDifficulty !== 'easy') shapeTypes.push('square');
            if (levelDifficulty === 'hard') shapeTypes.push('trapezoid');
        } else {
            shapeTypes = ['triangle'];
            if (levelDifficulty !== 'easy') shapeTypes.push('diamond');
            if (levelDifficulty === 'hard') shapeTypes.push('trapezoid');
        }
        // console.log(tier);
        // console.log(shapeTypes.join(','));
        // console.log(components.join(','));
        loot.push(jewelLoot(shapeTypes, [tier, tier], components, false));
        chest = fixedObject('closedChest', [0, 0, 0], {isEnabled, scale: 0.5, loot});
        initialChestIcon = closedChestSource;
        completedChestIcon = openChestSource;
    } else {
        chest = fixedObject('closedChest', [0, 0, 0], {isEnabled, scale: 0.4, loot});
        // When the area has already been completed on this difficulty, we always draw the chest mini map icon as open
        // so the player can tell at a glance that they are replaying the difficulty.
        initialChestIcon = completedChestIcon = openChestSource;
    }
    lastArea.objects.push(chest);
    chest.x = lastArea.width + Random.range(0, RANGE_UNIT * 4);
    chest.z = Random.range(MIN_Z + 16, MIN_Z + 32);
    lastArea.width = chest.x + 100;
    lastArea.drawMinimapIcon = function (context, completed, x, y) {
        const source = this.chestOpened ? completedChestIcon : initialChestIcon;
        drawImage(context, source.image, source.source, rectangle(x - 16, y - 18, 32, 32));
    }
    if (levelData.skill && abilities[levelData.skill]) {
        const shrine = fixedObject('skillShrine', [lastArea.width + Random.range(0, RANGE_UNIT * 4), 10, 0], {isEnabled, scale: 1, helpMethod(actor) {
            return titleDiv('Divine Shrine')
                + bodyDiv('Offer divinity at these shrines to be blessed by the Gods with new powers.');
        }});
        lastArea.objects.push(shrine);
        lastArea.width = shrine.x + RANGE_UNIT * 4;
    }
    lastArea.width += 64;
    lastArea.objects.push(fixedObject('stoneBridge', [lastArea.width - 12, 0, 0], {isEnabled, exit: {areaKey: 'worldMap'}}));
    areas.forEach(area => {
        for (const object of area.objects)
            object.area = area;
    });
    return {
        base: levelData,
        level,
        levelDifficulty,
        entrance: {areaKey: 'area0', x: 120, z: 0},
        areas,
    };
}

var militaryIcons = requireImage('gfx/militaryIcons.png');
var drawMinimapMonsterIcon = (context, completed, x, y) => {
    var target = rectangle(x - 16, y - 18, 32, 32);
    if (completed) drawImage(context, militaryIcons, rectangle(68, 90, 16, 16), target);
    else drawImage(context, militaryIcons, rectangle(136, 23, 16, 16), target);
};
var drawMinimapBossIcon = (context, completed, x, y) => {
    var target = rectangle(x - 16, y - 18, 32, 32);
    drawImage(context, militaryIcons, rectangle(119, 23, 16, 16), target);
    if (completed) drawImage(context, militaryIcons, rectangle(51, 90, 16, 16), target);
};
var drawLetter = (context, letter, x, y) => {
    context.fillStyle = 'black';
    context.font = "20px sans-serif";
    context.textAlign = 'center'
    context.fillText(letter, x, y + 7);
};
