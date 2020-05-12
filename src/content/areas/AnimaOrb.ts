import { enterArea } from 'app/adventure';
import {
    areaObjectFactories, drawFrameToAreaTarget,
    getAreaObjectTargetFromDefinition, isPointOverAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { setUpgradingObject } from 'app/content/upgradeButton';
import { editingAreaState } from 'app/development/editArea';
import { titleDiv } from 'app/dom';
import { ADVENTURE_WIDTH, GROUND_Y } from 'app/gameConstants';
import { bonusSourceHelpText } from 'app/helpText';
import { drawWhiteOutlinedFrame, drawTintedFrame, requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r, fillRect, isPointInRect } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectTarget, Exit, Frame, Hero,
    ShortRectangle, UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier,
} from 'app/types';
const guildImage = requireImage('gfx/guildhall.png');

const brokenOrbFrame:Frame = {image: guildImage, x: 240, y: 150, w: 30, h: 30};
const fixedOrbFrame:Frame = {image: guildImage, x: 270, y: 150, w: 30, h: 30};

const animaOrbTiers: UpgradeableObjectTier[] = [
    {'name': 'Cracked Anima Orb', 'bonuses': {'+maxAnima': 100}, 'upgradeCost': {'coins': 1000, 'anima': 50}, frame: brokenOrbFrame},
    {'name': '"Fixed" Anima Orb', 'bonuses': {'+maxAnima': 2500}, 'upgradeCost': {'coins': 10000, 'anima': 5000}, frame: brokenOrbFrame},
    {'name': 'Restored Anima Orb', 'bonuses': {'+maxAnima': 50000}, 'upgradeCost': {'coins': 10e6, 'anima': 250000}, 'requires': 'workshop', frame: fixedOrbFrame},
    {'name': 'Enchanted Anima Orb', 'bonuses': {'+maxAnima': 5e6}, 'upgradeCost': {'coins': 10e9, 'anima': 50e6}, 'requires': 'magicWorkshop', frame: fixedOrbFrame},
    {'name': 'Perfected Anima Orb', 'bonuses': {'+maxAnima': 500e6}, 'requires': 'magicWorkshop', frame: fixedOrbFrame},
];

function drawFlashing(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle): void {
    drawTintedFrame(context, {...frame, color: 'white', amount: 0.5 + .2 * Math.sin(Date.now() / 150)}, target);
}

export class AnimaOrb extends EditableAreaObject implements UpgradeableObject {
    level: number = 1;

    applyDefinition(definition: UpgradeableObjectDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        if (definition.level > this.level) {
            this.level = definition.level;
        }
        return this;
    }

    onInteract(hero: Hero) {
        removePopup();
        setUpgradingObject(this);
    }

    getFrame(): Frame {
        return animaOrbTiers[this.level - 1].frame;
    }

    render(context: CanvasRenderingContext2D) {
        // Draw with white outlines when this is the canvas target.
        const frame = this.getFrame();
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        } else if (animaOrbTiers[this.level - 1].upgradeCost && canAffordCost(animaOrbTiers[this.level - 1].upgradeCost)) {
            draw = drawFlashing;
        }
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, draw, isEditing && isKeyDown(KEY.SHIFT));
    }

    getActiveBonusSources() {
        return [this.getCurrentTier()];
    }
    getCurrentTier() {
        return animaOrbTiers[this.level - 1];
    }
    getNextTier() {
        return animaOrbTiers[this.level];
    }

    helpMethod() {
        const coinStashTier = animaOrbTiers[this.level - 1];
        const parts = [];
        parts.push(bonusSourceHelpText(coinStashTier, getState().selectedCharacter.adventurer));
        if (coinStashTier.upgradeCost) {
            previewCost(coinStashTier.upgradeCost);
            parts.push('Upgrade for ' + costHelpText(coinStashTier.upgradeCost));
        }
        return titleDiv(coinStashTier.name) + parts.join('<br/><br/>');
    }
    onMouseOut() {
        hidePointsPreview();
    }
}
areaObjectFactories.animaOrb = AnimaOrb;
