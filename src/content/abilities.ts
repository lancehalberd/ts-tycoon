import { buffEffect, debuffEffect, skills } from 'app/content/skills';
import { createCanvas } from 'app/dom';
import { JobIcon, jobIcons } from 'app/content/jobs';
import TintIcon from 'app/content/TintIcon';
import { Ability, Action, ActionAbility, ActionData, ArrayFrame, Bonuses, Frame, Renderable } from 'app/types';
import { requireImage } from 'app/images';

/**
 * Notes on targeting skills:
 * This system is very ad hoc and should probably be cleaned up as it becomes clearer what the actual needs of the system are.
 * Essentially every time a stat is calculated it looks for modifiers that potentially target its value. These can target the name of
 * the stat directly, or some set of filters in the case that the modifier is not intended to modify all values with the stat name.
 *
 * Modifying all values with the given key:
 * [operator][key] {'+range': 5} will add 5 to the base value of range for computed objects, including stats on actors, actions and buffs.
 *
 * Modifying values with the given key on skills objects that include the given tag:
 * [operator][tag]:[key] {'*buff:duration': 2} will double the value of duration on all computed objects that include the tag 'buff'.
 * Note that some tags are applied based on the actor, not on the explicit tags on the object being processed. For example:
 * '+throwing:range' will apply to all skills a player uses provided they are using a throwing weapon.
 * '+revive:power' will apply only to the revive skill. The name of a skill is automatically converted to a special tag for targeting.
 * This could cause trouble if the tag generated for a skill name conflicted with another tag. For instance if we had both a revive skill
 * and a revive tag, there is no way to target those individually.
 */
/*
Ability outlines for each class:

xxx 1: Ability 1
xxx Minor stat boost (shared)
xxx 3: Specialization boost 1
xxx Flat defense boost (shared)
xxx Flat offense boost (shared)
xxx 5: Ability 2
xxx Scaling defense boost (shared)
___ 6: Specialization Paradigm Shift - changes how a specialization works.
xxx Scaling offense boost (shared)
xxx 7: Specialization boost 2
xxx Major stat boost (shared)
xxx 9: Specialization boost 3
xxx 10: Ability 3
*/

const effectAccuracy: ArrayFrame = ['gfx/militaryIcons.png', 65, 194, 12, 12, 8, 8];
const effectSourcePoison: ArrayFrame = ['gfx/militaryIcons.png', 51, 74, 16, 16, 0, 0];

export function getAbilityIconSource(ability: Ability): Frame | Renderable {
    if (!ability) return null;
    let icon = ability.icon;
    if (ability.action) icon = icon || ability.action.icon;
    if (ability.reaction) icon = icon || ability.reaction.icon;
    if (!icon) icon = 'gfx/496RpgIcons/openScroll.png';
    if (typeof icon === 'string') {
        return {'image': requireImage(icon), x: 0, y: 0, w: 34, h: 34};
    }
    return icon;
}
const basicAttack: ActionAbility = {name: 'Basic Attack', 'action': skills.basicAttack};
// Passives
const minorDexterity: Ability = {name: 'Minor Dexterity', 'bonuses': {'+dexterity': [10, '+', '{level}']}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#0f0')};
const flatEvasion: Ability = {name: 'Basic Evasion', 'bonuses': {'+evasion': 10}};
const flatRangedAttackDamage: Ability = {name: 'Archery', bonuses: {'+ranged:attack:weaponPhysicalDamage': 8}};
const percentEvasion: Ability = {name: 'Enhanced Evasion', 'bonuses': {'%evasion': 0.2}};
const percentAttackSpeed: Ability = {name: 'Finesse', 'bonuses': {'%attackSpeed': 0.2}};
const majorDexterity: Ability = {name: 'Major Dexterity', 'bonuses': {'+dexterity': 30, '*dexterity': 1.1}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#0f0')};
const minorIntelligence: Ability = {name: 'Minor Intelligence', 'bonuses': {'+intelligence': [10, '+', '{level}']}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#00f')};
const flatBlock: Ability = {name: 'Basic Blocking', 'bonuses': {'+block': 10}};
const flatMagicDamage: Ability = {name: 'Ensorcel', bonuses: {'+magic:weaponMagicDamage': 6}};
const percentBlocking: Ability = {name: 'Enhanced Blocking', 'bonuses': {'%block': 0.2}};
const percentMagicDamage: Ability = {name: 'Resonance', 'bonuses': {'%weaponMagicDamage': .2}};
const majorIntelligence: Ability = {name: 'Major Intelligence', 'bonuses': {'+intelligence': 30, '*intelligence': 1.1}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#00f')};
const minorStrength: Ability = {name: 'Minor Strength', 'bonuses': {'+strength': [10, '+', '{level}']}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#f00')};
const flatArmor: Ability = {name: 'Basic Toughness', 'bonuses': {'+armor': 10}};
const flatMeleeAttackDamage: Ability =  {name: 'Sparring', bonuses: {'+melee:attack:weaponPhysicalDamage': 10}};
const percentArmor: Ability = {name: 'Enhanced Toughness', 'bonuses': {'%armor': 0.2}};
const percentPhysicalDamage: Ability = {name: 'Ferocity', 'bonuses': {'%weaponPhysicalDamage': 0.2}};
const majorStrength: Ability = {name: 'Major Strength', 'bonuses': {'+strength': 30, '*strength': 1.1}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#f00')};
const minorVigor: Ability = {name: 'Minor Vigor', 'bonuses': {'+dexterity': [5, '+', ['{level}', '/', 2]], '+strength': [5, '+', ['{level}', '/', 2]]}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#ff0')};
const flatMovementSpeed: Ability = {name: 'Basic Mobility', 'bonuses': {'+speed': 20}};
const flatCriticalChance: Ability =  {name: 'Find Weakness', bonuses: {'+critChance': 0.02}};
const percentMovementSpeed: Ability = {name: 'Enhanced Mobility', 'bonuses': {'%speed': 0.2}};
const percentCriticalChance: Ability = {name: 'Precision', 'bonuses': {'%critChance': 0.2}};
const majorVigor: Ability = {name: 'Major Vigor', 'bonuses': {'+dexterity': 15, '*dexterity': 1.05, '+strength': 15, '*strength': 1.05}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#ff0')};
const minorWill: Ability = {name: 'Minor Will', 'bonuses': {'+strength': [5, '+', ['{level}', '/', 2]], '+intelligence': [5, '+', ['{level}', '/', 2]]}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#f0f')};
const flatMagicBlock: Ability = {name: 'Basic Warding', 'bonuses': {'+magicBlock': 5}};
const flatMagicPower: Ability =  {name: 'Arcane Potency', bonuses: {'+magicPower': 60}};
const percentMagicBlock: Ability = {name: 'Enhanced Warding', 'bonuses': {'%magicBlock': 0.2}};
const percentMagicPower: Ability = {name: 'Amplify', 'bonuses': {'%magicPower': 0.4}};
const majorWill: Ability = {name: 'Major Will', 'bonuses': {'+strength': 15, '*strength': 1.05, '+intelligence': 15, '*intelligence': 1.05}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#f0f')};
const minorCharisma: Ability = {name: 'Minor Charisma', 'bonuses': {'+dexterity': [5, '+', ['{level}', '/', 2]], '+intelligence': [5, '+', ['{level}', '/', 2]]}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#0ff')};
const flatDuration: Ability = {name: 'Basic Channeling', 'bonuses': {'+duration': 2}};
const flatAreaOfEffect: Ability =  {name: 'Extension', bonuses: {'+area': 2}};
const percentDuration: Ability = {name: 'Enhanced Channeling', 'bonuses': {'%duration': 0.2}};
const percentAreaOfEffect: Ability = {name: 'Influence', 'bonuses': {'%area': 0.2}};
const majorCharisma: Ability = {name: 'Major Charisma', 'bonuses': {'+dexterity': 15, '*dexterity': 1.05, '+intelligence': 15, '*intelligence': 1.05}, 'icon': new TintIcon('gfx/upArrowsTint.png', '#0ff')};
const healthPerLevel: Ability = {name: 'Life Force', 'bonuses': {'+maxHealth': [5, '*', '{level}']}};
const flatRange: Ability = {name: 'Farsight', 'bonuses': {'+ranged:range': 1}};
const percentHealth: Ability = {name: 'Larger than Life', 'bonuses': {'%maxHealth': 0.2, '+scale': .2}};
const percentAccuracy: Ability = {name: 'Concentration', 'bonuses': {'%accuracy': 0.4}};
const cooldownReduction: Ability = {name: 'Acuity', 'bonuses': {'%cooldown': -0.05}};
// Specialization
const throwingPower: Ability = {name: 'Throwing Power', 'icon': 'gfx/496RpgIcons/buffThrown.png', 'bonuses': {'%throwing:weaponPhysicalDamage': .3, '+throwing:weaponRange': 2}};
const throwingDamage: Ability = {name: 'Throwing Mastery', 'icon': 'gfx/496RpgIcons/buffThrown.png', 'bonuses': {'%throwing:weaponPhysicalDamage': .2, '%throwing:attackSpeed': .2}};
const throwingCriticalChance: Ability = {name: 'Throwing Precision', 'icon': 'gfx/496RpgIcons/buffThrown.png', 'bonuses': {'%throwing:critChance': .3, '%throwing:attackSpeed': .3}};
const throwingParadigmShift: Ability = {name: 'Melee Throwing', 'icon': 'gfx/496RpgIcons/buffThrown.png', 'bonuses': {'$throwing:setRange': 'melee', '$throwing:weaponRange': 1, '*throwing:weaponDamage': 1.3, '*throwing:attackSpeed': 1.3}};
const rangedAccuracy: Ability = {name: 'Ranged Accuracy', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'%ranged:accuracy': .3, '+ranged:range': 1}};
const rangedDamage: Ability = {name: 'Ranged Damage', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'%ranged:weaponDamage': .2, '+ranged:range': 1}};
const rangedAttackSpeed: Ability = {name: 'Ranged Attack Speed', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'%ranged:attackSpeed': .2, '+ranged:range': 1}};
const rangedParadigmShift: Ability = {name: 'Close Quarters', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'*ranged:range': .5, '*ranged:weaponDamage': 1.3, '*ranged:accuracy': 1.3}};
const bowRange: Ability = {name: 'Bow Range', 'icon': 'gfx/496RpgIcons/buffBow.png', 'bonuses': {'+bow:weaponRange': 3, '+bow:critDamage': .5}};
const bowPhysicalDamage: Ability = {name: 'Physical Bow Damage', 'icon': 'gfx/496RpgIcons/buffBow.png', 'bonuses': {'%bow:weaponPhysicalDamage': 0.3, '+bow:critDamage': 0.3}};
const bowDamage: Ability = {name: 'Bow Damage', 'icon': 'gfx/496RpgIcons/buffBow.png', 'bonuses': {'%bow:weaponDamage': 0.3, '+bow:critDamage': .3}};
const bowParadigmShift: Ability = {name: 'One Handed Archery', 'icon': 'gfx/496RpgIcons/buffBow.png', 'bonuses': {'*bow:weaponRange': .5, '$bow:twoToOneHanded': 'Equipping a bow only uses one hand.'}};
const fistDamage: Ability = {name: 'Fist Damage', 'icon': 'gfx/496RpgIcons/buffFist.png', 'bonuses': {'%fist:weaponPhysicalDamage': .3, '+fist:critDamage': .3}};
const fistCriticalChance: Ability = {name: 'Fist Precision', 'icon': 'gfx/496RpgIcons/buffFist.png', 'bonuses': {'%fist:critChance': .3, '%fist:accuracy': .3}};
const fistAttackSpeed: Ability = {name: 'Fist Attack Speed', 'icon': 'gfx/496RpgIcons/buffFist.png', 'bonuses': {'%fist:attackSpeed': .2, '%fist:weaponPhysicalDamage': .2}};
const fistParadigmShift: Ability = {name: 'Jujutsu', 'icon': 'gfx/496RpgIcons/buffFist.png', 'bonuses': {'*fist:weaponDamage': 2, '+fist:counterAttack:chance': .3, '$fist:cannotAttack': 'Cannot attack', '$fist:counterAttack:dodge': 'Dodge countered attacks.'}};
const swordPhysicalDamage: Ability = {name: 'Sword Damage', 'icon': 'gfx/496RpgIcons/buffSword.png', 'bonuses': {'%sword:weaponPhysicalDamage': .3, '%sword:critChance': .3}};
const swordAccuracy: Ability = {name: 'Sword Accuracy', 'icon': 'gfx/496RpgIcons/buffSword.png', 'bonuses': {'%sword:accuracy': .5, '+sword:critChance': .2}};
const swordAttackSpeed: Ability = {name: 'Sword Attack Speed', 'icon': 'gfx/496RpgIcons/buffSword.png', 'bonuses': {'%sword:attackSpeed': .2, '%sword:weaponPhysicalDamage': .2}};
const swordParadigmShift: Ability = {name: 'Two Hands', 'icon': 'gfx/496RpgIcons/buffSword.png', 'bonuses': {'*noOffhand:sword:weaponDamage': 1.5, '*noOffhand:sword:attackSpeed': .75}};
const greatswordDamage: Ability = {name: 'Greatsword Damage', 'icon': 'gfx/496RpgIcons/buffGreatSword.png', 'bonuses': {'%greatsword:weaponDamage': .3, '%greatsword:critChance': .3}};
const greatswordPhysicalDamage: Ability = {name: 'Greatsword Physical Damage', 'icon': 'gfx/496RpgIcons/buffGreatSword.png', 'bonuses': {'%greatsword:weaponPhysicalDamage': .4, '%greatsword:accuracy': .2}};
const greatswordAccuracy: Ability = {name: 'Greatsword Accuracy', 'icon': 'gfx/496RpgIcons/buffGreatSword.png', 'bonuses': {'%greatsword:accuracy': .5, '%greatsword:weaponPhysicalDamage': 0.2}};
const greatswordParadigmShift: Ability = {name: 'Greatsword Wave', 'icon': 'gfx/496RpgIcons/buffGreatSword.png', 'bonuses': {'*greatsword:weaponRange': 2, '*greatsword:attackSpeed': 0.5}};
const wandRange: Ability = {name: 'Wand Range', 'icon': 'gfx/496RpgIcons/buffWand.png', 'bonuses': {'+wand:weaponRange': 2, '%wand:weaponMagicDamage': .3}};
const wandAttackSpeed: Ability = {name: 'Wand Attack Speed', 'icon': 'gfx/496RpgIcons/buffWand.png', 'bonuses': {'%wand:attackSpeed': .2, '%wand:weaponMagicDamage': .2}};
const wandCritChance: Ability = {name: 'Wand Critical Chance', 'icon': 'gfx/496RpgIcons/buffWand.png', 'bonuses': {'%wand:critChance': .3, '%wand:weaponMagicDamage': .3}};
const wandParadigmShift: Ability = {name: 'Healing Attacks', 'icon': 'gfx/496RpgIcons/buffWand.png', 'bonuses': {'$wand:healingAttacks': true}, 'action': skills.healingAttack};
const staffDamage: Ability = {name: 'Staff Damage', 'icon': 'gfx/496RpgIcons/buffStaff.png', 'bonuses': {'%staff:weaponDamage': .5, '%staff:accuracy': .2}};
const staffCritDamage: Ability = {name: 'Staff Crit Damage', 'icon': 'gfx/496RpgIcons/buffStaff.png', 'bonuses': {'+staff:critDamage': .3, '%staff:weaponMagicDamage': .3}};
const staffAccuracy: Ability = {name: 'Staff Accuracy', 'icon': 'gfx/496RpgIcons/buffStaff.png', 'bonuses': {'%staff:accuracy': .3, '%staff:weaponDamage': .3}};
const staffParadigmShift: Ability = {name: 'Spell Staff', 'icon': 'gfx/496RpgIcons/buffStaff.png', 'bonuses': {'$staff:imprintSpell': 'The last spell you cast is imprinted on your weapon.'}};
const spellCDR: Ability = {name: 'Spell Cooldown Reduction', 'bonuses': {'%spell:cooldown': -.1}};
const spellPower: Ability = {name: 'Spell Power', 'bonuses': {'%spell:power': .4, '+spell:range': 2}};
const spellPrecision: Ability = {name: 'Spell Precision', 'bonuses': {'%spell:critChance': .3, '+spell:critDamage': .3}};
const spellParadigmShift: Ability = {name: 'Secular Spells', 'bonuses': {'$spell:magicToPhysical': 'Magic damage is dealt as physical damage.'}};
const axePhysicalDamage: Ability = {name: 'Axe Physical Damage', 'icon': 'gfx/496RpgIcons/buffAxe.png', 'bonuses': {'%axe:weaponPhysicalDamage': .4, '%axe:accuracy': .2}};
const axeAttackSpeed: Ability = {name: 'Axe Attack Speed', 'icon': 'gfx/496RpgIcons/buffAxe.png', 'bonuses': {'%axe:attackSpeed': .4, '%axe:accuracy': .2}};
const axeCritDamage: Ability = {name: 'Axe Critical Damage', 'icon': 'gfx/496RpgIcons/buffAxe.png', 'bonuses': {'+axe:critDamage': .3, '%axe:weaponPhysicalDamage': .3}};
//const axeParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
const criticalDamage: Ability = {name: 'Critical Damage', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'+critDamage': .5}};
const criticalStrikes: Ability = {name: 'Critical Strikes', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'%critChance': .2, '+critDamage': .3}};
const criticalAccuracy: Ability = {name: 'Critical Accuracy', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'+critAccuracy': .5, '%critChance': .2}};
//const criticalParadigmShift: Ability = {name: '', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'%:': .3, '%:': .3}};
const oneHandedDamage: Ability = {name: 'One Handed Damage', 'bonuses': {'%oneHanded:weaponDamage': .2, '%oneHanded:attackSpeed': .2}};
const oneHandedCritChance: Ability = {name: 'One Handed Critical Chance', 'bonuses': {'%oneHanded:critChance': .2, '%oneHanded:attackSpeed': .2}};
const oneHandedCritDamage: Ability = {name: 'One Handed Critical Damage', 'bonuses': {'%oneHanded:critDamage': .2, '%oneHanded:attackSpeed': .2}};
const oneHandedParadigmShift: Ability = {name: 'Dual Wield', 'bonuses': {'*noOffhand:oneHanded:attackSpeed': 1.5}};
const shieldDexterity: Ability = {name: 'Shield Agility', 'icon': 'gfx/496RpgIcons/buffShield.png', 'bonuses': {'%shield:attackSpeed': .3, '%shield:evasion': .3}};
const shieldStrength: Ability = {name: 'Shield Toughness', 'icon': 'gfx/496RpgIcons/buffShield.png', 'bonuses': {'%shield:weaponDamage': .3, '%shield:armor': .3}};
const shieldIntelligence: Ability = {name: 'Shield Tactics', 'icon': 'gfx/496RpgIcons/buffShield.png', 'bonuses': {'%shield:accuracy': .3, '%shield:block': .3, '%shield:magicBlock': .3}};
//'shieldParadigmShift': {name: '', 'icon': 'gfx/496RpgIcons/buffShield.png', 'bonuses': {'%:': .3, '%:': .3}}, // Dual wield shields, no basic attack
const polearmRange: Ability = {name: 'Polearm Range', 'icon': 'gfx/496RpgIcons/buffPolearm.png', 'bonuses': {'+polearm:weaponRange': 1, '%polearm:weaponPhysicalDamage': .4}};
const polearmAccuracy: Ability = {name: 'Polearm Accuracy', 'icon': 'gfx/496RpgIcons/buffPolearm.png', 'bonuses': {'%polearm:accuracy': .3, '%polearm:weaponDamage': .3}};
const polearmCritDamage: Ability = {name: 'Polearm Critical Damage', 'icon': 'gfx/496RpgIcons/buffPolearm.png', 'bonuses': {'+polearm:critDamage': .3, '%polearm:weaponPhysicalDamage': .3}};
//const polearmParadigmShift: Ability = {name: 'Crushing Blows', 'icon': 'gfx/496RpgIcons/buffPolearm.png', 'bonuses': {'*polearm:damage': .75, '*polearm:attackSpeed': .75, '+polearm:cripple': .5}};
const meleeDamage: Ability = {name: 'Melee Damage', 'bonuses': {'%melee:weaponDamage': .2, '%melee:accuracy': .2}};
const meleeAttackSpeed: Ability = {name: 'Melee Attack Speed', 'bonuses': {'%melee:attackSpeed': .2, '%melee:accuracy': .2}};
const meleeCritChance: Ability = {name: 'Melee CriticalChance', 'bonuses': {'%melee:critChance': .2, '%melee:accuracy': .2}};
//const meleeParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
const movementCDR: Ability = {name: 'Movement Cooldown Reduction', 'bonuses': {'%movement:cooldown': -.1, '%movement:distance': .1}};
const movementDamage: Ability = {name: 'Movement Damage', 'bonuses': {'%movement:damage': .3, '%movement:critDamage': .3}};
const movementPrecision: Ability = {name: 'Movement Precision', 'bonuses': {'%movement:accuracy': .3, '%movement:critChance': .3}};
//const movementParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
const minionToughness: Ability = {name: 'Ally Toughness', 'icon': jobIcons.ranger, 'bonuses': {'%minion:maxHealth': .5, '%minion:armor': .3}};
const minionDamage: Ability = {name: 'Ally Damage', 'icon': jobIcons.ranger, 'bonuses': {'%minion:damage': .3, '%minion:accuracy': .3}};
const minionFerocity: Ability = {name: 'Ally Ferocity', 'icon': jobIcons.ranger, 'bonuses': {'%minion:attackSpeed': .5, '%minion:critChance': .3}};
//const minionParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
const magicMagicDamage: Ability = {name: 'Magic Weapon Magic Damage', 'bonuses': {'%magic:weaponMagicDamage': .3, '%magic:accuracy': .3}};
const magicAttackSpeed: Ability = {name: 'Magic Weapon Attack Speed', 'bonuses': {'%magic:attackSpeed': .2, '%magic:critChance': .2}};
const magicDamage: Ability = {name: 'Magic Weapon Damage', 'bonuses': {'%magic:weaponDamage': .2, '%magic:critDamage': .3}};
//const magicParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
const daggerAttackSpeed: Ability = {name: 'Dagger Attack Speed', 'icon': 'gfx/496RpgIcons/buffDagger.png', 'bonuses': {'%dagger:attackSpeed': .2, '%dagger:critChance': .2}};
const daggerCritChance: Ability = {name: 'Dagger Critical Chance', 'icon': 'gfx/496RpgIcons/buffDagger.png', 'bonuses': {'%dagger:critChance': .3, '%dagger:weaponDamage': .2}};
const daggerDamage: Ability = {name: 'Dagger Damage', 'icon': 'gfx/496RpgIcons/buffDagger.png', 'bonuses': {'%dagger:weaponDamage': .2, '%dagger:attackSpeed': .2}};
//const daggerParadigmShift: Ability = {name: '', 'bonuses': {'%:': .3, '%:': .3}};
// Tier 1
const juggler: Ability = {name: 'Juggling', 'icon': jobIcons.juggler, 'bonuses': {'$throwing:attack:chaining': 'Projectiles ricochet between targets until they miss.'}};
const sap: Ability = {
    name: 'Sap', 'icon': jobIcons.juggler, 'bonuses': {'+slowOnHit': .1, '+healthGainOnHit': 1},
    onMissEffect: {
        variableObjectType: 'trigger',
        bonuses: {'$debuff': debuffEffect({'icons':[effectAccuracy]}, {'+-evasion': 2, '$duration': 'forever'})}
    },
    helpText: 'Reduce enemy evasion on miss.'
};
const dodge: Ability = {name: 'Dodge', 'bonuses': {'+evasion': 2}, 'reaction': skills.dodge};
const acrobatics: Ability = {name: 'Acrobatics', 'icon': jobIcons.dancer, 'bonuses': {'+evasion': 2, '-dodge:cooldown': 2, '*dodge:distance': 2}};
const bullseye: ActionAbility = {name: 'Bullseye', 'action': skills.bullseye};
const bullseyeCritical: Ability = {name: 'Dead On', 'icon': 'gfx/496RpgIcons/target.png', 'bonuses': {'+bullseye:critChance': 1}, 'helpText': 'Bullseye always strikes critically.'};
const blackbelt: Ability = {
    name: 'Martial Arts', 'icon': jobIcons.blackbelt,
    bonuses: {
        '*unarmed:damage': 3, '*unarmed:attackSpeed': 1.5, '+unarmed:critChance': .15,
        '*unarmed:critDamage': 2, '*unarmed:critAccuracy': 2
    }
};
const vitality: Ability = {name: 'Vitality', 'icon': jobIcons.blackbelt, 'bonuses': {'+healthRegen': ['{strength}', '/', 10], '+strength': 5}};
const counterAttack: Ability = {name: 'Counter Attack', 'icon': jobIcons.blackbelt, 'bonuses': {'+strength': 5}, 'reaction': skills.counterAttack};
const counterPower: Ability = {name: 'Improved Counter', 'icon': jobIcons.blackbelt, 'bonuses': {'+strength': 5, '+counterAttack:attackPower': .5, '*counterAttack:accuracy': 1.5}};
const counterChance: Ability = {name: 'Heightened Reflexes', 'icon': jobIcons.blackbelt, 'bonuses': {'+dexterity': 5, '+counterAttack:chance': .1}};
const dragonPunch: ActionAbility = {name: 'Dragon Punch', 'icon': jobIcons.blackbelt, 'action': skills.dragonPunch};
const priest: Ability = {name: 'Divine Blessing', 'icon': 'gfx/496RpgIcons/abilityDivineBlessing.png', 'bonuses': {'+healOnCast': .1, '+overHealReflection': .5, '+castKnockBack': 9}};
const heal: ActionAbility = {name: 'Heal', 'bonuses': {'+intelligence': 5}, 'action': skills.heal};
const reflect: ActionAbility = {name: 'Reflect', 'bonuses': {'+intelligence': 10}, 'action': skills.reflect};
const revive: Ability = {name: 'Revive', 'bonuses': {'+intelligence': 10}, 'reaction': skills.revive};
const reviveInstantCooldown: Ability = {name: 'Miracle', 'bonuses': {'$revive:instantCooldown': '*'}};
const reviveInvulnerability: Ability = {name: 'Halo', 'bonuses': {'$revive:buff': buffEffect({}, {'+duration': 2, '$$invulnerable': 'Invulnerability'})}};
// Tier 2
const corsair: Ability = {
    name: 'Venom', 'icon': 'gfx/496RpgIcons/abilityVenom.png', bonuses: {'+poison': .2},
    onHitEffect: {
        'variableObjectType': 'trigger',
        'bonuses': {'$debuff': debuffEffect({'icons':[effectSourcePoison]}, {'+*weaponDamage': .9, '+duration': 2})}
    },
    'helpText': "Apply a stacking debuff with every hit that weakens enemies' attacks and deals damage over time."
};
const hook: ActionAbility = {name: 'Grappling Hook', 'action': skills.hook};
const hookRange: Ability = {name: 'Long Shot', 'bonuses': {'+hook:range': 5, '+hook:cooldown': -3}};
const hookDrag: Ability = {name: 'Barbed Wire', 'bonuses': {'+hook:dragDamage': .1}};
const hookStun: Ability = {name: 'Tazer Wire', 'bonuses': {'+hook:dragStun': .1}};
const hookPower: Ability = {name: 'Power Shot', 'bonuses': {'+hook:rangeDamage': .1}};
const deflect: Ability = {name: 'Deflect', 'bonuses': {'+dexterity': 10, '+strength': 5}, 'reaction': skills.deflect};
const deflectDamage: Ability = {name: 'Deflect Power', 'bonuses': {'*deflect:damageRatio': 2, '+strength': 5}};
const plunder: ActionAbility = {name: 'Plunder', 'bonuses': {'+dexterity': 5, '+strength': 10}, 'action': skills.plunder};
const deepPockets: Ability = {name: 'Deep Pockets', 'bonuses': {'+dexterity': 10, '+plunder:count': 1}, 'helpText': 'Steal an additional enchantment when you use plunder.'};
const robBlind: Ability = {name: 'Rob Blind', 'bonuses': {'+strength': 10, '+plunder:count': 2}, 'helpText': 'Steal two additional enchantments when you use plunder.'};
const paladin: Ability = {name: 'Faith', 'icon': 'gfx/496RpgIcons/abilityDivineBlessing.png', 'bonuses': {'*buff:duration': 1.5, '+buff:%damage': .1}};
const protect: ActionAbility = {name: 'Protect', 'bonuses': {'+intelligence': 5}, 'action': skills.protect};
const banishingStrike: ActionAbility = {name: 'Banishing Strike', 'bonuses': {'+intelligence': 5, '+strength': 5}, 'action': skills.banishingStrike};
const purify: Ability = {name: 'Purify', 'bonuses': {'+intelligence': 10, '+banishingStrike:purify': 4}, 'helpText': 'Remove all enchantments from enemies hit by banishing strike'};
const shockwave: Ability = {name: 'Shockwave', 'bonuses': {'+strength': 10, '+banishingStrike:shockwave': 1}, 'helpText': 'Banishing strike also damages knocked back enemies'};
const aegis: Ability = {name: 'Aegis', 'bonuses': {'+magicBlock': 5, '+block': 10}, 'reaction': skills.aegis};
const dancer: Ability = {name: 'Dancing', 'icon': 'gfx/496RpgIcons/openScroll.png', 'bonuses': {'+evasion': 3}, 'reaction': skills.evadeAndCounter};
const distract: Ability = {name: 'Distract', 'bonuses': {'+evasion': 3}, 'reaction': skills.distract};
const charm: ActionAbility = {name: 'Charm', 'bonuses': {'+dexterity': 5, '+intelligence': 5}, 'action': skills.charm};
const dervish: Ability = {
    name: 'Whirling Dervish', 'bonuses': {'+dexterity': 15},
    onHitEffect: {
        'variableObjectType': 'trigger',
        'bonuses': {'$buff': buffEffect({}, {'+%attackSpeed': .04, '+%speed': .04, '+duration': 1})}
    },
    helpText: "Gain momentum with each hit you land granting increased attack speed and movement speed."
};
// Tier 3
const ranger: Ability = {name: 'Taming', 'minionBonuses': {'*maxHealth': 2, '*attackSpeed': 1.5, '*speed': 1.2}};
const pet: Ability = {name: 'Pet', 'action': skills.pet};
const petFood: Ability = {name: 'Pet Food', 'bonuses': {'-pet:cooldown': 3}, 'minionBonuses': {'*pet:maxHealth': 1.5}};
const petTraining: Ability = {name: 'Pet Training', 'bonuses': {'-pet:cooldown': 3}, 'minionBonuses': {'*pet:damage': 1.5}};
const whistle: Ability = {name: 'Whistle', 'bonuses': {'*pet:cooldown': .5}};
const net: Ability = {name: 'Net Trap', 'action': skills.net};
const netArea: Ability = {name: 'Wide Net', 'bonuses': {'+net:area': 5}};
const sicem: ActionAbility = {name: 'Sic \'em', 'bonuses': {'+dexterity': 10}, 'action': skills.sicem};
const unleash: Ability = {
    name: 'unleash', 'bonuses': {'+sicem:buff:+lifeSteal': .1, '+sicem:buff:duration': 2},
    helpText: 'Sicem buff grants life steal and lasts an additional 2 seconds'
};
const warrior: Ability = {name: 'Cleave', 'bonuses': {'%melee:weaponDamage': .5, '+melee:cleave': .6, '+melee:cleaveRange': 3}};
const charge: ActionAbility = {name: 'Charge', 'bonuses': {'+strength': 5}, 'action': skills.charge};
const batteringRam: Ability = {
    name: 'Battering Ram', 'bonuses': {'+charge:rangeDamage': .1},
    helpText: 'Charge deals more damage from further away.'
};
const impactRadius: Ability = {
    name: 'Impact Radius', 'bonuses': {'+charge:area': 6},
    helpText: 'Charge damage and stun applies to nearby enemies.'
};
const overpower: Ability = {name: 'Overpower', 'bonuses': {'+strength': 10, '+melee:knockbackChance': .3, '+melee:knockbackDistance': 3}};
const armorBreak: ActionAbility = {name: 'Armor Break', 'bonuses': {'+strength': 15}, 'action': skills.armorBreak};
const wizard: Ability = {name: 'Arcane Prodigy', 'bonuses': {'*spell:area': 2, '*magicPower': 2}};
const fireball: ActionAbility = {name: 'Fireball', 'bonuses': {'+intelligence': 5}, 'action': skills.fireball};
const chainReaction: Ability = {name: 'Chain Reaction', 'bonuses': {'+fireball:explode': 1}, 'helpText': 'Fireball explosions will chain an extra time.'};
const freeze: ActionAbility = {name: 'Freeze', 'bonuses': {'+intelligence': 10}, 'action': skills.freeze};
const absoluteZero: Ability = {name: 'Absolute Zero', 'bonuses': {'*freeze:slowOnHit': 2}};
const storm: ActionAbility = {name: 'Storm', 'bonuses': {'+intelligence': 15}, 'action': skills.storm};
const stormFrequency: Ability = {name: 'Lightning Rod', 'bonuses': {'*storm:hitsPerSecond': 2}};
const stormDuration: Ability = {name: 'Storm Mastery', 'bonuses': {'*storm:duration': 2}};
// Tier 4
const assassin: Ability = {name: 'First Strike', 'bonuses': {'$firstStrike': '100% critical strike chance against enemies with full health.'}};
const blinkStrike: ActionAbility = {name: 'Blink Strike', 'bonuses': {'+dexterity': 5}, 'action': skills.blinkStrike};
const cull: Ability = {name: 'Cull', 'bonuses': {'+strength': 10, '+cull': .1}, 'icon': jobIcons.assassin};
const cripple: Ability = {
    name: 'Cripple', 'bonuses': {'+strength': 10, '+dexterity': 10}, 'icon': jobIcons.assassin,
    onCritEffect: {
        'variableObjectType': 'trigger',
        'bonuses': {'$debuff': debuffEffect({}, {'+*speed': .5, '+*attackSpeed': .5, '+duration': 5, '+maxStacks': 1})}
    }
};
const darkknight: Ability = {name: 'Blood Lust', 'bonuses': {'+overHeal': .5, '+lifeSteal': .05}};
const consume: ActionAbility = {name: 'Consume', 'bonuses': {'+intelligence': 5}, 'action': skills.consume};
const soulStrike: ActionAbility = {name: 'Soul Strike', 'bonuses': {'+strength': 10}, 'action': skills.soulStrike};
const reaper: Ability = {
    name: 'Reaper', 'bonuses': {'+intelligence': 10, '+strength': 5, '+consume:count': 1, '+consume:duration': 10},
    'icon': jobIcons.darkknight,
    helpText: 'Gain the powers of consumed monsters for a short period.'
};
const bard: Ability = {name: 'Charisma', 'bonuses': {'*minion:cooldown': .6, '+minion:limit': 1, '*song:duration': 1.5, '+buff:area': 8}};
const attackSong: ActionAbility = {name: 'Furious Tocatta', 'bonuses': {'+dexterity': 10}, 'action': skills.attackSong};
const defenseSong: ActionAbility = {name: 'Rondo of Hope', 'bonuses': {'+intelligence': 10}, 'action': skills.defenseSong};
const heroSong: ActionAbility = {name: 'Hero\'s Ballade', 'bonuses': {'+intelligence': 10, '+dexterity': 10}, 'action': skills.heroSong};
// Tier 5
const sniper: Ability = {name: 'Sharp Shooter', 'bonuses': {'*bow:critChance': 1.5, '*bow:critDamage': 1.5, '$bow:criticalPiercing': 'Critical strikes hit multiple enemies.'}};
const powerShot: ActionAbility = {name: 'Power Shot', 'bonuses': {'+dexterity': 5}, 'action': skills.powerShot};
const powerShotKnockback: Ability = {name: 'Power Shot Knockback', 'bonuses': {'+dexterity': 5, '+strength': 5, '+powerShot:knockbackChance': 1, '+powerShot:knockbackDistance': 5}};
const aiming: ActionAbility = {name: 'Aiming', 'action': skills.aiming};
const snipe: ActionAbility = {name: 'Snipe', 'bonuses': {'+dexterity': 15}, 'action': skills.snipe};
const samurai: Ability = {name: 'Great Warrior', 'bonuses': {'+twoHanded:melee:physical': [2, '*', '{level}'], '+twoHanded:melee:block': [2, '*', '{level}'], '+twoHanded:melee:magicBlock': '{level}'}};
const sideStep: Ability = {name: 'Side Step', 'bonuses': {'+evasion': 2}, 'reaction': skills.sideStep};
const dragonSlayer: ActionAbility = {name: 'Dragon Slayer', 'bonuses': {'+strength': 10}, 'action': skills.dragonSlayer};
const armorPenetration: Ability = {name: 'Penetrating Strikes', 'bonuses': {'+strength': 15, '+melee:armorPenetration': .3}};
const raiseDead: ActionAbility = {name: 'Raise Dead', 'bonuses': {'+intelligence': 5}, 'action': skills.raiseDead};
const drainLife: ActionAbility = {name: 'Drain Life', 'bonuses': {'+intelligence': 10}, 'action': skills.drainLife};
const plague: ActionAbility = {name: 'Plague', 'bonuses': {'+intelligence': 15}, 'action': skills.plague};
// Tier 6
const ninja: Ability = {name: 'Ninjutsu', 'bonuses':{'$cloaking': 'Invisible while moving', '$oneHanded:doubleStrike': 'Attacks hit twice'}};
const smokeBomb: Ability = {name: 'Smoke Bomb', 'bonuses': {'+dexterity': 10}, 'reaction': skills.smokeBomb};
const throwWeapon: ActionAbility = {name: 'Throw Weapon', 'bonuses': {'+strength': 10}, 'action': skills.throwWeapon};
const shadowClone: Ability = {
    name: 'Shadow Clone', 'bonuses': {'+strength': 10, '+dexterity': 10}, 'reaction': skills.shadowClone,
    minionBonuses:  {'*shadowClone:maxHealth': .1, '*shadowClone:damage': .1, '$shadowClone:tint': 'black',
          '$shadowClone:tintMinAlpha': 0.7, '$shadowClone:tintMaxAlpha': .9}
};
const enhancer: Ability = {name: 'Enhance Spirit', 'bonuses': {'*dexterity': 2, '*strength': 2, '*intelligence': 2}};
const enhanceWeapon: ActionAbility = {name: 'Enhance Weapon', 'bonuses': {'+strength': 10, '+intelligence': 5}, 'action': skills.enhanceWeapon};
const enhanceArmor: ActionAbility = {name: 'Enhance Armor', 'bonuses': {'+strength': 5, '+intelligence': 10}, 'action': skills.enhanceArmor};
const enhanceAbility: ActionAbility = {name: 'Enhance Ability', 'bonuses': {'+strength': 10, '+intelligence': 10}, 'action': skills.enhanceAbility};
const sage: Ability = {name: 'Profound Insight', 'bonuses': {'*cooldown': .5}};
const stopTime: Ability = {name: 'Temporal Shield', 'bonuses': {'+intelligence': 10}, 'reaction': skills.stopTime};
const dispell: ActionAbility = {name: 'Dispell', 'bonuses': {'+intelligence': 15}, 'action': skills.dispell};
const meteor: ActionAbility = {name: 'Meteor', 'bonuses': {'+intelligence': 20}, 'action': skills.meteor};
const meteorShower: Ability = {
    name: 'Meteor Shower', 'bonuses': {'+intelligence': 10, '+meteor:count': ['{intelligence}', '/', '50'],
    '-meteor:area': ['{intelligence}', '/', '400'], '-meteor:power': ['{magicPower}', '/', '4']},
    'helpText': 'Summon many more, but less powerful meteors.'
};
const meteorPower: Ability = {
    name: 'Meteor Power', 'bonuses': {'+intelligence': 10, '-meteor:count': ['{intelligence}', '/', '200'],
    '+meteor:area': ['{intelligence}', '/', '100'], '+meteor:power': ['{magicPower}']},
    'helpText': 'Summon fewer, but much more powerful meteors.'
};
// Tier 7
const equipmentMastery: Ability = {name: 'Equipment Mastery', 'bonuses': {'+strength': 5, '+dexterity': 5, '+intelligence': 5, '$equipmentMastery': 'Equip gear beyond your level for a 10% penalty per level.'}};
const abilityMastery: Ability = {name: 'Ability Mastery', 'bonuses': {'+strength': 10, '+dexterity': 10, '+intelligence': 10, '+instantCooldownChance': .1}};
const tomFoolery: Ability = {name: 'Tom Foolery', 'bonuses': {'+evasion': 5}, 'reaction': skills.tomFoolery};
const mimic: Ability = {name: 'Mimic', 'reaction': skills.mimic};
const decoy: Ability = {
    name: 'Decoy', 'reaction': skills.decoy,
    minionBonuses: {
        '*decoy:maxHealth': .4, '*decoy:damage': .4, '*decoy:speed': 1.2, '$decoy:tint': 'red',
        '$decoy:tintMinAlpha': 0.5, '$decoy:tintMaxAlpha': .6
    }
};
const explode: Ability = {name: 'Decoy Burst', 'reaction': skills.explode};
// Enemy Abilities
const summoner: Ability = {
    name: 'Summoner', 'bonuses': {'*minion:limit': 2, '*minion:cooldown': .5},
    minionBonuses: {'*maxHealth': 1.5, '*weaponDamage': 1.2}
};
const summonSkeleton: ActionAbility = {name: 'Summon Skeleton', 'action': skills.summonSkeleton};
const summonCaterpillar: ActionAbility = {name: 'Spawn', 'action': skills.summonCaterpillar};
const rangeAndAttackSpeed: Ability = {name: 'Range And Attack Speed', 'bonuses': {'+range': 2, '+attackSpeed': .5}};
const dodgeHook: Ability = {name: 'Dodge then Hook', 'bonuses': {'$dodge:instantCooldown': 'hook'}};
const spellAOE: Ability = {name: 'Spell AOE', 'bonuses': {'+spell:area': 20}};
const slowSpells: Ability = {name: 'Slow Spells', 'bonuses': {'*spell:cooldown': 1.2}};
const chargeKnockback: Ability = {name: 'Charge Knockback', 'bonuses': {'+charge:knockbackChance': 1, '+charge:knockbackDistance': 10, '+charge:knockbackRotation': 30}};
const stealth: Ability = {name: 'Stealth', 'bonuses':{'$cloaking': 'Invisible while moving'}};
const dodgeNetReflect: Ability = {name: 'Dodge then Hook', 'bonuses': {'$dodge:instantCooldown': 'net', '$net:instantCooldown': 'reflect'}};
const poison: Ability = {name: 'Poison', 'onHitEffect': {'variableObjectType': 'trigger', 'bonuses': {'$debuff': debuffEffect({}, {'+*healthRegen': 0, '++damageOverTime': '{level}', '+duration': 3})}}};
const enemyDancing: Ability = {name: 'Dancing', 'reaction': skills.evadeAndCounter};
const consumeRange: Ability = {name: 'Consume Range', 'bonuses': {'+consume:range': 5}};
const consumeRatio: Ability = {name: 'Consume Range', 'bonuses': {'+consume:consumeRatio': .5}};
const howl: ActionAbility = {name: 'Howl', 'action': skills.howl};
const howlSingAttack: Ability = {name: 'Howl Sing Attack', 'bonuses': {'$howl:instantCooldown': 'attackSong', '$attackSong:instantCooldown': 'sicem'}};
const recklessCharge: ActionAbility = {name: 'Reckless Charge', 'bonuses': {'+strength': 5}, 'action': skills.recklessCharge};
const secondWind: Ability = {name: 'Second Wind', reaction: skills.secondWind};

export const abilities = {
    basicAttack,
    // Passive Abilities
    minorDexterity,
    flatEvasion,
    flatRangedAttackDamage,
    percentEvasion,
    percentAttackSpeed,
    majorDexterity,
    minorIntelligence,
    flatBlock,
    flatMagicDamage,
    percentBlocking,
    percentMagicDamage,
    majorIntelligence,
    minorStrength,
    flatArmor,
    flatMeleeAttackDamage,
    percentArmor,
    percentPhysicalDamage,
    majorStrength,
    minorVigor,
    flatMovementSpeed,
    flatCriticalChance,
    percentMovementSpeed,
    percentCriticalChance,
    majorVigor,
    minorWill,
    flatMagicBlock,
    flatMagicPower,
    percentMagicBlock,
    percentMagicPower,
    majorWill,
    minorCharisma,
    flatDuration,
    flatAreaOfEffect,
    percentDuration,
    percentAreaOfEffect,
    majorCharisma,
    healthPerLevel,
    flatRange,
    percentHealth,
    percentAccuracy,
    cooldownReduction,
    // Specialization Abilities
    throwingPower,
    throwingDamage,
    throwingCriticalChance,
    throwingParadigmShift,
    rangedAccuracy,
    rangedDamage,
    rangedAttackSpeed,
    rangedParadigmShift,
    bowRange,
    bowPhysicalDamage,
    bowDamage,
    bowParadigmShift,
    fistDamage,
    fistCriticalChance,
    fistAttackSpeed,
    fistParadigmShift,
    swordPhysicalDamage,
    swordAccuracy,
    swordAttackSpeed,
    swordParadigmShift,
    greatswordDamage,
    greatswordPhysicalDamage,
    greatswordAccuracy,
    greatswordParadigmShift,
    wandRange,
    wandAttackSpeed,
    wandCritChance,
    wandParadigmShift,
    staffDamage,
    staffCritDamage,
    staffAccuracy,
    staffParadigmShift,
    spellCDR,
    spellPower,
    spellPrecision,
    spellParadigmShift,
    axePhysicalDamage,
    axeAttackSpeed,
    axeCritDamage,
    //axeParadigmShift,
    criticalDamage,
    criticalStrikes,
    criticalAccuracy,
    //criticalParadigmShift,
    oneHandedDamage,
    oneHandedCritChance,
    oneHandedCritDamage,
    oneHandedParadigmShift,
    shieldDexterity,
    shieldStrength,
    shieldIntelligence,
    //'shieldParadigmShift,
    polearmRange,
    polearmAccuracy,
    polearmCritDamage,
    //polearmParadigmShift,
    meleeDamage,
    meleeAttackSpeed,
    meleeCritChance,
    //meleeParadigmShift,
    movementCDR,
    movementDamage,
    movementPrecision,
    //movementParadigmShift,
    minionToughness,
    minionDamage,
    minionFerocity,
    //minionParadigmShift,
    magicMagicDamage,
    magicAttackSpeed,
    magicDamage,
    //magicParadigmShift,
    daggerAttackSpeed,
    daggerCritChance,
    daggerDamage,
    //daggerParadigmShift,
    // Tier 1
    // Juggler
    juggler,
    sap,
    dodge,
    acrobatics,
    bullseye,
    bullseyeCritical,
    // Blackbelt
    blackbelt,
    vitality,
    counterAttack,
    counterPower,
    counterChance,
    dragonPunch,
    // Priest
    priest,
    heal,
    reflect,
    revive,
    reviveInstantCooldown,
    reviveInvulnerability,
    // Tier 2
    // Corsair
    corsair,
    hook,
    hookRange,
    hookDrag,
    hookStun,
    hookPower,
    deflect,
    deflectDamage,
    plunder,
    deepPockets,
    robBlind,
    // Paladin
    paladin,
    protect,
    banishingStrike,
    purify,
    shockwave,
    aegis,
    // Dancer
    dancer,
    distract,
    charm,
    dervish,
    // Tier 3
    // Ranger
    ranger,
    pet,
    petFood,
    petTraining,
    whistle,
    net,
    netArea,
    sicem,
    unleash,
    // Warrior
    warrior,
    charge,
    batteringRam,
    impactRadius,
    overpower,
    armorBreak,
    // Wizard
    wizard,
    fireball,
    chainReaction,
    freeze,
    absoluteZero,
    storm,
    stormFrequency,
    stormDuration,
    // Tier 4
    // Assassin
    assassin,
    blinkStrike,
    cull,
    // Dark Knight
    darkknight,
    consume,
    soulStrike,
    reaper,
    // Bard
    bard,
    attackSong,
    defenseSong,
    heroSong,
    // Tier 5
    // Sniper
    sniper,
    powerShot,
    powerShotKnockback,
    aiming,
    snipe,
    // Samurai
    samurai,
    sideStep,
    dragonSlayer,
    armorPenetration,
    // Sorceror
    raiseDead,
    drainLife,
    plague,
    // Tier 6
    // Ninja
    ninja,
    smokeBomb,
    throwWeapon,
    shadowClone,
    // Enhancer
    enhancer,
    enhanceWeapon,
    enhanceArmor,
    enhanceAbility,
    // Sage
    sage,
    stopTime,
    dispell,
    meteor,
    meteorShower,
    meteorPower,
    // Tier 7
    // Master
    equipmentMastery,
    abilityMastery,
    // Fool
    tomFoolery,
    mimic,
    decoy,
    explode,
    // Enemy Skills
    summoner,
    summonSkeleton,
    summonCaterpillar,
    rangeAndAttackSpeed,
    dodgeHook,
    spellAOE,
    slowSpells,
    chargeKnockback,
    stealth,
    dodgeNetReflect,
    poison,
    enemyDancing,
    consumeRange,
    consumeRatio,
    howl,
    howlSingAttack,
    recklessCharge,
    secondWind,
};
export const leapAndAct = action => ({name: 'Leap', action: skills.leap, 'bonuses': {'$leap:action': action, '+leap:prepTime': 1}});

export function telegraphedAbility(ability: ActionAbility, prepTime: number = 1): ActionAbility {
    return {
        name: ability.name,
        key: ability.key,
        bonuses: {},
        action: {
            ...ability.action,
            bonuses: {
                ...ability.action.bonuses,
                '+prepTime': prepTime,
            },
        },
    };
}
Object.entries(abilities).forEach(([key, ability]) => {
    ability.key = key;
    if (ability.action) {
        ability.action.name = ability.name;
        ability.action.key = key;
    }
    if (ability.reaction) {
        ability.reaction.name = ability.name;
        ability.reaction.key = key;
    }
});
window['abilities'] = abilities;
