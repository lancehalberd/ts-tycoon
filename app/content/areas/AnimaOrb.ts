import {
    areaObjectFactories, drawFrameToAreaTarget, EditableAreaObject,
} from 'app/content/areas';
import { setUpgradingObject } from 'app/ui/upgradeButton';
import { editingAreaState } from 'app/development/editArea';
import { titleDiv, bodyDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import { isKeyDown, KEY } from 'app/keyCommands';
import { canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, getFrame, drawFrame } from 'app/utils/animations';

import {
    Frame, FrameAnimation, FrameDimensions, Hero,
    UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier,
} from 'app/types';

const dimensions: FrameDimensions = {w: 50, h: 50, content: {x: 19, y: 11, w: 11, h: 37, d: 10}};

const [
    brokenPedestal,
    fixedPedestal,
    silverPedestal,
    goldenPedestal,
] = createAnimation('gfx2/objects/pedastalsheet.png', dimensions, {cols: 4}).frames;

const crackedOrb = createAnimation('gfx2/objects/orbsheet.png', dimensions, {cols: 2, duration: 25});
const dullOrb = createAnimation('gfx2/objects/orbsheet.png', dimensions, {x: 2, cols: 2, duration: 25});
const brightOrb = createAnimation('gfx2/objects/orbsheet.png', dimensions, {x: 4, cols: 2, duration: 25});
const perfectOrb = createAnimation('gfx2/objects/orbsheet.png', dimensions, {x: 6, cols: 2, duration: 25});

const smallGlow = createAnimation('gfx2/objects/glowsheet.png', dimensions, {cols: 2, duration: 15});
const mediumGlow = createAnimation('gfx2/objects/glowsheet.png', dimensions, {x: 1, cols: 2, duration: 15});
const bigGlow = createAnimation('gfx2/objects/glowsheet.png', dimensions, {x: 2, cols: 2, duration: 15});
const fullGlow = createAnimation('gfx2/objects/glowsheet.png', dimensions, {x: 3, cols: 2, duration: 15});

interface AnimaOrbTier extends UpgradeableObjectTier {
    orbAnimation: FrameAnimation,
    pedestalFrame: Frame,
}

const animaOrbTiers: AnimaOrbTier[] = [
    {
        name: 'Cracked Anima Orb', bonuses: {'+maxAnima': 100},
        upgradeCost: {coins: 1000, anima: 50},
        orbAnimation: crackedOrb, pedestalFrame: brokenPedestal,
    },
    {
        name: '"Fixed" Anima Orb', bonuses: {'+maxAnima': 2500},
        upgradeCost: {coins: 10000, anima: 5000},
        orbAnimation: crackedOrb, pedestalFrame: fixedPedestal,
    },
    {
        name: 'Restored Anima Orb', bonuses: {'+maxAnima': 50000},
        upgradeCost: {coins: 10e6, anima: 250000}, requires: 'workshop',
        orbAnimation: dullOrb, pedestalFrame: fixedPedestal,
    },
    {
        name: 'Enchanted Anima Orb', bonuses: {'+maxAnima': 5e6},
        upgradeCost: {coins: 10e9, anima: 50e6}, requires: 'magicWorkshop',
        orbAnimation: brightOrb, pedestalFrame: silverPedestal,
    },
    {
        name: 'Perfected Anima Orb', bonuses: {'+maxAnima': 500e6},
        requires: 'magicWorkshop',
        orbAnimation: perfectOrb, pedestalFrame: goldenPedestal,
    },
];

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
        if (this.getNextTier()) {
            setUpgradingObject(this);
        }
    }

    getFrame(): Frame {
        return getFrame(animaOrbTiers[this.level - 1].orbAnimation, this.area.time * 1000);
    }

    render(context: CanvasRenderingContext2D) {
        const tier = this.getCurrentTier();
        const { orbAnimation, pedestalFrame } = tier;
        const orbFrame = getFrame(orbAnimation, this.area.time * 1000);
        const target = this.getAreaTarget();
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, target, {...pedestalFrame, flipped: this.definition.flipped}, drawFrame, isEditing && isKeyDown(KEY.SHIFT));
        drawFrameToAreaTarget(context, target, {...orbFrame, flipped: this.definition.flipped}, drawFrame);

        // We use a static glow frame to indicate the hover state.
        if (getCanvasPopupTarget() === this) {
            drawFrameToAreaTarget(context, target, {...smallGlow.frames[0], flipped: this.definition.flipped}, drawFrame);
            return;
        }

        // Normally the glow animation is determined by how much anima is in the orb and how
        // full it is, but we always show the full glow when an upgrade is available.
        let glowAnimation = null;
        const canUpgrade = tier.upgradeCost && canAffordCost(tier.upgradeCost);
        if (canUpgrade) {
            glowAnimation = fullGlow;
        } else {
            const gameState = getState();
            const anima = gameState.savedState.anima;
            const maxAnima = gameState.guildStats.maxAnima;
            if (anima >= 50e6 && anima >= 0.95 * maxAnima) {
                glowAnimation = fullGlow;
            } else if (anima >= 250000 && anima >= 0.65 * maxAnima) {
                glowAnimation = bigGlow;
            } else if (anima >= 5000 && anima >= 0.35 * maxAnima) {
                glowAnimation = mediumGlow;
            } else if (anima >= 50 && anima >= 0.05 * maxAnima) {
                glowAnimation = smallGlow;
            }
        }
        if (glowAnimation) {
            const glowFrame =  getFrame(glowAnimation, this.area.time * 1000);
            drawFrameToAreaTarget(context, target, {...glowFrame, flipped: this.definition.flipped}, drawFrame);
        }
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
}
areaObjectFactories.animaOrb = AnimaOrb;
