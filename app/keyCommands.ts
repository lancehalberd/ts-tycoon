import { completeLevel, enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { setChoosingTrophyAltar } from 'app/content/achievements';
import { openWorldMap } from 'app/content/areas';
import { setUpgradingObject } from 'app/ui/upgradeButton';
import { setContext } from 'app/context';
import { query, queryAll } from 'app/dom';
import { handleSkillKeyInput } from 'app/render/drawActionShortcuts';
import { handleEditAreaKeyDown } from 'app/development/editArea';
import { handleEditMapKeyDown, isEditingAllowed } from 'app/development/editLevel';
import { reforgeItems } from 'app/equipmentCrafting';
import { hideHeroApplication } from 'app/heroApplication';
import {
    areAnyCraftedItemsVisible, equipItem, getItemForElement, inventoryState, sellItem,
} from 'app/inventory';
import { jewelInventoryState, sellJewel } from 'app/jewelInventory';
import { mapState } from 'app/map';
import { getPopup } from 'app/popup';
import { getState, guildYardEntrance } from 'app/state';
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
    COMMAND: 91,
    CONTROL: 17,
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
export function isKeyDown(keyCode: number, releaseThreshold: boolean = false): boolean {
    if (!keysDown[keyCode]) {
        return false;
    }
    if (releaseThreshold) {
        keysDown[keyCode] = false;
    }
    return true;
};

export function addKeyCommands() {
document.addEventListener('keyup', function(event) {
    const keyCode: number = event.which;
    keysDown[keyCode] = null;
});
document.addEventListener('keydown', function(event: KeyboardEvent) {
    // Don't process keys if an input is targeted, otherwise we prevent typing in
    // the input.
    if ((event.target as HTMLElement).closest('input')) {
        return;
    }
    const keyCode: number = event.which;
    // Don't override the refresh page command.
    if (keyCode === KEY.R && (keysDown[KEY.CONTROL] || keysDown[KEY.COMMAND])) {
        return;
    }
    keysDown[keyCode] = true;
    const state = getState();
    //console.log(keyCode);
    if (state.selectedCharacter.context === 'cutscene') {
        state.cutscene.handleKeyInput(keyCode);
        return;
    }
    if (handleSkillKeyInput(keyCode)) {
        event.preventDefault();
        return;
    }
    if (handleEditMapKeyDown(keyCode)) {
        event.preventDefault();
        return;
    }
    if (handleEditAreaKeyDown(keyCode)) {
        event.preventDefault();
        return;
    }
    if (keyCode === KEY.ESCAPE) {
        event.preventDefault();
        if (state.selectedCharacter.context === 'map') {
            hideAreaMenu();
            if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            }
            setContext('field');
        } else if (state.selectedCharacter.context === 'jewel' ||
            state.selectedCharacter.context === 'jewelCrafting' ||
            state.selectedCharacter.context === 'item'
        ) {
            setContext('field');
        }
        if (state.selectedCharacter.context === 'field') {
            hideHeroApplication();
            setChoosingTrophyAltar(null);
            setUpgradingObject(null);
        }
    }
    if (isEditingAllowed()) {
        if (keyCode === KEY.L) {
            const mapTarget = mapState.currentMapTarget;
            if (mapTarget && mapTarget.targetType === 'level') {
                state.selectedCharacter.currentLevelKey = mapTarget.levelKey;
                completeLevel(state.selectedCharacter.hero, 10);
            }
        }
    }
    if ((keyCode === KEY.C || keyCode === KEY.I) && state.guildStats.itemCraftingLevel > 0) {
        if (state.selectedCharacter.context === 'item') setContext('field');
        else if (state.selectedCharacter.hero.area?.zoneKey === 'guild') {
            setContext('item');
        }
    }
    if (keyCode === KEY.J) {
        if (state.selectedCharacter.context === 'jewel' || state.selectedCharacter.context === 'jewelCrafting') {
            setContext('field');
        } else if (state.selectedCharacter.hero.area?.zoneKey === 'guild') {
            setContext('jewel');
        }
    }
    if (keyCode === KEY.M && state.guildStats.mapLevel > 0) {
        if (state.selectedCharacter.context === 'map') {
            if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            }
            setContext('field');
        } else if (state.selectedCharacter.hero.area?.zoneKey === 'guild') {
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
    }*/
    if (keyCode == KEY.E) {
        const popup = getPopup();
        if (!popup || !popup.target || !popup.target.closest('.js-inventory')) {
            return;
        }
        const actor = state.selectedCharacter.hero;
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
