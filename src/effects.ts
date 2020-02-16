import _ from 'lodash';

import { getDistance, getDistanceOverlap } from 'app/adventure';
import { pause } from 'app/adventureButtons';
import { addBonusSourceToObject, recomputeDirtyStats, removeBonusSourceFromObject } from 'app/bonuses';
import { effectAnimations } from 'app/content/effectAnimations';
import { mainContext } from 'app/dom';
import { drawGroundCircle, drawOnGround } from 'app/drawArea';
import { FRAME_LENGTH, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { drawImage, drawTintedImage } from 'app/images';
import { applyAttackToTarget, getAttackY } from 'app/performAttack';
import { isActorDying } from 'app/useSkill';
import { drawFrame, getFrame } from 'app/utils/animations';
import { rectangle } from 'app/utils/index';
import Random from 'app/utils/Random';
import { playSound } from 'app/utils/sounds';

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
    const radius = attackStats.attack.stats.area * (attackStats.effectiveness || 1) * 32;
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
        attackStats, 'currentFrame': 0, 'done': false,
        update(area: Area) {
            self.currentFrame++;
            if (notes.length < 6) {
                const note = animationEffect(effectAnimations.song,
                    {targetType: 'location', x:0, y: 20, z: 0, width: 25, height: 50},
                    {loop: true, frameSpeed: .5, tintColor: color, tintValue: .5}
                );
                area.effects.push(note);
                followTarget.boundEffects.push(note);
                notes.push(note);
            }
            if (followTarget.time > endTime || followTarget.isDead) {
                this.finish();
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            const currentLocation: AreaEntity = {
                x: followTarget.x, y: followTarget.y, z: followTarget.z,
                width: 0, height: 0,
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
        drawGround(area: Area) {
            drawOnGround((context: CanvasRenderingContext2D) => {
                const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
                drawGroundCircle(context, area, followTarget.x, followTarget.z, currentRadius)
                context.save();
                context.globalAlpha = alpha;
                context.fillStyle = '' + color;
                context.fill();
                context.globalAlpha = .1;
                context.lineWidth = 8;
                context.strokeStyle = '#FFF';
                context.stroke();
                context.restore();
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
    animation, target: Target, {scale = [1, 1], loop = false, frameSpeed = 1, tintColor = null, tintValue = null}
): ActiveEffect {
    return {
        target,
        x: target.x, y: target.y, z: target.z,
        width: target.width * scale[0],
        height: target.height * scale[1],
        currentFrame: 0, done: false,
        update(area: Area) {
            this.currentFrame+=frameSpeed;
            this.x = target.x;
            this.y = target.y;
            this.z = target.z - 1; //Show the effect in front of the target.
            this.width = target.width * scale[0];
            this.height = target.height * scale[1];
            if (!loop && this.currentFrame >= animation.frames.length) this.done = true;
        },
        render(area: Area) {
            if (this.done) return
            mainContext.save();
            // mainContext.globalAlpha = alpha;
            mainContext.translate((this.x - area.cameraX), GROUND_Y - this.y - this.z / 2 - target.height / 2);
            mainContext.fillStyle = 'red';
            // fillRectangle(mainContext, rectangle(-this.width / 2, -this.height / 2, this.width, this.height));
            var frame = animation.frames[Math.floor(this.currentFrame) % animation.frames.length];
            var sourceRectangle = rectangle(frame[0], frame[1], frame[2], frame[3]);
            var targetRectangle = rectangle(-this.width / 2, -this.height / 2, this.width, this.height);
            if (tintColor) {
                drawTintedImage(mainContext, animation.image, tintColor, tintValue || .5,
                    sourceRectangle, targetRectangle);
            } else {
                drawImage(mainContext, animation.image, sourceRectangle, targetRectangle);
            }
            mainContext.restore();
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
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * 32;
    let height = radius * 2;
    if (attack.base.height) {
        height = attack.base.height;
    }
    if (attack.base.heightRatio) {
        height = radius * 2 * attack.base.heightRatio;
    }
    const self: ActiveEffect = {
        hitTargets: [], attackStats, x, y, z, width: 0, height: 0, currentFrame: 0, done: false,
        update(area) {
            self.currentFrame++;
            if (self.currentFrame > frames) {
                if (self.currentFrame > frames + endFrames) self.done = true;
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            self.width = currentRadius * 2;
            self.height = height * currentRadius / radius;
            self.height = self.width * currentRadius / radius;
            // areaCoefficient is the amount of effectiveness lost at the very edge of the radius.
            // areaCoefficient = 0 means the blast is equally effective everywhere.
            // areaCoefficient = 1 means the blast has no effect at the edge.
            // areaCoefficient < 0 means the blast has increased effect the further it is from the center.
            self.attackStats.effectiveness = 1 - currentRadius / radius * (self.attackStats.attack.stats.areaCoefficient || 1);
            for (let i = 0; i < self.attackStats.source.enemies.length; i++) {
                const target = self.attackStats.source.enemies[i];
                if (target.isDead || self.hitTargets.indexOf(target) >= 0) continue;
                const distance = getDistance(self as AreaEntity, target);
                if (distance > 0) continue;
                applyAttackToTarget(attackStats, target);
                // console.log("Hit with effectiveness " + attackStats.effectiveness);
                self.hitTargets.push(target);
            }
        },
        render(area: Area) {
            if (self.done) return
            let currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            mainContext.save();
            mainContext.globalAlpha = alpha;
            mainContext.translate((self.x - area.cameraX), GROUND_Y - self.y - self.z / 2);
            if (animation) {
                const frame = (self.currentFrame < frames || !animation.endFrames)
                    ? animation.frames[Math.min(frames - 1, self.currentFrame)]
                    : animation.endFrames[Math.min(endFrames - 1, self.currentFrame - frames)];
                currentRadius = currentRadius * (animation.scale || 1)
                mainContext.drawImage(animation.image, frame[0], frame[1], frame[2], frame[3],
                                               -currentRadius, -currentRadius, currentRadius * 2, currentRadius * 2);
            } else {
                mainContext.beginPath();
                mainContext.scale(1, height / (2 * radius));
                const theta = self.attackStats.attack.base.minTheta || 0;
                const endTheta = 2 * Math.PI; // self.attackStats.attack.base.maxTheta || 2 * Math.PI;
                mainContext.arc(0, 0, currentRadius, theta, endTheta);
                mainContext.fillStyle = '' + color;
                mainContext.fill();
            }
            mainContext.restore();
        }
    };
    return self;
}


export function novaEffect(attackStats: AttackData, x: number, y: number, z: number) {
    const attack = attackStats.imprintedSpell || attackStats.attack;
    const color = attack.base.color || 'red';
    const alpha = attack.base.alpha || 5;
    const frames = 10, endFrames = 5;
    const blasts = [];
    let theta = Math.random() * 2 * Math.PI;
    if (!attack.stats.area) {
        throw new Error('Explosion effect called with no area set.');
    }
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * 32;
    const self: ActiveEffect = {
        'hitTargets': [], attackStats, x, y, z, 'width': 0, 'height': 0, 'currentFrame': 0, 'done': false,
        update(area) {
            self.currentFrame++;
            if (self.currentFrame > frames) {
                if (self.currentFrame > frames + endFrames) self.done = true;
                return;
            }
            const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            // This animation shows up randomly in the circle.
            for (let i = 0; i < 2; i++) {
                const animation = _.sample(attack.base.blastAnimation);
                const scale = 1.5 * attack.stats.area / 5;
                const width = scale * animation.frames[0][2];
                if (currentRadius > 32 + width / 4 && blasts.length < 15) {
                    const blastZ = self.z + Math.sin(theta) * (currentRadius - width / 4);
                    if (blastZ > MIN_Z && blastZ < MAX_Z) {
                        const blast = animationEffect(animation,
                            {
                                targetType: 'location',
                                x: self.x + Math.cos(theta) * (currentRadius - width / 4), y: -16, z: blastZ,
                                width: width, height: scale * animation.frames[0][3]
                            }, {frameSpeed: .2});
                        area.effects.push(blast);
                        blasts.push(blast);
                    }
                    theta += Math.PI * (Math.random() * .1 + .9) / 3;
                }
            }
            self.width = currentRadius * 2;
            self.height = self.width * currentRadius / radius;
            // areaCoefficient is the amount of effectiveness lost at the very edge of the radius.
            // areaCoefficient = 0 means the blast is equally effective everywhere.
            // areaCoefficient = 1 means the blast has no effect at the edge.
            // areaCoefficient < 0 means the blast has increased effect the further it is from the center.
            self.attackStats.effectiveness = 1 - currentRadius / radius * (self.attackStats.attack.stats.areaCoefficient || 1);
            for (let i = 0; i < self.attackStats.source.enemies.length; i++) {
                const target = self.attackStats.source.enemies[i];
                if (target.isDead || self.hitTargets.indexOf(target) >= 0) continue;
                const distance = getDistance(self as AreaEntity, target);
                if (distance > 0) continue;
                applyAttackToTarget(attackStats, target);
                // console.log("Hit with effectiveness " + attackStats.effectiveness);
                self.hitTargets.push(target);
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
        //render(area: Area) {
            // Only the ground circle and the blasts are drawn for this effect.
        //},
        drawGround(area: Area) {
            drawOnGround(context => {
                const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
                drawGroundCircle(context, area, self.x, self.z, currentRadius)
                context.save();
                context.globalAlpha = alpha;
                context.fillStyle = color;
                context.fill();
                context.globalAlpha = .1;
                context.lineWidth = 8;
                context.strokeStyle = '#FFF';
                context.stroke();
                context.restore();
            });
        },
    };
    return self;
}

export function fieldEffect(attackStats: AttackData, followTarget: Actor) {
    const attack = attackStats.imprintedSpell || attackStats.attack;
    const color = (attack.base.color || 'red');
    const alpha = (attack.base.alpha || .5);
    const frames = 10;
    if (!attack.stats.area) {
        throw new Error('Field effect called with no area set.');
    }
    const radius = attack.stats.area * (attackStats.effectiveness || 1) * 32;
    const height = (attack.base.height || radius * 2);
    const endTime = attackStats.source.time + attack.stats.duration;
    let nextHit = attackStats.source.time + 1 / attack.stats.hitsPerSecond;
    const yOffset = getAttackY(attackStats.source) + (attack.base.yOffset || 0);
    const self = {
        attackStats,
        'x': followTarget.x,
        'y': followTarget.y,
        'z': followTarget.z,
        'width': radius * 2, height,
        'currentFrame': 0, 'done': false,
        update(area) {
            self.currentFrame++;
            if (self.attackStats.source.time > endTime || attackStats.source.isDead) {
                self.done = true;
                return;
            }
            // followTarget.time gets changed when changing areas, so we need to correct the
            // next hit time when this happens. It is sufficent to just move it closer if the
            // current next hit time is too far in the future.
            nextHit = Math.min(followTarget.time + 1 / attack.stats.hitsPerSecond, nextHit);
            const currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            self.width = currentRadius * 2;
            self.x = followTarget.x;
            self.y = followTarget.y;
            self.z = followTarget.z;
            self.height = height * currentRadius / radius;
            if (followTarget.time < nextHit) {
                return;
            }
            nextHit += 1 / attack.stats.hitsPerSecond;

            const livingTargets = followTarget.enemies.filter(target => !target.isDead);
            const livingTargetsInRange = livingTargets.filter(target => getDistance(self, target) <= 0);
            const healthyTargetsInRange = livingTargetsInRange.filter(target => !isActorDying(target));
            if (healthyTargetsInRange.length) {
                applyAttackToTarget(attackStats, Random.element(healthyTargetsInRange));
            } else if (livingTargetsInRange.length) {
                applyAttackToTarget(attackStats, Random.element(livingTargetsInRange));
            }
        },
        render(area: Area) {
            if (self.done) return
            var currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
            mainContext.globalAlpha = alpha;
            mainContext.fillStyle = '' + color;
            mainContext.beginPath();
            mainContext.save();
            mainContext.translate((followTarget.x - area.cameraX), GROUND_Y - yOffset - followTarget.z / 2);
            mainContext.scale(1, height / (2 * currentRadius));
            mainContext.arc(0, 0, currentRadius, 0, 2 * Math.PI);
            mainContext.fill();
            mainContext.restore();
            mainContext.globalAlpha = 1;
        },
        drawGround(area: Area) {
            drawOnGround((context: CanvasRenderingContext2D) => {
                var currentRadius = Math.round(radius * Math.min(1, self.currentFrame / frames));
                drawGroundCircle(context, area, followTarget.x, followTarget.z, currentRadius)
                context.save();
                context.globalAlpha = alpha;
                context.fillStyle = '' + color;
                context.fill();
                context.globalAlpha = .1;
                context.lineWidth = 8;
                context.strokeStyle = '#FFF';
                context.stroke();
                context.restore();
            });
        },
    };
    return self;
}
// These are fake projectiles created by a projectile to be displayed as blurred after images.
function afterImage({attackStats, x, y, z, vx, vy, vz, color, size, t}: Projectile): Partial<Projectile> {
    let alpha = 1;
    return {
        update(area: Area) {
            alpha -= 1 / ((attackStats.attack.base.afterImages || 3) + 1);
            if (alpha <= 0) this.done = true;
        },
        render(area: Area) {
            if (this.done || alpha >= 1) return;
            mainContext.save();
            mainContext.globalAlpha = alpha;
            mainContext.translate(x - area.cameraX, GROUND_Y - y - z / 2);
            if (vx < 0) {
                mainContext.scale(-1, 1);
                mainContext.rotate(-Math.atan2(vy, -vx));
            } else {
                mainContext.rotate(-Math.atan2(vy, vx));
            }
            const animation = attackStats.animation;
            if (animation) {
                const frame = animation.frames[Math.floor((animation.fps || 10) * t * 20 / 1000) % animation.frames.length];
                mainContext.drawImage(animation.image, frame[0], frame[1], frame[2], frame[3],
                                   -size / 2, -size / 2, size, size);
            } else {
                mainContext.fillStyle = '' + color || '#000';
                mainContext.fillRect(-size / 2, -size / 2, size, size);
            }
            mainContext.restore();
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
    const self: Projectile = {
        'distance': 0, x, y, z, vx, vy, vz, size, 't': 0, 'done': false, delay,
        'width': size, 'height': size, color,
        totalHits: 0,
        'hit': false, target, attackStats, 'hitTargets': [],
        stickToTarget(target: Target) {
            stuckTarget = target;
            stuckDelta = {x: self.x - self.vx - target.x, y: self.y - self.vy - target.y, z: self.z - self.vz - target.z};
        },
        update(area: Area) {
            if (stuckDelta) {
                if (!stuckTarget.pull || stuckTarget.pull.sourceAttackStats !== attackStats) {
                    self.done = true;
                    return;
                }
                self.x = stuckTarget.x + stuckDelta.x;
                self.y = stuckTarget.y + stuckDelta.y;
                self.z = stuckTarget.z + stuckDelta.z;
            }
            // Put an absolute cap on how far a projectile can travel
            if (self.y < 0 || self.totalHits >= 5 || self.distance > 2000 && !stuckDelta) {
                applyAttackToTarget(self.attackStats, {targetType: 'location', 'x': self.x, 'y': self.y, 'z': self.z, 'width': 0, 'height': 0});
                self.done = true;
            }
            if (self.done || self.delay-- > 0) return;
            if (attackStats.attack.base.afterImages > 0) {
                area.projectiles.push(afterImage(this));
            }
            self.x += self.vx;
            self.y += self.vy;
            self.z += self.vz;
            self.distance += Math.sqrt(self.vx * self.vx + self.vy * self.vy + self.vz * self.vz);
            // attack stats may be shared between multiple projectiles.
            // this isn't ideal but it is probably okay to just copy local value here.
            self.attackStats.distance = self.distance;
            let hit = false;
            if (attackStats.attack.variableObject.tags.rain) {
                // rain hits when it touches the ground
                if (self.y <= 0) {
                    self.y = 0;
                    applyAttackToTarget(self.attackStats);
                    self.hit = true;
                    self.done = true;
                }
            } else {
                // normal projectiles hit when they overlap the target.
                hit = (getDistanceOverlap(self, self.target) <= -self.width / 2)
                    && (self.target.targetType === 'location' || self.target.health > 0);
            }
            self.vy -= attackStats.gravity;
            self.t += 1;
            if (self.attackStats.piercing) {
                for (let i = 0; i < self.attackStats.source.enemies.length; i++) {
                    const enemy = self.attackStats.source.enemies[i];
                    if (enemy === self.target || self.hitTargets.indexOf(enemy) >= 0) {
                        continue;
                    }
                    if (getDistance(self, enemy) && enemy.health > 0) {
                        self.hitTargets.push(enemy);
                        if (applyAttackToTarget(self.attackStats, enemy) && self.attackStats.attack.stats.pullsTarget) {
                            self.stickToTarget(enemy);
                            return;
                        }
                    }
                }
            }
            // Don't do any collision detection once the projectile is spent.
            if (self.hit || !hit) return;
            self.hit = true;
            // Juggler can bounce attacks back to himself with friendly set to true to allow him to bounce
            // attacks back to himself without injuring himself.
            if (!attackStats.friendly && self.target.targetType === 'actor' && self.target.reflectBarrier > 0) {
                // Allow reflect barrier to become negative so that it can take time to restore after being hit by a much more powerful attack.
                self.target.reflectBarrier = self.target.reflectBarrier - self.attackStats.magicDamage - self.attackStats.damage;
                playSound('reflect', area);
                self.hit = false;
                var newTarget = self.attackStats.source;
                self.attackStats.source = self.target;
                self.target = newTarget;
                var v = getProjectileVelocity(self.attackStats, self.x, self.y, self.z, newTarget);
                self.vx = v[0];
                self.vy = v[1];
                self.vz = v[2];
            } else if (attackStats.friendly || applyAttackToTarget(self.attackStats, self.target)) {
                // Friendly attack shouldn't hook the user, this is like when a juggler bounces a ball off of himself.
                if (!attackStats.friendly && self.attackStats.attack.stats.pullsTarget) {
                    self.stickToTarget(self.target);
                    return;
                }
                attackStats.friendly = false;
                self.done = true;
                if (attackStats.attack.stats.chaining) {
                    self.done = false;
                    self.totalHits++;
                    // every bounce allows piercing projectiles to hit each target again.
                    self.hitTargets = [];
                    // reduce the speed. This seems realistic and make it easier to
                    // distinguish bounced attacks from new attacks.
                    self.vx = -self.vx / 2;
                    self.vz = -self.vz / 2;
                    var targets = self.attackStats.source.enemies.slice();
                    targets.push(attackStats.source);
                    while (targets.length) {
                        var index = Math.floor(Math.random() * targets.length);
                        var newTarget = targets[index];
                        if (newTarget.health <= 0 || newTarget === self.target || newTarget.cloaked
                            || getDistance(self.target, newTarget) > self.attackStats.attack.stats.range * 32
                        ) {
                            targets.splice(index--, 1);
                            continue;
                        }
                        self.hit = false;
                        self.target = newTarget;
                        if (newTarget === attackStats.source) {
                            attackStats.friendly = true;
                        }
                        // Calculate new velocity
                        const v = getProjectileVelocity(self.attackStats, self.x, self.y, self.z, newTarget);
                        self.vx = v[0];
                        self.vy = v[1];
                        self.vz = v[2];
                        break;
                    }
                } else if (self.attackStats.piercing) {
                    self.done = false;
                    //console.log('pierce');
                }
            }
        },
        render(area: Area) {
            if (self.done || self.delay > 0) return
            mainContext.save();
            mainContext.translate(self.x - area.cameraX, GROUND_Y - self.y - self.z / 2);
            if (self.vx < 0) {
                mainContext.scale(-1, 1);
                mainContext.rotate(-Math.atan2(self.vy, -self.vx));
            } else {
                mainContext.rotate(-Math.atan2(self.vy, self.vx));
            }
            if (self.attackStats.animation) {
                var animation = self.attackStats.animation;
                var frame = animation.frames[Math.floor((animation.fps || 10) * self.t * 20 / 1000) % animation.frames.length];
                mainContext.drawImage(animation.image, frame[0], frame[1], frame[2], frame[3],
                                   -size / 2, -size / 2, size, size);
            } else {
                mainContext.fillStyle = '' + color || '#000';
                mainContext.fillRect(-size / 2, -size / 2, size, size);
            }
            mainContext.restore();
        }
    };
    self.attackStats.projectile = self;
    return self;
}

export function getProjectileVelocity(attackStats: AttackData, x: number, y: number, z: number, target: Target) {
    const scale = (target.targetType === 'actor' && target.stats.scale) || 1;
    const ty = (target.y || 0) + (target.height || 128) * 3 / 4;
    const v = [target.x - x, ty - y, target.z - z];
    let distance = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    const speed = Math.min(attackStats.speed, distance / 5);
    const frameEstimate = distance / speed;
    // Over a period of N frames, the projectile will fall roughly N^2 / 2, update target velocity accordingly
    v[1] += attackStats.gravity * frameEstimate * frameEstimate / 2;
    distance = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (distance === 0 || isNaN(distance) || isNaN(v[0]) || isNaN(v[1])) {
        console.log("invalid velocity");
        console.log([speed, attackStats.gravity]);
        console.log([x, y, z, target.x, ty, target.z]);
        console.log([target.x, target.y, target.width, target.height]);
        console.log(target);
        console.log(distance);
        console.log(v);
        debugger;
    }
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
            if (getDistance(actor, ally) < area * 32) addTimedEffect(ally, effect, 0);
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
    animation: Animation;
    scale: number;
    x: number;
    y: number;
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
    render(area: Area) {
        const frame = getFrame(this.animation, this.time);
        // Draw a red dot at the actual coordinates, can be useful for debugging rendering errors.
        // mainContext.fillStyle = 'red';
        // mainContext.fillRect(this.x - 1, this.y - 1, 2, 2);
        if (this.r || this.vr || this.flipped) {
            mainContext.save();
            const content = frame.content || {...frame, x: 0, y: 0};
            mainContext.translate(
                this.x | 0,
                this.y | 0
            );
            mainContext.rotate(this.r);
            mainContext.scale(this.scale * (this.flipped ? -1 : 1), this.scale);
            drawFrame(mainContext, frame, {
                x: (-content.x - content.w / 2) | 0,
                y: (-content.y - content.h / 2) | 0,
                w: frame.w,
                h: frame.h
            });
            mainContext.restore();
        } else {
            const content = frame.content || {...frame, x: 0, y: 0};
            drawFrame(mainContext, frame, {
                x: (this.x - content.x - content.w / 2) | 0,
                y: (this.y - content.y - content.h / 2) | 0, w: frame.w * this.scale, h: frame.h * this.scale});
        }
    }
}
