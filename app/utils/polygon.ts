import { Color, Point, ShapeType } from 'app/types';
import { arrMod } from 'app/utils/index';

export const tolerance = .000001;

export class Polygon {
    points: Array<Point>;
    color: Color;
    angles: Array<number>;
    lengths: Array<number>;
    center: Point;
    _scale: number;
    currentAngle: number;
    key: ShapeType;

    constructor(x, y, angle, color, scale = 1) {
        this.points = [[x, y]];
        this.color = color;
        this.angles = [angle];
        this.lengths = [];
        this.center = [0, 0];
        this._scale = scale;
        this.currentAngle = angle;
    }

    addVertex(length, nextAngle) {
        this.angles.push(nextAngle);
        this.lengths.push(length);
        const lastPoint = this.points[this.points.length - 1];
        const theta = this.currentAngle * Math.PI / 180;
        this.points.push([
            lastPoint[0] + Math.cos(theta) * length * this._scale,
            lastPoint[1] + Math.sin(theta) * length * this._scale
        ]);
        this.currentAngle += (180 - nextAngle);
        return this;
    };
    updateCenter() {
        this.center = averagePoint(this.points);
        return this;
    }
    addVertices(angles: Array<number>) {
        for (let i = 0; i < angles.length; i++) {
            this.addVertex(1, angles[i]);
        }
        return this.updateCenter();
    }
    addVerticesAndLengths(lengths: Array<number>, angles: Array<number>) {
        for (let i = 0; i < angles.length && i < lengths.length; i++) {
            this.addVertex(lengths[i], angles[i]);
        }
        return this.updateCenter();
    }
    resetPoints() {
        this.points = [this.points[0]];
        this.currentAngle = this.angles[0];
        const otherAngles = this.angles;
        const lengths = this.lengths;
        otherAngles.shift();
        this.angles = [this.currentAngle];
        this.lengths = [];
        this.addVerticesAndLengths(lengths, otherAngles);
        return this.updateCenter();
    }
    clone() {
        const angles = [...this.angles];
        const clone = new Polygon(this.points[0][0], this.points[0][1], angles.shift(), this.color, this._scale);
        return clone.addVerticesAndLengths([...this.lengths], angles);
    }
    setPosition(x, y) {
        return this.translate(x - this.points[0][0], y - this.points[0][1]);
    }
    setCenterPosition(x, y) {
        return this.translate(x - this.center[0], y - this.center[1]);
    }
    translate(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] += x;
            this.points[i][1] += y;
        }
        this.center[0] += x;
        this.center[1] += y;
        return this;
    }
    scale(scale) {
        this._scale *= scale;
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][0] *= scale;
            this.points[i][1] *= scale;
        }
        this.center[0] *= scale;
        this.center[1] *= scale;
        return this;
    };
    setRotation(degrees) {
        this.angles[0] = degrees;
        return this.resetPoints();
    }
    rotate(degrees) {
        const radians = degrees * Math.PI / 180;
        for (let i = 0; i < this.points.length; i++) {
            this.points[i] = rotatePoint(this.points[i], this.center, radians);
        }
        this.angles[0] += degrees;
        return self;
    };
}

export function allPoints(shapes: Array<Polygon>) {
    let points = [];
    for (let i = 0; i < shapes.length; i++) {
        points = points.concat(shapes[i].points);
    }
    return points;
}

export function isPointInPoints(point: Point, points: Point[]): boolean {
    for (var i = 0; i < points.length; i++) {
        var A = [point[0] - points[i][0], point[1] - points[i][1]];
        if (A[0] * A[0] + A[1] * A[1] < tolerance) {
            return true;
        }
        var B = [points[(i + 1) % points.length][0] - point[0], points[(i + 1) % points.length][1] - point[1]];
        if (A[0] * B[1] - A[1] * B[0] > tolerance) {
            return false;
        }
    }
    return true;
}

// Definitions for each shape start at each distinct orientation. These are defined
// such that you can give the original point and direction and then pass in the edge
// lengths and angles so that the angle of the given size will appear at the original
// point. This is useful if you are trying to put a shape in a place to fill 60 degrees
// as you can choose any definition that starts with a 60 degree angle.
// Overall, it seems like an ugly solution that should be cleaned up at some point.
type ShapeArrayDefinition = [number[], number[], Color, number, number];
export interface ShapeDefinition {
    key: ShapeType,
    lengths: number[],
    angles: number[],
    color: Color,
    angle: number,
    area: number,
}
// This is [lengths, angles, color, initialAngle, area]
const triangleShape:ShapeArrayDefinition = [[1, 1], [60, 60], '#008800', 60, Math.sqrt(3) / 4];
const hexagonShape:ShapeArrayDefinition = [[1, 1, 1, 1, 1], [120, 120, 120, 120, 120],'#ffbb22', 120, 6 * Math.sqrt(3) / 4];
const squareShape:ShapeArrayDefinition = [[1, 1, 1], [90, 90, 90],'#ee7700', 90, 1];
const diamondShape60:ShapeArrayDefinition = [[1, 1, 1], [120, 60, 120],'#0000ff', 60, Math.sqrt(3) / 2];
const diamondShape120:ShapeArrayDefinition = [[1, 1, 1], [60, 120, 60],'#0000ff', 120, Math.sqrt(3) / 2];
const rhombusShape30:ShapeArrayDefinition = [[1, 1, 1], [150, 30, 150],'#ffcccc', 30, .5];
const rhombusShape150:ShapeArrayDefinition = [[1, 1, 1], [30, 150, 30],'#ffcccc', 150, .5];
const trapezoidShape60A:ShapeArrayDefinition = [[2, 1, 1], [60, 120, 120],'#ff0000', 60, 3 * Math.sqrt(3) / 4];
const trapezoidShape60B:ShapeArrayDefinition = [[1, 1, 1], [120, 120, 60],'#ff0000', 60, 3 * Math.sqrt(3) / 4];
const trapezoidShape120A:ShapeArrayDefinition = [[1, 1, 2], [120, 60, 60],'#ff0000', 120, 3 * Math.sqrt(3) / 4];
const trapezoidShape120B:ShapeArrayDefinition = [[1, 2, 1], [60, 60, 120],'#ff0000', 120, 3 * Math.sqrt(3) / 4];

const shapeArrayDefinitions: {[type in ShapeType]: ShapeArrayDefinition[]} = {
    'triangle': [triangleShape],
    'square': [squareShape],
    'hexagon': [hexagonShape],
    'diamond': [diamondShape120, diamondShape60],
    'rhombus': [rhombusShape150, rhombusShape30],
    'trapezoid': [trapezoidShape120A, trapezoidShape120B, trapezoidShape60A, trapezoidShape60B],
};
export const shapeDefinitions: Partial<{[type in ShapeType]: ShapeDefinition[]}> = {};
for (let index in shapeArrayDefinitions) {
    const key: ShapeType = index as ShapeType;
    shapeDefinitions[key] = [];
    const shapeArrays = shapeArrayDefinitions[key];
    for (let i = 0; i < shapeArrays.length; i++) {
        const [lengths, angles, color, angle, area] = shapeArrays[i];
        shapeDefinitions[key][i] = { key, lengths, angles, color, angle, area };
    }
}

/**
 * Creates a shape at the given location and angle from the shape definition.
 */
export function makeShape(
    x: number, y: number, angleInDegrees: number,
    shapeDefinition: ShapeDefinition, scale = 1
): Polygon {
    const shape = new Polygon(x, y, angleInDegrees, shapeDefinition.color, scale)
        .addVerticesAndLengths(shapeDefinition.lengths, shapeDefinition.angles);
    shape.key = shapeDefinition.key;
    return shape;
}

export function checkForCollision(shapesA, shapesB) {
    for (var i = 0; i < shapesA.length; i++) {
        for (var j = 0; j < shapesB.length; j++) {
            if (doShapesIntersect(shapesA[i], shapesB[j])) {
                return true;
            }
        }
    }
    return false;
}
function doShapesIntersect(shapeA, shapeB) {
    for (var i = 0; i < shapeA.points.length; i++) {
        if (isSeparatingLine(shapeA, shapeB, vector(shapeA.points[i], shapeA.points[(i+1) % shapeA.points.length]))) {
            return false;
        }
    }
    for (var i = 0; i < shapeB.points.length; i++) {
        if (isSeparatingLine(shapeA, shapeB, vector(shapeB.points[i], shapeB.points[(i+1) % shapeB.points.length]))) {
            return false;
        }
    }
    return true;
}
function isSeparatingLine(shapeA, shapeB, vector) {
    vector = [-vector[1], vector[0]];
    var minA = 1000000, minB = 1000000, maxA = -1000000, maxB = -1000000;
    for (var i = 0; i < shapeA.points.length; i++) {
        var projection = vector[0] * shapeA.points[i][0] + vector[1] * shapeA.points[i][1];
        minA = Math.min(minA, projection);
        maxA = Math.max(maxA, projection);
    }
    for (var i = 0; i < shapeB.points.length; i++) {
        var projection = vector[0] * shapeB.points[i][0] + vector[1] * shapeB.points[i][1];
        minB = Math.min(minB, projection);
        maxB = Math.max(maxB, projection);
    }
    return maxB < minA + tolerance || maxA < minB + tolerance;
}
export function translateShapes(shapes: Array<Polygon>, vector: Point): void {
    shapes.forEach(shape => shape.translate(vector[0], vector[1]));
}
export function rotateShapes(shapes: Array<Polygon>, center: Point, radians: number): void {
    const cos = Math.cos(radians), sin = Math.sin(radians);
    shapes.forEach(shape => {
        shape.points[0] = [shape.points[0][0] - center[0], shape.points[0][1] - center[1]];
        shape.points[0] = [shape.points[0][0] * cos - shape.points[0][1] * sin,
                           shape.points[0][0] * sin + shape.points[0][1] * cos];
        shape.points[0] = [shape.points[0][0] + center[0], shape.points[0][1] + center[1]];
        shape.angles[0] += Math.round(radians * 180 / Math.PI);
        shape.resetPoints();
    });
}
export function rotatePoint(point: Point, center: Point, radians: number): Point {
    const cos = Math.cos(radians), sin = Math.sin(radians);
    point = [point[0] - center[0], point[1] - center[1]];
    point = [point[0] * cos - point[1] * sin, point[0] * sin + point[1] * cos];
    return [point[0] + center[0], point[1] + center[1]];
}

export function distanceSquared(p1: Point, p2: Point): number {
    return (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]);
}
export function vector(p1: Point, p2: Point): Point {
    return [p2[0] - p1[0], p2[1] - p1[1]];
}
export function dot2d(v1: Point, v2: Point): number {
    return v1[0] * v2[0] + v1[1] * v2[1];
}
export function cross2d(v1: Point, v2: Point): number {
    return v1[0] * v2[1] - v1[1] * v2[0];
}
export function magnitude(vector: Point) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}
export function averagePoint(points: Array<Point>): Point {
    let x = 0, y = 0;
    points.forEach(point => { x += point[0]; y += point[1];});
    return [x / points.length, y / points.length];
}
export function normalize(vector: Point) {
    const mag = magnitude(vector);
    return [vector[0] / mag, vector[1] / mag];
}
export function getBounds(points: Array<Point>) {
    let left = points[0][0], top = points[0][1];
    let right = left, bottom = top;
    for (let i = 1; i < points.length; i++) {
        left = Math.min(left, points[i][0]);
        right = Math.max(right, points[i][0]);
        top = Math.min(top, points[i][1]);
        bottom = Math.max(bottom, points[i][1]);
    }
    return {left, top, width: right - left, height: bottom - top};
}
export function centerShapesInRectangle(shapes: Array<Polygon>, rectangle): void {
    const bounds = getBounds(allPoints(shapes));
    const targetLeft = rectangle.left + rectangle.width / 2 - bounds.width / 2;
    const targetTop = rectangle.top + rectangle.height / 2 - bounds.height / 2;
    translateShapes(shapes, [targetLeft - bounds.left, targetTop - bounds.top]);
}

export function getIntersectionArea(shapeA: Polygon, shapeB: Polygon): number {
    //console.log('intersection');
    try {
        //console.log(JSON.stringify(shapeA.points));
        //console.log(JSON.stringify(shapeB.points));
        if (!checkForCollision([shapeA], [shapeB])) {
            //console.log('No collision');
            return 0;
        }
        var intersection = {points: computeIntersection(shapeA, shapeB)};
        //console.log(JSON.stringify(intersection));
        return computeArea(intersection);
    } catch (e) {
        console.log('Failed to get intersection area: ' + e.message);
        return 0;
    }
}

function computeIntersection(shapeA: Polygon, shapeB: Polygon) {
    // Derived from https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
    var outputPoints = shapeA.points;
    for (var i = 0; i < shapeB.points.length; i++) {
        var p1 = shapeB.points[i];
        var p2 = arrMod(shapeB.points, i + 1);
        var inputPoints = outputPoints;
        outputPoints = [];
        var previousPoint = arrMod(inputPoints, - 1);
        for (var j = 0; j < inputPoints.length; j++) {
            var point = inputPoints[j];
            if (isPointRightOfEdge(point, p1, p2)) {
                if (!isPointRightOfEdge(previousPoint, p1, p2)) {
                    //console.log([previousPoint, point, p1, p2]);
                    outputPoints.push(computeLineIntersection(previousPoint, point, p1, p2));
                }
                outputPoints.push(point);
            } else if (isPointRightOfEdge(previousPoint, p1, p2)) {
                //console.log([previousPoint, point, p1, p2]);
                outputPoints.push(computeLineIntersection(previousPoint, point, p1, p2));
            }
            previousPoint = point;
        }
    }
    return outputPoints;
}
// Derived from http://www.mathwords.com/a/area_convex_polygon.htm
export function computeArea(shape) {
    var area = 0;
    for (var i = 0; i < shape.points.length; i++) {
        var nextPoint = arrMod(shape.points, i + 1);
        area += shape.points[i][0] * nextPoint[1] - shape.points[i][1] * nextPoint[0];
    }
    return area / 2;
}
//console.log(computeArea({points: [[0, 0],[0, 2],[2, 2],[2, 0]]}));
//var points = computeIntersection({points: [[-1, -1],[-1, 1],[.5, 1],[1, .5],[1, -1]]},
//                    {points: [[0, 0],[0, 2],[2, 2],[2, 0]]})
//console.log(computeArea({points: points}));
//console.log(JSON.stringify(computeIntersection({points: [[-1, -1],[1, -1],[1, 1],[-1, 1]]},
//                    {points: [[-1, -1],[1, -1],[1, 1],[-1, 1]]})));
//console.log(isPointRightOfEdge([0,0], [-1, 0], [0, 1]));
//console.log(JSON.stringify(computeIntersection({points: [[-1, -1],[1, -1],[1, 1],[-1, 1]]},
//                    {points: [[0, 0],[2, 0],[2, 2],[0, 2]]})));
//console.log(JSON.stringify(computeIntersection({points: [[-1, -1],[1, -1],[1, 1],[-1, 1]]},
//                    {points: [[-1, -1],[2, -1],[2, 2],[-1, 2]]})));
//console.log(JSON.stringify(computeIntersection({points: [[-1, -1],[-1, 1],[.5, 1],[1, .5],[1, -1]]},
//                    {points: [[0, 0],[0, 2],[2, 2],[2, 0]]})));
//console.log(JSON.stringify(computeIntersection({points: [[-1, -1],[-1, 1],[1, 1],[1, -1]]},
//                    {points: [[1, 1],[1, 2],[2, 2],[2, 1]]})));
// derived from http://jsfiddle.net/justin_c_rounds/Gd2S2/
function computeLineIntersection(p1: Point, p2: Point, q1: Point, q2: Point): Point {
    const dx1 = p2[0] - p1[0];
    const dy1 = p2[1] - p1[1];
    const dx2 = q2[0] - q1[0];
    const dy2 = q2[1] - q1[1];
    const denominator = dy2 * dx1 - dx2 * dy1;
    if (denominator == 0) {
        throw new Error('Lines do not intersect: '+ JSON.stringify([p1, p2, q1, q2]));
    }
    const a = (dx2 * (p1[1] - q1[1]) - dy2 * (p1[0] - q1[0])) / denominator;
    return [p1[0] + a * dx1, p1[1] + a * dy1];
};
//console.log(computeLineIntersection([0,0],[2,2],[0,0],[1,0]).join(','));
function isPointRightOfEdge(point: Point, p1: Point, p2: Point): boolean {
    const A = [point[0] - p1[0], point[1] - p1[1]];
    /*if (A[0] * A[0] + A[1] * A[1] < tolerance) {
        return false;
    }*/
    const B = [p2[0] - point[0], p2[1] - point[1]];
    if (A[0] * B[1] - A[1] * B[0] > 0) {
        return false;
    }
    return true;
}