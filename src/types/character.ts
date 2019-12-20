import { Actor, Board, BonusSource, Hero, JobKey, LevelDifficulty, SavedActor, SavedBoard } from 'app/types';
import { JobIcon } from 'app/content/jobs';

export interface Character {
    adventurer: Hero,
    fame: number,
    hero: Hero,
    board: Board,
    characterCanvas: HTMLCanvasElement,
    characterContext: CanvasRenderingContext2D,
    boardCanvas: HTMLCanvasElement,
    boardContext: CanvasRenderingContext2D,
    time: number,
    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: {[key in string]: number}},
    divinity: number,
    jewelBonuses?: BonusSource,

    context: string,
    // Selected level key in the map
    selectedLevelKey?: string,
    // Most recent level key actually played (including currently)
    currentLevelKey: string,
    levelDifficulty?: LevelDifficulty,
    isStuckAtShrine?: boolean,

    // Autoplay controls
    paused?: boolean, // Character will not advance when no action is chosen
    autoplay?: boolean, // Character will automatically choose new actions
    skipShrines?: boolean, // Character will ignore shrines on autoplay
    replay?: boolean, // Make character replay the current adventure
    gameSpeed: number, // Used for fast forward
    loopSkip?: number, // Used to skip update loops for slow motion
    loopCount?: number, // Used for determining which loops to skip.

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
