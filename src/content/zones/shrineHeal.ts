import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const shrineHeal = 'shrineHeal';

const entrance: AreaDefinition = {
    type: 'field',
    width: 500,
    rightWallType: 'caveWall',
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 477, zAlign: 'back', z: -54,
            animation: "caveDoorOpen",
            exitKey: "shrine:door",
        },
    },
};

const shrine: AreaDefinition = {
    type: 'cave',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    seed: 7654615776495261,
    objects: {
        shrineOfCreation: {
            type: 'shrineOfCreation',
            x: 132, z: 57,
        },
        door3: {
            type: 'door',
            x: 183, z: -57,
            animation: "downstairs",
            exitKey: "trialOfFaith:door",
        },
    },
    wallDecorations: {
        door: {
            type: 'door',
            zAlign: 'back', z: -55, flipped: true,
            animation: "caveDoorOpen",
            exitKey: "entrance:door",
        },
        door2: {
            type: 'door',
            x: 219, zAlign: 'back', z: 29,
            animation: "backDoor",
            exitKey: "trialOfResolve:door",
        },
        door4: {
            type: 'door',
            x: 297, zAlign: 'back', z: -54,
            animation: "caveDoorOpen",
            exitKey: "boss:door",
        },
    },
};

const trialOfResolve: AreaDefinition = {
    type: 'cave',
    width: 500,
    seed: 3167875903276947,
    objects: {
        door: {
            type: 'door',
            x: 10, z: -57,
            animation: "downstairs",
            exitKey: "shrine:door2",
        },
    },
    wallDecorations: {
    },
};

const trialOfFaith: AreaDefinition = {
    type: 'cave',
    width: 500,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    seed: 7389566328205333,
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 53, zAlign: 'back', z: 30,
            animation: "upstairs",
            exitKey: "shrine:door3",
        },
    },
};

const boss: AreaDefinition = {
    type: 'cave',
    width: 500,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    objects: {
    },
    wallDecorations: {
        door: {
            type: 'door',
            zAlign: 'back', z: -54, flipped: true,
            animation: "caveDoorOpen",
            exitKey: "shrine:door4",
        },
    },
};

zones.shrineHeal = {
    entrance,
    shrine,
    trialOfResolve,
    trialOfFaith,
    boss,
};
