import { updateActorFrame } from 'app/actor';
import { getArea } from 'app/adventure';
import { createVariableObject } from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { makeMonster, monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { cutsceneFadeBox } from 'app/dom';
import { updateActorAnimationFrame } from 'app/render/drawActor';
import { drawArea } from 'app/drawArea';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { setActorDestination } from 'app/main';
import { moveActor } from 'app/moveActor';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { DialogueBox } from 'app/ui/DialogueBox';
import { actionDefinitions } from 'app/useSkill';

import { Action, ActionStats, Actor, Area, GameContext, Hero } from 'app/types';


interface Operation {
    update: () => void,
    resolve: () => void,
    done: boolean,
}

export class CutScene {
    area: Area;
    actors: Actor[] = [];
    activeOperations: Operation[] = [];
    previousContext: GameContext;
    cameraPanOperation: Operation;
    fadeOperation: Operation;
    waitForClickOperation: Operation;
    // 0 = no fade, 1 = black screen.
    fadeLevel: number = 0;
    stashedAllies: Actor[];
    stashedEnemies: Actor[];

    setArea(newArea: Area): void {
        this.restoreArea();
        this.area = newArea;
        this.stashedAllies = this.area.allies;
        this.stashedEnemies = this.area.enemies;
        this.area.allies = this.actors;
        this.area.enemies = [];
    }

    restoreArea(): void {
        if (this.area && this.stashedAllies) {
            this.area.allies = this.stashedAllies;
            this.area.enemies = this.stashedEnemies;
            this.area = null;
        }
    }

    setActors(actors: Actor[]): void {
        console.log(actors);
        for (const actor of actors) {
            this.actors.push(actor);
            actor.area = this.area;
            actor.allies = this.area.allies;
            actor.enemies = this.area.enemies;
            // Make sure the actor's frame is setup for the first draw operation.
            this.updateActor(actor);
        }
    }

    async run(): Promise<void> {

    }

    async endScene(): Promise<void> {

    }

    cleanupScene(): void {
        // This will eventually clean up effects and anything else as well.
        for (const actor of this.actors) {
            if (actor.dialogueBox) {
                actor.dialogueBox.remove();
            }
        }
        this.restoreArea();
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


    pause(milliseconds: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), milliseconds);
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
        for (let i = 0; i < this.area.effects.length; i++) {
            const effect = this.area.effects[i];
            effect.update();
            // If the effect was removed from the array already (when a song follows its owner between areas)
            // we need to decrement i to not skip the next effect.
            if (effect !== this.area.effects[i]) {
                i--;
            } else {
                if (this.area.effects[i].done) {
                    this.area.effects.splice(i--, 1);
                }
            }
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
