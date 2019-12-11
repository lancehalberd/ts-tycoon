export type Color = number | string;

export type Point = [number, number];

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
