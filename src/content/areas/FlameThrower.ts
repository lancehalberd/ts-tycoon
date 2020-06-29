import { damageActor } from 'app/actor';
import { messageCharacter } from 'app/adventure';
import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    drawFrameToAreaTarget,
    EditableAreaObject,
    getLayer,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { createObjectAtContextCoords } from 'app/development/editArea';
import { bodyDiv, titleDiv } from 'app/dom';
import { FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { createAnimation, drawFrame, frameAnimation, getFrame } from 'app/utils/animations';

import {
    Area, AreaObject, AreaObjectTarget, AreaTarget, BaseAreaObjectDefinition,
    Exit, Frame, FrameAnimation, Hero,
    LootGenerator, MenuOption, ShortRectangle, TreasureChestDefinition,
} from 'app/types';


const nozzleAnimation = createAnimation('gfx2/objects/firetrapsheet.png', {w: 24, h: 24});

const flameStartAnimation = createAnimation('gfx2/effects/fireanimation.png', {w: 20, h: 90}, {cols: 3}, {loopFrame: 1});
const flameAnimation = createAnimation('gfx2/effects/fireanimation.png', {w: 20, h: 90}, {cols: 4, x: 3}, {loopFrame: 2});
const flameEndAnimation = createAnimation('gfx2/effects/fireanimation.png', {w: 20, h: 90}, {cols: 4, x: 7}, {loop: false});

const flameHitAnimation = createAnimation('gfx2/effects/firehit.png', {w: 32, h: 24}, {cols: 2});


export interface FlameThrowerDefinition extends BaseAreaObjectDefinition {
    animationKey: string,
}

export class FlameThrower extends EditableAreaObject {
    static animations: {[key: string]: FrameAnimation} = {
        nozzleAnimation,
    };
    definition: FlameThrowerDefinition;
    // Whether the flame thrower is currently on.
    // Note that there is a delay for it actually firing after it turns on.
    on = false;
    // How long the warmup phase is before the flame actually comes out.
    warmupDuration = 500;
    // How long, in ms, the flame thrower stays on before automatically switching off.
    // 0 means forever
    onDuration = 0;
    // How long, in ms, the flame thrower stays off before automatically switching on.
    offDuration = 0;

    onAnimationTime: number;
    offAnimationTime: number;

    target: AreaTarget;
    constructor() {
        super();
        // Start these higher than the animation durations.
        this.onAnimationTime = 2000;
        this.offAnimationTime = 2000;
        this.onDuration = this.warmupDuration + 1000;
        this.offDuration = 800;
    }
    onToggle() {
        if (this.on) {
            this.turnOff();
        } else {
            this.turnOn();
        }
    }
    turnOn() {
        if (this.on) {
            return;
        }
        this.on = true;
        this.onAnimationTime = 0;
    }
    turnOff() {
        if (!this.on) {
            return;
        }
        this.on = false;
        if (this.onAnimationTime < this.warmupDuration) {
            this.offAnimationTime = flameEndAnimation.duration + 1000;
        } else {
            this.offAnimationTime = 0;
        }
    }
    update() {
        this.onAnimationTime += FRAME_LENGTH;
        this.offAnimationTime += FRAME_LENGTH;
        if (this.on && this.onAnimationTime >= this.onDuration) {
            this.turnOff();
        } else if (!this.on && this.offAnimationTime >= this.offDuration) {
            this.turnOn();
        }
        let {x, w} = this.getAreaTarget();
        // The hitbox for the flame is quite a bit smaller.
        x += 4;
        w -= 8;
        this.target = null;
        let smallestDistance = 0;
        if (this.on) {
            const frameIndex = Math.floor(
                (this.onAnimationTime - this.warmupDuration) / (flameAnimation.frameDuration * FRAME_LENGTH)
            );
            // The flame doesn't reach full length initially
            if (frameIndex === 0) smallestDistance = 56;
            else if (frameIndex === 1) smallestDistance = 120;
            else if (frameIndex > 1) smallestDistance = 190;
        } else if (this.offAnimationTime < flameEndAnimation.duration) {
            smallestDistance = 190;
        }
        if (smallestDistance > 0) {
            const fieldLayer = getLayer(this.area, 'field');
            for (const object of fieldLayer?.objects || []) {
                // No collisions with non-solid objects or self.
                if (object.isSolid === false || object === this) {
                    continue;
                }
                const otherTarget = object.getAreaTarget();
                if (otherTarget.x >= x + w || otherTarget.x + otherTarget.w <= x) {
                    continue;
                }
                const distance = MAX_Z - otherTarget.z - otherTarget.d / 2;
                if (distance < smallestDistance) {
                    this.target = otherTarget;
                    smallestDistance = distance;
                }
            }
            for (const actor of [...this.area.enemies, ...this.area.allies]) {
                const otherTarget = actor;
                if (otherTarget.x >= x + w || otherTarget.x + otherTarget.w <= x) {
                    continue;
                }
                const distance = MAX_Z - otherTarget.z - otherTarget.d / 2;
                if (distance < smallestDistance) {
                    this.target = otherTarget;
                    smallestDistance = distance;
                }
            }
        }
        if (this.on && this.target?.targetType === 'actor') {
            // Vulnerable targets hit by the flame take 20% of their health in damage per second.
            if (!this.target.stats.invulnerable) {
                damageActor(this.target, this.target.stats.maxHealth / 4 / (1000 / FRAME_LENGTH));
                if (!this.target.pull) {
                    this.target.pull = {
                        x: (this.target.x + this.target.w / 2 > x + w / 2) ? this.target.x + w : this.target.x - w,
                        z: this.target.z,
                        time: this.target.time + 0.4,
                        damage: this.target.stats.maxHealth / 4,
                    };
                    // This is primarily to prevent a hero from continuing to walk into the fire after hitting it.
                    this.target.activity = {type: 'none'};
                }
            }
        }
    }
    getFrame(): Frame {
        const animation = FlameThrower.animations[this.definition.animationKey];
        return getFrame(animation, 0);
    }

    render(context: CanvasRenderingContext2D): void {
        // Draw the nozzle first.
        const areaTarget = this.getAreaTarget();
        drawFrameToAreaTarget(
            context,
            areaTarget,
            {...this.getFrame(), flipped: this.definition.flipped},
            drawFrame,
        );
        // We use the geometry from the nozzle as the basis for the flame animation.
        let {x, y} = areaTargetToScreenTarget(areaTarget);
        // Adjust the coords to center the flame in the nozzle.
        x += 2;
        y += 14;
        let h = 90;
        // Crop the height of the flame animation if it is hitting a target.
        if (this.target) {
            // The +8 is 1/4 the height of the hit animation frame.
            h = Math.floor((MAX_Z - this.target.z - this.target.d / 2) / 2) + 8;
        }
        if (this.on) {
            if (this.onAnimationTime < this.warmupDuration) {
                const frame = getFrame(flameStartAnimation, this.onAnimationTime);
                drawFrame(context, {...frame, h}, {...frame, x, y, h});
            } else {
                const frame = getFrame(flameAnimation, this.onAnimationTime - this.warmupDuration);
                drawFrame(context, {...frame, h}, {...frame, x, y, h});
            }
        }
        // The dissipating flame animation can be drawn on top of the next flame in
        // the case the flame thrower is toggle off then on quickly.
        if (this.offAnimationTime < flameEndAnimation.duration) {
            const frame = getFrame(flameEndAnimation, this.offAnimationTime);
            drawFrame(context, {...frame, h}, {...frame, x, y, h});
        }
        // If the flamethrower is hitting something, play the hit animation over the
        // cropped frame.
        if (this.on && this.target) {
            const frame = getFrame(flameHitAnimation, this.onAnimationTime);
            drawFrame(context, frame, {...frame, x: x - 6, y: y + h - 3 * frame.h / 4});
        }
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'FlameThrower',
            onSelect() {
                createObjectAtContextCoords({type: 'flameThrower', animationKey: 'nozzleAnimation'});
            }
        };
    }
}
areaObjectFactories.flameThrower = FlameThrower;
