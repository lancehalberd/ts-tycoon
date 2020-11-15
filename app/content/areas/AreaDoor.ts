import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    drawFrameToAreaTarget,
} from 'app/content/areas';
import { zones } from 'app/content/zones';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { refreshObjectDefinition } from 'app/development/editObjects';
import { requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    EditorProperty, FrameAnimation, FrameDimensions,
    BaseAreaObjectDefinition, Exit, Frame, Hero,
    MenuOption, PropertyRow,
} from 'app/types';

const [
    , guildRightDoorEmpty, guildRightDoor, /*guildRightBoardedDoor*/
] = createAnimation('gfx2/areas/guildbridge.png',
    {w: 39, h: 148, content: r(11, 50, 20, 70)}, {cols: 4}).frames;
const [, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge2.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {cols: 3}).frames;
const woodBridge = createAnimation('gfx2/areas/meadowbridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {x: 1, cols: 1});
const woodBridgeHover = createAnimation('gfx2/areas/meadowbridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {x: 2, cols: 1});

const northSouthGuildBase = {image: requireImage('gfx2/areas/northsouthguild2.png'), w: 32, h: 64};

const guildImage = requireImage('gfx/guildhall.png');
const northDoor = frameAnimation({...northSouthGuildBase, x: 0, y: 0, content: {x: 0, y: 0, w: 32, h: 42, d: 8}});
const northDoorHover = frameAnimation({...northSouthGuildBase, x: 8 * 32, y: 0, content: {x: 0, y: 0, w: 32, h: 42, d: 8}});
const southDoor = frameAnimation({...northSouthGuildBase, x: 3 * 32, y: 0, content: {x: 0, y: 40, w: 32, h: 24, d: 8}});
const southDoorHover = frameAnimation({...northSouthGuildBase, x: 4 * 32, y: 0, content: {x: 0, y: 40, w: 32, h: 24, d: 8}});
const upstairs = frameAnimation({image: guildImage, x: 270, y: 94, w: 30, h: 51, d: 8});
const downstairs = frameAnimation({image: guildImage, x: 300, y: 94, w: 30, h: 51, d: 8});

const northCaveDoorGeometry = {w: 256, h: 86, content: {x: 120, y: 34, w: 32, h: 48}};
const northCaveDoor = createAnimation('gfx2/areas/northdoor1.png', northCaveDoorGeometry);
const northCaveDoorHover = createAnimation('gfx2/areas/northdoor2.png', northCaveDoorGeometry);

const southCaveDoorGeometry = {w: 86, h: 24, content: {x: 24, y: 0, w: 32, h: 24}};
const southCaveDoor = createAnimation('gfx2/areas/southdoor1.png', southCaveDoorGeometry);
const southCaveDoorHover = createAnimation('gfx2/areas/southdoor2.png', southCaveDoorGeometry);

const northMeadowDoorGeometry = {w: 256, h: 88, content: {x: 110, y: 40, w: 28, h: 48}};
const northMeadowDoor = createAnimation('gfx2/areas/northdoormeadow.png', northMeadowDoorGeometry);
const northMeadowDoorHover = createAnimation('gfx2/areas/northdoormeadowlight.png', northMeadowDoorGeometry);

const southMeadowDoorGeometry = {w: 128, h: 16, content: {x: 46, y: 0, w: 32, h: 16}};
const southMeadowDoor = createAnimation('gfx2/areas/southwalldoormeadow.png', southMeadowDoorGeometry);
const southMeadowDoorHover = createAnimation('gfx2/areas/southwalldoormeadowlight.png', southMeadowDoorGeometry);


const [, sideFenceDoor, sideFenceDoorHover] = createAnimation('gfx2/areas/Fence side.png',
    {w: 39, h: 148, content: r(16, 67, 12, 65)}, {cols: 3}).frames;

const northFenceDoorGeometry: FrameDimensions = {w: 128, h: 32, content: {x: 52, y: 0, w: 29, h: 32}};
const northFenceDoor = createAnimation('gfx2/areas/Fence north.png', northFenceDoorGeometry, {x: 2});
const northFenceDoorHover = createAnimation('gfx2/areas/Fence north.png', northFenceDoorGeometry, {x: 3});

const southFenceDoorGeometry = {w: 128, h: 16, content: {x: 46, y: 0, w: 32, h: 16}};
const southFenceDoor = createAnimation('gfx2/areas/fencesouthwall.png', southFenceDoorGeometry, {x: 2});
const southFenceDoorHover = createAnimation('gfx2/areas/fencesouthwall.png', southMeadowDoorGeometry, {x: 3});

const [sideDoorClosed, /*sideDoorAjar*/, sideDoorOpen] = createAnimation('gfx2/areas/guilddoorsheet.png', { w: 38, h: 50}, {cols: 3}).frames;

interface DoorAnimationGroup {
    normal: FrameAnimation,
    // Optional frame for when the door is blocked.
    // The normal frame is used by default.
    blocked?: FrameAnimation,
    hover: FrameAnimation,
}

export class AreaDoor extends EditableAreaObject {
    static animations: {[key: string]: DoorAnimationGroup} = {
        // Slanted/old guild doors
        openDoor: {
            normal: frameAnimation(guildRightDoor),
            blocked: frameAnimation(guildRightDoor),
            hover: frameAnimation(guildRightDoorEmpty)
        },
        closedDoor: {normal: frameAnimation(guildRightDoor), hover: frameAnimation(guildRightDoorEmpty)},
        upstairs: {normal: upstairs, hover: upstairs},
        downstairs: {normal: downstairs, hover: downstairs},
        // Straight guild doors
        sideDoorClosed: {normal: frameAnimation(sideDoorClosed), hover: frameAnimation(sideDoorOpen)},
        backDoor: {normal: northDoor, hover: northDoorHover},
        southDoor: {normal: southDoor, hover: southDoorHover},
        //boardedDoor: frameAnimation(guildRightBoardedDoor),
        caveDoorOpen: {normal: frameAnimation(caveDoorOpen), hover: frameAnimation(caveDoorOpen)},
        caveDoorClosed: {normal: frameAnimation(caveDoorClosed), hover: frameAnimation(caveDoorClosed)},
        northCaveDoor: {normal: northCaveDoor, hover: northCaveDoorHover},
        southCaveDoor: {normal: southCaveDoor, hover: southCaveDoorHover},
        //sideDoorAjar: frameAnimation(sideDoorAjar),
        woodBridge: {normal: woodBridge, hover: woodBridgeHover},
        northMeadowDoor: {normal: northMeadowDoor, hover: northMeadowDoorHover},
        southMeadowDoor: {normal: southMeadowDoor, hover: southMeadowDoorHover},

        sideFenceDoor: {normal: frameAnimation(sideFenceDoor), hover: frameAnimation(sideFenceDoorHover)},
        northFenceDoor: {normal: northFenceDoor, hover: northFenceDoorHover},
        southFenceDoor: {normal: southFenceDoor, hover: southFenceDoorHover},
    };

    exit: Exit;
    animation: FrameAnimation;
    blockedAnimation: FrameAnimation;
    hoverAnimation: FrameAnimation;
    definition: AreaDoorDefinition;
    blocked = false;

    getFrame(): Frame {
        if (this.blocked) {
            return getFrame(this.blockedAnimation, this.area.time * 1000);
        }
        if (getCanvasPopupTarget() === this) {
            return getFrame(this.hoverAnimation, this.area.time * 1000);
        }
        return getFrame(this.animation, this.area.time * 1000);
    }

    applyDefinition(definition: AreaDoorDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        const [targetArea, targetObject] = definition.exitKey.split(':');
        if (targetArea === 'endless') {
            // This should only occur for the guild doors connecting to the initial three endless
            // areas. Those doors have the endless zone key on them for the corresponding zone,
            // and the objectKey will always be 'door:endless:0:0:0' for the entrances.
            this.exit = {zoneKey: definition.exitKey, objectKey: 'door:endless:0:0:0'};
        } else if (targetArea && targetObject) {
            this.exit = {areaKey: targetArea, objectKey: targetObject};
        } else {
            this.exit = null;
        }
        let animationGroup = AreaDoor.animations[definition.animation];
        if (!animationGroup) {
            console.error('Missing door animation', definition.animation);
            animationGroup = AreaDoor.animations.openDoor;
        }
        this.blocked = definition.blocked;
        this.animation = animationGroup.normal;
        this.hoverAnimation = animationGroup.hover;
        this.blockedAnimation = animationGroup.blocked || animationGroup.normal;
        return this;
    }

    onTrigger() {
        // We could later add doors that can toggle closed again if we need.
        this.blocked = false;
    }

    onInteract(hero: Hero) {
        if (this.blocked) {
            return;
        }
        if (this.exit) {
            enterArea(hero, this.exit);
        }
    }

    // The game runs from left to right, so this logic tells the autoplayer to only
    // enter doors to the right, which advance the level.
    shouldInteract(hero: Hero) {
        return !this.blocked && this.getAreaTarget().x > 100;
    }

    isEnabled() {
        if (!this.exit) {
            return false;
        }
        // Outside the guild, only boss doors are disabled until all enemies are defeated.
        if (this.area.zoneKey !== 'guild') {
            if (this.area.isBossArea) {
                return !this.area.enemies.length;
            }
            return true;
        }
        // If furniture is unlocked in general, the doors are also unlocked.
        if (super.isEnabled()) {
            return true;
        }
        // It can also be used if the area it is connected to is unlocked.
        return getState().savedState.unlockedGuildAreas[this.exit.areaKey];
    }

    render(context: CanvasRenderingContext2D): void {
        // Draw with white outlines when this is the canvas target.

        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(
            context,
            this.getAreaTarget(),
            {...this.getFrame(), flipped: this.definition.flipped},
            drawFrame,
            isEditing && isKeyDown(KEY.SHIFT)
        );
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Door',
            onSelect() {
                createObjectAtContextCoords({type: 'door', animation: 'openDoor', exitKey: `:`});
            }
        }
    }

    static getProperties(object: AreaDoor): (EditorProperty<any> | PropertyRow | string)[] {
        const definition = object.definition;
        const props = [];
        const zone = zones[object.area.zoneKey];
        const [areaKey, doorKey] = definition.exitKey.split(':');
        const targetArea = areaKey && getArea(object.area.zoneKey, areaKey);
        const exitKeyProperties = [{
            name: 'Exit Area',
            value: areaKey,
            values: ['', ...Object.keys(zone)],
            onChange: (key: string) => {
                const [areaKey] = definition.exitKey.split(':');
                if (key === areaKey) {
                    return;
                }
                definition.exitKey = `${key}:`;
                refreshObjectDefinition(object);
            },
        }];
        if (targetArea) {
            exitKeyProperties.push({
                name: ':',
                value: doorKey,
                values: ['', ...Object.keys(targetArea.objectsByKey).filter( k => targetArea.objectsByKey[k].definition.type === 'door')],
                onChange: (key: string) => {
                    const [, doorKey] = definition.exitKey.split(':');
                    if (key === doorKey) {
                        return;
                    }
                    definition.exitKey = `${areaKey}:${key}`;
                    refreshObjectDefinition(object);
                },
            })
        }
        props.push(exitKeyProperties);
        props.push({
            name: 'type',
            value: definition.animation,
            values: Object.keys(AreaDoor.animations),
            onChange: (animation: string) => {
                object.definition.animation = animation;
                refreshObjectDefinition(object)
            },
        });
        props.push([{
            name: 'blocked',
            value: definition.blocked || false,
            onChange: (blocked: boolean) => {
                definition.blocked = blocked;
                object.blocked = blocked;
            },
        }]);
        return props;
    }
}
areaObjectFactories.door = AreaDoor;

export interface AreaDoorDefinition extends BaseAreaObjectDefinition {
    exitKey: string,
    animation: string,
    blocked?: boolean,
}
