import {
    areaObjectFactories, drawFrameToAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { setContext } from 'app/context';
import { editingAreaState } from 'app/development/editArea';
import { bodyDiv, titleDiv } from 'app/dom';
import { requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';

import { Frame, FrameDimensions, Hero, UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier } from 'app/types';

const geometry: FrameDimensions = {w: 40, h: 50, content: {x: 5, y: 28, w: 30, h: 21, d: 18}};
const [
    table1Frame, table2Frame, table3Frame
] = createAnimation('gfx2/objects/jeweltable.png', geometry, {cols: 3}).frames;
const glowAnimation = createAnimation('gfx2/objects/jeweltableglow.png', geometry, {cols: 3, duration: 15, frameMap: [0, 1, 2, 1]});


interface JewelTableTier extends UpgradeableObjectTier {
    frame: Frame,
}

const jewelTableTiers: JewelTableTier[] = [
    {
        'name': 'Work Bench', 'upgradeCost': 500, frame: table1Frame,
        'bonuses': {'+jewelCrafingLevel': 1},
    },
    {
        'name': 'Crafting Table', 'upgradeCost': 10000, frame: table2Frame,
        'bonuses': {'+jewelCrafingLevel': 2},
    },
    {
        'name': 'Jeweler\'s Station', 'upgradeCost': 150000, 'requires': 'workshop', frame: table3Frame,
        'bonuses': {'+jewelCrafingLevel': 3},
    },
];

export class JewelCraftingTable extends EditableAreaObject implements UpgradeableObject {
    level: number = 1;
    definition: UpgradeableObjectDefinition;

    applyDefinition(definition: UpgradeableObjectDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        if (definition.level > this.level) {
            this.level = definition.level;
        }
        return this;
    }

    getFrame(): Frame {
        return this.getCurrentTier().frame;
    }
    onInteract(hero: Hero): void {
        setContext('jewel');
    }

    getCurrentTier() {
        return jewelTableTiers[this.level - 1];
    }
    getNextTier() {
        return jewelTableTiers[this.level];
    }

    helpMethod() {
        return titleDiv(this.getCurrentTier().name) + bodyDiv('Craft and equip jewels');
    }
    getActiveBonusSources() {
        return [this.getCurrentTier()];
    }

    render(context: CanvasRenderingContext2D) {
        let frame = this.getCurrentTier().frame;
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, drawFrame, isEditing && isKeyDown(KEY.SHIFT));
        // Draw a glow over the table when it is under the mouse.
        if (getCanvasPopupTarget() === this) {
            frame = getFrame(glowAnimation, this.area.time * 1000);
            drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, drawFrame, isEditing && isKeyDown(KEY.SHIFT));
        }
    }
}
areaObjectFactories.jewelCraftingTable = JewelCraftingTable;
