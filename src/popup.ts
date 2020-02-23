import { actorHelpText } from 'app/character';
import { abilities } from 'app/content/abilities';
import { getChoosingTrophyAltar, getTrophyPopupTarget } from 'app/content/achievements';
import { getUpgradingObject, upgradeButton } from 'app/content/upgradeButton';
import {
    jewelInventoryContainer, mainCanvas, mouseContainer, tagElement,
    bodyDiv, query, queryAll, tag, titleDiv,
} from 'app/dom';
import { getGlobalHud } from 'app/drawArea';
import { getAbilityPopupTarget } from 'app/drawSkills';
import { equipmentCraftingState } from 'app/equipmentCrafting';
import { ADVENTURE_SCALE, GROUND_Y } from 'app/gameConstants';
import { abilityHelpText, getItemHelpText } from 'app/helpText';
import { drawOutlinedImage } from 'app/images';
import { getItemForElement, inventoryState } from 'app/inventory';
import { getMapPopupTarget, mapState } from 'app/map';
import { getElementJewel } from 'app/jewels';
import { jewelInventoryState } from 'app/jewelInventory';
import { getState } from 'app/state';
import { abbreviate } from 'app/utils/formatters';
import { ifdefor, isPointInRect, isPointInRectObject, isPointInShortRect, rectangle } from 'app/utils/index';
import { getMousePosition, isMouseOverElement } from 'app/utils/mouse';

import { Actor, FullRectangle } from 'app/types';

interface Popup {
    target: any,
    element: HTMLElement,
}
let popup: Popup = null;

export function updateActorHelpText(actor: Actor) {
    if (!popup || !popup.element) {
        return;
    }
    if (getCanvasPopupTarget() === actor) {
        popup.element.innerHTML = actorHelpText(actor);
        return;
    }
    if (!popup.target) {
        return;
    }
    if (actor === popup.target) {
        popup.element.innerHTML = actorHelpText(actor);
        return;
    }
}


let canvasPopupTarget = null;
export function getCanvasPopupTarget() {
    return canvasPopupTarget;
}
window['getCanvasPopupTarget'] = getCanvasPopupTarget;
export function setCanvasPopupTarget(target) {
    canvasPopupTarget = target;
}
window['setCanvasPopupTarget'] = setCanvasPopupTarget;
//let wallMouseCoords = null;

export function getPopup(): Popup {
    return popup;
}

export function removePopup() {
    if (popup) {
        popup.element.remove();
        // popup.target will not be defined for jewel tooltips.
        if (popup.target && popup.target.onMouseOut) {
            popup.target.onMouseOut();
        }
        popup = null;
    }
    canvasPopupTarget = null;
}

export function addPopup(target: any, content: string): Popup {
    removePopup();
    popup = {
        target,
        element: document.createElement('div'),
    };
    popup.element.className = 'toolTip js-toolTip';
    popup.element.innerHTML = content;
    mouseContainer.appendChild(popup.element);
    updateToolTip();
    return popup;
}

export function updateToolTip() {
    if (!popup) {
        return;
    }
    const box:DOMRect = popup.element.getBoundingClientRect();
    const [x, y] = getMousePosition(mouseContainer);
    var top = y + 10;
    if (top + box.height >= 600) {
        top = Math.max(10, y - 10 - box.height);
    }
    var left = x - 10 - box.width;
    if (left < 5) {
        left = x + 10;
    }
    // Show the popup in a fixed location when dragging the board.
    if (jewelInventoryState.draggingBoardJewel) {
        left = jewelInventoryContainer.getBoundingClientRect().left;
        top = 30;
    }
    popup.element.style.left = `${left}px`;
    popup.element.style.top = `${top}px`;
}


export function checkToShowMainCanvasToolTip(x, y) {
    if (!(x >= 0)) return;
    if ((popup && popup.element) || mainCanvas.style.display === 'none' || canvasPopupTarget) return;
    canvasPopupTarget = getMainCanvasMouseTarget(x, y);
    mainCanvas.classList.toggle('clickable', !!canvasPopupTarget);
    if (!canvasPopupTarget) {
        return;
    }
    const popupText = canvasPopupTarget.helpMethod ? canvasPopupTarget.helpMethod(canvasPopupTarget) : canvasPopupTarget.helpText;
    if (!popupText) return;
    popup = {
        target: canvasPopupTarget,
        element: tagElement('div', 'toolTip js-toolTip', popupText),
    }
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
        if (!actor.isDead && isPointInRectObject(x, y, actor as FullRectangle)) {
            return actor;
        }
    }
    const sortedObjects = area.objects.slice().sort(function (spriteA, spriteB) {
        return spriteA.z - spriteB.z;
    });
    for (const object of [...sortedObjects, ...(area.wallDecorations || []), ...getGlobalHud()]) {
        if (!isCanvasTargetActive(object)) continue;
        // (x,y) of objects is the bottom middle of their graphic.
        const targetRectangle = object.target || object;
        const left = ifdefor(targetRectangle.left, object.x - area.cameraX - object.width / 2);
        const top = ifdefor(targetRectangle.top, GROUND_Y - object.y - object.height);
        if (object.isOver) {
            if (object.isOver(x, y)) return object;
        } else if (isPointInRect(x, y, left, top, targetRectangle.width, targetRectangle.height)) return object;
    }
    return null;
}
window['getMainCanvasMouseTarget'] = getMainCanvasMouseTarget;
function isCanvasTargetActive(canvasTarget) {
    if (!canvasTarget.action && !canvasTarget.onClick) return false;
    if (canvasTarget.isVisible && !canvasTarget.isVisible()) return false;
    if (canvasTarget.isEnabled && !canvasTarget.isEnabled()) return false;
    return true;
}
export function checkToShowJewelToolTip() {
    const jewel = jewelInventoryState.draggedJewel || jewelInventoryState.overJewel;
    if (!jewel) {
        return;
    }
    if (popup && popup.element) {
        const popupJewel = getElementJewel(popup.element);
        if (popupJewel === jewel) {
            return;
        } else {
            popup.element.remove();
        }
    }
    //console.log([event.pageX,event.pageY]);
    const helpText = jewel.helpMethod ? jewel.helpMethod(jewel) : '';
    let element;
    if (jewel.fixed && !jewel.confirmed) {
        element = tagElement('div', 'toolTip js-toolTip', 'Drag and rotate to adjust this augmentation.<br/><br/> Click the "Apply" button above when you are done.<br/><br/>' + helpText);
    } else {
        element = tagElement('div', 'toolTip js-toolTip', helpText);
    }
    popup = {
        element,
        target: null,
    };
    mouseContainer.appendChild(popup.element);
    updateToolTip();
}
mouseContainer.addEventListener('mousemove', function (event) {
    if (!popup || !popup.element) {
        return;
    }
    updateToolTip();
});

export function checkToRemovePopup() {
    //console.log('checkToRemovePopup');
    if (!popup && !canvasPopupTarget) {
        return;
    }
    if (jewelInventoryState.overJewel || jewelInventoryState.draggedJewel ||
        jewelInventoryState.draggingBoardJewel || equipmentCraftingState.overCraftingItem ||
        inventoryState.dragHelper
    ) {
        return;
    }
    // console.log('checkToRemovePopup', jewelInventoryState.overJewel, jewelInventoryState.draggedJewel);
    if (mapState.draggedMap) {
        removePopup();
        return;
    }
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (mainCanvas.style.display !== 'none') {
        const { selectedCharacter } = getState();
        // console.log(canvasPopupTarget, x, y, isMouseOverCanvasElement(x, y, canvasPopupTarget));
        if (canvasPopupTarget &&
            !canvasPopupTarget.isDead &&
            (!canvasPopupTarget.area || canvasPopupTarget.area === selectedCharacter.hero.area) &&
            isMouseOverCanvasElement(x, y, canvasPopupTarget)) {
            return;
        }
        if (mapState.currentMapTarget && !selectedCharacter.hero.area) {
            if (ifdefor(mapState.currentMapTarget.y) !== null) {
                if (isPointInRect(x, y, mapState.currentMapTarget.x, mapState.currentMapTarget.y, mapState.currentMapTarget.w, mapState.currentMapTarget.h)) {
                    return;
                }
            }
        }
    }
    if (popup && popup.target && popup.target.closest && popup.target.closest('body') && isMouseOverElement(popup.target)) {
        return;
    }
    removePopup();
    checkToShowMainCanvasToolTip(x, y);
}
function isMouseOverCanvasElement(x, y, element) {
    if (element.isVisible && !element.isVisible()) {
        return false;
    }
    if (element.isOver) {
        return element.isOver(x, y);
    }
    if (element.target) {
        // Support both short/full rectangles
        if (element.target.w) return isPointInShortRect(x, y, element.target);
        if (element.target.width) return isPointInRectObject(x, y, element.target);
    }
    if (element.targetType === 'actor') {
        return isPointInRectObject(x, y, element);
    }
    if (mapState.currentMapTarget && ifdefor(mapState.currentMapTarget.y) !== null) {
        return isPointInRectObject(x, y, element);
    }
    return false;
}
function getHelpText(popupTarget: HTMLElement) {
    const state = getState();
    const helpText = popupTarget.getAttribute('helpText');
    if (helpText === '$item$') {
        return getItemHelpText(getItemForElement(popupTarget));
    }
    if (helpText === '$character$') {
        return actorHelpText(getState().selectedCharacter.hero);
    }
    if (helpText === '$coins$') {
        return titleDiv(abbreviate(state.savedState.coins) + ' / ' + abbreviate(state.guildStats.maxCoins) + ' coins')
            + bodyDiv('Use Coins to create items.')
            + bodyDiv('Find more Coins from chests and defeated enemies.')
    }
    if (helpText === '$anima$') {
        return titleDiv(abbreviate(state.savedState.anima) + ' / ' + abbreviate(state.guildStats.maxAnima) + ' anima')
            + bodyDiv('Use Anima to enchant items with special powers.')
            + bodyDiv('Absorb Anima from defeated enemies or salvage it from jewels.')
    }
    if (helpText === '$hire$') {
        if (state.characters.length >= state.guildStats.maxHeroes) {
            return 'You need an empty bed to hire a new hero. Dismiss a hero or search the guild for more beds.';
        }
        return 'Hire this hero. The more famous your guild is, the cheaper it is to hire heroes.';
    }
    if (helpText.indexOf('$ability$') === 0) {
        const abilityKey = helpText.split('$ability$')[1];
        const ability = abilities[abilityKey];
        if (!ability) {
            console.log("Invalid ability key", abilityKey);
            debugger;
        }
        return abilityHelpText(ability, state.selectedCharacter.adventurer);
    }
    if (!helpText) {
        debugger;
    }
    return helpText;
}

mouseContainer.addEventListener('mousemove', function (event) {
    const helpContainer = (event.target as HTMLElement).closest('[helpText]') as HTMLElement;
    // Do nothing if not over a help container.
    if (!helpContainer) {
        return;
    }
    // Do nothing if a popup is already being displayed.
    if (popup) {
        return;
    }
    removePopup();
    popup = {
        target: helpContainer,
        element: tagElement('div', 'toolTip js-toolTip', getHelpText(helpContainer)),
    };
    mouseContainer.appendChild(popup.element);
    updateToolTip();
});
mouseContainer.addEventListener('mouseout', removePopup);
mainCanvas.addEventListener('mouseout', removePopup);

