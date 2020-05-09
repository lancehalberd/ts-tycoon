import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
} from 'app/content/areas';
import { zones } from 'app/content/zones';
import { createObjectAtMouse, refreshDefinition, uniqueObjectId } from 'app/development/editArea';
import { requireImage } from 'app/images';
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
const [, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {cols: 3}).frames;
const woodBridge = createAnimation('gfx2/areas/meadowbridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {x: 1, cols: 1});

const guildImage = requireImage('gfx/guildhall.png');
const backDoor = frameAnimation({image: guildImage, x: 240, y: 94, w: 30, h: 51});
const upstairs = frameAnimation({image: guildImage, x: 270, y: 94, w: 30, h: 51});
const downstairs = frameAnimation({image: guildImage, x: 300, y: 94, w: 30, h: 51});

export class AreaDoor extends EditableAreaObject {
    static animations = {
        openDoor: frameAnimation(guildRightDoorEmpty),
        closedDoor: frameAnimation(guildRightDoor),
        boardedDoor: frameAnimation(guildRightBoardedDoor),
        woodBridge,
        caveDoorOpen: frameAnimation(caveDoorOpen),
        caveDoorClosed: frameAnimation(caveDoorClosed),
        backDoor,
        upstairs,
        downstairs,
    };

    exit: Exit;
    animation: FrameAnimation;
    definition: AreaDoorDefinition;

    getFrame(): Frame {
        return getFrame(this.animation, this.area.time * 1000);
    }

    applyDefinition(definition: AreaDoorDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        const [targetArea, targetObject] = definition.exitKey.split(':');
        this.exit = {areaKey: targetArea, objectKey: targetObject};
        this.animation = AreaDoor.animations[definition.animation];
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

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Door',
            getChildren() {
                return chooseAnimationMenu((animation: string) => {
                    const area: Area = getState().selectedCharacter.hero.area;
                    // Generate the objectKey now so we can use it for the initial target of this door.
                    const objectKey: string = uniqueObjectId('door', area);
                    createObjectAtMouse({type: 'door', animation, exitKey: `${area.key}:${objectKey}`}, objectKey);
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
                    refreshDefinition(object)
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
                                            refreshDefinition(object)
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
    animation: string
}
