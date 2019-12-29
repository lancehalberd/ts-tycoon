import { limitZ } from 'app/adventure';
import {
    bodyDiv, divider, mainCanvas, mainContext,
    titleDiv,
} from 'app/dom';
import { drawJewel } from 'app/drawJewel';
import { GROUND_Y, MAX_Z, MIN_Z } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { addJewelToInventory } from 'app/jewelInventory';
import { makeJewel } from 'app/jewels';
import { gain } from 'app/points';
import { getState } from 'app/state';
import { rectangle } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import Random from 'app/utils/Random';

import { Area, Hero, Jewel, JewelComponents, JewelTier, Range, ShapeType } from 'app/types';

const image = requireImage('gfx/moneyIcon.png');
export const coins = [
    {value: 1, image, x: 0, y: 0, width: 16, height: 16},
    {value: 5, image, x: 0, y: 32, width: 20, height: 20},
    {value: 20, image, x: 0, y: 64, width: 24, height: 24},
    {value: 100, image, x: 32, y: 0, width: 16, height: 16},
    {value: 500, image, x: 32, y: 32, width: 20, height: 20},
    {value: 2000, image, x: 32, y: 64, width: 24, height: 24},
    {value: 10000, image, x: 64, y: 0, width: 16, height: 16},
    {value: 50000, image, x: 64, y: 32, width: 20, height: 20},
    {value: 200000, image, x: 64, y: 64, width: 24, height: 24},
];
export const animaDrops = [
    {value: 1, image, x: 96, y: 0, width: 16, height: 16},
    {value: 5, image, x: 96, y: 32, width: 20, height: 20},
    {value: 20, image, x: 96, y: 64, width: 24, height: 24},
    {value: 100, image, x: 128, y: 0, width: 16, height: 16},
    {value: 500, image, x: 128, y: 32, width: 20, height: 20},
    {value: 2000, image, x: 128, y: 64, width: 24, height: 24},
    {value: 10000, image, x: 160, y: 0, width: 16, height: 16},
    {value: 50000, image, x: 160, y: 32, width: 20, height: 20},
    {value: 200000, image, x: 160, y: 64, width: 24, height: 24},
];


const basicShapeTypes: ShapeType[] = ['triangle', 'diamond', 'trapezoid'];
const triangleShapes: ShapeType[] = ['triangle', 'diamond', 'trapezoid', 'hexagon'];
// Quality ranges for jewel drops like jewelTier: [averageQuality, qualityVariance].
const jewelTierDefinitions = [
    [0], [1.1, .1], [1.8, .2], [2.6, .3], [3.5, .4], [4.5, .5]
];

function coinTreasurePopup(coin: typeof coins[0], x: number, y: number, z: number, vx: number, vy: number, vz: number, delay: number) {
    return {
        x, y, z, vx, vy, vz, 't': 0, 'done': false, delay,
        update(area: Area) {
            if (delay-- > 0) return
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            if (this.z > MAX_Z) {
                this.z = MAX_Z - (this.z - MAX_Z) * .6;
                this.vz = -this.vz * .6;
            } else if (this.z < MIN_Z) {
                this.z = MIN_Z - (this.z - MIN_Z) * .6;
                this.vz = -this.vz * .6;
            }
            if (this.y > 0) this.vy -= .8;
            else {
                this.y = -this.y * .6;
                this.vy = -this.vy * .6;
            }
            this.t += 1;
            this.done = this.t > 80;
        },
        render(area: Area) {
            if (delay > 0) return;
             const p = 1.4 * Math.min(1, 1 - (this.t - 60) / 20);
            mainContext.drawImage(coin.image, coin.x, coin.y, coin.width, coin.height,
                this.x - p * coin.width / 2 - area.cameraX, GROUND_Y - this.y - p * coin.height - this.z / 2, p * coin.width, p * coin.height);
        }
    };
}

export function coinsLootDrop(amount: number) {
    return {
        gainLoot(hero: Hero) {
            gain('coins', Math.round(amount * (1 + hero.stats.increasedDrops)));
        },
        addTreasurePopup(hero: Hero, x: number, y: number, z: number, delay: number) {
            let total = Math.round(amount * (1 + hero.stats.increasedDrops));
            let nextDelay = delay;
            let index = coins.length - 1;
            let drops = 0;
            while (total > 0 && index >= 0) {
                // Getting a single large coin drop feels underwhelming, so if no coins have dropped yet
                // break single coins into smaller drops.
                while (coins[index].value <= total && (drops || coins[index].value < total || total < 5) && drops < 50) {
                    total -= coins[index].value;
                    const coinPopup = coinTreasurePopup(coins[index], x, y, z, Math.random() * 10 - 5, 10, Math.random() * 10 - 5, nextDelay);
                    hero.area.treasurePopups.push(coinPopup);
                    nextDelay += 5;
                    drops++;
                }
                index--;
            }
        }
    }
}
export function coinsLoot(range: Range) {
    return {
        type: 'coinsLoot',
        generateLootDrop() {
        return coinsLootDrop(Random.range(range[0], range[1]));
    }};
}

function animaTreasurePopup(hero: Hero, coin: typeof animaDrops[0], x: number, y: number, z: number, vx: number, vy: number, vz: number, delay: number) {
    return {
        x, y, z, vx, vy, vz, t: 0, done: false, delay,
        update(area: Area) {
            if (delay-- > 0) return
            this.x += this.vx;
            this.y += this.vy;
            this.z = limitZ(this.z + this.vz);
            if (this.y > (hero.height / 2)) this.vy = Math.max(-8, this.vy - .5);
            else this.vy++;
            if (this.x > hero.x) this.vx = Math.max(-8 + hero.heading[0], this.vx - .5);
            else this.vx = Math.min(8 + hero.heading[0], this.vx + .5);
            if (this.z > hero.z) this.vz -= .5;
            else this.vz+=.5;
            this.t += 1;
            this.done = this.done || this.t > 60 || (Math.abs(this.x - hero.x) < 10);
        },
        render(area: Area) {
            if (delay > 0) return;
            mainContext.save();
            mainContext.globalAlpha = .6 + .2 * Math.cos(this.t / 5);
            // Anima disappears over time or as it approachs the hero.
            const p = 1.5 * Math.max(0, Math.min(1, 1 - Math.max((this.t - 60) / 20, (20 - Math.abs(this.x - hero.x)) / 20)));
            mainContext.drawImage(coin.image, coin.x, coin.y, coin.width, coin.height,
                this.x - p * coin.width / 2 - area.cameraX,
                GROUND_Y - this.y - this.z / 2 - p * coin.height / 2, p * coin.width, p * coin.height);
            mainContext.restore();
        }
    };
}
export function animaLootDrop(amount: number) {
    return {
        gainLoot(hero: Hero) {
            gain('anima', Math.round(amount * (1 + hero.stats.increasedDrops)));
        },
        addTreasurePopup(hero: Hero, x: number, y: number, z: number, delay: number) {
            let total = Math.round(amount * (1 + hero.stats.increasedDrops));
            let nextDelay = delay;
            let index = animaDrops.length - 1;
            let drops = 0;
            while (total > 0 && index >= 0) {
                // Getting a single large anima drop feels underwhelming, so if no anima has dropped yet
                // break single anima into smaller drops.
                while (animaDrops[index].value <= total && (drops || animaDrops[index].value < total || total < 5) && drops < 50) {
                    total -= animaDrops[index].value;
                    // Set this so the anima always moves away from the hero's x location initially.
                    const dx = (hero.x < x) ? 1 : -1;
                    hero.area.treasurePopups.push(animaTreasurePopup(hero, animaDrops[index],
                        x, y, z,
                        dx * (10 + Math.random() * 5), 2 + Math.random() * 4, 10 + Math.random() * 10 - 5,
                        nextDelay
                    ));
                    nextDelay += 5;
                    drops++;
                }
                index--;
            }
        }
    }
}

function jewelTreasurePopup(jewel: Jewel, x: number, y: number, z: number, vx: number, vy: number, vz: number, delay: number) {
    // We need to duplicate the shape so we can draw it on the adventure panel
    // independent of drawing it in the inventory.
    const popupShape = jewel.shape.clone().scale(.5);
    popupShape.color = jewel.shape.color;
    return {
        x, y, z, vx, vy, vz, t: 0, done: false, delay,
        update(area: Area) {
            if (delay-- > 0) return
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            this.t += 1;
            this.done = this.t > 40;
        },
        render(area: Area) {
            if (delay > 0) return
            popupShape.setCenterPosition(this.x - area.cameraX, GROUND_Y - this.y - this.z / 2);
            const lightSource = getMousePosition(mainCanvas);
            drawJewel(mainContext, popupShape, lightSource, 'white');
        }
    };
}

function jewelLootDrop(jewel: Jewel) {
    return {
        gainLoot(hero: Hero) {
            gainJewel(jewel);
            return jewel;
        },
        addTreasurePopup(hero: Hero, x: number, y: number, z: number, delay: number) {
            const thetaRange = Math.random() * 2 * Math.PI / 3;
            const theta = (Math.PI - thetaRange) / 2;
            const vx =  Math.cos(theta) * 2;
            const vy = Math.sin(theta) * 2;
            hero.area.treasurePopups.push(jewelTreasurePopup(jewel, x, y, z, vx, vy, 0, delay));
        }
    }
}
export function gainJewel(jewel: Jewel) {
    getState().jewels.push(jewel);
    addJewelToInventory(jewel.domElement);
}

export function jewelLoot(
    shapes: ShapeType[],
    tiers: Range,
    components: [Range, Range, Range],
    permute: boolean
) {
    return {
        type: 'jewelLoot',
        generateLootDrop() {
            return jewelLootDrop(createRandomJewel(shapes, tiers, components, permute));
        }
    };
}
function createRandomJewel(
    shapes: ShapeType[],
    tiers: Range,
    componentRanges: [Range, Range, Range],
    permute: boolean
) {
    const shapeType = Random.element(shapes);
    const tier = Random.range(tiers[0], tiers[1]) as JewelTier;
    const tierDefinition = jewelTierDefinitions[tier]
    const quality = tierDefinition[0] - tierDefinition[1] + Math.random() * 2 * tierDefinition[1];
    let components = componentRanges.map(r => Random.range(r[0], r[1]));
    if (permute) {
        components = Random.shuffle(components);
    }
    return makeJewel(tier, shapeType, components as JewelComponents, quality);
}
export const smallJewelLoot = jewelLoot(['triangle'], [1, 1], [[90, 90], [16, 20], [7, 10]], true);
const simpleJewelLoot = jewelLoot(basicShapeTypes, [1, 1], [[90, 90], [16, 20], [7, 10]], true);
const simpleRubyLoot = jewelLoot(basicShapeTypes, [1, 1], [[90, 100], [5, 10], [5, 10]], false);
const simpleEmeraldLoot = jewelLoot(basicShapeTypes, [1, 1], [[5, 10], [90,100], [5, 10]], false);
const simpleSaphireLoot = jewelLoot(basicShapeTypes, [1, 1], [[5, 10], [5, 10], [90, 100]], false);

const loots = {
    smallJewelLoot,
    simpleJewelLoot,
    simpleRubyLoot,
    simpleEmeraldLoot,
    simpleSaphireLoot
};
