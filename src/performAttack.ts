import { getDistance, playAreaSound } from 'app/adventure';
import { pause } from 'app/adventureButtons';
import { getEndlessLevel } from 'app/areaMenu';
import { damageActor, healActor, setActorHealth } from 'app/actor';
import { map } from 'app/content/mapData';
import { makeMonster } from 'app/content/monsters';
import { projectileAnimations } from 'app/content/projectileAnimations';
import { attackHitSounds, attackSounds } from 'app/content/sounds';
import {
    addTimedEffect, explosionEffect, fieldEffect, getProjectileVelocity,
    novaEffect, projectile, songEffect,
} from 'app/effects';
import { MAX_Z, RANGE_UNIT } from 'app/gameConstants';
import { canUseReaction, getXDirection, useReaction } from 'app/useSkill';
import { toHex } from 'app/utils/colors';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';
import { ifdefor } from 'app/utils/index';
import Random from 'app/utils/Random';

import { Action, Actor, Area, AttackData, Character, Target, TextPopup } from 'app/types';

export function getBasicAttack(actor: Actor): Action {
    return findActionByTag(actor.actions, 'basic');
}
export function findActionByTag(actions: Action[], tag: string): Action {
    for (var action of actions) {
        if (action.variableObject.tags[tag]) {
            return action;
        }
    }
    return null;
}
export function updateDamageInfo(character: Character, statsPanelElement: HTMLElement, monsterLevel = 0) {
    const damageElement =  statsPanelElement.querySelector('.js-damage');
    if (!damageElement) {
        return;
    }
    const hero = character.hero;
    if (!hero || !hero.actions) return;
    let attack = getBasicAttack(hero);
    if (!attack) return;
    // Raw damage numbers.
    const damageMultiplier =  (1 - attack.stats.critChance) + (1 + attack.stats.critDamage) * attack.stats.critChance;
    const accuracyMultiplier = (1 - attack.stats.critChance) + (1 + attack.stats.critAccuracy) * attack.stats.critChance;
    let physical =  (attack.stats.minPhysicalDamage + attack.stats.maxPhysicalDamage) / 2;
    let magic = (attack.stats.minMagicDamage + attack.stats.maxMagicDamage) / 2;

    const attackSpeed = Math.min(1 / (attack.stats.cooldown || .001), attack.stats.attackSpeed);
    const rawPhysicalDPS = damageMultiplier * physical * attackSpeed;
    const rawMagicDPS = damageMultiplier * magic * attackSpeed;

    let sections = [];
    if (attack.stats.minPhysicalDamage) {
        sections.push('Physical damage ' + abbreviate(fixedDigits(attack.stats.minPhysicalDamage, 1)) + ' - ' + abbreviate(attack.stats.maxPhysicalDamage, 1));
    }
    if (attack.stats.minMagicDamage) {
        sections.push('Magic damage ' + abbreviate(fixedDigits(attack.stats.minMagicDamage, 1)) + ' - ' + abbreviate(attack.stats.maxMagicDamage,1));
    }
    if (attack.stats.cooldown) {
        sections.push('Can be used once every' + attack.stats.cooldown.toFixed(1) + ' seconds');
    } else {
        sections.push(attackSpeed.toFixed(2) + ' attacks per second.');
    }
    sections.push(attack.stats.accuracy.toFixed(1) + ' accuracy rating.');
    if (attack.stats.critChance) {
        sections.push('');
        sections.push(percent(attack.stats.critChance, 1) + ' chance to crit for:');
        if (attack.stats.minPhysicalDamage) {
            const minPhysicalDamage = attack.stats.minPhysicalDamage * (1 + attack.stats.critDamage);
            const maxPhysicalDamage = attack.stats.maxPhysicalDamage * (1 + attack.stats.critDamage);
            sections.push('Physical damage ' + abbreviate(fixedDigits(minPhysicalDamage, 1)) + ' - ' + abbreviate(fixedDigits(maxPhysicalDamage, 1)));
        }
        if (attack.stats.minMagicDamage) {
            const minMagicDamage = attack.stats.minMagicDamage * (1 + attack.stats.critDamage);
            const maxMagicDamage = attack.stats.maxMagicDamage * (1 + attack.stats.critDamage);
            sections.push('Magic damage ' + abbreviate(fixedDigits(minMagicDamage, 1)) + ' - ' + abbreviate(fixedDigits(maxMagicDamage, 1)));
        }
        sections.push((attack.stats.accuracy * (1 + attack.stats.critAccuracy)).toFixed(1) + ' accuracy');
    }
    sections.push('');
    if (rawPhysicalDPS && rawMagicDPS) {
        sections.push('Total Average DPS is ' +
            abbreviate(fixedDigits(rawPhysicalDPS + rawMagicDPS, 1)) +
            '(' + abbreviate(fixedDigits(rawPhysicalDPS, 1)) + ' physical + ' +
            abbreviate(fixedDigits(rawMagicDPS, 1)) + ' magic)');
    } else {
        sections.push('Total Average DPS is ' + abbreviate(fixedDigits(rawPhysicalDPS + rawMagicDPS, 1)));
    }

    // Expected damage against an 'average' monster of the hero.stats's level.
    const level = map[character.currentLevelKey];
    if (!monsterLevel) {
        if (!level) {
            monsterLevel = hero.stats.level;
        } else if (character.levelDifficulty === 'endless') {
            monsterLevel = getEndlessLevel(character, level);
        } else {
            monsterLevel = level.level || hero.stats.level;
        }
    }
    const dummy = makeMonster(hero.area, 'dummy', monsterLevel, [], 0);
    let hitPercent: number;
    // tie breaker is given to hitting, so for this calculation use 1 less evasion.
    let evasion = dummy.stats.evasion;
    let accuracy = accuracyMultiplier * attack.stats.accuracy;
    if (evasion > accuracy) {
        const overRollChance = (evasion - accuracy) / evasion;
        const chanceToEvade = overRollChance + (1 - overRollChance) / 2;
        hitPercent = (1 - chanceToEvade);
    } else {
        const overRollChance = (accuracy - evasion) / accuracy;
        hitPercent = overRollChance + (1 - overRollChance) / 2;
    }
    if (attack.stats.alwaysHits) {
        hitPercent = 1;
    }
    let expectedPhysical = Math.max(0, damageMultiplier * physical - dummy.stats.block / 2);
    expectedPhysical = applyArmorToDamage(expectedPhysical, dummy.stats.armor);
    let expectedMagic = Math.max(0, damageMultiplier * magic - dummy.stats.magicBlock / 2);
    expectedMagic = expectedMagic * Math.max(0, (1 - dummy.stats.magicResist));
    const expectedPhysicalDPS = expectedPhysical * hitPercent * attackSpeed;
    const expectedMagicDPS = expectedMagic * hitPercent * attackSpeed;

    sections.push('');
    sections.push('Expected hit rate is ' + percent(hitPercent, 1));
    if (attack.stats.minPhysicalDamage && attack.stats.minMagicDamage) {
        sections.push('Total Expected DPS is ' + abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1) +
            '(' + abbreviate(expectedPhysicalDPS, 1) + ' physical + ' +
            abbreviate(expectedMagicDPS, 1) + ' magic)');
    } else {
        sections.push('Total Expected DPS is ' + abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1));
    }
    damageElement.textContent = abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1);
    damageElement.parentElement.setAttribute('helpText', sections.join('<br/>'));

    attack = getBasicAttack(dummy);

    const protectionElement =  statsPanelElement.querySelector('.js-protection');
    physical = attack.stats.maxPhysicalDamage;
    let physicalAfterBlock;
    if (hero.stats.block <= physical) {
        physicalAfterBlock = physical - hero.stats.block / 2;
    } else {
        physicalAfterBlock = physical * (physical + 1) / 2 / (hero.stats.block + 1);
    }
    const blockProtection = 1 - physicalAfterBlock / attack.stats.maxPhysicalDamage;
    physical = applyArmorToDamage(attack.stats.maxPhysicalDamage, hero.stats.armor);
    const armorProtection = 1 - physical / attack.stats.maxPhysicalDamage;
    physical = applyArmorToDamage(physicalAfterBlock, hero.stats.armor);
    const physicalProtection = 1 - physical / attack.stats.maxPhysicalDamage;
    protectionElement.textContent = percent(physicalProtection, 1);
    sections = ['This is an estimate of your physical damage reduction.', '']
    sections.push(hero.stats.block + ' Block (' + percent(blockProtection, 1) + ')');
    sections.push(hero.stats.armor + ' Armor (' + percent(armorProtection, 1) + ')');
    sections.push('');
    sections.push(percent(physicalProtection, 1) + ' combined reduction');
    sections.push(attack.stats.maxPhysicalDamage.toFixed(1) + ' damage reduced to ' + physical.toFixed(1) );
    protectionElement.parentElement.setAttribute('helpText', sections.join('<br/>'));

    const resistanceElement =  statsPanelElement.querySelector('.js-resistance');
    magic = attack.stats.maxMagicDamage;
    if (hero.stats.magicBlock <= magic) {
        magic = magic - hero.stats.magicBlock / 2;
    } else {
        magic = (magic) * (magic + 1) / 2 / (hero.stats.magicBlock + 1);
    }
    var magicBlockResistance = 1 - magic / attack.stats.maxMagicDamage;
    magic = magic * Math.max(0, 1 - hero.stats.magicResist);
    var magicResistance = 1 - magic / attack.stats.maxMagicDamage;
    resistanceElement.textContent = percent(magicResistance, 1);
    sections = ['This is an estimate of your magic damage reduction.', ''];
    sections.push(percent(hero.stats.magicResist, 1) + ' Magic Resistance');
    sections.push(hero.stats.magicBlock + ' Magic Block (' + percent(magicBlockResistance, 1) + ')');
    sections.push('');
    sections.push(percent(magicResistance, 1) + ' combined reduction');
    sections.push(attack.stats.maxMagicDamage.toFixed(1) + ' damage reduced to ' + magic.toFixed(1));
    resistanceElement.parentElement.setAttribute('helpText', sections.join('<br/>'));


    // tie breaker is given to hitting, so for this calculation use 1 less evasion.
    evasion = hero.stats.evasion;
    accuracy = attack.stats.accuracy;
    if (evasion > accuracy) {
        const overRollChance = (evasion - accuracy) / evasion;
        const chanceToEvade = overRollChance + (1 - overRollChance) / 2;
        hitPercent = (1 - chanceToEvade);
    } else {
        const overRollChance = (accuracy - evasion) / accuracy;
        hitPercent = overRollChance + (1 - overRollChance) / 2;
    }
    const evasionElement =  statsPanelElement.querySelector('.js-evasion');
    evasionElement.textContent = percent(1 - hitPercent, 1);
    evasionElement.parentElement.setAttribute('helpText', hero.stats.evasion + ' Evasion<br/><br/>' + percent(1 - hitPercent, 1) + ' estimated chance to evade attacks.');
}

export function createAttackStats(attacker: Actor, attack: Action, target: Target): AttackData {
    let isCritical = Math.random() <= attack.stats.critChance;
    if (attack.stats.firstStrike && target && target.targetType === 'actor') {
        isCritical = isCritical || target.health >= target.stats.maxHealth;
    }
    const isSpell = attack.variableObject.tags.spell;
    const sacrificedHealth = Math.floor(attacker.health * (attack.stats.healthSacrifice || 0));
    let damage = isSpell
        ? 0
        : Random.range(attack.stats.minPhysicalDamage, attack.stats.maxPhysicalDamage) + sacrificedHealth;
    let magicDamage = isSpell
        ? attack.stats.power + sacrificedHealth
        : Random.range(attack.stats.minMagicDamage, attack.stats.maxMagicDamage);
    damage += sacrificedHealth;
    let accuracy = isSpell ? 0 : Math.random() * attack.stats.accuracy;
    if (isCritical) {
        damage *= (1 + attack.stats.critDamage);
        magicDamage *= (1 + attack.stats.critDamage);
        accuracy *= (1 + attack.stats.critAccuracy);
    }
    let animation = attack.base.animation;
    let sound = attack.base.sound;
    if (!sound && !isSpell) {
        const attackType = (attacker.equipment.weapon && attacker.equipment.weapon.base.type) || (attacker.type === 'hero' && 'unarmed');
        sound = attackSounds[attackType];
    }
    if (!animation && attacker.equipment.weapon) {
        const animationType = attacker.equipment.weapon.base.animation;
        if (!projectileAnimations[animationType]) {
            pause();
            throw new Error('Missing animation for ' + animationType);
        }
        sound = attackSounds[animationType] || sound;
        animation = projectileAnimations[animationType];
    }
    const gravity = ifdefor(attack.base.gravity,
        ifdefor(attacker.equipment.weapon && attacker.equipment.weapon.base.gravity, 0.3));
    return {
        distance: 0,
        animation,
        sound,
        size: attack.base.size || (animation ? animation.frames[0][2] : 10),
        gravity,
        speed: attack.base.speed || (attack.stats.range || 10),
        healthSacrificed: sacrificedHealth,
        source: attacker,
        attack,
        isCritical,
        damage,
        magicDamage,
        accuracy,
        explode: attack.stats.explode || 0,
        cleave: attack.stats.cleave || 0,
        piercing: attack.stats.criticalPiercing ? isCritical : false,
        strikes: attack.stats.doubleStrike ? 2 : 1
    };
}

function createSpellImprintedAttackStats(attacker: Actor, attack: Action, spell: Action, target: Actor): AttackData {
    var isCritical = Math.random() <= spell.stats.critChance;
    if (spell.stats.firstStrike && target && target.targetType === 'actor') {
        isCritical = isCritical || target.health >= target.stats.maxHealth;
    }
    var magicDamage = spell.stats.power;
    var sacrificedHealth = Math.floor(attacker.health * (spell.stats.healthSacrifice || 0));
    magicDamage += sacrificedHealth;
    var accuracy = Math.random() * attack.stats.accuracy;
    if (isCritical) {
        magicDamage *= (1 + spell.stats.critDamage);
        accuracy *= (1 + attack.stats.critAccuracy);
    }
    var animation = attack.base.animation;
    var sound = attack.base.sound;
    if (!animation && attacker.equipment.weapon) {
        const animationType = attacker.equipment.weapon.base.animation;
        if (!projectileAnimations[animationType]) {
            pause();
            throw new Error('Missing animation for ' + animationType);
        }
        sound = attackSounds[animationType] || sound;
        animation = projectileAnimations[animationType];
    }
    const gravity = ifdefor(attack.base.gravity,
        ifdefor(attacker.equipment.weapon && attacker.equipment.weapon.base.gravity, 0.3));
    return {
        distance: 0,
        animation,
        sound,
        size: attack.base.size || (animation ? animation.frames[0][2] : 10),
        gravity,
        speed: attack.base.speed || (attack.stats.range || 10),
        healthSacrificed: sacrificedHealth,
        source: attacker,
        attack,
        imprintedSpell: spell,
        isCritical,
        damage: 0,
        magicDamage,
        accuracy,
        explode: spell.stats.explode || 0,
        cleave: attack.stats.cleave || 0,
        piercing: attack.stats.criticalPiercing ? isCritical : false,
        strikes: attack.stats.doubleStrike ? 2 : 1
    };
}
export function performAttack(attacker: Actor, attack: Action, target: Actor) {
    let attackStats: AttackData;
    if (attack.variableObject.tags['basic'] && attacker.stats.imprintSpell && attacker.imprintedSpell) {
        attackStats = createSpellImprintedAttackStats(attacker, attack, attacker.imprintedSpell, target);
    } else {
        attackStats = createAttackStats(attacker, attack, target);
    }
    damageActor(attacker, attackStats.healthSacrificed);
    performAttackProper(attackStats, target);
    return attackStats;
}
export function castAttackSpell(attacker: Actor, spell: Action, target: Actor) {
    const attackStats = createAttackStats(attacker, spell, target);
    damageActor(attacker, attackStats.healthSacrificed);
    performAttackProper(attackStats, target);
    if (attacker.stats.imprintSpell) attacker.imprintedSpell = spell;
    return attackStats;
}
export function performAttackProper(attackStats: AttackData, target: Target) {
    const attacker = attackStats.source;
    const area = attacker.area;
    if (attackStats.sound) {
        playAreaSound(attackStats.sound, area);
    }
    // If the attack allows the user to teleport, teleport them to an optimal location for attacking.
    const teleport = (attackStats.attack.stats.teleport || 0) * RANGE_UNIT;
    if (teleport) {
        // It is easier for me to understand this code if I break it up into facing right and facing left cases.
        if (attacker.heading[0] > 0) {
            // Teleport to the location furthest from enemies that leaves the enemy within range to attack.
            attacker.x = Math.max(attacker.x - teleport, Math.min(attacker.x + teleport, target.x - attackStats.attack.stats.range * RANGE_UNIT - attacker.w / 2 - target.w / 2));
        } else {
            attacker.x = Math.min(attacker.x + teleport, Math.max(attacker.x - teleport, target.x + target.w / 2 + attacker.w / 2 + attackStats.attack.stats.range * RANGE_UNIT));
        }
    }
    if (attackStats.attack.variableObject.tags['song']) {
        const songSpellEffect = songEffect(attackStats)
        area.effects.push(songSpellEffect);
        attacker.boundEffects.push(songSpellEffect);
    } else if (attackStats.attack.variableObject.tags['field']) {
        const fieldSpellEffect = fieldEffect(attackStats, attacker);
        area.effects.push(fieldSpellEffect);
        attacker.boundEffects.push(fieldSpellEffect);
    } else if (attackStats.attack.variableObject.tags['nova']) {
        // attackStats.explode--;
        area.effects.push(novaEffect(attackStats, attacker.x, getAttackY(attacker), attacker.z));
    } else if (attackStats.attack.variableObject.tags['blast']) {
        // attackStats.explode--;
        area.effects.push(explosionEffect(attackStats, target.x, getAttackY(attacker), target.z));
    } else if (attackStats.attack.variableObject.tags['rain']) {
        // attackStats.explode--;
        let targets = [];
        const count = Math.floor(attackStats.attack.stats.count || 1);
        const maxFrameSpread = 250;
        for (let i = 0; i < count; i++) {
            const projectileAttackStats = {...attackStats};
            if (!targets.length) {
                targets = Random.shuffle(attacker.enemies);
            }
            const currentTarget = targets.pop();
            const x = attacker.x - 250 + Math.random() * 400 + 10 * i;
            const z = attacker.z - 90 + Math.random() * MAX_Z;
            const y = 550 + Math.random() * 100;
            // Point the meteor at the target and hope it hits!
            let vy = -y;
            let vx = currentTarget.x - x;
            let vz = currentTarget.z - z;
            // Normalize starting speed at 1 tile per frame.
            const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
            vy *= RANGE_UNIT / mag;
            vx *= RANGE_UNIT / mag;
            vz *= RANGE_UNIT / mag;
            area.projectiles.push(projectile(
                projectileAttackStats, x, y, z, vx, vy, vz,currentTarget, Math.min(i * maxFrameSpread / count, i * 10), // delay is in frames
                projectileAttackStats.isCritical ? 'yellow' : 'red', (projectileAttackStats.size || 20) * (projectileAttackStats.isCritical ? 1.5 : 1)));
        }
    } else if (attackStats.attack.variableObject.tags['ranged']) {
        const distance = getDistance(attacker, target);
        const x = attacker.x + getXDirection(attacker) * attacker.w / 4;
        const y = getAttackY(attacker);
        const z = attacker.z;
        const v = getProjectileVelocity(attackStats, x, y, z, target);
        area.projectiles.push(projectile(
            attackStats, x, y, z, v[0], v[1], v[2], target, 0,
            attackStats.isCritical ? 'yellow' : 'red', (attackStats.size || 10) * (attackStats.isCritical ? 1.5 : 1)
        ));
    } else {
        attackStats.distance = getDistance(attacker, target);
        // apply melee attacks immediately
        applyAttackToTarget(attackStats, target);
    }
}
export function getAttackY(target: Target): number {
    // This could actually be a location for abilities targeting locations. Just use 0, which is the height of the floor.
    if (target.targetType !== 'actor')  {
        return 0;
    }
    // Y value of projectiles can either be set on the source for the actor, or it will use half the content height.
    if (target.source.attackY !== null && target.source.attackY !== undefined) {
        return target.stats.scale * target.source.attackY;
    }
    const frame = target.frame;
    return target.stats.scale * (frame.content ? frame.content.h / 2 : frame.h / 2);
}
export function applyAttackToTarget(attackStats: AttackData, actorOrLocation: Target = null): boolean {
    const attack = attackStats.attack;
    const imprintedSpell = attackStats.imprintedSpell;
    const attacker = attackStats.source;
    const area = attacker.area;
    const effectiveness = (attackStats.effectiveness || 1);
    if (attackStats.strikes > 1) {
        attackStats.strikes--;
        applyAttackToTarget(attackStats, actorOrLocation);
    }

    if (attackStats.cleave > 0) {
        const cleaveAttackStats: AttackData = {
            ...attackStats,
            // Apply cleave damage by the coefficient.
            damage: attackStats.damage * attackStats.cleave,
            magicDamage: attackStats.magicDamage * attackStats.cleave,
            cleave: 0,
            distance: 0,
        };
        for (let i = 0; i < attackStats.source.enemies.length; i++) {
            const cleaveTarget = attackStats.source.enemies[i];
            if (cleaveTarget === actorOrLocation) {
                continue;
            }
            // ignore targets that got behind the attacker.
            if ((cleaveTarget.x - attacker.x) * attacker.heading[0] < 0) {
                continue;
            }
            const distance = getDistance(attacker, cleaveTarget);
            if (distance > (attack.stats.range + (attack.stats.cleaveRange || 0)) * RANGE_UNIT) continue;
            applyAttackToTarget(cleaveAttackStats, cleaveTarget);
        }
    }
    const makeExplosions = () => {
        if (attackStats.explode > 0) {
            const explodeAttackStats: AttackData = {
                ...attackStats,
                distance: 0,
                explode: attackStats.explode - 1,
            };
            let explosionX,explosionY,explosionZ;
            if (attackStats.projectile) {
                explosionX = attackStats.projectile.x;
                explosionY = attackStats.projectile.y;
                explosionZ = attackStats.projectile.z;
            } else if (actorOrLocation) {
                explosionX = actorOrLocation.x;
                explosionY = ifdefor(attackStats.y, getAttackY(actorOrLocation));
                explosionZ = actorOrLocation.z;
            } else {
                explosionX = attacker.x;
                explosionY = ifdefor(attackStats.y, getAttackY(attacker));
                explosionZ = attacker.z;
            }
            const explosion = explosionEffect(explodeAttackStats, explosionX, explosionY, explosionZ);
            if (attack.base.explosionSound) playAreaSound(attack.base.explosionSound, area);
            area.effects.push(explosion);
            // Meteor calls applyAttackToTarget with a null target so it can explode
            // anywhere. If that has happened, just return once the explosion has
            // been created.
            if (actorOrLocation.targetType === 'actor') explosion.hitTargets.push(actorOrLocation as Actor);
        }
    }
    // All the logic beyond this point does not apply to location targets.
    if (!actorOrLocation || actorOrLocation.targetType !== 'actor') {
        makeExplosions();
        return true;
    }
    const target: Actor = actorOrLocation as Actor;
    const distance = attackStats.distance;
    const hitText: TextPopup = {
        x: target.x, y: target.h + 10, z: target.z,
        color: 'grey', 'vx': -(Math.random() * 3 + 2) * target.heading[0], 'vy': 5
    };
    if (target.stats.invulnerable) {
        hitText.value = 'invulnerable';
        hitText.fontSize = 15;
        appendTextPopup(area, hitText);
        return false;
    }
    const multiplier = attack.stats.rangeDamage ? (1 + attack.stats.rangeDamage * distance / RANGE_UNIT) : 1;
    if (attackStats.isCritical) {
        hitText.fontSize = 30;
    }
    let damage = Math.floor(attackStats.damage * multiplier * effectiveness);
    let magicDamage = Math.floor(attackStats.magicDamage * multiplier * effectiveness);
    // Spell paradigm shift converts all magic damage to physical damage.
    if (attack.stats.magicToPhysical) {
        damage += magicDamage;
        magicDamage = 0;
    }
    if (attack.stats.heals) {
        hitText.color = 'green';
        hitText.value = abbreviate(damage + magicDamage);
        healActor(target, damage + magicDamage);
        const speed = 1 + Math.log(damage + magicDamage) / 10;
        hitText.vy *= speed;
        hitText.vx *= speed;
        appendTextPopup(area, hitText);
        return true;
    }
    attackStats.evaded = false;
    if (!attack.stats.alwaysHits) {
        const evasionRoll = (target.stats.maxEvasion ? 1 : Math.random()) * target.stats.evasion;
        // Projectiles have up to 50% reduced accuracy at a distance of 10 * RANGE_UNIT pixels.
        const effectiveAccuracy = attackStats.accuracy * Math.max(.5, 1 - (attackStats.distance || 0) / (20 * RANGE_UNIT));
        // if(attacker.character) console.log([attackStats.distance, attackStats.accuracy, effectiveAccuracy, evasionRoll]);
        if (effectiveAccuracy - evasionRoll < 0) {
            hitText.value = 'miss';
            if (attack.stats.damageOnMiss) {
                const damageOnMiss = Math.round(attack.stats.damageOnMiss * effectiveness);
                damageActor(target, damageOnMiss);
                hitText.value = 'miss (' + damageOnMiss + ')';
            }
            // Target has evaded the attack.
            hitText.fontSize = 15;
            appendTextPopup(area, hitText);
            attackStats.evaded = true;
        }
        // Chaining attack accuracy is reduced by the evasion roll of each target hit.
        // This is to keep attack from chaining forever.
        if (attack.stats.chaining) {
            attackStats.accuracy -= evasionRoll;
        }
    }
    // Apply block reduction
    const blockRoll = Math.round((target.stats.maxBlock ? 1 : Math.random()) * target.stats.block);
    const magicBlockRoll = Math.round((target.stats.maxMagicBlock ? 1 : Math.random()) * target.stats.magicBlock);
    damage = Math.max(0, damage - blockRoll);
    magicDamage = Math.max(0, magicDamage - magicBlockRoll);
    // Apply armor and magic resistance mitigation
    if (!attack.stats.ignoreArmor) {
        const effectiveArmor = target.stats.armor * (1 - (attack.stats.armorPenetration || 0));
        damage = Math.round(applyArmorToDamage(damage, effectiveArmor));
    }
    if (!attack.stats.ignoreResistance) {
        magicDamage = Math.round(magicDamage * Math.max(0, (1 - target.stats.magicResist)));
    }
    if (damage < 0 || magicDamage < 0) {
        debugger;
    }
    const totalDamage = damage + magicDamage;
    attackStats.totalDamage = totalDamage;
    attackStats.deflected = false;
    attackStats.dodged = false;
    attackStats.stopped = false;
    for (const reaction of (target.reactions || [])) {
        if (canUseReaction(target, reaction, attackStats)) {
            useReaction(target, reaction, attackStats)
            break;
        }
    }
    // Apply any on miss effects if the attack has missed.
    if (attackStats.evaded || (attackStats.dodged && !attack.stats.undodgeable)) {
        for (const effect of (attacker.onMissEffects || [])) {
            if (effect.stats.debuff) addTimedEffect(target, effect.stats.debuff, 0);
            if (effect.stats.buff) addTimedEffect(attacker, effect.stats.buff, 0);
        }
    }
    if (attackStats.deflected || attackStats.evaded || attackStats.stopped) {
        return false;
    }
    // Attacks that always hit can still be avoided by a 'dodge' skill.
    if (attackStats.dodged && !attack.stats.undodgeable) {
        hitText.value = 'dodged';
        hitText.fontSize = 15;
        appendTextPopup(area, hitText);
        return false;
    }

    if (target.targetType === 'actor' && attack.variableObject.tags['basic']) {
        const attackType = (attacker.equipment.weapon && attacker.equipment.weapon.base.type) || (attacker.type === 'hero' && 'unarmed');
        const hitSound = attackHitSounds[attackType];
        if (hitSound) playAreaSound(hitSound, area);
    }
    makeExplosions();
    healActor(attacker, (attack.stats.healthGainOnHit || 0) * effectiveness);
    target.slow += (attack.stats.slowOnHit || 0) * effectiveness;
    if (imprintedSpell) target.slow += (imprintedSpell.stats.slowOnHit || 0) * effectiveness;
    if (attack.stats.debuff) addTimedEffect(target, attack.stats.debuff, 0);
    if (imprintedSpell && imprintedSpell.stats.debuff) addTimedEffect(target, imprintedSpell.stats.debuff, 0);
    let effects = attacker.onHitEffects || [];
    if (attackStats.isCritical && attacker.onCritEffects) {
        effects = effects.concat(attacker.onCritEffects);
    }
    for (const effect of effects) {
        // Some abilities like corsairs venom add a stacking debuff to the target every hit.
        if (effect.stats.debuff) addTimedEffect(target, effect.stats.debuff, 0);
        // Some abilities like dancer's whirling dervish add a stacking buff to the attacker every hit.
        if (effect.stats.buff) addTimedEffect(attacker, effect.stats.buff, 0);
    }
    if (totalDamage > 0) {
        let percentPhysical = damage / totalDamage;
        let percentMagic = 1 - percentPhysical;
        const percentOffset = Math.max(0, Math.min(.9 - percentPhysical, .9 - percentMagic));
        percentPhysical += percentOffset;
        percentMagic += percentOffset;
        if (percentPhysical < 0 || percentPhysical > 1) debugger;
        if (percentMagic < 0 || percentMagic > 1) debugger;
        const critBonus = attackStats.isCritical ? 30 : 0;
        const r = toHex(Math.floor(220 * percentPhysical) + critBonus);
        const b = toHex(Math.floor(220 * percentMagic) + critBonus);
        const g = toHex(critBonus * 5);
        hitText.color = "#" + r + g + b;
        const cull = Math.max(attack.stats.cull || 0, (imprintedSpell && imprintedSpell.stats.cull) || 0);
        if (cull > 0 && target.health / target.stats.maxHealth <= cull) {
            setActorHealth(target, 0);
            hitText.value = 'culled!';
        } else {
            damageActor(target, totalDamage);
            hitText.value = abbreviate(totalDamage);
            const speed = 1 + Math.log(totalDamage) / 10;
            hitText.vy *= speed;
            hitText.vx *= speed;
        }
        healActor(attacker, (attack.stats.lifeSteal || 0) * totalDamage);
        if (imprintedSpell) healActor(attacker, (imprintedSpell.stats.lifeSteal || 0) * totalDamage);
        if (attack.stats.poison) {
            addTimedEffect(target, {'bonuses': {'+damageOverTime': totalDamage * attack.stats.poison}}, 0);
        }
        if (imprintedSpell && imprintedSpell.stats.poison) {
            addTimedEffect(target, {'bonuses': {'+damageOverTime': totalDamage * imprintedSpell.stats.poison}}, 0);
        }
        const stun = Math.max((attack.stats.stun || 0), imprintedSpell ? (imprintedSpell.stats.stun || 0) : 0);
        if (stun) {
            target.stunned = Math.max((target.stunned || 0), target.time + stun * effectiveness);
            hitText.value += ' stunned!';
        }
        // Some attacks pull the target towards the attacker
        const direction = (target.x < attacker.x) ? -1 : 1;
        if (Math.random() < (attack.stats.knockbackChance || 0)) {
            const targetX = target.x + direction * RANGE_UNIT * (attack.stats.knockbackDistance || 1);
            target.pull = {'x': targetX, z: target.z, time: target.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.stats.knockbackRotation, 45);
        }
        if (attack.stats.pullsTarget) {
            target.stunned =  Math.max((target.stunned || 0), target.time + .3 + distance / RANGE_UNIT * (attack.stats.dragStun || 0) * effectiveness);
            const targetX = (attacker.x > target.x) ? (attacker.x - target.w) : (attacker.x + attacker.w);
            const targetZ = (attacker.z > target.z) ? (attacker.z - target.w) : (attacker.z + attacker.w);
            target.pull = {sourceAttackStats: attackStats, x: targetX, z: targetZ, 'time': target.time + .3, 'damage': Math.floor(distance / RANGE_UNIT * damage * (attack.stats.dragDamage || 0) * effectiveness)};
            attacker.pull = {'x': attacker.x, z: attacker.z, 'time': attacker.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.stats.knockbackRotation, -45);
            hitText.value += ' hooked!';
        }
        if (attack.stats.domino) {
            target.dominoAttackStats = attackStats;
            const targetX = (attacker.x < target.x)
                ? (target.x + attacker.w + (attackStats.distance || 128) * effectiveness)
                : (target.x - (attackStats.distance || 128) * effectiveness);
            target.pull = {'x': targetX, z: target.z, 'time': target.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.stats.knockbackRotation, 45);
        }
    } else {
        hitText.value = 'blocked';
        hitText.fontSize = 15;
    }
    appendTextPopup(area, hitText);
    return true;
}

export function appendTextPopup(area: Area, hitText: TextPopup, important = false) {
    if (important || area.textPopups.length < 50) area.textPopups.push(hitText);
}

function applyArmorToDamage(damage: number, armor: number) {
    if (damage <= 0) {
        return 0;
    }
    //This equation looks a bit funny but is designed to have the following properties:
    //100% when armor = 0, 50% when armor = damage, 25% when armor = 2 * damage
    //1/(2^N) damage when armor is N times base damage
    return damage / Math.pow(2, armor / damage);
}
