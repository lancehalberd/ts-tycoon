import { enterArea } from 'app/adventure';
import { initializeVariableObject } from 'app/bonuses';
import { checkIfAltarTrophyIsAvailable } from 'app/content/achievements';
import { allApplications, allBeds } from 'app/content/furniture';
import { getDefaultGuildAreas, guildYardEntrance } from 'app/content/guild';
import { Jewel } from 'app/jewels';
import { changedPoints } from 'app/points';
import { exportCharacter, exportItem, exportJewel } from 'app/saveGame';
import { Polygon, ShapeType } from 'app/utils/polygon';

type Character = any;
type Item = any;
// Types used for saving data in local storage.
type SavedCharacter = any;
type SavedJewel = any;
type SavedItem = any;
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
    craftingLevel: null,
    craftingTypeFilter: null,
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
    guildStats: any,
    savedState: SavedState,
    selectedCharacter: any,
    visibleLevels: {[key: string]: true},
    characters: Character[],
    applicants: Character[],
    jewels: Jewel[],
    items: Item[],
    craftingItems: Item[],
    enchantmentItem: Item,
    guildAreas?: any,
    guildBonusSources: BonusSource[];
    altarTrophies?: any,
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
        guildStats: null,
        selectedCharacter: null,
        visibleLevels: {}, // This isn't stored, it is computed from completedLevels on load.
        jewels: [],
        items: [],
        craftingItems: [],
        enchantmentItem: null,
        characters: [],
        applicants: [],
        guildBonusSources: [],
    };
}

let state: GameState = getDefaultState();

export function getState(): GameState {
    return state;
}

const implicitGuildBonusSource = {bonuses: {
    '+maxCoins': 100,
}};

function exportState(state: GameState): SavedState {
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
    const availableBeds = [];
    initializeVariableObject(state.guildStats, {'variableObjectType': 'guild'}, state.guildStats);
    addBonusSourceToObject(state.guildStats, implicitGuildBonusSource);
    const guildAreas = savedState.guildAreas || {};
    for (let areaKey in defaultGuildAreas) {
        state.guildAreas[areaKey] = defaultGuildAreas[areaKey];
        var savedAreaData = guildAreas[areaKey] || {objects: {}};
        for (var objectKey in savedAreaData.objects) {
            var savedObjectData = savedAreaData.objects[objectKey];
            try {
                defaultGuildAreas[areaKey].objectsByKey[objectKey].level = savedObjectData.level;
            } catch (e) {
                debugger;
            }
        }
    }
    var applications = ifdefor(applications, []).map(importCharacter);
    for (var i = 0; i < applications.length; i++) allApplications[i].character = applications[i];
    setMaxAnimaJewelBonus(ifdefor(maxAnimaJewelMultiplier, 1));
    // Read trophy data before characters so that their bonuses will be applied when
    // we first initialize the characters.
    trophies = trophies || {};
    for (var trophyKey in altarTrophies) {
        if (!trophies[trophyKey]) continue;
        var trophy = altarTrophies[trophyKey];
        var trophyData = trophies[trophyKey];
        trophy.level = trophyData.level;
        trophy.value = trophyData.value;
        var area = defaultGuildAreas[trophyData.areaKey];
        if (!area) continue;
        var altar = area.objectsByKey[trophyData.objectKey];
        if (!altar) continue;
        addTrophyToAltar(altar, trophy);
    }
    addAllUnlockedFurnitureBonuses();
    for (var bed of allBeds) {
        if (state.unlockedGuildAreas[bed.area.key]) {
            state.availableBeds.push(bed);
        }
    }
    // This might happen if we changed how much each holder contains during an update.
    characters.map(importCharacter).forEach(character => {
        if (isNaN(character.divinity) || typeof(character.divinity) !== "number") {
            character.divinity = 0;
        }
        state.characters.push(character);
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
            state.completedLevels[levelKey] = true;
        }
        var bed = state.availableBeds[state.characters.length - 1];
        if (bed) enterArea(character.hero, {'areaKey': bed.area.key, 'x': (bed.x > 400) ? bed.x - 80 : bed.x + 80, 'z': bed.z});
        else enterArea(character.hero, guildYardEntrance);
        $('.js-charactersBox').append(character.$characterCanvas);
    });
    for (var completedLevelKey in state.completedLevels) {
        var level = map[completedLevelKey];
        if (!level) {
            delete state.completedLevels[completedLevelKey];
            continue;
        }
        state.visibleLevels[completedLevelKey] = true;
        for (var nextLevelKey of level.unlocks) state.visibleLevels[nextLevelKey] = true;
    }
    jewels.map(importJewel).forEach(jewel => {
        jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
        addJewelToInventory(jewel.$item);
    });
    items.map(importItem).filter(item => item).forEach(addToInventory);
    if (craftingItems && craftingItems.length) {
        $('.js-craftingSelectOptions .js-itemSlot').each(function (index) {
            // Don't throw errors just because there are only 1-2 items when
            // we expect 3. Just show however many we have.
            if (!craftingItems[index]) return;
            var item = importItem(craftingItems[index]);
            if (item) $(this).append(item.$item);
        });
        $('.js-craftingSelectOptions').show();
        $('.js-craftingOptions').hide();
    } else if (enchantmentItem) {
        var item = importItem(enchantmentItem);
        if (item) {
            $('.js-enchantmentSlot').append(item.$item);
            $('.js-enchantmentOptions').show();
            $('.js-craftingOptions').hide();
            updateEnchantmentOptions();
        }
    }
    changedPoints('coins');
    changedPoints('anima');
    changedPoints('fame');
    updateRetireButtons();
    var selectedCharacterIndex = Math.max(0, Math.min(ifdefor(selectedCharacterIndex, 0), state.characters.length - 1));
    setSelectedCharacter(state.characters[selectedCharacterIndex]);
    checkIfAltarTrophyIsAvailable();
    return state;
}
