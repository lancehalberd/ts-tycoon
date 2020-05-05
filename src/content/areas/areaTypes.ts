import { addMonstersToArea, enterArea } from 'app/adventure';
import {
    initializeActorForAdventure,
} from 'app/character';
import {
    areaWalls, AreaDecoration, AreaDoor,
    SimpleMonsterSpawner, SkillShrine, TreasureChest,
} from 'app/content/areas';
import { makeMonster } from 'app/content/monsters';
import { bodyDiv, titleDiv } from 'app/dom';
import {
    ADVENTURE_HEIGHT, ADVENTURE_WIDTH,
    BACKGROUND_HEIGHT, BOTTOM_HUD_RECT,
    FRAME_LENGTH,
    GROUND_Y,
    MAX_Z, MIN_Z,
    RANGE_UNIT,
} from 'app/gameConstants';
import { drawWhiteOutlinedFrame, requireImage } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r, fillRect, isPointInRect } from 'app/utils/index';
import SRandom from 'app/utils/SRandom';

import {
    Ability, Actor, Area, AreaEntity, AreaObject, AreaObjectTarget,
    AreaType, Exit, FixedObject, Frame, Hero, LootGenerator,
    MonsterSpawn, MonsterSpawner, FrameAnimation,
} from 'app/types';
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
const meadowBackMidFrames = createAnimation('gfx2/areas/meadowBackMid.png',
    r(0, 0, 128, 84), {cols: 3}).frames;
const meadowThingFrames = createAnimation('gfx2/areas/meadowThings.png',
    r(0, 0, 32, 32), {cols: 6}).frames;

const [meadowRiver, meadowBridge] = createAnimation('gfx2/areas/meadowbridge.png',
    frame(0, 0, 39, 148, r(16, 92, 23, 35)), {cols: 2}).frames;
const meadowClouds = createAnimation('gfx2/areas/meadowClouds.png',
    frame(0, 0, 128, 84), {cols: 3}).frames;

const bushAnimation = createAnimation('gfx2/areas/meadowBush.png', r(0, 0, 32, 32), {cols: 4});

export class AreaObstacle extends AreaDecoration {
    isSolid: boolean = true;
}

const FieldArea: AreaType = {
    addObjects(area, {monsters = [], exits, loot, ability}) {
        const random = SRandom.addSeed(area.seed);
        if (monsters.length) {
            monsters = [...monsters];
            // Make the first monster into a spawner if there are more than one monster and this isn't the boss chamber.
            if (monsters.length > 0 && !area.isBossArea) {
                const spawnerMonster = monsters.shift();
                const spawner = new SimpleMonsterSpawner([spawnerMonster, spawnerMonster], 2000, 4000, bushAnimation);
                spawner.x = spawnerMonster.location[0] - RANGE_UNIT * 10;
                spawner.y = 0;
                spawner.z = spawnerMonster.location[2];
                area.objects.push(spawner);
            }
            addMonstersToArea(area, monsters, area.enemyBonuses);
        }

        addChest(area, loot);
        addShrine(area, ability);
        // Do this last since it depends on the final dimensions of the area.
        addExits(area, exits, AreaDoor.animations.woodBridge);
        area.leftWall = areaWalls.river;
        area.rightWall = areaWalls.river;
        // Add an obstacle to the corners
        //area.objects.push(new AreaObstacle(random.addSeed(1).element(meadowThingFrames), 44, MAX_Z - 24));
        //area.objects.push(new AreaObstacle(random.addSeed(2).element(meadowThingFrames), area.width - 44, MAX_Z - 24));
        finalizeArea(area);
    },
    drawFloor(context, area) {
        const random = SRandom.addSeed(area.seed);
        let w = FLOOR_TILE_SIZE;
        let h = FLOOR_TILE_SIZE;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            for (let row = 0; row < 2; row++) {
                const frame = random.addSeed(x + row).element(meadowFrames);
                drawFrame(context, frame, {x: x - area.cameraX, y: BACKGROUND_HEIGHT + h * row, w, h});
            }
            x += w;
        }
        fillRect(context, BOTTOM_HUD_RECT, '#883');
    },
    drawBackground(context, area) {
        drawFrame(context, meadowSky, {...meadowSky, x: 0, y: 0});
        const random = SRandom.addSeed(area.seed);
        let w = meadowClouds[0].w;
        let h = meadowClouds[0].h;
        const cloudSpeed = 0.5;
        // TODO: Why does this look so much choppier than other movement?
        const cloudDx = cloudSpeed * area.time;
        let X = area.cameraX * 0.5;
        // This index will be the same for a cloud as it animates from right to left.
        let index = Math.floor((X + cloudDx) / w);
        // The x position of this cloud will decrease over time.
        let x = index * w - cloudDx - X;
        while (x < ADVENTURE_WIDTH) {
            const frame = random.addSeed(index).element(meadowClouds);
            const y = -random.addSeed(index).range(0, 8);
            /*context.drawImage(
                frame.image,
                frame.x, frame.y, frame.w, frame.h,
                Math.round(x + SRandom.seed(index).random()), y, w, h
            );*/
            /*const P = Math.max(50 / cloudSpeed);
            const W = frame.w / P;
            for (let i = 0; i < P; i++) {
                // This is 1px wide for all but the last section so they will not have gaps between.
                const width = Math.ceil(W + 1);//((i === P) ? 0 : 1);
                drawFrame(context, {...frame, w: width, x: Math.floor(frame.x + i * W)}, {
                    x: Math.floor(x + i * W  + i / P),
                    y, w: width, h});
            }*/
            let p = x % 1;
            if (p < 0) p += 1;
            const W = Math.round((1 - p) * w);
            if (false && W % w === 0) {
                // Draw the frame normally if it is "exactly" on the pixel (within 1 / ( 2 * frame Width) of it)
                drawFrame(context, frame, {
                    x: Math.floor(x),
                    y, w, h});
                console.log('special');
            } else {
                // If the frame is off the pixel, repeat the Wth pixel based on the subpixel.
                // Moving from left to right, the right most pixel should move first, so the repeated
                // pixel moves from right to left across the image as the image moves slowly to the right.
                drawFrame(context, {...frame, w: W}, {
                    x: Math.floor(x),
                    y, w: W, h});
                const rightWidth = frame.w - (W - 1);
                drawFrame(context, {...frame, x: frame.x + W - 1, w: rightWidth}, {
                    x: Math.floor(x) + W,
                    y, w: rightWidth, h});

            }
            x += w;
            index++;
        }

        // This draws stones
        w = 128;
        h = 84;
        X = area.cameraX * 0.8;
        x = Math.floor(X / w) * w;
        while (x < X + ADVENTURE_WIDTH) {
            // We don't draw these in every slot.
            if (random.addSeed(x + 1).random() < 0.2) {
                x += w;
                continue;
            }
            const frame = random.addSeed(x).element(meadowBackMidFrames);
            drawFrame(context, frame, {x: x - X, y: 0, w, h});
            x += w;
        }

        // Treese/grass in the background
        w = BG_TILE_WIDTH;
        h = 86;
        x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            const frame = random.addSeed(x).element(meadowBackFrontFrames);
            drawFrame(context, frame, {x: x - area.cameraX, y: 0, w, h});
            x += w;
        }
    }
};


const caveFrames = createAnimation('gfx2/areas/cavetiles.png', r(0, 0, 32, 32), {cols: 6}).frames;
const caveBackFrontFrames = createAnimation('gfx2/areas/caveforeground.png',
    r(0, 0, 128, 86), {cols: 2}).frames;
const [stoneWallMid, stoneWallLeft, stoneWallRight, ...caveBackFrames] = createAnimation('gfx2/areas/cavebackground.png',
    r(0, 0, 128, 86), {cols: 6}).frames;
const caveThingFrames = createAnimation('gfx2/areas/cavethings.png',
    r(0, 0, 32, 32), {cols: 2}).frames;

const [caveWall, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge.png',
    frame(0, 0, 39, 148, r(16, 92, 23, 35)), {cols: 3}).frames;

const CaveArea: AreaType = {
    addObjects(area, {monsters = [], exits, loot, ability}) {
        const random = SRandom.addSeed(area.seed);
        addMonstersToArea(area, monsters, area.enemyBonuses);

        addChest(area, loot);
        addShrine(area, ability);
        // Do this last since it depends on the final dimensions of the area.
        addExits(area, exits, AreaDoor.animations.caveDoorOpen);
        area.leftWall = areaWalls.caveWall;
        area.rightWall = areaWalls.caveWall;
        // Add an obstacle to the corners
        //area.objects.push(new AreaObstacle(random.addSeed(1).element(caveThingFrames), 44, MAX_Z - 30));
        //area.objects.push(new AreaObstacle(random.addSeed(2).element(caveThingFrames), area.width - 44, MAX_Z - 30));
        finalizeArea(area);
    },
    drawFloor(context, area) {
        const random = SRandom.addSeed(area.seed);

        // Draw a black background behind everything. This is for pits and when the background is empty.
        context.fillStyle = '#121115';
        context.fillRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);

        let w = FLOOR_TILE_SIZE;
        let h = FLOOR_TILE_SIZE;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            for (let row = 0; row < 2; row++) {
                const frame = random.addSeed(x + row).element(caveFrames);
                drawFrame(context, frame, {x: x - area.cameraX, y: BACKGROUND_HEIGHT + h * row, w, h});
            }
            x += w;
        }
        fillRect(context, BOTTOM_HUD_RECT, '#883');
    },
    drawBackground(context, area) {
        const random = SRandom.addSeed(area.seed);

        // Draws the pillars with parallax.
        {
            let w = 128;
            let h = 86;
            let X = area.cameraX * 0.8;
            let x = Math.floor(X / w) * w;
            while (x < X + ADVENTURE_WIDTH) {
                const frame = random.addSeed(x).element(caveBackFrames);
                drawFrame(context, frame, {x: x - X, y: 0, w, h});
                x += w;
            }
        }

        // Draw a continuous stone wall, possibly with a gap in one section.
        {
            const gap = random.range(0, 2);
            let w = 128;
            let h = 86;
            let X = area.cameraX;
            let x = Math.floor(X / w) * w;
            while (x < X + ADVENTURE_WIDTH) {
                const i = Math.round(x / w);
                if (i === gap) {
                    x += w;
                    continue;
                }
                let frame;
                if (i === gap - 1) {
                    frame = stoneWallRight;
                } else if (i === gap + 1) {
                    frame = stoneWallLeft;
                } else {
                    frame = stoneWallMid;
                }
                drawFrame(context, frame, {x: x - X, y: 0, w, h});
                x += w;
            }
        }

        // row of rocks in front of the background.
        {
            let w = 128;
            let h = 86;
            let x = Math.floor(area.cameraX / w) * w;
            while (x < area.cameraX + ADVENTURE_WIDTH) {
                const frame = random.addSeed(x).element(caveBackFrontFrames);
                // Currently this needs to be down several pixels to line up correctly.
                drawFrame(context, frame, {x: x - area.cameraX, y: 5, w, h});
                x += w;
            }
        }
    }
};

const guildFrames = createAnimation('gfx2/areas/Guild tiles2.png', r(0, 0, FLOOR_TILE_SIZE, FLOOR_TILE_SIZE), {rows: 3}).frames;
const guildBackFrontFrames = createAnimation('gfx2/areas/guildtiles.png',
    r(0, 0, 128, BG_TILE_HEIGHT), {cols: 2}).frames;
const [guildRightWall, guildRightDoorEmpty, guildRightDoor, guildRightBoardedDoor] = createAnimation('gfx2/areas/guildbridge.png',
    frame(0, 0, 39, 148, r(11, 50, 20, 70)), {cols: 4}).frames;

const GuildArea: AreaType = {
    addObjects(area, {monsters, exits, loot, ability}) {
        addMonstersToArea(area, monsters, area.enemyBonuses);
        addChest(area, loot);
        addShrine(area, ability);
        // Do this last since it depends on the final dimensions of the area.
        addExits(area, exits);
        finalizeArea(area);
    },
    drawFloor(context, area) {
        const random = SRandom.addSeed(area.seed);
        let w = FLOOR_TILE_SIZE;
        let h = FLOOR_TILE_SIZE;
        let x = Math.floor(area.cameraX / w) * w;
        while (x < area.cameraX + ADVENTURE_WIDTH) {
            for (let row = 0; row < 2; row++) {
                const frame = random.addSeed(x + row).element(guildFrames);
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
            // The other frame is a large window that I don't want to use just now.
            const frame = guildBackFrontFrames[1];//SRandom.seed(x).element(guildBackFrontFrames);
            drawFrame(context, frame, {x: x - area.cameraX, y: 0, w, h});
            x += w;
        }
    }
};

function finalizeArea(area: Area) {
    for (const object of area.objects) object.area = area;
    for (const object of area.wallDecorations) object.area = area;
}

function addExits(area: Area, exits: Exit[], animation: FrameAnimation = AreaDoor.animations.openDoor) {
    if (exits[0]) {
        const door: AreaDoor = new AreaDoor();
        door.animation = animation;
        door.exit = exits[0];
        door.definition = {
            "type": "door",
            "x": 0,
            "y": 0,
            "z": -7,
            "flipped": true,
        };
        area.objects.push(door);
    }
    if (exits[1]) {
        const door: AreaDoor = new AreaDoor();
        door.animation = animation;
        door.exit = exits[1];
        door.definition = {
            "type": "door",
            x: 0,
            xAlign: "right",
            "y": 0,
            "z": -7,
        };
        area.objects.push(door);
    }
}

function isExitEnabled(object: AreaObject): boolean {
    return !object.area.isBossArea || !object.area.enemies.length;
}

function addChest(area: Area, loot: LootGenerator[]) {
    if (!loot || !loot.length) {
        return;
    }
    const chest: TreasureChest = new TreasureChest();
    chest.loot = loot;
    chest.definition = {
        type: "treasureChest",
        scale: 0.5,
        x: area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4),
        y: 0,
        z: SRandom.addSeed(area.seed).range(MIN_Z + 16, MIN_Z + 32),
    };
    area.objects.push(chest);
    area.width = chest.definition.x + RANGE_UNIT * 10;
}

function addShrine(area: Area, ability: Ability) {
    if (!ability) {
        return;
    }
    area.isShrineArea = true;
    const shrine: SkillShrine = new SkillShrine();
    shrine.definition = {
        type: "skillShrine",
        x: area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4),
        y: 0,
        z: 10,
    };
    area.objects.push(shrine);
    area.width = shrine.definition.x + RANGE_UNIT * 20;
    console.log(shrine.definition.x, area.width);
}

export const areaTypes = {
    oldGuild: GuildArea,
    guildBasement: GuildArea,
    forest: FieldArea,
    garden: FieldArea,
    orchard: FieldArea,
    field: FieldArea,
    cemetery: CaveArea,
    cave: CaveArea,
    beach: FieldArea,
    town: GuildArea,
};
