import { triggerTargets } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    areaTargetToScreenTarget,
    getAreaDefinition,
} from 'app/content/areas';
import { cutscenes } from 'app/content/cutscenes';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { refreshObjectDefinition } from 'app/development/editObjects';
import { MAX_Z, MIN_Z } from 'app/gameConstants';

import {
    EditorProperty,
    BaseAreaObjectDefinition, AreaObjectTarget, Hero,
    MenuOption, ObjectShape, PropertyRow,
    objectShapes,
} from 'app/types';

export class FloorTrigger extends EditableAreaObject {

    definition: FloorTriggerDefinition;
    switchOn: boolean = false;
    isSolid: boolean = false;

    getAreaTarget(): AreaObjectTarget {
        return {
            area: this.area,
            shapeType: this.definition.shapeType,
            targetType: 'object',
            object: this,
            w: this.definition.shapeType === 'horizontal' ? this.area.width : this.definition.w,
            h: 0,
            d: this.definition.shapeType === 'vertical' ? (MAX_Z - MIN_Z) : this.definition.d,
            x: this.definition.shapeType === 'horizontal' ? this.area.width / 2 : this.definition.x,
            y: 0,
            z: this.definition.shapeType === 'vertical' ? 0 : this.definition.z,
        }
    }

    onEnter(hero: Hero) {
        // Floor triggers can only be triggered once currently.
        if (this.switchOn) {
            return;
        }
        this.switchOn = !this.switchOn;
        triggerTargets(this.area, this.definition.targets, this.definition.targetCutscene, this.switchOn);
    }

    render(context: CanvasRenderingContext2D): void {
        // Only draw triggers while editing the area.
        if (!editingAreaState.isEditing) {
            return;
        }
        const target = this.getAreaTarget();
        const screenTarget = areaTargetToScreenTarget(target);
        {
            context.save();
            context.globalAlpha = 0.5;
            context.fillStyle = this.switchOn ? 'red' : 'blue';
            if (this.definition.shapeType === 'oval') {
                const xr = screenTarget.w / 2;
                const yr = screenTarget.h / 2;
                context.beginPath();
                context.ellipse(screenTarget.x + xr, screenTarget.y + yr, xr, yr, 0, 0, 2 * Math.PI);
                context.fill();
            } else {
                context.fillRect(screenTarget.x, screenTarget.y, screenTarget.w, screenTarget.h);
            }
            context.restore();
        }
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Trigger',
            onSelect() {
                createObjectAtContextCoords({
                    type: 'floorTrigger',
                    shapeType: 'vertical',
                    w: 32,
                    d: 32,
                    targets: []
                });
            }
        }
    }

    static getProperties(object: FloorTrigger): (EditorProperty<any> | PropertyRow | string)[] {
        const areaDefinition = getAreaDefinition(object.area);
        const props = [];
        props.push({
            name: 'shape',
            value: object.definition.shapeType,
            values: Object.values(objectShapes),
            onChange: (shapeType: ObjectShape) => {
                object.definition.shapeType = shapeType;
                refreshObjectDefinition(object);
            },
        });
        props.push({
            name: 'targets',
            value: [...object.definition.targets],
            values: [
                ...Object.keys(object.area.objectsByKey).filter( k => object.area.objectsByKey[k].onTrigger),
                ...(areaDefinition.monsters || []).filter(m => m.isTriggered && m.triggerKey).map(m => m.triggerKey)
            ],
            onChange: (targets: string[]) => {
                object.definition.targets = targets;
                refreshObjectDefinition(object);
            },
        });
        props.push({
            name: 'targetCutscene',
            value: object.definition.targetCutscene || '',
            values: Object.keys(cutscenes),
            onChange: (targetCutscene: string) => {
                object.definition.targetCutscene = targetCutscene;
                refreshObjectDefinition(object);
            },
        });
        props.push([{
            name: 'width',
            value: object.definition.w,
            onChange: (w: number) => {
                if (w < 1) return object.definition.w;
                object.definition.w = w;
                refreshObjectDefinition(object);
            },
        }, {
            name: 'depth',
            value: object.definition.d,
            onChange: (d: number) => {
                if (d < 1) return object.definition.d;
                object.definition.d = d;
                refreshObjectDefinition(object);
            },
        }]);
        return props;
    }
}
areaObjectFactories.floorTrigger = FloorTrigger;

export interface FloorTriggerDefinition extends BaseAreaObjectDefinition {
    targets: string[],
    targetCutscene?: string,
    animation?: string,
    w: number,
    d: number,
}
