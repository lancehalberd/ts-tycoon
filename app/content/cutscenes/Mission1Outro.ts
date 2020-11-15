import { getSprite } from 'app/content/actors';
import { cutscenes } from 'app/content/cutscenes';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { getState } from 'app/state';

import { Actor, Hero } from 'app/types';

export default class Mission1Outro extends Cutscene {
    // These actors will already be on the screen during the mission and don't need to be added/moved.
    sprite: Actor;
    hero: Hero;

    async runScript() {
        const character = getState().selectedCharacter;
        this.hero = character.hero;
        this.sprite = getSprite();
        this.setArea(this.hero.area);
        this.fadeLevel = 0;
        this.setActors([this.hero, this.sprite]);

        // The scene continues directly off of whatever area the player is in, which will normally be
        // some zone in the mission where the defeated the last monster.
        // The sprite flies in front of the hero and faces them.
        await this.moveActor(this.sprite, {x: this.hero.x + this.hero.heading[0] * 40, z: this.hero.z});
        this.sprite.heading[0] = -this.hero.heading[0];
        await this.speak(this.sprite, `Great work, that's all of them!`);
        await this.speak(this.sprite, `I'll teleport us back through the Gate now.`);
        await this.pause(500);
        this.sprite.x = -100;
        await this.pause(500);
        this.hero.x = -100;
        await this.pause(500);
    }

    async runEndScript() {
        await this.fadeOut();
        this.cleanupScene();
        this.restoreArea();
    }

    async setupNextScene() {
        cutscenes.mission1Return.run();
    }
}
