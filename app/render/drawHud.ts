import { drawWhiteOutlinedFrame, drawTintedFrame } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { getGlobalHud } from 'app/ui/hud';
import { drawFrame } from 'app/utils/animations';

import { HudFrameButton } from 'app/types';

export function drawHud(context: CanvasRenderingContext2D) {
    for (const element of getGlobalHud()) {
        if (element.isVisible && !element.isVisible()) continue;
        element.render(context);
    }
}

export function drawHudFrameButton(context: CanvasRenderingContext2D, element: HudFrameButton ) {
    if (getCanvasPopupTarget() === element) {
        drawWhiteOutlinedFrame(context, element.frame, element.target);
    } else if (element.flashColor) {
        drawTintedFrame(context,
            {...element.frame, color: element.flashColor, amount: .5 + .2 * Math.sin(Date.now() / 150)},
            element.target
        );
    } else {
        drawFrame(context, element.frame, element.target);
    }
}
