import { Jewel, Point, SavedFixedJewel, SavedJewel } from 'app/types';
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
    // This is assigned when the player is adding a new segment to their current board.
    boardPreview?: Board,
}

// Used for fully defined boards, like those users for the job's starting boards.
export interface BoardData {
    fixed: ShapeData[],
    spaces: ShapeData[],
}

// Used as templates for creating board augmentations when learning a new skill.
// Shapes are removed as needed, and one shape is set to be the fixed jewel.
export interface BoardTemplate {
    size: number,
    shapes: ShapeData[],
}

export interface SavedBoard {
    fixed: SavedFixedJewel[],
    jewels: SavedJewel[],
    spaces: SavedShape[],
}

export interface SavedShape {
    shapeKey: ShapeType,
    x: number,
    y: number,
    rotation: number,
}
