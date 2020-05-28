import {
    ActiveEffect, ActorStats, Affix, FrameAnimation,
    Area, AreaEntity, AreaObject, AreaTarget, AreaObjectTarget,
    BonusSource, Exit, Frame,
    Job, JobKey, Level, LocationTarget, Monster,
    SavedEquipment, ShortRectangle, Target,
    VariableObject
} from 'app/types';
import { Ability, Action, ActorEffect, Effect } from 'app/types/abilities';
import { Character } from 'app/types/Character';
import { Equipment } from 'app/types/items';
import { DialogueBox } from 'app/ui/DialogueBox';

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
    target: AreaTarget,
}

export interface ActorSource {
    // Animations that can be set for an actor
    // All other animations will default to this if not defined.
    walkAnimation: FrameAnimation,
    idleAnimation: FrameAnimation,
    deathAnimation: FrameAnimation,
    hurtAnimation: FrameAnimation,
    attackPreparationAnimation: FrameAnimation,
    attackRecoveryAnimation: FrameAnimation,
    spellPreparationAnimation: FrameAnimation,
    spellRecoveryAnimation: FrameAnimation,
    shadowAnimation: FrameAnimation,
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
    equipment: Equipment,
    // Set for monsters.
    source: ActorSource,
    // The current frame displayed for the actor.
    // It is a bit expensive to compute so we store it each update on the actor.
    frame?: Frame,
    image: HTMLImageElement | HTMLCanvasElement,
    level: number,
    name: string,
    attackCooldown: number,
    percentHealth: number,
    percentTargetHealth: number,
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
    time: number,
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

    helpMethod: () => string,
    isPointOver: (x: number, y: number) => boolean,
    render: (this: Actor, context: CanvasRenderingContext2D) => void,

    // This may be unset when an object has not been assigned to an area yet.
    area: Area,

    activity: ActorActivity,
    // Any time the actor no longer has a dialogue box, if this is not empty,
    // a new dialogue will be opened with the next message.
    dialogueMessages?: string[],
    dialogueBox?: DialogueBox,
    // This can be set on actors that are targets in missions.
    isTarget?: boolean,
    // This is used when clicking on NPCs, for example to talk with them.
    onInteract?: (actor: Actor) => void,
}
export interface BasePerson extends BaseActor {
    colors: HeroColors,
    personCanvas: HTMLCanvasElement,
    personContext: CanvasRenderingContext2D,
    job: Job,
    unlockedAbilities: {[key: string]: true},
    abilities: Ability[],
}
export interface Hero extends BasePerson {
    type: 'hero',
    character: Character,
    consideredObjects: Set<AreaObject>,
}
export interface Person extends BasePerson {
    type: 'person',
}

export type Actor = Hero | Monster | Person;
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
    eyeColor: string,
    bandanaColor: string,
    shoeColor: string,
    shortsColor: string,
    shirtColor: string,
    scarfColor: string,
};
