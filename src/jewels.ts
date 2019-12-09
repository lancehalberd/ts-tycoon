import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { Ability } from 'app/content/abilities';
import { createCanvas, divider, query, tagElement } from 'app/dom';
import { fixedDigits, percent } from 'app/utils/formatters';
import { abilityHelpText, bonusSourceHelpText } from 'app/helpText';
import { removePopup } from 'app/popup';
import { points } from 'app/points';
import { getState } from 'app/state';
import { arrayToCssRGB } from 'app/utils/colors';
import { isPointInPoints, makeShape, Polygon, shapeDefinitions, ShapeType } from 'app/utils/polygon';

export type JewelTier = 1 | 2 | 3 | 4 | 5;
export type JewelComponents = [number, number, number];
export type JewelQualifierName = 'Perfect' | 'Brilliant' | 'Shining' | '' | 'Dull';
export interface Jewel {
    adjacentJewels: Jewel[],
    adjacencyBonuses: any,
    area: number,
    // This stores componentBonuses * area * quality * qualifierBonus
    bonuses: any,
    // Canvas for displaying the jewel in the inventory.
    canvas?: HTMLCanvasElement,
    character: any,
    componentBonuses: any,
    components: JewelComponents,
    context?: CanvasRenderingContext2D,
    // Div for holding the jewel in the inventory.
    domElement?: HTMLElement,
    fixed: boolean,
    helpMethod: (jewel: Jewel) => string,
    jewelType: number,
    price: number,
    qualifierBonus: any,
    qualifierName: JewelQualifierName,
    quality: number,
    shape: Polygon,
    shapeType: ShapeType,
    tier: JewelTier,
    disabled?: boolean,
    confirmed?: boolean,
    ability?: Ability,
}

const originalJewelScale = 30;
const displayJewelShapeScale = 30;
const qualifierNames: JewelQualifierName[] = ['Perfect', 'Brilliant', 'Shining', '', 'Dull'];

export function convertShapeDataToShape(shapeData) {
    return makeShape(shapeData.p[0] * displayJewelShapeScale / originalJewelScale, shapeData.p[1] * displayJewelShapeScale / originalJewelScale, (shapeData.t % 360 + 360) % 360, shapeDefinitions[shapeData.k][0], displayJewelShapeScale);
}

export function makeJewel(tier: JewelTier, shapeType: ShapeType, components: JewelComponents, quality: number): Jewel {
    const shapeDefinition = shapeDefinitions[shapeType][0];
    const shape = makeShape(0, 0, 0, shapeDefinition).scale(displayJewelShapeScale)
    const jewel = makeJewelProper(tier, shape, components, quality);
    jewel.shape.setCenterPosition(jewel.canvas.width / 2, jewel.canvas.height / 2);
    return jewel;
}
export function makeJewelProper(tier: JewelTier, shape: Polygon, components: JewelComponents, quality: number): Jewel {
    let componentsSum = 0;
    const componentBonuses = {};
    let jewelType = 0;
    const savedComponents: JewelComponents = [0, 0, 0];
    let normalize = false;
    for (let i = 0; i < 3; i++) {
        componentsSum += components[i];
        savedComponents[i] = components[i];
        if (components[i] > 1) normalize = true;
    }
    const RGB: JewelComponents = [0, 0, 0];
    let minActiveComponent = 1;
    let maxActiveComponent = 0;
    let totalActiveCompontent = 0;
    let numberOfActiveComponents = 0;
    for (let i = 0; i < 3; i++) {
        components[i] /= componentsSum;
        if (normalize) savedComponents[i] /= componentsSum;
        // A component is not activy if it is less than 30% of the jewel.
        if (components[i] < .3) continue;
        numberOfActiveComponents++;
        if (i == 0) componentBonuses['+strength'] = components[i];
        else if (i == 1) componentBonuses['+dexterity'] = components[i];
        else componentBonuses['+intelligence'] = components[i];
        totalActiveCompontent += components[i];
        minActiveComponent = Math.min(minActiveComponent, components[i]);
        maxActiveComponent = Math.max(maxActiveComponent, components[i]);
        jewelType += (1 << i);
    }
    let qualifierIndex = 3;
    let qualifierBonus = 1;
    if (jewelType === 7) {
        // Diamonds quality is based on how evenly components are
        if (maxActiveComponent - minActiveComponent <= .01) {
            qualifierIndex = 0;
        } else {
            qualifierIndex = Math.min(4, Math.ceil((maxActiveComponent - minActiveComponent) / .02));
        }
        qualifierBonus = [3, 2, 1.5, 1, .5][qualifierIndex];
    } else {
        // Other jewels are based on the total % of active components
        if (totalActiveCompontent >= .99) {
            qualifierIndex = 0;
        } else if (totalActiveCompontent >= .95) {
            qualifierIndex = 1;
        } else if (totalActiveCompontent >= .9) {
            qualifierIndex = 2;
        } else if (totalActiveCompontent >= .8) {
            qualifierIndex = 3;
        } else {
            qualifierIndex = 4;
        }
        qualifierBonus = [1.2, 1.1, 1.05, 1, .9][qualifierIndex];
    }
    for (let i = 0; i < 3; i++) {
        if (numberOfActiveComponents == 1) {
            RGB[i] = Math.round(200 * components[i]);
        } else if (numberOfActiveComponents == 2) {
            RGB[i] = Math.round(290 * components[i]);
        } else {
            RGB[i] = Math.round(500 * components[i]);
        }
        if (components[i] >= .3) {
            RGB[i] = Math.min(255, Math.max(0, RGB[i] + [50, 10, 5, 0, -10][qualifierIndex]));
        } else {
            RGB[i] = Math.min(255, Math.max(0, RGB[i] + [0, 40, 45, 50, 70][qualifierIndex]));
        }
    }
    const area = shapeDefinitions[shape.key][0].area;
    var jewel: Partial<Jewel> = {
        tier,
        shapeType: shape.key,
        components: savedComponents,
        componentBonuses,
        qualifierName: qualifierNames[qualifierIndex],
        qualifierBonus,
        jewelType,
        quality,
        shape,
        area,
        price: Math.round(10 * Math.pow(quality, 6) * (5 - qualifierIndex) * area),
        adjacentJewels: [],
        adjacencyBonuses: {}
    };
    var typeIndex = 0;
    jewel.shape.color = arrayToCssRGB(RGB);
    jewel.canvas = createCanvas(68, 68);
    jewel.context = jewel.canvas.getContext("2d");
    // Jewels can be displayed in 3 different states:
    // Drawn directly inside of the canvas for a character's jewel board.
    // Drawn on the jewel.canvas canvas while being dragged by the user.
    // Drawn on the jewel.canvas canvas while it is inside jewel.$item and
    // being displayed in grid in the jewel-inventory panel.
    jewel.domElement = tagElement('div', 'js-jewel jewel');
    jewel.domElement.append(jewel.canvas);
    jewel.character = null;
    var bonusMultiplier = jewel.quality * area * jewel.qualifierBonus;
    jewel.bonuses = {...jewel.componentBonuses};
    Object.entries(jewel.bonuses).forEach(([key, value]: [string, number]) => {
        jewel.bonuses[key] = value * bonusMultiplier;
    });
    jewel.helpMethod = jewelHelpText;
    return jewel as Jewel;
}
function clearAdjacentJewels(jewel: Jewel) {
    while (jewel.adjacentJewels.length) {
        var adjacentJewel = jewel.adjacentJewels.pop();
        var jewelIndex = adjacentJewel.adjacentJewels.indexOf(jewel);
        if (jewelIndex >= 0) {
            adjacentJewel.adjacentJewels.splice(jewelIndex, 1);
        }
        updateAdjacencyBonuses(adjacentJewel);
    }
}
export function updateAdjacentJewels(jewel: Jewel) {
    clearAdjacentJewels(jewel);
    if (!jewel.character) {
        updateAdjacencyBonuses(jewel);
        return;
    }
    var jewels = jewel.character.board.jewels.concat(jewel.character.board.fixed);
    for (var i = 0; i < jewels.length; i++) {
        if (jewels[i] === jewel) continue;
        var count = 0;
        for (var j = 0; j < jewel.shape.points.length && count < 2; j++) {
            if (isPointInPoints(jewel.shape.points[j], jewels[i].shape.points)) {
                count++
            }
        }
        if (count < 2) {
            count = 0;
            for (var j = 0; j < jewels[i].shape.points.length && count < 2; j++) {
                if (isPointInPoints(jewels[i].shape.points[j], jewel.shape.points)) {
                    count++
                }
            }
        }
        if (count == 2) {
            jewel.adjacentJewels.push(jewels[i]);
            jewels[i].adjacentJewels.push(jewel);
            updateAdjacencyBonuses(jewels[i]);
        }
    }
    updateAdjacencyBonuses(jewel);
    removePopup();
}
function updateAdjacencyBonuses(jewel) {
    jewel.adjacencyBonuses = {};
    var matches = 0;
    var typesSeen = {};
    typesSeen[jewel.jewelType] = true;
    var uniqueTypes = 0;
    var shapeDefinition = shapeDefinitions[jewel.shapeType][0];
    var coefficient = jewel.quality * shapeDefinition.area;
    // Pure gems qualifier bonus is applied to their own adjacency bonuses
    if (jewel.jewelType === 1 || jewel.jewelType === 2 || jewel.jewelType === 4) {
        coefficient *= jewel.qualifierBonus;
    }
    var adjacentQualifierBonus = 1;
    for (var i = 0; i < jewel.adjacentJewels.length; i++) {
        var adjacent = jewel.adjacentJewels[i];
        if (adjacent.jewelType === jewel.jewelType) {
            matches++;
        }
        if (!typesSeen[adjacent.jewelType]) {
            typesSeen[adjacent.jewelType] = true;
            uniqueTypes++;
        }
        // Dual gems qualifier bonus is applied to adjacent gems' adjacency bonuses
        if (adjacent.jewelType === 3 || adjacent.jewelType === 5 || adjacent.jewelType === 6) {
            // These are additive, otherwise they could result in 3x multiplier on hexagons.
            adjacentQualifierBonus += (adjacent.qualifierBonus - 1);
        }
    }
    coefficient *= adjacentQualifierBonus;
    var resonanceBonus = coefficient * [0, 1, 2, 3, 5, 8, 13, 21, 34][matches];
    var contrastBonus = coefficient * [0, 1, 2, 3, 5, 8, 13, 21, 34][uniqueTypes];
    switch(jewel.jewelType) {
        case 0:
            if (resonanceBonus) {
                jewel.adjacencyBonuses['+reducedDivinityCost'] = resonanceBonus / 100;
            }
            if (contrastBonus) {
                jewel.adjacencyBonuses['+strength'] = contrastBonus;
                jewel.adjacencyBonuses['+dexterity'] = contrastBonus;
                jewel.adjacencyBonuses['+intelligence'] = contrastBonus;
            }
            break;
        case 1:
            if (resonanceBonus) jewel.adjacencyBonuses['%maxHealth'] = resonanceBonus / 100;
            if (contrastBonus) jewel.adjacencyBonuses['%weaponDamage'] = contrastBonus / 100;
            break;
        case 2:
            if (resonanceBonus) jewel.adjacencyBonuses['%evasion'] = resonanceBonus / 100;
            if (contrastBonus) jewel.adjacencyBonuses['%attackSpeed'] = contrastBonus / 100;
            break;
        case 4:
            if (resonanceBonus) {
                jewel.adjacencyBonuses['%block'] = resonanceBonus / 100;
                jewel.adjacencyBonuses['%magicBlock'] = resonanceBonus / 100;
            }
            if (contrastBonus) jewel.adjacencyBonuses['%accuracy'] = contrastBonus / 100;
            break;
        case 3:
            if (resonanceBonus) jewel.adjacencyBonuses['%critChance'] = resonanceBonus / 100;
            if (contrastBonus) jewel.adjacencyBonuses['+critDamage'] = contrastBonus / 100;
            break;
        case 5:
            if (resonanceBonus) jewel.adjacencyBonuses['+healthRegen'] = resonanceBonus / 10;
            if (contrastBonus) jewel.adjacencyBonuses['+healthGainOnHit'] = contrastBonus / 10;
            break;
        case 6:
            if (resonanceBonus) jewel.adjacencyBonuses['+magicBlock'] = resonanceBonus / 10;
            if (contrastBonus) jewel.adjacencyBonuses['+weaponMagicDamage'] = contrastBonus / 10;
            break;
        case 7:
            // This used to be increased experience, but we don't have xp any more
            if (resonanceBonus || contrastBonus) {
                jewel.adjacencyBonuses['+increasedDrops'] = ((resonanceBonus || 0) + (contrastBonus || 0)) / 100;
            }
            break;
    }
}
export function updateJewelBonuses(character) {
    character.jewelBonuses = {'bonuses': {}};
    character.board.jewels.concat(character.board.fixed).forEach(function (jewel) {
        if (jewel.bonuses) {
            Object.entries(jewel.bonuses).forEach(([bonusKey, bonusValue]: [string, number]) => {
                character.jewelBonuses.bonuses[bonusKey] = bonusValue + (character.jewelBonuses.bonuses[bonusKey] || 0);
            })
        }
        Object.entries(jewel.adjacencyBonuses).forEach(([bonusKey, bonusValue]: [string, number]) => {
            character.jewelBonuses.bonuses[bonusKey] = bonusValue + (character.jewelBonuses.bonuses[bonusKey] || 0);
        })
    });
    if (character === getState().selectedCharacter) {
        query('.js-jewelBonuses .js-content').innerHTML
            = bonusSourceHelpText(character.jewelBonuses, character.adventurer);
    }
}
export function makeFixedJewel(shape: Polygon, character, ability: Ability): Jewel {
    shape.color = '#333333';
    return {
        shape,
        area: 1,
        tier: 1,
        shapeType: shape.key,
        components: [0, 0, 0],
        quality: 1,
        jewelType: 0,
        'fixed': true,
        'disabled': false,
        character,
        ability,
        helpMethod() {
            let coreHelpText = abilityHelpText(ability, character.adventurer);
            const bonusText = bonusSourceHelpText({'bonuses': this.adjacencyBonuses}, getState().selectedCharacter.adventurer);
            if (bonusText) coreHelpText += '<br/><br/>' + bonusText;
            if (!this.confirmed) return coreHelpText;
            if (this.disabled) {
                return 'Disabled <br> Double click to enable <br><br> ' + coreHelpText;
            }
            return coreHelpText + '<br><br>Double click to disable this ability.';
        },
        adjacentJewels: [],
        adjacencyBonuses: {},
        componentBonuses: {},
        bonuses: {},
        qualifierName: '',
        qualifierBonus: 1,
        price: 0,
    };
}

// Map JewelType(0-7) to jewel information (name only currently).
const jewelDefinitions = [
    {'name': 'Onyx'},
    {'name': 'Ruby'},
    {'name': 'Emerald'},
    {'name': 'Topaz'},
    {'name': 'Saphire'},
    {'name': 'Amethyst'},
    {'name': 'Aquamarine'},
    {'name': 'Diamond'}
];
// Levels that jewels of each tier drop from.
export const jewelTierLevels = [0, 1, 10, 20, 40, 60];
export function getJewelTiewerForLevel(level): JewelTier {
    if (level >= jewelTierLevels[5]) return 5;
    else if (level >= jewelTierLevels[4]) return 4;
    else if (level >= jewelTierLevels[3]) return 3;
    else if (level >= jewelTierLevels[2]) return 2;
    return 1;
}

let maxAnimaJewelBonus;
function setMaxAnimaJewelBonus(value) {
    const state = getState();
    state.savedState.maxAnimaJewelMultiplier = value;
    if (maxAnimaJewelBonus) removeBonusSourceFromObject(state.guildStats, maxAnimaJewelBonus);
    maxAnimaJewelBonus = {'bonuses': {'*maxAnima': value}};
    addBonusSourceToObject(state.guildStats, maxAnimaJewelBonus, true);
}
function jewelHelpText(jewel: Jewel): string {
    var jewelDefinition = jewelDefinitions[jewel.jewelType];
    var name = jewelDefinition.name;
    if (jewel.qualifierName) {
        name = jewel.qualifierName + ' ' + name;
    }
    name = 'Tier ' + jewel.tier + ' ' + name;
    var sections = [name];
    if (!jewel.fixed) {
        sections.push('Requires level ' + jewelTierLevels[jewel.tier]);
    }
    var componentSum = 0;
    var normalizedComponenets = [];
    for (var component of jewel.components) {
        componentSum += component;
    }
    for (var i in jewel.components) {
        normalizedComponenets[i] = jewel.components[i] / componentSum;
    }
    sections.push('');
    var totalWidth = 150;
    var height = 10;
    const componentsData = [
        {color: '#f00', value: normalizedComponenets[0], width: Math.round(normalizedComponenets[0] * totalWidth), 'active': jewel.jewelType & 1},
        {color: '#0b0', value: normalizedComponenets[1], width: Math.round(normalizedComponenets[1] * totalWidth), 'active': jewel.jewelType & 2},
        {color: '#00f', value: normalizedComponenets[2], width: Math.round(normalizedComponenets[2] * totalWidth), 'active': jewel.jewelType & 4},
    ];
    componentsData.sort((A, B) => B.value - A.value);
    // Adjust the final element so the total width is exactly totalWidth.
    componentsData[2].width = totalWidth - (componentsData[0].width + componentsData[1].width);
    var activeColor = 'white';
    var inactiveColor = '#AAA';
    var balanceComponent = `<div style="box-sizing: border-box; display: inline-block; height: ${height}px; border-left: 2px solid ${activeColor}; border-right: 2px solid ${componentsData[2].active ? activeColor : inactiveColor}">`;
    for (const component of componentsData) {
        var color = component.active ? activeColor : inactiveColor;
        balanceComponent += `<span style="box-sizing: border-box; display: inline-block; background-color: ${component.color}; height: ${height}px; width: ${component.width}px;`
            + ` border-top: 2px solid ${color}; border-bottom: 2px solid ${color}"></span>`;
    }
    balanceComponent += '</div>';
    sections.push(balanceComponent);
    sections.push('Quality ' + fixedDigits(jewel.quality, 2));

    //sections.push('Balance ' + [(300 * normalizedComponenets[0]).format(0), (300 * normalizedComponenets[1]).format(0), (300 * normalizedComponenets[2]).format(0)].join('/'));
    // sections.push('Color ' + jewel.shape.color);
    const state = getState();
    sections.push('');
    sections.push(bonusSourceHelpText(jewel, state.selectedCharacter.adventurer));
    sections.push('');
    var adjacencyBonusText = bonusSourceHelpText({'bonuses': jewel.adjacencyBonuses}, state.selectedCharacter.adventurer);
    if (adjacencyBonusText.length) {
        sections.push(adjacencyBonusText);
        sections.push('');
    }
    var sellValues = [points('coins',jewel.price), points('anima', jewel.price)];
    sections.push(
        '<span style="color: white;">S</span>ell for'
        + divider + sellValues.join(' ') + '<br/>'
        + percent(jewelAnimaBonus(jewel) - 1, 1) + ' increased max anima.');
    return sections.join('<br/>');
}

// This formula is supposed to normalize this bonus so that fusing/expanding jewels doesn't change the value.
export function jewelAnimaBonus({tier, area}: Jewel) {
    return Math.pow(1 + tier / 100, Math.floor(area / .4));
}
