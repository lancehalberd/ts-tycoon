import { classBoards, squareBoard } from 'app/content/boards';
import { drawImage, requireImage } from 'app/images';
import { itemsByKey } from 'app/inventory';
import { smallJewelLoot, jewelLoot } from 'app/loot';
interface CharacterClass {
    key: JobKey,
    name: string,
    dexterityBonus: number,
    strengthBonus: number,
    intelligenceBonus: number,
    startingEquipment: any[],
    startingBoard: any,
    jewelLoot: any[],
    iconSource: JobIcon,
    achievementImage?: HTMLImageElement,
}
export const characterClasses:Partial<{[key in JobKey]: CharacterClass}> = {};

const jobIconImage = requireImage('gfx/jobIcons.png');
class JobIcon {
    left: number;
    top: number;
    width: number;
    height: number;

    constructor(column: number, row: number) {
        this.left = column * 41;
        this.top = row * 41;
        this.width = 40;
        this.height = 40;
    }

    render(context, target) {
        drawImage(context, jobIconImage, this, target);
    }
}
export type JobKey = 'fool' |
    'blackbelt' | 'warrior' | 'samurai' |
    'juggler' | 'ranger' | 'sniper' |
    'priest' | 'wizard' | 'sorcerer' |
    'corsair' | 'assassin' | 'ninja' |
    'dancer' | 'bard' | 'sage' |
    'paladin' | 'darkknight' | 'enhancer' |
    'master';

export const jobIcons: {[key in JobKey]: JobIcon} = {
    // None
    fool: new JobIcon(0, 2),
    // Strength
    blackbelt: new JobIcon(0, 1),
    warrior: new JobIcon(1, 1),
    samurai: new JobIcon(2, 1),
    // Dexterity
    juggler: new JobIcon(4, 0),
    ranger: new JobIcon(4, 2),
    sniper: new JobIcon(0, 0),
    // Intelligence
    priest: new JobIcon(0, 3),
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

function addCharacterClass(name, dexterityBonus, strengthBonus, intelligenceBonus,
    startingEquipment,
    jewelLoot,
    iconSource) {
    const key = name.replace(/\s*/g, '').toLowerCase();
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
for (let classKey in characterClasses) {
    const jobKey = classKey as JobKey;
    characterClasses[jobKey].achievementImage = requireImage('gfx/achievements/' + classKey + '.png');
}
