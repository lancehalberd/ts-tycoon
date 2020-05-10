import * as _ from 'lodash';

import { Frame, FrameDimensions, FullRectangle, ShortRectangle } from 'app/types';

/**
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
export function copy<T>(object: T): T {
    if (typeof(object) === 'undefined' || object === null) {
        return null;
    }
    if (typeof(object) === 'string' || typeof(object) === 'number' || typeof(object) === 'boolean') {
        return object;
    }
    return _.cloneDeep(object);
}

export function shallowCopy<T>(object: T): T {
    if (typeof(object) === 'undefined' || object === null) {
        return null;
    }
    if (typeof(object) === 'string' || typeof(object) === 'number' || typeof(object) === 'boolean') {
        return object;
    }
    _.clone(object);
}

/**
 * Returns the angle from (x1, y1) to (x2,y2) which when given an image facing
 * right at angle 0, will point the image from x1,y1 towards x2,y2 when
 * context.rotate(angle) is used.
 *
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @return {Number}
 */
export function atan2(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 == x2) {
        return(y2 > y1) ? Math.PI / 2 : -Math.PI / 2;
    }
    return Math.atan((y2 - y1) / (x2 - x1)) + (x2 < x1 ? Math.PI : 0);
}

export function ifdefor<T>(value: T, defaultValue: T = null): T {
    if (value !== undefined && !(typeof value === 'number' && isNaN(value))) {
        return value;
    }
    return defaultValue;
}

export function now(): number {
    return Date.now();
}

export function isPointInRect(x: number, y: number, l: number, t: number, w: number, h: number): boolean {
    return !(y < t || y > (t + h) || x < l || x > (l + w));
}

export function isPointInShortRect(x: number, y: number, {x: l = 0, y: t = 0, w = 0, h = 0}: ShortRectangle): boolean {
    return !(y < t || y > t + h || x < l || x > l + w);
}

export function isPointInRectObject(x: number, y: number, rectangle: FullRectangle): boolean {
    if (!rectangle || ifdefor(rectangle.top) === null || ifdefor(rectangle.left) === null
         || ifdefor(rectangle.width) === null || ifdefor(rectangle.height) === null) {
        return false;
    }
    return !(y < rectangle.top || y > (rectangle.top + rectangle.height)
        || x < rectangle.left || x > (rectangle.left + rectangle.width));
}


export function rectanglesOverlap(A: FullRectangle, B: FullRectangle) {
    return !(A.bottom < B.top || A.top > B.bottom || A.right < B.left || A.left > B.right);
}

export function collision(element1: HTMLElement, element2: HTMLElement) {
    const { y: t, x: l, width: w, height: h } = element1.getBoundingClientRect();
    const b = t + h;
    const r = l + w;
    const { y: T, x: L, width: W, height: H } = element2.getBoundingClientRect();
    const B = T + H;
    const R = L + W;
    return !(B < t || T > b || R < l || L > r);
}

// returns the area overlap between two divs.
export function getCollisionArea(element1: HTMLElement, element2: HTMLElement) {
    const { y: t, x: l, width: w, height: h } = element1.getBoundingClientRect();
    const b = t + h;
    const r = l + w;
    const { y: T, x: L, width: W, height: H } = element2.getBoundingClientRect();
    const B = T + H;
    const R = L + W;
    return Math.max(Math.min(B - t, b - T), 0) * Math.max(Math.min(R - l, r - L), 0);
}

export function getElementRectangle(element: HTMLElement, container = null): ShortRectangle {
    let b = element.getBoundingClientRect();
    const rect = { x: b.left, y: b.top, w: b.width, h: b.height };
    // If container is specified, return the rectangle relative to the container's coordinates.
    if (container) {
        const containerRect = container.getBoundingClientRect();
        rect.x -= containerRect.left;
        rect.y -= containerRect.top;
    }
    return rect;
}

export function resize(element: HTMLElement, width: number, height: number, left: number = null, top: number = null) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    if (left !== null) element.style.left = `${left}px`;
    if (top !== null) element.style.top = `${top}px`;
}

export function constrain(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
export function fillRectangle(context: CanvasRenderingContext2D, rectangle: FullRectangle, color: string = null) {
    if (color) {
        context.fillStyle = color;
    }
    context.fillRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
}
export function fillRect(context: CanvasRenderingContext2D, {x, y, w, h}: ShortRectangle, color: string = null) {
    if (color) {
        context.fillStyle = color;
    }
    context.fillRect(x, y, w, h);
}
export function drawRectangle(context: CanvasRenderingContext2D, rectangle: FullRectangle) {
    context.rect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
}
export function drawRect(context: CanvasRenderingContext2D, {x, y, w, h}: ShortRectangle) {
    context.rect(x, y, w, h);
}
export function rectangle(left: number, top: number, width: number, height: number): FullRectangle {
    return {left: left, top: top, width: width, height: height, right: left + width, bottom: top + height};
}
export function r(x: number, y: number, w: number, h: number): ShortRectangle {
    return {x, y, w, h};
}
export function d(w: number, h: number): FrameDimensions {
    return {w, h};
}
export function toR(r: FullRectangle) {
    return {x: r.left, y: r.top, w: r.width, h: r.height};
}
export function shrinkRectangle(rectangle: FullRectangle, margin: number): FullRectangle {
    return {'left': rectangle.left + margin, 'width': rectangle.width - 2 * margin,
            'top': rectangle.top + margin, 'height': rectangle.height - 2 * margin};
}
export function pad({x, y, w, h}: ShortRectangle, m: number): ShortRectangle {
    return {x: x - m, w: w + 2 * m, y: y - m, h: h + 2 * m};
}
export function rectangleCenter(rectangle: FullRectangle): [number, number] {
    return [rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2];
}
export function rectangleFromPoints(A: {x: number, y: number}, B: {x: number, y: number}): FullRectangle {
    var left = Math.min(A.x, B.x);
    var top = Math.min(A.y, B.y);
    return rectangle(left, top, Math.abs(A.x - B.x), Math.abs(A.y - B.y));
}

export function drawRunningAnts(context: CanvasRenderingContext2D, rectangle: FullRectangle) {
    context.save();
    context.strokeStyle = 'black';
    var frame = Math.floor(now() / 80) % 10;
    if (frame < 5) {
        context.setLineDash([frame, 5, 5 - frame, 0]);
    } else {
        context.setLineDash([0, frame - 5, 5, 10 - frame]);
    }
    context.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
    context.strokeStyle = 'white';
    frame = (frame + 5) % 10;
    if (frame < 5) {
        context.setLineDash([frame, 5, 5 - frame, 0]);
    } else {
        context.setLineDash([0, frame - 5, 5, 10 - frame]);
    }
    context.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
    context.restore();
}

export function objectIndexOf(object: Object, value: any, defaultValue: string = null): string {
    for (const key of Object.keys(object)) {
        if (object[key] === value) {
            return key;
        }
    }
    return defaultValue;
}

export function arrMod<T>(array: T[], index: number): T {
    return array[(index % array.length + array.length) % array.length];
}

export function fixFloat(f: number): number {
    return Math.round(1000000 * f) / 1000000;
}

export function removeElementFromArray<T>(array: T[], element: T, throwErrorIfMissing = false): T {
    const index = array.indexOf(element);
    if (index < 0) {
        if (throwErrorIfMissing) throw new Error("Element was not found to remove from array.");
        return;
    }
    return array.splice(index, 1)[0];
}
export function countInstancesOfElementInArray<T>(array: T[], element: T): number {
    let count = 0;
    for (const arrayElement of array) {
        if (arrayElement === element) count++;
    }
    return count;
}

// Return the minimum angle between two angles, specified in degrees.
export function getThetaDistance(angle1: number, angle2: number): number {
    const diff = Math.abs(angle1 - angle2) % 360;
    return Math.min(diff, 360 - diff);
}

export function saveToFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    // This might prevent leaking memory.
    URL.revokeObjectURL(a.href);
}

export function readFromFile(): Promise<string> {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = 'file';
        input.click();
        input.onchange = function () {
            console.log('on change');
            console.log(input.files);
            if (!input.files[0]) {
                return;
            }
            const reader = new FileReader();
            reader.readAsText(input.files[0], "UTF-8");
            reader.onload = function (event) {
                console.log('Loaded file contents');
                resolve('' + event.target.result);
            }
            reader.onerror = function (event) {
                console.log(event);
                reject("error reading file");
                debugger;
            }
        };
    });
}
