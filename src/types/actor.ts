import {
    ActiveEffect, ActorStats, Affix, Animation, Area, AreaEntity, AreaObject,
    BonusSource, Exit,
    Job, JobKey, Level, LocationTarget, Monster,
    SavedEquipment, Source, Target,
    VariableObject
} from 'app/types';
import { Ability, Action, ActorEffect, Effect } from 'app/types/abilities';
import { Character } from 'app/types/Character';
import { Equipment } from 'app/types/items';

export type ActorActivity = {
    type: 'none',
} | {
    type: 'attack',
    target: Actor,
} | {
    type: 'move',
    x: number,
    y: number,
    z: number,
} | {
    type: 'action',
    action: Action,
    target: Target,
} | {
    type: 'interact',
    target: LocationTarget | AreaObject,
}

export interface ActorSource {
    // Animations that can be set for an actor
    // All other animations will default to this if not defined.
    walkAnimation: Animation,
    idleAnimation: Animation,
    deathAnimation: Animation,
    hurtAnimation: Animation,
    attackPreparationAnimation: Animation,
    attackRecoveryAnimation: Animation,
    shadowAnimation: Animation,
    // Set this for characters with animations facing left instead of right,
    // which we assume by default.
    flipped?: boolean,
    // Set this to specify where projectiles are created relative to this source,
    // measured in pixels from the bottom of the frame content.
    attackY?: number,
};

export interface BaseActor extends AreaEntity {
    targetType: 'actor',
    type: string,
    // Screen coordinates of the player (for mouseover purposes)
    top?: number,
    left?: number,
    // World coordinates of the player
    x: number,
    y: number,
    z: number,
    // Set by updateActorDimensions.
    width: number,
    height: number,
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
    heading: number[], // Character moves left to right by default.
    // tags?: string[],
    actions?: Action[],
    reactions?: Action[],
    maxReflectBarrier?: number,
    reflectBarrier?: number,
    stunned?: number,
    pull?: any,
    chargeEffect?: {
        chargeSkill: Action,
        distance: number,
        target: Target,
    },
    time?: number,
    isDead?: boolean,
    timeOfDeath?: number,
    skillInUse?: Action,
    slow?: number,
    rotation?: number,
    imprintedSpell?: any,
    boundEffects?: ActiveEffect[],
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
    skillSource?: Action,
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

    allEffects?: ActorEffect[],
    minionBonusSources?: BonusSource[],
    escapeExit?: Exit,

    totalRecoveryTime?: number,
    preparationTime?: number,
    recoveryTime?: number,
    idleFrame: number,
    walkFrame: number,
    attackFrame?: number,
    isMoving?: boolean,
    skillTarget?: Target,

    // This will be set if an actor is being flung as an attack.
    dominoAttackStats?: any,
    // Temporarily set when checking what to autotarget.
    priority?: number,
    // Used for actors that can cloak.
    cloaked?: boolean,
    // Tracks when the next time a boss will recover.
    recoverSkillHealthThreshold?: number,
}
export interface Hero extends BaseActor {
    type: 'hero',
    activity: ActorActivity,
    colors: HeroColors,
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
    colors: HeroColors,
    jobKey: JobKey,
    level: number,
    name: string,
}

export interface HeroColors {
    skinColor: string,
    hairColor: string,
    earColor: string,
    bandanaColor: string,
    shoeColor: string,
    shortsColor: string,
    shirtColor: string,
    scarfColor: string,
};
