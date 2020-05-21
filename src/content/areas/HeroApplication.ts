import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import { createNewHeroApplicant, hideHeroApplication, showHeroApplication } from 'app/heroApplication';
import { drawWhiteOutlinedFrame } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, drawFrame, getFrame } from 'app/utils/animations';
import { fillRect, pad } from 'app/utils/index';

import {
    Applicant, Area, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    Frame, Hero, ShortRectangle,
} from 'app/types';

const paper = createAnimation('gfx2/objects/billboardpaper.png', {w: 24, h: 32, d: 0});

export class HeroApplication extends EditableAreaObject {
    static instances: HeroApplication[];

    name = 'Application';
    applicant: Applicant;
    // This is just used for the dimensions of the application, we don't actually
    // draw this so we can leave image empty.
    getFrame(): Frame {
        return getFrame(paper, this.area.time * 1000);
    }

    onInteract() {
        showHeroApplication(this);
    }

    render(context: CanvasRenderingContext2D) {
        const target: AreaObjectTarget = this.getAreaTarget();
        const rectangle: ShortRectangle = areaTargetToScreenTarget(target);
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        }
        draw(context, this.getFrame(), rectangle);
        if (!this.applicant) {
            this.setApplicant(createNewHeroApplicant());
        }
        // Draw a faded job icon on the this application.
        context.save();
            context.globalAlpha = 0.6;
            this.applicant.hero.job.iconSource.render(
                context,
                {x: rectangle.x + 3, y: rectangle.y + 8, w: 16, h: 16}
            );
        context.restore();
    }

    setApplicant(applicant: Applicant) {
        this.applicant = applicant;
        const index = HeroApplication.instances.indexOf(this);
        if (index >= 0) {
            getState().applicants[index] = this.applicant;
        }
    }
}
areaObjectFactories.application = HeroApplication;
