import { BoardData, EquipmentData } from 'app/types';
import { JobIcon } from 'app/content/jobs';

export type JobKey = 'fool' |
    'blackbelt' | 'warrior' | 'samurai' |
    'juggler' | 'ranger' | 'sniper' |
    'priest' | 'wizard' | 'sorcerer' |
    'corsair' | 'assassin' | 'ninja' |
    'dancer' | 'bard' | 'sage' |
    'paladin' | 'darkknight' | 'enhancer' |
    'master';

export interface Job {
    key: JobKey,
    name: string,
    dexterityBonus: number,
    strengthBonus: number,
    intelligenceBonus: number,
    startingEquipment: EquipmentData,
    startingBoard: BoardData,
    jewelLoot: any[],
    iconSource: JobIcon,
    achievementImage?: HTMLImageElement,
}
