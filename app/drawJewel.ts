import { averagePoint, magnitude, normalize, vector } from 'app/utils/polygon';
export function drawJewel(context, shape, lightSource, borderColor = null, ambientLightLevel = 0.3, simple = false) {
    const points = shape.points;
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        context.lineTo(points[i][0], points[i][1]);
    }
    context.closePath();
    context.fillStyle = shape.color;
    if (borderColor !== null) {
        context.strokeStyle = borderColor;
        context.stroke();
    }
    context.fill();
    var innerPoints = [];
    context.beginPath();
    if (simple && points.length <= 3) {
        const center = averagePoint(points);
        for (let i = 0; i < points.length; i++) {
            const nextPoint = points[(i + 1) % points.length];
            context.beginPath();
            context.moveTo(points[i][0], points[i][1]);
            context.lineTo(center[0], center[1]);
            context.lineTo(nextPoint[0], nextPoint[1]);
            context.closePath();
            let distance = magnitude(vector(lightSource, averagePoint([points[i], center, nextPoint])));
            let ambientLight = Math.min(ambientLightLevel, Math.max(0, 1 - (distance * distance) / 2000));
            context.fillStyle = 'white';
            let lightVector = normalize(vector(lightSource, averagePoint([points[i], nextPoint])));
            let surfaceVector = normalize(vector(points[i], nextPoint));
            surfaceVector = [-surfaceVector[1], surfaceVector[0]];
            let intensity = (surfaceVector[0] * lightVector[0] +
                                    surfaceVector[1] * lightVector[1]) * .8;
            if (intensity < 0) {
                intensity = intensity / 4;
            }
            intensity = Math.min(1, intensity + ambientLight);
            if (intensity < 0) {
                context.fillStyle = 'black';
                intensity = -intensity;
            }
            context.save();
            context.globalAlpha *= intensity;
            context.fill();
            context.restore();
        }
        /*for (let i = 0; i < points.length; i++) {
            const lastPoint = points[(i + points.length - 1) % points.length];
            const nextPoint = points[(i + 1) % points.length];
            // This will be the inner point opposite points[i]
            const innerPoint = averagePoint([
                lastPoint, lastPoint, lastPoint, lastPoint, lastPoint, lastPoint,
                points[i],
                nextPoint, nextPoint, nextPoint, nextPoint, nextPoint, nextPoint,
            ]);
            innerPoints.push(innerPoint);
            context.beginPath();
            context.moveTo(nextPoint[0], nextPoint[1]);
            context.lineTo(innerPoint[0], innerPoint[1]);
            context.lineTo(lastPoint[0], lastPoint[1]);
            context.closePath();
            let distance = magnitude(vector(lightSource, averagePoint([nextPoint, innerPoint, lastPoint])));
            let ambientLight = Math.min(ambientLightLevel, Math.max(0, 1 - (distance * distance) / 2000));
            context.fillStyle = 'white';
            let lightVector = normalize(vector(lightSource, averagePoint([nextPoint, innerPoint])));
            let surfaceVector = normalize(vector(nextPoint, innerPoint));
            surfaceVector = [-surfaceVector[1], surfaceVector[0]];
            let intensity = (surfaceVector[0] * lightVector[0] +
                                    surfaceVector[1] * lightVector[1]) * .8;
            if (intensity < 0) {
                intensity = intensity / 4;
            }
            intensity = Math.min(1, intensity + ambientLight);
            if (intensity < 0) {
                context.fillStyle = 'black';
                intensity = -intensity;
            }
            context.save();
            context.globalAlpha *= intensity;
            context.fill();
            context.restore();

            const nextInnerPoint = averagePoint([
                points[i], points[i], points[i], points[i], points[i], points[i],
                nextPoint,
                lastPoint, lastPoint, lastPoint, lastPoint, lastPoint, lastPoint,
            ]);

            context.beginPath();
            context.moveTo(lastPoint[0], lastPoint[1]);
            context.lineTo(innerPoint[0], innerPoint[1]);
            context.lineTo(nextInnerPoint[0], nextInnerPoint[1]);
            context.closePath();
            distance = magnitude(vector(lightSource, averagePoint([lastPoint, innerPoint, nextInnerPoint])));
            ambientLight = Math.min(ambientLightLevel, Math.max(0, 1 - (distance * distance) / 2000));
            context.fillStyle = 'white';
            lightVector = normalize(vector(lightSource, averagePoint([innerPoint, nextInnerPoint])));
            surfaceVector = normalize(vector(innerPoint, nextInnerPoint));
            surfaceVector = [-surfaceVector[1], surfaceVector[0]];
            intensity = (surfaceVector[0] * lightVector[0] +
                                    surfaceVector[1] * lightVector[1]) * .8;
            if (intensity < 0) {
                intensity = intensity / 4;
            }
            intensity = Math.min(1, intensity + ambientLight);
            if (intensity < 0) {
                context.fillStyle = 'black';
                intensity = -intensity;
            }
            context.save();
            context.globalAlpha *= intensity;
            context.fill();
            context.restore();
        }*/
    } else {
        for (let i = 0; i < points.length; i++) {
            var lastPoint = points[(i + points.length - 1) % points.length];
            var nextPoint = points[(i + 1) % points.length];
            var nextNextPoint = points[(i + 2) % points.length];
            var pointA = averagePoint([lastPoint,lastPoint,lastPoint,
                points[i],points[i],points[i],points[i], nextPoint]);
            var pointB = averagePoint([nextPoint,nextPoint,nextPoint,
                points[i],points[i],points[i],points[i], lastPoint]);
            innerPoints.push(pointA);
            innerPoints.push(pointB);
            context.beginPath();
            context.moveTo(points[i][0], points[i][1]);
            context.lineTo(pointA[0], pointA[1]);
            context.lineTo(pointB[0], pointB[1]);
            context.closePath();
            var distance = magnitude(vector(lightSource, averagePoint([points[i], pointA, pointB])));
            var ambientLight = Math.min(ambientLightLevel, Math.max(0, 1 - (distance * distance) / 2000));
            context.fillStyle = 'white';
            var lightVector = normalize(vector(lightSource, averagePoint([pointA, pointB])));
            var surfaceVector = normalize(vector(pointA, pointB));
            surfaceVector = [-surfaceVector[1], surfaceVector[0]];
            var intensity = (surfaceVector[0] * lightVector[0] +
                                    surfaceVector[1] * lightVector[1]) * .8;
            if (intensity < 0) {
                intensity = intensity / 4;
            }
            intensity = Math.min(1, intensity + ambientLight);
            if (intensity < 0) {
                context.fillStyle = 'black';
                intensity = -intensity;
            }
            context.save();
            context.globalAlpha *= intensity;
            context.fill();
            context.restore();
            pointA = pointB;
            pointB = averagePoint([points[i], points[i], points[i], nextPoint, nextPoint, nextPoint, nextPoint, nextNextPoint]);
            lightVector = normalize(vector(lightSource, averagePoint([pointA, pointB])));
            context.beginPath();
            context.moveTo(points[i][0], points[i][1]);
            context.lineTo(nextPoint[0], nextPoint[1]);
            context.lineTo(pointB[0], pointB[1]);
            context.lineTo(pointA[0], pointA[1]);
            context.closePath();
            distance = magnitude(vector(lightSource, averagePoint([points[i], nextPoint, pointA, pointB])));
            ambientLight = Math.min(ambientLightLevel, Math.max(0, 1 - (distance * distance) / 2000));
            context.fillStyle = 'white';
            surfaceVector = normalize(vector(pointA, pointB));
            surfaceVector = [-surfaceVector[1], surfaceVector[0]];
            intensity = (surfaceVector[0] * lightVector[0] +
                                    surfaceVector[1] * lightVector[1]) * .8;
            if (intensity < 0) {
                intensity = intensity / 4;
            }
            intensity = Math.min(1, intensity + ambientLight);
            if (intensity < 0) {
                context.fillStyle = 'black';
                intensity = -intensity;
            }
            context.save();
            context.globalAlpha *= intensity;
            context.fill();
            context.restore();

        }
    }
    if (innerPoints.length > 2) {
        context.beginPath();
        context.moveTo(innerPoints[0][0], innerPoints[0][1]);
        for (var i = 1; i < innerPoints.length; i++) {
            context.lineTo(innerPoints[i][0], innerPoints[i][1]);
        }
        context.closePath();
        context.fillStyle = 'white';
        var distance = magnitude(vector(lightSource, averagePoint(points)));
        context.save();
        context.globalAlpha *= Math.min(.6, Math.max(.3, 1 - (distance * distance - 20) / 1000));
        context.fill();
        context.restore();
    }
}