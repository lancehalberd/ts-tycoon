import { abilities } from 'app/content/abilities';
import { getChoosingTrophyAltar, getTrophyPopupTarget } from 'app/content/achievements';
import { getUpgradingObject, upgradeButton } from 'app/content/upgradeButton';
import {
    getElementIndex, jewelInventoryContainer, mainCanvas, mouseContainer, tagElement,
    bodyDiv, query, queryAll, tag, titleDiv,
} from 'app/dom';
import { getGlobalHud } from 'app/drawArea';
import { getAbilityPopupTarget } from 'app/render/drawActionShortcuts';
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

import { Actor, Area, FullRectangle, ShortRectangle } from 'app/types';

interface Popup {
    target: any,
    element: HTMLElement,
}
let popup: Popup = null;

export function updateActorHelpText(actor: Actor) {
    if (!popup || !popup.element) {
        return;
    }
    if (getCanvasPopupTarget() === actor && actor.helpMethod) {
        popup.element.innerHTML = actor.helpMethod();
        return;
    }
    if (!popup.target) {
        return;
    }
    if (actor === popup.target && actor.helpMethod) {
        popup.element.innerHTML = actor.helpMethod();
        return;
    }
}

interface CanvasPopupTarget {
    isPointOver: (x: number, y: number) => boolean,
    isVisible?: () => boolean,
    onClick?: () => void,
    onMouseOut?: () => void,
    helpMethod?: () => string,
    helpText?: string,
    // These are only set on actors.
    isDead?: boolean,
    area?: Area,
    targetType?: string,
    getAreaTarget?: Function,
    onInteract?: Function,
}

let canvasPopupTarget: CanvasPopupTarget = null;
export function getCanvasPopupTarget(): CanvasPopupTarget {
    return canvasPopupTarget;
}
window['getCanvasPopupTarget'] = getCanvasPopupTarget;
export function setCanvasPopupTarget(target: CanvasPopupTarget) {
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
    } else if (canvasPopupTarget && canvasPopupTarget.onMouseOut) {
        // This handles the case when we were over a canvas target, but it
        // didn't generate a popup, we still trigger mouse out on leaving it.
        canvasPopupTarget.onMouseOut();
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
    if (!(x >= 0)) {
        //console.log(x);
        return;
    }
    if ((popup && popup.element) || mainCanvas.style.display === 'none' || canvasPopupTarget) {
        //console.log(popup, popup && popup.element, mainCanvas.style.display, canvasPopupTarget);
        return;
    }
    const newCanvasPopupTarget = getMainCanvasMouseTarget(x, y);
    // console.log(canvasPopupTarget, newCanvasPopupTarget);
    if (canvasPopupTarget && canvasPopupTarget !== newCanvasPopupTarget && canvasPopupTarget.onMouseOut) {
        canvasPopupTarget.onMouseOut();
    }
    canvasPopupTarget = newCanvasPopupTarget
    mainCanvas.classList.toggle('clickable', !!canvasPopupTarget);
    if (!canvasPopupTarget) {
        //console.log('no main canvas target');
        return;
    }
    const popupText = canvasPopupTarget.helpMethod ? canvasPopupTarget.helpMethod() : canvasPopupTarget.helpText;
    if (!popupText) return;
    popup = {
        target: canvasPopupTarget,
        element: tagElement('div', 'toolTip js-toolTip', popupText),
    }
    mouseContainer.append(popup.element);
    updateToolTip();
}
// Return the canvas object under the mouse with highest priority, if any.
function getMainCanvasMouseTarget(x, y): CanvasPopupTarget {
    const state = getState();
    if (state.selectedCharacter.context === 'map') {
        return getMapPopupTarget(x, y);
    }
    const area = state.selectedCharacter.hero.area;
    if (!area) {
        return null;
    }
    if (getChoosingTrophyAltar()) {
        return getTrophyPopupTarget(x, y);
    }
    if (getUpgradingObject()) {
        if (isPointInShortRect(x, y, upgradeButton)) {
            return upgradeButton;
        }
        return null;
    }
    const abilityTarget = getAbilityPopupTarget(x, y);
    if (abilityTarget) {
        return abilityTarget;
    }
    // Actors (heroes and enemies) have highest priority in the main game context during fights.
    for (const actor of area.allies.concat(area.enemies)) {
        if (!actor.isDead && actor.isPointOver(x, y)) {
            return actor;
        }
    }
    for (const hudObject of getGlobalHud()) {
        if (!hudObject.onClick || (hudObject.isVisible && !hudObject.isVisible())) {
            continue;
        }
        if (isPointInShortRect(x, y, hudObject)) {
            return hudObject;
        }
    }
    const sortedObjects = area.objects.slice().sort(function (spriteA, spriteB) {
        const A = spriteA.getAreaTarget ? spriteA.getAreaTarget().z : -10000;
        const B = spriteB.getAreaTarget ? spriteB.getAreaTarget().z : -10000;
        return A - B;
    });
    for (const object of [...sortedObjects, ...(area.backgroundObjects || [])]) {
        if (!object.onInteract || (object.isEnabled && !object.isEnabled())) {
            continue;
        }
        if (object.isPointOver(x, y)) {
            return object;
        }
    }
    return null;
}
window['getMainCanvasMouseTarget'] = getMainCanvasMouseTarget;

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
    const helpText = jewel.helpMethod ? jewel.helpMethod() : '';
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
        // console.log(canvasPopupTarget, x, y, canvasPopupTarget && isMouseOverCanvasElement(x, y, canvasPopupTarget));
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
    if (element.isPointOver) {
        return element.isPointOver(x, y);
    }
    if (element.target) {
        // Support both short/full rectangles
        if (element.target.w) return isPointInShortRect(x, y, element.target);
        if (element.target.width) return isPointInRectObject(x, y, element.target);
    }
    if (mapState.currentMapTarget && ifdefor(mapState.currentMapTarget.y) !== null) {
        return isPointInRectObject(x, y, element);
    }
    // Attempt to treat the object itself as a ShortRectangle or FullRectangle.
    if (element.w) return isPointInShortRect(x, y, element);
    if (element.width) return isPointInRectObject(x, y, element);
    return false;
}
function getHelpText(popupTarget: HTMLElement) {
    const state = getState();
    const helpText = popupTarget.getAttribute('helpText');
    if (helpText === '$item$') {
        return getItemHelpText(getItemForElement(popupTarget));
    }
    if (helpText === '$character$') {
        const index = getElementIndex(popupTarget) - 1;
        const hero = getState().characters[index]?.hero;
        return hero?.helpMethod?.();
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
        return abilityHelpText(ability, state.selectedCharacter.hero);
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

