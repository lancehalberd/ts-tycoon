import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { setContext } from 'app/context';
import { requireImage } from 'app/images';

import { Frame, Hero } from 'app/types';

const shrineFrame:Frame = {
    image: requireImage('gfx/guildhall.png'),
    x: 360, y: 180, w: 60, h: 60, d: 30,
    content: {x: 15, y: 0, w: 30, h: 60}
};

export class ShrineOfCreation extends EditableAreaObject {
    name = 'Shrine of Creation';
    bonusSource = {'bonuses': {'$hasJewelCrafting': true}};
    getFrame(): Frame {
        return shrineFrame;
    }
    onInteract(hero: Hero): void {
        setContext('jewel');
    }
}
areaObjectFactories.shrineOfCreation = ShrineOfCreation;

//'source': objectSource(guildImage, [360, 180], [60, 60, 4], {'actualWidth': 30, 'yOffset': -6}),
