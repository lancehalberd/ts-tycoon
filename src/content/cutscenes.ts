import { Cutscene } from 'app/content/cutscenes/Cutscene';
import { IntroScene } from 'app/content/cutscenes/intro';
import { Mission1Intro } from 'app/content/cutscenes/mission1Intro';
import { Mission1Outro } from 'app/content/cutscenes/mission1Outro';
import { Mission2Intro } from 'app/content/cutscenes/mission2Intro';

export const cutscenes: {[key: string]: Cutscene } = {};

cutscenes[IntroScene.key] = new IntroScene();
cutscenes[Mission1Intro.key] = new Mission1Intro();
cutscenes[Mission1Outro.key] = new Mission1Outro();
cutscenes[Mission2Intro.key] = new Mission2Intro();
