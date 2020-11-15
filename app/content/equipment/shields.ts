import { equipmentIcons } from 'app/content/equipment/equipmentIcons';
import { addItem } from 'app/content/equipment/index';

export function addShields() {
//Heavy Shields
addItem(2, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Wooden Board',
    bonuses: {'+maxHealth': 20, '+block': 3}, icon: equipmentIcons.woodenBoard});
addItem(4, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Scuta',
    bonuses: {'+maxHealth': 60, '+block': 10}, icon: equipmentIcons.woodenBoard});
addItem(9, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Wooden Kite Shield',
    bonuses: {'+maxHealth': 90, '+block': 17}, icon: equipmentIcons.woodenBoard});
addItem(14, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Iron Kite Shield',
    bonuses: {'+maxHealth': 130, '+block': 24}, icon: equipmentIcons.woodenBoard});
addItem(19, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Wooden Heater Shield',
    bonuses: {'+maxHealth': 170, '+block': 31}, icon: equipmentIcons.woodenBoard});
addItem(24, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Iron Heater Shield',
    bonuses: {'+maxHealth': 210, '+block': 39}, icon: equipmentIcons.woodenBoard});
addItem(29, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Steel Heater Shield',
    bonuses: {'+maxHealth': 250, '+block': 46}, icon: equipmentIcons.woodenBoard});
addItem(34, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Iron Tower Shield',
    bonuses: {'+maxHealth': 290, '+block': 53}, icon: equipmentIcons.woodenBoard});
addItem(39, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Steel Tower Shield',
    bonuses: {'+maxHealth': 330, '+block': 60}, icon: equipmentIcons.woodenBoard});
addItem(44, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Stainless Tower Shield',
    bonuses: {'+maxHealth': 370, '+block': 67}, icon: equipmentIcons.woodenBoard});
addItem(49, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Meteoric Tower Shield',
    bonuses: {'+maxHealth': 400, '+block': 75}, icon: equipmentIcons.woodenBoard});
addItem(59, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Adamantium Tower Shield',
    bonuses: {'+maxHealth': 400, '+block': 120, '+armor': 5, '+evasion': 5, '+magicBlock': 10, '%speed': -0.1}, icon: equipmentIcons.woodenBoard});
addItem(69, {'slot': 'offhand', 'type': 'heavyShield', 'tags': ['shield'], 'name': 'Orichalcum Tower Shield',
    bonuses: {'+maxHealth': 400, '+block': 110, '+armor': 10, '+evasion': 10, '+magicBlock': 20}, icon: equipmentIcons.woodenBoard});

//Light Shields
addItem(1, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Wooden Bowl',
    bonuses: {'+evasion': 3, '+block': 2}, icon: equipmentIcons.woodenBowl});
addItem(3, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Parma',
    bonuses: {'+evasion': 11, '+block': 9}, icon: equipmentIcons.woodenBowl});
addItem(8, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Wooden Round Shield',
    bonuses: {'+evasion': 19, '+block': 16}, icon: equipmentIcons.woodenBowl});
addItem(13, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Leather Round Shield',
    bonuses: {'+evasion': 27, '+block': 23}, icon: equipmentIcons.woodenBowl});
addItem(18, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Hide Round Shield',
    bonuses: {'+evasion': 35, '+block': 30}, icon: equipmentIcons.woodenBowl});
addItem(23, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Iron Round Shield',
    bonuses: {'+evasion': 43, '+block': 37}, icon: equipmentIcons.woodenBowl});
addItem(28, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Steel Round Shield',
    bonuses: {'+evasion': 51, '+block': 44}, icon: equipmentIcons.woodenBowl});
addItem(33, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Iron Buckler',
    bonuses: {'+evasion': 59, '+block': 51}, icon: equipmentIcons.woodenBowl});
addItem(38, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Steel Buckler',
    bonuses: {'+evasion': 67, '+block': 58}, icon: equipmentIcons.woodenBowl});
addItem(43, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Stainless Buckler',
    bonuses: {'+evasion': 75, '+block': 65}, icon: equipmentIcons.woodenBowl});
addItem(48, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Meteoric Buckler',
    bonuses: {'+evasion': 83, '+block': 72}, icon: equipmentIcons.woodenBowl});
addItem(58, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Runed Buckler',
    bonuses: {'+evasion': 90, '+block': 80, '+armor': 5, '+maxHealth': 35, '+magicBlock': 10}, icon: equipmentIcons.woodenBowl});
addItem(68, {'slot': 'offhand', 'type': 'lightShield', 'tags': ['shield'], 'name': 'Dragon Buckler',
    bonuses: {'+evasion': 100, '+block': 90, '+armor': 10, '+maxHealth': 60, '+magicBlock': 20}, icon: equipmentIcons.woodenBowl});
}
