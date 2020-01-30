import { completeLevel, enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { setChoosingTrophyAltar } from 'app/content/achievements';
import { itemsByKey } from 'app/content/equipment/index';
import { openWorldMap } from 'app/content/furniture';
import { guildYardEntrance } from 'app/content/guild';
import { map } from 'app/content/mapData';
import { setUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import { query, queryAll } from 'app/dom';
import { handleSkillKeyInput } from 'app/drawSkills';
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

export const KEY_ESCAPE = 27;
export const KEY_C = 67;
export const KEY_E = 69;
export const KEY_I = 73;
export const KEY_J = 74;
export const KEY_L = 76;
export const KEY_M = 77;
export const KEY_R = 82;
export const KEY_S = 83;

export function addKeyCommands() {
document.addEventListener('keydown', function(event) {
    const keycode: number = event.which;
    // console.log(keycode);
    if (handleSkillKeyInput(keycode)) return;
    if (handleEditMapKeyDown(keycode)) return;
    const state = getState();
    if (keycode === KEY_ESCAPE) {
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
        if (keycode === KEY_C) {
            pasteCharacterToClipBoard(state.selectedCharacter);
        }
        if (keycode === KEY_L) {
            const mapTarget = mapState.currentMapTarget;
            if (mapTarget && mapTarget.targetType === 'level') {
                state.selectedCharacter.currentLevelKey = mapTarget.levelKey;
                completeLevel(state.selectedCharacter.hero, 10);
            }
        }
    }
    if ((keycode === KEY_C || keycode === KEY_I) && (true || state.guildStats.hasItemCrafting)) {
        if (state.selectedCharacter.context === 'item') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('item');
    }
    if (keycode === KEY_J && (true || state.guildStats.hasJewelCrafting)) {
        if (state.selectedCharacter.context === 'jewel') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('jewel');
    }
    if (keycode === KEY_M && state.guildStats.hasMap) {
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
            openWorldMap(state.selectedCharacter.adventurer);
        }
    }
    if (keycode == KEY_R && !inventoryState.dragHelper && !(event.metaKey || event.ctrlKey)) { // 'r' without ctrl/cmd while not dragging an item.
        // If they are looking at the item screen and the reforge option is available.
        if (state.selectedCharacter.context === 'item' && areAnyCraftedItemsVisible()) {
            reforgeItems();
            return;
        }
    }
    if (keycode == KEY_S) { // 's'
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
    if (keycode == KEY_E) {
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
