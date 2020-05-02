import { enterArea } from 'app/adventure';
import { hideAreaMenu } from 'app/areaMenu';
import { refreshStatsPanel } from 'app/character';
import { guildYardEntrance } from 'app/content/guild';
import { editingAreaState } from 'app/development/editArea';
import { jewelsCanvas, query, queryAll, toggleElements } from 'app/dom';
import { drawBoardJewels } from 'app/drawBoard';
import { stopDrag } from 'app/inventory';
import { jewelInventoryState, stopJewelDrag } from 'app/jewelInventory';
import { hidePointsPreview } from 'app/points';
import { removePopup, setCanvasPopupTarget } from 'app/popup';
import { getState} from 'app/state';
import { hideChooseBlessing, showChooseBlessing} from 'app/ui/chooseBlessing';

export function setContext(context) {
    // Changing context while editing can cause errors, so prevent it from happening.
    if (editingAreaState.isEditing) {
        return;
    }
    const state = getState();
    if (state.selectedCharacter.context === 'item') {
        refreshStatsPanel(state.selectedCharacter, query('.js-characterColumn .js-stats'));
        query('.js-inventorySlot').style.display = query('.js-inventory .js-item') ? 'none' : '';
        stopDrag();
        removePopup();
    }
    if (state.selectedCharacter.context === 'jewel') {
        refreshStatsPanel(state.selectedCharacter, query('.js-characterColumn .js-stats'));
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
    const state = getState();
    if (context === 'jewel') {
        drawBoardJewels(state.selectedCharacter, jewelsCanvas);
    }
    toggleElements(queryAll('.js-adventureContext, .js-jewelContext, .js-itemContext, .js-guildContext, .js-mapContext'), false);
    toggleElements(queryAll(`.js-${context}Context`), true);
    if (context === 'adventure' && state.selectedCharacter.activeShrine) {
        showChooseBlessing();
    } else {
        hideChooseBlessing();
    }
}
