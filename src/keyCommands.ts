import { enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { guildYardEntrance } from 'app/content/guild';
import { handleSkillKeyInput } from 'app/drawSkills';
import { handleEditMapKeyDown } from 'app/development/editLevel';
import { hideHeroApplication } from 'app/heroApplication';
import { mapState } from 'app/map';
import { getState } from 'app/state';

export const KEY_ESCAPE = 27;
export const KEY_C = 67;
export const KEY_I = 73;
export const KEY_J = 74;
export const KEY_L = 76;
export const KEY_M = 77;

document.onkeydown = function(event) {
    const keycode: number = event.which;
    if (handleSkillKeyInput(keycode)) return;
    if (handleEditMapKeyDown(keycode)) return;
    const state = getState();
    if (keycode === KEY_ESCAPE) {
        event.preventDefault();
        if (state.selectedCharacter.context === 'map') {
            hideAreaMenu();
            else if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            } else {
                setContext('guild');
            }
        } else if (state.selectedCharacter.context === 'jewel' || state.selectedCharacter.context === 'item') {
            if (state.selectedCharacter.hero.area && !state.selectedCharacter.hero.area.isGuildArea) {
                setContext('adventure');
            } else {
                setContext('guild');
            }
        }
        if (state.selectedCharacter.context === 'adventure' || state.selectedCharacter.context === 'guild') {
            hideHeroApplication();
            choosingTrophyAltar = null;
            upgradingObject = null;
        }
    }
    if (isEditingAllowed()) {
        if (keycode === KEY_C) {
            pasteCharacterToClipBoard(state.selectedCharacter);
        }
        if (keycode === KEY_L) {
            if (mapState.currentMapTarget && mapState.currentMapTarget.levelKey) {
                state.selectedCharacter.currentLevelKey = mapState.currentMapTarget.levelKey;
                if (!state.selectedCharacter.completionTime) {
                    state.selectedCharacter.completionTime = 100;
                } else {
                    state.selectedCharacter.completionTime -= 10;
                }
                completeLevel(state.selectedCharacter.hero, state.selectedCharacter.completionTime);
            }
        }
    }
    if ((keycode === KEY_C || keycode === KEY_I)  && state.guildStats.hasItemCrafting) {
        if (state.selectedCharacter.context === 'item') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('item');
    }
    if (keycode === KEY_J && state.guildStats.hasJewelCrafting) {
        if (state.selectedCharacter.context === 'jewel') setContext('guild');
        else if (state.selectedCharacter.context !== 'adventure') setContext('jewel');
    }
    if (keycode === KEY_M && state.guildStats.hasMap) {
        // Unlock the first areas on the map if they aren't unlocked yet.
        for (var levelKey of map.guild.unlocks) {
            state.visibleLevels[levelKey] = true;
        }
        if (state.selectedCharacter.context === 'map') {
            if (!state.selectedCharacter.hero.area) {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            } else {
                setContext('guild');
            }
        } else if (state.selectedCharacter.context !== 'adventure') openWorldMap(state.selectedCharacter.adventurer);
    }
});