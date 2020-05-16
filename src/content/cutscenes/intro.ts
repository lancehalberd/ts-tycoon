import { getArea } from 'app/adventure';
import { createVariableObject } from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { CutScene } from 'app/content/cutscenes/CutScene';
import { Mission1Intro } from 'app/content/cutscenes/mission1Intro';
import { makeMonster, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { actionDefinitions } from 'app/useSkill';

import { Action, ActionStats, Actor, Area, GameContext, Hero } from 'app/types';

export class IntroScene extends CutScene {
    static key = 'intro';

    guildSpirit: Actor;
    ruthven: Actor;
    sprite: Actor;
    hero: Hero;

    async run() {
        getState().cutscene = this;
        setContext('cutscene');
        this.setArea(getArea('guild', 'guildYard'));
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        this.fadeLevel = 1;

        this.guildSpirit = makeMonster(
            this.area,
            monsters.skeleton,
            1,
            [],
            0,
        );
        this.guildSpirit.x = this.area.width - 80;
        this.guildSpirit.z = -20;
        this.guildSpirit.heading = [1, 0, 0];

        this.ruthven = makeMonster(
            this.area,
            monsters.gremlin,
            1,
            [],
            0,
        );
        this.ruthven.z = 0;
        this.ruthven.x = 50;

        this.hero = getState().selectedCharacter.hero;
        this.hero.x = 30;
        this.hero.z = -30;

        this.sprite = makeMonster(
            this.area,
            monsters.bat,
            1,
            [],
            0,
        );
        this.sprite.x = -100;
        this.sprite.z = -20;
        this.sprite.heading = [1, 0, 0];

        this.setActors([this.guildSpirit, this.ruthven, this.hero, this.sprite])

        // This pause is to wait for the black bars to fade in fully before fading the scene in.
        await this.pause(500);
        await this.fadeIn();
        // We see Guild Spirit standing in front of the guild hall (eventually it will be raking/sweeping the path).
        await this.pause(500);
        // Camera pans left as Guild Spirit turns to see ruthven and hero arriving.
        this.guildSpirit.heading = [-1, 0, 0];
        Promise.all([
            this.moveActor(this.ruthven, {x: this.area.width - 160, z: 0}),
            this.moveActor(this.hero, {x: this.area.width - 180, z: -20}),
        ]);
        await this.panCamera(60, 500),
        await this.pause(500);
        await this.speak(this.guildSpirit, `Ashley, what a pleasant surprise! And who's this you've brought?`);
        await this.speak(this.ruthven, `This is ${this.hero.name}, they've volunteered to be your new founding member.`);
        this.guildSpirit.heading = [1, 0, 0];
        await this.speak(this.guildSpirit, `I'd hoped you'd finally given up on this, you know I won't risk opening the guild...`);
        let speechAction = this.speak(this.ruthven, `Oh I remember, that's why I've brought this.`);
        await this.pause(500);
        this.guildSpirit.heading = [-1, 0, 0];
        await Promise.all([
            speechAction,
            this.moveActor(this.ruthven, {x: this.area.width - 130, z: 0}),
        ]);
        await this.speak(this.ruthven, `It's an official decree from the king revoking the ban on guilds.`);
        await this.speak(this.guildSpirit, `Is this real? Has the monarchy finally changed its mind about the guilds?`);
        await this.speak(this.ruthven, `Oh I wouldn't go that far, but they are desperate enough to risk it.`);
        await this.speak(this.guildSpirit, `Desperate... I'm not sure that is good enough.`);
        this.moveActor(this.hero, {x: this.hero.x + 20, z: this.hero.z});
        await this.speak(this.hero, `Please! The monarchy doesn't speak for all the people.`);
        await this.speak(this.hero, `I'm just one of hundreds without a home to return to now.`);
        await this.speak(this.hero, `We need something to keep us going, doesn't what we want count?`);
        await this.speak(this.guildSpirit, `Wait, this feeling...`);
        await this.speak(this.guildSpirit, `The will of your people, their hopes riding on you.`);
        await this.speak(this.hero, `You can feel them?`);
        await this.speak(this.guildSpirit, `I can.`);
        await this.speak(this.guildSpirit, `After all these years, I can hardly believe I'm saying this,`);
        await this.speak(this.guildSpirit, `but I think this can actually work.`);
        await this.speak(this.ruthven, `It better because we're running out of time. I'm worried it might already be too late.`);
        await this.speak(this.guildSpirit, `Then let's not waste time.`);
        await this.speak(this.guildSpirit, `${this.hero.name}, hold that desire to help your people in your heart and take my hand.`);
        await this.pause(1000);
        await this.moveActor(this.hero, {x: this.guildSpirit.x - this.guildSpirit.w - this.hero.w, z: this.guildSpirit.z});
        await this.speak(this.guildSpirit, `I accept the will of you and your people and welcome you as the founding member of this guild.`);
        // Make a fake heal action to cast on the player. Originally I wanted the hero to glow, but this is fine for now.
        const variableObject = createVariableObject(abilities.heal.action, this.guildSpirit.variableObject);
        const heal: Action = {
            actor: this.guildSpirit,
            readyAt: 0,
            variableObject,
            stats: variableObject.stats as ActionStats,
            source: abilities.heal,
            base: abilities.heal.action,
        }
        actionDefinitions.heal.use(this.guildSpirit, heal, this.hero);
        await this.pause(1000);
        this.hero.heading = [-1, 0, 0];
        await this.speak(this.hero, `I feel stronger, yet`);
        this.hero.heading = [1, 0, 0];
        await this.speak(this.hero, `I can sense there is still so much more potential.`);
        await this.speak(this.guildSpirit, `It's going to take a lot of work to rebuild the guild.`);
        await this.speak(this.ruthven, `Then let's get down to business.`);
        let moveAction = this.moveActor(this.ruthven, {x: this.ruthven.x, z: MAX_Z - this.ruthven.d});
        await this.pause(500);
        await Promise.all([
            moveAction,
            this.speak(this.ruthven, `I've got dozens of refugees at my estate with more coming in each day, but we can't keep them forever.`),
        ]);
        await this.speak(this.ruthven, `Sprite, if you please.`),
        this.sprite.x = this.ruthven.x + 60;
        this.sprite.z = this.ruthven.z;
        this.sprite.heading = [-1, 0, 0];
        await this.pause(500);
        await this.speak(this.sprite, `Of course, one moment.`);
        await this.pause(500);
        // TODO: Set the guild portal to mission1 zone.
        await this.speak(this.sprite, `here is the outpost.`),
        await this.speak(this.ruthven, `When my grandfather was young he helped plan this outpost before it was abandoned by the monarchy.`),
        await this.speak(this.ruthven, `It's broken down and full of beasts and other... things, but I still hold title to all the lands.`),
        await this.speak(this.ruthven, `I would like to hire the guild to clear the village of dangers so we can rebuild it for the refugees.`),
        await this.speak(this.ruthven, `In return I will grant you the services of Sprite for the management of the guild.`),
        await this.speak(this.guildSpirit, `I understand.`);
        await this.speak(this.guildSpirit, `${this.hero.name}, if you are ready then, step through the gate to begin your mission.`);
        await this.pause(1000);
        await this.moveActor(this.hero, {x: this.ruthven.x + 30, z: this.ruthven.z});
        // Make the hero "teleport" away. Want to add a teleport effect here eventually.
        this.hero.x = 40;
        await this.pause(500);
        this.endScene();
    }

    async endScene() {
        const hero = getState().selectedCharacter.hero;
        await this.fadeOut();
        this.cleanupScene();
        getState().savedState.completedCutscenes[IntroScene.key] = true;
        saveGame();
        new Mission1Intro().run();
    }
}
