import { Ability, ActorSource, BaseActor, Bonuses, BonusSource, LocationDefinition } from 'app/types';

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

export interface MonsterDefinition {
    key: string,
    level: number,
    location: LocationDefinition,
    isTarget?: boolean,
    isTriggered?: boolean,
    bonusSources?: BonusSource[],
    rarity?: number,
    triggerKey?: string,
}

export interface MonsterSpawn {
    key: string,
    definition?: MonsterDefinition,
    heading: number[],
    level: number,
    location: {x: number, y: number, z: number},
    bonusSources?: BonusSource[],
    isTarget?: boolean,
    rarity?: number,
}

export interface Monster extends BaseActor {
    type: 'monster',
    definition?: MonsterDefinition,
    base: MonsterData,
    extraSkills: BonusSource[],
    baseY: number,
    noBasicAttack: boolean,
    stationary: boolean,
}
