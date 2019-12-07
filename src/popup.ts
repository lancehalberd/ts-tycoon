import { jewelInventoryContainer } from 'app/dom';
import { drawOutlinedImage } from 'app/images';
import { jewelInventoryState } from 'app/jewelInventory';
import { isPointInRectObject, rectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

interface Popup {
    target: any,
    element: HTMLElement,
}
let popup: Popup = null;


let canvasPopupTarget = null;
export function getCanvasPopupTarget() {
    return canvasPopupTarget;
}
export function setCanvasPopupTarget(target) {
    canvasPopupTarget = target;
}
//let wallMouseCoords = null;

export function getPopup(): Popup {
    return popup;
}

export function removePopup() {
    if (popup) {
        document.body.removeChild(popup.element);
        if (popup.target.onMouseOut) {
            popup.target.onMouseOut();
        }
        popup = null;
    }
}

export function addPopup(target: any, content: string): Popup {
    removePopup();
    popup = {
        target,
        element: document.createElement('div'),
    };
    popup.element.className = 'toolTip js-toolTip';
    popup.element.innerHTML = content;
    document.body.appendChild(popup.element);
    updateToolTip();
    return popup;
}

export function updateToolTip() {
    const box:DOMRect = popup.element.getBoundingClientRect();
    const [x, y] = getMousePosition();
    var top = y + 10;
    if (top + box.height >= 600) {
        top = Math.max(10, y - 10 - box.height);
    }
    var left = x - 10 - box.width;
    if (left < 5) {
        left = x + 10;
    }
    // Show the popup in a fixed location when dragging the board.
    if (jewelInventoryState.draggingBoardJewel()) {
        left = jewelInventoryContainer.getBoundingClientRect().left;
        top = 30;
    }
    popup.element.style.left = `${left}px`;
    popup.element.style.top = `${top}px`;
}


function checkToShowMainCanvasToolTip(x, y) {
    if (ifdefor(x) === null) return;
    if ($popup || !$('.js-mainCanvas').is(':visible') || canvasPopupTarget) return;
    canvasPopupTarget = getMainCanvasMouseTarget(x, y);
    $('.js-mainCanvas').toggleClass('clickable', !!canvasPopupTarget);
    if (!canvasPopupTarget) {
        return;
    }
    var popupText = canvasPopupTarget.helpMethod ? canvasPopupTarget.helpMethod(canvasPopupTarget) : canvasPopupTarget.helpText;
    if (!popupText) return;
    $popup = $tag('div', 'toolTip js-toolTip', popupText);
    $popup.data('canvasTarget', canvasPopupTarget);
    $('.js-mouseContainer').append($popup);
    updateToolTip(mousePosition[0], mousePosition[1], $popup);
}
// Return the canvas object under the mouse with highest priority, if any.
function getMainCanvasMouseTarget(x, y) {
    if (state.selectedCharacter.context === 'map') return getMapPopupTarget(x, y);
    var area = state.selectedCharacter.hero.area;
    if (!area) return null;
    if (choosingTrophyAltar) return getTrophyPopupTarget(x, y);
    if (upgradingObject) {
        if (isPointInRectObject(x, y, upgradeButton)) {
            return upgradeButton;
        }
        return null;
    }
    var abilityTarget = getAbilityPopupTarget(x, y);
    if (abilityTarget) return abilityTarget;
    // Actors (heroes and enemies) have highest priority in the main game context during fights.
    for (var actor of area.allies.concat(area.enemies)) {
        if (!actor.isDead && isPointInRect(x, y, actor.left, actor.top, actor.width, actor.height)) {
            return actor;
        }
    }
    var sortedObjects = area.objects.slice().sort(function (spriteA, spriteB) {
        return spriteA.z - spriteB.z;
    });
    for (var object of sortedObjects.concat(ifdefor(area.wallDecorations, [])).concat(globalHud)) {
        if (!isCanvasTargetActive(object)) continue;
        // (x,y) of objects is the bottom middle of their graphic.
        var targetRectangle = ifdefor(object.target, object);
        var left = ifdefor(targetRectangle.left, object.x - area.cameraX - object.width / 2);
        var top = ifdefor(targetRectangle.top, groundY - object.y - object.height);
        if (object.isOver) {
            if (object.isOver(x, y)) return object;
        } else if (isPointInRect(x, y, left, top, targetRectangle.width, targetRectangle.height)) return object;
    }
    if (area.cameraX + x < 60) {
        var coords = unprojectLeftWallCoords(area, x, y);
        // wallMouseCoords = coords;
        for (var leftWallDecoration of ifdefor(area.leftWallDecorations, [])) {
            if (!isCanvasTargetActive(leftWallDecoration)) continue;
            // decoration.target stores the rectangle that the decoration was drawn to on the wallCanvas before
            // it is projected to the wall trapezoid and uses the same coordinates the unprojectRightWallCoords returns in.
            var target = leftWallDecoration.target;
            // console.log([coords[0], coords[1], target.left, target.top, target.width, target.height]);
            if (isPointInRect(coords[0], coords[1], target.left, target.top, target.width, target.height)) {
                return leftWallDecoration;
            }
        }
    }
    if (area.cameraX + x > area.width - 60) {
        var coords = unprojectRightWallCoords(area, x, y);
        // wallMouseCoords = coords;
        for (var rightWallDecoration of ifdefor(area.rightWallDecorations, [])) {
            if (!isCanvasTargetActive(rightWallDecoration)) continue;
            // decoration.target stores the rectangle that the decoration was drawn to on the wallCanvas before
            // it is projected to the wall trapezoid and uses the same coordinates the unprojectRightWallCoords returns in.
            var target = rightWallDecoration.target;
            // console.log([coords[0], coords[1], target.left, target.top, target.width, target.height]);
            if (isPointInRect(coords[0], coords[1], target.left, target.top, target.width, target.height)) {
                return rightWallDecoration;
            }
        }
    }
    return null;
}
function isCanvasTargetActive(canvasTarget) {
    if (!canvasTarget.action && !canvasTarget.onClick) return false;
    if (canvasTarget.isVisible && !canvasTarget.isVisible()) return false;
    if (canvasTarget.isEnabled && !canvasTarget.isEnabled()) return false;
    return true;
}
function checkToShowJewelToolTip() {
    var jewel = jewelInventoryState.draggedJewel || jewelInventoryState.overJewel;
    if (!jewel) {
        return;
    }
    if ($popup) {
        if ($popup.data('jewel') === jewel) {
            return;
        } else {
            $popup.remove();
        }
    }
    //console.log([event.pageX,event.pageY]);
    var helpText = jewel.helpMethod ? jewel.helpMethod(jewel) : jewel.helpText;
    if (jewel.fixed && !jewel.confirmed) {
        $popup = $tag('div', 'toolTip js-toolTip', 'Drag and rotate to adjust this augmentation.<br/><br/> Click the "Apply" button above when you are done.<br/><br/>' + helpText);
    } else {
        $popup = $tag('div', 'toolTip js-toolTip', helpText);
    }
    $popup.data('jewel', jewel);
    $popupTarget = null;
    $('.js-mouseContainer').append($popup);
    updateToolTip(mousePosition[0], mousePosition[1], $popup);
}
$('.js-mouseContainer').on('mousemove', function (event) {
    if (!$popup) {
        return;
    }
    updateToolTip(mousePosition[0], mousePosition[1], $popup);
});

function checkremovePopup() {
    if (!$popup && !canvasPopupTarget && !$popupTarget) {
        return;
    }
    if (jewelInventoryState.overJewel || jewelInventoryState.draggedJewel || jewelInventoryState.draggingBoardJewel || overCraftingItem || $dragHelper) {
        return;
    }
    if (draggedMap) {
        removePopup();
        return;
    }
    if ($('.js-mainCanvas').is(':visible')) {
        if (canvasPopupTarget && !ifdefor(canvasPopupTarget.isDead) && canvasPopupTarget.area === state.selectedCharacter.hero.area &&
            isMouseOverCanvasElement(canvasCoords[0], canvasCoords[1], canvasPopupTarget)) {
            return;
        }
        if (currentMapTarget && !state.selectedCharacter.hero.area) {
            if (ifdefor(currentMapTarget.top) !== null) {
                if (isPointInRect(canvasCoords[0], canvasCoords[1], currentMapTarget.left, currentMapTarget.top, currentMapTarget.width, currentMapTarget.height)) {
                    return;
                }
            }
        }
    }
    if ($popupTarget && $popupTarget.closest('body').length && isMouseOverElement($popupTarget)) {
        return;
    }
    removePopup();
    checkToShowMainCanvasToolTip(canvasCoords[0], canvasCoords[1]);
}
function isMouseOverCanvasElement(x, y, element) {
    if (element.isVisible && !element.isVisible()) return false;
    if (element.isOver) return element.isOver(x, y);
    if (element.target) return isPointInRectObject(x, y, element.target);
    if (currentMapTarget && ifdefor(currentMapTarget.top) !== null) return isPointInRectObject(x, y, element);
    return false;
}
function getHelpText($popupTarget) {
    if ($popupTarget.data('helpMethod')) {
        return $popupTarget.data('helpMethod')($popupTarget);
    }
    return $popupTarget.attr('helpText');
}
