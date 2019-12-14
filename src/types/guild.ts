import { Area, Character } from 'app/types';

export interface Exit {
    // The area to enter when using this exit.
    areaKey: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}

export interface FixedObject {
    fixed: true,
    base: any,
    key: string,
    scale: number,
    xScale?: number,
    yScale?: number,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    exit?: Exit,
    // The level for the object, if it can be upgraded.
    level?: number,
    isEnabled: Function,
    draw: Function,
    helpMethod: Function,
    target: {
        left?: number,
        top?: number,
        width: number,
        height: number,
    },
    loot?: any,
    area?: any,

    // This is used for applications to track the character for the application.
    character?: Character,
}

export interface RawGuildArea extends Partial<GuildArea>{
    key: string,
    width: number,
    backgroundPatterns: {[key: string]: string},
}
export interface GuildArea extends Area {
    isGuildArea: true,
    // This defines the monster spawns for the area.
    monsters: any[],
    objectsByKey: {[key: string]: any},
}
export type GuildAreas = {[key: string]: GuildArea};