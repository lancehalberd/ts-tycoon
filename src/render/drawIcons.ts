
import { drawFrame } from 'app/utils/animations';
import { Frame, Renderable, ShortRectangle } from 'app/types';

export function drawAbilityIcon(context: CanvasRenderingContext2D, icon: Frame | Renderable, target: ShortRectangle) {
    try {
        if (!icon) {
            return;
        }
        if (icon instanceof Renderable) {
            icon.render(context, target);
        } else {
            // Don't scale up ability icons.
            drawFrame(context, icon, target);
        }
    } catch (e) {
        debugger;
    }
}