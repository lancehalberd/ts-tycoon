
import { Area, CardinalDirection } from 'app/types';

export interface EndlessZone {
    areaType: string,
    areaBlocks: EndlessAreaBlock[],
    areas: {[key: string]: Area},
    coordinates: EndlessZoneCoordinates,
    connections: EndlessZoneConnection[],
    grid: EndlessGridNode[][],

    // This is `${level}:${radius}:${thetaI}` and is used to store/lookup the zone when it is in memory.
    key: string,
}

export interface EndlessZoneConnection {
    coordinatesA: EndlessZoneCoordinates,
    coordinatesB: EndlessZoneCoordinates,
}

export interface EndlessZoneCoordinates {
    thetaI: number,
    radius: number,
    level: number,
}


export interface EndlessAreaBlock {
    x: number, y: number, w: number, area: Area,
}

export interface EndlessGridNode {
    x: number, y: number, event: number,
    // These booleans represent connections to other tiles
    N: boolean, E: boolean, S: boolean, W: boolean,
    // This value indicates whether this tile represents a connection to another zone, and
    // the direction that connection is in.
    exit: CardinalDirection,
    areaBlock: EndlessAreaBlock,
}

export interface EndlessZoneExitEvent {
    type: 'exit',
    choices: ('N' | 'E' | 'S' | 'W')[],
    baseLength: number,
    exclusiveLength: number,
    connection: EndlessZoneConnection,
}
export interface EndlessZoneTreasureEvent {
    type: 'treasure',
    baseLength: number,
    exclusiveLength: number,
}
export interface EndlessZoneEncounterEvent {
    type: 'encounter',
    baseLength: number,
    exclusiveLength: number,
}
export interface EndlessZoneWaypointEvent {
    type: 'waypoint',
    baseLength: number,
    exclusiveLength: number,
}
export type EndlessZoneEvent = EndlessZoneExitEvent | EndlessZoneTreasureEvent | EndlessZoneEncounterEvent | EndlessZoneWaypointEvent;


