import {
    areaObjectFactories, drawFrameToAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { addFurnitureBonuses, removeFurnitureBonuses } from 'app/content/furniture';
import { setContext } from 'app/context';
import { editingAreaState } from 'app/development/editArea';
import { bodyDiv, titleDiv } from 'app/dom';
import { drawWhiteOutlinedFrame } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, drawFrame } from 'app/utils/animations';

import {
    EditorProperty, Frame, FrameDimensions, Hero,
    PropertyRow,UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier,
} from 'app/types';

const geometry: FrameDimensions = {w: 40, h: 72, content: {x: 3, y: 36, w: 34, h: 36, d: 14}};
const [
    wood1Frame, wood2Frame, /*wood3Frame*/, /*stone1Frame*/, /*stone2Frame*/, stone3Frame
] = createAnimation('gfx2/objects/Rat statue.png', geometry, {cols: 6}).frames;

interface ShrineOfFortuneTier extends UpgradeableObjectTier {
    frame: Frame,
}

const shrineOfFortuneTiers: ShrineOfFortuneTier[] = [
    {
        'name': 'Shrine of Luck', 'upgradeCost': 500, frame: wood1Frame,
        'bonuses': {'+itemCraftingLevel': 1},
    },
    {
        'name': 'Shrine of Fortune', 'upgradeCost': 10000, frame: wood2Frame,
        'bonuses': {'+itemCraftingLevel': 2},
    },
    {
        'name': 'Shrine of Wealth', 'upgradeCost': 150000, 'requires': 'workshop', frame: stone3Frame,
        'bonuses': {'+itemCraftingLevel': 3},
    },
];

export class ShrineOfFortune extends EditableAreaObject implements UpgradeableObject {
    name = 'Shrine of Fortune';

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
        setContext('item');
    }

    getCurrentTier() {
        return shrineOfFortuneTiers[this.level - 1];
    }
    getNextTier() {
        return shrineOfFortuneTiers[this.level];
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
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        }
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, draw, isEditing && isKeyDown(KEY.SHIFT));
    }

    static getProperties(object: ShrineOfFortune): (EditorProperty<any> | PropertyRow | string)[] {
        const definition = object.definition;
        const props = [];
        props.push({
            name: 'level',
            value: definition.level || 1,
            values: [1, 2, 3],
            onChange: (level: number) => {
                definition.level = level;
                // We also have to set the level directly on the object because
                // the definition won't override it if it is already higher.
                if (getState().savedState.unlockedGuildAreas[object.area.key]) {
                    removeFurnitureBonuses(object);
                    object.level = level;
                    addFurnitureBonuses(object, true);
                } else {
                    object.level = level;
                }
            },
        });
        return props;
    }
}
areaObjectFactories.shrineOfFortune = ShrineOfFortune;
