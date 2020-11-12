import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const prologue = 'prologue';

const entrance: AreaDefinition = {
    type: 'forest',
    width: 500,
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 16, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 475, zAlign: 'back', z: -60,
                    animation: "caveDoorOpen",
                    exitKey: "tunnel:door",
                    key: "door",
                },
                {
                    type: 'message',
                    x: 33, y: 99, zAlign: 'back',
                    messages: ["Your salvation lies ahead."],
                    key: "message",
                    delay: 1000,
                },
            ],
            grid: {
                palette: 'meadowBackground', w: 2, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0}]],
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
                palette: 'meadowForeground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const tunnel: AreaDefinition = {
    type: 'cave',
    width: 600,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 19, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 2, zAlign: 'back', z: -66, flipped: true,
                    animation: "caveDoorOpen",
                    exitKey: "entrance:door",
                    key: "door",
                },
                {
                    type: 'door',
                    x: 433, zAlign: 'back', z: 20,
                    animation: "northCaveDoor",
                    exitKey: "tunnel2:door",
                    key: "door2",
                },
                {
                    type: 'message',
                    x: 51, y: 77, zAlign: 'back',
                    messages: ["Are you strong enough to seize it?"],
                    key: "message",
                    delay: 1000,
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
                palette: 'caveForeground', w: 7, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'snowWolf', level: 16, location: {x: 339, z: 4}, },
    ],
};

const tunnel2: AreaDefinition = {
    type: 'cave',
    width: 600,
    leftWallType: 'caveWall',
    rightWallType: 'guildWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 19, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 572, zAlign: 'back', z: -54,
                    animation: "openDoor",
                    exitKey: "trapRoom:entrance",
                    key: "templeDoor",
                },
                {
                    type: 'message',
                    x: 44, y: 75, zAlign: 'back',
                    messages: ["Your enemies will outnumber you"],
                    key: "message",
                    delay: 1000,
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
                {
                    type: 'floorTrigger',
                    x: 424,
                    shapeType: "vertical",
                    w: 32,
                    d: 32,
                    targets: ["snowWolfA","snowWolfB","snowWolfC"],
                    key: "floorTrigger",
                    targetCutscene: "prologueAbilityTutorial",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
                {
                    type: 'door',
                    x: 110, z: -74,
                    animation: "southCaveDoor",
                    exitKey: "tunnel:door2",
                    key: "door",
                },
            ],
            grid: {
                palette: 'caveForeground', w: 7, h: 1,
                tiles: [[{x:0,y:0},null,{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'snowWolf', level: 1, isTriggered: true, triggerKey: 'snowWolfA', location: {x: 523, z: 6}, },
        {key: 'snowWolf', level: 1, isTriggered: true, triggerKey: 'snowWolfB', location: {x: 225, z: 48, flipped: true}, },
        {key: 'snowWolf', level: 1, isTriggered: true, triggerKey: 'snowWolfC', location: {x: 224, z: -64, flipped: true}, },
    ],
};

const trapRoom: AreaDefinition = {
    type: 'oldGuild',
    width: 600,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 19, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:0}],[{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 5, h: 1,
                tiles: [[{x:2,y:0},{x:1,y:0},{x:1,y:0},{x:1,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'flameThrower',
                    x: 127, zAlign: 'back', z: 22,
                    animationKey: "nozzleAnimation",
                    key: "flameThrower",
                    onDuration: 1500,
                    offDuration: 1000,
                },
                {
                    type: 'door',
                    x: 312, zAlign: 'back', z: 2,
                    animation: "backDoor",
                    exitKey: "treasureRoom:door",
                    key: "treasureDoor",
                },
                {
                    type: 'door',
                    zAlign: 'back', z: -58, flipped: true,
                    animation: "sideDoorClosed",
                    exitKey: "tunnel2:templeDoor",
                    key: "entrance",
                },
                {
                    type: 'message',
                    x: 29, y: 66, zAlign: 'back',
                    messages: ["Your path is perilous"],
                    key: "message",
                    delay: 1000,
                },
                {
                    type: 'flameThrower',
                    x: 400, y: 11, zAlign: 'back',
                    animationKey: "nozzleAnimation",
                    key: "flameThrower2",
                    onDuration: 1500,
                    offDuration: 1000,
                    offsetTime: 1200,
                },
                {
                    type: 'flameThrower',
                    x: 425, y: 11, zAlign: 'back',
                    animationKey: "nozzleAnimation",
                    key: "flameThrower3",
                    onDuration: 1500,
                    offDuration: 1000,
                    offsetTime: 800,
                },
                {
                    type: 'flameThrower',
                    x: 450, y: 11, zAlign: 'back',
                    animationKey: "nozzleAnimation",
                    key: "flameThrower4",
                    offDuration: 1000,
                    onDuration: 1500,
                    offsetTime: 400,
                },
                {
                    type: 'flameThrower',
                    x: 475, y: 11, zAlign: 'back',
                    animationKey: "nozzleAnimation",
                    key: "flameThrower5",
                    offsetTime: 0,
                    onDuration: 1500,
                    offDuration: 1000,
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
};

const treasureRoom: AreaDefinition = {
    type: 'oldGuild',
    width: 600,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 19, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:0}],[{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 5, h: 1,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'flameThrower',
                    x: 380, zAlign: 'back', z: 22,
                    animationKey: "nozzleAnimation",
                    key: "flameC",
                },
                {
                    type: 'flameThrower',
                    x: 352, zAlign: 'back', z: 22,
                    animationKey: "nozzleAnimation",
                    key: "flameB",
                    on: false,
                },
                {
                    type: 'flameThrower',
                    x: 323, zAlign: 'back', z: 22,
                    animationKey: "nozzleAnimation",
                    key: "flameA",
                    on: true,
                },
                {
                    type: 'switch',
                    x: 236, zAlign: 'back', z: 8,
                    animation: "backSwitch",
                    targets: ["flameB","flameA"],
                    key: "switch",
                },
                {
                    type: 'switch',
                    x: 268, zAlign: 'back', z: 8,
                    animation: "backSwitch",
                    targets: ["flameA","flameC","flameB"],
                    key: "switch2",
                },
                {
                    type: 'switch',
                    x: 298, zAlign: 'back', z: 6,
                    animation: "backSwitch",
                    targets: ["flameB","flameC"],
                    key: "switch3",
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
                    type: 'obstacle',
                    x: 553, z: 16,
                    animationGroup: "guildFurniture",
                    animationKey: "silverChest",
                    key: "obstacle",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 64, z: -100,
                    animation: "southDoor",
                    exitKey: "trapRoom:treasureDoor",
                    key: "door",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 19, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:3,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
            },
        },
    ],
};

zones.prologue = {
    entrance,
    tunnel,
    tunnel2,
    trapRoom,
    treasureRoom,
};
