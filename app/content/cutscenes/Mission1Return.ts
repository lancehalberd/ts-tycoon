import { getArea } from 'app/adventure';
import { getAshleyRuthven, getGuildSpirit, getSprite } from 'app/content/actors';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { setGuildGateMission } from 'app/content/missions';
import { ADVENTURE_WIDTH, MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';

import { Actor, Hero } from 'app/types';

export default class Mission1Return extends Cutscene {
    // The hero and sprite will appear out of the portal at the start of the scene.
    sprite: Actor;
    hero: Hero;
    // These actors are waiting for the hero in the guild yard.
    guildSpirit: Actor;
    ruthven: Actor;

    async runScript() {
        const character = getState().selectedCharacter;
        this.hero = character.hero;
        this.hero.x = -100;
        this.sprite = getSprite();
        this.sprite.x = -100;
        this.fadeLevel = 1;
        this.setArea(getArea('guild', 'guildYard'));
        // The guild spirit remains where they were standing in the intro.
        this.guildSpirit = getGuildSpirit();
        this.guildSpirit.x = this.area.width - 80;
        this.guildSpirit.z = -40;
        this.guildSpirit.heading = [-1, 0, 0];
        // Ruthven is now standing further down the screen.
        this.ruthven = getAshleyRuthven();
        this.ruthven.z = -20;
        this.ruthven.x = this.area.width - 170;
        // Sprite+Hero will emerge from the portal to mission 1
        setGuildGateMission('mission1');
        this.setActors([this.hero, this.sprite, this.ruthven, this.guildSpirit]);
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        await this.fadeIn();
        await this.pause(500);
        const guildGateX = this.area.objectsByKey.guildGate.getAreaTarget().x;
        this.sprite.heading[0] = 1;
        this.sprite.x = guildGateX;
        this.sprite.z = MAX_Z - this.sprite.d;
        await this.moveActor(this.sprite, {x: this.sprite.x + 20, z: this.sprite.z - 20});
        this.sprite.heading[0] = -1;
        await this.pause(500);
        this.hero.heading[0] = -1;
        this.hero.x = guildGateX;
        this.hero.z = MAX_Z - this.hero.d;
        await this.moveActor(this.hero, {x: this.hero.x - 20, z: this.hero.z - 20});
        await this.pause(500);
        await this.speak(this.ruthven, `Done already?`);
        await this.speak(this.hero, `With this new power, it was almost too easy.`);
        await this.speak(this.ruthven, `I'm glad to hear it, I wish I could say the same about my next request.`);
        await this.speak(this.guildSpirit, `Already?`);
        await this.speak(this.ruthven, `My trackers found three bull gremlins in the woods outside the outpost.`);
        await this.speak(this.ruthven, `If we move the refugees through their territory, most won't make it through.`);
        await this.speak(this.hero, `Then I'll clear the way, just like I did with the outpost.`);
        //await this.speak(this.ruthven, `You're going to need better gear if you are going to hunt the bulls,`);
        await this.speak(this.ruthven, `The bulls are extremely aggressive and hardy creatures.`);
        await this.speak(this.ruthven, `Even with the power of the guild, I doubt you'd be a match for one, let alone three.`);
        await this.speak(this.hero, `So what do we do?`);
        await this.pause(500);
        this.hero.heading[0] = 1;
        this.sprite.heading[0] = 1;
        await this.speak(this.guildSpirit, `In the foyer there is a shrine to Fortuna.`);
        await this.speak(this.guildSpirit, `If you give coins as an offering, she will grant you a gift.`);
        await this.speak(this.guildSpirit, `The results are a bit unpredictable but they can also be quite remarkable.`);
        await this.speak(this.hero, `So with these gifts I can defeat the bulls?`);
        await this.speak(this.guildSpirit, `I believe so. However, the guild is full of monsters as well.`);
        await this.speak(this.guildSpirit, `The foyer shouldn't be any trouble, but I would stop there for now.`);
        this.hero.heading[0] = -1;
        this.sprite.heading[0] = -1;
        await this.speak(this.ruthven, `That sounds promising. Clear out the foyer and seek a boon from Fortuna.`);
        await this.speak(this.ruthven, `Rest if you need to, and when you are ready, come back here to start.`);
    }

    async runEndScript() {
        const hero = this.hero;
        // Explicitly set the correct end state in case the scene was skipped.
        if (this.area.key !== 'guildYard') {
            this.setArea(getArea('guild', 'guildYard'));
            hero.area = this.area;
            this.sprite.area = hero.area;
        }
        getState().savedState.completedMissions.mission1 = true;
        setGuildGateMission('mission2');
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        const guildGateX = hero.area.objectsByKey.guildGate.getAreaTarget().x;
        hero.x = guildGateX - 20;
        hero.z = MAX_Z - this.hero.d - 20;
        this.sprite.x = guildGateX + 20;
        this.sprite.z = MAX_Z - this.sprite.d - 20;
        this.cleanupScene();
        // This also calls updateNPCs.
        this.restoreArea();
        await this.fadeIn();
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (hero.area.allies.indexOf(hero) < 0) {
            hero.area.allies.push(hero);
        }
        hero.allies = hero.area.allies;
        hero.enemies = hero.area.enemies;
        // End the current mission.
        hero.character.mission = null;
    }
}
