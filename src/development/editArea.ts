import _ from 'lodash';
import { addMonstersFromAreaDefinition, enterArea, getArea } from 'app/adventure';
import { addAreaFurnitureBonuses, removeAreaFurnitureBonuses } from 'app/content/furniture';
import { missions, setupMission } from 'app/content/missions';
import { getMonsterDefinitionAreaEntity, makeMonster, monsters } from 'app/content/monsters';
import { serializeZone, zones } from 'app/content/zones';
import {
    applyDefinitionToArea,
    areaObjectFactories, areaTargetToScreenTarget, areaTypes, areaWalls,
    createAreaObjectFromDefinition, createAreaFromDefinition,
    getPositionFromLocationDefinition, isPointOverAreaTarget,
} from 'app/content/areas';
import { displayPropertyPanel, hidePropertyPanel } from 'app/development/propertyPanel';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, BACKGROUND_HEIGHT, GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getBasicAttack } from 'app/performAttack';
import { renderMonsterFromDefinition } from 'app/render/drawActor';
import { getState } from 'app/state';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';
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
    selectedMonsterIndex: null,
    cameraX: null,
    contextCoords: null,
}
window['editingAreaState'] = editingAreaState;

function getCurrentArea(): Area {
    return getState().selectedCharacter.hero.area;
}
function getAreaDefinition(): AreaDefinition {
    const area: Area = getCurrentArea();
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

// Note this actually fires on mousedown, not on click.
export function handleEditAreaClick(x: number, y: number): void {
    //console.log('click', x, y);
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    const areaDefinition = getAreaDefinition();
    editingAreaState.selectedMonsterIndex = null;
    editingAreaState.selectedObject = null;
    editingAreaState.initialObjectPosition = null;
    hidePropertyPanel();
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
                displayPropertyPanel(getSelectedMonsterProperties());
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

export function handleEditMouseDragged(x: number, y: number, sx: number, sy: number): void {
    const { selectedMonsterIndex, selectedObject } = editingAreaState;
    const dx = x - sx, dy = y - sy;
    if (selectedObject) {
        const area = getCurrentArea();
        dragLocationDefinition(selectedObject.definition, dx, dy);
        // Objects on the wall aren't bound by the z limits.
        if (!area.wallDecorations.includes(selectedObject)) {
            boundZPosition(selectedObject.definition, selectedObject.getAreaTarget().d);
            selectedObject.definition.y = 0;
        }
        refreshDefinition(selectedObject);
    } else if (selectedMonsterIndex >= 0) {
        const monster = getAreaDefinition().monsters[selectedMonsterIndex];
        dragLocationDefinition(monster.location, dx, dy);
        boundZPosition(monster.location, getMonsterDefinitionAreaEntity(getCurrentArea(), monster).d);
        monster.location.y = 0;
        refreshEnemies();
    }
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
    if (selectedMonsterIndex !== null) {
        moveMonsterDefinition(getAreaDefinition().monsters[selectedMonsterIndex], dx, dy);
        return true;
    }
    return false;
}

export function uniqueObjectId(base: string, area: Area): string {
    let i = 2, id = base;
    while (area.objectsByKey[id]) {
        id = base + (i++);
    }
    return id;
}
function uniqueAreaId(): string {
    let zoneKey = getCurrentArea().zoneKey;
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
}

function moveLocationDefinition(definition: LocationDefinition, dx: number, dy: number, dz: number): void {
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

function boundZPosition(definition: LocationDefinition, d: number): void {
    if (definition.zAlign === 'back') {
        definition.z = Math.max(2 * MIN_Z + d, Math.min(0, definition.z));
    } else if (definition.zAlign === 'front') {
        definition.z = Math.max(0, Math.min(2 * MAX_Z - d, definition.z));
    } else {
        definition.z = Math.max(MIN_Z + d / 2, Math.min(MAX_Z - d / 2, definition.z));
    }
}

function moveMonsterDefinition(definition: MonsterDefinition, dx: number, dy: number): void {
    moveLocationDefinition(definition.location, dx, 0, -2 * dy);
    boundZPosition(definition.location, getMonsterDefinitionAreaEntity(getCurrentArea(), definition).d);
    definition.location.y = 0;
    refreshEnemies();
}

function moveObject(object: AreaObject, dx: number, dy: number): void {
    const area = getState().selectedCharacter.hero.area;
    if (area.wallDecorations.includes(object)) {
        moveLocationDefinition(object.definition, dx, -dy, 0);
    } else {
        moveLocationDefinition(object.definition, dx, 0, -dy * 2);
        boundZPosition(object.definition, object.getAreaTarget().d);
        object.definition.y = 0;
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

function changeObjectOrder(object: AreaObject, dz: number ): void {
    if (!object) {
        return;
    }
    const area = getCurrentArea();
    const areaDefinition = getAreaDefinition();
    const hewHash = {};
    if (area.wallDecorations.indexOf(object) >= 0) {
        areaDefinition.wallDecorations
            = changeOrderInHash(object.definition, areaDefinition.wallDecorations, dz);
    } else if (area.objects.indexOf(object) >= 0) {
        areaDefinition.objects
            = changeOrderInHash(object.definition, areaDefinition.objects, dz);
    } else {
        console.error('Object not found in area', object, area);
    }
    applyDefinitionToArea(area, areaDefinition);
    // Update the selected object as it gets replaced when we refresh the area.
    editingAreaState.selectedObject = area.objectsByKey[object.key];
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
                    displayPropertyPanel(getSelectedMonsterProperties());
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

function startEditing() {
    editingAreaState.isEditing = true;
    editingAreaState.cameraX = getState().selectedCharacter.hero.area.cameraX;
}

export function stopEditing() {
    editingAreaState.isEditing = false;
    editingAreaState.selectedObject = null;
    editingAreaState.selectedMonsterIndex = null;
    hidePropertyPanel();
}

export function getSelectedMonsterContextMenu(): MenuOption[] {
    const {contextCoords, selectedMonsterIndex} = editingAreaState;
    const area = getCurrentArea();
    const areaDefinition = getAreaDefinition();
    const monsterDefinition: MonsterDefinition = (areaDefinition.monsters || [])[selectedMonsterIndex];
    if (!monsterDefinition
        || !new MonsterDefinitionAreaObject(area, selectedMonsterIndex).isPointOver(contextCoords[0], contextCoords[1])
    ) {
        return [];
    }
    const monsterData = monsters[monsterDefinition.key];
    const name = monsterData.name || monsterDefinition.key;
    return [
        {
            label: 'Change type...',
            getChildren() {
                return getMonsterTypeMenuItems(monsterKey => {
                    monsterDefinition.key = monsterKey;
                    refreshEnemies();
                });
            }
        },
        {
            label: 'Set level...',
            getChildren() {
                return [
                    ...[-10, -5, -3, -1, 1, 3, 5, 10].map(n => monsterDefinition.level + n).filter(n => n >= 1 && n <= 100).map(level => ({
                        label: 'Level ' + level,
                        onSelect() {
                            monsterDefinition.level = level;
                            refreshEnemies();
                        }
                    })),
                    {
                        label: 'Custom...',
                        onSelect() {
                            const level = parseInt(prompt('Enter level'));
                            if (level >= 1 && level <= 100) {
                                monsterDefinition.level = level;
                                refreshEnemies();
                            }
                        }
                    },
               ];
            }
        },
        {
            label: monsterDefinition.isTarget ? 'Remove From Targets' : 'Add to Targets',
            onSelect() {
                monsterDefinition.isTarget = !monsterDefinition.isTarget;
                refreshEnemies();
            }
        },
        {
            label: 'Flip ' + name,
            onSelect() {
                monsterDefinition.location.flipped = !monsterDefinition.location.flipped;
                refreshEnemies();
            }
        },
        {},
        {
            label: 'Delete ' + name,
            onSelect() {
                areaDefinition.monsters.splice(selectedMonsterIndex, 1);
                editingAreaState.selectedMonsterIndex = null;
                hidePropertyPanel();
                refreshEnemies();
            }
        },
    ]
}

function fix(number: number, digits: number = 1): string {
    return abbreviate(fixedDigits(number, digits));
}

export function getSelectedMonsterProperties(this: void): (EditorProperty | PropertyRow | string)[] {
    const { selectedMonsterIndex } = editingAreaState;
    const monsterDefinition = getAreaDefinition().monsters[selectedMonsterIndex];
    const monster: Monster =  makeMonster(getCurrentArea(), monsterDefinition.key, monsterDefinition.level, [], monsterDefinition.rarity);
    let attack = getBasicAttack(monster);
    const props: (EditorProperty | PropertyRow | string)[] = [];
    props.push(`Lvl ${monster.stats.level} ${monster.name}`);
    props.push([{
        name: 'Max Health',
        value: monster.stats.maxHealth,
    },{
        name: 'MPow',
        value: fix(monster.stats.magicPower),
    }]);
    props.push([{
        name: 'Phys',
        value: fix(attack.stats.minPhysicalDamage) + '-' + fix(attack.stats.maxPhysicalDamage),
    },{
        name: 'Mag',
        value: fix(attack.stats.minMagicDamage) + '-' + fix(attack.stats.maxMagicDamage),
    }]);
    props.push([{
        name: 'AtkSpd',
        value: fix(attack.stats.attackSpeed),
    },{
        name: 'Range',
        value: fix(attack.stats.range),
    },{
        name: 'Speed',
        value: fix(monster.stats.speed),
    }]);
    props.push([{
        name: 'Crt%',
        value: percent(attack.stats.critChance),
    },{
        name: 'Dam*',
        value: fix(1 + attack.stats.critDamage),
    },{
        name: 'Acc*',
        value: fix(1 + attack.stats.critAccuracy),
    }]);
    props.push([{
        name: 'Armor',
        value: fix(monster.stats.armor),
    },{
        name: 'MRes',
        value: fix(monster.stats.magicResist),
    }]);
    props.push([{
        name: 'PBlock',
        value: fix(monster.stats.block),
    },{
        name: 'MBlock',
        value: fix(monster.stats.magicBlock),
    }]);
    return props;
}

export function getMonsterTypeMenuItems(callback: (monsterKey: string) => void): MenuOption[] {
    return Object.keys(monsters).map(monsterKey => ({
        getLabel() {
            return monsters[monsterKey].name || monsterKey;
        },
        onSelect() {
            callback(monsterKey);
        }
    }));
}

function refreshEnemies() {
    const area = getCurrentArea();
    if (area.zoneKey !== 'guild' || !getState().savedState.unlockedGuildAreas[area.key]) {
        addMonstersFromAreaDefinition(area);
        // The above call replaces the enemies array, so we need to reassign it to the character.
        getState().selectedCharacter.hero.enemies = area.enemies;
    } else {
        getState().selectedCharacter.hero.enemies = area.enemies = [];
    }
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
                            delete unlockedGuildAreas[area.key];
                            removeAreaFurnitureBonuses(area, true);
                        } else {
                            unlockedGuildAreas[area.key] = true;
                            addAreaFurnitureBonuses(area, true);
                        }
                        refreshEnemies();
                    }
                }] : []),
                {
                    getLabel() {
                        return 'Goto...';
                    },
                    getChildren() {
                        return Object.keys(zones[getCurrentArea().zoneKey]).map((areaKey: string): MenuOption => {
                            return {
                                getLabel: () => areaKey,
                                onSelect() {
                                    enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, areaKey});
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
                            ...[-200, -100, -50, -20, 20, 50, 100, 200].map(s => getCurrentArea().width + s)
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
    const areaKey = window.prompt('New area key', uniqueAreaId());
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
                        }
                    }] : []),
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
                                                enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, zoneKey, areaKey});
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
        enterArea(getState().selectedCharacter.hero, {x: 60, z: 0, zoneKey, areaKey});
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

