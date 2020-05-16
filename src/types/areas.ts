import {
    ActiveEffect, Actor, AreaObject, AreaObjectDefinition,
    BonusSource, Character, FrameAnimation,
    MonsterDefinition, MonsterSpawn,
} from 'app/types';

export type ZoneType = 'guild' | 'mission1';

export type Zones = {[key: string]: Zone};

export type Zone = {[key: string]: AreaDefinition};

export interface MissionParameters {
    key: string,
    name: string,
    zoneKey: ZoneType,
    areaKey: string,
    type: 'clearZone' | 'defeatTarget' | 'survive',
    timeLimit?: number,
}

export interface ActiveMission {
    parameters: MissionParameters,
    zone: Zone,
    character: Character,
    totalEnemies: number,
    defeatedEnemies: number,
    time: number,
    animationTime: number,
    started: boolean,
    completed: boolean,
    failed: boolean,
}

export interface AreaDefinition {
    zoneKey?: ZoneType,
    type: string,
    width: number,
    leftWallType?: string,
    rightWallType?: string,
    objects: {[key in string]: AreaObjectDefinition},
    wallDecorations: {[key in string]: AreaObjectDefinition},
    seed?: number,
    monsters?: MonsterDefinition[],
}

export interface Area {
    key: string,
    zoneKey?: ZoneType,
    areaType: string,
    isBossArea?: boolean,
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
