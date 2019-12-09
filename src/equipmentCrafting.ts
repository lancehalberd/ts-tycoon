import { checkToMakeItemUnique } from 'app/content/uniques';
import { craftingCanvas, craftingContext, query, tag, tagElement, titleDiv, bodyDiv } from 'app/dom';
import { augmentItemProper } from 'app/enchanting';
import { bonusSourceHelpText } from 'app/helpText';
import { drawTintedImage, images } from 'app/images';
import {
    addToInventory, armorSlots, baseItemLevelCost, items,
    itemsBySlotAndLevel, makeItem, tagToDisplayName, updateItem
} from 'app/inventory';
import { hidePointsPreview, points, previewPointsChange, spend } from 'app/points';
import { addPopup, getPopup, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { ifdefor } from 'app/utils/index';
import { fixedDigits } from 'app/utils/formatters';
import { getMousePosition } from 'app/utils/mouse';

export const CRAFTED_NORMAL = 1;
export const CRAFTED_UNIQUE = 2;

let overCraftingItem = null;
let lastCraftedItem = null;
// Same size as icons for equipment.
const craftingSlotSize = 32;
const craftingSlotSpacing = 2;
const craftingSlotTotal = craftingSlotSize + craftingSlotSpacing;
const craftingHeaderSize = 4 + craftingSlotSize / 2 + craftingSlotSpacing;
const craftingGrid = [];
let craftingCanvasMousePosition = null;
let itemsFilteredByType = [];
let selectedCraftingWeight = 0;
export function initializeCraftingGrid() {
    craftingCanvas.width = 5 + 16 * craftingSlotTotal;
    craftingCanvas.height = craftingHeaderSize + 6 * craftingSlotTotal + 1;
    const craftingSections = [
        {'height': 2, 'slots': ['weapon']},
        {'height': 3, 'slots': ['offhand', 'head', 'body', 'arms', 'legs', 'feet']},
        {'height': 1, 'slots': ['back', 'ring']}
    ];
    const iconSources = {};
    let row = 0, column = 0;
    for (const craftingSection of craftingSections) {
        for (let i = 1; i < items.length; i++) {
            column = 2 * (i - 1);
            let subColumn = 0, subRow = 0;
            for (var slot of craftingSection.slots) {
                for (var item of ifdefor(itemsBySlotAndLevel[slot][i], [])) {
                    if (subColumn > 1) {
                        console.log(craftingSection.slots);
                        console.log(new Error("Too many items in crafting section at level " + i));
                    }
                    var x = 2 + (column + subColumn) * craftingSlotTotal;
                    var y = craftingHeaderSize + (row + subRow) * craftingSlotTotal;
                    item.craftingX = x;
                    item.craftingY = y;
                    craftingGrid[row + subRow] = ifdefor(craftingGrid[row + subRow], []);
                    craftingGrid[row + subRow][column + subColumn] = item;
                    subRow++;
                    if (subRow >= craftingSection.height) {
                        subRow = 0;
                        subColumn++;
                    }
                    // Some hacky code to read the icon from the css styles. Make a div for the item,
                    // briefly add to the page and then read the background image/position info and translate
                    // into values I can use.
                    var icon = item.icon;
                    if (!iconSources[icon]) {
                        const itemDiv:HTMLElement = tagElement('div', 'icon ' + icon);
                        document.body.appendChild(itemDiv);
                        const imageFileName = 'gfx/' + itemDiv.style.backgroundImage.split('/gfx/')[1].split('"')[0].split(')')[0];
                        if (!images[imageFileName]) {
                            console.log("Need to preload " + imageFileName + " for crafting icons.");
                            continue;
                        }
                        var image = images[imageFileName];
                        var backgroundSizeValue = itemDiv.style.backgroundSize;
                        var scale = 1;
                        if (backgroundSizeValue && backgroundSizeValue != 'initial') {
                            var sizes = backgroundSizeValue.split(' ').map(function (string) { return parseInt(string);});
                            scale = sizes[0] / image.width;
                        }
                        const offsets = itemDiv.style.backgroundPosition.split(' ').map(string => -parseInt(string));
                        // console.log([imageFile, offsets.join(',')]);
                        itemDiv.remove();
                        iconSources[icon] = {
                            image,
                            left: offsets[0] / scale,
                            top: offsets[1] / scale,
                            width: craftingSlotSize / scale,
                            height: craftingSlotSize / scale
                        };
                    }
                    item.iconSource = iconSources[icon];
                }
            }
        }
        row += craftingSection.height;
    }
    // TODO: replace with generic mouse handling?
    craftingCanvas.onmousemove = function () {
        craftingCanvasMousePosition = getMousePosition(craftingCanvas);
        updateOverCraftingItem();
        checkToShowCraftingToopTip();
    };
    // TODO: replace with generic mouse handling?
    craftingCanvas.onmousedown = function (event) {
        if (event.shiftKey && overCraftingItem) { //check if 'shift' key is held down
            addToInventory(makeItem(overCraftingItem, 1));
            return;
        }
        craftNewItems();
    };
    // TODO: replace with generic mouse handling?
    craftingCanvas.onmouseout = function () {
        overCraftingItem = null;
        if (craftingOptionsContainer.style.display !== 'none') {
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
    state.savedState.craftingLevel = Math.min(state.savedState.maxCraftingLevel, Math.floor(column / 2) + 1);
    if (row < 0) {
        state.savedState.craftingTypeFilter = 'all';
    } else if (row < 2) {
        state.savedState.craftingTypeFilter = 'weapon';
    } else if (row < 5) {
        state.savedState.craftingTypeFilter = 'armor';
    } else {
        state.savedState.craftingTypeFilter = 'accessory';
    }
    updateItemsThatWillBeCrafted();
    previewPointsChange('coins', -getCurrentCraftingCost());
    var craftingRow = ifdefor(craftingGrid[row], []);
    var item = craftingRow[column];
    if (!item || item.level > state.savedState.maxCraftingLevel) {
        overCraftingItem = null;
        return;
    }
    x -= item.craftingX;
    y -= item.craftingY;
    if (x < 0 || x > craftingSlotSize || y < 0|| y > craftingSlotSize) {
        overCraftingItem = null;
        return;
    }
    overCraftingItem = item;
}
const craftingOptionsContainer:HTMLElement = document.querySelector('.js-craftingSelectOptions');
function craftNewItems() {
    var totalCost = getCurrentCraftingCost();
    if (!spend('coins', totalCost)) {
        return;
    }
    craftingOptionsContainer.style.display = 'block';
    craftingOptionsContainer.querySelectorAll('.js-itemSlot').forEach(element => {
        const item = craftItem();
        element.append(item.domElement);
    });
    saveGame();
}
function updateCraftingCanvas() {
    const state = getState();
    if (!state.selectedCharacter) return;
    if (!craftingCanvasMousePosition) return;
    var maxX = state.savedState.maxCraftingLevel * 2 * craftingSlotTotal + 4 - craftingCanvas.width;
    var x = craftingCanvasMousePosition[0];
    var vx = 0;
    if (x < 100) vx = (x - 100) / 5;
    else if (x > craftingCanvas.width - 100) vx = (100 - (craftingCanvas.width - x)) / 5;
    if (vx) {
        state.savedState.craftingXOffset = Math.max(0, Math.min(maxX, state.savedState.craftingXOffset + vx));
        updateOverCraftingItem();
    }
}
export function drawCraftingCanvas() {
    const state = getState();
    const { savedState } = state;
    if (!state.selectedCharacter) return;
    var context = craftingContext;
    context.clearRect(0, 0, craftingCanvas.width, craftingCanvas.height);
    context.save();
    context.textBaseline = "middle";
    context.textAlign = 'center'
    context.translate(-savedState.craftingXOffset, 0);

    var firstColumn = Math.floor(savedState.craftingXOffset / craftingSlotTotal);
    for (var column = firstColumn; column < firstColumn + 17; column++) {
        if (column % 4 > 1) {
            context.fillStyle = '#ededed';
            context.fillRect(1 + column * craftingSlotTotal, 0, craftingSlotTotal, craftingCanvas.height);
        }
    }

    // Highlight the crafting items if the user has their mouse over the crafting canvas.
    if (savedState.craftingLevel && savedState.craftingTypeFilter) {
        var offset = 0;
        var rows = 6;
        switch (savedState.craftingTypeFilter) {
            case 'all':
                offset = -1;
                rows = 7;
                break;
            case 'weapon':
                rows = 2;
                break;
            case 'armor':
                offset = 2;
                rows = 3;
                break;
            case 'accessory':
                offset = 5;
                rows = 1;
                break
        }
        context.fillStyle = '#8F8';
        context.fillRect(0, craftingHeaderSize + offset * craftingSlotTotal, 4 + 2 * craftingSlotTotal * Math.min(state.selectedCharacter.adventurer.level, savedState.craftingLevel), 3 + rows * craftingSlotTotal);
        var levelsOverCurrent = savedState.craftingLevel - state.selectedCharacter.adventurer.level
        if (levelsOverCurrent > 0) {
            context.fillStyle = '#F88';
            context.fillRect(2 + 2 * craftingSlotTotal * state.selectedCharacter.adventurer.level, craftingHeaderSize + offset * craftingSlotTotal, 2 * craftingSlotTotal * levelsOverCurrent, 3 + rows * craftingSlotTotal);
        }
    }

    context.fillStyle = '#444';
    context.font = "20px sans-serif";
    for (let column = firstColumn; column < firstColumn + 17; column++) {
        const level = Math.floor(column / 2) + 1;
        context.fillText('' + level, 2 + (2 * level - 1.5) * craftingSlotTotal + craftingSlotSize / 2,  12);
    }


    context.font = (craftingSlotSize - 5) + "px sans-serif";
    for (var column = firstColumn; column < firstColumn + 17; column++) {
        var level = Math.floor(column / 2) + 1;
        if (level > savedState.maxCraftingLevel) continue;

        for (var row = 0; row < 6; row++) {
            var gridRow = ifdefor(craftingGrid[row], []);
            var item = gridRow[column];
            if (!item) continue;
            if (!savedState.craftedItems[item.key]) {
                context.fillStyle = '#888';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2, 0, 2 * Math.PI);
                context.fill();
                context.fillStyle = 'white';
                context.fillText('?', item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2 + 1);
            } else if (item.iconSource) {
                context.fillStyle = '#aaa';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2, 0, 2 * Math.PI);
                context.fill();
                context.fillStyle = '#ccc';
                context.beginPath();
                context.arc(item.craftingX + craftingSlotSize / 2, item.craftingY + craftingSlotSize / 2, craftingSlotSize / 2 - 2, 0, 2 * Math.PI);
                context.fill();
                var color = (savedState.craftedItems[item.key] & CRAFTED_UNIQUE) ? '#4af' : '#4c4';
                var tint = (savedState.craftedItems[item.key] & CRAFTED_UNIQUE) ? .7 : 0;
                drawTintedImage(context, item.iconSource.image, color, tint,
                            item.iconSource,
                            {'left': item.craftingX, 'top': item.craftingY, 'width': craftingSlotSize, 'height': craftingSlotSize});
                //context.drawImage(item.iconSource.image, item.iconSource.left, item.iconSource.top, item.iconSource.width, item.iconSource.height,
                 //               item.craftingX, item.craftingY, craftingSlotSize, craftingSlotSize);
            } else {
                context.fillStyle = '#080';
                context.fillRect(item.craftingX, item.craftingY, craftingSlotSize, craftingSlotSize);
            }
        }
    }
    context.restore();
}

function getReforgeCost() {
    return Math.floor(getCurrentCraftingCost() / 5);
}
function getForgeItemCost() {
    return Math.floor(5 * baseItemLevelCost(getState().savedState.craftingLevel));
}
function getForgeArmorCost() {
    return getForgeItemCost() * 2;
}
function getForgeWeaponCost() {
    return getForgeItemCost() * 3;
}
function getForgeAccessoryCost() {
    return getForgeItemCost() * 5;
}
function getCurrentCraftingCost() {
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
    query('.js-reforge').setAttribute('helptext', text);
}
function updateItemsThatWillBeCrafted() {
    const { savedState } = getState();
    itemsFilteredByType = [];
    for (var itemLevel = 1; itemLevel <= savedState.craftingLevel && itemLevel < items.length; itemLevel++) {
        for (var item of ifdefor(items[itemLevel], [])) {
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
function reforgeItems() {
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

function craftItem() {
    var craftingRoll = Math.floor(Math.random() * selectedCraftingWeight);
    var index = 0;
    while (craftingRoll > itemsFilteredByType[index].craftingWeight) {
        craftingRoll -= itemsFilteredByType[index].craftingWeight;
        index++;
    }
    var craftedItem = itemsFilteredByType[index];
    // This is used to determine what proportion of the crafting weight goes to which item.
    var totalCraftingWeight = 0;
    itemsFilteredByType.forEach(function (item) {
        totalCraftingWeight += item.level * item.level * 5;
    });
    // Remove crafting weight from the crafted item and distribute it out proportionally
    // to other items that could have been crafted. This leaves the crafting weight of
    // the selected group the same while decreasing the odds of crafting the same item
    // again and increasing the odds of the highest level items the most.
    var distributedCraftingWeight = craftedItem.craftingWeight / 2;
    craftedItem.craftingWeight -= distributedCraftingWeight;
    itemsFilteredByType.forEach(function (item) {
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
        var buffChance = Math.min(.8, .1 + .05 * (state.savedState.craftingLevel - craftedItem.level));
        while (Math.random() < buffChance && item.prefixes.length + item.suffixes.length < 4){
            augmentItemProper(item);
        }
    }
    state.savedState.craftedItems[craftedItem.key] |= (state.savedState.craftedItems[craftedItem.key] || 0) | CRAFTED_NORMAL;

    updateItem(item);
    lastCraftedItem = craftedItem;
    updateReforgeButton();
    return item;
}

function itemMatchesFilter(item, typeFilter) {
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
        sections.push(bonusSourceHelpText(overCraftingItem, state.selectedCharacter.adventurer));
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

export function unlockItemLevel(level) {
    const { savedState } = getState();
    if (level <= savedState.maxCraftingLevel) {
        return
    }
    savedState.maxCraftingLevel = Math.min(80, level);
}
