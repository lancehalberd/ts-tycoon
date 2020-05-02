import { Area, AreaObjectDefinition, MonsterSpawn } from 'app/types';

export interface AreaDefinition {
    type: string,
    width: number,
    leftWallType?: string,
    rightWallType?: string,
    objects: {[key in string]: AreaObjectDefinition},
    wallDecorations: {[key in string]: AreaObjectDefinition},
    seed?: number,
    monsters?: MonsterSpawn[],
    isGuildArea?: boolean,
}
