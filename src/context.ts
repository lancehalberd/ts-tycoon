import { enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { guildYardEntrance } from 'app/content/guild';
import { jewelsCanvas, queryAll, toggleElements } from 'app/dom';
import { drawBoardJewels } from 'app/drawBoard';
import { stopDrag } from 'app/inventory';
import { jewelInventoryState, stopJewelDrag } from 'app/jewelInventory';
import { hidePointsPreview } from 'app/points';
import { removePopup, setCanvasPopupTarget } from 'app/popup';
import { getState} from 'app/state';

export function setContext(context) {
    const state = getState();
    if (state.selectedCharacter.context === 'item') {
        stopDrag();
        removePopup();
    }
    if (state.selectedCharacter.context === 'jewel') {
        stopJewelDrag();
        removePopup();
    }
    state.selectedCharacter.context = context;
    // If the player is not already in the guild when we return to the guild context, move them to the foyer.
    if (context === 'guild' && (!state.selectedCharacter.hero.area || !state.selectedCharacter.hero.area.isGuildArea)) {
        enterArea(state.selectedCharacter.hero, guildYardEntrance);
    }
    showContext(context);
}
export function showContext(context) {
    hidePointsPreview();
    hideAreaMenu();
    setCanvasPopupTarget(null);
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    if (context === 'jewel') {
        const state = getState();
        drawBoardJewels(state.selectedCharacter, jewelsCanvas);
    }
    toggleElements(queryAll('.js-adventureContext, .js-jewelContext, .js-itemContext, .js-guildContext, .js-mapContext'), false);
    toggleElements(queryAll(`.js-${context}Context`), true);
}
