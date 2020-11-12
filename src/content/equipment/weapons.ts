import { equipmentIcons } from 'app/content/equipment/equipmentIcons';
import { addItem } from 'app/content/equipment/index';

function weaponSource(row) {
    return {'yOffset': row * 64}
}
const weaponSources = {
    // Weapons
    'wand': weaponSource(0),
    'bow': weaponSource(1),
    'sword': weaponSource(2),
    'greatSword': weaponSource(3),
    'dagger': weaponSource(4),
    'ball': weaponSource(5),
    'rock': weaponSource(6),
    'staff': weaponSource(7),
    'axe': weaponSource(8),
    'bigAxe': weaponSource(9),
};

export function addWeapons() {
// Axes high damage, slow attack speed, melee range, high crit chance
//addItem(2, {'slot': 'weapon', 'type': 'axe',  'name': 'Worn Hatchet',
//'bonuses': {'+minWeaponPhysicalDamage': 13, '+maxWeaponPhysicalDamage': 19,  '+attackSpeed': 0.6,'+weaponRange': 1.4, '+critChance': 0.04 }, icon: equipmentIcons.hatchet});
addItem(6, {'slot': 'weapon', 'type': 'axe',  'name': 'Hatchet',
    'bonuses': {'+minWeaponPhysicalDamage': 42, '+maxWeaponPhysicalDamage': 62,  '+attackSpeed': 0.9,'+weaponRange': 1.5, '+critChance': 0.05 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(11, {'slot': 'weapon', 'type': 'axe',  'name': 'Climbing Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 76, '+maxWeaponPhysicalDamage': 114,  '+attackSpeed': 0.9,'+weaponRange': 1.5, '+critChance': 0.05 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(16, {'slot': 'weapon', 'type': 'axe',  'name': 'Tomahawk',
    'bonuses': {'+minWeaponPhysicalDamage': 98, '+maxWeaponPhysicalDamage': 146,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(21, {'slot': 'weapon', 'type': 'axe',  'name': 'Sagaris',
    'bonuses': {'+minWeaponPhysicalDamage': 128, '+maxWeaponPhysicalDamage': 192,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(26, {'slot': 'weapon', 'type': 'axe',  'name': 'Iron Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 158, '+maxWeaponPhysicalDamage': 238,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(31, {'slot': 'weapon', 'type': 'axe',  'name': 'Black Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 188, '+maxWeaponPhysicalDamage': 282,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(36, {'slot': 'weapon', 'type': 'axe',  'name': 'Forged Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 218, '+maxWeaponPhysicalDamage': 328,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(41, {'slot': 'weapon', 'type': 'axe',  'name': 'Steel Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 249, '+maxWeaponPhysicalDamage': 373,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(46, {'slot': 'weapon', 'type': 'axe',  'name': 'Etched Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 279, '+maxWeaponPhysicalDamage': 419,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(51, {'slot': 'weapon', 'type': 'axe',  'name': 'Meteoric Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 309, '+maxWeaponPhysicalDamage': 463,  '+attackSpeed': 1,'+weaponRange': 1.6, '+critChance': 0.06 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(61, {'slot': 'weapon', 'type': 'axe',  'name': 'Runed Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 336, '+maxWeaponPhysicalDamage': 504,  '+attackSpeed': 1,'+weaponRange': 1.7, '+critChance': 0.07, '+minWeaponMagicDamage': 11, '+maxWeaponMagicDamage': 17 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});
addItem(71, {'slot': 'weapon', 'type': 'axe',  'name': 'Admantine Battle Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 519, '+maxWeaponPhysicalDamage': 779,  '+attackSpeed': 0.8,'+weaponRange': 2, '+critChance': 0.1, '+minWeaponMagicDamage': 28, '+maxWeaponMagicDamage': 38 },
    source: weaponSources.axe, icon: equipmentIcons.hatchet});

//Swords medium damage, medium attack speed, melee range, medium crit chance
addItem(5, {'slot': 'weapon', 'type': 'sword',  'name': 'Gladius',
    'bonuses': {'+minWeaponPhysicalDamage': 38, '+maxWeaponPhysicalDamage': 58,  '+attackSpeed': 1,'+weaponRange': 1.5, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(10, {'slot': 'weapon', 'type': 'sword',  'name': 'Short Sword',
    'bonuses': {'+minWeaponPhysicalDamage': 58, '+maxWeaponPhysicalDamage': 86,  '+attackSpeed': 1.2,'+weaponRange': 1.5, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(15, {'slot': 'weapon', 'type': 'sword',  'name': 'Falchion',
    'bonuses': {'+minWeaponPhysicalDamage': 66, '+maxWeaponPhysicalDamage': 100,  '+attackSpeed': 1.5,'+weaponRange': 1.8, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(20, {'slot': 'weapon', 'type': 'sword',  'name': 'Scimitar',
    'bonuses': {'+minWeaponPhysicalDamage': 86, '+maxWeaponPhysicalDamage': 130,  '+attackSpeed': 1.5,'+weaponRange': 1.8, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(25, {'slot': 'weapon', 'type': 'sword',  'name': 'Wakizashi',
    'bonuses': {'+minWeaponPhysicalDamage': 101, '+maxWeaponPhysicalDamage': 151,  '+attackSpeed': 1.6,'+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(30, {'slot': 'weapon', 'type': 'sword',  'name': 'Longsword',
    'bonuses': {'+minWeaponPhysicalDamage': 120, '+maxWeaponPhysicalDamage': 180,  '+attackSpeed': 1.6,'+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(35, {'slot': 'weapon', 'type': 'sword',  'name': 'Estoic',
    'bonuses': {'+minWeaponPhysicalDamage': 139, '+maxWeaponPhysicalDamage': 209,  '+attackSpeed': 1.6,'+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(40, {'slot': 'weapon', 'type': 'sword',  'name': 'Broadsword',
    'bonuses': {'+minWeaponPhysicalDamage': 158, '+maxWeaponPhysicalDamage': 238,  '+attackSpeed': 1.6,'+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(45, {'slot': 'weapon', 'type': 'sword',  'name': 'Bastardsword',
    'bonuses': {'+minWeaponPhysicalDamage': 176, '+maxWeaponPhysicalDamage': 264,  '+attackSpeed': 1.6,'+weaponRange': 2.3, '+critChance': 0.05 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(50, {'slot': 'weapon', 'type': 'sword',  'name': 'Meteoric Saber',
    'bonuses': {'+minWeaponPhysicalDamage': 173, '+maxWeaponPhysicalDamage': 259,  '+attackSpeed': 1.8,'+weaponRange': 2.3, '+critChance': 0.05 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(60, {'slot': 'weapon', 'type': 'sword',  'name': 'Runed Saber',
    'bonuses': {'+minWeaponPhysicalDamage': 190, '+maxWeaponPhysicalDamage': 286,  '+attackSpeed': 1.8,'+weaponRange': 2.3, '+critChance': 0.05, '+minWeaponMagicDamage': 6, '+maxWeaponMagicDamage': 8 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});
addItem(70, {'slot': 'weapon', 'type': 'sword',  'name': 'Etched Dragon Horn',
    'bonuses': {'+minWeaponPhysicalDamage': 198, '+maxWeaponPhysicalDamage': 298,  '+attackSpeed': 1.9,'+weaponRange': 2.5, '+critChance': 0.06, '+minWeaponMagicDamage': 10, '+maxWeaponMagicDamage': 14 },
    source: weaponSources.sword, icon: equipmentIcons.gladius});

//Daggers low damage, high attack speed, melee range, low crit chance
addItem(3, {'slot': 'weapon', 'type': 'dagger',  'name': 'Pugio',
    'bonuses': {'+minWeaponPhysicalDamage': 26, '+maxWeaponPhysicalDamage': 38,  '+attackSpeed': 1.5,'+weaponRange': 1.2, '+critChance': 0.03},
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(8, {'slot': 'weapon', 'type': 'dagger',  'name': 'Hewing Knife',
    'bonuses': {'+minWeaponPhysicalDamage': 46, '+maxWeaponPhysicalDamage': 70,  '+attackSpeed': 1.5,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(13, {'slot': 'weapon', 'type': 'dagger',  'name': 'Cross-hilt Dagger',
    'bonuses': {'+minWeaponPhysicalDamage': 67, '+maxWeaponPhysicalDamage': 101,  '+attackSpeed': 1.5,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(18, {'slot': 'weapon', 'type': 'dagger',  'name': 'Tanto',
    'bonuses': {'+minWeaponPhysicalDamage': 82, '+maxWeaponPhysicalDamage': 124,  '+attackSpeed': 1.6,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(23, {'slot': 'weapon', 'type': 'dagger',  'name': 'Stiletto',
    'bonuses': {'+minWeaponPhysicalDamage': 102, '+maxWeaponPhysicalDamage': 152,  '+attackSpeed': 1.6,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(28, {'slot': 'weapon', 'type': 'dagger',  'name': 'Steel Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 107, '+maxWeaponPhysicalDamage': 161,  '+attackSpeed': 1.8,'+weaponRange': 1.5, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(33, {'slot': 'weapon', 'type': 'dagger',  'name': 'Stainless Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 125, '+maxWeaponPhysicalDamage': 187,  '+attackSpeed': 1.8,'+weaponRange': 1.5, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(38, {'slot': 'weapon', 'type': 'dagger',  'name': 'Serrated Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 142, '+maxWeaponPhysicalDamage': 212,  '+attackSpeed': 1.8,'+weaponRange': 1.5, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(43, {'slot': 'weapon', 'type': 'dagger',  'name': 'Masterful Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 159, '+maxWeaponPhysicalDamage': 239,  '+attackSpeed': 1.8,'+weaponRange': 1.5, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(48, {'slot': 'weapon', 'type': 'dagger',  'name': 'Meteoric Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 159, '+maxWeaponPhysicalDamage': 239,  '+attackSpeed': 2,'+weaponRange': 1.5, '+critChance': 0.03 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(58, {'slot': 'weapon', 'type': 'dagger',  'name': 'Runed Dirk',
    'bonuses': {'+minWeaponPhysicalDamage': 174, '+maxWeaponPhysicalDamage': 262,  '+attackSpeed': 2,'+weaponRange': 1.5, '+critChance': 0.03, '+minWeaponMagicDamage': 6, '+maxWeaponMagicDamage': 7 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});
addItem(68, {'slot': 'weapon', 'type': 'dagger',  'name': 'Etched Dragon Fang',
    'bonuses': {'+minWeaponPhysicalDamage': 190, '+maxWeaponPhysicalDamage': 286,  '+attackSpeed': 2,'+weaponRange': 1.8, '+critChance': 0.05, '+minWeaponMagicDamage': 9, '+maxWeaponMagicDamage': 13 },
    source: weaponSources.dagger, icon: equipmentIcons.pugio});

//Fists low damage, high attack speed, melee range, low crit chance
addItem(1, {'slot': 'weapon', 'type': 'fist',  'name': 'Rock',
    'bonuses': {'+minWeaponPhysicalDamage': 4, '+maxWeaponPhysicalDamage': 6,  '+attackSpeed': 1.5,'+weaponRange': 1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(2, {'slot': 'weapon', 'type': 'fist',  'name': 'Cestus',
    'bonuses': {'+minWeaponPhysicalDamage': 14, '+maxWeaponPhysicalDamage': 20,  '+attackSpeed': 1.6,'+weaponRange': 1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(7, {'slot': 'weapon', 'type': 'fist',  'name': 'Bronze Weights',
    'bonuses': {'+minWeaponPhysicalDamage': 43, '+maxWeaponPhysicalDamage': 65,  '+attackSpeed': 1.6,'+weaponRange': 1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(12, {'slot': 'weapon', 'type': 'fist',  'name': 'Iron Weights',
    'bonuses': {'+minWeaponPhysicalDamage': 62, '+maxWeaponPhysicalDamage': 94,  '+attackSpeed': 1.6,'+weaponRange': 1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(17, {'slot': 'weapon', 'type': 'fist',  'name': 'Tekko',
    'bonuses': {'+minWeaponPhysicalDamage': 73, '+maxWeaponPhysicalDamage': 109,  '+attackSpeed': 1.8,'+weaponRange': 1.1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(22, {'slot': 'weapon', 'type': 'fist',  'name': 'Iron Knuckles',
    'bonuses': {'+minWeaponPhysicalDamage': 90, '+maxWeaponPhysicalDamage': 136,  '+attackSpeed': 1.8,'+weaponRange': 1.1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(27, {'slot': 'weapon', 'type': 'fist',  'name': 'Steel Knuckles',
    'bonuses': {'+minWeaponPhysicalDamage': 107, '+maxWeaponPhysicalDamage': 161,  '+attackSpeed': 1.8,'+weaponRange': 1.1, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(32, {'slot': 'weapon', 'type': 'fist',  'name': 'Spiked Knuckles',
    'bonuses': {'+minWeaponPhysicalDamage': 112, '+maxWeaponPhysicalDamage': 168,  '+attackSpeed': 2,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(37, {'slot': 'weapon', 'type': 'fist',  'name': 'Steel Claws',
    'bonuses': {'+minWeaponPhysicalDamage': 128, '+maxWeaponPhysicalDamage': 192,  '+attackSpeed': 2,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(42, {'slot': 'weapon', 'type': 'fist',  'name': 'Masterful Claws',
    'bonuses': {'+minWeaponPhysicalDamage': 143, '+maxWeaponPhysicalDamage': 215,  '+attackSpeed': 2,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(47, {'slot': 'weapon', 'type': 'fist',  'name': 'Meteoric Claws',
    'bonuses': {'+minWeaponPhysicalDamage': 159, '+maxWeaponPhysicalDamage': 239,  '+attackSpeed': 2,'+weaponRange': 1.2, '+critChance': 0.03 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(57, {'slot': 'weapon', 'type': 'fist',  'name': 'Runed Claws',
    'bonuses': {'+minWeaponPhysicalDamage': 139, '+maxWeaponPhysicalDamage': 209,  '+attackSpeed': 2.5,'+weaponRange': 1.2, '+critChance': 0.03, '+minWeaponMagicDamage': 4, '+maxWeaponMagicDamage': 6 },
    source: weaponSources.rock, icon: equipmentIcons.rock});
addItem(67, {'slot': 'weapon', 'type': 'fist',  'name': 'Adamantine Claws',
    'bonuses': {'+minWeaponPhysicalDamage': 256, '+maxWeaponPhysicalDamage': 384,  '+attackSpeed': 1.7,'+weaponRange': 1.4, '+critChance': 0.04, '+minWeaponMagicDamage': 13, '+maxWeaponMagicDamage': 19 },
    source: weaponSources.rock, icon: equipmentIcons.rock});

//Wands magic damage, medium attack speed, medium range, low crit chance
addItem(1, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Stick',
    'bonuses': {'+minWeaponMagicDamage': 6, '+maxWeaponMagicDamage': 10,  '+attackSpeed': 1,'+weaponRange': 7, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(5, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Balsa Wand',
    'bonuses': {'+minWeaponMagicDamage': 14, '+maxWeaponMagicDamage': 22,  '+attackSpeed': 1.3,'+weaponRange': 7, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(10, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Juniper Wand',
    'bonuses': {'+minWeaponMagicDamage': 25, '+maxWeaponMagicDamage': 37,  '+attackSpeed': 1.4,'+weaponRange': 7, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(15, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Pine Wand',
    'bonuses': {'+minWeaponMagicDamage': 34, '+maxWeaponMagicDamage': 50,  '+attackSpeed': 1.5,'+weaponRange': 8, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(20, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Rosewood Wand',
    'bonuses': {'+minWeaponMagicDamage': 44, '+maxWeaponMagicDamage': 66,  '+attackSpeed': 1.5,'+weaponRange': 8, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(25, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Rowan Wand',
    'bonuses': {'+minWeaponMagicDamage': 50, '+maxWeaponMagicDamage': 76,  '+attackSpeed': 1.5,'+weaponRange': 9, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(30, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Oak Wand',
    'bonuses': {'+minWeaponMagicDamage': 60, '+maxWeaponMagicDamage': 90,  '+attackSpeed': 1.6,'+weaponRange': 9, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(35, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Ebony Wand',
    'bonuses': {'+minWeaponMagicDamage': 70, '+maxWeaponMagicDamage': 104,  '+attackSpeed': 1.6,'+weaponRange': 10, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(40, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Ironwood Wand',
    'bonuses': {'+minWeaponMagicDamage': 80, '+maxWeaponMagicDamage': 120,  '+attackSpeed': 1.6,'+weaponRange': 10, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(45, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Intricate Wand',
    'bonuses': {'+minWeaponMagicDamage': 79, '+maxWeaponMagicDamage': 119,  '+attackSpeed': 1.8,'+weaponRange': 11, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(50, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Runed Wand',
    'bonuses': {'+minWeaponMagicDamage':88, '+maxWeaponMagicDamage': 132,  '+attackSpeed': 1.8,'+weaponRange': 11, '+critChance': 0.03 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(60, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Adamantine Wand',
    'bonuses': {'+minWeaponMagicDamage': 194, '+maxWeaponMagicDamage': 290,  '+attackSpeed': 1,'+weaponRange': 12, '+critChance': 0.03, '+minWeaponPhysicalDamage': 26, '+maxWeaponPhysicalDamage': 38 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});
addItem(70, {'slot': 'weapon', 'type': 'wand', 'gravity': 0, 'tags': ['ranged', 'magic'],  'name': 'Orichalcum Wand',
    'bonuses': {'+minWeaponMagicDamage': 101, '+maxWeaponMagicDamage': 151,  '+attackSpeed': 1.9,'+weaponRange': 14, '+critChance': 0.04, '+minWeaponPhysicalDamage': 20, '+maxWeaponPhysicalDamage': 30 },
    source: weaponSources.wand, icon: equipmentIcons.stick, 'animation': 'wandAttack'});

//Thrown medium damage, medium attack speed, medium range, medium crit chance
addItem(1, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Ball',
    'bonuses': {'+minWeaponPhysicalDamage': 6, '+maxWeaponPhysicalDamage': 8,  '+attackSpeed': 1.1,'+weaponRange': 8, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(4, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Pilum',
    'bonuses': {'+minWeaponPhysicalDamage': 34, '+maxWeaponPhysicalDamage': 52,  '+attackSpeed': 1.1,'+weaponRange': 9, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(9, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Throwing Knife',
    'bonuses': {'+minWeaponPhysicalDamage': 58, '+maxWeaponPhysicalDamage': 86,  '+attackSpeed': 1.2,'+weaponRange': 9, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(14, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Throwing Club',
    'bonuses': {'+minWeaponPhysicalDamage': 83, '+maxWeaponPhysicalDamage': 125,  '+attackSpeed': 1.2,'+weaponRange': 10, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(19, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Throwing Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 109, '+maxWeaponPhysicalDamage': 163,  '+attackSpeed': 1.2,'+weaponRange': 10, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(24, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Shuriken',
    'bonuses': {'+minWeaponPhysicalDamage': 80, '+maxWeaponPhysicalDamage': 120,  '+attackSpeed': 2,'+weaponRange': 11, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(29, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Bolas',
    'bonuses': {'+minWeaponPhysicalDamage': 120, '+maxWeaponPhysicalDamage': 180,  '+attackSpeed': 1.6,'+weaponRange': 11, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(34, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Chakram',
    'bonuses': {'+minWeaponPhysicalDamage': 139, '+maxWeaponPhysicalDamage': 209,  '+attackSpeed': 1.6,'+weaponRange': 12, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(39, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Javelin',
    'bonuses': {'+minWeaponPhysicalDamage': 141, '+maxWeaponPhysicalDamage': 211,  '+attackSpeed': 1.8,'+weaponRange': 12, '+critChance': 0.04 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(44, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Heavy Javelin',
    'bonuses': {'+minWeaponPhysicalDamage': 187, '+maxWeaponPhysicalDamage': 281,  '+attackSpeed': 1.5,'+weaponRange': 13, '+critChance': 0.05 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(49, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Meteoric Javelin',
    'bonuses': {'+minWeaponPhysicalDamage': 208, '+maxWeaponPhysicalDamage': 312,  '+attackSpeed': 1.5,'+weaponRange': 13, '+critChance': 0.05 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(59, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Runed Javelin',
    'bonuses': {'+minWeaponPhysicalDamage': 190, '+maxWeaponPhysicalDamage': 286,  '+attackSpeed': 1.8,'+weaponRange': 14, '+critChance': 0.05, '+minWeaponMagicDamage': 6, '+maxWeaponMagicDamage': 8 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});
addItem(69, {'slot': 'weapon', 'type': 'throwing', 'tags': ['ranged'], 'name': 'Adamantine Javelin',
    'bonuses': {'+minWeaponPhysicalDamage': 415, '+maxWeaponPhysicalDamage': 623,  '+attackSpeed': 1,'+weaponRange': 15, '+critChance': 0.07, '+minWeaponMagicDamage': 20, '+maxWeaponMagicDamage': 30 },
    source: weaponSources.ball, icon: equipmentIcons.ball, 'animation': 'throwingAttack'});

// Two handed ranged weapons, Bows and Crossbows.
addItem(2, {'slot': 'weapon', 'type': 'bow', 'gravity': .7, 'tags': ['twoHanded', 'ranged'], 'name': 'Primitive Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 14, '+maxWeaponPhysicalDamage': 16,  '+attackSpeed': 1, '+weaponRange': 9, '+critChance': 0.03 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(7, {'slot': 'weapon', 'type': 'bow', 'gravity': .6, 'tags': ['twoHanded', 'ranged'], 'name': 'Short Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 60, '+maxWeaponPhysicalDamage': 70,  '+attackSpeed': 1.1, '+weaponRange': 10, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(12, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Recurve Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 110, '+maxWeaponPhysicalDamage': 126,  '+attackSpeed': 1.1, '+weaponRange': 12, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(17, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Long Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 174, '+maxWeaponPhysicalDamage': 200,  '+attackSpeed': 1, '+weaponRange': 14, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(22, {'slot': 'weapon', 'type': 'bow', 'gravity': .2, 'tags': ['twoHanded', 'ranged'], 'name': 'Crossbow',
    'bonuses': {'+minWeaponPhysicalDamage': 228, '+maxWeaponPhysicalDamage': 262,  '+attackSpeed': 1, '+weaponRange': 13, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(27, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Composite Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 256, '+maxWeaponPhysicalDamage': 294,  '+attackSpeed': 1.1, '+weaponRange': 14, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(32, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Repeating Crossbow',
    'bonuses': {'+minWeaponPhysicalDamage': 168, '+maxWeaponPhysicalDamage': 192,  '+attackSpeed': 2, '+weaponRange': 12, '+critChance': 0.04 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(37, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Recurve Crossbow',
    'bonuses': {'+minWeaponPhysicalDamage': 350, '+maxWeaponPhysicalDamage': 402,  '+attackSpeed': 1.1, '+weaponRange': 14, '+critChance': 0.05 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(42, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Arbalest',
    'bonuses': {'+minWeaponPhysicalDamage': 439, '+maxWeaponPhysicalDamage': 503,  '+attackSpeed': 1, '+weaponRange': 17, '+critChance': 0.05 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(47, {'slot': 'weapon', 'type': 'bow', 'gravity': .5, 'tags': ['twoHanded', 'ranged'], 'name': 'Compound Bow',
    'bonuses': {'+minWeaponPhysicalDamage': 410, '+maxWeaponPhysicalDamage': 470,  '+attackSpeed': 1.2, '+weaponRange': 18, '+critChance': 0.05 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(52, {'slot': 'weapon', 'type': 'bow', 'gravity': .2, 'tags': ['twoHanded', 'ranged'], 'name': 'Compound Crossbow',
    'bonuses': {'+minWeaponPhysicalDamage': 544, '+maxWeaponPhysicalDamage': 626,  '+attackSpeed': 1, '+weaponRange': 18, '+critChance': 0.05 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(62, {'slot': 'weapon', 'type': 'bow', 'gravity': .2, 'tags': ['twoHanded', 'ranged'], 'name': 'Adamantine Crossbow',
    'bonuses': {'+minWeaponPhysicalDamage': 845, '+maxWeaponPhysicalDamage': 973,  '+attackSpeed': 0.8, '+weaponRange': 20, '+critChance': 0.06, '+minWeaponMagicDamage': 26, '+maxWeaponMagicDamage': 40 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});
addItem(72, {'slot': 'weapon', 'type': 'bow', 'gravity': .4, 'tags': ['twoHanded', 'ranged'], 'name': 'Dragonbone Greatbow',
    'bonuses': {'+minWeaponPhysicalDamage': 657, '+maxWeaponPhysicalDamage': 757,  '+attackSpeed': 1, '+weaponRange': 20, '+critChance': 0.06, '+minWeaponMagicDamage': 38, '+maxWeaponMagicDamage': 56 },
    source: weaponSources.bow, icon: equipmentIcons.primitiveBow, 'animation': 'bowAttack'});

//Staffs
addItem(3, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Balsa Staff',
    'bonuses': {'+minWeaponPhysicalDamage': 26, '+maxWeaponPhysicalDamage': 30, '+minWeaponMagicDamage': 13, '+maxWeaponMagicDamage': 15, '+attackSpeed': 1.2, '+weaponRange': 2, '+critChance': 0.03 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(8, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Juniper Staff',
    'bonuses': {'+minWeaponPhysicalDamage': 45, '+maxWeaponPhysicalDamage': 55, '+minWeaponMagicDamage': 23, '+maxWeaponMagicDamage': 27, '+attackSpeed': 1.2, '+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(13, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Pine Staff',
    'bonuses': {'+minWeaponPhysicalDamage': 65, '+maxWeaponPhysicalDamage': 79, '+minWeaponMagicDamage': 33, '+maxWeaponMagicDamage': 39, '+attackSpeed': 1.2, '+weaponRange': 2, '+critChance': 0.04 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(18, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Rosewood Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 86, '+maxWeaponPhysicalDamage': 104, '+minWeaponMagicDamage': 43, '+maxWeaponMagicDamage': 51, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.04 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(23, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Rowan Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 106, '+maxWeaponPhysicalDamage': 128, '+minWeaponMagicDamage': 53, '+maxWeaponMagicDamage': 63, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.04 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(28, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Oak Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 126, '+maxWeaponPhysicalDamage': 154, '+minWeaponMagicDamage': 63, '+maxWeaponMagicDamage': 77, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.04 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(33, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Ebony Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 145, '+maxWeaponPhysicalDamage': 177, '+minWeaponMagicDamage': 72, '+maxWeaponMagicDamage': 88, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.05 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(38, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Ironwood Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 165, '+maxWeaponPhysicalDamage': 201, '+minWeaponMagicDamage': 82, '+maxWeaponMagicDamage': 100, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.05 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(43, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Iron Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 183, '+maxWeaponPhysicalDamage': 223, '+minWeaponMagicDamage': 91, '+maxWeaponMagicDamage': 111, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.06 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(48, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Steel Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 203, '+maxWeaponPhysicalDamage': 247, '+minWeaponMagicDamage': 101, '+maxWeaponMagicDamage': 123, '+attackSpeed': 1.2, '+weaponRange': 2.5, '+critChance': 0.06 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(58, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Adamantine Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 331, '+maxWeaponPhysicalDamage': 403, '+minWeaponMagicDamage': 168, '+maxWeaponMagicDamage': 204, '+attackSpeed': 0.9, '+weaponRange': 3, '+critChance': 0.07 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});
addItem(68, {'slot': 'weapon', 'type': 'staff', 'tags': ['twoHanded', 'magic'], 'name': 'Orichalcum Quarterstaff',
    'bonuses': {'+minWeaponPhysicalDamage': 225, '+maxWeaponPhysicalDamage': 273, '+minWeaponMagicDamage': 112, '+maxWeaponMagicDamage': 136, '+attackSpeed': 1.5, '+weaponRange': 3, '+critChance': 0.07 },
    source: weaponSources.staff, icon: equipmentIcons.balsaStaff});

//Two Handed Axes and Polearms
addItem(2, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Pickaxe',
    'bonuses': {'+minWeaponPhysicalDamage': 25, '+maxWeaponPhysicalDamage': 31,  '+attackSpeed': 0.5, '+weaponRange': 2, '+critChance': 0.05 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(7, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Felling Axe',
    'bonuses': {'+minWeaponPhysicalDamage': 79, '+maxWeaponPhysicalDamage': 97,  '+attackSpeed': 0.8, '+weaponRange': 2, '+critChance': 0.06 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(12, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Scythe',
    'bonuses': {'+minWeaponPhysicalDamage': 143, '+maxWeaponPhysicalDamage': 175,  '+attackSpeed': 0.8, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(17, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Greataxe',
    'bonuses': {'+minWeaponPhysicalDamage': 164, '+maxWeaponPhysicalDamage': 200,  '+attackSpeed': 1, '+weaponRange': 3, '+critChance': 0.07 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(22, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Heavy Greataxe',
    'bonuses': {'+minWeaponPhysicalDamage': 214, '+maxWeaponPhysicalDamage': 262,  '+attackSpeed': 1, '+weaponRange': 3, '+critChance': 0.07 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(27, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Naginata',
    'bonuses': {'+minWeaponPhysicalDamage': 240, '+maxWeaponPhysicalDamage': 294,  '+attackSpeed': 1.1, '+weaponRange': 4, '+critChance': 0.07 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(32, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Voulge',
    'bonuses': {'+minWeaponPhysicalDamage': 283, '+maxWeaponPhysicalDamage': 347,  '+attackSpeed': 1.1, '+weaponRange': 4, '+critChance': 0.08 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(37, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Glaive',
    'bonuses': {'+minWeaponPhysicalDamage': 330, '+maxWeaponPhysicalDamage': 402,  '+attackSpeed': 1.1, '+weaponRange': 4, '+critChance': 0.08 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(42, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Iron Halberd',
    'bonuses': {'+minWeaponPhysicalDamage': 340, '+maxWeaponPhysicalDamage': 416,  '+attackSpeed': 1.2, '+weaponRange': 5, '+critChance': 0.09 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(47, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Steel Halberd',
    'bonuses': {'+minWeaponPhysicalDamage': 382, '+maxWeaponPhysicalDamage': 466,  '+attackSpeed': 1.2, '+weaponRange': 5, '+critChance': 0.09 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(52, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Poleaxe',
    'bonuses': {'+minWeaponPhysicalDamage': 387, '+maxWeaponPhysicalDamage': 473,  '+attackSpeed': 1.3, '+weaponRange': 6, '+critChance': 0.1 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(62, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Runed Poleaxe',
    'bonuses': {'+minWeaponPhysicalDamage': 425, '+maxWeaponPhysicalDamage': 519,  '+attackSpeed': 1.3, '+weaponRange': 6, '+critChance': 0.1, '+minWeaponMagicDamage': 10, '+maxWeaponMagicDamage': 24 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});
addItem(72, {'slot': 'weapon', 'type': 'polearm', 'tags': ['twoHanded'], 'name': 'Adamantine Poleaxe',
    'bonuses': {'+minWeaponPhysicalDamage': 1014, '+maxWeaponPhysicalDamage': 1238,  '+attackSpeed': 0.7, '+weaponRange': 6, '+critChance': 0.11, '+minWeaponMagicDamage': 50, '+maxWeaponMagicDamage': 100 },
    source: weaponSources.bigAxe, icon: equipmentIcons.pickaxe});

//Greatswords
addItem(6, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Copper Claymore',
    'bonuses': {'+minWeaponPhysicalDamage': 64, '+maxWeaponPhysicalDamage': 78, '+attackSpeed': 1, '+weaponRange': 2, '+critChance': 0.05 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(11, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Bronze Claymore',
    'bonuses': {'+minWeaponPhysicalDamage': 116, '+maxWeaponPhysicalDamage': 140, '+attackSpeed': 1, '+weaponRange': 2, '+critChance': 0.05 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(16, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Iron Claymore',
    'bonuses': {'+minWeaponPhysicalDamage': 167, '+maxWeaponPhysicalDamage': 203, '+attackSpeed': 1, '+weaponRange': 2, '+critChance': 0.05 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(21, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Black Greatsword',
    'bonuses': {'+minWeaponPhysicalDamage': 180, '+maxWeaponPhysicalDamage': 220, '+attackSpeed': 1.2, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(26, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Katana',
    'bonuses': {'+minWeaponPhysicalDamage': 223, '+maxWeaponPhysicalDamage': 271, '+attackSpeed': 1.2, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(31, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Forged Greatsword',
    'bonuses': {'+minWeaponPhysicalDamage': 265, '+maxWeaponPhysicalDamage': 323, '+attackSpeed': 1.2, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(36, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Steel Greatsword',
    'bonuses': {'+minWeaponPhysicalDamage': 307, '+maxWeaponPhysicalDamage': 375, '+attackSpeed': 1.2, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(41, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Stainless Greatsword',
    'bonuses': {'+minWeaponPhysicalDamage': 350, '+maxWeaponPhysicalDamage': 428, '+attackSpeed': 1.2, '+weaponRange': 3, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(46, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Bidenhander',
    'bonuses': {'+minWeaponPhysicalDamage': 336, '+maxWeaponPhysicalDamage': 410, '+attackSpeed': 1.4, '+weaponRange': 3.5, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(51, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Meteoric Bidenhander',
    'bonuses': {'+minWeaponPhysicalDamage': 373, '+maxWeaponPhysicalDamage': 465, '+attackSpeed': 1.4, '+weaponRange': 3.5, '+critChance': 0.06 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(61, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Adamantine Bidenhander',
    'bonuses': {'+minWeaponPhysicalDamage': 710, '+maxWeaponPhysicalDamage': 866, '+attackSpeed': 0.9, '+weaponRange': 3.5, '+critChance': 0.07, '+minWeaponMagicDamage': 25, '+maxWeaponMagicDamage': 33 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
addItem(71, {'slot': 'weapon', 'type': 'greatsword', 'tags': ['twoHanded'], 'name': 'Masterwork Katana',
    'bonuses': {'+minWeaponPhysicalDamage': 421, '+maxWeaponPhysicalDamage': 513, '+attackSpeed': 1.5, '+weaponRange': 4, '+critChance': 0.07, '+minWeaponMagicDamage': 26, '+maxWeaponMagicDamage': 36 },
    source: weaponSources.greatSword, icon: equipmentIcons.copperClaymore});
}
