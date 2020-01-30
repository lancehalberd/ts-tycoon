import { JobIcon } from 'app/content/jobs';

export type Color = string;

export type Point = [number, number];
export type Range = [number, number];

export type Tags = {[key: string]: true};

export class Renderable {
    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        debugger;
        throw new Error('render not implemented');
    }
}

export interface FullRectangle {
    left: number,
    top: number,
    width: number,
    height: number,
    right?: number,
    bottom?: number,
}
export interface ShortRectangle {
    x: number,
    y: number,
    w: number,
    h: number,
}
export type Rectangle = FullRectangle | ShortRectangle;

export interface Frame extends ShortRectangle {
    image: HTMLCanvasElement | HTMLImageElement,
    // When a frame does not perfectly fit the size of the content, this content rectangle can be
    // set to specify the portion of the image that is functionally part of the object in the frame.
    // For example, a character with a long time may have the content around the character's body and
    // exclude the tail when looking at the width/height of the character.
    content?: ShortRectangle,
}

export interface BasicFrame {
    image: HTMLCanvasElement | HTMLImageElement,
    left: number,
    top: number,
    width: number,
    height: number,
    render?: (context: CanvasRenderingContext2D, target: FullRectangle) => void,
}
export type ArrayFrame = [string, number, number, number, number, number, number];

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
    idleFrames?: number[],
    walkFrames: number[],
    attackPreparationFrames: number[],
    attackRecoveryFrames: number[],
    flipped?: boolean,
    framesPerRow?: number,
    attackY?: number,
    // Set on source for some monsters
    y?: number,
}

export interface TextPopup {
    value?: string | number,
    fontSize?: number,
    x: number, y: number, z: number,
    vx: number, vy: number,
    color: Color,
    duration?: number,
    gravity?: number,
}
