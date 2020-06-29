import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const shrineHeal = 'shrineHeal';

const entrance: AreaDefinition = {
    type: 'field',
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
                    x: 476, zAlign: 'back', z: -48,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "shrine:door",
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

const shrine: AreaDefinition = {
    type: 'cave',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    seed: 7654615776495261,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 10, h: 3,
                tiles: [[{x:4,y:0},{x:4,y:0},{x:2,y:0},{x:1,y:0},{x:4,y:0},{x:4,y:0},{x:1,y:0},{x:4,y:0},{x:5,y:0},{x:1,y:0}],[{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:5,y:0},{x:0,y:0},{x:4,y:0},{x:4,y:0},{x:3,y:0},{x:5,y:0},{x:3,y:0}],[{x:5,y:0},{x:4,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:3,y:0},{x:2,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    zAlign: 'back', z: -55, flipped: true,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "entrance:door",
                },
                {
                    type: 'door',
                    x: 219, zAlign: 'back', z: 28,
                    key: "door2",
                    animation: "backDoor",
                    exitKey: "trialOfResolve:door",
                },
                {
                    type: 'door',
                    x: 296, zAlign: 'back', z: -56,
                    key: "door4",
                    animation: "caveDoorOpen",
                    exitKey: "boss:door",
                },
            ],
            grid: {
                palette: 'caveBackground', w: 3, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'shrineOfCreation',
                    x: 129, z: 57,
                    key: "shrineOfCreation",
                },
                {
                    type: 'door',
                    x: 182, z: -57,
                    key: "door3",
                    animation: "downstairs",
                    exitKey: "trialOfFaith:door",
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

const trialOfResolve: AreaDefinition = {
    type: 'cave',
    width: 500,
    seed: 3167875903276947,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 16, h: 3,
                tiles: [[{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:3,y:0},{x:0,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0}],[{x:1,y:0},{x:5,y:0},{x:5,y:0},{x:3,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:3,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:4,y:0}],[{x:3,y:0},{x:1,y:0},{x:3,y:0},{x:3,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0},{x:2,y:0},{x:4,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
            ],
            grid: {
                palette: 'caveBackground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:1,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: 18, z: -57,
                    key: "door",
                    animation: "downstairs",
                    exitKey: "shrine:door2",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'caveForeground', w: 6, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const trialOfFaith: AreaDefinition = {
    type: 'cave',
    width: 500,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    seed: 7389566328205333,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 16, h: 3,
                tiles: [[{x:2,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0},{x:3,y:0},{x:3,y:0},{x:3,y:0},{x:5,y:0},{x:3,y:0},{x:1,y:0},{x:1,y:0},{x:5,y:0},{x:0,y:0},{x:2,y:0},{x:4,y:0},{x:2,y:0}],[{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:4,y:0},{x:2,y:0},{x:0,y:0},{x:2,y:0},{x:4,y:0},{x:2,y:0},{x:4,y:0}],[{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:0,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:0,y:0},{x:1,y:0},{x:5,y:0},{x:5,y:0},{x:3,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 53, zAlign: 'back', z: 24,
                    key: "door",
                    animation: "upstairs",
                    exitKey: "shrine:door3",
                },
            ],
            grid: {
                palette: 'caveBackground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0}]],
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
                palette: 'caveForeground', w: 6, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const boss: AreaDefinition = {
    type: 'cave',
    width: 500,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 16, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 2, zAlign: 'back', z: -54, flipped: true,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "shrine:door4",
                },
            ],
            grid: {
                palette: 'caveBackground', w: 4, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
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
                palette: 'caveForeground', w: 6, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

zones.shrineHeal = {
    entrance,
    shrine,
    trialOfResolve,
    trialOfFaith,
    boss,
};
