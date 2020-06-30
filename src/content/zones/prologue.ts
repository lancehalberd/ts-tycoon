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
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

zones.prologue = {
    entrance,
    tunnel,
    tunnel2,
};
