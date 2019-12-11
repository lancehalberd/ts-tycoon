import { Bonuses } from 'app/types'

export interface AffixData {
    level: number,
}

export interface Affix {
    base: AffixData,
    bonuses: Bonuses,
}

export interface SavedAffix {
    affixKey: string,
    bonuses: Bonuses,
}
