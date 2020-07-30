import { getArea } from 'app/adventure';
import { getGuildSpirit, getSprite } from 'app/content/actors';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { setContext } from 'app/context';
import { MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';

import { Actor, Hero } from 'app/types';

export default class ShrineQuestTutorial extends Cutscene {
    guildSpirit: Actor;
    sprite: Actor;
    hero: Hero;

    async runScript() {
        const character = getState().selectedCharacter;
        // Guild spirit starts offscreen.
        this.guildSpirit = getGuildSpirit();
        this.guildSpirit.x = -100;
        this.guildSpirit.z = 0;
        // This scene starts with the sprite/hero on the scene, so leave them where they are initially.
        this.sprite = getSprite();
        this.hero = character.hero;
        const guildFoyer = getArea('guild', 'guildFoyer');
        // If we aren't in the correct area (started cutscene using debugger)
        // Just fade out, move the hero/sprite to an appropriate spot in the guild foyer and fade in.
        if (this.hero.area !== guildFoyer) {
            await this.fadeOut();
            this.hero.x = 230;
            this.hero.z = -40;
            this.sprite.x = 240;
            this.sprite.z = -40;
            this.setArea(guildFoyer);
            this.setActors([this.hero, this.sprite, this.guildSpirit]);
            this.area.cameraX = 80;
            await this.fadeIn();
        } else {
            this.setArea(guildFoyer);
            this.setActors([this.hero, this.sprite, this.guildSpirit]);
            await this.moveActor(this.hero, {x: 230, z: -40});
        }
        this.hero.heading[0] = -1;
        this.sprite.heading[0] = -1;
        // Pan the camera back to the entrance as the guild spirit enters.
        await this.panCamera(0, 500);
        this.guildSpirit.x = 30;
        this.guildSpirit.z = 0;
        this.guildSpirit.heading[0] = 1;
        await this.speak(this.guildSpirit, `I see you've cleared the foyer.`);
        await this.moveActor(this.guildSpirit, {x: 90, z: 45});
        await this.speak(this.guildSpirit, `Things have started to fall apart over the years.`);
        await this.speak(this.guildSpirit, `But it looks like everything still works, more or less.`);
        await this.moveActor(this.guildSpirit, {x: 190, z: MAX_Z - this.guildSpirit.d});
        await this.speak(this.guildSpirit, `This is our shrine to Fortuna.`);
        await this.speak(this.guildSpirit, `Try making an offering.`);
}

    async runEndScript() {
        const hero = this.hero;
        this.cleanupScene();
        this.guildSpirit.x = 190;
        this.guildSpirit.z = MAX_Z - this.guildSpirit.d;
        await this.fadeIn();
        this.restoreArea();
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (hero.area.allies.indexOf(hero) < 0) {
            hero.area.allies.push(hero);
        }
        hero.allies = hero.area.allies;
        hero.enemies = hero.area.enemies;
    }
}
