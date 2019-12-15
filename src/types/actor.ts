import {
    ActorStats, Affix, Area, BonusSource, JobKey, Monster,
    SavedEquipment, Source,
    VariableObject
} from 'app/types';
import { Ability, Action, Effect } from 'app/types/abilities';
import { Character } from 'app/types/Character';
import { Equipment } from 'app/types/items';
import { Job, Level } from 'app/types';

/*export interface ActorSource {
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
};*/
export interface ActorSource extends Source {

}

export interface BaseActor {
    character?: Character,
    type: string,
    x: number,
    y: number,
    z: number,
    equipment: Equipment,
    // Set for monsters.
    source: ActorSource,
    image: HTMLImageElement | HTMLCanvasElement,
    level: number,
    name: string,
    attackCooldown: number,
    percentHealth: number,
    percentTargetHealth: number,
    helpMethod: Function,
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
    boundEffects?: Effect[],
    stopTimeAction?: Action,
    // These fields may be set by variable calculations.
    temporalShield?: number,
    maxTemporalShield?: number,
    health?: number,
    targetHealth?: number,
    // Targets for buffs+heals
    allies?: Actor[],
    // Targets for attacking+debuffs
    enemies?: Actor[],
    // Minions that belong to this actor
    minions?: Actor[],
    // This will be set on minions.
    owner?: Actor,
    // The are the actor is currently in.
    area?: Area,
    // The general level the character is in (composed of multiple areas).
    levelInstance?: Level,
    goalTarget?: any,
    aggroRadius?: number,

    // This is usually only on monsters, but we may add these to heroes,
    // although we have to be careful about enemies stealing them and making
    // sure they support all the behaviors we need hero affixes to support, like
    // increased core state growth.
    prefixes?: Affix[],
    suffixes?: Affix[],
    variableObject?: VariableObject,
    stats?: ActorStats,

    onHitEffects?: Action[],
    onCritEffects?: Action[],
    onMissEffects?: Action[],

    allEffects?: BonusSource[],
    minionBonusSources?: BonusSource[],
}
export interface Hero extends BaseActor {
    type: 'hero',
    hairOffset: number,
    skinColorOffset: number,
    personCanvas: HTMLCanvasElement,
    personContext: CanvasRenderingContext2D,
    character: Character,
    job: Job,
    unlockedAbilities: {[key: string]: true},
    abilities: Ability[],
}
export type Actor = Hero | Monster;
export interface SavedActor {
    equipment: SavedEquipment,
    hairOffset: number,
    skinColorOffset: number,
    jobKey: JobKey,
    level: number,
    name: string,
}
