import { Bed, HeroApplication, createAreaFromDefinition } from 'app/content/areas';
import { zones } from 'app/content/zones';
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
    for (let areaKey in zones.guild) {
        const area: Area = createAreaFromDefinition(areaKey, zones.guild[areaKey]);
        guildAreas[areaKey] = area;
    }
    return guildAreas;
    /*
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
    }, 5);*/
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
