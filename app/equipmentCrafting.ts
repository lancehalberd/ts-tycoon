import { items, itemsBySlotAndLevel } from 'app/content/equipment/index';
import { checkToMakeItemUnique } from 'app/content/uniques';
import {
    craftingCanvas, craftingContext, craftingOptionsContainer,
    query, tag, titleDiv,
} from 'app/dom';
import { augmentItemProper } from 'app/enchanting';
import { armorSlots } from 'app/gameConstants';
import { bonusSourceHelpText } from 'app/helpText';
import { drawTintedFrame } from 'app/images';
import {
    addToInventory, baseItemLevelCost, inventoryState, makeItem, tagToDisplayName, updateItem
} from 'app/inventory';
import { hidePointsPreview, points, previewPointsChange, spend } from 'app/points';
import { addPopup, getPopup, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { ifdefor } from 'app/utils/index';
import { fixedDigits } from 'app/utils/formatters';
import { getMousePosition } from 'app/utils/mouse';

import { Item, ItemData } from 'app/types';

export const CRAFTED_NORMAL = 1;
const CRAFTED_UNIQUE = 2;

export const equipmentCraftingState: {
    overCraftingItem: ItemData,
    lastCraftedItem: ItemData,
} = {
    overCraftingItem: null,
    lastCraftedItem: null,
};

// Same size as icons for equipment.
const craftingSlotSize = 36;
const craftingSlotSpacing = 2;
const craftingSlotTotal = craftingSlotSize + craftingSlotSpacing;
const craftingHeaderSize = 4 + craftingSlotSize / 2 + craftingSlotSpacing;
const craftingGrid: ItemData[][] = [];
let craftingCanvasMousePosition = null;
let itemsFilteredByType = [];
let selectedCraftingWeight = 0;
export function initializeCraftingGrid() {
    craftingCanvas.width = 5 + 7.5 * craftingSlotTotal;
    craftingCanvas.height = craftingHeaderSize + 4 * craftingSlotTotal + 1;
    craftingContext.imageSmoothingEnabled = false;
    const craftingSections = [
        {'height': 1, 'slots': ['weapon']},
        {'height': 2, 'slots': ['offhand', 'head', 'body', 'arms', 'legs', 'feet']},
        {'height': 1, 'slots': ['back', 'ring']}
    ];
    let row = 0, column = 0;
    for (const craftingSection of craftingSections) {
        for (let i = 1; i < items.length; i++) {
            column = 3 * (i - 1);
            let subColumn = 0, subRow = 0;
            for (let slot of craftingSection.slots) {
                for (let item of ifdefor(itemsBySlotAndLevel[slot][i], [])) {
                    if (subColumn > 2) {
                        console.log(craftingSection.slots);
                        console.log(new Error("Too many items in crafting section at level " + i));
                        debugger;
                    }
                    const x = 2 + (column + subColumn) * craftingSlotTotal;
                    const y = craftingHeaderSize + (row + subRow) * craftingSlotTotal;
                    item.craftingX = x;
                    item.craftingY = y;
                    craftingGrid[row + subRow] = (craftingGrid[row + subRow] || []);
                    craftingGrid[row + subRow][column + subColumn] = item;
                    subRow++;
                    if (subRow >= craftingSection.height) {
                        subRow = 0;
                        subColumn++;
                    }
                }
            }
        }
        row += craftingSection.height;
    }
    craftingCanvas.onmousemove = function () {
        craftingCanvasMousePosition = getMousePosition(craftingCanvas);
        if (inventoryState.dragHelper) {
            return;
        }
        updateOverCraftingItem();
        checkToShowCraftingToopTip();
    };
    craftingCanvas.onmousedown = function (event) {
        if (event.which !== 1) {
            return;
        }
        if (inventoryState.dragHelper) {
            return;
        }
        if (event.shiftKey && equipmentCraftingState.overCraftingItem) { //check if 'shift' key is held down
            addToInventory(makeItem(equipmentCraftingState.overCraftingItem, 1));
            return;
        }
        craftNewItems();
    };
    craftingCanvas.onmouseout = function () {
        equipmentCraftingState.overCraftingItem = null;
        if (craftingOptionsContainer.style.display === 'none') {
            const state = getState();
            state.savedState.craftingLevel = null;
            state.savedState.craftingTypeFilter = null;
        }
        craftingCanvasMousePosition = null;
        hidePointsPreview();
    };
}
function updateOverCraftingItem() {
    const state = getState();
    var x = craftingCanvasMousePosition[0] + state.savedState.craftingXOffset;
    var y = craftingCanvasMousePosition[1];
    var column = Math.floor((x - 2) / craftingSlotTotal);
    var row = Math.floor((y - craftingHeaderSize) / craftingSlotTotal);
    state.savedState.craftingLevel = Math.min(state.savedState.maxCraftingLevel, Math.floor(column / 3) + 1);
    if (row < 0) {
        state.savedState.craftingTypeFilter = 'all';
    } else if (row < 1) {
        state.savedState.craftingTypeFilter = 'weapon';
    } else if (row < 3) {
        state.savedState.craftingTypeFilter = 'armor';
    } else {
        state.savedState.craftingTypeFilter = 'accessory';
    }
    updateItemsThatWillBeCrafted();
    previewPointsChange('coins', -getCurrentCraftingCost());
    var craftingRow = (craftingGrid[row] || []);
    var item = craftingRow[column];
    if (!item || item.level > state.savedState.maxCraftingLevel) {
        equipmentCraftingState.overCraftingItem = null;
        return;
    }
    x -= item.craftingX;
    y -= item.craftingY;
    if (x < 0 || x > craftingSlotSize || y < 0|| y > craftingSlotSize) {
        equipmentCraftingState.overCraftingItem = null;
        return;
    }
    equipmentCraftingState.overCraftingItem = item;
}
function craftNewItems() {
    if (!spend('coins', getCurrentCraftingCost())) {
        return;
    }
    craftingOptionsContainer.style.display = '';
    craftingOptionsContainer.querySelectorAll('.js-itemSlot').forEach(element => {
        const item = craftItem();
        element.append(item.domElement);
    });
    saveGame();
}
export function updateCraftingCanvas() {
    const state = getState();
    if (!state.selectedCharacter) return;
    if (!craftingCanvasMousePosition) return;
    const maxX = state.savedState.maxCraftingLevel * 3 * craftingSlotTotal + 4 - craftingCanvas.width;
    const x = craftingCanvasMousePosition[0];
    let vx = 0;
    if (x < 100) vx = (x - 100) / 5;
    else if (x > craftingCanvas.width - 100) vx = (100 - (craftingCanvas.width - x)) / 5;
    if (vx) {
        state.savedState.craftingXOffset = Math.max(0, Math.min(maxX, state.savedState.craftingXOffset + vx));
        updateOverCraftingItem();
    }
}
let lastCraftingProps = {};
function hasCraftingStateChanged(props): boolean {
    for (let key in props) {
        if (props[key] !== lastCraftingProps[key]) {
            lastCraftingProps = props;
            return true;
        }
    }
    return false;
}
export function drawCraftingCanvas() {
    const state = getState();
    const { savedState, selectedCharacter } = state;
    if (!selectedCharacter) return;
    // In theory this will keep us from rendering when nothing has changed.
    if (!hasCraftingStateChanged({
        selectedCharacter,
        maxCraftingLevel: savedState.maxCraftingLevel,
        craftingXOffset: savedState.craftingXOffset,
        craftingLevel: savedState.craftingLevel,
        craftinTypeFilter: savedState.craftingTypeFilter,
        overCraftingItem: equipmentCraftingState.overCraftingItem,
        craftedValues: Object.values(savedState.craftedItems).join(','),
    })) {
        return;
    }
    const context = craftingContext;
    context.clearRect(0, 0, craftingCanvas.width, craftingCanvas.height);
    context.save();
    context.textBaseline = "middle";
    context.textAlign = 'center'
    context.translate(-savedState.craftingXOffset, 0);

    const firstColumn = Math.floor(savedState.craftingXOffset / craftingSlotTotal);
    for (let column = firstColumn; column < firstColumn + 17; column++) {
        if (column % 6 > 2) {
            context.fillStyle = '#ededed';
            context.fillRect(1 + column * craftingSlotTotal, 0, craftingSlotTotal, craftingCanvas.height);
        }
    }

    // Highlight the crafting items if the user has their mouse over the crafting canvas.
    if (savedState.craftingLevel && savedState.craftingTypeFilter) {
        let offset = 0;
        let rows = 6;
        switch (savedState.craftingTypeFilter) {
            case 'all':
                offset = -1;
                rows = 5;
                break;
            case 'weapon':
                rows = 1;
                break;
            case 'armor':
                offset = 1;
                rows = 2;
                break;
            case 'accessory':
                offset = 3;
                rows = 1;
                break
        }
        context.fillStyle = '#8F8';
        context.fillRect(0, craftingHeaderSize + offset * craftingSlotTotal, 4 + 3 * craftingSlotTotal * Math.min(state.selectedCharacter.hero.level, savedState.craftingLevel), 3 + rows * craftingSlotTotal);
        const levelsOverCurrent = savedState.craftingLevel - state.selectedCharacter.hero.level;
        if (levelsOverCurrent > 0) {
            context.fillStyle = '#F88';
            context.fillRect(2 + 3 * craftingSlotTotal * state.selectedCharacter.hero.level, craftingHeaderSize + offset * craftingSlotTotal, 3 * craftingSlotTotal * levelsOverCurrent, 3 + rows * craftingSlotTotal);
        }
    }

    context.fillStyle = '#444';
    context.font = "20px sans-serif";
    for (let column = firstColumn; column < firstColumn + 17; column++) {
        const level = Math.floor(column / 2) + 1;
        context.fillText('' + level, 2 + (3 * level - 2) * craftingSlotTotal + craftingSlotSize / 2,  12);
    }


    context.font = (craftingSlotSize - 5) + "px sans-serif";
    for (let column = firstColumn; column < firstColumn + 17; column++) {
        const level = Math.floor(column / 3) + 1;
        if (level > savedState.maxCraftingLevel) continue;

        for (let row = 0; row < 4; row++) {
            const gridRow = craftingGrid[row] || [];
            const item = gridRow[column];
            if (!item) continue;
            if (!savedState.craftedItems[item.key]) {
                context.fillStyle = '#888';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2, 0, 2 * Math.PI);
                context.fill();
                context.fillStyle = 'white';
                context.fillText('?', item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2 + 1);
            } else if (item.icon) {
                context.fillStyle = '#aaa';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2, 0, 2 * Math.PI);
                context.fill();
                context.fillStyle = '#ccc';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2 - 2, 0, 2 * Math.PI);
                context.fill();
                const color = (savedState.craftedItems[item.key] & CRAFTED_UNIQUE) ? '#4af' : '#4c4';
                const tint = (savedState.craftedItems[item.key] & CRAFTED_UNIQUE) ? .7 : 0;
                drawTintedFrame(context,
                    {...item.icon, color, amount: tint},
                    {
                        x: item.craftingX + ~~((craftingSlotSize - item.icon.w * 2) / 2),
                        y: item.craftingY + ~~((craftingSlotSize - item.icon.h * 2) / 2),
                        w: item.icon.w * 2, h: item.icon.h * 2,
                    }
                );
            } else {
                context.fillStyle = '#080';
                context.fillRect(item.craftingX, item.craftingY, craftingSlotSize, craftingSlotSize);
            }
        }
    }
    context.restore();
}

function getReforgeCost(): number {
    return Math.floor(getCurrentCraftingCost() / 5);
}
function getForgeItemCost(): number {
    return Math.floor(5 * baseItemLevelCost(getState().savedState.craftingLevel));
}
function getForgeArmorCost(): number {
    return getForgeItemCost() * 2;
}
function getForgeWeaponCost(): number {
    return getForgeItemCost() * 3;
}
function getForgeAccessoryCost(): number {
    return getForgeItemCost() * 5;
}
function getCurrentCraftingCost(): number {
    switch (getState().savedState.craftingTypeFilter) {
        case 'weapon': return getForgeWeaponCost();
        case 'armor': return getForgeArmorCost();
        case 'accessory': return getForgeAccessoryCost();
        default: return getForgeItemCost();
    }
}
export function updateReforgeButton() {
    const { savedState } = getState();
    query('.js-reforge').classList.toggle('disabled', savedState.coins < getReforgeCost());
    const text = ['Offer ' + points('coins', Math.floor(getCurrentCraftingCost() / 5)) + ' to try again.', '',
        'You can type \'r\' as a shortcut for clicking this button.'].join('<br/>');
    query('.js-reforge').setAttribute('helpText', text);
}
export function updateItemsThatWillBeCrafted() {
    const { savedState } = getState();
    itemsFilteredByType = [];
    for (let itemLevel = 1; itemLevel <= savedState.craftingLevel && itemLevel < items.length; itemLevel++) {
        for (const item of (items[itemLevel] || [])) {
            if (itemMatchesFilter(item, savedState.craftingTypeFilter)) {
                itemsFilteredByType.push(item);
            }
        }
    }
    selectedCraftingWeight = 0;
    itemsFilteredByType.forEach(function (item) {
        selectedCraftingWeight += item.craftingWeight;
    });
}
const reforgeButton:HTMLElement = document.querySelector('.js-reforge');
reforgeButton.onclick = reforgeItems;
reforgeButton.onmouseover = () => previewPointsChange('coins', -getReforgeCost());
reforgeButton.onmouseout = hidePointsPreview;
export function reforgeItems() {
    if (!spend('coins', Math.floor(getCurrentCraftingCost() / 5))) {
        return;
    }
    craftingOptionsContainer.querySelectorAll('.js-itemSlot').forEach(element => {
        element.innerHTML = '';
        element.append(craftItem().domElement);
    });
    updateReforgeButton();
    saveGame();
}

function craftItem(): Item {
    let craftingRoll = Math.floor(Math.random() * selectedCraftingWeight);
    let index = 0;
    while (craftingRoll > itemsFilteredByType[index].craftingWeight) {
        craftingRoll -= itemsFilteredByType[index].craftingWeight;
        index++;
    }
    const craftedItem = itemsFilteredByType[index];
    // This is used to determine what proportion of the crafting weight goes to which item.
    let totalCraftingWeight = 0;
    itemsFilteredByType.forEach(item => {
        totalCraftingWeight += item.level * item.level * 5;
    });
    // Remove crafting weight from the crafted item and distribute it out proportionally
    // to other items that could have been crafted. This leaves the crafting weight of
    // the selected group the same while decreasing the odds of crafting the same item
    // again and increasing the odds of the highest level items the most.
    const distributedCraftingWeight = craftedItem.craftingWeight / 2;
    craftedItem.craftingWeight -= distributedCraftingWeight;
    itemsFilteredByType.forEach(item => {
        item.craftingWeight += distributedCraftingWeight * item.level * item.level * 5 / totalCraftingWeight;
    });
    updateItemsThatWillBeCrafted();
    const state = getState();
    const item = makeItem(craftedItem, state.savedState.craftingLevel);
    // Rolling a plain item has a chance to create a unique if one exists for
    // this base type.
    checkToMakeItemUnique(item);
    if (item.unique) {
        state.savedState.craftedItems[craftedItem.key] |= (state.savedState.craftedItems[craftedItem.key] || 0) | CRAFTED_UNIQUE;
    } else {
        // Always get at least 1 enchantment on lower level items.
        // This way getting low level items is less disappointing.
        if (craftedItem.level < state.savedState.craftingLevel) {
            augmentItemProper(item);
        }
        // Get up to 4 enchantments with higher chance the greater the disparity is.
        const buffChance = Math.min(.8, .1 + .05 * (state.savedState.craftingLevel - craftedItem.level));
        while (Math.random() < buffChance && item.prefixes.length + item.suffixes.length < 4){
            augmentItemProper(item);
        }
    }
    state.savedState.craftedItems[craftedItem.key] |= (state.savedState.craftedItems[craftedItem.key] || 0) | CRAFTED_NORMAL;

    updateItem(item);
    equipmentCraftingState.lastCraftedItem = craftedItem;
    updateReforgeButton();
    return item;
}

function itemMatchesFilter(item: ItemData, typeFilter: string) {
    switch (typeFilter) {
        case 'all':
            return true;
        case 'armor':
            return armorSlots.indexOf(item.slot) >= 0;
        case 'accessory':
            return item.slot == 'ring' || item.slot == 'back';
        default:
            return item.slot === typeFilter;
    }
}

function checkToShowCraftingToopTip() {
    const { overCraftingItem } = equipmentCraftingState;
    if (!overCraftingItem) {
        return;
    }
    let popup = getPopup();
    if (popup) {
        if (popup.target === overCraftingItem) return;
        else removePopup();
    }
    var sections, title;
    const state = getState();
    if (state.savedState.craftedItems[overCraftingItem.key]) {
        title = overCraftingItem.name;
        sections = [];
        if (overCraftingItem.tags) {
            sections.push(Object.keys(overCraftingItem.tags).map(tagToDisplayName).join(', '));
        }
        sections.push('Requires level ' + overCraftingItem.level);
        sections.push('');
        sections.push(bonusSourceHelpText(overCraftingItem, state.selectedCharacter.hero));
        if (state.savedState.craftedItems[overCraftingItem.key] & CRAFTED_UNIQUE) {
            sections.push(tag('div', 'uniqueText', 'Unique Variant:'
                + titleDiv(overCraftingItem.unique.displayName)
                + fixedDigits(100 * overCraftingItem.unique.chance, 1) + '% chance for unique'));
        }
    } else {
        title = '??? ' + overCraftingItem.slot;
        sections = ['Requires level ' + overCraftingItem.level, ''];
    }
    if (itemsFilteredByType.indexOf(overCraftingItem) >= 0) {
        sections.push('');
        sections.push(fixedDigits(100 * overCraftingItem.craftingWeight / selectedCraftingWeight, 1) + '% chance to obtain');
    }
    addPopup(overCraftingItem, titleDiv(title) + sections.join('<br/>'));
}

export function unlockItemLevel(level: number) {
    const { savedState } = getState();
    if (level <= savedState.maxCraftingLevel) {
        return
    }
    savedState.maxCraftingLevel = Math.min(80, level);
}
