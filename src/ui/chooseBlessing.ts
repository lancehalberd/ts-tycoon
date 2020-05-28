import { messageCharacter } from 'app/adventure';
import {
    addBonusSourceToObject, removeBonusSourceFromObject,
} from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { gainLevel, readBoardFromData, totalCostForNextLevel } from 'app/character';
import { basicTemplateBoards, complexTemplateBoards } from 'app/content/boards';
import { map } from 'app/content/mapData';
import { setContext } from 'app/context';
import {
    createCanvas, bodyDiv, divider, handleChildEvent,
    toggleElements, query, queryAll, titleDiv,
} from 'app/dom';
import { drawBoardBackground, drawBoardPreview } from 'app/drawBoard';
import { MAX_LEVEL } from 'app/gameConstants';
import { updateAdjacentJewels, updateJewelBonuses } from 'app/jewels';
import { snapBoardToBoard } from 'app/jewelInventory';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { abbreviate } from 'app/utils/formatters';
import { getThetaDistance, rectangle, removeElementFromArray } from 'app/utils/index';
import { getMousePosition } from 'app/utils/mouse';
import { centerShapesInRectangle } from 'app/utils/polygon';
import Random from 'app/utils/Random';

import { BoardData, Character, FixedObject, Hero, LevelData, ShapeData } from 'app/types';

const chooseBlessingElement = query('.js-chooseBlessing');
const chooseBlessingOptionContainer = query('.js-chooseBlessingOptions');
export function showChooseBlessing() {
    chooseBlessingElement.style.display = '';
    chooseBlessingOptionContainer.innerHTML = '';
    for (const boardPreviewChoice of getState().selectedCharacter.boardPreviewChoices) {
        // TODO: size this canvas based on the board preview size.
        const canvas = createCanvas(150, 150);
        /*centerShapesInRectangle(
            boardPreviewChoice.fixed.map(j => j.shape).concat(boardPreviewChoice.spaces),
            rectangle(74, 74, 2, 2)
        );*/
        // TODO: update this each frame to apply the lighting effect
        //drawBoardPreview(canvas.getContext('2d'), [0, 0], boardPreviewChoice, true);
        chooseBlessingOptionContainer.append(canvas);
        // TODO: apply better logic here to support tooltips only over the board preview
        // and possibly different tooltip for the fixed jewel itself.
        canvas.setAttribute('helpText',
            titleDiv('Divine Blessing')
            + bodyDiv(
                'Click on this Jewel Board Augmentation to preview adding it to this hero\'s Jewel Board.'
                + divider
                + 'Confirm the Augmentation to learn the ability and Level Up.'
            )
        );
        canvas.onclick = function () {
            const character = getState().selectedCharacter;
            centerShapesInRectangle(boardPreviewChoice.fixed.map(j => j.shape).concat(boardPreviewChoice.spaces), rectangle(0, 0, character.boardCanvas.width, character.boardCanvas.height));
            snapBoardToBoard(boardPreviewChoice, character.board);
            character.board.boardPreview = boardPreviewChoice;
            // This will show the confirm skill button if this character is selected.
            updateSkillConfirmationButtons();
            setContext('jewel');
        }
            // Remove the preview from the character if we draw it to the adventure screen since they both use the same coordinate variables
            // and displaying it in the adventure screen will mess up the display of it on the character's board. I think this will be okay
            // since they can't look at both screens at once.
            /*character.board.boardPreview = null;
            updateSkillConfirmationButtons();
            centerShapesInRectangle(
                adventureBoardPreview.boardPreview.fixed.map(j => j.shape).concat(adventureBoardPreview.boardPreview.spaces),
                rectangle(adventureBoardPreview.x - adventureBoardPreview.area.cameraX - 5, GROUND_Y - adventureBoardPreview.y -5, 10, 10));
            drawBoardPreview(mainContext, [0, 0], adventureBoardPreview.boardPreview, true);*/

            // IsOver

            /*for (const shape of this.boardPreview.fixed.map(j => j.shape).concat(this.boardPreview.spaces)) {
                if (isPointInPoints([x, y], shape.points)) {
                    return true;
                }
            }
            return false;*/
    }
    renderChooseBlessing();
}

export function renderChooseBlessing() {
    const character = getState().selectedCharacter;
    if (character.context !== 'field') {
        return;
    }
    const boardChoices = character.boardPreviewChoices;
    const canvases = chooseBlessingOptionContainer.querySelectorAll('canvas');
    for (let i = 0; i < boardChoices.length; i++) {
        const boardPreviewChoice = boardChoices[i];
        // TODO: size this canvas based on the board preview size.
        const canvas: HTMLCanvasElement = canvases[i];
        centerShapesInRectangle(
            boardPreviewChoice.fixed.map(j => j.shape).concat(boardPreviewChoice.spaces),
            rectangle(74, 74, 2, 2)
        );
        drawBoardPreview(canvas.getContext('2d'), getMousePosition(canvas), boardPreviewChoice, true);
    }
}


export function updateSkillConfirmationButtons() {
    toggleElements(queryAll('.js-augmentConfirmationButtons'), !!getState().selectedCharacter.board.boardPreview);
}

export function hideChooseBlessing() {
    chooseBlessingElement.style.display = 'none';
    chooseBlessingOptionContainer.innerHTML = '';
}

query('.js-confirmSkill').onclick = function () {
    const character = getState().selectedCharacter;
    const level = map[character.currentLevelKey];
    const skill = character.board.boardPreview.fixed[0].ability;
    character.divinity -= totalCostForNextLevel(character, level);
    character.hero.abilities.push(skill);
    character.hero.unlockedAbilities[skill.key] = true;
    character.board.spaces = character.board.spaces.concat(character.board.boardPreview.spaces);
    character.board.fixed = character.board.fixed.concat(character.board.boardPreview.fixed);
    character.board.boardPreview.fixed.forEach(function (jewel) {
        jewel.confirmed = true;
        removeBonusSourceFromObject(character.hero.variableObject, character.jewelBonuses, false);
        updateAdjacentJewels(jewel);
        updateJewelBonuses(character);
        addBonusSourceToObject(character.hero.variableObject, character.jewelBonuses, true);
    });
    character.board.boardPreview = null;
    drawBoardBackground(character.boardContext, character.board);
    gainLevel(character.hero);
    updateSkillConfirmationButtons();
    saveGame();
    // Let them look at the confirmed position for a moment before going back to the adventure screen.
    setTimeout(function () {
        // This needs to be done before setting context to field, otherwise the positioning of the
        // newly placed board pieces gets messed up by an extra call to `renderChooseBlessing` as
        // the field context briefly sees that the player is still selecting a shrine board augmentation.
        finishShrine(character);
        setContext('field');
    }, 500);
}
query('.js-cancelSkill').onclick = () => setContext('field');

export function activateShrine(this: FixedObject, hero: Hero) {
    const character = hero.character;
    // Don't activate the shrine a second time.
    if (character.activeShrine) return;
    const area = hero.area;
    const level: LevelData = map[character.currentLevelKey];
    if (character.hero.level >= MAX_LEVEL) {
        messageCharacter(character, character.hero.name + ' is already max level');
        return;
    }
    if (character.hero.unlockedAbilities[level.skill]) {
        messageCharacter(character, 'Ability already learned');
        return;
    }
    const divinityNeeded = totalCostForNextLevel(character, level) - character.divinity;
    if (divinityNeeded > 0) {
        messageCharacter(character, 'Still need ' + abbreviate(divinityNeeded) + ' Divinity');
        return;
    }
    // TBD: Make this number depend on the game state so it can be improved over time.
    const boardOptions = 2;
    character.boardPreviewChoices = [];
    for (let i = 0; i < boardOptions; i++) {
        const boardData = getBoardDataForLevel(level);
        const boardPreview = readBoardFromData(boardData, character, abilities[level.skill]);
        character.boardPreviewChoices.push(boardPreview);
        showChooseBlessing();
    }
    character.activeShrine = this;
}

function finishShrine(character: Character) {
    if (character.activeShrine) {
        character.activeShrine.done = true;
        character.activeShrine = null;
    }
    character.boardPreviewChoices = [];
    hideChooseBlessing();
}

function getBoardDataForLevel(level: LevelData): BoardData {
    let safety = 0;
    const levelDegrees = 180 * Math.atan2(level.coords[1], level.coords[0]) / Math.PI;
    // 30 degrees = red leyline, 150 degrees = blue leyline, 270 degrees = green leyline.
    const minLeylineDistance = Math.min(getThetaDistance(30, levelDegrees), getThetaDistance(150, levelDegrees), getThetaDistance(270, levelDegrees));
    // Use basic templates (triangle based) for levels close to primary leylines and complex templates (square based) for levels close to intermediate leylines.
    const templates = ((minLeylineDistance <= 30) ? basicTemplateBoards : complexTemplateBoards).slice();
    // Each shape is worth roughly the number of triangles in it.
    const shapeValues = {'triangle': 1, 'rhombus': 1, 'diamond': 2, 'square': 2, 'trapezoid': 3, 'hexagon': 6};
    // Starts at 2 and gets as high as 7 by level 99.
    const totalValue =  Math.ceil(1 + Math.sqrt(level.level / 3));
    let chosenTemplate = Random.element(templates);
    removeElementFromArray(templates, chosenTemplate, true);
    while (templates.length && chosenTemplate.size <= totalValue && safety++ < 100) {
        chosenTemplate = Random.element(templates);
        removeElementFromArray(templates, chosenTemplate, true);
    }
    if (safety >= 100) console.log("failed first loop");
    if (chosenTemplate.size <= totalValue) {
        throw new Error('No template found for a board of size ' + totalValue);
    }
    let currentSize = chosenTemplate.size;
    let shapesToKeep = chosenTemplate.shapes.slice();
    let removedShapes: ShapeData[] = [];
    // This loop randomly adds and removes shapes until we get to the right value. Since some shapes are worth 2 points, and others worth 1,
    // it may overshoot, but eventually it will hit the target.
    while (currentSize !== totalValue && safety++ < 100) {
        if (currentSize > totalValue) {
            // Get rid of a shape to keep if the board is too large.
            //removedShapes = removedShapes.concat(shapesToKeep.splice(Math.floor(Math.random() * shapesToKeep.length), 1));
            removedShapes.push(Random.removeElement(shapesToKeep));
            currentSize -= shapeValues[removedShapes[removedShapes.length - 1].k]
        } else {
            // Add a shape back in if the board is too small.
            //shapesToKeep = shapesToKeep.concat(removedShapes.splice(Math.floor(Math.random() * removedShapes.length), 1));
            shapesToKeep.push(Random.removeElement(removedShapes));
            currentSize += shapeValues[shapesToKeep[shapesToKeep.length - 1].k]
        }
    }
    if (safety >= 100) console.log("failed second loop");
    // Select one of the removed shapes to be the fixed jewel for the board.
    const fixedShape = Random.element(removedShapes);
    return {'fixed':[fixedShape], 'spaces': shapesToKeep};
}
