import { cutscenes } from 'app/content/cutscenes';
import { map } from 'app/content/mapData';
import { setGuildGateMission } from 'app/content/missions';
import { updateNPCs } from 'app/content/updateNPCs';
import { showContext } from 'app/context';
import { getState } from 'app/state';


// This is called when the game is loaded and sets the state of the world to match
// whatever is appropriate for the saved datas current progress.
export function showInitialWorldState() {
    const state = getState();
    // The most recent action the player has completed controls the current state.
    if (state.savedState.completedCutscenes.mission2Return) {
        // Player has viewed the return from mission 2, and there are no further missions yet.
        setGuildGateMission(null);
    } else if (state.savedState.completedMissions.mission2) {
        // Player has completed mission 2, but not finished the return cutscene yet.
        return cutscenes.mission2Return.run();
    } else if (state.savedState.completedCutscenes.mission1Return) {
        // Player has viewed the return from mission 1, but not completed mission 2.
        setGuildGateMission('mission2');
    } else if (state.savedState.completedMissions.mission1) {
        // Player has completed mission 1, but not finished the return cutscene yet.
        return cutscenes.mission1Return.run();
    } else if (state.savedState.completedCutscenes.mission1Intro) {
        // Player has viewed the intro, but not completed mission 1.
        setGuildGateMission('mission1');
    } else {
        // Player hasn't finished the intro yet, just start from the beginning.
        return cutscenes.intro.run();
    }
    showContext('field');
    updateNPCs();
}

type ShrineQuestKey = keyof typeof map;

export function getUnlockedShrineQuests(): Set<ShrineQuestKey> {
    const state = getState()
    const unlockedQuests = new Set<ShrineQuestKey>();
    // For now, we will unlock all quests once the player has completed the last story sequence.
    const unlockAllQuests = state.savedState.completedCutscenes.mission2Outro;
    if (unlockAllQuests) {
        for (const key of Object.keys(map)) {
            unlockedQuests.add(key as ShrineQuestKey);
        }
    }
    return unlockedQuests;
}
