import { drawComplexCompositeTintedFrame, drawCompositeTintedFrame, requireImage } from 'app/images';
import { createAnimation, drawFrame } from 'app/utils/animations';
import Random from 'app/utils/Random';

import { Hero, JobKey, TintedFrame } from 'app/types';

const outfit = {
    skinColor: '#AA724B',
    hairColor: 'yellow',
    earColor: '#FAE7D0',
    bandanaColor: 'red',
    shoeColor: 'red',
    shortsColor: 'red',
    shirtColor: '#888',
    capeColor: 'green',
};

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
const forestCostume = {
        bandanaColor: null,
        shoeColor: '#81746c',
        shortsColor: '#994539',
        shirtColor: '#475732',
        scarfColor: '#cdc6a5',
};
const sportyCostume = {
        bandanaColor: '#d8cbc7',
        shoeColor: '#34b233',
        shortsColor: '#000000',
        shirtColor: '#4aacd3',
        scarfColor: '#f4660e',
};
const raspberryCostume = {
        bandanaColor: null,
        shoeColor: '#003049',
        shortsColor: '#06bee1',
        shirtColor: '#d12a98',
        scarfColor: '#fcbf49',
};
const happyCostume = {
        bandanaColor: null,
        shoeColor: '#e2414c',
        shortsColor: '#f76c6c',
        shirtColor: '#d8c90e',
        scarfColor: '#a5ca23',
};
const skyCostume = {
        bandanaColor: '#c3d6f2',
        shoeColor: '#789cce',
        shortsColor: '#c6bcf2',
        shirtColor: '#000092',
        scarfColor: '#3bcbdc',
};
const tropicalIslandCostume = {
        bandanaColor: null,
        shoeColor: '#2f97c1',
        shortsColor: '#31d1e0',
        shirtColor: '#077c28',
        scarfColor: '#f2ea60',
};
/*setHeroColors(Hero, {
        skinColor: '#4DBBEB',
        hairColor: 'white',
        earColor: 'white',
        bandanaColor: null,
        shoeColor: '#ccc',
        shortsColor: 'white',
        shirtColor: 'orange',
        scarfColor: '#FFC5F6',
});


setHeroColors(Hero, {
        skinColor: '#AA724B',
        hairColor: 'black',
        earColor: 'white',
        bandanaColor: null,
        shoeColor: '#2f97c1',
        shortsColor: '#31d1e0',
        shirtColor: '#077c28',
        scarfColor: '#f2ea60',
});

green: 34b233
black: 000000
blue: 4aacd3
orange: f4660e*/
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
export function createHeroColors(jobKey: JobKey) {
    return {
        skinColor: pinkSkin,
        hairColor: 'yellow',
        earColor: pinkSkin,
        bandanaColor: 'red',
        shoeColor: 'blue',
        shortsColor: 'green',
        shirtColor: '#888',
        scarfColor: 'orange',
    };
}
export function updateHeroGraphics(hero: Hero) {
    //document.body.appendChild(hero.personCanvas);
    hero.personCanvas.width = totalWidth;
    hero.personCanvas.height = totalHeight;
    hero.personContext.clearRect(0, 0, totalWidth, totalHeight);
    const context = hero.personContext;
    // BASE BODY
    drawComplexCompositeTintedFrame(context,
        [
            {...bodyColors[0], color: hero.colors.skinColor},
            {...bodyColors[1], color: hero.colors.shoeColor},
            {...bodyColors[2], color: hero.colors.shortsColor},
            {...bodyColors[3], color: hero.colors.shirtColor},
            {...bodyColors[4], color: hero.colors.scarfColor},
        ], bodyLines, characterRectangle
     );
    // BASE HEAD
    drawCompositeTintedFrame(context, {...headColor, color: hero.colors.skinColor}, headLines, characterRectangle);
    // RACE DECORATION
    if (hero.colors.earColor) {
        drawCompositeTintedFrame(context, {...earsColors, color: hero.colors.earColor}, earsLines, characterRectangle);
    }
    // HAIR
    if (hero.equipment.head) {
        drawCompositeTintedFrame(context, {...hatHairColors, color: hero.colors.hairColor}, hatHairLines, characterRectangle);
    } else {
        drawCompositeTintedFrame(context, {...hairColors, color: hero.colors.hairColor}, hairLines, characterRectangle);
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
            // First two frames for a bow attack are the preparation frames 7+8 (offset 6+7)
            context.drawImage(bowSheet,
                0, 0, 2 * frameWidth, totalHeight,
                6 * frameWidth, 0, 2 * frameWidth, totalHeight,
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
            // First throw frame is put on frame 9 (for initial attack).
            context.drawImage(throwSheet,
                0, 0, frameWidth, totalHeight,
                8 * frameWidth, 0, frameWidth, totalHeight,
            );
            // Second throw frame is on frame 11 (for secondary attack).
            context.drawImage(throwSheet,
                frameWidth, 0, frameWidth, totalHeight,
                10 * frameWidth, 0, frameWidth, totalHeight,
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
    } else if (hero.colors.bandanaColor) {
        // This should apply the color, but it isn't a tintable graphic yet.
        drawFrame(context, {image: bandanaSheet, ...characterRectangle}, characterRectangle);
    }
    const heroFrame = {x: 0, y: 0, w: 64, h: 48, content: {x: 20, y: 16, w: 16, h: 31}};
    if (weapon && weapon.base.type === 'bow') {
        // Bows have different attack animation frames than other weapons
        hero.source.attackPreparationAnimation = createAnimation(
            hero.personCanvas, heroFrame,
            {cols: 17, frameMap: [6, 7, 15]},
        );
        hero.source.attackRecoveryAnimation = createAnimation(
            hero.personCanvas, heroFrame,
            {cols: 17, frameMap: [16, 16]},
        );
    } else {
        hero.source.attackPreparationAnimation = createAnimation(
            hero.personCanvas, heroFrame,
            {cols: 17, frameMap: [6, 7, 8]},
        );
        hero.source.attackRecoveryAnimation = createAnimation(
            hero.personCanvas, heroFrame,
            {cols: 17, frameMap: [9, 9]},
        );
    }
}
