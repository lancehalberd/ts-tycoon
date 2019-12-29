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
const upgradeRectangle = rectangle(250, 150, 300, 180);

export function getUpgradeRectangle() {
    return upgradeRectangle;
}

export const upgradeButton = {
    isVisible() {
        return !!getUpgradingObject();
    },
    render() {
        const currentTier = getUpgradingObject().getCurrentTier();
        const canUpgrade = canAffordCost(currentTier.upgradeCost);
        mainContext.textAlign = 'center'
        mainContext.textBaseline = 'middle';
        setFontSize(mainContext, 18);
        mainContext.strokeStyle = canUpgrade ? 'white' : '#AAA';
        mainContext.lineWidth = 2;
        mainContext.fillStyle = canUpgrade ? '#6C6' : '#CCC';
        const padding = 7;
        const metrics = mainContext.measureText('Upgrade to...');
        this.width = metrics.width + 2 * padding;
        this.height = 20 + 2 * padding;
        this.left = upgradeRectangle.left + (upgradeRectangle.width - this.width) / 2;
        this.top = upgradeRectangle.top + (upgradeRectangle.height - this.height) / 2;
        drawTitleRectangle(mainContext, this)
        mainContext.fillStyle = canUpgrade ? 'white' : '#AAA';
        mainContext.fillText('Upgrade to...', this.left + this.width / 2, this.top + this.height / 2);
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
    drawImage(mainContext, currentTier.source.image, currentTier.source, {'left': upgradeRectangle.left + 10, 'top': upgradeRectangle.top + 6, 'width': 60, 'height': 60});
    drawImage(mainContext, nextTier.source.image, nextTier.source, {'left': upgradeRectangle.left + 10, 'top': upgradeRectangle.top + 105, 'width': 60, 'height': 60});
    mainContext.textAlign = 'left'
    mainContext.textBaseline = 'middle';
    mainContext.fillStyle = 'white';
    setFontSize(mainContext, 18);
    mainContext.fillText(currentTier.name, upgradeRectangle.left + 80, upgradeRectangle.top + 25);
    mainContext.fillText(nextTier.name, upgradeRectangle.left + 80, upgradeRectangle.top + 125);
    mainContext.fillStyle = toolTipColor;
    const state = getState();
    mainContext.fillText(bonusSourceHelpText(currentTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 80, upgradeRectangle.top + 45);
    mainContext.fillText(bonusSourceHelpText(nextTier, state.selectedCharacter.adventurer).replace(/<br ?\/?>/g, "\n"), upgradeRectangle.left + 80, upgradeRectangle.top + 145);
}

function setFontSize(context, size) {
    context.font = size +"px 'Cormorant SC', Georgia, serif";
}
