import {
    actorHelpText, makeAdventurerFromData, setActorHealth, updateAdventurer
} from 'app/character';
import { abilities } from 'app/content/abilities';
import { affixesByKey } from 'app/content/enchantments';
import { itemsByKey } from 'app/content/equipment/index';
import { map } from 'app/content/mapData';
import { createCanvas, jewelsCanvas, tag, tagElement } from 'app/dom';
import { drawBoardBackground } from 'app/drawBoard';
import { equipItemProper, updateItem } from 'app/inventory';
import {
    displayJewelShapeScale, makeJewelProper, makeFixedJewel,
    originalJewelScale, updateAdjacentJewels,
} from 'app/jewels';
import { exportState, getState, importState, SavedState } from 'app/state';
import { makeShape, Polygon, shapeDefinitions } from 'app/utils/polygon';

import {
    Actor, Affix, Board, Character, EquipmentAffix, Hero, Item, Jewel, JewelComponents,
    SavedActor, SavedAffix, SavedBoard, SavedCharacter,
    SavedItem, SavedFixedJewel, SavedJewel, SavedShape
} from 'app/types';

export function loadSavedData() {
    if (window.location.search.substr(1) === 'reset' && confirm("Clear your saved data?")) {
        return false;
    }
    const importedSaveData = window.localStorage.getItem("savedGame");
    if (importedSaveData) {
        importState(JSON.parse(importedSaveData));
        return true;
    }
    return false;
}

export function saveGame() {
    window.localStorage.setItem('savedGame', JSON.stringify(exportState(getState())));
}
export function eraseSave() {
    window.localStorage.clear()
}
export function exportCharacter(character: Character): SavedCharacter {
    return {
        hero: exportHero(character.hero),
        context: character.context,
        selectedLevelKey: character.selectedLevelKey,
        autoActions: character.autoActions,
        manualActions: character.manualActions,
        board: exportJewelBoard(character.board),
        divinityScores: character.divinityScores,
        levelTimes: character.levelTimes,
        fame: character.fame,
        divinity: character.divinity,
        currentLevelKey: character.currentLevelKey,
        applicationAge: character.applicationAge || 0,
        paused: character.paused,
        autoplay: character.autoplay,
        skipShrines: character.skipShrines,
        replay: character.replay,
        gameSpeed: character.gameSpeed,
        loopSkip: character.loopSkip,
    };
}
export function importCharacter(characterData: SavedCharacter) {
    const characterCanvas = createCanvas(40, 20);
    characterCanvas.setAttribute('helptext', '');
    characterCanvas.classList.add('js-character', 'character');
    const boardCanvas = createCanvas(jewelsCanvas.width, jewelsCanvas.height);
    const hero = importAdventurer(characterData.hero);
    hero.heading = [1, 0, 0]; // Character moves left to right.
    const character: Character = {
    // Old saves used adventurer instead of hero.
        board: null,
        hero,
        context: characterData.context,
        selectedLevelKey: characterData.selectedLevelKey,
        adventurer: hero,
        autoActions: characterData.autoActions || {},
        manualActions: characterData.manualActions || {},
        characterCanvas,
        characterContext: characterCanvas.getContext("2d"),
        boardCanvas,
        boardContext: boardCanvas.getContext("2d"),
        time: Date.now(),
        divinityScores: characterData.divinityScores || {},
        levelTimes: characterData.levelTimes || {},
        divinity: characterData.divinity || 0,
        currentLevelKey: characterData.currentLevelKey || 'guild',
        fame: characterData.fame || Math.ceil(characterData.divinity / 10),
        applicationAge: characterData.applicationAge || 0,
        // This will get populated when updateJewelBonuses is called.
        jewelBonuses: {bonuses: {}},
        // Equiping the jewels cannot be done until character.board is actually set.
        paused: characterData.paused,
        autoplay: characterData.autoplay,
        skipShrines: characterData.skipShrines,
        replay: characterData.replay,
        gameSpeed: characterData.gameSpeed,
        loopSkip: characterData.loopSkip,
    };
    if (isNaN(character.divinity) || typeof(character.divinity) !== "number") {
        character.divinity = 0;
    }
    hero.character = character;
    character.board = importJewelBoard(characterData.board, character);
    for (const jewel of [...character.board.jewels, ...character.board.fixed]) {
        jewel.character = character;
        updateAdjacentJewels(jewel);
    }
    setActorHealth(hero, hero.stats.maxHealth);
    if (!map[character.currentLevelKey]) {
        character.currentLevelKey = 'guild';
    }
    // centerShapesInRectangle(character.board.fixed.map(j => j.shape).concat(character.board.spaces), rectangle(0, 0, character.boardCanvas.width, character.boardCanvas.height));
    drawBoardBackground(character.boardContext, character.board);
    updateAdventurer(character.adventurer);
    return character;
}
function exportHero(hero: Hero): SavedActor {
    const data = {
        equipment: {},
        hairOffset: hero.hairOffset,
        skinColorOffset: hero.skinColorOffset,
        jobKey: hero.job.key,
        level: hero.level,
        name: hero.name,
    };
    for (let key in hero.equipment) {
        const item = hero.equipment[key];
        data.equipment[key] = item ? exportItem(item) : null;
    }
    return data;
}
function importAdventurer(heroData: SavedActor): Hero {
    const hero = makeAdventurerFromData(heroData);
    /*if (window.location.search.substr(1) === 'test') {
        for (const ability of (window.testAbilities, [])) {
            adventurer.abilities.push(ability);
        }
    }*/
    for (let key in heroData.equipment) {
        const itemData = heroData.equipment[key];
        if (itemData) {
            const item = importItem(itemData);
            if (item) equipItemProper(hero, item, false);
        }
    }
    return hero;
}
export function exportItem(item: Item): SavedItem {
    return {
        itemKey: item.base.key,
        itemLevel: item.itemLevel,
        prefixes: item.prefixes.map(exportAffix),
        suffixes: item.suffixes.map(exportAffix),
        unique: item.unique,
    };
}
export function importItem(itemData: SavedItem): Item {
    const baseItem = itemsByKey[itemData.itemKey];
    // This can happen if a base item was removed since they last saved the game.
    if (!baseItem) return null;
    const domElement = tagElement('div', 'js-item item',
        tag('div', 'icon ' + baseItem.icon) + tag('div', 'itemLevel', '' + baseItem.level)
    );
    const item = {
        base: baseItem,
        domElement,
        itemLevel: itemData.itemLevel,
        unique: itemData.unique,
        prefixes: itemData.prefixes.map(importAffix).filter(v => v),
        suffixes: itemData.suffixes.map(importAffix).filter(v => v),
    };
    updateItem(item);
    domElement.setAttribute('helptext', '-');
    return item;
}
function exportAffix(affix: EquipmentAffix): SavedAffix {
    return {
        affixKey: affix.base.key,
        bonuses: {...affix.bonuses},
    };
}
function importAffix(affixData: SavedAffix): EquipmentAffix {
    const baseAffix = affixesByKey[affixData.affixKey];
    if (!baseAffix) return null;
    return {
        base: baseAffix,
        bonuses: affixData.bonuses
    };
}
export function exportJewelBoard(board: Board): SavedBoard {
    return {
        fixed: board.fixed.map(exportFixedJewel),
        jewels: board.jewels.map(exportJewel),
        spaces: board.spaces.map(exportShape),
    };
}
function exportFixedJewel(fixedJewel: Jewel): SavedFixedJewel {
    return {
        abilityKey: fixedJewel.ability.key,
        shape: exportShape(fixedJewel.shape),
        confirmed: fixedJewel.confirmed,
        disabled: fixedJewel.disabled || false,
    };
}
// In addition to creating the jewel board, it also applies abilities to the adventurer.
function importJewelBoard(jewelBoardData: SavedBoard, character: Character): Board {
    const jewelBoard: Board = {
        fixed: [],
        jewels: jewelBoardData.jewels.map(importJewel),
        spaces: jewelBoardData.spaces.map(importShape),
    };
    for (const fixedJewelData of jewelBoardData.fixed) {
        const ability = abilities[fixedJewelData.abilityKey];
        if (fixedJewelData.confirmed) {
            character.adventurer.unlockedAbilities[fixedJewelData.abilityKey] = true;
        }
        if (!ability) {
            return;
        }
        const shape = importShape(fixedJewelData.shape);
        const fixedJewel = makeFixedJewel(shape, character, ability);
        fixedJewel.confirmed = fixedJewelData.confirmed;
        fixedJewel.disabled = fixedJewelData.disabled || false;
        if (fixedJewel.confirmed && !fixedJewel.disabled) {
            character.adventurer.abilities.push(ability);
        }
        jewelBoard.fixed.push(fixedJewel);
    }
    return jewelBoard;
}
export function exportJewel(jewel: Jewel): SavedJewel {
    return {
        tier: jewel.tier,
        quality: jewel.quality,
        components: [...jewel.components] as JewelComponents,
        shape: exportShape(jewel.shape)
    }
}
export function importJewel(jewelData: SavedJewel): Jewel {
    return makeJewelProper(
        jewelData.tier,
        importShape(jewelData.shape),
        jewelData.components,
        jewelData.quality
    );
}
function exportShape(shape: Polygon): SavedShape {
    return {
        shapeKey: shape.key,
        x: shape.points[0][0] * originalJewelScale / displayJewelShapeScale,
        y: shape.points[0][1] * originalJewelScale / displayJewelShapeScale,
        rotation: shape.angles[0],
    };
}
function importShape(shapeData: SavedShape): Polygon {
    return makeShape(
        shapeData.x * displayJewelShapeScale / originalJewelScale,
        shapeData.y * displayJewelShapeScale / originalJewelScale,
        shapeData.rotation,
        shapeDefinitions[shapeData.shapeKey][0], displayJewelShapeScale
    );
}
