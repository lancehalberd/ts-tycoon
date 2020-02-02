import { Ability, ActorSource, BaseActor, Bonuses, BonusSource } from 'app/types';

export interface MonsterData {
    key: string,
    name: string,
    variableObjectType: 'actor',
    abilities: Ability[],
    source: ActorSource,
    fpsMultiplier?: number,
    noBasicAttack?: boolean,
    stationary?: boolean,
    tags?: string[],
    implicitBonuses?: Bonuses,
    onDeath?: Function,
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