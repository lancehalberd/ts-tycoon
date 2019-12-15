import { backgrounds } from 'app/content/backgrounds';
import { map } from 'app/content/mapData';
import { Exit } from 'app/types';

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

    allies: any[],
    enemies: any[],
    projectiles: any[],
    effects: any[],
    textPopups: any[],
    treasurePopups: any[],
    objects: any[],
}