import { Ability, BaseActor, BonusSource } from 'app/types';

export interface MonsterData {
    variableObjectType: 'actor',
    abilities: Ability[],
    [key:string]: any,
}

export interface Monster extends BaseActor {
    type: 'monster',
    base: MonsterData,
    extraSkills: BonusSource[],
    baseY: number,
    noBasicAttack: boolean,
    stationary: boolean,
}
