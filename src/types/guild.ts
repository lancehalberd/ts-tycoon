import { Area, BonusSource, Character, JobAchievement } from 'app/types';

export interface Exit {
    // The area to enter when using this exit.
    areaKey: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}

export interface FixedObjectData {
    name?: string,
    source: {
        actualWidth: number,
        actualHeight: number,
        xOffset: number,
        yOffset: number,
        image: HTMLImageElement | HTMLCanvasElement,
        left: number, top: number,
        width: number, height: number, depth: number
    } | {actualWidth?: number, actualHeight?: number, width: number, height: number, depth: number},
    action?: Function,
    getActiveBonusSources?: () => BonusSource[],
    level?: number,
    getCurrentTier?: () => any,
    getNextTier?: () => any,
    update?: Function,
    draw?: Function,
    helpMethod?: Function,
    isOver?: (x: number, y: number) => boolean
    isEnabled?: () => boolean,
    onMouseOut?: Function,
    width?: number, height?: number, depth?: number,
    getTrophyRectangle?: Function,
    solid?: boolean,
}
export interface TrophyAltar extends FixedObject {
    trophy: JobAchievement,
}

export interface FixedObject extends FixedObjectData {
    fixed: true,
    base: any,
    key: string,
    type: 'fixedObject',
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
    isEnabled: () => boolean,
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
    // Used to indicate shrine has been visited.
    done?: boolean,
    // Whether the automatic controller has considered interacting with this object yet.
    considered?: boolean,
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
    objects: FixedObject[],
    objectsByKey: {[key: string]: FixedObject},
}
export type GuildAreas = {[key: string]: GuildArea};