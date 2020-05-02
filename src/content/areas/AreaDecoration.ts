import {
    areaObjectFactories,
    isPointOverAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { createAnimation, frameAnimation, getFrame } from 'app/utils/animations';

import {
    FrameAnimation, Area, AreaObject, AreaObjectTarget, BaseAreaObjectDefinition, Frame,
    ShortRectangle,
} from 'app/types';

const [
    emptyShelf, bookShelf, mixedShelf, itemShelf
] = createAnimation('gfx2/areas/bookccasesheet.png', {x: 0, y: 0, w: 34, h: 64, d: 28}, {cols: 4}).frames;

export class AreaDecoration extends EditableAreaObject {
    animation: FrameAnimation;
    isSolid: boolean = false;

    getFrame(): Frame {
        return getFrame(this.animation, this.area.time * 1000);
    }

    applyDefinition(definition: AreaDecorationDefinition) {
        this._areaTarget = null;
        this.definition = definition;
        this.animation = AreaDecoration.animations[definition.animationGroup][definition.animationKey];
        this.isSolid = !!definition.isSolid;
        return this;
    }

    static animations = {
        guildWall: {
            niche: createAnimation('gfx2/areas/niche.png', {x: 0, y: 0, w: 25, h: 36, d: 0}),
            candle: createAnimation('gfx2/areas/candlesheet.png', {x: 0, y: 0, w: 9, h: 14, d: 0}),
            candleFlame: createAnimation('gfx2/areas/candlesheet.png', {x: 0, y: 0, w: 9, h: 14, d: 0}, {x: 1, cols: 3}),
        },
        guildFurniture: {
            emptyShelf: frameAnimation(emptyShelf),
            bookShelf: frameAnimation(bookShelf),
            mixedShelf: frameAnimation(mixedShelf),
            itemShelf: frameAnimation(itemShelf),
        },
    };
}
areaObjectFactories.decoration = AreaDecoration;

export interface AreaDecorationDefinition extends BaseAreaObjectDefinition {
    animationGroup: keyof typeof AreaDecoration.animations,
    animationKey: string,
    isSolid?: boolean,
}
