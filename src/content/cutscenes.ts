import { IntroScene } from 'app/content/cutscenes/intro';
import { Mission1Intro } from 'app/content/cutscenes/mission1Intro';
import { Mission1Outro } from 'app/content/cutscenes/mission1Outro';

export const cutscenes = {};

cutscenes[IntroScene.key] = IntroScene;
cutscenes[Mission1Intro.key] = Mission1Intro;
cutscenes[Mission1Outro.key] = Mission1Outro;
