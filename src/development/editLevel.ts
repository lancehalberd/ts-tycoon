import { startLevel } from 'app/adventure';
import { updateAdventureButtons } from 'app/adventureButtons';
import { setSelectedCharacter } from 'app/character';
import { abilities } from 'app/content/abilities';
import { areaTypes } from 'app/content/areaTypes';
import { instantiateLevel } from 'app/content/levels';
import { characterClasses } from 'app/content/jobs';
import { map } from 'app/content/mapData';
import { monsters } from 'app/content/monsters';
import { testCharacters } from 'app/development/testCharacters';
import { getElementIndex, handleChildEvent, mainCanvas, mainContext, query, queryAll, tagElement, toggleElements } from 'app/dom';
import { ADVENTURE_SCALE, MAP_LEFT, MAP_TOP, MAP_WIDTH, MAP_HEIGHT, WORLD_RADIUS } from 'app/gameConstants';
import { getMapTarget, mapLocation, mapState } from 'app/map';
import { exportCharacter, importCharacter } from 'app/saveGame';
import { getState } from 'app/state';
import { drawRunningAnts, rectangleFromPoints, rectanglesOverlap } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import { worldCamera } from 'app/WorldCamera';

import { Character, FullRectangle } from 'app/types';

export const editingMapState = {
    arrowTargetLeft: null,
    arrowTargetTop: null,
    clickedMapNode: null,
    selectedMapNodes: [],
    editingMap: false,
    editingLevel: null,
    editingLevelInstance: null,
    testingLevel: false,
}

let editingEventIndex;
let originalSelectedNodes = [];
let selectionStartPoint = null;

function optionElement(classes: string, label: string | number, value: string | number): HTMLOptionElement {
    const option: HTMLOptionElement = tagElement('option', classes, label) as HTMLOptionElement;
    option.value = '' + value;
    return option;
}
const levelSelect: HTMLSelectElement = query('.js-levelSelect') as HTMLSelectElement;
const backgroundSelect: HTMLSelectElement = query('.js-levelBackgroundSelect') as HTMLSelectElement;
const levelSkillSelect: HTMLSelectElement = query('.js-levelSkillSelect') as HTMLSelectElement;
const enemySkillSelect: HTMLSelectElement = query('.js-enemySkillSelect') as HTMLSelectElement;
const monstersContainer: HTMLElement = query('.js-monsters');
const monsterSelect: HTMLSelectElement = query('.js-monsterSelect') as HTMLSelectElement;
const characterSelect: HTMLSelectElement = query('.js-testCharacters') as HTMLSelectElement;

const nameInput: HTMLInputElement = query('.js-levelNameInput') as HTMLInputElement
const descriptionInput: HTMLInputElement = query('.js-levelDescriptionInput') as HTMLInputElement;

export function initializeLevelEditing() {
    for (let level = 1; level < 100; level++) {
        levelSelect.appendChild(optionElement('', 'Lv ' + level, level));
    }
    for (let areaKey in areaTypes) {
        backgroundSelect.appendChild(optionElement('', areaKey, areaKey));
    }
    levelSkillSelect.appendChild(optionElement('', 'none', ''));
    for (let skillKey in abilities) {
        const ability = abilities[skillKey];
        levelSkillSelect.appendChild(optionElement('', ability.name, skillKey));
        enemySkillSelect.appendChild(optionElement('', ability.name, skillKey));
    }
    for (let monsterKey in monsters) {
        monsterSelect.appendChild(optionElement('', monsters[monsterKey].name, monsterKey));
    }
    levelSelect.onchange = function () {
        editingMapState.editingLevel.level = Number(levelSelect.value);
        // Make a new instance since all the enemies and # waves need to be updated.
        editingMapState.editingLevelInstance = instantiateLevel(editingMapState.editingLevel);
    };
    nameInput.onchange = function () {
        let newName = nameInput.value;
        let newKey = newName.replace(/\s*/g, '').toLowerCase();
        while (map[newKey] && map[newKey] !== editingMapState.editingLevel) {
            newName += '+';
            newKey = newName.replace(/\s*/g, '').toLowerCase();
        }
        editingMapState.editingLevel.name = newName;
        nameInput.value = newName;
        updateMapKey(editingMapState.editingLevel.levelKey, newKey);
    }
    descriptionInput.onchange = updateLevelDescription;
    backgroundSelect.onchange = function () {
        editingMapState.editingLevelInstance.background = editingMapState.editingLevel.background = backgroundSelect.value;
    };
    levelSkillSelect.onchange = function () {
        const newSkill = levelSkillSelect.value;
        if (!newSkill) {
            editingMapState.editingLevel.skill = null;
            levelSkillSelect.setAttribute('helpText', 'No skill selected');
        } else {
            editingMapState.editingLevel.skill = newSkill;
            levelSkillSelect.setAttribute('helpText', `$ability$${newSkill}`);
        }
    }
    enemySkillSelect.onchange = function () {
        const newSkill = enemySkillSelect.value;
        editingMapState.editingLevel.enemySkills.push(newSkill);
        updateEnemySkills();
    };
    monsterSelect.onchange = function (event) {
        const select:HTMLSelectElement = event.target as HTMLSelectElement;
        const monsterKey = select.value;
        const monstersElement = select.closest('.js-monsters');
        if (monstersElement) {
            editingMapState.editingLevel.monsters.push(monsterKey);
            updateMonsters();
        } else {
            const eventElement = select.closest('.js-levelEvent');
            const eventIndex = [...eventElement.parentElement.children].indexOf(eventElement);
            editingMapState.editingLevel.events[eventIndex].push(monsterKey);
            updateEventMonsters();
        }
    };
    handleChildEvent('click', document.body, '.js-enemySkill', function (enemySkillElement) {
        const index = getElementIndex(enemySkillElement);
        enemySkillElement.remove();
        editingMapState.editingLevel.enemySkills.splice(index, 1);
    })
    handleChildEvent('click', document.body, '.js-monster', function (monsterElement: HTMLElement) {
        const monsterIndex = getElementIndex(monsterElement);
        const monstersContainer = monsterElement.closest('.js-monsters');
        if (monstersContainer) {
            editingMapState.editingLevel.monsters.splice(monsterIndex, 1);
        } else {
            const eventContainer = monsterElement.closest('.js-levelEvent') as HTMLElement;
            const eventIndex = getElementIndex(eventContainer);
            editingMapState.editingLevel.events[eventIndex].splice(monsterIndex, 1);
        }
        monsterElement.remove();
    });
    handleChildEvent('click', document.body, '.js-addLevelEvent', function (addEventElement: HTMLElement) {
        const eventContainer = addEventElement.closest('.js-levelEvent') as HTMLElement;
        if (eventContainer) {
            const eventIndex = getElementIndex(eventContainer);
            editingMapState.editingLevel.events.splice(eventIndex, 0, []);
        } else {
            editingMapState.editingLevel.events.push([]);
        }
        updateEventMonsters();
        // Make a new instance to show updated waves.
        editingMapState.editingLevelInstance = instantiateLevel(editingMapState.editingLevel);
    });
    handleChildEvent('click', document.body, '.js-removeLevelEvent', function (removeEventElement: HTMLElement) {
        const eventContainer = removeEventElement.closest('.js-levelEvent') as HTMLElement;
        const eventIndex = getElementIndex(eventContainer);
        editingMapState.editingLevel.events.splice(eventIndex, 1);
        updateEventMonsters();
        // Make a new instance to show updated waves.
        editingMapState.editingLevelInstance = instantiateLevel(editingMapState.editingLevel);
    });
    handleChildEvent('click', document.body, '.js-moveLevelEventUp', function (moveEventElement: HTMLElement) {
        const eventContainer = moveEventElement.closest('.js-levelEvent') as HTMLElement;
        const eventIndex = getElementIndex(eventContainer);
        if (eventIndex === 0) return;
        const tempEvent = editingMapState.editingLevel.events[eventIndex];
        editingMapState.editingLevel.events[eventIndex] = editingMapState.editingLevel.events[eventIndex - 1];
        editingMapState.editingLevel.events[eventIndex - 1] = tempEvent;
        updateEventMonsters();
    });
    handleChildEvent('click', document.body, '.js-moveLevelEventDown', function (moveEventElement: HTMLElement) {
        const eventContainer = moveEventElement.closest('.js-levelEvent') as HTMLElement;
        const eventIndex = getElementIndex(eventContainer);
        if (eventIndex >= editingMapState.editingLevel.events.length - 1) return;
        const tempEvent = editingMapState.editingLevel.events[eventIndex];
        editingMapState.editingLevel.events[eventIndex] = editingMapState.editingLevel.events[eventIndex + 1];
        editingMapState.editingLevel.events[eventIndex + 1] = tempEvent;
        updateEventMonsters();
    });
    handleChildEvent('click', document.body, '.js-testLevel', function () {
        const characterJson = characterSelect.value;
        if (!characterJson) return;
        const character = importCharacter(JSON.parse(characterJson));
        startTestingLevel(character);
    });
}
function updateLevelDescription() {
    if (editingMapState.editingLevel) {
        editingMapState.editingLevel.description = descriptionInput.value;
    }
}

function updateMonsters() {
    monstersContainer.innerHTML = '';
    editingMapState.editingLevel.monsters = editingMapState.editingLevel.monsters || [];
    for (const monsterKey of editingMapState.editingLevel.monsters) {
        const monsterElement = tagElement('span', 'js-monster monster', monsters[monsterKey].name);
        //TODO
        /*$enemySkill.attr('helpText', '-');
        $enemySkill.data('helpMethod', function () {
            return abilityHelpText(abilities[skillKey], state.selectedCharacter.adventurer);
        })*/
        monstersContainer.appendChild(monsterElement);
    }
    monstersContainer.appendChild(monsterSelect);
}

function updateEventMonsters() {
    const eventsContainer = query('.js-levelEvents');
    eventsContainer.innerText = '';
    editingMapState.editingLevel.events = editingMapState.editingLevel.events || [];
    for (const event of editingMapState.editingLevel.events) {
        const monsterSelectClone = monsterSelect.cloneNode(true);
        const eventElement = tagElement('li', 'js-levelEvent');
        eventElement.appendChild(tagElement('span', 'js-eventMonsters'));
        for (const monsterKey of event) {
            const monsterElement = tagElement('span', 'js-monster monster', monsters[monsterKey].name);
            eventElement.appendChild(monsterElement);
        }
        eventElement.appendChild(monsterSelectClone);
        eventElement.appendChild(tagElement('button', 'js-moveLevelEventUp editEventButton', ' ^ '));
        eventElement.appendChild(tagElement('button', 'js-moveLevelEventDown editEventButton', ' V '));
        eventElement.appendChild(tagElement('button', 'js-removeLevelEvent editEventButton', ' - '));
        eventsContainer.appendChild(eventElement);
    }
    // <div class="js-levelEvent"><span class="js-eventMonsters"><select class="js-monsterSelect"></select></span></div>
}

function updateEnemySkills() {
    const state = getState();
    const enemySkillsContainer = query('.js-enemySkills');
    enemySkillsContainer.innerText = '';
    editingMapState.editingLevel.enemySkills = editingMapState.editingLevel.enemySkills || [];
    editingMapState.editingLevel.enemySkills.forEach(function (skillKey) {
        const enemySkillElement = tagElement('span', 'js-enemySkill enemySkill', abilities[skillKey].name);
        enemySkillElement.setAttribute('helpText', '-');
        //TODO
        /*enemySkillElement.data('helpMethod', function () {
            return abilityHelpText(abilities[skillKey], state.selectedCharacter.adventurer);
        })*/
        enemySkillsContainer.appendChild(enemySkillElement);
    });
    enemySkillsContainer.appendChild(enemySkillSelect);
}

export function startEditingLevel(level) {
    if (!level) return
    const state = getState();
    editingMapState.editingLevel = level;
    const { editingLevel } = editingMapState;
    editingEventIndex = 0;
    mapState.currentMapTarget = null;
    editingMapState.editingMap = false;
    editingMapState.editingLevelInstance = instantiateLevel(editingLevel, 'normal', false);
    state.selectedCharacter.hero.x = 120;
    editingMapState.editingLevelInstance.cameraX = 0;
    state.selectedCharacter.adventurer.isDead = false;
    state.selectedCharacter.adventurer.timeOfDeath = undefined;
    toggleElements(queryAll('.js-editingControls'), true);
    levelSelect.selectedIndex = editingLevel.level - 1;
    const selectedBackgroundOption = query('.js-levelBackgroundSelect option[value="' + editingLevel.background + '"]') as HTMLOptionElement;
    selectedBackgroundOption.selected = true;

    toggleElements(queryAll('.js-levelSkillSelect option'), true);
    characterSelect.innerHTML = '';
    for (const characterData of testCharacters) {
        const job = characterClasses[characterData.hero.jobKey];
        const label = ['Lv',characterData.hero.level, job.name, characterData.hero.name].join(' ');
        characterSelect.appendChild(optionElement('', label, JSON.stringify(characterData)))
    }
    characterSelect.appendChild(optionElement('', '--Characters from Save--', null));
    for (const character of state.characters) {
        const label = ['Lv',character.hero.level, character.hero.job.name, character.hero.name].join(' ');
        characterSelect.appendChild(optionElement('', label, JSON.stringify(exportCharacter(character))));
    }
    // Hide skills already used by other levels.
    for (let otherLevelKey in map) {
        const otherLevel = map[otherLevelKey];
        if (otherLevel.skill) {
            query('.js-levelSkillSelect option[value="' + otherLevel.skill + '"]').style.display = 'none';
        }
    }
    // Hide class skills, they cannot be granted by levels.
    for (let classSkill in characterClasses) {
        const classSkllOption = query('.js-levelSkillSelect option[value="' + classSkill + '"]');
        if (classSkllOption) {
            classSkllOption.style.display = 'none';
        }
    }
    if (editingLevel.skill) {
        const currentLevelSkillOption
            = query('.js-levelSkillSelect option[value="' + editingLevel.skill + '"]') as HTMLOptionElement;
        currentLevelSkillOption.style.display = '';
        currentLevelSkillOption.selected = true;
    } else {
        levelSkillSelect.selectedIndex = 0;
    }
    nameInput.value  = editingLevel.name;
    descriptionInput.value = editingLevel.description || '';
    updateEnemySkills();
    updateMonsters();
    updateEventMonsters();
    updateEditingState();
}
function stopEditingLevel() {
    nameInput.blur();
    toggleElements(queryAll('.js-editingControls'), false);
    editingMapState.selectedMapNodes = [editingMapState.editingLevel];
    updateLevelDescription();
    editingMapState.editingLevel = editingMapState.editingLevelInstance = undefined;
    editingMapState.editingMap = true;
    updateEditingState();
}

function startTestingLevel(character: Character) {
    toggleElements(queryAll('.js-editingControls'), false);
    const state = getState();
    state.lastSelectedCharacter = state.selectedCharacter;
    setSelectedCharacter(character);
    startLevel(state.selectedCharacter, editingMapState.editingLevel.levelKey);
    editingMapState.testingLevel = true;
    updateEditingState();
}
export function stopTestingLevel() {
    toggleElements(queryAll('.js-editingControls'), true);
    const state = getState();
    state.selectedCharacter = state.lastSelectedCharacter;
    editingMapState.testingLevel = false;
    updateEditingState();
    updateAdventureButtons();
}

function updateMapKey(oldKey, newKey) {
    if (!map[oldKey]) return;
    for (let key in map) {
        const level = map[key];
        level.unlocks.forEach(function (value, index) {
            if (value === oldKey) {
                level.unlocks[index] = newKey;
            }
        })
    }
    const level = map[oldKey];
    level.levelKey = newKey;
    delete map[oldKey];
    map[newKey] = level;
}
function updateLevelKey(level) {
    if (!level) return;
    updateMapKey(level.levelKey, level.x + '_' + level.y);
}

function createNewLevel(coords: number[]) {
    const key = coords.map(n => n.toFixed(0)).join('_');
    const newMapTarget = {'x': 0, 'y': 0, coords, 'levelKey': key, 'name': key, 'unlocks': [], 'level': 1, 'background': 'field', 'specialLoot': [], 'skill': null, 'board': null, 'enemySkills': [], 'monsters': ['skeleton'], 'events': [['dragon']]};
    // If there already happens to be a level with this key, update it.
    updateLevelKey(map[key]);
    map[key] = newMapTarget;
    editingMapState.selectedMapNodes = [newMapTarget];
}

export function handleEditMapMouseDown(x, y, event: MouseEvent, newMapTarget) {
    if (event.which === 3) {
        if (!newMapTarget) {
            createNewLevel(worldCamera.unprojectPoint(x + MAP_LEFT, y + MAP_TOP, WORLD_RADIUS));
        } else {
            editingMapState.clickedMapNode = newMapTarget;
            editingMapState.selectedMapNodes = [newMapTarget];
        }
    } else if (!event.shiftKey) {
        if (newMapTarget) {
            editingMapState.clickedMapNode = newMapTarget;
            if (editingMapState.selectedMapNodes.indexOf(newMapTarget) < 0) {
                editingMapState.selectedMapNodes = [newMapTarget];
            }
        }
    } else {
        originalSelectedNodes = editingMapState.selectedMapNodes;
        selectionStartPoint = {x, y};
    }
}

export function handleEditMapMouseMove(x, y, event) {
    if (selectionStartPoint) {
        var endPoint = {x, y};
        var selectedRectangle = (rectangleFromPoints(selectionStartPoint, endPoint));
        editingMapState.selectedMapNodes = originalSelectedNodes.slice();
        for (let levelKey in mapState.visibleNodes) {
            const levelData = mapState.visibleNodes[levelKey];
            if (editingMapState.selectedMapNodes.indexOf(levelData) < 0 &&
                rectanglesOverlap(selectedRectangle, {left: levelData.x, top: levelData.y, width: levelData.w, height: levelData.h})) {
                editingMapState.selectedMapNodes.push(levelData);
            }
        }
        drawRunningAnts(mainContext, selectedRectangle);
    } else if (event.which === 3 && editingMapState.clickedMapNode) {
        editingMapState.arrowTargetLeft = x;
        editingMapState.arrowTargetTop = y;
    } else if (mapState.mapDragX !== null && mapState.mapDragY !== null) {
        if (editingMapState.clickedMapNode) {
            var dx = x - (editingMapState.clickedMapNode.left);
            var dy = y - (editingMapState.clickedMapNode.top);
            editingMapState.selectedMapNodes.forEach(function (mapNode) {
                mapNode.left += dx;
                mapNode.top += dy;
                mapNode.coords = worldCamera.unprojectPoint(mapNode.left + MAP_LEFT, mapNode.top + MAP_TOP, WORLD_RADIUS);
            })
            mapState.movedMap = true;
        } else {
            mapLocation.moveRight(mapState.mapDragX - x);
            mapLocation.moveUp(-(mapState.mapDragY - y));
            mapState.movedMap = true;
            mapState.mapDragX = x;
            mapState.mapDragY = y;
        }
    }
}

function toggleLevelLink(levelA, levelB) {
    var index = levelA.unlocks.indexOf(levelB.levelKey);
    if (index >= 0) {
        levelA.unlocks.splice(index, 1);
    } else {
        levelA.unlocks.push(levelB.levelKey);
    }
}

export function handleEditMapMouseUp(x, y, event) {
    editingMapState.arrowTargetLeft = null;
    editingMapState.arrowTargetTop = null;
    if (event.which === 3 && editingMapState.clickedMapNode && mapState.draggedMap) {
        const unlockedLevel = getMapTarget(x, y);
        if (unlockedLevel) {
            toggleLevelLink(editingMapState.clickedMapNode, unlockedLevel);
        }
    }
    selectionStartPoint = null;
    editingMapState.clickedMapNode = null;
    if (mapState.draggedMap) {
        mapState.draggedMap = false;
        return;
    }
    var newMapTarget = getMapTarget(x, y);
    if (newMapTarget) {
        if (event.shiftKey) {
            var index = editingMapState.selectedMapNodes.indexOf(newMapTarget);
            if (index >= 0) {
                editingMapState.selectedMapNodes.splice(index, 1);
            } else {
                editingMapState.selectedMapNodes.push(newMapTarget);
            }
        } else {
            editingMapState.selectedMapNodes = [newMapTarget];
        }
    } else {
        if (!event.shiftKey) {
            editingMapState.selectedMapNodes = [];
        }
    }
}

function startMapEditing() {
    mapState.movedMap = true;
    editingMapState.editingMap = true;
    updateEditingState();
}
function stopMapEditing() {
    mapState.movedMap = true;
    editingMapState.editingMap = false;
    updateEditingState();
}
function updateEditingState() {
    const isEditing = editingMapState.editingLevel || editingMapState.editingMap;
    // This is true if not editing or testing a level.
    const inAdventureMode = !!editingMapState.testingLevel || !editingMapState.editingLevel;
    toggleElements(queryAll('.js-pointsBar, .js-charactersBox'), inAdventureMode);
    //$('.js-mainCanvasContainer').css('height', '600px');
    mainCanvas.setAttribute('height', '' + MAP_HEIGHT);
    // Image smoothing seems to get enabled again after changing the canvas size, so disable it again.
    mainContext.imageSmoothingEnabled = false;
    // This doesn't appear to be a thing.
    //$('.js-recruitmentColumn').toggle(!isEditing);
    query('.js-mainCanvasContainer').style.top = inAdventureMode ? 'auto' : '-330px';
}

export function handleEditMapKeyDown(keycode: number): boolean {
    const { editingMap, testingLevel, editingLevel } = editingMapState;

    if (isEditingAllowed() && keycode === 69 && getState().selectedCharacter.context === 'map') { // 'e'
        if (mapState.currentMapTarget) {
            startEditingLevel(mapState.currentMapTarget);
            return true;
        }
        if (!editingLevel) {
            if (!editingMap) startMapEditing();
            else stopMapEditing();
            return true;
        }
    }
    if (editingMap) {
        if (keycode === 8) { // delete key
            event.preventDefault();
            editingMapState.selectedMapNodes.forEach(deleteLevel);
            editingMapState.selectedMapNodes = [];
        }
        if (keycode === 27) { // escape key
            stopMapEditing();
        }
        if (keycode === 67) { // 'c'
            exportMapToClipboard();
        }
        if (keycode === 69) { // 'e'
            stopMapEditing();
        }
        return true
    }

    if (keycode === 27 /*ESC*/|| keycode === 69 /*'e'*/) {
        if (testingLevel) {
            stopTestingLevel();
            return true;
        } else if (editingLevel) {
            stopEditingLevel();
            return true;
        }
    }
    if (testingLevel || editingLevel) {
        return true;
    }
}

const exportTextArea = tagElement('textarea') as HTMLTextAreaElement;
exportTextArea.setAttribute('rows', '5');
exportTextArea.setAttribute('cols', '30');
function exportMapToTextArea() {
    document.body.appendChild(exportTextArea);
    exportTextArea.value = exportMap();

}
function exportMapToClipboard() {
    const textareaElement = tagElement('textarea') as HTMLTextAreaElement;
    document.body.appendChild(textareaElement);
    textareaElement.value = exportMap();
    textareaElement.select();
    console.log('Attempting to export map to clipboard: ' + document.execCommand('copy'));
    textareaElement.remove();
}

function exportMap() {
    var lines = [];
    Object.keys(map).sort().forEach(function (levelKey) {
        var levelData = map[levelKey];
        var levelLines = ["    '" + levelKey+"': {"];
        if (levelKey === 'guild') {
            levelLines.push("        'name': " + JSON.stringify(levelData.name) + ",");
            levelLines.push("        'coords': " + JSON.stringify(levelData.coords.map(function (number) { return Number(number.toFixed(0));})) + ",");
            levelLines.push("        'unlocks': " + JSON.stringify(levelData.unlocks) + ",");
            levelLines.push("    }");
            lines.push(levelLines.join("\n"));
            return;
        }
        levelLines.push("        'name': " + JSON.stringify(levelData.name) + ",");
        levelLines.push("        'description': " + JSON.stringify(levelData.description || '') + ",");
        levelLines.push("        'level': " + JSON.stringify(levelData.level) + ",");
        levelLines.push("        'coords': " + JSON.stringify(levelData.coords.map(function (number) { return Number(number.toFixed(0));})) + ",");
        for (var key of ['background', 'unlocks', 'skill', 'enemySkills', 'monsters']) {
            levelLines.push("        '" + key + "': " + JSON.stringify(levelData[key]) + ",");
        }
        var eventLines = [];
        for (var event of levelData.events) {
            eventLines.push("            " + JSON.stringify(event));
        }
        if (eventLines.length) {
            levelLines.push("        'events': [");
            levelLines.push(eventLines.join(",\n"));
            levelLines.push("        ]");
        } else {
            levelLines.push("        'events': []");
        }
        levelLines.push("    }");
        lines.push(levelLines.join("\n"));
    });
    return "var map = {\n" + lines.join(",\n") + "\n};\nvar mapKeys = Object.keys(map);\n";
}

function deleteLevel(level) {
    for (let levelKey in map) {
        const otherLevel = map[levelKey];
        const index = otherLevel.unlocks.indexOf(level.levelKey);
        if (index >= 0) {
            otherLevel.unlocks.splice(index, 1);
        }
    }
    delete map[level.levelKey];
}

mainCanvas.addEventListener('dblclick', function (event) {
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (editingMapState.editingMap) {
        startEditingLevel(getMapTarget(x, y));
    }
});

export function isEditingAllowed() {
    return true; //window.location.search.substr(1) === 'edit';
}
