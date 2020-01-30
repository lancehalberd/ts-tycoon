import { Ability, ActorSource, BaseActor, BonusSource } from 'app/types';

export interface MonsterData {
    variableObjectType: 'actor',
    abilities: Ability[],
    source: ActorSource,
    [key:string]: any,
}

export interface MonsterSpawn {
    key: string,
    level: number,
    location: [number, number, number],
    bonusSources?: BonusSource[],
    rarity?: number,
}

export interface Monster extends BaseActor {
    type: 'monster',
    base: MonsterData,
    extraSkills: BonusSource[],
    baseY: number,
    noBasicAttack: boolean,
    stationary: boolean,
}
