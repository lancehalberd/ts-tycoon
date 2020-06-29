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
    FrameAnimation, Area, AreaObject, BaseAreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MenuOption, ShortRectangle,
} from 'app/types';

const [
    , guildRightDoorEmpty, guildRightDoor, guildRightBoardedDoor
] = createAnimation('gfx2/areas/guildbridge.png',
    {w: 39, h: 148, content: r(11, 50, 20, 70)}, {cols: 4}).frames;
const [, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge2.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {cols: 3}).frames;
const woodBridge = createAnimation('gfx2/areas/meadowbridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {x: 1, cols: 1});

const northSouthGuildBase = {image: requireImage('gfx2/areas/northsouthguild2.png'), w: 32, h: 64};

const guildImage = requireImage('gfx/guildhall.png');
const northDoor = frameAnimation({...northSouthGuildBase, x: 0, y: 0, content: {x: 0, y: 0, w: 32, h: 42}});
const northDoorHover = frameAnimation({...northSouthGuildBase, x: 8 * 32, y: 0, content: {x: 0, y: 0, w: 32, h: 42}});
const southDoor = frameAnimation({...northSouthGuildBase, x: 3 * 32, y: 0, content: {x: 0, y: 40, w: 32, h: 24}});
const southDoorHover = frameAnimation({...northSouthGuildBase, x: 4 * 32, y: 0, content: {x: 0, y: 40, w: 32, h: 24}});
const upstairs = frameAnimation({image: guildImage, x: 270, y: 94, w: 30, h: 51});
const downstairs = frameAnimation({image: guildImage, x: 300, y: 94, w: 30, h: 51});

const [sideDoorClosed, sideDoorAjar, sideDoorOpen] = createAnimation('gfx2/areas/guilddoorsheet.png', { w: 38, h: 50}, {cols: 3}).frames;

export class AreaDoor extends EditableAreaObject {
    static animations = {
        openDoor: {normal: frameAnimation(guildRightDoor), hover: frameAnimation(guildRightDoorEmpty)},
        closedDoor: {normal: frameAnimation(guildRightDoor), hover: frameAnimation(guildRightDoorEmpty)},
        //boardedDoor: frameAnimation(guildRightBoardedDoor),
        woodBridge: {normal: woodBridge, hover: woodBridge},
        caveDoorOpen: {normal: frameAnimation(caveDoorOpen), hover: frameAnimation(caveDoorOpen)},
        caveDoorClosed: {normal: frameAnimation(caveDoorClosed), hover: frameAnimation(caveDoorClosed)},
        backDoor: {normal: northDoor, hover: northDoorHover},
        southDoor: {normal: southDoor, hover: southDoorHover},
        upstairs: {normal: upstairs, hover: upstairs},
        downstairs: {normal: downstairs, hover: downstairs},
        sideDoorClosed: {normal: frameAnimation(sideDoorClosed), hover: frameAnimation(sideDoorOpen)},
        //sideDoorAjar: frameAnimation(sideDoorAjar),
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
