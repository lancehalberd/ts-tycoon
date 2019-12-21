import { JobIcon } from 'app/content/jobs';
import { Bonuses } from 'app/types/bonuses';
import { ActionStats, Actor, Area, Color, Frame, VariableObject } from 'app/types';

export interface Action {
    readyAt: number,
    variableObject: VariableObject,
    stats: ActionStats,
    source: Ability,
    base: ActionData,
    // This is set as the player uses the skill.
    totalPreparationTime?: number,
}

export interface ActionData {
    type: string,
    name?: string,
    key?: string,
    variableObjectType: 'action',
    bonuses: Bonuses,
    helpText: string,
    icon: Frame,
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
    icons?: Frame[],
    drawGround?: (actor: Actor) => void,
}

export interface ActiveEffect {
    update: (area: Area) => void,
    finish?: Function,
    attackStats: any,
    currentFrame: number,
    done: boolean,
    drawGround?: (area: Area) => void,
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
    icon?: JobIcon | Frame | string,
    helpText?: string,
}

export interface AttackData {
    // How far the attack has traveled (used on projectiles).
    distance: number,
    animation: any,
    sound: any,
    size: number,
    gravity: number,
    speed: number,
    healthSacrificed: number,
    source: Actor,
    attack: Action,
    isCritical: boolean,
    damage: number,
    magicDamage: number,
    accuracy: number,
    explode: number,
    cleave: number,
    piercing: boolean,
    strikes: number,
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
}
