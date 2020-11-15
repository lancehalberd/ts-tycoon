import { enterArea, getArea, leaveCurrentArea } from 'app/adventure';
import { getAshleyRuthven, getGuildSpirit } from 'app/content/actors';
import { MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';

import { Actor } from 'app/types';

export function updateNPCs() {
    const state = getState();
    const ruthven = getAshleyRuthven();
    const guildSpirit = getGuildSpirit();
    // Ruthven stands in the guild yard until the end of the second mission, where he leaves to help the refugees.
    if (state.savedState.completedCutscenes.mission2Return) {
        leaveCurrentArea(ruthven);
    } else {
        const guildYard = getArea('guild', 'guildYard');
        enterArea(ruthven, {zoneKey: 'guild', areaKey: 'guildYard', x: guildYard.width - 130, z: MAX_Z - ruthven.d});
        ruthven.heading[0] = 1;
        if (state.savedState.completedMissions.mission1) {
            setDialogue(ruthven, ['Take your time with this one.']);
            ruthven.z = -20;
            ruthven.x = guildYard.width - 170;
        } else {
            setDialogue(ruthven, ['We are counting on you.']);
        }
    }
    // The guild spirit stays in the yard until he moves into the foyer.
    // The cutscene where he moves into the foyer plays when you are in the
    // foyer after completing mission 1 and unlocking the foyer.
    if (state.savedState.completedCutscenes.shrineQuestTutorial) {
        enterArea(guildSpirit, {zoneKey: 'guild', areaKey: 'guildFoyer', x: 190, z: MAX_Z - guildSpirit.d});
        guildSpirit.heading[0] = 1;
        if (state.selectedCharacter.hero.level < 2) {
            setDialogue(guildSpirit, [
                `You should seek the blessing of the Pantheon to get stronger.`,
                `You can use the map to decide which Shrine to approach, choose wisely.`,
            ]);
        } else {
            setDialogue(guildSpirit, [
                `You should be strong enough to clear the guild hall.`,
                `If you are having trouble, seek better gear from Fortuna.`,
                `You can do more Shrine Quests if you run out of coins.`,
            ]);
        }
    } else if (state.savedState.completedCutscenes.unlockedFoyer) {
        enterArea(guildSpirit, {zoneKey: 'guild', areaKey: 'guildFoyer', x: 190, z: MAX_Z - guildSpirit.d});
        guildSpirit.heading[0] = 1;
        if (state.savedState.completedMissions.mission2) {
            setDialogue(guildSpirit, [
                `The coin stashes you find around the guild will let us hold more coins.`,
                `We'll need to find more or upgrade them if we run out of room for coins.`
            ]);
        } else {
            setDialogue(guildSpirit, [`You can keep making offerings to Fortuna as long as you have enough coins.`]);
        }
    } else {
        const guildYard = getArea('guild', 'guildYard');
        enterArea(guildSpirit, {zoneKey: 'guild', areaKey: 'guildYard', x: guildYard.width - 80, z: -20});
        guildSpirit.heading[0] = -1;
        if (state.savedState.completedMissions.mission2) {
            setDialogue(guildSpirit, [`You must clear the foyer of monsters, I have so much to show you.`]);
        } else if (state.savedState.completedMissions.mission1) {
            setDialogue(guildSpirit, [`You'll need to clear the monsters from the foyer to get better gear.`]);
            guildSpirit.z = -40;
        } else {
            setDialogue(guildSpirit, [`I'm looking forward to working with you.`]);
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
