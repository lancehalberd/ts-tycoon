import { Ability, Action, Effect } from 'app/types/abilities';
import { Character } from 'app/types/Character';
import { Equipment } from 'app/types/items';
import { Job } from 'app/types/jobs';

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
    character: Character,
    heading: [number, number, number], // Character moves left to right by default.
    bonusMaxHealth: number,
    // Will be set when bonuses are calculated.
    maxHealth?: number,
    tags?: string[],
    actions?: Action[],
    reactions?: Action[],
    isActor: true,
    maxReflectBarrier: number,
    reflectBarrier: number,
    stunned: 0,
    pull?: any,
    chargeEffect?: any,
    time: number,
    isDead: boolean,
    timeOfDeath?: number,
    skillInUse?: Action,
    slow: 0,
    rotation: 0,
    activity: any,
    imprintedSpell: any,
    minions: any[],
    boundEffects: Effect[],
    stopTimeAction?: Action,
    temporalShield: number,
    maxTemporalShield: number,
    dexterity?: number,
    strength?: number,
    intelligence?: number,
    speed?: number,
    healthRegen?: number,
}
