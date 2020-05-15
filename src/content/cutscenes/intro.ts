import { updateActorFrame } from 'app/actor';
import { getArea } from 'app/adventure';
import { makeMonster, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { cutsceneFadeBox } from 'app/dom';
import { updateActorAnimationFrame } from 'app/render/drawActor';
import { drawArea } from 'app/drawArea';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { setActorDestination } from 'app/main';
import { moveActor } from 'app/moveActor';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { DialogueBox } from 'app/ui/DialogueBox';

import { Actor, Area, GameContext, Hero } from 'app/types';

function pause(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
}

interface Operation {
    update: () => void,
    resolve: () => void,
    done: boolean,
}

export class IntroScene {

    static key = 'intro';

    area: Area;

    actors: Actor[];
    guildSpirit: Actor;
    mrX: Actor;
    hero: Hero;

    activeOperations: Operation[] = [];
    previousContext: GameContext;

    cameraPanOperation: Operation;
    fadeOperation: Operation;
    waitForClickOperation: Operation;

    // 0 = no fade, 1 = black screen.
    fadeLevel: number = 0;

    stashedAllies: Actor[];
    stashedEnemies: Actor[];

    async run() {
        getState().cutscene = this;
        this.previousContext = setContext('cutscene');
        this.area = getArea('guild', 'guildYard');
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

        this.mrX = makeMonster(
            this.area,
            monsters.gremlin,
            1,
            [],
            0,
        );
        this.mrX.z = 0;
        this.mrX.x = 50;

        this.hero = getState().selectedCharacter.hero;
        this.hero.x = 30;
        this.hero.z = -30;

        this.actors = [this.guildSpirit, this.mrX, this.hero];
        this.stashedAllies = this.area.allies;
        this.stashedEnemies = this.area.enemies;
        this.area.allies = [];
        this.area.enemies = [];
        for (const actor of this.actors) {
            actor.area = this.area;
            actor.allies = this.area.allies;
            actor.enemies = this.area.enemies;
            this.area.allies.push(actor);
        }

        this.update();

        // This pause is to wait for the black bars to fade in fully before fading the scene in.
        await pause(500);
        await this.fadeIn();
        // We see Guild Spirit standing in front of the guild hall (eventually it will be raking/sweeping the path).
        await pause(500);
        // Camera pans left as Guild Spirit turns to see MrX and hero arriving.
        this.guildSpirit.heading = [-1, 0, 0];
        Promise.all([
            this.moveActor(this.mrX, {x: this.area.width - 160, z: 0}),
            this.moveActor(this.hero, {x: this.area.width - 180, z: -20}),
        ]);
        await this.panCamera(60, 500),
        await pause(500);
        await this.speak(this.guildSpirit, `Lord X, what a pleasant surprise! And who's this you've brought?`);
        await this.speak(this.mrX, `This is ${this.hero.name}, they've volunteered to be your new founding member.`);
        this.guildSpirit.heading = [1, 0, 0];
        await this.speak(this.guildSpirit, `I'd hoped you'd finally given up on this, you know I won't risk opening the guild...`);
        let speechAction = this.speak(this.mrX, `Oh I remember, that's why I've brought this.`);
        await pause(500);
        this.guildSpirit.heading = [-1, 0, 0];
        await Promise.all([
            speechAction,
            this.moveActor(this.mrX, {x: this.area.width - 130, z: 0}),
        ]);
        await this.speak(this.mrX, `It's an official decree from the king revoking the ban on guilds.`);
        await this.speak(this.guildSpirit, `Is this real? Has the monarchy really changed its mind about the guilds?`);

/*
X: "Not really, but they are desperate enough to risk it." (especially with me offering to shore up their financial situation)
G: "Desperate... I'm not sure that is good enough."
F: "Please! The monarchy doesn't speak for all the people. I'm but one of many people without a home to return to now, we need something to keep us going, doesn't what we want count?"
G: "Wait, I can feel it in you. The will of the people, their hopes riding on you, on us."
F: "Their hopes?"
G: "I'm almost scared to say it, but I think this could actually work."
X: "It better because we are running out of time. I'm worried it might already be too late."
G: "Then let's not waste time. Fiona, think of your people, how you intend to serve them and take my hand."
Fiona takes a moment, then takes the offered hand.
G: "I accept the will of you and your people and take you, Fiona, as the founding member of our guild."
Fiona glows, then the guild gate flickers and begins to glow.

X: "Let's get down to business. (approaches guild gate) I've got dozens of refugees at my estate with more coming in each day, but we can't keep them forever. Sprite, if you please." (Sprite appears)
S: "Of course, here is the outpost."
X: "My grandfather helped plan this outpost as a young man before it was abandoned. It's broken down and full of beasts and other... things, but I still hold title to all the lands."
X: "I would like to hire the guild to clear the village of dangers so we can rebuild it for the refugees. In return I will grant you the services of Sprite indefinitely for the management of the guild."
*/
        await pause(1000);
        this.endScene();
    }

    async endScene() {
        const hero = getState().selectedCharacter.hero;
        await this.fadeOut();
        for (const actor of this.actors) {
            if (actor.dialogueBox) {
                actor.dialogueBox.remove();
            }
        }
        this.area.allies = this.stashedAllies;
        this.area.enemies = this.stashedEnemies;
        this.area = hero.area;
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (this.area.allies.indexOf(hero) < 0) {
            this.area.allies.push(hero);
        }
        hero.allies = this.area.allies;
        hero.enemies = this.area.enemies;
        await this.fadeIn();
        setContext(this.previousContext);
        getState().savedState.completedCutscenes[IntroScene.key] = true;
        saveGame();
    }

    handleClick(x: number, y: number): void {
        for (const actor of this.actors) {
            if (actor.dialogueBox) {
                if (!actor.dialogueBox.hiddenTextElement.innerText.length) {
                    actor.dialogueBox.remove();
                } else {
                    actor.dialogueBox.finish();
                }
            }
        }
        if (this.waitForClickOperation) {
            this.waitForClickOperation.resolve();
            this.waitForClickOperation = null;
        }
    }

    fadeIn(): Promise<void> {
        return new Promise(resolve => {
            const operation = {
                cutscene: this,
                done: false,
                resolve,
                update() {
                    this.cutscene.fadeLevel = Math.max(0, this.cutscene.fadeLevel - 0.05);
                    if (this.cutscene.fadeLevel === 0) {
                        this.done = true;
                        resolve();
                    }
                }
            };
            this.fadeOperation = operation;
        });
    }

    fadeOut(): Promise<void> {
        return new Promise(resolve => {
            const operation = {
                cutscene: this,
                done: false,
                resolve,
                update() {
                    this.cutscene.fadeLevel = Math.min(1, this.cutscene.fadeLevel + 0.05);
                    if (this.cutscene.fadeLevel === 1) {
                        this.done = true;
                        resolve();
                    }
                }
            };
            this.fadeOperation = operation;
        });
    }

    panCamera(targetX: number, milliseconds: number): Promise<void> {
        return new Promise(resolve => {
            const operation = {
                area: this.area,
                initialX: this.area.cameraX,
                time: 0,
                done: false,
                resolve,
                update() {
                    this.time += FRAME_LENGTH;
                    // TODO: Change this to a cubic interpolation.
                    this.area.cameraX = Math.round(this.initialX + this.time / milliseconds * (targetX - this.initialX));
                    if (this.time >= milliseconds) {
                        this.area.cameraX = targetX;
                        this.done = true;
                        resolve();
                    }
                }
            };
            this.cameraPanOperation = operation;
        });
    }

    moveActor(actor: Actor, {x, z}, speed: number = 60): Promise<void> {
        // Override the actors speed stat to control how fast they move.
        actor.stats.speed = speed;
        setActorDestination(actor, {
            area: actor.area,
            targetType: 'location',
            x, y: 0, z,
            w: 0, h: 0, d: 0,
        });
        return new Promise(resolve => {
            const operation = {
                done: false,
                resolve,
                update() {
                    if (!actor.isMoving && actor.activity.type !== 'move') {
                        this.done = true;
                        resolve();
                    }
                }
            };
            this.activeOperations.push(operation);
        });
    }

    waitForClick(): Promise<void> {
        return new Promise(resolve => {
            const operation = {
                done: false,
                resolve,
                update() {
                }
            };
            this.waitForClickOperation = operation;
        });
    }

    speak(actor: Actor, message: string): Promise<void> {
        if (actor.dialogueBox) {
            actor.dialogueBox.remove();
        }
        for (const otherActor of this.actors) {
            if (otherActor === actor) {
                continue;
            }
            if (otherActor.dialogueBox) {
                otherActor.dialogueBox.finishAndFade();
            }
        }
        const db = new DialogueBox();
        db.message = message;
        db.duration = 5000;
        db.waitForInput = true;
        db.run(actor);
        return new Promise(resolve => {
            const operation = {
                done: false,
                resolve,
                update() {
                    if (actor.dialogueBox !== db || db.isFinished()) {
                        this.done = true;
                        resolve();
                    }
                }
            };
            this.activeOperations.push(operation);
        });
    }

    update() {
        if (this.cameraPanOperation) {
            this.cameraPanOperation.update();
            if (this.cameraPanOperation.done) {
                this.cameraPanOperation = null;
            }
        }
        if (this.fadeOperation) {
            this.fadeOperation.update();
            if (this.fadeOperation.done) {
                this.fadeOperation = null;
            }
        }
        for (const operation of this.activeOperations) {
            operation.update();
        }
        this.activeOperations = this.activeOperations.filter(operation => !operation.done);
        for (const actor of this.actors) {
            this.updateActor(actor);
        }
    }

    updateActor(actor: Actor) {
        moveActor(actor);
        // This updates the counter used to animate the actor.
        updateActorAnimationFrame(actor);
        // This sets the frame of the actor based on its current state.
        updateActorFrame(actor);
        if (actor.dialogueBox) {
            actor.dialogueBox.update();
        }
    }

    render(context: CanvasRenderingContext2D) {
        if (this.area) {
            drawArea(context, this.area);
        } else {
            context.fillStyle = 'black';
            context.fillRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
        }
        const opacity = `${this.fadeLevel}`;
        if (opacity !== cutsceneFadeBox.style.opacity) {
            cutsceneFadeBox.style.opacity = opacity;
        }
    }
}
