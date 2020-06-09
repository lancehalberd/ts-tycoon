import {
    ActiveEffect, Actor, AreaObject, AreaObjectDefinition,
    BonusSource, Character, FrameAnimation,
    MonsterDefinition, MonsterSpawn,
} from 'app/types';

export type ZoneType = 'prologue' | 'guild' | 'mission1' | 'mission2';

export type Zones = {[key: string]: Zone};

export type Zone = {[key: string]: AreaDefinition};

export interface MissionParameters {
    key: string,
    name: string,
    zoneKey: ZoneType,
    areaKey: string,
    type: 'clearZone' | 'defeatTarget' | 'survive',
    timeLimit?: number,
    // Optional cutscene to play when starting the mission.
    introKey?: string,
    // Optional cutscene to play on completing the mission.
    outroKey?: string,
}

export interface ActiveMission {
    parameters: MissionParameters,
    zone: Zone,
    character: Character,
    totalEnemies: number,
    defeatedEnemies: number,
    totalTargets: number,
    defeatedTargets: number,
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
    backgroundObjects: {[key in string]: AreaObjectDefinition},
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
    southWall?: FrameAnimation,
    cameraX: number,
    time: number,
    // Used for randomly generating area.
    seed: number,
    timeStopEffect?: {actor: Actor},
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
    backgroundObjects: AreaObject[],
    objectsByKey?: {[key in string]: AreaObject},

    // Used to show the chest open icon for the minimap.
    chestOpened?: boolean,
}
