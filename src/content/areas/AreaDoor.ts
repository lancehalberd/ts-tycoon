import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    drawFrameToAreaTarget,
} from 'app/content/areas';
import { zones } from 'app/content/zones';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { refreshObjectDefinition, uniqueObjectId } from 'app/development/editObjects';
import { requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    EditorProperty, FrameAnimation, FrameDimensions, Area, AreaObject,
    BaseAreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MenuOption, PropertyRow, ShortRectangle,
} from 'app/types';

const [
    , guildRightDoorEmpty, guildRightDoor, guildRightBoardedDoor
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
    {w: 40, h: 148, content: r(16, 67, 12, 65)}, {cols: 3}).frames;

const northFenceDoorGeometry: FrameDimensions = {w: 128, h: 32, content: {x: 52, y: 0, w: 29, h: 32}};
const northFenceDoor = createAnimation('gfx2/areas/Fence north.png', northFenceDoorGeometry, {x: 2});
const northFenceDoorHover = createAnimation('gfx2/areas/Fence north.png', northFenceDoorGeometry, {x: 3});

const southFenceDoorGeometry = {w: 128, h: 16, content: {x: 46, y: 0, w: 32, h: 16}};
const southFenceDoor = createAnimation('gfx2/areas/fencesouthwall.png', southFenceDoorGeometry, {x: 2});
const southFenceDoorHover = createAnimation('gfx2/areas/fencesouthwall.png', southMeadowDoorGeometry, {x: 3});

const [sideDoorClosed, sideDoorAjar, sideDoorOpen] = createAnimation('gfx2/areas/guilddoorsheet.png', { w: 38, h: 50}, {cols: 3}).frames;

interface DoorAnimationGroup {
    normal: FrameAnimation,
    hover: FrameAnimation,
}

export class AreaDoor extends EditableAreaObject {
    static animations: {[key: string]: DoorAnimationGroup} = {
        // Slanted/old guild doors
        openDoor: {normal: frameAnimation(guildRightDoor), hover: frameAnimation(guildRightDoorEmpty)},
        closedDoor: {normal: frameAnimation(guildRightDoor), hover: frameAnimation(guildRightDoorEmpty)},
        upstairs: {normal: upstairs, hover: upstairs},
        downstairs: {normal: downstairs, hover: downstairs},
        // Straigh guild doors
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
    hoverAnimation?: FrameAnimation;
    definition: AreaDoorDefinition;

    getFrame(): Frame {
        if (getCanvasPopupTarget() === this) {
            return getFrame(this.hoverAnimation, this.area.time * 1000);
        }
        return getFrame(this.animation, this.area.time * 1000);
    }

    applyDefinition(definition: AreaDoorDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        const [targetArea, targetObject] = definition.exitKey.split(':');
        this.exit = {areaKey: targetArea, objectKey: targetObject};
        if (!AreaDoor.animations[definition.animation]) {
            console.error('Missing door animation', definition.animation);
            this.animation = AreaDoor.animations.openDoor.normal;
            this.hoverAnimation = AreaDoor.animations.openDoor.hover;
        } else {
            this.animation = AreaDoor.animations[definition.animation].normal;
            this.hoverAnimation = AreaDoor.animations[definition.animation].hover;
        }
        return this;
    }

    onInteract(hero: Hero) {
        enterArea(hero, this.exit);
    }

    // The game runs from left to right, so this logic tells the autoplayer to only
    // enter doors to the right, which advance the level.
    shouldInteract(hero: Hero) {
        return this.getAreaTarget().x > 100;
    }

    isEnabled() {
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
            getChildren() {
                return chooseAnimationMenu((animation: string) => {
                    const area: Area = getState().selectedCharacter.hero.area;
                    // Generate the objectKey now so we can use it for the initial target of this door.
                    const objectKey: string = uniqueObjectId('door', area);
                    createObjectAtContextCoords({type: 'door', animation, exitKey: `${area.key}:${objectKey}`, key: objectKey});
                });
            }
        }
    }

    static getEditMenu(object: AreaDoor): MenuOption[] {
        return [{
            getLabel: () => 'Door Animation',
            getChildren() {
                return chooseAnimationMenu((animation: string) => {
                    object.definition.animation = animation;
                    refreshObjectDefinition(object)
                });
            }
        }, {
            getLabel: () => 'Door Exit',
            getChildren() {
                const zoneKey = object.area.zoneKey;
                return Object.keys(zones[zoneKey]).map((areaKey: string): MenuOption => {
                    const area: Area = getArea(zoneKey, areaKey);
                    return {
                        getLabel: () => areaKey,
                        getChildren() {
                            return Object.keys(area.objectsByKey)
                                .filter(key => area.objectsByKey[key].definition.type === 'door')
                                .map(key => {
                                    return {
                                        getLabel: () => key,
                                        onSelect() {
                                            object.definition.exitKey = `${areaKey}:${key}`;
                                            refreshObjectDefinition(object)
                                        }
                                    }
                                });
                        }
                    };
                });
            }
        }]
    }

    static getProperties(object: AreaDoor): (EditorProperty<any> | PropertyRow | string)[] {
        const props = [];

        return props;
    }
}
areaObjectFactories.door = AreaDoor;

function chooseAnimationMenu(callback: (animation: string) => void): MenuOption[] {
    return Object.keys(AreaDoor.animations).map((animation: string) => {
        return {
            getLabel: () => animation,
            onSelect() {
                  callback(animation);
            }
        }
    })
}

export interface AreaDoorDefinition extends BaseAreaObjectDefinition {
    exitKey: string,
    animation: string,
}
