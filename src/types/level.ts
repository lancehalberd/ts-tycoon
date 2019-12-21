import { backgrounds } from 'app/content/backgrounds';
import { ActiveEffect, Actor, Exit } from 'app/types';

// Things the exist in areas need at least these spatial properties.
export interface AreaEntity {
    x: number, y: number, z: number, width?: number,
}

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'endless';

export interface LevelData {
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
    // Only used during testing currently.
    noTreasure?: boolean,
}

// instantiated level.
export interface Level {
    base: LevelData,
    level: number,
    levelDifficulty: LevelDifficulty,
    entrance: Exit,
    areas: Map<string, Area>,
    completed?: boolean,
}

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
    objects: any[],
}