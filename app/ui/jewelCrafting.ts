import { setContext } from 'app/context';
import { queryAll } from 'app/dom';
import { addJewelToInventory, appendJewelToElement } from 'app/jewelInventory';
import { destroyJewel, makeJewel } from 'app/jewels';
import { getCanvasPopupTarget } from 'app/popup';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { leftArrowButton, rightArrowButton } from 'app/ui/hud';
import { createAnimation, drawFrame } from 'app/utils/animations';
import { isPointInShortRect } from 'app/utils/index';
import { shapeDefinitions, tolerance } from 'app/utils/polygon';

import {
    CanvasPopupTarget, Frame, HudFrameButton,
    Jewel, JewelComponents, JewelTier,
    ShapeDefinition, ShapeType, ShortRectangle,
} from 'app/types';

const [splitJewelFrame, fuseJewelFrame, expandJewelFrame, compressJewelFrame ] = createAnimation('gfx2/hud/tools.png', {w: 20, h: 20}, {cols: 4}).frames;

const [ /*lightBorder*/, darkBorder, /*darkBack*/, greenBorder, /*redBorder*/, paleBack, /*blackBorder*/ ] = createAnimation('gfx2/hud/toolborders.png', {w: 20, h: 20}, {cols: 7}).frames;

type JewelCraftingToolType = 'split' | 'fuse' | 'expand' | 'compress';

const jewelCraftingState = {
    selectedTool: null as JewelCraftingToolType,
    selectedJewel: null as Jewel,
};

class JewelCraftingToolButton implements CanvasPopupTarget {
    frame: Frame;
    target: ShortRectangle;
    flashColor: string;
    helpText: string;
    toolType: JewelCraftingToolType;
    constructor(toolType: JewelCraftingToolType, helpText: string, frame: Frame, target: ShortRectangle) {
        this.toolType = toolType;
        this.helpText = helpText;
        this.frame = frame;
        this.target = target;
    }
    isVisible() {
        return getState().selectedCharacter.context === 'jewelCrafting';
    }
    isPointOver(x, y) {
        return isPointInShortRect(x, y, this.target);
    }
    render(context) {
        if (jewelCraftingState.selectedTool === this.toolType) {
            drawFrame(context, greenBorder, this.target);
        } else {
            drawFrame(context, paleBack, this.target);
            if (getCanvasPopupTarget() === this) {
                drawFrame(context, darkBorder, this.target);
            }
        }
        drawFrame(context, this.frame, this.target);
    }
    helpMethod() {
        return this.helpText;
    }
    onClick() {
        if (jewelCraftingState.selectedTool === this.toolType) {
            jewelCraftingState.selectedTool = null;
        } else {
            jewelCraftingState.selectedTool = this.toolType;
        }
        updateJewelCraftingOptions();
    }
}
const splitJewelButton = new JewelCraftingToolButton(
    'split', 'Use this tool to split jewels into smaller pieces',  splitJewelFrame, {x: 200, y: 60, w: 20, h: 20}
);
const fuseJewelButton = new JewelCraftingToolButton(
    'fuse', 'Use this tool to fuse two jewels together', fuseJewelFrame, {x: 230, y: 60, w: 20, h: 20});
const expandJewelButton = new JewelCraftingToolButton(
    'expand', 'Use this tool to expand a jewel to a larger shape', expandJewelFrame, {x: 260, y: 60, w: 20, h: 20}
);
const compressJewelButton = new JewelCraftingToolButton(
    'compress', 'Use this tool to compress a jewel to a denser shape', compressJewelFrame, {x: 290, y: 60, w: 20, h: 20}
);
let jewelContextButton: HudFrameButton, jewelCraftingContextButton: HudFrameButton;
export function getJewelCraftingState() {
    return jewelCraftingState;
}
export function getJewelCraftingButtons() {
    if (!jewelContextButton) {
        jewelContextButton = {
            ...leftArrowButton,
            isVisible() {
                return getState().selectedCharacter.context === 'jewelCrafting';
            },
            onClick() {
                console.log('setContext jewel');
                setContext('jewel');
            },
        };
    }
    if (!jewelCraftingContextButton) {
        jewelCraftingContextButton = {
            ...rightArrowButton,
            isVisible() {
                return getState().selectedCharacter.context === 'jewel' && getState().guildStats.jewelCraftingLevel > 0;
            },
            onClick() {
                console.log('setContext jewelCrafting');
                setContext('jewelCrafting');
            },
        };
    }
    return [
        splitJewelButton,
        fuseJewelButton,
        expandJewelButton,
        compressJewelButton,
        jewelContextButton,
        jewelCraftingContextButton,
    ];
}

export function isJewelValidCraftingTarget(jewel: Jewel): boolean {
    switch (jewelCraftingState.selectedTool) {
        case 'split':
            return ['hexagon', 'trapezoid', 'diamond', 'square'].includes(jewel.shapeType);
        case 'fuse':
            if (!jewelCraftingState.selectedJewel) {
                return ['rhombus', 'trapezoid', 'diamond', 'triangle'].includes(jewel.shapeType);
            }
            if (jewelCraftingState.selectedJewel === jewel) {
                return true;
            }
            return !!getFusedShape(jewelCraftingState.selectedJewel, jewel);
        case 'expand':
            return jewel.shapeType == 'triangle' || jewel.shapeType == 'diamond';
        case 'compress':
            return jewel.shapeType == 'rhombus' || jewel.shapeType == 'square';
    }
    return false;
}

export function updateJewelCraftingOptions() {
    /*const craftingJewels = [...queryAll('.js-jewelCraftingSlot .js-jewel')].map(getElementJewel);
    for (const jewel of craftingJewels) {
        jewel.domElement.classList.remove('disabled', 'candidate');
        jewel.domElement.setAttribute('helpText', null);
        switch (jewelCraftingState.selectedTool) {
            case 'split':
                if (jewel.shapeType == 'hexagon') {
                    jewel.domElement.setAttribute('helpText', 'Split in half.');
                    jewel.domElement.classList.add('candidate');
                } else if (jewel.shapeType == 'trapezoid') {
                    jewel.domElement.setAttribute('helpText', 'Split off a third.');
                    jewel.domElement.classList.add('candidate');
                } else if (jewel.shapeType == 'diamond') {
                    jewel.domElement.setAttribute('helpText', 'Split in half.');
                    jewel.domElement.classList.add('candidate');
                } else if (jewel.shapeType == 'square') {
                    jewel.domElement.setAttribute('helpText', 'Split into slivers.');
                    jewel.domElement.classList.add('candidate');
                } else {
                    jewel.domElement.setAttribute('helpText', 'This jewel is too small to split.');
                    jewel.domElement.classList.add('disabled');
                }
                break;
            case 'fuse':
                if (!jewelCraftingState.selectedJewel) {
                    if (jewel.shapeType == 'rhombus') {
                        jewel.domElement.classList.add('candidate');
                    } else if (jewel.shapeType == 'trapezoid') {
                        jewel.domElement.classList.add('candidate');
                    } else if (jewel.shapeType == 'diamond') {
                        jewel.domElement.classList.add('candidate');
                    } else if (jewel.shapeType == 'triangle') {
                        jewel.domElement.classList.add('candidate');
                    } else {
                        jewel.domElement.setAttribute('helpText', 'This jewel is too large to use.');
                        jewel.domElement.classList.add('disabled');
                    }
                } else if (jewelCraftingState.selectedJewel.shapeType === 'rhombus') {
                    if (jewel.shapeType === 'rhombus') {
                        jewel.domElement.classList.add('candidate');
                    } else {
                        jewel.domElement.classList.add('disabled');
                    }
                } else if (jewelCraftingState.selectedJewel.shapeType === 'trapezoid') {
                    if (jewel.shapeType === 'trapezoid') {
                        jewel.domElement.classList.add('candidate');
                    } else {
                        jewel.domElement.classList.add('disabled');
                    }
                } else if (jewelCraftingState.selectedJewel.shapeType === 'diamond') {
                    if (jewel.shapeType === 'triangle') {
                        jewel.domElement.classList.add('candidate');
                    } else {
                        jewel.domElement.classList.add('disabled');
                    }
                } else if (jewelCraftingState.selectedJewel.shapeType === 'triangle') {
                    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'diamond') {
                        jewel.domElement.classList.add('candidate');
                    } else {
                        jewel.domElement.classList.add('disabled');
                    }
                }
                break;
            case 'expand':
                if (jewel.shapeType == 'triangle' || jewel.shapeType == 'diamond') {
                    jewel.domElement.classList.add('candidate');
                } else {
                    jewel.domElement.classList.add('disabled');
                }
                break;
            case 'compress':
                if (jewel.shapeType == 'rhombus' || jewel.shapeType == 'square') {
                    jewel.domElement.classList.add('candidate');
                } else {
                    jewel.domElement.classList.add('disabled');
                }
                break;
            default:
                jewel.domElement.setAttribute('helpText', 'Select a tool to modify this jewel');
        }
    }*/
}

function getFusedShape(jewelA: Jewel, jewelB: Jewel): ShapeDefinition {
    var totalArea = jewelA.area + jewelB.area;
    for (let key in shapeDefinitions) {
        const shape:ShapeDefinition = shapeDefinitions[key][0];
        if (Math.abs(shape.area - totalArea) < tolerance) {
            return shape;
        }
    }
    return null;
}

// Returns true if crafting handles this jewel click.
export function handleJewelCraftingClick(jewel: Jewel): boolean {
    if (!jewelCraftingState.selectedTool) {
        return false;
    }
    const craftingSlot = getCraftingSlot(jewel);
    // Only jewels in crafting slots can be crafted.
    if (!craftingSlot) {
        return false;
    }

    switch (jewelCraftingState.selectedTool) {
        case 'split':
            splitJewel(jewel);
            break;
        case 'fuse':
            if (!jewelCraftingState.selectedJewel) {
                if (jewel.shapeType !== 'hexagon' && jewel.shapeType !== 'square') {
                    jewelCraftingState.selectedJewel = jewel;
                }
            } else if (jewelCraftingState.selectedJewel === jewel) {
                jewelCraftingState.selectedJewel = null;
            } else if (fuseJewels(jewelCraftingState.selectedJewel, jewel)) {
                jewelCraftingState.selectedJewel = null;
            }
            break;
        case 'expand':
            expandJewel(jewel);
            break;
        case 'compress':
            compressJewel(jewel);
            break;
        default:
            jewel.domElement.setAttribute('helpText', 'Select a tool to modify this jewel');
    }
    updateJewelCraftingOptions();

    return true;
}

function fuseJewels(jewelA: Jewel, jewelB: Jewel): boolean {
    const craftingSlot = getCraftingSlot(jewelA);
    // Only jewels in crafting slots can be crafted.
    if (!craftingSlot) {
        return false;
    }
    const fusedShape = getFusedShape(jewelA, jewelB);
    // No fused shape exists for this combination of jewels.
    if (!fusedShape) {
        return false;
    }
    const tier: JewelTier = jewelA.tier > jewelB.tier ? jewelA.tier : jewelB.tier;
    const quality = (jewelA.quality * jewelA.area + jewelB.quality * jewelB.area) / fusedShape.area;
    const components: JewelComponents = [0, 0, 0];
    for (let i = 0;i < 3; i++) {
        components[i] = (jewelA.components[i] * jewelA.area + jewelB.components[i] * jewelB.area) / (jewelA.area + jewelB.area);
    }
    const newJewel = makeJewel(tier, fusedShape.key, components, quality);
    destroyJewel(jewelA);
    destroyJewel(jewelB);
    appendJewelToElement(newJewel, craftingSlot);
    updateJewelCraftingOptions();
    saveGame();
    return true;
}
function getCraftingSlot(jewel: Jewel): HTMLElement {
    return jewel.canvas.closest('.js-jewelCraftingSlot');
}
function getEmptyCraftingSlot(): HTMLElement {
    for (const slot of queryAll('.js-jewelCraftingSlot')) {
        if (!slot.querySelector('.js-jewel')) {
            return slot;
        }
    }
}
function compressJewel(jewel: Jewel) {
    const craftingSlot = getCraftingSlot(jewel);
    if (!craftingSlot) return; // Only jewels in crafting slots can be crafted.
    let newShape: ShapeType;
    if (jewel.shapeType === 'square') newShape = 'diamond';
    if (jewel.shapeType === 'rhombus') newShape = 'triangle';
    if (!newShape) return; // No compression exists for this jewel.
    const newArea = shapeDefinitions[newShape][0].area;
    const newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, craftingSlot);
    updateJewelCraftingOptions();
    saveGame();
}
function expandJewel(jewel: Jewel) {
    const craftingSlot = getCraftingSlot(jewel);
    if (!craftingSlot) return; // Only jewels in crafting slots can be crafted.
    let newShape: ShapeType;
    if (jewel.shapeType === 'diamond') newShape = 'square';
    if (jewel.shapeType === 'triangle') newShape = 'rhombus';
    if (!newShape) return; // No expansion exists for this jewel.
    const newArea = shapeDefinitions[newShape][0].area;
    const newJewel = makeJewel(jewel.tier, newShape, jewel.components, jewel.quality * .99 * jewel.area / newArea);
    destroyJewel(jewel);
    appendJewelToElement(newJewel, craftingSlot);
    updateJewelCraftingOptions();
    saveGame();
}
function splitJewel(jewel: Jewel) {
    const craftingSlot = getCraftingSlot(jewel);
    if (!craftingSlot) return; // Only jewels in crafting slots can be crafted.
    if (jewel.shapeType === 'triangle' || jewel.shapeType === 'rhombus') return; // Jewels are too small to split
    let shapeDefinitionA: ShapeDefinition, shapeDefinitionB: ShapeDefinition;
    if (jewel.shapeType === 'hexagon') {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions.trapezoid[0];
    } else if (jewel.shapeType === 'trapezoid') {
        shapeDefinitionA = shapeDefinitions.diamond[0];
        shapeDefinitionB = shapeDefinitions.triangle[0];
    } else if (jewel.shapeType === 'diamond') {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions.triangle[0];
    } else {
        shapeDefinitionA = shapeDefinitionB = shapeDefinitions.rhombus[0];
    }
    let qualityA, qualityB;
    if (Math.random() < .5) {
        qualityA = jewel.quality * .99 * (1.1 + Math.random() * .1);
        qualityB = (jewel.quality * .99 * jewel.area - qualityA * shapeDefinitionA.area ) / shapeDefinitionB.area;
    } else {
        qualityB = jewel.quality * .99 * (1.1 + Math.random() * .1);
        qualityA = (jewel.quality * .99 * jewel.area - qualityB * shapeDefinitionB.area ) / shapeDefinitionA.area;
    }
    let componentsA: JewelComponents = [0, 0, 0];
    let componentsB: JewelComponents = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        // A component cannot be higher than 1. ComponentA must also be high enough to insure compontentB is no greater than 1.
        componentsA[i] = Math.max(Math.min(1, jewel.components[i] * (.6 + Math.random() * .8)), jewel.components[i] * jewel.area - shapeDefinitionB.area);
        componentsB[i] = (jewel.components[i] * jewel.area - componentsA[i] * shapeDefinitionA.area) / shapeDefinitionB.area;
    }
    const newJewelA = makeJewel(jewel.tier, shapeDefinitionA.key, componentsA, qualityA);
    const newJewelB = makeJewel(jewel.tier, shapeDefinitionB.key, componentsB, qualityB);
    destroyJewel(jewel);
    appendJewelToElement(newJewelA, craftingSlot);
    // Add the other jewel to the first open crafting slot, or to the inventory.
    const emptySlot = getEmptyCraftingSlot();
    if (emptySlot) {
        appendJewelToElement(newJewelB, emptySlot);
    } else {
        addJewelToInventory(newJewelB.domElement);
    }

    updateJewelCraftingOptions();
    saveGame();
}
