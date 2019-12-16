import { accessorySlots, armorSlots, smallArmorSlots } from 'app/gameConstants';

import { EquipmentAffixData, BonusesRange } from 'app/types';

const basicHolders = ['simplequiver', 'scabbard', 'wornebaldric'];
const holders = ['neverendingquiver', 'runedscabbard', 'bandolier', 'heavybaldric', 'etchedsheath', 'cover', 'largescabbard'];
const magicHolders = ['runedamulet', 'heavyamulet'];

export const prefixes: EquipmentAffixData[][] = [];
export const prefixesByKey: {[key: string]: EquipmentAffixData} = {};
export const suffixes: EquipmentAffixData[][] = [];
export const suffixesByKey: {[key: string]: EquipmentAffixData} = {};
export const affixesByKey: {[key: string]: EquipmentAffixData} = {};

function addPrefix(level: number, name: string, tags: string | string[], bonuses: BonusesRange) {
    const key = name.replace(/\s*/g, '').toLowerCase();
    let bonusesKey = '';
    for (let bonusKey in bonuses) bonusesKey += bonusKey;
    const affix: EquipmentAffixData = {
        key, level, name, tags, bonuses, bonusesKey, prefix: true,
    };
    if (affixesByKey[key]) throw new Error('affix key ' + key + ' is already used.');
    prefixesByKey[key] = affix;
    affixesByKey[key] = affix;
    prefixes[level] = prefixes[level] || [];
    prefixes[level].push(affix);
}
function addSuffix(level: number, name: string, tags: string | string[], bonuses: BonusesRange) {
    const key = name.replace(/\s*/g, '').toLowerCase();
    let bonusesKey = '';
    for (let bonusKey in bonuses) bonusesKey += bonusKey;
    const affix: EquipmentAffixData = {
        key, level, name, tags, bonuses, bonusesKey, suffix: true,
    };
    if (affixesByKey[key]) throw new Error('affix key ' + key + ' is already used.');
    suffixesByKey[key] = affix;
    affixesByKey[key] = affix;
    suffixes[level] = suffixes[level] || [];
    suffixes[level].push(affix);
}

addPrefix(1, 'Strong', 'weapon', {'+minWeaponPhysicalDamage': 1, '+maxWeaponPhysicalDamage': 2});
addPrefix(5, 'Brutal', 'weapon', {'+minWeaponPhysicalDamage': [4,6], '+maxWeaponPhysicalDamage': [8,10]});
addPrefix(15, 'Fierce', 'weapon', {'+minWeaponPhysicalDamage': [12, 14], '+maxWeaponPhysicalDamage': [20, 22]});
addPrefix(30, 'Savage', 'weapon', {'+minWeaponPhysicalDamage': [22, 24], '+maxWeaponPhysicalDamage': [30, 32]});
addPrefix(45, 'Cruel', 'weapon', {'+minWeaponPhysicalDamage': [32, 34], '+maxWeaponPhysicalDamage': [40, 42]});
addPrefix(60, 'Bloody', 'weapon', {'+minWeaponPhysicalDamage': [35, 40], '+maxWeaponPhysicalDamage': [45, 50]});

addPrefix(1, 'Savvy', 'weapon', {'+minWeaponMagicDamage': 1, '+maxWeaponMagicDamage': 2});
addPrefix(6, 'Prespicacious', 'weapon', {'+minWeaponMagicDamage': [2,3], '+maxWeaponMagicDamage': [6,8]});
addPrefix(16, 'Shrewd', 'weapon', {'+minWeaponMagicDamage': [8, 10], '+maxWeaponMagicDamage': [12, 14]});
addPrefix(31, 'Astute', 'weapon', {'+minWeaponMagicDamage': [14, 16], '+maxWeaponMagicDamage': [20, 22]});
addPrefix(46, 'Sagacious', 'weapon', {'+minWeaponMagicDamage': [20, 22], '+maxWeaponMagicDamage': [26, 28]});
addPrefix(61, 'Profound', 'weapon', {'+minWeaponMagicDamage': [25, 30], '+maxWeaponMagicDamage': [30, 35]});

addPrefix(7, 'Angry', 'weapon', {'*weaponDamage': [102, 105, 100]});
addPrefix(17, 'Irate', 'weapon', {'*weaponDamage': [106, 112, 100]});
addPrefix(27, 'Infuriated', 'weapon', {'*weaponDamage': [113, 120, 100]});
addPrefix(37, 'Seething', 'weapon', {'*weaponDamage': [121, 129, 100]});
addPrefix(47, 'Enraged', 'weapon', {'*weaponDamage': [130, 139, 100]});
addPrefix(67, 'Wrathful', 'weapon', {'*weaponDamage': [140, 150, 100]});

addPrefix(1, 'Brisk', 'weapon', {'%attackSpeed': [3, 6, 100]});
addPrefix(4, 'Sprightly', 'weapon', {'%attackSpeed': [7, 12, 100]});
addPrefix(14, 'Energetic', 'weapon', {'%attackSpeed': [13, 20, 100]});
addPrefix(24, 'Dynamic', 'weapon', {'%attackSpeed': [21, 30, 100]});
addPrefix(34, 'Hyper', 'weapon', {'%attackSpeed': [31, 42, 100]});
addPrefix(50, 'Mercurial', 'weapon', {'%attackSpeed': [43, 56, 100]});

addPrefix(1, 'Sticky', 'weapon', {'+slowOnHit': [7, 10, 100]});
addPrefix(8, 'Gooey', 'weapon', {'+slowOnHit': [11, 15, 100]});
addPrefix(18, 'Viscuous', 'weapon', {'+slowOnHit': [16, 21, 100]});
addPrefix(33, 'Hobbling', 'weapon', {'+slowOnHit': [22, 27, 100]});
addPrefix(43, 'Crippling', 'weapon', {'+slowOnHit': [28, 36, 100]});
addPrefix(58, 'Paralyzing', 'weapon', {'+slowOnHit': [37, 45, 100]});

addPrefix(13, 'Keen', 'weapon', {'+critDamage': [10, 20, 100]});
addPrefix(33, 'Sharp', 'weapon', {'+critDamage': [21, 40, 100]});
addPrefix(63, 'Deadly', 'weapon', {'+critDamage': [41, 70, 100]});

addPrefix(3, 'Penetrating', 'weapon', {'%critChance': [10, 20, 100], '+critAccuracy': [10, 20, 100]});
addPrefix(23, 'Piercing', 'weapon', {'%critChance': [21, 40, 100], '+critAccuracy': [21, 40, 100]});
addPrefix(53, 'Shattering', 'weapon', {'%critChance': [41, 70, 100], '+critAccuracy': [41, 70, 100]});

addPrefix(1, 'Hardy', 'body', {'%maxHealth': [3, 9, 100]});
addPrefix(12, 'Staunch', 'body', {'%maxHealth': [7, 15, 100]});
addPrefix(22, 'Steadfast', 'body', {'%maxHealth': [15, 21, 100]});
addPrefix(32, 'Resilient', 'body', {'%maxHealth': [21, 30, 100]});
addPrefix(52, 'Enduring', 'body', {'%maxHealth': [30, 37, 100]});
addPrefix(72, 'Perpetual', 'body', {'%maxHealth': [37, 45, 100]});

addPrefix(10, 'Regrowing', 'body', {'%healthRegen': [5, 14, 100]});
addPrefix(40, 'Reconstructing', 'body', {'%healthRegen': [15, 29, 100]});
addPrefix(70, 'Regenerating', 'body', {'%healthRegen': [30, 50, 100]});

addPrefix(20, 'Flowing', 'jadeband', {'%healthRegen': [5, 19, 100]});
addPrefix(40, 'Surging', 'jadeband', {'%healthRegen': [20, 30, 100]});

addPrefix(1, 'Sound', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [2, 6, 100]});
addPrefix(11, 'Hale', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [5, 10, 100]});
addPrefix(21, 'Robust', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [10, 15, 100]});
addPrefix(31, 'Invigorating', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [15, 20, 100]});
addPrefix(51, 'Abiding', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [20, 25, 100]});
addPrefix(71, 'Everlasting', smallArmorSlots.concat(accessorySlots), {'%maxHealth': [25, 30, 100]});

addPrefix(11, 'Rough', [...armorSlots, 'Plated Cloak'], {'%armor': [2, 6, 100]});
addPrefix(21, 'Thick', [...armorSlots, 'Plated Cloak'], {'%armor': [5, 10, 100]});
addPrefix(31, 'Refined', [...armorSlots, 'Plated Cloak'], {'%armor': [10, 15, 100]});
addPrefix(41, 'Hardened', [...armorSlots, 'Plated Cloak'], {'%armor': [15, 20, 100]});
addPrefix(51, 'Petrified', [...armorSlots, 'Plated Cloak'], {'%armor': [20, 25, 100]});
addPrefix(71, 'Unbreakable', [...armorSlots, 'Plated Cloak'], {'%armor': [25, 30, 100]});

addPrefix(11, 'Circumspect', [...armorSlots, 'Travelers Cloak'], {'%evasion': [2, 6, 100]});
addPrefix(21, 'Disguised', [...armorSlots, 'Travelers Cloak'], {'%evasion': [5, 10, 100]});
addPrefix(31, 'Evasive', [...armorSlots, 'Travelers Cloak'], {'%evasion': [10, 15, 100]});
addPrefix(41, 'Elusive', [...armorSlots, 'Travelers Cloak'], {'%evasion': [15, 20, 100]});
addPrefix(51, 'Hidden', [...armorSlots, 'Travelers Cloak'], {'%evasion': [20, 25, 100]});
addPrefix(71, 'Invisible', [...armorSlots, 'Travelers Cloak'], {'%evasion': [25, 30, 100]});

addPrefix(11, 'Hindering', [...armorSlots, 'Fur Cloak'], {'%block': [2, 6, 100]});
addPrefix(21, 'Impeding', [...armorSlots, 'Fur Cloak'], {'%block': [5, 10, 100]});
addPrefix(31, 'Obstructing', [...armorSlots, 'Fur Cloak'], {'%block': [10, 15, 100]});
addPrefix(41, 'Halting', [...armorSlots, 'Fur Cloak'], {'%block': [15, 20, 100]});
addPrefix(51, 'Arresting', [...armorSlots, 'Fur Cloak'], {'%block': [20, 25, 100]});
addPrefix(71, 'Sequestering', [...armorSlots, 'Fur Cloak'], {'%block': [25, 30, 100]});

addPrefix(11, 'Annoying', [...armorSlots, 'Etched Band'], {'%magicBlock': [2, 6, 100]});
addPrefix(21, 'Distracting', [...armorSlots, 'Etched Band'], {'%magicBlock': [5, 10, 100]});
addPrefix(31, 'Disconcerting', [...armorSlots, 'Etched Band'], {'%magicBlock': [10, 15, 100]});
addPrefix(41, 'Baffling', [...armorSlots, 'Etched Band'], {'%magicBlock': [15, 20, 100]});
addPrefix(51, 'Bewildering', [...armorSlots, 'Etched Band'], {'%magicBlock': [20, 25, 100]});
addPrefix(71, 'Confounding', [...armorSlots, 'Etched Band'], {'%magicBlock': [25, 30, 100]});

addPrefix(1, 'Relaxing', armorSlots.concat(accessorySlots), {'+healthRegen': [10, 20, 10]});
addPrefix(12, 'Relieving', armorSlots.concat(accessorySlots), {'+healthRegen': [20, 50, 10]});
addPrefix(24, 'Soothing', armorSlots.concat(accessorySlots), {'+healthRegen': [50, 80, 10]});
addPrefix(36, 'Restoring', armorSlots.concat(accessorySlots), {'+healthRegen': [80, 120, 10]});
addPrefix(48, 'Healing', armorSlots.concat(accessorySlots), {'+healthRegen': [120, 160, 10]});
addPrefix(60, 'Reviving', armorSlots.concat(accessorySlots), {'+healthRegen': [160, 200, 10]});

addPrefix(1, 'Fast', 'feet', {'%speed': [10, 15, 100]});
addPrefix(20, 'Fleet', 'feet', {'%speed': [15, 25, 100]});
addPrefix(40, 'Expeditious', 'feet', {'%speed': [25, 35, 100]});
addPrefix(60, 'Supersonic', 'feet', {'%speed': [40, 50, 100]});

addSuffix(20, 'Striking', 'arms', {'%fist:damage': [40, 60, 100]});
addSuffix(40, 'Smashing', 'arms', {'%fist:damage': [70, 90, 100]});
addSuffix(60, 'Slaming', 'arms', {'%fist:damage': [100, 120, 100]});
addSuffix(80, 'Crushing', 'arms', {'%fist:damage': [130, 150, 100]});

addPrefix(1, 'Warded', accessorySlots, {'+magicResist': [10, 20, 1000]});
addPrefix(8, 'Charmed', accessorySlots, {'+magicResist': [20, 50, 1000]});
addPrefix(18, 'Cloaked', accessorySlots, {'+magicResist': [50, 80, 1000]});
addPrefix(38, 'Shielded', accessorySlots, {'+magicResist': [80, 120, 1000]});
addPrefix(48, 'Ensorceled', accessorySlots, {'+magicResist': [120, 160, 1000]});
addPrefix(68, 'Blessed', accessorySlots, {'+magicResist': [160, 200, 1000]});

addPrefix(10, 'Immense', ['heavyArmor', 'rubyring'], {'%strength': [10, 30, 1000]});
addPrefix(40, 'Gigantic', ['heavyArmor', 'rubyring'], {'%strength': [40, 60, 1000]});
addPrefix(80, 'Colossal', ['heavyArmor', 'rubyring'], {'%strength': [80, 100, 1000]});

addPrefix(10, 'Duplicitous', ['lightArmor', 'emeraldring'], {'%dexterity': [10, 30, 1000]});
addPrefix(40, 'Perfidious', ['lightArmor', 'emeraldring'], {'%dexterity': [40, 60, 1000]});
addPrefix(80, 'Machiavellian', ['lightArmor', 'emeraldring'], {'%dexterity': [80, 100, 1000]});

addPrefix(10, 'Gifted', ['clothArmor', 'sapphirering'], {'%intelligence': [10, 30, 1000]});
addPrefix(40, 'Brilliant', ['clothArmor', 'sapphirering'], {'%intelligence': [40, 60, 1000]});
addPrefix(80, 'Unsurpassed', ['clothArmor', 'sapphirering'], {'%intelligence': [80, 100, 1000]});

addPrefix(10, 'Vital', 'topazring', {'%strength': [5, 15, 1000], '%dexterity': [5, 15, 1000]});
addPrefix(40, 'Fervant', 'topazring', {'%strength': [20, 30, 1000], '%dexterity': [20, 30, 1000]});
addPrefix(80, 'Zealous', 'topazring', {'%strength': [40, 50, 1000], '%dexterity': [40, 50, 1000]});

addPrefix(10, 'Glamorous', 'aquamarinering', {'%intelligence': [5, 15, 1000], '%dexterity': [5, 15, 1000]});
addPrefix(40, 'Seductive', 'aquamarinering', {'%intelligence': [20, 30, 1000], '%dexterity': [20, 30, 1000]});
addPrefix(80, 'Entrancing', 'aquamarinering', {'%intelligence': [40, 50, 1000], '%dexterity': [40, 50, 1000]});

addPrefix(10, 'Decisive', 'amethystring', {'%intelligence': [5, 15, 1000], '%strength': [5, 15, 1000]});
addPrefix(40, 'Resolute', 'amethystring', {'%intelligence': [20, 30, 1000], '%strength': [20, 30, 1000]});
addPrefix(80, 'Indomitable', 'amethystring', {'%intelligence': [40, 50, 1000], '%strength': [40, 50, 1000]});

addPrefix(10, 'Flexible', 'diamondring', {'%intelligence': [3, 10, 1000], '%strength': [2, 10, 1000], '%dexterity': [3, 10, 1000]});
addPrefix(40, 'Adaptable', 'diamondring', {'%intelligence': [15, 20, 1000], '%strength': [15, 20, 1000], '%dexterity': [15, 20, 1000]});
addPrefix(80, 'Protean', 'diamondring', {'%intelligence': [26, 33, 1000], '%strength': [26, 33, 1000], '%dexterity': [26, 33, 1000]});

addPrefix(2, 'Damaging', basicHolders, {'%weaponDamage': [10, 15, 100]});
addPrefix(20, 'Harmful', basicHolders, {'%weaponDamage': [30, 50, 100]});
addPrefix(40, 'Injurious', basicHolders, {'%weaponDamage': [60, 80, 100]});

addPrefix(2, 'Sparkling', 'choker', {'%weaponDamage': [10, 15, 100]});
addPrefix(20, 'Glowing', 'choker', {'%weaponDamage': [30, 50, 100]});
addPrefix(40, 'Blinding', 'choker', {'%weaponDamage': [60, 80, 100]});

addPrefix(20, 'Vicious', holders.concat(['band']), {'%weaponDamage': [40, 60, 100]});
addPrefix(40, 'Malicious', holders.concat(['band']), {'%weaponDamage': [70, 90, 100]});
addPrefix(60, 'Atrocious', holders, {'%weaponDamage': [100, 120, 100]});
addPrefix(80, 'Inhuman', holders, {'%weaponDamage': [130, 150, 100]});

addPrefix(20, 'Creative', magicHolders, {'%weaponDamage': [40, 60, 100]});
addPrefix(40, 'Innovative', magicHolders, {'%weaponDamage': [70, 90, 100]});
addPrefix(60, 'Inspired', magicHolders, {'%weaponDamage': [100, 120, 100]});
addPrefix(80, 'Visionary', magicHolders, {'%weaponDamage': [130, 150, 100]});

addSuffix(3, 'Range', 'ranged', {'+range': [5, 10, 10]});
addSuffix(13, 'The Owl', 'ranged', {'+range': [11, 15, 10]});
addSuffix(23, 'Farsight', 'ranged', {'+range': [16, 20, 10]});
addSuffix(43, 'The Hawk', 'ranged', {'+range': [21, 25, 10]});
addSuffix(53, 'Sniping', 'ranged', {'+range': [26, 30, 10]});
addSuffix(63, 'The Eagle', 'ranged', {'+range': [31, 35, 10]});

addSuffix(3, 'Deflecting', 'melee', {'+block': [2, 6]});
addSuffix(13, 'Diverting', 'melee', {'+block': [2, 6]});
addSuffix(23, 'Anticipation', 'melee', {'+block': [2, 6]});
addSuffix(43, 'Parrying', 'melee', {'+block': [2, 6]});
addSuffix(53, 'Fencing', 'melee', {'+block': [2, 6]});
addSuffix(63, 'Aviodance', 'melee', {'+block': [2, 6]});

addSuffix(1, 'Trickery', 'weapon', {'+damageOnMiss': [10, 20]});
addSuffix(11, 'Artfullness', 'weapon', {'+damageOnMiss': [20, 40]});
addSuffix(21, 'Subtly', 'weapon', {'+damageOnMiss': [40, 80]});
addSuffix(31, 'Wiliness', 'weapon', {'+damageOnMiss': [70, 120]});
addSuffix(41, 'Slyness', 'weapon', {'+damageOnMiss': [100, 160]});
addSuffix(61, 'Deviousness', 'weapon', {'+damageOnMiss': [150, 200]});

addSuffix(1, 'Soaking', 'weapon', {'+healthGainOnHit': [1, 2]});
addSuffix(11, 'Leeching', 'weapon', {'+healthGainOnHit': [2, 5]});
addSuffix(21, 'Draining', 'weapon', {'+healthGainOnHit': [5, 8]});
addSuffix(31, 'Feeding', 'weapon', {'+healthGainOnHit': [8, 12]});
addSuffix(41, 'Feasting', 'weapon', {'+healthGainOnHit': [12, 16]});
addSuffix(51, 'The Parasite', 'weapon', {'+healthGainOnHit': [16, 20]});

addSuffix(1, 'Aiming', 'weapon', {'+accuracy': [3, 5]});
addSuffix(12, 'The Archer', 'weapon', {'+accuracy': [6, 9]});
addSuffix(22, 'Accuracy', 'weapon', {'+accuracy': [10, 14]});
addSuffix(32, 'The Marksman', 'weapon', {'+accuracy': [15, 21]});
addSuffix(42, 'Precision', 'weapon', {'+accuracy': [22, 29]});
addSuffix(52, 'The Sniper', 'weapon', {'+accuracy': [30, 40]});

addSuffix(4, 'Tempo', 'weapon', {'%cooldown': [-10, -15, 1000]});
addSuffix(19, 'Cadence', 'weapon', {'%cooldown': [-20, -25, 1000]});
addSuffix(34, 'Rythum', 'weapon', {'%cooldown': [-30, -35, 1000]});
addSuffix(49, 'Haste', 'weapon', {'%cooldown': [-40, -50, 1000]});
addSuffix(64, 'The Bard', 'weapon', {'%cooldown': [-60, -70, 1000]});
addSuffix(74, 'The Sage', 'weapon', {'%cooldown': [-80, -100, 1000]});

addSuffix(15, 'The Vampire', 'weapon', {'+lifeSteal': [10, 15, 1000]});
addSuffix(40, 'The Dark Knight', 'weapon', {'+lifeSteal': [18, 23, 1000]});
addSuffix(75, 'The Dread Lord', 'weapon', {'+lifeSteal': [25, 30, 1000]});

addSuffix(1, 'Health', 'body', {'+maxHealth': [20, 30]});
addSuffix(10, 'Fitness', 'body', {'+maxHealth': [40, 60]});
addSuffix(25, 'Power', 'body', {'+maxHealth': [70, 90]});
addSuffix(40, 'Robustness', 'body', {'+maxHealth': [100, 120]});
addSuffix(55, 'Vigor', 'body', {'+maxHealth': [140, 160]});
addSuffix(70, 'Stalwartness', 'body', {'+maxHealth': [180, 200]});

addSuffix(1, 'Enlarging', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [12, 18]});
addSuffix(10, 'Enhancing', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [24, 36]});
addSuffix(25, 'Augmenting', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [42, 54]});
addSuffix(40, 'Boosting', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [60, 72]});
addSuffix(55, 'Amplifcation', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [84, 96]});
addSuffix(70, 'Maximization', smallArmorSlots.concat(accessorySlots), {'+maxHealth': [108, 120]});

addSuffix(1, 'Shininess', [...armorSlots, 'Etched Band'], {'+magicBlock': [1, 3]});
addSuffix(9, 'Brightness', [...armorSlots, 'Etched Band'], {'+magicBlock': [4, 6]});
addSuffix(24, 'Lustrousness', [...armorSlots, 'Etched Band'], {'+magicBlock': [7, 10]});
addSuffix(39, 'Glory', [...armorSlots, 'Etched Band'], {'+magicBlock': [11, 15]});
addSuffix(54, 'The Moon', [...armorSlots, 'Etched Band'], {'+magicBlock': [16, 22]});
addSuffix(69, 'The Sun', [...armorSlots, 'Etched Band'], {'+magicBlock': [23, 30]});

addSuffix(1, 'Toughness', [...armorSlots, 'Plated Cloak'], {'+armor': [2, 6]});
addSuffix(10, 'Durability', [...armorSlots, 'Plated Cloak'], {'+armor': [8, 12]});
addSuffix(20, 'Permanence', [...armorSlots, 'Plated Cloak'], {'+armor': [14, 20]});
addSuffix(30, 'The Mountain', [...armorSlots, 'Plated Cloak'], {'+armor': [22, 30]});
addSuffix(40, 'The Paladin', [...armorSlots, 'Plated Cloak'], {'+armor': [32, 44]});
addSuffix(50, 'Indestructibility', [...armorSlots, 'Plated Cloak'], {'+armor': [46, 60]});

addSuffix(1, 'Delaying', [...armorSlots, 'Fur Cloak'], {'+block': [2, 6]});
addSuffix(11, 'Intercepting', [...armorSlots, 'Fur Cloak'], {'+block': [8, 12]});
addSuffix(21, 'Blocking', [...armorSlots, 'Fur Cloak'], {'+block': [14, 20]});
addSuffix(31, 'Guarding', [...armorSlots, 'Fur Cloak'], {'+block': [22, 30]});
addSuffix(41, 'Protecting', [...armorSlots, 'Fur Cloak'], {'+block': [32, 44]});
addSuffix(51, 'The Wall', [...armorSlots, 'Fur Cloak'], {'+block': [46, 60]});

addSuffix(1, 'Mitigation', [...armorSlots, 'Travelers Cloak'], {'+evasion': [2, 6]});
addSuffix(12, 'Dodging', [...armorSlots, 'Travelers Cloak'], {'+evasion': [8, 12]});
addSuffix(22, 'Evasion', [...armorSlots, 'Travelers Cloak'], {'+evasion': [14, 20]});
addSuffix(32, 'Avoidance', [...armorSlots, 'Travelers Cloak'], {'+evasion': [22, 30]});
addSuffix(42, 'Illusion', [...armorSlots, 'Travelers Cloak'], {'+evasion': [32, 44]});
addSuffix(52, 'Vanishing', [...armorSlots, 'Travelers Cloak'], {'+evasion': [46, 60]});

addSuffix(1, 'Speed', 'feet', {'+speed': [10, 20]});
addSuffix(20, 'Velocity', 'feet', {'+speed': [25, 40]});
addSuffix(40, 'Acceleration', 'feet', {'+speed': [50, 70]});
addSuffix(60, 'Flight', 'feet', {'+speed': [80, 100]});

addSuffix(20, 'Collision', 'arms', {'+fist:weaponPhysicalDamage': [30, 50]});
addSuffix(40, 'Shock', 'arms', {'+fist:weaponPhysicalDamage': [50, 90]});
addSuffix(60, 'Concussion', 'arms', {'+fist:weaponPhysicalDamage': [90, 140]});
addSuffix(80, 'Impact', 'arms', {'+fist:damagePhysicalDamage': [140, 190]});

addSuffix(5, 'Courage', ['heavyArmor', 'rubyring'], {'+strength': [10, 18]});
addSuffix(25, 'Valor', ['heavyArmor', 'rubyring'], {'+strength': [20, 35]});
addSuffix(55, 'Heroism', ['heavyArmor', 'rubyring'], {'+strength': [50, 70]});

addSuffix(5, 'Finesse', ['lightArmor', 'emeraldring'], {'+dexterity': [10, 18]});
addSuffix(25, 'Mastery', ['lightArmor', 'emeraldring'], {'+dexterity': [20, 35]});
addSuffix(55, 'Preeminence', ['lightArmor', 'emeraldring'], {'+dexterity': [50, 70]});

addSuffix(5, 'Insight', ['clothArmor', 'sapphirering'], {'+intelligence': [10, 18]});
addSuffix(35, 'Comprehension', ['clothArmor', 'sapphirering'], {'+intelligence': [20, 35]});
addSuffix(65, 'Genius', ['clothArmor', 'sapphirering'], {'+intelligence': [50, 70]});

addSuffix(2, 'Irritation', basicHolders, {'+weaponPhysicalDamage': [3, 5]});
addSuffix(10, 'Discomfort', basicHolders, {'+weaponPhysicalDamage': [10, 15]});
addSuffix(20, 'Misery', basicHolders, {'+weaponPhysicalDamage': [20, 30]});
addSuffix(30, 'Torture', basicHolders, {'+weaponPhysicalDamage': [30, 40]});
addSuffix(40, 'Laceration', basicHolders, {'+weaponPhysicalDamage': [40, 50]});
addSuffix(50, 'Flaying', basicHolders, {'+weaponPhysicalDamage': [50, 60]});

addSuffix(2, 'Tingling', 'choker', {'+weaponMagicDamage': [1, 2]});
addSuffix(10, 'Smoking', 'choker', {'+weaponMagicDamage': [5, 7]});
addSuffix(20, 'Simmering', 'choker', {'+weaponMagicDamage': [10, 15]});
addSuffix(30, 'Burning', 'choker', {'+weaponMagicDamage': [15, 20]});
addSuffix(40, 'Crackling', 'choker', {'+weaponMagicDamage': [20, 25]});
addSuffix(50, 'Blazing', 'choker', {'+weaponMagicDamage': [25, 30]});

addSuffix(20, 'Barbarism', holders.concat(['meteoricband', 'adamantiumband','dragonboneband']), {'+weaponPhysicalDamage': [40, 60]});
addSuffix(40, 'Savagery', holders.concat(['meteoricband', 'adamantiumband','dragonboneband']), {'+weaponPhysicalDamage': [60, 100]});
addSuffix(60, 'Brutality', holders, {'+weaponPhysicalDamage': [100, 150]});
addSuffix(80, 'Death', holders, {'+weaponPhysicalDamage': [150, 200]});

addSuffix(20, 'Ravaging', magicHolders.concat(['orichalcumband']), {'+weaponMagicDamage': [20, 30]});
addSuffix(40, 'Destruction', magicHolders.concat(['orichalcumband']), {'+weaponMagicDamage': [30, 50]});
addSuffix(60, 'Eradication', magicHolders, {'+weaponMagicDamage': [50, 75]});
addSuffix(80, 'Disintegration', magicHolders, {'+weaponMagicDamage': [75, 100]});

addSuffix(20, 'The Stream', 'jadeband', {'+healthRegen': [12, 20]});
addSuffix(40, 'The Flood', 'jadeband', {'+healthRegen': [21, 30]});
addSuffix(60, 'The Deluge', 'jadeband', {'+healthRegen': [31, 45]});

addSuffix(1, 'Minor Strength', accessorySlots, {'+strength': [3, 6]});
addSuffix(1, 'Minor Dexterity', accessorySlots, {'+dexterity': [3, 6]});
addSuffix(1, 'Minor Intelligence', accessorySlots, {'+intelligence': [3, 6]});
addSuffix(11, 'Strength', accessorySlots, {'+strength': [7, 15]});
addSuffix(11, 'Dexterity', accessorySlots, {'+dexterity': [7, 15]});
addSuffix(11, 'Intelligence', accessorySlots, {'+intelligence': [7, 15]});
addSuffix(31, 'Major Strength', accessorySlots, {'+strength': [16, 30]});
addSuffix(31, 'Major Dexterity', accessorySlots, {'+dexterity': [16, 30]});
addSuffix(31, 'Major Intelligence', accessorySlots, {'+intelligence': [16, 30]});
addSuffix(61, 'Peerless Strength', accessorySlots, {'+strength': [31, 50]});
addSuffix(61, 'Peerless Dexterity', accessorySlots, {'+dexterity': [31, 50]});
addSuffix(61, 'Peerless Intelligence', accessorySlots, {'+intelligence': [31, 50]});

addSuffix(12, 'Minor Vigor', 'topazring', {'+strength': [5, 9], '+dexterity': [5, 9]});
addSuffix(32, 'Major Vigor', 'topazring', {'+strength': [10, 15], '+dexterity': [10, 15]});
addSuffix(62, 'Peerless Vigor', 'topazring', {'+strength': [16, 25], '+dexterity': [16, 25]});

addSuffix(12, 'Minor Charisma', 'aquamarinering', {'+intelligince': [5, 9], '+dexterity': [5, 9]});
addSuffix(32, 'Major Charisma', 'aquamarinering', {'+intelligince': [10, 15], '+dexterity': [10, 15]});
addSuffix(62, 'Peerless Charisma', 'aquamarinering', {'+intelligince': [16, 25], '+dexterity': [16, 25]});

addSuffix(12, 'Minor Will', 'amethystring', {'+intelligince': [5, 9], '+strength': [5, 9]});
addSuffix(32, 'Major Will', 'amethystring', {'+intelligince': [10, 15], '+strength': [10, 15]});
addSuffix(62, 'Peerless Will', 'amethystring', {'+intelligince': [16, 25], '+strength': [16, 25]});

addSuffix(12, 'Minor Versitility', 'diamondring', {'+dexterity': [3, 6], '+intelligince': [3, 6], '+strength': [3, 6]});
addSuffix(32, 'Major Versitility', 'diamondring', {'+dexterity': [7, 10], '+intelligince': [7, 10], '+strength': [7, 10]});
addSuffix(62, 'Peerless Versitility', 'diamondring', {'+dexterity': [11, 16], '+intelligince': [11, 16], '+strength': [11, 16]});
