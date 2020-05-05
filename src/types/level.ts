import { areaTypes } from 'app/content/areas';
import {
    Ability, ActiveEffect, Actor, FrameAnimation,
    AreaObject, BonusSource, Exit,
    FixedObject, FullRectangle, Hero, MonsterSpawn,
    ShortRectangle,
} from 'app/types';

export interface LootDrop {
    addTreasurePopup: (hero: Hero, x: number, y: number, z: number, delay: number) => void,
    gainLoot: (hero: Hero) => void,
}

export interface LootGenerator {
    type: string,
    generateLootDrop: () => LootDrop,
}

export interface AreaType {
    addObjects: (area: Area, args: {
        monsters?: MonsterSpawn[],
        exits?: Exit[],
        loot?: any[],
        ability?: Ability,
    }) => void,
    drawFloor: (context: CanvasRenderingContext2D, area: Area) => void,
    drawBackground: (context: CanvasRenderingContext2D, area: Area) => void,
}

export type Target = LocationTarget | Actor;

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'endless';

export interface Shrine extends ShortRectangle {
    targetType: 'shrine',
    level: LevelData,
    helpMethod?: Function,
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
    isGuildArea?: boolean,
    shrine?: Shrine,
    x?: number, y?: number,
    w?: number, h?: number,
    helpMethod?: Function,
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
    shapeType?: 'oval' | 'rectangle',
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
}

export interface AreaTarget extends AreaEntity {
    targetType: string,
}
export interface AreaObjectTarget extends AreaTarget {
    targetType: 'object',
    object: AreaObject,
}
export interface LocationTarget extends AreaTarget {
    targetType: 'location',
}

export interface Area {
    key: string,
    areaType: string,
    isBossArea?: boolean,
    isGuildArea?: boolean,
    drawMinimapIcon?: Function,
    areas?: Map<string, Area>,
    width: number,
    rightWall?: FrameAnimation,
    leftWall?: FrameAnimation,
    cameraX: number,
    time: number,
    // Used for randomly generating area.
    seed: number,
    timeStopEffect?: any,
    // Optional array of bonuses that apply to all enemies in this area.
    enemyBonuses?: BonusSource[],
    isShrineArea?: boolean,
    monsters?: MonsterSpawn[],

    allies: Actor[],
    enemies: Actor[],
    projectiles: any[],
    effects: ActiveEffect[],
    textPopups: any[],
    treasurePopups: any[],
    objects: AreaObject[],
    wallDecorations: AreaObject[],
    objectsByKey?: {[key in string]: AreaObject},

    // Used to show the chest open icon for the minimap.
    chestOpened?: boolean,
}
