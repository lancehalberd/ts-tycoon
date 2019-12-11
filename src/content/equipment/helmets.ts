import { equipmentSources } from 'app/content/equipment/equipmentSources';
import { addItem } from 'app/content/equipment/index';

export function addHelmets() {
//Heavy Helmets gives armor and health
//addItem(1, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Dented Bucket', 'bonuses': {'+armor': 2, '+maxHealth': 10}, 'offset': 10, icon: 'helmet'});
addItem(2, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Oversized Helmet', 'bonuses': {'+armor': 5, '+maxHealth': 35}, 'source': equipmentSources.oversizedHelmet, icon: 'helmet'});
addItem(9, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Copper Helmet', 'bonuses': {'+armor': 18, '+maxHealth': 90}, 'source': equipmentSources.heavyHelmet, icon: 'helmet'});
addItem(14, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Bronze Helmet', 'bonuses': {'+armor': 26, '+maxHealth': 130}, 'source': equipmentSources.heavyHelmet, icon: 'helmet'});
addItem(19, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Iron Helmet', 'bonuses': {'+armor': 34, '+maxHealth': 170}, 'source': equipmentSources.heavyHelmet, icon: 'helmet'});
addItem(24, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Steel Helmet', 'bonuses': {'+armor': 42, '+maxHealth': 210}, 'source': equipmentSources.heavyHelmet, icon: 'helmet'});
addItem(29, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Chainmail Coif', 'bonuses': {'+armor': 50, '+maxHealth': 250}, 'source': equipmentSources.chainmailHelm, icon: 'helmet'});
addItem(34, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Scalemail Coif', 'bonuses': {'+armor': 58, '+maxHealth': 290}, 'source': equipmentSources.chainmailHelm, icon: 'helmet'});
addItem(39, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Platemail Coif', 'bonuses': {'+armor': 66, '+maxHealth': 330}, 'source': equipmentSources.chainmailHelm, icon: 'helmet'});
addItem(44, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Iron Great Helm', 'bonuses': {'+armor': 74, '+maxHealth': 370}, 'source': equipmentSources.devilHelmet, icon: 'helmet'});
addItem(49, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Steel Great Helm', 'bonuses': {'+armor': 82, '+maxHealth': 410}, 'source': equipmentSources.devilHelmet, icon: 'helmet'});
addItem(59, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Adamantium Great Helm', 'bonuses': {'+armor': 110, '+maxHealth': 500, '+evasion': 10, '+block': 10, '+magicBlock': 5, '%speed': -0.05}, 'source': equipmentSources.devilHelmet, icon: 'helmet'});
addItem(69, {'slot': 'head', 'type': 'heavyArmor', 'name': 'Orichalcum Great Helm', 'bonuses': {'+armor': 100, '+maxHealth': 550, '+evasion': 10, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.devilHelmet, icon: 'helmet'});

//Light Helmets gives armor and evasion
//addItem(1, {'slot': 'head', 'type': 'lightArmor', 'name': 'Rotten Bucket', 'bonuses': {'+armor': 1, '+evasion': 3}, 'offset': 10, icon: 'featherHat'});
addItem(4, {'slot': 'head', 'type': 'lightArmor', 'name': 'Leather Cap', 'bonuses': {'+armor': 7, '+evasion': 13}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(8, {'slot': 'head', 'type': 'lightArmor', 'name': 'Hide Cap', 'bonuses': {'+armor': 13, '+evasion': 23}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(13, {'slot': 'head', 'type': 'lightArmor', 'name': 'Leather Helmet', 'bonuses': {'+armor': 19, '+evasion': 33}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(18, {'slot': 'head', 'type': 'lightArmor', 'name': 'Studded Helmet', 'bonuses': {'+armor': 25, '+evasion': 43}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(23, {'slot': 'head', 'type': 'lightArmor', 'name': 'Hide Helmet', 'bonuses': {'+armor': 31, '+evasion': 53}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(28, {'slot': 'head', 'type': 'lightArmor', 'name': 'Shell Helmet', 'bonuses': {'+armor': 37, '+evasion': 63}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(33, {'slot': 'head', 'type': 'lightArmor', 'name': 'Leather Hood', 'bonuses': {'+armor': 43, '+evasion': 73}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(38, {'slot': 'head', 'type': 'lightArmor', 'name': 'Horned Helmet', 'bonuses': {'+armor': 49, '+evasion': 83}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(43, {'slot': 'head', 'type': 'lightArmor', 'name': 'Scale Helmet', 'bonuses': {'+armor': 55, '+evasion': 93}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(48, {'slot': 'head', 'type': 'lightArmor', 'name': 'Composite Helmet', 'bonuses': {'+armor': 61, '+evasion': 103}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(58, {'slot': 'head', 'type': 'lightArmor', 'name': 'Runed Helmet', 'bonuses': {'+armor': 70, '+evasion': 110, '+maxHealth': 35, '+block': 5, '+magicBlock': 5}, 'source': equipmentSources.featherCap, icon: 'featherHat'});
addItem(68, {'slot': 'head', 'type': 'lightArmor', 'name': 'Dragon Helmet', 'bonuses': {'+armor': 80, '+evasion': 120, '+maxHealth': 100, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.featherCap, icon: 'featherHat'});

//Hoods gives block and magic block
addItem(1, {'slot': 'head', 'type': 'clothArmor', 'name': 'Straw Hat', 'bonuses': {'+block': 2, '+magicBlock': 1}, 'source': equipmentSources.strawHat, icon: 'mageHat'});
addItem(3, {'slot': 'head', 'type': 'clothArmor', 'name': 'Wool Cap', 'bonuses': {'+block': 10, '+magicBlock': 5}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(7, {'slot': 'head', 'type': 'clothArmor', 'name': 'Winged Cap', 'bonuses': {'+block': 18, '+magicBlock': 9}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(12, {'slot': 'head', 'type': 'clothArmor', 'name': 'Cotten Hood', 'bonuses': {'+block': 26, '+magicBlock': 13}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(17, {'slot': 'head', 'type': 'clothArmor', 'name': 'Fur Hood', 'bonuses': {'+block': 34, '+magicBlock': 17}, 'source': equipmentSources.hood,icon: 'mageHat'});
addItem(22, {'slot': 'head', 'type': 'clothArmor', 'name': 'Cashmere Hood', 'bonuses': {'+block': 42, '+magicBlock': 21}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(27, {'slot': 'head', 'type': 'clothArmor', 'name': 'Silk Hood', 'bonuses': {'+block': 50, '+magicBlock': 25}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(32, {'slot': 'head', 'type': 'clothArmor', 'name': 'Angora Hood', 'bonuses': {'+block': 58, '+magicBlock': 29}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(37, {'slot': 'head', 'type': 'clothArmor', 'name': 'Velvet Hood', 'bonuses': {'+block': 66, '+magicBlock': 33}, 'source': equipmentSources.hood, icon: 'mageHat'});
addItem(42, {'slot': 'head', 'type': 'clothArmor', 'name': 'Embroidered Hat', 'bonuses': {'+block': 74, '+magicBlock': 37}, 'source': equipmentSources.wizardHat, icon: 'mageHat'});
addItem(47, {'slot': 'head', 'type': 'clothArmor', 'name': 'Wizards Hat', 'bonuses': {'+block': 82, '+magicBlock': 41}, 'source': equipmentSources.wizardHat, icon: 'mageHat'});
addItem(57, {'slot': 'head', 'type': 'clothArmor', 'name': 'Blessed Cowl', 'bonuses': {'+block': 85, '+magicBlock': 50, '+armor': 5, '+evasion': 5, '+maxHealth': 35}, 'source': equipmentSources.wizardHat, icon: 'mageHat'});
addItem(67, {'slot': 'head', 'type': 'clothArmor', 'name': 'Divine Cowl', 'bonuses': {'+block': 100, '+magicBlock': 60, '+armor': 10, '+evasion': 10, '+maxHealth': 50}, 'source': equipmentSources.wizardHat, icon: 'mageHat'});
}
