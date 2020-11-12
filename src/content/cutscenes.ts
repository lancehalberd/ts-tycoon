import Cutscene from 'app/content/cutscenes/Cutscene';
import IntroScene from 'app/content/cutscenes/Intro';
import Mission1Intro from 'app/content/cutscenes/Mission1Intro';
import Mission1Outro from 'app/content/cutscenes/Mission1Outro';
import Mission1Return from 'app/content/cutscenes/Mission1Return';
import Mission2Intro from 'app/content/cutscenes/Mission2Intro';
import Mission2Outro from 'app/content/cutscenes/Mission2Outro';
import Mission2Return from 'app/content/cutscenes/Mission2Return';
import PrologueAbilityTutorial from 'app/content/cutscenes/PrologueAbilityTutorial';
import UnlockedFoyer from 'app/content/cutscenes/UnlockedFoyer';
import ShrineQuestTutorial from 'app/content/cutscenes/ShrineQuestTutorial';

// Scenes are ordered here in the expected order they will be viewed, however,
// some guild scenes + missions scenes may occur in different orders.
export const cutscenes: {[key: string]: Cutscene} = {
    intro: new IntroScene(),
    mission1Intro: new Mission1Intro(),
    mission1Outro: new Mission1Outro(),
    mission1Return: new Mission1Return(),
    unlockedFoyer: new UnlockedFoyer(),
    mission2Intro: new Mission2Intro(),
    mission2Outro: new Mission2Outro(),
    mission2Return: new Mission2Return(),
    prologueAbilityTutorial: new PrologueAbilityTutorial(),
    shrineQuestTutorial: new ShrineQuestTutorial(),
};
window['cutscenes'] = cutscenes;
