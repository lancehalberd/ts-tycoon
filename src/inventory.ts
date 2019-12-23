import { addBonusSourceToObject, removeBonusSourceFromObject, updateTags } from 'app/bonuses';
import {
    addActions, recomputeActorTags, refreshStatsPanel, removeActions, updateAdventurerGraphics
} from 'app/character';
import { editingMapState } from 'app/development/editLevel';
import { getElementIndex, handleChildEvent, mouseContainer, query, queryAll, tag, tagElement } from 'app/dom';
import { updateEnchantmentOptions } from 'app/enchanting';
import { equipmentSlots } from 'app/gameConstants';
import { getItemHelpText } from 'app/helpText';
import { jewelInventoryState, stopJewelDrag } from 'app/jewelInventory';
import { gain } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { properCase } from 'app/utils/formatters';
import { collision, getCollisionArea, ifdefor } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

import { Actor, EquipmentSlot, Item, ItemData } from 'app/types';

// Div containing items
const inventoryElement = query('.js-inventory');
// Slot we display in the inventory when no items are present.
const inventorySlot = query('.js-inventorySlot');

interface InventoryState {
    dragHelper: HTMLElement,
    dragHelperSource: HTMLElement,
    dragItem: Item,
    dragged: boolean,
}
export const inventoryState: InventoryState = {
    dragHelper: null,
    dragHelperSource: null,
    dragItem: null,
    dragged: false,
};

export function equipItemProper(actor: Actor, item: Item, update) {
    //console.log("equip " + item.base.slot);
    if (actor.equipment[item.base.slot]) {
        console.log("Tried to equip an item without first unequiping!");
        return;
    }
    if (item.base.slot === 'offhand' && isTwoHandedWeapon(actor.equipment.weapon) && !ifdefor(actor.stats.twoToOneHanded)) {
        console.log("Tried to equip an offhand while wielding a two handed weapon!");
        return;
    }
    item.domElement.remove();
    const gameState = getState();
    if (actor.character === gameState.selectedCharacter) {
        query('.js-equipment .js-' + item.base.slot).appendChild(item.domElement);
        query('.js-equipment .js-' + item.base.slot + ' .js-placeholder').style.display = 'none';
    }
    item.actor = actor;
    actor.equipment[item.base.slot] = item;
    addActions(actor, item.base);
    addBonusSourceToObject(actor.variableObject, item.base, false);
    item.prefixes.forEach(function (affix) {
        addActions(actor, affix);
        addBonusSourceToObject(actor.variableObject, affix, false);
    })
    item.suffixes.forEach(function (affix) {
        addActions(actor, affix);
        addBonusSourceToObject(actor.variableObject, affix, false);
    })
    if (update) {
        updateTags(actor.variableObject, recomputeActorTags(actor), true);
        if (actor.character === getState().selectedCharacter) {
            refreshStatsPanel(actor.character, query('.js-characterColumn .js-stats'));
        }
        updateAdventurerGraphics(actor);
        updateOffhandDisplay();
        unequipRestrictedGear();
        updateEquipableItems();
    }
}
function unequipSlot(actor: Actor, slotKey: EquipmentSlot, update: boolean = false) {
    //console.log(new Error("unequip " + slotKey));
    if (actor.equipment[slotKey]) {
        const item = actor.equipment[slotKey];
        item.domElement.remove();
        item.actor = null;
        actor.equipment[slotKey] = null;
        removeActions(actor, item.base);
        removeBonusSourceFromObject(actor.variableObject, item.base, false);
        item.prefixes.forEach(function (affix) {
            removeActions(actor, affix);
            removeBonusSourceFromObject(actor.variableObject, affix, false);
        })
        item.suffixes.forEach(function (affix) {
            removeActions(actor, affix);
            removeBonusSourceFromObject(actor.variableObject, affix, false);
        })
        if (update) {
            updateTags(actor.variableObject, recomputeActorTags(actor), true);
            if (getState().selectedCharacter === actor.character) {
                refreshStatsPanel(actor.character, query('.js-characterColumn .js-stats'));
                query('.js-equipment .js-' + slotKey + ' .js-placeholder').style.display = '';
            }
            updateAdventurerGraphics(actor);
            updateOffhandDisplay();
            unequipRestrictedGear();
            updateEquipableItems();
        }
    }
}
function unequipRestrictedGear() {
    const actor = getState().selectedCharacter.hero;
    for (const item of Object.values(actor.equipment)) {
        if (!item) continue;
        if (!canEquipItem(actor, item)) {
            unequipSlot(actor, item.base.slot, true);
            addToInventory(item);
            // This method will get called again as a consequence of unequiping
            // the invalid item, so we don't need to do any further processing
            // in this call.
            break;
        }
    }
}
export function updateOffhandDisplay() {
    var adventurer = getState().selectedCharacter.adventurer;
    // Don't show the offhand slot if equipped with a two handed weapon unless they have a special ability to allow off hand with two handed weapons.
    query('.js-offhand').style.display = !isTwoHandedWeapon(adventurer.equipment.weapon) || adventurer.stats.twoToOneHanded ?
        '' : 'none';
}
export function isTwoHandedWeapon(item: Item) {
    return item && item.base.tags['twoHanded'];
}
export function sellValue(item: Item) {
    return Math.floor(4 * baseItemLevelCost(item.itemLevel));
}
export function baseItemLevelCost(itemLevel) {
    return itemLevel * itemLevel * Math.pow(1.15, itemLevel);
}
export function makeItem(base: ItemData, level: number): Item {
    const state = getState();
    var item = {
        base,
        'prefixes': [],
        'suffixes': [],
        // level is used to represent the required level, itemLevel is used
        // to calculate available enchantments and sell value.
        'itemLevel': level,
        'unique': false,
        domElement: tagElement('div', 'js-item item', tag('div', 'icon ' + base.icon) + tag('div', 'itemLevel', base.level))
    };
    updateItem(item);
    item.domElement.setAttribute('helptext', '-');
    if (state.selectedCharacter) {
        item.domElement.classList.toggle('equipable', canEquipItem(state.selectedCharacter.adventurer, item));
    }
    return item;
}
export function getItemForElement(itemElement: HTMLElement): Item {
    for (const item of getState().items) {
        if (item.domElement === itemElement) {
            return item;
        }
    }
}
export function updateEquipableItems() {
    const state = getState();
    for (const item of getState().items) {
        item.domElement.classList.toggle('equipable', canEquipItem(state.selectedCharacter.adventurer, item));
    }
}
export function updateItem(item: Item) {
    var levelRequirement = item.base.level;
    item.prefixes.concat(item.suffixes).forEach(function (affix) {
        levelRequirement = Math.max(levelRequirement, affix.base.level);
    });
    item.requiredLevel = levelRequirement;
    item.domElement.classList.remove('imbued', 'enchanted', 'unique');
    var enchantments = item.prefixes.length + item.suffixes.length;
    if (item.unique) {
        item.domElement.classList.add('unique');
    } else if (enchantments > 2) {
        item.domElement.classList.add('imbued');
    } else if (enchantments) {
        item.domElement.classList.add('enchanted');
    }
}
export function addToInventory(item: Item) {
    item.domElement.remove();
    inventorySlot.before(item.domElement);
    inventorySlot.style.display = 'none';
}
const tagToDisplayNameMap = {
    'twoHanded': '2-handed',
    'oneHanded': '1-handed',
    'ranged': 'Ranged',
    'melee': 'Melee',
    'magic': 'Magic',
    'throwing': 'Throwing',
    'skill': 'Skills'
};
export function tagToDisplayName(tag: string) {
    return tagToDisplayNameMap[tag] || properCase(tag);
}
export function sellItem(item: Item) {
    /* TODO: if dragging an item, only sell the item if it matches the item being dragged.
    if (inventoryState.dragHelper && (!inventoryState.dragHelper.data('$source').data('item') !== item)) {
        return;
    }*/
    if (item.actor) {
        unequipSlot(item.actor, item.base.slot, true);
    }
    gain('coins', sellValue(item));
    destroyItem(item);
    var total = item.prefixes.length + item.suffixes.length;
    if (total) {
        var animaValue = item.base.level * item.base.level * item.base.level;
        if (total <= 2) gain('anima', animaValue * total);
        else gain('anima', animaValue * total);
    }
    saveGame();
}
function destroyItem(item: Item) {
    if (inventoryState.dragHelper) {
        inventoryState.dragHelper.remove();
        inventoryState.dragHelper = null;
        removeItemSlotDragHintClasses();
    }
    item.domElement.remove();
    item.domElement = null;
    updateEnchantmentOptions();
}

function removeItemSlotDragHintClasses() {
    for (const element of queryAll('.js-itemSlot.active')) {
        element.classList.remove('active');
    }
    for (const element of queryAll('.js-itemSlot.invalid')) {
        element.classList.remove('invalid');
    }
}

document.body.addEventListener('mouseup', function (event) {
    if (inventoryState.dragged) {
        stopDrag();
    }
    if (jewelInventoryState.overVertex || inventoryState.dragged) {
        stopJewelDrag();
    }
    inventoryState.dragged = false;
});
handleChildEvent('mousedown', document.body, '.js-item', function (itemElement: HTMLElement, event) {
    const specialClick = event.ctrlKey || event.metaKey;
    const { selectedCharacter } = getState();
    if (event.which != 1) return; // Handle only left click.
    if (inventoryState.dragHelper) {
        stopDrag();
        return;
    }
    const item = getItemForElement(itemElement)
    if (specialClick) {
        if (item.actor) {
            unequipSlot(item.actor, item.base.slot, true);
            addToInventory(item);
        } else {
            equipItem(selectedCharacter.hero, item);
        }
        checkIfCraftedItemWasClaimed();
        return;
    }
    inventoryState.dragHelper = itemElement.cloneNode() as HTMLElement;
    inventoryState.dragHelperSource = itemElement;
    inventoryState.dragItem = item;
    itemElement.style.opacity = '0.3';
    inventoryState.dragHelper.style.position = 'absolute';
    mouseContainer.appendChild(inventoryState.dragHelper);

    if (!areAnyCraftedItemsVisible()) {
        query('.js-enchantmentOptions').style.display = '';
        query('.js-craftingOptions').style.display = 'none';
        query('.js-craftingSelectOptions').style.display = 'none';
        updateEnchantmentOptions();
    }
    updateDragHelper();
    inventoryState.dragged = false;
    if (item.actor) unequipSlot(item.actor, item.base.slot, true);
    query('.js-equipment .js-' + item.base.slot).classList.add(!canEquipItem(selectedCharacter.hero, item) ? 'invalid' : 'active');
    query('.js-enchantmentSlot').classList.add('active');
    query('.js-inventorySlot').classList.add('active');
});

// This will be true if the player is in the middle of claiming crafted items.
export function areAnyCraftedItemsVisible() {
    const craftingSlots = [...queryAll('.js-craftingSelectOptions .js-itemSlot')];
    return craftingSlots.some(e => e.style.display !== 'none');
}

function canEquipItem(actor: Actor, item: Item): boolean {
    if (item.requiredLevel > actor.level) {
        return false;
    }
    if (item.base.slot === 'offhand' && isTwoHandedWeapon(actor.equipment.weapon) && !actor.stats.twoToOneHanded) {
        return false;
    }
    for (const requiredTag of (item.base.restrictions || [])) {
        if (!actor.variableObject.tags[requiredTag]) {
            return false;
        }
    }
    return true;
}

export function updateDragHelper() {
    if (!inventoryState.dragHelper) {
        return;
    }
    const [x, y] = getMousePosition();
    const { dragHelper } = inventoryState;
    dragHelper.style.left = (x - dragHelper.offsetWidth / 2) + 'px';
    dragHelper.style.top = (y - dragHelper.offsetHeight / 2) + 'px';
    inventoryState.dragged = true;
}

document.addEventListener('mousemove', function (event) {
    updateDragHelper();
});
export function stopDrag() {
    applyDragResults();
    checkIfCraftedItemWasClaimed();
    stopInventoryDrag();
}
function checkIfCraftedItemWasClaimed() {
    const { savedState } = getState();
    // Check if the player has claimed an item from the craftingSelectOptions
    if (!areAnyCraftedItemsVisible()) return;
    if (queryAll('.js-craftingSelectOptions .js-itemSlot').length > queryAll('.js-craftingSelectOptions .js-itemSlot .js-item').length) {
        for (const craftingSlot of queryAll('.js-craftingSelectOptions .js-itemSlot')) {
            craftingSlot.innerHTML = '';
        }
        query('.js-craftingSelectOptions').style.display = 'none';
        savedState.craftingLevel = null;
        savedState.craftingTypeFilter = null;
        saveGame();
    }
}
export function equipItem(actor, item) {
    if (!canEquipItem(actor, item)) return false;
    // Unequip anything that might be currently equipped in the target character.
    var currentMain = actor.equipment[item.base.slot];
    unequipSlot(actor, item.base.slot, false);
    if (currentMain) addToInventory(currentMain);
    // Now equip the item on the target character and update stats so we can
    // tell if they can still equip an offhand.
    equipItemProper(actor, item, true);
    // Unequip the offhand if the equipping character can no longer hold an offhand.
    if (isTwoHandedWeapon(item) && !ifdefor(actor.twoToOneHanded)) {
        var currentSub = actor.equipment.offhand;
        unequipSlot(actor, 'offhand', true);
        if (currentSub) addToInventory(currentSub);
    }
    return true;
}
const sellItemButton = query('.js-sellItem');
const enchantmentSlot = query('.js-enchantmentSlot');
function applyDragResults() {
    if (!inventoryState.dragHelper) {
        return;
    }
    const source = inventoryState.dragHelperSource;
    // If this doesn't have item data, it must be a jewel.
    if (!source) {
        stopJewelDrag();
        return;
    }
    const item = inventoryState.dragItem;
    if (sellItemButton.style.display !== 'none' && collision(inventoryState.dragHelper, sellItemButton)) {
        sellItem(item);
        return;
    }
    if (collision(inventoryState.dragHelper, enchantmentSlot)) {
        const otherItemElement = enchantmentSlot.querySelector('.js-item') as HTMLElement;
        // If there is an item already in the enchantment slot, place it
        // back in the inventory.
        if (otherItemElement) {
            addToInventory(getItemForElement(otherItemElement));
        }
        enchantmentSlot.append(source);
        return;
    }
    let hit = false;
    for (const slotElement of queryAll('.js-equipment .js-' + item.base.slot)) {
        if (!collision(inventoryState.dragHelper, slotElement)) return true;
        hit = true;
        equipItem(getState().selectedCharacter.adventurer, item)
        return false;
    }
    if (hit) return;
    let targetElement: HTMLElement = null;
    let largestCollision = 0;
    for (const itemElement of queryAll('.js-inventory .js-item')) {
        const collisionArea = getCollisionArea(inventoryState.dragHelper, itemElement);
        if (collisionArea > largestCollision) {
            targetElement = itemElement;
            largestCollision = collisionArea;
        }
    }
    // Not need to do anything if the item was dropped where it started.
    if (targetElement && targetElement === source) return;
    if (targetElement) {
        // If an item is already in the inventory and it is before the item we are dropping
        // it onto, place it after, not before that item because that item will move
        // back one slot when the current item is removed, so the slot the player is hovering
        // over will be after that item.
        // Normally we want to place an item before the item they are hovering over since
        // that is what will move the hovered item into that slot.
        if (source.closest('.js-inventory') &&
            getElementIndex(targetElement) > getElementIndex(source)
        ) {
            source.remove();
            targetElement.after(source);
        } else {
            source.remove();
            targetElement.before(source);
        }
        return;
    }
    // By default, if no other action is taken, we place the item at the end of the inventory.
    addToInventory(item);
}
function stopInventoryDrag() {
    if (inventoryState.dragHelper) {
        inventoryState.dragHelperSource.style.opacity = '1';
        inventoryState.dragHelper.remove();
        inventoryState.dragHelper = null;
        updateEnchantmentOptions();
    }
    removeItemSlotDragHintClasses();
}
