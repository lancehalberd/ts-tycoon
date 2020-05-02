import { addFurnitureBonuses, removeFurnitureBonuses } from 'app/content/furniture';
import { toolTipColor } from 'app/utils/colors';
import { mainCanvas, mainContext, mouseContainer, titleDiv } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';
import {
    drawImage,
    drawOutlinedImage,
    drawRectangleBackground, drawSourceWithOutline,
    drawTintedImage,
    drawTitleRectangle, requireImage
} from 'app/images';
import { attemptToApplyCost, canAffordCost, costHelpText, hidePointsPreview, previewCost } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import { drawFrame } from 'app/utils/animations';
import { fillRectangle, isPointInShortRect, r, shrinkRectangle } from 'app/utils/index';

import { AreaObject, Cost, Frame, UpgradeableObject } from 'app/types';

let upgradingObject: UpgradeableObject = null;
const upgradeRectangle = r(90, 45, 140, 90);

export function getUpgradeRectangle() {
    return upgradeRectangle;
}

export const upgradeButton = {
    x: 0, y: 0, w: 0, h: 0,
    isVisible() {
        return !!getUpgradingObject();
    },
    render(context: CanvasRenderingContext2D) {
        const currentTier = getUpgradingObject().getCurrentTier();
        const canUpgrade = canAffordCost(currentTier.upgradeCost);
        context.textAlign = 'center'
        context.textBaseline = 'middle';
        setFontSize(context, 10);
        context.strokeStyle = canUpgrade ? 'white' : '#AAA';
        context.lineWidth = 2;
        context.fillStyle = canUpgrade ? '#6C6' : '#CCC';
        const padding = 7;
        const metrics = context.measureText('Upgrade to...');
        this.w = metrics.width + 2 * padding;
        this.h = 20 + 2 * padding;
        this.x = upgradeRectangle.x + (upgradeRectangle.w - this.w) / 2;
        this.y = upgradeRectangle.y + (upgradeRectangle.h - this.h) / 2;
        drawTitleRectangle(context, this)
        context.fillStyle = canUpgrade ? 'white' : '#AAA';
        context.fillText('Upgrade to...', this.x + this.w / 2, this.y + this.h / 2);
    },
    helpMethod() {
        const currentTier = upgradingObject.getCurrentTier();
        previewCost(currentTier.upgradeCost);
        return null;
    },
    isPointOver(x, y) {
        return isPointInShortRect(x, y, this);
    },
    onMouseOut() {
        hidePointsPreview();
    },
    onClick() {
        const currentTier = upgradingObject.getCurrentTier();
        if (!attemptToApplyCost(currentTier.upgradeCost)) return;
        removeFurnitureBonuses(upgradingObject, false);
        upgradingObject.level++;
        addFurnitureBonuses(upgradingObject, true);
        const state = getState();
        if (!state.guildAreas[upgradingObject.area.key]) {
            state.guildAreas[upgradingObject.area.key] = upgradingObject.area;
        }
        saveGame();
        upgradingObject = null;
    }
};
export function setUpgradingObject(object: UpgradeableObject) {
    upgradingObject = object;
}
export function getUpgradingObject() {
    return upgradingObject;
}
export function drawUpgradeBox() {
    drawRectangleBackground(mainContext, upgradeRectangle);
    const currentTier = upgradingObject.getCurrentTier();
    const nextTier = upgradingObject.getNextTier();
    drawFrame(mainContext, currentTier.frame, {x: upgradeRectangle.x + 5, y: upgradeRectangle.y + 2, w: 20, h: 20});
    drawFrame(mainContext, nextTier.frame, {x: upgradeRectangle.x + 5, y: upgradeRectangle.y + 35, w: 20, h: 20});
    //drawImage(mainContext, currentTier.source.image, currentTier.source, {'x': upgradeRectangle.x + 5, 'y': upgradeRectangle.y + 2, 'w': 20, 'h': 20});
    //drawImage(mainContext, nextTier.source.image, nextTier.source, {'x': upgradeRectangle.x + 5, 'y': upgradeRectangle.y + 35, 'w': 20, 'h': 20});
    mainContext.textAlign = 'left'
    mainContext.textBaseline = 'middle';
    mainContext.fillStyle = 'white';
    setFontSize(mainContext, 10);
    mainContext.fillText(currentTier.name, upgradeRectangle.x + 30, upgradeRectangle.y + 10);
    mainContext.fillText(nextTier.name, upgradeRectangle.x + 30, upgradeRectangle.y + 70);
    mainContext.fillStyle = toolTipColor;
    const state = getState();
    mainContext.fillText(bonusSourceHelpText(currentTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.x + 30, upgradeRectangle.y + 20);
    mainContext.fillText(bonusSourceHelpText(nextTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.x + 30, upgradeRectangle.y + 80);
}

function setFontSize(context, size) {
    context.font = size +"px 'Cormorant SC', Georgia, serif";
}
