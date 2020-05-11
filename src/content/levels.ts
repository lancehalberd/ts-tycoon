import { addMonstersToArea, messageCharacter } from 'app/adventure';
import { readBoardFromData, totalCostForNextLevel } from 'app/character';
import { abilities } from 'app/content/abilities';
import { areaTypes } from 'app/content/areas';
import { map } from 'app/content/mapData';
import { bossMonsterBonuses, easyBonuses, hardBonuses, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { bodyDiv, divider, mainContext, queryAll, titleDiv, toggleElements } from 'app/dom';
import { drawBoardPreview } from 'app/drawBoard';
import { ADVENTURE_WIDTH, GROUND_Y, MAX_LEVEL, RANGE_UNIT, MAX_Z, MIN_Z } from 'app/gameConstants';
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
    Actor, Area, AreaType, Board, BoardData, BonusSource, Character, Exit,
    FixedObject, Hero, JewelComponents,
    Level, LevelData, LevelDifficulty, LootGenerator, MonsterSpawn, Range, ShapeData, ShapeType,
} from 'app/types';

export const closedChestSource = {image: requireImage('gfx/chest-closed.png'), source: rectangle(0, 0, 32, 32)};
export const openChestSource = {image: requireImage('gfx/chest-open.png'), source: rectangle(0, 0, 32, 32)};
export function instantiateLevel(
    levelData: LevelData,
    levelDifficulty: LevelDifficulty = 'normal',
    difficultyCompleted = false,
    enemyLevel = 0
): Level {
    enemyLevel = enemyLevel || levelData.level;
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
        const desiredNumberOfMonsters = Math.min(4, Math.floor(Math.sqrt(enemyLevel)));
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
    const minMonstersPerArea = Math.ceil(Math.min(4, 1.5 * enemyLevel / events.length));
    const maxMonstersPerArea = Math.floor(Math.min(10, 4 * enemyLevel / events.length));

    const eventsLeft = events;
    const areas = new Map();
    const level: Level = {
        base: levelData,
        enemyLevel,
        levelDifficulty,
        entrance: {areaKey: 'area0', x: 48, z: 0},
        areas,
    }
    let lastArea: Area;
    const levelBonuses: BonusSource[] = (levelData.enemySkills || []).map(abilityKey => abilities[abilityKey]);
    if (levelDifficulty === 'easy') levelBonuses.push(easyBonuses);
    else if (levelDifficulty === 'hard' || levelDifficulty === 'endless') levelBonuses.push(hardBonuses);
    let maxLoops = 2000;
    const areaType: AreaType = areaTypes[levelData.background] || areaTypes.field;
    while (true) {
        const area: Area = {
            key: `area${areas.size}`,
            isBossArea: false,
            width: ADVENTURE_WIDTH,
            areaType: levelData.background,
            objects: [],
            drawMinimapIcon: eventsLeft.length > 1 ? drawMinimapMonsterIcon : drawMinimapBossIcon,
            areas,
            time: 0,
            projectiles: [],
            effects: [],
            cameraX: 0,
            allies: [],
            enemies: [],
            enemyBonuses: levelBonuses,
            treasurePopups: [],
            textPopups: [],
            wallDecorations: [],
            seed: areas.size + levelData.coords[0] + levelData.coords[1],
        };
        const isFirstArea = !lastArea;
        const isLastArea = !eventsLeft.length;
        const entranceDestination: Exit = isFirstArea
            ? {areaKey: 'worldMap'}
            : {areaKey: lastArea.key, x: lastArea.width - 36, z: 0};
        const exitDestination: Exit = isLastArea
            ? {areaKey: 'worldMap'}
            : {areaKey: levelData.testArea ? 'worldMap' : `area${areas.size + 1}`, x: 36, z: 0};

        areas.set(area.key, area);
        lastArea = area;
        if (isLastArea) {
            const loot = generateLevelLoot(level, difficultyCompleted, levelDegrees);
            // When the area has already been completed on this difficulty, we always draw the chest mini map icon as open
            // so the player can tell at a glance that they are replaying the difficulty.
            const initialChestIcon = difficultyCompleted ? openChestSource : closedChestSource;
            area.drawMinimapIcon = function (this: Area, context, completed, x, y) {
                const source = this.chestOpened ? openChestSource : initialChestIcon;
                drawImage(context, source.image, source.source, rectangle(x - 8, y - 8, 16, 16));
            }
            area.width += RANGE_UNIT * 2;
            area.width = Math.max(area.width, ADVENTURE_WIDTH);
            areaType.addObjects(area, {
                exits: [entranceDestination, exitDestination],
                loot,
                ability: levelData.skill && abilities[levelData.skill],
            });
            break;
        }
        const eventMonsters = eventsLeft.shift().slice();
        area.isBossArea = !eventsLeft.length;
        const numberOfMonsters = Random.range(minMonstersPerArea, maxMonstersPerArea);
        const areaMonsters: MonsterSpawn[] = [];
        // Add random monsters to the beginning of the area to fill it up the desired amount.
        while (areaMonsters.length < numberOfMonsters - eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: Random.element(possibleMonsters),
                level: enemyLevel,
                location: {x: area.width + Random.range(0, RANGE_UNIT * 2), y: 0, z: Random.range(MIN_Z / 2, MAX_Z / 2)},
            };
            areaMonsters.push(monster);
            area.width = monster.location.x + RANGE_UNIT * 8;
            if (maxLoops-- < 0) debugger;
        }
        // Add the predetermined monsters towards the end of the area.
        while (eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: eventMonsters.shift(),
                level: enemyLevel,
                location: {x: area.width + Random.range(0, RANGE_UNIT * 2), y: 0, z: Random.range(MIN_Z / 2, MAX_Z / 2)},
            };
            if (area.isBossArea) {
                monster.bonusSources = [bossMonsterBonuses];
                monster.rarity = 0; // Bosses cannot be enchanted or imbued.
            }
            areaMonsters.push(monster);
            area.width = monster.location.x + RANGE_UNIT * 8;
            if (maxLoops-- < 0) debugger;
        }
        area.width += RANGE_UNIT * 4;
        if (maxLoops-- < 0) debugger;

        area.width = Math.max(area.width, ADVENTURE_WIDTH);
        areaType.addObjects(area, {
            monsters: areaMonsters,
            exits: [entranceDestination, exitDestination],
        });
    };
    areas.forEach(area => {
        for (const object of area.objects)
            object.area = area;
    });
    return level;
}

function generateLevelLoot(
    level: Level,
    difficultyCompleted: boolean,
    levelDegrees: number,
): LootGenerator[] {
    const loot = [];
    var pointsFactor = difficultyCompleted ? 1 : 4;
    var maxCoinsPerNormalEnemy = Math.floor(level.enemyLevel * Math.pow(1.15, level.enemyLevel));
    // coins are granted at the end of each level, but diminished after the first completion.
    loot.push(coinsLoot([pointsFactor * maxCoinsPerNormalEnemy * 10, pointsFactor * maxCoinsPerNormalEnemy * 15]));

    if (!difficultyCompleted) {
        // Special Loot drops are given only the first time an adventurer complets an area on a given difficulty.
        // This is the minimum distance the level is from one of the main str/dex/int leylines.
        // Levels within 30 degrees of these leylines use 'basic'(triangle based) shapes for the jewels, other levels
        // will likely have non-triangle based shapes.
        var redComponent = Math.max(0, 120 - getThetaDistance(30, levelDegrees));
        var blueComponent = Math.max(0, 120 - getThetaDistance(150, levelDegrees));
        var greenComponent = Math.max(0, 120 - getThetaDistance(270, levelDegrees));
        var allComponent = Math.abs(level.base.coords[2]) / 60;
        // component can be as high as 120 so if it is at least 90 we are within 30 degrees of a primary leyline
        var maxComponent = Math.max(redComponent, blueComponent, greenComponent);
        const tier = getJewelTiewerForLevel(level.enemyLevel);
        var components: [Range, Range, Range] = [
            [(redComponent + allComponent) * 0.9, (redComponent + allComponent) * 1.1],
            [(greenComponent + allComponent) * 0.9, (greenComponent + allComponent) * 1.1],
            [(blueComponent + allComponent) * 0.9, (blueComponent + allComponent) * 1.1]
        ];
        let shapeTypes: ShapeType[];
        if (maxComponent < 90) {
            shapeTypes = ['rhombus']
            if (level.levelDifficulty !== 'easy') shapeTypes.push('square');
            if (level.levelDifficulty === 'hard') shapeTypes.push('trapezoid');
        } else {
            shapeTypes = ['triangle'];
            if (level.levelDifficulty !== 'easy') shapeTypes.push('diamond');
            if (level.levelDifficulty === 'hard') shapeTypes.push('trapezoid');
        }
        // console.log(tier);
        // console.log(shapeTypes.join(','));
        // console.log(components.join(','));
        loot.push(jewelLoot(shapeTypes, [tier, tier], components, false));
    }
    return loot;
}

const militaryIcons = requireImage('gfx/militaryIcons.png');
function drawMinimapMonsterIcon(context, completed, x, y) {
    const target = rectangle(x - 8, y - 9, 16, 16);
    if (completed) drawImage(context, militaryIcons, rectangle(68, 90, 16, 16), target);
    else drawImage(context, militaryIcons, rectangle(136, 23, 16, 16), target);
};
function drawMinimapBossIcon(context, completed, x, y) {
    const target = rectangle(x - 8, y - 9, 16, 16);
    drawImage(context, militaryIcons, rectangle(119, 23, 16, 16), target);
    if (completed) drawImage(context, militaryIcons, rectangle(51, 90, 16, 16), target);
};
function drawLetter(context, letter, x, y) {
    context.fillStyle = 'black';
    context.font = "16px sans-serif";
    context.textAlign = 'center'
    context.fillText(letter, x, y + 7);
};
