import { enterArea, messageCharacter } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getIsAltarTrophyAvailable, setChoosingTrophyAltar, trophySelectionRectangle } from 'app/content/achievements';
import { isPointOverAreaTarget } from 'app/content/areas/AreaObjectTarget';
import { map } from 'app/content/mapData';
import { getUpgradeRectangle, setUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import { bodyDiv, mainCanvas, mainContext, mouseContainer, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { ADVENTURE_SCALE, GROUND_Y } from 'app/gameConstants';
import { createNewHeroApplicant, hideHeroApplication, showHeroApplication } from 'app/heroApplication';
import {
    drawImage,
    drawOutlinedImage,
    drawSourceWithOutline,
    drawTintedImage,
    drawTitleRectangle, requireImage
} from 'app/images';
import { attemptToApplyCost, canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { fillRectangle, isPointInShortRect, rectangle, shrinkRectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

import {
    Actor, Area, AreaObject, AreaObjectTarget, BonusSource, Character, Exit, FixedObject,
    GuildArea, Hero,
} from 'app/types';

mouseContainer.addEventListener('mousedown', function (event) {
    if (event.which !== 1) {
        return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('.js-heroApplication')) hideHeroApplication();
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (!isPointInShortRect(x, y, trophySelectionRectangle)) setChoosingTrophyAltar(null);
    if (!isPointInShortRect(x, y, getUpgradeRectangle())) setUpgradingObject(null);
});

/*function isGuildObjectEnabled(this: FixedObject) {
    if (!this.area) debugger;
    return getState().savedState.unlockedGuildAreas[this.area.key] && !this.area.enemies.length;
}
function isGuildExitEnabled(this: FixedObject) {
    //if (this.area.key === 'guildFoyer') debugger;
    // A door can be used if the are is unlocked.
    if (isGuildObjectEnabled.call(this)) {
        return true;
    }
    //if (this.area.key === 'guildFoyer') debugger;
    // It can also be used if the area it is connected to is unlocked.
    return getState().savedState.unlockedGuildAreas[this.exit.areaKey];
}*/



export function addFurnitureBonuses(furniture: AreaObject, recompute = false) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    const bonusSources = furniture.getActiveBonusSources();
    for (const bonusSource of bonusSources) {
        // Multiple copies of the same furniture will have the same bonus source, so this check is not valid.
        /*if (guildBonusSources.indexOf(bonusSource) >= 0) {
            console.log(bonusSource);
            console.log(guildBonusSources);
            throw new Error('bonus source was already present in guildBonusSources!');
        }*/
        state.guildBonusSources.push(bonusSource);
        addBonusSourceToObject(state.guildVariableObject, bonusSource);
        for (const character of state.characters) {
            addBonusSourceToObject(character.hero.variableObject, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}
export function removeFurnitureBonuses(furniture: AreaObject, recompute = false) {
    if (!furniture.getActiveBonusSources) return;
    const state = getState();
    const bonusSources = furniture.getActiveBonusSources();
    for (const bonusSource of bonusSources) {
        if (state.guildBonusSources.indexOf(bonusSource) < 0) {
            console.log(bonusSource);
            console.log(state.guildBonusSources);
            throw new Error('bonus source was not found in guildBonusSources!');
        }
        state.guildBonusSources.splice(state.guildBonusSources.indexOf(bonusSource), 1);
        removeBonusSourceFromObject(state.guildVariableObject, bonusSource);
        for (const character of state.characters) {
            removeBonusSourceFromObject(character.hero.variableObject, bonusSource);
        }
    }
    if (recompute) recomputeAllCharacterDirtyStats();
}

export function addAllUnlockedFurnitureBonuses() {
    const state = getState();
    for (let areaKey in state.savedState.unlockedGuildAreas) {
        if (!state.guildAreas[areaKey]) {
            console.log('warning, no area for ', areaKey);
            continue;
        }
        addAreaFurnitureBonuses(state.guildAreas[areaKey]);
    }
    recomputeAllCharacterDirtyStats();
}

export function addAreaFurnitureBonuses(guildArea: GuildArea, recompute = false) {
    for (const object of guildArea.objects) addFurnitureBonuses(object, false);
    if (recompute) recomputeAllCharacterDirtyStats();
}
