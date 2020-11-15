import { enterArea, getArea } from 'app/adventure';
import { addBonusSourceToObject, createVariableObject } from 'app/bonuses';
import { setSelectedCharacter } from 'app/character';
import { addTrophyToAltar, checkIfAltarTrophyIsAvailable, getDefaultAltarTrophies, updateTrophy } from 'app/content/achievements';
import { Bed, HeroApplication, TrophyAltar } from 'app/content/areas';
import { cutscenes } from 'app/content/cutscenes';
import { addAllUnlockedFurnitureBonuses } from 'app/content/furniture';
import { map } from 'app/content/mapData';
import { zones } from 'app/content/zones';
import { query, queryAll } from 'app/dom';
import { getEnchantingItem, updateEnchantmentOptions } from 'app/enchanting';
import { addToInventory, exportItem, getItemForElement, importItem } from 'app/inventory';
import { addJewelToInventory } from 'app/jewelInventory';
import { getElementJewel, setMaxAnimaJewelBonus } from 'app/jewels';
import { updateRetireButtons } from 'app/main';
import { changedPoints } from 'app/points';
import {
    exportApplicant, exportCharacter, exportJewel,
    importApplicant, importCharacter, importJewel,
} from 'app/saveGame';

import Cutscene from 'app/content/cutscenes/Cutscene';

import {
    Applicant, Area, BonusSource, Character, Exit,
    FixedObject, GuildStats, JobAchievement,
    SavedItem, SavedTrophy, VariableObject,
    SavedApplicant, SavedCharacter, SavedJewel,
    ZoneType
} from 'app/types';

// Types used for saving data in local storage.
interface SavedGuildArea {
    objects: {
        [key: string]: {
            level: number,
        }
    }
}
interface SavedGuildAreas {
    [key: string]: SavedGuildArea,
}

type Trophies = {[key: string]: JobAchievement};
type SavedTrophies = {[key: string]: SavedTrophy};

type SavedState = {
    jewels: SavedJewel[],
    inventoryItems: SavedItem[],
    coins: number,
    anima: number,
    divinity: number,
    fame: number,
    characters: SavedCharacter[],
    applicants: SavedApplicant[],
    completedCutscenes: {[key in keyof typeof cutscenes]?: true},
    completedLevels: {[key: string]: true},
    completedMissions: {[key in ZoneType]?: true},
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
    trophies: SavedTrophies,
}
interface GameState {
    guildVariableObject: VariableObject,
    guildStats: GuildStats,
    savedState: SavedState,
    selectedCharacter: Character,
    lastSelectedCharacter?: any,
    visibleLevels: {[key: string]: true},
    characters: Character[],
    applicants: Applicant[],
    guildBonusSources: BonusSource[];
    altarTrophies: Trophies,
    availableBeds: FixedObject[],
    time: number,
    cutscene: Cutscene,
    gameHasBeenInitialized: boolean,
}

export const guildGateEntrance: Exit = {zoneKey: 'guild', areaKey: 'guildYard', objectKey: 'guildGate'};
export const endlessPortalEntrance: Exit = {zoneKey: 'guild', areaKey: 'endlessAdventure', objectKey: 'endlessPortal'};
export const guildYardEntrance: Exit = guildGateEntrance;//{zoneKey: 'guild', areaKey: 'guildYard', objectKey: 'mapExit'};

function getDefaultSavedState(): SavedState {
    return {
        jewels: [],
        inventoryItems: [],
        coins: 0,
        anima: 0,
        divinity: 0,
        fame: 0,
        characters: [],
        applicants: [],
        completedCutscenes: {},
        completedLevels: {},
        completedMissions: {},
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
        characters: [],
        applicants: [],
        guildBonusSources: [],
        altarTrophies: getDefaultAltarTrophies(),
        availableBeds: [],
        time: 0,
        cutscene: null,
        gameHasBeenInitialized: false,
    };
}

let state: GameState;
export function initializeState() {
    state = getDefaultState();
}

export function getState(): GameState {
    return state;
}
window['getState'] = getState;

export const implicitGuildBonusSource = {bonuses: {
    '+maxCoins': 100,
}};

export function exportState(state: GameState): SavedState {
    const enchantmentItem = getEnchantingItem();
    const jewelElements = [
        ...queryAll('.js-jewelInventory .js-jewel'),
        ...queryAll('.js-jewelCraftingSlot .js-jewel'),
    ];
    return {
        ...state.savedState,
        applicants: state.applicants.map(exportApplicant),
        characters: state.characters.map(exportCharacter),
        completedLevels: {...state.savedState.completedLevels},
        inventoryItems: [...queryAll('.js-inventory .js-item')].map(getItemForElement).map(exportItem),
        craftingItems: [...queryAll('.js-craftingSelectOptions .js-item')].map(getItemForElement).map(exportItem),
        enchantmentItem: enchantmentItem ? exportItem(enchantmentItem) : null,
        guildAreas: exportGuildAreas(),
        jewels: jewelElements.map(getElementJewel).map(exportJewel),
        selectedCharacterIndex: state.characters.indexOf(state.selectedCharacter),
        trophies: exportTrophies(state.altarTrophies),
    };
}

function exportTrophies(altarTrophies: Trophies): SavedTrophies {
    const trophies = {};
    for (let trophyKey in altarTrophies) {
        const trophy = altarTrophies[trophyKey];
        trophies[trophyKey] = {
            level: trophy.level,
            value: trophy.value,
            areaKey: trophy.areaKey,
            objectKey: trophy.objectKey
        };
    }
    return trophies;
}

function exportGuildAreas(): SavedGuildAreas {
    const exportedAreas: SavedGuildAreas = {};
    for (let areaKey in zones.guild) {
        const area = getArea('guild', areaKey);
        const savedGuildArea: SavedGuildArea = {'objects': {}};
        for (const key in area.objectsByKey) {
            const object = area.objectsByKey[key];
            if (object.level) {
                savedGuildArea.objects[key] = {level: object.level};
            }
        }
        if (Object.keys(savedGuildArea.objects).length) {
            exportedAreas[areaKey] = savedGuildArea;
        }
    }
    return exportedAreas;
}

export function importState(savedState: SavedState) {
    // Clear all existing elements.
    const helperSlotElement = query('.js-inventory .js-inventorySlot');
    helperSlotElement.remove();
    const inventoryContainer = query('.js-inventory');
    inventoryContainer.innerHTML = '';
    inventoryContainer.appendChild(helperSlotElement);
    query('.js-jewelInventory').innerHTML = '';

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
    for (let areaKey in savedGuildAreas) {
        const area: Area = getArea('guild', areaKey);
        const savedAreaData: SavedGuildArea = savedGuildAreas[areaKey] || {objects: {}};
        for (let objectKey in savedAreaData.objects) {
            const savedObjectData = savedAreaData.objects[objectKey];
            if (!area.objectsByKey[objectKey]) {
                console.log(`Warning ${objectKey} not found in ${areaKey}`);
                continue;
            }
            try {
                area.objectsByKey[objectKey].level = savedObjectData.level;
            } catch (e) {
                debugger;
            }
        }
    }
    state.applicants = (savedState.applicants || []).map(importApplicant);
    const allApplications = Object.values(HeroApplication.instances);
    for (let i = 0; i < state.applicants.length; i++) {
        if (!allApplications[i]) {
            console.error(`No hero application available for applicant ${i}`);
            continue;
        }
        allApplications[i].applicant = state.applicants[i];
    }
    setMaxAnimaJewelBonus(savedState.maxAnimaJewelMultiplier || 1);
    // Read trophy data before characters so that their bonuses will be applied when
    // we first initialize the characters.
    savedState.trophies = savedState.trophies || {};
    for (let trophyKey in state.altarTrophies) {
        if (!savedState.trophies[trophyKey]) {
            continue;
        }
        const trophy = state.altarTrophies[trophyKey];
        const trophyData = savedState.trophies[trophyKey];
        trophy.level = trophyData.level;
        trophy.value = trophyData.value;
        if (!trophyData.areaKey) {
            continue;
        }
        const area = getArea('guild', trophyData.areaKey);
        if (!area) {
            continue;
        }
        const altar = area.objectsByKey[trophyData.objectKey] as TrophyAltar;
        if (!altar) {
            continue;
        }
        addTrophyToAltar(altar, trophy);
    }
    addAllUnlockedFurnitureBonuses();
    for (const bed of Object.values(Bed.instances)) {
        if (savedState.unlockedGuildAreas[bed.area.key]) {
            state.availableBeds.push(bed);
        }
    }
    savedState.jewels.map(importJewel).forEach(jewel => {
        jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
        addJewelToInventory(jewel.domElement);
    });
    // Import and add all inventory items to the inventory.
    savedState.inventoryItems.map(importItem).filter(item => item).forEach(addToInventory);
    // This might happen if we changed how much each holder contains during an update.
    state.characters = savedState.characters.map(importCharacter);
    state.characters.forEach((character, index) => {
        updateTrophy('level-' + character.hero.job.key, character.hero.level);
        for (var levelKey of Object.keys(character.divinityScores)) {
            var level = map[levelKey];
            if (!level) {
                character.divinityScores[levelKey] = null;
                continue;
            }
            if (isNaN(character.divinityScores[levelKey])) {
                character.divinityScores[levelKey] = null;
            }
            state.savedState.completedLevels[levelKey] = true;
        }
        const bed = state.availableBeds[index];
        if (bed) {
            const target = bed.getAreaTarget();
            enterArea(character.hero, {
                zoneKey: 'guild',
                areaKey: bed.area.key,
                x: (target.x > 160) ? target.x - 40 : target.x + 40,
                z: target.z
            });
        } else enterArea(character.hero, guildYardEntrance);
        query('.js-charactersBox').appendChild(character.characterCanvas);
    });
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
    } else if (savedState.enchantmentItem) {
        const item = importItem(savedState.enchantmentItem);
        if (item) {
            query('.js-enchantmentSlot').appendChild(item.domElement);
            query('.js-enchantmentOptions').style.display = '';
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
