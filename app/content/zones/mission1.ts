import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const mission1 = 'mission1';

const villageWest: AreaDefinition = {
    type: 'village',
    width: 455,
    leftWallType: 'fenceWall',
    rightWallType: 'fenceWall',
    layers: [
        {
            key: 'dirt', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'dirtFloor', w: 15, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:2,y:0},{x:4,y:0},{x:1,y:0},{x:6,y:0},{x:4,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:6,y:0},{x:1,y:0},{x:0,y:0},{x:3,y:0}],[{x:1,y:0},{x:1,y:0},{x:4,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:3,y:0},{x:0,y:0},{x:4,y:0},{x:5,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0}],[{x:2,y:0},{x:6,y:0},{x:6,y:0},{x:2,y:0},{x:6,y:0},{x:1,y:0},{x:0,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:5,y:0},{x:1,y:0},{x:3,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'grassOverlay', w: 15, h: 6,
                tiles: [[{x:14,y:0},{x:14,y:0},{x:14,y:0},{x:12,y:0},{x:14,y:0},{x:14,y:0},{x:15,y:0},{x:17,y:0},{x:12,y:0},{x:13,y:0},{x:18,y:0},{x:2,y:0},{x:4,y:0},{x:10,y:0},null,{x:11,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:3,y:0},{x:17,y:0},{x:12,y:0},{x:12,y:0},{x:18,y:0},{x:14,y:0},{x:14,y:0},{x:12,y:0}],[{x:19,y:0},{x:14,y:0},{x:19,y:0},{x:18,y:0},{x:19,y:0},{x:18,y:0},{x:15,y:0},{x:16,y:0},{x:12,y:0},{x:2,y:0},{x:4,y:0},{x:10,y:0},null,null,null,null,null,null,null,null,null,{x:11,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0}],[{x:19,y:0},{x:17,y:0},{x:19,y:0},{x:18,y:0},{x:18,y:0},{x:13,y:0},{x:16,y:0},{x:18,y:0},{x:14,y:0},{x:0,y:0},{x:7,y:0},{x:7,y:0},{x:8,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[{x:12,y:0},{x:13,y:0},{x:18,y:0},{x:13,y:0},{x:16,y:0},{x:13,y:0},{x:19,y:0},{x:13,y:0},{x:12,y:0},{x:13,y:0},{x:13,y:0},{x:13,y:0},{x:0,y:0},{x:7,y:0},{x:7,y:0},{x:8,y:0},null,null,null,null,null,null,{x:9,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0}],[{x:15,y:0},{x:16,y:0},{x:14,y:0},{x:15,y:0},{x:16,y:0},{x:16,y:0},{x:13,y:0},{x:14,y:0},{x:17,y:0},{x:18,y:0},{x:16,y:0},{x:15,y:0},{x:14,y:0},{x:15,y:0},{x:18,y:0},{x:0,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:1,y:0},{x:17,y:0},{x:15,y:0},{x:13,y:0},{x:14,y:0},{x:17,y:0},{x:15,y:0}],[{x:17,y:0},{x:17,y:0},{x:19,y:0},{x:18,y:0},{x:14,y:0},{x:14,y:0},{x:12,y:0},{x:13,y:0},{x:13,y:0},{x:16,y:0},{x:15,y:0},{x:16,y:0},{x:19,y:0},{x:12,y:0},{x:16,y:0},{x:15,y:0},{x:15,y:0},{x:18,y:0},{x:18,y:0},{x:16,y:0},{x:16,y:0},{x:16,y:0},{x:12,y:0},{x:13,y:0},{x:17,y:0},{x:17,y:0},{x:16,y:0},{x:17,y:0},{x:14,y:0}]],
            },
        },
        {
            key: 'background', x: 36, y: 52,
            objects: [
                {
                    type: 'door',
                    x: 216, y: 15, zAlign: 'back',
                    key: "door",
                    animation: "northFenceDoor",
                    exitKey: "villageWestHouse:door",
                },
                {
                    type: 'door',
                    x: 433, zAlign: 'back', z: -94,
                    animation: "sideFenceDoor",
                    exitKey: "villageSquare:door",
                    key: "door2",
                },
            ],
            grid: {
                palette: 'fenceBackground', w: 4, h: 1,
                tiles: [[{x:1,y:0},null,{x:0,y:0},null]],
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
                palette: 'fenceForeground', w: 4, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 277, z: -4}, },
        {key: 'gremlin', level: 1, location: {x: 389, z: -46}, },
    ],
};

const villageWestHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 10, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2}],[{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 3, h: 1,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:1,y:0}]],
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
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 64, z: -102,
                    animation: "southDoor",
                    exitKey: "villageWest:door",
                    key: "door",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 10, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},null,{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1}]],
            },
        },
    ],
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 167, z: 22}, },
        {key: 'skeleton', level: 1, location: {x: 277, z: -34, flipped: true}, },
    ],
};

const villageSquare: AreaDefinition = {
    type: 'village',
    width: 580,
    leftWallType: 'fenceWall',
    rightWallType: 'river',
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
                palette: 'grassOverlay', w: 38, h: 6,
                tiles: [[{x:13,y:0},{x:12,y:0},{x:18,y:0},{x:19,y:0},{x:17,y:0},{x:5,y:0},null,{x:6,y:0},{x:12,y:0},{x:15,y:0},{x:14,y:0},{x:13,y:0},{x:14,y:0},{x:12,y:0},{x:19,y:0},{x:17,y:0},{x:12,y:0},{x:18,y:0},{x:12,y:0},{x:16,y:0},{x:15,y:0},{x:5,y:0},null,{x:6,y:0},{x:13,y:0},{x:13,y:0},{x:17,y:0},{x:13,y:0},{x:12,y:0},{x:5,y:0},null,{x:6,y:0},{x:16,y:0},{x:14,y:0},{x:14,y:0},{x:14,y:0},{x:19,y:0},{x:16,y:0}],[{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:10,y:0},null,{x:11,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:10,y:0},null,{x:11,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:10,y:0},null,{x:11,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:16,y:0}],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:15,y:0},{x:13,y:0}],[{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:16,y:0}],[{x:14,y:0},{x:18,y:0},{x:14,y:0},{x:16,y:0},{x:16,y:0},{x:18,y:0},{x:18,y:0},{x:15,y:0},{x:13,y:0},{x:18,y:0},{x:12,y:0},{x:19,y:0},{x:15,y:0},{x:15,y:0},{x:19,y:0},{x:14,y:0},{x:14,y:0},{x:14,y:0},{x:18,y:0},{x:14,y:0},{x:16,y:0},{x:15,y:0},{x:13,y:0},{x:19,y:0},{x:14,y:0},{x:17,y:0},{x:18,y:0},{x:13,y:0},{x:14,y:0},{x:13,y:0},{x:12,y:0},{x:12,y:0},{x:15,y:0},{x:14,y:0},{x:16,y:0},{x:19,y:0},{x:12,y:0},{x:18,y:0}],[{x:17,y:0},{x:12,y:0},{x:13,y:0},{x:15,y:0},{x:15,y:0},{x:18,y:0},{x:18,y:0},{x:12,y:0},{x:13,y:0},{x:17,y:0},{x:16,y:0},{x:18,y:0},{x:12,y:0},{x:18,y:0},{x:17,y:0},{x:18,y:0},{x:16,y:0},{x:13,y:0},{x:12,y:0},{x:17,y:0},{x:19,y:0},{x:14,y:0},{x:15,y:0},{x:14,y:0},{x:14,y:0},{x:16,y:0},{x:18,y:0},{x:14,y:0},{x:15,y:0},{x:17,y:0},{x:15,y:0},{x:13,y:0},{x:16,y:0},{x:17,y:0},{x:17,y:0},{x:14,y:0},{x:17,y:0},{x:18,y:0}]],
            },
        },
        {
            key: 'background', x: 36, y: 52,
            objects: [
                {
                    type: 'door',
                    x: 88, y: 15, zAlign: 'back',
                    key: "door2",
                    animation: "northFenceDoor",
                    exitKey: "VillageSquareSmallHouse:door",
                },
                {
                    type: 'door',
                    x: 344, y: 15, zAlign: 'back',
                    key: "door3",
                    animation: "northFenceDoor",
                    exitKey: "villageSquareLongHouse:door",
                },
                {
                    type: 'door',
                    x: 472, y: 15, zAlign: 'back',
                    key: "door4",
                    animation: "northFenceDoor",
                    exitKey: "villageSquareLongHouse:door2",
                },
                {
                    type: 'door',
                    x: 11, zAlign: 'back', z: -94, flipped: true,
                    animation: "sideFenceDoor",
                    exitKey: "villageWest:door2",
                    key: "door",
                },
            ],
            grid: {
                palette: 'fenceBackground', w: 5, h: 1,
                tiles: [[null,{x:0,y:0},null,null,null]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: 557,
                    key: "door5",
                    animation: "woodBridge",
                    exitKey: "villageEast:door",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'fenceForeground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 230, z: 58}, },
        {key: 'gremlin', level: 1, location: {x: 261, z: -8}, },
        {key: 'gremlin', level: 1, location: {x: 523, z: -2}, },
    ],
};

const VillageSquareSmallHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 10, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2}],[{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 3, h: 1,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:1,y:0}]],
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
            ],
        },
        {
            key: 'foreground', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 256, z: -100,
                    animation: "southDoor",
                    exitKey: "villageSquare:door2",
                    key: "door",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 10, h: 3,
                tiles: [[],[],[{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:3,y:1},{x:1,y:1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[]],
            },
        },
    ],
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 59, z: 60}, },
        {key: 'skeleton', level: 1, location: {x: 36}, },
    ],
};

const villageSquareLongHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 412,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'guildFloor', w: 13, h: 3,
                tiles: [[{x:0,y:0},{x:0,y:2},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:2}],[{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1}],[{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:2},{x:0,y:2},{x:0,y:1},{x:0,y:1},{x:0,y:1},{x:0,y:0},{x:0,y:0},{x:0,y:2},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'backgroundWalls', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildBackground', w: 4, h: 1,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'guildForeground', w: 13, h: 2,
                tiles: [[{x:2,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0}],[{x:4,y:0},null,null,null,null,null,null,null,null,null,null,null,{x:3,y:0}],[]],
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
                {
                    type: 'door',
                    x: 64, z: -100,
                    animation: "southDoor",
                    exitKey: "villageSquare:door3",
                    key: "door",
                },
                {
                    type: 'door',
                    x: 320, z: -100,
                    animation: "southDoor",
                    exitKey: "villageSquare:door4",
                    key: "door2",
                },
            ],
            grid: {
                palette: 'guildForeground', w: 13, h: 3,
                tiles: [[null,null,null,null,null,null,{x:1,y:0},{x:2,y:0}],[null,null,null,null,null,null,{x:3,y:0},{x:4,y:0}],[{x:0,y:1},{x:2,y:1},{x:3,y:1},{x:2,y:1},{x:2,y:1},{x:2,y:1},{x:1,y:1},{x:0,y:1},{x:2,y:1},{x:2,y:1},{x:3,y:1},{x:2,y:1},{x:1,y:1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,[]],
            },
        },
    ],
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 41, z: 64}, },
        {key: 'skeleton', level: 1, location: {x: 205, z: -42}, },
        {key: 'skeleton', level: 1, location: {x: 382, z: 66}, },
    ],
};

const villageEast: AreaDefinition = {
    type: 'village',
    width: 600,
    leftWallType: 'river',
    rightWallType: 'caveWall',
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
                palette: 'grassOverlay', w: 38, h: 6,
                tiles: [[{x:14,y:0},{x:14,y:0},{x:15,y:0},{x:19,y:0},{x:13,y:0},{x:17,y:0},{x:17,y:0},{x:17,y:0},{x:12,y:0},{x:13,y:0},{x:13,y:0},{x:12,y:0},{x:19,y:0},{x:16,y:0},{x:14,y:0},{x:2,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:3,y:0},{x:14,y:0},{x:12,y:0},{x:12,y:0},{x:16,y:0},{x:18,y:0}],[{x:12,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:4,y:0},{x:10,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:11,y:0},{x:3,y:0},{x:18,y:0},{x:19,y:0},{x:18,y:0},{x:13,y:0}],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:6,y:0},{x:15,y:0},{x:18,y:0},{x:13,y:0},{x:15,y:0}],[{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:8,y:0},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{x:9,y:0},{x:1,y:0},{x:17,y:0},{x:18,y:0},{x:16,y:0},{x:18,y:0}],[{x:14,y:0},{x:17,y:0},{x:12,y:0},{x:19,y:0},{x:16,y:0},{x:18,y:0},{x:18,y:0},{x:15,y:0},{x:15,y:0},{x:17,y:0},{x:16,y:0},{x:19,y:0},{x:12,y:0},{x:19,y:0},{x:17,y:0},{x:0,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:7,y:0},{x:1,y:0},{x:18,y:0},{x:17,y:0},{x:13,y:0},{x:14,y:0},{x:18,y:0}],[{x:16,y:0},{x:18,y:0},{x:16,y:0},{x:14,y:0},{x:17,y:0},{x:14,y:0},{x:12,y:0},{x:15,y:0},{x:17,y:0},{x:19,y:0},{x:12,y:0},{x:18,y:0},{x:17,y:0},{x:13,y:0},{x:12,y:0},{x:18,y:0},{x:19,y:0},{x:17,y:0},{x:15,y:0},{x:19,y:0},{x:14,y:0},{x:19,y:0},{x:15,y:0},{x:14,y:0},{x:12,y:0},{x:17,y:0},{x:16,y:0},{x:15,y:0},{x:15,y:0},{x:15,y:0},{x:18,y:0},{x:13,y:0},{x:13,y:0},{x:19,y:0},{x:15,y:0},{x:14,y:0},{x:13,y:0},{x:19,y:0}]],
            },
        },
        {
            key: 'background', x: 36, y: 52,
            objects: [
            ],
            grid: {
                palette: 'fenceBackground', w: 5, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    z: -2, flipped: true,
                    key: "door",
                    animation: "woodBridge",
                    exitKey: "villageSquare:door5",
                },
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
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 438, z: 40}, },
        {key: 'gremlin', level: 1, location: {x: 434, z: -36}, },
        {key: 'skeleton', level: 1, location: {x: 480, z: 34}, },
        {key: 'skeleton', level: 1, location: {x: 489, z: -40}, },
    ],
};

zones.mission1 = {
    villageWest,
    villageWestHouse,
    villageSquare,
    VillageSquareSmallHouse,
    villageSquareLongHouse,
    villageEast,
};
