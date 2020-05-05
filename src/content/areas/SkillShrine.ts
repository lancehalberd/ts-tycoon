import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { bodyDiv, titleDiv } from 'app/dom';
import { requireImage } from 'app/images';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MenuOption, ShortRectangle,
} from 'app/types';
const guildImage = requireImage('gfx/guildhall.png');
const shrineFrame:Frame = {image: guildImage, x: 360, y: 180, w: 60, h: 60, content: {x: 20, y: 0, w: 20, h: 60, d: 30}};

export class SkillShrine extends EditableAreaObject {
    name = 'Shrine of Divinity';
    getFrame(): Frame {
        return shrineFrame;
    }
    onInteract = activateShrine;
    helpMethod() {
        return titleDiv('Divine Shrine')
            + bodyDiv('Offer divinity at these shrines to be blessed by the Gods with new powers.');
    }
    shouldInteract(hero: Hero): boolean {
        return !hero.character.skipShrines;
    }

    // Skill shrines don't work outside of skill levels, so disable this
    // until we add editing for skill levels.
    static getCreateMenu(): MenuOption {
        return null;
    }
}
areaObjectFactories.skillShrine = SkillShrine;
