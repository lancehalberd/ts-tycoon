import { addMonstersFromAreaDefinition } from 'app/adventure';
import {
    applyDefinitionToArea,
    areaObjectFactories,
    getLayer, getLayerDefinition,
} from 'app/content/areas';
import { getMonsterDefinitionAreaEntity, makeMonster, monsters } from 'app/content/monsters';
import { zones } from 'app/content/zones';
import {
    boundZPosition,
    createObjectAtContextCoords,
    deleteSelectedObject,
    getCurrentArea,
    getAreaDefinition,
    moveLocationDefinition,
    refreshArea,
    refreshPropertyPanel,
} from 'app/development/editArea';
import { ADVENTURE_HEIGHT, BACKGROUND_HEIGHT, GROUND_Y } from 'app/gameConstants';
import { getBasicAttack } from 'app/performAttack';
import { getState } from 'app/state';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';

import {
    Area, AreaDefinition, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    EditorProperty,
    MenuOption, Monster, MonsterDefinition, PropertyRow,
} from 'app/types';


export function getObjectContextMenu(selectedObject: AreaObject): MenuOption[] {
    const areaObjectFactory = areaObjectFactories[selectedObject.definition.type];
    return [
        ...(areaObjectFactory && areaObjectFactory.getEditMenu
                ? areaObjectFactory.getEditMenu(selectedObject)
                : []
        ),
        {
            getLabel() {
                return 'Flip ' + selectedObject.definition.type;
            },
            onSelect() {
                selectedObject.definition.flipped = !selectedObject.definition.flipped;
                refreshObjectDefinition(selectedObject);
            }
        },
        {},
        {
            getLabel() {
                return 'Delete ' + selectedObject.definition.type;
            },
            onSelect() {
                deleteSelectedObject();
            }
        },
    ]
}

export function getAddObjectMenuItem(type: string): MenuOption {
    if (areaObjectFactories[type].getCreateMenu) {
        return areaObjectFactories[type].getCreateMenu();
    }
    return {
        getLabel() {
            return type;
        },
        onSelect() {
            createObjectAtContextCoords({type});
        }
    }
}

export function deleteObject(objectKey: string, updateArea: boolean = true) {
    const areaDefinition = getAreaDefinition();
    // Delete the object, and recursively delete any objects that include it as a parent.
    for (const layer of areaDefinition.layers) {
        for (let i = 0; i < layer.objects.length; i++) {
            const otherObject = layer.objects[i];
            if (otherObject.key === objectKey) {
                layer.objects.splice(i--);
                continue;
            }
            if (otherObject.parentKey === objectKey) {
                deleteObject(otherObject.key, false);
            }
        }
    }
    // For recursive calls, we only update area for the outer most call.
    if (updateArea) {
        applyDefinitionToArea(getCurrentArea(), areaDefinition);
    }
}

export function changeObjectOrder(object: AreaObject, dz: number ): void {
    if (!object) {
        return;
    }
    const areaDefinition = getAreaDefinition();
    const backgroundLayer = getLayerDefinition(areaDefinition, 'background');
    const fieldLayer = getLayerDefinition(areaDefinition, 'field');
    const foregroundLayer = getLayerDefinition(areaDefinition, 'foreground');
    changeOrderInArray(object.definition, backgroundLayer.objects, dz);
    changeOrderInArray(object.definition, fieldLayer.objects, dz);
    changeOrderInArray(object.definition, foregroundLayer.objects, dz);
    refreshArea();
}

function changeOrderInArray<T>(item: T, array: T[], dz: number): void {
    const index = array.indexOf(item);
    // Do nothing if the item isn't in this array.
    if (index < 0) {
        return;
    }
    const newIndex = Math.max(0, Math.min(array.length - 1, index + dz));
    array.splice(index, 1);
    array.splice(newIndex, 0, item);
}
window['changeOrderInArray'] = changeOrderInArray;


export function moveObject(object: AreaObject, dx: number, dy: number): void {
    const area = getState().selectedCharacter.hero.area;
    if (getLayer(area, 'field').objects.includes(object)) {
        moveLocationDefinition(object.definition, dx, 0, -dy * 2);
        boundZPosition(object.definition, object.getAreaTarget().d);
    } else {
        moveLocationDefinition(object.definition, dx, -dy, 0);
    }
    refreshObjectDefinition(object);
}
// Reapply the definition for a given object and any objects that list it as an ancestor.
export function refreshObjectDefinition(object: AreaObject) {
    object.applyDefinition(object.definition);
    const area = object.area;
    for (const layer of area.layers) {
        for (const otherObject of layer.objects) {
            if (otherObject.definition.parentKey === object.key) {
                refreshObjectDefinition(otherObject);
            }
        }
    }
    refreshPropertyPanel();
}

export function uniqueObjectId(base: string, area: Area): string {
    let i = 2, id = base;
    while (area.objectsByKey[id]) {
        id = base + (i++);
    }
    return id;
}
export function createObjectAtScreenCoords(definition: AreaObjectDefinition, coords: number[]): AreaObject {
    const area = getState().selectedCharacter.hero.area;
    const [x, y] = coords;
    const isBackgroundObject = (y < BACKGROUND_HEIGHT);
    const isForegroundObject = (y > ADVENTURE_HEIGHT - 32);
    if (isBackgroundObject) {
        definition.y = BACKGROUND_HEIGHT - y;
        definition.zAlign = 'back';
        definition.z = 0;
    } else {
        definition.y = 0;
        // Recall GROUND_Y is y=0, z=0, and z is at 1/2 scale.
        definition.z = (GROUND_Y - y) * 2;
    }
    definition.x = area.cameraX + x;
    const areaDefinition: AreaDefinition = zones[area.zoneKey][area.key];
    if (isBackgroundObject) {
        getLayerDefinition(areaDefinition, 'background').objects.push(definition);
    } else if (isForegroundObject) {
        getLayerDefinition(areaDefinition, 'foreground').objects.push(definition);
    } else {
        getLayerDefinition(areaDefinition, 'field').objects.push(definition);
    }
    refreshArea();
    return area.objectsByKey[definition.key];
}
