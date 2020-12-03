import { query, queryAll } from 'app/dom';
import { jewelInventoryState } from 'app/jewelInventory';
import { createAnimation, drawFrame } from 'app/utils/animations';

const jewelTable = createAnimation('gfx2/hud/jeweltable.png', {w: 320, h: 180}).frames[0];
const [ /*lightBorder*/, /*darkBorder*/, /*darkBack*/, greenBorder, /*redBorder*/, paleBack, /*blackBorder*/ ] = createAnimation('gfx2/hud/toolborders.png', {w: 20, h: 20}, {cols: 7}).frames;

const jewelCraftingSlotsContainer = query('.js-jewelCraftingSlots');
const containerStyle = window.getComputedStyle(jewelCraftingSlotsContainer);

const jewelCraftingRectangle = {
    x: parseInt(containerStyle.left) / 3 | 0,
    y: parseInt(containerStyle.top) / 3 | 0,
    w: parseInt(containerStyle.width) / 3 | 0,
    // This is probably NaN, but we don't use it, so it shouldn't matter.
    h: parseInt(containerStyle.height) / 3 | 0,
};
console.log(jewelCraftingRectangle);
export function drawJewelCrafting(this: void, context: CanvasRenderingContext2D): void {
    //const [x, y] = getCanvasCoords();
    drawFrame(context, jewelTable, {x: 0, y: 0, w: jewelTable.w, h: jewelTable.h});
    const craftingSlots = [...queryAll('.js-jewelCraftingSlot')];
    // These targets are chosen to exactly match the css layout of the jewel grid. We could eventually
    // remove the dom elements altogether, but currently the drag and drop logic depends on it,
    const target = {x: jewelCraftingRectangle.x, y: jewelCraftingRectangle.y, w: 20, h: 20};
    for (const craftingSlot of craftingSlots) {
        const jewelElement = craftingSlot.querySelector('.js-jewel');
        if (!jewelElement) {
            if (jewelInventoryState.draggedJewel) {
                drawFrame(context, greenBorder, target);
            } else {
                drawFrame(context, paleBack, target);
            }
        } else {
            // This is handled directly on the jewel context in redrawInventoryJewel.
        }
        target.x += 21;
        if (target.x + 20 > jewelCraftingRectangle.x + jewelCraftingRectangle.w) {
            target.x = jewelCraftingRectangle.x;
            target.y += 21;
        }
    }
}