import { getIsAltarTrophyAvailable, setChoosingTrophyAltar, trophySelectionRectangle } from 'app/content/achievements';
import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    drawFrameToAreaTarget,
    isPointOverAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { setContext } from 'app/context';
import { editingAreaState } from 'app/development/editArea';
import { titleDiv } from 'app/dom';
import { TROPHY_SIZE } from 'app/gameConstants';
import { drawWhiteOutlinedFrame, drawTintedFrame, requireImage } from 'app/images';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { createAnimation, drawFrame, getFrame } from 'app/utils/animations';
import { isPointInShortRect } from 'app/utils/index';

import { Frame, FrameAnimation, FrameDimensions, Hero, JobAchievement, ShortRectangle } from 'app/types';

const altarGeometry: FrameDimensions = {w: 24, h: 31, d: 24, content: {x: 2, y: 5, w: 20, h: 26}};
const altar: FrameAnimation = createAnimation('gfx2/objects/trophyaltar.png', altarGeometry, {x: 6});
const altarHover: FrameAnimation = createAnimation('gfx2/objects/trophyaltar.png', altarGeometry, {cols: 2});
const altarGlow: FrameAnimation = createAnimation('gfx2/objects/trophyaltar.png', altarGeometry, {cols: 4, x: 2});

function drawFlashing(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle): void {
    drawTintedFrame(context, {...frame, color: 'white', amount: 0.5 + .2 * Math.sin(Date.now() / 150)}, target);
}

export class TrophyAltar extends EditableAreaObject {
    name = 'Trophy Altar';
    trophy: JobAchievement;
    animation = altar;

    onInteract(hero: Hero): void {
        removePopup();
        setChoosingTrophyAltar(this);
    }

    getTrophyRectangle(): ShortRectangle {
        const target = this.getAreaTarget();
        if (!this.trophy) {
            return {x: target.x, y: target.y, w: 0, h: 0};
        }
        const rectangle = areaTargetToScreenTarget(target);
        return {
            x: rectangle.x + rectangle.w / 2 - TROPHY_SIZE / 2,
            y: rectangle.y - TROPHY_SIZE + 1 + 3 * Math.sin(this.area.time * 2),
            w: TROPHY_SIZE,
            h: TROPHY_SIZE,
        };
    }

    isPointOver(x: number, y: number) {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y) || isPointInShortRect(x, y, this.getTrophyRectangle())
    }

    helpMethod() {
        if (this.trophy) return this.trophy.helpMethod();
        return ('Trophy Altar');
    }

    render(context: CanvasRenderingContext2D) {
        // Draw with white outlines when this is the canvas target.
        const altarFrame = this.getFrame();
        let glowFrame = null;
        if (getCanvasPopupTarget() === this) {
            glowFrame = getFrame(altarHover, this.area.time * 1000);
        } else if (this.trophy || getIsAltarTrophyAvailable()) {
            glowFrame = getFrame(altarGlow, this.area.time * 1000);
        }
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...altarFrame, flipped: this.definition.flipped}, drawFrame, isEditing);
        if (glowFrame) {
            drawFrameToAreaTarget(context, this.getAreaTarget(), {...glowFrame, flipped: this.definition.flipped}, drawFrame, isEditing);
        }
        if (this.trophy) {
            // Note: this uses a composite drawing method, so regular draw effects may not work.
            this.trophy.render(context, this.getTrophyRectangle());
        }
    }
}
areaObjectFactories.trophyAltar = TrophyAltar;
