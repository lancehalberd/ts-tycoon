import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { requireImage } from 'app/images';
import { unlockInitialLevels } from 'app/map';
import { getState } from 'app/state';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    Exit, Frame, Hero, ShortRectangle,
} from 'app/types';
const guildImage = requireImage('gfx/guildhall.png');
const mapTableFrame:Frame = {image: guildImage, x: 360, y: 150, w: 60, h: 30, content: {x: 0, y: 0, w: 60, h: 27, d: 30}};

export function openWorldMap() {
    unlockInitialLevels();
    setContext('map');
}

export class MapTable extends EditableAreaObject {
    name = 'World Map';
    bonusSource = {'bonuses': {'$hasMap': true}};
    getFrame(): Frame {
        return mapTableFrame;
    }
    onInteract(hero: Hero): void {
        openWorldMap();
    }
}
areaObjectFactories.mapTable = MapTable;
