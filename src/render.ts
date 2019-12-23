
import { readBoardFromData } from 'app/character';
import { drawTrophyPopups, drawTrophySelection, getChoosingTrophyAltar } from 'app/content/achievements';
import { drawUpgradeBox, getUpgradingObject } from 'app/content/furniture';
import { abilities } from 'app/content/abilities';
import { boards } from 'app/content/boards';
import { editingMapState } from 'app/development/editLevel';
import { jewelsCanvas, mainCanvas, mainContext, previewContext, query } from 'app/dom';
import { drawArea, drawHud } from 'app/drawArea';
import { drawBoardBackground, drawBoardJewels, drawBoardJewelsProper } from 'app/drawBoard';
import { drawMap } from 'app/drawMap';
import { drawSkills } from 'app/drawSkills';
import { drawCraftingCanvas } from 'app/equipmentCrafting';
import { drawImage, requireImage } from 'app/images';
import { isGameInitialized } from 'app/initialize';
import { redrawInventoryJewels } from 'app/jewelInventory';
import { getState } from 'app/state';
import { arrMod, ifdefor, rectangle } from 'app/utils/index';
import { centerShapesInRectangle } from 'app/utils/polygon';

const homeSource = {'image': requireImage('gfx/nielsenIcons.png'), 'left': 32, 'top': 128, 'width': 32, 'height': 32};
export const shrineSource = {'image': requireImage('gfx/militaryIcons.png'), 'left': 102, 'top': 125, 'width': 16, 'height': 16};
export function render() {
    if (!isGameInitialized()) {
        return;
    }
    if (query('.js-jewelInventory').style.display === '') {
        redrawInventoryJewels();
    }
    const state = getState();
    const { editingLevel, testingLevel } = editingMapState;
    const fps = 5;
    const characters = testingLevel ? [state.selectedCharacter] : state.characters;
    for (const character of characters) {
        const hero = character.hero;
        const frame = arrMod(hero.source.walkFrames, Math.floor(Date.now() * fps / 1000));
        character.characterContext.clearRect(0, 0, 40, 20);
        if (state.selectedCharacter === character) {
            previewContext.clearRect(0, 0, 64, 128);
            previewContext.drawImage(hero.personCanvas, frame * 96, 0 , 96, 64, -64, -20, 192, 128);
            character.characterContext.globalAlpha = 1;
        } else {
            character.characterContext.globalAlpha = .5;
        }
        hero.job.iconSource.render(character.characterContext, {'left': 0, 'top': 0, 'width': 20, 'height': 20});
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
}
