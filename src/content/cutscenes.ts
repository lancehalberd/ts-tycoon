import { Cutscene } from 'app/content/cutscenes/Cutscene';
import { IntroScene } from 'app/content/cutscenes/intro';
import { Mission1Intro } from 'app/content/cutscenes/mission1Intro';
import { Mission1Outro } from 'app/content/cutscenes/mission1Outro';
import { Mission2Intro } from 'app/content/cutscenes/mission2Intro';
import { Mission2Outro } from 'app/content/cutscenes/mission2Outro';
import { UnlockedFoyer } from 'app/content/cutscenes/unlockedFoyer';

export const cutscenes = {
    intro: new IntroScene(),
    mission1Intro: new Mission1Intro(),
    mission1Outro: new Mission1Outro(),
    mission2Intro: new Mission2Intro(),
    mission2Outro: new Mission2Outro(),
    unlockedFoyer: new UnlockedFoyer(),
};
