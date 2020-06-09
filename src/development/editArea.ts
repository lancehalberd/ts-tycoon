import _ from 'lodash';
import { addMonstersFromAreaDefinition, enterArea, getArea } from 'app/adventure';
import { addAreaFurnitureBonuses, removeAreaFurnitureBonuses } from 'app/content/furniture';
import { missions, setupMission } from 'app/content/missions';
import { getMonsterDefinitionAreaEntity, monsters } from 'app/content/monsters';
import { serializeZone, zones } from 'app/content/zones';
import {
    applyDefinitionToArea,
    areaObjectFactories, areaTargetToScreenTarget, areaTypes, areaWalls,
    createAreaObjectFromDefinition, createAreaFromDefinition,
    getPositionFromLocationDefinition, isPointOverAreaTarget,
} from 'app/content/areas';
import {
    MonsterDefinitionAreaObject,
    getMonsterContextMenu,
    getMonsterProperties,
    getMonsterTypeMenuItems,
    moveMonsterDefinition,
    refreshEnemies,
} from 'app/development/editMonsters';
import {
    changeObjectOrder,
    createObjectAtScreenCoords,
    deleteObject,
    getAddObjectMenuItem,
    getObjectContextMenu,
    moveObject,
    refreshObjectDefinition,
    uniqueObjectId,
} from 'app/development/editObjects';
import { displayPropertyPanel, hidePropertyPanel } from 'app/development/propertyPanel';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isKeyDown, KEY } from 'app/keyCommands';
import { renderMonsterFromDefinition } from 'app/render/drawActor';
import { getState } from 'app/state';
import { readFromFile, saveToFile } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';

import {
    Actor, Area, AreaDefinition, AreaEntity, AreaObject, AreaObjectDefinition, AreaObjectTarget,
    EditorProperty, Frame, FrameDimensions,
    LocationDefinition, MenuOption, Monster, MonsterData, MonsterDefinition,
    PropertyRow, ShortRectangle, ZoneType,
} from 'app/types';

interface Position {
    x: number, y: number, z: number,
}

interface EditingAreaState {
    isEditing: boolean,
    selectedObject: AreaObject,
    selectedMonsterIndex: number,
    // This will override the cameraX for the area.
    cameraX: number,
    contextCoords: number[],
    initialObjectPosition?: Position,
}
export const editingAreaState: EditingAreaState = {
    isEditing: false,
    selectedObject: null,
    selectedMonsterIndex: -1,
    cameraX: null,
    contextCoords: null,
}
window['editingAreaState'] = editingAreaState;

export function getCurrentArea(): Area {
    return getState().selectedCharacter.hero.area;
}
export function getAreaDefinition(): AreaDefinition {
    const area: Area = getCurrentArea();
    return zones[area.zoneKey][area.key];
}

export function refreshArea() {
    const { selectedObject } = editingAreaState;
    const area = getCurrentArea();
    applyDefinitionToArea(area, getAreaDefinition());
    // Select the most recently created object.
    if (selectedObject) {
        editingAreaState.selectedObject = area.objectsByKey[selectedObject.key];
    }
    refreshPropertyPanel();
}

export function deleteSelectedObject(): void {
    const { selectedObject, selectedMonsterIndex} = editingAreaState;
    if (selectedObject) {
        deleteObject(selectedObject);
        editingAreaState.selectedObject = null;
    } else if (selectedMonsterIndex >= 0) {
        getAreaDefinition().monsters.splice(selectedMonsterIndex, 1);
        editingAreaState.selectedMonsterIndex = -1;
        refreshEnemies();
    }
}

// Note this actually fires on mousedown, not on click.
export function handleEditAreaClick(x: number, y: number): void {
    //console.log('click', x, y);
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    const areaDefinition = getAreaDefinition();
    editingAreaState.selectedMonsterIndex = -1;
    editingAreaState.selectedObject = null;
    editingAreaState.initialObjectPosition = null;
    refreshPropertyPanel();
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
                refreshPropertyPanel();
                return;
            } else {
                if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                    object.onInteract(hero);
                    return;
                }
                editingAreaState.selectedObject = object;
                refreshPropertyPanel();
                return;
            }
        }
    }
    for (let i: number = area.backgroundObjects.length - 1; i >= 0 ; i--) {
        const object: AreaObject = area.backgroundObjects[i];
        if (!object.definition) {
            continue;
        }
        if (object.isPointOver(x, y)) {
            if (isKeyDown(KEY.SHIFT) && object.onInteract) {
                object.onInteract(hero);
                return;
            }
            editingAreaState.selectedObject = object;
            refreshPropertyPanel();
            return;
        }
    }
    if (isKeyDown(KEY.SHIFT) && y > BACKGROUND_HEIGHT) {
        const hero = getState().selectedCharacter.hero;
        hero.x = x + hero.area.cameraX;
        hero.z = 2 * (GROUND_Y - y);
    }
}

export function handleEditMouseDragged(x: number, y: number, sx: number, sy: number): void {
    const { selectedMonsterIndex, selectedObject } = editingAreaState;
    const dx = x - sx, dy = y - sy;
    if (selectedObject) {
        const area = getCurrentArea();
        dragLocationDefinition(selectedObject.definition, dx, dy);
        // Objects on the wall aren't bound by the z limits.
        if (!area.backgroundObjects.includes(selectedObject)) {
            boundZPosition(selectedObject.definition, selectedObject.getAreaTarget().d);
        }
        refreshObjectDefinition(selectedObject);
    } else if (selectedMonsterIndex >= 0) {
        const monster = getAreaDefinition().monsters[selectedMonsterIndex];
        dragLocationDefinition(monster.location, dx, dy);
        boundZPosition(monster.location, getMonsterDefinitionAreaEntity(getCurrentArea(), monster).d);
        refreshEnemies();
    }
}
export function handleEditMouseDragStopped(): void {
    editingAreaState.initialObjectPosition = null;
}

function dragLocationDefinition(definition: LocationDefinition, dx: number, dy: number) {
    if (!editingAreaState.initialObjectPosition) {
        editingAreaState.initialObjectPosition = {
            x: definition.x || 0,
            y: definition.y || 0,
            z: definition.z || 0,
        };
    }
    definition.x = Math.round(dx + editingAreaState.initialObjectPosition.x);
    const targetY = Math.round(-dy
        + editingAreaState.initialObjectPosition.y
        - (MAX_Z - editingAreaState.initialObjectPosition.z) / 2);
    if (targetY <= 0) {
        definition.y = 0;
        definition.z = MAX_Z + targetY * 2
    } else {
        definition.y = targetY;
        definition.z = MAX_Z;
    }
}

function moveSelectedTarget(dx: number, dy: number): boolean {
    const { selectedMonsterIndex, selectedObject } = editingAreaState;
    if (selectedObject && selectedObject.definition) {
        moveObject(selectedObject, dx, dy);
        return true;
    }
    if (selectedMonsterIndex >= 0) {
        moveMonsterDefinition(getAreaDefinition().monsters[selectedMonsterIndex], dx, dy);
        return true;
    }
    return false;
}

function uniqueAreaId(): string {
    let zoneKey = getCurrentArea().zoneKey;
    let i = 2, id: string = zoneKey;
    while (zones[zoneKey][id]) {
        id = 'newArea' + (i++);
    }
    return id;
}

export function moveLocationDefinition(definition: LocationDefinition, dx: number, dy: number, dz: number): void {
    definition.x = (definition.x || 0 ) + dx;
    definition.y = (definition.y || 0 ) + dy;
    definition.z = (definition.z || 0 ) + dz;
    // Move items from the wall to the floor and vice-versa if they are aligned to the area
    // and hit the seam of the floor and back wall.
    if (!definition.parentKey) {
        if (definition.y < 0) {
            // Rather than move the object into the floor, start moving it along
            // the z-axis when it hits the floor.
            definition.z += definition.y;
            definition.y = 0;
        } else if (definition.y > 0 && definition.z < MAX_Z) {
            // Conversely, if something is moved up in the y direction, but isn't up against the back wall,
            // move it back in the z-direction before moving it up the wall.
            definition.z += definition.y;
            // If they moved it all the way to the back wall, start moving up the wall.
            definition.y = Math.max(0, definition.z - MAX_Z);
            definition.z = Math.min(definition.z, MAX_Z);
        }
    }
}

export function boundZPosition(definition: LocationDefinition, d: number): void {
    if (definition.y > 0) {
        definition.z += definition.y * 2;
        definition.y = 0;
    }
    if (definition.zAlign === 'back') {
        definition.z = Math.max(2 * MIN_Z + d, Math.min(0, definition.z));
    } else if (definition.zAlign === 'front') {
        definition.z = Math.max(0, Math.min(MAX_Z - MIN_Z - d, definition.z));
    } else {
        definition.z = Math.max(MIN_Z + d / 2, Math.min(MAX_Z - d / 2, definition.z));
    }
}

export function handleEditAreaKeyDown(keyCode: number): boolean {
    const { isEditing, selectedMonsterIndex, selectedObject } = editingAreaState;
    if ((isKeyDown(KEY.COMMAND) || isKeyDown(KEY.CONTROL)) && keyCode === KEY.E) {
        if (isEditing) {
            stopEditing();
        } else {
            startEditing();
        }
        return true;
    }
    if (!isEditing) {
        return false;
    }
    const area = getState().selectedCharacter.hero.area;
    if (isKeyDown(KEY.COMMAND) || isKeyDown(KEY.CONTROL)) {
        if (keyCode === KEY.UP) {
            changeObjectOrder(selectedObject, -10);
        } else if (keyCode === KEY.DOWN) {
            changeObjectOrder(selectedObject, 10);
        } else if (keyCode === KEY.LEFT) {
            changeObjectOrder(selectedObject, -1);
        } else if (keyCode === KEY.RIGHT) {
            changeObjectOrder(selectedObject, 1);
        }
        return true;
    }
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
    if (moveSelectedTarget(dx, dy)) {
        return true;
    }
    adjustCamera(10 * dx);
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
    if (x >= 0 && x < 30) {
        adjustCamera(-5);
    }
    if (x <= ADVENTURE_WIDTH && x > ADVENTURE_WIDTH - 30) {
        adjustCamera(5);
    }
    return true;
}

export function renderEditAreaOverlay(context: CanvasRenderingContext2D): void {
    const { isEditing, selectedObject, selectedMonsterIndex } = editingAreaState;
    if (!isEditing) {
        return;
    }
    const area = getCurrentArea();
    const areaDefinition = getAreaDefinition();
    context.save();
        context.globalAlpha = 0.5;
        for (let i =0; i < (areaDefinition.monsters || []).length; i++) {
            const monster = areaDefinition.monsters[i];
            renderMonsterFromDefinition(context, area, monster, i === selectedMonsterIndex && isKeyDown(KEY.SHIFT));
        }
    context.restore();
    let parentKey = null;
    if (selectedMonsterIndex >= 0) {
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
    // This will bound the camera to the edges of the zone, in case it changed size.
    adjustCamera(0);
    refreshPropertyPanel();
}

export function getEditingContextMenu(): MenuOption[] {
    const area = getCurrentArea();
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
                    startEditing();
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
                stopEditing();
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
        ...(!isWallDecoration ? [{
            getLabel() {
                return 'Add monster...';
            },
            getChildren() {
                return getMonsterTypeMenuItems(monsterKey => {
                    const areaDefinition = getAreaDefinition();
                    const [x, y] = editingAreaState.contextCoords;
                    areaDefinition.monsters = areaDefinition.monsters || [];
                    areaDefinition.monsters.push({
                        key: monsterKey,
                        level: areaDefinition.monsters[0]?.level || 1,
                        location: {x: editingAreaState.cameraX + x, y: 0, z: (GROUND_Y - y) * 2}
                    });
                    // Select the newly created monster.
                    editingAreaState.selectedMonsterIndex = areaDefinition.monsters.length - 1;
                    refreshEnemies();
                });
            }
        }]: []),
        getAreaContextMenuOption(),
        getZoneContextMenuOption(),
        ...getSelectedObjectContextMenu(),
        ...getSelectedMonsterContextMenu(),
    ];
}

export function createObjectAtContextCoords(definition: AreaObjectDefinition, objectKey: string = null): AreaObject {
    const area = getState().selectedCharacter.hero.area;
    if (!objectKey) {
        objectKey = uniqueObjectId(definition.type, area);
    }
    return createObjectAtScreenCoords(definition, editingAreaState.contextCoords, objectKey);
}

export function refreshPropertyPanel(): void {
    if (editingAreaState.selectedMonsterIndex >= 0) {
        displayPropertyPanel(getSelectedMonsterProperties());
    } else if (editingAreaState.selectedObject) {

    } else {
        displayPropertyPanel(getAreaProperties());
    }
}

function startEditing() {
    editingAreaState.isEditing = true;
    editingAreaState.cameraX = getState().selectedCharacter.hero.area.cameraX;
    refreshPropertyPanel();
}

export function stopEditing() {
    editingAreaState.isEditing = false;
    editingAreaState.selectedObject = null;
    editingAreaState.selectedMonsterIndex = -1;
    hidePropertyPanel();
}

export function getAreaContextMenuOption(): MenuOption {
    const area = getCurrentArea();
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
                        promptToCreateNewArea(area.zoneKey);
                    }
                },
                ...(area.zoneKey === 'guild' ? [{
                    getLabel() {
                        return getState().savedState.unlockedGuildAreas[area.key] ? 'Restore Monsters' : 'Unlock Guild Area';
                    },
                    onSelect() {
                        const unlockedGuildAreas = getState().savedState.unlockedGuildAreas;
                        if (unlockedGuildAreas[area.key]) {
                            unlockedGuildAreas[area.key] = null;
                            removeAreaFurnitureBonuses(area, true);
                        } else {
                            unlockedGuildAreas[area.key] = true;
                            addAreaFurnitureBonuses(area, true);
                        }
                        refreshEnemies();
                    }
                }] : []),
            ];
        }
    };
}
function changeArea(zoneKey: ZoneType, areaKey: string) {
    enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, zoneKey, areaKey});
    refreshPropertyPanel();
}

export function getAreaProperties(this: void): (EditorProperty<any> | PropertyRow | string)[] {
    const area = getCurrentArea();
    const areaDefinition = getAreaDefinition();
    const props: (EditorProperty<any> | PropertyRow | string)[] = [];
    const currentZone: EditorProperty<string> = {
        name: 'Zone',
        value: area.zoneKey,
        values: Object.keys(zones),
        onChange(zoneKey: ZoneType) {
            const areaKey = Object.keys(zones[zoneKey])[0];
            changeArea(zoneKey, areaKey);
        },
    };
    const currentArea: EditorProperty<string> = {
        name: 'Area',
        value: area.key,
        values: Object.keys(zones[area.zoneKey]),
        onChange(areaKey: string) {
            changeArea(area.zoneKey, areaKey);
        },
    };
    props.push([currentZone, currentArea]);
    props.push(['Export', {
        name: 'Clipboard',
        onClick() {
            navigator.clipboard.writeText(serializeZone(area.zoneKey));
        },
    }, {
        name: 'File',
        onClick() {
            saveToFile(serializeZone(area.zoneKey), `${area.zoneKey}.ts`, 'text/javascript');
        },
    }]);
    props.push({
        name: 'key',
        value: area.key,
        onChange(newValue: string) {
            console.log(newValue);
            if (!newValue.match(/^[a-zA-Z]\w*$/)) {
                return area.key;
            }
        },
    });
    props.push({
        name: 'type',
        value: areaDefinition.type,
        values: Object.keys(areaTypes),
        onChange(type) {
            updateAreaDefinition({type});
        },
    });
    props.push([
        'Walls',
        {
            name: 'left',
            value: areaDefinition.leftWallType || 'none',
            values: ['none', ...Object.keys(areaWalls)],
            onChange(leftWallType: string) {
                if (leftWallType === 'none') {
                    leftWallType = null;
                }
                updateAreaDefinition({leftWallType});
            },
        },
        {
            name: 'right',
            value: areaDefinition.rightWallType || 'none',
            values: ['none', ...Object.keys(areaWalls)],
            onChange(rightWallType: string) {
                if (rightWallType === 'none') {
                    rightWallType = null;
                }
                updateAreaDefinition({rightWallType});
            },
        },
    ]);
    props.push({
        name: 'width',
        value: area.width,
        onChange: (width: number) => {
            if (isNaN(width)) {
                return area.width;
            }
            updateAreaDefinition({width});
        },
    });
    props.push([{
        name: 'seed',
        value: area.seed || 0,
        onChange(seed: number) {
            if (isNaN(seed)) {
                return area.seed;
            }
            updateAreaDefinition({seed});
        },
    }, {
        name: 'Random',
        onClick()  {
            updateAreaDefinition({seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)});
        },
    }]);

    return props;
}

export function getSelectedObjectContextMenu(): MenuOption[] {
    const {contextCoords, selectedObject} = editingAreaState;
    if (!selectedObject
        || !selectedObject.isPointOver(contextCoords[0], contextCoords[1])
        || !selectedObject.definition
    ) {
        return [];
    }
    return getObjectContextMenu(selectedObject);
}

export function getSelectedMonsterContextMenu(): MenuOption[] {
    const {contextCoords, selectedMonsterIndex} = editingAreaState;
    const monsterDefinition: MonsterDefinition = (getAreaDefinition().monsters || [])[selectedMonsterIndex];
    // Only add monster context options if the mouse is actually over the monster.
    if (!monsterDefinition
        || !new MonsterDefinitionAreaObject(getCurrentArea(), selectedMonsterIndex).isPointOver(contextCoords[0], contextCoords[1])
    ) {
        return [];
    }
    return getMonsterContextMenu(monsterDefinition);
}

export function getSelectedMonsterProperties(this: void): (EditorProperty<any> | PropertyRow | string)[] {
    const { selectedMonsterIndex } = editingAreaState;
    const monsterDefinition = getAreaDefinition().monsters[selectedMonsterIndex];
    return getMonsterProperties(monsterDefinition, getCurrentArea());
}

function promptToCreateNewArea(zoneKey: ZoneType): void {
    const areaKey = window.prompt('New area key', uniqueAreaId());
    let areaDefinition = zones[zoneKey][areaKey];
    if (!areaDefinition) {
        const areaDefinition: AreaDefinition = {
            type: 'oldGuild',
            width: 600,
            objects: {},
            backgroundObjects: {},
            zoneKey,
        }
        zones[areaDefinition.zoneKey][areaKey] = areaDefinition;
    }
    changeArea(zoneKey, areaKey);
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
                        const zoneKey = window.prompt('New zone key', '');
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
                ...(area.zoneKey !== 'guild' ? [{
                        getLabel() {
                            return 'Reset zone';
                        },
                        onSelect() {
                            for (let areaKey in zones[area.zoneKey]) {
                                getArea(area.zoneKey, areaKey, true);
                            }
                            // This makes a new instance of the current area, so move the hero to that new instance.
                            const hero = getState().selectedCharacter.hero;
                            enterArea(hero, {x: hero.x, z: hero.z, zoneKey: area.zoneKey, areaKey: area.key});
                            refreshPropertyPanel();
                        }
                    }] : []),
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
        changeArea(zoneKey, areaKey);
        break;
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

