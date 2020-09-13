import _ from 'lodash';

import { addMonsterToArea } from 'app/adventure';
import { experienceToLevel } from 'app/character';
import {
    areaTypes,
    finalizeArea,
    getLayer,
    linkAreaObjects,
    AreaDoor,
} from 'app/content/areas';
import { generateMonsterPool } from 'app/content/monsters';
import { createCanvas, mainContent } from 'app/dom';
import { drawBar } from 'app/drawArea';
import SRandom from 'app/utils/SRandom';

import {
    Area,
    AreaLayer,
    AreaType,
    CardinalDirection,
    Character,
    EndlessAreaBlock,
    EndlessGridNode,
    EndlessZone,
    EndlessZoneCoordinates,
    EndlessZoneConnection,
    EndlessZoneEvent,
    EndlessZoneExitEvent,
    Exit,
    FrameAnimation,
} from 'app/types';


const SPOKE_COUNT = 3;
const SPOKE_RADIUS = 1;
const THETA_COUNT = SPOKE_COUNT * (1 + 2 *  SPOKE_RADIUS);

// Normalize theta to the range [0, n)
function normalizeTheta(theta: number, n: number): number {
    return (theta % n + n) % n;
}
// Check if theta is in between the min + max theta values.
function isThetaInRange(theta: number, min: number, max: number, n: number): boolean {
    theta = normalizeTheta(theta, n);
    min = normalizeTheta(min, n);
    max = normalizeTheta(max, n);
    return (min <= max && theta >= min && theta <= max) || (min > max && (theta <= max || theta >= min));
}
function isThetaInRadius(theta, center, radius, n): boolean {
    return isThetaInRange(theta, center - radius, center + radius, n);
}

function doesConnectionExist(endlessSeed: number, {coordinatesA, coordinatesB}: EndlessZoneConnection): number {
    // Make sure we always consider coordinatesA/B in the same order so we get the same result
    // regardless of the order they are set in the connection.
    if (coordinatesB.level < coordinatesA.level ||
        (coordinatesB.level === coordinatesA.level &&
            coordinatesB.radius < coordinatesA.radius ||
            (coordinatesB.radius === coordinatesA.radius && coordinatesB.thetaI < coordinatesA.thetaI)
        )
    ) {
        const t = coordinatesA;
        coordinatesA = coordinatesB;
        coordinatesB = t;
    }
    let dTheta = Math.abs(coordinatesA.thetaI - coordinatesB.thetaI);
    if (dTheta > THETA_COUNT / 2) {
        dTheta = THETA_COUNT - dTheta;
    }
    const dLevel = Math.abs(coordinatesA.level - coordinatesB.level);
    const dRadius = Math.abs(coordinatesA.radius - coordinatesB.radius);
    // Areas are too far to be connected.
    if (dLevel > 1 || dRadius > 1 || dTheta > 1) {
        return 0;
    }
    // Area cannot be connected to itself.
    if (dLevel === 0 && dRadius === 0 && dTheta <= 0.5) {
        return 0;
    }
    // When level changes, radius must change by the same amount.
    if (dLevel && coordinatesA.level - coordinatesB.level !== coordinatesA.radius - coordinatesB.radius) {
        return 0;
    }
    if (coordinatesA.radius > coordinatesB.radius) {
        console.error('Unexpected coordinates order', {coordinatesA, coordinatesB});
    }
    // Create a unique but predictable state for the seeded generator based on the players' endless seed
    // and the current connection.
    const random = SRandom.seed(endlessSeed)
        .addSeed(0.6557540016774892)
        .addSeed(coordinatesA.level)
        .addSeed(coordinatesA.radius)
        .addSeed(coordinatesA.thetaI)
        .addSeed(coordinatesB.level)
        .addSeed(coordinatesB.radius)
        .addSeed(coordinatesB.thetaI);

    const spokeIndex = (Math.round(coordinatesA.thetaI * SPOKE_COUNT / THETA_COUNT) * THETA_COUNT / SPOKE_COUNT) % THETA_COUNT;
    // There is only a forced connection if both coordinates are within the same spoke.
    if (
        dLevel === 0 &&
        isThetaInRadius(coordinatesA.thetaI, spokeIndex, SPOKE_RADIUS, THETA_COUNT) &&
        isThetaInRadius(coordinatesB.thetaI, spokeIndex, SPOKE_RADIUS, THETA_COUNT)
    ) {
        // This generator needs to be independent of the coordinate pair since it generates contextual
        // rules about where forced connections area.
        const spokeRandom = SRandom.seed(endlessSeed).addSeed(0.5117813131398452).addSeed(coordinatesA.level);
        const radius = coordinatesA.radius;
        // The entry to the first rings are always exactly on the spokeIndex.
        let thetaIn = radius === 1
            ? spokeIndex
            : spokeIndex + spokeRandom.addSeed(radius).addSeed(spokeIndex).range(-SPOKE_RADIUS, SPOKE_RADIUS);
        let thetaOut = spokeIndex + spokeRandom.addSeed(radius + 1).addSeed(spokeIndex).range(-SPOKE_RADIUS, SPOKE_RADIUS);
        thetaIn = normalizeTheta(thetaIn, THETA_COUNT);
        thetaOut = normalizeTheta(thetaOut, THETA_COUNT);
        if (dRadius > 0) {
            // Check for a forced forward connection.
            if (thetaOut === coordinatesA.thetaI && thetaOut === coordinatesB.thetaI) {
                //console.log('Forced forward connection', {spokeIndex, radius, thetaOut, coordinatesA, coordinatesB});
                return spokeIndex / (THETA_COUNT / SPOKE_COUNT) + 1;
            } else if (coordinatesA.thetaI === coordinatesB.thetaI) {
                //console.log('No forced forward connection', {spokeIndex, radius, thetaI: coordinatesA.thetaI, thetaOut, coordinatesA, coordinatesB});
            }
        } else {
            // Check for a forced lateral connection.
            let min = thetaIn, max = thetaOut;
            if (normalizeTheta(max - min, THETA_COUNT) > 2 * SPOKE_RADIUS) {
                min = thetaOut;
                max = thetaIn;
            }
            if (isThetaInRange(coordinatesA.thetaI, min, max, THETA_COUNT) &&
                isThetaInRange(coordinatesB.thetaI, min, max, THETA_COUNT)
            ) {
                //console.log('Forced lateral connection', {spokeIndex, radius, thetaIn, thetaOut, min, max, coordinatesA, coordinatesB});
                return spokeIndex / (THETA_COUNT / SPOKE_COUNT) + 1;
            } else {
                //console.log('No forced lateral connection', {spokeIndex, radius, thetaIn, thetaOut, min, max, coordinatesA, coordinatesB});
            }
        }
    }
    if (coordinatesA.level === coordinatesB.level) {
        if (dTheta <= 0.5 || dRadius === 0) {
            return random.random() < 0.4 ? -1 : 0;
        }
        return random.random() < 0.3 ? -1 : 0;
    }
    if (dTheta <= 0.5) {
        return random.random() < 0.2 ? -1 : 0;
    }
    return random.random() < 0.1 ? -1 : 0;
}

function getConnections(endlessSeed: number, coordinates: EndlessZoneCoordinates): EndlessZoneConnection[] {
    const connections: EndlessZoneConnection[] = [];
    function checkCoordinates(thetaI: number, radius: number, level: number) {
        thetaI = normalizeTheta(thetaI, THETA_COUNT);
        // console.log('trying connection', {radius, level, thetaI});
        const testConnection: EndlessZoneConnection = {
            coordinatesA: coordinates,
            coordinatesB: {thetaI, radius, level}
        };
        const connectionValue = doesConnectionExist(endlessSeed, testConnection);
        if (connectionValue) {
            if (connectionValue > 0) {
                testConnection.forcedSpoke = connectionValue - 1;
            }
            connections.push(testConnection);
        }
    }
    if (coordinates.radius === 1 && coordinates.thetaI % (THETA_COUNT / SPOKE_COUNT) === 0) {
        // This is a special case for creating the entrances in the three initial zones.
        connections.push({
            coordinatesA: coordinates,
            coordinatesB: {thetaI: 0, radius: 0, level: 0},
        });
    }
    for (let level = coordinates.level - 1; level <= coordinates.level + 1; level++) {
        if (level < 1) continue;
        for (let radius = coordinates.radius - 1; radius <= coordinates.radius + 1; radius++) {
            if (radius < level) continue;
            // If level changes, radius must change with it.
            if (level !== coordinates.level && coordinates.radius - radius !== coordinates.level - level) {
                continue;
            }
            for (let thetaI = coordinates.thetaI - 1; thetaI <= coordinates.thetaI + 1; thetaI++) {
                if (level === coordinates.level && radius === coordinates.radius && thetaI === coordinates.thetaI) {
                    continue;
                }
                checkCoordinates(thetaI, radius, level);
            }
        }
    }
    return connections;
}
window['getConnections'] = getConnections;

export function getCoordinatesKey({level, radius, thetaI}: EndlessZoneCoordinates): string {
    return `endless:${level}:${radius}:${thetaI}`;
}

export function generateEndlessZone(endlessSeed: number, coordinates: EndlessZoneCoordinates): EndlessZone {
    //console.log('generateEndlessZone', {endlessSeed, coordinates});
    const random = SRandom.seed(endlessSeed)
        .addSeed(0.4018552164626086)
        .addSeed(coordinates.level)
        .addSeed(coordinates.radius)
        .addSeed(coordinates.thetaI);
    const connections = getConnections(endlessSeed, coordinates);
    const events:  EndlessZoneEvent[] = connections.map((c, i) => {
        const choices: ('N' | 'E' | 'S' | 'W')[] = [];

        if (c.coordinatesB.level === 0) {
            // Links to the initial area are always to the west.
            choices.push('W');
        } else {
            const dRadius = c.coordinatesB.radius - coordinates.radius;
            if (dRadius < 0) {
                choices.push('W');
            } else if (dRadius > 0) {
                choices.push('E');
            }
            // This will be a number in the range [THETA_COUNT - 1, 0, 1]
            const dTheta = normalizeTheta(c.coordinatesB.thetaI - c.coordinatesA.thetaI, THETA_COUNT);
            if (dTheta === THETA_COUNT - 1) {
                choices.push('S');
            } else if (dTheta === 1) {
                choices.push('N');
            } else if (dTheta === 0) {

            } else {
                console.error('Unexpected dTheta value', {dTheta, c});
            }
        }
        return {
            type: 'exit',
            baseLength: random.addSeed(i).range(3, 5),
            exclusiveLength: random.addSeed(i).nextSeed().range(0, 1),
            choices,
            connection: c,
        };
    })
    const minEvents = Math.max(4 - connections.length, 2);
    const maxEvents = Math.min(5, 8 - connections.length);
    const extraEvents = random.addSeed(0.7220703342715891).range(minEvents, maxEvents);
    for (let i = 0; i < maxEvents; i++) {
        events.push({
            type: 'treasure',
            baseLength: random.addSeed(0.7220703342715891).addSeed(i).range(3, 5),
            exclusiveLength: random.addSeed(0.7220703342715891).addSeed(i).nextSeed().range(2, 3),
        });
    }
    const key = getCoordinatesKey(coordinates);

    const theta = 2 * Math.PI * coordinates.thetaI / THETA_COUNT;
    const degrees = 180 * theta / Math.PI;
    let areaTypePool: string[];
    const roll = (360 + degrees - 30 + random.addSeed(0.8856792004000178).random() * 60) % 360;
    if ((roll >= 300 || roll < 60)) { // Strength centerd at 0/360
        areaTypePool = ['field'];
    } else if (roll < 180) { // Intelligence centered at 120
        areaTypePool = ['cave'];
    } else {
        areaTypePool = ['oldGuild'];
    }
    const areaType = random.addSeed(0.8856792004000178).addSeed(0).element(areaTypePool);
    const {areas, areaBlocks, grid} = generateEndlessZoneAreas(key, areaType, random.random(), events);
    const zone = {
        key,
        areaType,
        areas,
        areaBlocks,
        coordinates,
        connections,
        grid,
        seed: random._seed,
    };
    addMonstersToEndlessZone(zone);
    return zone;
}
window['generateEndlessZone'] = generateEndlessZone;
/*
This can be run in the console to check for issues during zone generation.
for (let i = 0; i < 1000; i++) {
    const thetaI = Math.floor(Math.random() * 9);
    const level = 1 + Math.floor(Math.random() * 100);
    const radius = level + Math.floor(Math.random() * 100);
    const coordinates = {level, radius, thetaI};
    console.log(coordinates);
    console.log(generateEndlessZone(Hero.character.endlessSeed, coordinates));
}
*/

function addMonstersToEndlessZone(endlessZone: EndlessZone): void {
    const { thetaI, level, radius } = endlessZone.coordinates;
    const theta = 2 * Math.PI * thetaI / THETA_COUNT;
    const random = SRandom.seed(endlessZone.seed).addSeed(0.6420071862889363);
    const monsterPool = generateMonsterPool(
        180 * theta / Math.PI,
        Math.ceil(2 + Math.sqrt(radius)), // How deep to explore source pools.
        Math.ceil(1 + Math.sqrt(radius / 2)), // How large of a pool to generate.
        random.generateAndMutate(),
    );
    const { grid } = endlessZone;
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column <= grid[row].length; column++) {
            const tile = grid[row][column];
            if (!tile || tile.exit) continue;
            const area = tile.areaBlock.area;
            const numberOfMonsters = random.range(0, 3);
            let x =
                (tile.areaBlock.area.width) / (tile.areaBlock.w + 1)
                * (column - tile.areaBlock.x + 1);

            // Move the monsters away from doors if any are present.
            if (column === tile.areaBlock.x && tile.W) {
                x += 50;
            }
            if (column === tile.areaBlock.x + tile.areaBlock.w - 1 && tile.E) {
                x -= 50;
            }
            let z = 0;
            if (tile.N) {
                z -= 50;
            }
            if (tile.S) {
                z += 50;
            }
            for (let i = 0; i < 3; i++) {
                if (random.generateAndMutate() < 0.5) continue;
                const theta = i * 2 * Math.PI / 3;
                addMonsterToArea(area, random.element(monsterPool), level,
                    {
                        x: Math.floor(x + Math.cos(theta) * 20),
                        y: 0,
                        z: Math.floor(z + Math.sin(theta) * 20),
                    },
                    [], // bonuses,
                    0, // rarity,
                )
            }
        }
    }
}

function generateEndlessZoneAreas(
    zoneKey: string,
    areaType: string,
    zoneAreaGenerationSeed: number,
    events: EndlessZoneEvent[]
): {areas: {[key: string]: Area}, areaBlocks: EndlessAreaBlock[], grid: EndlessGridNode[][] } {
    // console.log('generateEndlessZoneAreas', {zoneAreaGenerationSeed, events});
    const areas = {};
    // Create the grid map for the areas first.
    const path: {x: number, y: number, seed: number, event: number, exit?: 'N' | 'S' | 'W' | 'E'}[] = [{
        x: 0, y: 0, seed: zoneAreaGenerationSeed, event: 0,
    }];
    let eventIndex = 0, eventStep = 0, step = 0, safety = 0;
    while (eventIndex < events.length) {
        if (safety++ >= 10000) {
            debugger;
            break;
            //throw new Error('Possible infinite loop in generateEndlessZoneAreas');
        }
        /*const pathNode = eventStep === 0
            // For the first node
            ? SRandom.seed(zoneAreaGenerationSeed).addSeed(0.8666401988929615).addSeed(eventIndex).element(
                path.filter(p => !p.event)
            )
            : path[step];*/
 try {
        const {x, y, seed} = path[step];
        // console.log({step, eventIndex, eventStep, x, y});
        const event = events[eventIndex];
        let options: {x: number, y: number, exit?: CardinalDirection}[] = [];
        const stepIsExclusive = (eventStep >= event.baseLength);
        const totalSteps = event.baseLength + event.exclusiveLength + (event.type === 'exit' ? 1 : 0);
        const addOption = (x: number, y: number, times: number = 1, exit: CardinalDirection = null) => {
            // Ignore invalid options based on path constraints.
            if (path.slice(0, step).some((e, i) => {
                // Cannot occupy any tiles that are exclusive or already used as part of this event's path.
                if (e.x === x && e.y === y && (stepIsExclusive || e.event || i >= step - eventStep)) {
                    return true;
                }
                // Cannot occupy any tiles directly north of a northern exit or south of a south exit.
                if (e.x === x) {
                    return (
                        (e.y <= y && (e.exit === 'S' || exit === 'N'))
                        || (e.y >= y && (e.exit === 'N' || exit === 'S'))
                    );
                }
                // Cannot occupy any tiles directly west of a western  exit or east of an eastern exit.
                if (e.y === y) {
                    return (
                        (e.x <= x && (e.exit === 'E' || exit === 'W'))
                        || (e.x >= x && (e.exit === 'W' || exit === 'E'))
                    );
                }
                return false;
            })) {
                return;
            }
            const option = {x, y, exit};
            for (let i = 0; i < times; i++) options.push(option);
        };
        // The first step is always chosen randomly from existing non exclusive tiles,
        // which is always (0, 0) for the first event, but will include tiles from the
        // base paths of all previous events for later events.
        if (eventStep === 0) {
            // We convert to string and remove duplicates so that path elements don't get extra weight
            // for having been used multiple times, otherwise repeated paths will be more and more likely
            // to be chosen in the future. We could try removing this to see if it creates a biase that is
            // actually interesting in the maps.
            options = _.uniq(path.filter(p => !p.event).map(({x, y}) => `${x}:${y}`)).map(s => {
                const [x, y] = s.split(':').map(Number);
                return {x, y};
            });
        } else if (event.type === 'exit' && eventStep === totalSteps - 1) {
            // For exits, the last step is choosing an exit direction.
            if (event.choices.includes('N')) addOption(x, y - 1, 1, 'N');
            if (event.choices.includes('S')) addOption(x, y + 1, 1, 'S');
            if (event.choices.includes('W')) addOption(x - 1, y, 1, 'W');
            if (event.choices.includes('E')) addOption(x + 1, y, 1, 'E');
        } else {
            addOption(x + 1,  y, 3);
            addOption(x - 1,  y, 3);
            addOption(x,  y + 1, 2);
            addOption(x,  y - 1, 2);
            options = _.uniq(SRandom.seed(seed).shuffle(options));
        }
        let optionIndex = 0;
        if (path.length > step + 1) {
            optionIndex = _.findIndex(options, {x: path[step + 1].x, y: path[step + 1].y}) + 1;
            // console.log('Trying next option', path[step + 1], options, optionIndex);
        }
        const chosenOption = options[optionIndex];
        if (!chosenOption) {
            eventStep--;
            step--;
            if (eventStep < 0) {
                eventIndex--;
                if (eventIndex < 0) {
                    // This should never happen, if it does, it is almost certainly due to
                    // an error in the code. If there isn't an error that would mean that
                    // a zone was impossible to generate, but the constraints are so loose
                    // that this should never happen.
                    console.error('Failed to generate zone areas');
                    debugger;
                    throw new Error('Failed to generate zone area');
                }
                eventStep = events[eventIndex].baseLength + events[eventIndex].exclusiveLength - 1;
                // Include an extra step for choosing the exit direction.
                if (events[eventIndex].type === 'exit') {
                    eventStep++;
                }
            }
            continue;
        }
        path[++step] = {
            x: chosenOption.x,
            y: chosenOption.y,
            seed: SRandom.seed(seed).addSeed(optionIndex + 1).random(),
            event: stepIsExclusive ? eventIndex + 1 : 0,
            exit: chosenOption.exit,
        };
        // Remove any additional path elements, they are no longer relevant.
        while (path.length > step + 1) {
            path.pop();
        }
        eventStep++;
        if (eventStep >= totalSteps) {
            eventIndex++;
            eventStep = 0;
            // If we reached the final event, we are finished.
            if (eventIndex >= events.length) {
                break;
            }
        }
} catch {
    debugger;
}
    }
    // console.log({safety});
    const minX = path.reduce((min, node) => Math.min(min, node.x), 0);
    const minY = path.reduce((min, node) => Math.min(min, node.y), 0);
    const areaBlocks: EndlessAreaBlock[] = [];
    const grid: EndlessGridNode[][] = [];
    let lastTile = null;
    path.forEach(p => {
        const x = p.x - minX, y = p.y - minY;
        grid[y] = grid[y] || [];
        const tile = grid[y][x] || {
            x, y, event: p.event - 1,
            N: false, E: false, S: false, W: false,
            exit: p.exit, areaBlock: null,
        };
        // The current tile connects to the previous tile unless the previous tile was the last
        // tile in an exclusive path, in which case, it will have a distinct non-negative event number.
        if (lastTile && (lastTile.event < 0 || lastTile.event === tile.event)) {
            if (tile.x > lastTile.x) {
                lastTile.E = true;
                tile.W = true;
            } else if (tile.x < lastTile.x) {
                lastTile.W = true;
                tile.E = true;
            } else if (tile.y > lastTile.y) {
                lastTile.S = true;
                tile.N = true;
            } else if (tile.y < lastTile.y) {
                lastTile.N = true;
                tile.S = true;
            }
        }
        grid[y][x] = lastTile = tile;
    });
    //console.log({path, grid});

    // Convert the grid into a list of horizontal area blocks that each correspond to an
    // actual game area.
    let random = SRandom.seed(zoneAreaGenerationSeed).nextSeed();
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column <= grid[row].length; column++) {
            let tile = grid[row][column];
            // Skip empty tiles or tiles with exits, exit tiles are just placeholders, not visitable areas.
            if (!tile || tile.exit) continue;
            const left = column;
            while (tile.E) {
                column++;
                tile = grid[row][column];
                if (!tile || tile.exit) {
                    // Backup a step if we hit a placeholder tile.
                    column--;
                    break;
                }
            }
            const right = column + 1;
            // Generate an array of widths to split this section into using values in [1, 4].
            let widthRemaining = right - left;
            let widths = [];
            while (widthRemaining > 0) {
                if (widthRemaining === 1 || random.generateAndMutate() < 0.1) {
                    widthRemaining -= 1;
                    widths.push(1);
                } else if (widthRemaining === 2 || random.generateAndMutate() < 0.2) {
                    widthRemaining -= 2;
                    widths.push(2);
                } else if (widthRemaining === 3 || random.generateAndMutate() < 0.4) {
                    widthRemaining -= 3;
                    widths.push(3);
                } else {
                    widthRemaining -= 4;
                    widths.push(4);
                }
            }
            widths = random.shuffle(widths);
            let x = left, y = row;
            for (const w of widths) {
                const areaBlock: EndlessAreaBlock = {
                    x, y, w,
                    area: {
                        key: `${x}:${y}`,
                        zoneKey,
                        areaType,
                        isBossArea: false,
                        width: 256 * w + 128, // 384, 640, 896, 1152,
                        rightWall: null,
                        leftWall: null,
                        cameraX: 0,
                        time: 0,
                        // Used for randomly generating area.
                        seed: random.random(),
                        // TODO: Add random enemy bonuses to harder areas.
                        // enemyBonuses?: BonusSource[],
                        allies: [],
                        enemies: [],
                        projectiles: [],
                        effects: [],
                        textPopups: [],
                        treasurePopups: [],
                        objectsByKey: {},
                        layers: [],
                    },
                };
                areaBlocks.push(areaBlock);
                for (let i = 0; i < w; i++) {
                    tile = grid[y][x];
                    tile.areaBlock = areaBlock;
                    x++;
                }
            }
        }
    }
    //console.log({areaBlocks});
    //renderGrid(grid, areaBlocks);
    // Finally create areas for each area block and add exits to them to connect them to the other areas
    // and zones.
    // TODO: Create areas
    // TODO: Add area connections
    // TODO: Add zone connections
    // TODO: Add monsters
    // TODO: Implement encounters: Waypoints, bosses, treasures, dungeons
    const areaBuilder: AreaType = areaTypes[areaType] || areaTypes.field;
    for (const areaBlock of areaBlocks) {
        areaBuilder.addLayers(areaBlock.area);
        // This will populate the tile grids in each layer, which we need to do
        // before we add other objects that may need to update the tile grids,
        // such as removing foreground tiles when placing southern doors.
        finalizeArea(areaBlock.area);
        /*areaBuilder.addObjects(areaBlock.area, {
            monsters: areaMonsters,
            exits: [entranceDestination, exitDestination],
        });*/
    }
    function addDoor(x: number, y: number, d: CardinalDirection) {
        let tx: number = x, ty: number = y, td: CardinalDirection;
        if (d === 'N') {
            ty = y - 1;
            td = 'S';
        } else if (d === 'S') {
            ty = y + 1;
            td = 'N';
        } else if (d === 'W') {
            tx = x - 1;
            td = 'E';
        } else if (d === 'E') {
            tx = x + 1;
            td = 'W';
        }
        const areaBlock = grid[y][x].areaBlock;
        const targetAreaBlock = grid[ty][tx].areaBlock;
        // Ignore connections within the same area.
        if (areaBlock === targetAreaBlock) {
            return;
        }
        const door: AreaDoor = new AreaDoor();
        const padding = 112;
        door.definition = {
            type: 'door',
            // For each grid position there is at most one door in any direction so this key
            // is guaranteed to be unique across the entire zone.
            key: `door:${x}:${y}:${d}`,
            // exitKey + animation are required on the definition, but
            // we are bypassing them in this context.
            exitKey: null,
            animation: null,
            // Set the approximate position of the door, allowing the areaType to adjust this to
            // fit with the graphics as necessary.
            x: ((areaBlock.area.width - 2 * padding) / areaBlock.w) * (x - areaBlock.x) + padding,
        };
        const targetTile = grid[ty][tx];
        if (targetTile.exit) {
            const exitEvent = events[targetTile.event] as EndlessZoneExitEvent;
            const connection = exitEvent.connection;
            const thisZoneKey = getCoordinatesKey(connection.coordinatesA);
            const targetZoneKey = getCoordinatesKey(connection.coordinatesB);
            door.definition.key = `door:${targetZoneKey}`;
            // We can't know the target area key without generating the target zone, and we cannot generate
            // the target zone since that would cause infinite recursion in this context, so we only supply
            // the zone and object key, which will uniquely identify the door in that zone.
            door.exit = {
                zoneKey: targetZoneKey,
                objectKey: `door:${thisZoneKey}`,
            };
        } else {
            door.exit = {
                areaKey: targetAreaBlock.area.key,
                objectKey: `door:${tx}:${ty}:${td}`,
            };
        }
        areaBuilder.addDoor(grid[y][x].areaBlock.area, d, door);
    }
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column <= grid[row].length; column++) {
            const tile = grid[row][column];
            if (!tile || !tile.areaBlock) continue;
            const area = tile.areaBlock.area;
            if (tile.N) addDoor(column, row, 'N');
            if (tile.S) addDoor(column, row, 'S');
            if (tile.W) addDoor(column, row, 'W');
            if (tile.E) addDoor(column, row, 'E');
        }
    }

    // Add all the areas to the zone and link objects to the areas.
    for (const areaBlock of areaBlocks) {
        areas[areaBlock.area.key] = areaBlock.area;
        linkAreaObjects(areaBlock.area);
    }
    return {areas, areaBlocks, grid};
}
window['generateEndlessZoneAreas'] = generateEndlessZoneAreas;


const endlessMapCanvas = createCanvas(200, 150);
endlessMapCanvas.style.position = 'absolute';
endlessMapCanvas.style.top = '15px';
endlessMapCanvas.style.left = '215px';
endlessMapCanvas.style.pointerEvents = 'none';
mainContent.append(endlessMapCanvas);
export const endlessMapContext = endlessMapCanvas.getContext('2d');

export function clearEndlessAreaMinimap(): void {
    endlessMapContext.clearRect(0, 0, endlessMapCanvas.width, endlessMapCanvas.height);
}

export function highlightEndlessArea(character: Character, area: Area = null): void {
    const context = endlessMapContext;
    const endlessZone = character.endlessZone;
    if (!endlessZone) {
        clearEndlessAreaMinimap();
        return;
    }
    area = area || character.hero.area;
    //context.fillStyle = 'white';
    //context.clearRect(0, 0, endlessMapCanvas.width, endlessMapCanvas.height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, endlessMapCanvas.width, endlessMapCanvas.height);
    const currentAreaBlock = endlessZone.areaBlocks.find(block => block.area === area);
    context.save();
    const size = 20;
    // Center the minimap on the middle of the current area.
    context.translate(
        endlessMapCanvas.width / 2 - (currentAreaBlock.x + currentAreaBlock.w / 2) * size,
        endlessMapCanvas.height / 2 - (currentAreaBlock.y + 1 / 2) * size,
    );
    const revealMap = false;
    for (let row = 0; row < endlessZone.grid.length; row++) {
        for (let column = 0; column <= endlessZone.grid[row].length; column++) {
            const tile = endlessZone.grid[row][column];
            if (!tile || tile.exit) continue;
            const areaBlock = tile.areaBlock;
            // Don't draw this area until the player has visited once.
            if (!revealMap && !character.endlessAreasVisited[areaBlock.area.zoneKey + ':' + areaBlock.area.key]) {
                continue;
            }
            const x = column * size + size / 2;
            const y = row * size + size / 2;
            if (revealMap && !tile.exit) {
                context.fillStyle = tile.event >= 0 ? 'red' : 'black';
                context.fillRect(x - 4, y - 4, 8, 8);
            }
            const length = 1.4 * size;
            if (tile.N) {
                context.fillStyle = 'black';
                context.fillRect(x - 1, y - size / 2, 2, size / 2);
                if (endlessZone.grid[row - 1]?.[column]?.exit === 'N') {
                    context.fillStyle = 'blue';
                    context.fillRect(x - 1, y - size / 2 - length, 2, length);
                }
            }
            if (tile.S) {
                context.fillStyle = 'black';
                context.fillRect(x - 1, y, 2, size / 2);
                if (endlessZone.grid[row + 1]?.[column]?.exit === 'S') {
                    context.fillStyle = 'blue';
                    context.fillRect(x - 1, y + size / 2, 2, length);
                }
            }
            if (tile.W) {
                context.fillStyle = 'black';
                context.fillRect(x - size / 2, y - 1, size / 2, 2);
                if (endlessZone.grid[row][column - 1]?.exit === 'W') {
                    context.fillStyle = 'blue';
                    context.fillRect(x - size / 2  - length, y - 1, length, 2);
                }
            }
            if (tile.E) {
                context.fillStyle = 'black';
                context.fillRect(x, y - 1, size / 2, 2);
                if (endlessZone.grid[row][column + 1]?.exit === 'E') {
                    context.fillStyle = 'blue';
                    context.fillRect(x + size / 2, y - 1, length, 2);
                }
            }
        }
    }
    if (revealMap) {
        context.globalAlpha = 0.5;
    }
    for (const areaBlock of endlessZone.areaBlocks) {
        // Don't draw this area until the player has visited once.
        if (!revealMap && !character.endlessAreasVisited[areaBlock.area.zoneKey + ':' + areaBlock.area.key]) {
            continue;
        }
        context.fillStyle = area === areaBlock.area ? '#44C' : '#666';
        const x = areaBlock.x * size;
        const y = areaBlock.y * size;
        context.fillRect(x + 2, y + 2, areaBlock.w * size - 4, size - 4);
    }
    context.restore();
    // Draw a black frame around the edges of the map.
    context.fillStyle = 'black';
    context.fillRect(0, 0, endlessMapCanvas.width, 1);
    context.fillRect(0, endlessMapCanvas.height - 1, endlessMapCanvas.width, 1);
    context.fillRect(0, 0, 1, endlessMapCanvas.height);
    context.fillRect(endlessMapCanvas.width - 1, 0, 1, endlessMapCanvas.height);
    renderEndlessExperienceBar(character);
    // renderZoneMap(character.endlessSeed, endlessZone.coordinates.level);
}
window['highlightEndlessArea'] = highlightEndlessArea;

// test connections, run this code to check that connections can always be taken forward and
// backward between areas.
/*const testRandom = SRandom.seed(Math.random());
const testSeed = testRandom.generateAndMutate();
let connections = getConnections(testSeed, {thetaI: 0, radius: 1, level: 1}), lastConnections = null;
for (let i = 0; i < 100; i++) {
    if (!connections.length) {
        console.error('Reached a zone with no connections');
        debugger;
        break;
    }
    const validNextCoordinates = connections.map(c => c.coordinatesB).filter(c => c.level > 0);
    if (!validNextCoordinates.length) {
        console.error('Hit a dead end immediately');
        debugger;
        break;
    }
    console.log('zone', getCoordinatesKey(connections[0].coordinatesA));
    lastConnections = connections;
    connections = getConnections(testSeed,
        // Get a random next element that is not the origin (level === 0)
        testRandom.element(validNextCoordinates)
    );
    // Advance generator so we keep changing results.
    testRandom.generateAndMutate();
    if (!_.find(connections, {coordinatesB: lastConnections[0].coordinatesA})) {
        console.error('Missing back path', {connections, lastConnections});
        debugger;
        break;
    }
}*/


const endlessZoneCanvas = createCanvas(200, 150);
endlessZoneCanvas.style.position = 'absolute';
endlessZoneCanvas.style.top = '15px';
endlessZoneCanvas.style.left = '515px';
endlessZoneCanvas.style.pointerEvents = 'none';
const endlessZoneContext = endlessZoneCanvas.getContext('2d');

export function renderZoneMap(endlessSeed: number, level: number): void {
    const context = endlessZoneContext;
    context.fillStyle = 'white';
    context.fillRect(0, 0, endlessZoneCanvas.width, endlessZoneCanvas.height);
    const size = 4;
    const spacing = 15;
    function getCoords(radius: number, thetaI: number): {x: number, y: number} {
        const theta = 2 * Math.PI * thetaI / THETA_COUNT;
        return {
            x: Math.cos(theta) * radius * spacing + endlessZoneCanvas.width / 2,
            y: Math.sin(theta) * radius * spacing + endlessZoneCanvas.height / 2,
        }
    }
    for (let radius = level; radius < 10; radius++) {
        for (let thetaI = 0; thetaI < THETA_COUNT; thetaI++) {
            const {x, y} = getCoords(radius, thetaI);
            for (const c of getConnections(endlessSeed, {level, radius, thetaI})) {
                if (c.coordinatesB.level > level) {
                    context.strokeStyle = 'black';
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y - 8);
                    context.stroke();
                } else if (c.coordinatesB.level < level) {
                    context.strokeStyle = 'black';
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y + 8);
                    context.stroke();
                } else {
                    const coords = getCoords(c.coordinatesB.radius, c.coordinatesB.thetaI);
                    context.strokeStyle = '#BBB';
                    if (c.forcedSpoke >= 0) {
                        context.strokeStyle = ['red', 'blue', 'green'][c.forcedSpoke];
                    }
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo((x + coords.x) / 2, (y + coords.y) / 2);
                    context.stroke();
                }
            }
            context.beginPath();
            context.arc(x, y, size, 0, 2 * Math.PI);
            context.fillStyle = 'black';
            context.fill();
        }
    }
    mainContent.append(endlessZoneCanvas);
}
window['renderZoneMap'] = renderZoneMap;

export function renderEndlessExperienceBar(character: Character) {
    const experienceNeeded = experienceToLevel(character);
    const width = Math.floor(endlessMapCanvas.width * 0.8);
    drawBar(endlessMapContext,
        (endlessMapCanvas.width - width) / 2,
        endlessMapCanvas.height - 10,
        width, 5, 'black', 'orange', character.endlessExperience / experienceNeeded
    );
}

//renderZoneMap(0.9865189956451494, 1);

