import {
    areaObjectFactories,
    isPointOverAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { createObjectAtContextCoords } from 'app/development/editArea';
import { refreshObjectDefinition } from 'app/development/editObjects';
import { createAnimation, frameAnimation, getFrame } from 'app/utils/animations';

import {
    FrameAnimation, Area, AreaObject, AreaObjectTarget, BaseAreaObjectDefinition, Frame,
    MenuOption, ShortRectangle,
} from 'app/types';

export interface AreaDecorationDefinition extends BaseAreaObjectDefinition {
    animationGroup: string,
    animationKey: string,
    isSolid?: boolean,
}

type AnimationTree = {
    [key in string]: {[key in string]: FrameAnimation}
}

const [guildBottomLeft, guildBottomRight, guildBottom] = createAnimation('gfx2/areas/northsouthguild2.png',
    {w: 32, h: 64, content: {x: 0, y: 36, w: 32, h: 28}}, {x: 5, cols: 3}).frames.map(frame => frameAnimation(frame));



export class AreaDecoration extends EditableAreaObject {
    animation: FrameAnimation;
    isSolid: boolean = false;
    definition: AreaDecorationDefinition;

    getFrame(): Frame {
        return getFrame(this.animation, this.area.time * 1000);
    }

    applyDefinition(definition: AreaDecorationDefinition) {
        this._areaTarget = null;
        this.definition = definition;
        this.animation = AreaDecoration.animations[definition.animationGroup][definition.animationKey];
        // Default to false.
        this.isSolid = definition.isSolid === true;
        return this;
    }

    static animations: AnimationTree = {
        guildWall: {
            niche: createAnimation('gfx2/objects/niche.png', {w: 25, h: 36, d: 0}),
            candle: createAnimation('gfx2/objects/candlesheet.png', {w: 9, h: 14, d: 0}),
            candleFlame: createAnimation('gfx2/objects/candlesheet.png', {w: 9, h: 14, d: 0}, {x: 1, cols: 3}),
            billBoard: createAnimation('gfx2/objects/billboard.png', {w: 66, h: 49, d: 0}),
            paper: createAnimation('gfx2/objects/billboardpaper.png', {w: 24, h: 32, d: 0}),
        },
        guildForeground: {
            guildBottom,
            guildBottomLeft,
            guildBottomRight,
        },
        guildFloor: {},
    };

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Decoration',
            getChildren() {
                return chooseAnimationMenu(AreaDecoration.animations, (animationGroup: string, animationKey: string) => {
                    createObjectAtContextCoords({type: 'decoration', animationGroup, animationKey});
                })
            }
        };
    }

    static getEditMenu(object: AreaDecoration): MenuOption[] {
        return [{
            getLabel: () => 'Decoration Animation',
            getChildren() {
                return chooseAnimationMenu(AreaDecoration.animations, (animationGroup: string, animationKey: string) => {
                    object.definition.animationGroup = animationGroup;
                    object.definition.animationKey = animationKey;
                    refreshObjectDefinition(object)
                })
            }
        }];
    }
}
areaObjectFactories.decoration = AreaDecoration;

const guildFloorAnimations = createAnimation('gfx2/areas/Guild tiles2.png',
    {w: 32, h: 32}, {rows: 3}).frames.map(frame => frameAnimation(frame));
for (let i = 0; i < guildFloorAnimations.length; i++) {
    AreaDecoration.animations.guildFloor['tile' + i] = guildFloorAnimations[i];
}

function chooseAnimationMenu(
    animations: AnimationTree,
    callback: (animationGroup: string, animationKey: string) => void
): MenuOption[] {
    return Object.keys(animations).map((animationGroup: string) => {
        return {
            getLabel: () => animationGroup,
            getChildren() {
                return Object.keys(animations[animationGroup]).map(animationKey => {
                    return {
                        getLabel: () => animationKey,
                        onSelect() {
                              callback(animationGroup, animationKey);
                        }
                    }
                });
            }
        }
    })
}

const [
    emptyShelf, bookShelf, mixedShelf, itemShelf
] = createAnimation('gfx2/objects/bookccasesheet.png', {w: 34, h: 64, d: 28}, {cols: 4}).frames;

const [
    simpleChestFrame, chestFrame, silverChestFram
] = createAnimation('gfx2/objects/chestssheetsmall.png',
    {w: 24, h: 18, content: {x: 3, y: 0, w: 18, h: 18}},
    {cols: 3, top: 14}
).frames;

export class AreaObstacle extends AreaDecoration {
    isSolid = true;

    applyDefinition(definition: AreaDecorationDefinition) {
        this._areaTarget = null;
        this.definition = definition;
        this.animation = AreaObstacle.animations[definition.animationGroup][definition.animationKey];
        // Default to solid.
        this.isSolid = definition.isSolid !== false;
        return this;
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Obstacle',
            getChildren() {
                return chooseAnimationMenu(AreaObstacle.animations, (animationGroup: string, animationKey: string) => {
                    createObjectAtContextCoords({type: 'obstacle', animationGroup, animationKey});
                })
            }
        };
    }

    static getEditMenu(object: AreaDecoration): MenuOption[] {
        return [{
            getLabel: () => 'Obstacle Animation',
            getChildren() {
                return chooseAnimationMenu(AreaObstacle.animations, (animationGroup: string, animationKey: string) => {
                    object.definition.animationGroup = animationGroup;
                    object.definition.animationKey = animationKey;
                    refreshObjectDefinition(object)
                })
            }
        }];
    }

    static animations: AnimationTree = {
        guildFurniture: {
            emptyShelf: frameAnimation(emptyShelf),
            bookShelf: frameAnimation(bookShelf),
            mixedShelf: frameAnimation(mixedShelf),
            itemShelf: frameAnimation(itemShelf),
            simpleChest: frameAnimation(simpleChestFrame),
            chest: frameAnimation(chestFrame),
            silverChest: frameAnimation(silverChestFram),
        },
    };
}
areaObjectFactories.obstacle = AreaObstacle;
