import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const mission2 = 'mission2';

const forestClearing: AreaDefinition = {
    type: 'field',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 10, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 48, zAlign: 'back', z: 34,
                    key: "door",
                    animation: "upstairs",
                    exitKey: "westPath:door",
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
                palette: 'meadowForeground', w: 3, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

const westPath: AreaDefinition = {
    type: 'field',
    width: 600,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 19, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 416, zAlign: 'back', z: 32,
                    key: "door2",
                    animation: "upstairs",
                    exitKey: "westForest:door",
                },
                {
                    type: 'decoration',
                    x: 522, zAlign: 'back', z: 18,
                    key: "decoration",
                    animationGroup: "guildWall",
                    animationKey: "billBoard",
                },
                {
                    type: 'decoration',
                    x: 456, zAlign: 'back', z: 18,
                    key: "decoration2",
                    animationGroup: "guildWall",
                    animationKey: "billBoard",
                },
            ],
            grid: {
                palette: 'meadowBackground', w: 3, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: 1, z: -48,
                    key: "door",
                    animation: "downstairs",
                    exitKey: "forestClearing:door",
                },
                {
                    type: 'door',
                    x: 577, z: -10,
                    key: "door3",
                    animation: "woodBridge",
                    exitKey: "eastPath:door",
                },
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'meadowForeground', w: 5, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'gremlin', level: 2, location: {x: 209, z: -2}, },
        {key: 'gremlin', level: 2, location: {x: 489, z: -4}, },
    ],
};

const westForest: AreaDefinition = {
    type: 'field',
    width: 400,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 13, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'meadowBackground', w: 2, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: 324, z: -48,
                    key: "door",
                    animation: "downstairs",
                    exitKey: "westPath:door2",
                },
                {
                    type: 'door',
                    x: 376,
                    key: "door2",
                    animation: "caveDoorOpen",
                    exitKey: "cave:door",
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
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 40, z: 2, flipped: true}, },
    ],
};

const cave: AreaDefinition = {
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
                    type: 'door',
                    flipped: true,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "westForest:door2",
                },
                {
                    type: 'door',
                    x: 296, z: -2,
                    key: "door2",
                    animation: "caveDoorOpen",
                    exitKey: "eastForest:door",
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
    monsters: [
        {key: 'bat', level: 2, location: {x: 156, z: 54}, },
        {key: 'bat', level: 2, location: {x: 156, z: -64}, },
    ],
};

const eastForest: AreaDefinition = {
    type: 'field',
    width: 400,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 13, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'meadowBackground', w: 2, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
                {
                    type: 'door',
                    x: 1, z: 4, flipped: true,
                    key: "door",
                    animation: "caveDoorOpen",
                    exitKey: "cave:door2",
                },
                {
                    type: 'door',
                    x: 42, z: -52,
                    key: "door2",
                    animation: "downstairs",
                    exitKey: "eastPath:door2",
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
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 343, z: 18}, },
    ],
};

const eastPath: AreaDefinition = {
    type: 'field',
    width: 400,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 13, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 142, zAlign: 'back', z: 34,
                    key: "door2",
                    animation: "upstairs",
                    exitKey: "eastForest:door2",
                },
                {
                    type: 'decoration',
                    zAlign: 'back', z: 20,
                    key: "decoration",
                    animationGroup: "guildWall",
                    animationKey: "billBoard",
                },
                {
                    type: 'decoration',
                    x: 70, zAlign: 'back', z: 18,
                    key: "decoration2",
                    animationGroup: "guildWall",
                    animationKey: "billBoard",
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
                {
                    type: 'door',
                    x: -8.881784197001252e-16, z: -10.666666666666686, flipped: true,
                    key: "door",
                    animation: "woodBridge",
                    exitKey: "westPath:door3",
                },
                {
                    type: 'door',
                    x: 325, z: -48,
                    key: "door3",
                    animation: "downstairs",
                    exitKey: "southForest:door",
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
    monsters: [
        {key: 'gremlin', level: 2, location: {x: 153, z: -10}, },
        {key: 'gremlin', level: 2, location: {x: 371, z: -46}, },
    ],
};

const southForest: AreaDefinition = {
    type: 'field',
    width: 700,
    leftWallType: 'river',
    rightWallType: 'river',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 22, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:5,y:0},{x:4,y:0},{x:5,y:0},{x:0,y:0},{x:1,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0},{x:2,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0},{x:4,y:0},{x:4,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:2,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
                {
                    type: 'door',
                    x: 630, zAlign: 'back', z: 34,
                    key: "door",
                    animation: "upstairs",
                    exitKey: "eastPath:door3",
                },
            ],
            grid: {
                palette: 'meadowBackground', w: 3, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0},{x:0,y:0}]],
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
                palette: 'meadowForeground', w: 6, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 37, z: -28, flipped: true}, },
        {key: 'gremlin', level: 2, location: {x: 267, flipped: true}, },
        {key: 'gremlin', level: 2, location: {x: 514, z: -2, flipped: true}, },
    ],
};

zones.mission2 = {
    forestClearing,
    westPath,
    westForest,
    cave,
    eastForest,
    eastPath,
    southForest,
};
