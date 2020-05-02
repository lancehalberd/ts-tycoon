import _ from 'lodash';
import { areaDefinitions } from 'app/content/areaDefinitions';
import { areaTargetToScreenTarget, areaWalls } from 'app/content/areas';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getState } from 'app/state';
import { getMousePosition } from 'app/utils/mouse';


import {
    Area, AreaObject,
} from 'app/types';

interface EditingAreaState {
    isEditing: boolean,
    selectedObject: AreaObject,
    // This will override the cameraX for the area.
    cameraX: number,
}
export const editingAreaState: EditingAreaState = {
    isEditing: false,
    selectedObject: null,
    cameraX: null,
}

export function handleEditAreaClick(x: number, y: number): void {
    //console.log('click', x, y);
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    editingAreaState.selectedObject = null;
    for (const object of area.objects) {
        if (object.isPointOver && object.isPointOver(x, y)) {
            if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                object.onInteract(hero);
                return;
            }
            editingAreaState.selectedObject = object;
            return;
        }
    }
    for (const object of area.wallDecorations) {
        if (object.isPointOver && object.isPointOver(x, y)) {
            if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                object.onInteract(hero);
                return;
            }
            editingAreaState.selectedObject = object;
            return;
        }
    }
}

export function handleEditMouseDragged(dx: number, dy: number): void {
    const { selectedObject } = editingAreaState;
    if (selectedObject && selectedObject.definition) {
        moveObject(selectedObject, dx, dy);
    }
}

function moveObject(object: AreaObject, dx: number, dy: number) {
    const area = getState().selectedCharacter.hero.area;
    let dz = 0;
    if (area.wallDecorations.includes(object)) {
        dy = -dy;
    } else {
        dz = -dy;
        dy = 0;
    }
    // Only objects with definitions can be moved and saved.
    if (!object.definition) {
        return;
    }
    object.definition.x = (object.definition.x || 0 ) + dx;
    object.definition.y = (object.definition.y || 0 ) + dy;
    object.definition.z = (object.definition.z || 0 ) + dz;
    // For items aligned to the area, add some common sense restrictions for positioning them.
    if (!object.definition.parentKey) {
        const target = object.getAreaTarget();
        const depth = target.d;
        if (object.definition.zAlign === 'back') {
            object.definition.z = Math.max(2 * MIN_Z + depth, Math.min(0, object.definition.z));
        } else if (object.definition.zAlign === 'front') {
            object.definition.z = Math.max(0, Math.min(2 * MAX_Z - depth, object.definition.z));
        } else {
            object.definition.z = Math.max(MIN_Z + depth / 2, Math.min(MAX_Z - depth / 2, object.definition.z));
        }
        if (object.definition.yAlign === 'middle') {
            // Not going to worry about these for now, they aren't used so far.
        } else if (object.definition.yAlign === 'top') {
            // Not going to worry about these for now, they aren't used so far.
        } else {
            // Don't let them move objects beneath the floor.
            object.definition.y = Math.max(0, object.definition.y);
        }
    }
    object.applyDefinition(object.definition);
}

export function handleEditAreaKeyDown(keyCode: number): boolean {
    const { isEditing, selectedObject } = editingAreaState;
    if (!isEditing) {
        return false;
    }
    // Output the code for the current area to the console/clipboard.
    if (keyCode === KEY.C) {
        const area = getState().selectedCharacter.hero.area;
        // Add custom serialization code here that is more concise than JSON.
        console.log(JSON.stringify(areaDefinitions, null, 4));
    }
    const area = getState().selectedCharacter.hero.area;
    let dx = 0;
    let dy = 0;
    if (keyCode === KEY.UP) dy--;
    if (keyCode === KEY.DOWN) dy++;
    if (keyCode === KEY.LEFT) dx--;
    if (keyCode === KEY.RIGHT) dx++;
    if (isKeyDown(KEY.SHIFT)) {
        dx *= 10;
        dy *= 10;
    }
    if (selectedObject) {
        moveObject(selectedObject, dx, dy);
    }
    if (!selectedObject) {
        adjustCamera(10 * dx);
    }
    return true;
}

function adjustCamera(dx: number): void {
    const area = getState().selectedCharacter.hero.area;
    editingAreaState.cameraX += dx;
    editingAreaState.cameraX = Math.max(0, editingAreaState.cameraX);
    editingAreaState.cameraX = Math.min(area.width - ADVENTURE_WIDTH, editingAreaState.cameraX);
}

export function updateEditArea(): boolean {
    const { isEditing } = editingAreaState;
    if (!isEditing) {
        return false;
    }
    const area = getState().selectedCharacter.hero.area;
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    if (x < 30) {
        adjustCamera(-5);
    }
    if (x > ADVENTURE_WIDTH - 30) {
        adjustCamera(5);
    }
    return true;
}

export function renderEditAreaOverlay(context: CanvasRenderingContext2D): void {
    const { isEditing, selectedObject } = editingAreaState;
    if (!isEditing) {
        return;
    }
    if (selectedObject) {
        const {x, y, w, h} = areaTargetToScreenTarget(selectedObject.getAreaTarget());
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.strokeRect(x | 0, y | 0, w | 0, h | 0);
    }
}

