
export const images = {};

import { createCanvas } from 'app/dom';
import { drawRect, fillRect, pad } from 'app/utils/index';
import { drawFrame } from 'app/utils/animations';


import { FullRectangle, Frame, ShortRectangle, TintedFrame } from 'app/types';

function loadImage(source, callback) {
    images[source] = new Image();
    images[source].onload = () => callback();
    images[source].src = source;
    // Used for serializing images.
    images[source].originalSource = source;
    return images[source];
}

let startedLoading = false;
let numberOfImagesLeftToLoad = 0;
export function requireImage(imageFile) {
    if (images[imageFile]) return images[imageFile];
    startedLoading = true;
    numberOfImagesLeftToLoad++;
    return loadImage(imageFile, () => numberOfImagesLeftToLoad--);
}

export function areAllImagesLoaded() {
    return startedLoading && numberOfImagesLeftToLoad <= 0;
}
export async function allImagesLoaded() {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            if (areAllImagesLoaded()) {
                clearInterval(intervalId);
                resolve();
            }
        }, 50);
    });
}
const initialImagesToLoad = [
    // Original images from project contributors:
    'gfx/personSprite.png', 'gfx/hair.png', 'gfx/equipment.png', 'gfx/weapons.png',
    'gfx/grass.png', 'gfx/cave.png', 'gfx/forest.png', 'gfx/beach.png', 'gfx/town.png',
    'gfx/caterpillar.png', 'gfx/gnome.png', 'gfx/skeletonGiant.png', 'gfx/skeletonSmall.png', 'gfx/dragonEastern.png',
    'gfx/turtle.png', 'gfx/monarchButterfly.png', 'gfx/yellowButterfly.png',
    'gfx/treasureChest.png', 'gfx/moneyIcon.png', 'gfx/effects/projectiles.png',
    'gfx/iconSet.png',
    'gfx/monsterPeople.png',
    /**
     * Job Icons by Abhimanyu Sandal created specifically for this project. He does not
     * wish for his to work to be in the public domain so do not reuse these images without
     * his consent.
     */
    'gfx/jobIcons.png',
    /* 'game-icons.png' from http://game-icons.net/about.html */
    'gfx/game-icons.png',
    /* nielsenIcons.png from Søren Nielsen at http://opengameart.org/content/grayscale-icons */
    'gfx/nielsenIcons.png',
    // Public domain images from https://opengameart.org/content/40x56-card-frames-without-the-art
    'gfx/goldFrame.png',
    'gfx/silverFrame.png',
    // http://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg
    'gfx/496RpgIcons/abilityCharm.png',
    'gfx/496RpgIcons/abilityConsume.png',
    'gfx/496RpgIcons/abilityDivineBlessing.png',
    'gfx/496RpgIcons/abilityPowerShot.png',
    'gfx/496RpgIcons/abilityShadowClone.png',
    'gfx/496RpgIcons/abilityThrowWeapon.png',
    'gfx/496RpgIcons/abilityVenom.png',
    'gfx/496RpgIcons/auraAttack.png',
    'gfx/496RpgIcons/auraDefense.png',
    'gfx/496RpgIcons/buffAxe.png',
    'gfx/496RpgIcons/buffBow.png',
    'gfx/496RpgIcons/buffDagger.png',
    'gfx/496RpgIcons/buffFist.png',
    'gfx/496RpgIcons/buffGreatSword.png',
    'gfx/496RpgIcons/buffPolearm.png',
    'gfx/496RpgIcons/buffShield.png',
    'gfx/496RpgIcons/buffStaff.png',
    'gfx/496RpgIcons/buffSword.png',
    'gfx/496RpgIcons/buffThrown.png',
    'gfx/496RpgIcons/buffWand.png',
    'gfx/496RpgIcons/clock.png',
    'gfx/496RpgIcons/openScroll.png',
    'gfx/496RpgIcons/scroll.png',
    'gfx/496RpgIcons/spellFire.png',
    'gfx/496RpgIcons/spellFreeze.png',
    'gfx/496RpgIcons/spellHeal.png',
    'gfx/496RpgIcons/spellMeteor.png',
    'gfx/496RpgIcons/spellPlague.png',
    'gfx/496RpgIcons/spellProtect.png',
    'gfx/496RpgIcons/spellRevive.png',
    'gfx/496RpgIcons/spellStorm.png',
    'gfx/496RpgIcons/target.png',
    'gfx/squareMap.png', // http://topps.diku.dk/torbenm/maps.msp
    'gfx/chest-closed.png', 'gfx/chest-open.png', // http://opengameart.org/content/treasure-chests
    'gfx/bat.png', // http://opengameart.org/content/bat-32x32
    'gfx/militaryIcons.png', // http://opengameart.org/content/140-military-icons-set-fixed
    'gfx/spider.png', // Stephen "Redshrike" Challener as graphic artist and William.Thompsonj as contributor. If reasonable link to this page or the OGA homepage. http://opengameart.org/content/lpc-spider
    'gfx/wolf.png', // Stephen "Redshrike" Challener as graphic artist and William.Thompsonj as contributor. If reasonable link back to this page or the OGA homepage. http://opengameart.org/content/lpc-wolf-animation
    'gfx/effects/explosion.png', //https://opengameart.org/content/pixel-explosion-12-frames
    'gfx/effects/musicNote.png', //http://www.animatedimages.org/img-animated-music-note-image-0044-154574.htm
    'gfx/effects/hook.png', //https://www.flaticon.com/free-icon/hook_91034

    'gfx/effects/greenRune.png', 'gfx/effects/blueRune.png', 'gfx/effects/redRune.png', //https://opengameart.org/content/teleport-rune
    'gfx/effects/circleOfProtection.png', //https://opengameart.org/content/circles-glow
];
for (const initialImageToLoad of initialImagesToLoad) {
    requireImage(initialImageToLoad);
}

export function drawImage(
    context: CanvasRenderingContext2D,
    image: HTMLCanvasElement | HTMLImageElement,
    source: FullRectangle,
    target: FullRectangle & {xScale?: number, yScale?: number},
) {
    context.save();
    context.translate((target.left + target.width / 2) | 0, (target.top + target.height / 2) | 0);
    if (target.xScale || target.yScale) {
        context.scale(target.xScale || 1, target.yScale || 1);
    }
    // (x | 0) is faster than Math.floor(x)
    context.drawImage(image,
        source.left | 0, source.top | 0, source.width | 0, source.height | 0,
        (-target.width / 2) | 0, (-target.height / 2) | 0, target.width | 0, target.height | 0);
    context.restore();
}

export function drawCompositeTintedFrame(context, tintedFrame: TintedFrame, overlayFrame: Frame, target: ShortRectangle): void {
    if (tintedFrame.w !== overlayFrame.w || tintedFrame.h !== overlayFrame.h) {
        console.log("Frame dimensions don't match");
        console.log(tintedFrame, overlayFrame);
        debugger;
    }
    drawSolidTintedFrame(context, tintedFrame, target);
    drawFrame(context, overlayFrame, target);
}

export function drawComplexCompositeTintedFrame(context, tintedFrames: TintedFrame[], overlayFrame: Frame, target: ShortRectangle): void {
    for (const tintedFrame of tintedFrames) {
        if (tintedFrame.w !== overlayFrame.w || tintedFrame.h !== overlayFrame.h) {
            console.log("Frame dimensions don't match");
            console.log(tintedFrame, overlayFrame);
            debugger;
        }
        drawSolidTintedFrame(context, tintedFrame, target);
    }
    drawFrame(context, overlayFrame, target);
}

export function drawSolidTintedFrame(context, frame: TintedFrame, target: ShortRectangle) {
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
        globalTintContext.fillStyle = frame.color;
        globalTintContext.clearRect(0, 0, frame.w, frame.h);
        const tintRectangle = {...frame, x: 0, y: 0};
        drawFrame(globalTintContext, frame, tintRectangle);
        globalTintContext.globalCompositeOperation = "source-in";
        globalTintContext.fillRect(0, 0, frame.w, frame.h);
        drawFrame(context, {...tintRectangle, image: globalTintCanvas}, target);
    globalTintContext.restore();
}

// This needs to wide enough to draw the entire character image.
const globalTintCanvas = createCanvas(1200, 300);
const globalTintContext = globalTintCanvas.getContext('2d');
globalTintContext.imageSmoothingEnabled = false;
export function drawTintedImage(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement | HTMLCanvasElement,
    tint: string,
    amount: number,
    source: ShortRectangle,
    target: ShortRectangle
) {
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
        globalTintContext.fillStyle = tint;
        globalTintContext.clearRect(0, 0, source.w, source.h);
        globalTintContext.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, source.w, source.h);
        globalTintContext.globalCompositeOperation = "source-in";
        globalTintContext.fillRect(0, 0, source.w, source.h);
    globalTintContext.restore();
    context.save();
        // Next draw the untinted image to the target.
        context.drawImage(image, source.x, source.y, source.w, source.h, target.x, target.y, target.w, target.h);
        // Finally draw the tint color on top of the target with the desired opacity.
        context.globalAlpha *= amount; // This needs to be multiplicative since we might be drawing a partially transparent image already.
        context.drawImage(globalTintCanvas, 0, 0, source.w, source.h, target.x, target.y, target.w, target.h);
    context.restore();
}
const globalCompositeCanvas = createCanvas(150, 150);
const globalCompositeContext = globalCompositeCanvas.getContext('2d');
export function prepareTintedImage() {
    globalCompositeContext.clearRect(0, 0, globalCompositeCanvas.width, globalCompositeCanvas.height);
}
export function getTintedImage(image, tint, amount, r: ShortRectangle) {
    drawTintedImage(
        globalCompositeContext, image, tint, amount,
        r,
        {...r, x: 0, y: 0}
    );
    return globalCompositeCanvas;
}

export function drawWhiteOutlinedFrame(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle) {
    drawOutlinedFrame(context, frame, 'white', 1, target);
}
function drawOutlinedFrame(
    context: CanvasRenderingContext2D,
    frame: Frame, color: string, thickness: number,
    target: ShortRectangle
) {
    // First make a solid color in the shape of the image to tint.
    const tintRectangle = {image: globalTintCanvas, x: 0, y: 0, w: target.w, h: target.h};
    globalTintContext.save();
        globalTintContext.fillStyle = color;
        globalTintContext.clearRect(0, 0, target.w | 0, target.h | 0);
        drawFrame(globalTintContext, frame, tintRectangle)
        globalTintContext.globalCompositeOperation = "source-in";
        globalTintContext.fillRect(0, 0, target.w | 0, target.h | 0);
    globalTintContext.restore();

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dy == 0 || dx == 0) continue;
            drawFrame(context, tintRectangle, {
                ...target,
                x: target.x + dx * thickness,
                y: target.y + dy * thickness
            });
        }
    }
    drawFrame(context, frame, target);
}
export function drawTintedFrame(context: CanvasRenderingContext2D, frame: TintedFrame, target: ShortRectangle): void {
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
        globalTintContext.fillStyle = frame.color;
        globalTintContext.clearRect(0, 0, frame.w, frame.h);
        globalTintContext.drawImage(frame.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
        globalTintContext.globalCompositeOperation = "source-in";
        globalTintContext.fillRect(0, 0, frame.w, frame.h);
    globalTintContext.restore();
    context.save();
        // Next draw the untinted image to the target.
        context.drawImage(frame.image, frame.x, frame.y, frame.w, frame.h, target.x, target.y, target.w, target.h);
        // Finally draw the tint color on top of the target with the desired opacity.
        context.globalAlpha *= frame.amount; // This needs to be multiplicative since we might be drawing a partially transparent image already.
        context.drawImage(globalTintCanvas, 0, 0, frame.w, frame.h, target.x, target.y, target.w, target.h);
    context.restore();
}

function logPixel(context, x, y) {
    var imgd = context.getImageData(x, y, 1, 1);
    console.log(imgd.data)
}
window['logPixel'] = logPixel;

export function drawRectangleBackground(context: CanvasRenderingContext2D, {x, y, w, h}: ShortRectangle) {
    context.save();
    context.beginPath();
    context.globalAlpha = .9;
    context.fillStyle = 'black';
    context.fillRect(x, y, w, h);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.beginPath();
    context.rect(x, y, w, h);
    context.rect(x + 1, y + 1, w - 2, h - 2);
    context.fill('evenodd');
    context.restore();
}

export function drawTitleRectangle(context, rectangle: ShortRectangle) {
    context.save();
    context.beginPath();
    context.globalAlpha = .5;
    context.fillStyle = '#999';
    fillRect(context, rectangle);
    context.globalAlpha = 1;
    context.beginPath();
    drawRect(context, rectangle);
    drawRect(context, pad(rectangle, -2));
    context.fill('evenodd');
    context.restore();
}

