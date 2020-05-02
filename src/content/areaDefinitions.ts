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
                "type": "decoration",
                "animationGroup": "guildFurniture",
                "animationKey": "bookShelf",
                "xAlign": "right",
                "x": -100,
                "y": 0,
                "zAlign": "back",
                "z": 0,
                "isSolid": true,
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
                "exitKey": "guildHall:foyerDoor",
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
            },
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
    "guildHall": {
        "type": "oldGuild",
        "width": 600,
        "leftWallType": "guildWall",
        "rightWallType": "guildWall",
        "objects": {
            "shrineOfCreation": {
                "type": "shrineOfFortune",
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
                "animation": "closedDoor",
                "flipped": true,
                "y": 0,
                "z": -7
            },
            "basementDoor": {
                "type": "door",
                "x": -8,
                "xAlign": "right",
                // This is meant to go to guildBasement
                "exitKey": "guildHall:foyerDoor",
                "animation": "openDoor",
                "y": 0,
                "z": -7
            }
        },
        "wallDecorations": {
        },
        "monsters": [
            {key: 'spider', level: 3, location: [300, 0, 40]},
            {key: 'gnome', level: 3, location: [500, 0, 0]},
        ],
        "isGuildArea": true,
        "seed": 3,
    }
};

// Guild Hall is meant to have 3 exits on the back wall: door to guest room, door to kitchen, stairs to basementDoor
// It is also meant to have stairs to the upstairs off of the right wall.
// Obviously we can arrange these however we want

window['areaDefinitions'] = areaDefinitions;
