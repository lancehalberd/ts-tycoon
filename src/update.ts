import { updateActorFrame } from 'app/actor';
import { getArea, returnToGuild, updateArea } from 'app/adventure';
import { refreshStatsPanel } from 'app/character';
import { updateTrophyPopups } from 'app/content/achievements';
import { areSoundsPreloaded, preloadSounds } from 'app/content/sounds';
import { updateEditArea } from 'app/development/editArea';
import { mainCanvas, query } from 'app/dom';
import { updateCraftingCanvas } from 'app/equipmentCrafting';
import {
    ADVENTURE_SCALE, ADVENTURE_WIDTH, FRAME_LENGTH,
    GROUND_Y, MISSION_ANIMATION_LENGTH,
} from 'app/gameConstants';
import { initializeGame } from 'app/initialize';
import { areAllImagesLoaded } from 'app/images';
import { updateMap } from 'app/map';
import { handleAdventureMouseIsDown } from 'app/main';
import { checkToRemovePopup } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { getMousePosition, isMouseDown } from 'app/utils/mouse';
import { isPlayingTrack } from 'app/utils/sounds';

import { Actor, Area, Character, Hero } from 'app/types';

let userInteracted = false;

document.body.addEventListener('click', registerInteraction);
function registerInteraction() {
    userInteracted = true;
    document.body.removeEventListener('click', registerInteraction);
}

export function areSoundsReady() {
    return areSoundsPreloaded() && (isPlayingTrack() || userInteracted);
}

let isGameInitialized = false;
preloadSounds();
export function update() {
    // Initially we don't do any of the main game logic until preloading finishes
    // then we initialize the game and start running the main game loop.
    if (!isGameInitialized) {
        // This used to be areAllImagesLoaded() && areSoundsReady()
        // but I didn't want to block the game display on clicking to play sound.play
        // We can play sound as soon as the user interacts.if
        if (areAllImagesLoaded() && areSoundsPreloaded())  {
            isGameInitialized = true;
            initializeGame();
        } else if (areAllImagesLoaded() && areSoundsPreloaded()) {
            query('.js-loading').innerText = 'Click to Play';
        }
        return;
    }
    if (updateEditArea()) {
        return;
    }
    try {
    const state = getState();
    //var characters = testingLevel ? [state.selectedCharacter] : state.characters;
    const characters = state.characters;
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    const activeGuildAreaHash = {};
    for (const character of characters) {
        const hero = character.hero;
        if (hero.character.context === 'cutscene') {
            // Cutscenes only update while you have that character selected.
            continue;
        }
        if (!hero.area) {
            if (hero.character.context !== 'map') {
                debugger;
            }
            updateActorFrame(hero);
            continue;
        }
        // Autogenerated areas have special timing controls related to autoplay.
        if (!hero.area.zoneKey) {
            if (!isCharacterPaused(character)) {
                character.loopCount = (character.loopCount || 0) + 1;
                const loopSkip = (character.autoplay) ? (character.loopSkip || 1) : 1;
                if (character.loopCount % loopSkip) break;
                const gameSpeed = (character.autoplay) ? character.gameSpeed : 1;
                for (let i = 0; i < gameSpeed && hero.area; i++) {
                    updateAreaCamera(hero);
                    updateArea(hero.area);
                }
            } else {
                // Always keep the actor's frame up to date.
                updateActorFrame(hero);
            }
        } else if (hero.area.zoneKey === 'guild') {
            // Multiple heroes can occupy the same guild area, so we update it after the characters loop.
            activeGuildAreaHash[hero.area.key] = true;
        } else if (character.mission) {
            const mission = character.mission;
            mission.animationTime += FRAME_LENGTH;
            const parameters = mission.parameters;
            if (mission.started) {
                mission.time += FRAME_LENGTH;
                updateAreaCamera(hero);
                updateArea(hero.area);
            }
            if (!mission.started && mission.animationTime >= MISSION_ANIMATION_LENGTH) {
                mission.started = true;
            }
            if (mission.failed || mission.completed) {
                if (mission.animationTime >= MISSION_ANIMATION_LENGTH) {
                    if (mission.completed) {
                        getState().savedState.completedMissions[mission.parameters.key] = true;
                        saveGame();
                    }
                    returnToGuild(character);
                }
            } else {
                if (mission.time > parameters.timeLimit) {
                    if (parameters.type === 'survive') {
                        mission.completed = true;
                        mission.failed = false;
                        mission.animationTime = 0;
                    } else {
                        mission.failed = true;
                        mission.animationTime = 0;
                    }
                }
                // These missions work the same except in `defeatTarget` not all enemis are targets.
                if (
                    (parameters.type === 'clearZone' || parameters.type === 'defeatTarget')
                    && mission.defeatedEnemies >= mission.totalEnemies
                ) {
                    mission.completed = true;
                    mission.failed = false;
                    mission.animationTime = 0;
                }
            }
        } else {
            // Any non-guild zone outside of a mission.
            updateAreaCamera(hero);
            updateArea(hero.area);
        }
    }
    const context = state.selectedCharacter.context;
    if (context === 'field' && isMouseDown()) {
        handleAdventureMouseIsDown(x, y);
    }
    if (context === 'map') {
        updateMap();
    }
    if (context === 'item') {
        updateCraftingCanvas();
    }
    if (context === 'cutscene') {
        state.cutscene.update();
    } else {
        // Don't update guild camera's during cutscene, as it could mess with the cutscene.
        for (let guildAreaKey in activeGuildAreaHash) {
            const area = getArea('guild', guildAreaKey);
            updateArea(area);
        }
        // Update the camera for the selected character if they are in the guild.
        if (state.selectedCharacter.hero.area?.zoneKey === 'guild') {
            updateAreaCamera(state.selectedCharacter.hero);
        }
    }
    checkToRemovePopup();
    updateTrophyPopups();
    } catch (e) {
        console.log(e.stack);
        debugger;
    }
}

const MAX_CAMERA_SPEED = 2;
function updateAreaCamera(hero: Hero) {
    const area = hero.area;
    if (!area) {
        return;
    }
    const targetCameraX = getTargetCameraX(hero);
    const newCameraX = Math.round((area.cameraX * 3 + targetCameraX) / 4);
    if (newCameraX - area.cameraX > MAX_CAMERA_SPEED) area.cameraX += MAX_CAMERA_SPEED;
    else if (newCameraX - area.cameraX < -MAX_CAMERA_SPEED) area.cameraX -= MAX_CAMERA_SPEED;
    else if (area.cameraX != newCameraX) area.cameraX = newCameraX;
    // We need this case to handle when newCameraX rounding prevents the target from being achieved.
    else area.cameraX = targetCameraX;
}

export function getTargetCameraX(hero: Hero) {
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    const area = hero.area;
    const RIGHT = ADVENTURE_WIDTH - 30;
    const LEFT = 30;
    let centerX = hero.x;
    const mouseX = Math.max(0, Math.min(ADVENTURE_WIDTH, x));
    if (hero.activity.type === 'move') {
        centerX = (centerX + hero.activity.x) / 2;
    } else if (hero.goalTarget && !hero.goalTarget.isDead) {
        centerX = (centerX + hero.goalTarget.x) / 2;
    } else if (hero.activity.type === 'interact') {
        centerX = (centerX + hero.activity.target.x) / 2;
    }
    if (mouseX > RIGHT) centerX = Math.max(centerX, hero.x) + (mouseX - RIGHT);
    else if (mouseX < LEFT) centerX = Math.min(centerX, hero.x) - (LEFT - mouseX);
    let target = Math.min(hero.x - 10, centerX - ADVENTURE_WIDTH / 2);
    target = Math.max(0, target);
    if (area.width) target = Math.min(area.width - ADVENTURE_WIDTH, target);
    // If a timestop is in effect, the caster must be in the frame.
    if (area.timeStopEffect) {
        const focusTarget = area.timeStopEffect.actor;
        target = Math.max(focusTarget.x + focusTarget.width + 20 - ADVENTURE_WIDTH, target);
        target = Math.min(focusTarget.x - 20, target);
    }
    return Math.round(target);
};

function isCharacterPaused(character: Character) {
    const hero = character.hero;
    // You aren't actually allowed to change contexts where pausing matters, but if we allow it,
    // this code would pause the game when the player is in a menu.
    if (character.context !== 'field') {
        return true;
    }
    if (!character.paused) return false;
    if (hero.activity.type !== 'none' || hero.skillInUse) return false;
    if (hero.chargeEffect) return false;
    if (!hero.area.enemies) return false;
    return true;
}
