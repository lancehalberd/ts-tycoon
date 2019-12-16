import { JobIcon } from 'app/content/jobs';
import { Bonuses } from 'app/types/bonuses';
import { ActionStats, Actor, Color, Frame, VariableObject } from 'app/types';

export interface Action {
    readyAt: number,
    variableObject: VariableObject,
    stats: ActionStats,
    source: Ability,
    base: ActionData,
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