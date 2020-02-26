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
import { fillRectangle, isPointInRectObject, rectangle, shrinkRectangle } from 'app/utils/index';

let upgradingObject = null;
const upgradeRectangle = rectangle(90, 45, 140, 90);

export function getUpgradeRectangle() {
    return upgradeRectangle;
}

export const upgradeButton = {
    left: 0, top: 0, width: 0, height: 0,
    isVisible() {
        return !!getUpgradingObject();
    },
    render(context, button) {
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
        button.width = metrics.width + 2 * padding;
        button.height = 20 + 2 * padding;
        button.left = upgradeRectangle.left + (upgradeRectangle.width - button.width) / 2;
        button.top = upgradeRectangle.top + (upgradeRectangle.height - button.height) / 2;
        drawTitleRectangle(context, button)
        context.fillStyle = canUpgrade ? 'white' : '#AAA';
        context.fillText('Upgrade to...', button.left + button.width / 2, button.top + button.height / 2);
    },
    helpMethod() {
        const currentTier = upgradingObject.getCurrentTier();
        previewCost(currentTier.upgradeCost);
        return null;
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
export function setUpgradingObject(object) {
    upgradingObject = object;
}
export function getUpgradingObject() {
    return upgradingObject;
}
export function drawUpgradeBox() {
    drawRectangleBackground(mainContext, upgradeRectangle);
    const currentTier = upgradingObject.getCurrentTier();
    const nextTier = upgradingObject.getNextTier();
    drawImage(mainContext, currentTier.source.image, currentTier.source, {'left': upgradeRectangle.left + 5, 'top': upgradeRectangle.top + 2, 'width': 20, 'height': 20});
    drawImage(mainContext, nextTier.source.image, nextTier.source, {'left': upgradeRectangle.left + 5, 'top': upgradeRectangle.top + 35, 'width': 20, 'height': 20});
    mainContext.textAlign = 'left'
    mainContext.textBaseline = 'middle';
    mainContext.fillStyle = 'white';
    setFontSize(mainContext, 10);
    mainContext.fillText(currentTier.name, upgradeRectangle.left + 30, upgradeRectangle.top + 10);
    mainContext.fillText(nextTier.name, upgradeRectangle.left + 30, upgradeRectangle.top + 70);
    mainContext.fillStyle = toolTipColor;
    const state = getState();
    mainContext.fillText(bonusSourceHelpText(currentTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 30, upgradeRectangle.top + 20);
    mainContext.fillText(bonusSourceHelpText(nextTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 30, upgradeRectangle.top + 80);
}

function setFontSize(context, size) {
    context.font = size +"px 'Cormorant SC', Georgia, serif";
}
