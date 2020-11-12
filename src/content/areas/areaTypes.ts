import _ from 'lodash';
import { addMonstersToArea, enterArea } from 'app/adventure';
import {
    initializeActorForAdventure,
} from 'app/actor';
import {
    areaWalls, AreaDecoration, AreaDoor, AreaObstacle,
    finalizeArea, getLayer, palettes, populateLayerGrid,
    setStandardLayersOnArea,
    SimpleMonsterSpawner, SkillShrine, TreasureChest,
} from 'app/content/areas';
import { makeMonster } from 'app/content/monsters';
import { bodyDiv, titleDiv } from 'app/dom';
import {
    ADVENTURE_HEIGHT, ADVENTURE_WIDTH,
    BACKGROUND_HEIGHT, BOTTOM_HUD_RECT,
    FIELD_HEIGHT,
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
    Ability, Actor, Area, AreaLayer, AreaEntity, AreaObject, AreaObjectTarget,
    AreaType, Exit, FixedObject, Frame, FrameDimensions, Hero, LootGenerator,
    MonsterSpawn, MonsterSpawner, FrameAnimation,
} from 'app/types';

const FLOOR_TILE_SIZE = 32;
const BG_TILE_WIDTH = 256;
const BG_TILE_HEIGHT = BACKGROUND_HEIGHT;
const meadowFrames = createAnimation('gfx2/areas/meadowTiles.png', {w: 32, h: 32}, {cols: 6}).frames;
const meadowSky = createAnimation('gfx2/areas/meadowSky.png', {w: 320, h: BG_TILE_HEIGHT}).frames[0];
const meadowBackFrontFrames = createAnimation('gfx2/areas/meadowBackFront.png',
    {w: BG_TILE_WIDTH, h: 86}, {cols: 2}).frames;
const meadowBackMidFrames = createAnimation('gfx2/areas/meadowBackMid.png',
    {w: 128, h: 84}, {cols: 3}).frames;
const meadowThingFrames = createAnimation('gfx2/areas/meadowThings.png',
    {w: 32, h: 32}, {cols: 6}).frames;

const [meadowRiver, meadowBridge] = createAnimation('gfx2/areas/meadowbridge.png',
    frame(0, 0, 39, 148, r(16, 92, 23, 35)), {cols: 2}).frames;
const meadowClouds = createAnimation('gfx2/areas/meadowClouds.png',
    frame(0, 0, 128, 84), {cols: 3}).frames;

const bushAnimation = createAnimation('gfx2/areas/meadowBush.png', {w: 32, h: 32}, {cols: 4});

const FieldArea: AreaType = {
    addDoor(area, direction, door) {
        door.definition.y = 0;
        door.definition.z = 0;
        if (direction === 'N') {
            door.animation = AreaDoor.animations.northMeadowDoor.normal;
            door.hoverAnimation = AreaDoor.animations.northMeadowDoor.hover;
            door.definition.z = 24;
            door.definition.zAlign = 'back';
            const background = getLayer(area, 'background');
            const tileWidth = background.grid.palette.w;
            const gridPosition = Math.round(door.definition.x / tileWidth);
            // Center the door in the tile.
            door.definition.xAlign = 'middle';
            door.definition.x = tileWidth * gridPosition + tileWidth / 2 - area.width / 2;
            // The northern meadow door just replaces the tile behind it for now.
            background.grid.tiles[0][gridPosition] = null;
            // Right now this appears in front of the river which doesn't look great.
            background.objects.push(door);
        } else if (direction === 'S') {
            door.animation = AreaDoor.animations.southMeadowDoor.normal;
            door.hoverAnimation = AreaDoor.animations.southMeadowDoor.hover;
            door.definition.z = 16;
            door.definition.zAlign = 'front';
            const foreground = getLayer(area, 'foreground');
            const tileWidth = foreground.grid.palette.w;
            const gridPosition = Math.round(door.definition.x / tileWidth);
            // Align the door to the grid.
            door.definition.xAlign = 'middle';
            // Slight adjustment necessary to make this line up perfectly.
            door.definition.x = tileWidth * gridPosition + tileWidth / 2 - area.width / 2 - 2;
            // Remove the foreground tile behind the door
            foreground.grid.tiles[0][gridPosition] = null;
            // TODO: the path should appear under the player but the bushes need to
            // be over the player, so this should be split into two somehow.
            foreground.objects.push(door);
        } else if (direction === 'W') {
            door.animation = AreaDoor.animations.woodBridge.normal;
            door.hoverAnimation = AreaDoor.animations.woodBridge.hover;
            door.definition.flipped = true;
            door.definition.x = 0;
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
            area.leftWall = areaWalls.river;
        } else if (direction === 'E') {
            door.animation = AreaDoor.animations.woodBridge.normal;
            door.hoverAnimation = AreaDoor.animations.woodBridge.hover;
            door.definition.xAlign = 'right';
            door.definition.x = 0;
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
            area.rightWall = areaWalls.river;
        }
    },
    addLayers(area) {
        setStandardLayersOnArea(area);
        getLayer(area, 'background').grid = {w: 1, h: 1, palette: palettes.meadowBackground, tiles: []};
        getLayer(area, 'floor').grid = {w: 1, h: 3, palette: palettes.meadowFloor, tiles: []};
        getLayer(area, 'foreground').grid = {w: 1, h: 1, palette: palettes.meadowForeground, tiles: []};
    },
    addObjects(area, {monsters = [], exits, loot, ability}) {
        const random = SRandom.addSeed(area.seed);
        if (monsters.length) {
            monsters = [...monsters];
            // Make the first monster into a spawner if there are more than one monster and this isn't the boss chamber.
            if (monsters.length > 0 && !area.isBossArea) {
                const spawnerMonster = monsters.shift();
                const spawner = new SimpleMonsterSpawner([spawnerMonster, spawnerMonster], 2000, 4000, bushAnimation);
                spawner.x = spawnerMonster.location.x - RANGE_UNIT * 10;
                spawner.y = 0;
                spawner.z = spawnerMonster.location.z;
                getLayer(area, 'field').objects.push(spawner);
            }
            area.enemies = [];
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
    },
    drawForeground(context, area) {
        const foreground = getLayer(area, 'foreground');
        const y = foreground.y + foreground.grid.h * foreground.grid.palette.h;
        context.fillStyle = '#000';
        context.fillRect(0, y, ADVENTURE_WIDTH, ADVENTURE_HEIGHT - y);
    }
};

const VillageArea: AreaType = {
    ...FieldArea,
    addDoor(area, direction, door) {
        door.definition.y = 0;
        door.definition.z = 0;
        if (direction === 'N') {
            door.animation = AreaDoor.animations.northFenceDoor.normal;
            door.hoverAnimation = AreaDoor.animations.northFenceDoor.hover;
            door.definition.zAlign = 'back';
            getLayer(area, 'background').objects.push(door);
        } else if (direction === 'S') {
            door.animation = AreaDoor.animations.southFenceDoor.normal;
            door.hoverAnimation = AreaDoor.animations.southFenceDoor.hover;
            door.definition.zAlign = 'front';
            getLayer(area, 'foreground').objects.push(door);
        } else if (direction === 'W') {
            door.animation = AreaDoor.animations.sideFenceDoor.normal;
            door.hoverAnimation = AreaDoor.animations.sideFenceDoor.hover;
            door.definition.x = 0;
            door.definition.flipped = true;
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
        } else if (direction === 'E') {
            door.animation = AreaDoor.animations.sideFenceDoor.normal;
            door.hoverAnimation = AreaDoor.animations.sideFenceDoor.hover;
            door.definition.x = 0;
            door.definition.xAlign = 'right';
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
        }
    },
    addLayers(area) {
        setStandardLayersOnArea(area);
        const floor = getLayer(area, 'floor');
        floor.grid = { w: 1, h: 6, palette: palettes.grassOverlay, tiles: [] }
        const floorIndex = area.layers.indexOf(floor);
        area.layers.splice(floorIndex, 0, {
            key: 'dirt',
            objects: [],
            x: floor.x, y: floor.y,
            grid: {
                w: 1, h: 3, palette: palettes.dirtFloor, tiles: []
            }
        });
        const background = getLayer(area, 'background');
        background.y = BACKGROUND_HEIGHT - palettes.fenceBackground.h;
        background.x = 36;
        background.grid = {w: 1, h: 1, palette: palettes.fenceBackground, tiles: []};
        getLayer(area, 'foreground').grid = {w: 1, h: 1, palette: palettes.fenceForeground, tiles: []};
    },
}

const [stoneWallMid, stoneWallLeft, stoneWallRight, ...caveBackFrames] = createAnimation('gfx2/areas/cavebackground.png',
    {w: 128, h: 86}, {cols: 6}).frames;
const caveThingFrames = createAnimation('gfx2/areas/cavethings.png',
    {w: 32, h: 32}, {cols: 2}).frames;

const [caveWall, caveDoorOpen, caveDoorClosed] = createAnimation('gfx2/areas/cavebridge2.png',
    frame(0, 0, 39, 148, r(16, 92, 23, 35)), {cols: 3}).frames;

const CaveArea: AreaType = {
    addDoor(area, direction, door) {
        door.definition.y = 0;
        door.definition.z = 0;
        if (direction === 'N') {
            door.animation = AreaDoor.animations.northCaveDoor.normal;
            door.hoverAnimation = AreaDoor.animations.northCaveDoor.hover;
            door.definition.z = 20;
            door.definition.zAlign = 'back';
            const background = getLayer(area, 'background');
            const tileWidth = background.grid.palette.w;
            const gridPosition = Math.round(door.definition.x / tileWidth);
            // Center the door in between the two tiles
            door.definition.xAlign = 'middle';
            door.definition.x = tileWidth * gridPosition - area.width / 2;
            // The northern cave door needs to replace two tiles in the background.
            background.grid.tiles[0][gridPosition - 1] = null;
            background.grid.tiles[0][gridPosition] = null;
            // Right now this appears in front of the river which doesn't look great.
            background.objects.push(door);
        } else if (direction === 'S') {
            door.animation = AreaDoor.animations.southCaveDoor.normal;
            door.hoverAnimation = AreaDoor.animations.southCaveDoor.hover;
            door.definition.zAlign = 'front';
            const foreground = getLayer(area, 'foreground');
            const tileWidth = foreground.grid.palette.w;
            const gridPosition = Math.round(door.definition.x / tileWidth);
            // Align the door to the grid.
            door.definition.xAlign = 'middle';
            // Slight adjustment necessary to make this line up perfectly.
            door.definition.x = tileWidth * gridPosition + tileWidth / 2 - area.width / 2 - 3;
            // Remove the foreground tile behind the door
            foreground.grid.tiles[0][gridPosition] = null;
            // TODO: the path should appear under the player but the bushes need to
            // be over the player, so this should be split into two somehow.
            foreground.objects.push(door);
        } else if (direction === 'W') {
            door.animation = AreaDoor.animations.caveDoorOpen.normal;
            door.hoverAnimation = AreaDoor.animations.caveDoorOpen.hover;
            door.definition.x = 0;
            door.definition.flipped = true;
            door.definition.z = 2;
            getLayer(area, 'background').objects.push(door);
        } else if (direction === 'E') {
            door.animation = AreaDoor.animations.caveDoorOpen.normal;
            door.hoverAnimation = AreaDoor.animations.caveDoorOpen.hover;
            door.definition.x = 0;
            door.definition.xAlign = 'right';
            door.definition.z = 2;
            getLayer(area, 'background').objects.push(door);
        }
    },
    addLayers(area) {
        setStandardLayersOnArea(area);
        const background = getLayer(area, 'background');
        background.y = 8;
        background.grid = {w: 1, h: 1, palette: palettes.caveBackground, tiles: []};
        getLayer(area, 'floor').grid = {w: 1, h: 3, palette: palettes.caveFloor, tiles: []};
        getLayer(area, 'foreground').grid = {w: 1, h: 1, palette: palettes.caveForeground, tiles: []};
        area.leftWall = areaWalls.caveWall;
        area.rightWall = areaWalls.caveWall;
    },
    addObjects(area, {monsters = [], exits, loot, ability}) {
        const random = SRandom.addSeed(area.seed);
        area.enemies = [];
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
        // Draw a black background behind everything. This is for pits and when the background is empty.
        context.fillStyle = '#121115';
        context.fillRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
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
            const gap = random.range(-2, 2);
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
    },
    drawForeground(context, area) {
        const foreground = getLayer(area, 'foreground');
        const y = foreground.y + foreground.grid.h * foreground.grid.palette.h;
        context.fillStyle = '#000';
        context.fillRect(0, y, ADVENTURE_WIDTH, ADVENTURE_HEIGHT - y);
    }
};
const [guildBottomLeft, guildBottomRight, guildBottom] = createAnimation('gfx2/areas/guildnorthsouthdoorswalls.png',
    {w: 32, h: 28}, {x: 6, cols: 3, top: 36}).frames;

const GuildArea: AreaType = {
    addLayers(area) {
        area.layers = [
            // Additional background layers with parallax <= 1 can be added here.
            // Holds the floor tiles, won't usually have objects on it, as they would be behind the background.
            {key: 'floor', x: 0, y: BACKGROUND_HEIGHT, objects: [],
                grid: {w: 1, h: 3, palette: palettes.guildFloor, tiles: []},
            },
            // Holds the back wall tiles
            {key: 'backgroundWalls', x: 0, y: 0, objects: [],
                grid: {w: 1, h: 1, palette: palettes.guildBackground, tiles: []},
            },
            // Holds the back+side wall caps and background objects.
            {key: 'background', x: 0, y: 0, objects: [],
                grid: {w: 1, h: 2, palette: palettes.guildForeground, tiles: []},
            },
            // Holds all the objects that are z-sorted in the field as well as players/effects
            // Does not have a defined grid currently.
            {key: 'field', x: 0, y: BACKGROUND_HEIGHT, grid: null, objects: []},
            // Holds a grid and objects that are always in front of the field.
            {key: 'foreground', x: 0, y: 0, objects: [],
                grid: {w: 1, h: 3, palette: palettes.guildForeground, tiles: []}
            },
            // Additional foreground layers with parallax >= 1 can be added here.
        ];
    },
    addObjects(area, {monsters, exits, loot, ability}) {
        area.enemies = [];
        addMonstersToArea(area, monsters, area.enemyBonuses);
        addChest(area, loot);
        addShrine(area, ability);
        // Do this last since it depends on the final dimensions of the area.
        addExits(area, exits);
        finalizeArea(area);
    },
    addDoor(area, direction, door) {
        door.definition.y = 0;
        door.definition.z = 0;
        if (direction === 'N') {
            door.animation = AreaDoor.animations.backDoor.normal;
            door.hoverAnimation = AreaDoor.animations.backDoor.hover;
            door.definition.zAlign = 'back';
            const backgroundWalls = getLayer(area, 'backgroundWalls');
            const tileWidth = backgroundWalls.grid.palette.w;
            let gridPosition = Math.round(door.definition.x / tileWidth);
            // Prevent the door from being too far to the left or right.
            if (gridPosition * tileWidth + tileWidth >= area.width) {
                gridPosition--;
            } else if (gridPosition < 1) {
                gridPosition++;
            }
            // Center the door in the tile.
            door.definition.xAlign = 'middle';
            door.definition.x = tileWidth * gridPosition + tileWidth / 2 - area.width / 2;
            // Make the background behind the north door plain, we don't want to
            // accidentally render a window behind the door.
            backgroundWalls.grid.tiles[0][gridPosition] = {x: 1, y : 0}
            backgroundWalls.objects.push(door);
        } else if (direction === 'S') {
            door.animation = AreaDoor.animations.southDoor.normal;
            door.hoverAnimation = AreaDoor.animations.southDoor.hover;
            door.definition.z = -18;
            door.definition.zAlign = 'front';
            const foreground = getLayer(area, 'foreground');
            const gridPosition = Math.round(door.definition.x / foreground.grid.palette.w);
            // Align the door to the grid.
            door.definition.x = foreground.grid.palette.w * gridPosition;
            // Remove the foreground tile behind the door
            foreground.grid.tiles[2][gridPosition] = null;
            foreground.objects.push(door);
        } else if (direction === 'W') {
            door.animation = AreaDoor.animations.sideDoorClosed.normal;
            door.hoverAnimation = AreaDoor.animations.sideDoorClosed.hover;
            door.definition.x = 0;
            door.definition.flipped = true;
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
        } else if (direction === 'E') {
            door.animation = AreaDoor.animations.sideDoorClosed.normal;
            door.hoverAnimation = AreaDoor.animations.sideDoorClosed.hover;
            door.definition.x = 0;
            door.definition.xAlign = 'right';
            door.definition.z = -7;
            getLayer(area, 'background').objects.push(door);
        }
    },
    drawFloor(context, area) {
    },
    drawBackground(context, area) {
    },
    drawForeground(context, area) {
        const foreground = getLayer(area, 'foreground');
        const y = foreground.y + foreground.grid.h * foreground.grid.palette.h;
        context.fillStyle = '#000';
        context.fillRect(0, y, ADVENTURE_WIDTH, ADVENTURE_HEIGHT - y);
    },
    populateGrids(area) {
        const random = SRandom.addSeed(area.seed);
        for (const layer of area.layers) {
            if (layer.key === 'background') {
                layer.grid.w = Math.ceil(area.width / layer.grid.palette.w);
                layer.grid.tiles = [[], [], []];
                for (let x = 0; x < layer.grid.w; x++) {
                    layer.grid.tiles[0][x] = {
                        x: (x === 0 ? 2 : (x === layer.grid.w - 1 ? 1 : 0)),
                        y: 0,
                    };
                }
                layer.grid.tiles[1][0] = {x: 4, y: 0};
                layer.grid.tiles[1][layer.grid.w - 1] = {x: 3, y: 0};
            } else if (layer.key === 'foreground') {
                layer.grid.w = Math.ceil(area.width / layer.grid.palette.w);
                layer.grid.tiles = [[], [], []];
                for (let x = 0; x < layer.grid.w; x++) {
                    layer.grid.tiles[2][x] = {
                        x: (x === 0 ? 0 : (x === layer.grid.w - 1 ? 1 : 2)),
                        y: 1,
                    };
                }
            } else {
                populateLayerGrid(area, layer);
            }
        }
    },
    /*drawForeground(context, area) {
        context.fillStyle = '#000';
        context.fillRect(0, ADVENTURE_HEIGHT - 4, ADVENTURE_WIDTH, 4);
        /*const w = guildBottom.w;
        const h = guildBottom.h;
        let x = Math.floor(area.cameraX / w) * w;
        const y = BACKGROUND_HEIGHT + FIELD_HEIGHT;
        while (x < area.cameraX + ADVENTURE_WIDTH && x < area.width - w) {
            if (x <= 0) {
                x += w;
                continue;
            }
            // The other frame is a large window that I don't want to use just now.
            const frame = guildBottom;
            drawFrame(context, frame, {x: x - area.cameraX, y, w, h});
            x += w;
        }
        // Draw the bottom left/right tiles if they are in frame.
        if (area.cameraX < w) {
            drawFrame(context, guildBottomLeft, {x: -area.cameraX, y, w, h});
        }
        if (area.cameraX + ADVENTURE_WIDTH > area.width - w) {
            drawFrame(context, guildBottomRight, {x: area.width - w - area.cameraX, y, w, h});
        }
    }*/
};

function addDoorToLayer(area: Area, layer: string, door: AreaDoor): void {
    const background: AreaLayer = getLayer(area, layer);
    background.objects.push(door);
}

function addExits(area: Area, exits: Exit[], animations: {normal: FrameAnimation, hover: FrameAnimation} = AreaDoor.animations.openDoor) {
    const background: AreaLayer = getLayer(area, 'background');
    if (exits[0]) {
        const door: AreaDoor = new AreaDoor();
        door.animation = animations.normal;
        door.hoverAnimation = animations.hover;
        door.exit = exits[0];
        door.definition = {
            type: 'door',
            key: 'entrance',
            // These fields are required on the definition, but
            // we are bypassing them in this context.
            exitKey: null,
            animation: null,
            x: 0,
            y: 0,
            z: -7,
            flipped: true,
        };
        background.objects.push(door);
    }
    if (exits[1]) {
        const door: AreaDoor = new AreaDoor();
        door.animation = animations.normal;
        door.hoverAnimation = animations.hover;
        door.exit = exits[1];
        door.definition = {
            type: 'door',
            key: 'exit',
            // These fields are required on the definition, but
            // we are bypassing them in this context.
            exitKey: null,
            animation: null,
            x: 0,
            xAlign: 'right',
            y: 0,
            z: -7,
        };
        background.objects.push(door);
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
        key: 'shrineChest',
        chestType: 'silverChest',
        x: area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4),
        y: 0,
        z: SRandom.addSeed(area.seed).range(MIN_Z + 16, MIN_Z + 32),
    };
    getLayer(area, 'field').objects.push(chest);
    area.width = chest.definition.x + RANGE_UNIT * 10;
}

function addShrine(area: Area, ability: Ability) {
    if (!ability) {
        return;
    }
    area.isShrineArea = true;
    const shrine: SkillShrine = new SkillShrine();
    shrine.frame = SRandom.addSeed(area.seed).element(SkillShrine.animations);
    shrine.definition = {
        type: "skillShrine",
        key: 'shrine',
        x: area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4),
        y: 0,
        z: 10,
    };

    getLayer(area, 'field').objects.push(shrine);
    area.width = shrine.definition.x + RANGE_UNIT * 20;
}

export const areaTypes = {
    oldGuild: GuildArea,
    guildBasement: GuildArea,
    forest: FieldArea,
    garden: VillageArea,
    orchard: FieldArea,
    field: FieldArea,
    cemetery: CaveArea,
    cave: CaveArea,
    beach: FieldArea,
    town: GuildArea,
    village: VillageArea,
};
window['areaTypes'] = areaTypes;
