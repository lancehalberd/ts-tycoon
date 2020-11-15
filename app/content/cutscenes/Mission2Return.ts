import { getArea } from 'app/adventure';
import { getAshleyRuthven, getGuildSpirit, getSprite } from 'app/content/actors';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { setGuildGateMission } from 'app/content/missions';
import { ADVENTURE_WIDTH, MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';

import { Actor, Hero } from 'app/types';

export default class Mission2Return extends Cutscene {
    // These actors will teleport in through the guild gate.
    sprite: Actor;
    hero: Hero;
    // These actors are waiting for the hero in the guild yard.
    guildSpirit: Actor;
    ruthven: Actor;

    getArmorCount() {
        let armorCount = 0;
        if (this.hero.equipment.head) {
            armorCount++;
        }
        if (this.hero.equipment.body) {
            armorCount++;
        }
        if (this.hero.equipment.arms) {
            armorCount++;
        }
        if (this.hero.equipment.legs) {
            armorCount++;
        }
        if (this.hero.equipment.feet) {
            armorCount++;
        }
        if (this.hero.equipment.back) {
            armorCount++;
        }
        if (this.hero.equipment.offhand) {
            armorCount++;
        }
        return armorCount;
    }

    async runScript() {
        this.setArea(getArea('guild', 'guildYard'));
        const character = getState().selectedCharacter;
        this.hero = character.hero;
        this.sprite = getSprite();
        this.sprite.x = -100;
        this.hero.x = -100;
        this.fadeLevel = 1;
        // The guild spirit remains where they were standing in the intro.
        this.guildSpirit = getGuildSpirit();
        this.guildSpirit.x = this.area.width - 80;
        this.guildSpirit.z = -40;
        this.guildSpirit.heading = [-1, 0, 0];
        // Ruthven is pacing back and forth.
        this.ruthven = getAshleyRuthven();
        this.ruthven.z = -20;
        this.ruthven.x = this.area.width - 170;

        setGuildGateMission('mission2');
        this.setActors([this.hero, this.sprite, this.ruthven, this.guildSpirit]);
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        this.fadeIn();
        // Ruthven is pacing anxiously waiting for hero to return.
        await this.moveActor(this.ruthven, {x: this.area.width - 140, z: -20});
        await this.moveActor(this.ruthven, {x: this.area.width - 250, z: -20});
        this.moveActor(this.ruthven, {x: this.area.width - 210, z: -20});
        await this.pause(150);
        // Sprite+Hero appear out of the guild gate
        const guildGateX = this.area.objectsByKey.guildGate.getAreaTarget().x;
        this.sprite.heading[0] = 1;
        this.sprite.x = guildGateX;
        this.sprite.z = MAX_Z - this.sprite.d;
        // Ruthven faces the guild get when Sprite appears.
        await this.moveActor(this.sprite, {x: this.sprite.x + 20, z: this.sprite.z - 20});
        this.sprite.heading[0] = -1;
        await this.pause(500);
        this.hero.heading[0] = -1;
        this.hero.x = guildGateX;
        this.hero.z = MAX_Z - this.hero.d;
        await this.moveActor(this.hero, {x: this.hero.x - 20, z: this.hero.z - 20});
        await this.pause(500);


        await this.speak(this.ruthven, `You're back! I was starting to worry.`);
        if (this.getArmorCount() === 0) {
            await this.speak(this.hero, `It's actually easier to dodge without all that armor weighing me down.`);
        } else if (this.getArmorCount() < 2) {
            await this.speak(this.hero, `They can't hurt what they can't catch.`);
            await this.speak(this.hero, `They may be tough, but they aren't too smart.`);
        } else {
            await this.speak(this.hero, `It would have been pretty dangerous without this new gear.`);
        }
        await this.speak(this.ruthven, `That's great news I can't wait to tell the refugees!`);
        await this.speak(this.hero, `So what's next?`);
        await this.speak(this.ruthven, `I've been thinking about that while you were off hunting.`);
        await this.speak(this.ruthven, `Resettling the refugees is all well and good,`);
        await this.speak(this.ruthven, `but it won't mean anything if people continue to lose their homes.`);
        await this.speak(this.hero, `So send me to help them!`);
        await this.speak(this.ruthven, `I like your attitude, but one person can only accomplish so much.`);
        await this.speak(this.ruthven, `Hearing about our success might motivate others to join our cause.`);
        await this.speak(this.ruthven, `If I come across any promising candidates I'll have Sprite post the details in the Guild.`);

        this.hero.heading[0] = 1;
        if (getState().availableBeds.length < 2) {
            await this.speak(this.guildSpirit, `We're going to need more room before we can recruit more members.`);
            await this.speak(this.guildSpirit, `The guild used to have enough room for many members. Unfortunately...`);
            await this.speak(this.guildSpirit, `Some of the monsters occupying the guild are unnaturally strong.`);
            await this.speak(this.guildSpirit, `There is a guest room just off the main guild hall.`);
            await this.speak(this.guildSpirit, `If we could at least clear out the hall, we would have enough room for a few more members.`);
        } else {
            await this.speak(this.guildSpirit, `With the extra beds in the guest room, taking on new recruits should be no problem.`);
            await this.speak(this.guildSpirit, `We only have room for a few members though, so we need to choose carefully.`);
        }

        this.hero.heading[0] = -1;
        await this.speak(this.ruthven, `I need to set off to help get the refugees resettled.`);
        await this.speak(this.ruthven, `I'll start spreading word about the guild to see if any requests come in.`);
        await this.speak(this.ruthven, `With any luck, we'll be able to prevent the next crisis before it strikes.`);
        await this.speak(this.ruthven, `In the mean time, you need to get stronger so you'll be ready.`);
        await this.speak(this.ruthven, `It's only going to get harder from here on.`);
        // Eventually want Ruthven to wave here before leaving
        this.moveActor(this.ruthven, {x: 0, z: 0});
        // Have the hero+GS wave as ruthven leaves.
        await this.pause(1500);

        // Have the hero face the guild spirit.
        this.hero.heading[0] = 1;
        await this.speak(this.guildSpirit, `There is something in the foyer I want to show you.`);
        if (!getState().savedState.unlockedGuildAreas.guildFoyer) {
            await this.speak(this.guildSpirit, `With your skills it should be no problem to clear the monsters out.`);
        } else {
            await this.moveActor(this.guildSpirit, {x: this.area.width - 20, z: 0});
        }
    }

    async runEndScript() {
        const hero = this.hero;
        // Explicitly set the correct end state in case the scene was skipped.
        if (this.area.key !== 'guildYard') {
            this.setArea(getArea('guild', 'guildYard'));
            hero.area = this.area;
            this.sprite.area = hero.area;
        }
        getState().savedState.completedMissions.mission2 = true;
        setGuildGateMission(null);
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        const guildGateX =  hero.area.objectsByKey.guildGate.getAreaTarget().x;
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
