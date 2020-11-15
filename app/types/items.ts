import { Bonuses, EquipmentAffix, Frame, Hero, Person, SavedAffix, Tags } from 'app/types';

type AttackAnimationType = 'bowAttack' | 'throwingAttack' | 'wandAttack';

export type EquipmentSlot = 'weapon' | 'offhand' |
    'head' | 'body' | 'arms' | 'legs' | 'feet' |
    'ring' | 'back';
type WeaponType =
    'axe' | 'sword' | 'dagger' |
    'fist' | 'wand' | 'throwing' | 'bow' | 'staff' |
    'polearm' | 'greatsword';
type EquipmentType =
    WeaponType |
    'heavyShield' | 'lightShield' |
    'heavyArmor' | 'lightArmor' | 'clothArmor' |
    'ring' | 'band' |
    'amulet' | 'sheath' | 'bandolier' | 'cloak' | 'baldric' | 'quiver';

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
    icon: Frame,
    restrictions?: string[],
    gravity?: number,
}
interface UniqueItemData {
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
    icon: Frame,
    unique?: UniqueItemData,
    gravity?: number,
    animation?: AttackAnimationType,
    // Used by the crafting grid
    craftingX?: number,
    craftingY?: number,
}

export interface Item {
    base: ItemData,
    // unique id for each item used to map dom element back to item (for example, for drag and drop purposes).
    id: string,
    domElement: HTMLElement,
    itemLevel: number,
    // This won't be set until updateItem populates it.
    requiredLevel?: number,
    prefixes: EquipmentAffix[],
    suffixes: EquipmentAffix[],
    unique: boolean,
    actor?: Person | Hero,
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