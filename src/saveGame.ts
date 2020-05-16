import { setActorHealth } from 'app/actor';
import { makeHeroFromData, updateHero } from 'app/character';
import { abilities } from 'app/content/abilities';
import { affixesByKey } from 'app/content/enchantments';
import { map } from 'app/content/mapData';
import { createCanvas, jewelsCanvas, tag, tagElement } from 'app/dom';
import { drawBoardBackground } from 'app/drawBoard';
import { equipItemProper, exportItem, importItem, updateItem } from 'app/inventory';
import {
    displayJewelShapeScale, makeJewelProper, makeFixedJewel,
    originalJewelScale, updateAdjacentJewels,
} from 'app/jewels';
import { exportState, getState, importState, SavedState } from 'app/state';
import { makeShape, Polygon, shapeDefinitions } from 'app/utils/polygon';

import {
    Actor, Affix, Applicant, Board, Character, EquipmentAffix, Hero, Item, Jewel, JewelComponents,
    SavedActor, SavedAffix, SavedApplicant, SavedBoard, SavedCharacter,
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
    // console.log(exportState(getState()));
    window.localStorage.setItem('savedGame', JSON.stringify(exportState(getState())));
}
export function eraseSave() {
    window.localStorage.clear()
}
export function exportCharacter(character: Character | Applicant): SavedCharacter {
    return {
        hero: exportHero(character.hero),
        selectedLevelKey: character.selectedLevelKey,
        autoActions: character.autoActions,
        manualActions: character.manualActions,
        board: exportJewelBoard(character.board),
        divinityScores: character.divinityScores,
        levelTimes: character.levelTimes,
        fame: character.fame,
        divinity: character.divinity,
        currentLevelKey: character.currentLevelKey,
        paused: character.paused,
        autoplay: character.autoplay,
        skipShrines: character.skipShrines,
        replay: character.replay,
        gameSpeed: character.gameSpeed,
        loopSkip: character.loopSkip,
    };
}
export function exportApplicant(applicant: Applicant): SavedApplicant {
    return {
        ...exportCharacter(applicant),
        applicationAge: applicant.applicationAge,
    }
}
export function importCharacter(characterData: SavedCharacter) {
    const characterCanvas = createCanvas(40, 20);
    characterCanvas.setAttribute('helpText', '$character$');
    characterCanvas.classList.add('js-character', 'character');
    const boardCanvas = createCanvas(jewelsCanvas.width, jewelsCanvas.height);
    // Old saves used adventurer instead of hero.
    const hero = importHero(characterData.hero || (characterData as any).adventurer);
    hero.heading = [1, 0, 0]; // Character moves left to right.
    const character: Character = {
        actionShortcuts: [],
        board: null,
        hero,
        context: 'field',
        selectedLevelKey: characterData.selectedLevelKey,
        autoActions: characterData.autoActions || {},
        manualActions: characterData.manualActions || {},
        characterCanvas,
        characterContext: characterCanvas.getContext("2d"),
        boardCanvas,
        boardContext: boardCanvas.getContext("2d"),
        divinityScores: characterData.divinityScores || {},
        levelTimes: characterData.levelTimes || {},
        divinity: characterData.divinity || 0,
        currentLevelKey: characterData.currentLevelKey,
        fame: characterData.fame || Math.ceil(characterData.divinity / 10),
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
    character.characterContext.imageSmoothingEnabled = false;
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
        character.currentLevelKey = null;
    }
    // centerShapesInRectangle(character.board.fixed.map(j => j.shape).concat(character.board.spaces), rectangle(0, 0, character.boardCanvas.width, character.boardCanvas.height));
    drawBoardBackground(character.boardContext, character.board);
    updateHero(character.hero);
    return character;
}
export function importApplicant(applicantData: SavedApplicant): Applicant {
    const applicant = importCharacter(applicantData) as Applicant;
    applicant.applicationAge = applicantData.applicationAge;
    return applicant;
}
function exportHero(hero: Hero): SavedActor {
    const data = {
        equipment: {},
        colors: hero.colors,
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
function importHero(heroData: SavedActor): Hero {
    const hero = makeHeroFromData(heroData);
    /*if (window.location.search.substr(1) === 'test') {
        for (const ability of (window.testAbilities || [])) {
            hero.abilities.push(ability);
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
export function exportAffix(affix: EquipmentAffix): SavedAffix {
    return {
        affixKey: affix.base.key,
        bonuses: {...affix.bonuses},
    };
}
export function importAffix(affixData: SavedAffix): EquipmentAffix {
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
            character.hero.unlockedAbilities[fixedJewelData.abilityKey] = true;
        }
        if (!ability) {
            return;
        }
        const shape = importShape(fixedJewelData.shape);
        const fixedJewel = makeFixedJewel(shape, character, ability);
        fixedJewel.confirmed = fixedJewelData.confirmed;
        fixedJewel.disabled = fixedJewelData.disabled || false;
        if (fixedJewel.confirmed && !fixedJewel.disabled) {
            character.hero.abilities.push(ability);
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
