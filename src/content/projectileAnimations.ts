import { createCanvas } from 'app/dom';
import { getTintedImage, images, makeFrames, prepareTintedImage, requireImage} from 'app/images';
import { createAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';


const projectileCanvas = createCanvas(96, 96);

export const projectileAnimations = {
    fireball: createAnimation('gfx/effects/projectiles.png', r(0, 0, 20, 20), {cols: 3, xSpace: 12}),
    wandHealing: createAnimation(projectileCanvas, r(0, 0, 20, 20), {cols: 4, xSpace: 12}),
    throwingAttack: createAnimation(projectileCanvas, r(0, 0, 20, 20), {top: 64}),
    wandAttack: createAnimation(projectileCanvas, r(0, 0, 20, 20), {cols: 4, xSpace: 12, top: 32}),
    bowAttack: createAnimation(projectileCanvas, r(0, 0, 20, 20), {left: 32, top: 64}),
};


// This code draws modified copes of images to the projectile canvas and must run after the images it uses have loaded.
export function initializeProjectileAnimations() {
    const context = projectileCanvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    // Draw the healing attacks for the wand
    prepareTintedImage();
    var tintedRow = getTintedImage(images['gfx/effects/projectiles.png'], 'green', .5, {x: 96, y: 32, w: 96, h: 32});
    context.drawImage(tintedRow, 0, 0, 96, 32, 0, 0, 96, 32);
    context.save();
    context.translate(32 + 10, 10);
    context.rotate(Math.PI / 8);
    context.clearRect(-10, -10, 20, 20);
    context.drawImage(tintedRow, 32, 0, 20, 20, -10, -10, 20, 20);
    context.restore();
    context.save();
    // Draw the regular attacks for the wand.
    prepareTintedImage();
    tintedRow = getTintedImage(images['gfx/effects/projectiles.png'], 'orange', .5, {x: 96, y: 32, w: 96, h: 32});
    context.drawImage(tintedRow, 0, 0, 96, 32, 0, 32, 96, 32);
    context.translate(32 + 10, 32 + 10);
    context.rotate(Math.PI / 8);
    context.clearRect(-10, -10, 20, 20);
    context.drawImage(tintedRow, 32, 0, 20, 20, -10, -10, 20, 20);
    context.restore();
    // Draw the ball for throwing weapon projectiels
    context.drawImage(images['gfx/weapons.png'], 38, 363, 10, 10, 0, 64, 20, 20);
    // Draw an arrow by hand for bow attacks.
    context.fillStyle = 'brown';
    context.fillRect(32, 72, 15, 1);
    context.fillRect(32, 73, 20, 1);
    context.fillStyle = 'white';
    context.fillRect(32, 71, 5, 1);
    context.fillRect(32, 74, 5, 1);
    //$('body').append(projectileCanvas);
}