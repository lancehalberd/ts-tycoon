import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { setContext } from 'app/context';
import { requireImage } from 'app/images';

import { Frame, Hero } from 'app/types';

const shrineFrame:Frame = {image: requireImage('gfx/guildhall.png'), x: 450, y: 150, w: 30, h: 30};

export class ShrineOfFortune extends EditableAreaObject {
    name = 'Shrine of Fortune';
    bonusSource = {'bonuses': {'$hasItemCrafting': true}};
    getFrame(): Frame {
        return shrineFrame;
    }
    onInteract(hero: Hero): void {
        setContext('item');
    }
}
areaObjectFactories.shrineOfFortune = ShrineOfFortune;
