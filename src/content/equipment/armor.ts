import { equipmentSources } from 'app/content/equipment/equipmentSources';
import { addItem } from 'app/inventory';

//Heavy Armor gives armor + health
addItem(3, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Lamellar', 'bonuses': {'+armor': 8, '+maxHealth': 40}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(8, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Bamboo Armor', 'bonuses': {'+armor': 13, '+maxHealth': 65}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(13, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Panoply', 'bonuses': {'+armor': 23, '+maxHealth': 115}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(18, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Plated Coat', 'bonuses': {'+armor': 33, '+maxHealth': 165}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(23, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Brigandine', 'bonuses': {'+armor': 43, '+maxHealth': 215}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(28, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Cuirass', 'bonuses': {'+armor': 53, '+maxHealth': 265}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(33, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Chainmall', 'bonuses': {'+armor': 63, '+maxHealth': 315}, 'source': equipmentSources.chainmailShirt, icon: 'heavyArmor'});
addItem(38, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Scalemail', 'bonuses': {'+armor': 73, '+maxHealth': 365}, 'source': equipmentSources.chainmailShirt, icon: 'heavyArmor'});
addItem(43, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Platemail', 'bonuses': {'+armor': 83, '+maxHealth': 415}, 'source': equipmentSources.chainmailShirt, icon: 'heavyArmor'});
addItem(48, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Half Plate', 'bonuses': {'+armor': 93, '+maxHealth': 465}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(53, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Full Plate', 'bonuses': {'+armor': 103, '+maxHealth': 515}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(63, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Adamantium Plate', 'bonuses': {'+armor': 130, '+maxHealth': 700, '+evasion': 20, '+block': 20, '+magicBlock': 10, '%speed': -0.2}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});
addItem(73, {'slot': 'body', 'type': 'heavyArmor', 'name': 'Orichalcum Plate', 'bonuses': {'+armor': 120, '+maxHealth': 700, '+evasion': 20, '+block': 20, '+magicBlock': 20}, 'source': equipmentSources.heavyShirt, icon: 'heavyArmor'});

//Light Armor gives armor and evasion
addItem(2, {'slot': 'body', 'type': 'lightArmor', 'name': 'Cloth Tunic', 'bonuses': {'+armor': 2, '+evasion': 4}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(7, {'slot': 'body', 'type': 'lightArmor', 'name': 'Leather Tunic', 'bonuses': {'+armor': 7, '+evasion': 19}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(12, {'slot': 'body', 'type': 'lightArmor', 'name': 'Hide Tunic', 'bonuses': {'+armor': 12, '+evasion': 34}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(17, {'slot': 'body', 'type': 'lightArmor', 'name': 'Leather Armor', 'bonuses': {'+armor': 17, '+evasion': 49}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(22, {'slot': 'body', 'type': 'lightArmor', 'name': 'Studded Armor', 'bonuses': {'+armor': 22, '+evasion': 64}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(27, {'slot': 'body', 'type': 'lightArmor', 'name': 'Hide Armor', 'bonuses': {'+armor': 27, '+evasion': 79}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(32, {'slot': 'body', 'type': 'lightArmor', 'name': 'Carapace Armor', 'bonuses': {'+armor': 32, '+evasion': 94}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(37, {'slot': 'body', 'type': 'lightArmor', 'name': 'Treated Armor', 'bonuses': {'+armor': 37, '+evasion': 109}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(42, {'slot': 'body', 'type': 'lightArmor', 'name': 'Splint Armor', 'bonuses': {'+armor': 42, '+evasion': 124}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(47, {'slot': 'body', 'type': 'lightArmor', 'name': 'Scale Armor', 'bonuses': {'+armor': 47, '+evasion': 139}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(52, {'slot': 'body', 'type': 'lightArmor', 'name': 'Composite Armor', 'bonuses': {'+armor': 52, '+evasion': 154}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(62, {'slot': 'body', 'type': 'lightArmor', 'name': 'Runed Armor', 'bonuses': {'+armor': 55, '+evasion': 155, '+maxHealth': 60, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});
addItem(72, {'slot': 'body', 'type': 'lightArmor', 'name': 'Dragon Armor', 'bonuses': {'+armor': 70, '+evasion': 170, '+maxHealth': 200, '+block': 20, '+magicBlock': 20}, 'source': equipmentSources.leatherVest, icon: 'lightArmor'});

// Cloth Armor gives armor, block and magic block
addItem(1, {'slot': 'body', 'type': 'clothArmor', 'name': 'Wool Shirt', 'bonuses': {'+armor': 2, '+block': 4, '+magicBlock': 2}, 'source': equipmentSources.vest, icon: 'clothArmor'});
addItem(6, {'slot': 'body', 'type': 'clothArmor', 'name': 'Hemp Frock', 'bonuses': {'+armor': 4, '+block': 10, '+magicBlock': 6}, 'source': equipmentSources.blueRobe, icon: 'clothArmor'});
addItem(11, {'slot': 'body', 'type': 'clothArmor', 'name': 'Linen Frock', 'bonuses': {'+armor': 7, '+block': 17, '+magicBlock': 11}, 'source': equipmentSources.blueRobe, icon: 'clothArmor'});
addItem(16, {'slot': 'body', 'type': 'clothArmor', 'name': 'Cotten Frock', 'bonuses': {'+armor': 10, '+block': 24, '+magicBlock': 16}, 'source': equipmentSources.blueRobe, icon: 'clothArmor'});
addItem(21, {'slot': 'body', 'type': 'clothArmor', 'name': 'Fur Coat', 'bonuses': {'+armor': 13, '+block': 31, '+magicBlock': 21}, 'source': equipmentSources.blueRobe, icon: 'clothArmor'});
addItem(26, {'slot': 'body', 'type': 'clothArmor', 'name': 'Cashmere Robe', 'bonuses': {'+armor': 16, '+block': 38, '+magicBlock': 26}, 'source': equipmentSources.purpleRobe, icon: 'clothArmor'});
addItem(31, {'slot': 'body', 'type': 'clothArmor', 'name': 'Silk Robe', 'bonuses': {'+armor': 19, '+block': 45, '+magicBlock': 31}, 'source': equipmentSources.purpleRobe, icon: 'clothArmor'});
addItem(36, {'slot': 'body', 'type': 'clothArmor', 'name': 'Angora Robe', 'bonuses': {'+armor': 22, '+block': 52, '+magicBlock': 36}, 'source': equipmentSources.purpleRobe, icon: 'clothArmor'});
addItem(41, {'slot': 'body', 'type': 'clothArmor', 'name': 'Velvet Robe', 'bonuses': {'+armor': 25, '+block': 59, '+magicBlock': 41}, 'source': equipmentSources.purpleRobe, icon: 'clothArmor'});
addItem(46, {'slot': 'body', 'type': 'clothArmor', 'name': 'Embroidered Robe', 'bonuses': {'+armor': 28, '+block': 66, '+magicBlock': 46}, 'source': equipmentSources.wizardRobe, icon: 'clothArmor'});
addItem(51, {'slot': 'body', 'type': 'clothArmor', 'name': 'Sorcerous Vestment', 'bonuses': {'+armor': 31, '+block': 73, '+magicBlock': 51}, 'source': equipmentSources.wizardRobe, icon: 'clothArmor'});
addItem(61, {'slot': 'body', 'type': 'clothArmor', 'name': 'Blessed Vestment', 'bonuses': {'+armor': 40, '+block': 80, '+magicBlock': 56, '+evasion': 10, '+maxHealth': 60}, 'source': equipmentSources.wizardRobe, icon: 'clothArmor'});
addItem(71, {'slot': 'body', 'type': 'clothArmor', 'name': 'Divine Vestment', 'bonuses': {'+armor': 50, '+block': 100, '+magicBlock': 75, '+evasion': 20, '+maxHealth': 100}, 'source': equipmentSources.wizardRobe, icon: 'clothArmor'});
