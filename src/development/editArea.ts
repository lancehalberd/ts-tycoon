import _ from 'lodash';
import { enterArea } from 'app/adventure';
import { areaDefinitions } from 'app/content/areaDefinitions';
import {
    applyDefinitionToArea,
    areaObjectFactories, areaTargetToScreenTarget, areaTypes, areaWalls,
    createAreaObjectFromDefinition, createAreaFromDefinition,
} from 'app/content/areas';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getState } from 'app/state';
import { getMousePosition } from 'app/utils/mouse';


import {
    Area, AreaDefinition, AreaObject, AreaObjectDefinition, MenuOption,
} from 'app/types';

interface EditingAreaState {
    isEditing: boolean,
    selectedObject: AreaObject,
    // This will override the cameraX for the area.
    cameraX: number,
    contextCoords: number[],
}
export const editingAreaState: EditingAreaState = {
    isEditing: false,
    selectedObject: null,
    cameraX: null,
    contextCoords: null,
}

// Note this actually fires on mousedown, not on click.
export function handleEditAreaClick(x: number, y: number): void {
    //console.log('click', x, y);
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    editingAreaState.selectedObject = null;
    const sortedObjects = [...area.objects];
    // Consider objects closer to the screen first to make selection intuitive.
    sortedObjects.sort((A, B) => A.getAreaTarget().z - B.getAreaTarget().z);
    for (const object of sortedObjects) {
        if (!object.definition) {
            continue;
        }
        if (object.isPointOver(x, y)) {
            if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                object.onInteract(hero);
                return;
            }
            editingAreaState.selectedObject = object;
            return;
        }
    }
    for (let i: number = area.wallDecorations.length - 1; i >= 0 ; i--) {
        const object: AreaObject = area.wallDecorations[i];
        if (!object.definition) {
            continue;
        }
        if (object.isPointOver(x, y)) {
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

export function uniqueObjectId(base: string, area: Area): string {
    let i = 2, id = base;
    while (area.objectsByKey[id]) {
        id = base + (i++);
    }
    return id;
}
function uniqueAreaId(): string {
    let i = 2, id = 'newArea';
    while (areaDefinitions[id]) {
        id = 'newArea' + (i++);
    }
    return id;
}

export function createObjectAtMouse(definition: AreaObjectDefinition, objectKey: string = null): AreaObject {
    const area = getState().selectedCharacter.hero.area;
    if (!objectKey) {
        objectKey = uniqueObjectId(definition.type, area);
    }
    const [x, y] = editingAreaState.contextCoords;
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
    definition.x = editingAreaState.cameraX + x;
    const areaDefinition: AreaDefinition = areaDefinitions[area.key];
    if (isWallDecoration) {
        areaDefinition.wallDecorations[objectKey] = definition;
    } else {
        areaDefinition.objects[objectKey] = definition;
    }
    applyDefinitionToArea(area, areaDefinition);
    // Select the most recently created object.
    editingAreaState.selectedObject = area.objectsByKey[objectKey];
    return area.objectsByKey[objectKey];
    /*const object: AreaObject = createAreaObjectFromDefinition(definition);
    object.area = area;
    object.key = objectKey;
    area.objectsByKey[objectKey] = object;
    if (isWallDecoration) {
        area.wallDecorations.push(object);
    } else {
        area.objects.push(object);
    }*/
}

function moveObject(object: AreaObject, dx: number, dy: number) {
    const area = getState().selectedCharacter.hero.area;
    let dz = 0;
    if (area.wallDecorations.includes(object)) {
        dy = -dy;
    } else {
        // For dragging an object, we need to multiply by 2 to make it follow the mouse
        // since the z is scaled by 0.5.
        dz = -dy * 2;
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
    refreshDefinition(object);
}

// Reapply the definition for a given object and any objects that list it as an ancestor.
export function refreshDefinition(object: AreaObject) {
    object.applyDefinition(object.definition);
    for (const otherObject of object.area.objects) {
        if (otherObject.definition.parentKey === object.key) {
            refreshDefinition(otherObject);
        }
    }
    for (const otherObject of object.area.wallDecorations) {
        if (otherObject.definition.parentKey === object.key) {
            refreshDefinition(otherObject);
        }
    }
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
    let [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    x = Math.round(x);
    y = Math.round(y);
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
        if (selectedObject.definition && selectedObject.definition.parentKey) {
            const parentObject = selectedObject.area.objectsByKey[selectedObject.definition.parentKey];
            const {x, y, w, h} = areaTargetToScreenTarget(parentObject.getAreaTarget());
            context.strokeStyle = 'purple';
            context.lineWidth = 1;
            context.strokeRect(x | 0, y | 0, w | 0, h | 0);
        }
    }
}

function updateAreaDefinition(updatedProps: Partial<AreaDefinition>) {
    const area: Area = getState().selectedCharacter.hero.area;
    areaDefinitions[area.key] = {
        ...areaDefinitions[area.key],
        ...updatedProps,
    };
    applyDefinitionToArea(area, areaDefinitions[area.key]);
}

export function getEditingContextMenu(): MenuOption[] {
    const area = getState().selectedCharacter.hero.area;
    if (!editingAreaState.isEditing) {
        if (!areaDefinitions[area.key]) {
            return [
                {
                    getLabel() {
                        return 'Cannot Edit Here';
                    },
                },
            ];
        }
        return [
            {
                getLabel() {
                    return 'Start Editing';
                },
                onSelect() {
                    editingAreaState.isEditing = true;
                    editingAreaState.cameraX = getState().selectedCharacter.hero.area.cameraX;
                }
            },
        ];
    }
    editingAreaState.contextCoords = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    editingAreaState.contextCoords[0] = Math.round(editingAreaState.contextCoords[0]);
    editingAreaState.contextCoords[1] = Math.round(editingAreaState.contextCoords[1]);
    const isWallDecoration = (editingAreaState.contextCoords[1] < BACKGROUND_HEIGHT);
    return [
        {
            getLabel() {
                return 'Stop Editing';
            },
            onSelect() {
                editingAreaState.isEditing = false;
                editingAreaState.selectedObject = null;
            }
        },
        {
            getLabel() {
                return isWallDecoration ? 'Add to Wall...' : 'Add to Field...';
            },
            getChildren() {
                // Filter out null values, which are used to disable some object types.
                return Object.keys(areaObjectFactories).map(getAddObjectMenuItem).filter(o => o);
            }
        },
        {
            getLabel() {
                return 'Area...';
            },
            getChildren() {
                return [
                    {
                        getLabel() {
                            return 'New';
                        },
                        onSelect() {
                            const areaKey = window.prompt('New area key', uniqueAreaId());
                            if (!areaKey) {
                                return;
                            }
                            const guildAreas = getState().guildAreas;
                            let area = guildAreas[areaKey];
                            if (!area) {
                                const areaDefinition: AreaDefinition = {
                                    type: 'oldGuild',
                                    width: 600,
                                    objects: {},
                                    wallDecorations: {},
                                    isGuildArea: true,
                                }
                                areaDefinitions[areaKey] = areaDefinition;
                                area = createAreaFromDefinition(areaKey, areaDefinition);
                                guildAreas[areaKey] = area;
                            }
                            enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, areaKey});
                        }
                    },
                    {
                        getLabel() {
                            return 'Goto...';
                        },
                        getChildren() {
                            const guildAreas = getState().guildAreas;
                            return Object.keys(guildAreas).map((areaKey: string): MenuOption => {
                                return {
                                    getLabel: () => areaKey,
                                    onSelect() {
                                        enterArea(getState().selectedCharacter.hero, {x: 0, z: 0, areaKey});
                                    }
                                }
                            });
                        }
                    },
                    {
                        getLabel() {
                            return 'Type...';
                        },
                        getChildren() {
                            return Object.keys(areaTypes).map(getSetAreaTypeMenuItem);
                        }
                    },
                    {
                        getLabel() {
                            return 'Left wall...';
                        },
                        getChildren() {
                            const callback = (wallType) => {
                                updateAreaDefinition({leftWallType: wallType});
                            }
                            return [
                                {
                                    getLabel: () => 'None',
                                    onSelect() {
                                        updateAreaDefinition({leftWallType: null});
                                    }
                                },
                                ...Object.keys(areaWalls).map(wallType => getSetWallTypeMenuItem(wallType, callback))
                            ];
                        }
                    },
                    {
                        getLabel() {
                            return 'Right wall...';
                        },
                        getChildren() {
                            const callback = (wallType) => {
                                updateAreaDefinition({rightWallType: wallType});
                            }
                            return [
                                {
                                    getLabel: () => 'None',
                                    onSelect() {
                                        updateAreaDefinition({rightWallType: null});
                                    }
                                },
                                ...Object.keys(areaWalls).map(wallType => getSetWallTypeMenuItem(wallType, callback))
                            ];
                        }
                    },
                    {
                        getLabel() {
                            return 'Change size...';
                        },
                        getChildren() {
                            return [
                                        ADVENTURE_WIDTH,
                                        -200, -100, -50, -20,
                                        20, 50, 100, 200
                                    ].filter(size => area.width + size >= ADVENTURE_WIDTH).map(size => ({
                                getLabel() {
                                    return `${area.width + size}`;
                                },
                                onSelect() {
                                    updateAreaDefinition({width: area.width + size});
                                }
                            }));
                        }
                    },
                ];
            }
        },
        ...getSelectedObjectContextMenu(),
    ];
}

export function getSelectedObjectContextMenu(): MenuOption[] {
    const {contextCoords, selectedObject} = editingAreaState;
    if (!selectedObject
        || !selectedObject.isPointOver(contextCoords[0], contextCoords[1])
        || !selectedObject.definition
    ) {
        return [];
    }
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
                refreshDefinition(selectedObject);
            }
        },
        {},
        {
            getLabel() {
                return 'Delete ' + selectedObject.definition.type;
            },
            onSelect() {
                deleteObject(selectedObject);
                editingAreaState.selectedObject = null;
            }
        },
    ]
}

function deleteObject(object: AreaObject, updateArea: boolean = true) {
    const areaDefinition: AreaDefinition = areaDefinitions[object.area.key];
    if (object.area.objects.indexOf(object) >= 0) {
        if (areaDefinition.objects[object.key] !== object.definition) {
            console.log('Did not find object definition where expected during delete.');
            debugger;
        }
        delete areaDefinition.objects[object.key];
    } else {
        if (areaDefinition.wallDecorations[object.key] !== object.definition) {
            console.log('Did not find object definition where expected during delete.');
            debugger;
        }
        delete areaDefinition.wallDecorations[object.key];
    }
    // Recrusively delete child objects.
    for (const otherObject of object.area.objects) {
        if (otherObject.definition.parentKey === object.key) {
            deleteObject(otherObject, false);
        }
    }
    for (const otherObject of object.area.wallDecorations) {
        if (otherObject.definition.parentKey === object.key) {
            deleteObject(otherObject, false);
        }
    }
    // For recursive calls, we only update area for the outer most call.
    if (updateArea) {
        applyDefinitionToArea(object.area, areaDefinition);
    }
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
            createObjectAtMouse({type});
        }
    }
}

export function getSetAreaTypeMenuItem(type: string): MenuOption {
    return {
        getLabel() {
            return type;
        },
        onSelect() {
            updateAreaDefinition({type});
        }
    }
}

export function getSetWallTypeMenuItem(wallType: string, callback: (string) => void): MenuOption {
    return {
        getLabel() {
            return wallType;
        },
        onSelect() {
            callback(wallType);
        }
    }
}

