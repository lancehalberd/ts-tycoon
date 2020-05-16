import { getArea } from 'app/adventure';
import { createVariableObject } from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { CutScene } from 'app/content/cutscenes/CutScene';
import { setupMission } from 'app/content/missions';
import { makeMonster, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { actionDefinitions } from 'app/useSkill';

import { Action, ActionStats, Actor, Area, GameContext, Hero } from 'app/types';

export class Mission1Intro extends CutScene {
    static key = 'mission1Intro';

    sprite: Actor;
    hero: Hero;

    async runScript() {
        const character = getState().selectedCharacter;
        getState().cutscene = this;
        setContext('cutscene');
        setupMission(character, 'mission1');
        this.setArea(getArea('mission1', 'villageWest'));
        this.area.cameraX = 0;
        this.fadeLevel = 1;

        this.hero = character.hero;
        this.hero.x = -100;
        this.hero.z = -30;
        this.hero.heading = [1, 0, 0];

        this.sprite = makeMonster(
            this.area,
            monsters.bat,
            1,
            [],
            0,
        );
        this.sprite.x = -100;
        this.sprite.z = -20;
        this.sprite.heading = [-1, 0, 0];

        this.setActors([this.hero, this.sprite])

        await this.fadeIn();
        // Show the empty area for a moment
        await this.pause(500);
        // TODO: Add teleport effects for these
        this.hero.x = 60;
        await this.pause(500);
        this.hero.heading = [1, 0, 0];
        await this.pause(200);
        this.hero.heading = [-1, 0, 0];
        await this.pause(200);
        this.hero.heading = [1, 0, 0];
        await this.pause(500);
        await this.speak(this.hero, `Amazing, I wonder how far that gate can take us?`);
        this.sprite.x = 90;
        await this.pause(500);
        await this.speak(this.sprite, `I'll be coming along as well.`);
        await this.speak(this.sprite, `The power from the guild weakens when you are far away,`);
        await this.speak(this.sprite, `but I can keep the connection strong when I'm with you.`);
        await this.speak(this.sprite, `I can also help you communicate with the guild and keep track of your mission parameters for you.`);
        await this.speak(this.sprite, `For example...`);
        // TODO: Add some effect here like a sonar wave coming out of the Sprite.
        await this.pause(500);
        await this.speak(this.sprite, `I sense there are ${character.mission.totalEnemies} fiends to clear out of this outpost.`);
        await this.speak(this.sprite, `Once you clear them out I'll take you back through the gate to the guild.`);
        this.endScene();
    }

    async runEndScript() {
        const hero = this.hero;
        this.cleanupScene();
        // Explicitly set the correct end state in case the scene was skipped.
        hero.x = 60;
        this.sprite.x = 90;
        await this.fadeIn();
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (hero.area.allies.indexOf(hero) < 0) {
            hero.area.allies.push(hero);
        }
        hero.allies = hero.area.allies;
        hero.enemies = hero.area.enemies;
        getState().savedState.completedCutscenes[Mission1Intro.key] = true;
        saveGame();
        setContext('field');
        getState().cutscene = null;
    }
}
