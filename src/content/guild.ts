import { allApplications, allBeds, guildObject } from 'app/content/furniture';
import { createCanvas, mainContext } from 'app/dom';
import { MAX_Z } from 'app/gameConstants';
import { drawImage, drawOutlinedImage, requireImage } from 'app/images';
import { drawTextureMap } from 'app/render/drawTextureMap';
import { getCanvasPopupTarget } from 'app/popup';
import { createAnimation, drawFrame, getFrame } from 'app/utils/animations';
import { rectangle } from 'app/utils/index';

import { Area, Exit, FixedObject, GuildArea, GuildAreas, RawGuildArea } from 'app/types';

export const guildYardEntrance: Exit = {areaKey: 'guildYard', x: 120, z: 0};

const wallOriginCoords = [-71, 213];
const wallDepth = 120;
const wallHeight = 130;
const wallCanvas = createCanvas(wallDepth, wallHeight);
const wallContext = wallCanvas.getContext('2d');

function initializeGuldArea(rawGuildArea: RawGuildArea): GuildArea {
    const guildArea: GuildArea = {
        objects: [],
        wallDecorations: [],
        monsters: [],
        ...rawGuildArea,
        isGuildArea: true,
        allies: [],
        enemies: [],
        left: 0,
        cameraX: 0,
        time: 0,
        projectiles: [],
        effects: [],
        textPopups: [],
        treasurePopups: [],
        objectsByKey: {},
    };
    for (const object of guildArea.objects) {
        object.area = guildArea;
        guildArea.objectsByKey[object.key] = object;
    }
    for (const wallDecoration of guildArea.wallDecorations) {
        wallDecoration.area = guildArea;
    }
    return guildArea;
}
const wallZ = MAX_Z;
const guildDoor = createAnimation(requireImage('gfx2/areas/plainDoorRight.png'), {x: 0, y: 0, w: 32, h: 148});
export function getDefaultGuildAreas(): GuildAreas {
    // We need to reset these each time this function is called, otherwise we will
    // double up on beds/applications.
    while (allApplications.length) allApplications.pop();
    while (allBeds.length) allBeds.pop();
    const guildAreas: GuildAreas = {};
    guildAreas.guildYard = initializeGuldArea({
        'key': 'guildYard',
        'width': 340,
        'backgroundPatterns': {'0': 'forest'},
        'wallDecorations': [],
        objects: [
            guildObject('stoneBridge', [12, 0, 0], {'xScale': -1, exit: {areaKey: 'worldMap', x: 0, z: 0}}),
            guildObject('stoneBridge', [328, 0, 0], {exit: {areaKey: 'guildFoyer', x: 48, z: 0}}),
        ],
        //'rightWall': guildDoor,
    });
    guildAreas.guildFoyer = initializeGuldArea({
        'key': 'guildFoyer',
        'width': 400,
        'backgroundPatterns': {'0': 'oldGuild'},
        'wallDecorations': [
            guildObject('heroApplication', [75, 15, wallZ]),
            guildObject('heroApplication', [110, 15, wallZ]),
            // Candles are 25px wide currently
            guildObject('candles', [50, 15, wallZ], {xScale: -1, scale: 1}),
            guildObject('candles', [150, 25, wallZ], {xScale: -1, scale: 1}),
            guildObject('candles', [225, 25, wallZ], {scale: 1}),
            guildObject('candles', [325, 15, wallZ], {scale: 1}),
        ],
        //'leftWall': guildDoor,
        //'rightWall': guildDoor,
        'objects': [
            guildObject('mapTable', [100, 0, 0], {'scale': 1}),
            guildObject('coinStash', [150, 0, MAX_Z - 10]),
            guildObject('woodenAltar', [190, 0, MAX_Z - 5], {'scale': 1}),
            guildObject('animaOrb', [230, 0, MAX_Z - 10], {'scale': 1}),
            guildObject('trophyAltar', [290, 0, 0], {'scale': 1}),
            guildObject('bed', [340, 0, MAX_Z - 15], {'scale': 1, 'xScale': -1}),
            guildObject('stoneBridge', [12, 0, 0], {'xScale': -1, exit: {areaKey: 'guildYard', x: 272, z: 0}}),
            guildObject('stoneBridge', [388, 0, 0], {exit: {areaKey: 'guildFrontHall', x: 48, z: 0}}),
        ],
        'monsters': [
            {key: 'gremlin', level: 1, location: [250, 0, 40]},
            {key: 'skeleton', level: 1, location: [360, 0, 0]},
        ],
    });
    guildAreas.guildFrontHall = initializeGuldArea({
        'key': 'guildFrontHall',
        'width': 400,
        'backgroundPatterns': {'0': 'oldGuild'},
        'wallDecorations': [
            guildObject('candles', [165, 50, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('door', [250, 0, wallZ], {'exit': {'areaKey': 'guildGuestRoom', 'x': 400, 'z': 150}, 'scale': 1}),
            guildObject('candles', [540, 70, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('door', [600, 0, wallZ], {'exit': {'areaKey': 'guildKitchen', 'x': 150, 'z': 150}, 'scale': 1}),
            guildObject('candles', [660, 70, wallZ], {'scale': 1.5}),
            guildObject('candles', [1035, 50, wallZ], {'scale': 1.5}),
            guildObject('downstairs', [800, 0, wallZ], {'exit': {'areaKey': 'guildBasement', 'x': 800, 'z': 150}, 'scale': 1}),
        ],
        'objects': [
            guildObject('stoneBridge', [12, 0, 0], {'xScale': -1, exit: {areaKey: 'guildFoyer', x: 400 - 48, z: 0}}),
            guildObject('jewelShrine', [600, 0, 0], {'scale': 1}),
            guildObject('coinStash', [340, 0, 165], {'level': 1, 'key': 'coinStashA'}),
            guildObject('coinStash', [400, 0, 165], {'level': 2, 'key': 'coinStashB'}),
            guildObject('trophyAltar', [300, 0, 0], {'scale': 1, 'key': 'trophyAltarA'}),
            guildObject('trophyAltar', [900, 0, 0], {'scale': 1, 'key': 'trophyAltarB'}),
        ],
        'monsters': [
            {key: 'spider', level: 3, location: [600, 0, 40]},
            {key: 'gnome', level: 3, location: [880, 0, 0]},
        ],
        //'leftWall': guildDoor,
    });


    guildAreas.guildGuestRoom = initializeGuldArea({
        'key': 'guildGuestRoom',
        'width': 320,
        'backgroundPatterns': {'0': 'oldGuild'},
        'wallDecorations': [
            guildObject('candles', [340, 50, wallZ], {'xScale': -1, 'scale': 1.5}),
            guildObject('candles', [460, 50, wallZ], {'scale': 1.5}),
            guildObject('door', [400, 0, wallZ], {'exit': {'areaKey': 'guildFrontHall', 'x': 250, 'z': 150}, 'scale': 1}),
        ],
        'objects': [
            guildObject('bed', [120, 0, 140], {'scale': 1, 'xScale': -1}),
            guildObject('bed', [680, 0, 140], {'scale': 1, 'xScale': -1}),
            guildObject('coinStash', [60, 0, -140], {'level': 1, 'key': 'coinStashA'}),
            guildObject('coinStash', [740, 0, -140], {'level': 1, 'key': 'coinStashB'}),
        ],
    });

    guildAreas.guildKitchen = initializeGuldArea({
        'key': 'guildKitchen',
        'width': 400,
        'backgroundPatterns': {'0': 'oldGuild'},
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
    });

    guildAreas.guildBasement = initializeGuldArea({
        'key': 'guildBasement',
        'width': 350,
        'backgroundPatterns': {'0': 'guildBasement'},
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
        leftWall: guildDoor,
    });

    guildAreas.guildVault = initializeGuldArea({
        'key': 'guildVault',
        'width': 320,
        'backgroundPatterns': {'0': 'guildBasement'},
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
        rightWall: guildDoor,
    });
    return guildAreas;
}
//$('body').append(wallCanvas);
export function drawRightWall(context: CanvasRenderingContext2D, guildArea: Area) {
    if (guildArea.cameraX + 320 < guildArea.width - 32) return;
    if (!guildArea.rightWall) return;
    const frame = getFrame(guildArea.rightWall, guildArea.time);
    const target = {
        ...frame,
        x: guildArea.width - guildArea.cameraX - frame.w,
        y: 0,
    }
    drawFrame(context, frame, target);
}
export function drawLeftWall(context, guildArea) {
    if (guildArea.cameraX > 32) return;
    if (!guildArea.leftWall) return;
    const frame = getFrame(guildArea.leftWall, guildArea.time);
    context.save();
        context.translate(frame.w - guildArea.cameraX, 0);
        context.scale(-1, 1);
        drawFrame(context, frame, {...frame, x: 0, y: 0});
    context.restore();
}
