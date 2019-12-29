import { addMonstersToArea, messageCharacter } from 'app/adventure';
import { readBoardFromData, totalCostForNextLevel } from 'app/character';
import { abilities } from 'app/content/abilities';
import { basicTemplateBoards, complexTemplateBoards } from 'app/content/boards';
import { fixedObject } from 'app/content/furniture';
import { map } from 'app/content/mapData';
import { bossMonsterBonuses, easyBonuses, hardBonuses, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { bodyDiv, divider, mainContext, queryAll, titleDiv, toggleElements } from 'app/dom';
import { drawBoardPreview } from 'app/drawBoard';
import { GROUND_Y, MAX_LEVEL } from 'app/gameConstants';
import { drawImage, requireImage } from 'app/images';
import { getJewelTiewerForLevel } from 'app/jewels';
import { snapBoardToBoard } from 'app/jewelInventory';
import { coinsLoot, jewelLoot } from 'app/loot';
import { getState } from 'app/state';
import { abbreviate } from 'app/utils/formatters';
import { getThetaDistance, rectangle, removeElementFromArray } from 'app/utils/index';
import { centerShapesInRectangle, isPointInPoints } from 'app/utils/polygon';
import Random from 'app/utils/Random';
import {
    Actor, Area, Board, BoardData, BonusSource, Character, JewelComponents,
    Level, LevelData, LevelDifficulty, LevelObject, Range, ShapeData, ShapeType,
} from 'app/types';

export const closedChestSource = {image: requireImage('gfx/chest-closed.png'), source: rectangle(0, 0, 32, 32)};
export const openChestSource = {image: requireImage('gfx/chest-open.png'), source: rectangle(0, 0, 32, 32)};
interface MonsterSpawn {
    key: string,
    level: number,
    location: [number, number, number],
    bonusSources?: BonusSource[],
    rarity?: number,
}
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
            width: 800,
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
            area.objects.push(fixedObject('woodBridge', [-60, 0, 0], {isEnabled, exit: {areaKey: lastArea.key, x: lastArea.width - 150, z: 0}}));
        } else {
            area.objects.push(fixedObject('stoneBridge', [-20, 0, 0], {isEnabled, exit: {areaKey: 'worldMap'}}));
        }
        areas.set(area.key, area);
        lastArea = area;
        if (!eventsLeft.length) break;
        const eventMonsters = eventsLeft.shift().slice();
        area.isBossArea = !eventsLeft.length;
        const numberOfMonsters = Random.range(minMonstersPerArea, maxMonstersPerArea);
        const areaMonsters = [];
        // Add random monsters to the beginning of the area to fill it up the desired amount.
        while (areaMonsters.length < numberOfMonsters - eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: Random.element(possibleMonsters),
                level,
                location: [area.width + Random.range(0, 200), 0, 40]
            };
            areaMonsters.push(monster);
            area.width = monster.location[0] + 50;
            if (maxLoops-- < 0) debugger;
        }
        // Add the predtermined monsters towards the end of the area.
        while (eventMonsters.length) {
            const monster: MonsterSpawn = {
                key: eventMonsters.shift(),
                level,
                location: [area.width + Random.range(0, 200), 0, 40]
            };
            if (area.isBossArea) {
                monster.bonusSources = [bossMonsterBonuses];
                monster.rarity = 0; // Bosses cannot be enchanted or imbued.
            }
            areaMonsters.push(monster);
            area.width = monster.location[0] + 50;
            if (maxLoops-- < 0) debugger;
        }
        addMonstersToArea(area, areaMonsters, levelBonuses);
        area.width += 600;
        area.objects.push(fixedObject('woodBridge', [area.width + 60, 0, 0], {isEnabled() {
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
        chest = fixedObject('closedChest', [0, 0, 0], {isEnabled, scale: 1, loot});
        initialChestIcon = closedChestSource;
        completedChestIcon = openChestSource;
    } else {
        chest = fixedObject('closedChest', [0, 0, 0], {isEnabled, scale: .8, loot});
        // When the area has already been completed on this difficulty, we always draw the chest mini map icon as open
        // so the player can tell at a glance that they are replaying the difficulty.
        initialChestIcon = completedChestIcon = openChestSource;
    }
    lastArea.objects.push(chest);
    chest.x = lastArea.width + Random.range(0, 100);
    chest.z = Random.range(-140, -160);
    lastArea.width = chest.x + 100;
    lastArea.drawMinimapIcon = function (context, completed, x, y) {
        const source = this.chestOpened ? completedChestIcon : initialChestIcon;
        drawImage(context, source.image, source.source, rectangle(x - 16, y - 18, 32, 32));
    }
    if (levelData.skill && abilities[levelData.skill]) {
        const shrine = fixedObject('skillShrine', [lastArea.width + Random.range(0, 100), 20, 0], {isEnabled, scale: 3, helpMethod(actor) {
            return titleDiv('Divine Shrine')
                + bodyDiv('Offer divinity at these shrines to be blessed by the Gods with new powers.');
        }});
        lastArea.objects.push(shrine);
        lastArea.width = shrine.x + 100;
    }
    lastArea.width += 250;
    lastArea.objects.push(fixedObject('stoneBridge', [lastArea.width + 20, 0, 0], {isEnabled, exit: {areaKey: 'worldMap'}}));
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

export function activateShrine(actor: Actor) {
    const character = actor.character;
    // Don't activate the shrine a second time.
    if (character.isStuckAtShrine) return;
    const area = actor.area;
    const level: LevelData = map[character.currentLevelKey];
    if (character.adventurer.level >= MAX_LEVEL) {
        messageCharacter(character, character.adventurer.name + ' is already max level');
        return;
    }
    if (character.adventurer.unlockedAbilities[level.skill]) {
        messageCharacter(character, 'Ability already learned');
        return;
    }
    const divinityNeeded = totalCostForNextLevel(character, level) - character.divinity;
    if (divinityNeeded > 0) {
        messageCharacter(character, 'Still need ' + abbreviate(divinityNeeded) + ' Divinity');
        return;
    }
    // TBD: Make this number depend on the game state so it can be improved over time.
    const boardOptions = 2;
    for (let i = 0; i < boardOptions; i++) {
        const boardData = getBoardDataForLevel(level);
        const boardPreview = readBoardFromData(boardData, character, abilities[level.skill]);
        const boardPreviewSprite = adventureBoardPreview(boardPreview, character);
        boardPreviewSprite.x = this.x - (boardOptions * 150 - 150) / 2 + 150 * i;
        boardPreviewSprite.y = 250;
        area.objects.push(boardPreviewSprite);
    }
    const blessingText = objectText('Choose Your Blessing');
    blessingText.x = this.x;
    blessingText.y = 330;
    area.objects.push(blessingText);
    character.isStuckAtShrine = true;
}
export function finishShrine(character: Character) {
    const objects = character.hero.area.objects;
    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        if (object.type === 'button' || object.type === 'text') {
            objects.splice(i--, 1);
        } else if (object.type === 'fixedObject' && object.key === 'skillShrine') {
            object.done = true;
        }
    }
    character.isStuckAtShrine = false;
}

/*function iconButton(iconSource, width, height, onClick, helpText) {
    const self = {
        'x': 0,
        'y': 0,
        left: 0,
        top: 0,
        'type': 'button',
        'solid': false,
        width,
        height,
        update(area) {
            self.left = Math.round(self.x - area.cameraX - self.width / 2);
            self.top = Math.round(GROUND_Y - self.y - self.height / 2);
        },
        onClick,
        render(area) {
            drawImage(mainContext, iconSource.image, iconSource, self);
        },
        helpMethod() {
            return helpText || '';
        }
    };
    return self;
}*/

function objectText(text): LevelObject {
    return {
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        'type': 'text',
        'solid': false,
        isOver(x, y) {return false;},
        update(area) {},
        render(area) {
            mainContext.fillStyle = 'white';
            mainContext.textBaseline = "middle";
            mainContext.textAlign = 'center'
            mainContext.font = "30px sans-serif";
            mainContext.fillText(text, this.x - area.cameraX, GROUND_Y - this.y);
        }
    };
}

function adventureBoardPreview(boardPreview: Board, character: Character): LevelObject & any {
    return {
        x: 0,
        y: 0,
        z: 0,
        solid: false,
        type: 'button',
        width: 150,
        height: 150,
        boardPreview,
        update(area) {
        },
        isOver(x, y) {
            for (const shape of this.boardPreview.fixed.map(j => j.shape).concat(this.boardPreview.spaces)) {
                if (isPointInPoints([x, y], shape.points)) {
                    return true;
                }
            }
            return false;
        },
        onClick(character: Character) {
            centerShapesInRectangle(this.boardPreview.fixed.map(j => j.shape).concat(this.boardPreview.spaces), rectangle(0, 0, character.boardCanvas.width, character.boardCanvas.height));
            snapBoardToBoard(this.boardPreview, character.board);
            character.board.boardPreview = this.boardPreview;
            // This will show the confirm skill button if this character is selected.
            updateSkillConfirmationButtons();
            setContext('jewel');
        },
        render(area: Area) {
            // Remove the preview from the character if we draw it to the adventure screen since they both use the same coordinate variables
            // and displaying it in the adventure screen will mess up the display of it on the character's board. I think this will be okay
            // since they can't look at both screens at once.
            character.board.boardPreview = null;
            updateSkillConfirmationButtons();
            centerShapesInRectangle(this.boardPreview.fixed.map(j => j.shape).concat(this.boardPreview.spaces), rectangle(this.x - area.cameraX - 5, GROUND_Y - this.y -5, 10, 10));
            drawBoardPreview(mainContext, [0, 0], this.boardPreview, true);
        },
        helpMethod() {
            return titleDiv('Divine Blessing')
                + bodyDiv("Click on this Jewel Board Augmentation to preview adding it to this hero's Jewel Board." + divider + "Confirm the Augmentation to learn the ability and Level Up.");
        }
    };
}

export function updateSkillConfirmationButtons() {
    toggleElements(queryAll('.js-augmentConfirmationButtons'), !!getState().selectedCharacter.board.boardPreview);
}

function getBoardDataForLevel(level: LevelData): BoardData {
    let safety = 0;
    const levelDegrees = 180 * Math.atan2(level.coords[1], level.coords[0]) / Math.PI;
    // 30 degrees = red leyline, 150 degrees = blue leyline, 270 degrees = green leyline.
    const minLeylineDistance = Math.min(getThetaDistance(30, levelDegrees), getThetaDistance(150, levelDegrees), getThetaDistance(270, levelDegrees));
    // Use basic templates (triangle based) for levels close to primary leylines and complex templates (square based) for levels close to intermediate leylines.
    const templates = ((minLeylineDistance <= 30) ? basicTemplateBoards : complexTemplateBoards).slice();
    // Each shape is worth roughly the number of triangles in it.
    const shapeValues = {'triangle': 1, 'rhombus': 1, 'diamond': 2, 'square': 2, 'trapezoid': 3, 'hexagon': 6};
    // Starts at 2 and gets as high as 7 by level 99.
    const totalValue =  Math.ceil(1 + Math.sqrt(level.level / 3));
    let chosenTemplate = Random.element(templates);
    removeElementFromArray(templates, chosenTemplate, true);
    while (templates.length && chosenTemplate.size <= totalValue && safety++ < 100) {
        chosenTemplate = Random.element(templates);
        removeElementFromArray(templates, chosenTemplate, true);
    }
    if (safety >= 100) console.log("failed first loop");
    if (chosenTemplate.size <= totalValue) {
        throw new Error('No template found for a board of size ' + totalValue);
    }
    let currentSize = chosenTemplate.size;
    let shapesToKeep = chosenTemplate.shapes.slice();
    let removedShapes: ShapeData[] = [];
    // This loop randomly adds and removes shapes until we get to the right value. Since some shapes are worth 2 points, and others worth 1,
    // it may overshoot, but eventually it will hit the target.
    while (currentSize !== totalValue && safety++ < 100) {
        if (currentSize > totalValue) {
            // Get rid of a shape to keep if the board is too large.
            //removedShapes = removedShapes.concat(shapesToKeep.splice(Math.floor(Math.random() * shapesToKeep.length), 1));
            removedShapes.push(Random.removeElement(shapesToKeep));
            currentSize -= shapeValues[removedShapes[removedShapes.length - 1].k]
        } else {
            // Add a shape back in if the board is too small.
            //shapesToKeep = shapesToKeep.concat(removedShapes.splice(Math.floor(Math.random() * removedShapes.length), 1));
            shapesToKeep.push(Random.removeElement(removedShapes));
            currentSize += shapeValues[shapesToKeep[shapesToKeep.length - 1].k]
        }
    }
    if (safety >= 100) console.log("failed second loop");
    // Select one of the removed shapes to be the fixed jewel for the board.
    const fixedShape = Random.element(removedShapes);
    return {'fixed':[fixedShape], 'spaces': shapesToKeep};
}

