import {
    drawFrameToAreaTarget,
    getAreaObjectTargetFromDefinition,
    isPointOverAreaTarget
} from 'app/content/areas';
import { titleDiv } from 'app/dom';
import { drawWhiteOutlinedFrame, requireImage } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { drawFrame } from 'app/utils/animations';
import { isPointInRect } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    ShortRectangle,
} from 'app/types';

export class EditableAreaObject implements AreaObject {
    static createFromDefinition(objectDefinition: AreaObjectDefinition): EditableAreaObject {
        const instance = new this().applyDefinition(objectDefinition);
        if (this.instances) {
            this.instances.push(instance);
        }
        return instance;
    }

    static instances: EditableAreaObject[];

    _areaTarget: AreaObjectTarget;
    definition: AreaObjectDefinition;
    area: Area;
    name: string;
    key: string;
    shapeType: 'oval' | 'rectangle' = 'rectangle';

    applyDefinition(definition: AreaObjectDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        // Definition may override default shapeType.
        if (this.definition.shapeType) {
            this.shapeType = this.definition.shapeType;
        }
        return this;
    }

    getFrame(): Frame {
        console.log("Warning called getFrame unimplemented");
        debugger;
        return {image: null, x: 0, y: 0, w: 0, h: 0};
    }

    getAreaTarget(): AreaObjectTarget {
        if (!this._areaTarget) {
            const frame = this.getFrame();
            const content = frame.content || frame;
            this._areaTarget = getAreaObjectTargetFromDefinition(this, content, this.definition);
            this._areaTarget.shapeType = this.shapeType;
        }
        return this._areaTarget;
    }

    render(context: CanvasRenderingContext2D): void {
        // Draw with white outlines when this is the canvas target.
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        }
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(
            context,
            this.getAreaTarget(),
            {...this.getFrame(), flipped: this.definition.flipped},
            draw,
            isEditing
        );
    }

    isPointOver(x: number, y: number): boolean {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y);
    }

    helpMethod(): string {
        return this.name && titleDiv(this.name);
    }
}

// We need to make sure EditableAreaObject is defined before anything that extends it is defined.
import { editingAreaState } from 'app/development/editArea';
