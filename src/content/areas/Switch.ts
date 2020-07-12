import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    drawFrameToAreaTarget,
} from 'app/content/areas';
import { zones } from 'app/content/zones';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { refreshObjectDefinition } from 'app/development/editObjects';
import { BACKGROUND_HEIGHT } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    EditorProperty, FrameAnimation, Area, AreaObject,
    BaseAreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MenuOption, PropertyRow, ShortRectangle,
} from 'app/types';

interface SwitchAnimations {
    base: FrameAnimation,
    handle: FrameAnimation,
}

const floorSwitch = {
    base: createAnimation('gfx2/objects/switches.png', {w: 40, h: 40, d: 8}),
    handle: createAnimation('gfx2/objects/switches.png', {w: 40, h: 40}, {x: 1, cols: 3}),
};
const sideSwitch = {
    base: createAnimation('gfx2/objects/switches.png', {w: 40, h: 40, d: 8}, {x: 4}),
    handle: createAnimation('gfx2/objects/switches.png', {w: 40, h: 40}, {x: 5, cols: 3}),
};
const backGeometry = {w: 40, h: 40, d: 8, content: {w: 12, h: 40, x: 14, y: 0}};
const backSwitch = {
    base: createAnimation('gfx2/objects/switches.png', backGeometry, {x: 8}),
    handle: createAnimation('gfx2/objects/switches.png', backGeometry, {x: 9, cols: 3}),
};

export class Switch extends EditableAreaObject {
    static animations = {
        floorSwitch,
        sideSwitch,
        backSwitch,
    };

    definition: SwitchDefinition;
    switchOn: boolean = false;

    getAnimations(): SwitchAnimations {
        return Switch.animations[this.definition.animation];
    }
    getFrame(): Frame {
        return getFrame(this.getAnimations().base, this.area.time * 1000);
    }
    getHandleFrame(): Frame {
        if (this.switchOn) {
            return this.getAnimations().handle.frames[1];
        } else {
            return this.getAnimations().handle.frames[2];
        }
    }

    onInteract(hero: Hero) {
        this.switchOn = !this.switchOn;
        for (const key of this.definition.targets) {
            const object = this.area.objectsByKey[key];
            object?.onToggle?.(this.switchOn);
        }
    }

    render(context: CanvasRenderingContext2D): void {
        // Draw with white outlines when this is the canvas target.

        const isEditing = editingAreaState.selectedObject === this;
        const target = this.getAreaTarget();
        drawFrameToAreaTarget(
            context,
            target,
            {...this.getFrame(), flipped: this.definition.flipped},
            drawFrame,
            isEditing && isKeyDown(KEY.SHIFT)
        );
        drawFrameToAreaTarget(
            context,
            target,
            {...this.getHandleFrame(), flipped: this.definition.flipped},
            drawFrame,
            false
        );
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Switch',
            onSelect() {
                const area: Area = getState().selectedCharacter.hero.area;
                const [x, y] = editingAreaState.contextCoords;
                let animation: keyof typeof Switch.animations = 'floorSwitch';
                let flipped = false;
                if (y <= BACKGROUND_HEIGHT) {
                    animation = 'backSwitch';
                } else if (x < 30) {
                    animation = 'sideSwitch';
                    flipped = true;
                } else if (x > area.width - 30) {
                    animation = 'sideSwitch';
                }
                createObjectAtContextCoords({type: 'switch', animation, flipped, targets: []});
            }
        }
    }

    static getProperties(object: Switch): (EditorProperty<any> | PropertyRow | string)[] {
        const props = [];
        props.push({
            name: 'style',
            value: object.definition.animation,
            values: Object.keys(Switch.animations),
            onChange: (animation: string) => {
                object.definition.animation = animation;
                refreshObjectDefinition(object);
            },
        });
        props.push({
            name: 'targets',
            value: [...object.definition.targets],
            values: Object.keys(object.area.objectsByKey).filter( k => object.area.objectsByKey[k].onToggle),
            onChange: (targets: string[]) => {
                console.log('change targets', targets);
                object.definition.targets = targets;
                refreshObjectDefinition(object);
            },
        })
        return props;
    }
}
areaObjectFactories.switch = Switch;

export interface SwitchDefinition extends BaseAreaObjectDefinition {
    targets: string[],
    animation: string,
}
