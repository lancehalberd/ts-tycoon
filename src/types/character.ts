import { Actor, Board, BonusSource, JobKey, SavedActor, SavedBoard } from 'app/types';
import { JobIcon } from 'app/content/jobs';

export interface Character {
    adventurer: Actor,
    fame: number,
    hero: Actor,
    board: Board,
    currentLevelKey: string,
    characterCanvas: HTMLCanvasElement,
    characterContext: CanvasRenderingContext2D,
    boardCanvas: HTMLCanvasElement,
    boardContext: CanvasRenderingContext2D,
    time: number,
    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: number},
    divinity: number,
    jewelBonuses?: BonusSource,

    context: string,
    selectedLevelKey?: string,
    isStuckAtShrine?: boolean,

    // Autoplay controls
    paused?: boolean, // Character will not advance when no action is chosen
    autoplay?: boolean, // Character will automatically choose new actions
    skipShrines?: boolean, // Character will ignore shrines on autoplay
    replay?: boolean, // Make character replay the current adventure
    gameSpeed: number, // Used for fast forward
    loopSkip?: number, // Used to skip update loops for slow motion

    // Skill controls
    manualActions: {[key in string]: boolean},
    autoActions: {[key in string]: boolean},

    // This is only used for characters in the context of applications.
    // As age increases, the application is cheaper to replace with a new application.
    applicationAge?: number,
}

export interface SavedCharacter {
    hero: SavedActor,
    board: SavedBoard,

    paused: boolean, // Character will not advance when no action is chosen
    autoplay: boolean, // Character will automatically choose new actions
    skipShrines: boolean, // Character will ignore shrines on autoplay
    replay: boolean, // Make character replay the current adventure
    gameSpeed: number, // Used for fast forward
    loopSkip: number, // Used to skip update loops for slow motion

    context: string,
    selectedLevelKey: string,

    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: number},
    fame: number,
    divinity: number,
    currentLevelKey: string,

    manualActions: {[key in string]: boolean},
    autoActions: {[key in string]: boolean},

    applicationAge: number,
}
