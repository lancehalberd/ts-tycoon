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
import { drawFrame } from 'app/utils/animations';
import { isPointInShortRect } from 'app/utils/index';

import { Frame, Hero, JobAchievement, ShortRectangle } from 'app/types';

const altarFrame:Frame = {image: requireImage('gfx/guildhall.png'), x: 420, y: 180, w: 30, h: 30};

function drawFlashing(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle): void {
    drawTintedFrame(context, {...frame, color: 'white', amount: 0.5 + .2 * Math.sin(Date.now() / 150)}, target);
}

export class TrophyAltar extends EditableAreaObject {
    name = 'Trophy Altar';
    trophy: JobAchievement;

    getFrame(): Frame {
        return altarFrame;
    }

    onInteract(hero: Hero): void {
        removePopup();
        setChoosingTrophyAltar(this);
    }

    getActiveBonusSources() {
        return [{'bonuses': {'$hasItemCrafting': true}}];
    }

    getTrophyRectangle(): ShortRectangle {
        const target = this.getAreaTarget();
        if (!this.trophy) {
            return {x: target.x, y: target.y, w: 0, h: 0};
        }
        const rectangle = areaTargetToScreenTarget(target);
        return {
            x: rectangle.x + rectangle.w / 2 - TROPHY_SIZE / 2,
            y: rectangle.y + 4 - TROPHY_SIZE,
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
        const frame = this.getFrame();
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        } else if (!this.trophy && getIsAltarTrophyAvailable()) {
            draw = drawFlashing;
        }
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, draw, isEditing);
        if (this.trophy) {
            const target = this.getTrophyRectangle();
            if (getCanvasPopupTarget() === this) {
                drawWhiteOutlinedFrame(context, this.trophy.tintFrame, target);
            }
            // This uses a composite drawing method so we need to draw it on top of the outlined version.
            this.trophy.render(context, target);
        }
    }
}
areaObjectFactories.trophyAltar = TrophyAltar;
