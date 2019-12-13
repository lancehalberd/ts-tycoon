import { ActionStats, ActorStats, GuildStats } from 'app/types';

export const allGuildVariables: {[key in keyof GuildStats]: string} = {
    'maxAnima': 'Maximum anima the player can hold, increased by acquiring and upgrading anima stashes',
    'maxCoins': 'Maximum coins the player can hold, increased by acquiring and upgrading coin stashes',
    'maxHeroes': 'Maximum number of heroes the guild can hold, increased by acquiring more beds',
    'hasMap': 'Whether the guild has access to the world map.',
    'hasItemCrafting': 'Whether the guild has access to item crafting',
    'hasJewelCrafting': 'Whether the guild has access to jewel crafting',
};
// These are the only variables on actors that can be targeted by effects.
export const allActorVariables: {[key in keyof ActorStats]: string} = {
    'level': 'The level of the actor',
    'levelCoefficient': 'This coefficient is used in several stats as a base for exponential scaling such as maxHealth, magicPower, armor, block and magic block',
    'dexterity': '.',
    'strength': '.',
    'intelligence': '.',
    'maxHealth': '.',
    'healthRegen': '.',
    'tenacity': 'Minimum number of seconds for this actor to go from full health to 0 health',
    'speed': '.',
    'magicPower': '.',
    // These stats are used as input into the actual range/damage stats on abilities/attacks.
    // For example spells use magicPower as input to damage, which is intelligence + average weaponMagicDamage.
    'minWeaponPhysicalDamage': '.', 'maxWeaponPhysicalDamage': '.',
    'minWeaponMagicDamage': '.', 'maxWeaponMagicDamage': '.',
    'weaponRange': '.',
    // defensive stats
    'evasion': '.',
    'block': '.', 'magicBlock': '.', 'armor': '.', 'magicResist': '.',
    // special traits
    'cloaking': '.', 'overHeal': '.', 'increasedDrops': '.',
    'reducedDivinityCost': 'Reduces the divinity cost to level at shrines by this percent',
    'equipmentMastery': '.', 'invulnerable': '.', 'maxBlock': '.', 'maxMagicBlock': '.', 'maxEvasion': '.',
    'uncontrollable': '.', 'twoToOneHanded': '.',
    'overHealReflection': '.',
    'healOnCast': '.',
    'castKnockBack': '.',
    // Used by Throwing Paradigm Shift which turns throwing weapons into melee weapons.
    'setRange': 'Override melee/ranged tags and weaponRange to specific values',
    'cannotAttack': 'Set to prevent a character from using actions with attack tag.',
    'healingAttacks': 'Set to make basic attack heal allies instead of damage enemies.',
    'imprintSpell': 'Staff paradigm shift imprints spells on weapon to replace basic attack stats',
    // tracked for debuffs that deal damage over time
    'damageOverTime': '.',
    // For enemy loot and color
    'coins': '.', 'anima': '.', 'lifeBarColor': '.', 'scale': '.',
    'tint': 'Color to of glowing tint', 'tintMaxAlpha': 'Max alpha for tint.', 'tintMinAlpha': 'Min alph for tint.'
};
// These are variables that can be targeted by effects on any action.
export const commonActionVariables: {[key in keyof ActionStats]: string} = {
    // core action stats
    'accuracy': 'Checked against target\'s evasion to determine if this will hit the target.',
    'range': 'How far away this ability can target something.',
    'attackSpeed': 'How many times can this ability be used in one second.',
    'minPhysicalDamage': 'The minimum physical damage of this skill.',
    'maxPhysicalDamage': 'The maximum physical damage of this skill.',
    'minMagicDamage': 'The minimum magic damage of this skill.',
    'maxMagicDamage': 'The maximum magic damage of this skill.',
    'critChance': 'The percent chance for this ability to strike critically.',
    'critDamage': 'The percentage of bonus damage critical strikes gain.',
    'critAccuracy': 'The percentage of bonus accuracy critical strikes gain.',
    'prepTime': 'Time the character must wait before using this action',
    'recoveryTime': 'Time the character must wait after using this action',
    // common skill stats
    'cooldown': 'How long you have to wait before this skill can be used again.',
    'power': 'How powerful a spell is',
    'duration': 'How long this effect lasts.',
    'area': 'The radius of this skill\'s effect.',
    'buff': 'Some skills buff the user or allies.',
    'debuff': 'Some skills debuff enemies.',
    // various effects on hit
    'poison': 'Percentage of damage to deal each second over time.',
    'damageOnMiss': '.',
    'slowOnHit': '.',
    'healthGainOnHit': '.',
    'cleave': '.',
    'cleaveRange': '.',
    'knockbackChance': '.',
    'knockbackDistance': '.',
    'knockbackRotation': 'How much to rotate targets that are knocked back.',
    'cull': '.',
    'armorPenetration': '.',
    'instantCooldownChance': '.', // %chance to ignore cooldown for an action
    'heals': 'Attack damage heals the target instead of hurting them.',
    'magicToPhysical': 'Magic damage applies as physical damage instead. For spell paradigm shift.',
    // special flags
    'alwaysHits': '.',
    'chaining': '.',
    'criticalPiercing': '.',
    'domino': '.',
    'doubleStrike': '.',
    'firstStrike': '.',
    'ignoreArmor': '.',
    'ignoreResistance': '.',
    'instantCooldown': '.',
    'pullsTarget': '.',
    'undodgeable': '.',
    'dodge': 'This ability dodges incoming attacks. Only implemented for counter attack right now.'
};

export const allRoundedVariables = {
    'dexterity' : true, 'strength': true, 'intelligence': true,
    'maxHealth': true, 'speed': true,
    'coins': true, 'anima': true,
    'evasion': true, 'block': true, 'magicBlock': true, 'armor': true,
    'maxCoins': true, 'maxAnima': true
};