import { drawComplexCompositeTintedFrame, drawCompositeTintedFrame, requireImage } from 'app/images';
import { drawFrame } from 'app/utils/animations';
import Random from 'app/utils/Random';

import { Hero, TintedFrame } from 'app/types';

const frameWidth = 64;
const frameHeight = 48;
const frameCount = 17;
const characterRectangle = {x: 0, y: 0, w: 1088, h: 48};
const totalWidth = frameCount * frameWidth;
const totalHeight = frameHeight;
const paleSkin = '#FAE7D0';
const pinkSkin = '#FFCC99';
const midSkin = '#DFC183';
const brownSkin = '#AA724B';
const darkSkin = '#573719';
const skinTone = Random.element([paleSkin, pinkSkin, midSkin, brownSkin, darkSkin]);
const bandanaSheet = requireImage('gfx2/character/c1bandanasheet.png');
const beltSheet = requireImage('gfx2/character/c1beltsheet.png');
const bodyLines = crect('gfx2/character/c1bodysheet.png');
const bodyColors = [
    crect('gfx2/character/c1bodysheet.png', skinTone, 1),
    crect('gfx2/character/c1bodysheet.png', 'yellow', 2),
    crect('gfx2/character/c1bodysheet.png', 'blue', 3),
    crect('gfx2/character/c1bodysheet.png', 'white', 4),
    crect('gfx2/character/c1bodysheet.png', 'orange', 5),
];
const bootsSheet = requireImage('gfx2/character/c1bootssheet.png');
const bowSheet = requireImage('gfx2/character/c1bowsheet.png');
const earsLines = crect('gfx2/character/c1ears.png');
const earsColors = crect('gfx2/character/c1ears.png', skinTone, 1);
const capeSheet = requireImage('gfx2/character/c1capesheet.png');
const gloveSheet = requireImage('gfx2/character/c1glovesheet.png');
const hairLines = crect('gfx2/character/c1hairsheet.png');
const hairColors = crect('gfx2/character/c1hairsheet.png', 'blue', 1);
const hatHairLines = crect('gfx2/character/c1hathairsheet.png');
const hatHairColors = crect('gfx2/character/c1hathairsheet.png', 'blue', 1);
const witchHatSheet = requireImage('gfx2/character/c1witchhat.png');
const headLines = crect('gfx2/character/c1headsheet.png');
const headColor = crect('gfx2/character/c1headsheet.png', skinTone, 1);
const jacketSheet = requireImage('gfx2/character/c1jacketsheet.png');
const shieldSheet = requireImage('gfx2/character/c1shieldsheet.png');
const staffSheet = requireImage('gfx2/character/c1staffsheet.png');
const swordSheet = requireImage('gfx2/character/c1swordsheet.png');
const throwSheet = requireImage('gfx2/character/c1throwsheet.png');
const wandSheet = requireImage('gfx2/character/c1wandsheet.png');

function crect(source: string, color: string = '0', row: number = 0): TintedFrame {
    return {
        image: requireImage(source),
        color,
        ...characterRectangle,
        y: characterRectangle.h * row,
    };
}
export function updateHeroGraphics(hero: Hero) {
    hero.personCanvas.width = totalWidth;
    hero.personCanvas.height = totalHeight;
    hero.personContext.clearRect(0, 0, totalWidth, totalHeight);
    const context = hero.personContext;
    // BASE BODY
    drawComplexCompositeTintedFrame(context, bodyColors, bodyLines, characterRectangle);
    // BASE HEAD
    drawCompositeTintedFrame(context, headColor, headLines, characterRectangle);
    // RACE DECORATION
    drawCompositeTintedFrame(context, earsColors, earsLines, characterRectangle);
    // HAIR
    if (hero.equipment.head) {
        drawCompositeTintedFrame(context, hatHairColors, hatHairLines, characterRectangle);
    } else {
        drawCompositeTintedFrame(context, hairColors, hairLines, characterRectangle);
    }
    // SHIELD
    if (hero.equipment.offhand &&
        (hero.equipment.offhand.base.type === 'heavyShield' || hero.equipment.offhand.base.type === 'lightShield')) {
        drawFrame(context, {image: shieldSheet, ...characterRectangle}, characterRectangle);
    }
    // SHOES
    if (hero.equipment.feet) {
        drawFrame(context, {image: bootsSheet, ...characterRectangle}, characterRectangle);
    }
    // CAPE
    if (hero.equipment.back && hero.equipment.back.base.type === 'cloak') {
        drawFrame(context, {image: capeSheet, ...characterRectangle}, characterRectangle);
    }
    // LEGGINGS
    if (hero.equipment.legs) {
        // Currently using the belt for leggings...
        drawFrame(context, {image: beltSheet, ...characterRectangle}, characterRectangle);
    }
    // ARMOUR
    if (hero.equipment.body) {
        drawFrame(context, {image: jacketSheet, ...characterRectangle}, characterRectangle);
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
        drawFrame(context, {image: gloveSheet, ...characterRectangle}, characterRectangle);
    }
    // HAT
    if (hero.equipment.head) {
        drawFrame(context, {image: witchHatSheet, ...characterRectangle}, characterRectangle);
    } else {
        drawFrame(context, {image: bandanaSheet, ...characterRectangle}, characterRectangle);
    }
}
