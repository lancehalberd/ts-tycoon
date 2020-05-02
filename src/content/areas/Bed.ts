import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { requireImage } from 'app/images';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    ShortRectangle,
} from 'app/types';
const bedFrame:Frame = {image: requireImage('gfx2/areas/bed2.png'), x: 0, y: 0, w: 52, h: 38, d: 40};

export class Bed extends EditableAreaObject {
    static instances: Bed[];

    name = 'Bed';
    getFrame(): Frame {
        return bedFrame;
    }
    getActiveBonusSources() {
        return [{'bonuses': {'+maxHeroes': 1}}];
    }
}
areaObjectFactories.bed = Bed;
