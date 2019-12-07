import { showAreaMenu } from 'app/areaMenu';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import {
    handleEditMapMouseDown,
    handleEditMapMouseMove,
    handleEditMapMouseUp,
} from 'app/development/editLevel';
import {
    handleChildEvent,
    mainCanvas,
    mouseContainer,
    query,
    tagElement,
    titleDiv,
    updateConfirmSkillConfirmationButtons,
} from 'app/dom';
import { WORLD_RADIUS } from 'app/gameConstants';
import { updateDamageInfo } from 'app/performAttack';
import { hidePointsPreview, previewPointsChange } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { isPointInRect } from 'app/utils/index';
import SphereVector from 'app/utils/SphereVector';
import Vector from 'app/utils/Vector';
import { worldCamera } from 'app/WorldCamera';

export const mapLocation = new SphereVector(WORLD_RADIUS);
let editingMap = false;
let movedMap = true;

var mapCenteringTarget = null, centerInstantly = false;
function updateMap() {
    if (draggedMap) {
        return;
    }
    if (mapCenteringTarget) {
        var differenceVector = new Vector(mapCenteringTarget.coords).subtract(mapLocation.position);
        var distance = differenceVector.magnitude();
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
        var iterations = centerInstantly ? distance / 5 : distance / 50;
        for (var i = 0; i < iterations; i++) {
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
export function centerMapOnLevel(levelData, instant = false) {
    centerInstantly = instant;
    mapCenteringTarget = levelData;
    movedMap = true;
}

export const mapState = {
    draggedMap: false,
    visibleNodes: {},
    currentMapTarget: null,
};

function getMapPopupTarget(x, y) {
    var newMapTarget = null;
    if (!draggedMap) {
        newMapTarget = getMapPopupTargetProper(x, y);
    }
    if (newMapTarget !== currentMapTarget) {
        const state = getState();
        var level = newMapTarget ? (newMapTarget.isShrine ? newMapTarget.level.level : newMapTarget.level) : undefined;
        updateDamageInfo(state.selectedCharacter, $('.js-characterColumn .js-stats'), level);
    }
    if ((currentMapTarget && currentMapTarget.isShrine) && !(newMapTarget && newMapTarget.isShrine)) {
        hidePointsPreview();
    }
    currentMapTarget = newMapTarget;
    mainCanvas.classList.toggle('clickable', !!currentMapTarget);
    return currentMapTarget;
}
function getMapPopupTargetProper(x, y) {
    if (editingLevel) {
        return null;
    }
    var newMapTarget = getMapTarget(x, y);
    if (!newMapTarget) {
        return null;
    }
    if (newMapTarget.isShrine) {
        newMapTarget.helpMethod = getMapShrineHelpText;
        var skill = abilities[newMapTarget.level.skill];
        if (!state.selectedCharacter.adventurer.unlockedAbilities[skill.key]) {
            var totalCost = totalCostForNextLevel(state.selectedCharacter, newMapTarget.level);
            previewPointsChange('divinity', -totalCost);
        }
    } else {
        newMapTarget.helpMethod = getMapLevelHelpText;
    }
    return newMapTarget;
}

function getMapLevelHelpText(level) {
    var helpText;
    if (level.levelKey === 'guild') {
        return titleDiv('Guild');
    }
    if (!editingMap) {
        helpText = titleDiv('Level ' + level.level + ' ' + level.name);
    } else {
        helpText = '<p style="font-weight: bold">Level ' + level.level + ' ' + level.name +'(' + level.background +  ')</p><br/>';
        helpText += '<p><span style="font-weight: bold">Enemies:</span> ' + level.monsters.map(function (monsterKey) { return monsters[monsterKey].name;}).join(', ') + '</p>';
        if (level.events) {
            helpText += '<p><span style="font-weight: bold"># Events: </span> ' + level.events.length + '</p>';
            if (level.events.length) {
                helpText += '<p><span style="font-weight: bold">Boss Event: </span> ' + level.events[level.events.length - 1].map(function (monsterKey) { return monsters[monsterKey].name;}).join(', ') + '</p>';
            }
        } else {
            helpText += '<p style="font-weight: bold; color: red;">No Events!</p>';
        }
        helpText += '<p><span style="font-weight: bold">Enemy Skills:</span> ' + ifdefor(level.enemySkills, []).map(function (skillKey) { return abilities[skillKey].name;}).join(', ') + '</p>';
        helpText += '<br/><p style="font-weight: bold">Teaches:</p>';
        var skill = abilities[level.skill];
        if (skill) {
            helpText += abilityHelpText(skill, state.selectedCharacter.adventurer);
        } else {
            helpText += '<p>No Skill</p>';
        }
    }
    return helpText;
}
function getMapShrineHelpText(shrine) {
    var skill = abilities[shrine.level.skill];
    var totalCost = totalCostForNextLevel(state.selectedCharacter, shrine.level);
    var helpText = ''
    var skillAlreadyLearned = state.selectedCharacter.adventurer.unlockedAbilities[skill.key];
    if (!skillAlreadyLearned && state.selectedCharacter.adventurer.level >= maxLevel) {
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

export function getMapTarget(x, y) {
    var target = null;
    for (let levelKey in mapState.visibleNodes) {
        const levelData = mapState.visibleNodes[levelKey];
        if (isPointInRect(x, y, levelData.left, levelData.top, levelData.width, levelData.height)) {
            target = levelData;
            return false;
        }
        if (!editingMap && levelData.shrine && isPointInRect(x, y, levelData.shrine.left, levelData.shrine.top, levelData.shrine.width, levelData.shrine.height)) {
            target = levelData.shrine;
            return false;
        }
        return true;
    });
    return target;
}

function toggleLevelLink(levelA, levelB) {
    var index = levelA.unlocks.indexOf(levelB.levelKey);
    if (index >= 0) {
        levelA.unlocks.splice(index, 1);
    } else {
        levelA.unlocks.push(levelB.levelKey);
    }
}

var mapDragX = mapDragY = null, draggedMap = false;
var selectionStartPoint = null;
var originalSelectedNodes = [];

// Disable context menu while editing the map because the right click is used for making nodes and edges.
mainCanvas.oncontextmenu = function (event) {
    return !editingMap;
};
function handleMapMouseDown(x, y, event) {
    //console.log(camera.unprojectPoint(x + mapLeft, y + mapTop, WORLD_RADIUS));
    const newMapTarget = getMapTarget(x, y);
    if (editingMap) {
        handleEditMapMouseDown(x, y, event, newMapTarget);
    }
    if (event.which != 1) return; // Handle only left click.
    if (!editingMap && newMapTarget) {
        if (currentMapTarget.levelKey === 'guild') {
            currentMapTarget = null;
            setContext('guild');
            return;
        } else if (currentMapTarget.isShrine) {
            // Show them the area menu if they click on the shrine from a different area.
            state.selectedCharacter.selectedLevelKey = currentMapTarget.level.levelKey;
            showAreaMenu();
            currentMapTarget = null;
            $('.js-mainCanvas').toggleClass('clickable', false);
            return;
        } else if (currentMapTarget.levelKey) {
            state.selectedCharacter.selectedLevelKey = currentMapTarget.levelKey;
            showAreaMenu();
            currentMapTarget = null;
            $('.js-mainCanvas').toggleClass('clickable', false);
            return;
        }
    }
    draggedMap = false;
    mapDragX = x;
    mapDragY = y;
}
$('.js-mouseContainer').on('dblclick', '.js-mainCanvas', function (event) {
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    if (editingMap) {
        startEditingLevel(getMapTarget(x, y));
    }
});
/*$('.js-mouseContainer').on('click', '.js-mainCanvas', function (event) {
    console.log('click');
});*/
document.addEventListener('mouseup', function (event) {
    var x = event.pageX - $('.js-mainCanvas').offset().left;
    var y = event.pageY - $('.js-mainCanvas').offset().top;
    mapDragX = mouseDragY = null;
    if (editingMap) {
        handleEditMapMouseUp(x, y, event);
    }
    if (mapState.draggedMap) {
        mapStatedraggedMap = false;
        return;
    }
});
$('.js-mouseContainer').on('mousemove', function (event) {
    if (!mouseDown && !rightMouseDown) return;
    if (state.selectedCharacter.context !== 'map') return;
    draggedMap = true;
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    if (editingMap) {
        handleEditMapMouseMove(x, y, event);
    } else if (mapDragX !== null && mapDragY !== null) {
        mapLocation.moveRight((mapDragX - x));
        mapLocation.moveUp(-(mapDragY - y));
        movedMap = true;
        mapDragX = x;
        mapDragY = y;
    }
});

$('body').on('click', '.js-confirmSkill', function (event) {
    var character = state.selectedCharacter;
    var level = map[character.currentLevelKey];
    var skill = character.board.boardPreview.fixed[0].ability;
    character.divinity -= totalCostForNextLevel(character, level);
    character.adventurer.abilities.push(skill);
    character.adventurer.unlockedAbilities[skill.key] = true;
    character.board.spaces = character.board.spaces.concat(character.board.boardPreview.spaces);
    character.board.fixed = character.board.fixed.concat(character.board.boardPreview.fixed);
    character.board.boardPreview.fixed.forEach(function (jewel) {
        jewel.confirmed = true;
        removeBonusSourceFromObject(character.adventurer, character.jewelBonuses, false);
        updateAdjacentJewels(jewel);
        updateJewelBonuses(character);
        addBonusSourceToObject(character.adventurer, character.jewelBonuses, true);
    });
    character.board.boardPreview = null;
    drawBoardBackground(character.boardContext, character.board);
    gainLevel(character.adventurer);
    updateConfirmSkillConfirmationButtons();
    saveGame();
    setTimeout(function () {
        setContext('adventure');
        finishShrine(character);
    }, 500);
});
handleChildEvent('click', document.body, '.js-cancelSkill', () => {
    setContext('adventure');
});
function unlockMapLevel(levelKey) {
    state.visibleLevels[levelKey] = true;
}

