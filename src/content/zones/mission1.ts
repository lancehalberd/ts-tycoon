import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const villageWest: AreaDefinition = {
    type: 'field',
    width: 450,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    objects: {
        door2: {
            type: 'door',
            x: 427.3333333333333, z: -10,
            animation: "woodBridge",
            exitKey: "villageSquare:door",
        },
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 206.66666666666666, y: 13.333333333333329, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageWestHouse:door",
        },
    },
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 175.33333333333334}},
        {key: 'gremlin', level: 1, location: {x: 390.3333333333333, z: -44.66666666666666}},
    ],
};

export const villageWestHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 44.66666666666667, y: 14.333333333333336, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageWest:door",
        },
    },
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 168.00000000000003, z: 22.666666666666686}},
        {key: 'skeleton', level: 1, location: {x: 278.3333333333333, z: -36, flipped: true}},
    ],
};

export const villageSquare: AreaDefinition = {
    type: 'field',
    width: 600,
    leftWallType: 'river',
    rightWallType: 'river',
    objects: {
        door: {
            type: 'door',
            x: -8.881784197001252e-15, z: -13.333333333333343, flipped: true,
            animation: "woodBridge",
            exitKey: "villageWest:door2",
        },
        door5: {
            type: 'door',
            x: 576.6666666666666, z: -8.666666666666657,
            animation: "woodBridge",
            exitKey: "villageEast:door",
        },
    },
    wallDecorations: {
        door2: {
            type: 'door',
            x: 103.33333333333334, y: 13, zAlign: 'back',
            animation: "backDoor",
            exitKey: "VillageSquareSmallHouse:door",
        },
        door3: {
            type: 'door',
            x: 298.33333333333326, y: 13.333333333333321, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageSquareLongHouse:door",
        },
        door4: {
            type: 'door',
            x: 474.33333333333337, y: 12.666666666666671, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageSquareLongHouse:door2",
        },
    },
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 219, z: 42}},
        {key: 'gremlin', level: 1, location: {x: 217, z: -32}},
        {key: 'gremlin', level: 1, location: {x: 532.6666666666667}},
    ],
};

export const VillageSquareSmallHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 320,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 245.00000000000003, y: 14.333333333333336, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageSquare:door2",
        },
    },
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 53, z: 48}},
        {key: 'skeleton', level: 1, location: {x: 43.33333333333333, z: 7.333333333333314}},
    ],
};

export const villageSquareLongHouse: AreaDefinition = {
    type: 'oldGuild',
    width: 400,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 78.66666666666669, y: 14.999999999999993, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageSquare:door3",
        },
        door2: {
            type: 'door',
            x: 286.66666666666663, y: 14.666666666666664, zAlign: 'back',
            animation: "backDoor",
            exitKey: "villageSquare:door4",
        },
    },
    monsters: [
        {key: 'skeleton', level: 1, location: {x: 48.666666666666664, z: 14.666666666666657}},
        {key: 'skeleton', level: 1, location: {x: 193, z: -48.66666666666666}},
        {key: 'skeleton', level: 1, location: {x: 340.3333333333333, z: 15.333333333333343}},
    ],
};

export const villageEast: AreaDefinition = {
    type: 'field',
    width: 600,
    leftWallType: 'river',
    rightWallType: 'caveWall',
    objects: {
        door: {
            type: 'door',
            x: -0.6666666666666661, z: -7.333333333333314, flipped: true,
            animation: "woodBridge",
            exitKey: "villageSquare:door5",
        },
    },
    wallDecorations: {
    },
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 438.66666666666674, z: 38.66666666666666}},
        {key: 'gremlin', level: 1, location: {x: 434.33333333333337, z: -36.66666666666666}},
        {key: 'skeleton', level: 1, location: {x: 478.6666666666667, z: 34.666666666666686}},
        {key: 'skeleton', level: 1, location: {x: 490, z: -39.33333333333334}},
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
