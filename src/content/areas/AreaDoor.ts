import { enterArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
} from 'app/content/areas';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    FrameAnimation, Area, AreaObject, BaseAreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    ShortRectangle,
} from 'app/types';

const [
    , guildRightDoorEmpty, guildRightDoor, guildRightBoardedDoor
] = createAnimation('gfx2/areas/guildbridge.png',
    {w: 39, h: 148, content: r(11, 50, 20, 70)}, {cols: 4}).frames;
const [, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {cols: 3}).frames;
const woodBridge = createAnimation('gfx2/areas/meadowbridge.png',
    {w: 39, h: 148, content: r(16, 92, 23, 35)}, {x: 1, cols: 1});

export class AreaDoor extends EditableAreaObject {
    static animations = {
        openDoor: frameAnimation(guildRightDoorEmpty),
        closedDoor: frameAnimation(guildRightDoor),
        boardedDoor: frameAnimation(guildRightBoardedDoor),
        woodBridge,
        caveDoorOpen: frameAnimation(caveDoorOpen),
        caveDoorClosed: frameAnimation(caveDoorClosed),
    };

    exit: Exit;
    animation: FrameAnimation;

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
}
areaObjectFactories.door = AreaDoor;

export interface AreaDoorDefinition extends BaseAreaObjectDefinition {
    exitKey: string,
    animation: string
}
