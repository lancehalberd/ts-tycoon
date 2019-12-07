import { updateAdventureButtons } from 'app/adventureButtons';
import { abilities } from 'app/content/abilities';
import { backgrounds } from 'app/content/backgrounds';
import { instantiateLevel } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { monsters } from 'app/content/monsters';
import { query, tagElement } from 'app/dom';
import { getMapTarget, mapLocation, mapState } from 'app/map';
import { getState } from 'app/state';

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

function optionElement(classes, label, value): HTMLOptionElement {
    const option: HTMLOptionElement = tagElement('option', classes, label) as HTMLOptionElement;
    option.value = value;
    return option;
}
const levelSelect: HTMLSelectElement = query('.js-levelSelect') as HTMLSelectElement;
const backgroundSelect: HTMLSelectElement = query('.js-levelBackgroundSelect') as HTMLSelectElement;
const levelSkillSelect: HTMLSelectElement = query('.js-levelSkillSelect') as HTMLSelectElement;
const enemySkillSelect: HTMLSelectElement = query('.js-enemySkillSelect') as HTMLSelectElement;
const monsterSelect: HTMLSelectElement = query('.js-monsterSelect') as HTMLSelectElement;

const nameInput: HTMLInputElement = query('.js-levelNameInput') as HTMLInputElement

export function initializeLevelEditing() {
    for (let level = 1; level < 100; level++) {
        levelSelect.append(optionElement('', 'Lv ' + level, level));
    }
    for (let backgroundKey in backgrounds) {
        backgroundSelect.append(optionElement('', backgroundKey, backgroundKey));
    }
    levelSkillSelect.append(optionElement('', 'none', ''));
    for (let skillKey in abilities) {
        const ability = abilities[skillKey];
        levelSkillSelect.append(optionElement('', ability.name, skillKey));
        enemySkillSelect.append(optionElement('', ability.name, skillKey));
    }
    for (let monsterKey in monsters) {
        monsterSelect.append(optionElement('', monsters[monsterKey].name, monsterKey));
    }
    levelSelect.onchange = function () {
        editingLevel.level = Number($(this).val());
        // Make a new instance since all the enemies and # waves need to be updated.
        editingLevelInstance = instantiateLevel(editingLevel);
    };
    nameInput.onchange = function () {
        let newName = nameInput.value;
        let newKey = newName.replace(/\s*/g, '').toLowerCase();
        while (map[newKey] && map[newKey] !== editingLevel) {
            newName += '+';
            newKey = newName.replace(/\s*/g, '').toLowerCase();
        }
        editingLevel.name = newName;
        nameInput.value = newName;
        updateMapKey(editingLevel.levelKey, newKey);
    }
    query('.js-levelDescriptionInput').onchange = updateLevelDescription;
    backgroundSelect.onchange = function () {
        editingLevelInstance.background = editingLevel.background = backgroundSelect.value;
    };
    levelSkillSelect.onchange = function () {
        const newSkill = levelSkillSelect.value;
        if (!newSkill) {
            editingLevel.skill = null;
        } else {
            editingLevel.skill = newSkill;
        }
    }
    levelSkillSelect.setAttribute('helpText', '-');
    // TODO: find another way to store help method on an element
    /*levelSkillSelect.data('helpMethod', function ($element) {
        var value = $element.val();
        if (!value) return 'No skill selected';
        return abilityHelpText(abilities[value], state.selectedCharacter.adventurer);
    });*/
    enemySkillSelect.onchange = function () {
        const newSkill = enemySkillSelect.value;
        editingLevel.enemySkills.push(newSkill);
        updateEnemySkills();
    };
    monsterSelect.onchange = function (event) {
        const select:HTMLSelectElement = event.target as HTMLSelectElement;
        const monsterKey = select.value;
        const monstersElement = select.closest('.js-monsters');
        if (monstersElement) {
            editingLevel.monsters.push(monsterKey);
            updateMonsters();
        } else {
            const eventElement = select.closest('.js-levelEvent');
            const eventIndex = [...eventElement.parentElement.children].indexOf(eventElement);
            editingLevel.events[eventIndex].push(monsterKey);
            updateEventMonsters();
        }
    };
    $(document).on('click', '.js-enemySkill', function () {
        var index = $(this).index();
        $(this).remove();
        editingLevel.enemySkills.splice(index, 1);
    });
    $(document).on('click', '.js-monster', function () {
        var monsterIndex = $(this).index();
        if ($(this).closest('.js-monsters').length) {
            editingLevel.monsters.splice(monsterIndex, 1);
        } else {
            var $eventDiv = $(this).closest('.js-levelEvent');
            var eventIndex = $eventDiv.index();
            editingLevel.events[eventIndex].splice(monsterIndex, 1);
        }
        $(this).remove();
    });
    $(document).on('click', '.js-addLevelEvent', function () {
        var $event = $(this).closest('.js-levelEvent');
        if ($event.length) {
            var eventIndex = $event.index();
            editingLevel.events.splice(eventIndex, 0, []);
        } else {
            editingLevel.events.push([]);
        }
        updateEventMonsters();
        // Make a new instance to show updated waves.
        editingLevelInstance = instantiateLevel(editingLevel);
    });
    $(document).on('click', '.js-removeLevelEvent', function () {
        var eventIndex = $(this).closest('.js-levelEvent').index();
        editingLevel.events.splice(eventIndex, 1);
        updateEventMonsters();
        // Make a new instance to show updated waves.
        editingLevelInstance = instantiateLevel(editingLevel);
    });
    $(document).on('click', '.js-moveLevelEventUp', function () {
        var eventIndex = $(this).closest('.js-levelEvent').index();
        if (eventIndex === 0) return;
        var tempEvent = editingLevel.events[eventIndex];
        editingLevel.events[eventIndex] = editingLevel.events[eventIndex - 1];
        editingLevel.events[eventIndex - 1] = tempEvent;
        updateEventMonsters();
    });
    $(document).on('click', '.js-moveLevelEventDown', function () {
        var eventIndex = $(this).closest('.js-levelEvent').index();
        if (eventIndex >= editingLevel.events.length - 1) return;
        var tempEvent = editingLevel.events[eventIndex];
        editingLevel.events[eventIndex] = editingLevel.events[eventIndex + 1];
        editingLevel.events[eventIndex + 1] = tempEvent;
        updateEventMonsters();
    });
    $(document).on('click', '.js-testLevel', function(event) {
        var characterJson = $('.js-testCharacters').val();
        if (!characterJson) return;
        var character = importCharacter(JSON.parse(characterJson));
        startTestingLevel(character);
    });
}
function updateLevelDescription() {
    if (editingLevel) editingLevel.description = $('.js-levelDescriptionInput').val();
}

function updateMonsters() {
    $('.js-monsters .js-monsterSelect').prevAll().remove();
    editingLevel.monsters = ifdefor(editingLevel.monsters, []);
    editingLevel.monsters.forEach(function (monsterKey) {
        var $monster = tagElement('span', 'js-monster monster', monsters[monsterKey].name);
        /*$enemySkill.attr('helpText', '-');
        $enemySkill.data('helpMethod', function () {
            return abilityHelpText(abilities[skillKey], state.selectedCharacter.adventurer);
        })*/
        $('.js-monsters .js-monsterSelect').before($monster);
    });
}

function updateEventMonsters() {
    $('.js-levelEvents').empty();
    editingLevel.events = ifdefor(editingLevel.events, []);
    editingLevel.events.forEach(function (event) {
        var $eventMonsterSelect = $('.js-monsterSelect').first().clone();
        var $event = tagElement('li', 'js-levelEvent').append(tagElement('span', 'js-eventMonsters')
                .append($eventMonsterSelect)
                .append(tagElement('button', 'js-moveLevelEventUp editEventButton', ' ^ '))
                .append(tagElement('button', 'js-moveLevelEventDown editEventButton', ' V '))
                .append(tagElement('button', 'js-removeLevelEvent editEventButton', ' - ')));
        event.forEach(function (monsterKey) {
            var $monster = tagElement('span', 'js-monster monster', monsters[monsterKey].name);
            $eventMonsterSelect.before($monster);
        });
        $('.js-levelEvents').append($event);
    });

    // <div class="js-levelEvent"><span class="js-eventMonsters"><select class="js-monsterSelect"></select></span></div>
}

function updateEnemySkills() {
    levelSkillSelect.prevAll().remove();
    editingLevel.enemySkills = ifdefor(editingLevel.enemySkills, []);
    editingLevel.enemySkills.forEach(function (skillKey) {
        var $enemySkill = tagElement('span', 'js-enemySkill enemySkill', abilities[skillKey].name);
        $enemySkill.attr('helpText', '-');
        $enemySkill.data('helpMethod', function () {
            return abilityHelpText(abilities[skillKey], state.selectedCharacter.adventurer);
        })
        levelSkillSelect.before($enemySkill);
    });
}

let editingEventIndex;

function startEditingLevel(level) {
    if (!level) return
    const state = getState();
    editingMapState.editingLevel = level
    editingEventIndex = 0;
    currentMapTarget = null;
    editingMapState.editingMap = false;
    editingMapState.editingLevelInstance = instantiateLevel(editingLevel, 'normal', false);
    state.selectedCharacter.x = 120;
    editingMapState.editingLevelInstance.cameraX = 0;
    state.selectedCharacter.startTime = state.selectedCharacter.time;
    state.selectedCharacter.adventurer.isDead = false;
    state.selectedCharacter.adventurer.timeOfDeath = undefined;
    state.selectedCharacter.finishTime = false;
    $('.js-editingControls').show();
    $('.js-levelSelect option').eq(editingLevel.level - 1).prop('selected', true);
    $('.js-levelBackgroundSelect option[value="' + editingLevel.background + '"]').prop('selected', true);

    $('.js-levelSkillSelect option').show();
    $('.js-testCharacters').empty();
    for (var characterData of testCharacters) {
        var job = characterClasses[characterData.adventurer.jobKey];
        $('.js-testCharacters').append(tagElement('option','', ['Lv',characterData.adventurer.level, job.name, characterData.adventurer.name].join(' ')).val(JSON.stringify(characterData)));
    }
    $('.js-testCharacters').append(tagElement('option','', '--Characters from Save--').val(null));
    for (var character of state.characters) {
        $('.js-testCharacters').append(tagElement('option','', ['Lv',character.adventurer.level, character.adventurer.job.name, character.adventurer.name].join(' ')).val(JSON.stringify(exportCharacter(character))));
    }
    // Hide skills already used by other levels.
    for (var otherLevelKey in map) {
        var otherLevel = map[otherLevelKey];
        if (otherLevel.skill) $('.js-levelSkillSelect option[value="' + otherLevel.skill + '"]').hide();
    }
    // Hide class skills, they cannot be granted by levels.
    for (var classSkill in characterClasses) {
        $('.js-levelSkillSelect option[value="' + classSkill + '"]').hide();
    }
    if (editingLevel.skill) {
        $('.js-levelSkillSelect option[value="' + editingLevel.skill + '"]').show().prop('selected', true);
    } else {
        $('.js-levelSkillSelect option').first().prop('selected', true);
    }
    $('.js-levelNameInput').val(editingLevel.name);
    $('.js-levelDescriptionInput').val(ifdefor(editingLevel.description, ''));
    updateEnemySkills();
    updateMonsters();
    updateEventMonsters();
    updateEditingState();
}
function stopEditingLevel() {
    $('.js-levelNameInput').blur();
    $('.js-editingControls').hide();
    editingMapState.selectedMapNodes = [editingLevel];
    updateLevelDescription();
    editingLevel = editingLevelInstance = undefined;
    editingMap = true;
    updateEditingState();
}

function startTestingLevel(character) {
    $('.js-editingControls').hide();
    state.lastSelectedCharacter = state.selectedCharacter;
    setSelectedCharacter(character);
    startLevel(state.selectedCharacter, editingLevel.levelKey);
    testingLevel = true;
    updateEditingState();
}
function stopTestingLevel() {
    $('.js-editingControls').show();
    state.selectedCharacter = state.lastSelectedCharacter;
    testingLevel = false;
    updateEditingState();
    updateAdventureButtons();
}


function updateMapKey(oldKey, newKey) {
    if (!map[oldKey]) return;
    $.each(map, function (key, level) {
        level.unlocks.forEach(function (value, index) {
            if (value === oldKey) {
                level.unlocks[index] = newKey;
            }
        })
    });
    var level = map[oldKey];
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

export function handleEditMapMouseDown(x, y, event) {
    if (event.which === 3) {
        if (!newMapTarget) {
            createNewLevel(camera.unprojectPoint(x + mapLeft, y + mapTop, WORLD_RADIUS));
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
        $.each(visibleNodes, function (levelKey, levelData) {
            if (editingMapState.selectedMapNodes.indexOf(levelData) < 0 && rectanglesOverlap(selectedRectangle, levelData)) {
                editingMapState.selectedMapNodes.push(levelData);
            }
        });
        drawRunningAnts(mainContext, selectedRectangle);
    } else if (event.which === 3 && editingMapState.clickedMapNode) {
        arrowTargetLeft = x;
        arrowTargetTop = y;
    } else if (mapDragX !== null && mapDragY !== null) {
        if (editingMapState.clickedMapNode) {
            var dx = x - (editingMapState.clickedMapNode.left);
            var dy = y - (editingMapState.clickedMapNode.top);
            editingMapState.selectedMapNodes.forEach(function (mapNode) {
                mapNode.left += dx;
                mapNode.top += dy;
                mapNode.coords = camera.unprojectPoint(mapNode.left + mapLeft, mapNode.top + mapTop, WORLD_RADIUS);
            })
            movedMap = true;
        } else {
            mapLocation.moveRight((mapDragX - x));
            mapLocation.moveUp(-(mapDragY - y));
            movedMap = true;
            mapDragX = x;
            mapDragY = y;
        }
    }
}

export function handleEditMapMouseUp(x, y, event) {
    editingMapState.arrowTargetLeft = null;
    editingMapState.arrowTargetTop = null;
    if (event.which === 3 && editingMapState.clickedMapNode && draggedMap) {
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
});

function startMapEditing() {
    movedMap = true;
    editingMap = true;
    updateEditingState();
}
function stopMapEditing() {
    movedMap = true;
    editingMap = false;
    updateEditingState();
}
function updateEditingState() {
    var isEditing = editingLevel || editingMap;
    // This is true if not editing or testing a level.
    var inAdventureMode = !!testingLevel || !editingLevel;
    $('.js-pointsBar, .js-charactersBox').toggle(inAdventureMode);
    //$('.js-mainCanvasContainer').css('height', '600px');
    $('.js-mainCanvas').attr('height', mapHeight);
    // Image smoothing seems to get enabled again after changing the canvas size, so disable it again.
    $('.js-mainCanvas')[0].getContext('2d').imageSmoothingEnabled = false;
    $('.js-recruitmentColumn').toggle(!isEditing);
    $('.js-mainCanvasContainer').css('top', inAdventureMode ? 'auto' : '-330px');
}

export function handleEditMapKeyDown(keycode: number): boolean {
    const { editingMap, testingLevel, editingLevel } = editingMapState;

    if (isEditingAllowed() && event.which === 69 && state.selectedCharacter.context === 'map') { // 'e'
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
    var $textarea = $tag('textarea');
    $('body').append($textarea);
    $textarea.val(exportMap());
    $textarea[0].select();
    console.log('Attempting to export map to clipboard: ' + document.execCommand('copy'));
    $textarea.remove();
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
    $.each(map, function (levelKey, otherLevel) {
        var index = otherLevel.unlocks.indexOf(level.levelKey);
        if (index >= 0) {
            otherLevel.unlocks.splice(index, 1);
        }
    });
    delete map[level.levelKey];
}
