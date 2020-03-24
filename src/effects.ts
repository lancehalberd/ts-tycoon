import _ from 'lodash';

import { getDistance, getDistanceOverlap, playAreaSound } from 'app/adventure';
import { pause } from 'app/adventureButtons';
import { addBonusSourceToObject, recomputeDirtyStats, removeBonusSourceFromObject } from 'app/bonuses';
import { effectAnimations } from 'app/content/effectAnimations';
import { drawGroundCircle, drawOnGround } from 'app/drawArea';
import { FRAME_LENGTH, GROUND_Y, MAX_Z, MIN_Z, RANGE_UNIT } from 'app/gameConstants';
import { drawImage, drawTintedImage } from 'app/images';
import { applyAttackToTarget, getAttackY } from 'app/performAttack';
import { isActorDying } from 'app/useSkill';
import { drawFrame, getFrame } from 'app/utils/animations';
import { r, fillRect } from 'app/utils/index';
import Random from 'app/utils/Random';

import {
    ActiveEffect, Actor, ActorEffect, Animation, Area, AreaEntity, AttackData,
    BonusSource, Color, Effect, EffectStats, EffectVariableObject, Projectile,
    TimedActorEffect, Target, VariableObjectBase,
} from 'app/types';

export function songEffect(attackStats: AttackData) {
    const color = (attackStats.attack.base.color || 'red');
    const alpha = (attackStats.attack.base.alpha || .3);
    const frames = 30; // This could be a property on ActionData.
    if (!attackStats.attack.stats.area) {
        throw new Error('Song effect called with no area set.');
    }
    const radius = attackStats.attack.stats.area * (attackStats.effectiveness || 1) * RANGE_UNIT;
    const endTime = attackStats.source.time + attackStats.attack.stats.duration;
    const followTarget = attackStats.source;
    const height =  attackStats.attack.base.height || 60;
    const yOffset = getAttackY(attackStats.source) + (attackStats.attack.base.yOffset || 0);
    // This list is kept up to date each frame and targets stats are updated as they
    // are added/removed from this list.
    const notes = [];
    const thetaOffset = Math.PI * Math.random();
    const effectedTargets: Set<Actor> = new Set();
    const self: ActiveEffect = {
        // The song's position is based on followTarget
        x: 0, y: 0, z: 0,
        // The song itself doesn't have dimensions.
        w: 0, h: 0,
        area: followTarget.area,
        attackStats, 'currentFrame': 0, 'done': false,
        update(effect: ActiveEffect) {
            self.currentFrame++;
            if (notes.length < 6) {
                const note = animationEffect(effectAnimations.song,
                    {targetType: 'location', area: self.area, x:0, y: 20, z: 0, w: 25, h: 50},
                    {loop: true, frameSpeed: .5, tintColor: color, tintValue: .5}
                );
                self.area.effects.push(note);
                followTarget.boundEffects.push(note);
                notes.push(note);
            }
            if (followTarget.time > endTime || followTarget.isDead) {
                this.finish();
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            const currentLocation: AreaEntity = {
                area: self.area,
                x: followTarget.x, y: followTarget.y, z: followTarget.z,
                w: 0, h: 0,
            }; // We can't just use followTarget because we need width/height to be 0.
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const timeTheta = thetaOffset + followTarget.time;
                const xRadius = Math.min(currentRadius, 300);
                const zRadius = Math.min(currentRadius, 90);
                note.target.x = currentLocation.x + Math.cos(i * 2 * Math.PI / 6 + timeTheta) * xRadius;
                note.target.z = currentLocation.z + Math.sin(i * 2 * Math.PI / 6 + timeTheta) * zRadius;
                note.target.y = 40 + 20 * Math.cos(i * Math.PI / 4 + 6 * timeTheta);
            }
            const currentTargets: Set<Actor> = new Set();
            for (const target of self.attackStats.source.allies) {
                if (getDistance(currentLocation, target) > currentRadius) {
                    if (effectedTargets.has(target)) {
                        removeEffectFromActor(target, self.attackStats.attack.stats.buff, true);
                        effectedTargets.delete(target);
                    }
                } else {
                    currentTargets.add(target);
                    if (!effectedTargets.has(target)) {
                        addEffectToActor(target, self.attackStats.attack.stats.buff, true);
                        effectedTargets.add(target);
                    }
                }
            }
            // Remove any targets not currently found, for instance a target that was effected
            // before the owner moved to another area.
            for (const target of effectedTargets) {
                if (!currentTargets.has(target)) {
                    removeEffectFromActor(target, self.attackStats.attack.stats.buff, true);
                    effectedTargets.delete(target);
                }
            }
        },
        drawGround(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            drawOnGround(context, (groundContext: CanvasRenderingContext2D) => {
                const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
                drawGroundCircle(context, self.area, followTarget.x, followTarget.z, currentRadius)
                groundContext.save();
                groundContext.globalAlpha = alpha;
                groundContext.fillStyle = '' + color;
                groundContext.fill();
                groundContext.globalAlpha = .1;
                groundContext.lineWidth = 8;
                groundContext.strokeStyle = '#FFF';
                groundContext.stroke();
                groundContext.restore();
            });
        },
        finish() {
            effectedTargets.forEach(target => removeEffectFromActor(target, self.attackStats.attack.stats.buff, true));
            effectedTargets.clear();
            self.done = true;
            while (notes.length) notes.pop().done = true;
        }
    };
    return self;
}

// Used to play an animation that has no other effects, for example, the sparkles for the heal spell.
// Set target to a character to have an effect follow them, or to a static target to display in place.
export function animationEffect(
    animation: Animation, target: Target, {scale = [1, 1], loop = false, frameSpeed = 1, tintColor = null, tintValue = null}
): ActiveEffect {
    return {
        area: target.area,
        target,
        x: target.x, y: target.y, z: target.z,
        w: target.w * scale[0],
        h: target.h * scale[1],
        currentFrame: 0, done: false,
        update(effect: ActiveEffect) {
            effect.currentFrame+=frameSpeed;
            effect.x = target.x;
            effect.y = target.y;
            effect.z = target.z - 1; //Show the effect in front of the target.
            effect.w = target.w * scale[0];
            effect.h = target.h * scale[1];
            if (!loop && effect.currentFrame >= animation.frames.length) effect.done = true;
        },
        render(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            if (effect.done) return;
            context.save();
            // context.globalAlpha = alpha;
            context.translate((effect.x - effect.area.cameraX), GROUND_Y - effect.y - effect.z / 2 - target.h / 2);
            // fillRect(context, r(-effect.width / 2, -effect.height / 2, effect.width, effect.height), 'red');
            const frame = animation.frames[Math.floor(effect.currentFrame) % animation.frames.length];
            const targetRectangle = r(-effect.w / 2, -effect.h / 2, effect.w, effect.h);
            if (tintColor) {
                drawTintedImage(context, frame.image, tintColor, tintValue || .5,
                    frame, targetRectangle);
            } else {
                drawFrame(context, frame, targetRectangle);
            }
            context.restore();
        }
    };
}

export function explosionEffect(attackStats: AttackData, x: number, y: number, z: number): ActiveEffect {
    const attack = attackStats.imprintedSpell || attackStats.attack;
    const color = attack.base.color || 'red';
    let alpha = attack.base.alpha || .5;
    let animation, frames = 10, endFrames = 5;
    if (attack.base.explosionAnimation) {
        animation = attack.base.explosionAnimation;
        frames = animation.frames.length;
        if (animation.endFrames) endFrames = animation.endFrames.length;
        alpha = attack.base.alpha || 1;
    }
    if (!attack.stats.area) {
        throw new Error('Explosion effect called with no area set.');
    }
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * RANGE_UNIT;
    let height = radius * 2;
    if (attack.base.height) {
        height = attack.base.height;
    }
    if (attack.base.heightRatio) {
        height = radius * 2 * attack.base.heightRatio;
    }
    return {
        area: attackStats.source.area,
        hitTargets: [], attackStats, x, y, z, w: 0, h: 0, currentFrame: 0, done: false,
        update(effect: ActiveEffect) {
            effect.currentFrame++;
            if (effect.currentFrame > frames) {
                if (effect.currentFrame > frames + endFrames) effect.done = true;
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
            effect.w = currentRadius * 2;
            //effect.height = height * currentRadius / radius;
            effect.h = effect.w * currentRadius / radius;
            // areaCoefficient is the amount of effectiveness lost at the very edge of the radius.
            // areaCoefficient = 0 means the blast is equally effective everywhere.
            // areaCoefficient = 1 means the blast has no effect at the edge.
            // areaCoefficient < 0 means the blast has increased effect the further it is from the center.
            effect.attackStats.effectiveness = 1 - currentRadius / radius * (effect.attackStats.attack.stats.areaCoefficient || 1);
            for (let i = 0; i < effect.attackStats.source.enemies.length; i++) {
                const target = effect.attackStats.source.enemies[i];
                if (target.isDead || effect.hitTargets.indexOf(target) >= 0) continue;
                const distance = getDistance(effect as AreaEntity, target);
                if (distance > 0) continue;
                applyAttackToTarget(attackStats, target);
                // console.log("Hit with effectiveness " + attackStats.effectiveness);
                effect.hitTargets.push(target);
            }
        },
        render(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            if (effect.done) return
            let currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
            context.save();
            context.globalAlpha = alpha;
            context.translate((effect.x - effect.area.cameraX), GROUND_Y - effect.y - effect.z / 2);
            if (animation) {
                const frame = (effect.currentFrame < frames || !animation.endFrames)
                    ? animation.frames[Math.min(frames - 1, effect.currentFrame)]
                    : animation.endFrames[Math.min(endFrames - 1, effect.currentFrame - frames)];
                currentRadius = currentRadius * (animation.scale || 1)
                drawFrame(context, frame, {x: -currentRadius, y: -currentRadius, w: currentRadius * 2, h: currentRadius * 2})
            } else {
                context.beginPath();
                context.scale(1, height / (2 * radius));
                const theta = effect.attackStats.attack.base.minTheta || 0;
                const endTheta = 2 * Math.PI; // self.attackStats.attack.base.maxTheta || 2 * Math.PI;
                context.arc(0, 0, currentRadius, theta, endTheta);
                context.fillStyle = '' + color;
                context.fill();
            }
            context.restore();
        }
    };
}


export function novaEffect(attackStats: AttackData, x: number, y: number, z: number): ActiveEffect {
    const attack = attackStats.imprintedSpell || attackStats.attack;
    const color = attack.base.color || 'red';
    const alpha = attack.base.alpha || 5;
    const frames = 10, endFrames = 5;
    const blasts = [];
    let theta = Math.random() * 2 * Math.PI;
    if (!attack.stats.area) {
        throw new Error('Explosion effect called with no area set.');
    }
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * RANGE_UNIT;
    return {
        area: attackStats.source.area,
        'hitTargets': [], attackStats, x, y, z, w: 0, h: 0, 'currentFrame': 0, 'done': false,
        update(effect: ActiveEffect) {
            effect.currentFrame++;
            if (effect.currentFrame > frames) {
                if (effect.currentFrame > frames + endFrames) effect.done = true;
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
            // This animation shows up randomly in the circle.
            for (let i = 0; i < 2; i++) {
                const animation = _.sample(attack.base.blastAnimation);
                const scale = 1.5 * attack.stats.area / 5;
                const width = scale * animation.frames[0][2];
                if (currentRadius > RANGE_UNIT + width / 4 && blasts.length < 15) {
                    const blastZ = effect.z + Math.sin(theta) * (currentRadius - width / 4);
                    if (blastZ > MIN_Z && blastZ < MAX_Z) {
                        const blast = animationEffect(animation,
                            {
                                targetType: 'location',
                                area: effect.area,
                                x: effect.x + Math.cos(theta) * (currentRadius - width / 4), y: -16, z: blastZ,
                                w: width, h: scale * animation.frames[0][3]
                            }, {frameSpeed: .2});
                        effect.area.effects.push(blast);
                        blasts.push(blast);
                    }
                    theta += Math.PI * (Math.random() * .1 + .9) / 3;
                }
            }
            effect.w = currentRadius * 2;
            effect.h = effect.w * currentRadius / radius;
            // areaCoefficient is the amount of effectiveness lost at the very edge of the radius.
            // areaCoefficient = 0 means the blast is equally effective everywhere.
            // areaCoefficient = 1 means the blast has no effect at the edge.
            // areaCoefficient < 0 means the blast has increased effect the further it is from the center.
            effect.attackStats.effectiveness = 1 - currentRadius / radius * (effect.attackStats.attack.stats.areaCoefficient || 1);
            for (let i = 0; i < effect.attackStats.source.enemies.length; i++) {
                const target = effect.attackStats.source.enemies[i];
                if (target.isDead || effect.hitTargets.indexOf(target) >= 0) continue;
                const distance = getDistance(effect as AreaEntity, target);
                if (distance > 0) continue;
                applyAttackToTarget(attackStats, target);
                // console.log("Hit with effectiveness " + attackStats.effectiveness);
                effect.hitTargets.push(target);
                // This animation just shows up on the targets that are hit.
                /*var animation = _.sample(attack.base.blastAnimation);
                var scale = 2;
                var width = scale * animation.frames[0][2];
                var blast = animationEffect(animation,
                    {x: target.x, y: -16, z: target.z - 16,
                        width: width, height: scale * animation.frames[0][3]}, {frameSpeed: .2});
                area.effects.push(blast);
                blasts.push(blast);*/
            }
        },
        //render(context: CanvasRenderingContext2D, area: Area) {
            // Only the ground circle and the blasts are drawn for this effect.
        //},
        drawGround(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            drawOnGround(context, groundContext => {
                const currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
                drawGroundCircle(groundContext, effect.area, effect.x, effect.z, currentRadius)
                groundContext.save();
                groundContext.globalAlpha = alpha;
                groundContext.fillStyle = color;
                groundContext.fill();
                groundContext.globalAlpha = .1;
                groundContext.lineWidth = 8;
                groundContext.strokeStyle = '#FFF';
                groundContext.stroke();
                groundContext.restore();
            });
        },
    };
}

export function fieldEffect(attackStats: AttackData, followTarget: Actor): ActiveEffect {
    const attack = attackStats.imprintedSpell || attackStats.attack;
    const color = (attack.base.color || 'red');
    const alpha = (attack.base.alpha || .5);
    const frames = 10;
    if (!attack.stats.area) {
        throw new Error('Field effect called with no area set.');
    }
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * RANGE_UNIT;
    const height = (attack.base.height || radius * 2);
    const endTime = attackStats.source.time + attack.stats.duration;
    let nextHit = attackStats.source.time + 1 / attack.stats.hitsPerSecond;
    const yOffset = getAttackY(attackStats.source) + (attack.base.yOffset || 0);
    return {
        area: attackStats.source.area,
        attackStats,
        'x': followTarget.x,
        'y': followTarget.y,
        'z': followTarget.z,
        'w': radius * 2, h: height,
        'currentFrame': 0, 'done': false,
        update(effect: ActiveEffect) {
            effect.currentFrame++;
            if (effect.attackStats.source.time > endTime || attackStats.source.isDead) {
                effect.done = true;
                return;
            }
            // followTarget.time gets changed when changing areas, so we need to correct the
            // next hit time when this happens. It is sufficent to just move it closer if the
            // current next hit time is too far in the future.
            nextHit = Math.min(followTarget.time + 1 / attack.stats.hitsPerSecond, nextHit);
            const currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
            effect.w = currentRadius * 2;
            effect.x = followTarget.x;
            effect.y = followTarget.y;
            effect.z = followTarget.z;
            effect.h = height * currentRadius / radius;
            if (followTarget.time < nextHit) {
                return;
            }
            nextHit += 1 / attack.stats.hitsPerSecond;

            const livingTargets = followTarget.enemies.filter(target => !target.isDead);
            const livingTargetsInRange = livingTargets.filter(target => getDistance(effect, target) <= 0);
            const healthyTargetsInRange = livingTargetsInRange.filter(target => !isActorDying(target));
            if (healthyTargetsInRange.length) {
                applyAttackToTarget(attackStats, Random.element(healthyTargetsInRange));
            } else if (livingTargetsInRange.length) {
                applyAttackToTarget(attackStats, Random.element(livingTargetsInRange));
            }
        },
        render(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            if (effect.done) return
            var currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
            context.globalAlpha = alpha;
            context.fillStyle = '' + color;
            context.beginPath();
            context.save();
            context.translate((followTarget.x - effect.area.cameraX), GROUND_Y - yOffset - followTarget.z / 2);
            context.scale(1, height / (2 * currentRadius));
            context.arc(0, 0, currentRadius, 0, 2 * Math.PI);
            context.fill();
            context.restore();
            context.globalAlpha = 1;
        },
        drawGround(context: CanvasRenderingContext2D, effect: ActiveEffect) {
            drawOnGround(context, (groundContext: CanvasRenderingContext2D) => {
                var currentRadius = Math.round(radius * Math.min(1, effect.currentFrame / frames));
                drawGroundCircle(groundContext, effect.area, followTarget.x, followTarget.z, currentRadius)
                groundContext.save();
                groundContext.globalAlpha = alpha;
                groundContext.fillStyle = '' + color;
                groundContext.fill();
                groundContext.globalAlpha = .1;
                groundContext.lineWidth = 8;
                groundContext.strokeStyle = '#FFF';
                groundContext.stroke();
                groundContext.restore();
            });
        },
    };
}
// These are fake projectiles created by a projectile to be displayed as blurred after images.
function afterImage({attackStats, x, y, z, vx, vy, vz, color, size, t}: Projectile): Partial<Projectile> {
    let alpha = 1;
    return {
        area: attackStats.source.area,
        update(projectile: Projectile) {
            alpha -= 1 / ((attackStats.attack.base.afterImages || 3) + 1);
            if (alpha <= 0) projectile.done = true;
        },
        render(context: CanvasRenderingContext2D, projectile: Projectile) {
            if (projectile.done || alpha >= 1) return;
            context.save();
            context.globalAlpha = alpha;
            context.translate(x - projectile.area.cameraX, GROUND_Y - y - z / 2);
            if (vx < 0) {
                context.scale(-1, 1);
                context.rotate(-Math.atan2(vy, -vx));
            } else {
                context.rotate(-Math.atan2(vy, vx));
            }
            const animation = attackStats.animation;
            if (animation) {
                const frame = getFrame(animation, t * FRAME_LENGTH);
                drawFrame(context, frame, {x: -size / 2 ,y: -size / 2, w: size, h: size});
            } else {
                context.fillStyle = '' + color || '#000';
                context.fillRect(-size / 2, -size / 2, size, size);
            }
            context.restore();
        }
    };
}
export function projectile(
    attackStats: AttackData,
    x: number, y: number, z: number,
    vx: number, vy: number, vz: number,
    target: Target, delay: number, color: Color, size = 10
): Projectile {
    if (!size) {
        pause();
        console.log(attackStats);
        debugger;
        throw new Error('Projectile found without size');
    }
    let stuckDelta, stuckTarget;
    const projectile: Projectile = {
        area: attackStats.source.area,
        'distance': 0, x, y, z, vx, vy, vz, size, 't': 0, 'done': false, delay,
        w: size, h: size, color,
        totalHits: 0,
        'hit': false, target, attackStats, 'hitTargets': [],
        stickToTarget(projectile: Projectile, target: Target) {
            stuckTarget = target;
            stuckDelta = {x: projectile.x - projectile.vx - target.x, y: projectile.y - projectile.vy - target.y, z: projectile.z - projectile.vz - target.z};
        },
        update(projectile: Projectile) {
            if (stuckDelta) {
                if (!stuckTarget.pull || stuckTarget.pull.sourceAttackStats !== attackStats) {
                    projectile.done = true;
                    return;
                }
                projectile.x = stuckTarget.x + stuckDelta.x;
                projectile.y = stuckTarget.y + stuckDelta.y;
                projectile.z = stuckTarget.z + stuckDelta.z;
            }
            // Put an absolute cap on how far a projectile can travel
            if (projectile.y < 0 || projectile.totalHits >= 5 || projectile.distance > 2000 && !stuckDelta) {
                applyAttackToTarget(projectile.attackStats, {targetType: 'location', area: projectile.area, 'x': projectile.x, 'y': projectile.y, 'z': projectile.z, w: 0, h: 0});
                projectile.done = true;
            }
            if (projectile.done || projectile.delay-- > 0) return;
            if (attackStats.attack.base.afterImages > 0) {
                projectile.area.projectiles.push(afterImage(this));
            }
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.z += projectile.vz;
            projectile.distance += Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy + projectile.vz * projectile.vz);
            // attack stats may be shared between multiple projectiles.
            // this isn't ideal but it is probably okay to just copy local value here.
            projectile.attackStats.distance = projectile.distance;
            let hit = false;
            if (attackStats.attack.variableObject.tags.rain) {
                // rain hits when it touches the ground
                if (projectile.y <= 0) {
                    projectile.y = 0;
                    applyAttackToTarget(projectile.attackStats);
                    projectile.hit = true;
                    projectile.done = true;
                }
            } else {
                // normal projectiles hit when they overlap the target.
                hit = (getDistanceOverlap(projectile, projectile.target) <= -projectile.w / 4)
                    && (projectile.target.targetType === 'location' || projectile.target.health > 0);
            }
            projectile.vy -= attackStats.gravity;
            projectile.t += 1;
            if (projectile.attackStats.piercing) {
                for (let i = 0; i < projectile.attackStats.source.enemies.length; i++) {
                    const enemy = projectile.attackStats.source.enemies[i];
                    if (enemy === projectile.target || projectile.hitTargets.indexOf(enemy) >= 0) {
                        continue;
                    }
                    if (getDistance(projectile, enemy) && enemy.health > 0) {
                        projectile.hitTargets.push(enemy);
                        if (applyAttackToTarget(projectile.attackStats, enemy) && projectile.attackStats.attack.stats.pullsTarget) {
                            projectile.stickToTarget(projectile, enemy);
                            return;
                        }
                    }
                }
            }
            // Don't do any collision detection once the projectile is spent.
            if (projectile.hit || !hit) return;
            projectile.hit = true;
            // Juggler can bounce attacks back to himprojectile with friendly set to true to allow him to bounce
            // attacks back to himprojectile without injuring himprojectile.
            if (!attackStats.friendly && projectile.target.targetType === 'actor' && projectile.target.reflectBarrier > 0) {
                // Allow reflect barrier to become negative so that it can take time to restore after being hit by a much more powerful attack.
                projectile.target.reflectBarrier = projectile.target.reflectBarrier - projectile.attackStats.magicDamage - projectile.attackStats.damage;
                playAreaSound('reflect', projectile.area);
                projectile.hit = false;
                var newTarget = projectile.attackStats.source;
                projectile.attackStats.source = projectile.target;
                projectile.target = newTarget;
                var v = getProjectileVelocity(projectile.attackStats, projectile.x, projectile.y, projectile.z, newTarget);
                projectile.vx = v[0];
                projectile.vy = v[1];
                projectile.vz = v[2];
            } else if (attackStats.friendly || applyAttackToTarget(projectile.attackStats, projectile.target)) {
                // Friendly attack shouldn't hook the user, this is like when a juggler bounces a ball off of himprojectile.
                if (!attackStats.friendly && projectile.attackStats.attack.stats.pullsTarget) {
                    projectile.stickToTarget(projectile, projectile.target);
                    return;
                }
                attackStats.friendly = false;
                projectile.done = true;
                if (attackStats.attack.stats.chaining) {
                    projectile.done = false;
                    projectile.totalHits++;
                    // every bounce allows piercing projectiles to hit each target again.
                    projectile.hitTargets = [];
                    // reduce the speed. This seems realistic and make it easier to
                    // distinguish bounced attacks from new attacks.
                    projectile.vx = -projectile.vx / 2;
                    projectile.vz = -projectile.vz / 2;
                    var targets = projectile.attackStats.source.enemies.slice();
                    targets.push(attackStats.source);
                    while (targets.length) {
                        var index = Math.floor(Math.random() * targets.length);
                        var newTarget = targets[index];
                        if (newTarget.health <= 0 || newTarget === projectile.target || newTarget.cloaked
                            || getDistance(projectile.target, newTarget) > projectile.attackStats.attack.stats.range * RANGE_UNIT
                        ) {
                            targets.splice(index--, 1);
                            continue;
                        }
                        projectile.hit = false;
                        projectile.target = newTarget;
                        if (newTarget === attackStats.source) {
                            attackStats.friendly = true;
                        }
                        // Calculate new velocity
                        const v = getProjectileVelocity(projectile.attackStats, projectile.x, projectile.y, projectile.z, newTarget);
                        projectile.vx = v[0];
                        projectile.vy = v[1];
                        projectile.vz = v[2];
                        break;
                    }
                } else if (projectile.attackStats.piercing) {
                    projectile.done = false;
                    //console.log('pierce');
                }
            }
        },
        render(context: CanvasRenderingContext2D, projectile: Projectile) {
            if (projectile.done || projectile.delay > 0) return
            context.save();
            context.translate(projectile.x - projectile.area.cameraX, GROUND_Y - projectile.y - projectile.z / 2);
            if (projectile.vx < 0) {
                context.scale(-1, 1);
                context.rotate(-Math.atan2(projectile.vy, -projectile.vx));
            } else {
                context.rotate(-Math.atan2(projectile.vy, projectile.vx));
            }
            if (projectile.attackStats.animation) {
                const animation = projectile.attackStats.animation;
                const frame = getFrame(animation, projectile.t * FRAME_LENGTH);
                drawFrame(context, frame, r(-size / 2, -size / 2, size, size));
            } else {
                context.fillStyle = '' + color || '#000';
                context.fillRect(-size / 2, -size / 2, size, size);
            }
            context.restore();
        }
    };
    projectile.attackStats.projectile = projectile;
    return projectile;
}

export function getProjectileVelocity(attackStats: AttackData, x: number, y: number, z: number, target: Target) {
    const scale = (target.targetType === 'actor' && target.stats.scale) || 1;
    const ty = (target.y || 0) + (target.targetType === 'location' ? 0 : target.h || 32) * 3 / 4;
    const v = [target.x - x, ty - y, target.z - z];
    let distance = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    const speed = Math.min(attackStats.speed, distance / 5);
    const frameEstimate = distance / speed;
    //console.log({x, y, z}, target, {ty, v, distance, speed, frameEstimate, gravity: attackStats.gravity});
    // Over a period of N frames, the projectile will fall roughly N^2 / 2, update target velocity accordingly
    v[1] += attackStats.gravity * frameEstimate * frameEstimate / 2;
    distance = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (distance === 0 || isNaN(distance) || isNaN(v[0]) || isNaN(v[1])) {
        console.log("invalid velocity");
        console.log([speed, attackStats.gravity]);
        console.log([x, y, z, target.x, ty, target.z]);
        console.log([target.x, target.y, target.w, target.h]);
        console.log(target);
        console.log(distance);
        console.log(v);
        debugger;
    }
    // console.log([v[0] * speed / distance, v[1] * speed / distance, v[2] * speed / distance]);
    return [v[0] * speed / distance, v[1] * speed / distance, v[2] * speed / distance];
}

export function expireTimedEffects(actor: Actor) {
    if (actor.isDead ) return;
    let changed = false;
    for (let i = 0; i < actor.allEffects.length; i++) {
        const effect = actor.allEffects[i];
        if (effect.expirationTime && effect.expirationTime < actor.time) {
            actor.allEffects.splice(i, 1);
            removeBonusSourceFromObject(actor.variableObject, effect, false);
            changed = true;
        }
    }
    if (changed) recomputeDirtyStats(actor.variableObject);
}
export function addTimedEffect(actor: Actor, effect: BonusSource & {base?: VariableObjectBase, stats?: EffectStats} , area = null) {
    if (actor.isDead) return;
    if (area === null) {
        area = effect.stats.area;
    }
    // Copy the effect because each timed effect has a distinct expirationTime.
    // Also setting the area here to 0 allows us to call this method again for
    // allies within the area of effect without recursing infinitely.
    const timedEffect: TimedActorEffect = {
        base: effect.base,
        bonuses: effect.bonuses,
        duration: effect.stats ? effect.stats.duration : 'forever',
        maxStacks: (effect.stats && effect.stats.maxStacks) ? effect.stats.maxStacks : 50,
    };
    if (timedEffect.duration !== 'forever') {
        timedEffect.expirationTime = actor.time + timedEffect.duration;
    }
    if (area) {
        actor.allies.forEach(function (ally) {
            if (ally === actor) return;
            if (getDistance(actor, ally) < area * RANGE_UNIT) addTimedEffect(ally, effect, 0);
        });
    }
    const count = actor.allEffects.filter(currentEffect => currentEffect.base === timedEffect.base).length;
    if (count < timedEffect.maxStacks) {
        addEffectToActor(actor, timedEffect, true);
    }
}
function addEffectToActor(actor: Actor, effect: ActorEffect, triggerComputation = false) {
    actor.allEffects.push(effect);
    addBonusSourceToObject(actor.variableObject, effect, triggerComputation);
}
function removeEffectFromActor(actor: Actor, effect: ActorEffect, triggerComputation) {
    const index = actor.allEffects.indexOf(effect);
    // One reason this might not be set is if an actor was removed from an area while an aoe buff was
    // still targeting it. In this case, the aoe buff will attempt to remove the out of range target
    // but the target has already had all effects removed from it.
    if (index >= 0) {
        actor.allEffects.splice(index, 1);
        removeBonusSourceFromObject(actor.variableObject, effect, triggerComputation);
    } else {
        // This case definitely happens when an actor playing a song returns to the world map.
        // Returning to the world map removes all effects, but doesn't remove the actor from the list of effected
        // targets, then the song is removed and tries to remove the effect from the actor since it still has
        // them listed as effected.
        //debugger;
    }
}

export class ParticleEffect implements ActiveEffect {
    area: Area;
    animation: Animation;
    scale: number;
    x: number;
    y: number;
    // These three properties are unused currently because this effect just uses screen coordinates
    // but active effects are always typed in adventure coords.
    z: number;
    w: number;
    h: number;
    r: number = 0;
    vx: number = 0;
    vy: number = 0;
    vr: number = 0;
    ax: number = 0;
    ay: number = 1;
    ar: number = 0;
    flipped: boolean = false;
    time: number = 0;
    ttl: number = 1000;
    done: boolean = false;
    constructor(props : Partial<ParticleEffect>) {
        Object.assign(this, props);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.r += this.vr;
        this.vx += this.ax;
        this.vy += this.ay;
        this.vr += this.ar;
        this.time += FRAME_LENGTH;
        if (this.time >= this.ttl) {
            this.done = true;
        }
    }
    render(context: CanvasRenderingContext2D, effect: ActiveEffect) {
        const frame = getFrame(this.animation, this.time);
        // Draw a red dot at the actual coordinates, can be useful for debugging rendering errors.
        // context.fillStyle = 'red';
        // context.fillRect(this.x - 1, this.y - 1, 2, 2);
        if (this.r || this.vr || this.flipped) {
            context.save();
            const content = frame.content || {...frame, x: 0, y: 0};
            context.translate(
                this.x | 0,
                this.y | 0
            );
            context.rotate(this.r);
            context.scale(this.scale * (this.flipped ? -1 : 1), this.scale);
            drawFrame(context, frame, {
                x: (-content.x - content.w / 2) | 0,
                y: (-content.y - content.h / 2) | 0,
                w: frame.w,
                h: frame.h
            });
            context.restore();
        } else {
            const content = frame.content || {...frame, x: 0, y: 0};
            drawFrame(context, frame, {
                x: (this.x - content.x - content.w / 2) | 0,
                y: (this.y - content.y - content.h / 2) | 0, w: frame.w * this.scale, h: frame.h * this.scale});
        }
    }
}
