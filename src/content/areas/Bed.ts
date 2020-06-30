import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { requireImage } from 'app/images';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    Exit, Frame, Hero, ShortRectangle,
} from 'app/types';
const bedFrame:Frame = {image: requireImage('gfx2/objects/bed2.png'), x: 0, y: 0, w: 52, h: 38, d: 40};

export class Bed extends EditableAreaObject {
    static instances: {[key: string]: Bed} = {};

    bonusSource = {'bonuses': {'+maxHeroes': 1}};
    name = 'Bed';
    getFrame(): Frame {
        return bedFrame;
    }
}
areaObjectFactories.bed = Bed;
