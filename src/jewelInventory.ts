import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { addActions } from 'app/character';
import {
    getClosestElement, findEmptyElement, jewelInventoryContainer,
    jewelsCanvas, query, queryAll
} from 'app/dom';
import { getState } from 'app/state';
import {
    Jewel, JewelComponents, JewelTier, jewelTierLevels,
    makeJewel, updateAdjacentJewels, updateJewelBonuses,
} from 'app/jewels';
import { gain, hidePointsPreview, previewPointsChange } from 'app/points';
import { ifdefor, isPointInRectObject, rectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import {
    allPoints,
    checkForCollision,
    computeArea,
    distanceSquared,
    getIntersectionArea,
    isPointInPoints,
    ShapeDefinition,
    shapeDefinitions,
    tolerance,
    translateShapes,
    vector,
} from 'app/utils/polygon';
import { drawJewel } from 'app/drawJewel';
import { saveGame } from 'app/saveGame'

function redrawInventoryJewel(jewel) {
    //centerShapesInRectangle([jewel.shape], rectangle(0, 0, jewel.canvas.width, jewel.canvas.height));
    jewel.context.clearRect(0, 0, jewel.canvas.width, jewel.canvas.height);
    drawJewel(jewel.context, jewel.shape, getMousePosition(jewel.canvas));
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
    jewel.context.fillText(jewel.quality.format(2), jewel.canvas.width / 2,  jewel.canvas.height / 2);
    jewel.context.fillStyle = '#000';
    jewel.context.fillText(jewel.quality.format(2), jewel.canvas.width / 2 - 1,  jewel.canvas.height / 2 - 1);*/
    jewel.context.textBaseline = "bottom";
    jewel.context.textAlign = 'right'
    jewel.context.font = "15px sans-serif";
    jewel.context.fillStyle = '#fff';
    jewel.context.fillText(jewel.quality.format(2), jewel.canvas.width - 5,  jewel.canvas.height);
    jewel.context.fillStyle = '#aaa';
    jewel.context.fillText(jewel.quality.format(2), jewel.canvas.width - 5 - 1,  jewel.canvas.height - 1);
    jewel.context.fillStyle = '#000';
    jewel.context.fillText(jewel.quality.format(2), jewel.canvas.width - 5 - 2,  jewel.canvas.height - 2);
}
export function redrawInventoryJewels() {
    let jewelsDrawn = 0;
    let jewelsTotal = 0;
    jewelInventoryContainer.getElementsByClassName('.js-jewel').forEach(function (index, element) {
        jewelsTotal++;
        if ($(element).is(':visible') && collision($container, $(element))) {
            jewelsDrawn++;
            redrawInventoryJewel($(element).data('jewel'));
        }
    });
    // Crafting slots are always visible.
    $('.js-jewelCraftingSlot .js-jewel').each(function () {
        redrawInventoryJewel($(this).data('jewel'));
    });
}
jewelInventoryContainer.onscroll = redrawInventoryJewels;

function sellJewel(jewel) {
    if (jewel.fixed) return;
    if (jewel.character && state.characters.indexOf(jewel.character) < 0) {
        return;
    }
    if (dragHelper && jewel !== jewelInventoryState.draggedJewel) {
        return;
    }
    // unequip and deletes the jewel.
    destroyJewel(jewel);
    setMaxAnimaJewelBonus(state.maxAnimaJewelMultiplier * jewelAnimaBonus(jewel));
    gain('coins', jewel.price);
    gain('anima', jewel.price);
    updateJewelCraftingOptions();
    saveGame();
}

export const jewelInventoryState = {
    // The vertex the mouse is over.
    overVertex: null,
    // The jewel the mouse is over.
    overJewel: null,
    // The jewel being dragged.
    draggedJewel: null,
    // The fixed jewel being used to drag the board.
    draggingBoardJewel: null,
}

document.body.ondblclick = function (event) {
    if (!jewelInventoryState.overJewel || !jewelInventoryState.overJewel.fixed || !jewelInventoryState.overJewel.confirmed) return; // dblclick action only applies to fixed jewels
    // Cannot interact with jewel boards of characters that are not in your guild yet.
    if (jewelInventoryState.overJewel.character && state.characters.indexOf(jewelInventoryState.overJewel.character) < 0) return;
    jewelInventoryState.overJewel.disabled = !jewelInventoryState.overJewel.disabled;
    var ability = jewelInventoryState.overJewel.ability;
    if (!ability) return;
    if (jewelInventoryState.overJewel.disabled) {
        var abilityIndex = state.selectedCharacter.adventurer.abilities.indexOf(ability);
        state.selectedCharacter.adventurer.abilities.splice(abilityIndex, 1);
        removeActions(state.selectedCharacter.adventurer, ability);
        removeBonusSourceFromObject(state.selectedCharacter.adventurer, ability, true);
        refreshStatsPanel();
    } else {
        state.selectedCharacter.adventurer.abilities.push(ability);
        addActions(state.selectedCharacter.adventurer, ability);
        addBonusSourceToObject(state.selectedCharacter.adventurer, ability, true);
        refreshStatsPanel();
    }
    removePopup();
    saveGame();
}
document.body.onmousedown = function (event) {
    var specialClick = event.ctrlKey || event.metaKey;
    if (event.which != 1) return; // Handle only left click.
    if (jewelInventoryState.draggedJewel || jewelInventoryState.draggingBoardJewel) {
        stopJewelDrag();
        return;
    }
    if (!jewelInventoryState.overJewel) {
        return;
    }
    // Cannot interact with jewel boards of characters that are not in your guild yet.
    if (jewelInventoryState.overJewel.character && state.characters.indexOf(jewelInventoryState.overJewel.character) < 0) {
        return;
    }
    if (jewelInventoryState.overJewel.fixed) {
        // Don't allow users to rotate the entire board. This can be confusing,
        // and they may accidentally trigger this trying to rotate other jewels.
        if (jewelInventoryState.overVertex && jewelInventoryState.overJewel.confirmed) {
            return;
        }
        jewelInventoryState.draggingBoardJewel = jewelInventoryState.overJewel;
        dragged = false;
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
        updateJewelUnderMouse($('.js-skillCanvas'));
        updateJewelCraftingOptions();
        return;
    }
    jewelInventoryState.draggedJewel = jewelInventoryState.overJewel;
    $('.js-jewelCraftingSlot').addClass('active');
    jewelInventoryState.draggedJewel.startCharacter = jewelInventoryState.draggedJewel.character;
    jewelInventoryState.draggedJewel.startCenter = [jewelInventoryState.draggedJewel.shape.center[0], jewelInventoryState.draggedJewel.shape.center[1]];
    clearAdjacentJewels(jewelInventoryState.draggedJewel);
    updateAdjacencyBonuses(jewelInventoryState.draggedJewel);
    if ($popup) {
        $popup.remove();
        checkToShowJewelToolTip();
    }
    if (jewelInventoryState.overVertex) {
        return;
    }
    jewelInventoryState.overJewel = null;
    // Remove this jewel from the board it is in while dragging.
    removeFromBoard(jewelInventoryState.draggedJewel);
    dragHelper = jewelInventoryState.draggedJewel.canvas;
    jewelInventoryState.draggedJewel.domElement.remove();
    jewelInventoryState.draggedJewel.shape.setCenterPosition(jewelInventoryState.draggedJewel.canvas.width / 2, jewelInventoryState.draggedJewel.canvas.height / 2);
    dragHelper.css('position', 'absolute');
    $('.js-mouseContainer').append(dragHelper);
    redrawInventoryJewel(jewelInventoryState.draggedJewel);
    updateDragHelper();
    dragged = false;
});
// Replace this with generic mousemove handling.
document.body.addEventListener('mousemove', function (event) {
    const jewelContainer = (event.target as HTMLElement).closest('.js-jewel');
    if (!jewelContainer) {
        return;
    }
    if (jewelInventoryState.draggedJewel || dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    // updateMousePosition(event);
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    const jewel = getElementJewel(jewelContainer);
    var points = jewel.shape.points;
    var relativePosition = getMousePosition(jewel.canvas);
    if (isPointInPoints(relativePosition, points)) {
        jewelInventoryState.overJewel = jewel;
        checkToShowJewelToolTip();
        return;
    }
    for (var j = 0; j < points.length; j++) {
        if (distanceSquared(points[j], relativePosition) < 25) {
            jewelInventoryState.overJewel = jewel;
            jewelInventoryState.overVertex = points[j].concat();
            checkToShowJewelToolTip();
            return;
        }
    }
});
function updateJewelUnderMouse($jewelCanvas) {
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    if (!isPointInRectObject(mousePosition[0], mousePosition[1], getElementRectangle($jewelCanvas, $('.js-mouseContainer')))) {
        $('.js-jewel').each(function (index, element) {
            var jewel = $(this).data('jewel');
            var points = jewel.shape.points;
            var relativePosition = relativeMousePosition(jewel.canvas);
            if (isPointInPoints(relativePosition, points)) {
                jewelInventoryState.overJewel = jewel;
                return false;
            }
            for (var j = 0; j < points.length; j++) {
                if (distanceSquared(points[j], relativePosition) < 25) {
                    jewelInventoryState.overJewel = jewel;
                    jewelInventoryState.overVertex = points[j].concat();
                    checkToShowJewelToolTip();
                    return false;
                }
            }
        });
        return;
    }
    var character = $jewelCanvas.data('character');
    var relativePosition = relativeMousePosition($jewelCanvas);
    var jewels = character.board.jewels;
    for (var i = 0; i < jewels.length; i++) {
        var jewel = jewels[i];
        var points = jewel.shape.points;
        if (isPointInPoints(relativePosition, points)) {
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
    var jewels = character.board.fixed.concat();
    if (character.board.boardPreview) {
        jewels = jewels.concat(character.board.boardPreview.fixed);
    }
    for (var i = 0; i < jewels.length; i++) {
        var jewel = jewels[i];
        var points = jewel.shape.points;
        if (isPointInPoints(relativePosition, points)) {
            jewelInventoryState.overJewel = jewel;
            checkToShowJewelToolTip();
            return;
        }
        for (var j = 0; j < points.length; j++) {
            if (distanceSquared(points[j], relativePosition) < 25) {
                jewelInventoryState.overJewel = jewel;
                jewelInventoryState.overVertex = points[j].concat();
                checkToShowJewelToolTip();
                return;
            }
        }
    }
}
// Replace this with generic mousemove handling.
document.body.addEventListener('mousemove', function (event) {
    if (jewelInventoryState.draggedJewel || dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    const skillCanvas = event.target.closest('.js-skillCanvas');
    if (skillCanvas) {
        updateJewelUnderMouse(skillCanvas);
        //updateMousePosition(event);
    }
});
// Replace this with generic mousemove handling.
document.body.addEventListener('mousemove', function (event) {
    if (jewelInventoryState.draggedJewel || dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    const skillCanvas = event.target.closest('.js-applicationSkillCanvas');
    if (skillCanvas) {
        //updateMousePosition(event);
        updateJewelUnderMouse(skillCanvas);
    }
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
            centerToMouse = vector(center, relativeMousePosition(jewelsCanvas));
        } else {
            centerToMouse = vector(center, relativeMousePosition(jewelInventoryState.draggedJewel.canvas));
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
    var character = jewelInventoryState.draggingBoardJewel.character;
    var boardShapes = [];
    if (character.board.boardPreview) {
        boardShapes = character.board.boardPreview.fixed.map(j => j.shape).concat(character.board.boardPreview.spaces);
    }
    if (jewelInventoryState.draggingBoardJewel.confirmed) {
        boardShapes = boardShapes.concat(character.board.jewels.map(j => j.shape)).concat(character.board.fixed.map(j => j.shape)).concat(character.board.spaces);
    }
    var mousePosition = relativeMousePosition(jewelsCanvas);
    // Translate the board so the fixed jewel is centered under the mouse.
    if (jewelInventoryState.overVertex === null) {
        var v = vector(jewelInventoryState.draggingBoardJewel.shape.center, mousePosition);
        if (jewelInventoryState.draggingBoardJewel.confirmed) {
            var bounds = getBounds(allPoints(boardShapes));
            v[0] = Math.min(character.boardCanvas.width / 2 - bounds.left, v[0]);
            v[0] = Math.max(character.boardCanvas.width / 2 - bounds.left - bounds.width, v[0]);
            v[1] = Math.min(character.boardCanvas.height / 2 - bounds.top, v[1]);
            v[1] = Math.max(character.boardCanvas.height / 2 - bounds.top - bounds.height, v[1]);
        }
        translateShapes(boardShapes, v);
        dragged = true;
        if (jewelInventoryState.draggingBoardJewel.confirmed) {
            character.boardContext.clearRect(0, 0, character.boardCanvas.width, character.boardCanvas.height);
            drawBoardBackground(character.boardContext, character.board);
        }
        return;
    }
    // Rotate the board
    var points = jewelInventoryState.draggingBoardJewel.shape.points;
    var center = jewelInventoryState.draggingBoardJewel.shape.center;
    var centerToMouse = vector(center, mousePosition);
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
    var relativePosition
    if (jewelInventoryState.overJewel.character) {
        relativePosition = relativeMousePosition(jewelInventoryState.overJewel.character.jewelsCanvas);
    } else {
        relativePosition = relativeMousePosition(jewelInventoryState.overJewel.canvas);
    }
    var points = jewelInventoryState.overJewel.shape.points;
    for (var j = 0; j < points.length; j++) {
        if (distanceSquared(points[j], relativePosition) < 25) {
            return;
        }
    }
    if (isPointInPoints(relativePosition, jewelInventoryState.overJewel.shape.points)) {
        return;
    }
    jewelInventoryState.overJewel = null;
}
document.body.addEventListener('mouseout', function (event) {
    const jewel = event.target.closest('.js-jewel');
    if (jewel) {
        redrawInventoryJewel(jewel.jewel);
    }
});

function removeFromBoard(jewel) {
    if (!jewel.character) return;
    var jewels = jewel.character.board.jewels;
    var adventurer = jewel.character.adventurer;
    var index = jewels.indexOf(jewel);
    if (index >= 0) {
        // To properly update a character when the jewel board changes, we remove
        // the bonus as it is, then update it after removing the jewel and add
        // the bonus back again and trigger the stat update for the adventurer.
        jewels.splice(index, 1);
        removeBonusSourceFromObject(adventurer, adventurer.character.jewelBonuses, false);
        jewel.character = null;
        updateAdjacentJewels(jewel);
        updateJewelBonuses(adventurer.character);
        addBonusSourceToObject(adventurer, adventurer.character.jewelBonuses, true);
        refreshStatsPanel();
    }
}
function returnToInventory(jewel) {
    removeFromBoard(jewel);
    jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
    jewel.canvas.css('position', '');
    jewel.domElement.append(jewel.canvas);
    jewel.startCharacter = null;
    addJewelToInventory(jewel.domElement);
}
export function addJewelToInventory(jewelElement:HTMLElement) {
    jewelInventoryContainer.appendChild(jewelElement);
    filterJewel(jewelElement);
}
function filterJewel(jewelElement) {
    // Hide/show this jewel depending on whether the tier is filtered out.
    const tier = jewelElement.jewel.tier;
    const showTier = query('.js-jewelTier' + tier + ' input').checked;
    jewelElement.toggleClass('hiddenJewel', !showTier);
}

export function stopJewelDrag() {
    queryAll('.js-jewelCraftingSlot').forEach(element => element.classList.remove('active'));
    if (jewelInventoryState.draggingBoardJewel) stopBoardDrag();
    if (!jewelInventoryState.draggedJewel) return;
    if (jewelInventoryState.overVertex) {
        jewelInventoryState.overVertex = null;
        if (jewelInventoryState.draggedJewel.character) {
            var jewelInventoryState.draggedJewelCharacter = jewelInventoryState.draggedJewel.character;
            removeFromBoard(jewelInventoryState.draggedJewel);
            if (equipJewel(jewelInventoryState.draggedJewelCharacter, false, true)) {
                checkToShowJewelToolTip();
                return;
            }
            returnToInventory(jewelInventoryState.draggedJewel);
        }
        jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
        jewelInventoryState.draggedJewel = null;
        dragHelper = null;
        return;
    }
    if (collision(jewelInventoryState.draggedJewel.canvas, query('.js-sellItem'))) {
        sellJewel(jewelInventoryState.draggedJewel);
        jewelInventoryState.draggedJewel = null;
        dragHelper = null;
        return;
    }
    // Drop the jewel on a skill board if it is over one.
    queryAll('.js-skillCanvas').forEach(element => {
        if (!collision(jewelInventoryState.draggedJewel.canvas, element)) {
            return true;
        }
        var relativePosition = relativeMousePosition(jewelsCanvas);
        jewelInventoryState.draggedJewel.shape.setCenterPosition(relativePosition[0], relativePosition[1]);
        if (equipJewel(state.selectedCharacter, true, true)) {
            checkToShowJewelToolTip();
            updateJewelCraftingOptions();
            return false;
        }
    });
    if (!jewelInventoryState.draggedJewel) return;
    jewelInventoryState.draggedJewel.character = null;
    $craftingSlot = getClosestElement(jewelInventoryState.draggedJewel.canvas, $('.js-jewelCraftingSlot'), 60);
    if ($craftingSlot) {
        var $existingItem = $craftingSlot.find('.js-jewel');
        if ($existingItem.length) {
            $existingItem.remove();
            addJewelToInventory($existingItem);
        }
        appendDraggedJewelToElement($craftingSlot);
    }
    if (!jewelInventoryState.draggedJewel) return;
    var $target = null;
    var largestCollision = 0;
    $('.js-jewelInventory .js-jewel').each(function (index, element) {
        var $element = $(element);
        var collisionArea = getCollisionArea(jewelInventoryState.draggedJewel.canvas, $element);
        if (collisionArea > largestCollision) {
            $target = $element;
            largestCollision = collisionArea;
        }
    });
    if ($target) {
        if (!jewelInventoryState.draggedJewel) return;
        // Code for adding a jewel to the inventory is designed to always append
        // to the end. To support adding it before a target element, just append
        // to the end first so we get all the normal logic for cleaning up the
        // drag operation, then remove the item and place it before the target.
        appendDraggedJewelToElement(jewelInventoryContainer);
        filterJewel(jewelInventoryState.draggedJewel.domElement);
        $target.before(jewelInventoryState.draggedJewel.domElement.remove());
    }
    if (!jewelInventoryState.draggedJewel) return;
    filterJewel(jewelInventoryState.draggedJewel.domElement);
    appendDraggedJewelToElement(jewelInventoryContainer);
}

function stopBoardDrag() {
    var character = jewelInventoryState.draggingBoardJewel.character;
    if (!jewelInventoryState.draggingBoardJewel.confirmed) {
        snapBoardToBoard(character.board.boardPreview, character.board);
    }
    jewelInventoryState.draggingBoardJewel = null;
}
function appendDraggedJewelToElement(container) {
    if (!jewelInventoryState.draggedJewel) return;
    appendJewelToElement(jewelInventoryState.draggedJewel, container);
    jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
    jewelInventoryState.draggedJewel = null;
    dragHelper = null;
    updateJewelCraftingOptions();
}
function appendJewelToElement(jewel, $element) {
    jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
    jewel.domElement.append(jewel.canvas);
    $element.append(jewel.domElement);
    jewel.canvas.style.position = '';
}
export function equipJewel(character, replace, updateAdventurer) {
    if (jewelTierLevels[jewelInventoryState.draggedJewel.tier] <= character.adventurer.level
        && snapToBoard(jewelInventoryState.draggedJewel, character.board, replace)) {
        jewelInventoryState.draggedJewel.character = character;
        jewelInventoryState.draggedJewel.domElement.remove();
        jewelInventoryState.draggedJewel.canvas.remove();
        character.board.jewels.push(jewelInventoryState.draggedJewel);
        jewelInventoryState.overJewel = jewelInventoryState.draggedJewel;
        updateAdjacentJewels(jewelInventoryState.draggedJewel);
        jewelInventoryState.draggedJewel = null;
        dragHelper = null;
        if (updateAdventurer) {
            var adventurer = character.adventurer;
            removeBonusSourceFromObject(adventurer, adventurer.character.jewelBonuses, false);
            updateJewelBonuses(adventurer.character);
            addBonusSourceToObject(adventurer, adventurer.character.jewelBonuses, true);
            refreshStatsPanel();
        }
        return true;
    }
    updateAdjacentJewels(jewelInventoryState.draggedJewel);
    if (updateAdventurer) {
        var adventurer = character.adventurer;
        removeBonusSourceFromObject(adventurer, adventurer.character.jewelBonuses, false);
        updateJewelBonuses(adventurer.character);
        addBonusSourceToObject(adventurer, adventurer.character.jewelBonuses, true);
        refreshStatsPanel();
    }
    return false;
}
function getCraftingSlotA() {
    return query('.js-jewelCraftingSlotA');
}
function getCraftingSlotB() {
    return query('.js-jewelCraftingSlotB');
}
function getElementJewel(element: Element): Jewel {
    for (const jewel of getState().savedState.jewels) {
        if (jewel.domElement === element) return jewel;
    }
    return null;
}
const jewelCraftingButton:HTMLElement = query('.js-jewelCraftingButton');
const jewelDeformationButton:HTMLElement = query('.js-jewelDeformationButton');
function updateJewelCraftingOptions() {
    jewelCraftingButton.style.display = 'none';
    jewelDeformationButton.style.display = 'none';
    const jewelA: Jewel = getElementJewel(getCraftingSlotA().querySelector('.js-jewel'));
    const jewelB: Jewel = getElementJewel(getCraftingSlotB().querySelector('.js-jewel'));
    if (!jewelA && !jewelB) return;
    if (jewelA && jewelB) {
        jewelCraftingButton.innerHTML = 'Fuse Jewels';
        jewelCraftingButton.style.display = 'inline';
        if (getFusedShape(jewelA, jewelB)) {
            jewelCraftingButton.setAttribute('helptext', 'Click to fuse these jewels together');
            jewelCraftingButton.classList.remove('disabled');
        } else {
            jewelCraftingButton.setAttribute('helptext', 'These jewels cannot be fused.')
            jewelCraftingButton.classList.add('disabled');
        }
        return;
    }
    const jewel = jewelA || jewelB;
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'diamond') {
        jewelDeformationButton.innerHTML = 'Expand Jewel';
        jewelDeformationButton.setAttribute('helptext', 'Click to expand the shape of this jewel.');
        jewelDeformationButton.style.display = 'inline';
    } else if (jewel.shapeType === 'rhombus' || jewel.shapeType === 'square') {
        jewelDeformationButton.innerHTML = 'Compress Jewel';
        jewelDeformationButton.setAttribute('helptext', 'Click to compress the shape of this jewel.');
        jewelDeformationButton.style.display = 'inline';
    }
    jewelCraftingButton.innerHTML = 'Split Jewel';
    jewelCraftingButton.style.display = 'inline';
    if (jewel.shapeType == 'triangle' || jewel.shapeType == 'rhombus') {
        jewelCraftingButton.setAttribute('helptext', 'This jewel cannot be split.');
        jewelCraftingButton.classList.add('disabled');
    } else {
        jewelCraftingButton.setAttribute('helptext', 'Click to split this jewel into smaller jewels');
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
    const jewelA = getElementJewel(getCraftingSlotA().querySelector('.js-jewel'));
    const jewelB = getElementJewel(getCraftingSlotB().querySelector('.js-jewel'));
    if (!jewelA && !jewelB) return;
    if (jewelA && jewelB) fuseJewels(jewelA, jewelB);
    else splitJewel(jewelA || jewelB);
};
jewelDeformationButton.onclick = function () {
    const jewelA = getElementJewel(getCraftingSlotA().querySelector('.js-jewel'));
    const jewelB = getElementJewel(getCraftingSlotB().querySelector('.js-jewel'));
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
    appendJewelToElement(newJewel, getCraftingSlotA());
    updateJewelCraftingOptions();
    saveGame();
}
function compressJewel(jewel) {
    var newShape;
    if (jewel.shapeType === 'square') newShape = 'diamond';
    if (jewel.shapeType === 'rhombus') newShape = 'triangle';
    if (!newShape) return; // No compression exists for this jewel.
    var newArea = shapeDefinitions[newShape][0].area;
    var newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, getCraftingSlotA());
    updateJewelCraftingOptions();
    saveGame();
}
function expandJewel(jewel) {
    var newShape;
    if (jewel.shapeType === 'diamond') newShape = 'square';
    if (jewel.shapeType === 'triangle') newShape = 'rhombus';
    if (!newShape) return; // No expansion exists for this jewel.
    var newArea = shapeDefinitions[newShape][0].area;
    var newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, getCraftingSlotA());
    updateJewelCraftingOptions();
    saveGame();
}
function destroyJewel(jewel) {
    removeFromBoard(jewel);
    jewel.domElement.data('jewel', null).remove();
    jewel.canvas.data('jewel', null).remove();
}
function splitJewel(jewel) {
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'rhombus') return; // Jewels are too small to split
    var shapeDefinitionA, shapeDefinitionB;
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
    var componentsA: JewelComponents = [0, 0, 0];
    var componentsB: JewelComponents = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        // A component cannot be higher than 1. ComponentA must also be high enough to insure compontentB is no greater than 1.
        componentsA[i] = Math.max(Math.min(1, jewel.components[i] * (.6 + Math.random() * .8)), jewel.components[i] * jewel.area - shapeDefinitionB.area);
        componentsB[i] = (jewel.components[i] * jewel.area - componentsA[i] * shapeDefinitionA.area) / shapeDefinitionB.area;
    }
    var newJewelA = makeJewel(jewel.tier, shapeDefinitionA.key, componentsA, qualityA);
    var newJewelB = makeJewel(jewel.tier, shapeDefinitionB.key, componentsB, qualityB);
    destroyJewel(jewel);
    appendJewelToElement(newJewelA, getCraftingSlotA());
    appendJewelToElement(newJewelB, getCraftingSlotB());
    updateJewelCraftingOptions();
    saveGame();
}
function snapToBoard(jewel, board, replace, extraJewel) {
    var shape = jewel.shape;
    replace = ifdefor(replace, false);
    var fixedJewelShapes = board.fixed.map(j => j.shape);
    var jewelShapes = board.jewels.map(j => j.shape);
    if (extraJewel) {
        jewelShapes.push(extraJewel.shape);
    }
    var currentIndex = jewelShapes.indexOf(jewel.shape);
    if (currentIndex >= 0) {
        jewelShapes.splice(currentIndex, 1);
    }
    var allShapes = fixedJewelShapes.concat(jewelShapes);
    var vectors = [];
    var checkedPoints = shape.points;
    var otherPoints = allPoints(allShapes);
    for (var rotation = 0; rotation < 360; rotation += 30) {
        shape.rotate(rotation);
        for (var i = 0; i < checkedPoints.length; i++) {
            for (var j = 0; j < otherPoints.length; j++) {
                var d2 = distanceSquared(checkedPoints[i], otherPoints[j]);
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
    for (var i = 0; i < vectors.length; i++) {
        shape.rotate(vectors[i].rotation);
        shape.translate(vectors[i].vector[0], vectors[i].vector[1]);
        if (checkForCollision([shape], replace ? fixedJewelShapes : allShapes) || !isOnBoard(shape, board)) {
            shape.translate(-vectors[i].vector[0], -vectors[i].vector[1]);
            shape.rotate(-vectors[i].rotation);
        } else {
            if (!replace) {
                return true;
            }
            var jewelsToRemove = [];
            for (var j = 0; j < jewelShapes.length; j++) {
                if (checkForCollision([shape], [jewelShapes[j]])) {
                    jewelsToRemove.push(board.jewels[j]);
                }
            }
            while (jewelsToRemove.length) {
                var jewelToRemove = jewelsToRemove.pop();
                if (jewel.startCharacter) {
                    var center = jewel.startCenter;
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
export function snapBoardToBoard(boardA, boardB) {
    var shapesA = boardA.spaces;
    var shapesB = boardB.spaces;
    var vectors = [];
    var checkedPoints = allPoints(shapesA);
    var otherPoints = allPoints(shapesB);
    for (var i = 0; i < checkedPoints.length; i++) {
        for (var j = 0; j < otherPoints.length; j++) {
            var d2 = distanceSquared(checkedPoints[i], otherPoints[j]);
            vectors.push({d2: d2, vector: vector(checkedPoints[i], otherPoints[j])});
        }
    }
    if (!vectors.length) {
        return false;
    }
    vectors.sort(function (a, b) { return a.d2 - b.d2;});
    for (var i = 0; i < vectors.length; i++) {
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
function isOnBoard(shape, board) {
    const area = computeArea(shape);
    let areaOnBoard = 0;
    for (var i = 0; i < board.spaces.length; i++) {
        areaOnBoard += getIntersectionArea(shape, board.spaces[i]);
        if (areaOnBoard + tolerance >= area) {
            return true;
        }
    }
    return false;
}

function sortJewelDivs(sortFunction) {
    const jewels = getState().savedState.jewels;
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
    const jewels = getState().savedState.jewels;
    jewels.forEach((jewel: Jewel) => {
        if (jewel.tier === tier) {
            jewel.domElement.classList.toggle('hiddenJewel', !display);
        }
    });
};

query('.js-jewelBoard').addEventListener('mouseover', function () {
    const gameState = getState();
    if (gameState.selectedCharacter.board.boardPreview) {
        var level = map[gameState.selectedCharacter.currentLevelKey];
        var skill = gameState.selectedCharacter.board.boardPreview.fixed[0].ability;
        previewPointsChange('divinity', -totalCostForNextLevel(state.selectedCharacter, level));
    }
});
query('.js-jewelBoard').addEventListener('mouseout', hidePointsPreview);
