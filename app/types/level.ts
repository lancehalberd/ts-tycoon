import { areaTypes } from 'app/content/areas';
import {
    Actor, Area, AreaObject, Exit,
    Hero, ObjectShape, ShortRectangle,
} from 'app/types';

export interface LootDrop {
    addTreasurePopup: (hero: Hero, x: number, y: number, z: number, delay: number) => void,
    gainLoot: (hero: Hero) => void,
}

export interface LootGenerator {
    type: string,
    generateLootDrop: () => LootDrop,
}

export type Target = LocationTarget | Actor;

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'endless';

export interface Shrine extends ShortRectangle {
    targetType: 'shrine',
    level: LevelData,
    helpMethod?: () => string,
    isPointOver?: (x: number, y: number) => boolean,
}

export interface LevelData {
    targetType?: 'level',
    levelKey?: string,
    name: string,
    description: string,
    level: number,
    coords: number[],
    background: keyof typeof areaTypes,
    unlocks: string[],
    skill: string,
    enemySkills: string[],
    monsters: string[],
    events: string[][],
    isGuild?: boolean,
    shrine?: Shrine,
    x?: number, y?: number,
    w?: number, h?: number,
    helpMethod?: () => string,
    isPointOver?: (x: number, y: number) => boolean,
    // Only used during testing
    testArea?: boolean,
}

export type MapTarget = (LevelData | Shrine) & {isPointOver: (x: number, y: number) => boolean};

// instantiated level.
export interface Level {
    base: LevelData,
    enemyLevel: number,
    levelDifficulty: LevelDifficulty,
    entrance: Exit,
    areas: Map<string, Area>,
    completed?: boolean,
}

export interface AreaEntity {
    area: Area,
    shapeType?: ObjectShape,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
}

export interface AreaObjectTarget extends AreaEntity {
    targetType: 'object',
    object: AreaObject,
}
export interface LocationTarget extends AreaEntity {
    targetType: 'location',
}
export type AreaTarget = AreaObjectTarget | LocationTarget | Actor;

