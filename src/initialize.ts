// Load any graphic assets needed by the game here.
import { enterArea } from 'app/adventure';
import { initializeVariableObject } from 'app/bonuses';
import { allApplications } from 'app/content/furniture';
import { guildYardEntrance } from 'app/content/guild';
import { initializeMonsters } from 'app/content/monsters';
import { showContext } from 'app/context';
import { initializeLevelEditing } from 'app/development/editLevel';
import { query } from 'app/dom';
import { initializeCraftingGrid } from 'app/equipmentCrafting';
import { initializeImages } from 'app/images';
import { centerMapOnLevel } from 'app/map';
import { gain } from 'app/points';
import { eraseSave, loadSavedData } from 'app/saveGame';
import Random from 'app/utils/Random';
import { playTrack } from 'app/utils/sounds';

let gameHasBeenInitialized = false;
export function isGameInitialized() {
    return gameHasBeenInitialized;
}
export function initializeGame() {
    gameHasBeenInitialized = true;
    initializeMonsters();
    initializeCraftingGrid();
    initializeImages();
    initializeLevelEditing();
    query('.js-loading').style.display = 'none';
    query('.js-gameContent').style.display = '';

    // var testShape = makeShape(0, 0, 0, shapeDefinitions.triangle[0]).scale(originalJewelScale);
    if (window.location.search.substr(1) === 'new') {
        if (confirm('Are you sure you want to clear your saved data? This cannot be undone.')) {
            eraseSave();
        }
    }
    /*if (loadSavedData()) {
        showContext(state.selectedCharacter.context);
    } else {
        initializeVariableObject(state.guildStats, {'variableObjectType': 'guild'}, state.guildStats);
        addBonusSourceToObject(state.guildStats, implicitGuildBonusSource);
        addAllUnlockedFurnitureBonuses();
        gainJewel(makeJewel(1, 'triangle', [90, 5, 5], 1.1));
        gainJewel(makeJewel(1, 'triangle', [5, 90, 5], 1.1));
        gainJewel(makeJewel(1, 'triangle', [5, 5, 90], 1.1));
        gain('fame', 1);
        gain('coins', 50);
        gain('anima', 0);
        var jobKey = Random.element(jobRanks[0]);
        jobKey = ifdefor(testJob, jobKey);
        var startingCharacter = newCharacter(characterClasses[jobKey]);
        updateAdventurer(startingCharacter.adventurer);
        hireCharacter(startingCharacter);
        var otherKeys = jobRanks[0].slice();
        removeElementFromArray(otherKeys, jobKey, true);
        for (var i = 0; i < allApplications.length && otherKeys.length; i++) {
            allApplications[i].character = createNewHeroApplicant(otherKeys.pop());
        }
        enterArea(state.selectedCharacter.hero, guildYardEntrance);
    }
    if (window.location.search.substr(1) === 'test') {
        setContext('adventure');
        state.selectedCharacter.autoplay = state.selectedCharacter.replay = true;
        state.selectedCharacter.currentLevelKey = 'testLevelData';
        startLevel(state.selectedCharacter, 'testLevelData');
    }
    state.visibleLevels['guild'] = true;
    if (state.skipShrinesEnabled) {
        $('.js-shrineButton').show();
    }
    updateItemsThatWillBeCrafted();
    updateEnchantmentOptions();
    centerMapOnLevel(map[state.selectedCharacter.currentLevelKey], true);
    drawMap();
    // The main loop will throw errors constantly if an error prevented selectedCharacter
    // from being set, so instead, just throw an error before running setInterval.
    if (!state.selectedCharacter) {
        throw new Error('No selected character found');
    }*/
    playTrack(soundTrack.map);
}