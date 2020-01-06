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
export default class TintIcon extends Renderable {
    type: string = 'tintIcon';
    frame: Frame;
    color: string;

    constructor(imageFile, color) {
        super();
        this.frame = {
            image: requireImage(imageFile),
            x: 0, y: 0, w: 32, h: 32,
        };
        this.color = color;
    }

    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        // We can remove this once we use SimpleRectangle in drawTintedImage
        const compositeTarget = {'left': 0, 'top': 0, 'width': 32, 'height': 32};
        // Draw the tinted section the specified color.
        drawTintedImage(tintCompositeContext, this.frame.image, this.color, 1, compositeTarget, compositeTarget);
        // Draw the untinted section on top of the tinted section.
        drawFrame(tintCompositeContext, {...this.frame, y: this.frame.y + this.frame.h}, this.frame);

        // Draw the tinted image to the target location
        drawFrameCenteredInTarget(context, {...this.frame, image: tintCompositeCanvas}, target);
    }
}
