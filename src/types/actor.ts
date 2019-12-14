import {
    Affix, BonusSource, JobKey, SavedEquipment,
    ActorStats, VariableObject
} from 'app/types';
import { Ability, Action, Effect } from 'app/types/abilities';
import { Character } from 'app/types/Character';
import { Equipment } from 'app/types/items';
import { Job, Level } from 'app/types';

export interface ActorSource {
    width: number,
    height: number,
    yCenter: number, // Measured from the top of the source
    yOffset: number, // Measured from the top of the source
    actualHeight: number,
    xOffset: number,
    actualWidth: number,
    attackY: number, // Measured from the bottom of the source
    walkFrames: number[],
    attackPreparationFrames: number[],
    attackRecoveryFrames: number[],
};

export interface Actor {
    x: number,
    y: number,
    z: number,
    equipment: Equipment,
    job: Job,
    // Set for monsters.
    base?: any, // MonsterData once it exists.
    source: ActorSource,
    unlockedAbilities: {[key: string]: true},
    abilities: Ability[],
    name: string,
    hairOffset: number,
    skinColorOffset: number,
    level: number,
    image: HTMLImageElement | HTMLCanvasElement,
    personCanvas: HTMLCanvasElement,
    personContext: CanvasRenderingContext2D,
    attackCooldown: number,
    percentHealth: number,
    percentTargetHealth: number,
    helpMethod: Function,
    character?: Character,
    heading: [number, number, number], // Character moves left to right by default.
    tags?: string[],
    actions?: Action[],
    reactions?: Action[],
    isActor: true,
    maxReflectBarrier?: number,
    reflectBarrier?: number,
    stunned?: number,
    pull?: any,
    chargeEffect?: any,
    time?: number,
    isDead?: boolean,
    timeOfDeath?: number,
    skillInUse?: Action,
    slow?: number,
    rotation?: number,
    activity?: any,
    imprintedSpell?: any,
    minions: any[],
    boundEffects?: Effect[],
    stopTimeAction?: Action,
    // These fields may be set by variable calculations.
    temporalShield?: number,
    maxTemporalShield?: number,
    health?: number,
    targetHealth?: number,
    // The are the actor is currently in.
    area?: any,
    // The general level the character is in (composed of multiple areas).
    levelInstance?: Level,

    // This is usually only on monsters, but we may add these to heroes,
    // although we have to be careful about enemies stealing them and making
    // sure they support all the behaviors we need hero affixes to support, like
    // increased core state growth.
    prefixes?: Affix[],
    suffixes?: Affix[],
    variableObject?: VariableObject,
    stats?: ActorStats,

    onHitEffects?: VariableObject[],
    onCritEffects?: VariableObject[],
    onMissEffects?: VariableObject[],
    allEffects?: VariableObject[],
    minionBonusSources?: BonusSource[],
}
export interface Hero extends Actor {

}
export interface SavedActor {
    equipment: SavedEquipment,
    hairOffset: number,
    skinColorOffset: number,
    jobKey: JobKey,
    level: number,
    name: string,
}
