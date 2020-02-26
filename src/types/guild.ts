import { Area, AreaObject, BonusSource, Character, Hero, JobAchievement, ShortRectangle } from 'app/types';

export interface Exit {
    // The area to enter when using this exit.
    areaKey: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}

export interface FixedObjectData {
    targetType: 'object',
    update?: (object: AreaObject) => void,
    render?: (context: CanvasRenderingContext2D, object: AreaObject) => void,
    // This will be used instead of getMouseTarget if defined.
    isOver?: (x: number, y: number) => boolean
    getMouseTarget?: (object: FixedObject) => ShortRectangle,
    name?: string,
    source: {
        actualWidth: number,
        actualHeight: number,
        xOffset: number,
        yOffset: number,
        image: HTMLImageElement | HTMLCanvasElement,
        left: number, top: number,
        width: number, height: number, depth: number
    } | {
        actualWidth?: number,
        actualHeight?: number,
        // These 5 properties are just added to make TS happy.
        xOffset?: number,
        yOffset?: number,
        left: number, top: number,
        image?: HTMLImageElement | HTMLCanvasElement,
        // I can't remember at the moment why there are two definitions for source.
        width: number, height: number, depth: number
    },
    action?: (object: AreaObject, hero: Hero) => void,
    getActiveBonusSources?: () => BonusSource[],
    level?: number,
    getCurrentTier?: () => any,
    getNextTier?: () => any,
    helpMethod?: Function,
    isEnabled?: () => boolean,
    onMouseOut?: Function,
    width?: number, height?: number, depth?: number,
    getTrophyRectangle?: Function,
    solid?: boolean,
}
export interface TrophyAltar extends FixedObject {
    trophy: JobAchievement,
}
export interface SavedTrophy {
    level: number,
    value: number,
    // These will be set if the trophy is currently displayed somewhere.
    areaKey?: string,
    objectKey?: string,
}

export interface FixedObject extends FixedObjectData {
    render: (context: CanvasRenderingContext2D, object: FixedObject) => void,
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
    helpMethod: Function,
    target: {
        left: number,
        top: number,
        width: number,
        height: number,
    },
    loot?: any,
    area: Area,

    // This is used for applications to track the character for the application.
    character?: Character,
    // Used to indicate shrine has been visited.
    done?: boolean,
    // Whether the automatic controller has considered interacting with this object yet.
    considered?: boolean,
    lastScale?: number,
    // Color to make this object flash (white for furniture you can level up).
    flashColor?: string,
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