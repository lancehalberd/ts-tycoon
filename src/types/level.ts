import { backgrounds } from 'app/content/backgrounds';
import { map } from 'app/content/mapData';
import { ActiveEffect, Actor, Exit } from 'app/types';

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'endless';

export interface LevelData {
    levelKey?: string,
    name: string,
    description: string,
    level: number,
    coords: number[],
    background: keyof typeof backgrounds,
    unlocks: (keyof typeof map)[],
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