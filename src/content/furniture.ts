import { enterArea, messageCharacter } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getIsAltarTrophyAvailable, setChoosingTrophyAltar, trophySelectionRectangle } from 'app/content/achievements';
import { map } from 'app/content/mapData';
import { getUpgradeRectangle, setUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import { mainCanvas, mainContext, mouseContainer, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { ADVENTURE_SCALE, GROUND_Y } from 'app/gameConstants';
import { createNewHeroApplicant, hideHeroApplication, showHeroApplication } from 'app/heroApplication';
import {
    drawImage,
    drawOutlinedImage,
    drawRectangleBackground, drawSourceWithOutline,
    drawTintedImage,
    drawTitleRectangle, requireImage
} from 'app/images';
import { attemptToApplyCost, canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { fillRectangle, isPointInRectObject, rectangle, shrinkRectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

import {
    Actor, Area, BonusSource, Exit, FixedObject, FixedObjectData,
    GuildArea, Hero, TrophyAltar,
} from 'app/types';

const guildImage = requireImage('gfx/guildhall.png');
export const allApplications: FixedObject[] = [];
export const allBeds: FixedObject[] = [];

/*
 Fixed object properties are a little different than the properties used for actors at the moment.
 I'm not sure which is better. Actors support defining a center point to rotate around, which is not
 supported here yet (not sure  if I'll use this). On the other hand, actors use xOffset/yOffset in
 a way that I'm not quite comfortable with at the moment.
 Here we have:
 source = {'image', 'width', 'height', 'top', 'left', 'actualWidth', 'actualHeight', 'xOffset', 'yOffset'}
 Then on the object itself we have defined 'scale'
 width/height/top/left define the rectangle to read from the source image, and the default dimensions to draw the target
 to. Scale set on the object can scale up/down the target rectangle. actualWidth/actualHeight are an optional sub rectangle
 which define the dimensions the object should have in terms of actual collision in the game, which is sometimes smaller than
 the image. For example, the goddess statue has a wing span of 60px, but only the base registers for hit detection, so we set
 actualWidth to 30px.
 xOffset/yOffset are a number of pixels to move the image to the right or up if the default positioning doesn't match the
 actual position. For example, by default the bottom of an image will be drawn at the center of the floor, but objects with depths
 should have their perceived center at this position, which means offsetting the images by half of their depth pixels.
 */
function objectSource(image, coords, size, additionalProperties = {}) {
    return {
        actualWidth: size[0],
        actualHeight: size[1],
        xOffset: 0,
        yOffset: 0,
        ...additionalProperties,
        image,
        left: coords[0], top: coords[1],
        width: size[0], height: size[1], depth: size[2] || size[0],
    };
}
export function openWorldMap() {
    const state = getState();
    // Unlock the first areas on the map if they aren't unlocked yet.
    for (const levelKey of map.guild.unlocks) {
        state.visibleLevels[levelKey] = true;
    }
    setContext('map');
}
function openCrafting(object: FixedObject, actor: Actor) {
    setContext('item');
}
function openJewels(object: FixedObject, actor: Actor) {
    setContext('jewel');
}
function useDoor(object: FixedObject, actor: Actor) {
    enterArea(actor, object.exit);
}
mouseContainer.addEventListener('mousedown', function (event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.js-heroApplication')) hideHeroApplication();
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (!isPointInRectObject(x, y, trophySelectionRectangle)) setChoosingTrophyAltar(null);
    if (!isPointInRectObject(x, y, getUpgradeRectangle())) setUpgradingObject(null);
});

const coinStashTiers = [
    {'name': 'Cracked Pot', 'bonuses': {'+maxCoins': 500}, 'upgradeCost': 500, 'source': objectSource(guildImage, [300, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Large Jar', 'bonuses': {'+maxCoins': 4000}, 'upgradeCost': 10000, 'source': objectSource(guildImage, [330, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Piggy Bank', 'bonuses': {'+maxCoins': 30000}, 'upgradeCost': 150000, 'requires': 'workshop', 'source': objectSource(guildImage, [300, 180], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Chest', 'bonuses': {'+maxCoins': 200000}, 'upgradeCost': 1.5e6, 'requires': 'workshop', 'source': objectSource(requireImage('gfx/chest-closed.png'), [0, 0], [32, 32], {'yOffset': -6}), 'scale': 1},
    {'name': 'Safe', 'bonuses': {'+maxCoins': 1e6}, 'upgradeCost': 10e6, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [330, 180], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Bag of Holding', 'bonuses': {'+maxCoins': 30e6}, 'upgradeCost': 500e6, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [300, 210], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Chest of Holding', 'bonuses': {'+maxCoins': 500e6}, 'upgradeCost': 15e9, 'requires': 'magicWorkshop', 'source': objectSource(requireImage('gfx/chest-closed.png'), [0, 0], [32, 32], {'yOffset': -6}), 'scale': 1},
    {'name': 'Safe of Hoarding', 'bonuses': {'+maxCoins': 10e9}, 'source': objectSource(guildImage, [330, 180], [30, 30], {'yOffset': -6}), 'scale': 1},
];

const animaOrbTiers = [
    {'name': 'Cracked Anima Orb', 'bonuses': {'+maxAnima': 100}, 'upgradeCost': {'coins': 1000, 'anima': 50}, 'source': objectSource(guildImage, [240, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': '"Fixed" Anima Orb', 'bonuses': {'+maxAnima': 2500}, 'upgradeCost': {'coins': 10000, 'anima': 5000}, 'source': objectSource(guildImage, [240, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Restored Anima Orb', 'bonuses': {'+maxAnima': 50000}, 'upgradeCost': {'coins': 10e6, 'anima': 250000}, 'requires': 'workshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Enchanted Anima Orb', 'bonuses': {'+maxAnima': 5e6}, 'upgradeCost': {'coins': 10e9, 'anima': 50e6}, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
    {'name': 'Perfected Anima Orb', 'bonuses': {'+maxAnima': 500e6}, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 1},
];

const areaObjects: {[key: string]: FixedObjectData} = {
    'mapTable': {
        targetType: 'object',
        'name': 'World Map',
        'source': objectSource(guildImage, [360, 150], [60, 27, 30], {'yOffset': -6}),
        'action': (object: FixedObject, hero: Hero) => openWorldMap(),
        'getActiveBonusSources': () => [{'bonuses': {'$hasMap': true}}],
    },
    'crackedOrb': {
        targetType: 'object',
        'name': 'Cracked Anima Orb',
        'source': objectSource(guildImage, [240, 150], [30, 29, 15])
    },
    'animaOrb': {
        targetType: 'object',
        action(object: FixedObject, hero: Hero) {
            removePopup();
            setUpgradingObject(object);
        },
        'level': 1, 'source': animaOrbTiers[0].source,
        getActiveBonusSources() {
            return [this.getCurrentTier()];
        },
        getCurrentTier() {
            return animaOrbTiers[this.level - 1];
        },
        getNextTier() {
            return animaOrbTiers[this.level];
        },
        'width': 60, 'height': 60, 'depth': 60,
        render(context, object: FixedObject) {
            const animaOrbTier = animaOrbTiers[object.level - 1];
            object.scale = animaOrbTier.scale || 1;
            object.source = animaOrbTier.source;
            // Make this coin stash flash if it can be upgraded.
            object.flashColor = (animaOrbTier.upgradeCost && canAffordCost(animaOrbTier.upgradeCost)) ? 'white' : null;
            drawFixedObject(context, object);
        },
        helpMethod(object) {
            const animaOrbTier = animaOrbTiers[this.level - 1];
            const parts = [];
            parts.push(bonusSourceHelpText(animaOrbTier, getState().selectedCharacter.adventurer));
            if (animaOrbTier.upgradeCost) {
                previewCost(animaOrbTier.upgradeCost);
                parts.push('Upgrade for ' + costHelpText(animaOrbTier.upgradeCost));
            }
            return titleDiv(animaOrbTier.name) + parts.join('<br/><br/>');
        },
        onMouseOut() {
            hidePointsPreview();
        }
    },
    'coinStash': {
        targetType: 'object',
        'action':  function () {
            removePopup();
            setUpgradingObject(this);
        },
        'level': 1, 'source': coinStashTiers[0].source,
        getActiveBonusSources() {
            return [this.getCurrentTier()];
        },
        getCurrentTier() {
            return coinStashTiers[this.level - 1];
        },
        getNextTier() {
            return coinStashTiers[this.level];
        },
        'width': 60, 'height': 60, 'depth': 60,
        render(context, object: FixedObject) {
            const coinStashTier = coinStashTiers[object.level - 1];
            object.scale = coinStashTier.scale || 1;
            object.source = coinStashTier.source;
            // Make this coin stash flash if it can be upgraded.
            object.flashColor = (coinStashTier.upgradeCost && canAffordCost(coinStashTier.upgradeCost)) ? 'white' : null;
            drawFixedObject(context, object);
        },
        helpMethod(object) {
            const coinStashTier = coinStashTiers[this.level - 1];
            const parts = [];
            parts.push(bonusSourceHelpText(coinStashTier, getState().selectedCharacter.adventurer));
            if (coinStashTier.upgradeCost) {
                previewCost(coinStashTier.upgradeCost);
                parts.push('Upgrade for ' + costHelpText(coinStashTier.upgradeCost));
            }
            return titleDiv(coinStashTier.name) + parts.join('<br/><br/>');
        },
        onMouseOut() {
            hidePointsPreview();
        }
    },
    'woodenAltar': {
        targetType: 'object',
        'name': 'Shrine of Fortune',
        'source': objectSource(guildImage, [450, 150], [30, 30, 20], {'yOffset': -6}),
        'action': openCrafting,
        'getActiveBonusSources': () => [{'bonuses': {'$hasItemCrafting': true}}],
    },
    'trophyAltar': {
        targetType: 'object',
        'name': 'Trophy Altar',
        'source': objectSource(guildImage, [420, 180], [30, 30, 20], {'yOffset': -6}),
        action(actor) {
            removePopup();
            setChoosingTrophyAltar(this);
        },
        getTrophyRectangle() {
            return {'left': this.target.left + (this.target.width - this.trophy.width) / 2,
                    'top': this.target.top - this.trophy.height + 4, 'width': this.trophy.width, 'height': this.trophy.height};
        },
        render(context, object: TrophyAltar) {
            // Make this altar flash if it is open and there is an unused trophy available to place on it.
            object.flashColor = (!object.trophy && getIsAltarTrophyAvailable()) ? 'white' : null;
            drawFixedObject(context, object);
            if (object.trophy) {
                if (getCanvasPopupTarget() === object) drawSourceWithOutline(mainContext, object.trophy, '#fff', 1, object.getTrophyRectangle());
                else object.trophy.render(mainContext, object.getTrophyRectangle());
            }
        },
        isOver(x, y) {
            return isPointInRectObject(x, y, this.target) || (this.trophy && isPointInRectObject(x,y, this.getTrophyRectangle()));
        },
        helpMethod(object) {
            if (this.trophy) return this.trophy.helpMethod();
            return titleDiv('Trophy Altar');
        }
    },
    'candles': {
        targetType: 'object',
        'source': objectSource(guildImage, [540, 145], [25, 40, 0])
    },
    'bed': {
        targetType: 'object',
        'name': 'Worn Cot', 'source': objectSource(guildImage, [480, 210], [60, 24, 30], {'yOffset': -6}),
        getActiveBonusSources() {
            return [{'bonuses': {'+maxHeroes': 1}}];
        }
    },
    'jewelShrine': {
        targetType: 'object',
        'name': 'Shrine of Creation', 'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}), 'action': openJewels,
        'getActiveBonusSources': () => [{'bonuses': {'$hasJewelCrafting': true}}],
    },
    'heroApplication': {
        targetType: 'object',
        'name': 'Application',
        'source': {left: 0, top: 0, width: 20, height: 30, depth: 0},
        action(actor) {
            const application = this as FixedObject;
            showHeroApplication(application);
        },
        render(context, object) {
            const application = this as FixedObject;
            application.target.left = application.x - application.width / 2 - object.area.cameraX;
            application.target.top = GROUND_Y - application.y - application.height - application.z / 2;
            if (getCanvasPopupTarget() === this) {
                mainContext.fillStyle = 'white';
                fillRectangle(mainContext, shrinkRectangle(application.target, -1));
            }
            mainContext.fillStyle = '#fc8';
            fillRectangle(mainContext, application.target);
            if (!application.character) {
                application.character = createNewHeroApplicant();
            }
            // Draw a faded job icon on the application.
            const character =  application.character;
            mainContext.save();
                mainContext.globalAlpha = 0.6;
                character.hero.job.iconSource.render(
                    mainContext,
                    {x: application.target.left + 2, y: application.target.top + 5, w: 16, h: 16}
                );
            mainContext.restore();
        }
    },

    'door': {
        targetType: 'object',
        'source': objectSource(guildImage, [240, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},
    'upstairs': {
        targetType: 'object',
        'source': objectSource(guildImage, [270, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},
    'downstairs': {
        targetType: 'object',
        'source': objectSource(guildImage, [300, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},

    'skillShrine': {
        targetType: 'object',
        'name': 'Shrine of Divinity', 'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}), 'action': activateShrine},
    'closedChest': {
        targetType: 'object',
        'name': 'Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [0, 0], [64, 64, 64], {'yOffset': -6}),
        action(object: FixedObject, hero: Hero) {
            // The loot array is an array of objects that can generate specific loot drops. Iterate over each one, generate a
            // drop and then give the loot to the player and display it on the screen.
            let delay = 0;
            for (let i = 0; i < this.loot.length; i++) {
                const drop = this.loot[i].generateLootDrop();
                drop.gainLoot(hero);
                var xOffset = (this.loot.length > 1) ? - 50 + 100 * i / (this.loot.length - 1) : 0;
                drop.addTreasurePopup(hero, this.x + xOffset, this.y + 64, this.z, delay += 5);
            }
            // Replace this chest with an opened chest in the same location.
            const openedChest = fixedObject('openChest', [this.x, this.y, this.z], {'scale': this.scale || 1});
            openedChest.area = this.area;
            this.area.objects[this.area.objects.indexOf(this)] = openedChest;
            this.area.chestOpened = true;
        }
    },
    'openChest': {
        targetType: 'object',
        'name': 'Opened Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [64, 0], [64, 64, 64], {'yOffset': -6}),
        action(object: FixedObject, hero: Hero) {
            messageCharacter(hero.character, 'Empty');
        }
    },
    'woodBridge': {
        targetType: 'object',
        'source': objectSource(requireImage('gfx2/areas/bridge.png'), [5, 99], [27, 34, 0], {yOffset: -11}), 'action': useDoor},
    'stoneBridge': {
        targetType: 'object',
        'source': objectSource(requireImage('gfx2/areas/bridge.png'), [5, 99], [27, 34, 0], {yOffset: -11}), 'action': useDoor},
}

function drawFixedObject(context: CanvasRenderingContext2D, object: FixedObject) {
    var imageSource = object.source;
    if (object.lastScale !== object.scale) {
        object.width = (imageSource.actualWidth || imageSource.width) * object.scale;
        object.height = (imageSource.actualHeight || imageSource.height) * object.scale;
        object.target.width = imageSource.width * object.scale;
        object.target.height = imageSource.height * object.scale;
        object.lastScale = object.scale;
    }
    // Calculate the left/top values from x/y/z coords, which drawImage will use.
    object.target.left = object.x - object.target.width / 2 - object.area.cameraX + imageSource.xOffset * object.scale;
    object.target.top = GROUND_Y - object.y - object.target.height - object.z / 2 - imageSource.yOffset * object.scale;
    context.save();
    if (object.xScale) {
        context.translate(object.target.left + object.target.width / 2, 0);
        context.scale(-1, 1);
        context.translate(-object.target.left - object.target.width / 2, 0);
    }
    if (getCanvasPopupTarget() === object) drawOutlinedImage(context, imageSource.image, '#fff', 1, imageSource, object.target);
    else if (object.flashColor) {
        drawTintedImage(context, imageSource.image, object.flashColor, .5 + .2 * Math.sin(Date.now() / 150),
            {x: imageSource.left, y: imageSource.top, w: imageSource.width, h: imageSource.height},
            {x: object.target.left, y: object.target.top, w: object.target.width, h: object.target.height}
        );
    } else drawImage(context, imageSource.image, imageSource, object.target);
    context.restore();
}
function isGuildObjectEnabled(object: FixedObject) {
    if (!object.area) debugger;
    return getState().savedState.unlockedGuildAreas[object.area.key] && !object.area.enemies.length;
}
function isGuildExitEnabled(object: FixedObject) {
    //if (this.area.key === 'guildFoyer') debugger;
    // A door can be used if the are is unlocked.
    if (isGuildObjectEnabled(object)) return true;
    //if (this.area.key === 'guildFoyer') debugger;
    // It can also be used if the area it is connected to is unlocked.
    return getState().savedState.unlockedGuildAreas[object.exit.areaKey];
}
export function guildObject(baseObjectKey: string, coords: number[], properties: Partial<FixedObject> = {}): FixedObject {
    return fixedObject(baseObjectKey, coords, {
        isEnabled: isGuildObjectEnabled,
        ...areaObjects[baseObjectKey],
        ...properties,
    });
}
export function fixedObject(baseObjectKey: string, coords: number[], properties: Partial<FixedObject> = {}): FixedObject {
    const base = areaObjects[baseObjectKey];
    const imageSource = base.source;
    const newFixedObject: FixedObject = {
        type: 'fixedObject',
        area: null,
        depth: imageSource.depth,
        scale: 1,
        width: imageSource.actualWidth || imageSource.width,
        height: imageSource.actualHeight || imageSource.height,
        render: drawFixedObject,
        helpMethod: fixedObjectHelpText,
        ...base,
        key: baseObjectKey,
        ...properties,
        fixed: true,
        base,
        x: coords[0],
        y: coords[1],
        z: coords[2],
        target: {
            left: -1000,
            top: -1000,
            width: imageSource.width,
            height: imageSource.height,
        },
    };
    newFixedObject.width *= newFixedObject.scale;
    newFixedObject.height *= newFixedObject.scale;
    newFixedObject.target.width *= newFixedObject.scale;
    newFixedObject.target.height *= newFixedObject.scale;
    // TODO: Make sure these reset when defaultGuildAreas is reset.
    if (baseObjectKey === 'heroApplication') {
        allApplications.push(newFixedObject);
    }
    if (baseObjectKey === 'bed') {
        allBeds.push(newFixedObject);
    }
    return newFixedObject;
}
function fixedObjectHelpText(object: FixedObject) {
    return object.base.name && titleDiv(object.base.name);
}

export function addFurnitureBonuses(furniture: FixedObject, recompute = false) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    const bonusSources = furniture.getActiveBonusSources();
    for (const bonusSource of bonusSources) {
        // Multiple copies of the same furniture will have the same bonus source, so this check is not valid.
        /*if (guildBonusSources.indexOf(bonusSource) >= 0) {
            console.log(bonusSource);
            console.log(guildBonusSources);
            throw new Error('bonus source was already present in guildBonusSources!');
        }*/
        state.guildBonusSources.push(bonusSource);
        addBonusSourceToObject(state.guildVariableObject, bonusSource);
        for (const character of state.characters) {
            addBonusSourceToObject(character.hero.variableObject, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}
export function removeFurnitureBonuses(furniture: FixedObject, recompute = false) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    const bonusSources = furniture.getActiveBonusSources();
    for (const bonusSource of bonusSources) {
        if (state.guildBonusSources.indexOf(bonusSource) < 0) {
            console.log(bonusSource);
            console.log(state.guildBonusSources);
            throw new Error('bonus source was not found in guildBonusSources!');
        }
        state.guildBonusSources.splice(state.guildBonusSources.indexOf(bonusSource), 1);
        removeBonusSourceFromObject(state.guildVariableObject, bonusSource);
        for (const character of state.characters) {
            removeBonusSourceFromObject(character.hero.variableObject, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}

export function addAllUnlockedFurnitureBonuses() {
    const state = getState();
    for (let areaKey in state.savedState.unlockedGuildAreas) {
        addAreaFurnitureBonuses(state.guildAreas[areaKey]);
    }
    recomputeAllCharacterDirtyStats();
}

export function addAreaFurnitureBonuses(guildArea: GuildArea, recompute = false) {
    for (const object of guildArea.objects) addFurnitureBonuses(object, false);
    if (recompute) recomputeAllCharacterDirtyStats();
}
