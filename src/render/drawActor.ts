import { pause, updateAdventureButtons } from 'app/adventureButtons';
import { drawBar } from 'app/drawArea';
import { FRAME_LENGTH, GROUND_Y, MIN_SLOW } from 'app/gameConstants';
import { bonusSourceHelpText } from 'app/helpText';
import {
    drawImage, drawOutlinedImage, drawTintedImage,
    getTintedImage, prepareTintedImage, requireImage,
} from 'app/images';
import { shrineSource } from 'app/render';
import { getState } from 'app/state';
import { drawFrame } from 'app/utils/animations';
import { arrMod } from 'app/utils/index';

import { Actor, Frame } from 'app/types';

export function updateActorDimensions(actor: Actor) {
    const scale = (actor.stats.scale || 1);
    const frame = getActorAnimationFrame(actor);
    actor.width = (frame.content ? frame.content.w : frame.w) * scale;
    actor.height = (frame.content ? frame.content.h : frame.h) * scale;
    // These values are used for determining when the mouse is hovering over the actor.
    // We only need these when the screen is displayed, so we can set them only on draw.
    if (actor.area) {
        actor.top = Math.round(GROUND_Y - actor.height - (actor.y || 0) - (actor.z || 0) / 2);
        actor.left = Math.round(actor.x - actor.width / 2 - actor.area.cameraX);
    }
    if (isNaN(actor.width) || isNaN(actor.height)) {
        console.log(actor.stats.scale);
        console.log(actor.x);
        console.log({ frame });
        console.log([actor.width, actor.height]);
        pause();
        return false;
    }
    return true;
}

export function getActorAnimationFrame(actor: Actor): Frame {
    const source = actor.source;
    if (actor.pull || actor.stunned) {
        return source.hurtAnimation.frames[0];
    }
    if (actor.isDead) {
        const deathFps = 1.5 * source.deathAnimation.frames.length;
        const frameIndex = Math.min(source.deathAnimation.frames.length - 1, Math.floor((actor.time - actor.timeOfDeath) * deathFps));
        return arrMod(source.deathAnimation.frames, frameIndex);
    }
    if (actor.skillInUse && actor.recoveryTime < Math.min(actor.totalRecoveryTime, .3)) { // attacking loop
        if (actor.recoveryTime === 0 && actor.preparationTime < actor.skillInUse.totalPreparationTime) {
            return arrMod(source.attackPreparationAnimation.frames, Math.floor(actor.attackFrame));
        }
        return arrMod(source.attackRecoveryAnimation.frames, Math.floor(actor.attackFrame));
    }
    if (actor.isMoving) {
        return arrMod(source.walkAnimation.frames, Math.floor(actor.walkFrame));
    }
    return arrMod(source.idleAnimation.frames, Math.floor(actor.idleFrame));
}

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
        var walkFps = ((actor.type === 'monster' && actor.base.fpsMultiplier) || 1) * 3 * actor.stats.speed / 100;
        actor.walkFrame += walkFps * FRAME_LENGTH * Math.max(MIN_SLOW, 1 - actor.slow) * (actor.skillInUse ? .25 : 1) / 1000;
        actor.idleFrame = 0;
    } else {
        actor.walkFrame = 0;
        actor.idleFrame += 1 / 40;
    }
}

export function drawActor(context: CanvasRenderingContext2D, actor: Actor) {
    const source = actor.source;
    const scale = (actor.stats.scale || 1);
    context.save();
    if (actor.cloaked) {
        context.globalAlpha = .2;
    }
    // This is easy to calculate because the x position of an actor is defined as the x coordinate of their content center.
    const xCenter = Math.round(actor.x - actor.area.cameraX);
    // Top is the top of the actor content, and height is the height of the content, so the center of the actor content
    // is a simple calculation.
    const yCenter = actor.top + actor.height / 2;
    /*if (mouseDown) {
        console.log(actor.base.name ? actor.base.name : actor.name);
        console.log([actor.x, actor.y]);
        console.log(['xCenter', source.xCenter, 'actualWidth', source.actualWidth,  'width', source.width, 'xOffset', source.xOffset, 'scale', scale]);
        console.log(['yCenter', source.yCenter, 'actualHeight', source.actualHeight,  'height', source.height, 'yOffset', source.yOffset, 'scale', scale]);
        console.log([left, top, actor.width, actor.height]);
        console.log([source.xCenter, source.yCenter]);
        console.log([xCenterOnMap, yCenterOnMap]);
    }*/
    context.translate(xCenter, yCenter);
    if (actor.rotation) {
        context.rotate(actor.rotation * Math.PI/180);
    }
    if ((!source.flipped && actor.heading[0] < 0) || (source.flipped && actor.heading[0] > 0)) {
        context.scale(-1, 1);
    }
    if (actor.isDead) {
        context.globalAlpha = Math.max(0, 1 - (actor.time - actor.timeOfDeath));
    }
    const frame = getActorAnimationFrame(actor);
    const contentXCenterOffset = frame.content ? frame.content.x + frame.content.w / 2 : frame.w / 2;
    const contentYCenterOffset = frame.content ? frame.content.y + frame.content.h / 2 : frame.h / 2;
    // This is the rectangle we will draw the frame to. It is just the frame rectangle scaled and positions so that the
    // center of frame.content will be at (0, 0), which we have translated the context to be where the center of the
    // sprite should be drawn.
    const target = {x: -contentXCenterOffset * scale, y: -contentYCenterOffset * scale, w: frame.w * scale, h: frame.h * scale};

    var tints = getActorTints(actor);
    if (tints.length) {
        prepareTintedImage();
        let tint = tints.pop();
        const tintSource = {...frame, image: getTintedImage(actor.image, tint[0], tint[1], frame), x: 0, y: 0};
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
export function drawActorEffects(context: CanvasRenderingContext2D, actor: Actor) {
    // life bar
    if (actor.isDead) return;
    // if (!actor.area.enemies.length) return;
    let x = actor.left + actor.width / 2 - 32;
    // Don't allow the main character's life bar to fall off the edges of the screen.
    const state = getState();
    if (actor === state.selectedCharacter.hero) {
        x = Math.min(800 - 5 - 64, Math.max(5, x));
    }
    let y = actor.top - 30;
    drawBar(context, x, y, 64, 4, 'white', (actor.stats.lifeBarColor || 'red'), actor.health / actor.stats.maxHealth);
    if (actor.stats.bonusMaxHealth >= 1 && actor.health >= actor.stats.maxHealth - actor.stats.bonusMaxHealth) {
        // This logic is kind of a mess but it is to make sure the % of the bar that is due to bonusMaxHealth
        // is drawn as orange instead of red.
        const totalWidth = 62 * actor.health / actor.stats.maxHealth;
        const normalWidth = Math.floor(62 * (actor.stats.maxHealth - actor.stats.bonusMaxHealth) / actor.stats.maxHealth);
        const bonusWidth = Math.min(
            totalWidth - normalWidth,
            Math.ceil(
                (totalWidth - normalWidth)
                * (actor.stats.bonusMaxHealth - (actor.health - actor.stats.maxHealth))
                / actor.stats.bonusMaxHealth
            )
        );
        context.fillStyle = 'orange';
        context.fillRect(x + 1 + normalWidth, y + 1, bonusWidth, 2);
    }
    context.save();
    context.fillStyle = 'white';
    context.globalAlpha = .7;
    const targetSize = Math.floor(62 * Math.max(0, actor.targetHealth) / actor.stats.maxHealth);
    context.fillRect(x + 1 + targetSize, y + 1, 62 - targetSize, 2);
    context.restore();

    if (actor.reflectBarrier > 0) {
        y -= 3;
        const width = Math.ceil(Math.min(1, actor.maxReflectBarrier / actor.stats.maxHealth) * 64);
        drawBar(context, x, y, width, 4, 'white', 'blue', actor.reflectBarrier / actor.maxReflectBarrier);
    }
    if (actor.temporalShield > 0) {
        y -= 3;
        drawBar(context, x, y, 64, 4, 'white', '#aaa', actor.temporalShield / actor.maxTemporalShield);
    }
    y = actor.top - 5;
    drawEffectIcons(context, actor, x, y);
    if (!actor.isDead && actor.stunned) {
        const target =  {'left': 0, 'top': 0, 'width': shrineSource.width, 'height': shrineSource.height}
        for (let i = 0; i < 3; i++ ) {
            const theta = 2 * Math.PI * (i + 3 * actor.time) / 3;
            // var scale = (actor.stats.scale || 1);
            target.left = actor.left + (actor.width - shrineSource.width) / 2 + Math.cos(theta) * 30;
            target.top = actor.top - 5 + Math.sin(theta) * 10;
            drawImage(context, shrineSource.image, shrineSource, target);
        }
    }
}
// Get array of tint effects to apply when drawing the given actor.
function getActorTints(actor: Actor) {
    const tints = [];
    // TODO: Stop doing this or precompute these, tinting is bad for performance.
    if (actor.type === 'monster' && actor.base.tint) {
        tints.push(actor.base.tint);
    }
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
function drawEffectIcons(context: CanvasRenderingContext2D, actor: Actor, x: number, y: number) {
    let effectXOffset = 0;
    let effectYOffset = 2;
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
            drawImage(context, source.image, source, {'left': x + xOffset, 'top': y + yOffset, 'width': source.width, 'height': source.height});
        }
        effectXOffset += 16;
        if (effectXOffset + 16 > Math.max(actor.width, 64)) {
            effectXOffset = 0;
            effectYOffset += 20;
        }
    }
}

