import {
    Ability, Action, ActiveMission, Actor,
    Board, BonusSource, EndlessZone, Exit, FixedObject, GameContext,
    Hero, HUDElement,
    JobKey, LevelDifficulty, SavedActor, SavedBoard,
} from 'app/types';
import { JobIcon } from 'app/content/jobs';
import { ActionShortcut } from 'app/render/drawActionShortcuts';

export interface Character {
    fame: number,
    hero: Hero,
    board: Board,
    characterCanvas: HTMLCanvasElement,
    characterContext: CanvasRenderingContext2D,
    boardCanvas: HTMLCanvasElement,
    boardContext: CanvasRenderingContext2D,
    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: {[key in string]: number}},
    divinity: number,
    jewelBonuses?: BonusSource,

    // This is the set of shortcuts displayed on the screen for activating/managing actions.
    actionShortcuts: ActionShortcut[],

    context: GameContext,
    // Selected level key in the map
    selectedLevelKey?: string,
    // Most recent level key actually played (including currently)
    currentLevelKey?: string,
    levelDifficulty?: LevelDifficulty,
    activeShrine?: FixedObject,
    boardPreviewChoices?: Board[],

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

    // Current mission this character is on.
    mission?: ActiveMission,

    fixedAbilities?: Ability[],
    endlessSeed: number,
    endlessZone?: EndlessZone,
    endlessAreasVisited: {[key in string]: boolean},
    endlessAreaPortal?: Exit,
    endlessExperience: number,
    endlessLevel: number,
}

export interface Applicant extends Character {
    // This is only used for characters in the context of applications.
    // As age increases, the application is cheaper to replace with a new application.
    applicationAge: number,
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

    selectedLevelKey: string,

    divinityScores: {[key in string]: number},
    levelTimes: {[key in string]: {[key in string]: number}},
    fame: number,
    divinity: number,
    currentLevelKey: string,

    manualActions: {[key in string]: boolean},
    autoActions: {[key in string]: boolean},

    fixedAbilities?: Ability[],
    endlessSeed: number,
    endlessAreaPortal?: Exit,
    endlessExperience: number,
    endlessLevel: number,
}

export interface SavedApplicant extends SavedCharacter {
    // This is only used for characters in the context of applications.
    // As age increases, the application is cheaper to replace with a new application.
    applicationAge: number,
}
