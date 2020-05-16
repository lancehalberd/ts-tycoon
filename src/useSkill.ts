import _ from 'lodash';

import { healActor, initializeActorForAdventure, setActorHealth } from 'app/actor';
import { actorCanOverHeal, getDistance, playAreaSound, removeActor } from 'app/adventure';
import {
    addBonusSourceToObject, recomputeDirtyStats, removeBonusSourceFromObject, updateTags,
} from 'app/bonuses';
import {
    addActions, makeHeroFromJob, updateHero,
} from 'app/character';
import { abilities } from 'app/content/abilities';
import { effectAnimations } from 'app/content/effectAnimations';
import { enchantedMonsterBonuses, imbuedMonsterBonuses, makeMonster, updateMonster } from 'app/content/monsters';
import { addTimedEffect, animationEffect } from 'app/effects';
import { RANGE_UNIT } from 'app/gameConstants';
import {
    appendTextPopup, castAttackSpell, createAttackStats,
    performAttack, performAttackProper
} from 'app/performAttack';
import Random from 'app/utils/Random';

import { Action, Actor, AttackData, BonusSource, Monster, Target, TextPopup} from 'app/types';

/**
 * Checks whether an actor may use a skill on a given target.
 *
 * @param object actor       The actor performing the skill.
 * @param object skill       The skill being performed.
 * @param object target      The target to attack for active abilities.
 */
export function canUseSkillOnTarget(actor: Actor, skill: Action, target: Target): boolean {
    if (!actor) throw new Error('No actor was passed to canUseSkillOnTarget');
    if (!skill) throw new Error('No skill was passed to canUseSkillOnTarget');
    if (!target) throw new Error('No target was passed to canUseSkillOnTarget');
    if (skill.readyAt > actor.time) return false; // Skill is still on cool down.
    const skillTags = skill.variableObject.tags;
    if (skillTags.basic && actor.stats.healingAttacks) {
        return false;
    }
    for (let i = 0; i < (skill.base.restrictions || []).length; i++) {
        if (!actor.variableObject.tags[skill.base.restrictions[i]]) {
            return false;
        }
    }
    if (actor.stats.cannotAttack && skillTags.attack) {
        return false; // Jujutsu prevents a user from using active attacks.
    }
    // Make sure target matches the target type of the skill.
    if (target.targetType === 'actor' && !skillTags.field) {
        const actorTarget = target as Actor;
        if (!!skill.base.targetDeadUnits !== !!actorTarget.isDead) return false; // targetDeadUnits must match target.isDead.
        if (skill.base.target === 'self' && actor !== actorTarget) return false;
        if (skill.base.target === 'otherAllies' && (actor === target || actor.allies.indexOf(actorTarget) < 0)) return false;
        if (skill.base.target === 'allies' && actor.allies.indexOf(actorTarget) < 0) return false;
        if ((skill.base.target || 'enemies') === 'enemies' && actor.enemies.indexOf(actorTarget) < 0) return false;
        if ((skill.base.target || 'enemies') === 'enemies' && actorTarget.cloaked) return false;
    } else {
        if (skill.base.targetDeadUnits) return false;
    }
    const skillDefinition = actionDefinitions[skill.base.type];
    if (!skillDefinition) return false; // Invalid skill, maybe from a bad/old save file.
    return !skillDefinition.isValid || !!skillDefinition.isValid(actor, skill, target);
}

/**
 * Checks whether an actor may use a reaction in response to a given attack targeting them.
 *
 * @param object actor       The actor performing the skill.
 * @param object skill       The skill being performed.
 * @param object target      The target to attack for active abilities.
 */
export function canUseReaction(actor: Actor, reaction: Action, attackStats: AttackData): boolean {
    //console.log('Can use reaction', actor, reaction, attackStats);
    if (!actor) throw new Error('No actor was passed to canUseReaction');
    if (!reaction) throw new Error('No reaction was passed to canUseReaction');
    if (!attackStats) throw new Error('No attackStats was passed to canUseReaction');
    if (reaction.readyAt > actor.time) return false;
    const reactionDefinition = reactionDefinitions[reaction.base.type];
    if (!reactionDefinition) return false;
    for (const restriction of (reaction.base.restrictions || [])) {
        if (!actor.variableObject.tags.restriction) {
            return false;
        }
    }
    return !reactionDefinition.isValid || !!reactionDefinition.isValid(actor, reaction, attackStats);
}

/**
 * Checks whether a target is currently within range of a particular skill.
 *
 * @param object actor       The actor performing the skill.
 * @param object skill       The skill being performed.
 * @param object target      The target to attack for active abilities.
 */
export function isTargetInRangeOfSkill(actor: Actor, skill: Action, pointOrTarget: Target): boolean {
    if (skill.base.target === 'none') return true;
    const skillTags = skill.variableObject.tags;
    const isAOE = skill.stats.cleave || skillTags['nova'] || skillTags['field'] || skillTags['blast'] || skillTags['rain'];
    // Nova skills use area instead of range for checking for valid targets.
    if (skillTags['nova']) return getDistance(actor, pointOrTarget) < skill.stats.area * RANGE_UNIT / 2;
    if (skillTags['field']) return getDistance(actor, pointOrTarget) < skill.stats.area * RANGE_UNIT / 2;
    return getDistance(actor, pointOrTarget) <= (skill.stats.range + (skill.stats.teleport || 0)) * RANGE_UNIT;
}

export function isActorDying(actor: Actor): boolean {
    const percentHealth = actor.health / actor.stats.maxHealth;
    // It will take this many seconds for the target to reach 0 life if they lose life constantly.
    const secondsLeft = actor.stats.tenacity * percentHealth;
    // If their target health is low enough that after secondsLeft passes, they will not have
    // regenerated above zero health, then the target is dying.
    return actor.targetHealth < -actor.stats.healthRegen * secondsLeft;
}

/**
 * Checks if the AI thinks the actor should use a skill.
 *
 * The idea is that if the skill has a long cooldown, it won't be used unless it is
 * worthwhile, for example, healing and damage won't be wasted.
 *
 * This should only be called after confirming that canUseSkillOnTarget and isTargetInRangeOfSkill
 * are true.
 *
 * @param object actor       The actor performing the skill.
 * @param object skill       The skill being performed.
 * @param object target      The target to attack for active abilities.
 *
 * @return boolean True if the skill was used.
 */
export function shouldUseSkillOnTarget(actor: Actor, skill: Action, target: Actor): boolean {
    if (actor.type !== 'hero' && target.type === 'hero') {
        return true; // Enemies always use skills on the hero, since they win if the hero dies.
    }
    if ((skill.base.target || 'enemies') === 'enemies') {
        const percentHealth = target.health / target.stats.maxHealth;
        if (// If this ability targets an enemy, don't use it if the enemy is already going to die.
            isActorDying(target)
            // Unless the enemy has low enough health that they can be culled by this skill.
            && (skill.stats.cull || 0) < percentHealth
        ) {
            return false;
        }
    }
    // Make sure combined health of enemies in range is less than the raw damage of the attack, or that the ability
    // will result in life gain that makes it worth using
    if ((skill.base.target || 'enemies') === 'enemies'
        && (skill.stats.cooldown || 0) >= 10 // Don't worry about wasting skills with short cool downs.
    ) {
        let health = 0;
        const skillTags = skill.variableObject.tags;
        if (skill.stats.cleave || skillTags['nova'] || skillTags['field'] || skillTags['blast'] || skillTags['rain']) {
            const targetsInRange = getEnemiesLikelyToBeHitIfEnemyIsTargetedBySkill(actor, skill, target);
            if (targetsInRange.length === 0) {
                return false;
            }
            targetsInRange.forEach(function (target) {
                health += target.health;
            })
            // scale health by number of targets for aoe attacks.
            health *= targetsInRange.length;
        } else {
            health = target.health;
        }
        const previewAttackStats = createAttackStats(actor, skill, target);
        // Any life gained by this attack should be considered in the calculation as well in favor of using the attack.
        const possibleLifeGain = (previewAttackStats.damage + previewAttackStats.magicDamage) * (skill.stats.lifeSteal || 0);
        const actualLifeGain = actorCanOverHeal(actor) ? possibleLifeGain : Math.min(actor.stats.maxHealth - actor.health, possibleLifeGain);
        // Make sure the total health of the target/combined targets is at least
        // the damage output of the attack.
        // We weight wasted life gain very high to avoid using life stealing moves when the user has full life,
        // and then weight actual life gained even higher to encourage using life stealing moves that will restore a lot of health.
        if (health + 8 * actualLifeGain < (previewAttackStats.damage + previewAttackStats.magicDamage) + 5 * possibleLifeGain) {
            return false;
        }
    }
    // Some (but not all) skill definitions have specific criteria for using them or not (like heal checks that the full heal will be used or you might die soon).
    const skillDefinition = actionDefinitions[skill.base.type];
    if (skillDefinition.shouldUse && !skillDefinition.shouldUse(actor, skill, target)) return false;
    return true;
}

/**
 * Causes an actor to start performing a skill on the given target.
 *
 * This method actually performs the skill without any validation, so validation should
 * be checked before calling this code.
 *
 * The skill isn't actually used until the preparation time of the skill is finished,
 * and it can be interrupted if the user loses control before then.
 *
 * @param object actor       The actor performing the skill.
 * @param object skill       The skill being performed.
 * @param object target      The target to attack for active abilities.
 *
 * @return boolean True if the skill was used. Only false if the ability is probabilistic like raise dead.
 */
export function prepareToUseSkillOnTarget(actor: Actor, skill: Action, target: Target) {
    if (target.targetType === 'actor' && skill.base.consumeCorpse && target.isDead) {
        removeActor(target);
    }
    // Only use skill if they meet the RNG for using it. This is currently only used by the
    // 15% chance to raise dead on unit, which is why it comes after consuming the corpse.
    if (skill.stats.chance < Math.random()) {
        return;
    }
    if (skill.variableObject.tags['attack']) {
        // The wind up for an attack is at most .2s but is typically half the attack duration.
        // We don't make it longer than .2s because the wind up stops user movement and leaves the
        // attacker vulnerable to interrupt and because the attack animation looks bad slow during
        // the attack stage. Making the recovery stage be > .2s is fine because the user can still
        // move (slowly) and the recover animation doesn't look terrible slow.
        skill.totalPreparationTime = Math.min(.2, (1 / skill.stats.attackSpeed) / 2);
        // Whatever portion of the attack time isn't used by the prep time is designated as recoveryTime.
        actor.totalRecoveryTime = 1 / skill.stats.attackSpeed - skill.totalPreparationTime;
    } else {
        // As of writing this, no skill uses prepTime, but we could use it to make certain spells
        // take longer to cast than others.
        // prepTime and recoveryTime cannot be 0 as programmed.
        skill.totalPreparationTime = skill.stats.prepTime || .2;
        actor.totalRecoveryTime = skill.stats.recoveryTime || .1;
    }
    actor.skillInUse = skill;
    actor.skillTarget = target;
    // These values will count up until completion. If a character is slowed, it will reduce how quickly these numbers accrue.
    actor.preparationTime = actor.recoveryTime = 0;
    const skillDefinition = actionDefinitions[skill.base.type];
    if (skillDefinition.prepareToUseSkillOnTarget) {
        skillDefinition.prepareToUseSkillOnTarget(actor, skill, target);
    }
}

/**
 * Call to make an actor actually use the skill they have been preparing.
 *
 * @param object actor The actor performing the skill.
 *
 * @return boolean True if the skill was used. Only false if the ability is probabilistic like raise dead.
 */
export function useSkill(actor: Actor) {
    const skill = actor.skillInUse;
    const target = actor.skillTarget
    if (!skill || !target) {
        actor.skillInUse = actor.skillTarget = null;
        return;
    }
    skill.readyAt = actor.time + (skill.stats.cooldown || 0);
    // Show the name of the skill used if it isn't a basic attack. When skills have distinct
    // visible animations, we should probably remove this.
    if (skill.base.showName) {
        const hitText: TextPopup = {
            x: actor.x, y: actor.h, z: actor.z,
            color: 'white', fontSize: 15, 'vx': 0, 'vy': 1, 'gravity': .1,
            value: skill.base.name,
        };
        appendTextPopup(actor.area, hitText, true);
    }
    actionDefinitions[skill.base.type].use(actor, skill, target);
    triggerSkillEffects(actor, skill);
}

/**
 * Use a reaction in response to a given attack targeting an actor.
 *
 * This should only be called after canUseReaction returns true for the same arguments.
 *
 * @param object actor  The actor performing the skill.
 * @param object skill  The skill being performed.
 * @param object target The target to attack for active abilities.
 */
export function useReaction(actor: Actor, reaction: Action, attackStats: AttackData) {
    reaction.readyAt = actor.time + (reaction.stats.cooldown || 0);
    // Show the name of the skill. When skills have distinct visible animations, we should probably remove this.
    if (reaction.base.showName) {
        const skillPopupText: TextPopup = {
            x: actor.x, y: actor.h, z: actor.z,
            color: 'white', fontSize: 15, 'vx': 0, 'vy': 1, 'gravity': .1,
            value: reaction.base.name,
        };
        appendTextPopup(actor.area, skillPopupText, true);
    }
    reactionDefinitions[reaction.base.type].use(actor, reaction, attackStats);
    triggerSkillEffects(actor, reaction);
}

/**
 * Triggers effects that occur when a skill is used.
 *
 * This applies to both active skills and reactions and is used for things like:
 * Instant cooldown effects common on unique mobs that reset one skill when another is used.
 * Priest's heal/knockback on spell cast.
 *
 * @param object actor The actor performing the skill.
 * @param object skill The skill being performed.
 *
 * @return void
 */
function triggerSkillEffects(actor: Actor, skill: Action) {
    // Apply instant cooldown if it is set.
    if (skill.stats.instantCooldown) {
        for (const otherSkill of [...(actor.actions || []), ...(actor.reactions || [])]) {
            if (skill === otherSkill) continue;
            // * is wild card meaning all other skills
            if (skill.stats.instantCooldown === '*' ||
                otherSkill.variableObject.tags[skill.stats.instantCooldown]
            ) {
                otherSkill.readyAt = actor.time;
            }
        }
    }
    // Priest implicit knocks nearby enemies away when casting spells.
    if (skill.variableObject.tags.spell && actor.stats.castKnockBack) {
        for (var enemy of getActorsInRange(actor, actor.stats.castKnockBack, actor.enemies)) {
            banishTarget(actor, enemy, actor.stats.castKnockBack, 30);
        }
    }
    // Priest implicit heals caster when casting spells
    if (skill.variableObject.tags.spell && actor.stats.healOnCast) {
        healActor(actor, actor.stats.maxHealth * actor.stats.healOnCast);
    }
}

function getEnemiesLikelyToBeHitIfEnemyIsTargetedBySkill(actor: Actor, skill: Action, skillTarget: Actor): Actor[] {
    const targets: Actor[] = [];
    const skillTags = skill.variableObject.tags;
    // Rain targets everything on the field.
    if (skillTags['rain']) {
        return actor.enemies.slice();
    }
    for (let i = 0; i < actor.enemies.length; i++) {
        const target = actor.enemies[i];
        if (skillTags['nova'] || skillTags['field']) {
            if (getDistance(actor, target) < skill.stats.area * RANGE_UNIT) {
                targets.push(target);
                continue;
            }
        } else if (skill.stats.area) {
            if (getDistance(skillTarget, target) < skill.stats.area * RANGE_UNIT) {
                targets.push(target);
                continue;
            }
        }
    }
    return targets;
}
function getActorsInRange(source: Actor, range: number, targets: Actor[]): Actor[] {
    const targetsInRange = [];
    for (const target of targets) {
        if (target !== source && getDistance(source, target) < range * RANGE_UNIT) {
            targetsInRange.push(target);
        }
    }
    return targetsInRange;
}

function closestEnemyDistance(actor: Actor): number {
    let distance = 2000;
    for (const enemy of actor.enemies) {
        distance = Math.min(distance, getDistance(actor, enemy));
    }
    return distance;
}

interface ActionDefinition {
    // Whether the skill can be used at all for this target.
    isValid?: (actor: Actor, skill: Action, target: Target) => number | boolean,
    // Whether the ai should use this skill.
    shouldUse?: (actor: Actor, skill: Action, target: Target) => number | boolean,
    // Optional method for special logic on preparation
    prepareToUseSkillOnTarget?: (actor: Actor, skill: Action, target: Target) => void,
    // Actually use the skill, called after preparation finishes.
    use: (actor: Actor, skill: Action, target: Target) => void,
}
interface ReactionDefinition {
    // Whether the skill can be used at all for this target.
    isValid?: (actor: Actor, skill: Action, attackStats: AttackData) => number | boolean,
    // Whether the ai should use this skill.
    shouldUse?: (actor: Actor, skill: Action, attackStats: AttackData) => number | boolean,
    // Actually use the skill, called after preparation finishes.
    use: (actor: Actor, skill: Action, attackStats: AttackData) => void,
}
export const actionDefinitions: {
    [key: string]: ActionDefinition
} = {};
export const reactionDefinitions: {
    [key: string]: ReactionDefinition
} = {};

actionDefinitions.attack = {
    isValid: (actor, attackSkill, target) => target.targetType === 'actor',
    use: performAttack
};

actionDefinitions.spell = {
    isValid: (actor, spellSkill, target) => target.targetType === 'actor' || spellSkill.stats.area > 0,
    use: castAttackSpell
};

actionDefinitions.consume = {
    isValid: (actor, consumeSkill, target) => target.targetType === 'actor',
    use: function (actor, consumeSkill, target) {
        if (target.targetType !== 'actor') {
            return;
        }
        healActor(actor, target.stats.maxHealth * (consumeSkill.stats.consumeRatio || 1));
        stealAffixes(actor, target, consumeSkill);
    }
};
actionDefinitions.song = {
    shouldUse: function (actor, songSkill, target) {
        return closestEnemyDistance(actor) < 500;
    },
    use: function (actor, songSkill, target) {
        performAttackProper(createAttackStats(actor, songSkill, target), target);
    }
};
actionDefinitions.heroSong = {
    shouldUse: function (actor, songSkill, target) {
        if (target.targetType !== 'actor') {
            return false;
        }
        // Use ability if an ally is on low life.
        return target !== actor && (target.health / target.stats.maxHealth) < .3;
    },
    use: function (actor, songSkill, target) {
        performAttackProper(createAttackStats(actor, songSkill, target), target);
    }
};

reactionDefinitions.revive = {
    isValid: function (actor, reviveSkill, attackStats) {
        if (attackStats.evaded) return false;
        // Cast revive only when the incoming hit would kill the character.
        return actor.health - (attackStats.totalDamage || 0) <= 0;
    },
    use: function (actor, reviveSkill, attackStats) {
        attackStats.stopped = true;
        setActorHealth(actor, reviveSkill.stats.power);
        if (reviveSkill.stats.buff) {
            addTimedEffect(actor, reviveSkill.stats.buff, 0);
        }
    }
};

// Note that attackStats won't actually be passed in for this skill.
reactionDefinitions.stop = {
    isValid: function (actor, stopSkill, attackStats) {
        return (actor.health / actor.stats.maxHealth < .1) && (actor.temporalShield > 0);
    },
    use: function (actor, stopSkill, attackStats) {
        actor.area.timeStopEffect = {actor};
        if (actor.health <= 0) actor.health = 1;
        if (actor.targetHealth <= 0) actor.targetHealth = 1;
        actor.slow = 0;
    }
};

actionDefinitions.minion = {
    // Only use minion skills when there are enemies present.
    shouldUse: (actor, minionSkill, target) => !!actor.enemies.length,
    isValid: function (actor, minionSkill, target) {
        if (target.targetType !== 'actor' && minionSkill.base.consumeCorpse) {
            return false;
        }
        const actorTarget = target as Actor;
        var count = 0;
        // Cannot raise corpses of uncontrollable enemies as minions.
        if (minionSkill.base.consumeCorpse && (
                actorTarget.targetType !== 'actor' || actorTarget.stats.uncontrollable ||
                (actorTarget.type === 'monster' && actorTarget.base.stationary)
            )
        ) {
            return false;
        }
        actor.allies.forEach(function (ally) {
            if (ally.skillSource == minionSkill) count++;
        });
        return count < minionSkill.stats.limit;
    },
    use: function (actor, minionSkill, target) {
        let newMonster: Monster;
        if (minionSkill.base.consumeCorpse) {
            if (target.targetType !== 'actor' || target.type !== 'monster') {
                debugger;
                return;
            }
            newMonster = makeMonster(actor.area, {'key': target.base.key}, target.level, [], 0);
            newMonster.x = target.x;
            newMonster.y = target.y;
            newMonster.z = target.z;
        } else {
            newMonster = makeMonster(actor.area, {'key': minionSkill.base.monsterKey}, actor.level, [], 0);
            newMonster.x = actor.x + actor.heading[0] * (actor.w / 2 + 48);
            newMonster.y = actor.y + actor.heading[1] * (actor.w / 2 + 48);
            newMonster.z = actor.z + actor.heading[2] * (actor.w / 2 + 48);
        }
        newMonster.heading = actor.heading.slice();
        newMonster.skillSource = minionSkill;
        actor.minions.push(newMonster);
        newMonster.allies = actor.allies;
        newMonster.enemies = actor.enemies;
        newMonster.time = 0;
        addMinionBonuses(actor, minionSkill, newMonster);
        initializeActorForAdventure(newMonster);
        newMonster.owner = actor;
        newMonster.area = actor.area;
        actor.allies.push(newMonster);
    }
};

function cloneActor(actor: Actor, skill: Action): Actor {
    let clone;
    if (actor.type === 'hero') {
        clone = makeHeroFromJob(actor.job, actor.level, {});
        clone.colors = actor.colors;
        clone.equipment = actor.equipment;
        updateHero(clone);
        // Add bonuses from source character's abilities/jewel board.
        // Note that we don't give the clone the source character's actions.
        for (const ability of actor.abilities) {
            if (ability.bonuses) addBonusSourceToObject(clone, ability);
        }
        if (actor.character) addBonusSourceToObject(clone, actor.character.jewelBonuses);
    } else {
        clone = makeMonster(actor.area, {'key': actor.base.key}, actor.level, [], 0);
    }
    clone.x = actor.x + actor.heading[0] * RANGE_UNIT;
    clone.y = actor.y + actor.heading[1] * RANGE_UNIT;
    clone.z = actor.z + actor.heading[2] * RANGE_UNIT;
    clone.heading = actor.heading.slice();
    initializeActorForAdventure(clone);
    clone.area = actor.area;
    clone.allies = actor.allies;
    clone.enemies = actor.enemies;
    clone.stunned = 0;
    clone.slow = 0;
    clone.pull = null;
    clone.time = 0;
    clone.allEffects = [];
    addMinionBonuses(actor, skill, clone);
    return clone;
}
function addMinionBonuses(actor: Actor, skill: Action, minion: Actor) {
    const newTags = {};
    // Add skill tags to the clone's tags. This is how minion bonuses can target minion's
    // produced by specific skills like '*shadowClone:damage': .1
    for (let tag in minion.variableObject.tags) newTags[tag] = true;
    for (let tag in skill.variableObject.tags) {
        if (tag != 'melee' && tag != 'ranged') newTags[tag] = true;
    }
    updateTags(minion.variableObject, newTags, true);
    for (const minionBonusSource of actor.minionBonusSources) {
        addBonusSourceToObject(minion.variableObject, minionBonusSource, false);
    }
    addBonusSourceToObject(minion.variableObject, getMinionSpeedBonus(actor, minion), true);
}

function getMinionSpeedBonus(actor: Actor, minion: Actor): BonusSource {
    return {'bonuses': {'*speed': Math.max(.5, (actor.stats.speed + 40) /  minion.stats.speed)}};
}

reactionDefinitions.clone = {
    isValid: function (actor, cloneSkill, attackStats) {
        var numberOfClones = actor.allies.filter(ally => ally.skillSource === cloneSkill).length;
        return numberOfClones < cloneSkill.stats.limit && Math.random() < cloneSkill.stats.chance;
    },
    use: function (actor, cloneSkill, attackStats) {
        var clone = cloneActor(actor, cloneSkill);
        clone.skillSource = cloneSkill;
        clone.owner = actor;
        actor.minions.push(clone);
        clone.name = actor.name + ' shadow clone';
        setActorHealth(clone, actor.percentHealth * clone.stats.maxHealth);
        actor.allies.push(clone);
    }
};

reactionDefinitions.decoy = {
    isValid: function (actor, decoySkill, attackStats) {
        var numberOfDecoys = actor.allies.filter(ally => ally.skillSource === decoySkill).length;
        return numberOfDecoys < (decoySkill.stats.limit || 10);
    },
    use: function (actor, decoySkill, attackStats) {
        var clone = cloneActor(actor, decoySkill);
        clone.skillSource = decoySkill;
        clone.owner = actor;
        actor.minions.push(clone);
        clone.name = actor.name + ' decoy';
        addActions(clone, abilities.explode);
        actor.allies.push(clone);
        setActorHealth(clone, Math.max(1, clone.stats.maxHealth * actor.percentHealth));
    }
};

reactionDefinitions.explode = {
    isValid(actor, explodeSkill, attackStats) {
        if (attackStats.evaded) return false;
        // Cast only on death.
        return actor.health - (attackStats.totalDamage || 0) <= 0;
    },
    use(actor, explodeSkill, attackStats) {
        // Shoot a projectile at every enemy.
        for (let i = 0; i < actor.enemies.length; i++) {
            performAttackProper({
                distance: 0,
                gravity: explodeSkill.base.gravity || 0.8,
                speed: explodeSkill.base.speed || (explodeSkill.stats.range || 10) * 2.5,
                source: actor,
                attack: explodeSkill,
                isCritical: true,
                damage: 0,
                magicDamage: explodeSkill.stats.power,
                accuracy: 0,
            }, actor.enemies[i]);
        }
    }
};

actionDefinitions.heal = {
    isValid: (actor, healSkill, target) => target.targetType === 'actor',
    shouldUse: function (actor, healSkill, target) {
        if (target.targetType !== 'actor') {
            return false;
        }
        // Don't use a heal ability unless none of it will be wasted or the actor is below half life.
        return (actorCanOverHeal(target) && actor.enemies.length)
            || (target.health + healSkill.stats.power <= target.stats.maxHealth)
            || (target.health <= target.stats.maxHealth / 2);
    },
    use: function (actor, healSkill, target) {
        if (target.targetType !== 'actor') {
            debugger;
            return;
        }
        healActor(target, healSkill.stats.power);
        actor.area.effects.push(animationEffect(effectAnimations.heal, target, {scale: [2, 1]}));
        if (healSkill.stats.area > 0) {
            for (target of getActorsInRange(target, healSkill.stats.area, target.allies)) {
                healActor(target, healSkill.stats.power);
                actor.area.effects.push(animationEffect(effectAnimations.heal, target, {scale: [2, 1]}));
            }
        }
    }
};

actionDefinitions.effect = {
    isValid: function (actor, effectSkill, target) {
        // Effects with buff/debuff require a target.
        return target.targetType === 'actor' || (!effectSkill.stats.buff && !effectSkill.stats.debuff);
    },
    shouldUse: function (actor, effectSkill, target) {
        if (target.targetType === 'actor' && closestEnemyDistance(target) >= 500) {
            return false;
        }
        if (effectSkill.stats.allyBuff) {
            return actor.allies.length > 1;
        }
        // It would be nice to have some way to avoid using buffs too pre emptively here.
        // For example, only activate a buff if health <50% or an enemy is targeting you.
        return true;
    },
    use: function (actor, effectSkill, target) {
        if (target.targetType === 'actor') {
            if (effectSkill.stats.buff) {
                addTimedEffect(target, effectSkill.stats.buff);
            }
            if (effectSkill.stats.debuff) {
                addTimedEffect(target, effectSkill.stats.debuff);
            }
        }
        // Ranger's Sic 'em ability buffs all allies but not the actor.
        if (effectSkill.stats.allyBuff) {
            for (var i = 0; i < actor.allies.length; i++) {
                if (actor.allies[i] === actor) continue;
                addTimedEffect(actor.allies[i], effectSkill.stats.allyBuff, 0);
            }
        }
    }
};

reactionDefinitions.dodge = {
    isValid: function (actor, dodgeSkill, attackStats) {
        // side step can only dodge ranged attacked.
        if (dodgeSkill.base.rangedOnly && !attackStats.projectile) {
            return false;
        }
        return !attackStats.evaded;
    },
    use: function (actor, dodgeSkill, attackStats) {
        attackStats.dodged = true;
        if (dodgeSkill.stats.distance) {
            const minX = 0, maxX = actor.area.width - actor.w / 2;
            let targetX = actor.x + actor.heading[0] * dodgeSkill.stats.distance;
            // If the dodgeSkill distance is negative, it is designed to get away from the enemy.
            // However, if the actor is cornered, this isn't possible by jumping backwards,
            // so in this case, reverse the direction of the dodge skill.
            if (dodgeSkill.stats.distance < 0 && targetX < minX || targetX > maxX) {
                targetX = actor.x - actor.heading[0] * dodgeSkill.stats.distance;
            }
            // Constrain the landing position to the bounds of the area.
            targetX = Math.min(maxX, Math.max(minX, targetX));
            actor.pull = {'x': targetX,
                        'z': actor.z + actor.heading[2] * dodgeSkill.stats.distance,
                        'y': dodgeSkill.base.jump ? Math.min(100, Math.max(20, Math.abs(dodgeSkill.stats.distance / 2))) : 0,
                        'time': actor.time + (dodgeSkill.stats.moveDuration || .3), 'damage': 0};
        }
        if (dodgeSkill.stats.buff) {
            addTimedEffect(actor, dodgeSkill.stats.buff, 0);
        }
        if (dodgeSkill.stats.globalDebuff) {
            actor.enemies.forEach(function (enemy) {
                addTimedEffect(enemy, dodgeSkill.stats.globalDebuff, 0);
            });
        }
    }
};

reactionDefinitions.sideStep = {
    isValid: function (actor, dodgeSkill, attackStats) {
        // side step can only dodge ranged attacked.
        if (dodgeSkill.base.rangedOnly && !attackStats.projectile ) {
            return false;
        }
        // Cannot side step if attacker is on top of you.
        if (getDistance(actor, attackStats.source) <= 0) {
            return false;
        }
        return !attackStats.evaded;
    },
    use: function (actor, dodgeSkill, attackStats) {
        attackStats.dodged = true;
        if (dodgeSkill.stats.distance) {
            var attacker = attackStats.source;
            actor.pull = {'time': actor.time + (dodgeSkill.stats.moveDuration || 0.3), 'damage': 0};
            if (attacker.x > actor.x) {
                actor.pull.x = Math.min(actor.x + actor.heading[0] * dodgeSkill.stats.distance, attacker.x - (attacker.w + actor.w) / 2);
            } else {
                actor.pull.x = Math.max(actor.x + actor.heading[0] * dodgeSkill.stats.distance, attacker.x + (attacker.w + actor.w) / 2);
            }
            if (attacker.z > actor.z) {
                actor.pull.z = Math.min(actor.z + actor.heading[2] * dodgeSkill.stats.distance, attacker.z - (attacker.d + actor.d) / 2);
            } else {
                actor.pull.z = Math.max(actor.z + actor.heading[2] * dodgeSkill.stats.distance, attacker.z + (attacker.d + actor.d) / 2);
            }
        }
        if (dodgeSkill.stats.buff) {
            addTimedEffect(actor, dodgeSkill.stats.buff, 0);
        }
        if (dodgeSkill.stats.globalDebuff) {
            actor.enemies.forEach(function (enemy) {
                addTimedEffect(enemy, dodgeSkill.stats.globalDebuff, 0);
            });
        }
    }
};
// Counters with the skill if the player would receive more than half their remaining health in damage
reactionDefinitions.criticalCounter = {
    isValid: function (actor, counterSkill, attackStats) {
        if (attackStats.evaded) return false;
        // Cast stop only when the incoming hit would deal more than half of the
        // character's remaining health in damage.
        return attackStats.totalDamage >= actor.health / 2;
    },
    use: function (actor, counterSkill, attackStats) {
        if (counterSkill.stats.dodgeAttack) attackStats.dodged = true;
        if (counterSkill.stats.stopAttack) attackStats.stopped = true;
        if (counterSkill.stats.distance) {
            actor.pull = {'x': actor.x + actor.heading[0] * (counterSkill.stats.distance || RANGE_UNIT * 2),
                        'z': actor.z + actor.heading[2] * (counterSkill.stats.distance || RANGE_UNIT * 2),
                        'time': actor.time + (counterSkill.stats.moveDuration || .3), 'damage': 0};
        }
        if (counterSkill.stats.buff) {
            addTimedEffect(actor, counterSkill.stats.buff, 0);
        }
        if (counterSkill.stats.globalDebuff) {
            actor.enemies.forEach(function (enemy) {
                addTimedEffect(enemy, counterSkill.stats.globalDebuff, 0);
            });
        }
    }
};

reactionDefinitions.counterAttack = {
    isValid: function (actor, counterAttackSkill, attackStats) {
        if (attackStats.evaded) {
            //console.log("Attack was evaded.");
            return false;
        }
        var distance = getDistance(actor, attackStats.source);
        // Can only counter attack if the target is in range, and
        if (distance > counterAttackSkill.stats.range * RANGE_UNIT + 4) { // Give the range a tiny bit of lee way
            //console.log("Attacker is too far away: " + [distance, counterAttackSkill.stats.range]);
            return false;
        }
        // The chance to counter attack is reduced by a factor of the distance.
        if (Math.random() > Math.min(1, 4 * RANGE_UNIT / (distance + 2 * RANGE_UNIT))) {
            //console.log("Failed distance roll against: " + [distance, Math.min(1, 128 / (distance + 64))]);
            return false;
        }
        return true;
    },
    use: function (actor, counterAttackSkill, attackStats) {
        if (counterAttackSkill.stats.dodge) {
            attackStats.dodged = true;
        }
        performAttack(actor, counterAttackSkill, attackStats.source);
    }
};
reactionDefinitions.deflect = {
    isValid: function (actor, deflectSkill, attackStats) {
        if (attackStats.evaded) return false;
        // Only non-spell, projectile attacks can be deflected.
        return attackStats.projectile && !attackStats.attack.variableObject.tags['spell'];
    },
    use: function (actor, deflectSkill, attackStats) {
        var projectile = attackStats.projectile;
        // mark the projectile as having not hit so it can hit again now that it
        // has been deflected.
        projectile.hit = false;
        projectile.target = attackStats.source;
        attackStats.source = actor;
        // Make the deflected projectiles extra accurate so they have greater impact
        attackStats.accuracy += deflectSkill.stats.accuracy;
        attackStats.damage *= deflectSkill.stats.damageRatio;
        attackStats.magicDamage *= deflectSkill.stats.damageRatio;
        projectile.vx = -projectile.vx;
        projectile.vy = -getDistance(actor, projectile.target) / 200;
        // This prevents the attack in progress from hitting the deflector.
        attackStats.deflected = true;
        playAreaSound('reflect', actor.area);
    }
};
reactionDefinitions.evadeAndCounter = {
    isValid: function (actor, evadeAndCounterSkill, attackStats) {
        if (!attackStats.evaded) return false;
        // Can only counter attack if the target is in range, and the chance to
        // counter attack is reduced by a factor of the distance.
        return getDistance(actor, attackStats.source) <= evadeAndCounterSkill.stats.range * RANGE_UNIT;
    },
    use: function (actor, evadeAndCounterSkill, attackStats) {
        performAttack(actor, evadeAndCounterSkill, attackStats.source);
    }
};

reactionDefinitions.mimic = {
    isValid: function (actor, counterAttackSkill, attackStats) {
        // Only non basic attacks can be mimicked.
        return !attackStats.attack.variableObject.tags['basic'];
    },
    use: function (actor, counterAttackSkill, attackStats) {
        performAttack(actor, attackStats.attack, attackStats.source);
    }
};

actionDefinitions.reflect = {
    isValid: function (actor, reflectSkill, target) {
        return target.targetType === 'actor' && (target.reflectBarrier || 0) < target.stats.maxHealth;
    },
    shouldUse: function (actor, reflectSkill, target) {
        if (target.targetType !== 'actor') {
            return false;
        }
        // Only use reflection if it is at least 60% effective
        var currentBarrier = Math.max(0, target.reflectBarrier || 0);
        var maxPossibleGain = Math.min(reflectSkill.stats.power, target.stats.maxHealth);
        var actualGain = Math.min(reflectSkill.stats.power, target.stats.maxHealth - currentBarrier);
        return actualGain / maxPossibleGain >= .6;
    },
    use: function (actor, reflectSkill, target) {
        if (target.targetType !== 'actor') {
            return;
        }
        // Reset reflection barrier back to 0 when using the reflection barrier spell.
        // It may be negative from when it was broken.
        target.reflectBarrier = Math.max(0, target.reflectBarrier || 0);
        gainReflectionBarrier(target, reflectSkill.stats.power);
    }
};

export function gainReflectionBarrier(actor: Actor, amount: number) {
    actor.maxReflectBarrier = actor.stats.maxHealth;
    actor.reflectBarrier = Math.min(actor.maxReflectBarrier, (actor.reflectBarrier || 0) + amount);
}

actionDefinitions.plunder = {
    isValid: function (actor, plunderSkill, target) {
        if (target.targetType !== 'actor') {
            return false;
        }
        return (target.prefixes || []).length + (target.suffixes || []).length;
    },
    use: function (actor, plunderSkill, target) {
        if (target.targetType !== 'actor') {
            return;
        }
        stealAffixes(actor, target, plunderSkill);
    }
};
function stealAffixes(actor: Actor, target: Actor, skill: any) {
    if (!skill.count) {
        return;
    }
    let allAffixes = target.prefixes.concat(target.suffixes);
    if (!allAffixes.length) return;
    const originalBonus = (allAffixes.length > 2) ? imbuedMonsterBonuses : enchantedMonsterBonuses;
    for (let i = 0; i < skill.count && allAffixes.length; i++) {
        const affix = Random.element(allAffixes);
        if (target.prefixes.indexOf(affix) >= 0) target.prefixes.splice(target.prefixes.indexOf(affix), 1);
        if (target.suffixes.indexOf(affix) >= 0) target.suffixes.splice(target.suffixes.indexOf(affix), 1);
        const effect = {
            'bonuses': affix.bonuses,
            stats: { duration: skill.duration },
        };
        addTimedEffect(actor, effect, 0);
        allAffixes = target.prefixes.concat(target.suffixes);
        removeBonusSourceFromObject(target.variableObject, affix);
    }
    if (allAffixes.length >= 2) {
        // Do nothing, monster is still imbued
    } else if (allAffixes.length > 0 && originalBonus !== enchantedMonsterBonuses) {
        removeBonusSourceFromObject(target.variableObject, originalBonus);
        addBonusSourceToObject(target.variableObject, enchantedMonsterBonuses);
    } else if (allAffixes.length === 0) {
        removeBonusSourceFromObject(target.variableObject, originalBonus);
    }
    recomputeDirtyStats(target.variableObject);
}

actionDefinitions.banish = {
    isValid: (actor, banishSkill, target) => target.targetType === 'actor',
    use: function (actor, banishSkill, target) {
        if (target.targetType !== 'actor') {
            return;
        }
        const attackStats = performAttack(actor, banishSkill, target);
        // The purify upgrade removes all enchantments from a target.
        if (banishSkill.stats.purify && target.type === 'monster' && target.prefixes.length + target.suffixes.length > 0) {
            target.prefixes = [];
            target.suffixes = [];
            updateMonster(target);
        }
        actor.enemies.forEach(function (enemy) {
            if (enemy === target) {
                return;
            }
            var distance = getDistance(actor, enemy);
            if (distance < RANGE_UNIT * banishSkill.stats.distance) {
                banishTarget(actor, enemy, banishSkill.stats.distance, (banishSkill.stats.knockbackRotation || 30));
                // The shockwave upgrade applies the same damage to the targets hit by the shockwave.
                if (banishSkill.stats.shockwave) {
                    enemy.pull.attackStats = attackStats;
                }
                if (banishSkill.stats.otherDebuff) {
                    addTimedEffect(enemy, banishSkill.stats.otherDebuff, 0);
                }
            }
        });
    }
};
function banishTarget(actor: Actor, target: Actor, range: number, rotation: number) {
    // Adding the delay here creates a shockwave effect where the enemies
    // all get pushed from a certain point at the same time, rather than
    // them all immediately moving towards the point initially.
    const dx = target.x - actor.x;
    const dz = target.z - actor.z;
    const mag = Math.sqrt(dx * dx + dz * dz);
    target.pull = {
        'x': actor.x + actor.w / 2 + RANGE_UNIT * range * dx / mag,
        'z': actor.z + actor.w / 2 + RANGE_UNIT * range * dz / mag,
        'delay': target.time + getDistance(actor, target) * .02 / RANGE_UNIT,
        'time': target.time + range * .02, 'damage': 0
    };
    target.rotation = getXDirection(actor) * rotation;
}

export function getXDirection(actor: Actor) {
    return (actor.heading[0] > 0) ? 1 : -1;
}

actionDefinitions.charm = {
    isValid: function (actor, charmSkill, target) {
        if (target.targetType !== 'actor') {
            return false;
        }
        return !(target.stats.uncontrollable || (target.type === 'monster' && target.base.stationary));
    },
    use: function (actor, charmSkill, target) {
        if (target.targetType !== 'actor') {
            return;
        }
        target.allies = actor.allies;
        target.enemies = actor.enemies;
        addBonusSourceToObject(target.variableObject, getMinionSpeedBonus(actor, target), true);
        actor.enemies.splice(actor.enemies.indexOf(target), 1);
        actor.allies.push(target);
        target.heading = actor.heading.slice();
    }
};
actionDefinitions.charge = {
    shouldUse: function (actor, chargeSkill, target) {
        return getDistance(actor, target) >= 4 * RANGE_UNIT;
    },
    use: function (actor, chargeSkill, target) {
        actor.chargeEffect = {
            chargeSkill,
            'distance': 0,
            target,
        };
    }
};
reactionDefinitions.recover = {
    // The recover skill is used whenever an actor reaches a certain health threshold for the first, time, for example 75%, then 50%, then 25%.
    // Since the threshold is stored on the actor, currently only one recover skill per actor is supported.
    isValid: (actor, recoverSkill, attackStats) => {
        var healthThreshold = (actor.recoverSkillHealthThreshold || actor.stats.maxHealth) - actor.stats.maxHealth / (recoverSkill.stats.uses + 1);
        return actor.health < healthThreshold;
    },
    use: (actor, recoverSkill, attackStats) => {
        // Set the health threshold one step lower.
        actor.recoverSkillHealthThreshold = (actor.recoverSkillHealthThreshold || actor.stats.maxHealth) - actor.stats.maxHealth / (recoverSkill.stats.uses + 1);
        // Recover stops the actor from losing further health, but doesn't actually restore them above their current health.
        // It also comes built in with universal instant cooldown of abilities, which is handled in `triggerSkillEffects`.
        actor.targetHealth = actor.health;
        actor.stats.damageOverTime = 0;
        actor.slow = 0;
    }
};
actionDefinitions.leap = {
    // Leap is basically a decorator for another action, and will only be used if that action can be used.
    isValid: (actor, leapSkill, target) => {
        const followupAction: Action = _.find(actor.actions, {source: {key: leapSkill.stats.action}});
        if (followupAction.readyAt > actor.time) return false; // Skill is still on cool down.
        if (!followupAction) {
            console.log(`Missing action ${leapSkill.stats.action}`);
            debugger;
        }
        // Use the skill directly if the target is already in range.
        if (isTargetInRangeOfSkill(actor, followupAction, target)) return false;
        const skillDefinition = actionDefinitions[followupAction.source.key];
        if (!skillDefinition.isValid) return true;
        return skillDefinition.isValid(actor, followupAction, target);
    },
    shouldUse: (actor, leapSkill, target) => {
        const followupAction: Action = _.find(actor.actions, {source: {key: leapSkill.stats.action}});
        const skillDefinition = actionDefinitions[followupAction.source.key];
        if (!skillDefinition.shouldUse) return true;
        return skillDefinition.shouldUse(actor, followupAction, target);
    },
    use: (actor, leapSkill, target) => {
        const combinedRadius = (target.w + actor.w) / 2;
        const distance = getDistance(actor, target);
        actor.pull = {
            x: (target.x < actor.x) ? target.x + combinedRadius : target.x - combinedRadius,
            z: (target.z < actor.z) ? target.z + combinedRadius : target.z - combinedRadius,
            y: Math.min(100, Math.max(20, distance / 2)),
            time: actor.time + .3, damage: 0,
            action: _.find(actor.actions, {base: {key: leapSkill.stats.action}}),
            target: target,
        };
    }
};
