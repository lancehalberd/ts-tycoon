import { initializeProjectileAnimations } from 'app/content/projectileAnimations';
import { createCanvas } from 'app/dom';
import {
    drawRectangle, fillRectangle, ifdefor, shrinkRectangle
} from 'app/utils';

export const images = {};
function loadImage(source, callback) {
    images[source] = new Image();
    images[source].onload = () => callback();
    images[source].src = source;
    return images[source];
}

var numberOfImagesLeftToLoad = 0;
export function requireImage(imageFile) {
    if (images[imageFile]) return images[imageFile];
    numberOfImagesLeftToLoad++;
    return loadImage(imageFile, () => numberOfImagesLeftToLoad--);
}

export function areAllImagesLoaded() {
    return numberOfImagesLeftToLoad <= 0;
}
/*function imagePromise(imageFile) {
    if (images[imageFile]) return Promise.resolve(images[imageFile]);
    return new Promise(resolve => {
        numberOfImagesLeftToLoad++;
        loadImage(imageFile, () => {
            numberOfImagesLeftToLoad--;
            resolve(images[imageFile]);
        });
    };
}*/
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
    'gfx/squareMap.bmp', // http://topps.diku.dk/torbenm/maps.msp
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


export function initializeImages() {
    initializeProjectileAnimations();
}
export function staticAnimation(image, frame) {
    return {image, frames: [frame]};
}
export function makeFrames(length, size, origin = [0, 0], padding = 0, frameRepeat = 1, columns = 0) {
    columns = columns || length;
    var frames = [];
    for (var r = 0; r < Math.ceil(length / columns); r++) {
        for (var i = 0; i < columns; i++) {
            if (r * columns + i >= length) break;
            for (var j = 0; j < frameRepeat; j++) {
                frames.push([origin[0] + (size[0] + padding) * i, origin[1] + (size[1] + padding) * r, size[0], size[1]]);
            }
        }
    }
    return frames;
}
export function undoFrames(frames) {
    var reversedFrames = frames.slice();
    reversedFrames.pop();
    return frames.concat(reversedFrames.reverse());
}

export function drawImage(context, image, source, target) {
    context.save();
    context.translate(target.left + target.width / 2, target.top + target.height / 2);
    if (target.xScale || target.yScale) {
        context.scale(ifdefor(target.xScale, 1), ifdefor(target.yScale, 1));
    }
    context.drawImage(image, source.left, source.top, source.width, source.height, -target.width / 2, -target.height / 2, target.width, target.height);
    context.restore();
}

export function drawSolidTintedImage(context, image, tint, source, target) {
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
    globalTintContext.fillStyle = tint;
    globalTintContext.clearRect(0, 0, source.width, source.height);
    var tintRectangle = {'left': 0, 'top': 0, 'width': source.width, 'height': source.height};
    drawImage(globalTintContext, image, source, tintRectangle)
    globalTintContext.globalCompositeOperation = "source-in";
    globalTintContext.fillRect(0, 0, source.width, source.height);
    drawImage(context, globalTintCanvas, tintRectangle, target);
    globalTintContext.restore();
}

function makeTintedImage(image, tint) {
    var tintCanvas = createCanvas(image.width, image.height);
    var tintContext = tintCanvas.getContext('2d');
    tintContext.clearRect(0, 0, image.width, image.height);
    tintContext.fillStyle = tint;
    tintContext.fillRect(0,0, image.width, image.height);
    tintContext.globalCompositeOperation = "destination-atop";
    tintContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    var resultCanvas = createCanvas(image.width, image.height);
    var resultContext = resultCanvas.getContext('2d');
    resultContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    resultContext.globalAlpha = 0.3;
    resultContext.drawImage(tintCanvas, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    resultContext.globalAlpha = 1;
    return resultCanvas;
}
const globalTintCanvas = createCanvas(400, 300);
const globalTintContext = globalTintCanvas.getContext('2d');
globalTintContext.imageSmoothingEnabled = false;
export function drawTintedImage(context, image, tint, amount, source, target) {
    context.save();
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
    globalTintContext.fillStyle = tint;
    globalTintContext.clearRect(0, 0, source.width, source.height);
    globalTintContext.drawImage(image, source.left, source.top, source.width, source.height, 0, 0, source.width, source.height);
    globalTintContext.globalCompositeOperation = "source-in";
    globalTintContext.fillRect(0, 0, source.width, source.height);
    globalTintContext.restore();
    // Next draw the untinted image to the target.
    context.drawImage(image, source.left, source.top, source.width, source.height, target.left, target.top, target.width, target.height);
    // Finally draw the tint color on top of the target with the desired opacity.
    context.globalAlpha *= amount; // This needs to be multiplicative since we might be drawing a partially transparent image already.
    context.drawImage(globalTintCanvas, 0, 0, source.width, source.height, target.left, target.top, target.width, target.height);
    context.restore();
}
const globalCompositeCanvas = createCanvas(150, 150);
const globalCompositeContext = globalCompositeCanvas.getContext('2d');
export function prepareTintedImage() {
    globalCompositeContext.clearRect(0, 0, globalCompositeCanvas.width, globalCompositeCanvas.height);
}
export function getTintedImage(image, tint, amount, sourceRectangle) {
    drawTintedImage(globalCompositeContext, image, tint, amount, sourceRectangle, {'left': 0, 'top': 0, 'width': sourceRectangle.width, 'height': sourceRectangle.height});
    return globalCompositeCanvas;
}

export function drawSourceWithOutline(context, source, color, thickness, target) {
    if (source.drawWithOutline) {
        source.drawWithOutline(context, color, thickness, target);
        return;
    }
    context.save();
    var smallTarget = {...target};
    for (var dy = -1; dy < 2; dy++) {
        for (var dx = -1; dx < 2; dx++) {
            if (dy == 0 && dx == 0) continue;
            smallTarget.left = target.left + dx * thickness;
            smallTarget.top = target.top + dy * thickness;
            drawSourceAsSolidTint(context, source, color, smallTarget);
        }
    }
    source.draw(context, target);
}
function drawSourceAsSolidTint(context, source, tint, target) {
    // First make a solid color in the shape of the image to tint.
    globalTintContext.save();
    globalTintContext.fillStyle = tint;
    globalTintContext.clearRect(0, 0, source.width, source.height);
    var tintRectangle = {'left': 0, 'top': 0, 'width': source.width, 'height': source.height};
    source.draw(globalTintContext, tintRectangle);
    globalTintContext.globalCompositeOperation = "source-in";
    globalTintContext.fillRect(0, 0, source.width, source.height);
    drawImage(context, globalTintCanvas, tintRectangle, target);
    globalTintContext.restore();
}
export function drawOutlinedImage(context, image, color, thickness, source, target) {
    context.save();
    const smallTarget = {...target};
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dy == 0 && dx == 0) continue;
            smallTarget.left = target.left + dx * thickness;
            smallTarget.top = target.top + dy * thickness;
            drawSolidTintedImage(context, image, color, source, smallTarget);
        }
    }
    drawImage(context, image, source, target);
}
function logPixel(context, x, y) {
    var imgd = context.getImageData(x, y, 1, 1);
    console.log(imgd.data)
}
export function setupSource(source) {
    source.width = ifdefor(source.width, 48);
    source.height = ifdefor(source.height, 64);
    source.actualHeight = ifdefor(source.actualHeight, source.height);
    source.actualWidth = ifdefor(source.actualWidth, source.width);
    source.xOffset = ifdefor(source.xOffset, 0);
    source.yOffset = ifdefor(source.yOffset, 0);
    source.xCenter = ifdefor(source.xCenter, source.actualWidth / 2 + source.xOffset);
    source.yCenter = ifdefor(source.yCenter, source.actualHeight / 2 + source.yOffset);
    return source;
}

export function drawAbilityIcon(context, icon, target) {
    if (!icon) return;
    // Don't scale up ability icons.
    var width = Math.min(icon.width, target.width);
    var hPadding = (target.width - width) / 2;
    var height = Math.min(icon.height, target.height);
    var vPadding = (target.height - height) / 2;
    var drawTarget = {'left': target.left + Math.ceil(hPadding), 'top': target.top + Math.ceil(vPadding), width, height};
    if (icon.draw) {
        icon.draw(context, drawTarget);
        return;
    }
    // Default icon style is: {'image': images[icon], 'left': 0, 'top': 0, 'width': 34, 'height': 34};
    drawImage(context, icon.image, icon, drawTarget);
}

export function drawRectangleBackground(context, rectangle) {
    context.save();
    context.beginPath();
    context.globalAlpha = .9;
    context.fillStyle = 'black';
    fillRectangle(context, rectangle);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.beginPath();
    drawRectangle(context, rectangle);
    drawRectangle(context, shrinkRectangle(rectangle, 1));
    context.fill('evenodd');
    context.restore();
}

export function drawTitleRectangle(context, rectangle) {
    context.save();
    context.beginPath();
    context.globalAlpha = .5;
    context.fillStyle = '#999';
    fillRectangle(context, rectangle);
    context.globalAlpha = 1;
    context.beginPath();
    drawRectangle(context, rectangle);
    drawRectangle(context, shrinkRectangle(rectangle, 2));
    context.fill('evenodd');
    context.restore();
}

