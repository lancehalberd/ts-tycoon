import { addAccessories } from 'app/content/equipment/accessories';
import { addArmor } from 'app/content/equipment/armor';
import { addBoots } from 'app/content/equipment/boots';
import { addGloves } from 'app/content/equipment/gloves';
import { addHelmets } from 'app/content/equipment/helmets';
import { addLeggings } from 'app/content/equipment/leggings';
import { addShields } from 'app/content/equipment/shields';
import { addWeapons } from 'app/content/equipment/weapons';
import { addUniques } from 'app/content/uniques';
import { equipmentSlots } from 'app/gameConstants';

import { ItemData, RawItemData } from 'app/types/items';

// const nonWeapons = ['body', 'feet', 'head', 'offhand', 'arms', 'legs', 'back', 'ring'];
export const items: ItemData[][] = [[]];
export const itemsByKey: {[key: string]: ItemData} = {};
export const itemsBySlotAndLevel: {[key: string]: ItemData[][] } = {};
equipmentSlots.forEach(function (slot) {
    itemsBySlotAndLevel[slot] = [];
});


export function addAllItems() {
    addAccessories();
    addArmor();
    addBoots();
    addGloves();
    addHelmets();
    addLeggings();
    addShields();
    addWeapons();
    // TODO: add other items here.
    addUniques();
}

export function addItem(level: number, rawData: RawItemData) {
    const key = rawData.name.replace(/\s*/g, '').toLowerCase();
    const tags = rawData.tags || [];
    const data: ItemData = {
        ...rawData,
        level,
        crafted: false,
        craftingWeight: 5 * level * level,
        hasImplicitBonuses: true,
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
    items[level] = items[level] || [];
    itemsBySlotAndLevel[data.slot][level] = itemsBySlotAndLevel[data.slot][level] || [];
    items[level].push(data);
    itemsBySlotAndLevel[data.slot][level].push(data);
    itemsByKey[key] = data;
}
