import { equipmentIcons } from 'app/content/equipment/equipmentIcons';
import { equipmentSources } from 'app/content/equipment/equipmentSources';
import { addItem } from 'app/content/equipment/index';

export function addBoots() {
//Sabatons gives armor and health
addItem(7, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Bamboo Sabatons', 'bonuses': {'+armor': 9, '+maxHealth': 55, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(12, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Copper Sabatons', 'bonuses': {'+armor': 16, '+maxHealth': 85, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(17, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Bronze Sabatons', 'bonuses': {'+armor': 23, '+maxHealth': 125, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(22, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Iron Sabatons', 'bonuses': {'+armor': 30, '+maxHealth': 165, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(27, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Black Sabatons', 'bonuses': {'+armor': 37, '+maxHealth': 205, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(32, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Forged Sabatons', 'bonuses': {'+armor': 44, '+maxHealth': 245, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(37, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Steel Sabatons', 'bonuses': {'+armor': 51, '+maxHealth': 285, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(42, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Stainless Sabatons', 'bonuses': {'+armor': 58, '+maxHealth': 325, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(47, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Engraved Sabatons', 'bonuses': {'+armor': 65, '+maxHealth': 365, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(52, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Meteoric Sabatons', 'bonuses': {'+armor': 72, '+maxHealth': 405, '-speed': 10},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(62, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Adamantium Sabatons', 'bonuses': {'+armor': 100, '+maxHealth': 500, '+evasion': 10, '+block': 10, '+magicBlock': 10, '%speed': -0.1},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});
addItem(72, {'slot': 'feet', 'type': 'heavyArmor', 'name': 'Orichalcum Sabatons', 'bonuses': {'+armor': 90, '+maxHealth': 500, '+evasion': 10, '+block': 10, '+magicBlock': 20},
    source: equipmentSources.heavyBoots, icon: equipmentIcons.bambooSabatons});


//Boots gives armor and evasion
addItem(6, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Leather Shoes', 'bonuses': {'+armor': 6, '+evasion': 10, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(11, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Hide Shoes', 'bonuses': {'+armor': 11, '+evasion': 18, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(16, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Leather Boots', 'bonuses': {'+armor': 16, '+evasion': 26, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(21, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Studded Boots', 'bonuses': {'+armor': 21, '+evasion': 34, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(26, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Hide Boots', 'bonuses': {'+armor': 26, '+evasion': 42, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(31, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Carapace Boots', 'bonuses': {'+armor': 31, '+evasion': 50, '-speed': 10},
    source: equipmentSources.leatherBoots, icon: equipmentIcons.leatherShoes});
addItem(36, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Padded Boots', 'bonuses': {'+armor': 36, '+evasion': 58, '-speed': 10},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});
addItem(41, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Plated Boots', 'bonuses': {'+armor': 41, '+evasion': 66, '-speed': 10},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});
addItem(46, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Scale Boots', 'bonuses': {'+armor': 46, '+evasion': 74, '-speed': 10},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});
addItem(51, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Composite Boots', 'bonuses': {'+armor': 51, '+evasion': 82, '-speed': 10},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});
addItem(61, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Runed Boots', 'bonuses': {'+armor': 60, '+evasion': 90, '+maxHealth': 35, '+block': 5, '+magicBlock': 5, '-speed': 25},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});
addItem(71, {'slot': 'feet', 'type': 'lightArmor', 'name': 'Dragon Boots', 'bonuses': {'+armor': 70, '+evasion': 110,'+maxHealth': 100, '+block': 10, '+magicBlock': 20},
    source: equipmentSources.redShoes, icon: equipmentIcons.leatherShoes});

//Sandals/Slippers gives block and magic block
addItem(1, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Sandals', 'bonuses': {'+block': 1, '+magicBlock': 1, '-speed': 5},
    source: equipmentSources.sandals, icon: equipmentIcons.sandals});
addItem(5, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Leather Sandals', 'bonuses': {'+block': 5, '+magicBlock': 5, '+speed': 5},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(10, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Winged Sandals', 'bonuses': {'+block': 9, '+magicBlock': 9, '+speed': 15},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(15, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Cotton Slippers', 'bonuses': {'+block': 13, '+magicBlock': 13, '+speed': 15},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(20, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Fur Slippers', 'bonuses': {'+block': 17, '+magicBlock': 17, '+speed': 15},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(25, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Cashmere Slippers', 'bonuses': {'+block': 21, '+magicBlock': 21, '+speed': 20},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(30, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Silk Slippers', 'bonuses': {'+block': 25, '+magicBlock': 25, '+speed': 20},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(35, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Angora Slippers', 'bonuses': {'+block': 29, '+magicBlock': 29, '+speed': 25},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(40, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Velvet Slippers', 'bonuses': {'+block': 33, '+magicBlock': 33, '+speed': 25},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(45, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Embroidered Slippers', 'bonuses': {'+block': 37, '+magicBlock': 37, '+speed': 30},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(50, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Sourcerous Slippers', 'bonuses': {'+block': 41, '+magicBlock': 41, '+speed': 35},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(60, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Blessed Sandals', 'bonuses': {'+block': 50, '+magicBlock': 50, '+armor': 5, '+evasion': 5, '+maxHealth': 35, '+speed': 35},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
addItem(70, {'slot': 'feet', 'type': 'clothArmor', 'name': 'Divine Sandals', 'bonuses': {'+block': 70, '+magicBlock': 60, '+armor': 10, '+evasion': 10, '+maxHealth': 60, '*speed': 1.2, '+speed': 15},
    source: equipmentSources.wizardSandals, icon: equipmentIcons.sandals});
}
