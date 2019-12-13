import { Actor, Affix, Bonuses, SavedAffix, Tags } from 'app/types';

type AttackAnimationType = 'bowAttack' | 'throwingAttack' | 'wandAttack';

export type EquipmentSlot = 'weapon' | 'offhand' |
    'head' | 'body' | 'arms' | 'legs' | 'feet' |
    'ring' | 'back';
export type WeaponType =
    'axe' | 'sword' | 'dagger' |
    'fist' | 'wand' | 'throwing' | 'bow' | 'staff' |
    'polearm' | 'greatsword';
export type EquipmentType =
    WeaponType |
    'heavyShield' | 'lightShield' |
    'heavyArmor' | 'lightArmor' | 'clothArmor' |
    'ring' | 'band' |
    'amulet' | 'sheath' | 'bandolier' | 'cloak' | 'baldric' | 'quiver';

export type EquipmentIconType =
    'bow' | 'throwing' | 'wand' | 'shuriken' |
    'staff' | 'knuckles' | 'dagger' | 'fists' |
    'sword' | 'axe' | 'greatSword' | 'greatAxe' |
    'heavyShield' | 'lightShield' | 'magicShield' |
    'featherHat' | 'helmet' | 'mageHat' |
    'heavyArmor' | 'lightArmor' | 'clothArmor' |
    'vambracers' | 'bracers' | 'gloves' |
    'greaves' | 'pants' | 'tights' |
    'sabatons' | 'boots' | 'shoes' |
    'ring' | 'band' |
    'cloak' | 'amulet' | 'quiver' | 'scabbard';

export type Equipment = {[key in EquipmentSlot]?: Item};
export type EquipmentData = {[key in EquipmentSlot]?: ItemData};
export type SavedEquipment = {[key in EquipmentSlot]?: SavedItem};

export interface RawItemData {
    name: string,
    tags?: string[],
    slot: EquipmentSlot,
    type: EquipmentType,
    bonuses: Bonuses,
    source?: any,
    animation?: AttackAnimationType,
    icon: EquipmentIconType,
    restrictions?: string[],
    gravity?: number,
}
export interface UniqueItemData {
    initialChance: number,
    incrementChance: number,
    chance: number,
    displayName: string,
    prefixes: string[],
    suffixes: string[]
}
export interface ItemData {
    key: string,
    name: string,
    tags: Tags,
    slot: EquipmentSlot,
    type: EquipmentType,
    level: number,
    craftingWeight: number,
    crafted: boolean,
    hasImplicitBonuses: true,
    bonuses: Bonuses,
    restrictions?: string[],
    source?: any,
    icon: EquipmentIconType,
    unique?: UniqueItemData,
    gravity?: number,
    animation?: AttackAnimationType,
}

export interface Item {
    base: ItemData,
    domElement: HTMLElement,
    itemLevel: number,
    // This won't be set until updateItem populates it.
    requiredLevel?: number,
    prefixes: Affix[],
    suffixes: Affix[],
    unique: boolean,
    actor?: Actor,
    // This can override the default display name.
    displayName?: string,
}

export interface SavedItem {
    itemKey: string,
    itemLevel: number,
    prefixes: SavedAffix[],
    suffixes: SavedAffix[],
    unique: boolean,
}