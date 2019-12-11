import { Board } from 'app/types';
import { JobIcon } from 'app/content/jobs';
import { Actor } from 'app/types/actor';
import { JobKey } from 'app/types/jobs';

export interface Character {
    adventurer: Actor,
    applicationAge?: number,
    fame: number,
    hero: Actor,
    autoActions: any,
    board: Board,
    currentLevelKey: string,
    manualActions: {[key in string]: any},
    characterCanvas: HTMLCanvasElement,
    characterContext: CanvasRenderingContext2D,
    boardCanvas: HTMLCanvasElement,
    boardContext: CanvasRenderingContext2D,
    time: number,
    autoplay: boolean,
    gameSpeed: number
    replay: boolean,
    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: number},
    divinity: number,
}
