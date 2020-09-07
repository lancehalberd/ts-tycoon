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
                    x: -1, z: 8, flipped: true,
                    key: "bridge",
                    exitKey: "endlessAdventure:bridge",
                    animation: "woodBridge",
                },
                {
                    type: 'guildGate',
                    x: 295, z: 80,
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
                    x: 110, y: 16, zAlign: 'back',
                    key: "applicationA",
                },
                {
                    type: 'application',
                    x: 136, y: 16, zAlign: 'back',
                    key: "applicationB",
                },
                {
                    type: 'decoration',
                    x: 50, y: 10, zAlign: 'back',
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
                    xAlign: 'middle', x: -30, y: 20, zAlign: 'back',
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
                    xAlign: 'middle', x: 30, y: 20, zAlign: 'back',
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
                    xAlign: 'right', x: -50, y: 10, zAlign: 'back',
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
                    x: 1, z: 10, flipped: true,
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
                    x: 98, z: 6,
                    key: "mapTable",
                },
                {
                    type: 'coinStash',
                    xAlign: 'middle', x: -22, zAlign: 'back', z: -6,
                    key: "coinStash",
                    level: 1,
                },
                {
                    type: 'shrineOfFortune',
                    xAlign: 'middle', zAlign: 'back',
                    key: "shrineOfFortune",
                },
                {
                    type: 'animaOrb',
                    xAlign: 'middle', x: 81, zAlign: 'back', z: -34,
                    key: "animaOrb",
                },
                {
                    type: 'bed',
                    xAlign: 'right', x: -16, zAlign: 'front', flipped: true,
                    key: "bed",
                },
                {
                    type: 'obstacle',
                    xAlign: 'right', x: -77, zAlign: 'back',
                    key: "bookShelf",
                    animationGroup: "guildFurniture",
                    animationKey: "bookShelf",
                },
                {
                    type: 'coinStash',
                    x: 267, z: 74,
                    key: "coinStash2",
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
                    x: 93, zAlign: 'back', z: 2,
                    key: "guestRoomDoor",
                    animation: "backDoor",
                    exitKey: "guildGuestRoom:door",
                },
                {
                    type: 'door',
                    x: 491, zAlign: 'back', z: 4,
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
                {
                    type: 'door',
                    x: 569, zAlign: 'back', z: -60,
                    animation: "sideDoorClosed",
                    exitKey: "guildGarden:door",
                    key: "gardenDoor",
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
                    xAlign: 'middle', x: 2, z: 16,
                    key: "shrineOfCreation",
                },
                {
                    type: 'coinStash',
                    x: 22, zAlign: 'back',
                    key: "coinStashA",
                },
                {
                    type: 'coinStash',
                    x: 46, zAlign: 'back',
                    key: "coinStashB",
                    level: 2,
                },
                {
                    type: 'trophyAltar',
                    x: 162, z: 8,
                    key: "trophyAltarA",
                },
                {
                    type: 'trophyAltar',
                    xAlign: 'right', x: -180, z: 10,
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
        {key: 'spider', level: 3, location: {x: 225, z: -52}, },
        {key: 'gnome', level: 3, location: {x: 496, z: -42}, },
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
                    x: 12, z: 68,
                    key: "bedA",
                },
                {
                    type: 'bed',
                    x: 255, z: 68, flipped: true,
                    key: "bedB",
                },
                {
                    type: 'coinStash',
                    x: 287, z: 30,
                    key: "coinStashA",
                },
                {
                    type: 'coinStash',
                    x: 12, z: 34,
                    key: "coinStashB",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 128, z: -100,
                    animation: "southDoor",
                    exitKey: "guildFrontHall:guestRoomDoor",
                    key: "door",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 10, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:4,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
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
                    x: 528, zAlign: 'back', z: -8,
                    key: "stairs",
                    animation: "upstairs",
                    exitKey: "guildFrontHall:basementStairs",
                },
                {
                    type: 'door',
                    x: 3, z: 14, flipped: true,
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
        {key: 'vampireBat', level: 15, location: {xAlign: 'right', x: -207, zAlign: 'front', z: 22, flipped: true}, },
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
                    x: 296, z: 10,
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
                    x: 141, z: 10,
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

const guildGarden: AreaDefinition = {
    type: 'guildGarden',
    width: 584,
    leftWallType: 'guildWall',
    rightWallType: 'fenceWall',
    layers: [
        {
            key: 'dirt', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'dirtFloor', w: 19, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:2,y:0},{x:4,y:0},{x:1,y:0},{x:6,y:0},{x:4,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:6,y:0},{x:1,y:0},{x:0,y:0},{x:3,y:0},{x:6,y:0},{x:1,y:0},{x:6,y:0},{x:5,y:0}],[{x:1,y:0},{x:1,y:0},{x:4,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:3,y:0},{x:0,y:0},{x:4,y:0},{x:5,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:5,y:0},{x:2,y:0},{x:2,y:0},{x:6,y:0}],[{x:2,y:0},{x:6,y:0},{x:6,y:0},{x:2,y:0},{x:6,y:0},{x:1,y:0},{x:0,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:5,y:0},{x:1,y:0},{x:3,y:0},{x:0,y:0},{x:6,y:0},{x:5,y:0},{x:4,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'grassOverlay', w: 19, h: 6,
                tiles: [[{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:12,y:0},{x:13,y:0},{x:2,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:3,y:0},{x:18,y:0},{x:17,y:0},{x:18,y:0},{x:18,y:0},{x:2,y:0},{x:10,y:0},null,null,null,null,null,{x:6,y:0},{x:15,y:0},{x:12,y:0},{x:16,y:0},{x:16,y:0}],[{x:17,y:0},{x:15,y:0},{x:13,y:0},{x:17,y:0},{x:2,y:0},{x:10,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:6,y:0},{x:2,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:10,y:0},null,null,null,null,null,{x:9,y:0},{x:1,y:0},{x:17,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0}],[{x:17,y:0},{x:17,y:0},{x:12,y:0},{x:17,y:0},{x:5,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:11,y:0},{x:10,y:0},null,null,null,null,null,null,null,null,null,{x:6,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0}],[{x:17,y:0},{x:13,y:0},{x:17,y:0},{x:15,y:0},{x:5,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:9,y:0},{x:1,y:0},{x:15,y:0},{x:17,y:0},{x:17,y:0},{x:15,y:0},{x:16,y:0}],[{x:17,y:0},{x:17,y:0},{x:2,y:0},{x:12,y:0},{x:0,y:0},{x:8,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,{x:9,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:1,y:0},{x:16,y:0},{x:17,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0},{x:17,y:0}],[{x:6,y:0},{x:2,y:0},{x:1,y:0},{x:5,y:0},{x:13,y:0},{x:0,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:1,y:0},{x:17,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:15,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0}]],
            },
        },
        {
            key: 'background', x: 36, y: 52,
            objects: [
                {
                    type: 'door',
                    x: 7, zAlign: 'back', z: -60, flipped: true,
                    animation: "openDoor",
                    exitKey: "guildFrontHall:gardenDoor",
                    key: "door",
                },
            ],
            grid: {
                palette: 'fenceBackground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},null]],
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
                palette: 'fenceForeground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const endlessAdventure: AreaDefinition = {
    type: 'forest',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 19, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 139, y: 12, zAlign: 'back',
                    animation: "northMeadowDoor",
                    exitKey: "endless:1:1:0",
                    key: "door:endless:1:1:0",
                },
                {
                    type: 'door',
                    x: 298, zAlign: 'back', z: -66,
                    animation: "woodBridge",
                    exitKey: "guildYard:bridge",
                    key: "bridge",
                },
                {
                    type: 'door',
                    x: 1, zAlign: 'back', z: -60, flipped: true,
                    animation: "caveDoorOpen",
                    exitKey: "endless:1:1:2",
                    key: "door:endless:1:1:2",
                },
            ],
            grid: {
                palette: 'meadowBackground', w: 3, h: 1,
                tiles: [[null,null,{x:0,y:0}]],
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
                {
                    type: 'door',
                    x: 174, z: -56,
                    animation: "southMeadowDoor",
                    exitKey: "endless:1:1:4",
                    key: "door:endless:1:1:4",
                },
            ],
            grid: {
                palette: 'meadowForeground', w: 5, h: 1,
                tiles: [[{x:0,y:0},null,{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
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
    guildGarden,
    endlessAdventure,
};
