import { requireImage } from 'app/images';

import { Hero } from 'app/types';

const frameWidth = 64;
const frameHeight = 48;
const frameCount = 17;
const totalWidth = frameCount * frameWidth;
const totalHeight = frameHeight;
const bandanaSheet = requireImage('gfx2/character/c1bandanasheet.png');
const beltSheet = requireImage('gfx2/character/c1beltsheet.png');
const bodySheet = requireImage('gfx2/character/c1bodysheet.png');
const bootsSheet = requireImage('gfx2/character/c1bootssheet.png');
const bowSheet = requireImage('gfx2/character/c1bowsheet.png');
const earsSheet = requireImage('gfx2/character/c1ears.png');
const capeSheet = requireImage('gfx2/character/c1capesheet.png');
const gloveSheet = requireImage('gfx2/character/c1glovesheet.png');
const hairSheet = requireImage('gfx2/character/c1hairsheet.png');
const hatHairSheet = requireImage('gfx2/character/c1hathairsheet.png');
const witchHatSheet = requireImage('gfx2/character/c1witchhat.png');
const headSheet = requireImage('gfx2/character/c1headsheet.png');
const jacketSheet = requireImage('gfx2/character/c1jacketsheet.png');
const shieldSheet = requireImage('gfx2/character/c1shieldsheet.png');
const staffSheet = requireImage('gfx2/character/c1staffsheet.png');
const swordSheet = requireImage('gfx2/character/c1swordsheet.png');
const throwSheet = requireImage('gfx2/character/c1throwsheet.png');
const wandSheet = requireImage('gfx2/character/c1wandsheet.png');
export function updateHeroGraphics(hero: Hero) {
    hero.personCanvas.width = totalWidth;
    hero.personCanvas.height = totalHeight;
    hero.personContext.clearRect(0, 0, totalWidth, totalHeight);
    const context = hero.personContext;
    // BASE BODY
    context.drawImage(bodySheet, 0, 0, totalWidth, totalHeight);
    // BASE HEAD
    context.drawImage(headSheet, 0, 0, totalWidth, totalHeight);
    // RACE DECORATION
    context.drawImage(earsSheet, 0, 0, totalWidth, totalHeight);
    // HAIR
    if (hero.equipment.head) {
        context.drawImage(hatHairSheet, 0, 0, totalWidth, totalHeight);
    } else {
        context.drawImage(hairSheet, 0, 0, totalWidth, totalHeight);
    }
    // SHIELD
    if (hero.equipment.offhand &&
        (hero.equipment.offhand.base.type === 'heavyShield' || hero.equipment.offhand.base.type === 'lightShield')) {
        context.drawImage(shieldSheet, 0, 0, totalWidth, totalHeight);
    }
    // SHOES
    if (hero.equipment.feet) {
        context.drawImage(bootsSheet, 0, 0, totalWidth, totalHeight);
    }
    // CAPE
    if (hero.equipment.back && hero.equipment.back.base.type === 'cloak') {
        context.drawImage(capeSheet, 0, 0, totalWidth, totalHeight);
    }
    // LEGGINGS
    if (hero.equipment.legs) {
        // Currently using the belt for leggings...
        context.drawImage(beltSheet, 0, 0, totalWidth, totalHeight);
    }
    // ARMOUR
    if (hero.equipment.body) {
        context.drawImage(jacketSheet, 0, 0, totalWidth, totalHeight);
    }
    // WEAPON
    const weapon = hero.equipment.weapon;
    switch (weapon ? weapon.base.type : 'none') {
        case 'bow': {
            // First frame for a bow attack is the preparation frame 7 (offset 6)
            context.drawImage(bowSheet,
                0, 0, frameWidth, totalHeight,
                6 * frameWidth, 0, frameWidth, totalHeight,
            );
            // The remaining two frames are frame 16+17 for drawing and releasing the arrow.
            const width = 2 * frameWidth;
            const offset = 15 * frameWidth;
            context.drawImage(bowSheet,
                frameWidth, 0, width, totalHeight,
                offset, 0, width, totalHeight,
            );
            break;
        }
        case 'throwing': {
            const width = 2 * frameWidth;
            const offset = 8 * frameWidth;
            context.drawImage(staffSheet,
                0, 0, width, totalHeight,
                offset, 0, width, totalHeight,
            );
            break;
        }
        // All these weapons use frames 7-12 for attack animation (6 frames starting at offset 6.
        case 'staff':
            context.drawImage(staffSheet,
                0, 0, 6 * frameWidth, totalHeight,
                6 * frameWidth, 0, 6 * frameWidth, totalHeight,
            );
            break;
        case 'sword':
            context.drawImage(swordSheet,
                0, 0, 6 * frameWidth, totalHeight,
                6 * frameWidth, 0, 6 * frameWidth, totalHeight,
            );
            break;
        case 'wand':
            context.drawImage(wandSheet,
                0, 0, 6 * frameWidth, totalHeight,
                6 * frameWidth, 0, 6 * frameWidth, totalHeight,
            );
            break;
    }
    // GLOVES
    if (hero.equipment.arms) {
        context.drawImage(gloveSheet, 0, 0, totalWidth, totalHeight);
    }
    // HAT
    if (hero.equipment.head) {
        context.drawImage(witchHatSheet, 0, 0, totalWidth, totalHeight);
    } else {
        context.drawImage(bandanaSheet, 0, 0, totalWidth, totalHeight);
    }
}
