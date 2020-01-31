import { updateArea } from 'app/adventure';
import { refreshStatsPanel } from 'app/character';
import { updateTrophyPopups } from 'app/content/achievements';
import { mainCanvas, query } from 'app/dom';
import { updateCraftingCanvas } from 'app/equipmentCrafting';
import { FRAME_LENGTH, GROUND_Y } from 'app/gameConstants';
import { initializeGame } from 'app/initialize';
import { areAllImagesLoaded } from 'app/images';
import { updateMap } from 'app/map';
import { handleAdventureMouseIsDown } from 'app/main';
import { checkToRemovePopup } from 'app/popup';
import { getState } from 'app/state';
import { getMousePosition, isMouseDown } from 'app/utils/mouse';
import { areAllSoundsLoaded } from 'app/utils/sounds';

import { Actor, Area, Character, Hero } from 'app/types';

let isGameInitialized = false;
export function update() {
    // Initially we don't do any of the main game logic until preloading finishes
    // then we initialize the game and start running the main game loop.
    if (!isGameInitialized) {
        if (areAllImagesLoaded() && areAllSoundsLoaded())  {
            isGameInitialized = true;
            initializeGame();
        }
        return;
    }
    try {
    const state = getState();
    //var characters = testingLevel ? [state.selectedCharacter] : state.characters;
    const characters = state.characters;
    const [x, y] = getMousePosition(mainCanvas);
    const activeGuildAreaHash = {};
    for (const character of characters) {
        const hero = character.hero;
        if (character.context === 'guild' ||
            (character.context === 'adventure' && !isCharacterPaused(character))
        ) {
            character.loopCount = (character.loopCount || 0) + 1;
            const loopSkip = (character.autoplay) ? (character.loopSkip || 1) : 1;
            if (character.loopCount % loopSkip) break;
            const gameSpeed = (character.autoplay) ? character.gameSpeed : 1;
            for (let i = 0; i < gameSpeed  && character.adventurer.area; i++) {
                character.time += FRAME_LENGTH / 1000;
                if (character.context === 'adventure') {
                    updateAreaCamera(hero.area, hero);
                    updateArea(hero.area);
                } else if (character.context === 'guild') {
                    activeGuildAreaHash[character.hero.area.key] = true;
                }
            }
        }
    }
    for (let guildAreaKey in activeGuildAreaHash) {
        updateAreaCamera(state.guildAreas[guildAreaKey], state.selectedCharacter.hero);
        updateArea(state.guildAreas[guildAreaKey]);
    }
    const context = state.selectedCharacter.context;
    if (isMouseDown() && (context === 'adventure' || context === 'guild')) {
        handleAdventureMouseIsDown(x, y);
    }
    if (context === 'map') {
        updateMap();
    }
    if (context === 'item') {
        updateCraftingCanvas();
    }
    checkToRemovePopup();
    updateTrophyPopups();
    } catch (e) {
        console.log(e.stack);
        debugger;
    }
}

function updateAreaCamera(area: Area, hero: Hero) {
    // Only update the camera for the guild for the selected character, but
    // always update the camera for characters in adventure areas.
    if (hero.area === area || (area && !area.isGuildArea)) {
        const targetCameraX = getTargetCameraX(hero);
        area.cameraX = Math.round((area.cameraX * 15 + targetCameraX) / 16);
    }
}

export function getTargetCameraX(hero: Hero) {
    const [x, y] = getMousePosition(mainCanvas);
    const area = hero.area;
    let centerX = hero.x;
    const mouseX = Math.max(0, Math.min(800, x));
    if (hero.activity.type === 'move') {
        centerX = (centerX + hero.activity.x) / 2;
    } else if (hero.goalTarget && !hero.goalTarget.isDead) {
        centerX = (centerX + hero.goalTarget.x) / 2;
    }
    if (mouseX > 700) centerX = centerX + (mouseX - 700) / 2;
    else if (mouseX < 100) centerX = centerX + (mouseX - 100) / 2;
    let target = Math.min(hero.x - 20, centerX - 400);
    target = Math.max(area.left || 0, target);
    if (area.width) target = Math.min(area.width - 800, target);
    // If a timestop is in effect, the caster must be in the frame.
    if (area.timeStopEffect) {
        const focusTarget = area.timeStopEffect.actor;
        target = Math.max(focusTarget.x + focusTarget.width + 64 - 800, target);
        target = Math.min(focusTarget.x - 64, target);
    }
    return Math.round(target);
};

function isCharacterPaused(character: Character) {
    const hero = character.hero;
    if (!character.paused) return false;
    if (hero.activity.type !== 'none' || hero.skillInUse) return false;
    if (hero.chargeEffect) return false;
    if (!hero.area.enemies) return false;
    return true;
}
