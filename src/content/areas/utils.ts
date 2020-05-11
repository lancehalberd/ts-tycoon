import {
    Area, AreaDefinition, AreaObject, AreaObjectDefinition,
    FrameAnimation, MonsterSpawn,
} from 'app/types'

import { areaObjectFactories, getPositionFromLocationDefinition } from 'app/content/areas';

import { createAnimation, frame } from 'app/utils/animations';
import { r } from 'app/utils/index';

const river = createAnimation('gfx2/areas/meadowbridge.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const caveWall = createAnimation('gfx2/areas/cavebridge.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const guildWall = createAnimation('gfx2/areas/guildbridge.png', frame(0, 0, 39, 148, r(11, 50, 20, 70)));
export const areaWalls: {[key in string]: FrameAnimation} = {
    caveWall,
    river,
    guildWall,
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
        wallDecorations: [],
        monsters: [],
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
    area.monsters = areaDefinition.monsters ? areaDefinition.monsters.map(monster => {
        return {
            ...monster,
            location: getPositionFromLocationDefinition(area, {w: 30, h: 30, d: 30}, monster.location)
        };
    }) : [];
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
    area.objectsByKey = {};
    area.objects = [];
    for (const objectKey in areaDefinition.objects) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.objects[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.objects.push(object);
    }
    area.wallDecorations = [];
    for (const objectKey in areaDefinition.wallDecorations) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.wallDecorations[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.wallDecorations.push(object);
    }
    return area;
}
