import { getAbilityIconSource } from 'app/content/abilities';
import { applyParentToVariableChild, createVariableObject } from 'app/bonuses';
import { editingMapState } from 'app/development/editLevel';
import { bodyDiv, createCanvas, mainCanvas, mainContext, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { drawImage, requireImage } from 'app/images';
import { drawAbilityIcon } from 'app/render/drawIcons';
import { getState } from 'app/state';
import { canUseSkillOnTarget, prepareToUseSkillOnTarget } from 'app/useSkill';
import { drawFrame } from 'app/utils/animations';
import { fillRect, fillRectangle, isPointInShortRect, pad, r, rectangle, shrinkRectangle } from 'app/utils/index';

import { Action, Actor, Character, Hero } from 'app/types';
let goldFrame, silverFrame;
let tinyGoldFrame, tinySilverFrame;
let actionShortcuts = {};
const actionKeyCodes = '1234567890'.split('').map(c => c.charCodeAt(0));

function createScaledFrame(r, frame, scale = 1) {
    // We want to scale the frame Nx its normal thickness, but we get bad smoothing if we do
    // this as we stretch pieces, so we stretch the edges at 1x scale, then draw the whole thing scaled
    // up at the very end.
    // Will need to use these if I ever want to make frames smaller than 16x16.
    // Below this size, the corners on the opposite edge overlap the other corners.
    //const cornerHSize = Math.min(12, r.width / scale / 2);
    //const cornerVSize = Math.min(12, r.height / scale / 2);
    const smallCanvas = createCanvas(r.width / scale, r.height / scale);
    const smallContext = smallCanvas.getContext('2d');
    smallContext.imageSmoothingEnabled = false;
    // return bigFrameCanvas;
    const canvas = createCanvas(r.width, r.height);
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    drawImage(smallContext, frame, rectangle(0, 0, 12, 12), rectangle(0, 0, 12, 12));
    drawImage(smallContext, frame, rectangle(28, 0, 12, 12), rectangle(r.width / scale - 12, 0, 12, 12));
    drawImage(smallContext, frame, rectangle(0, 28, 12, 12), rectangle(0, r.height / scale - 12, 12, 12));
    drawImage(smallContext, frame, rectangle(28, 28, 12, 12), rectangle(r.width / scale - 12, r.height / scale - 12, 12, 12));
    if (r.width > 24 * scale) {
        drawImage(smallContext, frame, rectangle(12, 0, 16, 12),
            rectangle(12, 0, r.width / scale - 24, 12));
        drawImage(smallContext, frame, rectangle(12, 28, 16, 12),
            rectangle(12, r.height / scale - 12, r.width / scale - 24, 12));
    }
    if (r.height > 24 * scale) {
        drawImage(smallContext, frame, rectangle(0, 12, 12, 16),
            rectangle(0, 12, 12, r.height / scale - 24));
        drawImage(smallContext, frame, rectangle(28, 12, 12, 16),
            rectangle(r.width / scale - 12, 12, 12, r.height / scale - 24));
    }
    drawImage(context, smallCanvas, rectangle(0, 0, r.width / scale, r.height / scale), r);
    return canvas;
}
export function drawSkills(hero: Hero) {
    const context = mainContext;
    context.font = "10px Arial";
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    const frameSize = 4;
    const interiorSize = 16;
    const tinySize = 16;
    const totalSize = interiorSize + frameSize;
    if (!goldFrame) goldFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/goldFrame.png'), 1);
    if (!silverFrame) silverFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/silverFrame.png'), 1);
    if (!tinyGoldFrame) tinyGoldFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/goldFrame.png'));
    if (!tinySilverFrame) tinySilverFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/silverFrame.png'));
    const margin = 5;
    const padding = 8;
    const top = mainCanvas.height - margin - totalSize; // 30 is the height of the minimap.
    let left = 30 + margin; // 60 pixels to make room for the return to map button.
    actionShortcuts = {};
    const keysLeft = actionKeyCodes.slice();
    for (const action of hero.actions) {
        if (action.variableObject.tags.basic) continue;
        action.target = r(left, top, totalSize, totalSize);
        action.onClick = onClickSkill;
        const iconSource = getAbilityIconSource(action.source);
        context.fillStyle = 'white';
        fillRect(context, pad(action.target, -2));
        drawAbilityIcon(context, iconSource, pad(action.target, -frameSize));
        let frame = silverFrame;
        let tinyFrame = tinySilverFrame;
        if (isSkillActive(action)) {
            frame = goldFrame;
            tinyFrame = tinyGoldFrame;
        }
        const cooldown = action.readyAt - hero.time;
        if (cooldown > 0) {
            const percent = cooldown / action.stats.cooldown;
            context.save();
            context.globalAlpha = .7;
            context.fillStyle = 'black';
            //fillRectangle(context, shrinkRectangle(action.target, totalSize * percent / 2));
            context.beginPath();
            const r = action.target;
            if (percent < 1) context.moveTo(r.x + r.w / 2, r.y + r.h / 2);
            context.arc(r.x + r.w / 2, r.y + r.h / 2, totalSize / 2, -Math.PI / 2 - percent * 2 * Math.PI, -Math.PI / 2);
            if (percent < 1) context.closePath();
            //drawRectangle(context, shrinkRectangle(action.target, frameSize));
            context.fill('evenodd');

            context.restore();
        }
        drawFrame(context, {image: frame, ...r(0, 0, totalSize, totalSize)}, action.target);
        const actionKeyCode = keysLeft.length ? keysLeft.shift() : null;
        if (actionKeyCode) {
            actionShortcuts[actionKeyCode] = action;
            const tinyTarget = r(
                    action.target.x + action.target.w - frameSize - 6,
                    action.target.y + action.target.h - frameSize - 6, tinySize, tinySize);
            context.fillStyle = 'white';
            fillRect(context, pad(tinyTarget, -1));
            drawFrame(context, {image: tinyFrame, ...r(0, 0, tinySize, tinySize)}, tinyTarget);
            context.fillStyle = 'black';
            context.fillText(String.fromCharCode(actionKeyCode), tinyTarget.x + tinyTarget.w / 2, tinyTarget.y + tinyTarget.h / 2);
            action.shortcutTarget = tinyTarget;
        } else {
            action.shortcutTarget = null;
        }
        // Display the Manual/Auto indicator.
        const tinyTarget = r(action.target.x + frameSize + 6 - tinySize, action.target.y + frameSize + 6 - tinySize, tinySize, tinySize);
        context.fillStyle = 'white';
        fillRect(context, pad(tinyTarget, -1));
        context.fillStyle = 'black';
        let letter;
        if (hero.character.autoplay) letter = hero.character.manualActions[action.base.key] ? 'M' : 'A';
        else letter = hero.character.autoActions[action.base.key] ? 'A' : 'M';
        const image = ((letter === 'M') ? tinySilverFrame : tinyGoldFrame);
        drawFrame(context, {image, ...r(0, 0, tinySize, tinySize)}, tinyTarget);
        context.fillText(letter, tinyTarget.x + tinyTarget.w / 2, tinyTarget.y + tinyTarget.h / 2);
        if (!action.toggleButton) {
            action.toggleButton = {
                onClick: onClickAutoToggle,
                action,
                helpMethod: autoToggleHelpMethod
            };
        }
        action.toggleButton.target = tinyTarget;
        left += totalSize + padding;
    }
}

let selectedAction: Action = null;
let hoverAction: Action = null;
export function getHoverAction(): Action {
    return hoverAction;
}
export function getSelectedAction(): Action {
    return selectedAction;
}
export function setSelectedAction(action: Action) {
    selectedAction = action;
}
function onClickSkill(character: Character, action: Action) {
    activateAction(action);
}

function onClickAutoToggle(character: Character) {
    const action = this.action;
    if (character.autoplay) {
        character.manualActions[action.base.key] = !character.manualActions[action.base.key];
    } else {
        character.autoActions[action.base.key] = !character.autoActions[action.base.key];
    }
}
function autoToggleHelpMethod(): string {
    const action = this.action;
    const character = action.actor.character;
    if (character.autoplay) {
        if (character.manualActions[action.base.key]) {
            return 'Manual';
        } else {
            return 'Auto'
        }
    } else {
        if (character.autoActions[action.base.key]) {
            return 'Auto';
        } else {
            return 'Manual'
        }
    }
}

export function getAbilityPopupTarget(x: number, y: number) {
    hoverAction = null;
    for (const action of getState().selectedCharacter.adventurer.actions) {
        if (action.variableObject.tags.basic) continue;
        // toggleButton doesn't get set until the ability is drawn the first time.
        if (action.toggleButton && isPointInShortRect(x, y, action.toggleButton.target)) {
            return action.toggleButton;
        }
        if (
            (action.target && isPointInShortRect(x, y, action.target)) ||
            (action.shortcutTarget && isPointInShortRect(x, y, action.shortcutTarget))
        ) {
            hoverAction = action;
            action.helpMethod = actionHelptText;
            return action;
        }
    }
    return null;
}

function actionHelptText(action: Action): string {
    const actor = action.actor;
    const actionSource = action.source.action;
    const actionInstance = createVariableObject(actionSource, actor.variableObject);
    applyParentToVariableChild(actor.variableObject, actionInstance);
    return titleDiv(action.source.name) + bodyDiv(bonusSourceHelpText(actionSource, actor, actionInstance));
}

// Skill is active if it is selected, or if the hero is performing/attempting to perform the skill.
function isSkillActive(action: Action): boolean {
    const hero = getState().selectedCharacter.hero;
    return action == selectedAction
        || action == hero.skillInUse
        || (hero.activity.type === 'action' && hero.activity.action == action);
}

export function handleSkillKeyInput(keyCode: number): boolean {
    const action = actionShortcuts[keyCode];
    if (!action) return false;
    activateAction(action);
    return true;
}

function activateAction(action: Action) {
    if (action.readyAt > action.actor.time) return;
    // If a skill has no target, trigger it as soon as they click the skill button.
    if (action.base.target === 'none' || action.variableObject.tags.field) {
        if (canUseSkillOnTarget(action.actor, action, action.actor)) {
            prepareToUseSkillOnTarget(action.actor, action, action.actor);
        }
    } else {
        if (selectedAction === action) selectedAction = null;
        else selectedAction = action;
    }
}

