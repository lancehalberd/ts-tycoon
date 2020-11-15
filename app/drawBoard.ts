import { getAbilityIconSource } from 'app/content/abilities';
import { drawJewel } from 'app/drawJewel';
import { drawAbilityIcon } from 'app/render/drawIcons';
import { jewelInventoryState } from 'app/jewelInventory';
import { jewelTierLevels } from 'app/jewels';
import { getMousePosition, isMouseOverElement } from 'app/utils/mouse';
import { Polygon } from 'app/utils/polygon';

import { Board, Character, Point } from 'app/types';

function drawShapesPath(context: CanvasRenderingContext2D, shapes: Polygon[], fill = false, stroke = false) {
    for (const shape of shapes) {
        const points = shape.points;
        context.beginPath();
        context.moveTo(points[0][0], points[0][1]);
        for (let j = 1; j < points.length; j++) {
            context.lineTo(points[j][0], points[j][1]);
        }
        context.closePath();
        if (fill) context.fill();
        if (stroke) context.stroke();
    }
}

export function drawBoardJewels(character: Character, canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    const board = character.board;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(character.boardCanvas, 0, 0, character.boardCanvas.width, character.boardCanvas.height);
    // Show open spaces as green or red when the player is dragging a jewel, indicating the character can equip the jewel or not.
    if (jewelInventoryState.draggedJewel && !jewelInventoryState.overVertex) {
        const fillColor = (jewelTierLevels[jewelInventoryState.draggedJewel.tier] > character.hero.level) ? '#FF0000' : '#00FF00';
        context.fillStyle = fillColor;
        context.globalAlpha = .5;
        drawShapesPath(context, board.spaces, true, false);
        context.globalAlpha = 1;
    }
    const mousePosition = getMousePosition(canvas);
    const gradient = context.createRadialGradient(
        mousePosition[0], mousePosition[1], 5,
        mousePosition[0], mousePosition[1], 60
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Set the fill style and draw a rectangle
    context.fillStyle = gradient;
    drawShapesPath(context, board.spaces, true, false);

    drawBoardJewelsProper(context, mousePosition, board, isMouseOverElement(canvas));
}
export function drawBoardJewelsProper(context: CanvasRenderingContext2D, lightSource: Point, board: Board, mouseIsOverBoard = false) {
    //const focusedJewelIsOnBoard = false;
    const fixedJewels = board.fixed;
    for (let i = 0; i < board.jewels.length; i++) {
        const jewel = board.jewels[i];
        drawJewel(context, jewel.shape, lightSource, null, 0.3, true);
        //focusedJewelIsOnBoard = focusedJewelIsOnBoard || jewelInventoryState.draggedJewel == jewel || jewelInventoryState.overJewel == jewel;
    }
    for (let i = 0; i < fixedJewels.length; i++) {
        const jewel = fixedJewels[i];
        if (jewel.disabled) {
            context.save();
            context.globalAlpha = .3;
            jewel.shape.color = '#fff';
            drawJewel(context, jewel.shape, lightSource);
            context.restore();
        } else {
            jewel.shape.color = '#333';
            drawJewel(context, jewel.shape, lightSource);
        }
        const iconSource = getAbilityIconSource(jewel.ability);
        if (mouseIsOverBoard && iconSource) {
            drawAbilityIcon(context, iconSource,
                {x: jewel.shape.center[0] - 10, y: jewel.shape.center[1] - 10, w: 20, h: 20});
        }
    }
    if (board.boardPreview) {
        context.save();
        context.globalAlpha = .6;
        drawBoardPreview(context, lightSource, board.boardPreview, mouseIsOverBoard)
        context.restore();
    }
    /*if (jewelInventoryState.overVertex && focusedJewelIsOnBoard) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(jewelInventoryState.overVertex[0], jewelInventoryState.overVertex[1], 4, 0, Math.PI * 2);
        context.stroke();
    }*/
}

export function drawBoardBackground(context: CanvasRenderingContext2D, board: Board) {
    /*context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = '#DDDDEE';
    context.strokeStyle = '#DDDDEE';
    drawShapesPath(context, board.spaces, true, true);*/
    // This 1 pixel edge keeps gaps from appearing between sections
    context.lineWidth = 1;
    context.fillStyle = '#666655';
    context.strokeStyle = '#666655';
    drawShapesPath(context, board.spaces, true, true);
}
export function drawBoardPreview(context: CanvasRenderingContext2D, lightSource: Point, boardPreview: Board, showIcon = false) {
    drawBoardBackground(context, boardPreview);
    const fixedJewel = boardPreview.fixed[0];
    context.globalAlpha = 1;
    drawJewel(context, fixedJewel.shape, lightSource);
    const iconSource = getAbilityIconSource(fixedJewel.ability);
    if (showIcon && iconSource) {
        drawAbilityIcon(context, iconSource,
                {x: fixedJewel.shape.center[0] - 10, y: fixedJewel.shape.center[1] - 10, w: 20, h: 20});
    }
    // Fixed jewel on board previews should glow to draw attention to it.
    context.save();
    context.globalAlpha = .5 + .2 * Math.sin(Date.now() / 150);
    context.fillStyle = '#ff0';
    drawShapesPath(context, [fixedJewel.shape], true, false);
    context.restore();
    if (jewelInventoryState.overVertex && (jewelInventoryState.draggedJewel == fixedJewel || jewelInventoryState.overJewel == fixedJewel)) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(jewelInventoryState.overVertex[0], jewelInventoryState.overVertex[1], 4, 0, Math.PI * 2);
        context.stroke();
    }
}
