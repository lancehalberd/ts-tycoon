import { Bonuses, BonusesRange } from 'app/types'

export interface AffixData {
    name: string,
    bonuses: BonusesRange,
    prefix?: true,
    suffix?: true,
}

export interface EquipmentAffixData extends AffixData {
    key: string,
    level: number,
    tags: string | string[],
    // Used to exclude enchantments that give the same set of bonuses
    // from appearing more than once per item.
    bonusesKey: string,
}

export interface Affix {
    base: AffixData,
    bonuses: Bonuses,
}

export interface SavedAffix {
    affixKey: string,
    bonuses: Bonuses,
}
