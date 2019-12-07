export type Color = number | string;

export interface Frame {
    image: HTMLCanvasElement | HTMLImageElement,
    left: number,
    top: number,
    width: number,
    height: number,
    draw?: Function,
}
export interface TintedFrame extends Frame {
    color: Color,
}


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

export type AttackAnimationType = 'bowAttack' | 'throwingAttack' | 'wandAttack';

export interface RawItemData {
    name: string,
    tags?: string[],
    slot: EquipmentSlot,
    type: EquipmentType,
    bonuses: any,
    source?: any,
    animation?: AttackAnimationType,
    icon: EquipmentIconType,
    restrictions?: string[],
    gravity?: number,
}
export interface ItemData {
    key: string,
    name: string,
    tags: {[key: string]: true},
    slot: EquipmentSlot,
    type: EquipmentType,
    level: number,
    craftingWeight: number,
    crafted: boolean,
    hasImplicitBonuses: true,
    bonuses: any,
    source?: any,
    icon: EquipmentIconType,
}