import { BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isPointInShortRect } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    Frame, ShortRectangle,
} from 'app/types';

export function getAreaObjectTargetFromDefinition(object: AreaObject, content: ShortRectangle, definition: AreaObjectDefinition): AreaObjectTarget {
    const area: Area = object.area;
    let parentTarget: Partial<AreaObjectTarget> & {d?: number};
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
            w: area.width, h: BACKGROUND_HEIGHT, d: MAX_Z - MIN_Z,
            x: area.width / 2, y: 0, z: 0,
        };
    }
    let baseX, baseY, baseZ;
    // Align the right edge of this object with the right edge of the parent
    if (definition.xAlign === 'right') baseX = parentTarget.x + parentTarget.w / 2 - content.w / 2;
    // Align the middle of this object with the middle of the parent
    else if (definition.xAlign === 'middle') baseX = parentTarget.x;
    // Align the left edge of this object with the left edge of the parent
    else baseX = parentTarget.x - parentTarget.w / 2 + content.w / 2;

    // Align the top of this object with the top of the parent
    if (definition.yAlign === 'top') baseY = parentTarget.y + parentTarget.h - content.h;
    // Align the middle of this object with the middle of the parent
    else if (definition.yAlign === 'middle') baseY = parentTarget.y + parentTarget.h / 2 - content.h / 2;
    // Align the base edge of this object with the base of the parent
    else baseY = parentTarget.y;

    // Use content.d as the depth of the object and default back to content.w if it isn't set.
    const depth = typeof(content.d) === 'undefined' ? content.w : content.d
    // Align the front of this object with the front of the parent
    if (definition.zAlign === 'front') baseZ = parentTarget.z - parentTarget.d / 2 + depth / 2;
    // Align the back of this object with the back of the parent
    else if (definition.zAlign === 'back') baseZ = parentTarget.z + parentTarget.d / 2 - depth / 2;
    // Align the middle of this object with the middle of the parent
    else baseZ = parentTarget.z;

    return {
        targetType: 'object',
        object,
        area,
        x: baseX + (definition.x || 0),
        y: baseY + (definition.y || 0),
        z: baseZ + (definition.z || 0),
        w: content.w,
        h: content.h,
        d: depth,
    };
}

export function areaTargetToScreenTarget(target: AreaObjectTarget): ShortRectangle {
    return {
        x: target.x - target.area.cameraX - target.w / 2,
        y: GROUND_Y - target.y - target.z / 2 - target.h + target.d / 4,
        w: target.w,
        h: target.h,
    };
}

export function isPointOverAreaTarget(target: AreaObjectTarget, x: number, y: number): boolean {
    return isPointInShortRect(x, y, areaTargetToScreenTarget(target));
}

type DrawFrameFunction = (context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle) => void;

export function drawFrameToAreaTarget(
    this: void,
    context: CanvasRenderingContext2D,
    target: AreaObjectTarget,
    frame: Frame,
    draw: DrawFrameFunction,
    drawGuides: boolean = true,
): void {
    const content = frame.content || {...frame, x: 0, y: 0};

    // Calculate the left/top values from x/y/z coords, which drawImage will use.
    const left = target.x - content.w / 2 - content.x - target.area.cameraX;
    const top = GROUND_Y - target.y - content.h - target.z / 2 - content.y + target.d / 4;
    context.save();
    // If the object is flipped, flip it about the center of the content, which will keep
    // the content centered at its location.
    if (frame.flipped) {
        context.translate(left + content.x + content.w / 2, 0);
        context.scale(-1, 1);
        context.translate(-left - content.x - content.w / 2, 0);
    }
    draw(context, frame, {...frame, x: left, y: top});
    if (drawGuides) {
        context.globalAlpha = 0.2;
        // Where the frame is drawn
        context.fillStyle = 'blue';
        context.fillRect(left,
            top,
            frame.w,
            frame.h,
        );
        // Content rectangle based on where the frame is drawn
        context.fillStyle = 'green';
        context.fillRect(left + content.x,
            top + content.y,
            content.w,
            content.h,
        );
        // Content rectangle as defined in the areaTarget (should match above content rectangle)
        context.fillStyle = 'red';
        context.fillRect(target.x - target.area.cameraX - target.w / 2,
            // target.d / 4 because it is offset by half the depth and the z-coord is divided by 2 again.
            GROUND_Y - target.y - target.z / 2 - target.h + target.d / 4,
            target.w,
            target.h,
        );
    }
    context.restore();
}

