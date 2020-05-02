import { enterArea, messageCharacter } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getIsAltarTrophyAvailable, setChoosingTrophyAltar, trophySelectionRectangle } from 'app/content/achievements';
import { isPointOverAreaTarget } from 'app/content/areas/AreaObjectTarget';
import { map } from 'app/content/mapData';
import { getUpgradeRectangle, setUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import { bodyDiv, mainCanvas, mainContext, mouseContainer, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { ADVENTURE_SCALE, GROUND_Y } from 'app/gameConstants';
import { createNewHeroApplicant, hideHeroApplication, showHeroApplication } from 'app/heroApplication';
import {
    drawImage,
    drawOutlinedImage,
    drawSourceWithOutline,
    drawTintedImage,
    drawTitleRectangle, requireImage
} from 'app/images';
import { attemptToApplyCost, canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { fillRectangle, isPointInShortRect, rectangle, shrinkRectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

import {
    Actor, Area, AreaObject, AreaObjectTarget, BonusSource, Character, Exit, FixedObject,
    GuildArea, Hero,
} from 'app/types';

mouseContainer.addEventListener('mousedown', function (event) {
    if (event.which !== 1) {
        return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('.js-heroApplication')) hideHeroApplication();
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (!isPointInShortRect(x, y, trophySelectionRectangle)) setChoosingTrophyAltar(null);
    if (!isPointInShortRect(x, y, getUpgradeRectangle())) setUpgradingObject(null);
});
/*

const areaObjects: {[key: string]: FixedObjectData} = {
    'candles': {
        'source': objectSource(guildImage, [540, 145], [25, 40, 0])
    },

    'upstairs': {
        'source': objectSource(guildImage, [270, 94], [30, 51, 0]), onInteract: useDoor, 'isEnabled': isGuildExitEnabled},
    'downstairs': {
        'source': objectSource(guildImage, [300, 94], [30, 51, 0]), onInteract: useDoor, 'isEnabled': isGuildExitEnabled},

    'skillShrine': {
        'name': 'Shrine of Divinity',
        'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}),
        onInteract: activateShrine,
        helpMethod(hero: Hero) {
            return titleDiv('Divine Shrine')
                + bodyDiv('Offer divinity at these shrines to be blessed by the Gods with new powers.');
        },
        shouldInteract(hero: Hero): boolean {
            return !hero.character.skipShrines;
        },
    },
    'closedChest': {
        'name': 'Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [0, 0], [64, 64, 64], {'yOffset': -6}),
        onInteract(hero: Hero) {
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
        },
        shouldInteract(hero: Hero) {
            return true;
        }
    },
    'openChest': {
        'name': 'Opened Treasure Chest', 'source': objectSource(requireImage('gfx/treasureChest.png'), [64, 0], [64, 64, 64], {'yOffset': -6}),
        onInteract(hero: Hero) {
            messageCharacter(hero.character, 'Empty');
        }
    },
}*/
/*function isGuildObjectEnabled(this: FixedObject) {
    if (!this.area) debugger;
    return getState().savedState.unlockedGuildAreas[this.area.key] && !this.area.enemies.length;
}
function isGuildExitEnabled(this: FixedObject) {
    //if (this.area.key === 'guildFoyer') debugger;
    // A door can be used if the are is unlocked.
    if (isGuildObjectEnabled.call(this)) {
        return true;
    }
    //if (this.area.key === 'guildFoyer') debugger;
    // It can also be used if the area it is connected to is unlocked.
    return getState().savedState.unlockedGuildAreas[this.exit.areaKey];
}*/
/*export function guildObject(baseObjectKey: string, coords: number[], properties: Partial<FixedObject> = {}): FixedObject {
    return fixedObject(baseObjectKey, coords, {
        isEnabled: isGuildObjectEnabled,
        ...areaObjects[baseObjectKey],
        ...properties,
    });
}*/
/*function getFixedObjectAreaTarget(this: FixedObject): AreaObjectTarget {
    return {
        area: this.area,
        targetType: 'object',
        object: this,
        x: this.x,
        y: this.y,
        z: this.z,
        w: this.width,
        h: this.height,
    };
}*/
/*export function fixedObject(baseObjectKey: string, coords: number[], properties: Partial<FixedObject> = {}): FixedObject {
    const base = areaObjects[baseObjectKey];
    const imageSource = base.source;
    const newFixedObject: FixedObject = {
        type: 'fixedObject',
        getAreaTarget: getFixedObjectAreaTarget,
        isPointOver(x, y) {
            return isPointOverAreaTarget(this.getAreaTarget(), x, y);
        },
        move(dx, dy, dz) {
            this.x += dx;
            this.y += dy;
            this.z += dz;
        },
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
    return newFixedObject;
}*/
/*function fixedObjectHelpText(this: FixedObject) {
    return this.base.name && titleDiv(this.base.name);
}*/

export function addFurnitureBonuses(furniture: AreaObject, recompute = false) {
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
export function removeFurnitureBonuses(furniture: AreaObject, recompute = false) {
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
        if (!state.guildAreas[areaKey]) {
            console.log('warning, no area for ', areaKey);
            continue;
        }
        addAreaFurnitureBonuses(state.guildAreas[areaKey]);
    }
    recomputeAllCharacterDirtyStats();
}

export function addAreaFurnitureBonuses(guildArea: GuildArea, recompute = false) {
    for (const object of guildArea.objects) addFurnitureBonuses(object, false);
    if (recompute) recomputeAllCharacterDirtyStats();
}
