import { messageCharacter } from 'app/adventure';
import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { bodyDiv, titleDiv } from 'app/dom';
import { FRAME_LENGTH } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { createAnimation, frameAnimation, getFrame } from 'app/utils/animations';

import {
    Area, AreaObject, AreaObjectTarget, Exit, Frame, FrameAnimation, Hero,
    LootGenerator, MenuOption, ShortRectangle,
} from 'app/types';


const dirtFrame = createAnimation('gfx2/areas/dirt32tiles.png', {w: 16, h: 16, d: 32}).frames[0];

export class GardenPlot extends EditableAreaObject {
    name = 'Garden Plot';

    getFrame(): Frame {
        return dirtFrame;
    }
    onInteract(hero: Hero) {
        console.log('interacted');
    }
}
areaObjectFactories.gardenPlot = GardenPlot;
