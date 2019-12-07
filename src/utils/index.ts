import * as _ from 'lodash';

/**
 * Makes a deep copy of an object. Note that this will not make deep copies of
 * objects with prototypes.
 */
export function copy(object) {
    if (typeof(object) === 'undefined' || object === null) {
        return null;
    }
    if (typeof(object) === 'string' || typeof(object) === 'number' || typeof(object) === 'boolean') {
        return object;
    }
    return _.cloneDeep(object);
}

export function shallowCopy(object) {
    if (typeof(object) === 'undefined' || object === null) {
        return null;
    }
    if (typeof(object) === 'string' || typeof(object) === 'number' || typeof(object) === 'boolean') {
        return object;
    }
    _.clone(object);
}

export function properCase(string) {
    return string.split(' ').map(function (word) {return word.charAt(0).toUpperCase() + word.substring(1)}).join(' ');
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
export function atan2(x1, y1, x2, y2) {
    if (x1 == x2) {
        return(y2 > y1) ? Math.PI / 2 : -Math.PI / 2;
    }
    return Math.atan((y2 - y1) / (x2 - x1)) + (x2 < x1 ? Math.PI : 0);
}

export function ifdefor(value, defaultValue = null) {
    if (value !== undefined && !(typeof value === 'number' && isNaN(value))) {
        return value;
    }
    return defaultValue;
}

export function now() {
    return Date.now();
}

export function isPointInRect(x, y, l, t, w, h) {
    return !(y < t || y > (t + h) || x < l || x > (l + w));
}

export function isPointInRectObject(x, y, rectangle) {
    if (!rectangle || ifdefor(rectangle.top) === null || ifdefor(rectangle.left) === null
         || ifdefor(rectangle.width) === null || ifdefor(rectangle.height) === null) {
        return false;
    }
    return !(y < rectangle.top || y > (rectangle.top + rectangle.height)
        || x < rectangle.left || x > (rectangle.left + rectangle.width));
}


export function rectanglesOverlap(A, B) {
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
export function getCollisionArea($div1, $div2) {
    var T = $div1.offset().top;
    var L = $div1.offset().left;
    var B = T + $div1.outerHeight(true);
    var R = L + $div1.outerWidth(true);
    var t = $div2.offset().top;
    var l = $div2.offset().left;
    var b = t + $div2.outerHeight(true);
    var r = l + $div2.outerWidth(true);
    return Math.max(Math.min(B - t, b - T), 0) * Math.max(Math.min(R - l, r - L), 0);
}

export function getElementRectangle(element, container = null) {
    const rect = {...element.getBoundingClientRect()};
    // If container is specified, return the rectangle relative to the container's coordinates.
    if (container) {
        const containerRect = container.getBoundingClientRect();
        rect.left -= containerRect.left;
        rect.top -= containerRect.top;
    }
    return rect;
}

export function resize(element, width, height, left = null, top = null) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    if (left !== null) element.style.left = `${left}px`;
    if (top !== null) element.style.top = `${top}px`;
}

export function constrain(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function fillRectangle(context, rectangle) {
    context.fillRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
}
export function drawRectangle(context, rectangle) {
    context.rect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
}
export function rectangle(left, top, width, height) {
    return {left: left, top: top, width: width, height: height, right: left + width, bottom: top + height};
}
export function shrinkRectangle(rectangle, margin) {
    return {'left': rectangle.left + margin, 'width': rectangle.width - 2 * margin,
            'top': rectangle.top + margin, 'height': rectangle.height - 2 * margin};
}
export function rectangleCenter(rectangle) {
    return [rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2];
}
export function rectangleFromPoints(A, B) {
    var left = Math.min(A.x, B.x);
    var top = Math.min(A.y, B.y);
    return rectangle(left, top, Math.abs(A.x - B.x), Math.abs(A.y - B.y));
}

export function drawRunningAnts(context, rectangle) {
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

export function objectIndexOf(object, value, defaultValue) {
    for (var key of Object.keys(object)) {
        if (object[key] === value) {
            return key;
        }
    }
    return ifdefor(defaultValue);
}

export function arrMod(array, index) {
    return array[(index % array.length + array.length) % array.length];
}

export function fixFloat(f) {
    return Math.round(1000000 * f) / 1000000;
}

export function removeElementFromArray(array, element, throwErrorIfMissing) {
    const index = array.indexOf(element);
    if (index < 0) {
        if (throwErrorIfMissing) throw new Error("Element was not found to remove from array.");
        return;
    }
    array.splice(index, 1);
}
export function countInstancesOfElementInArray(array, element) {
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