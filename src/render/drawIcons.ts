
import { drawFrame } from 'app/utils/animations';
import { Frame, Renderable, ShortRectangle } from 'app/types';

function isRenderable(icon: Frame | Renderable): icon is Renderable {
    return !!(icon as Renderable).render;
}

export function drawAbilityIcon(context: CanvasRenderingContext2D, icon: Frame | Renderable, target: ShortRectangle) {
    try {
        if (!icon) {
            return;
        }
        if (isRenderable(icon)) {
            icon.render(context, target);
        } else {
            drawFrame(context, icon, target);
        }
    } catch (e) {
        debugger;
    }
}