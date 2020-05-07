import { AreaDefinition } from 'app/types';
export const areaDefinitions: {[key in string]: AreaDefinition} = {
    "guildYard": {
        "type": "forest",
        "width": 340,
        "leftWallType": "river",
        "rightWallType": "guildWall",
        "objects": {
            "mapExit": {
                "type": "door",
                "x": 0,
                "exitKey": "worldMap",
                "animation": "woodBridge",
                "flipped": true,
                "y": 0,
                "z": -22
            },
            "frontDoor": {
                "type": "door",
                "x": -8,
                "z": -8,
                "xAlign": "right",
                "exitKey": "guildFoyer:frontDoor",
                "animation": "closedDoor",
                "y": 0
            }
        },
        "wallDecorations": {},
        "isGuildArea": true,
        "seed": 1
    },
    "guildFoyer": {
        "type": "oldGuild",
        "width": 500,
        "leftWallType": "guildWall",
        "rightWallType": "guildWall",
        "objects": {
            "mapTable": {
                "type": "mapTable",
                "x": 80,
                "y": 0,
                "z": 0
            },
            "coinStash": {
                "type": "coinStash",
                "xAlign": "middle",
                "x": -30,
                "zAlign": "back",
                "y": 0,
                "z": 0
            },
            "shrineOfFortune": {
                "type": "shrineOfFortune",
                "xAlign": "middle",
                "x": 0,
                "zAlign": "back",
                "y": 0,
                "z": 0
            },
            "animaOrb": {
                "type": "animaOrb",
                "xAlign": "middle",
                "x": 30,
                "y": 0,
                "zAlign": "back",
                "z": 0
            },
            "trophyAltar": {
                "type": "trophyAltar",
                "x": 290,
                "y": 0,
                "z": 0
            },
            "bed": {
                "type": "bed",
                "xAlign": "right",
                "x": -32,
                "y": 0,
                "zAlign": "front",
                "z": 0,
                "flipped": true
            },
            "bookShelf": {
                "type": "obstacle",
                "animationGroup": "guildFurniture",
                "animationKey": "bookShelf",
                "xAlign": "right",
                "x": -100,
                "y": 0,
                "zAlign": "back",
                "z": 0
            },
            "frontDoor": {
                "type": "door",
                "x": 8,
                "exitKey": "guildYard:frontDoor",
                "animation": "closedDoor",
                "flipped": true,
                "y": 0,
                "z": -7
            },
            "hallDoor": {
                "type": "door",
                "x": -8,
                "xAlign": "right",
                "exitKey": "guildFrontHall:foyerDoor",
                "animation": "openDoor",
                "y": 0,
                "z": -7
            }
        },
        "wallDecorations": {
            "applicationA": {
                "type": "application",
                "x": 90,
                "y": 15,
                "zAlign": "back",
                "z": 0
            },
            "applicationB": {
                "type": "application",
                "x": 128,
                "y": 15,
                "zAlign": "back",
                "z": 0
            },
            "nicheA": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "x": 50,
                "y": 25,
                "zAlign": "back",
                "z": 0
            },
            "candleA": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "parentKey": "nicheA",
                "xAlign": "middle",
                "x": 0,
                "y": 5,
                "z": 0
            },
            "nicheB": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "xAlign": "middle",
                "x": -30,
                "y": 35,
                "zAlign": "back",
                "z": 0
            },
            "candleB": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "parentKey": "nicheB",
                "xAlign": "middle",
                "x": 0,
                "y": 5,
                "z": 0
            },
            "candleFlameB": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candleFlame",
                "parentKey": "candleB",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "nicheC": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "xAlign": "middle",
                "x": 30,
                "y": 35,
                "zAlign": "back",
                "z": 0
            },
            "candleC": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "parentKey": "nicheC",
                "xAlign": "middle",
                "x": 0,
                "y": 5,
                "z": 0
            },
            "candleFlameC": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candleFlame",
                "parentKey": "candleC",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "nicheD": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "xAlign": "right",
                "x": -50,
                "y": 25,
                "zAlign": "back",
                "z": 0
            },
            "candleD": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "parentKey": "nicheD",
                "xAlign": "middle",
                "x": 0,
                "y": 5,
                "z": 0
            },
            "candleFlameD": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candleFlame",
                "parentKey": "candleD",
                "x": 0,
                "y": 0,
                "z": 0
            }
        },
        "monsters": [
            {
                "key": "gremlin",
                "level": 1,
                "location": [
                    250,
                    0,
                    40
                ]
            },
            {
                "key": "skeleton",
                "level": 1,
                "location": [
                    360,
                    0,
                    0
                ]
            }
        ],
        "isGuildArea": true,
        "seed": 2
    },
    "guildFrontHall": {
        "type": "oldGuild",
        "width": 600,
        "leftWallType": "guildWall",
        "rightWallType": "guildWall",
        "objects": {
            "shrineOfCreation": {
                "type": "shrineOfCreation",
                "xAlign": "middle",
                "x": 0,
                "zAlign": "middle",
                "y": 0,
                "z": 0
            },
            "coinStashA": {
                "type": "coinStash",
                "x": 175,
                "zAlign": "back",
                "y": 0,
                "z": 0
            },
            "coinStashB": {
                "type": "coinStash",
                "level": 2,
                "x": 200,
                "zAlign": "back",
                "y": 0,
                "z": 0
            },
            "trophyAltarA": {
                "type": "trophyAltar",
                "x": 180,
                "y": 0,
                "z": 0
            },
            "trophyAltarB": {
                "type": "trophyAltar",
                "xAlign": "right",
                "x": -180,
                "y": 0,
                "z": 0
            },
            "foyerDoor": {
                "type": "door",
                "x": 8,
                "exitKey": "guildFoyer:hallDoor",
                "animation": "openDoor",
                "flipped": true,
                "y": 0,
                "z": -7
            }
        },
        "wallDecorations": {
            "guestRoomDoor": {
                "type": "door",
                "animation": "backDoor",
                "exitKey": "guildGuestRoom:door",
                "y": 13,
                "zAlign": "back",
                "z": 0,
                "x": 94
            },
            "basementStairs": {
                "type": "door",
                "animation": "downstairs",
                "exitKey": "guildBasement:stairs",
                "y": 14,
                "zAlign": "back",
                "z": 0,
                "x": 489
            }
        },
        "monsters": [
            {
                "key": "spider",
                "level": 3,
                "location": [
                    300,
                    0,
                    40
                ]
            },
            {
                "key": "gnome",
                "level": 3,
                "location": [
                    500,
                    0,
                    0
                ]
            }
        ],
        "isGuildArea": true,
        "seed": 3
    },
    "guildGuestRoom": {
        "type": "oldGuild",
        "width": 330,
        "objects": {
            "bedA": {
                "type": "bed",
                "y": 0,
                "z": -44,
                "x": 34
            },
            "bedB": {
                "type": "bed",
                "y": 0,
                "z": -44,
                "x": 223,
                "flipped": true
            },
            "coinStashA": {
                "type": "coinStash",
                "y": 0,
                "z": 54,
                "x": 239
            },
            "coinStashB": {
                "type": "coinStash",
                "y": 0,
                "z": 54,
                "x": 35
            }
        },
        "wallDecorations": {
            "door": {
                "type": "door",
                "animation": "backDoor",
                "exitKey": "guildFrontHall:guestRoomDoor",
                "y": 15,
                "zAlign": "back",
                "z": 0,
                "x": 140
            },
            "decoration": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "y": 25,
                "zAlign": "back",
                "z": 0,
                "x": 78
            },
            "decoration2": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "niche",
                "y": 23,
                "zAlign": "back",
                "z": 0,
                "x": 202
            },
            "decoration3": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "y": 30,
                "zAlign": "back",
                "z": 0,
                "x": 86
            },
            "decoration4": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candle",
                "y": 27,
                "zAlign": "back",
                "z": 0,
                "x": 210
            },
            "decoration5": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candleFlame",
                "y": 30,
                "zAlign": "back",
                "z": 0,
                "x": 86
            },
            "decoration6": {
                "type": "decoration",
                "animationGroup": "guildWall",
                "animationKey": "candleFlame",
                "y": 28,
                "zAlign": "back",
                "z": 0,
                "x": 210
            }
        },
        "leftWallType": "guildWall",
        "rightWallType": "guildWall",
        "isGuildArea": true,
        "seed": 4
    },
    "guildBasement": {
        "type": "cave",
        "width": 640,
        "objects": {
            "vaultDoor": {
                "type": "door",
                "animation": "caveDoorOpen",
                "exitKey": "guildVault:door",
                "y": 0,
                "z": -10,
                "x": 0,
                "flipped": true
            }
        },
        "wallDecorations": {
            "stairs": {
                "type": "door",
                "animation": "upstairs",
                "exitKey": "guildFrontHall:basementStairs",
                "y": 10,
                "zAlign": "back",
                "z": 0,
                "x": 528
            }
        },
        "leftWallType": "caveWall",
        "rightWallType": "caveWall",
        'monsters': [
            {key: 'vampireBat', level: 15, location: [100, 0, 40]},
            {key: 'vampireBat', level: 15, location: [100, 0, -40]},
            {key: 'vampireBat', level: 15, location: [500, 0, 0]},
        ],
        "isGuildArea": true,
    },
    "guildVault": {
        "type": "cave",
        "width": 320,
        "objects": {
            "door": {
                "type": "door",
                "animation": "caveDoorOpen",
                "exitKey": "guildBasement:vaultDoor",
                "y": 0,
                "z": -10,
                "x": 296
            },
            "coinStashA": {
                "type": "coinStash",
                "y": 0,
                "z": 26,
                "x": 28
            },
            "coinStashB": {
                "type": "coinStash",
                "y": 0,
                "z": -54,
                "x": 61
            },
            "coinStashC": {
                "type": "coinStash",
                "y": 0,
                "z": -10,
                "x": 28
            },
            "coinStashD": {
                "type": "coinStash",
                "y": 0,
                "z": 54,
                "x": 99
            },
            "coinStashE": {
                "type": "coinStash",
                "y": 0,
                "z": -54,
                "x": 187
            },
            "coinStashF": {
                "type": "coinStash",
                "y": 0,
                "z": 52,
                "x": 64
            },
            "coinStashG": {
                "type": "coinStash",
                "y": 0,
                "z": -54,
                "x": 95
            },
            "coinStashH": {
                "type": "coinStash",
                "y": 0,
                "z": 54,
                "x": 223
            },
            "coinStashI": {
                "type": "coinStash",
                "y": 0,
                "z": -54,
                "x": 222
            },
            "coinStashJ": {
                "type": "coinStash",
                "y": 0,
                "z": 54,
                "x": 188
            },
            "trophyAltar": {
                "type": "trophyAltar",
                "y": 0,
                "z": 5,
                "x": 144
            }
        },
        "wallDecorations": {},
        "leftWallType": "caveWall",
        "rightWallType": "caveWall",
        "isGuildArea": true,
    }
};

// guildFrontHall is meant to have 3 exits on the back wall: door to guest room, door to kitchen, stairs to basementDoor
// It is also meant to have stairs to the upstairs off of the right wall.
// Obviously we can arrange these however we want

window['areaDefinitions'] = areaDefinitions;
