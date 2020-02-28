import { areaTypes } from 'app/content/areaTypes';
import {
    Ability, ActiveEffect, Actor, Animation, BonusSource, Exit,
    FixedObject, FullRectangle, MonsterSpawn, ShortRectangle,
} from 'app/types';

// Things the exist in areas need at least these spatial properties.
export interface AreaEntity {
    area: Area,
    x: number, y: number, z: number,
    width: number, height: number,
    update?: (entity: AreaEntity) => void,
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

export interface LocationTarget extends AreaEntity {
    targetType: 'location',
}

export interface RenderableAreaEntity extends AreaEntity {
    render: (context: CanvasRenderingContext2D, entity: RenderableAreaEntity) => void,
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
export type AreaObject = FixedObject;

export interface Area {
    key: string,
    isBossArea?: boolean,
    isGuildArea?: boolean,
    backgroundPatterns: {[key: string]: string},
    drawMinimapIcon?: Function,
    areas?: Map<string, Area>,
    width: number,
    wallDecorations?: any[],
    rightWall?: Animation,
    leftWall?: Animation,
    left: number,
    cameraX: number,
    time: number,
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