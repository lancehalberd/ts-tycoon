import { addMonstersFromAreaDefinition, getArea } from 'app/adventure';
import {
    applyDefinitionToArea,
    areaObjectFactories,
    getAreaDefinition,
    getCurrentArea,
    getLayer, getLayerDefinition,
    AreaDoorDefinition, FloorTriggerDefinition, SwitchDefinition,
} from 'app/content/areas';
import { getMonsterDefinitionAreaEntity, makeMonster, monsters } from 'app/content/monsters';
import { zones } from 'app/content/zones';
import {
    boundZPosition,
    createObjectAtContextCoords,
    deleteSelectedObject,
    moveLocationDefinition,
    refreshArea,
    refreshPropertyPanel,
} from 'app/development/editArea';
import {
    ADVENTURE_HEIGHT, BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z
} from 'app/gameConstants';
import { getBasicAttack } from 'app/performAttack';
import { getState } from 'app/state';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';

import {
    Area, AreaDefinition, AreaObject,
    AreaObjectDefinition, AreaObjectTarget,
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

export function findAndDeleteObject(objectKey: string): void {
    const areaDefinition = getAreaDefinition();
    for (const layer of areaDefinition.layers) {
        for (let i = 0; i < layer.objects.length; i++) {
            const otherObject = layer.objects[i];
            if (otherObject.key === objectKey) {
                layer.objects.splice(i--, 1);
                return;
            }
        }
    }
}

export function deleteObject(objectKey: string, updateArea: boolean = true): void {
    findAndDeleteObject(objectKey);
    const areaDefinition = getAreaDefinition();
    // Delete the object, and recursively delete any objects that include it as a parent.
    for (const layer of areaDefinition.layers) {
        for (let i = 0; i < layer.objects.length; i++) {
            const otherObject = layer.objects[i];
            if (otherObject.key === objectKey) {
                layer.objects.splice(i--, 1);
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

function isDoorDefinition(definition: AreaObjectDefinition): definition is AreaDoorDefinition {
    return definition.type === 'door';
}

function isSwitchDefinition(definition: AreaObjectDefinition): definition is SwitchDefinition {
    return definition.type === 'switch';
}

function isFloorTriggerDefinition(definition: AreaObjectDefinition): definition is FloorTriggerDefinition {
    return definition.type === 'floorTrigger';
}

function updateObjectKey(object: AreaObject, key: string): void {
    const updatedAreas = new Set<Area>([object.area]);
    // Update all existing references to the current object key.
    // 1. Alignment parents
    for (const otherObject of Object.values(object.area.objectsByKey)) {
        if (otherObject.definition.parentKey === object.key) {
            otherObject.definition.parentKey = key;
        }
    }
    // 2. Door exits
    for (let areaKey in zones[object.area.zoneKey]) {
        console.log('checking', areaKey);
        const area = getArea(object.area.zoneKey, areaKey);
        for (const otherObject of Object.values(area.objectsByKey)) {
            const definition = otherObject.definition;
            if (isDoorDefinition(definition)) {
                console.log('checking', definition.exitKey);
                let [targetAreaKey, targetObjectKey] = definition.exitKey.split(':');
                if (targetAreaKey === object.area.key && targetObjectKey === object.key) {
                    definition.exitKey = `${targetAreaKey}:${key}`;
                    updatedAreas.add(area);
                }
            }
        }
    }
    // 3. Switch targets
    for (const otherObject of Object.values(object.area.objectsByKey)) {
        const definition = otherObject.definition;
        if (isSwitchDefinition(definition) || isFloorTriggerDefinition(definition)) {
            const index = definition.targets.indexOf(object.key);
            if (index >=0) {
                definition.targets.splice(index, 1, key);
            }
        }
    }
    console.log('update key', key);
    object.definition.key = key;
    for (const area of [...updatedAreas]) {
        console.log('updating area', area.key);
        refreshArea(area);
    }
}

export function getObjectProperties(object: AreaObject): (EditorProperty<any> | PropertyRow | string)[] {
    const definition = object.definition;
    let props: (EditorProperty<any> | PropertyRow | string)[] = [];
    props.push(object.definition.type);
    const areaObjectFactory = areaObjectFactories[definition.type];
    props.push({
        name: 'key',
        value: definition.key,
        onChange: (key: string) => {
            if (!key) {
                return definition.x;
            }
            // Make sure new key is unique.
            let newKey = key, n = 1;
            // If the key is not unique, add a number to the end until it is.
            while (object.area.objectsByKey[newKey]) {
                newKey = `${key}${n++}`;
            }
            updateObjectKey(object, newKey);
        },
    });
    if (areaObjectFactory.getProperties) {
        props = [...props, ...areaObjectFactory.getProperties(object)];
    }
    props.push([{
        name: 'x',
        value: definition.x || 0,
        onChange: (x: number) => {
            if (isNaN(x)) {
                return definition.x;
            }
            definition.x = Math.round(x);
            refreshObjectDefinition(object);
        },
    }, {
        name: 'y',
        value: definition.y || 0,
        onChange: (y: number) => {
            if (isNaN(y)) {
                return definition.y;
            }
            definition.y = Math.round(y);
            refreshObjectDefinition(object);
        },
    }, {
        name: 'z',
        value: definition.z || 0,
        onChange: (z: number) => {
            if (isNaN(z)) {
                return definition.z;
            }
            definition.z = Math.round(z);
            refreshObjectDefinition(object);
        },
    }]);
    props.push({
        name: 'flipped',
        value: definition.flipped || false,
        onChange: (flipped: boolean) => {
            definition.flipped = flipped;
            refreshObjectDefinition(object);
        },
    });
    return props;
}
