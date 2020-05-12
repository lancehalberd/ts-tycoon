import { BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isPointInShortRect } from 'app/utils/index';

import {
    Area, AreaEntity, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    Frame, LocationDefinition, ShortRectangle,
} from 'app/types';

export function getAreaObjectTargetFromDefinition(object: AreaObject, content: ShortRectangle, definition: AreaObjectDefinition): AreaObjectTarget {
    const area: Area = object.area;
    let scale = definition.scale || 1;
    let w = content.w * scale;
    let h = content.h * scale;
    let d = (typeof(content.d) === 'undefined' ? content.w : content.d) * scale;
    return {
        targetType: 'object',
        object,
        area,
        ...getPositionFromLocationDefinition(area, {w, h, d}, definition),
        w, h, d,
    };
}

interface Dimensions {
    w: number,
    h: number,
    d: number,
}

export function getPositionFromLocationDefinition(area: Area, {w, h, d}: Dimensions, definition: LocationDefinition): {x: number, y: number, z: number} {
    let parentTarget: AreaEntity;
    if (definition.parentKey) {
        const parentObject: AreaObject = area.objectsByKey[definition.parentKey];
        if (!parentObject) {
            console.log('Could not find object with key', definition.parentKey);
            debugger;
        } else {
            parentTarget = parentObject.getAreaTarget();
        }
    } else {
        parentTarget = {
            area,
            w: area.width, h: BACKGROUND_HEIGHT, d: MAX_Z - MIN_Z,
            x: area.width / 2, y: 0, z: 0,
        };
    }
    let baseX, baseY, baseZ;
    // Align the right edge of this object with the right edge of the parent
    if (definition.xAlign === 'right') baseX = parentTarget.x + parentTarget.w / 2 - w / 2;
    // Align the middle of this object with the middle of the parent
    else if (definition.xAlign === 'middle') baseX = parentTarget.x;
    // Align the left edge of this object with the left edge of the parent
    else baseX = parentTarget.x - parentTarget.w / 2 + w / 2;

    // Align the top of this object with the top of the parent
    if (definition.yAlign === 'top') baseY = parentTarget.y + parentTarget.h - h;
    // Align the middle of this object with the middle of the parent
    else if (definition.yAlign === 'middle') baseY = parentTarget.y + parentTarget.h / 2 - h / 2;
    // Align the base edge of this object with the base of the parent
    else baseY = parentTarget.y;

    // Align the front of this object with the front of the parent
    if (definition.zAlign === 'front') baseZ = parentTarget.z - parentTarget.d / 2 + d / 2;
    // Align the back of this object with the back of the parent
    else if (definition.zAlign === 'back') baseZ = parentTarget.z + parentTarget.d / 2 - d / 2;
    // Align the middle of this object with the middle of the parent
    else baseZ = parentTarget.z;

    return {
        x: baseX + (definition.x || 0),
        y: baseY + (definition.y || 0),
        z: baseZ + (definition.z || 0),
    }
}

export function areaTargetToScreenTarget(target: AreaEntity): ShortRectangle {
    return {
        x: Math.round(target.x - target.area.cameraX - target.w / 2),
        y: Math.round(GROUND_Y - target.y - target.z / 2 - target.h + target.d / 4),
        w: Math.round(target.w),
        h: Math.round(target.h),
        d: Math.round(target.d),
    };
}

export function isPointOverAreaTarget(target: AreaEntity, x: number, y: number): boolean {
    return isPointInShortRect(x, y, areaTargetToScreenTarget(target));
}

type DrawFrameFunction = (context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle) => void;

export function drawFrameToAreaTarget(
    this: void,
    context: CanvasRenderingContext2D,
    target: AreaEntity,
    frame: Frame,
    draw: DrawFrameFunction,
    drawGuides: boolean = false,
): void {
    const content = frame.content || {...frame, x: 0, y: 0};

    const xScale = target.w / content.w;
    const yScale = target.h / content.h;

    // Calculate the left/top values from x/y/z coords, which drawImage will use.
    const left = Math.round(target.x - target.w / 2 - content.x * xScale - target.area.cameraX);
    const top = Math.round(GROUND_Y - target.y - target.h - target.z / 2 - content.y * yScale + target.d / 4);
    context.save();
    // If the object is flipped, flip it about the center of the content, which will keep
    // the content centered at its location.
    if (frame.flipped) {
        context.translate(Math.round(left + content.x * xScale + target.w / 2), 0);
        context.scale(-1, 1);
        context.translate(Math.round(-left - content.x * xScale - target.w / 2), 0);
    }
    draw(context, frame, {...frame, x: left, y: top, w: Math.round(frame.w * xScale), h: Math.round(frame.h * yScale)});
    if (drawGuides) {
        context.globalAlpha = 0.2;
        // Where the frame is drawn
        context.fillStyle = 'blue';
        context.fillRect(left,
            top,
            Math.round(frame.w * xScale),
            Math.round(frame.h * yScale),
        );
        // Content rectangle based on where the frame is drawn
        context.fillStyle = 'green';
        context.fillRect(
            left + Math.round(content.x * xScale),
            top + Math.round(content.y * yScale),
            target.w,
            target.h,
        );
        // Content rectangle as defined in the areaTarget (should match above content rectangle)
        context.fillStyle = 'red';
        context.fillRect(Math.round(target.x - target.area.cameraX - target.w / 2),
            // target.d / 4 because it is offset by half the depth and the z-coord is divided by 2 again.
            Math.round(GROUND_Y - target.y - target.z / 2 - target.h + target.d / 4),
            target.w,
            target.h,
        );
    }
    context.restore();
}

