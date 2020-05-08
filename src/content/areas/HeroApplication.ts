import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { createNewHeroApplicant, hideHeroApplication, showHeroApplication } from 'app/heroApplication';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { fillRect, pad } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget, Character,
    Frame, Hero, ShortRectangle,
} from 'app/types';

export class HeroApplication extends EditableAreaObject {
    static instances: HeroApplication[];

    name = 'Application';
    character: Character;
    // This is just used for the dimensions of the application, we don't actually
    // draw this so we can leave image empty.
    getFrame(): Frame {
        return {image: null, x: 0, y: 0, w: 20, h: 30, d: 0};
    }

    onInteract() {
        showHeroApplication(this);
    }

    render(context: CanvasRenderingContext2D) {
        const target: AreaObjectTarget = this.getAreaTarget();
        const rectangle: ShortRectangle = areaTargetToScreenTarget(target);
        if (getCanvasPopupTarget() === this) {
            context.fillStyle = 'white';
            fillRect(context, pad(rectangle, 1));
        }
        context.fillStyle = '#fc8';
        fillRect(context, rectangle);
        if (!this.character) {
            this.setApplicant(createNewHeroApplicant());
        }
        // Draw a faded job icon on the this application.
        context.save();
            context.globalAlpha = 0.6;
            this.character.hero.job.iconSource.render(
                context,
                {x: rectangle.x + 2, y: rectangle.y + 5, w: 16, h: 16}
            );
        context.restore();
    }

    setApplicant(applicant: Character) {
        this.character = createNewHeroApplicant();
        const index = HeroApplication.instances.indexOf(this);
        if (index >= 0) {
            getState().applicants[index] = this.character;
        }
    }
}
areaObjectFactories.application = HeroApplication;
