import { completeLevel, enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { setChoosingTrophyAltar } from 'app/content/achievements';
import { itemsByKey } from 'app/content/equipment/index';
import { openWorldMap } from 'app/content/areas';
import { guildYardEntrance } from 'app/content/guild';
import { map } from 'app/content/mapData';
import { setUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import { query, queryAll } from 'app/dom';
import { handleSkillKeyInput } from 'app/render/drawActionShortcuts';
import { handleEditAreaKeyDown } from 'app/development/editArea';
import { handleEditMapKeyDown, isEditingAllowed } from 'app/development/editLevel';
import { pasteCharacterToClipBoard } from 'app/development/testCharacters';
import { reforgeItems } from 'app/equipmentCrafting';
import { hideHeroApplication } from 'app/heroApplication';
import {
    areAnyCraftedItemsVisible, equipItem, getItemForElement, inventoryState, sellItem,
} from 'app/inventory';
import { jewelInventoryState, sellJewel } from 'app/jewelInventory';
import { mapState } from 'app/map';
import { gain } from 'app/points';
import { getPopup } from 'app/popup';
import { getState } from 'app/state';
import { isMouseOverElement } from 'app/utils/mouse';

export const KEY = {
    ESCAPE: 27,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    SPACE: 32,
    SHIFT: 16,
    ENTER: 13,
    BACK_SPACE: 8,
    E: 'E'.charCodeAt(0),
    I: 'I'.charCodeAt(0),
    J: 'J'.charCodeAt(0),
    G: 'G'.charCodeAt(0),
    L: 'L'.charCodeAt(0),
    M: 'M'.charCodeAt(0),
    S: 'S'.charCodeAt(0),
    R: 'R'.charCodeAt(0),
    X: 'X'.charCodeAt(0),
    C: 'C'.charCodeAt(0),
    V: 'V'.charCodeAt(0),
    T: 'T'.charCodeAt(0),
};

const keysDown = {};
export function isKeyDown(keyCode: number, releaseThreshold: boolean = false): number {
    if (!keysDown[keyCode]) {
        return 0;
    }
    if (releaseThreshold) {
        keysDown[keyCode] = 0;
    }
    return 1;
};

export function addKeyCommands() {
document.addEventListener('keyup', function(event) {
    const keyCode: number = event.which;
    delete keysDown[keyCode];
});
document.addEventListener('keydown', function(event) {
    const keyCode: number = event.which;
    keysDown[keyCode] = true;
    // console.log(keyCode);
    if (handleSkillKeyInput(keyCode)) return;
    if (handleEditMapKeyDown(keyCode)) return;
    if (handleEditAreaKeyDown(keyCode)) return;
    const state = getState();
    if (keyCode === KEY.ESCAPE) {
        event.preventDefault();
        if (state.selectedCharacter.context === 'map') {
            hideAreaMenu();
            if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            } else {
                setContext('guild');
            }
        } else if (state.selectedCharacter.context === 'jewel' || state.selectedCharacter.context === 'item') {
            if (state.selectedCharacter.hero.area && !state.selectedCharacter.hero.area.isGuildArea) {
                setContext('adventure');
            } else {
                setContext('guild');
            }
        }
        if (state.selectedCharacter.context === 'adventure' || state.selectedCharacter.context === 'guild') {
            hideHeroApplication();
            setChoosingTrophyAltar(null);
            setUpgradingObject(null);
        }
    }
    if (isEditingAllowed()) {
        if (keyCode === KEY.C) {
            pasteCharacterToClipBoard(state.selectedCharacter);
        }
        if (keyCode === KEY.L) {
            const mapTarget = mapState.currentMapTarget;
            if (mapTarget && mapTarget.targetType === 'level') {
                state.selectedCharacter.currentLevelKey = mapTarget.levelKey;
                completeLevel(state.selectedCharacter.hero, 10);
            }
        }
    }
    if ((keyCode === KEY.C || keyCode === KEY.I) && (true || state.guildStats.hasItemCrafting)) {
        if (state.selectedCharacter.context === 'item') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('item');
    }
    if (keyCode === KEY.J && (true || state.guildStats.hasJewelCrafting)) {
        if (state.selectedCharacter.context === 'jewel') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('jewel');
    }
    if (keyCode === KEY.M && state.guildStats.hasMap) {
        // console.log(state.selectedCharacter.context);
        // Unlock the first areas on the map if they aren't unlocked yet.
        for (const levelKey of map.guild.unlocks) {
            state.visibleLevels[levelKey] = true;
        }
        if (state.selectedCharacter.context === 'map') {
            if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            } else {
                setContext('guild');
            }
        } else if (state.selectedCharacter.context !== 'adventure') {
            openWorldMap();
        }
    }
    if (keyCode == KEY.R && !inventoryState.dragHelper && !(event.metaKey || event.ctrlKey)) { // 'r' without ctrl/cmd while not dragging an item.
        // If they are looking at the item screen and the reforge option is available.
        if (state.selectedCharacter.context === 'item' && areAnyCraftedItemsVisible()) {
            reforgeItems();
            return;
        }
    }
    if (keyCode == KEY.S) { // 's'
        if (jewelInventoryState.overJewel) {
            sellJewel(jewelInventoryState.overJewel);
            jewelInventoryState.overJewel = null;
            return;
        }
        if (isMouseOverElement(query('.js-inventory'))) {
            for (const itemElement of queryAll('.js-inventory .js-item')) {
                if (isMouseOverElement(itemElement)) {
                    sellItem(getItemForElement(itemElement));
                    return;
                }
            }
        }
    }
    /*if (isEditingAllowed() && !editingMapState.editingLevel && event.which == 68 && event.shiftKey) { // 'd'
        gain('coins', 1000);
        gain('anima', 1000);
        $.each(itemsByKey, function (key, item) {
            state.craftedItems[key] |= CRAFTED_NORMAL;
            if (item.unique) {
                state.craftedItems[key] |= CRAFTED_UNIQUE;
            }
        });
        unlockItemLevel(73);
        state.characters.forEach(function (character) {
            $.each(map, function (key) {
                unlockMapLevel(key);
            });
        });
    }*/
    if (keyCode == KEY.E) {
        const popup = getPopup();
        if (!popup.target || !popup.target.closest('.js-inventory')) {
            return;
        }
        const actor = state.selectedCharacter.adventurer;
        const item = getItemForElement(popup.target);
        if (item) equipItem(actor, item);
        return;
    }
    /*if (isEditingAllowed() && event.which == 76) { // 'l'
        if (overCraftingItem) {
            state.craftedItems[overCraftingItem.key] |= CRAFTED_NORMAL;
            var item = makeItem(overCraftingItem, overCraftingItem.level);
            updateItem(item);
            $('.js-inventory').prepend(item.domElement);
            if (item.base.unique) {
                item = makeItem(overCraftingItem, overCraftingItem.level);
                makeItemUnique(item);
                updateItem(item);
                $('.js-inventory').prepend(item.domElement);
                state.craftedItems[overCraftingItem.key] |= CRAFTED_UNIQUE;
            }
            $('.js-inventorySlot').style.display = 'none';
            lastCraftedItem = overCraftingItem;
        }
    }*/
    //console.log(event.which);
});
}
