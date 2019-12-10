import { enterArea, messageCharacter } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getIsAltarTrophyAvailable, setChoosingTrophyAltar, trophySelectionRectangle } from 'app/content/achievements';
import { activateShrine } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { mainCanvas, mainContext, mouseContainer, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { GROUND_Y } from 'app/gameConstants';
import { createNewHeroApplicant, hideHeroApplication, showApplication } from 'app/heroApplication';
import {
    drawImage,
    drawOutlinedImage,
    drawRectangleBackground, drawSourceWithOutline,
    drawTintedImage,
    drawTitleRectangle, requireImage } from 'app/images';
import { attemptToApplyCost, canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { toolTipColor } from 'app/utils/colors';
import { fillRectangle, isPointInRectObject, rectangle, shrinkRectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';


export interface Exit {
    // The area to enter when using this exit.
    areaKey: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}
export interface FixedObject {
    fixed: true,
    base: any,
    key: string,
    scale: number,
    xScale?: number,
    yScale?: number,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    exit?: Exit,
    // The level for the object, if it can be upgraded.
    level?: number,
    isEnabled: Function,
    draw: Function,
    helpMethod: Function,
    target: {
        width: number,
        height: number,
    },
    loot?: any,
    area?: any,
}

const guildImage = requireImage('gfx/guildhall.png');
export const allApplications = [];
export const allBeds = [];
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
export function openWorldMap(actor) {
    const state = getState();
    // Unlock the first areas on the map if they aren't unlocked yet.
    for (const levelKey of map.guild.unlocks) {
        state.visibleLevels[levelKey] = true;
    }
    setContext('map');
}
function openCrafting(actor) {
    setContext('item');
}
function openJewels(actor) {
    setContext('jewel');
}
function useDoor(actor) {
    enterArea(actor, this.exit);
}
mouseContainer.addEventListener('mousedown', function (event) {
    const target = event.target as HTMLElement;
    const [x, y] = getMousePosition(mainCanvas);
    if (!target.closest('.js-heroApplication')) hideHeroApplication();
    if (!isPointInRectObject(x, y, trophySelectionRectangle)) setChoosingTrophyAltar(null);
    if (!isPointInRectObject(x, y, upgradeRectangle)) upgradingObject = null;
});

const coinStashTiers = [
    {'name': 'Cracked Pot', 'bonuses': {'+maxCoins': 500}, 'upgradeCost': 500, 'source': objectSource(guildImage, [300, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Large Jar', 'bonuses': {'+maxCoins': 4000}, 'upgradeCost': 10000, 'source': objectSource(guildImage, [330, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Piggy Bank', 'bonuses': {'+maxCoins': 30000}, 'upgradeCost': 150000, 'requires': 'workshop', 'source': objectSource(guildImage, [300, 180], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Chest', 'bonuses': {'+maxCoins': 200000}, 'upgradeCost': 1.5e6, 'requires': 'workshop', 'source': objectSource(requireImage('gfx/chest-closed.png'), [0, 0], [32, 32], {'yOffset': -6}), 'scale': 2},
    {'name': 'Safe', 'bonuses': {'+maxCoins': 1e6}, 'upgradeCost': 10e6, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [330, 180], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Bag of Holding', 'bonuses': {'+maxCoins': 30e6}, 'upgradeCost': 500e6, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [300, 210], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Chest of Holding', 'bonuses': {'+maxCoins': 500e6}, 'upgradeCost': 15e9, 'requires': 'magicWorkshop', 'source': objectSource(requireImage('gfx/chest-closed.png'), [0, 0], [32, 32], {'yOffset': -6}), 'scale': 2},
    {'name': 'Safe of Hoarding', 'bonuses': {'+maxCoins': 10e9}, 'source': objectSource(guildImage, [330, 180], [30, 30], {'yOffset': -6}), 'scale': 2},
];

const animaOrbTiers = [
    {'name': 'Cracked Anima Orb', 'bonuses': {'+maxAnima': 100}, 'upgradeCost': {'coins': 1000, 'anima': 50}, 'source': objectSource(guildImage, [240, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': '"Fixed" Anima Orb', 'bonuses': {'+maxAnima': 2500}, 'upgradeCost': {'coins': 10000, 'anima': 5000}, 'source': objectSource(guildImage, [240, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Restored Anima Orb', 'bonuses': {'+maxAnima': 50000}, 'upgradeCost': {'coins': 10e6, 'anima': 250000}, 'requires': 'workshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Enchanted Anima Orb', 'bonuses': {'+maxAnima': 5e6}, 'upgradeCost': {'coins': 10e9, 'anima': 50e6}, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
    {'name': 'Perfected Anima Orb', 'bonuses': {'+maxAnima': 500e6}, 'requires': 'magicWorkshop', 'source': objectSource(guildImage, [270, 150], [30, 30], {'yOffset': -6}), 'scale': 2},
];

export const upgradeButton = {
    isVisible() {
        return !!upgradingObject;
    },
    draw() {
        const currentTier = upgradingObject.getCurrentTier();
        const canUpgrade = canAffordCost(currentTier.upgradeCost);
        mainContext.textAlign = 'center'
        mainContext.textBaseline = 'middle';
        setFontSize(mainContext, 18);
        mainContext.strokeStyle = canUpgrade ? 'white' : '#AAA';
        mainContext.lineWidth = 2;
        mainContext.fillStyle = canUpgrade ? '#6C6' : '#CCC';
        var padding = 7;
        var metrics = mainContext.measureText('Upgrade to...');
        this.width = metrics.width + 2 * padding;
        this.height = 20 + 2 * padding;
        this.left = upgradeRectangle.left + (upgradeRectangle.width - this.width) / 2;
        this.top = upgradeRectangle.top + (upgradeRectangle.height - this.height) / 2;
        drawTitleRectangle(mainContext, this)
        mainContext.fillStyle = canUpgrade ? 'white' : '#AAA';
        mainContext.fillText('Upgrade to...', this.left + this.width / 2, this.top + this.height / 2);
    },
    helpMethod() {
        var currentTier = upgradingObject.getCurrentTier();
        previewCost(currentTier.upgradeCost);
        return null;
    },
    onMouseOut() {
        hidePointsPreview();
    },
    onClick() {
        const currentTier = upgradingObject.getCurrentTier();
        if (!attemptToApplyCost(currentTier.upgradeCost)) return;
        removeFurnitureBonuses(upgradingObject, false);
        upgradingObject.level++;
        addFurnitureBonuses(upgradingObject, true);
        const state = getState();
        if (!state.guildAreas[upgradingObject.area.key]) {
            state.guildAreas[upgradingObject.area.key] = upgradingObject.area;
        }
        saveGame();
        upgradingObject = null;
    }
};

let upgradingObject = null;
export function setUpgradingObject(object) {
    upgradingObject = object;
}
export function getUpgradingObject() {
    return upgradingObject;
}
const upgradeRectangle = rectangle(250, 150, 300, 180);
export function drawUpgradeBox() {
    drawRectangleBackground(mainContext, upgradeRectangle);
    var currentTier = upgradingObject.getCurrentTier();
    var nextTier = upgradingObject.getNextTier();
    drawImage(mainContext, currentTier.source.image, currentTier.source, {'left': upgradeRectangle.left + 10, 'top': upgradeRectangle.top + 6, 'width': 60, 'height': 60});
    drawImage(mainContext, nextTier.source.image, nextTier.source, {'left': upgradeRectangle.left + 10, 'top': upgradeRectangle.top + 105, 'width': 60, 'height': 60});
    mainContext.textAlign = 'left'
    mainContext.textBaseline = 'middle';
    mainContext.fillStyle = 'white';
    setFontSize(mainContext, 18);
    mainContext.fillText(currentTier.name, upgradeRectangle.left + 80, upgradeRectangle.top + 25);
    mainContext.fillText(nextTier.name, upgradeRectangle.left + 80, upgradeRectangle.top + 125);
    mainContext.fillStyle = toolTipColor;
    const state = getState();
    mainContext.fillText(bonusSourceHelpText(currentTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 80, upgradeRectangle.top + 45);
    mainContext.fillText(bonusSourceHelpText(nextTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 80, upgradeRectangle.top + 145);
}

function setFontSize(context, size) {
    context.font = size +"px 'Cormorant SC', Georgia, serif";
}

const areaObjects = {
    'mapTable': {'name': 'World Map', 'source': objectSource(guildImage, [360, 150], [60, 27, 30], {'yOffset': -6}), 'action': openWorldMap,
        'getActiveBonusSources': () => [{'bonuses': {'$hasMap': true}}],
    },
    'crackedOrb': {'name': 'Cracked Anima Orb', 'source': objectSource(guildImage, [240, 150], [30, 29, 15])},
    'animaOrb': {
        action() {
            removePopup();
            upgradingObject = this;
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
        draw(area) {
            const animaOrbTier = animaOrbTiers[this.level - 1];
            this.scale = animaOrbTier.scale || 1;
            this.source = animaOrbTier.source;
            // Make this coin stash flash if it can be upgraded.
            this.flashColor = (animaOrbTier.upgradeCost && canAffordCost(animaOrbTier.upgradeCost)) ? 'white' : null;
            drawFixedObject.call(this, area);
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
        'action':  function () {
            removePopup();
            upgradingObject = this;
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
        draw(area) {
            const coinStashTier = coinStashTiers[this.level - 1];
            this.scale = coinStashTier.scale || 1;
            this.source = coinStashTier.source;
            // Make this coin stash flash if it can be upgraded.
            this.flashColor = (coinStashTier.upgradeCost && canAffordCost(coinStashTier.upgradeCost)) ? 'white' : null;
            drawFixedObject.call(this, area);
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
    'woodenAltar': {'name': 'Shrine of Fortune', 'source': objectSource(guildImage, [450, 150], [30, 30, 20], {'yOffset': -6}), 'action': openCrafting,
        'getActiveBonusSources': () => [{'bonuses': {'$hasItemCrafting': true}}],
    },
    'trophyAltar': {'name': 'Trophy Altar', 'source': objectSource(guildImage, [420, 180], [30, 30, 20], {'yOffset': -6}),
        action(actor) {
            removePopup();
            setChoosingTrophyAltar(this);
        },
        getTrophyRectangle() {
            return {'left': this.target.left + (this.target.width - this.trophy.width) / 2,
                    'top': this.target.top - this.trophy.height + 10, 'width': this.trophy.width, 'height': this.trophy.height};
        },
        draw(area) {
            // Make this altar flash if it is open and there is an unused trophy available to place on it.
            this.flashColor = (!this.trophy && getIsAltarTrophyAvailable()) ? 'white' : null;
            drawFixedObject.call(this, area);
            if (this.trophy) {
                if (getCanvasPopupTarget() === this) drawSourceWithOutline(mainContext, this.trophy, '#fff', 2, this.getTrophyRectangle());
                else this.trophy.draw(mainContext, this.getTrophyRectangle());
            }
        }, isOver(x, y) {
            return isPointInRectObject(x, y, this.target) || (this.trophy && isPointInRectObject(x,y, this.getTrophyRectangle()));
        },
        helpMethod(object) {
            if (this.trophy) return this.trophy.helpMethod();
            return titleDiv('Trophy Altar');
        }
    },
    'candles': {'source': objectSource(guildImage, [540, 145], [25, 40, 0])},
    'bed': {'name': 'Worn Cot', 'source': objectSource(guildImage, [480, 210], [60, 24, 30], {'yOffset': -6}),
        getActiveBonusSources() {
            return [{'bonuses': {'+maxHeroes': 1}}];
        }
    },
    'jewelShrine': {'name': 'Shrine of Creation', 'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}), 'action': openJewels,
        'getActiveBonusSources': () => [{'bonuses': {'$hasJewelCrafting': true}}],
    },
    'heroApplication': {'name': 'Application', 'source': {'width': 40, 'height': 60, 'depth': 0}, 'action': showApplication, draw(area) {
        this.target.left = this.x - this.width / 2 - area.cameraX;
        this.target.top = GROUND_Y - this.y - this.height - this.z / 2;
        if (getCanvasPopupTarget() === this) {
            mainContext.fillStyle = 'white';
            fillRectangle(mainContext, shrinkRectangle(this.target, -2));
        }
        mainContext.fillStyle = '#fc8';
        fillRectangle(mainContext, this.target);
        if (!this.character) {
            this.character = createNewHeroApplicant();
        }
        var jobSource = this.character.adventurer.job.iconSource;
        mainContext.save();
        mainContext.globalAlpha = 0.6;
        drawImage(mainContext, jobSource.image, jobSource, {'left': this.target.left + 4, 'top': this.target.top + 14, 'width': 32, 'height': 32});
        mainContext.restore();
    }},

    'door': {'source': objectSource(guildImage, [240, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},
    'upstairs': {'source': objectSource(guildImage, [270, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},
    'downstairs': {'source': objectSource(guildImage, [300, 94], [30, 51, 0]), 'action': useDoor, 'isEnabled': isGuildExitEnabled},

    'skillShrine': {'name': 'Shrine of Divinity', 'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}), 'action': activateShrine},
    'closedChest': {
        'name': 'Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [0, 0], [64, 64, 64], {'yOffset': -6}),
        action(actor) {
            // The loot array is an array of objects that can generate specific loot drops. Iterate over each one, generate a
            // drop and then give the loot to the player and display it on the screen.
            let delay = 0;
            for (let i = 0; i < this.loot.length; i++) {
                const drop = this.loot[i].generateLootDrop();
                drop.gainLoot(actor);
                var xOffset = (this.loot.length > 1) ? - 50 + 100 * i / (this.loot.length - 1) : 0;
                drop.addTreasurePopup(actor, this.x + xOffset, this.y + 64, this.z, delay += 5);
            }
            // Replace this chest with an opened chest in the same location.
            const openedChest = fixedObject('openChest', [this.x, this.y, this.z], {isEnabled: () => true, 'scale': this.scale || 1});
            openedChest.area = this.area;
            this.area.objects[this.area.objects.indexOf(this)] = openedChest;
            this.area.chestOpened = true;
        }
    },
    'openChest': {'name': 'Opened Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [64, 0], [64, 64, 64], {'yOffset': -6}), action(actor) {
        messageCharacter(actor.character, 'Empty');
    }},
    'woodBridge': {'source': objectSource(requireImage('gfx/bridge2E.png'), [0, 0], [360, 160, 0], {yOffset: -60}), 'action': useDoor},
    'stoneBridge': {'source': objectSource(requireImage('gfx/bridgeE.png'), [0, 0], [240, 120, 0], {yOffset: -45}), 'action': useDoor},
}

function drawFixedObject(area) {
    var imageSource = this.source;
    if (this.lastScale !== this.scale) {
        this.width = (imageSource.actualWidth || imageSource.width) * this.scale;
        this.height = (imageSource.actualHeight || imageSource.height) * this.scale;
        this.target.width = imageSource.width * this.scale;
        this.target.height = imageSource.height * this.scale;
        this.lastScale = this.scale;
    }
    // Calculate the left/top values from x/y/z coords, which drawImage will use.
    this.target.left = this.x - this.target.width / 2 - area.cameraX + imageSource.xOffset * this.scale;
    this.target.top = GROUND_Y - this.y - this.target.height - this.z / 2 - imageSource.yOffset * this.scale;
    if (getCanvasPopupTarget() === this) drawOutlinedImage(mainContext, imageSource.image, '#fff', 2, imageSource, this.target);
    else if (this.flashColor) drawTintedImage(mainContext, imageSource.image, this.flashColor, .5 + .2 * Math.sin(Date.now() / 150), imageSource, this.target);
    else drawImage(mainContext, imageSource.image, imageSource, this.target);
}
function isGuildObjectEnabled() {
    if (!this.area) debugger;
    return getState().savedState.unlockedGuildAreas[this.area.key] && !this.area.enemies.length;
}
function isGuildExitEnabled() {
    //if (this.area.key === 'guildFoyer') debugger;
    // A door can be used if the are is unlocked.
    if (isGuildObjectEnabled.call(this)) return true;
    //if (this.area.key === 'guildFoyer') debugger;
    // It can also be used if the area it is connected to is unlocked.
    return getState().savedState.unlockedGuildAreas[this.exit.areaKey];
}
export function fixedObject(baseObjectKey, coords, properties: Partial<FixedObject> = {}): FixedObject {
    const base = areaObjects[baseObjectKey];
    const imageSource = base.source;
    const newFixedObject: FixedObject = {
        depth: imageSource.depth,
        scale: 1,
        width: imageSource.actualWidth || imageSource.width,
        height: imageSource.acutalHeight || imageSource.height,
        isEnabled: isGuildObjectEnabled,
        draw: drawFixedObject,
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
function fixedObjectHelpText(object) {
    return object.base.name && titleDiv(object.base.name);
}

function addFurnitureBonuses(furniture, recompute) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    var bonusSources = furniture.getActiveBonusSources();
    for (var bonusSource of bonusSources) {
        // Multiple copies of the same furniture will have the same bonus source, so this check is not valid.
        /*if (guildBonusSources.indexOf(bonusSource) >= 0) {
            console.log(bonusSource);
            console.log(guildBonusSources);
            throw new Error('bonus source was already present in guildBonusSources!');
        }*/
        state.guildBonusSources.push(bonusSource);
        addBonusSourceToObject(state.guildStats, bonusSource);
        for (var character of state.characters) {
            addBonusSourceToObject(character.adventurer, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}
function removeFurnitureBonuses(furniture, recompute) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    var bonusSources = furniture.getActiveBonusSources();
    for (var bonusSource of bonusSources) {
        if (state.guildBonusSources.indexOf(bonusSource) < 0) {
            console.log(bonusSource);
            console.log(state.guildBonusSources);
            throw new Error('bonus source was not found in guildBonusSources!');
        }
        state.guildBonusSources.splice(state.guildBonusSources.indexOf(bonusSource), 1);
        removeBonusSourceFromObject(state.guildStats, bonusSource);
        for (var character of state.characters) {
            removeBonusSourceFromObject(character.adventurer, bonusSource);
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

export function addAreaFurnitureBonuses(guildArea, recompute = false) {
    for (var object of guildArea.objects) addFurnitureBonuses(object, false);
    if (recompute) recomputeAllCharacterDirtyStats();
}
