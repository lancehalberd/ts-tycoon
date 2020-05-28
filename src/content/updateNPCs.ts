import { enterArea, getArea } from 'app/adventure';
import { getAshleyRuthven, getGuildSpirit } from 'app/content/actors';
import { MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';

import { Actor } from 'app/types';

export function updateNPCs() {
    const state = getState();
    const ruthven = getAshleyRuthven();
    const guildSpirit = getGuildSpirit();
    const completedMission2Outro = false;
    // Ruthven stands in the guild yard until the end of the second mission, where he leaves to help the refugees.
    if (!completedMission2Outro) {
        const guildYard = getArea('guild', 'guildYard');
        enterArea(ruthven, {zoneKey: 'guild', areaKey: 'guildYard', x: guildYard.width - 130, z: MAX_Z - ruthven.d});
        ruthven.heading[0] = 1;
        if (!state.savedState.completedMissions.mission1) {
            setDialogue(ruthven, ['We are counting on you.']);
        } else {
            setDialogue(ruthven, ['Take your time with this one.']);
            ruthven.z = -40;
            ruthven.x = guildYard.width - 140;
        }
    }
    // The guild spirit stays in the yard until he moves into the foyer.
    // The cutscene where he moves into the foyer plays when you are in the
    // foyer after completing mission 1 and unlocking the foyer.
    if (!state.savedState.completedCutscenes.unlockedFoyer){
        const guildYard = getArea('guild', 'guildYard');
        enterArea(guildSpirit, {zoneKey: 'guild', areaKey: 'guildYard', x: guildYard.width - 80, z: -20});
        guildSpirit.heading[0] = -1;
        if (!state.savedState.completedMissions.mission1) {
            setDialogue(guildSpirit, [`I'm looking forward to working with you.`]);
        } else {
            setDialogue(guildSpirit, [`You'll need to clear the monsters from the foyer to get better gear.`]);
            guildSpirit.z = -40;
        }
    } else {
        enterArea(guildSpirit, {zoneKey: 'guild', areaKey: 'guildFoyer', x: 190, z: MAX_Z - guildSpirit.d});
        guildSpirit.heading[0] = 1;
        if (!state.savedState.completedMissions.mission2) {
            setDialogue(guildSpirit, [`You can keep making offerings to Fortuna as long as you have enough coins.`]);
        } else {
            setDialogue(guildSpirit, [
                `The coin stashes you find around the guild will let us hold more coins.`,
                `We'll need to find more or upgrade them if we run out of room for coins.`
            ]);
        }
    }
}

function setDialogue(actor: Actor, messages: string[]): void {
    actor.onInteract = () => {
        // Interacting with an actor already speaking advances their dialogue more quickly.
        if (actor.dialogueBox) {
            if (!actor.dialogueBox.hiddenTextElement.innerText.length) {
                actor.dialogueBox.remove();
            } else {
                actor.dialogueBox.finish();
            }
            return;
        }
        if (actor.dialogueMessages?.length) {
            return;
        }
        actor.dialogueMessages = [...messages];
    }
}
