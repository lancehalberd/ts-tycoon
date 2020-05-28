import { setStat } from 'app/bonuses';
import { GROUND_Y } from 'app/gameConstants';
import { findActionByTag } from 'app/performAttack';
import { arrMod, isPointInShortRect } from 'app/utils/index';

import { Actor, Frame, ShortRectangle } from 'app/types';

export function initializeActorForAdventure(actor: Actor) {
    setStat(actor.variableObject, 'bonusMaxHealth', 0);
    setActorHealth(actor, actor.stats.maxHealth);
    actor.maxReflectBarrier = actor.reflectBarrier = 0;
    actor.stunned = 0;
    actor.pull = null;
    actor.chargeEffect = null;
    actor.isDead = false;
    actor.timeOfDeath = undefined;
    actor.skillInUse = null;
    actor.skillTarget = null;
    actor.slow = 0;
    actor.rotation = 0;
    actor.activity = {type: 'none'};
    actor.imprintedSpell = null;
    actor.minions = actor.minions || [];
    actor.boundEffects = actor.boundEffects || [];
    var stopTimeAction = findActionByTag(actor.reactions, 'stopTime');
    actor.temporalShield = actor.maxTemporalShield = (stopTimeAction ? stopTimeAction.stats.duration : 0);
    // Any time we reset actor.time we need to reset action.readyAt, otherwise the cooldowns may be unavailable for a long time.
    actor.time = 0;
    for (const action of actor.actions.concat(actor.reactions)) {
        action.readyAt = 0;
    }
    updateActorFrame(actor);
}

export function damageActor(actor: Actor, damage: number) {
    actor.targetHealth -= damage;
}

export function healActor(actor: Actor, healAmount: number) {
    actor.targetHealth += healAmount;
}

export function setActorHealth(actor: Actor, health: number) {
    actor.targetHealth = actor.health = health;
    actor.percentHealth = actor.percentTargetHealth = health / actor.stats.maxHealth;
}

export function updateActorFrame(actor: Actor): void {
    const scale = (actor.stats.scale || 1);
    actor.frame = getActorAnimationFrame(actor);
    const content = actor.frame.content || actor.frame;
    actor.w = content.w * scale;
    actor.h = content.h * scale;
    // Make sure to fall back to the frame depth if it isn't specified on content.
    const d = (content.d || actor.frame.d);
    actor.d = (d || content.w) * scale;
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
            if (actor.skillInUse.base.tags.includes('spell')) {
                return arrMod(source.spellPreparationAnimation.frames, Math.floor(actor.attackFrame));
            }
            return arrMod(source.attackPreparationAnimation.frames, Math.floor(actor.attackFrame));
        }
        if (actor.skillInUse.base.tags.includes('spell')) {
            return arrMod(source.spellRecoveryAnimation.frames, Math.floor(actor.attackFrame));
        }
        return arrMod(source.attackRecoveryAnimation.frames, Math.floor(actor.attackFrame));
    }
    if (actor.isMoving) {
        return arrMod(source.walkAnimation.frames, Math.floor(actor.walkFrame));
    }
    return arrMod(source.idleAnimation.frames, Math.floor(actor.idleFrame));
}

export function getActorMouseTarget(actor: Actor): ShortRectangle {
    if (!actor.frame || !actor.area) {
        return {x: -1, y: -1, w: 0, h: 0};
    }
    return {
        w: actor.w,
        h: actor.h,
        x: Math.round(actor.x - actor.w / 2 - actor.area.cameraX),
        y: Math.round(GROUND_Y - actor.h - (actor.y || 0) - (actor.z || 0) / 2 + actor.d / 4),
    };
}

export function isPointOverActor(this: Actor, x: number, y: number): boolean {
    return isPointInShortRect(x, y, getActorMouseTarget(this));
}
