import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { addActions, refreshStatsPanel, removeActions, totalCostForNextLevel } from 'app/character';
import { map } from 'app/content/mapData';
import {
    getClosestElement, findEmptyElement, handleChildEvent, jewelInventoryContainer,
    jewelsCanvas, mouseContainer, query, queryAll
} from 'app/dom';
import { drawBoardBackground } from 'app/drawBoard';
import { drawJewel } from 'app/drawJewel';
import { inventoryState, updateDragHelper } from 'app/inventory';
import {
    clearAdjacentJewels, destroyJewel, getElementJewel, jewelAnimaBonus, jewelTierLevels,
    makeJewel, setMaxAnimaJewelBonus,
    updateAdjacencyBonuses, updateAdjacentJewels, updateJewelBonuses,
} from 'app/jewels';
import { gain, hidePointsPreview, previewPointsChange } from 'app/points';
import { checkToShowJewelToolTip, removePopup } from 'app/popup';
import { saveGame } from 'app/saveGame'
import { getState } from 'app/state';
import {
    collision, getCollisionArea, getElementRectangle, ifdefor,
    isPointInShortRect, rectangle,
} from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import {
    allPoints,
    checkForCollision,
    computeArea,
    distanceSquared,
    getBounds,
    getIntersectionArea,
    isPointInPoints,
    magnitude,
    rotatePoint,
    rotateShapes,
    ShapeDefinition,
    shapeDefinitions,
    tolerance,
    translateShapes,
    vector,
} from 'app/utils/polygon';

import { Board, Character, Jewel, JewelComponents, JewelTier, Point, } from 'app/types';
import { Polygon } from 'app/utils/polygon';


export const jewelInventoryState: {
    overVertex: Point,
    overJewel: Jewel,
    draggedJewel: Jewel,
    draggingBoardJewel: Jewel,
} = {
    // The vertex the mouse is over.
    overVertex: null,
    // The jewel the mouse is over.
    overJewel: null,
    // The jewel being dragged.
    draggedJewel: null,
    // The fixed jewel being used to drag the board.
    draggingBoardJewel: null,
}
const craftingSlotA = query('.js-jewelCraftingSlotA');
const craftingSlotB = query('.js-jewelCraftingSlotB');
const jewelCraftingButton:HTMLElement = query('.js-jewelCraftingButton');
const jewelDeformationButton:HTMLElement = query('.js-jewelDeformationButton');

function redrawInventoryJewel(jewel: Jewel) {
    if (!jewel) {
        console.log('no jewel');
        debugger;
    }
    //centerShapesInRectangle([jewel.shape], rectangle(0, 0, jewel.canvas.width, jewel.canvas.height));
    jewel.context.clearRect(0, 0, jewel.canvas.width, jewel.canvas.height);
    drawJewel(jewel.context, jewel.shape, getMousePosition(jewel.canvas), null, 0.4, true);
    if (jewelInventoryState.overVertex && (jewelInventoryState.draggedJewel == jewel || jewelInventoryState.overJewel == jewel)) {
        jewel.context.strokeStyle = 'black';
        jewel.context.lineWidth = 1;
        jewel.context.beginPath();
        jewel.context.arc(jewelInventoryState.overVertex[0], jewelInventoryState.overVertex[1], 4, 0, Math.PI * 2);
        jewel.context.stroke();
    }
    /* jewel.context.textBaseline = "middle";
    jewel.context.textAlign = 'center'
    jewel.context.font = "15px sans-serif";
    jewel.context.fillStyle = '#fff';
    jewel.context.fillText(jewel.quality.toFixed(2), jewel.canvas.width / 2,  jewel.canvas.height / 2);
    jewel.context.fillStyle = '#000';
    jewel.context.fillText(jewel.quality.toFixed(2), jewel.canvas.width / 2 - 1,  jewel.canvas.height / 2 - 1);*/
    jewel.context.textBaseline = "bottom";
    jewel.context.textAlign = 'right'
    jewel.context.font = "15px sans-serif";
    jewel.context.fillStyle = '#fff';
    jewel.context.fillText(jewel.quality.toFixed(2), jewel.canvas.width - 5,  jewel.canvas.height);
    jewel.context.fillStyle = '#aaa';
    jewel.context.fillText(jewel.quality.toFixed(2), jewel.canvas.width - 5 - 1,  jewel.canvas.height - 1);
    jewel.context.fillStyle = '#000';
    jewel.context.fillText(jewel.quality.toFixed(2), jewel.canvas.width - 5 - 2,  jewel.canvas.height - 2);
}
export function redrawInventoryJewels() {
    let jewelsDrawn = 0;
    let jewelsTotal = 0;
    for (const element of jewelInventoryContainer.getElementsByClassName('js-jewel') as HTMLCollectionOf<HTMLElement>) {
        jewelsTotal++;
        if (element.style.display !== 'none' && collision(jewelInventoryContainer, element)) {
            const jewel = getElementJewel(element);
            jewelsDrawn++;
            redrawInventoryJewel(jewel);
        }
    }
    // Crafting slots are always visible.
    for (const element of queryAll('.js-jewelCraftingSlot .js-jewel')) {
        redrawInventoryJewel(getElementJewel(element));
    }
}
jewelInventoryContainer.onscroll = redrawInventoryJewels;

export function sellJewel(jewel: Jewel) {
    if (jewel.fixed) return;
    if (jewel.character && getState().characters.indexOf(jewel.character) < 0) {
        return;
    }
    if (inventoryState.dragHelper && jewel !== jewelInventoryState.draggedJewel) {
        return;
    }
    // unequip and deletes the jewel.
    destroyJewel(jewel);
    setMaxAnimaJewelBonus(getState().savedState.maxAnimaJewelMultiplier * jewelAnimaBonus(jewel));
    gain('coins', jewel.price);
    gain('anima', jewel.price);
    updateJewelCraftingOptions();
    saveGame();
}

document.body.ondblclick = function (event) {
    const state = getState();
    const { overJewel } = jewelInventoryState;
    if (!overJewel || !overJewel.fixed || !overJewel.confirmed) return; // dblclick action only applies to fixed jewels
    // Cannot interact with jewel boards of characters that are not in your guild yet.
    if (overJewel.character && state.characters.indexOf(overJewel.character) < 0) return;
    overJewel.disabled = !overJewel.disabled;
    const ability = overJewel.ability;
    if (!ability) return;
    const hero = state.selectedCharacter.hero;
    if (overJewel.disabled) {
        const abilityIndex = hero.abilities.indexOf(ability);
        hero.abilities.splice(abilityIndex, 1);
        removeActions(hero, ability);
        removeBonusSourceFromObject(hero.variableObject, ability, true);
        refreshStatsPanel();
    } else {
        hero.abilities.push(ability);
        addActions(hero, ability);
        addBonusSourceToObject(hero.variableObject, ability, true);
        refreshStatsPanel();
    }
    removePopup();
    saveGame();
}
document.body.onmousedown = function (event) {
    if (event.which !== 1) {
        return;
    }
    const specialClick = event.ctrlKey || event.metaKey;
    if (jewelInventoryState.draggedJewel || jewelInventoryState.draggingBoardJewel) {
        stopJewelDrag();
        return;
    }
    if (!jewelInventoryState.overJewel) {
        return;
    }
    // Cannot interact with jewel boards of characters that are not in your guild yet.
    if (jewelInventoryState.overJewel.character && getState().characters.indexOf(jewelInventoryState.overJewel.character) < 0) {
        return;
    }
    if (jewelInventoryState.overJewel.fixed) {
        // Don't allow users to rotate the entire board. This can be confusing,
        // and they may accidentally trigger this trying to rotate other jewels.
        if (jewelInventoryState.overVertex && jewelInventoryState.overJewel.confirmed) {
            return;
        }
        jewelInventoryState.draggingBoardJewel = jewelInventoryState.overJewel;
        inventoryState.dragged = false;
        return;
    }
    if (specialClick) {
        // If the jewel is on a board or in the crafting panel, return it to the inventory.
        if (jewelInventoryState.overJewel.character || jewelInventoryState.overJewel.canvas.closest('.js-jewelCraftingSlot')) {
            returnToInventory(jewelInventoryState.overJewel);
        } else {
            const emptySlot = findEmptyElement(queryAll('.js-jewelCraftingSlot'));
            if (emptySlot) {
                // If there is room, add the jewel to a crafting panel.
                emptySlot.appendChild(jewelInventoryState.overJewel.domElement);
            }
        }
        updateJewelUnderMouse(jewelsCanvas, getState().selectedCharacter);
        updateJewelCraftingOptions();
        return;
    }
    jewelInventoryState.draggedJewel = jewelInventoryState.overJewel;
    for (const craftingSlot of queryAll('.js-jewelCraftingSlot .js-jewel')) {
        craftingSlot.classList.add('active');
    }
    jewelInventoryState.draggedJewel.startCharacter = jewelInventoryState.draggedJewel.character;
    jewelInventoryState.draggedJewel.startCenter = [jewelInventoryState.draggedJewel.shape.center[0], jewelInventoryState.draggedJewel.shape.center[1]];
    clearAdjacentJewels(jewelInventoryState.draggedJewel);
    updateAdjacencyBonuses(jewelInventoryState.draggedJewel);
    /*if ($popup) {
        $popup.remove();
        checkToShowJewelToolTip();
    }*/
    removePopup();
    checkToShowJewelToolTip();
    if (jewelInventoryState.overVertex) {
        return;
    }
    jewelInventoryState.overJewel = null;
    // Remove this jewel from the board it is in while dragging.
    removeFromBoard(jewelInventoryState.draggedJewel);
    inventoryState.dragHelper = jewelInventoryState.draggedJewel.canvas;
    jewelInventoryState.draggedJewel.domElement.remove();
    jewelInventoryState.draggedJewel.shape.setCenterPosition(jewelInventoryState.draggedJewel.canvas.width / 2, jewelInventoryState.draggedJewel.canvas.height / 2);
    inventoryState.dragHelper.style.position = 'absolute';
    mouseContainer.appendChild(inventoryState.dragHelper);
    redrawInventoryJewel(jewelInventoryState.draggedJewel);
    updateDragHelper();
    inventoryState.dragged = false;
}
// Replace this with generic mousemove handling.
document.body.addEventListener('mousemove', function (event) {
    const jewelContainer = (event.target as HTMLElement).closest('.js-jewel');
    if (!jewelContainer) {
        return;
    }
    if (jewelInventoryState.draggedJewel || inventoryState.dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    // updateMousePosition(event);
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    const jewel = getElementJewel(jewelContainer);
    const points = jewel.shape.points;
    const relativePosition = getMousePosition(jewel.canvas);
    if (isPointInPoints(relativePosition, points)) {
        jewelInventoryState.overJewel = jewel;
        checkToShowJewelToolTip();
        return;
    }
    for (var j = 0; j < points.length; j++) {
        if (distanceSquared(points[j], relativePosition) < 25) {
            jewelInventoryState.overJewel = jewel;
            jewelInventoryState.overVertex = [...points[j]] as Point;
            checkToShowJewelToolTip();
            return;
        }
    }
});
export function updateJewelUnderMouse(activeJewelsCanvas: HTMLCanvasElement, character: Character) {
    const [x, y] = getMousePosition(activeJewelsCanvas);
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    if (!isPointInShortRect(x, y, getElementRectangle(activeJewelsCanvas, activeJewelsCanvas))) {
        for (const jewelElement of queryAll('.js-jewel')) {
            const jewel = getElementJewel(jewelElement);
            const points = jewel.shape.points;
            const relativePosition = getMousePosition(jewel.canvas);
            if (isPointInPoints(relativePosition, points)) {
                jewelInventoryState.overJewel = jewel;
                break;
            }
            for (let j = 0; j < points.length; j++) {
                if (distanceSquared(points[j], relativePosition) < 25) {
                    jewelInventoryState.overJewel = jewel;
                    jewelInventoryState.overVertex = [...points[j]] as Point;
                    checkToShowJewelToolTip();
                    break;
                }
            }
        }
        return;
    }
    let jewels = character.board.jewels;
    for (let i = 0; i < jewels.length; i++) {
        const jewel = jewels[i];
        const points = jewel.shape.points;
        if (isPointInPoints([x, y], points)) {
            jewelInventoryState.overJewel = jewel;
            checkToShowJewelToolTip();
            return;
        }
        // Disable rotation on the jewel board, it is ambiguous which vertex will be grabbed.
        /*for (var j = 0; j < points.length; j++) {
            if (distanceSquared(points[j], relativePosition) < 25) {
                jewelInventoryState.overJewel = jewel;
                jewelInventoryState.overVertex = points[j].concat();
                return;
            }
        }*/
    }
    jewels = character.board.fixed.concat();
    if (character.board.boardPreview) {
        jewels = jewels.concat(character.board.boardPreview.fixed);
    }
    for (let i = 0; i < jewels.length; i++) {
        const jewel = jewels[i];
        const points = jewel.shape.points;
        if (isPointInPoints([x, y], points)) {
            jewelInventoryState.overJewel = jewel;
            checkToShowJewelToolTip();
            return;
        }
        for (let j = 0; j < points.length; j++) {
            if (distanceSquared(points[j], [x, y]) < 25) {
                jewelInventoryState.overJewel = jewel;
                jewelInventoryState.overVertex = [...points[j]] as Point;
                checkToShowJewelToolTip();
                return;
            }
        }
    }
}
handleChildEvent('mousemove', document.body, '.js-skillCanvas', function (targetJewelsCanvas) {
    if (jewelInventoryState.draggedJewel || inventoryState.dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    updateJewelUnderMouse(targetJewelsCanvas, getState().selectedCharacter);
});
// Replace this with generic mousemove handling.
document.body.addEventListener('mousemove', function () {
    checkIfStillOverJewel();
    if (jewelInventoryState.draggingBoardJewel) dragBoard();
    if (!jewelInventoryState.draggedJewel) {
        return;
    }
    if (jewelInventoryState.overVertex !== null) {
        var points = jewelInventoryState.draggedJewel.shape.points;
        var center = jewelInventoryState.draggedJewel.shape.center;
        var centerToMouse = null;
        if (jewelInventoryState.draggedJewel.character) {
            centerToMouse = vector(center, getMousePosition(jewelsCanvas));
        } else {
            centerToMouse = vector(center, getMousePosition(jewelInventoryState.draggedJewel.canvas));
        }
        var centerToVertex = vector(center, jewelInventoryState.overVertex);
        var dotProduct = centerToVertex[0] * centerToMouse[0] + centerToVertex[1] * centerToMouse[1];
        var mag1 = magnitude(centerToVertex);
        var mag2 = magnitude(centerToMouse);
        var cosine = dotProduct / mag1 / mag2;
        if (mag1 * mag2 > tolerance && cosine <= 1) {
            var theta = Math.acos(cosine);
            if (centerToVertex[0] * centerToMouse[1] - centerToVertex[1] * centerToMouse[0] < 0) {
                theta = -theta;
            }
            theta = Math.round(theta / (Math.PI / 6));
            if (theta != 0) {
                jewelInventoryState.draggedJewel.shape.rotate(theta * 30);
                //rotateShapes([jewelInventoryState.draggedJewel.shape], center, theta * Math.PI / 6);
                jewelInventoryState.overVertex = rotatePoint(jewelInventoryState.overVertex, center, theta * Math.PI / 6);
            }
        }
    }
});
function dragBoard() {
    const character = jewelInventoryState.draggingBoardJewel.character;
    let boardShapes = [];
    if (character.board.boardPreview) {
        boardShapes = character.board.boardPreview.fixed.map(j => j.shape).concat(character.board.boardPreview.spaces);
    }
    if (jewelInventoryState.draggingBoardJewel.confirmed) {
        boardShapes = boardShapes.concat(character.board.jewels.map(j => j.shape)).concat(character.board.fixed.map(j => j.shape)).concat(character.board.spaces);
    }
    const mousePosition = getMousePosition(jewelsCanvas);
    // Translate the board so the fixed jewel is centered under the mouse.
    if (jewelInventoryState.overVertex === null) {
        const v = vector(jewelInventoryState.draggingBoardJewel.shape.center, mousePosition);
        if (jewelInventoryState.draggingBoardJewel.confirmed) {
            const bounds = getBounds(allPoints(boardShapes));
            v[0] = Math.min(character.boardCanvas.width / 2 - bounds.left, v[0]);
            v[0] = Math.max(character.boardCanvas.width / 2 - bounds.left - bounds.width, v[0]);
            v[1] = Math.min(character.boardCanvas.height / 2 - bounds.top, v[1]);
            v[1] = Math.max(character.boardCanvas.height / 2 - bounds.top - bounds.height, v[1]);
        }
        translateShapes(boardShapes, v);
        inventoryState.dragged = true;
        if (jewelInventoryState.draggingBoardJewel.confirmed) {
            character.boardContext.clearRect(0, 0, character.boardCanvas.width, character.boardCanvas.height);
            drawBoardBackground(character.boardContext, character.board);
        }
        return;
    }
    // Rotate the board
    const points = jewelInventoryState.draggingBoardJewel.shape.points;
    const center = jewelInventoryState.draggingBoardJewel.shape.center;
    const centerToMouse = vector(center, mousePosition);
    const centerToVertex = vector(center, jewelInventoryState.overVertex);
    const dotProduct = centerToVertex[0] * centerToMouse[0] + centerToVertex[1] * centerToMouse[1];
    const mag1 = magnitude(centerToVertex);
    const mag2 = magnitude(centerToMouse);
    const cosine = dotProduct / mag1 / mag2;
    if (mag1 * mag2 > tolerance && cosine <= 1) {
        let theta = Math.acos(cosine);
        if (centerToVertex[0] * centerToMouse[1] - centerToVertex[1] * centerToMouse[0] < 0) {
            theta = -theta;
        }
        theta = Math.round(theta / (Math.PI / 6));
        if (theta != 0) {
            rotateShapes(boardShapes, center, theta * Math.PI / 6);
            jewelInventoryState.overVertex = rotatePoint(jewelInventoryState.overVertex, center, theta * Math.PI / 6);
            if (jewelInventoryState.draggingBoardJewel.confirmed) {
                character.boardContext.clearRect(0, 0, character.boardCanvas.width, character.boardCanvas.height);
                drawBoardBackground(character.boardContext, character.board);
            }
        }
    }
}
function checkIfStillOverJewel() {
    if (!jewelInventoryState.overJewel) return;
    //console.log(jewelInventoryState.overJewel)
    let relativePosition;
    const character = jewelInventoryState.overJewel.character;
    if (character === getState().selectedCharacter) {
        // The main canvas is used for jewels on the selected characrer
        relativePosition = getMousePosition(jewelsCanvas);
    } else if (character) {
        relativePosition = getMousePosition(query('.js-applicationSkillCanvas'));
    } else {
        // Each jewel has its own canvas that it is drawn to in the inventory.
        relativePosition = getMousePosition(jewelInventoryState.overJewel.canvas);
    }
    //console.log(relativePosition);
    const points = jewelInventoryState.overJewel.shape.points;
    for (let j = 0; j < points.length; j++) {
        if (distanceSquared(points[j], relativePosition) < 25) {
            return;
        }
    }
    if (isPointInPoints(relativePosition, jewelInventoryState.overJewel.shape.points)) {
        return;
    }
    jewelInventoryState.overJewel = null;
}
// I'm a bit surprised that this works since I don't think mouseout is triggered on body
// when leaving the jewel elements...
handleChildEvent('mouseout', document.body, '.js-jewel', function (jewelElement: HTMLElement) {
    redrawInventoryJewel(getElementJewel(jewelElement));
});

export function removeFromBoard(jewel: Jewel) {
    if (!jewel.character) return;
    const jewels = jewel.character.board.jewels;
    const hero = jewel.character.hero;
    const index = jewels.indexOf(jewel);
    if (index >= 0) {
        // To properly update a character when the jewel board changes, we remove
        // the bonus as it is, then update it after removing the jewel and add
        // the bonus back again and trigger the stat update for the hero.
        jewels.splice(index, 1);
        removeBonusSourceFromObject(hero.variableObject, hero.character.jewelBonuses, false);
        jewel.character = null;
        updateAdjacentJewels(jewel);
        updateJewelBonuses(hero.character);
        addBonusSourceToObject(hero.variableObject, hero.character.jewelBonuses, true);
        refreshStatsPanel();
    }
}
function returnToInventory(jewel: Jewel) {
    removeFromBoard(jewel);
    jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
    jewel.canvas.style.position = '';
    jewel.domElement.append(jewel.canvas);
    jewel.startCharacter = null;
    addJewelToInventory(jewel.domElement);
}
export function addJewelToInventory(jewelElement: HTMLElement) {
    jewelInventoryContainer.appendChild(jewelElement);
    filterJewel(jewelElement);
}
function filterJewel(jewelElement: HTMLElement) {
    // Hide/show this jewel depending on whether the tier is filtered out.
    const tier = getElementJewel(jewelElement).tier;
    const checkbox = query('.js-jewelTier' + tier + ' input') as HTMLInputElement;
    const showTier = checkbox.checked;
    jewelElement.classList.toggle('hiddenJewel', !showTier);
}

export function stopJewelDrag() {
    queryAll('.js-jewelCraftingSlot').forEach(element => element.classList.remove('active'));
    if (jewelInventoryState.draggingBoardJewel) stopBoardDrag();
    if (!jewelInventoryState.draggedJewel) return;
    if (jewelInventoryState.overVertex) {
        jewelInventoryState.overVertex = null;
        if (jewelInventoryState.draggedJewel.character) {
            const draggedJewelCharacter = jewelInventoryState.draggedJewel.character;
            removeFromBoard(jewelInventoryState.draggedJewel);
            if (equipJewel(draggedJewelCharacter, false, true)) {
                checkToShowJewelToolTip();
                return;
            }
            returnToInventory(jewelInventoryState.draggedJewel);
        }
        jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
        jewelInventoryState.draggedJewel = null;
        inventoryState.dragHelper = null;
        return;
    }
    if (collision(jewelInventoryState.draggedJewel.canvas, query('.js-sellItem'))) {
        sellJewel(jewelInventoryState.draggedJewel);
        jewelInventoryState.draggedJewel = null;
        inventoryState.dragHelper = null;
        return;
    }
    // Drop the jewel on a skill board if it is over one.
    queryAll('.js-skillCanvas').forEach(element => {
        if (!collision(jewelInventoryState.draggedJewel.canvas, element)) {
            return true;
        }
        var relativePosition = getMousePosition(jewelsCanvas);
        jewelInventoryState.draggedJewel.shape.setCenterPosition(relativePosition[0], relativePosition[1]);
        if (equipJewel(getState().selectedCharacter, true, true)) {
            checkToShowJewelToolTip();
            updateJewelCraftingOptions();
            return false;
        }
    });
    if (!jewelInventoryState.draggedJewel) return;
    jewelInventoryState.draggedJewel.character = null;
    const craftingSlot = getClosestElement(jewelInventoryState.draggedJewel.canvas, [...queryAll('.js-jewelCraftingSlot')], 60);
    if (craftingSlot) {
        const existingItem = craftingSlot.querySelector('.js-jewel') as HTMLElement;
        if (existingItem) {
            existingItem.remove();
            addJewelToInventory(existingItem);
        }
        appendDraggedJewelToElement(craftingSlot);
    }
    if (!jewelInventoryState.draggedJewel) return;
    let targetElement: HTMLElement = null;
    let largestCollision = 0;
    for (const jewelElement of queryAll('.js-jewelInventory .js-jewel')) {
        const collisionArea = getCollisionArea(jewelInventoryState.draggedJewel.canvas, jewelElement);
        if (collisionArea > largestCollision) {
            targetElement = jewelElement;
            largestCollision = collisionArea;
        }
    }
    if (targetElement) {
        if (!jewelInventoryState.draggedJewel) return;
        // Code for adding a jewel to the inventory is designed to always append
        // to the end. To support adding it before a target element, just append
        // to the end first so we get all the normal logic for cleaning up the
        // drag operation, then remove the item and place it before the target.
        const domElement = jewelInventoryState.draggedJewel.domElement
        appendDraggedJewelToElement(jewelInventoryContainer);
        filterJewel(domElement);
        domElement.remove();
        targetElement.before(domElement);
    }
    if (!jewelInventoryState.draggedJewel) return;
    filterJewel(jewelInventoryState.draggedJewel.domElement);
    appendDraggedJewelToElement(jewelInventoryContainer);
}

function stopBoardDrag() {
    const character = jewelInventoryState.draggingBoardJewel.character;
    if (!jewelInventoryState.draggingBoardJewel.confirmed) {
        snapBoardToBoard(character.board.boardPreview, character.board);
    }
    jewelInventoryState.draggingBoardJewel = null;
}
function appendDraggedJewelToElement(container: HTMLElement) {
    if (!jewelInventoryState.draggedJewel) return;
    appendJewelToElement(jewelInventoryState.draggedJewel, container);
    jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
    jewelInventoryState.draggedJewel = null;
    inventoryState.dragHelper = null;
    updateJewelCraftingOptions();
}
function appendJewelToElement(jewel: Jewel, element: HTMLElement) {
    jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
    jewel.domElement.append(jewel.canvas);
    element.append(jewel.domElement);
    jewel.canvas.style.position = '';
}
export function equipJewel(character: Character, replace = false, updateAdventurer = false): boolean {
    if (jewelTierLevels[jewelInventoryState.draggedJewel.tier] <= character.adventurer.level
        && snapToBoard(jewelInventoryState.draggedJewel, character.board, replace)) {
        jewelInventoryState.draggedJewel.character = character;
        jewelInventoryState.draggedJewel.domElement.remove();
        jewelInventoryState.draggedJewel.canvas.remove();
        character.board.jewels.push(jewelInventoryState.draggedJewel);
        jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
        updateAdjacentJewels(jewelInventoryState.draggedJewel);
        jewelInventoryState.draggedJewel = null;
        inventoryState.dragHelper = null;
        if (updateAdventurer) {
            const hero = character.hero;
            removeBonusSourceFromObject(hero.variableObject, character.jewelBonuses, false);
            updateJewelBonuses(character);
            addBonusSourceToObject(hero.variableObject, character.jewelBonuses, true);
            refreshStatsPanel();
        }
        return true;
    }
    updateAdjacentJewels(jewelInventoryState.draggedJewel);
    if (updateAdventurer) {
        const hero = character.hero;
        removeBonusSourceFromObject(hero.variableObject, character.jewelBonuses, false);
        updateJewelBonuses(character);
        addBonusSourceToObject(hero.variableObject, character.jewelBonuses, true);
        refreshStatsPanel();
    }
    return false;
}
function updateJewelCraftingOptions() {
    jewelCraftingButton.style.display = 'none';
    jewelDeformationButton.style.display = 'none';
    const jewelA: Jewel = getElementJewel(craftingSlotA.querySelector('.js-jewel'));
    const jewelB: Jewel = getElementJewel(craftingSlotB.querySelector('.js-jewel'));
    if (!jewelA && !jewelB) return;
    if (jewelA && jewelB) {
        jewelCraftingButton.innerHTML = 'Fuse Jewels';
        jewelCraftingButton.style.display = 'inline';
        if (getFusedShape(jewelA, jewelB)) {
            jewelCraftingButton.setAttribute('helpText', 'Click to fuse these jewels together');
            jewelCraftingButton.classList.remove('disabled');
        } else {
            jewelCraftingButton.setAttribute('helpText', 'These jewels cannot be fused.')
            jewelCraftingButton.classList.add('disabled');
        }
        return;
    }
    const jewel = jewelA || jewelB;
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'diamond') {
        jewelDeformationButton.innerHTML = 'Expand Jewel';
        jewelDeformationButton.setAttribute('helpText', 'Click to expand the shape of this jewel.');
        jewelDeformationButton.style.display = 'inline';
    } else if (jewel.shapeType === 'rhombus' || jewel.shapeType === 'square') {
        jewelDeformationButton.innerHTML = 'Compress Jewel';
        jewelDeformationButton.setAttribute('helpText', 'Click to compress the shape of this jewel.');
        jewelDeformationButton.style.display = 'inline';
    }
    jewelCraftingButton.innerHTML = 'Split Jewel';
    jewelCraftingButton.style.display = 'inline';
    if (jewel.shapeType == 'triangle' || jewel.shapeType == 'rhombus') {
        jewelCraftingButton.setAttribute('helpText', 'This jewel cannot be split.');
        jewelCraftingButton.classList.add('disabled');
    } else {
        jewelCraftingButton.setAttribute('helpText', 'Click to split this jewel into smaller jewels');
        jewelCraftingButton.classList.remove('disabled');
    }
}

function getFusedShape(jewelA: Jewel, jewelB: Jewel): ShapeDefinition {
    var totalArea = jewelA.area + jewelB.area;
    var fusedKey = null;
    for (let key in shapeDefinitions) {
        const shape:ShapeDefinition = shapeDefinitions[key][0];
        if (Math.abs(shape.area - totalArea) < tolerance) {
            return shape;
        }
    }
    return null;
}

jewelCraftingButton.onclick = function () {
    const jewelA = getElementJewel(craftingSlotA.querySelector('.js-jewel'));
    const jewelB = getElementJewel(craftingSlotB.querySelector('.js-jewel'));
    if (!jewelA && !jewelB) return;
    if (jewelA && jewelB) fuseJewels(jewelA, jewelB);
    else splitJewel(jewelA || jewelB);
};
jewelDeformationButton.onclick = function () {
    const jewelA = getElementJewel(craftingSlotA.querySelector('.js-jewel'));
    const jewelB = getElementJewel(craftingSlotB.querySelector('.js-jewel'));
    const jewel = jewelA || jewelB;
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'diamond') expandJewel(jewel);
    else compressJewel(jewel);
};
function fuseJewels(jewelA: Jewel, jewelB: Jewel) {
    const fusedShape = getFusedShape(jewelA, jewelB);
    if (!fusedShape) return; // No fused shape exists for this combination of jewels.
    const tier: JewelTier = jewelA.tier > jewelB.tier ? jewelA.tier : jewelB.tier;
    const quality = (jewelA.quality * jewelA.area + jewelB.quality * jewelB.area) / fusedShape.area;
    const components: JewelComponents = [0, 0, 0];
    for (let i = 0;i < 3; i++) {
        components[i] = (jewelA.components[i] * jewelA.area + jewelB.components[i] * jewelB.area) / (jewelA.area + jewelB.area);
    }
    const newJewel = makeJewel(tier, fusedShape.key, components, quality);
    destroyJewel(jewelA);
    destroyJewel(jewelB);
    appendJewelToElement(newJewel, craftingSlotA);
    updateJewelCraftingOptions();
    saveGame();
}
function compressJewel(jewel: Jewel) {
    let newShape;
    if (jewel.shapeType === 'square') newShape = 'diamond';
    if (jewel.shapeType === 'rhombus') newShape = 'triangle';
    if (!newShape) return; // No compression exists for this jewel.
    const newArea = shapeDefinitions[newShape][0].area;
    const newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, craftingSlotA);
    updateJewelCraftingOptions();
    saveGame();
}
function expandJewel(jewel: Jewel) {
    let newShape;
    if (jewel.shapeType === 'diamond') newShape = 'square';
    if (jewel.shapeType === 'triangle') newShape = 'rhombus';
    if (!newShape) return; // No expansion exists for this jewel.
    const newArea = shapeDefinitions[newShape][0].area;
    const newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, craftingSlotA);
    updateJewelCraftingOptions();
    saveGame();
}
function splitJewel(jewel: Jewel) {
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'rhombus') return; // Jewels are too small to split
    let shapeDefinitionA: ShapeDefinition, shapeDefinitionB: ShapeDefinition;
    if (jewel.shapeType === 'hexagon') {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions['trapezoid'][0];
    } else if (jewel.shapeType === 'trapezoid') {
        shapeDefinitionA = shapeDefinitions['diamond'][0];
        shapeDefinitionB = shapeDefinitions['triangle'][0];
    } else if (jewel.shapeType === 'diamond') {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions['triangle'][0];
    } else {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions['rhombus'][0];
    }
    let qualityA, qualityB;
    if (Math.random() < .5) {
        qualityA = jewel.quality * .99 * (1.1 + Math.random() * .1);
        qualityB = (jewel.quality * .99 * jewel.area - qualityA * shapeDefinitionA.area ) / shapeDefinitionB.area;
    } else {
        qualityB = jewel.quality * .99 * (1.1 + Math.random() * .1);
        qualityA = (jewel.quality * .99 * jewel.area - qualityB * shapeDefinitionB.area ) / shapeDefinitionA.area;
    }
    let componentsA: JewelComponents;
    let componentsB: JewelComponents;
    for (let i = 0; i < 3; i++) {
        // A component cannot be higher than 1. ComponentA must also be high enough to insure compontentB is no greater than 1.
        componentsA[i] = Math.max(Math.min(1, jewel.components[i] * (.6 + Math.random() * .8)), jewel.components[i] * jewel.area - shapeDefinitionB.area);
        componentsB[i] = (jewel.components[i] * jewel.area - componentsA[i] * shapeDefinitionA.area) / shapeDefinitionB.area;
    }
    const newJewelA = makeJewel(jewel.tier, shapeDefinitionA.key, componentsA, qualityA);
    const newJewelB = makeJewel(jewel.tier, shapeDefinitionB.key, componentsB, qualityB);
    destroyJewel(jewel);
    appendJewelToElement(newJewelA, craftingSlotA);
    appendJewelToElement(newJewelB, craftingSlotB);
    updateJewelCraftingOptions();
    saveGame();
}
function snapToBoard(jewel: Jewel, board: Board, replace = false, extraJewel = null) {
    const shape = jewel.shape;
    const fixedJewelShapes = board.fixed.map(j => j.shape);
    const jewelShapes = board.jewels.map(j => j.shape);
    if (extraJewel) {
        jewelShapes.push(extraJewel.shape);
    }
    const currentIndex = jewelShapes.indexOf(jewel.shape);
    if (currentIndex >= 0) {
        jewelShapes.splice(currentIndex, 1);
    }
    const allShapes = fixedJewelShapes.concat(jewelShapes);
    const vectors: {
        d2: number,
        rotation: number,
        vector: Point,
    }[] = [];
    const checkedPoints = shape.points;
    const otherPoints = allPoints(allShapes);
    for (var rotation = 0; rotation < 360; rotation += 30) {
        shape.rotate(rotation);
        for (let i = 0; i < checkedPoints.length; i++) {
            for (let j = 0; j < otherPoints.length; j++) {
                let d2 = distanceSquared(checkedPoints[i], otherPoints[j]);
                if (rotation) d2 += 100;
                if (rotation % 60) d2 += 200;
                if (d2 > 2000) continue;
                vectors.push({d2: d2, vector: vector(checkedPoints[i], otherPoints[j]), rotation: rotation});
            }
        }
        shape.rotate(-rotation);
    }
    if (!vectors.length) {
        return false;
    }
    vectors.sort(function (a, b) { return a.d2 - b.d2;});
    // If we aren't close to other shapes and there is no collision, don't
    // move this shape.
    if (vectors[0].d2 > 2000) {
        return false;
    }
    for (let i = 0; i < vectors.length; i++) {
        shape.rotate(vectors[i].rotation);
        shape.translate(vectors[i].vector[0], vectors[i].vector[1]);
        if (checkForCollision([shape], replace ? fixedJewelShapes : allShapes) || !isOnBoard(shape, board)) {
            shape.translate(-vectors[i].vector[0], -vectors[i].vector[1]);
            shape.rotate(-vectors[i].rotation);
        } else {
            if (!replace) {
                return true;
            }
            const jewelsToRemove = [];
            for (let j = 0; j < jewelShapes.length; j++) {
                if (checkForCollision([shape], [jewelShapes[j]])) {
                    jewelsToRemove.push(board.jewels[j]);
                }
            }
            while (jewelsToRemove.length) {
                const jewelToRemove = jewelsToRemove.pop();
                if (jewel.startCharacter) {
                    const center = jewel.startCenter;
                    jewelToRemove.shape.setCenterPosition(center[0], center[1]);
                    if (snapToBoard(jewelToRemove, board, false, jewel)) {
                        updateAdjacentJewels(jewelToRemove);
                        continue;
                    }
                }
                returnToInventory(jewelToRemove);
            }
            return true;
        }
    }
    return false;
}
export function snapBoardToBoard(boardA: Board, boardB: Board): boolean {
    const shapesA = boardA.spaces;
    const shapesB = boardB.spaces;
    const vectors: {
        d2: number,
        vector: Point,
    }[] = [];
    const checkedPoints = allPoints(shapesA);
    const otherPoints = allPoints(shapesB);
    for (let i = 0; i < checkedPoints.length; i++) {
        for (let j = 0; j < otherPoints.length; j++) {
            const d2 = distanceSquared(checkedPoints[i], otherPoints[j]);
            vectors.push({d2: d2, vector: vector(checkedPoints[i], otherPoints[j])});
        }
    }
    if (!vectors.length) {
        return false;
    }
    vectors.sort(function (a, b) { return a.d2 - b.d2;});
    for (let i = 0; i < vectors.length; i++) {
        translateShapes(shapesA, vectors[i].vector);
        if (checkForCollision(shapesA, shapesB)) {
            translateShapes(shapesA, [-vectors[i].vector[0], -vectors[i].vector[1]]);
        } else {
            translateShapes(boardA.fixed.map(j => j.shape), vectors[i].vector);
            return true;
        }
    }
    return false;
}
/**
 * Checks if the given shape is entirely on the spaces provided by the board.
 *
 * Currently this is done by intersecting the shape with each space and adding
 * up the areas of all such intersections. If that sums to the area of the shape,
 * it must entirely be on the board.
 */
function isOnBoard(shape: Polygon, board: Board): boolean {
    const area = computeArea(shape);
    let areaOnBoard = 0;
    for (let i = 0; i < board.spaces.length; i++) {
        areaOnBoard += getIntersectionArea(shape, board.spaces[i]);
        if (areaOnBoard + tolerance >= area) {
            return true;
        }
    }
    return false;
}

function sortJewelDivs(sortFunction: (a: Jewel, b: Jewel) => number) {
    const jewels = [...queryAll('.js-jewelInventory .js-jewel')].map(getElementJewel);
    jewels.sort(sortFunction);
    jewelInventoryContainer.innerHTML = '';
    jewels.forEach(jewel => jewelInventoryContainer.appendChild(jewel.domElement));
}

query('.js-jewelSortRuby').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        return jewelB.components[0] / (jewelB.components[0] + jewelB.components[1] + jewelB.components[2])
            - jewelA.components[0] / (jewelA.components[0] + jewelA.components[1] + jewelA.components[2]);
    });
};
query('.js-jewelSortEmerald').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        return jewelB.components[1] / (jewelB.components[0] + jewelB.components[1] + jewelB.components[2])
            - jewelA.components[1] / (jewelA.components[0] + jewelA.components[1] + jewelA.components[2]);
    });
};
query('.js-jewelSortSaphire').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        return jewelB.components[2] / (jewelB.components[0] + jewelB.components[1] + jewelB.components[2])
            - jewelA.components[2] / (jewelA.components[0] + jewelA.components[1] + jewelA.components[2]);
    });
};

query('.js-jewelSortTopaz').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        var bValue = jewelB.components[0] + jewelB.components[1] - jewelB.components[2] + (jewelB.jewelType === 3 ? 1000 : 0);
        var aValue = jewelA.components[0] + jewelA.components[1] - jewelA.components[2] + (jewelA.jewelType === 3 ? 1000 : 0);
        return bValue - aValue;
    });
};
query('.js-jewelSortAquamarine').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        var bValue = jewelB.components[2] + jewelB.components[1] - jewelB.components[0] + (jewelB.jewelType === 6 ? 1000 : 0);
        var aValue = jewelA.components[2] + jewelA.components[1] - jewelA.components[0] + (jewelA.jewelType === 6 ? 1000 : 0);
        return bValue - aValue;
    });
};
query('.js-jewelSortAmethyst').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        var bValue = jewelB.components[0] + jewelB.components[2] - jewelB.components[1] + (jewelB.jewelType === 5 ? 1000 : 0);
        var aValue = jewelA.components[0] + jewelA.components[2] - jewelA.components[1] + (jewelA.jewelType === 5 ? 1000 : 0);
        return bValue - aValue;
    });
};
query('.js-jewelSortDiamond').onclick = function () {
    sortJewelDivs(function(jewelA, jewelB) {
        var averageA = (jewelA.components[0] + jewelA.components[1] + jewelA.components[2]) / 3
        var aValue = Math.abs(jewelA.components[0] - averageA) + Math.abs(jewelA.components[1] - averageA) + Math.abs(jewelA.components[2] - averageA);
        var averageB = (jewelB.components[0] + jewelB.components[1] + jewelB.components[2]) / 3
        var bValue = Math.abs(jewelB.components[0] - averageB) + Math.abs(jewelB.components[1] - averageB) + Math.abs(jewelB.components[2] - averageB);
        //var aValue = Math.max(jewelB.components[0], jewelB.components[1], jewelB.components[2]) - Math.min(jewelB.components[0], jewelB.components[1], jewelB.components[2]);
        //var bValue = Math.max(jewelA.components[0], jewelA.components[1], jewelA.components[2]) - Math.min(jewelA.components[0], jewelA.components[1], jewelA.components[2]);
        return aValue + (jewelB.jewelType === 7 ? 1000 : 0) - (bValue + (jewelA.jewelType === 7 ? 1000 : 0));
    });
};
query('.js-jewelSortQuality').onclick = function () {
    sortJewelDivs(function(jewelA: Jewel, jewelB: Jewel) {
        return jewelB.quality - jewelA.quality;
    });
};
query('.js-jewelTierLabel input').onchange = function (event) {
    const checkbox: HTMLInputElement = event.target as HTMLInputElement;
    const tier = parseInt(checkbox.getAttribute('value'), 10);
    const display = checkbox.checked;
    [...queryAll('.js-jewelInventory .js-jewel')].map(getElementJewel).forEach((jewel: Jewel) => {
        if (jewel.tier === tier) {
            jewel.domElement.classList.toggle('hiddenJewel', !display);
        }
    });
};

query('.js-jewelBoard').addEventListener('mouseover', function () {
    const gameState = getState();
    if (gameState.selectedCharacter.board.boardPreview) {
        const level = map[gameState.selectedCharacter.currentLevelKey];
        const skill = gameState.selectedCharacter.board.boardPreview.fixed[0].ability;
        previewPointsChange('divinity', -totalCostForNextLevel(getState().selectedCharacter, level));
    }
});
query('.js-jewelBoard').addEventListener('mouseout', hidePointsPreview);
