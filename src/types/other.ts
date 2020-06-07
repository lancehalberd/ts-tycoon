import { JobIcon } from 'app/content/jobs';

export type Color = string;

export type Point = [number, number];
export type Range = [number, number];

export type Tags = {[key: string]: true};

export interface Renderable {
    render(context: CanvasRenderingContext2D, target: ShortRectangle): void
}

export type GameContext = 'cutscene' | 'field' | 'item' | 'jewel' | 'map';

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
    // This is a bit of a hack but it is a simple way of allowing me to
    // associate a depth value for an image.
    d?: number,
}
export interface FrameDimensions {
    w: number,
    h: number,
    // This is a bit of a hack but it is a simple way of allowing me to
    // associate a depth value for an image.
    d?: number,
    content?: ShortRectangle,
}
export interface FrameRectangle extends ShortRectangle {
    // When a frame does not perfectly fit the size of the content, this content rectangle can be
    // set to specify the portion of the image that is functionally part of the object in the frame.
    // For example, a character with a long time may have the content around the character's body and
    // exclude the tail when looking at the width/height of the character.
    content?: ShortRectangle,
}
export type Rectangle = FullRectangle | ShortRectangle;

export interface Frame extends FrameRectangle {
    image: HTMLCanvasElement | HTMLImageElement,
    // Additional property that may be used in some cases to indicate a frame should be flipped
    // horizontally about the center of its content. Only some contexts respect this.
    flipped?: boolean,
}

export interface TintedFrame extends Frame {
    color: string,
    // Can be used for partial tints.
    amount?: number,
    image: HTMLCanvasElement | HTMLImageElement,
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

export interface TextPopup {
    value?: string | number,
    fontSize?: number,
    x: number, y: number, z: number,
    vx: number, vy: number,
    color: Color,
    duration?: number,
    gravity?: number,
}

export type PointsType = 'anima' | 'coins' | 'divinity' | 'fame';
// Cost is an amount of coins or a map of points types to amounts.
export type Cost = number | {[key in PointsType]?: number};

export interface HUDElement extends ShortRectangle {
    isPointOver: (x: number, y: number) => boolean,
    helpMethod?: () => string,
    onClick?: () => void,
}

export interface MenuOption {
    // getLabel will be used instead of label if defined.
    getLabel?: () => string,
    label?: string,
    onSelect?: () => void,
    getChildren?: () => MenuOption[],
}

export interface EditorProperty<T> {
    name: string,
    // A button property will have no value.
    value?: T,
    // If the property is an enum, you can set the list of all values.
    values?: T[],
    // If the property is editable, you can specify what happens when it is changed.
    onChange?: (newValue: T) => (T | void),
    // For buttons, use instead of onChange.
    onClick?: () => void,
}
export type PropertyRow = (EditorProperty<string | number> | string)[];
