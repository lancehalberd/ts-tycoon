import {
    Area, AreaObject, AreaObjectTarget, BonusSource, Character, Hero,
    JobAchievement, ShortRectangle,
} from 'app/types';

export interface Exit {
    // The area to enter when using this exit.
    areaKey: string,
    // The target door in the area, can be used instead of x/z coords.
    objectKey?: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}

export interface SavedTrophy {
    level: number,
    value: number,
    // These will be set if the trophy is currently displayed somewhere.
    areaKey?: string,
    objectKey?: string,
}

export interface RawGuildArea extends Partial<GuildArea>{
    key: string,
    width: number,
    areaType: string,
}
export type GuildArea = Area;
/*export interface GuildArea extends Area {
    isGuildArea: true,
    objects: FixedObject[],
    objectsByKey: {[key: string]: FixedObject},
}*/
export type GuildAreas = {[key: string]: GuildArea};