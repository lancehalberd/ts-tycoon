import { JobIcon } from 'app/content/jobs';
import { Bonuses } from 'app/types/bonuses';
import { Frame } from 'app/types';

export interface Action {
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

}
export interface Ability {
    key?: string,
    name: string,
    action?: Action,
    reaction?: Action,
    onCritEffect?: TriggerEffect,
    onHitEffect?: TriggerEffect,
    onMissEffect?: TriggerEffect,
    bonuses?: Bonuses,
    minionBonuses?: Bonuses,
    icon?: JobIcon | Frame | string,
    helpText?: string,
}