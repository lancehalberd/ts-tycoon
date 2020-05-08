// Load any graphic assets needed by the game here.
import { enterArea, startLevel } from 'app/adventure';
import { addBonusSourceToObject, createVariableObject } from 'app/bonuses';
import { newCharacter,updateAdventurer } from 'app/character';
import { HeroApplication } from 'app/content/areas';
import { addAllItems } from 'app/content/equipment/index';
import { addAllUnlockedFurnitureBonuses } from 'app/content/furniture';
import { getDefaultGuildAreas, guildYardEntrance } from 'app/content/guild';
import { characterClasses, initializeJobs } from 'app/content/jobs';
import { map } from 'app/content/mapData';
import { initializeMonsters } from 'app/content/monsters';
import { initializeProjectileAnimations } from 'app/content/projectileAnimations';
import { setContext, showContext } from 'app/context';
import { initializeLevelEditing } from 'app/development/editLevel';
import { query } from 'app/dom';
import { drawMap } from 'app/drawMap';
import { updateEnchantmentOptions } from 'app/enchanting';
import { initializeCraftingGrid, updateItemsThatWillBeCrafted } from 'app/equipmentCrafting';
import { createNewHeroApplicant, hireCharacter, jobRanks } from 'app/heroApplication';
import { makeJewel } from 'app/jewels'
import { addKeyCommands } from 'app/keyCommands';
import { gainJewel } from 'app/loot';
import { centerMapOnLevel } from 'app/map';
import { gain } from 'app/points';
import { eraseSave, loadSavedData } from 'app/saveGame';
import { getState, implicitGuildBonusSource, initializeState } from 'app/state';
import { removeElementFromArray } from 'app/utils/index';
import { bindMouseListeners } from 'app/utils/mouse';
import Random from 'app/utils/Random';
import { playTrack } from 'app/utils/sounds';

import { GuildStats } from 'app/types';


let gameHasBeenInitialized = false;
export function isGameInitialized() {
    return gameHasBeenInitialized;
}
export function initializeGame() {
    gameHasBeenInitialized = true;
    bindMouseListeners();
    addAllItems();
    // Depends on items being defined.
    initializeJobs();
    initializeMonsters();
    initializeCraftingGrid();
    initializeProjectileAnimations();
    initializeLevelEditing();
    initializeState();
    addKeyCommands();
    query('.js-loading').style.display = 'none';
    query('.js-gameContent').style.display = '';

    // var testShape = makeShape(0, 0, 0, shapeDefinitions.triangle[0]).scale(originalJewelScale);
    if (window.location.search.substr(1) === 'new') {
        if (confirm('Are you sure you want to clear your saved data? This cannot be undone.')) {
            eraseSave();
        }
    }
    if (loadSavedData()) {
        const state = getState();
        showContext(state.selectedCharacter.context);
    } else {
        const state = getState();
        state.guildAreas = getDefaultGuildAreas();
        state.guildVariableObject = createVariableObject({'variableObjectType': 'guild'});
        state.guildStats = state.guildVariableObject.stats as GuildStats;
        addBonusSourceToObject(state.guildVariableObject, implicitGuildBonusSource);
        addAllUnlockedFurnitureBonuses();
        gainJewel(makeJewel(1, 'triangle', [90, 5, 5], 1.1));
        gainJewel(makeJewel(1, 'triangle', [5, 90, 5], 1.1));
        gainJewel(makeJewel(1, 'triangle', [5, 5, 90], 1.1));
        gain('fame', 1);
        gain('coins', 50);
        gain('anima', 0);
        const jobKey = Random.element(jobRanks[0]);
        // jobKey = testJob || jobKey;
        const startingCharacter = newCharacter(characterClasses[jobKey]);
        updateAdventurer(startingCharacter.adventurer);
        hireCharacter(startingCharacter);
        const otherKeys = jobRanks[0].slice();
        removeElementFromArray(otherKeys, jobKey, true);
        for (let i = 0; i < HeroApplication.instances.length && otherKeys.length; i++) {
            HeroApplication.instances[i].setApplicant(createNewHeroApplicant(otherKeys.pop()));
        }
        enterArea(state.selectedCharacter.hero, guildYardEntrance);
    }
    const state = getState();
    if (window.location.search.substr(1) === 'test') {
        setContext('adventure');
        state.selectedCharacter.autoplay = state.selectedCharacter.replay = true;
        state.selectedCharacter.currentLevelKey = 'testLevelData';
        startLevel(state.selectedCharacter, 'testLevelData');
    }
    state.visibleLevels['guild'] = true;
    if (state.savedState.skipShrinesEnabled) {
        query('.js-shrineButton').style.display = '';
    }
    updateItemsThatWillBeCrafted();
    updateEnchantmentOptions();
    centerMapOnLevel(map[state.selectedCharacter.currentLevelKey], true);
    drawMap();
    // The main loop will throw errors constantly if an error prevented selectedCharacter
    // from being set, so instead, just throw an error before running setInterval.
    if (!state.selectedCharacter) {
        throw new Error('No selected character found');
    }
    playTrack('map', 0);
}