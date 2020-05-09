import { getArea } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getState } from 'app/state';

import { Area, AreaObject } from 'app/types';

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
    for (let areaKey in getState().savedState.unlockedGuildAreas) {
        const area = getArea('guild', areaKey);
        if (!area) {
            continue;
        }
        addAreaFurnitureBonuses(area);
    }
    recomputeAllCharacterDirtyStats();
}

export function addAreaFurnitureBonuses(guildArea: Area, recompute = false) {
    for (const object of guildArea.objects) addFurnitureBonuses(object, false);
    if (recompute) recomputeAllCharacterDirtyStats();
}
