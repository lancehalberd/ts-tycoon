import { getAbilityIconSource } from 'app/content/abilities';
import { applyParentToVariableChild, createVariableObject } from 'app/bonuses';
import { editingMapState } from 'app/development/editLevel';
import { bodyDiv, createCanvas, mainCanvas, mainContext, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { drawAbilityIcon, drawImage, requireImage } from 'app/images';
import { getState } from 'app/state';
import { canUseSkillOnTarget, prepareToUseSkillOnTarget } from 'app/useSkill';
import { fillRectangle, isPointInRectObject, rectangle, shrinkRectangle } from 'app/utils/index';

let goldFrame, silverFrame;
let tinyGoldFrame, tinySilverFrame;
let actionShortcuts = {};
const actionKeyCodes = '1234567890'.split('').map(c => c.charCodeAt(0));

function createScaledFrame(r, frame, scale = 1) {
    // We want to scale the frame Nx its normal thickness, but we get bad smoothing if we do
    // this as we stretch pieces, so we stretch the edges at 1x scale, then draw the whole thing scaled
    // up at the very end.
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
            rectangle(12, r.height / scale - 12, r.width / 2 - 24, 12));
    }
    if (r.height > 24 * scale) {
        drawImage(smallContext, frame, rectangle(0, 12, 12, 16),
            rectangle(0, 12, 12, r.height / 2 - 24));
        drawImage(smallContext, frame, rectangle(28, 12, 12, 16),
            rectangle(r.width / 2 - 12, 12, 12, r.height / 2 - 24));
    }
    drawImage(context, smallCanvas, rectangle(0, 0, r.width / scale, r.height / scale), r);
    return canvas;
}
export function drawSkills(actor) {
    var context = mainContext;
    context.font = "10px Arial";
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    var frameSize = 10;
    var size = 40;
    var tinySize = 20;
    var totalSize = size + 2 * frameSize;
    if (!goldFrame) goldFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/goldFrame.png'), 2);
    if (!silverFrame) silverFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/silverFrame.png'), 2);
    if (!tinyGoldFrame) tinyGoldFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/goldFrame.png'));
    if (!tinySilverFrame) tinySilverFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/silverFrame.png'));
    var margin = 20;
    var padding = 2;
    var top = mainCanvas.height - 30 - margin - totalSize; // 30 is the height of the minimap.
    var left = 60 + margin; // 60 pixels to make room for the return to map button.
    actionShortcuts = {};
    var keysLeft = actionKeyCodes.slice();
    for (var action of actor.actions) {
        if (action.tags.basic) continue;
        action.target = rectangle(left, top, totalSize, totalSize);
        action.onClick = onClickSkill;
        var iconSource = getAbilityIconSource(action.ability);
        context.fillStyle = 'white';
        fillRectangle(context, shrinkRectangle(action.target, 2));
        drawAbilityIcon(context, iconSource, shrinkRectangle(action.target, frameSize));
        var frame = silverFrame;
        var tinyFrame = tinySilverFrame;
        if (isSkillActive(action)) {
            frame = goldFrame;
            tinyFrame = tinyGoldFrame;
        }
        var cooldown = action.readyAt - actor.time;
        if (cooldown > 0) {
            var percent = cooldown / action.cooldown;
            context.save();
            context.globalAlpha = .7;
            context.fillStyle = 'black';
            //fillRectangle(context, shrinkRectangle(action.target, totalSize * percent / 2));
            context.beginPath();
            var r = action.target;
            if (percent < 1) context.moveTo(r.left + r.width / 2, r.top + r.height / 2);
            context.arc(r.left + r.width / 2, r.top + r.height / 2, totalSize / 2, -Math.PI / 2 - percent * 2 * Math.PI, -Math.PI / 2);
            if (percent < 1) context.closePath();
            //drawRectangle(context, shrinkRectangle(action.target, frameSize));
            context.fill('evenodd');

            context.restore();
        }
        drawImage(context, frame, rectangle(0, 0, totalSize, totalSize), action.target);
        var actionKeyCode = keysLeft.length ? keysLeft.shift() : null;
        if (actionKeyCode) {
            actionShortcuts[actionKeyCode] = action;
            var tinyTarget = rectangle(
                    action.target.left + action.target.width - frameSize - 6,
                    action.target.top + action.target.height - frameSize - 6, tinySize, tinySize);
            context.fillStyle = 'white';
            fillRectangle(context, shrinkRectangle(tinyTarget, 1));
            drawImage(context, tinyFrame, rectangle(0, 0, tinySize, tinySize), tinyTarget);
            context.fillStyle = 'black';
            context.fillText(String.fromCharCode(actionKeyCode), tinyTarget.left + tinyTarget.width / 2, tinyTarget.top + tinyTarget.height / 2);
            action.shortcutTarget = tinyTarget;
        } else {
            action.shortcutTarget = null;
        }
        // Display the Manual/Auto indicator.
        var tinyTarget = rectangle(action.target.left + frameSize + 6 - tinySize, action.target.top + frameSize + 6 - tinySize, tinySize, tinySize);
        context.fillStyle = 'white';
        fillRectangle(context, shrinkRectangle(tinyTarget, 1));
        context.fillStyle = 'black';
        var letter;
        if (actor.character.autoplay) letter = actor.character.manualActions[action.base.key] ? 'M' : 'A';
        else letter = actor.character.autoActions[action.base.key] ? 'A' : 'M';
        drawImage(context, ((letter === 'M') ? tinySilverFrame : tinyGoldFrame), rectangle(0, 0, tinySize, tinySize), tinyTarget);
        context.fillText(letter, tinyTarget.left + tinyTarget.width / 2, tinyTarget.top + tinyTarget.height / 2);
        if (!action.toggleButton) {
            action.toggleButton = {
                'onClick': onClickAutoToggle,
                action,
                'helpMethod': autoToggleHelpMethod
            };
        }
        action.toggleButton.target = tinyTarget;
        left += totalSize + padding;
    }
}

let selectedAction = null;
let hoverAction = null;
export function getHoverAction() {
    return hoverAction;
}
export function getSelectedAction() {
    return selectedAction;
}
export function setSelectedAction(action) {
    selectedAction = action;
}
function onClickSkill(character, action) {
    activateAction(action);
}

function onClickAutoToggle(character, toggleButton) {
    const action = this.action;
    if (character.autoplay) {
        character.manualActions[action.base.key] = !character.manualActions[action.base.key];
    } else {
        character.autoActions[action.base.key] = !character.autoActions[action.base.key];
    }
}
function autoToggleHelpMethod() {
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

export function getAbilityPopupTarget(x, y) {
    hoverAction = null;
    for (const action of getState().selectedCharacter.adventurer.actions) {
        if (action.tags.basic) continue;
        // toggleButton doesn't get set until the ability is drawn the first time.
        if (isPointInRectObject(x, y, action.toggleButton && action.toggleButton.target)) {
            return action.toggleButton;
        }
        if (isPointInRectObject(x, y, action.target) || isPointInRectObject(x, y, action.shortcutTarget)) {
            hoverAction = action;
            action.helpMethod = actionHelptText;
            return action;
        }
    }
    return null;
}

function actionHelptText(action) {
    var actor = action.actor;
    var actionSource = action.ability.action;
    var actionInstance = createVariableObject(actionSource, actor);
    applyParentToVariableChild(actor, actionInstance);
    return titleDiv(action.ability.name) + bodyDiv(bonusSourceHelpText(actionSource, actor, actionInstance));
}

// Skill is active if it is selected, or if the hero is performing/attempting to perform the skill.
function isSkillActive(action) {
    var hero = getState().selectedCharacter.hero;
    return action == selectedAction
        || action == hero.skillInUse
        || (hero.activity && hero.activity.action == action);
}

export function handleSkillKeyInput(keyCode) {
    var action = actionShortcuts[keyCode];
    if (!action) return false;
    activateAction(action);
    return true;
}

function activateAction(action) {
    if (action.readyAt > action.actor.time) return;
    // If a skill has no target, trigger it as soon as they click the skill button.
    if (action.base.target === 'none' || action.tags.field) {
        if (canUseSkillOnTarget(action.actor, action, action.actor)) {
            prepareToUseSkillOnTarget(action.actor, action, action.actor);
        }
    } else {
        if (selectedAction === action) selectedAction = null;
        else selectedAction = action;
    }
}

