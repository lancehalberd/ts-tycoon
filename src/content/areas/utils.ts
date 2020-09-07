import _ from 'lodash';
import {
    areaObjectFactories, areaTypes,
    getPositionFromLocationDefinition, palettes,
} from 'app/content/areas';
import { addAreaFurnitureBonuses, removeAreaFurnitureBonuses } from 'app/content/furniture';
import { BACKGROUND_HEIGHT } from 'app/gameConstants';
import { getState } from 'app/state';
import { createAnimation, frame } from 'app/utils/animations';
import { r } from 'app/utils/index';
import SRandom from 'app/utils/SRandom';

import {
    Area, AreaDefinition, AreaLayer, AreaLayerDefinition,
    AreaObject, AreaObjectDefinition, AreaType,
    FrameAnimation, MonsterSpawn,
} from 'app/types'

const river = createAnimation('gfx2/areas/meadowbridge.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const caveWall = createAnimation('gfx2/areas/cavebridge2.png', frame(0, 0, 39, 148, r(16, 92, 23, 35)));
const guildWall = createAnimation('gfx2/areas/guildbridge.png', frame(0, 0, 39, 148, r(11, 50, 20, 70)));
const straightGuildWall = createAnimation('gfx2/areas/guildsidewall.png', {w: 40, h: 148});
const fenceWall = createAnimation('gfx2/areas/Fence side.png', {w: 36, h: 153}, {left: 3, top: -5});
export const areaWalls: {[key in string]: FrameAnimation} = {
    caveWall,
    river,
    guildWall,
    straightGuildWall,
    fenceWall,
};

export function createAreaObjectFromDefinition(areaObjectDefinition: AreaObjectDefinition): AreaObject {
    const factory = areaObjectFactories[areaObjectDefinition.type];
    if (!factory) {
        console.log('Missing factory for type', areaObjectDefinition.type, areaObjectDefinition)
        debugger;
    }
    const object = factory.createFromDefinition(areaObjectDefinition);
    object.key = areaObjectDefinition.key;
    return object;
}

export function createNewArea(areaKey: string): Area {
    return {
        areaType: null,
        key: areaKey,
        width: 600,
        allies: [],
        enemies: [],
        cameraX: 0,
        time: 0,
        projectiles: [],
        effects: [],
        textPopups: [],
        treasurePopups: [],
        objectsByKey: {},
        seed: null,
        layers: [],
    };
}

export function createAreaFromDefinition(areaKey: string, areaDefinition: AreaDefinition): Area {
    return applyDefinitionToArea(createNewArea(areaKey), areaDefinition);
}

export function getStandardLayers() {
    return [
        // Additional background layers with parallax <= 1 can be added here.
        // Holds the floor tiles, won't usually have objects on it, as they would be behind the background.
        {key: 'floor', x: 0, y: BACKGROUND_HEIGHT, grid: null, objects: []},
        // Holds the front most wall tiles, and objects that are always behind the field, like wall decorations
        // Side walls + side doors.
        {key: 'background', x: 0, y: 0, grid: null, objects: []},
        // Holds all the objects that are z-sorted in the field as well as players/effects
        // Does not have a defined grid currently.
        {key: 'field', x: 0, y: BACKGROUND_HEIGHT, grid: null, objects: []},
        // Holds a grid and objects that are always in front of the field.
        {key: 'foreground', x: 0, y: BACKGROUND_HEIGHT + 64, grid: null, objects: []},
        // Additional foreground layers with parallax >= 1 can be added here.
    ];
}

export function setStandardLayersOnArea(area: Area) {
    area.layers = getStandardLayers();
}
export function applyDefinitionToArea(area: Area, areaDefinition: AreaDefinition): Area {
    const typeChanged = area.areaType && area.areaType !== areaDefinition.type;
    area.areaType = areaDefinition.type;
    area.width = areaDefinition.width;
    area.zoneKey = areaDefinition.zoneKey,
    area.seed = areaDefinition.seed;
    if (areaDefinition.leftWallType) {
        area.leftWall = areaWalls[areaDefinition.leftWallType];
    } else {
        area.leftWall = null;
    }
    if (areaDefinition.rightWallType) {
        area.rightWall = areaWalls[areaDefinition.rightWallType];
    } else {
        area.rightWall = null;
    }
    const state = getState();
    // Only update the bonuses if the guildVariableObject is ready to receive bonuses. If it isn't, bonuses will be applied
    // after it is created.
    const updateBonuses = area.zoneKey === 'guild' && state.guildVariableObject && state.savedState.unlockedGuildAreas[area.key];
    // Since the objects get remade in this operation, the only consistent way to apply the bonuses correctly
    // is to remove the existing ones and then add them again after they are recreated.
    if (updateBonuses) {
        removeAreaFurnitureBonuses(area, false);
    }
    // Rebuild all objects.
    area.objectsByKey = {};
    // If area definition doesn't use new layers or the area type has changed,
    // convert area definition to the new layer format.
    if (!areaDefinition.layers?.length || typeChanged) {
        // Keep track of the current layers to copy objects over from them.
        // For this to work, all objects need to placed on standard layers that
        // are implemented in all area types. These are currently 'background', 'field' and 'foreground'.
        const currentLayers = areaDefinition.layers;
        const areaTypeKey: string = area.areaType;
        const areaType: AreaType = areaTypes[areaTypeKey] || areaTypes.field;
        if (areaType && areaType.addLayers) {
            areaType.addLayers(area);
        } else {
            setStandardLayersOnArea(area);
        }
        finalizeArea(area);
        areaDefinition.layers = [];
        for (const layer of area.layers) {
            const currentLayer = _.find(currentLayers, {key: layer.key});
            const layerDefinition: AreaLayerDefinition = {
                key: layer.key,
                x: layer.x || 0,
                y: layer.y || 0,
                objects: currentLayer?.objects || [],
            }
            if (layer.grid) {
                const palette = _.findKey(palettes, layer.grid.palette);
                if (!palette) {
                    console.error('Could not find palette', layer.grid.palette);
                }
                layerDefinition.grid = {
                    w: layer.grid.w,
                    h: layer.grid.h,
                    tiles: layer.grid.tiles,
                    palette,
                }
            }
            areaDefinition.layers.push(layerDefinition);
        }
    }
    area.layers = areaDefinition.layers.map(createLayerFromDefinition);
    if (updateBonuses) {
        addAreaFurnitureBonuses(area, true);
    }
    for (const layer of area.layers) {
        for (const object of layer.objects) {
            object.area = area;
            area.objectsByKey[object.key] = object;
        }
    }
    return area;
}

export function getLayer(area: Area, key: string): AreaLayer {
    return area.layers.find(l => l.key === key);
}

export function getLayerDefinition(area: AreaDefinition, key: string): AreaLayerDefinition {
    return area.layers.find(l => l.key === key);
}

function createLayerFromDefinition(definition: AreaLayerDefinition): AreaLayer {
    const layer: AreaLayer = {
        key: definition.key,
        x: definition.x || 0,
        y: definition.y || 0,
        objects: definition.objects.map(createAreaObjectFromDefinition),
    };
    if (definition.grid) {
        layer.grid = {
            w: definition.grid.w,
            h: definition.grid.h,
            palette: palettes[definition.grid.palette],
            tiles: definition.grid.tiles,
        };
    }
    return layer;
}

export function populateLayerGrid(this: void, area: Area, layer: AreaLayer): void {
    if (!layer.grid) {
        return;
    }
    const random = SRandom.addSeed(area.seed);
    layer.grid.w = Math.ceil(area.width / layer.grid.palette.w);
    layer.grid.tiles = [];
    const maxX = layer.grid.palette.source.w / layer.grid.palette.w - 1;
    const maxY = layer.grid.palette.source.h / layer.grid.palette.h - 1;
    if (maxX !== (maxX | 0) || maxY !== (maxY | 0)) {
        console.log(maxX, maxY, layer.grid.palette);
    }
    for (let y = 0; y < layer.grid.h; y++) {
        layer.grid.tiles[y] = [];
        for (let x = 0; x < layer.grid.w; x++) {
            // Only use the default tiles if some are defined,
            // otherwise randomly use the entire palette.
            if (layer.grid.palette.defaultTiles?.length) {
                layer.grid.tiles[y][x] = _.sample(layer.grid.palette.defaultTiles);
            } else {
                layer.grid.tiles[y][x] = {
                    x: random.addSeed(x * layer.grid.h + y).range(0, maxX),
                    y: random.addSeed(x * layer.grid.h + y + 1000).range(0, maxY),
                };
            }
        }
    }
}

export function finalizeArea(area: Area) {
    const areaTypeKey: string = area.areaType;
    const areaType: AreaType = areaTypes[areaTypeKey] || areaTypes.field;
    // Populate the grids of each layer with random tiles based on the area seed.
    if (areaType.populateGrids) {
        areaType.populateGrids(area);
    } else {
        for (const layer of area.layers) {
            populateLayerGrid(area, layer);
        }
    }
    linkAreaObjects(area);
}

export function linkAreaObjects(area: Area) {
    for (const layer of area.layers) {
        for (const object of layer.objects) {
            object.area = area;
            const key = object.key || object.definition.key;
            if (key) {
                area.objectsByKey[key] = object;
            }
        }
    }
}
