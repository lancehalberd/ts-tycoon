import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const guildYard: AreaDefinition = {
    type: 'forest',
    width: 340,
    leftWallType: 'river',
    rightWallType: 'guildWall',
    seed: 1,
    objects: {
        mapExit: {
            type: 'door',
            z: -22, flipped: true,
            exitKey: "worldMap",
            animation: "woodBridge",
        },
        frontDoor: {
            type: 'door',
            xAlign: 'right', x: -8, z: -8,
            exitKey: "guildFoyer:frontDoor",
            animation: "closedDoor",
        },
    },
    wallDecorations: {
    },
};

export const guildFoyer: AreaDefinition = {
    type: 'oldGuild',
    width: 500,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    seed: 2,
    objects: {
        mapTable: {
            type: 'mapTable',
            x: 80,
        },
        coinStash: {
            type: 'coinStash',
            xAlign: 'middle', x: -30, zAlign: 'back',
        },
        shrineOfFortune: {
            type: 'shrineOfFortune',
            xAlign: 'middle', zAlign: 'back',
        },
        animaOrb: {
            type: 'animaOrb',
            xAlign: 'middle', x: 30, zAlign: 'back',
        },
        trophyAltar: {
            type: 'trophyAltar',
            x: 289,
        },
        bed: {
            type: 'bed',
            xAlign: 'right', x: -32, zAlign: 'front', flipped: true,
        },
        bookShelf: {
            type: 'obstacle',
            xAlign: 'right', x: -100, zAlign: 'back',
            animationGroup: "guildFurniture",
            animationKey: "bookShelf",
        },
        frontDoor: {
            type: 'door',
            x: 8, z: -7, flipped: true,
            exitKey: "guildYard:frontDoor",
            animation: "closedDoor",
        },
        hallDoor: {
            type: 'door',
            xAlign: 'right', x: -8, z: -7,
            exitKey: "guildFrontHall:foyerDoor",
            animation: "openDoor",
        },
    },
    wallDecorations: {
        applicationA: {
            type: 'application',
            x: 90, y: 15, zAlign: 'back',
        },
        applicationB: {
            type: 'application',
            x: 128, y: 15, zAlign: 'back',
        },
        nicheA: {
            type: 'decoration',
            x: 50, y: 25, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        candleA: {
            type: 'decoration',
            parentKey: 'nicheA', xAlign: 'middle', y: 5,
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        nicheB: {
            type: 'decoration',
            xAlign: 'middle', x: -30, y: 35, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        candleB: {
            type: 'decoration',
            parentKey: 'nicheB', xAlign: 'middle', y: 5,
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        candleFlameB: {
            type: 'decoration',
            parentKey: 'candleB',
            animationGroup: "guildWall",
            animationKey: "candleFlame",
        },
        nicheC: {
            type: 'decoration',
            xAlign: 'middle', x: 30, y: 35, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        candleC: {
            type: 'decoration',
            parentKey: 'nicheC', xAlign: 'middle', y: 5,
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        candleFlameC: {
            type: 'decoration',
            parentKey: 'candleC',
            animationGroup: "guildWall",
            animationKey: "candleFlame",
        },
        nicheD: {
            type: 'decoration',
            xAlign: 'right', x: -50, y: 25, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        candleD: {
            type: 'decoration',
            parentKey: 'nicheD', xAlign: 'middle', y: 5,
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        candleFlameD: {
            type: 'decoration',
            parentKey: 'candleD',
            animationGroup: "guildWall",
            animationKey: "candleFlame",
        },
    },
    monsters: [
        {key: 'gremlin', level: 1, location: {x: 211, z: -8}},
        {key: 'skeleton', level: 1, location: {x: 381, z: -8}},
    ],
};

export const guildFrontHall: AreaDefinition = {
    type: 'oldGuild',
    width: 600,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    seed: 3,
    objects: {
        shrineOfCreation: {
            type: 'shrineOfCreation',
            xAlign: 'middle',
        },
        coinStashA: {
            type: 'coinStash',
            x: 175, zAlign: 'back',
        },
        coinStashB: {
            type: 'coinStash',
            x: 200, zAlign: 'back',
            level: 2,
        },
        trophyAltarA: {
            type: 'trophyAltar',
            x: 180,
        },
        trophyAltarB: {
            type: 'trophyAltar',
            xAlign: 'right', x: -180,
        },
        foyerDoor: {
            type: 'door',
            x: 8, z: -7, flipped: true,
            exitKey: "guildFoyer:hallDoor",
            animation: "openDoor",
        },
    },
    wallDecorations: {
        guestRoomDoor: {
            type: 'door',
            x: 94, y: 13, zAlign: 'back',
            animation: "backDoor",
            exitKey: "guildGuestRoom:door",
        },
        basementStairs: {
            type: 'door',
            x: 489, y: 14, zAlign: 'back',
            animation: "downstairs",
            exitKey: "guildBasement:stairs",
        },
    },
    monsters: [
        {key: 'spider', level: 3, location: {x: 228, z: -60}},
        {key: 'gnome', level: 3, location: {x: 494, z: -56}},
    ],
};

export const guildGuestRoom: AreaDefinition = {
    type: 'oldGuild',
    width: 330,
    leftWallType: 'guildWall',
    rightWallType: 'guildWall',
    seed: 4,
    objects: {
        bedA: {
            type: 'bed',
            x: 34, z: -44,
        },
        bedB: {
            type: 'bed',
            x: 223, z: -44, flipped: true,
        },
        coinStashA: {
            type: 'coinStash',
            x: 239, z: 54,
        },
        coinStashB: {
            type: 'coinStash',
            x: 35, z: 54,
        },
    },
    wallDecorations: {
        door: {
            type: 'door',
            x: 140, y: 15, zAlign: 'back',
            animation: "backDoor",
            exitKey: "guildFrontHall:guestRoomDoor",
        },
        decoration: {
            type: 'decoration',
            x: 78, y: 25, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        decoration2: {
            type: 'decoration',
            x: 202, y: 23, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "niche",
        },
        decoration3: {
            type: 'decoration',
            x: 86, y: 30, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        decoration4: {
            type: 'decoration',
            x: 210, y: 27, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "candle",
        },
        decoration5: {
            type: 'decoration',
            x: 86, y: 30, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "candleFlame",
        },
        decoration6: {
            type: 'decoration',
            x: 210, y: 28, zAlign: 'back',
            animationGroup: "guildWall",
            animationKey: "candleFlame",
        },
    },
};

export const guildBasement: AreaDefinition = {
    type: 'cave',
    width: 640,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    objects: {
        vaultDoor: {
            type: 'door',
            z: -10, flipped: true,
            animation: "caveDoorOpen",
            exitKey: "guildVault:door",
        },
    },
    wallDecorations: {
        stairs: {
            type: 'door',
            x: 528, y: 10, zAlign: 'back',
            animation: "upstairs",
            exitKey: "guildFrontHall:basementStairs",
        },
    },
    monsters: [
        {key: 'vampireBat', level: 15, location: {xAlign: 'right', x: -218, zAlign: 'front', flipped: true}},
        {key: 'vampireBat', level: 15, location: {x: 95, z: 60, flipped: true}},
        {key: 'vampireBat', level: 15, location: {x: 77, z: -60, flipped: true}},
    ],
};

export const guildVault: AreaDefinition = {
    type: 'cave',
    width: 320,
    leftWallType: 'caveWall',
    rightWallType: 'caveWall',
    objects: {
        door: {
            type: 'door',
            x: 296, z: -10,
            animation: "caveDoorOpen",
            exitKey: "guildBasement:vaultDoor",
        },
        coinStashA: {
            type: 'coinStash',
            x: 28, z: 26,
        },
        coinStashB: {
            type: 'coinStash',
            x: 61, z: -54,
        },
        coinStashC: {
            type: 'coinStash',
            x: 28, z: -10,
        },
        coinStashD: {
            type: 'coinStash',
            x: 99, z: 54,
        },
        coinStashE: {
            type: 'coinStash',
            x: 187, z: -54,
        },
        coinStashF: {
            type: 'coinStash',
            x: 64, z: 52,
        },
        coinStashG: {
            type: 'coinStash',
            x: 95, z: -54,
        },
        coinStashH: {
            type: 'coinStash',
            x: 223, z: 54,
        },
        coinStashI: {
            type: 'coinStash',
            x: 222, z: -54,
        },
        coinStashJ: {
            type: 'coinStash',
            x: 188, z: 54,
        },
        trophyAltar: {
            type: 'trophyAltar',
            x: 144, z: 5,
        },
    },
    wallDecorations: {
    },
};

zones.guild = {
    guildYard,
    guildFoyer,
    guildFrontHall,
    guildGuestRoom,
    guildBasement,
    guildVault,
};
