import { equipmentIcons } from 'app/content/equipment/equipmentIcons';
import { equipmentSources } from 'app/content/equipment/equipmentSources';
import { addItem } from 'app/content/equipment/index';

export function addLeggings() {
//Greaves gives armor and health
addItem(6, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Bamboo Skirt',
    bonuses: {'+armor': 12, '+maxHealth': 65}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(11, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Copper Skirt',
    bonuses: {'+armor': 21, '+maxHealth': 100}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(16, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Bronze Greaves',
    bonuses: {'+armor': 30, '+maxHealth': 145}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(21, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Iron Greaves',
    bonuses: {'+armor': 39, '+maxHealth': 190}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(26, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Black Greaves',
    bonuses: {'+armor': 48, '+maxHealth': 235}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(31, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Forged Greaves',
    bonuses: {'+armor': 57, '+maxHealth': 280}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(36, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Steel Greaves',
    bonuses: {'+armor': 66, '+maxHealth': 325}, 'source': equipmentSources.chainmailSkirt, icon: equipmentIcons.bambooSkirt});
addItem(41, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Stainless Greaves',
    bonuses: {'+armor': 75, '+maxHealth': 370}, 'source': equipmentSources.chainmailSkirt, icon: equipmentIcons.bambooSkirt});
addItem(46, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Engraved Greaves',
    bonuses: {'+armor': 84, '+maxHealth': 415}, 'source': equipmentSources.chainmailSkirt, icon: equipmentIcons.bambooSkirt});
addItem(51, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Meteoric Greaves',
    bonuses: {'+armor': 93, '+maxHealth': 460}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(61, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Adamantium Greaves',
    bonuses: {'+armor': 110, '+maxHealth': 550, '+evasion': 20, '+block': 20, '+magicBlock': 10, '%speed': -0.1}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});
addItem(71, {'slot': 'legs', 'type': 'heavyArmor', 'name': 'Orichalcum Greaves',
    bonuses: {'+armor': 100, '+maxHealth': 550, '+evasion': 20, '+block': 20, '+magicBlock': 20}, 'source': equipmentSources.heavyPants, icon: equipmentIcons.bambooSkirt});

//Pants gives evasion and armor
addItem(5, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Leather Kilt',
    bonuses: {'+armor': 10, '+evasion': 13}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(10, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Hide Kilt',
    bonuses: {'+armor': 18, '+evasion': 23}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(15, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Leather Pants',
    bonuses: {'+armor': 26, '+evasion': 33}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(20, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Studded Pants',
    bonuses: {'+armor': 34, '+evasion': 43}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(25, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Hide Pants',
    bonuses: {'+armor': 42, '+evasion': 53}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(30, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Carapace Pants',
    bonuses: {'+armor': 50, '+evasion': 63}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(35, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Padded Pants',
    bonuses: {'+armor': 58, '+evasion': 73}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(40, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Plated Pants',
    bonuses: {'+armor': 66, '+evasion': 83}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(45, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Scale Pants',
    bonuses: {'+armor': 74, '+evasion': 93}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(50, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Composite Pants',
    bonuses: {'+armor': 82, '+evasion': 103}, icon: equipmentIcons.leatherKilt});
addItem(60, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Runed Pants',
    bonuses: {'+armor': 85, '+evasion': 115, '+maxHealth': 60, '+block': 10, '+magicBlock': 10}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});
addItem(70, {'slot': 'legs', 'type': 'lightArmor', 'name': 'Dragon Pants',
    bonuses: {'+armor': 90, '+evasion': 120, '+maxHealth': 100, '+block': 20, '+magicBlock': 20}, 'source': equipmentSources.leatherPants, icon: equipmentIcons.leatherKilt});

//Tights gives block and magic block
addItem(1, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Tattered Shorts',
    bonuses: {'+block': 3, '+magicBlock': 1}, source: equipmentSources.shorts, icon: equipmentIcons.shorts});
addItem(4, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Hemp Shorts',
    bonuses: {'+block': 11, '+magicBlock': 6}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(9, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Linen Shorts',
    bonuses: {'+block': 19, '+magicBlock': 11}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(14, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Cotten Shorts',
    bonuses: {'+block': 27, '+magicBlock': 16}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(19, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Fur Tights',
    bonuses: {'+block': 35, '+magicBlock': 21}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(24, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Cashmere Tights',
    bonuses: {'+block': 43, '+magicBlock': 26}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(29, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Silk Tights',
    bonuses: {'+block': 51, '+magicBlock': 31}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(34, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Angora Tights',
    bonuses: {'+block': 59, '+magicBlock': 36}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(39, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Velvet Tights',
    bonuses: {'+block': 67, '+magicBlock': 41}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(44, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Embroidered Tights',
    bonuses: {'+block': 75, '+magicBlock': 46}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(49, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Sorcerous Tights',
    bonuses: {'+block': 83, '+magicBlock': 51}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(59, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Blessed Tights',
    bonuses: {'+block': 90, '+magicBlock': 60, '+armor': 10, '+evasion': 10, '+maxHealth': 60}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
addItem(69, {'slot': 'legs', 'type': 'clothArmor', 'name': 'Divine Tights',
    bonuses: {'+block': 100, '+magicBlock': 70, '+armor': 20, '+evasion': 20, '+maxHealth': 60}, source: equipmentSources.wizardPants, icon: equipmentIcons.shorts});
}
