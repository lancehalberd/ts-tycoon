import { FrameAnimation, Area, AreaDefinition, AreaObject, AreaObjectDefinition } from 'app/types'

import { areaObjectFactories } from 'app/content/areas';

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

export function createAreaFromDefinition(areaKey: string, areaDefinition: AreaDefinition): Area {
    const area: Area = {
        areaType: areaDefinition.type,
        key: areaKey,
        width: areaDefinition.width,
        objects: [],
        wallDecorations: [],
        monsters: areaDefinition.monsters,
        allies: [],
        enemies: [],
        cameraX: 0,
        time: 0,
        projectiles: [],
        effects: [],
        textPopups: [],
        treasurePopups: [],
        objectsByKey: {},
        isGuildArea: areaDefinition.isGuildArea,
        seed: areaDefinition.seed,
    };
    if (areaDefinition.leftWallType) {
        area.leftWall = areaWalls[areaDefinition.leftWallType];
    }
    if (areaDefinition.rightWallType) {
        area.rightWall = areaWalls[areaDefinition.rightWallType];
    }
    for (const objectKey in areaDefinition.objects) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.objects[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.objects.push(object);
    }
    for (const objectKey in areaDefinition.wallDecorations) {
        const object: AreaObject = createAreaObjectFromDefinition(areaDefinition.wallDecorations[objectKey]);
        object.area = area;
        object.key = objectKey;
        area.objectsByKey[objectKey] = object;
        area.wallDecorations.push(object);
    }
    return area;
}
