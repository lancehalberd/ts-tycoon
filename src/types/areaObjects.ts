import {
    Actor, FrameAnimation, Area, AreaObjectTarget,
    Bonuses, BonusSource, Character, Cost,
    Exit, Frame, Hero, JobAchievement, MonsterSpawn,
} from 'app/types';

import { AreaDecorationDefinition, AreaDoorDefinition } from 'app/content/areas';

export interface BaseAreaObjectDefinition {
    type: string,
    shapeType?: 'oval' | 'rectangle',
    // Default to 0, relative to the parent coordinates.
    x?: number, y?: number, z?: number,
    // If this is unset, the parent is the area.
    parentKey?: string,
    xAlign?: 'left' | 'middle' | 'right',
    yAlign?: 'top' | 'middle' | 'bottom',
    zAlign?: 'back' | 'middle' | 'front',
    // This can be set to flip an object along its x-axis, if supported
    flipped?: boolean,
}

export interface UpgradeableObjectDefinition extends BaseAreaObjectDefinition {
    // This will default to 0
    level?: number,
}

export type AreaObjectDefinition = BaseAreaObjectDefinition
    | AreaDecorationDefinition
    | UpgradeableObjectDefinition
    | AreaDoorDefinition;

export interface AreaObject {
    update?: () => void,
    getAreaTarget: () => AreaObjectTarget,
    onInteract?: (actor: Actor) => void,
    shouldInteract?: (actor: Actor) => boolean,
    isEnabled?: () => boolean,
    render?: (context: CanvasRenderingContext2D) => void,
    drawGround?: (context: CanvasRenderingContext2D) => void,
    isPointOver: (x: number, y: number) => boolean,

    // This may be unset when an object has not been assigned to an area yet.
    area?: Area,
    isSolid?: boolean,
    helpMethod?: () => string,

    // Only objects with a supplied definition can be edited in the editor, since the
    // definitions is what is actually updated and emitted by the editor.
    definition?: AreaObjectDefinition,
    applyDefinition?: (definition: AreaObjectDefinition) => this,
    key?: string,
    // Only used on upgradeable objects.
    level?: number,
    getActiveBonusSources?: () => BonusSource[],

    // Used to indicate shrine has been visited.
    done?: boolean,
    // Whether the automatic controller has considered interacting with this object yet.
    considered?: boolean,
}

export interface MonsterSpawner extends AreaObject {
    proximity: number,
    spawns: Partial<MonsterSpawn & {delay?: number}>[],
    // leadSpawner+spawnDelay are used if this spawner is tied to the timing of another spawner.
    leadSpawner?: MonsterSpawner,
    // How many milliseconds to wait after the lead spawners spawns before spawning.
    spawnDelay?: number,
    lastSpawnTime: number,
    // Next spawn occurs when this reaches 0.
    spawnTimer: number,
    spawnAnimation: FrameAnimation,
}

export type FixedObject = AreaObject;

export interface UpgradeableObjectTier {
    name: string,
    frame: Frame,
    bonuses?: Bonuses,
    // This tier cannot be upgraded to the next tier unless this requirement is met.
    requires?: 'workshop' | 'magicWorkshop',
    // This is the cost to upgrade from this tier to the next. It is not set on the final tier.
    upgradeCost?: Cost,
}

export interface UpgradeableObject extends AreaObject {
    getCurrentTier: () => UpgradeableObjectTier,
    getNextTier: () => UpgradeableObjectTier,
}
