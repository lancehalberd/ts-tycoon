import { getChoosingTrophyAltar, getTrophyPopupTarget } from 'app/content/achievements';
import { getUpgradingObject, upgradeButton } from 'app/content/furniture';
import { unprojectLeftWallCoords, unprojectRightWallCoords} from 'app/content/guild';
import { jewelInventoryContainer, mainCanvas, mouseContainer, tagElement } from 'app/dom';
import { globalHud } from 'app/drawArea';
import { getAbilityPopupTarget } from 'app/drawSkills';
import { equipmentCraftingState } from 'app/equipmentCrafting';
import { GROUND_Y } from 'app/gameConstants';
import { drawOutlinedImage } from 'app/images';
import { inventoryState } from 'app/inventory';
import { getMapPopupTarget, mapState } from 'app/map';
import { getElementJewel, jewelInventoryState } from 'app/jewelInventory';
import { getState } from 'app/state';
import { ifdefor, isPointInRect, isPointInRectObject, rectangle } from 'app/utils/index';
import { getMousePosition, isMouseOverElement } from 'app/utils/mouse';

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


export function checkToShowMainCanvasToolTip(x, y) {
    if (!(x >= 0)) return;
    if (popup.element || mainCanvas.style.display === 'none' || canvasPopupTarget) return;
    canvasPopupTarget = getMainCanvasMouseTarget(x, y);
    mainCanvas.classList.toggle('clickable', !!canvasPopupTarget);
    if (!canvasPopupTarget) {
        return;
    }
    const popupText = canvasPopupTarget.helpMethod ? canvasPopupTarget.helpMethod(canvasPopupTarget) : canvasPopupTarget.helpText;
    if (!popupText) return;
    popup.element = tagElement('div', 'toolTip js-toolTip', popupText);
    popup.target = canvasPopupTarget;
    mouseContainer.append(popup.element);
    updateToolTip();
}
// Return the canvas object under the mouse with highest priority, if any.
function getMainCanvasMouseTarget(x, y) {
    const state = getState();
    if (state.selectedCharacter.context === 'map') return getMapPopupTarget(x, y);
    const area = state.selectedCharacter.hero.area;
    if (!area) return null;
    if (getChoosingTrophyAltar()) return getTrophyPopupTarget(x, y);
    if (getUpgradingObject()) {
        if (isPointInRectObject(x, y, upgradeButton)) {
            return upgradeButton;
        }
        return null;
    }
    const abilityTarget = getAbilityPopupTarget(x, y);
    if (abilityTarget) return abilityTarget;
    // Actors (heroes and enemies) have highest priority in the main game context during fights.
    for (const actor of area.allies.concat(area.enemies)) {
        if (!actor.isDead && isPointInRectObject(x, y, actor)) {
            return actor;
        }
    }
    const sortedObjects = area.objects.slice().sort(function (spriteA, spriteB) {
        return spriteA.z - spriteB.z;
    });
    for (const object of [...sortedObjects, ...area.wallDecorations, ...globalHud]) {
        if (!isCanvasTargetActive(object)) continue;
        // (x,y) of objects is the bottom middle of their graphic.
        const targetRectangle = object.target || object;
        const left = ifdefor(targetRectangle.left, object.x - area.cameraX - object.width / 2);
        const top = ifdefor(targetRectangle.top, GROUND_Y - object.y - object.height);
        if (object.isOver) {
            if (object.isOver(x, y)) return object;
        } else if (isPointInRect(x, y, left, top, targetRectangle.width, targetRectangle.height)) return object;
    }
    if (area.cameraX + x < 60) {
        const coords = unprojectLeftWallCoords(area, x, y);
        // wallMouseCoords = coords;
        for (const leftWallDecoration of (area.leftWallDecorations || [])) {
            if (!isCanvasTargetActive(leftWallDecoration)) continue;
            // decoration.target stores the rectangle that the decoration was drawn to on the wallCanvas before
            // it is projected to the wall trapezoid and uses the same coordinates the unprojectRightWallCoords returns in.
            const target = leftWallDecoration.target;
            // console.log([coords[0], coords[1], target.left, target.top, target.width, target.height]);
            if (isPointInRect(coords[0], coords[1], target.left, target.top, target.width, target.height)) {
                return leftWallDecoration;
            }
        }
    }
    if (area.cameraX + x > area.width - 60) {
        const coords = unprojectRightWallCoords(area, x, y);
        // wallMouseCoords = coords;
        for (const rightWallDecoration of (area.rightWallDecorations || [])) {
            if (!isCanvasTargetActive(rightWallDecoration)) continue;
            // decoration.target stores the rectangle that the decoration was drawn to on the wallCanvas before
            // it is projected to the wall trapezoid and uses the same coordinates the unprojectRightWallCoords returns in.
            const target = rightWallDecoration.target;
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
export function checkToShowJewelToolTip() {
    var jewel = jewelInventoryState.draggedJewel || jewelInventoryState.overJewel;
    if (!jewel) {
        return;
    }
    if (popup.element) {
        const popupJewel = getElementJewel(popup.element);
        if (popupJewel === jewel) {
            return;
        } else {
            popup.element.remove();
        }
    }
    //console.log([event.pageX,event.pageY]);
    var helpText = jewel.helpMethod ? jewel.helpMethod(jewel) : jewel.helpText;
    if (jewel.fixed && !jewel.confirmed) {
        popup.element = tagElement('div', 'toolTip js-toolTip', 'Drag and rotate to adjust this augmentation.<br/><br/> Click the "Apply" button above when you are done.<br/><br/>' + helpText);
    } else {
        popup.element = tagElement('div', 'toolTip js-toolTip', helpText);
    }
    popup.target = null;
    mouseContainer.appendChild(popup.element);
    updateToolTip();
}
mouseContainer.addEventListener('mousemove', function (event) {
    if (!popup.element) {
        return;
    }
    updateToolTip();
});

export function checkremovePopup() {
    if (!popup.element && !canvasPopupTarget && !popup.target) {
        return;
    }
    if (jewelInventoryState.overJewel || jewelInventoryState.draggedJewel ||
        jewelInventoryState.draggingBoardJewel || equipmentCraftingState.overCraftingItem ||
        inventoryState.dragHelper
    ) {
        return;
    }
    if (mapState.draggedMap) {
        removePopup();
        return;
    }
    const [x, y] = getMousePosition(mainCanvas);
    if (mainCanvas.style.display !== 'none') {
        const { selectedCharacter } = getState();
        if (canvasPopupTarget && !canvasPopupTarget.isDead && canvasPopupTarget.area === selectedCharacter.hero.area &&
            isMouseOverCanvasElement(x, y, canvasPopupTarget)) {
            return;
        }
        if (mapState.currentMapTarget && !selectedCharacter.hero.area) {
            if (ifdefor(mapState.currentMapTarget.top) !== null) {
                if (isPointInRect(x, y, mapState.currentMapTarget.left, mapState.currentMapTarget.top, mapState.currentMapTarget.width, mapState.currentMapTarget.height)) {
                    return;
                }
            }
        }
    }
    if (popup.target && popup.target.closest && popup.target.closest('body').length && isMouseOverElement(popup.target)) {
        return;
    }
    removePopup();
    checkToShowMainCanvasToolTip(x, y);
}
function isMouseOverCanvasElement(x, y, element) {
    if (element.isVisible && !element.isVisible()) return false;
    if (element.isOver) return element.isOver(x, y);
    if (element.target) return isPointInRectObject(x, y, element.target);
    if (mapState.currentMapTarget && ifdefor(mapState.currentMapTarget.top) !== null) return isPointInRectObject(x, y, element);
    return false;
}
function getHelpText(popupTarget) {
    if (popupTarget.data('helpMethod')) {
        return popupTarget.data('helpMethod')(popupTarget);
    }
    return popupTarget.attr('helpText');
}

mouseContainer.addEventListener('mousemove', function (event) {
    const helpContainer = (event.target as HTMLElement).closest('[helpText]');
    if (!helpContainer) {
        removePopup();
    }
    if (popup.element) {
        return;
    }
    removePopup();
    popup.target = helpContainer;
    popup.element = tagElement('div', 'toolTip js-toolTip', getHelpText(popup.target));
    mouseContainer.appendChild(popup.element);
    updateToolTip();
});
mouseContainer.addEventListener('mouseout', removePopup);
mainCanvas.addEventListener('mouseout', removePopup);

