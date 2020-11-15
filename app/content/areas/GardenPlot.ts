import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { createAnimation } from 'app/utils/animations';

import {
    Frame, Hero,
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
