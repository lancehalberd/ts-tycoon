import { JobIcon } from 'app/content/jobs';
import { Bonuses } from 'app/types/bonuses';
import { ActionStats, Frame, VariableObject } from 'app/types';

export interface Action {
    readyAt: number,
    variableObject: VariableObject,
    stats: ActionStats,
    source: Ability,
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
}

export interface Effect {
    type: string,
    variableObjectType: 'effect',
    bonuses: Bonuses,
    helpText: string,
    icon: Frame,
    tags: string[],
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