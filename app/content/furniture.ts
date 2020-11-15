import { getArea } from 'app/adventure';
import { addBonusSourceToObject, removeBonusSourceFromObject } from 'app/bonuses';
import { zones } from 'app/content/zones';
import { recomputeAllCharacterDirtyStats } from 'app/character';
import { getState } from 'app/state';

import { Area, AreaObject } from 'app/types';

export function addFurnitureBonuses(this: void, furniture: AreaObject, recompute = false): void {
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
    if (recompute) {
        recomputeAllCharacterDirtyStats();
    }
}
export function removeFurnitureBonuses(this: void, furniture: AreaObject, recompute = false): void {
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
    if (recompute) {
        recomputeAllCharacterDirtyStats();
    }
}

export function addAllUnlockedFurnitureBonuses(this: void): void {
    for (let areaKey in zones.guild) {
        if (!getState().savedState.unlockedGuildAreas[areaKey]) {
            continue;
        }
        addAreaFurnitureBonuses(getArea('guild', areaKey));
    }
    recomputeAllCharacterDirtyStats();
}

export function addAreaFurnitureBonuses(this: void, guildArea: Area, recompute = false): void {
    for (const layer of guildArea.layers) {
        for (const object of layer.objects) {
            addFurnitureBonuses(object, false);
        }
    }
    if (recompute) {
        recomputeAllCharacterDirtyStats();
    }
}

export function removeAreaFurnitureBonuses(this: void, guildArea: Area, recompute = false): void {
    for (const layer of guildArea.layers) {
        for (const object of layer.objects) {
            removeFurnitureBonuses(object, false);
        }
    }
    if (recompute) {
        recomputeAllCharacterDirtyStats();
    }
}
