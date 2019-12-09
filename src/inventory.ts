import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { addActions, recomputeActorTags } from 'app/character';
import { editingMapState } from 'app/development/editLevel';
import { query, tag, tagElement } from 'app/dom';
import { getItemHelpText } from 'app/helpText';
import { jewelInventoryState } from 'app/jewelInventory';
import { gain } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { ifdefor } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import { EquipmentSlot, ItemData, RawItemData, } from 'app/utils/types';

export const armorSlots = ['body', 'feet', 'head', 'offhand', 'arms', 'legs'];
export const smallArmorSlots = ['feet', 'head', 'offhand', 'arms', 'legs'];
export const equipmentSlots = ['weapon', 'body', 'feet', 'head', 'offhand', 'arms', 'legs', 'back', 'ring'];
export const accessorySlots = ['back', 'ring'];
// const nonWeapons = ['body', 'feet', 'head', 'offhand', 'arms', 'legs', 'back', 'ring'];
export const items = [[]];
export const itemsByKey: {[key: string]: any} = {};
export const itemsBySlotAndLevel = {};
equipmentSlots.forEach(function (slot) {
    itemsBySlotAndLevel[slot] = [];
});

export function equipItemProper(actor, item, update) {
    //console.log("equip " + item.base.slot);
    if (actor.equipment[item.base.slot]) {
        console.log("Tried to equip an item without first unequiping!");
        return;
    }
    if (item.base.slot === 'offhand' && isTwoHandedWeapon(actor.equipment.weapon) && !ifdefor(actor.twoToOneHanded)) {
        console.log("Tried to equip an offhand while wielding a two handed weapon!");
        return;
    }
    item.domElement.detach();
    const gameState = getState();
    if (actor.character === gameState.selectedCharacter) {
        query('.js-equipment .js-' + item.base.slot).appendChild(item.domElement);
        query('.js-equipment .js-' + item.base.slot + ' .js-placeholder').style.display = 'none';
    }
    item.actor = actor;
    actor.equipment[item.base.slot] = item;
    addActions(actor, item.base);
    addBonusSourceToObject(actor, item.base, false);
    item.prefixes.forEach(function (affix) {
        addActions(actor, affix);
        addBonusSourceToObject(actor, affix, false);
    })
    item.suffixes.forEach(function (affix) {
        addActions(actor, affix);
        addBonusSourceToObject(actor, affix, false);
    })
    if (update) {
        updateTags(actor, recomputeActorTags(actor), true);
        if (actor.character === state.selectedCharacter) {
            refreshStatsPanel(actor.character, $('.js-characterColumn .js-stats'));
        }
        updateAdventurerGraphics(actor);
        updateOffhandDisplay();
        unequipRestrictedGear();
        updateEquipableItems();
    }
}
function unequipSlot(actor, slotKey, update) {
    //console.log(new Error("unequip " + slotKey));
    if (actor.equipment[slotKey]) {
        var item = actor.equipment[slotKey];
        item.domElement.detach();
        item.actor = null;
        actor.equipment[slotKey] = null;
        removeActions(actor, item.base);
        removeBonusSourceFromObject(actor, item.base, false);
        item.prefixes.forEach(function (affix) {
            removeActions(actor, affix);
            removeBonusSourceFromObject(actor, affix, false);
        })
        item.suffixes.forEach(function (affix) {
            removeActions(actor, affix);
            removeBonusSourceFromObject(actor, affix, false);
        })
        if (update) {
            updateTags(actor, recomputeActorTags(actor), true);
            if (state.selectedCharacter === actor.character) {
                refreshStatsPanel(actor.character, $('.js-characterColumn .js-stats'));
                $('.js-equipment .js-' + slotKey + ' .js-placeholder').show();
            }
            updateAdventurerGraphics(actor);
            updateOffhandDisplay();
            unequipRestrictedGear();
            updateEquipableItems();
        }
    }
}
function unequipRestrictedGear() {
    var actor = state.selectedCharacter.adventurer;
    for (var slotKey in actor.equipment) {
        var item = actor.equipment[slotKey];
        if (!item) continue;
        if (!canEquipItem(actor, item)) {
            unequipSlot(actor, slotKey, true);
            addToInventory(item);
            // This method will get called again as a consequence of unequiping
            // the invalid item, so we don't need to do any further processing
            // in this call.
            break;
        }
    }
}
export function updateOffhandDisplay() {
    var adventurer = state.selectedCharacter.adventurer;
    // Don't show the offhand slot if equipped with a two handed weapon unless they have a special ability to allow off hand with two handed weapons.
    query('.js-offhand').toggle(!isTwoHandedWeapon(adventurer.equipment.weapon) || !!ifdefor(adventurer.twoToOneHanded));
}
export function isTwoHandedWeapon(item) {
    return item && item.base.tags['twoHanded'];
}
export function sellValue(item) {
    return Math.floor(4 * baseItemLevelCost(item.itemLevel));
}
export function baseItemLevelCost(itemLevel) {
    return itemLevel * itemLevel * Math.pow(1.15, itemLevel);
}
export function makeItem(base, level) {
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
    item.domElement.data('item', item);
    item.domElement.setAttribute('helptext', '-');
    item.domElement.data('helpMethod', getItemHelpText);
    if (state.selectedCharacter) {
        item.domElement.toggleClass('equipable', canEquipItem(state.selectedCharacter.adventurer, item));
    }
    return item;
}
export function updateEquipableItems() {
    $('.js-item').each(function () {
        var item = $(this).data('item');
        $(this).toggleClass('equipable', canEquipItem(state.selectedCharacter.adventurer, item));
    })
}
export function updateItem(item) {
    var levelRequirement = item.base.level;
    item.prefixes.concat(item.suffixes).forEach(function (affix) {
        levelRequirement = Math.max(levelRequirement, affix.base.level);
    });
    item.level = levelRequirement;
    item.domElement.removeClass('imbued').removeClass('enchanted').removeClass('unique');
    var enchantments = item.prefixes.length + item.suffixes.length;
    if (item.unique) {
        item.domElement.addClass('unique');
    } else if (enchantments > 2) {
        item.domElement.addClass('imbued');
    } else if (enchantments) {
        item.domElement.addClass('enchanted');
    }
}
export function addToInventory(item) {
    item.domElement.detach();
    $('.js-inventorySlot').before(item.domElement);
    $('.js-inventorySlot').hide();
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
export function tagToDisplayName(tag) {
    return ifdefor(tagToDisplayNameMap[tag], properCase(tag));
}
function sellItem(item) {
    if (inventoryState.dragHelper && (!inventoryState.dragHelper.data('$source') || inventoryState.dragHelper.data('$source').data('item') !== item)) {
        return;
    }
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
function destroyItem(item) {
    if (inventoryState.dragHelper) {
        var $source = inventoryState.dragHelper.data('$source');
        if ($source && $source.data('item') === item) {
            $source.data('item', null);
            inventoryState.dragHelper.data('$source', null);
            inventoryState.dragHelper.remove();
            inventoryState.dragHelper = null;
            $('.js-itemSlot.active').removeClass('active');
            $('.js-itemSlot.invalid').removeClass('invalid');
        }
    }
    item.domElement.data('item', null);
    item.domElement.remove();
    item.domElement = null;
    updateEnchantmentOptions();
}
export const inventoryState = {
    dragHelper: null,
    dragged: false,
};

$('body').on('mouseup', function (event) {
    if (inventoryState.dragged) {
        stopDrag();
    }
    if (jewelInventoryState.overVertex || inventoryState.dragged) {
        stopJewelDrag();
    }
    inventoryState.dragged = false;
});
$('body').on('mousedown', '.js-item', function (event) {
    var specialClick = event.ctrlKey || event.metaKey;
    if (event.which != 1) return; // Handle only left click.
    if (inventoryState.dragHelper) {
        stopDrag();
        return;
    }
    var item = $(this).data('item');
    if (specialClick) {
        if (item.actor) {
            unequipSlot(item.actor, item.base.slot, true);
            addToInventory(item);
        } else {
            equipItem(state.selectedCharacter.hero, item);
        }
        checkIfCraftedItemWasClaimed();
        return;
    }
    inventoryState.dragHelper = $(this).clone();
    inventoryState.dragHelper.data('item', item);
    inventoryState.dragHelper.data('helpMethod', $(this).data('helpMethod'));
    inventoryState.dragHelper.data('$source', $(this));
    $(this).css('opacity', '.3');
    inventoryState.dragHelper.css('position', 'absolute');
    $('.js-mouseContainer').append(inventoryState.dragHelper);
    if (!$('.js-craftingSelectOptions .js-itemSlot:visible').length) {
        $('.js-enchantmentOptions').show();
        $('.js-craftingOptions').hide();
        $('.js-craftingSelectOptions').hide();
        updateEnchantmentOptions();
    }
    updateDragHelper();
    inventoryState.dragged = false;
    var item = $(this).data('item');
    if (item.actor) unequipSlot(item.actor, item.base.slot, true);
    $('.js-equipment .js-' + item.base.slot).addClass(!canEquipItem(state.selectedCharacter.adventurer, item) ? 'invalid' : 'active');
    $('.js-enchantmentSlot').addClass('active');
    $('.js-inventorySlot').addClass('active');
});

function canEquipItem(actor, item) {
    if (item.level > actor.level) {
        return false;
    }
    if (item.base.slot === 'offhand' && isTwoHandedWeapon(actor.equipment.weapon) && !ifdefor(actor.twoToOneHanded)) {
        return false;
    }
    for (var requiredTag of ifdefor(item.base.restrictions, [])) {
        if (!actor.tags[requiredTag]) {
            return false;
        }
    }
    return true;
}

function updateDragHelper() {
    if (!inventoryState.dragHelper) {
        return;
    }
    const mousePosition = getMousePosition();
    inventoryState.dragHelper.css('left', (mousePosition[0] - inventoryState.dragHelper.width() / 2) + 'px');
    inventoryState.dragHelper.css('top', (mousePosition[1] - inventoryState.dragHelper.height() / 2) + 'px');
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
    // Check if the player has claimed an item from the craftingSelectOptions
    if (!$('.js-craftingSelectOptions:visible').length) return;
    if ($('.js-craftingSelectOptions .js-itemSlot').length > $('.js-craftingSelectOptions .js-itemSlot .js-item').length) {
        $('.js-craftingSelectOptions .js-itemSlot').empty();
        $('.js-craftingSelectOptions').hide();
        state.craftingLevel = null;
        state.craftingTypeFilter = null;
        saveGame();
    }
}
function equipItem(actor, item) {
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
function applyDragResults() {
    if (!inventoryState.dragHelper) {
        return;
    }
    var $source = inventoryState.dragHelper.data('$source');
    // If this doesn't have item data, it must be a jewel.
    if (!$source) {
        stopJewelDrag();
        return;
    }
    var item = $source.data('item');
    if (collision(inventoryState.dragHelper, $('.js-sellItem:visible'))) {
        sellItem(item);
        return;
    }
    if (collision(inventoryState.dragHelper, $('.js-enchantmentSlot'))) {
        var $otherItem = $('.js-enchantmentSlot').find('.js-item');
        // If there is an item already in the enchantment slot, place it
        // back in the inventory.
        if ($otherItem.length) {
            addToInventory($otherItem.data('item'));
        }
        $('.js-enchantmentSlot').append($source);
        return;
    }
    var hit = false;
    $('.js-equipment .js-' + item.base.slot).each(function (index, element) {
        if (!collision(inventoryState.dragHelper, $(element))) return true;
        hit = true;
        equipItem(state.selectedCharacter.adventurer, item)
        return false;
    });
    if (hit) return;
    var $target = null;
    var largestCollision = 0;
    $('.js-inventory .js-item').each(function (index, element) {
        var $element = $(element);
        var collisionArea = getCollisionArea(inventoryState.dragHelper, $element);
        if (collisionArea > largestCollision) {
            $target = $element;
            largestCollision = collisionArea;
        }
    });
    // Not need to do anything if the item was dropped where it started.
    if ($target && $target.is($source)) return;
    if ($target) {
        // If an item is already in the inventory and it is before the item we are dropping
        // it onto, place it after, not before that item because that item will move
        // back one slot when the current item is removed, so the slot the player is hovering
        // over will be after that item.
        // Normally we want to place an item before the item they are hovering over since
        // that is what will move the hovered item into that slot.
        if ($source.closest('.js-inventory').length && $target.index() > $source.index()) {
            $target.after($source.detach());
        } else {
            $target.before($source.detach());
        }
        return;
    }
    // By default, if no other action is taken, we place the item at the end of the inventory.
    addToInventory(item);
}
function stopInventoryDrag() {
    if (inventoryState.dragHelper) {
        inventoryState.dragHelper.data('$source').css('opacity', '1');
        inventoryState.dragHelper.remove();
        inventoryState.dragHelper = null;
        updateEnchantmentOptions();
    }
    $('.js-itemSlot.active').removeClass('active');
    $('.js-itemSlot.invalid').removeClass('invalid');
}

export function addItem(level: number, rawData: RawItemData) {
    const key = rawData.name.replace(/\s*/g, '').toLowerCase();
    const tags = rawData.tags || [];
    const data: Partial<ItemData> = {
        ...rawData,
        key,
        tags: {},
    };
    for (const tag of tags) {
        data.tags[tag] = true;
    }
    // Assume weapons are one handed melee if not specified
    if (data.slot === 'weapon') {
        if (!data.tags['ranged']) data.tags['melee'] = true;
        if (!data.tags['twoHanded']) data.tags['oneHanded'] = true;
        if (!data.tags['magic']) data.tags['physical'] = true;
    }
    data.tags[data.slot] = true;
    data.tags[data.type] = true;
    items[level] = ifdefor(items[level], []);
    itemsBySlotAndLevel[data.slot][level] = ifdefor(itemsBySlotAndLevel[data.slot][level], []);
    data.level = level;
    data.craftingWeight = 5 * level * level;
    data.crafted = false;
    data.hasImplicitBonuses = true;
    items[level].push(data);
    itemsBySlotAndLevel[data.slot][level].push(data);
    itemsByKey[key] = data;
}

$(document).on('keydown', function(event) {
    if (event.which == 82 && !inventoryState.dragHelper && !(event.metaKey || event.ctrlKey)) { // 'r' without ctrl/cmd while not dragging an item.
        // If they are looking at the item screen and the reforge option is available.
        if (state.selectedCharacter.context === 'item' && $('.js-craftingSelectOptions:visible').length) {
            reforgeItems();
            return;
        }
    }
    if (event.which == 83) { // 's'
        if (jewelInventoryState.overJewel) {
            sellJewel(jewelInventoryState.overJewel);
            jewelInventoryState.overJewel = null;
            return;
        }
        if (isMouseOver($('.js-inventory'))) {
            $('.js-inventory .js-item').each(function (index) {
                if (isMouseOver($(this))) {
                    var item = $(this).data('item');
                    sellItem(item);
                    return false;
                }
                return true;
            });
        }
    }
    if (isEditingAllowed() && !editingMapState.editingLevel && event.which == 68 && event.shiftKey) { // 'd'
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
    }
    if (event.which == 69) { // 'e'
        if (!$popupTarget || $popupTarget.closest('.js-inventory').length === 0) {
            return;
        }
        var actor = state.selectedCharacter.adventurer;
        var item = $popupTarget.data('item');
        if (item) equipItem(actor, item);
        return;
    }
    if (isEditingAllowed() && event.which == 76) { // 'l'
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
            $('.js-inventorySlot').hide();
            lastCraftedItem = overCraftingItem;
        }
    }
    //console.log(event.which);
});
