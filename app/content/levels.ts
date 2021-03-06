import { abilities } from 'app/content/abilities';
import { areaTypes } from 'app/content/areas';
import {
    bossMonsterBonuses, easyBonuses, hardBonuses,
    strengthBosses, strengthEventMonsters,
    intelligenceBosses, intelligenceEventMonsters,
    dexterityBosses, dexterityEventMonsters,
    generateMonsterPool,
} from 'app/content/monsters';
import { ADVENTURE_WIDTH, RANGE_UNIT, MAX_Z, MIN_Z } from 'app/gameConstants';
import { drawImage, requireImage } from 'app/images';
import { getJewelTiewerForLevel } from 'app/jewels';
import { coinsLoot, jewelLoot } from 'app/loot';
import { getThetaDistance, rectangle } from 'app/utils/index';
import Random from 'app/utils/Random';
import SRandom from 'app/utils/SRandom';

import {
    Area, AreaType, BonusSource, Exit,
    Level, LevelData, LevelDifficulty, LootGenerator, MonsterSpawn, Range, ShapeType,
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
    // On the map, strength is at 30, int is 150 and dex is 270,
    // but it is easier to put them at 0, 120, 240, so we subtract 30 here.
    const levelDegrees = (360 + 180 * Math.atan2(levelData.coords[1], levelData.coords[0]) / Math.PI - 30) % 360;
    let possibleMonsters = levelData.monsters.slice();

    const random = SRandom.seed(0.040822448356993224)
        .addSeed(levelData.coords[0]).addSeed(levelData.coords[1]).addSeed(levelData.coords[2]);

    if (!possibleMonsters.length) {
        const desiredNumberOfMonsters = Math.min(4, Math.floor(Math.sqrt(enemyLevel)));
        possibleMonsters = generateMonsterPool(
            levelDegrees,
            desiredNumberOfMonsters,
            desiredNumberOfMonsters,
            random.random()
        );
        //console.log(JSON.stringify(monsters));
    }
    const events = levelData.events.slice();
    if (!events.length) {
        let eventMonsters, bossMonsters;
        const roll = (360 + levelDegrees - 30 + Math.random() * 60) % 360;
        if (roll >= 300 || roll < 60) { // strength
            eventMonsters = strengthEventMonsters;
            bossMonsters = strengthBosses;
        } else if (roll < 180) { // int
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
            seed: areas.size + levelData.coords[0] + levelData.coords[1],
            layers: [],
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
            areaType.addLayers(area);
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
                heading: [-1, 0, 0],
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
                heading: [-1, 0, 0],
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
        areaType.addLayers(area);
        areaType.addObjects(area, {
            monsters: areaMonsters,
            exits: [entranceDestination, exitDestination],
        });
    };
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
        // Special Loot drops are given only the first time a hero complets an area on a given difficulty.
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
