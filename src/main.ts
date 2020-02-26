import { getDistanceBetweenPointsSquared, leaveCurrentArea, limitZ } from 'app/adventure';
import { setSelectedCharacter } from 'app/character';
import { getChoosingTrophyAltar } from 'app/content/achievements';
import { getUpgradingObject } from 'app/content/upgradeButton';
import { setContext } from 'app/context';
import {
    getElementIndex, handleChildEvent, mainCanvas,
    query, queryAll, toggleElements,
} from 'app/dom';
import { getSelectedAction, setSelectedAction } from 'app/drawSkills';
import { ADVENTURE_SCALE, GROUND_Y } from 'app/gameConstants';
import { handleMapMouseDown } from 'app/map';
import { checkToShowMainCanvasToolTip, getCanvasPopupTarget } from 'app/popup'
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { canUseSkillOnTarget } from 'app/useSkill';
import { toolTipColor } from 'app/utils/colors';
import { getMousePosition } from 'app/utils/mouse';

import { Action, Actor, ActorActivity, Area, AreaObject, Hero, LocationTarget, Target } from 'app/types';

let canvasCoords = null;
export function getCanvasCoords() {
    return canvasCoords;
}
mainCanvas.addEventListener('mousemove', function () {
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    canvasCoords = [x, y];
    checkToShowMainCanvasToolTip(x, y);
});
let clickedToMove = false;

mainCanvas.onmousedown = function (event) {
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    canvasCoords = [x, y];
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
function handleAdventureClick(x: number, y: number, event) {
    const state = getState();
    const hero = state.selectedCharacter.adventurer;
    const canvasPopupTarget = getCanvasPopupTarget();
    const selectedAction = getSelectedAction();
    if (canvasPopupTarget) {
        if (selectedAction) {
            if (canvasPopupTarget.targetType === 'actor' && canUseSkillOnTarget(hero, selectedAction, canvasPopupTarget)) {
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
export function handleAdventureMouseIsDown(x: number, y: number) {
    var hero = getState().selectedCharacter.hero;
    if (hero.area && clickedToMove) {
        var targetZ = -(y - GROUND_Y) * 2;
        if (targetZ >= -200 || targetZ <= 200) {
            setActorDestination(hero, {
                targetType: 'location',
                area: hero.area,
                x: hero.area.cameraX + x, y: 0, z: targetZ,
                width: 0, height: 0,
            });
        }
    }
}
export function getTargetLocation(area: Area, canvasX: number, canvasY: number): LocationTarget {
    let z = -(canvasY - GROUND_Y) * 2;
    if (z < -190 || z > 190) return null;
    z = limitZ(z);
    return {targetType: 'location', area, x: area.cameraX + canvasX, y: 0, z, width:0, height: 0};
}
document.addEventListener('mouseup',function (event) {
    clickedToMove = false;
});
function setActorDestination(hero: Hero, target: Target) {
    const activity: ActorActivity = {
        type: 'move',
        x: target.x,
        y: 0,
        z: limitZ(target.z, hero.width / 2)
    };
    if (getDistanceBetweenPointsSquared(hero, activity) > 200) {
        if (hero.activity.type === 'none') {
            hero.walkFrame = 1;
        }
        hero.activity = activity;
    }
}
export function setActorAttackTarget(hero: Hero, target: Actor) {
    hero.activity = {
        type: 'attack',
        target
    };
}
function setActionTarget(hero: Hero, action: Action, target: Target) {
    hero.activity = {
        type: 'action',
        action,
        target
    };
}
export function setActorInteractionTarget(hero: Hero, target: LocationTarget | AreaObject) {
    hero.activity = {
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

handleChildEvent('click', query('.js-charactersBox'), '.js-character', function (characterElement: HTMLElement) {
    // Subtract 1 because the first element is the divinity indicator.
    const characterIndex = getElementIndex(characterElement) - 1;
    setSelectedCharacter(getState().characters[characterIndex]);
});

