import {
    areaObjectFactories, drawFrameToAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { addFurnitureBonuses, removeFurnitureBonuses } from 'app/content/furniture';
import { setUpgradingObject } from 'app/content/upgradeButton';
import { editingAreaState } from 'app/development/editArea';
import { titleDiv, bodyDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { drawWhiteOutlinedFrame, drawTintedFrame } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, drawFrame, } from 'app/utils/animations';

import {
    Frame, Hero, MenuOption,
    ShortRectangle, UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier
} from 'app/types';
// Technically these should each have their own geometry, but since you can upgrade one to the other, it is simplest
// for now if we just treat them as all having the geometry of the largest version.
const [
    smallBag, largeBag,
    smallBank, largeBank,
    smallChest, largeChest,
    smallSafe, largeSafe,
] = createAnimation('gfx2/objects/coinstash.png', {w: 32, h: 40, content: {x: 6, y: 20, w: 20, h: 20, d: 18}}, {cols: 8}).frames;

interface CoinStashTier extends UpgradeableObjectTier {
    frame: Frame,
}

const coinStashTiers: CoinStashTier[] = [
    {'name': 'Coin Bag', 'bonuses': {'+maxCoins': 500}, 'upgradeCost': 500, frame: smallBag},
    {'name': 'Large Coin Bag', 'bonuses': {'+maxCoins': 4000}, 'upgradeCost': 10000, frame: largeBag},
    {'name': 'Coin Bank', 'bonuses': {'+maxCoins': 30000}, 'upgradeCost': 150000, 'requires': 'workshop', frame: smallBank},
    {'name': 'Large Coin Bank', 'bonuses': {'+maxCoins': 200000}, 'upgradeCost': 1.5e6, 'requires': 'workshop', frame: largeBank},
    {'name': 'Coin Chest', 'bonuses': {'+maxCoins': 1e6}, 'upgradeCost': 10e6, 'requires': 'magicWorkshop', frame: smallChest},
    {'name': 'Fine Coin Chest', 'bonuses': {'+maxCoins': 30e6}, 'upgradeCost': 500e6, 'requires': 'magicWorkshop', frame: largeChest},
    {'name': 'Coin Safe', 'bonuses': {'+maxCoins': 500e6}, 'upgradeCost': 15e9, 'requires': 'magicWorkshop', frame: smallSafe},
    {'name': 'Large Coin Safe', 'bonuses': {'+maxCoins': 10e9}, frame: largeSafe},
];

function drawFlashing(context: CanvasRenderingContext2D, frame: Frame, target: ShortRectangle): void {
    drawTintedFrame(context, {...frame, color: 'white', amount: 0.5 + .2 * Math.sin(Date.now() / 150)}, target);
}

export class CoinStash extends EditableAreaObject implements UpgradeableObject {
    level: number = 1;
    definition: UpgradeableObjectDefinition;

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
        if (this.getNextTier()) {
            setUpgradingObject(this);
        }
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
        return titleDiv(coinStashTier.name) + bodyDiv(parts.join('<br/><br/>'));
    }
    onMouseOut() {
        hidePointsPreview();
    }

    static getEditMenu(object: CoinStash): MenuOption[] {
        return [{
            getLabel: () => 'Level',
            getChildren() {
                return coinStashTiers.map((stashTier: CoinStashTier, index: number): MenuOption => {
                    return {
                        getLabel: () => `${(index + 1)} ${stashTier.name}`,
                        onSelect() {
                            object.definition.level = index + 1;
                            // We also have to set the level directly on the object because
                            // the definition won't override it if it is already higher.
                            if (getState().savedState.unlockedGuildAreas[object.area.key]) {
                                removeFurnitureBonuses(object);
                                object.level = index + 1;
                                addFurnitureBonuses(object, true);
                            } else {
                                object.level = index + 1;
                            }
                        }
                    };
                });
            }
        }]
    }
}
areaObjectFactories.coinStash = CoinStash;
