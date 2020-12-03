import { Ability, Bonuses, Character, Color, Point, SavedShape, ShapeType } from 'app/types';
import { Polygon } from 'app/utils/polygon'

export interface ShapeDefinition {
    key: ShapeType,
    lengths: number[],
    angles: number[],
    color: Color,
    angle: number,
    area: number,
}

export type JewelTier = 1 | 2 | 3 | 4 | 5;
export type JewelComponents = [number, number, number];
export type JewelQualifierName = 'Perfect' | 'Brilliant' | 'Shining' | '' | 'Dull';
export interface Jewel {
    id: string,
    adjacentJewels: Jewel[],
    adjacencyBonuses: Bonuses,
    area: number,
    // This stores componentBonuses * area * quality * qualifierBonus
    bonuses: Bonuses,
    // Canvas for displaying the jewel in the inventory.
    canvas?: HTMLCanvasElement,
    character: Character,
    componentBonuses: Bonuses,
    components: JewelComponents,
    context?: CanvasRenderingContext2D,
    // Div for holding the jewel in the inventory.
    domElement?: HTMLElement,
    fixed: boolean,
    helpMethod: (this: Jewel) => string,
    jewelType: number,
    price: number,
    qualifierBonus: number,
    qualifierName: JewelQualifierName,
    quality: number,
    shape: Polygon,
    shapeType: ShapeType,
    tier: JewelTier,
    disabled?: boolean,
    confirmed?: boolean,
    ability?: Ability,
    // These are set during drag effects.
    startCharacter?: Character,
    startCenter?: Point,
}

export interface SavedJewel {
    tier: JewelTier,
    quality: number,
    components: JewelComponents,
    shape: SavedShape,
}

export interface SavedFixedJewel {
    abilityKey: string,
    confirmed: boolean,
    disabled: boolean,
    shape: SavedShape,
}
