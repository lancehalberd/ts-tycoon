import { addMonstersFromAreaDefinition } from 'app/adventure';
import {
    applyDefinitionToArea,
    areaObjectFactories,
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
import { BACKGROUND_HEIGHT, GROUND_Y } from 'app/gameConstants';
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

export function deleteObject(object: AreaObject, updateArea: boolean = true) {
    const areaDefinition: AreaDefinition = zones[object.area.zoneKey][object.area.key];
    if (object.area.objects.indexOf(object) >= 0) {
        if (areaDefinition.objects[object.key] !== object.definition) {
            console.log('Did not find object definition where expected during delete.');
            debugger;
        }
        delete areaDefinition.objects[object.key];
    } else {
        if (areaDefinition.backgroundObjects[object.key] !== object.definition) {
            console.log('Did not find object definition where expected during delete.');
            debugger;
        }
        delete areaDefinition.backgroundObjects[object.key];
    }
    // Recrusively delete child objects.
    for (const otherObject of object.area.objects) {
        if (otherObject.definition.parentKey === object.key) {
            deleteObject(otherObject, false);
        }
    }
    for (const otherObject of object.area.backgroundObjects) {
        if (otherObject.definition.parentKey === object.key) {
            deleteObject(otherObject, false);
        }
    }
    // For recursive calls, we only update area for the outer most call.
    if (updateArea) {
        applyDefinitionToArea(object.area, areaDefinition);
    }
}

export function changeObjectOrder(object: AreaObject, dz: number ): void {
    if (!object) {
        return;
    }
    const area = getCurrentArea();
    const areaDefinition = getAreaDefinition();
    const hewHash = {};
    if (area.backgroundObjects.indexOf(object) >= 0) {
        areaDefinition.backgroundObjects
            = changeOrderInHash(object.definition, areaDefinition.backgroundObjects, dz);
    } else if (area.objects.indexOf(object) >= 0) {
        areaDefinition.objects
            = changeOrderInHash(object.definition, areaDefinition.objects, dz);
    } else {
        console.error('Object not found in area', object, area);
    }
    refreshArea();
}

function changeOrderInHash<T>(item: T, hash: {[key:string]: T}, dz: number): {[key:string]: T} {
    const newHash: {[key:string]: T}  = {};
    const keys = [];
    let index = -1;
    for (const key in hash) {
        if (hash[key] === item) {
            index = keys.length;
        }
        keys.push(key);
    }
    if (index < 0) {
        console.error('Could not find item in hash', item, hash);
        return hash;
    }
    const newIndex = Math.max(0, Math.min(keys.length - 1, index + dz));
    const key = keys.splice(index, 1);
    keys.splice(newIndex, 0, key);
    for (const key of keys) {
        newHash[key] = hash[key];
    }
    return newHash;
}
window['changeOrderInHash'] = changeOrderInHash;


export function moveObject(object: AreaObject, dx: number, dy: number): void {
    const area = getState().selectedCharacter.hero.area;
    if (area.backgroundObjects.includes(object)) {
        moveLocationDefinition(object.definition, dx, -dy, 0);
    } else {
        moveLocationDefinition(object.definition, dx, 0, -dy * 2);
        boundZPosition(object.definition, object.getAreaTarget().d);
    }
    refreshObjectDefinition(object);
}
// Reapply the definition for a given object and any objects that list it as an ancestor.
export function refreshObjectDefinition(object: AreaObject) {
    object.applyDefinition(object.definition);
    for (const otherObject of object.area.objects) {
        if (otherObject.definition.parentKey === object.key) {
            refreshObjectDefinition(otherObject);
        }
    }
    for (const otherObject of object.area.backgroundObjects) {
        if (otherObject.definition.parentKey === object.key) {
            refreshObjectDefinition(otherObject);
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
export function createObjectAtScreenCoords(definition: AreaObjectDefinition, coords: number[], objectKey: string): AreaObject {
    const area = getState().selectedCharacter.hero.area;
    const [x, y] = coords;
    const isWallDecoration = (y < BACKGROUND_HEIGHT);
    if (isWallDecoration) {
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
    if (isWallDecoration) {
        areaDefinition.backgroundObjects[objectKey] = definition;
    } else {
        areaDefinition.objects[objectKey] = definition;
    }
    refreshArea();
    return area.objectsByKey[objectKey];
}
