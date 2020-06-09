import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const mission2 = 'mission2';

const forestClearing: AreaDefinition = {
    type: 'field',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    objects: {
    },
    backgroundObjects: {
        door: {
            type: 'door',
            x: 48, y: 13.333333333333336, zAlign: 'back',
            animation: "upstairs",
            exitKey: "westPath:door",
        },
    },
};

const westPath: AreaDefinition = {
    type: 'field',
    width: 600,
    objects: {
        door: {
            type: 'door',
            x: 1.0000000000000142, z: -49,
            animation: "downstairs",
            exitKey: "forestClearing:door",
        },
        door3: {
            type: 'door',
            x: 577.3333333333333, z: -10.666666666666657,
            animation: "woodBridge",
            exitKey: "eastPath:door",
        },
    },
    backgroundObjects: {
        door2: {
            type: 'door',
            x: 416.6666666666667, y: 13.333333333333329, zAlign: 'back',
            animation: "upstairs",
            exitKey: "westForest:door",
        },
        decoration: {
            type: 'decoration',
            x: 524.3333333333334, y: 8.000000000000004, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "billBoard",
        },
        decoration2: {
            type: 'decoration',
            x: 458.3333333333333, y: 7.666666666666664, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "billBoard",
        },
    },
    monsters: [
        {key: 'gremlin', level: 2, location: {x: 209, z: -3.333333333333343}, },
        {key: 'gremlin', level: 2, location: {x: 487.33333333333337, z: -3.333333333333343}, },
    ],
};

const westForest: AreaDefinition = {
    type: 'field',
    width: 400,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    objects: {
        door: {
            type: 'door',
            x: 325.0000000000001, z: -49,
            animation: "downstairs",
            exitKey: "westPath:door2",
        },
        door2: {
            type: 'door',
            x: 376.66666666666663, z: -10,
            animation: "caveDoorOpen",
            exitKey: "cave:door",
        },
    },
    backgroundObjects: {
    },
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 38.66666666666666, z: 0.6666666666666856, flipped: true}, },
    ],
};

const cave: AreaDefinition = {
    type: 'cave',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    objects: {
        door: {
            type: 'door',
            z: -8.666666666666686, flipped: true,
            animation: "caveDoorOpen",
            exitKey: "westForest:door2",
        },
        door2: {
            type: 'door',
            x: 296.99999999999994, z: -10,
            animation: "caveDoorOpen",
            exitKey: "eastForest:door",
        },
    },
    backgroundObjects: {
    },
    monsters: [
        {key: 'bat', level: 2, location: {x: 153, z: 60}, },
        {key: 'bat', level: 2, location: {x: 152.33333333333331, z: -60}, },
    ],
};

const eastForest: AreaDefinition = {
    type: 'field',
    width: 400,
    leftWallType: 'caveWall',
    rightWallType: 'river',
    objects: {
        door: {
            type: 'door',
            x: -1.7763568394002505e-15, z: -11.333333333333343, flipped: true,
            animation: "caveDoorOpen",
            exitKey: "cave:door2",
        },
        door2: {
            type: 'door',
            x: 42, z: -49,
            animation: "downstairs",
            exitKey: "eastPath:door2",
        },
    },
    backgroundObjects: {
    },
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 340, z: 19.333333333333343}, },
    ],
};

const eastPath: AreaDefinition = {
    type: 'field',
    width: 400,
    objects: {
        door: {
            type: 'door',
            x: -8.881784197001252e-16, z: -10.666666666666686, flipped: true,
            animation: "woodBridge",
            exitKey: "westPath:door3",
        },
        door3: {
            type: 'door',
            x: 327.6666666666667, z: -49,
            animation: "downstairs",
            exitKey: "southForest:door",
        },
    },
    backgroundObjects: {
        door2: {
            type: 'door',
            x: 141.66666666666663, y: 12, zAlign: 'back',
            animation: "upstairs",
            exitKey: "eastForest:door2",
        },
        decoration: {
            type: 'decoration',
            x: 0.6666666666666679, y: 7.0000000000000036, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "billBoard",
        },
        decoration2: {
            type: 'decoration',
            x: 70.33333333333331, y: 7.333333333333336, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "billBoard",
        },
    },
    monsters: [
        {key: 'gremlin', level: 2, location: {x: 147.66666666666669, z: -9.333333333333343}, },
        {key: 'gremlin', level: 2, location: {x: 371, z: -48.666666666666686}, },
    ],
};

const southForest: AreaDefinition = {
    type: 'field',
    width: 700,
    leftWallType: 'river',
    rightWallType: 'river',
    objects: {
    },
    backgroundObjects: {
        door: {
            type: 'door',
            x: 629.6666666666667, y: 13.000000000000007, zAlign: 'back',
            animation: "upstairs",
            exitKey: "eastPath:door3",
        },
    },
    monsters: [
        {key: 'bullGremlin', level: 2, isTarget: true, location: {x: 33.33333333333332, z: -32.66666666666666, flipped: true}, },
        {key: 'gremlin', level: 2, location: {x: 265.3333333333333, z: -4.666666666666657, flipped: true}, },
        {key: 'gremlin', level: 2, location: {x: 517.3333333333334, z: -2.666666666666657, flipped: true}, },
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
