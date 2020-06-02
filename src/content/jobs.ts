import { classBoards, squareBoard } from 'app/content/boards';
import { itemsByKey } from 'app/content/equipment/index';
import { drawImage, requireImage } from 'app/images';
import { smallJewelLoot, jewelLoot } from 'app/loot';
import { createAnimation, drawFrame } from 'app/utils/animations';

import { Frame, Job, JobKey, Renderable, ShortRectangle } from 'app/types';

export const characterClasses:Partial<{[key in JobKey]: Job}> = {};
window['characterClasses'] = characterClasses;

const jobIconImage = requireImage('gfx/jobIcons.png');
export class JobIcon implements Renderable {
    image: HTMLImageElement = jobIconImage;
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(column: number, row: number) {
        this.x = column * 41;
        this.y = row * 41;
        this.w = 40;
        this.h = 40;
    }

    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        drawFrame(context, this, target);
    }
}

class RenderableFrame implements Renderable {
    frame: Frame;

    constructor(frame: Frame) {
        this.frame = frame;
    }

    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        drawFrame(context, this.frame, target);
    }
}

const iconTrophyFrames = createAnimation('gfx2/objects/classtrophiessheet.png', {w: 24, h: 24}, {cols: 18}).frames;

export const jobIcons: {[key in JobKey]: Renderable} = {
    // None
    fool: new JobIcon(0, 2),
    // Strength
    blackbelt: new RenderableFrame(iconTrophyFrames[12]),
    warrior: new JobIcon(1, 1),
    samurai: new JobIcon(2, 1),
    // Dexterity
    juggler: new RenderableFrame(iconTrophyFrames[0]),
    ranger: new JobIcon(4, 2),
    sniper: new JobIcon(0, 0),
    // Intelligence
    priest: new RenderableFrame(iconTrophyFrames[6]),
    wizard: new JobIcon(4, 3),
    sorcerer: new JobIcon(1, 3),
    // Strength+Dexterity
    corsair: new JobIcon(2, 3),
    assassin: new JobIcon(3, 1),
    ninja: new JobIcon(4, 1),
    // Dexterity+Intelligence
    dancer: new JobIcon(3, 0),
    bard: new JobIcon(2, 0),
    sage: new JobIcon(1, 0),
    // Intelligence+Strength
    paladin: new JobIcon(2, 2),
    darkknight: new JobIcon(3, 2),
    enhancer: new JobIcon(3, 3),
    // All
    master: new JobIcon(1, 2),
};

export function initializeJobs() {
    addCharacterClass('Fool', 0, 0, 0, {}, [], jobIcons.fool);

    addCharacterClass('Black Belt', 0, 2, 1, {}, jobJewels(1,0,0), jobIcons.blackbelt);
    addCharacterClass('Warrior', 1, 3, 1, {'weapon': itemsByKey.stick}, jobJewels(1,0,0), jobIcons.warrior);
    addCharacterClass('Samurai', 2, 4, 1, {'weapon': itemsByKey.stick}, jobJewels(1,0,0), jobIcons.samurai);

    addCharacterClass('Juggler', 2, 1, 0, {'weapon': itemsByKey.ball}, jobJewels(0,1,0), jobIcons.juggler);
    addCharacterClass('Ranger', 3, 1, 1, {'weapon': itemsByKey.ball}, jobJewels(0,1,0), jobIcons.ranger);
    addCharacterClass('Sniper', 4, 1, 2, {'weapon': itemsByKey.ball}, jobJewels(0,1,0), jobIcons.sniper);

    addCharacterClass('Priest', 1, 0, 2, {'weapon': itemsByKey.stick}, jobJewels(0,0,1), jobIcons.priest);
    addCharacterClass('Wizard', 1, 1, 3, {'weapon': itemsByKey.stick}, jobJewels(0,0,1), jobIcons.wizard);
    addCharacterClass('Sorcerer', 1, 2, 4, {'weapon': itemsByKey.stick}, jobJewels(0,0,1), jobIcons.sorcerer);

    addCharacterClass('Corsair', 2, 2, 1, {'weapon': itemsByKey.rock}, jobJewels(1,1,0), jobIcons.corsair);
    addCharacterClass('Assassin', 3, 2, 1, {'weapon': itemsByKey.rock}, jobJewels(1,1,0), jobIcons.assassin);
    addCharacterClass('Ninja', 4, 4, 2, {'weapon': itemsByKey.rock}, jobJewels(1,1,0), jobIcons.ninja);

    addCharacterClass('Dancer', 2, 1, 2, {'weapon': itemsByKey.rock}, jobJewels(0,1,1), jobIcons.dancer);
    addCharacterClass('Bard', 2, 1, 3, {'weapon': itemsByKey.stick}, jobJewels(1,0,1), jobIcons.bard);
    addCharacterClass('Sage', 4, 2, 4, {'weapon': itemsByKey.stick}, jobJewels(1,0,1), jobIcons.sage);

    addCharacterClass('Paladin', 1, 2, 2, {'weapon': itemsByKey.stick}, jobJewels(1,0,1), jobIcons.paladin);
    addCharacterClass('Dark Knight', 1, 3, 2, {'weapon': itemsByKey.ball}, jobJewels(0,1,1), jobIcons. darkknight);
    addCharacterClass('Enhancer', 2, 4, 4, {'weapon': itemsByKey.ball}, jobJewels(0,1,1), jobIcons.enhancer);

    addCharacterClass('Master', 4, 4, 4, {'weapon': itemsByKey.rock}, jobJewels(0,1,1), jobIcons.master);

    for (let classKey in characterClasses) {
        const jobKey = classKey as JobKey;
        characterClasses[jobKey].achievementImage = requireImage('gfx/achievements/' + classKey + '.png');
    }
}

function addCharacterClass(name, dexterityBonus, strengthBonus, intelligenceBonus,
    startingEquipment,
    jewelLoot,
    iconSource) {
    const key = name.replace(/\s*/g, '').toLowerCase() as JobKey;
    startingEquipment.body = startingEquipment.body || itemsByKey.woolshirt;
    characterClasses[key] = {
        key,
        name,
        dexterityBonus,
        strengthBonus,
        intelligenceBonus,
        startingEquipment,
        startingBoard: classBoards[key] || squareBoard,
        jewelLoot,
        iconSource
    };
}
function jobJewels(r, g, b) {
    const base = (r + g + b) * 5;
    return [jewelLoot(['triangle'], [1, 1],
            [r ? [90, 100] : [base, base + 5],
             g ? [90, 100] : [base, base + 5],
             b ? [90, 100] : [base, base + 5]], false), smallJewelLoot, smallJewelLoot];
}
window['characterClasses'] = characterClasses;
