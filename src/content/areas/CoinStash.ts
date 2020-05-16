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
    ShortRectangle, UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier
} from 'app/types';
const guildImage = requireImage('gfx/guildhall.png');
const chestImage = requireImage('gfx/chest-closed.png');

const potFrame:Frame = {image: guildImage, x: 300, y: 150, w: 30, h: 30, d: 20};
const jarFrame:Frame = {image: guildImage, x: 330, y: 150, w: 30, h: 30, d: 20};
const piggyFrame:Frame = {image: guildImage, x: 300, y: 180, w: 30, h: 30, d: 20};
const chestFrame:Frame = {image: chestImage, x: 0, y: 0, w: 32, h: 32, d: 20};
const safeFrame:Frame = {image: guildImage, x: 330, y: 180, w: 30, h: 30, d: 20};
const magicBagFrame:Frame = {image: guildImage, x: 300, y: 210, w: 30, h: 30, d: 20};

const coinStashTiers: UpgradeableObjectTier[] = [
    {'name': 'Cracked Pot', 'bonuses': {'+maxCoins': 500}, 'upgradeCost': 500, frame: potFrame},
    {'name': 'Large Jar', 'bonuses': {'+maxCoins': 4000}, 'upgradeCost': 10000, frame: jarFrame},
    {'name': 'Piggy Bank', 'bonuses': {'+maxCoins': 30000}, 'upgradeCost': 150000, 'requires': 'workshop', frame: piggyFrame},
    {'name': 'Chest', 'bonuses': {'+maxCoins': 200000}, 'upgradeCost': 1.5e6, 'requires': 'workshop', frame: chestFrame},
    {'name': 'Safe', 'bonuses': {'+maxCoins': 1e6}, 'upgradeCost': 10e6, 'requires': 'magicWorkshop', frame: safeFrame},
    {'name': 'Bag of Holding', 'bonuses': {'+maxCoins': 30e6}, 'upgradeCost': 500e6, 'requires': 'magicWorkshop', frame: magicBagFrame},
    {'name': 'Chest of Holding', 'bonuses': {'+maxCoins': 500e6}, 'upgradeCost': 15e9, 'requires': 'magicWorkshop', frame: chestFrame},
    {'name': 'Safe of Hoarding', 'bonuses': {'+maxCoins': 10e9}, frame: safeFrame},
];

function drawFlashing(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle): void {
    drawTintedFrame(context, {...frame, color: 'white', amount: 0.5 + .2 * Math.sin(Date.now() / 150)}, target);
}

export class CoinStash extends EditableAreaObject implements UpgradeableObject {
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
        return coinStashTiers[this.level - 1].frame;
    }

    render(context: CanvasRenderingContext2D) {
        // Draw with white outlines when this is the canvas target.
        const coinStashTier = coinStashTiers[this.level - 1];
        const frame = this.getFrame();
        let draw = drawFrame;
        if (getCanvasPopupTarget() === this) {
            draw = drawWhiteOutlinedFrame;
        } else if (coinStashTier.upgradeCost && canAffordCost(coinStashTier.upgradeCost)) {
            draw = drawFlashing;
        }
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, draw, isEditing && isKeyDown(KEY.SHIFT));
    }

    getActiveBonusSources() {
        return [this.getCurrentTier()];
    }
    getCurrentTier() {
        return coinStashTiers[this.level - 1];
    }
    getNextTier() {
        return coinStashTiers[this.level];
    }

    helpMethod() {
        const coinStashTier = coinStashTiers[this.level - 1];
        const parts = [];
        parts.push(bonusSourceHelpText(coinStashTier, getState().selectedCharacter.hero));
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
areaObjectFactories.coinStash = CoinStash;
