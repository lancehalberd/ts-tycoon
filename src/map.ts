import { showAreaMenu } from 'app/areaMenu';
import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { gainLevel, totalCostForNextLevel } from 'app/character';
import { abilities } from 'app/content/abilities';
import { finishShrine, updateSkillConfirmationButtons } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { drawBoardBackground } from 'app/drawBoard';
import {
    editingMapState,
    handleEditMapMouseDown,
    handleEditMapMouseMove,
    handleEditMapMouseUp,
    startEditingLevel,
} from 'app/development/editLevel';
import {
    handleChildEvent,
    mainCanvas,
    mouseContainer,
    query,
    tagElement,
    titleDiv,
} from 'app/dom';
import { MAX_LEVEL, WORLD_RADIUS } from 'app/gameConstants';
import { abilityHelpText } from 'app/helpText'
import { updateAdjacentJewels, updateJewelBonuses } from 'app/jewels';
import { updateDamageInfo } from 'app/performAttack';
import { hidePointsPreview, previewPointsChange } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { isPointInRect, isPointInShortRect } from 'app/utils/index';
import { getMousePosition, isMouseDown, isRightMouseDown } from 'app/utils/mouse';
import SphereVector from 'app/utils/SphereVector';
import Vector from 'app/utils/Vector';
import { worldCamera } from 'app/WorldCamera';

import { LevelData, MapTarget, ShortRectangle, Shrine } from 'app/types';

export const mapLocation = new SphereVector(WORLD_RADIUS);

let mapCenteringTarget: LevelData = null, centerInstantly = false;
export function updateMap() {
    if (mapState.draggedMap) {
        return;
    }
    if (mapCenteringTarget) {
        let differenceVector = new Vector(mapCenteringTarget.coords).subtract(mapLocation.position);
        const distance = differenceVector.magnitude();
        if (distance < 40) {
            mapCenteringTarget = null;
            return;
        }
        differenceVector = differenceVector.orthoganalize(mapLocation.position);
        // In the unlikely event differenceVector is parallel to mapLocation.position,
        // it will not be valid and we need to choose a random vector
        if (isNaN(differenceVector.getCoordinate(1))) {
            differenceVector.orthoganalize(new Vector([Math.random(), Math.random(), Math.random()]));
        }
        // This should never happen, so if it does, it probably means I did something wrong.
        if (isNaN(differenceVector.getCoordinate(1))) {
            console.log("failed to generate valid difference vector.");
            return;
        }
        differenceVector = differenceVector.normalize(5);
        const iterations = centerInstantly ? distance / 5 : distance / 50;
        for (let i = 0; i < iterations; i++) {
            mapLocation.moveByVector(differenceVector);
            // Fix the camera position each step, otherwise the up/right vectors
            // may not match what is being displayed any more.
            worldCamera.position = mapLocation.position.normalize(WORLD_RADIUS * 2);
            worldCamera.forward = worldCamera.position.normalize(-1);
            worldCamera.fixRightAndUp();
            worldCamera.updateRotationMatrix();
        }
    }
}
export function centerMapOnLevel(levelData: LevelData, instant = false) {
    centerInstantly = instant;
    mapCenteringTarget = levelData;
    mapState.movedMap = true;
}

export const mapState : {
    draggedMap: boolean,
    visibleNodes: {[key: string]: LevelData},
    currentMapTarget: MapTarget,
    mapDragX: number,
    mapDragY: number,
    movedMap: boolean,
} = {
    draggedMap: false,
    visibleNodes: {},
    currentMapTarget: null,
    mapDragX: null,
    mapDragY: null,
    movedMap: true,
};

export function getMapPopupTarget(x: number, y: number): MapTarget {
    let newMapTarget: MapTarget;
    if (!mapState.draggedMap) {
        newMapTarget = getMapPopupTargetProper(x, y);
    }
    if (newMapTarget !== mapState.currentMapTarget) {
        const state = getState();
        var level = newMapTarget ? (newMapTarget.targetType === 'shrine' ? newMapTarget.level.level : newMapTarget.level) : undefined;
        updateDamageInfo(state.selectedCharacter, query('.js-characterColumn .js-stats'), level);
    }
    if ((mapState.currentMapTarget && mapState.currentMapTarget.targetType === 'shrine') && !(newMapTarget && newMapTarget.targetType === 'shrine')) {
        hidePointsPreview();
    }
    mapState.currentMapTarget = newMapTarget;
    mainCanvas.classList.toggle('clickable', !!mapState.currentMapTarget);
    return mapState.currentMapTarget;
}
function getMapPopupTargetProper(x: number, y: number): MapTarget {
    if (editingMapState.editingLevel) {
        return null;
    }
    const newMapTarget: MapTarget  = getMapTarget(x, y);
    if (!newMapTarget) {
        return null;
    }
    if (newMapTarget.targetType === 'shrine') {
        newMapTarget.helpMethod = getMapShrineHelpText;
        const skill = abilities[newMapTarget.level.skill];
        const { selectedCharacter } = getState();
        if (!selectedCharacter.adventurer.unlockedAbilities[skill.key]) {
            const totalCost = totalCostForNextLevel(selectedCharacter, newMapTarget.level);
            previewPointsChange('divinity', -totalCost);
        }
    } else {
        newMapTarget.helpMethod = getMapLevelHelpText;
    }
    return newMapTarget;
}

function getMapLevelHelpText(level: LevelData): string {
    if (level.levelKey === 'guild') {
        return titleDiv('Guild');
    }
    if (!editingMapState.editingMap) {
        return titleDiv('Level ' + level.level + ' ' + level.name);
    }
    let helpText = '<p style="font-weight: bold">Level ' + level.level + ' ' + level.name +'(' + level.background +  ')</p><br/>';
    helpText += '<p><span style="font-weight: bold">Enemies:</span> ' +
        level.monsters.map(k => monsters[k].name).join(', ') + '</p>';
    if (level.events) {
        helpText += '<p><span style="font-weight: bold"># Events: </span> ' + level.events.length + '</p>';
        if (level.events.length) {
            helpText += '<p><span style="font-weight: bold">Boss Event: </span> ' +
                level.events[level.events.length - 1].map(k => monsters[k].name).join(', ') + '</p>';
        }
    } else {
        helpText += '<p style="font-weight: bold; color: red;">No Events!</p>';
    }
    helpText += '<p><span style="font-weight: bold">Enemy Skills:</span> ' +
        (level.enemySkills || []).map(k => abilities[k].name).join(', ') + '</p>';
    helpText += '<br/><p style="font-weight: bold">Teaches:</p>';
    const skill = abilities[level.skill];
    if (skill) {
        helpText += abilityHelpText(skill, getState().selectedCharacter.adventurer);
    } else {
        helpText += '<p>No Skill</p>';
    }
    return helpText;
}
function getMapShrineHelpText(shrine: Shrine): string {
    const state = getState();
    var skill = abilities[shrine.level.skill];
    var totalCost = totalCostForNextLevel(state.selectedCharacter, shrine.level);
    var helpText = ''
    var skillAlreadyLearned = state.selectedCharacter.adventurer.unlockedAbilities[skill.key];
    if (!skillAlreadyLearned && state.selectedCharacter.adventurer.level >= MAX_LEVEL) {
        helpText += '<p style="font-size: 12">' + state.selectedCharacter.adventurer.name + ' has reached the maximum level and can no longer learn new abilities.</p><br/>';
    } else if (!skillAlreadyLearned && state.selectedCharacter.divinity < totalCost) {
        helpText += '<p style="font-size: 12">' + state.selectedCharacter.adventurer.name + ' does not have enough divinity to learn the skill from this shrine.</p><br/>';
    }
    if (!skillAlreadyLearned) {
        helpText += '<p style="font-weight: bold">Spend ' + totalCost + ' divinity at this shrine to level up and learn:</p>' + abilityHelpText(skill, state.selectedCharacter.adventurer);
    } else {
        helpText += '<p style="font-size: 12px">' + state.selectedCharacter.adventurer.name + ' has already learned:</p>' + abilityHelpText(skill, state.selectedCharacter.adventurer);
    }
    return helpText;
}

export function getMapTarget(x: number, y: number): MapTarget {
    for (let levelKey in mapState.visibleNodes) {
        const levelData = mapState.visibleNodes[levelKey];
        if (isPointInShortRect(x, y, levelData as ShortRectangle)) {
            return levelData;
        }
        if (!editingMapState.editingMap && levelData.shrine && isPointInShortRect(x, y, levelData.shrine)) {
            return levelData.shrine;
        }
    }
    return null;
}

// Disable context menu while editing the map because the right click is used for making nodes and edges.
mainCanvas.oncontextmenu = function (event) {
    return !editingMapState.editingMap;
};
export function handleMapMouseDown(x: number, y: number, event) {
    //console.log(camera.unprojectPoint(x + MAP_LEFT, y + MAP_TOP, WORLD_RADIUS));
    const newMapTarget = getMapTarget(x, y);
    if (editingMapState.editingMap) {
        handleEditMapMouseDown(x, y, event, newMapTarget);
    }
    if (event.which != 1) return; // Handle only left click.
    if (!editingMapState.editingMap && newMapTarget) {
        const state = getState();
        if (mapState.currentMapTarget.targetType === 'shrine') {
            // Show them the area menu if they click on the shrine from a different area.
            state.selectedCharacter.selectedLevelKey = mapState.currentMapTarget.level.levelKey;
            showAreaMenu();
            mapState.currentMapTarget = null;
            mainCanvas.classList.toggle('clickable', false);
            return;
        } else if (mapState.currentMapTarget.levelKey === 'guild') {
            mapState.currentMapTarget = null;
            setContext('guild');
            return;
        } else if (mapState.currentMapTarget.levelKey) {
            state.selectedCharacter.selectedLevelKey = mapState.currentMapTarget.levelKey;
            showAreaMenu();
            mapState.currentMapTarget = null;
            mainCanvas.classList.toggle('clickable', false);
            return;
        }
    }
    mapState.draggedMap = false;
    mapState.mapDragX = x;
    mapState.mapDragY = y;
}
/*$('.js-mouseContainer').on('click', '.js-mainCanvas', function (event) {
    console.log('click');
});*/
document.addEventListener('mouseup', function (event) {
    const [x, y] = getMousePosition(mainCanvas);
    mapState.mapDragX = mapState.mapDragY = null;
    if (editingMapState.editingMap) {
        handleEditMapMouseUp(x, y, event);
    }
    if (mapState.draggedMap) {
        mapState.draggedMap = false;
        return;
    }
});
document.addEventListener('mousemove', function (event) {
    if (!isMouseDown() && !isRightMouseDown()) return;
    if (getState().selectedCharacter.context !== 'map') return;
    mapState.draggedMap = true;
    const [x, y] = getMousePosition(mouseContainer);
    if (editingMapState.editingMap) {
        handleEditMapMouseMove(x, y, event);
    } else if (mapState.mapDragX !== null && mapState.mapDragY !== null) {
        mapLocation.moveRight((mapState.mapDragX - x));
        mapLocation.moveUp(-(mapState.mapDragY - y));
        mapState.movedMap = true;
        mapState.mapDragX = x;
        mapState.mapDragY = y;
    }
});

handleChildEvent('click', document.body, '.js-confirmSkill', function (confirmButton) {
    const character = getState().selectedCharacter;
    const level = map[character.currentLevelKey];
    const skill = character.board.boardPreview.fixed[0].ability;
    character.divinity -= totalCostForNextLevel(character, level);
    character.adventurer.abilities.push(skill);
    character.adventurer.unlockedAbilities[skill.key] = true;
    character.board.spaces = character.board.spaces.concat(character.board.boardPreview.spaces);
    character.board.fixed = character.board.fixed.concat(character.board.boardPreview.fixed);
    character.board.boardPreview.fixed.forEach(function (jewel) {
        jewel.confirmed = true;
        removeBonusSourceFromObject(character.hero.variableObject, character.jewelBonuses, false);
        updateAdjacentJewels(jewel);
        updateJewelBonuses(character);
        addBonusSourceToObject(character.hero.variableObject, character.jewelBonuses, true);
    });
    character.board.boardPreview = null;
    drawBoardBackground(character.boardContext, character.board);
    gainLevel(character.adventurer);
    updateSkillConfirmationButtons();
    saveGame();
    setTimeout(function () {
        setContext('adventure');
        finishShrine(character);
    }, 500);
});
handleChildEvent('click', document.body, '.js-cancelSkill', () => {
    setContext('adventure');
});
export function unlockMapLevel(levelKey: string) {
    getState().visibleLevels[levelKey] = true;
}

