import { getAbilityIconSource } from 'app/content/abilities';
import { applyParentToVariableChild, createVariableObject } from 'app/bonuses';
import { bodyDiv, createCanvas, mainCanvas, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { drawImage, requireImage } from 'app/images';
import { drawAbilityIcon } from 'app/render/drawIcons';
import { getState } from 'app/state';
import { canUseSkillOnTarget, prepareToUseSkillOnTarget } from 'app/useSkill';
import { drawFrame } from 'app/utils/animations';
import { fillRect, isPointInShortRect, pad, r, rectangle } from 'app/utils/index';

import {
    Action, ActionData, Actor, Character,
    Hero, HUDElement, ShortRectangle, VariableObject,
} from 'app/types';
let goldFrame, silverFrame;
let tinyGoldFrame, tinySilverFrame;
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

const interiorSize = 16;
const tinySize = 16;
const frameSize = 4;
const totalSize = interiorSize + frameSize;

export function updateActionShortcuts(character: Character): void {
    character.actionShortcuts = [];
    const margin = 5;
    const padding = 8;
    const top = mainCanvas.height - margin - totalSize; // 30 is the height of the minimap.
    let left = 10 + margin; // 60 pixels to make room for the return to map button.
    const keysLeft = actionKeyCodes.slice();
    for (const action of character.hero.actions) {
        if (action.variableObject.tags.basic) continue;
        const actionKeyCode = keysLeft.length ? keysLeft.shift() : null;
        const actionShortcut: ActionShortcut = new ActionShortcut(action, actionKeyCode, left, top);
        left += totalSize + padding;
        character.actionShortcuts.push(actionShortcut);
    }
}
export class ActionShortcut implements HUDElement {
    action: Action;
    x: number;
    y: number;
    w: number = totalSize;
    h: number = totalSize;
    keyIndicator: HUDElement & {keyCode?: number, action: Action};
    toggle: HUDElement & {action: Action};
    constructor(action: Action, keyCode: number, x: number, y: number) {
        this.action = action;
        this.x = x;
        this.y = y;
        // Shortcut key indicator.
        this.keyIndicator = {
            keyCode,
            action,
            x: x + totalSize - frameSize - 6,
            y: y + totalSize - frameSize - 6,
            w: tinySize, h: tinySize,
            isPointOver: isPointOverShortRect,
        };
        // Manual/Auto toggle button
        this.toggle = {
            action,
            x: x + frameSize + 6 - tinySize,
            y: y + frameSize + 6 - tinySize,
            w: tinySize, h: tinySize,
            isPointOver: isPointOverShortRect,
            onClick: onClickAutoToggle,
            helpMethod: autoToggleHelpMethod
        }
    }

    helpMethod(): string {
        const actor: Actor = this.action.actor;
        const actionSource: ActionData = this.action.source.action;
        const actionInstance: VariableObject = createVariableObject(actionSource, actor.variableObject);
        applyParentToVariableChild(actor.variableObject, actionInstance);
        return titleDiv(this.action.source.name) + bodyDiv(bonusSourceHelpText(actionSource, actor, actionInstance));
    }

    // We consider the mouse over this shortcut if it is over either the main rectangle
    // or the key indicator rectangle, which may stick out a bit.
    isPointOver(x: number, y: number): boolean {
        return isPointInShortRect(x, y, this) || this.keyIndicator.isPointOver(x, y);
    }

    onClick(): void {
        activateAction(this.action);
    }
}

function isPointOverShortRect(this: ShortRectangle, x: number, y: number): boolean {
    return isPointInShortRect(x, y, this);
}

function createFrames() {
    if (!goldFrame) goldFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/goldFrame.png'), 1);
    if (!silverFrame) silverFrame = createScaledFrame(rectangle(0, 0, totalSize, totalSize), requireImage('gfx/silverFrame.png'), 1);
    if (!tinyGoldFrame) tinyGoldFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/goldFrame.png'));
    if (!tinySilverFrame) tinySilverFrame = createScaledFrame(rectangle(0, 0, tinySize, tinySize), requireImage('gfx/silverFrame.png'));
}

export function drawActionShortcut(context: CanvasRenderingContext2D, actionShortcut: ActionShortcut, hero: Hero) {
    const action = actionShortcut.action;

    const iconSource = getAbilityIconSource(action.source);
    context.fillStyle = 'white';
    fillRect(context, pad(actionShortcut, -2));
    drawAbilityIcon(context, iconSource, pad(actionShortcut, -frameSize));
    let frame = silverFrame;
    let tinyFrame = tinySilverFrame;
    if (isSkillActive(action)) {
        frame = goldFrame;
        tinyFrame = tinyGoldFrame;
    }
    // Display the cooldown as a clock shadow
    const cooldown = action.readyAt - hero.time;
    if (cooldown > 0) {
        const percent = cooldown / action.stats.cooldown;
        context.save();
        context.globalAlpha = .7;
        context.fillStyle = 'black';
        context.beginPath();
        const r = actionShortcut;
        if (percent < 1) context.moveTo(r.x + r.w / 2, r.y + r.h / 2);
        context.arc(r.x + r.w / 2, r.y + r.h / 2, actionShortcut.w / 2, -Math.PI / 2 - percent * 2 * Math.PI, -Math.PI / 2);
        if (percent < 1) context.closePath();
        context.fill('evenodd');

        context.restore();
    }
    // Display the keyboard shortcut indiactor.
    drawFrame(context, {...actionShortcut, image: frame, x: 0, y: 0}, actionShortcut);

    context.fillStyle = 'white';
    fillRect(context, pad(actionShortcut.keyIndicator, -1));
    drawFrame(context, {image: tinyFrame, ...r(0, 0, tinySize, tinySize)}, actionShortcut.keyIndicator);
    context.fillStyle = 'black';
    context.fillText(String.fromCharCode(actionShortcut.keyIndicator.keyCode),
        actionShortcut.keyIndicator.x + actionShortcut.keyIndicator.w / 2,
        actionShortcut.keyIndicator.y + actionShortcut.keyIndicator.h / 2
    );

    // Display the Manual/Auto indicator.
    context.fillStyle = 'white';
    fillRect(context, pad(actionShortcut.toggle, -1));
    context.fillStyle = 'black';
    let letter;
    if (hero.character.autoplay) letter = hero.character.manualActions[action.base.key] ? 'M' : 'A';
    else letter = hero.character.autoActions[action.base.key] ? 'A' : 'M';
    const image = ((letter === 'M') ? tinySilverFrame : tinyGoldFrame);
    drawFrame(context, {...actionShortcut.toggle, image, x: 0, y: 0}, actionShortcut.toggle);
    context.fillText(letter,
        actionShortcut.toggle.x + actionShortcut.toggle.w / 2,
        actionShortcut.toggle.y + actionShortcut.toggle.h / 2
    );

}
export function drawActionShortcuts(context: CanvasRenderingContext2D, character: Character) {
    // Make sure the frames are created
    createFrames();
    const hero = character.hero;
    context.font = "10px Arial";
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    for (const actionShortcut of character.actionShortcuts) {
        drawActionShortcut(context, actionShortcut, hero);
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

function onClickAutoToggle() {
    const action = this.action;
    const character = getState().selectedCharacter;
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

export function getAbilityPopupTarget(x: number, y: number): HUDElement {
    hoverAction = null;
    for (const actionShortcut of getState().selectedCharacter.actionShortcuts) {
        // toggleButton doesn't get set until the ability is drawn the first time.
        if (actionShortcut.toggle.isPointOver(x, y)) {
            return actionShortcut.toggle;
        }
        if (actionShortcut.isPointOver(x, y)) {
            hoverAction = actionShortcut.action;
            return actionShortcut;
        }
    }
    return null;
}

// Skill is active if it is selected, or if the hero is performing/attempting to perform the skill.
function isSkillActive(action: Action): boolean {
    const hero = getState().selectedCharacter.hero;
    return action == selectedAction
        || action == hero.skillInUse
        || (hero.activity.type === 'action' && hero.activity.action == action);
}

export function handleSkillKeyInput(keyCode: number): boolean {
    for (const actionShortcut of getState().selectedCharacter.actionShortcuts) {
        if (actionShortcut.keyIndicator.keyCode === keyCode) {
            activateAction(actionShortcut.action);
            return true;
        }
    }
    return false;
}

export function activateAction(action: Action): void {
    // If this action is currently selected, unselect it.
    if (selectedAction === action) {
        selectedAction = null;
        return;
    }
    if (action.readyAt > action.actor.time) {
        return;
    }
    // If a skill has no target, trigger it as soon as they click the skill button.
    if (action.base.target === 'none' && canUseSkillOnTarget(action.actor, action, action.actor)) {
        prepareToUseSkillOnTarget(action.actor, action, action.actor);
    } else if (action.variableObject.tags.field || action.variableObject.tags.nova) {
        prepareToUseSkillOnTarget(action.actor, action, action.actor);
    } else {
        selectedAction = action;
    }
}

export function clearSelectedAction(): void {
    selectedAction = null;
}

