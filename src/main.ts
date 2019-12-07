import { limitZ } from 'app/adventure';
import { query } from 'app/dom';
import { GROUND_Y } from 'app/gameConstants';
import { saveGame } from 'app/saveGame';
import { toolTipColor } from 'app/utils/colors';

let canvasCoords = null;
export function getCanvasCoords() {
    return canvasCoords;
}
$('.js-mouseContainer').on('mouseover mousemove', '[helpText]', function (event) {
    if ($popup) {
        return;
    }
    removePopup();
    $popupTarget = $(this);
    var x = event.pageX - $('.js-mouseContainer').offset().left;
    var y = event.pageY - $('.js-mouseContainer').offset().top;
    //console.log([event.pageX,event.pageY]);
    $popup = $tag('div', 'toolTip js-toolTip', getHelpText($popupTarget));
    $('.js-mouseContainer').append($popup);
    updateToolTip(x, y, $popup);
});
$('.js-mouseContainer').on('mouseout', '[helpText]', function (event) {
    removePopup();
});
$('.js-mouseContainer').on('mouseout', '.js-mainCanvas', function (event) {
    removePopup();
});
$('.js-mouseContainer').on('mouseover mousemove', '.js-mainCanvas', function (event) {
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    canvasCoords = [x, y];
    checkToShowMainCanvasToolTip(x, y);
});
var clickedToMove = false;

mainCanvas.onmousedown = function (event) {
    //var x = event.pageX - $(this).offset().left;
    //var y = event.pageY - $(this).offset().top;
    //canvasCoords = [x, y];
    canvasCoords = getMousePosition(mainCanvas);
    switch (state.selectedCharacter.context) {
        case 'adventure':
        case 'guild':
            handleAdventureClick(x, y, event);
            break;
        case 'map':
            handleMapMouseDown(x, y, event);
            break;
    }
}
function handleAdventureClick(x, y, event) {
    const state = getState();
    const hero = state.selectedCharacter.adventurer;
    const canvasPopupTarget = getCanvasPopupTarget();
    if (canvasPopupTarget) {
        if (selectedAction) {
            if (canvasPopupTarget.isActor && canUseSkillOnTarget(hero, selectedAction, canvasPopupTarget)) {
                setActionTarget(hero, selectedAction, canvasPopupTarget);
                selectedAction = null;
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
    } else if (!upgradingObject && !choosingTrophyAltar) {
        var targetLocation = getTargetLocation(hero.area, x, y);
        if (!targetLocation) return;
        if (selectedAction && canUseSkillOnTarget(hero, selectedAction, targetLocation)) {
            setActionTarget(hero, selectedAction, targetLocation);
            selectedAction = null;
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
function setActorAttackTarget(actor, target) {
    actor.activity = {
        'type': 'attack',
        target
    };
}
function setActionTarget(actor, action, target) {
    actor.activity = {
        'type': 'action',
        action,
        target
    };
}
function setActorInteractionTarget(actor, target) {
    actor.activity = {
        'type': 'interact',
        target
    };
}
query('.js-mainCanvas').addEventListener('mouseout', function (event) {
    canvasCoords = null;
});

function updateRetireButtons() {
    $('.js-retire').toggle(state.characters.length > 1);
}

$('body').on('click', '.js-retire', function (event) {
    if (state.characters.length < 2) {
        return;
    }
    if (!confirm('Are you sure you want to retire ' + state.selectedCharacter.adventurer.name + '?')) {
        return;
    }
    var $panel = $(this).closest('.js-playerPanel');
    $panel.remove();
    leaveCurrentArea(state.selectedCharacter.hero, true);
    var removedCharacter = state.selectedCharacter;
    var index = state.characters.indexOf(removedCharacter);
    state.characters.splice(index, 1);
    state.selectedCharacter = state.characters[Math.min(index, state.characters.length)];
    setSelectedCharacter(state.characters[Math.min(index, state.characters.length - 1)]);
    removedCharacter.$characterCanvas.remove();
    saveGame();
    updateRetireButtons();
});
$('body').on('click', '.js-showJewelsPanel', function (event) {
    setContext('jewel');
});
$('.js-charactersBox').on('click', '.js-character', function () {
    setSelectedCharacter($(this).data('character'));
})

