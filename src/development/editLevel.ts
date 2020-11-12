import { startLevel } from 'app/adventure';
import { updateAdventureButtons } from 'app/adventureButtons';
import { setSelectedCharacter } from 'app/character';
import { abilities } from 'app/content/abilities';
import { areaTypes } from 'app/content/areas';
import { instantiateLevel } from 'app/content/levels';
import { characterClasses } from 'app/content/jobs';
import { map } from 'app/content/mapData';
import { monsters } from 'app/content/monsters';
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
    map[oldKey] = null;
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

export function handleEditMapKeyDown(keyCode: number): boolean {
    const { editingMap, testingLevel, editingLevel } = editingMapState;

    if (isEditingAllowed() && keyCode === 69 && getState().selectedCharacter.context === 'map') { // 'e'
        if (!editingMap) startMapEditing();
        else stopMapEditing();
        return true;
    }
    if (editingMap) {
        if (keyCode === 8) { // delete key
            event.preventDefault();
            editingMapState.selectedMapNodes.forEach(deleteLevel);
            editingMapState.selectedMapNodes = [];
        }
        if (keyCode === 27) { // escape key
            stopMapEditing();
        }
        if (keyCode === 67) { // 'c'
            exportMapToClipboard();
        }
        if (keyCode === 69) { // 'e'
            stopMapEditing();
        }
        return true
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
    map[level.levelKey] = null;
}

export function isEditingAllowed() {
    return true; //window.location.search.substr(1) === 'edit';
}
