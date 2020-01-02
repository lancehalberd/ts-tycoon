import { JobIcon } from 'app/content/jobs';
import { Bonuses } from 'app/types/bonuses';
import {
    ActionStats, Actor, ArrayFrame, Area, BonusSource,
    Character, Color, EffectVariableObject,
    Frame, Rectangle, ShortRectangle, Target, TintIcon,
    VariableObject, VariableObjectBase,
} from 'app/types';

export interface Action {
    actor: Actor,
    readyAt: number,
    variableObject: VariableObject,
    stats: ActionStats,
    source: Ability,
    base: ActionData,
    // This is set as the player uses the skill.
    totalPreparationTime?: number,
    // Properties used for drawing the skill hud/targetin.
    target?: ShortRectangle, // This is the rectangle for the skill HUD button
    onClick?: (character: Character, action: Action) => void,
    shortcutTarget?: ShortRectangle, // This is the rectangle for displaying the shortcut key
    // Button for toggling manual/auto use of skill.
    toggleButton?: {
        onClick: (character: Character, button: any) => void,
        action: Action
        helpMethod: () => string,
        target?: ShortRectangle,
    }
    helpMethod?: (action: Action) => string,
}

export interface ActionData {
    type: string,
    name?: string,
    key?: string,
    variableObjectType: 'action',
    bonuses: Bonuses,
    hasImplicitBonuses: true,
    helpText: string,
    icon: string | Frame,
    tags: string[],
    // This will render the skill name as it is used.
    showName?: boolean,
    // Can only be used if actor has all the given tags.
    restrictions?: string[],
    target?: string,
    targetDeadUnits?: boolean,
    consumeCorpse?: boolean,
    speed?: number,
    size?: number,
    height?: number,
    heightRatio?: number,
    yOffset?: number,
    minTheta?: number,
    color?: Color,
    alpha?: number,
    sound?: string,
    // Dodge properties
    jump?: boolean,
    rangedOnly?: boolean,
    // Projectiles
    gravity?: number,
    animation?: any,
    explosionAnimation?: any,
    explosionSound?: string,
    blastAnimation?: any,
    afterImages?: number,
    // For monster minion skills
    monsterKey?: string,
}

export interface Effect {
    variableObjectType: 'effect',
    bonuses: Bonuses,
    helpText?: string,
    icon?: Frame,
    tags: string[],
    icons?: ArrayFrame[],
    drawGround?: (actor: Actor) => void,
}

export interface ActiveEffect {
    update: (area: Area) => void,
    // Some effects are bound to a target.
    x?: number,
    y?: number,
    z?: number,
    width?: number,
    height?: number,
    target?: Target,
    hitTargets?: Actor[],
    finish?: Function,
    attackStats?: AttackData,
    currentFrame: number,
    done: boolean,
    render?: (area: Area) => void,
    drawGround?: (area: Area) => void,
}
export interface TimedActorEffect {
    base: VariableObjectBase,
    bonuses: Bonuses,
    duration: number | 'forever',
    maxStacks: number,
    expirationTime?: number,
}
// Add expirationTime to EffectVariableObject so TS let's us attempt to read it.
export type ActorEffect = TimedActorEffect | (EffectVariableObject & {expirationTime?: number});
export interface Projectile {
        distance: number,
        x: number,
        y: number,
        z: number,
        vx: number,
        vy: number,
        vz: number,
        size: number,
        t: number,
        done: boolean,
        delay: number,
        width: number,
        height: number,
        color: Color,
        totalHits: number,
        hit: boolean,
        target: Target,
        attackStats: AttackData,
        hitTargets: Actor[],
        stickToTarget: (target: Target) => void,
        update: (area: Area) => void,
        render: (area: Area) => void,
}

interface TriggerEffect {
    variableObjectType: 'trigger',
    bonuses?: Bonuses,
}
export interface Ability {
    key?: string,
    name?: string,
    action?: ActionData,
    reaction?: ActionData,
    onCritEffect?: TriggerEffect,
    onHitEffect?: TriggerEffect,
    onMissEffect?: TriggerEffect,
    bonuses?: Bonuses,
    minionBonuses?: Bonuses,
    icon?: JobIcon | Frame | TintIcon | string,
    helpText?: string,
}

export interface AttackData {
    // How far the attack has traveled (used on projectiles).
    distance: number,
    animation?: any,
    sound?: any,
    size?: number,
    gravity: number,
    speed: number,
    healthSacrificed?: number,
    source: Actor,
    attack: Action,
    isCritical: boolean,
    damage: number,
    magicDamage: number,
    accuracy: number,
    explode?: number,
    cleave?: number,
    piercing?: boolean,
    strikes?: number,
    imprintedSpell?: Action,
    // Set by certain effects like novas.
    effectiveness?: number,
    projectile?: any,
    y?: number,
    evaded?: boolean,
    deflected?: boolean,
    dodged?: boolean,
    stopped?: boolean,
    // Calculated each time the attack is applied.
    totalDamage?: number,
    // Used to indicate ricochet projectiles shouldn't damage their owner.
    friendly?: boolean,
}
