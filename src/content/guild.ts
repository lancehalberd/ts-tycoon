import { Bed, HeroApplication, createAreaFromDefinition } from 'app/content/areas';
import { areaDefinitions } from 'app/content/areaDefinitions';
import { drawFrame, getFrame } from 'app/utils/animations';

import {
    Area, AreaDefinition, AreaObject, AreaObjectDefinition, Exit, FixedObject,
    GuildArea, GuildAreas,
} from 'app/types';

export const guildYardEntrance: Exit = {areaKey: 'guildYard', x: 120, z: 0};

export function getDefaultGuildAreas(): GuildAreas {
    // We need to reset these each time this function is called, otherwise we will
    // double up on beds/applications.
    HeroApplication.instances = [];
    Bed.instances = [];
    const guildAreas: GuildAreas = {};
    for (let areaKey in areaDefinitions) {
        const area: Area = createAreaFromDefinition(areaKey, areaDefinitions[areaKey]);
        if (area.isGuildArea === true) {
            guildAreas[areaKey] = area;
        }
    }
    return guildAreas;
    /*
    {
        const width = 600;
        guildAreas.guildFrontHall = initializeGuildArea({
            'key': 'guildFrontHall',
            width,
            areaType: 'oldGuild',
            'wallDecorations': [
                guildObject('candles', [70, 12, wallZ], {'xScale': -1, 'scale': 1}),
                guildObject('door', [125, 0, wallZ], {'exit': {'areaKey': 'guildGuestRoom', 'x': 160, 'z': MAX_Z - 24}, 'scale': 1}),
                guildObject('candles', [width / 2 - 30, 24, wallZ], {'xScale': -1, 'scale': 1}),
                guildObject('door', [width / 2, 0, wallZ], {'exit': {'areaKey': 'guildKitchen', 'x': 160, 'z': MAX_Z - 24}, 'scale': 1}),
                guildObject('candles', [width / 2 + 30, 24, wallZ], {'scale': 1}),
                guildObject('candles', [width - 70, 12, wallZ], {'scale': 1}),
                //guildObject('downstairs', [200, 0, wallZ], {'exit': {'areaKey': 'guildBasement', 'x': 800, 'z': 150}, 'scale': 1}),
                new AreaDoor(true, {areaKey: 'guildFoyer', x: 400 - 48, z: 0}, AreaDoor.openDoorFrame),
                new AreaDoor(false, {'areaKey': 'guildBasement', 'x': 250 - 48, 'z': MAX_Z - 24}, AreaDoor.openDoorFrame),
            ],
            'objects': [
                guildObject('jewelShrine', [width / 2, 0, 0], {'scale': 1}),
                guildObject('coinStash', [175, 0, MAX_Z - 15], {'level': 1, 'key': 'coinStashA'}),
                guildObject('coinStash', [200, 0, MAX_Z - 15], {'level': 2, 'key': 'coinStashB'}),
                guildObject('trophyAltar', [width / 4, 0, 0], {'scale': 1, 'key': 'trophyAltarA'}),
                guildObject('trophyAltar', [3 * width / 4, 0, 0], {'scale': 1, 'key': 'trophyAltarB'}),
            ],
            'monsters': [
                {key: 'spider', level: 3, location: [width / 2, 0, 40]},
                {key: 'gnome', level: 3, location: [width - 100, 0, 0]},
            ],
            'leftWall': areaWalls.guildWall,
            'rightWall': areaWalls.guildWall,
        }, 3);
    }

    {
        const width = 320;
        guildAreas.guildGuestRoom = initializeGuildArea({
            'key': 'guildGuestRoom',
            width,
            areaType: 'oldGuild',
            'wallDecorations': [
                guildObject('candles', [130, 12, wallZ], {'xScale': -1, 'scale': 1}),
                guildObject('door', [160, 0, wallZ], {'exit': {'areaKey': 'guildFrontHall', 'x': 125, 'z': MAX_Z - 24}, 'scale': 1}),
                guildObject('candles', [190, 12, wallZ], {'scale': 1}),
            ],
            'objects': [
                guildObject('bed', [60, 0, MAX_Z - 15], {'scale': 1, 'xScale': -1}),
                guildObject('bed', [width - 60, 0, MAX_Z - 15], {'scale': 1, 'xScale': -1}),
                guildObject('coinStash', [20, 0, MIN_Z + 15], {'level': 1, 'key': 'coinStashA'}),
                guildObject('coinStash', [width - 20, 0, MIN_Z + 15], {'level': 1, 'key': 'coinStashB'}),
            ],
            'leftWall': areaWalls.guildWall,
            'rightWall': areaWalls.guildWall,
        }, 4);
    }

    guildAreas.guildKitchen = initializeGuildArea({
        'key': 'guildKitchen',
        'width': 400,
        areaType: 'oldGuild',
        'wallDecorations': [
            guildObject('candles', [215, 50, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('candles', [835, 50, wallZ], {'scale': 1.5}),
            guildObject('door', [150, 0, wallZ], {'exit': {'areaKey': 'guildFrontHall', 'x': 600, 'z': 150}, 'scale': 1}),
        ],
        'objects': [
            guildObject('trophyAltar', [600, 0, 0], {'scale': 1}),
        ],
        'monsters': [
            {key: 'motherfly', level: 6, location: [400, 0, 40]},
            {key: 'giantSpider', level: 6, location: [880, 0, 0]},
        ],
        'leftWall': areaWalls.guildWall,
        'rightWall': areaWalls.guildWall,
    }, 5);

    guildAreas.guildBasement = initializeGuildArea({
        'key': 'guildBasement',
        'width': 350,
        areaType: 'guildBasement',
        'wallDecorations': [
            guildObject('candles', [740, 50, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('candles', [860, 50, wallZ], {'scale': 1.5}),
            guildObject('upstairs', [800, 0, wallZ], {'exit': {'areaKey': 'guildFrontHall', 'x': 800, 'z': 150}, 'scale': 1}),
        ],
        'objects': [
            guildObject('trophyAltar', [600, 0, 0], {'scale': 1}),
        ],
        'monsters': [
            {key: 'vampireBat', level: 15, location: [100, 0, 40]},
            {key: 'vampireBat', level: 15, location: [100, 0, -40]},
            {key: 'vampireBat', level: 15, location: [600, 0, 0]},
        ],
        'leftWall': areaWalls.guildWall,
        'rightWall': areaWalls.guildWall,
    }, 6);

    guildAreas.guildVault = initializeGuildArea({
        'key': 'guildVault',
        'width': 320,
        areaType: 'guildBasement',
        'wallDecorations': [
            guildObject('candles', [215, 50, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('candles', [585, 50, wallZ], {'scale': 1.5}),
        ],
        'objects': [
            guildObject('coinStash', [310, 0, -150], {'level': 1, 'key': 'coinStashA'}),
            guildObject('coinStash', [310, 0, 150], {'level': 1, 'key': 'coinStashB'}),
            guildObject('coinStash', [240, 0, -150], {'level': 1, 'key': 'coinStashC'}),
            guildObject('coinStash', [240, 0, 150], {'level': 1, 'key': 'coinStashD'}),
            guildObject('coinStash', [170, 0, -130], {'level': 2, 'key': 'coinStashE'}),
            guildObject('coinStash', [170, 0, 130], {'level': 2, 'key': 'coinStashF'}),
            guildObject('coinStash', [120, 0, -90], {'level': 3, 'key': 'coinStashH'}),
            guildObject('coinStash', [120, 0, 90], {'level': 3, 'key': 'coinStashI'}),
            guildObject('coinStash', [90, 0, 0], {'level': 4, 'key': 'coinStashJ'}),
        ],
        'leftWall': areaWalls.guildWall,
        'rightWall': areaWalls.guildWall,
    }, 7);*/
}
export function drawRightWall(context: CanvasRenderingContext2D, guildArea: Area) {
    const frame = getFrame(guildArea.rightWall, guildArea.time);
    if (guildArea.cameraX + 320 < guildArea.width - frame.w) return;
    if (!guildArea.rightWall) return;
    const target = {
        ...frame,
        x: guildArea.width - guildArea.cameraX - frame.w,
        y: 0,
    }
    drawFrame(context, frame, target);
}
export function drawLeftWall(context, guildArea) {
    const frame = getFrame(guildArea.leftWall, guildArea.time);
    if (guildArea.cameraX > frame.w) return;
    if (!guildArea.leftWall) return;
    context.save();
        context.translate(frame.w - guildArea.cameraX, 0);
        context.scale(-1, 1);
        drawFrame(context, frame, {...frame, x: 0, y: 0});
    context.restore();
}
