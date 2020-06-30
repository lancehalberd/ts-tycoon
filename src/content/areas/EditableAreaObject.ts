import {
    drawFrameToAreaTarget,
    getAreaObjectTargetFromDefinition,
    isPointOverAreaTarget
} from 'app/content/areas';
import { titleDiv } from 'app/dom';
import { drawWhiteOutlinedFrame, requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { drawFrame, getFrame } from 'app/utils/animations';
import { isPointInRect } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, BonusSource,
    Exit, Frame, FrameAnimation, Hero, ShortRectangle,
} from 'app/types';

export class EditableAreaObject implements AreaObject {
    static createFromDefinition(objectDefinition: AreaObjectDefinition): EditableAreaObject {
        const instance = new this().applyDefinition(objectDefinition);
        if (this.instances) {
            this.instances[objectDefinition.key] = instance;
        }
        return instance;
    }

    static instances: {[key: string]: EditableAreaObject};

    _areaTarget: AreaObjectTarget;
    definition: AreaObjectDefinition;
    animation: FrameAnimation;
    area: Area;
    name: string;
    key: string;
    shapeType: 'oval' | 'rectangle' = 'rectangle';
    bonusSource: BonusSource;

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
        if (this.animation) {
            return getFrame(this.animation, this.area.time * 1000);
        }
        console.log("Warning called unimplemented getFrame");
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

    getActiveBonusSources() {
        return this.bonusSource ? [this.bonusSource] : [];
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
            isEditing && isKeyDown(KEY.SHIFT)
        );
    }

    isPointOver(x: number, y: number): boolean {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y);
    }

    helpMethod(): string {
        return this.name && titleDiv(this.name);
    }

    isEnabled() {
        // For now, everything outside of the guild is always enabled.
        if (this.area.zoneKey !== 'guild') {
            return true;
        }
        // In the guild, objects are only unlocked if the area is unlocked and there are no enemies.
        // One exception is for doors that lead to other unlocked areas.
        return getState().savedState.unlockedGuildAreas[this.area.key] && !this.area.enemies.length;
    }
}

// We need to make sure EditableAreaObject is defined before anything that extends it is defined.
import { editingAreaState } from 'app/development/editArea';
