import {
    Actor, FrameAnimation, Area, AreaObjectTarget,
    Bonuses, BonusSource, Cost, MonsterSpawn, ZoneType,
} from 'app/types';

import {
    AreaDecorationDefinition, AreaDoorDefinition, FlameThrowerDefinition, FloorTriggerDefinition,
    MessageDefinition, SwitchDefinition,
} from 'app/content/areas';


export const objectShapes = ['oval', 'rectangle', 'horizontal', 'vertical'] as const;
export type ObjectShape = typeof objectShapes[number];

export interface LocationDefinition {
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

export interface BaseAreaObjectDefinition extends LocationDefinition {
    type: string,
    key: string,
    shapeType?: ObjectShape,
    // Can be used to scale the entire size of the object.
    scale?: number,
}

export interface TreasureChestDefinition extends BaseAreaObjectDefinition {
    chestType: string,
};

export interface UpgradeableObjectDefinition extends BaseAreaObjectDefinition {
    // This will default to 0
    level?: number,
}

export type AreaObjectDefinition = BaseAreaObjectDefinition
    | AreaDecorationDefinition
    | AreaDoorDefinition
    | FlameThrowerDefinition
    | FloorTriggerDefinition
    | MessageDefinition
    | SwitchDefinition
    | TreasureChestDefinition
    | UpgradeableObjectDefinition
    ;

export interface AreaObject {
    update?: () => void,
    getAreaTarget: () => AreaObjectTarget,
    // Used by floor triggers, called when a hero walks on them.
    // Might generalize this for any actor walking on them in the future.
    onEnter?: (actor: Actor) => void,
    onInteract?: (actor: Actor) => void,
    onTrigger?: (switchOn: boolean) => void,
    shouldInteract?: (actor: Actor) => boolean,
    isEnabled?: () => boolean,
    render?: (context: CanvasRenderingContext2D) => void,
    drawGround?: (context: CanvasRenderingContext2D) => void,
    isPointOver: (x: number, y: number) => boolean,

    // This may be unset when an object has not been assigned to an area yet.
    area?: Area,
    isSolid?: boolean,
    helpMethod?: () => string,
    // This will be called when an actor leaves an area or we switch to a different actor.
    // Just used for cleaning up dialogue box dom elements at the moment.
    cleanup?: () => void,

    // Only objects with a supplied definition can be edited in the editor, since the
    // definitions is what is actually updated and emitted by the editor.
    definition?: AreaObjectDefinition,
    applyDefinition?: (definition: AreaObjectDefinition) => this,
    key: string,
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

export interface Exit {
    // The zone to enter when using this exit, if different than the current zone.
    zoneKey?: ZoneType,
    // The area to enter when using this exit.
    // If the area key is not set, all areas in the zone will be searched until an
    // object matching objectKey is found.
    areaKey?: string,
    // The target door in the area, can be used instead of x/z coords.
    objectKey?: string,
    // The target location to appear when entering the next area.
    x?: number,
    z?: number,
}

export interface SavedTrophy {
    level: number,
    value: number,
    // These will be set if the trophy is currently displayed somewhere.
    areaKey?: string,
    objectKey?: string,
}
