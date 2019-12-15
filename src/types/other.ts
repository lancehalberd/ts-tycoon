export type Color = number | string;

export type Point = [number, number];
export type Range = [number, number];

export type Tags = {[key: string]: true};

export interface Frame {
    image: HTMLCanvasElement | HTMLImageElement,
    left: number,
    top: number,
    width: number,
    height: number,
    draw?: Function,
}

export interface TintedFrame extends Frame {
    color: Color,
}

export interface Source {
    image: HTMLCanvasElement | HTMLImageElement,
    width: number,
    height: number,
    actualHeight: number,
    actualWidth: number,
    xOffset: number,
    yOffset: number,
    xCenter: number,
    yCenter: number,
    // Don't spend too much time on these, I likely need to complete redo
    // how I'm tracking image/sprites/frames.
    frames: number,
    // If this is unset we will just use a prebuilt effect instead of animating.
    deathFrames?: number[],
    walkFrames: number[],
    attackPreparationFrames: number[],
    attackRecoveryFrames: number[],
    flipped?: boolean,
    framesPerRow?: number,
    attackY?: number,
}
