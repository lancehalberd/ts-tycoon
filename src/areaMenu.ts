import { getGoldTimeLimit, getSilverTimeLimit, startLevel } from 'app/adventure';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { query, toggleElements } from 'app/dom';
import { centerMapOnLevel } from 'app/map';
import { getState } from 'app/state';

import { Character, LevelData, LevelDifficulty } from 'app/types';

const areaMenuElement = query('.js-areaMenu');
const easyDifficulty = query('.js-areaMenu .js-easyDifficulty');
const normalDifficulty = query('.js-areaMenu .js-normalDifficulty');
const hardDifficulty = query('.js-areaMenu .js-hardDifficulty');
const challengeDifficulty = query('.js-areaMenu .js-challengeDifficulty');
// Currently this is unused.
challengeDifficulty.style.display = 'none';
const endlessDifficulty = query('.js-areaMenu .js-endlessDifficulty');

export function hideAreaMenu() {
    areaMenuElement.style.display = 'none';
}

const levelDifficulties: LevelDifficulty[] = ['easy', 'normal', 'hard'];

export function showAreaMenu() {
    const state = getState();
    const selectedLevel = map[state.selectedCharacter.selectedLevelKey];
    if (!selectedLevel) return;
    centerMapOnLevel(selectedLevel);
    // Do this in timeout so that it happens after the check for hiding the areaMenu...
    setTimeout(function () {
        areaMenuElement.style.display = '';
        toggleElements(areaMenuElement.querySelectorAll('.js-areaMenu .js-areaMedal'), false);
        const times = state.selectedCharacter.levelTimes[selectedLevel.levelKey] || {};
        for (const difficulty of levelDifficulties) {
            if (!times[difficulty]) continue;
            const medal = query('.js-areaMenu .js-' + difficulty + 'Difficulty .js-areaMedal');
            medal.classList.remove('bronzeMedal', 'silverMedal', 'goldMedal');
            if (times[difficulty] < getGoldTimeLimit(selectedLevel, difficulty)) {
                medal.classList.add('goldMedal');
            } else if (times[difficulty] < getSilverTimeLimit(selectedLevel, difficulty)) {
                medal.classList.add('silverMedal');
            } else {
                medal.classList.add('bronzeMedal');
            }
            medal.style.display = '';
        }
        hardDifficulty.style.display  = state.savedState.completedLevels[selectedLevel.levelKey] ? '' : 'none';

        if (times['hard']) {
            endlessDifficulty.innerText
                = 'Endless -' + getEndlessLevel(state.selectedCharacter, selectedLevel) + '-';
            endlessDifficulty.style.display = '';
        } else {
            endlessDifficulty.style.display = 'none';
        }
        query('.js-areaMenu .js-areaTitle').innerText
            = 'Lv ' + selectedLevel.level + ' ' + selectedLevel.name;
        query('.js-areaMenu .js-areaDescription').innerHTML
            = selectedLevel.description || 'No description';
    }, 0);
}

easyDifficulty.onclick = () => selectDifficulty('easy');
normalDifficulty.onclick = () => selectDifficulty('normal');
hardDifficulty.onclick = () => selectDifficulty('hard');
endlessDifficulty.onclick = () => selectDifficulty('endless');

function selectDifficulty(difficulty: LevelDifficulty) {
    hideAreaMenu();
    const state = getState();
    state.selectedCharacter.levelDifficulty = difficulty;
    setContext('field');
    startLevel(state.selectedCharacter, state.selectedCharacter.selectedLevelKey);
}

export function getEndlessLevel(character: Character, level: LevelData): number {
    const times = character.levelTimes[level.levelKey] || {};
    return times['endless'] || level.level + 5;
}

// Close the area menu if the user clicks off of it.
// TODO: attach this only when area menu is shown, and just call hideAreaMenu and rely
// on stopping propogation from areaMenuElement to not hide it when clicked.
document.addEventListener('mousedown', function (event) {
    if (event.which !== 1) {
        return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('.js-areaMenu')) {
        hideAreaMenu();
    }
});
