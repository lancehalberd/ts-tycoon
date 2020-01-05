import { prefixes, suffixes } from 'app/content/enchantments';
import { query, queryAll } from 'app/dom';
import {
    getItemForElement, inventoryState, sellValue, updateItem,
} from 'app/inventory';
import { hidePointsPreview, points, previewPointsChange, spend } from 'app/points';
import { removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import Random from 'app/utils/Random';

import { Affix, AffixData, EquipmentAffix, EquipmentAffixData, Item, ItemData} from 'app/types';

export function makeAffix(baseAffix: EquipmentAffixData): EquipmentAffix {
    const affix: EquipmentAffix = {
        base: baseAffix,
        bonuses: {}
    };
    for (const key in baseAffix.bonuses) {
        const value = baseAffix.bonuses[key];
        if (Array.isArray(value)) {
            affix.bonuses[key] = Random.range(value[0], value[1]) / (value[2] || 1);
        } else {
            affix.bonuses[key] = value;
        }
    }
    return affix;
}
function addPrefixToItem(item: Item) {
    const alreadyUsedBonusesKeys = {};
    item.prefixes.forEach(function (affix) {alreadyUsedBonusesKeys[affix.base.bonusesKey] = true;});
    const possibleAffixes = matchingAffixes(prefixes, item, alreadyUsedBonusesKeys);
    if (possibleAffixes.length === 0) {
        console.log('No prefixes available for this item:');
        console.log(item);
        return;
    }
    const newAffix = makeAffix(Random.element(possibleAffixes));
    item.prefixes.push(newAffix);
}
function addSuffixToItem(item) {
    const alreadyUsedBonusesKeys = {};
    item.suffixes.forEach(function (affix) {alreadyUsedBonusesKeys[affix.base.bonusesKey] = true;});
    const possibleAffixes = matchingAffixes(suffixes, item, alreadyUsedBonusesKeys);
    if (possibleAffixes.length === 0) {
        console.log('No suffixes available for this item:');
        console.log(item);
        return;
    }
    const newAffix = makeAffix(Random.element(possibleAffixes));
    item.suffixes.push(newAffix);
}
function matchingAffixes(list, item, alreadyUsedBonusesKeys) {
    const choices = [];
    for (let level = 0; level <= item.itemLevel && level < list.length; level++) {
        (list[level] || []).forEach(function (affix) {
            if (!alreadyUsedBonusesKeys[affix.bonusesKey] && affixMatchesItem(item.base, affix)) {
                choices.push(affix);
            }
        });
    }
    return choices;
}
function affixMatchesItem(baseItem: ItemData, affix: EquipmentAffixData) {
    let tags = (affix.tags || []);
    tags = Array.isArray(tags) ? tags : [tags];
    for (const tag of tags) if (tag === baseItem.key || baseItem.tags[tag]) return true;
    return false;
}
const resetEnchantmentsButton = query('.js-resetEnchantments');
const mutateButton = query('.js-mutate');
const enchantButton = query('.js-enchant');
const imbueButton = query('.js-imbue');
resetEnchantmentsButton.onclick = resetItem;
resetEnchantmentsButton.addEventListener('mouseover', function () {
    const item = getEnchantingItem();
    if (item && item.prefixes.length + item.suffixes.length > 0) previewPointsChange('coins', -resetCost(item));
});
resetEnchantmentsButton.addEventListener('mouseout', hidePointsPreview);
enchantButton.addEventListener('click', enchantItem);
enchantButton.addEventListener('mouseover', function () {
    const item = getEnchantingItem();
    if (item && !item.unique && item.prefixes.length + item.suffixes.length === 0) previewPointsChange('anima', -enchantCost(item));
});
enchantButton.addEventListener('mouseout', hidePointsPreview);
imbueButton.addEventListener('click', imbueItem);
imbueButton.addEventListener('mouseover', function () {
    const item = getEnchantingItem();
    if (item && !item.unique && item.prefixes.length + item.suffixes.length === 0) previewPointsChange('anima', -imbueCost(item));
});
imbueButton.addEventListener('mouseout', hidePointsPreview);
mutateButton.addEventListener('click', mutateItem);
mutateButton.addEventListener('mouseover', function () {
    const item = getEnchantingItem();
    if (item && !item.unique && item.prefixes.length + item.suffixes.length > 0) previewPointsChange('anima', -mutateCost(item));
});
mutateButton.addEventListener('mouseout', hidePointsPreview);
export function getEnchantingItem(): Item {
    const itemElement = query('.js-enchantmentSlot .js-item');
    if (itemElement) {
        return getItemForElement(itemElement);
    }
    if (inventoryState.dragItem) {
        return inventoryState.dragItem;
    }
    return null;
}
export function updateEnchantmentOptions() {
    const item = getEnchantingItem();
    for (const element of queryAll('.js-resetEnchantments,.js-enchant,.js-imbue,.js-augment,.js-mutate')) {
        element.classList.add('disabled');
    }
    removePopup();
    if (!item) {
        for (const element of queryAll('.js-resetEnchantments,.js-enchant,.js-imbue,.js-augment,.js-mutate')) {
            element.setAttribute('helptext', 'Drag an item to the alter to enchant it.');
        }
        return;
    }
    const prefixes = item.prefixes.length;
    const suffixes = item.suffixes.length;
    const total = prefixes + suffixes;
    const { anima, coins} = getState().savedState;
    if (total > 0) {
        resetEnchantmentsButton.classList.toggle('disabled', coins < resetCost(item))
        resetEnchantmentsButton.setAttribute('helptext', 'Offer ' + points('coins', resetCost(item)) + ' to remove all enchantments from an item.<br/>This will allow you to enchant it again differently.');
    } else {
        resetEnchantmentsButton.setAttribute('helptext', 'This item has no enchantments to remove.');
    }
    if (item.unique) {
        for (const element of queryAll('.js-enchant,.js-imbue,.js-mutate')) {
            element.setAttribute('helptext', 'This item is unique and cannot be further enchanted.');
        }
        return;
    }
    if (total === 0) {
        mutateButton.setAttribute('helptext', 'This item has no enchantments to mutate.');
    } else {
        const mutationPrice = mutateCost(item);
        mutateButton.classList.toggle('disabled', anima < mutationPrice);
        mutateButton.setAttribute('helptext', 'Offer ' + points('anima', mutationPrice) + ' to randomize the magical properties of this item.');
    }
    if (total < 2) {
        enchantButton.classList.toggle('disabled', anima < enchantCost(item));
        enchantButton.setAttribute('helptext', 'Offer ' + points('anima', enchantCost(item)) + ' to add up to two magical properties to this item');
    } else {
        enchantButton.setAttribute('helptext', 'This item already has at least two magical properties.');
    }
    if (total < 4) {
        imbueButton.classList.toggle('disabled', anima < imbueCost(item));
        imbueButton.setAttribute('helptext', 'Offer ' + points('anima', imbueCost(item)) + ' to add up to four magical properties to this item');
    } else {
        imbueButton.setAttribute('helptext', 'This item cannot hold any more enchantments.');
        enchantButton.setAttribute('helptext', 'This item cannot hold any more enchantments.');
    }
}
function resetCost(item: Item) {
    return sellValue(item) * 2;
}
function enchantCost(item: Item) {
    if (item.prefixes.length + item.suffixes.length == 0) return sellValue(item);
    return sellValue(item) * 2;
}
function imbueCost(item: Item) {
    if (item.prefixes.length + item.suffixes.length == 0) return sellValue(item) * 4;
    if (item.prefixes.length + item.suffixes.length == 1) return sellValue(item) * 5;
    if (item.prefixes.length + item.suffixes.length == 2) return sellValue(item) * 6;
    return sellValue(item) * 8;
}
function mutateCost(item: Item) {
    return sellValue(item) * ((item.prefixes.length < 2 && item.suffixes.length < 2) ? 3 : 5);
}
function resetItem() {
    const item = getEnchantingItem();
    if (!item || !spend('coins', resetCost(item))) {
        return;
    }
    item.prefixes = [];
    item.suffixes = [];
    delete item.displayName;
    item.unique = false;
    updateItem(item);
    updateEnchantmentOptions();
    saveGame();
}
function enchantItem() {
    const item = getEnchantingItem();
    if (!item || !spend('anima', enchantCost(item))) return;
    if (item.prefixes.length + item.suffixes.length === 0) {
        enchantItemProper(item);
    } else if (item.prefixes.length + item.suffixes.length < 2) {
        augmentItemProper(item);
    } else {
        console.log("Tried to enchant item with 2+ enchantments");
    }
    saveGame();
}
function enchantItemProper(item) {
    item.prefixes = [];
    item.suffixes = [];
    if (Math.random() < 0.5) {
        addPrefixToItem(item);
        if (Math.random() < 0.5) addSuffixToItem(item);
    } else {
        addSuffixToItem(item);
        if (Math.random() < 0.5) addPrefixToItem(item);
    }
    updateItem(item);
    updateEnchantmentOptions();
}
function imbueItem() {
    const item = getEnchantingItem();
    if (!item || !spend('anima', imbueCost(item))) return;
    if (item.prefixes.length + item.suffixes.length === 0) {
        imbueItemProper(item);
    } else if (item.prefixes.length + item.suffixes.length < 4) {
        augmentItemProper(item);
    } else {
        console.log("Tried to imbue item with 4+ enchantments");
    }
    if (item.prefixes.length + item.suffixes.length < 3) {
        augmentItemProper(item);
    }
    saveGame();
}
function imbueItemProper(item: Item) {
    item.prefixes = [];
    item.suffixes = [];
    addPrefixToItem(item);
    addSuffixToItem(item);
    if (Math.random() < 0.5) {
        addPrefixToItem(item);
        if (Math.random() < 0.5) addSuffixToItem(item);
    } else {
        addSuffixToItem(item);
        if (Math.random() < 0.5) addPrefixToItem(item);
    }
    updateItem(item);
    updateEnchantmentOptions();
}
export function augmentItemProper(item: Item) {
    if (!item.prefixes.length && !item.suffixes.length) {
        if (Math.random() > 0.5) {
            addPrefixToItem(item);
        } else {
            addSuffixToItem(item);
        }
    } else if (!item.prefixes.length) {
        addPrefixToItem(item);
    } else if (!item.suffixes.length) {
        addSuffixToItem(item);
    } else {
        if (item.suffixes.length == 2) {
            addPrefixToItem(item);
        } else if (item.prefixes.length == 2) {
            addSuffixToItem(item);
        } else if (Math.random() > 0.5) {
            addPrefixToItem(item);
        } else {
            addSuffixToItem(item);
        }
    }
    updateItem(item);
    updateEnchantmentOptions();
}
function mutateItem() {
    const item = getEnchantingItem();
    if (!item || !spend('anima', mutateCost(item))) {
        return;
    }
    if (item.prefixes.length < 2 && item.suffixes.length < 2) enchantItemProper(item);
    else imbueItemProper(item);
    saveGame();
}
