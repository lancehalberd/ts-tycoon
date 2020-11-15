import { messageCharacter } from 'app/adventure';
import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { FRAME_LENGTH } from 'app/gameConstants';
import { createAnimation, frameAnimation, getFrame } from 'app/utils/animations';

import {
    AreaObjectTarget, Frame, FrameAnimation, Hero,
    LootGenerator, MenuOption, TreasureChestDefinition,
} from 'app/types';


const brownChestAnimation = createAnimation('gfx2/objects/chest1opensheet.png',
    {w: 32, h: 23, content: {x: 4, y: 0, w: 24, h: 23}},
    {cols: 8, top: 20, duration: 6, frameMap: [0, 1, 1, 2, 3, 4, 4, 5, 6, 7]}, {loop: false}
);

const silverChestAnimation = createAnimation('gfx2/objects/chest2opensheet.png',
    {w: 32, h: 23, content: {x: 4, y: 0, w: 24, h: 23}},
    {cols: 6, top: 20, duration: 6, frameMap: [0, 1, 2, 2, 3, 4, 5]}, {loop: false}
);

interface ChestAnimations {
    closed: FrameAnimation,
    open: FrameAnimation,
    // The frame in the open animation where loot should appear.
    lootFrame: number,
}
export class TreasureChest extends EditableAreaObject {
    static animations: {[key: string]: ChestAnimations} = {
        brownChest: {
            closed: frameAnimation(brownChestAnimation.frames[0]),
            open: brownChestAnimation,
            lootFrame: 8,
        },
        silverChest: {
            closed: frameAnimation(silverChestAnimation.frames[0]),
            open: silverChestAnimation,
            lootFrame: 4,
        },
    };
    name = 'Treasure Chest';
    definition: TreasureChestDefinition;
    opened = false;
    opener: Hero;
    loot: LootGenerator[] = [];
    lootGenerated = false;
    chestType: string;
    animationTime: number;
    constructor() {
        super();
        this.animationTime = 0;
    }
    update() {
        this.animationTime += FRAME_LENGTH;
        const animationGroup = TreasureChest.animations[this.definition.chestType];
        // Generate loot on the specified frame of the animation. Note that this frame displays for
        // several updates, so we need to set a flag to make sure we only generate the loot once.
        if (!this.lootGenerated && this.getFrame() === animationGroup.open.frames[animationGroup.lootFrame]) {
            // The loot array is an array of objects that can generate specific loot drops.
            // Iterate over each one, generate a drop and then give the loot to the player
            // and display it on the screen.
            let delay = 0;
            const target: AreaObjectTarget = this.getAreaTarget();
            for (let i = 0; i < this.loot.length; i++) {
                const drop = this.loot[i].generateLootDrop();
                drop.gainLoot(this.opener);
                const xOffset = (this.loot.length > 1) ? - 20 + 40 * i / (this.loot.length - 1) : 0;
                // The -12 here is eyeballed based on what seemed like it would make things come out of the center of
                // the chest opening. This might have to be parameterized if we have chest animations with very different
                // dimensions.
                drop.addTreasurePopup(this.opener, target.x + xOffset, target.y + target.h - 12, target.z - 1, delay += 5);
            }
            this.name = 'Opened Treasure Chest';
            this.lootGenerated = true;
        }
    }
    getFrame(): Frame {
        const animationGroup = TreasureChest.animations[this.definition.chestType];
        const animation = this.opened ? animationGroup.open : animationGroup.closed;
        return getFrame(animation, this.animationTime);
    }
    isEnabled(): boolean {
        return !this.opened;
    }
    onInteract(hero: Hero) {
        if (this.opened) {
            messageCharacter(hero.character, 'Empty');
            return;
        }
        this.opened = true;
        this.opener = hero;
        this.animationTime = 0;
    }
    shouldInteract(hero: Hero): boolean {
        return !this.opened;
    }

    // Disable treasure chests until we have a way to specify their contents.
    static getCreateMenu(): MenuOption {
        return null;
    }
}
areaObjectFactories.treasureChest = TreasureChest;
