import { equipmentSources } from 'app/content/equipment/equipmentSources';
import { addItem } from 'app/content/equipment/index';

export function addGloves() {
//Vambracers gives armor and health
//addItem(1, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Corroded Vambracers', 'bonuses': {'+armor': 2, '+maxHealth': 10}, icon: 'vambracers'});
addItem(5, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Bamboo Vambracers', 'bonuses': {'+armor': 10, '+maxHealth': 60}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(10, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Copper Vambracers', 'bonuses': {'+armor': 18, '+maxHealth': 90}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(15, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Bronze Vambracers', 'bonuses': {'+armor': 26, '+maxHealth': 130}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(20, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Iron Vambracers', 'bonuses': {'+armor': 34, '+maxHealth': 170}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(25, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Black Vambracers', 'bonuses': {'+armor': 42, '+maxHealth': 210}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(30, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Forged Vambracers', 'bonuses': {'+armor': 50, '+maxHealth': 250}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(35, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Steel Vambracers', 'bonuses': {'+armor': 58, '+maxHealth': 290}, 'source': equipmentSources.chainmailGloves, icon: 'vambracers'});
addItem(40, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Stainless Vambracers', 'bonuses': {'+armor': 66, '+maxHealth': 330}, 'source': equipmentSources.chainmailGloves, icon: 'vambracers'});
addItem(45, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Engraved Vambracers', 'bonuses': {'+armor': 74, '+maxHealth': 370}, 'source': equipmentSources.chainmailGloves, icon: 'vambracers'});
addItem(50, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Meteoric Vambracers', 'bonuses': {'+armor': 82, '+maxHealth': 410}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(60, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Adamantium Vambracers', 'bonuses': {'+armor': 110, '+maxHealth': 500, '+evasion': 10, '+block': 10, '+magicBlock': 5, '%speed': -0.05}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});
addItem(70, {'slot': 'arms', 'type': 'heavyArmor', 'name': 'Orichalcum Vambracers', 'bonuses': {'+armor': 100, '+maxHealth': 550, '+evasion': 10, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.heavySleeves, icon: 'vambracers'});

//Bracers gives armor and evasion
//addItem(1, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Rotting Bracelets', 'bonuses': {'+armor': 1, '+evasion': 3}, icon: 'bracers'});
addItem(4, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Leather Bracelets', 'bonuses': {'+armor': 7, '+evasion': 13}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(9, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Hide Bracelets', 'bonuses': {'+armor': 13, '+evasion': 23}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(14, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Leather Bracers', 'bonuses': {'+armor': 19, '+evasion': 33}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(19, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Studded Bracers', 'bonuses': {'+armor': 25, '+evasion': 43}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(24, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Hide Bracers', 'bonuses': {'+armor': 31, '+evasion': 53}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(29, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Carapace Bracers', 'bonuses': {'+armor': 37, '+evasion': 63}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(34, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Padded Bracers', 'bonuses': {'+armor': 43, '+evasion': 73}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(39, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Plated Bracers', 'bonuses': {'+armor': 49, '+evasion': 83}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(44, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Scale Bracers', 'bonuses': {'+armor': 55, '+evasion': 93}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(49, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Composite Bracers', 'bonuses': {'+armor': 61, '+evasion': 103}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(59, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Runed Bracers', 'bonuses': {'+armor': 70, '+evasion': 110, '+maxHealth': 35, '+block': 5, '+magicBlock': 5}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});
addItem(69, {'slot': 'arms', 'type': 'lightArmor', 'name': 'Dragon Bracers', 'bonuses': {'+armor': 80, '+evasion': 120, '+maxHealth': 100, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.leatherLongGloves, icon: 'bracers'});

//Gloves gives block and magic block
addItem(1, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Torn Mittens', 'bonuses': {'+block': 2, '+magicBlock': 1}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(3, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Hemp Mittens', 'bonuses': {'+block': 10, '+magicBlock': 5}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(8, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Linen Mittens', 'bonuses': {'+block': 18, '+magicBlock': 9}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(13, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Cotten Mittens', 'bonuses': {'+block': 26, '+magicBlock': 13}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(18, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Fur Gloves', 'bonuses': {'+block': 34, '+magicBlock': 17}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(23, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Cashmere Gloves', 'bonuses': {'+block': 42, '+magicBlock': 21}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(28, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Silk Gloves', 'bonuses': {'+block': 50, '+magicBlock': 25}, 'source': equipmentSources.leatherGloves, icon: 'gloves'});
addItem(33, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Angora Gloves', 'bonuses': {'+block': 58, '+magicBlock': 29}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
addItem(38, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Velvet Gloves', 'bonuses': {'+block': 66, '+magicBlock': 33}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
addItem(43, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Embroidered Gloves', 'bonuses': {'+block': 74, '+magicBlock': 37}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
addItem(48, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Sorcerous Gloves', 'bonuses': {'+block':82, '+magicBlock': 41}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
addItem(58, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Blessed Gloves', 'bonuses': {'+block': 85, '+magicBlock': 50, '+armor': 5, '+evasion': 5, '+maxHealth': 35}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
addItem(68, {'slot': 'arms', 'type': 'clothArmor', 'name': 'Divine Gloves', 'bonuses': {'+block': 100, '+magicBlock': 60, '+armor': 10, '+evasion': 10, '+maxHealth': 60}, 'source': equipmentSources.wizardSleeves, icon: 'gloves'});
}
