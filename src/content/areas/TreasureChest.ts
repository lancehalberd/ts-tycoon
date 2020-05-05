import { messageCharacter } from 'app/adventure';
import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { bodyDiv, titleDiv } from 'app/dom';
import { requireImage } from 'app/images';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { createAnimation, frameAnimation } from 'app/utils/animations';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    LootGenerator, MenuOption, ShortRectangle,
} from 'app/types';
const [
    simpleChestFrame, chestFrame, silverChestFram
] = createAnimation('gfx2/objects/chestssheet.png',
    {w: 24, h: 18, content: {x: 3, y: 0, w: 18, h: 18}},
    {cols: 3, top: 14}
).frames;


export class TreasureChest extends EditableAreaObject {
    name = 'Treasure Chest';
    opened = false;
    loot: LootGenerator[] = [];
    getFrame(): Frame {
        return this.opened ? silverChestFram : simpleChestFrame;
    }
    onInteract(hero: Hero) {
        if (this.opened) {
            messageCharacter(hero.character, 'Empty');
            return;
        }
        // The loot array is an array of objects that can generate specific loot drops.
        // Iterate over each one, generate a drop and then give the loot to the player
        // and display it on the screen.
        let delay = 0;
        const target: AreaObjectTarget = this.getAreaTarget();
        for (let i = 0; i < this.loot.length; i++) {
            const drop = this.loot[i].generateLootDrop();
            drop.gainLoot(hero);
            const xOffset = (this.loot.length > 1) ? - 50 + 100 * i / (this.loot.length - 1) : 0;
            drop.addTreasurePopup(hero, target.x + xOffset, target.y + 64, target.z, delay += 5);
        }
        this.opened = true;
        this.name = 'Opened Treasure Chest';
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
