import { enterArea } from 'app/adventure';
import { updateAdventureButtons } from 'app/adventureButtons';
import { hideAreaMenu } from 'app/areaMenu';
import { refreshStatsPanel } from 'app/character';
import { editingAreaState } from 'app/development/editArea';
import { bookElement, jewelsCanvas, mainContext, query, queryAll, toggleElements } from 'app/dom';
import { drawArea } from 'app/drawArea';
import { drawBoardJewels } from 'app/drawBoard';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT } from 'app/gameConstants';
import { stopDrag } from 'app/inventory';
import { constrainBoard, jewelInventoryState, stopJewelDrag } from 'app/jewelInventory';
import { setVisibleMapLevels } from 'app/map';
import { hidePointsPreview } from 'app/points';
import { removePopup, setCanvasPopupTarget } from 'app/popup';
import { getState, guildYardEntrance } from 'app/state';
import { hideChooseBlessing, showChooseBlessing} from 'app/ui/chooseBlessing';

import { GameContext } from 'app/types';


export function setContext(context: GameContext): GameContext {
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
    if (state.selectedCharacter.context === 'jewel' || state.selectedCharacter.context === 'jewelCrafting') {
        refreshStatsPanel(state.selectedCharacter, query('.js-characterColumn .js-stats'));
        stopJewelDrag();
        removePopup();
    }
    const currentContext = state.selectedCharacter.context;
    if (currentContext !== 'field' && context === 'item' || context === 'jewel' || context === 'jewelCrafting') {
        const area = state.selectedCharacter.hero.area;
        if (area) {
            drawArea(mainContext, area);
        } else {
            mainContext.fillRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
        }
    }
    state.selectedCharacter.context = context;
    // If the player has no area, move them to the guild yard by default.
    if (context === 'field' && !state.selectedCharacter.hero.area) {
        debugger;
        enterArea(state.selectedCharacter.hero, guildYardEntrance);
    }
    showContext(context);
    return currentContext;
}
window['setContext'] = setContext;

export function showContext(context: GameContext): void {
    hidePointsPreview();
    hideAreaMenu();
    setCanvasPopupTarget(null);
    jewelInventoryState.overJewel = null;
    jewelInventoryState.overVertex = null;
    const state = getState();
    if (context === 'jewel' || context === 'jewelCrafting') {
        // Make sure the board is visible in the canvas.
        constrainBoard(state.selectedCharacter.board, jewelsCanvas, state.selectedCharacter.boardContext);
        drawBoardJewels(state.selectedCharacter, jewelsCanvas);
    }
    if (context === 'jewelCrafting') {
        bookElement.style.left = '-480px';
    } else {
        bookElement.style.left = '0';
    }
    // Fade the black bars for the cutscene in/out
    const overlay = document.getElementsByClassName('js-cutsceneOverlay')[0] as HTMLElement;
    // We don't show the cutsene overlay during tutorials.
    const showCutsceneOverlay = context === 'cutscene' && state.cutscene && !state.cutscene.isTutorial;
    overlay.style.opacity = (showCutsceneOverlay ? '1' : '0');
    toggleElements(queryAll('.js-adventureContext, .js-enchantContext, .js-jewelContext, .js-jewelCraftingContext, .js-itemContext, .js-guildContext, .js-mapContext, .js-cutsceneContext'), false);
    toggleElements(queryAll(`.js-${context}Context`), true);
    // Only show the "Skip" button when the overlay is present.
    toggleElements(queryAll(`.js-cutsceneSkipButton`), showCutsceneOverlay);
    if (context === 'map') {
        setVisibleMapLevels();
    }
    if (context === 'field' && state.selectedCharacter.activeShrine) {
        showChooseBlessing();
    } else {
        hideChooseBlessing();
    }
    // This will hide the adventure buttons for except for skill areas. (formerly called 'adventure' context).
    if (context === 'field') {
        updateAdventureButtons();
    }
}
