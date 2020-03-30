import { addMonstersToArea, enterArea } from 'app/adventure';
import {
    initializeActorForAdventure,
} from 'app/character';
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

import { fixedObject } from 'app/content/furniture';
import {
    Ability, Actor, Area, AreaEntity, AreaObject, AreaObjectTarget,
    AreaType, Exit, FixedObject, Frame, Hero, MonsterSpawn, MonsterSpawner,
    Animation,
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

export class AreaDecoration implements AreaObject {
    area: Area;
    frame: Frame;
    x: number;
    y: number;
    z: number;
    w: number;
    h: number;
    isSolid: boolean = false;

    constructor(frame: Frame, x: number, z: number) {
        this.frame = frame;
        const content = frame.content || frame;
        this.w = content.w;
        this.h = content.h;
        this.x = x;
        this.y = 0;
        this.z = z;
    }

    getAreaTarget(): AreaObjectTarget {
        return {
            area: this.area,
            targetType: 'object',
            object: this,
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w,
            h: this.x,
        };
    }

    render(context: CanvasRenderingContext2D) {
        const content = this.frame.content || this.frame;
        context.save();
            context.translate(
                this.x + content.w / 2 - this.area.cameraX,
                GROUND_Y - content.h - this.z / 2
            );
            context.scale(-1, 1);
            drawFrame(context, this.frame, {...this.frame, x: 0, y: 0});
        context.restore();
    }
}

export class AreaObstacle extends AreaDecoration {
    isSolid: boolean = true;
}

export class SimpleMonsterSpawner implements MonsterSpawner {
    area: Area;
    x: number;
    y: number;
    z: number;
    isSolid: boolean = false;
    proximity = ADVENTURE_WIDTH / 3;
    spawns: Partial<MonsterSpawn & {delay?: number}>[];
    time: number;
    lastSpawnTime: number;
    spawnTimer: number;
    spawnAnimation: Animation;

    constructor(spawns: MonsterSpawn[], initialDelay: number, delay: number, animation: Animation) {
        this.spawns = spawns.map(spawn => ({...spawn, delay}));
        this.spawnAnimation = animation;
        this.lastSpawnTime = 0;
        this.spawnTimer = initialDelay;
    }

    getCurrentFrame(): Frame {
        return getFrame(this.spawnAnimation, Math.max(0, -this.spawnTimer));
    }

    getAreaTarget(): AreaObjectTarget {
        const frame = this.getCurrentFrame();
        const content = frame.content || frame;
        return {
            area: this.area,
            targetType: 'object',
            object: this,
            x: this.x,
            y: this.y,
            z: this.z,
            w: content.w,
            h: content.x,
        };
    }

    update() {
        // Do nothing once all monsters are spawned.
        if (!this.spawns.length) {
            return;
        }
        this.time += FRAME_LENGTH;
        // Do nothing if the hero is not in range.
        if (Math.abs(this.x - this.area.allies.find(actor => actor.type === 'hero').x) > this.proximity) {
            return;
        }
        this.spawnTimer -= FRAME_LENGTH;
        if (this.spawnTimer <= -this.spawnAnimation.duration) {
            // spawn the monster.
            const monsterData = this.spawns.shift();
            const bonusSources = [...(monsterData.bonusSources || []), ...this.area.enemyBonuses];
            const rarity = monsterData.rarity;
            const newMonster = makeMonster(this.area, monsterData.key, monsterData.level, bonusSources, rarity);
            newMonster.heading = [-1, 0, 0]; // Monsters move right to left
            newMonster.x = this.x;
            newMonster.y = this.y;
            newMonster.z = this.z;
            newMonster.area = this.area;
            initializeActorForAdventure(newMonster);
            newMonster.time = 0;
            newMonster.allies = newMonster.area.enemies;
            newMonster.enemies = newMonster.area.allies;
            newMonster.allies.push(newMonster);

            this.lastSpawnTime = this.time;
            if (this.spawns.length) {
                this.spawnTimer = this.spawns[0].delay;
            }
        } else if (this.spawnTimer > 0 && this.area.enemies.filter(e => !e.isDead).length === 0) {
            this.spawnTimer = 0;
        }
    }

    render(context: CanvasRenderingContext2D) {
        const frame = this.getCurrentFrame();
        const content = frame.content || frame;
        context.save();
            context.translate(
                this.x + content.w / 2 - this.area.cameraX,
                GROUND_Y - content.h - this.z / 2
            );
            context.scale(-1, 1);
            drawFrame(context, frame, {...frame, x: 0, y: 0});
        context.restore();
    }
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
        addExits(area, exits, meadowBridge);
        area.leftWall = areaWalls.river;
        area.rightWall = areaWalls.river;
        // Add an obstacle to the corners
        area.objects.push(new AreaObstacle(random.addSeed(1).element(meadowThingFrames), 44, MAX_Z - 24));
        area.objects.push(new AreaObstacle(random.addSeed(2).element(meadowThingFrames), area.width - 44, MAX_Z - 24));
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
        const cloudSpeed = 1;
        // TODO: Why does this look so much choppier than other movement?
        const cloudDx = cloudSpeed * area.time;
        let X = area.cameraX * 0.5;
        // This index will be the same for a cloud as it animates from right to left.
        let index = Math.floor((X + cloudDx) / w);
        // The x position of this cloud will decrease over time.
        let x = index * w - cloudDx - X;
        while (x < ADVENTURE_WIDTH) {
            const frame = random.addSeed(index).element(meadowClouds);
            /*context.drawImage(
                frame.image,
                frame.x, frame.y, frame.w, frame.h,
                Math.round(x + SRandom.seed(index).random()), -SRandom.seed(index).range(0, 8), w, h
            );*/
            const P = 20;
            const W = frame.w / P;
            for (let i = 0; i < P; i++) {
                // This is 1px wide for all but the last section so they will not have gaps between.
                const width = W + ((i === P) ? 0 : 1);
                drawFrame(context, {...frame, w: width, x: frame.x + i * W}, {
                    x: Math.round(x + i * W + random.addSeed(index).random() + i / P),
                    y: -random.addSeed(index).range(0, 8), w: width, h});
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
    r(0, 0, 128, 84), {cols: 6}).frames;
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
        addExits(area, exits, caveDoorOpen);
        area.leftWall = areaWalls.caveWall;
        area.rightWall = areaWalls.caveWall;
        // Add an obstacle to the corners
        area.objects.push(new AreaObstacle(random.addSeed(1).element(caveThingFrames), 44, MAX_Z - 24));
        area.objects.push(new AreaObstacle(random.addSeed(2).element(caveThingFrames), area.width - 44, MAX_Z - 24));
        finalizeArea(area);
    },
    drawFloor(context, area) {
        const random = SRandom.addSeed(area.seed);
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
        drawFrame(context, meadowSky, {...meadowSky, x: 0, y: 0});
        const random = SRandom.addSeed(area.seed);
        // Draws the pillars with parallax.
        {
            let w = 128;
            let h = 84;
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
            let h = 84;
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
                drawFrame(context, frame, {x: x - area.cameraX, y: 0, w, h});
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

export const areaWalls = {
    caveWall: frameAnimation(caveWall),
    river: frameAnimation(meadowRiver),
    guildWall: frameAnimation(guildRightWall),
};

export class AreaDoor implements AreaObject {
    static openDoorFrame = guildRightDoorEmpty;
    static closedDoorFrame = guildRightDoor;
    static boardedDoorFrame = guildRightBoardedDoor;
    static woodBridge = meadowBridge;

    area: Area;
    isLeftDoor: boolean;
    exit: Exit;
    frame: Frame;

    constructor(isLeftDoor: boolean, exit: Exit, frame: Frame = guildRightDoorEmpty) {
        this.isLeftDoor = isLeftDoor;
        this.exit = exit;
        this.frame = frame;
    }

    onInteract(door: AreaDoor, hero: Hero) {
        enterArea(hero, door.exit);
    }

    shouldInteract(object: FixedObject, hero: Hero) {
        return !this.isLeftDoor;
    }

    getAreaTarget(door: AreaDoor): AreaObjectTarget {
        const content = door.frame.content || door.frame;
        return {
            targetType: 'object',
            object: door,
            area: door.area,
            w: content.w, h: 0,
            x: door.isLeftDoor ? content.w / 2 : door.area.width - content.w / 2,
            y: 0, z: 0,
        };
    }
    render(context: CanvasRenderingContext2D, door: AreaDoor) {
        // Draw with white outlines when this is the canvas target.
        const draw = getCanvasPopupTarget() === door ? drawWhiteOutlinedFrame : drawFrame;
        if (door.isLeftDoor && door.area.cameraX < door.frame.w) {
            context.save();
                context.translate(door.frame.w - door.area.cameraX, 0);
                context.scale(-1, 1);
                draw(context, door.frame, {...door.frame, x: 0, y: 0});
            context.restore();
        } else if (!door.isLeftDoor && door.area.cameraX + ADVENTURE_WIDTH > door.area.width - door.frame.w) {
            draw(context, door.frame, {...door.frame, x: door.area.width - door.frame.w - door.area.cameraX, y: 0});
        }
    }
    isPointOver(door: AreaDoor, x: number, y: number) {
        x += door.area.cameraX;
        const target = {...door.frame.content};
        if (door.isLeftDoor) {
            // Flip the x to be the distant from the right edge instead.
            target.x = door.frame.w - (target.x + target.w);
        } else {
            // The right door is always at the right edge of the map.
            target.x += door.area.width - door.frame.w;
        }
        return isPointInRect(x, y, target.x, target.y, target.w, target.h);
    }
}

function finalizeArea(area: Area) {
    for (const object of area.objects) object.area = area;
    for (const object of area.wallDecorations) object.area = area;
}

function addExits(area: Area, exits: Exit[], frame: Frame = guildRightDoorEmpty) {
    if (exits[0]) {
        area.wallDecorations.push(new AreaDoor(true, exits[0], frame));
    }
    if (exits[1]) {
        area.wallDecorations.push(new AreaDoor(false, exits[1], frame));
    }
}

function isExitEnabled(object: AreaObject): boolean {
    return !object.area.isBossArea || !object.area.enemies.length;
}

function addChest(area: Area, loot: any[]) {
    if (!loot || !loot.length) {
        return;
    }
    const chest = fixedObject('closedChest', [0, 0, 0], {scale: 0.5, loot});
    area.objects.push(chest);
    chest.x = area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4);
    chest.z = SRandom.addSeed(area.seed).range(MIN_Z + 16, MIN_Z + 32);
    area.width = chest.x + 100;
}

function addShrine(area: Area, ability: Ability) {
    if (!ability) {
        return;
    }
    area.isShrineArea = true;
    const shrine = fixedObject('skillShrine',
        [area.width + SRandom.addSeed(area.seed).range(0, RANGE_UNIT * 4), 10, 0],
    );
    area.objects.push(shrine);
    area.width = shrine.x + RANGE_UNIT * 8;
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
