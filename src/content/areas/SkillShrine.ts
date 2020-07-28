import {
    areaObjectFactories,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { bodyDiv, titleDiv } from 'app/dom';
import { getState } from 'app/state';
import { activateShrine } from 'app/ui/chooseBlessing';
import { createAnimation } from 'app/utils/animations';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MenuOption, ShortRectangle,
} from 'app/types';

const [
    dexterityStatue,
    strengthStatue,
    intelligenceStatue,
] = createAnimation('gfx2/objects/God statues.png', {w: 40, h: 68}, {cols: 3}).frames;

export class SkillShrine extends EditableAreaObject {
    static animations = {
        dexterityStatue,
        strengthStatue,
        intelligenceStatue,
    };

    frame = dexterityStatue;
    name = 'Shrine of Divinity';
    getFrame(): Frame {
        return this.frame;
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
