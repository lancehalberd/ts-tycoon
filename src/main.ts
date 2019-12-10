import { getDistanceBetweenPointsSquared, leaveCurrentArea, limitZ } from 'app/adventure';
import { setSelectedCharacter } from 'app/character';
import { getChoosingTrophyAltar } from 'app/content/achievements';
import { getUpgradingObject } from 'app/content/furniture';
import { setContext } from 'app/context';
import {
    getElementIndex, handleChildEvent, mainCanvas,
    query, queryAll, toggleElements,
} from 'app/dom';
import { getSelectedAction, setSelectedAction } from 'app/drawSkills';
import { GROUND_Y } from 'app/gameConstants';
import { handleMapMouseDown } from 'app/map';
import { checkToShowMainCanvasToolTip, getCanvasPopupTarget } from 'app/popup'
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { canUseSkillOnTarget } from 'app/useSkill';
import { toolTipColor } from 'app/utils/colors';
import { getMousePosition } from 'app/utils/mouse';

let canvasCoords = null;
export function getCanvasCoords() {
    return canvasCoords;
}
mainCanvas.addEventListener('mousemove', function () {
    const [x, y] = getMousePosition(mainCanvas);
    canvasCoords = [x, y];
    checkToShowMainCanvasToolTip(x, y);
});
var clickedToMove = false;

mainCanvas.onmousedown = function (event) {
    const [x, y] = getMousePosition(mainCanvas);
    canvasCoords = [x, y];
    canvasCoords = getMousePosition(mainCanvas);
    switch (getState().selectedCharacter.context) {
        case 'adventure':
        case 'guild':
            handleAdventureClick(x, y, event);
            break;
        case 'map':
            handleMapMouseDown(x, y, event);
            break;
    }
}
mainCanvas.addEventListener('mouseout', function (event) {
    canvasCoords = null;
});
function handleAdventureClick(x, y, event) {
    const state = getState();
    const hero = state.selectedCharacter.adventurer;
    const canvasPopupTarget = getCanvasPopupTarget();
    const selectedAction = getSelectedAction();
    if (canvasPopupTarget) {
        if (selectedAction) {
            if (canvasPopupTarget.isActor && canUseSkillOnTarget(hero, selectedAction, canvasPopupTarget)) {
                setActionTarget(hero, selectedAction, canvasPopupTarget);
                setSelectedAction(null);
                return;
            }
        }
        if (canvasPopupTarget.onClick) {
            canvasPopupTarget.onClick(state.selectedCharacter, canvasPopupTarget);
        } else if (hero.enemies.indexOf(canvasPopupTarget) >= 0) {
            setActorAttackTarget(hero, canvasPopupTarget);
        } else if (canvasPopupTarget.area) {
            setActorInteractionTarget(hero, canvasPopupTarget);
        }
    } else if (!getUpgradingObject() && !getChoosingTrophyAltar()) {
        var targetLocation = getTargetLocation(hero.area, x, y);
        if (!targetLocation) return;
        if (selectedAction && canUseSkillOnTarget(hero, selectedAction, targetLocation)) {
            setActionTarget(hero, selectedAction, targetLocation);
                setSelectedAction(null);
        } else {
            setActorDestination(hero, targetLocation);
            clickedToMove = true;
        }
    }
}
export function getTargetLocation(area, canvasX, canvasY) {
    var z = -(canvasY - GROUND_Y) * 2;
    if (z < -190 || z > 190) return null;
    z = limitZ(z);
    return {'x': area.cameraX + canvasX, y: 0, z, width:0, height: 0};
}
document.addEventListener('mouseup',function (event) {
    clickedToMove = false;
});
function setActorDestination(actor, target) {
    var activity = {
        type: 'move',
        x: target.x,
        y: 0,
        z: limitZ(target.z, actor.width / 2)
    };
    if (getDistanceBetweenPointsSquared(actor, activity) > 200) {
        if (!actor.activity) {
            actor.walkFrame = 1;
        }
        actor.activity = activity;
    }
}
export function setActorAttackTarget(actor, target) {
    actor.activity = {
        type: 'attack',
        target
    };
}
function setActionTarget(actor, action, target) {
    actor.activity = {
        type: 'action',
        action,
        target
    };
}
export function setActorInteractionTarget(actor, target) {
    actor.activity = {
        type: 'interact',
        target
    };
}

export function updateRetireButtons() {
    toggleElements(queryAll('.js-retire'), getState().characters.length > 1);
}

handleChildEvent('click', document.body, '.js-retire', function (retireButton) {
    const state = getState();
    if (state.characters.length < 2) {
        return;
    }
    if (!confirm('Are you sure you want to retire ' + state.selectedCharacter.adventurer.name + '?')) {
        return;
    }
    const panel = retireButton.closest('.js-playerPanel');
    panel.remove();
    leaveCurrentArea(state.selectedCharacter.hero, true);
    var removedCharacter = state.selectedCharacter;
    var index = state.characters.indexOf(removedCharacter);
    state.characters.splice(index, 1);
    state.selectedCharacter = state.characters[Math.min(index, state.characters.length)];
    setSelectedCharacter(state.characters[Math.min(index, state.characters.length - 1)]);
    removedCharacter.characterCanvas.remove();
    saveGame();
    updateRetireButtons();
});

handleChildEvent('click', query('.js-charactersBox'), '.js-character', function (characterElement) {
    const characterIndex = getElementIndex(characterElement);
    setSelectedCharacter(getState().characters[characterIndex]);
});

