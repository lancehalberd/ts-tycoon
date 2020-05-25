import { getState } from 'app/state';

import { cutscenes } from 'app/content/cutscenes';
import { IntroScene } from 'app/content/cutscenes/intro';
import { Mission1Intro } from 'app/content/cutscenes/mission1Intro';
import { Mission1Outro } from 'app/content/cutscenes/mission1Outro';
import { setGuildGateMission } from 'app/content/missions';
import { showContext } from 'app/context';

// This is called when the game is loaded and sets the state of the world to match
// whatever is appropriate for the saved datas current progress.
export function showInitialWorldState() {
    const state = getState();
    // The first two cutscenes are considered a block, so if the second one hasn't played yet,
    // start with the first.
    if (!state.savedState.completedCutscenes[Mission1Intro.key]) {
        cutscenes[IntroScene.key].run();
        /*showContext(state.selectedCharacter.context);
        const db = new DialogueBox();
        db.message = 'Welcome back!';
        db.run(state.selectedCharacter.hero);*/
    } else if (!state.savedState.completedMissions.mission1 || !state.savedState.completedCutscenes[Mission1Outro.key]) {
        setGuildGateMission('mission1');
        showContext('field');
    } else if (!state.savedState.completedMissions.mission2) {
        setGuildGateMission('mission2');
        showContext('field');
    } else {
        setGuildGateMission(null);
        showContext('field');
    }
}
