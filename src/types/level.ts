import { areaTypes } from 'app/content/areaTypes';
import {
    Ability, ActiveEffect, Actor, Animation, BonusSource, Exit,
    FixedObject, FullRectangle, Hero, MonsterSpawn, ShortRectangle,
} from 'app/types';

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
    // Only used during testing
    testArea?: boolean,
}

export type MapTarget = LevelData | Shrine;

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
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
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

export interface AreaObject {
    update?: (object: AreaObject) => void,
    getAreaTarget: (object: AreaObject) => AreaObjectTarget,
    onInteract?: (object: AreaObject, actor: Actor) => void,
    shouldInteract?: (object: AreaObject, actor: Actor) => boolean,
    isEnabled?: (object: AreaObject) => boolean,
    render?: (context: CanvasRenderingContext2D, object: AreaObject) => void,
    drawGround?: (context: CanvasRenderingContext2D, object: AreaObject) => void,
    getMouseTarget?: (object: AreaObject) => ShortRectangle,
    isPointOver?: (object: AreaObject, x: number, y: number) => boolean,

    // This may be unset when an object has not been assigned to an area yet.
    area?: Area,
    isSolid?: boolean,
    helpMethod?: (object: AreaObject, hero: Hero) => string,
}

export interface Area {
    key: string,
    isBossArea?: boolean,
    isGuildArea?: boolean,
    backgroundPatterns: {[key: string]: string},
    drawMinimapIcon?: Function,
    areas?: Map<string, Area>,
    width: number,
    wallDecorations: AreaObject[],
    rightWall?: Animation,
    leftWall?: Animation,
    left: number,
    cameraX: number,
    time: number,
    // Used for randomly generating area.
    seed: number,
    timeStopEffect?: any,
    // Optional array of bonuses that apply to all enemies in this area.
    enemyBonuses?: BonusSource[],
    isShrineArea?: boolean,

    allies: Actor[],
    enemies: Actor[],
    projectiles: any[],
    effects: ActiveEffect[],
    textPopups: any[],
    treasurePopups: any[],
    objects: AreaObject[],
}