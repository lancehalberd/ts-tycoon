import { enterArea } from 'app/adventure';
import { addBonusSourceToObject, createVariableObject } from 'app/bonuses';
import { setSelectedCharacter } from 'app/character';
import { addTrophyToAltar, checkIfAltarTrophyIsAvailable, updateTrophy } from 'app/content/achievements';
import { addAllUnlockedFurnitureBonuses, allApplications, allBeds,  } from 'app/content/furniture';
import { getDefaultGuildAreas, guildYardEntrance } from 'app/content/guild';
import { map } from 'app/content/mapData';
import { query, queryAll } from 'app/dom';
import { updateEnchantmentOptions } from 'app/enchanting';
import { addToInventory } from 'app/inventory';
import { addJewelToInventory } from 'app/jewelInventory';
import { setMaxAnimaJewelBonus } from 'app/jewels';
import { updateRetireButtons } from 'app/main';
import { changedPoints } from 'app/points';
import {
    exportCharacter, exportItem, exportJewel,
    importCharacter, importItem, importJewel,
} from 'app/saveGame';
import { Polygon } from 'app/utils/polygon';

import {
    Character, GuildAreas, GuildStats, Jewel, SavedItem, VariableObject,
} from 'app/types';
import { ShapeType } from 'app/types/board';
import { BonusSource } from 'app/types/bonuses';
import { Item } from 'app/types/items';

// Types used for saving data in local storage.
type SavedCharacter = any;
type SavedJewel = any;
interface SavedGuildAreas {
    [key: string]: {
        objects: {
            [key: string]: {
                level: number,
            }
        }
    }
}

export type SavedState = {
    jewels: SavedJewel[],
    items: SavedItem[],
    coins: number,
    anima: number,
    divinity: number,
    fame: number,
    characters: SavedCharacter[],
    applicants: SavedCharacter[],
    completedLevels: {[key: string]: true},
    // bitmask, 0x1 is normal craft 0x10 is unique craft
    craftedItems: {[key: string]: number},
    // These three fields are needed to save state in the middle of item crafting.
    craftingItems: SavedItem[],
    craftingLevel: number,
    craftingTypeFilter: string,
    craftingXOffset: number,
    enchantmentItem: SavedItem,
    jewelCraftingLevel: number,
    jewelCraftingExperience: number,
    maxAnimaJewelMultiplier: number,
    maxCraftingLevel: number,
    selectedCharacterIndex: number,
    skipShrinesEnabled: boolean,
    unlockedGuildAreas: {[key: string]: true},
    guildAreas: SavedGuildAreas,
    trophies: any,
}
export interface GameState {
    guildVariableObject: VariableObject,
    guildStats: GuildStats,
    savedState: SavedState,
    selectedCharacter: Character,
    lastSelectedCharacter?: any,
    visibleLevels: {[key: string]: true},
    characters: Character[],
    applicants: Character[],
    jewels: Jewel[],
    items: Item[],
    craftingItems: Item[],
    enchantmentItem: Item,
    guildAreas: GuildAreas,
    guildBonusSources: BonusSource[];
    altarTrophies?: any,
    availableBeds?: any[],
}

function getDefaultSavedState(): SavedState {
    return {
        jewels: [],
        items: [],
        coins: 0,
        anima: 0,
        divinity: 0,
        fame: 0,
        characters: [],
        applicants: [],
        completedLevels: {},
        craftedItems: {},
        craftingItems: [],
        craftingLevel: null,
        craftingTypeFilter: null,
        craftingXOffset: 0,
        enchantmentItem: null,
        guildAreas: {},
        jewelCraftingLevel: 1,
        jewelCraftingExperience: 0,
        maxAnimaJewelMultiplier: 1,
        maxCraftingLevel: 1,
        selectedCharacterIndex: 0,
        skipShrinesEnabled: false,
        unlockedGuildAreas: {'guildYard': true},
        trophies: {},
    };
}

function getDefaultState(): GameState {
    return {
        savedState: getDefaultSavedState(),
        guildVariableObject: null,
        guildStats: null,
        selectedCharacter: null,
        visibleLevels: {}, // This isn't stored, it is computed from completedLevels on load.
        jewels: [],
        items: [],
        craftingItems: [],
        enchantmentItem: null,
        characters: [],
        applicants: [],
        guildAreas: {},
        guildBonusSources: [],
    };
}

let state: GameState = getDefaultState();

export function getState(): GameState {
    return state;
}

export const implicitGuildBonusSource = {bonuses: {
    '+maxCoins': 100,
}};

export function exportState(state: GameState): SavedState {
    return {
        ...state.savedState,
        applicants: state.applicants.map(exportCharacter),
        characters: state.characters.map(exportCharacter),
        completedLevels: {...state.savedState.completedLevels},
        items: state.items.map(exportItem),
        craftingItems: state.craftingItems.map(exportItem),
        enchantmentItem: exportItem(state.enchantmentItem),
        guildAreas: exportGuildAreas(state.guildAreas),
        jewels: state.jewels.map(exportJewel),
        selectedCharacterIndex: state.characters.indexOf(state.selectedCharacter),
        trophies: exportTrophies(state.altarTrophies),
    };
}

function exportTrophies(altarTrophies) {
    const trophies = {};
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        trophies[trophyKey] = {
            'level': trophy.level,
            'value': trophy.value,
            'areaKey': trophy.areaKey,
            'objectKey': trophy.objectKey
        };
    }
    return trophies;
}

function exportGuildAreas(guildAreas): SavedGuildAreas {
    const exportedAreas: SavedGuildAreas = {};
    for (let areaKey in state.guildAreas) {
        const area = state.guildAreas[areaKey];
        exportedAreas[areaKey] = {'objects': {}};
        for (const object of area.objects) {
            if (object.key && object.level) {
                exportedAreas[areaKey].objects[object.key] = {level: object.level};
            }
        }
    }
    return exportedAreas;
}

export function importState(savedState: SavedState) {
    const defaultGuildAreas = getDefaultGuildAreas();
    //var $helperSlot = $('.js-inventory .js-inventorySlot').detach();
    //$('.js-inventory').empty().append($helperSlot);
    //$('.js-jewelInventory').empty();

    // Add default state in case new fields are present now,
    savedState = {
        ...getDefaultSavedState(),
        ...savedState,
    };
    state = {
        ...getDefaultState(),
        savedState,
    };
    state.guildVariableObject = createVariableObject({'variableObjectType': 'guild'});
    state.guildStats = state.guildVariableObject.stats as GuildStats;
    addBonusSourceToObject(state.guildVariableObject, implicitGuildBonusSource);
    const savedGuildAreas = savedState.guildAreas || {};
    for (let areaKey in defaultGuildAreas) {
        state.guildAreas[areaKey] = defaultGuildAreas[areaKey];
        var savedAreaData = savedGuildAreas[areaKey] || {objects: {}};
        for (var objectKey in savedAreaData.objects) {
            var savedObjectData = savedAreaData.objects[objectKey];
            try {
                defaultGuildAreas[areaKey].objectsByKey[objectKey].level = savedObjectData.level;
            } catch (e) {
                debugger;
            }
        }
    }
    savedState.applicants = (savedState.applicants || []).map(importCharacter);
    for (let i = 0; i < savedState.applicants.length; i++) {
        allApplications[i].character = savedState.applicants[i];
    }
    setMaxAnimaJewelBonus(savedState.maxAnimaJewelMultiplier || 1);
    // Read trophy data before characters so that their bonuses will be applied when
    // we first initialize the characters.
    savedState.trophies = savedState.trophies || {};
    for (let trophyKey in state.altarTrophies) {
        if (!savedState.trophies[trophyKey]) continue;
        const trophy = state.altarTrophies[trophyKey];
        const trophyData = savedState.trophies[trophyKey];
        trophy.level = trophyData.level;
        trophy.value = trophyData.value;
        const area = defaultGuildAreas[trophyData.areaKey];
        if (!area) continue;
        const altar = area.objectsByKey[trophyData.objectKey];
        if (!altar) continue;
        addTrophyToAltar(altar, trophy);
    }
    addAllUnlockedFurnitureBonuses();
    for (const bed of allBeds) {
        if (savedState.unlockedGuildAreas[bed.area.key]) {
            state.availableBeds.push(bed);
        }
    }
    // This might happen if we changed how much each holder contains during an update.
    state.characters = savedState.characters.map(importCharacter);
    state.characters.forEach(character => {
        updateTrophy('level-' + character.adventurer.job.key, character.adventurer.level);
        for (var levelKey of Object.keys(character.divinityScores)) {
            var level = map[levelKey];
            if (!level) {
                delete character.divinityScores[levelKey];
                continue;
            }
            if (isNaN(character.divinityScores[levelKey])) {
                delete character.divinityScores[levelKey];
            }
            state.savedState.completedLevels[levelKey] = true;
        }
        const bed = state.availableBeds[state.characters.length - 1];
        if (bed) enterArea(character.hero, {'areaKey': bed.area.key, 'x': (bed.x > 400) ? bed.x - 80 : bed.x + 80, 'z': bed.z});
        else enterArea(character.hero, guildYardEntrance);
        query('.js-charactersBox').appendChild(character.characterCanvas);
    });
    for (let completedLevelKey in state.savedState.completedLevels) {
        const level = map[completedLevelKey];
        if (!level) {
            delete state.savedState.completedLevels[completedLevelKey];
            continue;
        }
        state.visibleLevels[completedLevelKey] = true;
        for (var nextLevelKey of level.unlocks) state.visibleLevels[nextLevelKey] = true;
    }
    savedState.jewels.map(importJewel).forEach(jewel => {
        jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
        addJewelToInventory(jewel.domElement);
    });
    state.items = savedState.items.map(importItem).filter(item => item);
    state.items.forEach(addToInventory);
    const craftingItems = [...savedState.craftingItems];
    if (craftingItems.length) {
        for (const itemSlot of queryAll('.js-craftingSelectOptions .js-itemSlot')) {
            if (!craftingItems.length) break;
            const item = importItem(craftingItems.shift());
            if (item) {
                itemSlot.appendChild(item.domElement);
            }
        }
        query('.js-craftingSelectOptions').style.display = ''
        query('.js-craftingOptions').style.display = 'none';
    } else if (savedState.enchantmentItem) {
        const item = importItem(savedState.enchantmentItem);
        if (item) {
            query('.js-enchantmentSlot').appendChild(item.domElement);
            query('.js-enchantmentOptions').style.display = '';
            query('.js-craftingOptions').style.display = 'none';
            updateEnchantmentOptions();
        }
    }
    changedPoints('coins');
    changedPoints('anima');
    changedPoints('fame');
    updateRetireButtons();
    const selectedCharacterIndex = Math.max(0, Math.min(savedState.selectedCharacterIndex || 0, state.characters.length - 1));
    setSelectedCharacter(state.characters[selectedCharacterIndex]);
    checkIfAltarTrophyIsAvailable();
    return state;
}
