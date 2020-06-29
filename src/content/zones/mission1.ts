import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const mission1 = 'mission1';

const villageWest: AreaDefinition = {
    type: 'cave',
    width: 450,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'caveFloor', w: 15, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 8,
            objects: [
                {
                    type: 'door',
                    x: 205, zAlign: 'back', z: -10,
                    key: "door",
                    animation: "backDoor",
                    exitKey: "villageWestHouse:door",
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
                {
                    type: 'door',
                    x: 427, z: -10,
                    key: "door2",
                    animation: "woodBridge",
                    exitKey: "villageSquare:door",
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
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 277, z: -4}, },
        {key: 'gremlin', level: 1, location: {x: 389, z: -46}, },
    ],
};

const villageWestHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
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
                {
                    type: 'door',
                    x: 44, zAlign: 'back', z: 35,
                    key: "door",
                    animation: "backDoor",
                    exitKey: "villageWest:door",
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
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 167, z: 22}, },
        {key: 'skeleton', level: 1, location: {x: 277, z: -34, flipped: true}, },
    ],
};

const villageSquare: AreaDefinition = {
    type: 'town',
    width: 600,
    leftWallType: 'river',
    rightWallType: 'river',
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
                    type: 'door',
                    x: 99, zAlign: 'back', z: 2,
                    key: "door2",
                    animation: "backDoor",
                    exitKey: "VillageSquareSmallHouse:door",
                },
                {
                    type: 'door',
                    x: 304, zAlign: 'back', z: 4,
                    key: "door3",
                    animation: "backDoor",
                    exitKey: "villageSquareLongHouse:door",
                },
                {
                    type: 'door',
                    x: 497, zAlign: 'back', z: 2,
                    key: "door4",
                    animation: "backDoor",
                    exitKey: "villageSquareLongHouse:door2",
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
                    type: 'door',
                    z: 8, flipped: true,
                    key: "door",
                    animation: "woodBridge",
                    exitKey: "villageWest:door2",
                },
                {
                    type: 'door',
                    x: 577, z: 6,
                    key: "door5",
                    animation: "woodBridge",
                    exitKey: "villageEast:door",
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
        {key: 'gremlin', level: 1, location: {x: 219, z: 42}, },
        {key: 'gremlin', level: 1, location: {x: 217, z: -32}, },
        {key: 'gremlin', level: 1, location: {x: 532}, },
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
    type: 'field',
    width: 600,
    leftWallType: 'river',
    rightWallType: 'caveWall',
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
                    z: 10, flipped: true,
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
                palette: 'meadowForeground', w: 5, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
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
