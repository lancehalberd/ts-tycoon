
import {
    ADVENTURE_HEIGHT, ADVENTURE_WIDTH,
    BACKGROUND_HEIGHT, BOTTOM_HUD_RECT
} from 'app/gameConstants';
import { requireImage } from 'app/images';
import { createAnimation, drawFrame } from 'app/utils/animations';
import { r, fillRect } from 'app/utils/index';
import SRandom from 'app/utils/SRandom';

import { AreaType } from 'app/types';
/*
interface BackgroundSource {
    image: HTMLCanvasElement | HTMLImageElement,
    x: number,
    y: number,
    left: number,
    top: number,
    width: number,
    height: number,
}
interface BackgroundSection {
    source: BackgroundSource,
    spacing?: number,
    parallax?: number,
    velocity?: number,
    alpha?: number,
}

function backgroundSource(image, xFrame, y = 0, width = 60, height = 300): BackgroundSource {
    return { image, x: xFrame * 60, left: xFrame * 60, y, top: y, width, height };
}

const forestImage = requireImage('gfx/forest.png');
const fieldImage = requireImage('gfx/grass.png');
const beachImage = requireImage('gfx/beach.png');
const townImage = requireImage('gfx/town.png');
const guildImage = requireImage('gfx/guildhall.png');
const caveImage = requireImage('gfx/cave.png');
const bgSources = {
    forest: backgroundSource(forestImage, 0),
    treeTops: backgroundSource(forestImage, 1, 0, 60, 150),
    tallTrees: backgroundSource(forestImage, 2, 0, 60, 150),
    shortTrees: backgroundSource(forestImage, 3, 0, 60, 150),
    roses: backgroundSource(forestImage, 4, 0, 60, 150),
    rootsA: backgroundSource(forestImage, 1, 240, 60, 60),
    rootsB: backgroundSource(forestImage, 2, 240, 60, 60),
    denseLeaves: backgroundSource(forestImage, 1, 150, 60, 90),
    leavesAndStick: backgroundSource(forestImage, 2, 150, 60, 90),
    stick: backgroundSource(forestImage, 3, 150, 60, 90),
    leaf: backgroundSource(forestImage, 4, 150, 60, 90),
    field: backgroundSource(fieldImage, 0),
    skinnyCloud: backgroundSource(fieldImage, 1, 0, 60, 150),
    tinyCloud: backgroundSource(fieldImage, 2, 0, 60, 150),
    mediumCloud: backgroundSource(fieldImage, 3, 0, 60, 150),
    grassEdge: backgroundSource(fieldImage, 1, 150, 60, 90),
    grassA: backgroundSource(fieldImage, 2, 150, 60, 90),
    grassB: backgroundSource(fieldImage, 3, 150, 60, 90),
    grassC: backgroundSource(fieldImage, 4, 150, 60, 90),
    dirtCracksA: backgroundSource(fieldImage, 1, 240, 60, 60),
    dirtCracksB: backgroundSource(fieldImage, 2, 240, 60, 60),
    cave: backgroundSource(caveImage, 0),
    rocks: backgroundSource(caveImage, 1, 240, 60, 60),
    spikesA: backgroundSource(caveImage, 1, 0, 60, 60),
    spikesB: backgroundSource(caveImage, 2, 0, 60, 60),
    spikesC: backgroundSource(caveImage, 3, 0, 60, 60),
    tombstone: backgroundSource(caveImage, 1, 60, 60, 150),
// underground: y240, floor: y150, sky: y0, floor: height=90
    beach: backgroundSource(beachImage, 0),
    water1: backgroundSource(beachImage, 1, 150, 60, 60),
    water2: backgroundSource(beachImage, 2, 150, 60, 60),
    shells1: backgroundSource(beachImage, 3, 240, 60, 60),
    shells2: backgroundSource(beachImage, 4, 240, 60, 60),
// underground: y240, floor: y150, sky: y0, floor: height=90, sky: height=150
    town: backgroundSource(townImage, 0),
    cobblestone: backgroundSource(townImage, 1, 150, 60, 90),
    houseCurtains: backgroundSource(townImage, 2, 0, 60, 150),
    houseTiles: backgroundSource(townImage, 3, 0, 60, 150),
    fountain: backgroundSource(townImage, 4, 0, 60, 150),
    ceilingAndTrim: backgroundSource(guildImage, 1, 0, 60, 24),
    crackedWall: backgroundSource(guildImage, 1, 0, 60, 150),
    oldFloorBoards: backgroundSource(guildImage, 1, 150, 60, 90),
    woodFloorEdge: backgroundSource(guildImage, 0, 240, 60, 60),
};

export const backgrounds = {
    oldGuild: [
        {'source': bgSources.crackedWall},
        {'source': bgSources.oldFloorBoards},
        {'source': bgSources.woodFloorEdge}
    ],
    guildBasement: [
        {'source': bgSources.cave},
        {'source': bgSources.ceilingAndTrim},
        {'source': bgSources.rocks},
        {'source': bgSources.rootsA, 'spacing': 4},
        {'source': bgSources.rootsB, 'spacing': 3}
    ],
    forest: [
        {'source': bgSources.forest},
        {'source': bgSources.treeTops, 'parallax': .2},
        {'source': bgSources.shortTrees, 'parallax': .3, 'spacing': 2},
        {'source': bgSources.tallTrees, 'parallax': .5, 'spacing': 3},
        {'source': bgSources.roses, 'parallax': .65, 'spacing': 4},
        {'source': bgSources.leavesAndStick, 'spacing': 2},
        {'source': bgSources.denseLeaves, 'spacing': 3},
        {'source': bgSources.stick, 'spacing': 5},
        {'source': bgSources.rootsA, 'spacing': 4},
        {'source': bgSources.rootsB, 'spacing': 3}
    ],
    garden: [
        {'source': bgSources.field},
        {'source': bgSources.roses, 'parallax': .4, 'spacing': 3.5},
        {'source': bgSources.roses, 'parallax': .65, 'spacing': 2},
        {'source': bgSources.denseLeaves, 'spacing': 3},
        {'source': bgSources.stick, 'spacing': 5},
        {'source': bgSources.rootsA, 'spacing': 4},
        {'source': bgSources.rootsB, 'spacing': 3}
    ],
    orchard: [
        {'source': bgSources.forest},
        {'source': bgSources.treeTops, 'parallax': .2},
        {'source': bgSources.shortTrees, 'parallax': .3, 'spacing': 1},
        {'source': bgSources.tallTrees, 'parallax': .5, 'spacing': 1.5},
        {'source': bgSources.leavesAndStick, 'spacing': 2},
        {'source': bgSources.denseLeaves, 'spacing': 1},
        {'source': bgSources.rootsA, 'spacing': 4},
        {'source': bgSources.rootsB, 'spacing': 3}
    ],
    field: [
        {'source': bgSources.field},
        {'source': bgSources.skinnyCloud, 'parallax': .2, 'spacing': 3, 'velocity': -50, 'alpha': .4},
        {'source': bgSources.tinyCloud, 'parallax': .3, 'spacing': 2, 'velocity': -50, 'alpha': .4},
        {'source': bgSources.mediumCloud, 'parallax': .5, 'spacing': 3, 'velocity': -50, 'alpha': .4},
        {'source': bgSources.dirtCracksA},
        {'source': bgSources.dirtCracksB},
        {'source': bgSources.grassEdge},
        {'source': bgSources.grassA},
        {'source': bgSources.grassB, 'spacing': 4},
        {'source': bgSources.grassC, 'spacing': 3}
    ],
    cemetery: [
        {'source': bgSources.cave},
        {'source': bgSources.shortTrees, 'parallax': .3, 'spacing': 2.5},
        {'source': bgSources.tallTrees, 'parallax': .5, 'spacing': 3},
        {'source': bgSources.tombstone, 'spacing': 5},
        {'source': bgSources.stick, 'spacing': 4},
        {'source': bgSources.rootsA, 'spacing': 4},
        {'source': bgSources.rootsB, 'spacing': 3}
    ],
    cave: [
        {'source': bgSources.cave},
        {'source': bgSources.spikesA, 'parallax': .2, 'spacing': 1.5},
        {'source': bgSources.spikesC, 'parallax': .3, 'spacing': 2},
        {'source': bgSources.spikesB, 'parallax': .5, 'spacing': 3},
        {'source': bgSources.rocks}
    ],
    beach: [
        {'source': bgSources.beach},
        {'source': bgSources.water1},
        {'source': bgSources.water2, 'spacing': 3},
        {'source': bgSources.shells1, 'spacing': 3},
        {'source': bgSources.shells2, 'spacing': 2}
    ],
    town: [
        {'source': bgSources.town},
        {'source': bgSources.cobblestone},
        {'source': bgSources.fountain, 'spacing': 5},
        {'source': bgSources.houseCurtains, 'spacing': 3},
        {'source': bgSources.houseTiles, 'spacing': 2},
    ],
};*/
const FLOOR_TILE_SIZE = 32;
const BG_TILE_WIDTH = 256;
const BG_TILE_HEIGHT = BACKGROUND_HEIGHT;
const meadowFrames = createAnimation('gfx2/areas/meadowTiles.png', r(0, 0, 32, 32), {cols: 6}).frames;
const meadowSky = createAnimation('gfx2/areas/meadowSky.png', r(0, 0, 320, BG_TILE_HEIGHT)).frames[0];
const meadowBackFrontFrames = createAnimation('gfx2/areas/meadowBackFront.png',
    r(0, 0, BG_TILE_WIDTH, 86), {cols: 2}).frames;
const FieldRenderer: AreaType = {
    drawFloor(context, area) {
        let w = FLOOR_TILE_SIZE;
        let h = FLOOR_TILE_SIZE;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            for (let row = 0; row < 2; row++) {
                const frame = SRandom.seed(x + row).element(meadowFrames);
                drawFrame(context, frame, {x: x - area.cameraX, y: BACKGROUND_HEIGHT + h * row, w, h});
            }
            x += w;
        }
        fillRect(context, BOTTOM_HUD_RECT, '#883');
    },
    drawBackground(context, area) {
        drawFrame(context, meadowSky, {...meadowSky, x: 0, y: 0});
        let w = BG_TILE_WIDTH;
        let h = 86;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            const frame = SRandom.seed(x).element(meadowBackFrontFrames);
            drawFrame(context, frame, {x: x - area.cameraX, y: 0, w, h});
            x += w;
        }
    }
};

const guildFrames = createAnimation('gfx2/areas/guildTiles.png', r(0, 0, FLOOR_TILE_SIZE, FLOOR_TILE_SIZE), {cols: 1}).frames;
const guildBackFrontFrames = createAnimation('gfx2/areas/guildBack.gif',
    r(0, 0, 128, BG_TILE_HEIGHT), {cols: 1}).frames;
const GuildRenderer: AreaType = {
    drawFloor(context, area) {
        let w = FLOOR_TILE_SIZE;
        let h = FLOOR_TILE_SIZE;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            for (let row = 0; row < 2; row++) {
                const frame = SRandom.seed(x + row).element(guildFrames);
                drawFrame(context, frame, {x: x - area.cameraX, y: BACKGROUND_HEIGHT + h * row, w, h});
            }
            x += w;
        }
        fillRect(context, BOTTOM_HUD_RECT, '#433');
    },
    drawBackground(context, area) {
        let w = 128;
        let h = BG_TILE_HEIGHT;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            const frame = SRandom.seed(x).element(guildBackFrontFrames);
            drawFrame(context, frame, {x: x - area.cameraX, y: 0, w, h});
            x += w;
        }
    }
};

export const areaTypes = {
    oldGuild: GuildRenderer,
    guildBasement: GuildRenderer,
    forest: FieldRenderer,
    garden: FieldRenderer,
    orchard: FieldRenderer,
    field: FieldRenderer,
    cemetery: FieldRenderer,
    cave: FieldRenderer,
    beach: FieldRenderer,
    town: FieldRenderer,
};
