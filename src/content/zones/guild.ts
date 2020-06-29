import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const guild = 'guild';

const guildYard: AreaDefinition = {
    type: 'forest',
    width: 420,
    leftWallType: 'river',
    rightWallType: 'guildWall',
    seed: 1,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 14, h: 3,
                tiles: [[{x:1,y:0},{x:4,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:3,y:0},{x:1,y:0}],[{x:4,y:0},{x:2,y:0},{x:5,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:5,y:0},{x:3,y:0}],[{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:3,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:1,y:0},{x:4,y:0},{x:0,y:0},{x:5,y:0},{x:5,y:0},{x:3,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    xAlign: 'right', x: -8, z: 13,
                    key: "frontDoor",
                    exitKey: "guildFoyer:frontDoor",
                    animation: "closedDoor",
                },
            ],
            grid: {
                palette: 'meadowBackground', w: 2, h: 1,
                tiles: [[{x:0,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: -1, flipped: true,
                    key: "mapExit",
                    exitKey: "worldMap",
                    animation: "woodBridge",
                },
                {
                    type: 'guildGate',
                    x: 297, z: 64,
                    key: "guildGate",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'meadowForeground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const guildFoyer: AreaDefinition = {
    type: 'oldGuild',
    width: 512,
    seed: 2,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 16, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:2},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:0}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:2}],[{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 4, h: 1,
                tiles: [[{x:1,y:0},{x:2,y:0},{x:2,y:0},{x:2,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'decoration',
                    x: 103, zAlign: 'back', z: 14,
                    key: "decoration",
                    animationGroup: "guildWall",
                    animationKey: "billBoard",
                },
                {
                    type: 'application',
                    x: 111, zAlign: 'back', z: 32,
                    key: "applicationA",
                },
                {
                    type: 'application',
                    x: 137, zAlign: 'back', z: 32,
                    key: "applicationB",
                },
                {
                    type: 'decoration',
                    x: 50, y: 25, zAlign: 'back',
                    key: "nicheA",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    parentKey: 'nicheA', xAlign: 'middle', y: 5,
                    key: "candleA",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    xAlign: 'middle', x: -30, y: 35, zAlign: 'back',
                    key: "nicheB",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    parentKey: 'nicheB', xAlign: 'middle', y: 5,
                    key: "candleB",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    parentKey: 'candleB',
                    key: "candleFlameB",
                    animationGroup: "guildWall",
                    animationKey: "candleFlame",
                },
                {
                    type: 'decoration',
                    xAlign: 'middle', x: 30, y: 35, zAlign: 'back',
                    key: "nicheC",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    parentKey: 'nicheC', xAlign: 'middle', y: 5,
                    key: "candleC",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    parentKey: 'candleC',
                    key: "candleFlameC",
                    animationGroup: "guildWall",
                    animationKey: "candleFlame",
                },
                {
                    type: 'decoration',
                    xAlign: 'right', x: -50, y: 25, zAlign: 'back',
                    key: "nicheD",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    parentKey: 'nicheD', xAlign: 'middle', y: 5,
                    key: "candleD",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    parentKey: 'candleD',
                    key: "candleFlameD",
                    animationGroup: "guildWall",
                    animationKey: "candleFlame",
                },
                {
                    type: 'door',
                    x: 1, z: 20, flipped: true,
                    key: "frontDoor",
                    exitKey: "guildYard:frontDoor",
                    animation: "sideDoorClosed",
                },
                {
                    type: 'door',
                    xAlign: 'right', x: -1,
                    key: "hallDoor",
                    exitKey: "guildFrontHall:foyerDoor",
                    animation: "sideDoorClosed",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 16, h: 2,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0}],[{x:4,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:3,y:0}],[]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'mapTable',
                    x: 80,
                    key: "mapTable",
                },
                {
                    type: 'coinStash',
                    xAlign: 'middle', x: -30, zAlign: 'back',
                    key: "coinStash",
                },
                {
                    type: 'shrineOfFortune',
                    xAlign: 'middle', zAlign: 'back',
                    key: "shrineOfFortune",
                },
                {
                    type: 'animaOrb',
                    xAlign: 'middle', x: 30, zAlign: 'back',
                    key: "animaOrb",
                },
                {
                    type: 'trophyAltar',
                    x: 289,
                    key: "trophyAltar",
                },
                {
                    type: 'bed',
                    xAlign: 'right', x: -34, zAlign: 'front', flipped: true,
                    key: "bed",
                },
                {
                    type: 'obstacle',
                    xAlign: 'right', x: -102, zAlign: 'back',
                    key: "bookShelf",
                    animationGroup: "guildFurniture",
                    animationKey: "bookShelf",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildForeground', w: 16, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
            },
        },
    ],
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 211, z: -8}, },
        {key: 'skeleton', level: 1, location: {x: 381, z: -8}, },
    ],
};

const guildFrontHall: AreaDefinition = {
    type: 'oldGuild',
    width: 600,
    seed: 3,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 19, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:2}],[{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:2}],[{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:1,y:0},{x:0,y:0},{x:1,y:0},{x:2,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 94, zAlign: 'back', z: 35,
                    key: "guestRoomDoor",
                    animation: "backDoor",
                    exitKey: "guildGuestRoom:door",
                },
                {
                    type: 'door',
                    x: 489, zAlign: 'back', z: 32,
                    key: "basementStairs",
                    animation: "downstairs",
                    exitKey: "guildBasement:stairs",
                },
                {
                    type: 'door',
                    x: 1, z: -7, flipped: true,
                    key: "foyerDoor",
                    exitKey: "guildFoyer:hallDoor",
                    animation: "sideDoorClosed",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 19, h: 2,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0}],[{x:4,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:3,y:0}],[]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'shrineOfCreation',
                    xAlign: 'middle', x: 3, z: 6,
                    key: "shrineOfCreation",
                },
                {
                    type: 'coinStash',
                    x: 176, zAlign: 'back',
                    key: "coinStashA",
                },
                {
                    type: 'coinStash',
                    x: 201, zAlign: 'back',
                    key: "coinStashB",
                    level: 2,
                },
                {
                    type: 'trophyAltar',
                    x: 181, z: -4,
                    key: "trophyAltarA",
                },
                {
                    type: 'trophyAltar',
                    xAlign: 'right', x: -180,
                    key: "trophyAltarB",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildForeground', w: 19, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
            },
        },
    ],
    monsters: [
        {key: 'spider', level: 3, location: {x: 232, z: -58}, },
        {key: 'gnome', level: 3, location: {x: 496, z: -52}, },
    ],
};

const guildGuestRoom: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    seed: 4,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 10, h: 3,
                tiles: [[{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0}],[{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1}],[{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:2}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 3, h: 1,
                tiles: [[{x:1,y:0},{x:2,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 140, zAlign: 'back', z: 35,
                    key: "door",
                    animation: "backDoor",
                    exitKey: "guildFrontHall:guestRoomDoor",
                },
                {
                    type: 'decoration',
                    x: 78, y: 25, zAlign: 'back',
                    key: "decoration",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    x: 202, y: 23, zAlign: 'back',
                    key: "decoration2",
                    animationGroup: "guildWall",
                    animationKey: "niche",
                },
                {
                    type: 'decoration',
                    x: 86, y: 30, zAlign: 'back',
                    key: "decoration3",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    x: 210, y: 27, zAlign: 'back',
                    key: "decoration4",
                    animationGroup: "guildWall",
                    animationKey: "candle",
                },
                {
                    type: 'decoration',
                    x: 86, y: 30, zAlign: 'back',
                    key: "decoration5",
                    animationGroup: "guildWall",
                    animationKey: "candleFlame",
                },
                {
                    type: 'decoration',
                    x: 210, y: 28, zAlign: 'back',
                    key: "decoration6",
                    animationGroup: "guildWall",
                    animationKey: "candleFlame",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 10, h: 2,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0}],[{x:4,y:0},null,null,null,null,null,null,null,null,{x:3,y:0}],[]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'bed',
                    x: 12, z: -52,
                    key: "bedA",
                },
                {
                    type: 'bed',
                    x: 256, z: -52, flipped: true,
                    key: "bedB",
                },
                {
                    type: 'coinStash',
                    x: 283, z: 56,
                    key: "coinStashA",
                },
                {
                    type: 'coinStash',
                    x: 16, z: 54,
                    key: "coinStashB",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildForeground', w: 10, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
            },
        },
    ],
};

const guildBasement: AreaDefinition = {
    type: 'cave',
    width: 640,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 20, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0},{x:5,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0},{x:2,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 528, zAlign: 'back', z: 20,
                    key: "stairs",
                    animation: "upstairs",
                    exitKey: "guildFrontHall:basementStairs",
                },
                {
                    type: 'door',
                    x: 1, z: -2, flipped: true,
                    key: "vaultDoor",
                    animation: "caveDoorOpen",
                    exitKey: "guildVault:door",
                },
            ],
            grid: {
                palette: 'caveBackground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'caveForeground', w: 8, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'vampireBat', level: 15, location: {xAlign: 'right', x: -209, zAlign: 'front', flipped: true}, },
        {key: 'vampireBat', level: 15, location: {x: 94, z: 68, flipped: true}, },
        {key: 'vampireBat', level: 15, location: {x: 79, z: -62, flipped: true}, },
    ],
};

const guildVault: AreaDefinition = {
    type: 'cave',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 10, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 294, z: 2,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "guildBasement:vaultDoor",
                },
            ],
            grid: {
                palette: 'caveBackground', w: 3, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'coinStash',
                    x: 29, z: 28,
                    key: "coinStashA",
                },
                {
                    type: 'coinStash',
                    x: 63, z: -54,
                    key: "coinStashB",
                },
                {
                    type: 'coinStash',
                    x: 29, z: -12,
                    key: "coinStashC",
                },
                {
                    type: 'coinStash',
                    x: 99, z: 60,
                    key: "coinStashD",
                },
                {
                    type: 'coinStash',
                    x: 188, z: -54,
                    key: "coinStashE",
                },
                {
                    type: 'coinStash',
                    x: 64, z: 58,
                    key: "coinStashF",
                },
                {
                    type: 'coinStash',
                    x: 96, z: -54,
                    key: "coinStashG",
                },
                {
                    type: 'coinStash',
                    x: 223, z: 63,
                    key: "coinStashH",
                },
                {
                    type: 'coinStash',
                    x: 223, z: -54,
                    key: "coinStashI",
                },
                {
                    type: 'coinStash',
                    x: 189, z: 63,
                    key: "coinStashJ",
                },
                {
                    type: 'trophyAltar',
                    x: 144,
                    key: "trophyAltar",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'caveForeground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

zones.guild = {
    guildYard,
    guildFoyer,
    guildFrontHall,
    guildGuestRoom,
    guildBasement,
    guildVault,
};
