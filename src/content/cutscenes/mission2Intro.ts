import { getArea } from 'app/adventure';
import { createVariableObject } from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { getSprite } from 'app/content/actors';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { setupMission } from 'app/content/missions';
import { makeMonster, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { actionDefinitions } from 'app/useSkill';

import { Action, ActionStats, Actor, Area, GameContext, Hero } from 'app/types';

export default class Mission2Intro extends Cutscene {
    sprite: Actor;
    hero: Hero;

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
        const character = getState().selectedCharacter;
        setupMission(character, 'mission2');
        this.setArea(getArea('mission2', 'forestClearing'));
        this.area.cameraX = 0;
        this.fadeLevel = 1;
        // Both sprite and the hero start off screen and teleport in.
        this.hero = character.hero;
        this.hero.x = -100;
        this.hero.z = -30;
        this.hero.heading = [1, 0, 0];
        this.sprite = getSprite();
        this.sprite.x = -100;
        this.sprite.z = -20;

        this.setActors([this.hero, this.sprite])

        await this.fadeIn();
        // Show the empty area for a moment
        await this.pause(500);
        // TODO: Add teleport effects for these
        this.hero.x = 60;
        await this.pause(500);
        this.sprite.x = 90;
        this.sprite.heading = [-1, 0, 0];
        await this.pause(500);
        const armorCount = this.getArmorCount();
        if (armorCount < 1) {
            await this.speak(this.sprite, `I think you made a mistake... what happened to your armor?`);
        } else if (armorCount < 4) {
            await this.speak(this.sprite, `I don't think you'll be safe with that equipment.`);
        } else if (armorCount < 6) {
            await this.speak(this.sprite, `You're still missing a few pieces of gear...`);
        } else {
            await this.speak(this.sprite, `Your equipment looks great!`);
            await this.speak(this.sprite, `Still, the bulls are quite strong.`);
        }
        await this.speak(this.sprite, `If you get into trouble, I'm pulling you out.`);
        await this.speak(this.sprite, `You can always return to the guild to rest and get better equipment.`);
    }

    async runEndScript() {
        const hero = this.hero;
        // Explicitly set the correct end state in case the scene was skipped.
        hero.x = 60;
        this.sprite.x = 90;
        this.cleanupScene();
        await this.fadeIn();
        this.restoreArea();
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (hero.area.allies.indexOf(hero) < 0) {
            hero.area.allies.push(hero);
        }
        hero.allies = hero.area.allies;
        hero.enemies = hero.area.enemies;
    }

    // This cutscene will replay each time you start this mission unless you started
    // with a full set of armor.
    shouldSaveSceneCompleted(): boolean {
        return this.getArmorCount() >= 6;
    }
}
