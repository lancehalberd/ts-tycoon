import { JobIcon } from 'app/content/jobs';

export type Color = string;

export type Point = [number, number];
export type Range = [number, number];

export type Tags = {[key: string]: true};

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

export interface BasicFrame {
    image: HTMLCanvasElement | HTMLImageElement,
    left: number,
    top: number,
    width: number,
    height: number,
    render?: Function,
}
export type ArrayFrame = [string, number, number, number, number, number, number];

export type Frame = string | JobIcon | BasicFrame;

export interface TintedFrame extends BasicFrame {
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
