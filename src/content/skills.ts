import { effectAnimations } from 'app/content/effectAnimations';
import { jobIcons } from 'app/content/jobs';
import { projectileAnimations } from 'app/content/projectileAnimations';
import { drawOnGround } from 'app/drawArea';
import { GROUND_Y } from 'app/gameConstants';
import { drawTintedImage, requireImage } from 'app/images';
import { d, r } from 'app/utils/index';

import { ActionData, Effect } from 'app/types/abilities';
import { Bonuses } from 'app/types/bonuses';
import { Actor, ArrayFrame, Frame } from 'app/types';
import { createAnimation } from 'app/utils/animations';

const scrollIconSource = 'gfx/496RpgIcons/openScroll.png';
const effectSourceUp: ArrayFrame = ['gfx/militaryIcons.png', 17, 23, 16, 16, 0, 0];
const effectSourceArmor: ArrayFrame = ['gfx/militaryIcons.png', 65, 180, 12, 12, 8, 8];
//const effectSourceSword = ['gfx/militaryIcons.png', 52, 180, 12, 12, 8, 8];
const effectSourceSword: ArrayFrame = ['gfx/militaryIcons.png', 85, 74, 16, 16, 6, 4];

function genericAction(type, rawAction: Partial<ActionData>, bonuses: Bonuses, helpText = ''): ActionData {
    const action: ActionData = {
        icon: scrollIconSource,
        ...rawAction,
        type,
        variableObjectType: 'action',
        bonuses,
        hasImplicitBonuses: true,
        helpText,
        tags: [type, ...(rawAction.tags || [])],
    };
    // Generic actions have 0 range unless a specific modifier is set.
    if (typeof(action.bonuses['+range']) === 'undefined') {
        action.bonuses['*range'] = 0;
    }
    return action;
}

function movementAction(type, rawAction: Partial<ActionData>, bonuses: Bonuses, helpText = ''): ActionData {
    const action: ActionData = {
        icon: scrollIconSource,
        ...rawAction,
        type,
        variableObjectType: 'action',
        bonuses,
        hasImplicitBonuses: true,
        helpText,
        tags: [type, 'movement', ...(rawAction.tags || [])],
    };
    return action;
}


function attackAction(type, rawAction: Partial<ActionData>, bonuses: Bonuses, helpText = ''): ActionData {
    const action: ActionData = {
        icon: scrollIconSource,
        ...rawAction,
        type,
        variableObjectType: 'action',
        bonuses: {
            '+range': ['{weaponRange}'],
            ...bonuses,
        },
        hasImplicitBonuses: true,
        helpText,
        tags: [type, 'attack', ...(rawAction.tags || [])],
    };
    return action;
}

function spellAction(type, rawAction: Partial<ActionData>, bonuses: Bonuses, helpText = ''): ActionData {
    const action: ActionData = {
        icon: jobIcons.sage,
        ...rawAction,
        type,
        variableObjectType: 'action',
        bonuses: {
            '+power': ['{magicPower}'],
            '+prepTime': 0.3,
            '+recoveryTime': 0.5,
            ...bonuses,
        },
        hasImplicitBonuses: true,
        helpText,
        tags: [type, 'spell', ...(rawAction.tags || [])],
    };
    // Spells have 0 range unless a specific modifier is set.
    if (typeof(action.bonuses['+range']) === 'undefined') {
        action.bonuses['*range'] = 0;
    }
    return action;
}


export function buffEffect(rawEffect: Partial<Effect>, bonuses: Bonuses): Effect {
    return {
        ...rawEffect,
        variableObjectType: 'effect',
        tags: ['buff', ...(rawEffect.tags || [])],
        bonuses,
    };
}
export function debuffEffect(rawEffect: Partial<Effect>, bonuses: Bonuses): Effect {
    return {
        ...rawEffect,
        variableObjectType: 'effect',
        tags: ['debuff', ...(rawEffect.tags || [])],
        bonuses,
    }
}

export const skills: {[key: string]: ActionData} = {
    // Movement actions
    'dodge': movementAction('dodge', {'icon': jobIcons.dancer, jump: true}, {'+cooldown': 10, '+distance': -128, '$buff': buffEffect({}, {'+%evasion': .5, '+duration': 5})},
                            'Leap back to dodge an attack and gain: {$buff}'),
    'sideStep': movementAction('sideStep', {'icon': jobIcons.samurai, 'rangedOnly': true}, {'+cooldown': 10, '+moveDuration': .1, '+distance': 192,
                                        '$buff': buffEffect({}, {'++critChance': .2, '+duration': 2})},
                            'Side step a ranged attack and advance toward enemis gaining: {$buff}'),
    // The preparation time for this depends on the skill set under $action, and $action will be used immediately after leaping with no preparation time.
    // The actor must actually have the skill specified under $action to use it.
    leap: movementAction('leap', {icon: jobIcons.dancer}, {'+range': 8, '$action': 'basicAttack'}, 'Leap to a target'),
    // Attack actions
    'basicAttack': attackAction('attack', {'tags': ['basic']}, {}, 'A basic attack'),
    'healingAttack': attackAction('attack', {'animation': projectileAnimations.wandHealing, 'restrictions': ['wand'], 'target': 'otherAllies'}, {'$heals': true}, 'Basic attacks heal allies instead of damage enemies.'),
    'bullseye': attackAction('attack', {'icon': jobIcons.juggler, showName: true}, {'*damage': 2, '+cooldown': 15, '$alwaysHits': 'Never misses', '$undodgeable': 'Cannot be dodged'}),
    'counterAttack': attackAction('counterAttack', {'icon': jobIcons.blackbelt, showName: true}, {'*damage': 1.5, '+chance': .1},
                            'Perform a powerful counter attack.<br/>The chance to counter is lower the further away the attacker is.'),
    'dragonPunch': attackAction('attack', {'icon': jobIcons.blackbelt, 'restrictions': ['fist'], showName: true},
                              {'*damage': 3, '+cooldown': 30, '$alwaysHits': 'Never misses', '$undodgeable': 'Cannot be dodged',
                                        '+distance': 256, '$domino': 'Knocks target away possibly damaging other enemies.'}),
    'hook':  attackAction('attack',
        {'icon': jobIcons.corsair, speed: 50, size: 50, animation: createAnimation('gfx/effects/hook.png', d(32, 32)), tags: ['ranged']},
        {'+cooldown': 10, '+range': 10, '+dragDamage': 0, '+dragStun': 0, '+knockbackRotation': -60, '+rangeDamage': 0, '$alwaysHits': 'Never misses', '$pullsTarget': 'Pulls target'},
        'Throw a hook to damage and pull enemies closer.'),

    'banishingStrike': attackAction('banish', {'icon': jobIcons.paladin, 'restrictions': ['melee'], showName: true}, {'+cooldown': 30, '*damage': 2, '+distance': [6, '+', ['{strength}' , '/', 20]],
                '$alwaysHits': 'Never misses', '+purify': 0, '+shockwave': 0, '+knockbackRotation': 30,
                '$debuff': debuffEffect({}, {'+*weaponDamage': .5, '+duration': ['{intelligence}', '/', 20]}),
                '$otherDebuff': debuffEffect({}, {'+*speed': .1, '+duration': ['{intelligence}', '/', 20]})},
                'Perform a mighty strike that inflicts the enemy with: {$debuff} And knocks all other enemies away, slowing them.'),
    'evadeAndCounter': attackAction('evadeAndCounter', {'icon': jobIcons.dancer, 'restrictions': ['melee']}, {'$alwaysHits': 'Never misses'}, 'Counter whenever you successfully evade an attack.'),
    'charge': attackAction('charge', {'icon': jobIcons.warrior, 'tags': ['movement']}, {'+range': 15, '*damage': 2, '+cooldown': 10, '+speedBonus': 3, '+stun': .5,
                                            '+rangeDamage': 0, '$alwaysHits': 'Never misses'},
                                        'Charge at enemies, damaging and stunning them briefly on impact.'),
    'armorBreak': attackAction('attack', {'icon': jobIcons.warrior, 'restrictions': ['melee'], showName: true}, {'*damage': 3, '+cooldown': 30, '+stun': .5, '$alwaysHits': 'Never misses',
                                            '$debuff': debuffEffect({}, {'+-armor': ['{strength}', '/', 2], '+-block': ['{strength}', '/', 2]})},
                                            'Deliver a might blow that destroys the targets armor causing: {$debuff}'),
    'blinkStrike': attackAction('attack', {'icon': jobIcons.assassin, 'restrictions': ['melee'], 'tags': ['movement']}, {'*damage': 1.5, '+cooldown': 6, '$alwaysHits': 'Never misses', '+teleport': 6},
                                'Instantly teleport to and attack a nearby enemy.'),
    'soulStrike': attackAction('attack', {'icon': jobIcons.darkknight, 'restrictions': ['melee'], showName: true}, {'+range': 2, '*damage': 2, '+cooldown': 15,
                               '$alwaysHits': 'Never misses', '+healthSacrifice': .2, '+cleave': 1},
                    'Sacrifice a portion of your current health to deal a cleaving attack that hits all enemies in an extended range.'),
    'powerShot': attackAction('attack', {'icon': 'gfx/496RpgIcons/abilityPowerShot.png', 'restrictions': ['ranged'], 'afterImages': 4}, {'+range': ['{weaponRange}', '+', 5], '+critChance': 1, '*damage': 1.5,
                                        '+cooldown': 10, '$alwaysHits': 'Never misses'},
                                'Perform a powerful long ranged attack that always strikes critically.'),
    'snipe': attackAction('attack', {'icon': jobIcons.sniper, 'restrictions': ['ranged'], showName: true}, {'+range': ['{weaponRange}', '+', 10], '*damage': 2, '+cooldown': 30,
                            '$ignoreArmor': 'Ignore armor and block', '$ignoreResistance': 'Ignore magic resistance and magic block',
                            '$alwaysHits': 'Never misses'},
                            'Precisely target an enemies weak spot from any distance ignoring all armor and resistances.'),
    'dragonSlayer': attackAction('attack', {'icon': jobIcons.samurai, 'restrictions': ['melee'], showName: true},
                        {'+critDamage': .5, '*critChance': 2, '*damage': 3, '+cooldown': 20, '$alwaysHits': 'Never misses'},
                        'Strike with unparalleled ferocity.'),
    'throwWeapon': attackAction('attack', {'icon': 'gfx/496RpgIcons/abilityThrowWeapon.png', 'restrictions': ['melee'], 'tags': ['ranged'], showName: true},
                        {'+range': 12, '*damage': 1.5, '+cooldown': 10, '$alwaysHits': 'Never misses'},
                        'Throw a shadow clone of your weapon at a distant enemy.'),
    // Generic actions:
    'deflect': genericAction('deflect', {'icon': jobIcons.corsair, showName: true}, {'+damageRatio': [.5, '+', ['{strength}', '/', 100]], '+cooldown': ['20', '*', [100, '/', [100, '+', '{dexterity}']]], '+chance': 1},
                             'Deflect ranged attacks back at enemies.'),
    'plunder': genericAction('plunder', {'icon': jobIcons.corsair, showName: true}, {'+range': 2, '+count': 1, '+duration': ['{strength}', '/', 10], '+cooldown': ['40', '*', [100, '/', [100, '+', '{dexterity}']]]},
                             'Steal an enemies enchantment for yourself.'),
    'distract': genericAction('dodge', {'icon': jobIcons.dancer, showName: true}, {'$globalDebuff': debuffEffect({}, {'+*accuracy': .5, '+duration': 2}), '+cooldown': 10},
                              'Dodge an attack with a distracting flourish that inflicts: {$globalDebuff} on all enemies.'),
    'charm': genericAction('charm', {'icon': 'gfx/496RpgIcons/abilityCharm.png', 'tags': ['minion']}, {'+range': 1, '+cooldown': ['240', '*', [100, '/', [100, '+', '{intelligence}']]]},
                           'Steal an enemies heart, turning them into an ally.'),
    'pet': genericAction('minion', {'icon': jobIcons.ranger, 'target': 'none', 'tags': ['minion'], 'monsterKey': 'wolf'}, {'+limit': 1, '+cooldown': 30},
                         'Call a wolf to fight with you.'),
    'summonCaterpillar': genericAction('minion', {'target': 'none', 'tags': ['minion'], 'monsterKey': 'caterpillar'}, {'+limit': 3, '+cooldown': 20},
                         'Call a caterpillar to fight with you.'),
    'summonSkeleton': genericAction('minion', {'target': 'none', 'tags': ['minion'], 'monsterKey': 'skeleton'}, {'+limit': 2, '+cooldown': 15},
                         'Summon skeletons to fight for you.'),
    'howl': genericAction('minion', {'target': 'none', 'tags': ['minion'], 'monsterKey': 'wolf', showName: true}, {'+limit': 4, '+cooldown': 10},
                         'Summon a pack member to fight with you.'),
    'net': genericAction('effect', {'icon': jobIcons.sniper, showName: true}, {'+cooldown': 10, '+range': 10, '$debuff': debuffEffect({}, {'+*speed': 0, '+duration': 3})},
                         'Throw a net to ensnare a distant enemy.'),
    'sicem': genericAction('effect', {'icon': jobIcons.ranger, showName: true}, {'+cooldown': [60, '*', [100, '/', [100, '+', '{dexterity}']]],
                            '+range': 10, '$allyBuff': buffEffect({}, {'+*speed': 2, '+*attackSpeed': 2, '+*weaponDamage': 2, '+duration': 2})},
                            'Incite your allies to fiercely attack the enemy granting them: {$allyBuff}'),
    'consume': genericAction('consume', {'icon': 'gfx/496RpgIcons/abilityConsume.png', 'target': 'all', 'targetDeadUnits': true, 'consumeCorpse': true, showName: true},
                             {'+consumeRatio': .2, '+range': 5, '+count': 0, '+duration': 0},
                             'Consume the spirits of nearby fallen enemies and allies to regenerate your health.'),
    'aiming': genericAction('effect', {'icon': 'gfx/496RpgIcons/target.png', 'target': 'self', 'restrictions': ['ranged'], showName: true}, {'+cooldown': 30, '$buff': buffEffect({},
                            {'++range': 2, '+*attackSpeed': .5, '+*weaponDamage': 1.5, '+*accuracy': 1.5, '++critChance': .2, '++critDamage': .3, '+duration': 10})},
                            'Enter a state of heightened perception greatly increasing your sharpshooting abilities while reducing your attack speed. Grants: {$buff}'),
    'smokeBomb': genericAction('criticalCounter', {'icon': jobIcons.ninja, showName: true}, {'$dodgeAttack': true, '+cooldown': 100, '$globalDebuff': debuffEffect({},
                                    {'+*accuracy': 0, '+duration': 5})},
                'If an attack would deal more than half of your remaining life, dodge it and throw a smoke bomb causing: {$globalDebuff} to all enemies.'),
    'shadowClone': genericAction('clone', {'icon': 'gfx/496RpgIcons/abilityShadowClone.png', 'tags': ['minion']}, {'+limit': 10, '+chance': .1},
                        'Chance to summon a weak clone of yourself on taking damage'),
    'enhanceWeapon': genericAction('effect', {'icon': 'gfx/496RpgIcons/auraAttack.png', 'tags': ['spell'], 'target': 'self', showName: true}, {'+cooldown': 30, '$buff': buffEffect({'icons': [effectSourceUp, effectSourceSword]}, {
                            '++weaponPhysicalDamage': ['{strength}', '/', 10], '++weaponMagicDamage': ['{intelligence}', '/', 10],
                            '++critDamage': ['{dexterity}', '/', 500], '+duration': 10})},
                    'Enhance the strength of your weapon granting: {$buff}'),
    'enhanceArmor': genericAction('effect', {'icon': 'gfx/496RpgIcons/auraDefense.png', 'tags': ['spell'], 'target': 'self', showName: true}, {'+cooldown': 30, '$buff': buffEffect({'icons': [effectSourceUp, effectSourceArmor]}, {
                            '++armor': ['{strength}', '/', 10], '++magicBlock': ['{intelligence}', '/', 20],
                            '++block': ['{intelligence}', '/', 10], '++evasion': ['{dexterity}', '/', 10], '+duration': 15})},
                    'Enhance the strength of your armor granting: {$buff}'),
    'enhanceAbility': genericAction('effect', {'icon': jobIcons.enhancer, 'tags': ['spell'], 'target': 'self', showName: true}, {'+cooldown': 20, '$buff': buffEffect({}, {
                            // This buff increases magicPower from magicDamage by 44% since that counts both damage and magicPower.
                            // Making a note here in case I want to change this *damage bonus to *physicalDamage later to balance this.
                            '+%cooldown': -.2, '+*magicPower': 1.2, '+*weaponDamage': 1.2, '+*range': 1.2, '+duration': 5})},
                    'Enhance your own abilities granting: {$buff}'),
    // Song buffs should be based on the singer's stats, not the stats of the targets. Not sure if this is the case or not.
    'attackSong': genericAction('song', {'icon': jobIcons.bard, 'tags': ['song', 'field'], 'target': 'none',
                                            'color': 'red', 'alpha': .2,
                                            sound: 'sounds/bfxr/strum.wav'},
                                {'+area': 8, '+cooldown': 30, '+duration': 10, '$buff': buffEffect({'icons': [effectSourceUp, effectSourceSword]}, {
                                    '+%attackSpeed': [.2, '+', ['{dexterity}', '/', 1000]],
                                    '+%accuracy': [.2, '+', ['{intelligence}', '/', 1000]],
                                    '+%weaponDamage': [.2, '+', ['{strength}', '/', 1000]]})},
            'Play a tune that inspires you and your allies to attack more fiercely, granting all allies in range: {$buff}'),
    'defenseSong': genericAction('song', {'icon': jobIcons.bard, 'tags': ['song', 'field'], 'target': 'none',
                                            'color': 'blue', 'alpha': .2,
                                            sound: 'sounds/bfxr/strum.wav'},
                                 {'+area': 10, '+cooldown': 45, '+duration': 20, '$buff': buffEffect({'icons': [effectSourceUp, effectSourceArmor]}, {
                                    '+%evasion': [.2, '+', ['{dexterity}', '/', 1000]],
                                    '+%block': [.2, '+', ['{intelligence}', '/', 1000]],
                                    '+%magicBlock': [.2, '+', ['{intelligence}', '/', 1000]],
                                    '+%maxHealth': [.2, '+', ['{strength}', '/', 1000]]})},
            'Play an uplifting rondo that steels you and your allies defenses for battle, granting all allies in range: {$buff}'),
    'heroSong': genericAction('heroSong', {'icon': jobIcons.bard, 'tags': ['song', 'field'], 'target': 'none',
                                            'color': 'gold', 'alpha': .2,
                                            sound: 'sounds/bfxr/strum.wav'},
                              {'+area': 8, '+cooldown':  ['300', '*', [100, '/', [100, '+', '{intelligence}']]],
                               '+duration': [2, '+', ['{dexterity}' , '/', '200']], '$buff': buffEffect({}, {
                                    '$$invulnerable': 'Invulnerability',
                                    '++healthRegen': ['{intelligence}', '/', 10],
                                    '+%critChance': ['{dexterity}', '/', 500]})},
            'Play a ballade to inspire heroic feats granting all allies in range: {$buff}'),
    'raiseDead': genericAction('minion', {'icon': jobIcons.sage, 'target': 'enemies', 'targetDeadUnits': true, 'consumeCorpse': true, 'tags': ['spell']},
                               {'+limit': 10, '+range': 10, '+chance': .4, '+cooldown': .5},
                                'Chance to raise defeated enemies to fight for you.'),
    'tomFoolery': genericAction('dodge', {'icon': jobIcons.fool, showName: true}, {'+cooldown': 30, '$buff': buffEffect({}, {
                '+*accuracy': 0, '$$maxEvasion': 'Evasion checks are always perfect', '+duration': 5})},
                'Dodge an attack and gain: {$buff}'),
    'mimic': genericAction('mimic', {'icon': jobIcons.fool, showName: true}, {}, 'Counter an enemy ability with a copy of that ability.'),
    'decoy': genericAction('decoy', {'icon': jobIcons.fool, 'tags': ['minion']}, {'+cooldown': 60},
                'Dodge an attack and leave behind a decoy that explodes on death damaging all enemies.'),
    'explode': genericAction('explode', {'tags': ['ranged']}, {'+power': ['{maxHealth}'], '+range': 10, '$alwaysHits': 'Shrapnel cannot be evaded'},
                             'Explode into shrapnel on death.'),
    // Spell actions
    'heal': spellAction('heal', {'icon': 'gfx/496RpgIcons/spellHeal.png', 'target': 'allies'}, {'+cooldown': 10, '+range': 10}, 'Cast a spell to restore {+power} health.'),
    'reflect': spellAction('reflect', {'target': 'allies', showName: true}, {'+cooldown': 20},
            'Create a magical barrier that will reflect projectile attacks until it breaks after taking {+power} damage. Further casting strengthens the barrier.'),
    'revive': spellAction('revive', {'icon': 'gfx/496RpgIcons/spellRevive.png', showName: true}, {'+cooldown': 120},
            'Upon receiving a lethal blow, cast a spell that brings you back to life with {+power} health.'),
    'protect': spellAction('effect', {'icon': 'gfx/496RpgIcons/spellProtect.png', 'target': 'allies', showName: true},
            {'+cooldown': 30, '+range': 10, '$buff': buffEffect({'icons': [effectSourceUp, effectSourceArmor],
                drawGround(context, actor: Actor) {
                    //const animation = effectAnimations.blueRune;
                    const size = Math.max(actor.w, 128);
                    //const frame = animation.frames[frame];
                    drawOnGround(context, groundContext => {
                        groundContext.save();
                        groundContext.globalAlpha = .8 + .2 * Math.cos(3 * actor.time * Math.PI);
                        groundContext.translate((actor.x - actor.area.cameraX), GROUND_Y - actor.z / 2);
                        groundContext.scale(1, .5);
                        groundContext.rotate(actor.time * Math.PI / 2);
                        drawTintedImage(groundContext, requireImage('gfx/effects/circleOfProtection.png'), '#08F', 1, r(0,0,200,200), r(-size / 2, -size / 2, size, size));
                        groundContext.restore();
                    });
                }},
                {'++armor': ['{intelligence}'], '+duration': 20})},
                           'Create a magic barrier that grants: {$buff}'),
    'aegis': spellAction('criticalCounter', {'icon': 'gfx/496RpgIcons/buffShield.png', showName: true}, {'+cooldown': 60, '+stopAttack': 1,
                '$buff': buffEffect({}, {'$$maxBlock': 'Block checks are always perfect', '$$maxMagicBlock': 'Magic Block checks are always perfect', '+duration': 5})},
                'If an attack would deal more than half of your remaining life, prevent it and cast an enchantment that grants you: {$buff}'),
    'fireball': spellAction('spell', {'icon': 'gfx/496RpgIcons/spellFire.png', 'tags': ['ranged'],
                                        'animation': projectileAnimations.fireball, explosionAnimation: effectAnimations.explosion, 'alpha': .8,
                                        sound: 'sounds/cheeseman/arrow.wav', explosionSound: 'sounds/fireball.flac', 'size': 40, 'color': 'red', 'gravity': 0},
                                    {'+range': 12, '+cooldown': 8, '$alwaysHits': 'Never misses', '+explode': 1, '+area': 3, '+areaCoefficient': .5},
                            'Conjure an explosive fireball to hurl at enemies dealing {+power} damage.'),
    'freeze': spellAction('spell', {'icon': 'gfx/496RpgIcons/spellFreeze.png', 'tags': ['nova'], 'height': 20, 'color': 'white', 'alpha': .3,
                                    blastAnimation: effectAnimations.freeze, sound: 'sounds/bfxr/freeze.wav'},
                                    {'+power': ['{magicPower}', '/', 2], '+area': [4, '+', ['{intelligence}', '/', '50']],
                                    '+areaCoefficient': 1, '+cooldown': 10, '$alwaysHits': 'Never misses', '+slowOnHit': 1},
                        'Emit a blast of icy air that deals {+power} damage and slows enemies. The effect is less the further away the enemy is.'),
    'storm': spellAction('spell', {'icon': 'gfx/496RpgIcons/spellStorm.png', 'tags': ['field'], 'yOffset': 200, 'height': 80, 'color': 'yellow', 'alpha': .2},
                         {'+hitsPerSecond': 2, '+duration': 5, '+power': ['{magicPower}', '/', 4],
                         '+area': [5, '+', ['{intelligence}', '/', '200']], '+cooldown': 20, '$alwaysHits': 'Never misses'},
                        'Create a cloud of static electricity that randomly deals magic damage to nearby enemies.'),
    'drainLife': spellAction('spell', {'tags': ['blast'], 'height': 20, 'color': 'green', 'alpha': .5},
                       {'+power': ['{magicPower}', '/', 2], '+range': 10, '+area': [8, '+', ['{intelligence}', '/', '200']],
                       '+areaCoefficient': 1, '+cooldown': 10, '+lifeSteal': 1, '$alwaysHits': 'Never misses'},
                        'Drain life from all enemies in a large area.'),
    'plague': spellAction('spell', {'icon': 'gfx/496RpgIcons/spellPlague.png', 'tags': ['blast'], 'height': 20, 'color': 'yellow', 'alpha': .4},
                        {'+power': ['{magicPower}', '/', 10], '+range': 10, '+area': [8, '+', ['{intelligence}', '/', '200']],
                        '+areaCoefficient': 1, '+cooldown': 20, '$alwaysHits': 'Never misses',
                        '$debuff': debuffEffect({}, {'++damageOverTime': ['{magicPower}', '/', 10], '+%healthRegen': -0.01, '$duration': 'forever'})},
                        'Apply a permanent debuff that deals damage over time to effected enemies.'),
    'stopTime': spellAction('stop', {'icon': 'gfx/496RpgIcons/clock.png'}, {'+duration': [1, '+', ['{intelligence}' , '/', '100']]},
                'Gain a temporal shield that protects you by stopping time whenever you are in danger. Can stop time for up to {+duration} seconds per adventure.'),
    'dispell': spellAction('spell', {'icon': jobIcons.sage, 'tags': ['blast'], 'height': 20, 'color': 'grey', 'alpha': .4},
                    {'+range': 10, '+area': [8, '+', ['{intelligence}', '/', '100']], '+cooldown': 15,
                    '$alwaysHits': 'Never misses', '$debuff': debuffEffect({}, {'+*magicResist': .5, '+*magicBlock': .5, '$duration': 'forever', '+maxStacks': 3})},
                    'Premanently reduce the magic resistances of all enemies in a large area.'),
    'meteor': spellAction('spell', {'icon': 'gfx/496RpgIcons/spellMeteor.png', 'animation': projectileAnimations.fireball, 'tags': ['rain'],
                          'heightRatio': 1, 'minTheta': Math.PI, 'color': 'brown', 'alpha': .4, 'size': 30, 'gravity': .5},
                       {'+count': [2, '+', ['{intelligence}', '/', '100']], '+explode': 1, '+power': ['{magicPower}', '/', 2],
                       '+range': 10, '+area': [3, '+', ['{intelligence}', '/', '200']], '+cooldown': 25, '$alwaysHits': 'Never misses'},
                        'Rain {+count} meteors down on your enemies each dealing {+power} damage.'),
    secondWind: spellAction('recover', {'icon': 'gfx/496RpgIcons/spellHeal.png', showName: true, 'target': 'self'},
        {
            '$instantCooldown': '*', '+uses': 2, '+prepTime': .2, '+recoveryTime': .1,
        },
        'Stops health loss and resets all cooldowns.'),

};
// The skill key should be applied as a tag to each skill.
for (const skillKey in skills) {
    skills[skillKey].tags.unshift(skillKey);
}
