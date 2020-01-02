
import { readBoardFromData } from 'app/character';
import { drawTrophyPopups, drawTrophySelection, getChoosingTrophyAltar } from 'app/content/achievements';
import { drawUpgradeBox, getUpgradingObject } from 'app/content/upgradeButton';
import { abilities } from 'app/content/abilities';
import { boards } from 'app/content/boards';
import { editingMapState } from 'app/development/editLevel';
import { jewelsCanvas, mainCanvas, mainContext, previewContext, query } from 'app/dom';
import { drawArea, drawHud } from 'app/drawArea';
import { drawBoardBackground, drawBoardJewels, drawBoardJewelsProper } from 'app/drawBoard';
import { drawMap } from 'app/drawMap';
import { drawSkills } from 'app/drawSkills';
import { drawCraftingCanvas } from 'app/equipmentCrafting';
import { FRAME_LENGTH } from 'app/gameConstants';
import { drawImage, requireImage } from 'app/images';
import { isGameInitialized } from 'app/initialize';
import { redrawInventoryJewels } from 'app/jewelInventory';
import { getState } from 'app/state';
import { arrMod, ifdefor, rectangle } from 'app/utils/index';
import { centerShapesInRectangle } from 'app/utils/polygon';


import { createAnimation, drawFrame, getFrame } from 'app/utils/animations';
const slashAnimation = createAnimation('gfx2/slash.png', {x: 0, y: 0, w: 64, h: 48}, {rows: 5, frameMap: [1, 2, 3, 4, 1]});

const homeSource = {'image': requireImage('gfx/nielsenIcons.png'), 'left': 32, 'top': 128, 'width': 32, 'height': 32};
export const shrineSource = {'image': requireImage('gfx/militaryIcons.png'), 'left': 102, 'top': 125, 'width': 16, 'height': 16};
export function render() {
    if (!isGameInitialized()) {
        return;
    }
    const state = getState();
    if (state.selectedCharacter.context === 'jewel') {
        redrawInventoryJewels();
    }
    const { editingLevel, testingLevel } = editingMapState;
    const renderfps = 5;
    const characters = testingLevel ? [state.selectedCharacter] : state.characters;
    for (const character of characters) {
        const hero = character.hero;
        const frame = arrMod(hero.source.walkFrames, Math.floor(Date.now() * renderfps / 1000));
        character.characterContext.clearRect(0, 0, 40, 20);
        if (state.selectedCharacter === character) {
            previewContext.clearRect(0, 0, 64, 128);
            previewContext.drawImage(hero.personCanvas, frame * 96, 0 , 96, 64, -64, -20, 192, 128);
            character.characterContext.globalAlpha = 1;
        } else {
            character.characterContext.globalAlpha = .5;
        }
        hero.job.iconSource.render(character.characterContext, {x: 0, y: 0, w: 20, h: 20});
        //const jobSource = hero.job.iconSource;
        //drawImage(character.characterContext, jobSource.image, jobSource, {'left': 0, 'top': 0, 'width': 20, 'height': 20});
        character.characterContext.drawImage(hero.personCanvas, frame * 96, 0 , 96, 64, -20, -18, 96, 64);
        character.characterContext.globalAlpha = 1;
        if (state.selectedCharacter !== character) {
            if (character.isStuckAtShrine) drawImage(character.characterContext, shrineSource.image, shrineSource, rectangle(0, 0, 16, 16));
            else if (!character.adventurer.area) drawImage(character.characterContext, homeSource.image, homeSource, rectangle(0, 0, 16, 16));
        }
    }
    if (state.selectedCharacter.context === 'adventure' || state.selectedCharacter.context === 'guild') {
        if (editingLevel && !testingLevel) {
            drawArea(editingLevel);
            if (editingLevel && editingLevel.board) {
                let board = boards[editingLevel.board];
                board = readBoardFromData(board, state.selectedCharacter, abilities[editingLevel.skill], true);
                centerShapesInRectangle(board.fixed.map(j => j.shape).concat(board.spaces), rectangle(600, 0, 150, 150));
                drawBoardBackground(mainContext, board);
                drawBoardJewelsProper(mainContext, [0, 0], board);
            }
        } else drawArea(state.selectedCharacter.hero.area);
        drawSkills(state.selectedCharacter.hero);
    }
    if (state.selectedCharacter.context === 'map') drawMap();
    if (state.selectedCharacter.context === 'item') drawCraftingCanvas();
    if (state.selectedCharacter.context === 'jewel') drawBoardJewels(state.selectedCharacter, jewelsCanvas);
    if (getChoosingTrophyAltar()) drawTrophySelection();
    if (getUpgradingObject()) drawUpgradeBox();
    if (mainCanvas.style.display === '') {
        drawHud();
    }
    drawTrophyPopups();
   // attackAnimationTest();
}
/*
function attackAnimationTest() {
    time += FRAME_LENGTH;
    const frameDuration = Math.round(1000 / fps / FRAME_LENGTH);
    const slashFrame = getFrame(slashAnimation, time);
    const attackDuration = 1000 / aps;
    if (!nextAttack || nextAttack > time + attackDuration || nextAttack <= time) {
        nextAttack = time + attackDuration;
    }
    // The animation of the attack itself cannot be slower than the fps, so we just pad with idle frames between
    const attackAnimationDuration = Math.min(slashAnimation.frames.length * frameDuration * FRAME_LENGTH, attackDuration);
    const attackAnimationStartTime = nextAttack - attackAnimationDuration;
    const frameTime = Math.floor(time / frameDuration / FRAME_LENGTH) * frameDuration * FRAME_LENGTH;
    let p = (frameTime - attackAnimationStartTime) / attackAnimationDuration;
    let frameIndex = p <= 0 ? 0 : Math.floor(p * slashAnimation.frames.length);
    // console.log(frameIndex, frameDuration, frameTime, p);
    let frame = slashAnimation.frames[frameIndex];

    drawFrame(mainContext, frame, {x: 100, y: 100, w: 2 * frame.w, h: 2 * frame.h});


    p = (time - attackAnimationStartTime) / attackAnimationDuration;
    frameIndex = p <= 0 ? 0 : Math.floor(p * slashAnimation.frames.length);
    // console.log(frameIndex, frameDuration, frameTime, p);
    frame = slashAnimation.frames[frameIndex];
    drawFrame(mainContext, frame, {x: 300, y: 100, w: 2 * frame.w, h: 2 * frame.h});

    const individualFrameTime = attackAnimationDuration / slashAnimation.frames.length;
    let lastShownFrameTime = frameTime;
    let alpha = 1, count = 0;
    while (lastShownFrameTime - individualFrameTime > frameTime - frameDuration * FRAME_LENGTH && count < 3) {
        alpha *= 0.5;
        count++;
        lastShownFrameTime -= individualFrameTime;
    }
    mainContext.save();
    for (let i = 0; i <= count; i++) {
        frame = arrMod(slashAnimation.frames, frameIndex - count + i);
        mainContext.globalAlpha = alpha;
        alpha *= 1.5;
        drawFrame(mainContext, frame, {x: 500, y: 100, w: 2 * frame.w, h: 2 * frame.h});
    }
    mainContext.restore();
}
let time = 0;
let nextAttack = 0;

const fpsSlider = document.getElementById('fpsSlider') as HTMLInputElement;
const fpsValue = document.getElementById('fps');
let fps = +fpsSlider.value;

fpsSlider.oninput = function () {
    fps = +fpsSlider.value;
    fpsValue.innerText = '' + fps;
}

const apsSlider = document.getElementById('apsSlider') as HTMLInputElement;
const apsValue = document.getElementById('aps');
let aps = +apsSlider.value;

apsSlider.oninput = function () {
    aps = +apsSlider.value;
    apsValue.innerText = '' + aps;
}*/
