import { backgrounds } from 'app/content/backgrounds';
import { ActiveEffect, Actor, Exit, FixedObject, FullRectangle, ShortRectangle } from 'app/types';

// Things the exist in areas need at least these spatial properties.
export interface AreaEntity {
    x: number, y: number, z: number,
    width: number, height: number,
}

export interface LocationTarget extends AreaEntity {
    targetType: 'location',
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
    background: keyof typeof backgrounds,
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
    // Only used during testing currently.
    noTreasure?: boolean,
}

export type MapTarget = LevelData | Shrine;

// instantiated level.
export interface Level {
    base: LevelData,
    level: number,
    levelDifficulty: LevelDifficulty,
    entrance: Exit,
    areas: Map<string, Area>,
    completed?: boolean,
}
export type LevelObject = {
    targetType: 'object',
    x: number,
    y: number,
    z: number,
    width: number, height: number,
    type: 'text' | 'button',
    solid?: boolean,
    isOver?: (x: number, y: number) => boolean,
    // Action performed when clicked on
    onClick?: Function,
    // Action performed when an actor interacts with the object.
    action?: Function,
    render?: Function
    update?: Function,
    helpMethod?: Function,
}
export type AreaObject = FixedObject | LevelObject;

export interface Area {
    key: string,
    isBossArea?: boolean,
    isGuildArea?: boolean,
    backgroundPatterns: {[key: string]: string},
    drawMinimapIcon?: Function,
    areas?: Map<string, Area>,
    width: number,
    wallDecorations?: any[],
    rightWallDecorations?: any[],
    leftWallDecorations?: any[],
    rightWall?: string,
    leftWall?: string,
    left: number,
    cameraX: number,
    time: number,
    timeStopEffect?: any,

    allies: Actor[],
    enemies: Actor[],
    projectiles: any[],
    effects: ActiveEffect[],
    textPopups: any[],
    treasurePopups: any[],
    objects: AreaObject[],
}