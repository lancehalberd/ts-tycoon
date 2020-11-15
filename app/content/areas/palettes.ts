import { allImagesLoaded, requireImage } from 'app/images';

import { FrameDimensions, ShortRectangle, Tile, TilePalette } from 'app/types';

const fieldTileDims: FrameDimensions = {w: 32, h: 32};

const caveFieldTiles = {image: requireImage('gfx2/areas/cavetiles.png'),
    x: 0, y: 0, w: 6 * fieldTileDims.w, h : fieldTileDims.h};
const caveBgTileDims: FrameDimensions = {w: 128, h: 86};
const caveWallTiles = {image: requireImage('gfx2/areas/caveforeground.png'),
    x: 0, y: 0, w: 2 * caveBgTileDims.w, h: caveBgTileDims.h};
const caveForegroundTileDims: FrameDimensions = {w: 86, h: 24};
const caveForegroundTiles = {image: requireImage('gfx2/areas/southwall.png'),
    x: 0, y: 0, w: 1 * caveForegroundTileDims.w, h: caveForegroundTileDims.h};

const caveFloor: TilePalette = {...fieldTileDims, source: caveFieldTiles};
const caveBackground: TilePalette = {...caveBgTileDims, source: caveWallTiles};
const caveForeground: TilePalette = {...caveForegroundTileDims, source: caveForegroundTiles};


const guildFieldTiles = {image: requireImage('gfx2/areas/Guild tiles2.png'),
    x: 0, y: 0, w: fieldTileDims.w, h : 3 * fieldTileDims.h};
const guildBgTileDims: FrameDimensions = {w: 128, h: 86};
const guildWallTiles = {image: requireImage('gfx2/areas/guildtiles2.png'),
    x: 0, y: 0, w: 3 * guildBgTileDims.w, h: guildBgTileDims.h};
const guildForegroundTileDims: FrameDimensions = {w: 32, h: 60};
const guildForegroundTopTiles = {image: requireImage('gfx2/areas/guildwallssheet.png'),
    x: 3 * guildForegroundTileDims.w, y: 0,
    w: 3 * guildForegroundTileDims.w, h: guildForegroundTileDims.h};
const guildForegroundBottomTiles = {image: requireImage('gfx2/areas/guildwallssheet.png'),
    x: 8 * guildForegroundTileDims.w, y: 4,
    w: 3 * guildForegroundTileDims.w, h: guildForegroundTileDims.h};
const guildForegroundSideTiles = {image: requireImage('gfx2/areas/guildwallssheet.png'),
    x: 11 * guildForegroundTileDims.w, y: 4,
    w: 2 * guildForegroundTileDims.w, h: guildForegroundTileDims.h};

const guildFloor: TilePalette = {...fieldTileDims, source: guildFieldTiles};
const guildBackground: TilePalette = {...guildBgTileDims, source: guildWallTiles};
const guildForegroundTop: TilePalette = {...guildForegroundTileDims, source: guildForegroundTopTiles};
const guildForegroundBottom: TilePalette = {...guildForegroundTileDims, source: guildForegroundBottomTiles};
const guildForegroundSides: TilePalette = {...guildForegroundTileDims, source: guildForegroundSideTiles};
const guildForeground: TilePalette = combinePalettes([
    guildForegroundTop, guildForegroundSides, guildForegroundBottom,
]);


const meadowFieldTiles = {image: requireImage('gfx2/areas/meadowTiles.png'),
    x: 0, y: 0, w: 6 * fieldTileDims.w, h: fieldTileDims.h};
const meadowBgTileDims: FrameDimensions = {w: 256, h: 86};
const meadowBackgroundTiles = {image: requireImage('gfx2/areas/meadowBackFront.png'),
    x: 0, y: 0, w: 2 * meadowBgTileDims.w, h: meadowBgTileDims.h};
const meadowForegroundTileDims: FrameDimensions = {w: 128, h: 16};
const meadowForegroundTiles = {image: requireImage('gfx2/areas/southwallmeadow.png'),
    x: 0, y: 0, w: 1 * meadowForegroundTileDims.w, h: meadowForegroundTileDims.h};

const meadowFloor: TilePalette = {...fieldTileDims, source: meadowFieldTiles};
const meadowBackground: TilePalette = {...meadowBgTileDims, source: meadowBackgroundTiles};
const meadowForeground: TilePalette = {...meadowForegroundTileDims, source: meadowForegroundTiles};

const dirtTiles = {image: requireImage('gfx2/areas/dirt32tiles.png'),
    x: 0, y: 0, w: 7 * fieldTileDims.w, h: fieldTileDims.h};
const grassOverlayTiles = {image: requireImage('gfx2/areas/meadowgrasssheet.png'),
    x: 0, y: 0, w: 320, h: 16};
const dirtFloor: TilePalette = {...fieldTileDims, source: dirtTiles};
const grassOverlay: TilePalette = {
    w: 16, h: 16, source: grassOverlayTiles,
    defaultTiles: tileRange({x: 12, y: 0, w: 8, h: 1}),
};

const fenceBgTileDims: FrameDimensions = {w: 128, h: 32};
const fenceWallTiles = {image: requireImage('gfx2/areas/Fence north.png'),
    x: 0, y: 0, w: 2 * fenceBgTileDims.w, h: fenceBgTileDims.h};
const fenceForegroundTileDims: FrameDimensions = {w: 128, h: 16};
const fenceForegroundTiles = {image: requireImage('gfx2/areas/fencesouthwall.png'),
    x: 0, y: 0, w: 2 * fenceForegroundTileDims.w, h: fenceForegroundTileDims.h};
const fenceBackground: TilePalette = {...fenceBgTileDims, source: fenceWallTiles};
const fenceForeground: TilePalette = {...fenceForegroundTileDims, source: fenceForegroundTiles};

export const palettes = {
    caveFloor,
    caveBackground,
    caveForeground,
    guildFloor,
    guildBackground,
    guildForeground,
    meadowFloor,
    meadowBackground,
    meadowForeground,
    dirtFloor,
    grassOverlay,
    fenceBackground,
    fenceForeground,
};
window['palettes'] = palettes;

function tileRange({x, y, w, h}: ShortRectangle): Tile[] {
    const tiles: Tile[] = [];
    for (let Y = y; Y < y + h; Y++) {
        for (let X = x; X < x + w; X++) {
            tiles.push({x: X, y: Y});
        }
    }
    return tiles;
}

function drawCombinedPalettes(canvas: HTMLCanvasElement, palettes: TilePalette[]): void {
    const {w, h} = palettes[0];
    const context = canvas.getContext('2d');
    let x = 0, y = 0;
    for (const palette of palettes) {
        for (let py = 0; py < palette.source.h; py += h) {
            for (let px = 0; px < palette.source.w; px += w) {
                context.drawImage(palette.source.image,
                    palette.source.x + px, palette.source.y + py, w, h,
                    x, y, w, h
                );
                x += w;
                if (x >= 5 * w) {
                    x = 0;
                    y += h;
                }
            }
        }
    }
}

function combinePalettes(palettes: TilePalette[]): TilePalette {
    const {w, h} = palettes[0];
    let totalTiles: number = palettes.reduce(
        (sum, palette) => sum + (palette.source.w / w) * (palette.source.h / h), 0);
    const canvas = document.createElement('canvas');
    canvas.width = 5 * w;
    canvas.height = Math.ceil(totalTiles / 5) * h;
    //document.body.append(canvas);
    // Don't draw the combined palettes until all images have loaded.
    async function populatePaletteOnLoad() {
        await allImagesLoaded();
        drawCombinedPalettes(canvas, palettes);
    }
    populatePaletteOnLoad();

    // Return the new palette immediately so that it can be used, it will be populated when it is ready.
    return {
        w,
        h,
        source: {image: canvas, x: 0, y: 0, w: canvas.width, h: canvas.height},
    };
}

/*function drawPaletteFromFrames(canvas: HTMLCanvasElement, frames: Frame[]): void {
    const {w, h} = palettes[0];
    const context = canvas.getContext('2d');
    let x = 0, y = 0;
    for (const frame of frames) {
        context.drawImage(frame.image,
            frame.x, frame.y, frame.w, frame.h,
            x, y, w, h
        );
        x += w;
        if (x >= 5 * w) {
            x = 0;
            y += h;
        }
    }
}*/
/*
function createPaletteFromFrames(frames: Frame[]): TilePalette {
    const {w, h} = frames[0];
    const canvas = document.createElement('canvas');
    canvas.width = 5 * w;
    canvas.height = Math.ceil(frames.length / 5) * h;
    // Don't draw the combined palettes until all images have loaded.
    async function populatePaletteOnLoad() {
        await allImagesLoaded();
        drawPaletteFromFrames(canvas, frames);
    }
    populatePaletteOnLoad();

    // Return the new palette immediately so that it can be used, it will be populated when it is ready.
    return {
        w,
        h,
        source: {image: canvas, x: 0, y: 0, w: canvas.width, h: canvas.height},
    };
}*/
