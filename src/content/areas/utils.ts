import {
    Area, AreaDefinition, AreaObject, AreaObjectDefinition,
    FrameAnimation, MonsterSpawn,
} from 'app/types'

import { areaObjectFactories, getPositionFromLocationDefinition } from 'app/content/areas';
import { addAreaFurnitureBonuses, removeAreaFurnitureBonuses } from 'app/content/furniture';
import { getState } from 'app/state';
import { createAnimation, frame } from 'app/utils/animations';
import { r } from 'app/utils/index';

const river = createAnimation('gfx2/areas/meadowbridge.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const caveWall = createAnimation('gfx2/areas/cavebridge2.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const guildWall = createAnimation('gfx2/areas/guildbridge.png', frame(0, 0, 39, 148, r(11, 50, 20, 70)));
const straightGuildWall = createAnimation('gfx2/areas/guildsidewall.png', {w: 40, h: 148});
export const areaWalls: {[key in string]: FrameAnimation} = {
    caveWall,
    river,
    guildWall,
    straightGuildWall
};

export function createAreaObjectFromDefinition(areaObjectDefinition: AreaObjectDefinition): AreaObject {
    const factory = areaObjectFactories[areaObjectDefinition.type];
    if (!factory) {
        console.log('Missing factory for type', areaObjectDefinition.type, areaObjectDefinition)
        debugger;
    }
    return factory.createFromDefinition(areaObjectDefinition);
}

export function createNewArea(areaKey: string): Area {
    return {
        areaType: 'meadow',
        key: areaKey,
        width: 600,
        objects: [],
        backgroundObjects: [],
        allies: [],
        enemies: [],
        cameraX: 0,
        time: 0,
        projectiles: [],
        effects: [],
        textPopups: [],
        treasurePopups: [],
        objectsByKey: {},
        seed: null,
    };
}

export function createAreaFromDefinition(areaKey: string, areaDefinition: AreaDefinition): Area {
    return applyDefinitionToArea(createNewArea(areaKey), areaDefinition);
}

export function applyDefinitionToArea(area: Area, areaDefinition: AreaDefinition): Area {
    area.areaType = areaDefinition.type;
    area.width = areaDefinition.width;
    area.zoneKey = areaDefinition.zoneKey,
    area.seed = areaDefinition.seed;
    if (areaDefinition.leftWallType) {
        area.leftWall = areaWalls[areaDefinition.leftWallType];
    } else {
        area.leftWall = null;
    }
    if (areaDefinition.rightWallType) {
        area.rightWall = areaWalls[areaDefinition.rightWallType];
    } else {
        area.rightWall = null;
    }
    const state = getState();
    // Only update the bonuses if the guildVariableObject is ready to receive bonuses. If it isn't, bonuses will be applied
    // after it is created.
    const updatedBonuses = area.zoneKey === 'guild' && state.guildVariableObject && state.savedState.unlockedGuildAreas[area.key];
    // Since the objects get remade in this operation, the only consistent way to apply the bonuses correctly
    // is to remove the existing ones and then add them again after they are recreated.
    if (updatedBonuses) {
        removeAreaFurnitureBonuses(area, false);
    }
    area.objectsByKey = {};
    area.objects = [];
    for (const objectKey in areaDefinition.objects) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.objects[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.objects.push(object);
    }
    area.backgroundObjects = [];
    for (const objectKey in areaDefinition.backgroundObjects) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.backgroundObjects[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.backgroundObjects.push(object);
    }
    if (updatedBonuses) {
        addAreaFurnitureBonuses(area, true);
    }
    return area;
}
