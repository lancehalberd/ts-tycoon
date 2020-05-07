import {
    areaObjectFactories,
    isPointOverAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { createObjectAtMouse, refreshDefinition } from 'app/development/editArea';
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
        },
    };

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Decoration',
            getChildren() {
                return chooseAnimationMenu(AreaDecoration.animations, (animationGroup: string, animationKey: string) => {
                    createObjectAtMouse({type: 'decoration', animationGroup, animationKey});
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
                    refreshDefinition(object)
                })
            }
        }];
    }
}
areaObjectFactories.decoration = AreaDecoration;

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
                    createObjectAtMouse({type: 'obstacle', animationGroup, animationKey});
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
                    refreshDefinition(object)
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
