import { drawFrame, drawFrameCenteredInTarget } from 'app/utils/animations';
import { createCanvas } from 'app/dom';
import { drawTintedImage, drawImage, requireImage } from 'app/images';

import { Frame, ShortRectangle, Renderable } from 'app/types';

const tintCompositeCanvas = createCanvas(32, 32);
const tintCompositeContext = tintCompositeCanvas.getContext('2d');
// Append canvas to body for debug purposes if you like.
// document.body.appendChild(tintCompositeCanvas);
// This class only works for 32x32 icon images currently. To expand this we would need
// to increase the size of the composite canvas and then add options to configure the size.
export default class TintIcon implements Renderable {
    type: string = 'tintIcon';
    frame: Frame;
    color: string;

    constructor(imageFile, color) {
        this.frame = {
            image: requireImage(imageFile),
            x: 0, y: 0, w: 32, h: 32,
        };
        this.color = color;
    }

    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        // Draw the tinted section the specified color.
        drawTintedImage(tintCompositeContext, this.frame.image, this.color, 1, this.frame, this.frame);
        // Draw the untinted section on top of the tinted section.
        drawFrame(tintCompositeContext, {...this.frame, y: this.frame.y + this.frame.h}, this.frame);

        // Draw the tinted image to the target location
        drawFrame(context, {...this.frame, image: tintCompositeCanvas}, target);
    }
}
