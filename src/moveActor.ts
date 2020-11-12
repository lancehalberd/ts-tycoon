import { isActorPaused } from 'app/actor';
import {
    actorShouldAutoplay, getAllInRange, getDistance,
    getDistanceOverlap, getPlanarDistanceSquared, limitZ,
} from 'app/adventure';
import { FRAME_LENGTH, MAX_Z, MIN_Z, MIN_SLOW, RANGE_UNIT } from 'app/gameConstants';
import { setActorAttackTarget, setActorInteractionTarget } from 'app/main';
import { applyAttackToTarget, createAttackStats, getBasicAttack } from 'app/performAttack';
import { isMouseDown } from 'app/utils/mouse';
import Vector from 'app/utils/Vector';

import { Action, Actor, LocationTarget, Target } from 'app/types';

const rotationA = Math.cos(Math.PI / 20);
const rotationB = Math.sin(Math.PI / 20);

export function moveActor(actor: Actor, ignoreCollisions: boolean = false) {
    const area = actor.area;
    if (!area) {
        return;
    }
    const delta = FRAME_LENGTH / 1000;
    if (actor.isDead || actor.stunned || actor.pull || (actor.skillInUse && actor.preparationTime < actor.skillInUse.totalPreparationTime)) {
        return;
    }
    if (actor.type === 'monster' && actor.stationary) {
        return;
    }
    let goalTarget = (actor.skillInUse && actor.skillTarget !== actor) ? actor.skillTarget : null;
    actor.isMoving = false;
    let speedBonus = 1;
    if (actor.chargeEffect) {
        goalTarget = actor.chargeEffect.target;
    } else{
        const activity = actor.activity;
        switch (activity.type) {
            case 'move':
                if (getPlanarDistanceSquared(actor, activity) < 25
                    || (isActorPaused(actor) && !isMouseDown())
                ) {
                    actor.activity = {type: 'none'};
                    break;
                }
                goalTarget = null;
                // If the actor is currently using a skill, they cannot adjust their heading,
                // but we do allow them to move forward/backward in their current direction at 25% speed
                // if they are in recovery.
                if (actor.skillInUse) {
                    if (actor.heading[0] * (activity.x - actor.x) < 0) {
                        speedBonus = -.1;
                    } else {
                        speedBonus = .25;
                    }
                } else {
                    actor.heading = [activity.x - actor.x, 0, activity.z - actor.z];
                }
                actor.isMoving = true;
                break;
            case 'interact':
                if (getDistanceOverlap(actor, activity.target) <= 5) {
                    if (activity.target.targetType === 'actor') {
                        if (activity.target.onInteract) {
                            activity.target.onInteract(actor);
                        }
                    } else if (activity.target.targetType === 'object') {
                        if (activity.target.object.onInteract) {
                            activity.target.object.onInteract(actor);
                        }
                    }
                    actor.activity = {type: 'none'};
                    break;
                }
                actor.heading = [activity.target.x - actor.x, 0, activity.target.z - actor.z];
                if (isNaN(actor.heading[0])) debugger;
                actor.isMoving = true;
                break;
            case 'attack':
            case 'action':
                goalTarget = activity.target;
                break;
        }
    }
    // Choose a new target if charging or AI is in control of an actor doing nothing AND
    // no current target or the current target is dead.
    if (
        (actor.chargeEffect
            || (
                actorShouldAutoplay(actor)
                && !(actor.type === 'hero' && actor.activity.type !== 'none')
            )
        )
        && (!goalTarget || (goalTarget.targetType === 'actor' && goalTarget.isDead))
    ) {
        let bestDistance = actor.aggroRadius || 10000;
        actor.enemies.forEach(function (target) {
            if (target.isDead) return;
            const distance = getDistance(actor, target);
            if (distance < bestDistance) {
                bestDistance = distance;
                goalTarget = target;
            }
        });
    }
    if (!goalTarget && actor.owner) {
        // Set desired relative position to ahead if there are enemies and to follow if there are none.
        let pointPosition: LocationTarget = actor.owner.enemies.length
            ? {
                targetType: 'location',
                area: actor.area,
                x: actor.owner.x + actor.owner.heading[0] * 300,
                y: 0,
                z: Math.max(-180, Math.min(180, actor.owner.z + actor.owner.heading[2] * 100)),
                w: 0, h: 0, d: 0,
            } : {
                targetType: 'location',
                area: actor.area,
                x: actor.owner.x - actor.owner.heading[2] * 200,
                y: 0,
                z: actor.owner.z > 0 ? actor.owner.z - 150 : actor.owner.z + 150,
                w: 0, h: 0, d: 0,
            };
        const distanceToGoal = getDistance(actor, pointPosition);
        if (distanceToGoal > 20) {
            // Minions tend to be faster than their owners, so if they are following them they will stutter as they
            // try to match the desired relative position. To prevent this from happening, we slow minions down as they approach
            // their desired position so the don't reach it.
            speedBonus *= Math.min(1, distanceToGoal / 80);
            goalTarget = pointPosition;
            // We can't do this unless we enable interaction targets for non-heroes, but since
            // non-heroes cannot interact, this seems excessive.
            // setActorInteractionTarget(actor, pointPosition);
            //goalTarget = {x: actor.owner.x + actor.owner.heading[0] * 200, y: 0, z: actor.owner.z + actor.owner.heading[2] * 200};
        }
    }
    if (goalTarget) {
        actor.heading = [goalTarget.x - actor.x, 0, goalTarget.z - actor.z];
                if (isNaN(actor.heading[0])) debugger;
        actor.heading[2] -= actor.z / MAX_Z;
        actor.isMoving = true;
        actor.goalTarget = goalTarget;
        // This was an attempt to move away from targets when they are dying.
        /*if ((actor.activity.type === 'none' || actor.activity.target !== goalTarget) && goalTarget.targetHealth < 0) {
            console.log('run');
            actor.heading[0] = -actor.heading[0];
            actor.heading[2] = -actor.heading[2];
        }*/
    } else {
        actor.goalTarget = null;
    }
    actor.heading = new Vector(actor.heading).normalize().getArrayValue();
                if (isNaN(actor.heading[0])) debugger;
    if (!actor.isMoving) {
        return;
    }
    if (actor.chargeEffect) {
        speedBonus *= actor.chargeEffect.chargeSkill.stats.speedBonus;
        actor.chargeEffect.distance += speedBonus * actor.stats.speed * Math.max(MIN_SLOW, 1 - actor.slow) * delta;
        // Cancel charge if they run for too long.
        if (actor.chargeEffect.distance > 2000) {
            actor.chargeEffect = null;
        }
    } else if (goalTarget && !(goalTarget.targetType === 'actor' && goalTarget.cloaked)) {
        // If the character is closer than they need to be to auto attack then they can back away from
        // them slowly to try and stay at range.
        const skill: Action = actor.skillInUse
            || (actor.type === 'hero' && actor.activity.type === 'action' && actor.activity.action)
            || getBasicAttack(actor);
        const skillRange = skill.stats.range || 0.5;
        const distanceToTarget = getDistanceOverlap(actor, goalTarget);
        // Set the max distance to back away to to 10, otherwise they will back out of the range
        // of many activated abilities like fireball and meteor.
        const desiredDistanceFromTarget = (Math.max(0.5, Math.min(skillRange - 1.5, 10))) * RANGE_UNIT;
        // Only back away from targets if desired distance is at least 1 range unit.
        if (
            desiredDistanceFromTarget >= RANGE_UNIT &&
            (
                distanceToTarget < desiredDistanceFromTarget ||
                (goalTarget.targetType === 'actor' && goalTarget.targetHealth < 0)
            )
        ) {
            // Actors backing away from their targets will eventually corner themselves in the edge of the room.
            // This looks bad, so make them stop backing up within 130 pixels of the edge of the area.
            if ((actor.heading[0] > 0 && actor.x > 50) || (actor.heading[0] < 0 && actor.x < actor.area.width - 50)) {
                // You back up more slowly when your skill is on cooldown. This allows you to back
                // up quickly from enemies you aren't currently attacking.
                if (skill.readyAt > actor.time) speedBonus *= -0.1;
                else speedBonus *= -0.5;
            } else speedBonus *= 0;
        } else if (distanceToTarget <= skillRange * RANGE_UNIT) {
            speedBonus = 0;
        }
    }
    let currentX = actor.x;
    let currentZ = actor.z;
    let collision = false;
    let originalHeading = actor.heading.slice();
    let tryingVertical = false;
    let clockwiseFailed = false;
    let blockedByEnemy = null;
    let blockedByAlly = null;
    while (true) {
        actor.x = currentX + speedBonus * actor.stats.speed * actor.heading[0] * Math.max(MIN_SLOW, 1 - actor.slow) * delta;
        actor.z = currentZ + speedBonus * actor.stats.speed * actor.heading[2] * Math.max(MIN_SLOW, 1 - actor.slow) * delta;
        if (isNaN(actor.x) || isNaN(actor.z)) {
            debugger;
        }
        if (ignoreCollisions) {
            break;
        }
        // Actor is not allowed to leave the path.
        let hitWall = (actor.z + actor.d / 2 > MAX_Z) || (actor.z - actor.d / 2 <= MIN_Z);
        actor.z = limitZ(actor.z, actor.d / 2);
        if (area.leftWall) {
            const limit = 16 + actor.w / 2 + actor.z / 4;
            actor.x = Math.max(limit, actor.x);
            hitWall = hitWall || actor.x === limit;
        } else {
            const limit = actor.w / 2;
            actor.x = Math.max(actor.w / 2, actor.x);
            hitWall = hitWall || actor.x === limit;
        }
        if (area.rightWall) {
            const limit = area.width - 16 - actor.w / 2 - actor.z / 4;
            actor.x = Math.min(limit, actor.x);
            hitWall = hitWall || actor.x === limit;
        } else {
            const limit = area.width - actor.w / 2;
            actor.x = Math.min(limit, actor.x);
            hitWall = hitWall || actor.x === limit;
        }
        // Normally we don't stop movement entirely when hitting a wall
        // so that the actor can slide against the wall instead of stopping,
        // but for charge moves we want to apply the effect when they hit
        // the bounds of the area.
        if (hitWall && actor.chargeEffect) {
            collision = true;
            break;
        }
        collision = false;
        // Ignore ally collision during charge effects.
        if (!actor.chargeEffect) {
            for (const ally of actor.allies) {
                if (!ally.isDead && actor !== ally &&
                    // Allies are allowed to overlap a bit.
                    getDistanceOverlap(actor, ally) <= -4 &&
                    new Vector([speedBonus * actor.heading[0], speedBonus * actor.heading[2]])
                        .dotProduct(new Vector([ally.x - actor.x, ally.z - actor.z])) >= 0
                ) {
                    collision = true;
                    blockedByAlly = ally;
                    break;
                }
            }
        }
        if (!collision) {
            for (const layer of area.layers) {
                for (const object of layer.objects) {
                    if (object.isSolid === false && !object.onEnter) continue;
                    if (!object.getAreaTarget) {
                        console.log(object);
                        debugger;
                    }
                    const objectTarget = object.getAreaTarget();
                    let overlap = false;
                    if (objectTarget.shapeType === 'oval' || !objectTarget.shapeType) {
                        // Default handling is oval.
                        const distance = getDistanceOverlap(actor, objectTarget);
                        if (distance <= -8 &&
                            new Vector([(actor.x - currentX), (actor.z - currentZ)])
                                .dotProduct(new Vector([objectTarget.x - currentX, objectTarget.z - currentZ])) > 0
                        ) {
                            overlap = true;
                        }
                    } else {
                        // shapeTypes rectangle/horizontal/vertical are all geometric rectangles.
                        if (actor.z - actor.d / 2 > objectTarget.z + objectTarget.d / 2 ||
                            actor.z + actor.d / 2 < objectTarget.z - objectTarget.d / 2
                        ) {
                            continue;
                        }
                        if (actor.x - actor.w / 2 > objectTarget.x + objectTarget.w / 2 ||
                            actor.x + actor.w / 2 < objectTarget.x - objectTarget.w / 2
                        ) {
                            continue;
                        }
                        // Allow the actor to move away from the object even when they are colliding with it.
                        const v1 = new Vector([(actor.x - currentX), (actor.z - currentZ)]).normalize();
                        const v2 = new Vector([objectTarget.x - currentX, objectTarget.z - currentZ]).normalize();
                        // < 0 means they can move orthogonally, <= -1 requires them to move exactly away,
                        // anything in between is more limiting the closer it gets to -1.
                        if (v1.dotProduct(v2) < -0.8) {
                            continue;
                        }
                        overlap = true;
                    }

                    if (overlap) {
                        collision = !!object.isSolid;
                        if (object.onEnter) {
                            object.onEnter(actor);
                        }
                        break;
                    }
                }
            }
        }
        if (!collision) {
            for (const enemy of actor.enemies) {
                if (enemy.isDead || actor === enemy) continue;
                const distance = getDistanceOverlap(actor, enemy);
                if (distance <= 6 && actor.chargeEffect) {
                    finishChargeEffect(actor, enemy);
                    // Although this is a collision, don't mark it as one so that the move will complete.
                    collision = false;
                    break;
                }
                if (distance <= 4 && new Vector([speedBonus * actor.heading[0], speedBonus * actor.heading[2]]).dotProduct(new Vector([enemy.x - actor.x, enemy.z - actor.z])) >= 0) {
                    collision = true;
                    blockedByEnemy = enemy;
                    break;
                }
            }
            if (actor.chargeEffect && getDistanceOverlap(actor, actor.chargeEffect.target) <= 0) {
                finishChargeEffect(actor, actor.chargeEffect.target);
            }
        }
        if (!collision) {
            break;
        }
        //console.log(JSON.stringify(['old', actor.heading]));
        const oldXHeading = actor.heading[0];
        if (clockwiseFailed) {
            actor.heading[0] = oldXHeading * rotationA + actor.heading[2] * rotationB;
            actor.heading[2] = actor.heading[2] * rotationA - oldXHeading * rotationB;
        } else {
            // rotationB is Math.sin(Math.PI / 20), so Math.sin(-Math.PI / 20) is -rotationB.
            actor.heading[0] = oldXHeading * rotationA - actor.heading[2] * rotationB;
            actor.heading[2] = actor.heading[2] * rotationA + oldXHeading * rotationB;
        }
        if (originalHeading[0] * actor.heading[0] + originalHeading[2] * actor.heading[2] < .01) {
            if (clockwiseFailed) {
                actor.x = currentX;
                actor.z = currentZ;
                actor.heading = originalHeading.slice();
                if (actor.type === 'hero' && actor.activity.type !== 'none') {
                    // If there is at least 1 enemy blocking the way, attack it
                    if (blockedByEnemy) setActorAttackTarget(actor, blockedByEnemy);
                    // If the way is only blocked by objects (non-enemies/non-allies), give up on the current action as those obstacles won't disappear or move.
                    else if (!blockedByAlly) actor.activity = {type: 'none'};
                }
                break;
            }
            clockwiseFailed = true;
            actor.heading = originalHeading.slice();
        }
        actor.x = currentX;
        actor.z = currentZ;
    }
    // Return actor to their original heading so they don't change frames rapidly when navigating around objects.
    actor.heading = originalHeading.slice();
    // If the actor hit something, complete the charge effect, but have them hit themselves
    // instead of enemies.
    if (collision && actor.chargeEffect) {
        finishChargeEffect(actor, actor);
    }
}

function finishChargeEffect(actor: Actor, target: Target) {
    const attackStats = createAttackStats(actor, actor.chargeEffect.chargeSkill, target);
    attackStats.distance = actor.chargeEffect.distance;
    // If the target is the actor (occurs when they hit a wall),
    // only apply the effect to them.
    const hitTargets = actor === target
        ? [actor]
        : getAllInRange(target ? target.x : actor.x, actor.chargeEffect.chargeSkill.stats.area, actor.enemies);
    for (const hitTarget of hitTargets) {
        applyAttackToTarget(attackStats, hitTarget, actor === target ? 0.5 : 1);
    }
    actor.chargeEffect = null;
}

