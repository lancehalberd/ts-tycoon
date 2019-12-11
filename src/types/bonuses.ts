import { Effect } from 'app/types/abilities';

export type BonusOperator = '+' | '-' | '%' | '*' | '/' | '&' | '$';

type BonusTag = string;
type StatVariable = string;
export type BonusValue = true | number | string |
    Effect |
    [BonusValue] | [BonusOperator, BonusValue] | [BonusValue, BonusOperator, BonusValue];
type BonusDependencies = {[key in string]: true};

export interface Bonuses {
    [key: string]: BonusValue,
}

export interface BonusSource {
    bonuses: Bonuses,
}

export interface Bonus {
    operator: BonusOperator,
    shortHand: string,
    statDependencies: BonusDependencies,
    stats: StatVariable[],
    tags: BonusTag[],
    value: BonusValue,
}

