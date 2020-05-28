import { pause, updateAdventureButtons } from 'app/adventureButtons';
import { drawFrameToAreaTarget, getPositionFromLocationDefinition } from 'app/content/areas';
import { monsters } from 'app/content/monsters';
import { drawBar } from 'app/drawArea';
import { FRAME_LENGTH, GROUND_Y, MIN_SLOW } from 'app/gameConstants';
import { bonusSourceHelpText } from 'app/helpText';
import {
    drawImage, drawOutlinedImage,
    getTintedImage, prepareTintedImage, requireImage,
} from 'app/images';
import { shrineSource } from 'app/render';
import { getState } from 'app/state';
import { drawFrame, getFrame } from 'app/utils/animations';
import { arrMod } from 'app/utils/index';

import {
    Actor, Area, AreaObject, AreaObjectTarget,
    Frame, MonsterData, MonsterDefinition,
} from 'app/types';

export function updateActorAnimationFrame(actor: Actor) {
    if (actor.pull || actor.stunned || actor.isDead ) {
        actor.walkFrame = 0;
        actor.idleFrame = 0;
    } else if (actor.skillInUse && actor.recoveryTime < Math.min(actor.totalRecoveryTime, .3)) { // attacking loop
        if (actor.recoveryTime === 0 && actor.preparationTime < actor.skillInUse.totalPreparationTime) {
            actor.attackFrame = actor.preparationTime / actor.skillInUse.totalPreparationTime * (actor.source.attackPreparationAnimation.frames.length);
        } else {
            actor.attackFrame = actor.recoveryTime / actor.totalRecoveryTime * (actor.source.attackRecoveryAnimation.frames.length - 1);
        }
        actor.walkFrame = 0;
        actor.idleFrame = 0;
    } else if (actor.isMoving) {
        var walkFps = ((actor.type === 'monster' && actor.base.fpsMultiplier) || 1) * actor.stats.speed / 10;
        actor.walkFrame += walkFps * FRAME_LENGTH * Math.max(MIN_SLOW, 1 - actor.slow) * (actor.skillInUse ? .25 : 1) / 1000;
        actor.idleFrame = 0;
    } else {
        actor.walkFrame = 0;
        actor.idleFrame += 1 / actor.source.idleAnimation.frameDuration;
    }
}
export function drawActorShadow(context: CanvasRenderingContext2D, actor: Actor) {
    const source = actor.source;
    const scale = (actor.stats.scale || 1);
    context.save();
    if (actor.cloaked) {
        context.globalAlpha = .2;
    } else {
        context.globalAlpha = Math.max(0.2, 0.5 - actor.y / 200);
    }
    if (!actor.isDead) {
        const shadowFrame = getFrame(source.shadowAnimation, actor.time);
        if (!shadowFrame) {
            debugger;
        }
        const shadowTarget = {
            x: Math.round(actor.x - actor.area.cameraX - (shadowFrame.content.x + shadowFrame.content.w / 2) * scale),
            y: Math.round(GROUND_Y - (actor.z || 0) / 2 + actor.d / 4 - (shadowFrame.content.y + shadowFrame.content.h / 2) * scale),
            w: shadowFrame.w * scale, h: shadowFrame.h * scale
        };
        drawFrame(context, shadowFrame, shadowTarget);
    }
    context.restore();
}

export function drawActor(this: Actor, context: CanvasRenderingContext2D) {
    const source = this.source;
    const scale = (this.stats.scale || 1);
    context.save();
    if (this.cloaked) {
        context.globalAlpha = .2;
    }
    // This is easy to calculate because the x position of an actor is defined as the x coordinate of their content center.
    const xCenter = Math.round(this.x - this.area.cameraX);
    // This is a little more complicated. GROUND_Y is where the foot of actors is placed at y=z=0.
    // Increasing y moves them up 1 pixel, increasing z moves them up 1/2 a pixel, and to get the center,
    // we subtract half the height.
    const yCenter = Math.round(GROUND_Y - this.y - this.z / 2 - this.h / 2 + this.d / 4);
    /*if (mouseDown) {
        console.log(actor.base.name ? actor.base.name : actor.name);
        console.log([actor.x, actor.y]);
        console.log(['xCenter', source.xCenter, 'actualWidth', source.actualWidth,  'width', source.width, 'xOffset', source.xOffset, 'scale', scale]);
        console.log(['yCenter', source.yCenter, 'actualHeight', source.actualHeight,  'height', source.height, 'yOffset', source.yOffset, 'scale', scale]);
        console.log([left, top, actor.w, actor.height]);
        console.log([source.xCenter, source.yCenter]);
        console.log([xCenterOnMap, yCenterOnMap]);
    }*/
    context.translate(xCenter, yCenter);

    if (this.rotation) {
        context.rotate(this.rotation * Math.PI/180);
    }
    if ((!source.flipped && this.heading[0] < 0) || (source.flipped && this.heading[0] > 0)) {
        context.scale(-1, 1);
    }
    if (this.isDead) {
        context.globalAlpha = Math.max(0, 1 - (this.time - this.timeOfDeath));
    }
    const frame = this.frame;
    const contentXCenterOffset = frame.content ? frame.content.x + frame.content.w / 2 : frame.w / 2;
    const contentYCenterOffset = frame.content ? frame.content.y + frame.content.h / 2 : frame.h / 2;
    // This is the rectangle we will draw the frame to. It is just the frame rectangle scaled and positions so that the
    // center of frame.content will be at (0, 0), which we have translated the context to be where the center of the
    // sprite should be drawn.
    const target = {x: -contentXCenterOffset * scale, y: -contentYCenterOffset * scale, w: frame.w * scale, h: frame.h * scale};

    var tints = getActorTints(this);
    if (tints.length) {
        prepareTintedImage();
        let tint = tints.pop();
        const tintSource = {...frame, image: getTintedImage(this.image, tint[0], tint[1], frame), x: 0, y: 0};
        for (tint of tints) {
            tintSource.image = getTintedImage(tintSource.image, tint[0], tint[1], tintSource);
        }
        drawFrame(context, tintSource, target);
    } else {
        drawFrame(context, frame, target);
    }
    /*context.globalAlpha = .5;
    context.fillStyle = 'red';
    context.fillRect(target.left, target.top, target.width, target.height);*/
    context.restore();
}
export function renderMonsterFromDefinition(context: CanvasRenderingContext2D, area: Area, definition: MonsterDefinition, drawGuides: boolean = false): void {
    const data: MonsterData = monsters[definition.key];
    const frame: Frame = data.source.idleAnimation.frames[0];
    let {w, h, d} = (frame.content || frame);
    d = d || w;
    const {x, y, z} = getPositionFromLocationDefinition(area, {w, h, d}, definition.location);
    // In the editor make all the monsters face left by default.
    let flipped = !data.source.flipped;
    // Typescript suggests using `!==` for boolean XOR as `^` will conver to a number.
    flipped = flipped !== (!!definition.location.flipped);
    drawFrameToAreaTarget(
        context,
        {area, x, y, z, w, h, d},
        {...frame, flipped},
        drawFrame,
        drawGuides
    );
}
export function drawActorEffects(context: CanvasRenderingContext2D, actor: Actor) {
    const isCutscene = getState().selectedCharacter.context === 'cutscene';
    // life bar
    if (actor.isDead) return;
    const barWidth = 32;
    // if (!actor.area.enemies.length) return;
    let x = Math.round(actor.x - barWidth / 2 - actor.area.cameraX);
    // Don't allow the main character's life bar to fall off the edges of the screen.
    // (Not sure if we need this, it is confusing when editing)
    /* const state = getState();
    if (actor === state.selectedCharacter.hero) {
        x = Math.min(320 - 5 - barWidth, Math.max(5, x));
    } */
    let actorTop = Math.round(GROUND_Y - actor.y - actor.z / 2 - actor.h);
    let y = actorTop - 10;
    if (!isCutscene && actor.health > 0 && actor.health < actor.stats.maxHealth) {
        drawBar(context, x, y, barWidth, 3, 'white', (actor.stats.lifeBarColor || 'red'), actor.health / actor.stats.maxHealth);
        if (actor.stats.bonusMaxHealth >= 1 && actor.health >= actor.stats.maxHealth - actor.stats.bonusMaxHealth) {
            // This logic is kind of a mess but it is to make sure the % of the bar that is due to bonusMaxHealth
            // is drawn as orange instead of red.
            const totalWidth = (barWidth - 2) * actor.health / actor.stats.maxHealth;
            const normalWidth = Math.floor((barWidth - 2) * (actor.stats.maxHealth - actor.stats.bonusMaxHealth) / actor.stats.maxHealth);
            const bonusWidth = Math.min(
                totalWidth - normalWidth,
                Math.ceil(
                    (totalWidth - normalWidth)
                    * (actor.stats.bonusMaxHealth - (actor.health - actor.stats.maxHealth))
                    / actor.stats.bonusMaxHealth
                )
            );
            context.fillStyle = 'orange';
            context.fillRect(x + 1 + normalWidth, y + 1, bonusWidth, 1);
        }
        context.save();
        context.fillStyle = 'white';
        context.globalAlpha = .7;
        const targetSize = Math.floor((barWidth - 2) * Math.max(0, actor.targetHealth) / actor.stats.maxHealth);
        context.fillRect(x + 1 + targetSize, y + 1, (barWidth - 2) - targetSize, 1);
        context.restore();
        if (actor.reflectBarrier > 0) {
            y -= 2;
            const width = Math.ceil(Math.min(1, actor.maxReflectBarrier / actor.stats.maxHealth) * barWidth);
            drawBar(context, x, y, width, 3, 'white', 'blue', actor.reflectBarrier / actor.maxReflectBarrier);
        }
        if (actor.temporalShield > 0) {
            y -= 2;
            drawBar(context, x, y, barWidth, 3, 'white', '#aaa', actor.temporalShield / actor.maxTemporalShield);
        }
    }

    y = actorTop - 7;
    drawEffectIcons(context, actor, x, y, barWidth);
    // Draw spinning icons over stunned actor.
    if (!actor.isDead && actor.stunned) {
        const target =  {'left': 0, 'top': 0, 'width': shrineSource.width, 'height': shrineSource.height}
        for (let i = 0; i < 3; i++ ) {
            const theta = 2 * Math.PI * (i + 3 * actor.time) / 3;
            // var scale = (actor.stats.scale || 1);
            target.left = actor.x - shrineSource.width / 2 + Math.cos(theta) * 30 - actor.area.cameraX;
            target.top = actorTop - 5 + Math.sin(theta) * 10;
            drawImage(context, shrineSource.image, shrineSource, target);
        }
    }
}
// Get array of tint effects to apply when drawing the given actor.
function getActorTints(actor: Actor) {
    const tints = [];
    // TODO: Stop doing this or precompute these, tinting is bad for performance.
    /*if (actor.type === 'monster' && actor.base.tint) {
        tints.push(actor.base.tint);
    }*/
    if (actor.stats.tint) {
        const min = (actor.stats.tintMinAlpha || .5);
        const max = (actor.stats.tintMaxAlpha || .5);
        const center = (min + max) / 2;
        const radius = (max - min) / 2;
        tints.push([actor.stats.tint, center + Math.cos(actor.time * 5) * radius]);
    }
    if (actor.slow > 0) tints.push(['#fff', Math.min(1, actor.slow)]);
    return tints;
}
function drawEffectIcons(context: CanvasRenderingContext2D, actor: Actor, x: number, y: number, barWidth: number) {
    let effectXOffset = 0;
    let effectYOffset = 0;
    const seenEffects = {};
    for (const effect of actor.allEffects) {
        const effectText = bonusSourceHelpText(effect, actor);
        // Don't show icons for stacks of the same effect.
        if (seenEffects[effectText]) continue;
        seenEffects[effectText] = true;
        const base = effect.base as {icons?: any};
        const icons = (base && base.icons) || [];
        if (!icons.length) continue;
        for (const iconData of icons) {
            const source = {'image': requireImage(iconData[0]), 'left': iconData[1], 'top': iconData[2], 'width': iconData[3], 'height': iconData[4]};
            const xOffset = effectXOffset + iconData[5], yOffset = effectYOffset + iconData[6];
            drawImage(context, source.image, source, {'left': x + xOffset, 'top': y + yOffset, 'width': 8, 'height': 8});
        }
        effectXOffset += 8;
        if (effectXOffset + 8 > barWidth) {
            effectXOffset = 0;
            effectYOffset += 8;
        }
    }
}

