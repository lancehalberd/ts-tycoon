import { enterArea, getArea } from 'app/adventure';
import { getAshleyRuthven, getGuildSpirit, getSprite } from 'app/content/actors';
import { cutscenes } from 'app/content/cutscenes';
import { setGuildGateMission } from 'app/content/missions';
import { updateNPCs } from 'app/content/updateNPCs';
import { showContext } from 'app/context';
import { MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';


// This is called when the game is loaded and sets the state of the world to match
// whatever is appropriate for the saved datas current progress.
export function showInitialWorldState() {
    const state = getState();
    // The first two cutscenes are considered a block, so if the second one hasn't played yet,
    // start with the first.
    if (!state.savedState.completedCutscenes.mission1Intro) {
        cutscenes.intro.run();
        // Don't run updateNPCs after starting a cutscene, otherwise it
        // might mess up the position of characters in the cutscene.
        return;
        /*showContext(state.selectedCharacter.context);
        const db = new DialogueBox();
        db.message = 'Welcome back!';
        db.run(state.selectedCharacter.hero);*/
    } else if (!state.savedState.completedMissions.mission1 || !state.savedState.completedCutscenes.mission1Outro) {
        setGuildGateMission('mission1');
        showContext('field');
    } else if (!state.savedState.completedMissions.mission2) {
        setGuildGateMission('mission2');
        showContext('field');
    } else {
        setGuildGateMission(null);
        showContext('field');
    }
    updateNPCs();
}
