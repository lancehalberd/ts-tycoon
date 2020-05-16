import { autoplayControls, toggleElement, query } from 'app/dom';
import { getState } from 'app/state';

const autoplayButton = query('.js-autoplayButton');
const repeatButton = query('.js-repeatButton');
const fastforwardButton = query('.js-fastforwardButton');
const slowMotionButton = query('.js-slowMotionButton');
const shrineButton = query('.js-shrineButton');
const pauseButton = query('.js-pauseButton');

function togglePause() {
    const state = getState();
    state.selectedCharacter.paused = !state.selectedCharacter.paused;
    updateAdventureButtons();
}
export function pause() {
    const state = getState();
    state.selectedCharacter.paused = true;
    updateAdventureButtons();
}

repeatButton.onclick = function () {
    const state = getState();
    state.selectedCharacter.replay = !state.selectedCharacter.replay;
    updateAdventureButtons();
};
pauseButton.onclick = togglePause;
autoplayButton.onclick = function () {
    const state = getState();
    state.selectedCharacter.autoplay = !state.selectedCharacter.autoplay;
    updateAdventureButtons();
};
fastforwardButton.onclick = function () {
    const state = getState();
    if (state.selectedCharacter.gameSpeed !== 3) {
        state.selectedCharacter.gameSpeed = 3;
        state.selectedCharacter.loopSkip = 1;
    } else {
        state.selectedCharacter.gameSpeed = 1;
    }
    updateAdventureButtons();
};
slowMotionButton.onclick = function () {
    const state = getState();
    if (state.selectedCharacter.loopSkip !== 5) {
        state.selectedCharacter.loopSkip = 5;
        state.selectedCharacter.gameSpeed = 1;
    } else {
        state.selectedCharacter.loopSkip = 1;
    }
    updateAdventureButtons();
};
shrineButton.onclick = function () {
    const state = getState();
    state.selectedCharacter.skipShrines = !state.selectedCharacter.skipShrines;
    updateAdventureButtons();
};

export function updateAdventureButtons() {
    const state = getState();
    // Hide autoplay controls entirely if not in an area that supports them.
    toggleElement(autoplayControls, !state.selectedCharacter.hero.area?.zoneKey);
    var character = state.selectedCharacter;
    autoplayButton.classList.toggle('disabled', !character.autoplay);
    if (character.autoplay) {
        repeatButton.style.display = '';
        fastforwardButton.style.display = '';
        slowMotionButton.style.display = '';
        shrineButton.style.display = '';
        repeatButton.classList.toggle('disabled', !character.replay);
        fastforwardButton.classList.toggle('disabled', character.gameSpeed !== 3);
        slowMotionButton.classList.toggle('disabled', character.loopSkip !== 5);
        shrineButton.classList.toggle('disabled', !!character.skipShrines);
    } else {
        repeatButton.style.display = 'none';
        fastforwardButton.style.display = 'none';
        slowMotionButton.style.display = 'none';
        shrineButton.style.display = 'none';
    }
    pauseButton.classList.toggle('disabled', !character.paused);
}
