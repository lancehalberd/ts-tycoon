import { FRAME_LENGTH } from 'app/gameConstants';
import { requireImage } from 'app/images';

interface SimpleRectangle {
    x: number, y: number, w: number, h: number,
}
interface Frame extends SimpleRectangle {
    image: HTMLCanvasElement | HTMLImageElement,
}
interface CreateAnimationOptions {
    x?: number, y?: number,
    rows?: number, cols?: number,
    top?: number, left?: number,
    duration?: number,
    frameMap?: number[],
}
interface ExtraAnimationProperties {
    // The animation will loop unless this is explicitly set to false.
    loop?: boolean,
    // Frame to start from after looping.
    loopFrame?: number,
}
export type Animation = {
    frames: Frame[],
    frameDuration: number,
    duration: number,
} & ExtraAnimationProperties

export function createAnimation(
    source: string,
    rectangle: SimpleRectangle,
    {x = 0, y = 0, rows = 1, cols = 1, top = 0, left = 0, duration = 8, frameMap = null}: CreateAnimationOptions = {},
    props: ExtraAnimationProperties = {},
): Animation {
    let frames: Frame[] = [];
    const image = requireImage(source);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            frames[row * cols + col] = {
                ...rectangle,
                x: left + rectangle.w * (x + col),
                y: top + rectangle.h * (y + row),
                image
            };
        }
    }
    // Say an animation has 3 frames, but you want to order them 0, 1, 2, 1, then pass frameMap = [0, 1, 2, 1],
    // to remap the order of the frames accordingly.
    if (frameMap) {
       frames = frameMap.map(originalIndex => frames[originalIndex]);
    }
    return {frames, frameDuration: duration, ...props, duration: FRAME_LENGTH * frames.length * duration};
};

export function getFrame(animation: Animation, animationTime: number): Frame {
    let frameIndex = Math.floor(animationTime / (FRAME_LENGTH * (animation.frameDuration || 1)));
    if (animation.loop === false) { // You can set this to prevent an animation from looping.
        frameIndex = Math.min(frameIndex, animation.frames.length - 1);
    }
    if (animation.loopFrame && frameIndex >= animation.frames.length) {
        frameIndex -= animation.loopFrame;
        frameIndex %= (animation.frames.length - animation.loopFrame);
        frameIndex += animation.loopFrame;
    }
    return animation.frames[frameIndex % animation.frames.length];
};

export function getAnimationFrameLength(animation) {
    return animation.frames.length * animation.frameDuration;
}
export function drawFrame(
    context: CanvasRenderingContext2D,
    {image, x, y, w, h}: Frame,
    {x: tx, y: ty, w: tw, h: th}: SimpleRectangle
) {
    context.drawImage(image, x, y, w, h, tx, ty, tw, th);
}
