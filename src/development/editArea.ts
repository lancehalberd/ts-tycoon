import _ from 'lodash';
import { enterArea } from 'app/adventure';
import { monsters } from 'app/content/monsters';
import { serializeZone, zones } from 'app/content/zones';
import {
    applyDefinitionToArea,
    areaObjectFactories, areaTargetToScreenTarget, areaTypes, areaWalls,
    createAreaObjectFromDefinition, createAreaFromDefinition,
    getPositionFromLocationDefinition, isPointOverAreaTarget,
} from 'app/content/areas';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isKeyDown, KEY } from 'app/keyCommands';
import { renderMonsterFromDefinition } from 'app/render/drawActor';
import { getState } from 'app/state';
import { readFromFile, saveToFile } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';


import {
    Actor, Area, AreaDefinition, AreaEntity, AreaObject, AreaObjectDefinition, AreaObjectTarget, Frame,
    MenuOption, MonsterData, MonsterDefinition, ShortRectangle, ZoneType,
} from 'app/types';

interface EditingAreaState {
    isEditing: boolean,
    selectedObject: AreaObject,
    selectedMonsterIndex: number,
    // This will override the cameraX for the area.
    cameraX: number,
    contextCoords: number[],
}
export const editingAreaState: EditingAreaState = {
    isEditing: false,
    selectedObject: null,
    selectedMonsterIndex: null,
    cameraX: null,
    contextCoords: null,
}
window['editingAreaState'] = editingAreaState;

function getArea(): Area {
    return getState().selectedCharacter.hero.area;
}
function getAreaDefinition(): AreaDefinition {
    const area: Area = getArea();
    return zones[area.zoneKey][area.key];
}

class MonsterDefinitionAreaObject implements AreaObject {
    area: Area;
    index: number;
    constructor(area: Area, index: number) {
        this.area = area;
        this.index = index;
    }
    getAreaTarget(): AreaObjectTarget {
        const areaDefinition = zones[this.area.zoneKey][this.area.key];
        const monsterDefinition: MonsterDefinition = areaDefinition.monsters[this.index];
        return {
            targetType: 'object',
            object: this,
            ...getMonsterDefinitionAreaEntity(this.area, monsterDefinition),
        };
    }
    isPointOver(x: number, y: number): boolean {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y);
    }
}

function getMonsterDefinitionAreaEntity(this: void, area: Area, monsterDefinition: MonsterDefinition): AreaEntity {
    const data: MonsterData = monsters[monsterDefinition.key];
    const frame: Frame = data.source.idleAnimation.frames[0];
    let {w, h, d} = (frame.content || frame);
    d = d || w;
    return {
        area,
        ...getPositionFromLocationDefinition(area, {w, h, d}, monsterDefinition.location),
        w, h, d,
    };
}

// Note this actually fires on mousedown, not on click.
export function handleEditAreaClick(x: number, y: number): void {
    //console.log('click', x, y);
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    const areaDefinition = getAreaDefinition();
    editingAreaState.selectedMonsterIndex = null;
    editingAreaState.selectedObject = null;
    const monsterObjects: MonsterDefinitionAreaObject[] = (areaDefinition.monsters || []).map((definition, index) => {
        return new MonsterDefinitionAreaObject(area, index);
    });
    const sortedObjects = [...area.objects, ...monsterObjects];
    // Consider objects closer to the screen first to make selection intuitive.
    sortedObjects.sort((A, B) => A.getAreaTarget().z - B.getAreaTarget().z);
    for (const object of sortedObjects) {
        if (!(object instanceof MonsterDefinitionAreaObject) && !object.definition) {
            continue;
        }
        if (object.isPointOver(x, y)) {
            if (object instanceof MonsterDefinitionAreaObject) {
                editingAreaState.selectedMonsterIndex = object.index;
                return;
            } else {
                if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                    object.onInteract(hero);
                    return;
                }
                editingAreaState.selectedObject = object;
                return;
            }
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
    if (isKeyDown(KEY.SHIFT) && y > BACKGROUND_HEIGHT) {
        const hero = getState().selectedCharacter.hero;
        hero.x = x + hero.area.cameraX;
        hero.z = 2 * (GROUND_Y - y);
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
    let zoneKey = getArea().zoneKey;
    let i = 2, id: string = zoneKey;
    while (zones[zoneKey][id]) {
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
    const areaDefinition: AreaDefinition = zones[area.zoneKey][area.key];
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
    const { isEditing, selectedObject, selectedMonsterIndex } = editingAreaState;
    if (!isEditing) {
        return;
    }
    const area = getArea();
    const areaDefinition = getAreaDefinition();
    context.save();
        context.globalAlpha = 0.5;
        for (let i =0; i < (areaDefinition.monsters || []).length; i++) {
            const monster = areaDefinition.monsters[i];
            renderMonsterFromDefinition(context, area, monster, i === selectedMonsterIndex && isKeyDown(KEY.SHIFT));
        }
    context.restore();
    let parentKey = null;
    if (selectedMonsterIndex !== null) {
        const monsterDefinition = areaDefinition.monsters[selectedMonsterIndex];
        drawBox(context, 'white', areaTargetToScreenTarget(getMonsterDefinitionAreaEntity(area, monsterDefinition)));
        parentKey = monsterDefinition.location.parentKey;
    } else if (selectedObject) {
        drawBox(context, 'white', areaTargetToScreenTarget(selectedObject.getAreaTarget()));
        parentKey = selectedObject.definition && selectedObject.definition.parentKey;
    }
    if (parentKey) {
        const parentObject = selectedObject.area.objectsByKey[parentKey];
        drawBox(context, 'purple', areaTargetToScreenTarget(parentObject.getAreaTarget()));
    }
}
// Draws a simple representation of the "3D" box that an object is projected to on the screen.
// This could be useful for checking if the in game geometry is actually matching the art since it easy to
// get the art displaying well, even when it does not match the actual geometry being used.
function drawBox(context: CanvasRenderingContext2D, color: string, {x, y, w, h, d}: ShortRectangle): void {
    const d2 = Math.round(d / 2);
    context.save();
        context.globalAlpha = 0.5;
        context.fillStyle = color;
        // Draw the bars from the back of the box to the front.
        context.fillRect(x, y, 1, d2);
        context.fillRect(x + w - 1, y, 1, d2);
        context.fillRect(x, y + h - d2, 1, d2);
        context.fillRect(x + w - 1, y + h - d2, 1, d2);
        // Draw the back of the box.
        h -= d2;
        context.fillRect(x, y, w, 1);
        context.fillRect(x, y, 1, h);
        context.fillRect(x, y + h - 1, w, 1);
        context.fillRect(x + w - 1, y, 1, h);
        // Draw the front of the box.
        y += d2;
        context.fillRect(x, y, w, 1);
        context.fillRect(x, y, 1, h);
        context.fillRect(x, y + h - 1, w, 1);
        context.fillRect(x + w - 1, y, 1, h);
    context.restore();
}

function updateAreaDefinition(updatedProps: Partial<AreaDefinition>) {
    const area: Area = getState().selectedCharacter.hero.area;
    zones[area.zoneKey][area.key] = {
        ...zones[area.zoneKey][area.key],
        ...updatedProps,
    };
    applyDefinitionToArea(area, zones[area.zoneKey][area.key]);
}

export function getEditingContextMenu(): MenuOption[] {
    const area = getArea();
    if (!editingAreaState.isEditing) {
        if (!area.zoneKey || !zones[area.zoneKey][area.key]) {
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
        getAreaContextMenuOption(),
        getZoneContextMenuOption(),
        ...getSelectedObjectContextMenu(),
    ];
}

export function getAreaContextMenuOption(): MenuOption {
    return {
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
                        promptToCreateNewArea(getArea().zoneKey);
                    }
                },
                {
                    getLabel() {
                        return 'Goto...';
                    },
                    getChildren() {
                        return Object.keys(zones[getArea().zoneKey]).map((areaKey: string): MenuOption => {
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
                            ...[-200, -100, -50, -20, 20, 50, 100, 200].map(s => getArea().width + s)
                        ].filter(size => size >= ADVENTURE_WIDTH).map(size => ({
                            getLabel() {
                                return `${size}`;
                            },
                            onSelect() {
                                updateAreaDefinition({width: size});
                            }
                        }));
                    }
                },
            ];
        }
    };
}

function promptToCreateNewArea(zoneKey: ZoneType): void {
    const areaKey = window.prompt('New zone key', uniqueAreaId());
    let areaDefinition = zones[zoneKey][areaKey];
    if (!areaDefinition) {
        const areaDefinition: AreaDefinition = {
            type: 'oldGuild',
            width: 600,
            objects: {},
            wallDecorations: {},
            zoneKey,
        }
        zones[areaDefinition.zoneKey][areaKey] = areaDefinition;
    }
    enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, zoneKey, areaKey});
}

export function getZoneContextMenuOption(): MenuOption {
    const area = getState().selectedCharacter.hero.area;
    return {
        getLabel() {
            return 'Zone...';
        },
        getChildren() {
            return [
                {
                    getLabel() {
                        return 'New';
                    },
                    onSelect() {
                        const zoneKey = window.prompt('New zone key', uniqueAreaId());
                        if (!zoneKey || zones[zoneKey]) {
                            return;
                        }
                        // Technically this won't be an existing ZoneType, but at runtime
                        // TS can't do anything about this, and we want to support adding new
                        // zones at run time while restricting them when compiling.
                        zones[zoneKey] = {};
                        promptToCreateNewArea(zoneKey as ZoneType);
                    }
                },
                {
                    getLabel() {
                        return 'Goto...';
                    },
                    getChildren() {
                        return Object.keys(zones).map((zoneKey: ZoneType): MenuOption => {
                            return {
                                getLabel: () => zoneKey,
                                getChildren() {
                                    return Object.keys(zones[zoneKey]).map((areaKey: string): MenuOption => {
                                        return {
                                            getLabel: () => areaKey,
                                            onSelect() {
                                                enterArea(getState().selectedCharacter.hero, {x: 0, z: 0, zoneKey, areaKey});
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                },
                {
                    getLabel() {
                        return 'Export to...';
                    },
                    getChildren() {
                        return [
                            {
                                getLabel() {
                                    return 'File';
                                },
                                onSelect() {
                                    saveToFile(serializeZone(area.zoneKey), `${area.zoneKey}.ts`, 'text/javascript');
                                }
                            },
                            {
                                getLabel() {
                                    return 'Clipboard';
                                },
                                onSelect() {
                                    navigator.clipboard.writeText(serializeZone(area.zoneKey))
                                }
                            },
                            {
                                getLabel() {
                                    return 'Console';
                                },
                                onSelect() {
                                    console.log(serializeZone(area.zoneKey))
                                }
                            },
                        ];
                    }
                },
                {
                    getLabel() {
                        return 'Import from...';
                    },
                    getChildren() {
                        return [
                            {
                                getLabel() {
                                    return 'File';
                                },
                                onSelect() {
                                    readFromFile().then(contents => importZone(contents));
                                }
                            },
                            {
                                getLabel() {
                                    return 'Clipboard';
                                },
                                onSelect() {
                                    navigator.clipboard.readText().then(contents => importZone(contents));
                                }
                            },
                        ];
                    }
                },
            ];
        }
    };
}

function importZone(zoneFileContents: string) {
    // Remove all import lines.
    zoneFileContents = zoneFileContents.replace(/import.*\n/g, '');
    // Remove all export tokens at the start of lines.
    zoneFileContents = zoneFileContents.replace(/\bexport /g, '');
    // Remove all type definitions.
    zoneFileContents = zoneFileContents.replace(/: [A-Z][a-zA-Z]+/g, '');
    // console.log(zoneFileContents);
    const matches = zoneFileContents.match(/zones\.(\w+) = {/);
    const zoneKey = matches[1] as ZoneType;
    eval(zoneFileContents);
    // Set zoneKey on the newly imported area definitions.
    for (let areaKey in zones[zoneKey]) {
        const areaDefinition: AreaDefinition = zones[zoneKey][areaKey];
        areaDefinition.zoneKey = zoneKey;
    }
    // Enter the first area found in the imported zone.
    for (let areaKey in zones[zoneKey]) {
        enterArea(getState().selectedCharacter.hero, {x: 0, z: 0, zoneKey, areaKey});
        break;
    }
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
    const areaDefinition: AreaDefinition = zones[object.area.zoneKey][object.area.key];
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

