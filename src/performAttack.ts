import { getDistance } from 'app/adventure';
import { pause } from 'app/adventureButtons';
import { getEndlessLevel } from 'app/areaMenu';
import { damageActor, healActor, setActorHealth } from 'app/character';
import { map } from 'app/content/mapData';
import { makeMonster } from 'app/content/monsters';
import { projectileAnimations } from 'app/content/projectileAnimations';
import {
    addTimedEffect, explosionEffect, fieldEffect, getProjectileVelocity,
    novaEffect, projectile, songEffect,
} from 'app/effects';
import { MAX_Z } from 'app/gameConstants';
import { canUseReaction, getXDirection, useReaction } from 'app/useSkill';
import { toHex } from 'app/utils/colors';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';
import { ifdefor } from 'app/utils/index';
import Random from 'app/utils/Random';
import { attackHitSounds, attackSounds, playSound } from 'app/utils/sounds';

export function getBasicAttack(adventurer) {
    return findActionByTag(adventurer.actions, 'basic');
}
export function findActionByTag(actions, tag) {
    for (var action of actions) {
        if (action.tags[tag]) {
            return action;
        }
    }
    return null;
}
export function updateDamageInfo(character, statsPanelElement: HTMLElement, monsterLevel = 0) {
    var adventurer = character.adventurer;
    if (!adventurer || !adventurer.actions) return;
    var attack = getBasicAttack(adventurer);
    if (!attack) return;
    // Raw damage numbers.
    var damageMultiplier =  (1 - attack.critChance) + (1 + attack.critDamage) * attack.critChance;
    var accuracyMultiplier = (1 - attack.critChance) + (1 + attack.critAccuracy) * attack.critChance;
    var physical =  (attack.minPhysicalDamage + attack.maxPhysicalDamage) / 2, physicalAfterblock;
    let magic = (attack.minMagicDamage + attack.maxMagicDamage) / 2;

    var attackSpeed = Math.min(1 / (attack.cooldown || .001), attack.attackSpeed);
    var rawPhysicalDPS = damageMultiplier * physical * attackSpeed;
    var rawMagicDPS = damageMultiplier * magic * attackSpeed;

    var sections = [];
    if (attack.minPhysicalDamage) {
        sections.push('Physical damage ' + abbreviate(fixedDigits(attack.minPhysicalDamage, 1)) + ' - ' + attack.maxPhysicalDamage.format(1).abbreviate());
    }
    if (attack.minMagicDamage) {
        sections.push('Magic damage ' + abbreviate(fixedDigits(attack.minMagicDamage, 1)) + ' - ' + attack.maxMagicDamage.format(1).abbreviate());
    }
    if (attack.cooldown) {
        sections.push('Can be used once every' + attack.cooldown.toFixed(1) + ' seconds');
    } else {
        sections.push(attackSpeed.toFixed(2) + ' attacks per second.');
    }
    sections.push(attack.accuracy.toFixed(1) + ' accuracy rating.');
    if (attack.critChance) {
        sections.push('');
        sections.push(percent(attack.critChance, 1) + ' chance to crit for:');
        if (attack.minPhysicalDamage) {
            const minPhysicalDamage = attack.minPhysicalDamage * (1 + attack.critDamage);
            const maxPhysicalDamage = attack.maxPhysicalDamage * (1 + attack.critDamage);
            sections.push('Physical damage ' + abbreviate(fixedDigits(minPhysicalDamage, 1)) + ' - ' + abbreviate(fixedDigits(maxPhysicalDamage, 1)));
        }
        if (attack.minMagicDamage) {
            const minMagicDamage = attack.minMagicDamage * (1 + attack.critDamage);
            const maxMagicDamage = attack.maxMagicDamage * (1 + attack.critDamage);
            sections.push('Magic damage ' + abbreviate(fixedDigits(minMagicDamage, 1)) + ' - ' + abbreviate(fixedDigits(maxMagicDamage, 1)));
        }
        sections.push((attack.accuracy * (1 + attack.critAccuracy)).toFixed(1) + ' accuracy');
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

    // Expected damage against an 'average' monster of the adventurer's level.
    var level = map[character.currentLevelKey];
    if (!monsterLevel) {
        if (level) {
            if (character.currentLevelKey === 'guild') {
                monsterLevel = 1;
            } else if (character.levelDifficulty === 'endless') {
                monsterLevel = getEndlessLevel(character, level);
            } else {
                monsterLevel = level ? level.level : adventurer.level;
            }
        }
    }
    var dummy = makeMonster('dummy', monsterLevel, [], 0);
    var hitPercent;
    // tie breaker is given to hitting, so for this calculation use 1 less evasion.
    var evasion = dummy.evasion;
    var accuracy = accuracyMultiplier * attack.accuracy;
    if (evasion > accuracy) {
        var overRollChance = (evasion - accuracy) / evasion;
        var chanceToEvade = overRollChance + (1 - overRollChance) / 2;
        hitPercent = (1 - chanceToEvade);
    } else {
        var overRollChance = (accuracy - evasion) / accuracy;
        hitPercent = overRollChance + (1 - overRollChance) / 2;
    }
    if (attack.alwaysHits) {
        hitPercent = 1;
    }
    var expectedPhysical = Math.max(0, damageMultiplier * physical - dummy.block / 2);
    expectedPhysical = applyArmorToDamage(expectedPhysical, dummy.armor);
    var expectedMagic = Math.max(0, damageMultiplier * magic - dummy.magicBlock / 2);
    expectedMagic = expectedMagic * Math.max(0, (1 - dummy.magicResist));
    var expectedPhysicalDPS = expectedPhysical * hitPercent * attackSpeed;
    var expectedMagicDPS = expectedMagic * hitPercent * attackSpeed;

    sections.push('');
    sections.push('Expected hit rate is ' + hitPercent.percent(1));
    if (attack.minPhysicalDamage && attack.minMagicDamage) {
        sections.push('Total Expected DPS is ' + abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1) +
            '(' + abbreviate(expectedPhysicalDPS, 1) + ' physical + ' +
            abbreviate(expectedMagicDPS, 1) + ' magic)');
    } else {
        sections.push('Total Expected DPS is ' + abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1));
    }
    const damageElement =  statsPanelElement.querySelector('.js-damage');
    damageElement.textContent = abbreviate(expectedPhysicalDPS + expectedMagicDPS, 1);
    damageElement.parentElement.setAttribute('helptext', sections.join('<br/>'));

    attack = getBasicAttack(dummy);

    const protectionElement =  statsPanelElement.querySelector('.js-protection');
    physical = attack.maxPhysicalDamage;
    let physicalAfterBlock;
    if (adventurer.block <= physical) {
        physicalAfterBlock = physical - adventurer.block / 2;
    } else {
        physicalAfterBlock = physical * (physical + 1) / 2 / (adventurer.block + 1);
    }
    const blockProtection = 1 - physicalAfterBlock / attack.maxPhysicalDamage;
    physical = applyArmorToDamage(attack.maxPhysicalDamage, adventurer.armor);
    const armorProtection = 1 - physical / attack.maxPhysicalDamage;
    physical = applyArmorToDamage(physicalAfterBlock, adventurer.armor);
    const physicalProtection = 1 - physical / attack.maxPhysicalDamage;
    protectionElement.textContent = percent(physicalProtection, 1);
    sections = ['This is an estimate of your physical damage reduction.', '']
    sections.push(adventurer.block + ' Block (' + percent(blockProtection, 1) + ')');
    sections.push(adventurer.armor + ' Armor (' + percent(armorProtection, 1) + ')');
    sections.push('');
    sections.push(percent(physicalProtection, 1) + ' combined reduction');
    sections.push(attack.maxPhysicalDamage.toFixed(1) + ' damage reduced to ' + physical.toFixed(1) );
    protectionElement.parentElement.setAttribute('helptext', sections.join('<br/>'));

    const resistanceElement =  statsPanelElement.querySelector('.js-resistance');
    magic = attack.maxMagicDamage;
    if (adventurer.magicBlock <= magic) {
        magic = magic - adventurer.magicBlock / 2;
    } else {
        magic = (magic) * (magic + 1) / 2 / (adventurer.magicBlock + 1);
    }
    var magicBlockResistance = 1 - magic / attack.maxMagicDamage;
    magic = magic * Math.max(0, 1 - adventurer.magicResist);
    var magicResistance = 1 - magic / attack.maxMagicDamage;
    resistanceElement.textContent = percent(magicResistance, 1);
    sections = ['This is an estimate of your magic damage reduction.', ''];
    sections.push(percent(adventurer.magicResist, 1) + ' Magic Resistance');
    sections.push(adventurer.magicBlock + ' Magic Block (' + percent(magicBlockResistance, 1) + ')');
    sections.push('');
    sections.push(percent(magicResistance, 1) + ' combined reduction');
    sections.push(attack.maxMagicDamage.toFixed(1) + ' damage reduced to ' + magic.toFixed(1));
    resistanceElement.parentElement.setAttribute('helptext', sections.join('<br/>'));


    // tie breaker is given to hitting, so for this calculation use 1 less evasion.
    evasion = adventurer.evasion;
    accuracy = attack.accuracy;
    if (evasion > accuracy) {
        var overRollChance = (evasion - accuracy) / evasion;
        var chanceToEvade = overRollChance + (1 - overRollChance) / 2;
        hitPercent = (1 - chanceToEvade);
    } else {
        var overRollChance = (accuracy - evasion) / accuracy;
        hitPercent = overRollChance + (1 - overRollChance) / 2;
    }
    var evasionElement =  statsPanelElement.querySelector('.js-evasion');
    evasionElement.textContent = percent(1 - hitPercent, 1);
    evasionElement.parentElement.setAttribute('helptext', adventurer.evasion + ' Evasion<br/><br/>' + percent(1 - hitPercent, 1) + ' estimated chance to evade attacks.');
}

function createAttackStats(attacker, attack, target) {
    var isCritical = Math.random() <= attack.critChance;
    if (attack.firstStrike && target && target.isActor) {
        isCritical = isCritical || target.health >= target.maxHealth;
    }
    var damage = Random.range(attack.minPhysicalDamage, attack.maxPhysicalDamage);
    var magicDamage = Random.range(attack.minMagicDamage, attack.maxMagicDamage);
    var sacrificedHealth = Math.floor(attacker.health * (attack.healthSacrifice || 0));
    damage += sacrificedHealth;
    var accuracy = Math.random() * attack.accuracy;
    if (isCritical) {
        damage *= (1 + attack.critDamage);
        magicDamage *= (1 + attack.critDamage);
        accuracy *= (1 + attack.critAccuracy);
    }
    var animation = attack.base.animation;
    var attackType = (attacker.equipment.weapon && attacker.equipment.weapon.base.type) || (attacker.character && 'unarmed');
    var sound = attack.base.sound || attackSounds[attackType];
    if (!animation && attacker.equipment.weapon) {
        animation = attacker.equipment.weapon.base.animation;
    }
    if (typeof(animation) === 'string' && !projectileAnimations[animation]) {
        pause();
        throw new Error('Missing animation for ' + animation);
    }
    if (typeof(animation) === 'string') {
        sound = attackSounds[animation] || sound;
        animation = projectileAnimations[animation];
    }
    const gravity = attack.base.gravity ||
        (attacker.equipment.weapon && attacker.equipment.weapon.gravity) || 0.8;
    return {
        'distance': 0,
        animation,
        sound,
        'size': attack.base.size || (animation ? animation.frames[0][2] : 10),
        gravity,
        'speed': attack.speed || attack.base.speed || (attack.range || 10) * 2.5,
        'healthSacrificed': sacrificedHealth,
        'source': attacker,
        attack,
        isCritical,
        damage,
        magicDamage,
        accuracy,
        'explode': attack.explode || 0,
        'cleave': attack.cleave || 0,
        'piercing': attack.criticalPiercing ? isCritical : false,
        'strikes': attack.doubleStrike ? 2 : 1
    };
}

export function createSpellStats(attacker, spell, target) {
    var isCritical = Math.random() <= spell.critChance;
    if (spell.firstStrike && target && target.isActor) {
        isCritical = isCritical || target.health >= target.maxHealth;
    }
    var magicDamage = spell.power;
    var sacrificedHealth = Math.floor(attacker.health * (spell.healthSacrifice || 0));
    magicDamage += sacrificedHealth;
    if (isCritical) {
        magicDamage *= (1 + spell.critDamage);
    }
    let animation = spell.base.animation;
    var sound = spell.base.sound;
    if (typeof(animation) === 'string' && !projectileAnimations[animation]) {
        pause();
        throw new Error('Missing animation for ' + animation);
    }
    if (typeof(animation) === 'string') {
        sound = attackSounds[animation] || sound;
        animation = projectileAnimations[animation];
    }
    return {
        'distance': 0,
        animation,
        sound,
        'size': spell.base.size || (animation ? animation.frames[0][2] : 10),
        'gravity': spell.base.gravity || 0.8,
        'speed': spell.speed || spell.base.speed || (spell.range || 10) * 2.5,
        'healthSacrificed': sacrificedHealth,
        'source': attacker,
        'attack': spell,
        isCritical,
        'damage': 0,
        magicDamage,
        'accuracy': 0,
        'explode': spell.explode || 0,
        'cleave': spell.cleave || 0,
        'strikes': 1
    };
}

function createSpellImprintedAttackStats(attacker, attack, spell, target) {
    var isCritical = Math.random() <= spell.critChance;
    if (spell.firstStrike && target && target.isActor) {
        isCritical = isCritical || target.health >= target.maxHealth;
    }
    var magicDamage = spell.power;
    var sacrificedHealth = Math.floor(attacker.health * (spell.healthSacrifice || 0));
    magicDamage += sacrificedHealth;
    var accuracy = Math.random() * attack.accuracy;
    if (isCritical) {
        magicDamage *= (1 + spell.critDamage);
        accuracy *= (1 + attack.critAccuracy);
    }
    var animation = attack.base.animation;
    var sound = attack.base.sound;
    if (!animation && attacker.equipment.weapon) {
        animation = attacker.equipment.weapon.base.animation;
    }
    if (typeof(animation) === 'string' && !projectileAnimations[animation]) {
        pause();
        throw new Error('Missing animation for ' + animation);
    }
    if (typeof(animation) === 'string') {
        sound = attackSounds[animation] || sound;
        animation = projectileAnimations[animation];
    }
    const gravity = attack.base.gravity ||
        (attacker.equipment.weapon && attacker.equipment.weapon.gravity) || 0.8;
    return {
        'distance': 0,
        animation,
        sound,
        'size': attack.base.size || (animation ? animation.frames[0][2] : 10),
        gravity,
        'speed': attack.speed || attack.base.speed || (attack.range || 10) * 2.5,
        'healthSacrificed': sacrificedHealth,
        'source': attacker,
        attack,
        'imprintedSpell': spell,
        isCritical,
        'damage': 0,
        magicDamage,
        accuracy,
        'explode': spell.explode || 0,
        'cleave': attack.cleave || 0,
        'piercing': attack.criticalPiercing ? isCritical : false,
        'strikes': attack.doubleStrike ? 2 : 1
    };
}
function performAttack(attacker, attack, target) {
    var attackStats;
    if (attack.tags['basic'] && attacker.imprintSpell && attacker.imprintedSpell) {
        attackStats = createSpellImprintedAttackStats(attacker, attack, attacker.imprintedSpell, target);
    } else {
        attackStats = createAttackStats(attacker, attack, target);
    }
    damageActor(attacker, attackStats.healthSacrificed);
    performAttackProper(attackStats, target);
    return attackStats;
}
function castAttackSpell(attacker, spell, target) {
    var attackStats = createSpellStats(attacker, spell, target);
    damageActor(attacker, attackStats.healthSacrificed);
    performAttackProper(attackStats, target);
    if (attacker.imprintSpell) attacker.imprintedSpell = spell;
    return attackStats;
}
export function performAttackProper(attackStats, target) {
    var attacker = attackStats.source;
    var area = attacker.area;
    if (attackStats.sound) {
        playSound(attackStats.sound, area);
    }
    // If the attack allows the user to teleport, teleport them to an optimal location for attacking.
    const teleport = (attackStats.attack.teleport || 0) * 32;
    if (teleport) {
        // It is easier for me to understand this code if I break it up into facing right and facing left cases.
        if (attacker.heading[0] > 0) {
            // Teleport to the location furthest from enemies that leaves the enemy within range to attack.
            attacker.x = Math.max(attacker.x - teleport, Math.min(attacker.x + teleport, target.x - attackStats.attack.range * 32 - attacker.width / 2 - target.width / 2));
        } else {
            attacker.x = Math.min(attacker.x + teleport, Math.max(attacker.x - teleport, target.x + target.width / 2 + attacker.width / 2 + attackStats.attack.range * 32));
        }
    }
    if (attackStats.attack.tags['song']) {
        var songSpellEffect = songEffect(attackStats)
        area.effects.push(songSpellEffect);
        attacker.boundEffects.push(songSpellEffect);
    } else if (attackStats.attack.tags['field']) {
        var fieldSpellEffect = fieldEffect(attackStats, attacker);
        area.effects.push(fieldSpellEffect);
        attacker.boundEffects.push(fieldSpellEffect);
    } else if (attackStats.attack.tags['nova']) {
        // attackStats.explode--;
        area.effects.push(novaEffect(attackStats, attacker.x, getAttackY(attacker), attacker.z));
    } else if (attackStats.attack.tags['blast']) {
        // attackStats.explode--;
        area.effects.push(explosionEffect(attackStats, target.x, getAttackY(attacker), target.z));
    } else if (attackStats.attack.tags['rain']) {
        // attackStats.explode--;
        var targets = [];
        var count = Math.floor(attackStats.attack.count || 1);
        var maxFrameSpread = 250;
        for (var i = 0; i < count; i++) {
            var projectileAttackStats = {...attackStats};
            if (!targets.length) {
                targets = Random.shuffle(attacker.enemies);
            }
            var currentTarget = targets.pop();
            const x = attacker.x - 250 + Math.random() * 400 + 10 * i;
            const z = attacker.z - 90 + Math.random() * MAX_Z;
            const y = 550 + Math.random() * 100;
            // Point the meteor at the target and hope it hits!
            var vy = -y;
            var vx = currentTarget.x - x;
            var vz = currentTarget.z - z;
            // Normalize starting speed at 15px per frame.
            var mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
            vy *= 15 / mag;
            vx *= 15 / mag;
            vz *= 15 / mag;
            area.projectiles.push(projectile(
                projectileAttackStats, x, y, z, vx, vy, vz,currentTarget, Math.min(i * maxFrameSpread / count, i * 10), // delay is in frames
                projectileAttackStats.isCritical ? 'yellow' : 'red', (projectileAttackStats.size || 20) * (projectileAttackStats.isCritical ? 1.5 : 1)));
        }
    } else if (attackStats.attack.tags['ranged']) {
        const distance = getDistance(attacker, target);
        const x = attacker.x + getXDirection(attacker) * attacker.width / 4;
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
export function getAttackY(attacker) {
    // This could actually be a location for abilities targeting locations. Just use 0, which is the height of the floor.
    if (!attacker.isActor) return 0;
    // Y value of projectiles can either be set on the source for the actor, or it will use the set yCenter or half the height.
    const height = attacker.source.height || 64;
    return attacker.scale * ifdefor(attacker.source.attackY, height - ifdefor(attacker.source.yCenter, height / 2));
}
export function applyAttackToTarget(attackStats, target) {
    const attack = attackStats.attack;
    const imprintedSpell = attackStats.imprintedSpell;
    const attacker = attackStats.source;
    const area = attacker.area;
    const effectiveness = (attackStats.effectiveness || 1);
    if (attackStats.strikes > 1) {
        attackStats.strikes--;
        applyAttackToTarget(attackStats, target);
    }

    if (attackStats.cleave > 0) {
        const cleaveAttackStats = {
            'distance': 0,
            'source': attackStats.source,
            'attack': attackStats.attack,
            'imprintedSpell': attackStats.imprintedSpell,
            'isCritical': attackStats.isCritical,
            // Apply cleave damage by the coefficient.
            'damage': attackStats.damage * attackStats.cleave,
            'magicDamage': attackStats.magicDamage * attackStats.cleave,
            'accuracy': attackStats.accuracy,
            'explode': attackStats.explode,
            'cleave': 0
        };
        for (let i = 0; i < attackStats.source.enemies.length; i++) {
            const cleaveTarget = attackStats.source.enemies[i];
            if (cleaveTarget === target) {
                continue;
            }
            // ignore targets that got behind the attacker.
            if ((cleaveTarget.x - attacker.x) * attacker.heading[0] < 0) {
                continue;
            }
            const distance = getDistance(attacker, cleaveTarget);
            if (distance > (attackStats.attack.range + (attackStats.attack.cleaveRange || 0)) * 32) continue;
            applyAttackToTarget(cleaveAttackStats, cleaveTarget);
        }
    }
    const makeExplosions = () => {
        if (attackStats.explode > 0) {
            var explodeAttackStats = {
                'distance': 0,
                'source': attackStats.source,
                'attack': attackStats.attack,
                'imprintedSpell': attackStats.imprintedSpell,
                'isCritical': attackStats.isCritical,
                'damage': attackStats.damage,
                'magicDamage': attackStats.magicDamage,
                'accuracy': attackStats.accuracy,
                'explode': attackStats.explode - 1
            };
            var explosionX,explosionY,explosionZ;
            if (attackStats.projectile) {
                explosionX = attackStats.projectile.x;
                explosionY = attackStats.projectile.y;
                explosionZ = attackStats.projectile.z;
            } else if (target) {
                explosionX = target.x;
                explosionY = ifdefor(attackStats.y, getAttackY(target));
                explosionZ = target.z;
            } else {
                explosionX = attacker.x;
                explosionY = ifdefor(attackStats.y, getAttackY(attacker));
                explosionZ = target.z;
            }
            var explosion = explosionEffect(explodeAttackStats, explosionX, explosionY, explosionZ);
            if (attack.base.explosionSound) playSound(attack.base.explosionSound, area);
            area.effects.push(explosion);
            // Meteor calls applyAttackToTarget with a null target so it can explode
            // anywhere. If that has happened, just return once the explosion has
            // been created.
            if (target.isActor) explosion.hitTargets.push(target);
        }
    }
    // All the logic beyond this point does not apply to location targets.
    if (!target.isActor) {
        makeExplosions();
        return true;
    }
    const distance = attackStats.distance;
    var hitText: any = {
        x: target.x, y: target.height + 10, z: target.z,
        color: 'grey', 'vx': -(Math.random() * 3 + 2) * target.heading[0], 'vy': 5
    };
    if (target.invulnerable) {
        hitText.value = 'invulnerable';
        hitText.fontSize = 15;
        appendTextPopup(area, hitText);
        return false;
    }
    var multiplier = attack.rangeDamage ? (1 + attack.rangeDamage * distance / 32) : 1;
    if (attackStats.isCritical) {
        hitText.fontSize = 30;
    }
    var damage = Math.floor(attackStats.damage * multiplier * effectiveness);
    var magicDamage = Math.floor(attackStats.magicDamage * multiplier * effectiveness);
    // Spell paradigm shift converts all magic damage to physical damage.
    if (attack.magicToPhysical) {
        damage += magicDamage;
        magicDamage = 0;
    }
    if (attack.heals) {
        hitText.color = 'green';
        hitText.value = abbreviate(damage + magicDamage);
        healActor(target, damage + magicDamage);
        var speed = 1 + Math.log(damage+magicDamage) / 10;
        hitText.vy *= speed;
        hitText.vx *= speed;
        appendTextPopup(area, hitText);
        return true;
    }
    attackStats.evaded = false;
    if (!attack.alwaysHits) {
        var evasionRoll = (target.maxEvasion ? 1 : Math.random()) * target.evasion;
        // Projectiles have up to 50% reduced accuracy at a distance of 320 pixels.
        var effectiveAccuracy = attackStats.accuracy * Math.max(.5, 1 - (attackStats.distance || 0) / 640);
        // if(attacker.character) console.log([attackStats.distance, attackStats.accuracy, effectiveAccuracy, evasionRoll]);
        if (effectiveAccuracy - evasionRoll < 0) {
            hitText.value = 'miss';
            if (attack.damageOnMiss) {
                var damageOnMiss = Math.round(attack.damageOnMiss * effectiveness);
                damageActor(target, damageOnMiss);
                hitText.value = 'miss (' + damageOnMiss + ')';
            }
            // Target has evaded the attack.
            hitText.font = 15;
            appendTextPopup(area, hitText);
            attackStats.evaded = true;
        }
        // Chaining attack accuracy is reduced by the evasion roll of each target hit.
        // This is to keep attack from chaining forever.
        if (attackStats.attack.chaining) {
            attackStats.accuracy -= evasionRoll;
        }
    }
    // Apply block reduction
    var blockRoll = Math.round((target.maxBlock ? 1 : Math.random()) * target.block);
    var magicBlockRoll = Math.round((target.maxMagicBlock ? 1 : Math.random()) * target.magicBlock);
    damage = Math.max(0, damage - blockRoll);
    magicDamage = Math.max(0, magicDamage - magicBlockRoll);
    // Apply armor and magic resistance mitigation
    if (!attack.ignoreArmor) {
        var effectiveArmor = target.armor * (1 - (attack.armorPenetration || 0));
        damage = Math.round(applyArmorToDamage(damage, effectiveArmor));
    }
    if (!attack.ignoreResistance) {
        magicDamage = Math.round(magicDamage * Math.max(0, (1 - target.magicResist)));
    }
    if (damage < 0 || magicDamage < 0) {
        debugger;
    }
    var totalDamage = damage + magicDamage;
    attackStats.totalDamage = totalDamage;
    attackStats.deflected = false;
    attackStats.dodged = false;
    attackStats.stopped = false;
    for (const reaction of (target.reactions, [])) {
        if (canUseReaction(target, reaction, attackStats)) {
            useReaction(target, reaction, attackStats)
            break;
        }
    }
    // Apply any on miss effects if the attack has missed.
    if (attackStats.evaded || (attackStats.dodged && !attack.undodgeable)) {
        for (var effect of (attacker.onMissEffects || [])) {
            if (effect.debuff) addTimedEffect(target, effect.debuff, 0);
            if (effect.buff) addTimedEffect(attacker, effect.buff, 0);
        }
    }
    if (attackStats.deflected || attackStats.evaded || attackStats.stopped) {
        return false;
    }
    // Attacks that always hit can still be avoided by a 'dodge' skill.
    if (attackStats.dodged && !attack.undodgeable) {
        hitText.value = 'dodged';
        hitText.font = 15;
        appendTextPopup(area, hitText);
        return false;
    }

    if (target.isActor && attack.tags['basic']) {
        var attackType = (attacker.equipment.weapon && attacker.equipment.weapon.base.type) || (attacker.character && 'unarmed');
        var hitSound = attack.base.hitSound || attackHitSounds[attackType];
        if (hitSound) playSound(hitSound, area);
    }
    makeExplosions();
    healActor(attacker, (attack.healthGainOnHit || 0) * effectiveness);
    target.slow += (attack.slowOnHit || 0) * effectiveness;
    if (imprintedSpell) target.slow += (imprintedSpell.slowOnHit || 0) * effectiveness;
    if (attack.debuff) addTimedEffect(target, attack.debuff, 0);
    if (imprintedSpell && imprintedSpell.debuff) addTimedEffect(target, imprintedSpell.debuff, 0);
    var effects = attacker.onHitEffects || [];
    if (attackStats.isCritical) effects = effects.concat(attacker.onCritEffects || []);
    for (var effect of effects) {
        // Some abilities like corsairs venom add a stacking debuff to the target every hit.
        if (effect.debuff) addTimedEffect(target, effect.debuff, 0);
        // Some abilities like dancer's whirling dervish add a stacking buff to the attacker every hit.
        if (effect.buff) addTimedEffect(attacker, effect.buff, 0);
    }
    if (totalDamage > 0) {
        var percentPhysical = damage / totalDamage;
        var percentMagic = 1 - percentPhysical;
        var percentOffset = Math.max(0, Math.min(.9 - percentPhysical, .9 - percentMagic));
        percentPhysical += percentOffset;
        percentMagic += percentOffset;
        if (percentPhysical < 0 || percentPhysical > 1) debugger;
        if (percentMagic < 0 || percentMagic > 1) debugger;
        var critBonus = attackStats.isCritical ? 30 : 0;
        var r = toHex(Math.floor(220 * percentPhysical) + critBonus);
        var b = toHex(Math.floor(220 * percentMagic) + critBonus);
        var g = toHex(critBonus * 5);
        hitText.color = "#" + r + g + b;
        var cull = Math.max(attack.cull || 0, (imprintedSpell && imprintedSpell.cull) || 0);
        if (cull > 0 && target.health / target.maxHealth <= cull) {
            setActorHealth(target, 0);
            hitText.value = 'culled!';
        } else {
            damageActor(target, totalDamage);
            hitText.value = abbreviate(totalDamage);
            var speed = 1 + Math.log(totalDamage) / 10;
            hitText.vy *= speed;
            hitText.vx *= speed;
        }
        healActor(attacker, (attack.lifeSteal || 0) * totalDamage);
        if (imprintedSpell) healActor(attacker, (imprintedSpell.lifeSteal || 0) * totalDamage);
        if (attack.poison) {
            addTimedEffect(target, {'bonuses': {'+damageOverTime': totalDamage * attack.poison}}, 0);
        }
        if (imprintedSpell && imprintedSpell.poison) {
            addTimedEffect(target, {'bonuses': {'+damageOverTime': totalDamage * imprintedSpell.poison}}, 0);
        }
        var stun = Math.max((attack.stun || 0), imprintedSpell ? (imprintedSpell.stun || 0) : 0);
        if (stun) {
            target.stunned = Math.max((target.stunned || 0), target.time + stun * effectiveness);
            hitText.value += ' stunned!';
        }
        // Some attacks pull the target towards the attacker
        var direction = (target.x < attacker.x) ? -1 : 1;
        if (Math.random() < (attack.knockbackChance || 0)) {
            var targetX = target.x + direction * 32 * (attack.knockbackDistance || 1);
            target.pull = {'x': targetX, z: target.z, time: target.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.knockbackRotation, 45);
        }
        if (attack.pullsTarget) {
            target.stunned =  Math.max((target.stunned || 0), target.time + .3 + distance / 32 * (attack.dragStun || 0) * effectiveness);
            var targetX = (attacker.x > target.x) ? (attacker.x - target.width) : (attacker.x + attacker.width);
            var targetZ = (attacker.z > target.z) ? (attacker.z - target.width) : (attacker.z + attacker.width);
            target.pull = {sourceAttackStats: attackStats, x: targetX, z: targetZ, 'time': target.time + .3, 'damage': Math.floor(distance / 32 * damage * (attack.dragDamage || 0) * effectiveness)};
            attacker.pull = {'x': attacker.x, z: attacker.z, 'time': attacker.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.knockbackRotation, -45);
            hitText.value += ' hooked!';
        }
        if (attack.domino) {
            target.dominoAttackStats = attackStats;
            var targetX = (attacker.x < target.x)
                ? (target.x + attacker.width + (attack.distance || 128) * effectiveness)
                : (target.x - (attack.distance || 128) * effectiveness);
            target.pull = {'x': targetX, z: target.z, 'time': target.time + .3, 'damage': 0};
            target.rotation = direction * ifdefor(attack.knockbackRotation, 45);
        }
    } else {
        hitText.value = 'blocked';
        hitText.font = 15;
    }
    appendTextPopup(area, hitText);
    return true;
}

export function appendTextPopup(area, hitText, important = false) {
    if (important || area.textPopups.length < 100) area.textPopups.push(hitText);
}

function applyArmorToDamage(damage, armor) {
    if (damage <= 0) {
        return 0;
    }
    //This equation looks a bit funny but is designed to have the following properties:
    //100% when armor = 0, 50% when armor = damage, 25% when armor = 2 * damage
    //1/(2^N) damage when armor is N times base damage
    return damage / Math.pow(2, armor / damage);
}
