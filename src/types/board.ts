import { Jewel, Point } from 'app/types';
import { Polygon } from 'app/utils/polygon';

export type ShapeType = 'triangle' | 'square' | 'hexagon' | 'diamond' | 'rhombus' | 'trapezoid';

export interface ShapeData {
    k: ShapeType,
    p: Point,
    t: number,
}

export interface Board {
    fixed: Jewel[],
    spaces: Polygon[],
    jewels: Jewel[],
}

export interface BoardData {
    fixed: ShapeData[],
    spaces: ShapeData[],
}
