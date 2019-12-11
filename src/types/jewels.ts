import { Ability, Bonuses, ShapeType } from 'app/types';
import { Polygon } from 'app/utils/polygon'

export type JewelTier = 1 | 2 | 3 | 4 | 5;
export type JewelComponents = [number, number, number];
export type JewelQualifierName = 'Perfect' | 'Brilliant' | 'Shining' | '' | 'Dull';
export interface Jewel {
    adjacentJewels: Jewel[],
    adjacencyBonuses: Bonuses,
    area: number,
    // This stores componentBonuses * area * quality * qualifierBonus
    bonuses: Bonuses,
    // Canvas for displaying the jewel in the inventory.
    canvas?: HTMLCanvasElement,
    character: any,
    componentBonuses: Bonuses,
    components: JewelComponents,
    context?: CanvasRenderingContext2D,
    // Div for holding the jewel in the inventory.
    domElement?: HTMLElement,
    fixed: boolean,
    helpMethod: (jewel: Jewel) => string,
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
}
