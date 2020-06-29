import {
    ActiveEffect, Actor, AreaObject, AreaObjectDefinition,
    BonusSource, Character, Frame, FrameAnimation,
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

export type AreaObjectHash = {[key in string]: AreaObjectDefinition};

export interface TilePalette {
    // The size of the tiles
    w: number,
    h: number,
    // The source frame of the tiles.
    source: Frame,
}

export interface Tile {
    // The column/row coordinates of the tile in the source frame.
    x: number,
    y: number,
}

export interface TileGrid {
    // The dimensions of the grid.
    w: number,
    h: number,
    // The palette to use for this grid (controls the size of tiles)
    palette: TilePalette,
    // The matrix of tiles
    tiles: Tile[][],
}

export interface TileGridDefinition {
    // The dimensions of the grid.
    w: number,
    h: number,
    // The palette to use for this grid (controls the size of tiles)
    palette: string,
    // The matrix of tiles
    tiles: Tile[][],
}

export interface AreaLayerDefinition {
    // Unique identifier for this layer.
    key: string,
    grid?: TileGridDefinition,
    objects: AreaObjectDefinition[],
    // Coordinates for the layer origin, if not (0, 0).
    x?: number,
    y?: number,
}

export interface AreaDefinition {
    zoneKey?: ZoneType,
    type: string,
    width: number,
    leftWallType?: string,
    rightWallType?: string,
    seed?: number,
    monsters?: MonsterDefinition[],
    layers: AreaLayerDefinition[],
}

export interface AreaLayer {
    // Unique identifier for this layer.
    key: string,
    grid?: TileGrid,
    objects: AreaObject[],
    // Coordinates for the layer origin, if not (0, 0).
    x: number,
    y: number,
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
    objectsByKey?: {[key in string]: AreaObject},
    layers: AreaLayer[],

    // Used to show the chest open icon for the minimap.
    chestOpened?: boolean,
}
