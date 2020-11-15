import _ from 'lodash';

import { updateActorFrame } from 'app/actor';
import { leaveCurrentArea } from 'app/adventure';
import { recomputeStat } from 'app/bonuses';
import { cutscenes } from 'app/content/cutscenes';
import { setContext } from 'app/context';
import { cutsceneFadeBox } from 'app/dom';
import { updateActorAnimationFrame } from 'app/render/drawActor';
import { drawArea } from 'app/drawArea';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { setActorDestination } from 'app/main';
import { moveActor } from 'app/moveActor';
import { drawActionShortcuts } from 'app/render/drawActionShortcuts';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';
import { DialogueBox, MessageBox } from 'app/ui/DialogueBox';
import { updateNPCs } from 'app/content/updateNPCs';

import { Actor, Area, GameContext } from 'app/types';


interface Operation {
    update: () => void,
    resolve: () => void,
    reject: () => void,
    done: boolean,
}

export default class Cutscene {
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
    skipped: boolean = false;
    finished: boolean = false;
    pausedForTutorial: boolean = false;
    messageBox: MessageBox = null;
    isTutorial: boolean = false;

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
            for (const actor of this.area.allies) {
                actor.area = this.area;
                actor.allies = this.area.allies;
                actor.enemies = this.area.enemies;
            }
            for (const actor of this.area.enemies) {
                actor.area = this.area;
                actor.allies = this.area.enemies;
                actor.enemies = this.area.allies;
            }
            this.area = null;
            this.stashedAllies = null;
            this.stashedEnemies = null;
        }
        updateNPCs();
    }

    setActors(actors: Actor[]): void {
        while (this.actors.length) {
            this.actors.pop();
        }
        for (const actor of actors) {
            leaveCurrentArea(actor);
            this.actors.push(actor);
            actor.dialogueBox = null;
            actor.activity = {type: 'none'};
            actor.area = this.area;
            actor.allies = this.area.allies;
            // Cutscenes don't work if actors have enemy targets. We may want to fix this
            // at some point but for now, we set the enemies to be empty for all actors.
            actor.enemies = []; // this.area.enemies;
            // Make sure the actor's frame is setup for the first draw operation.
            this.updateActor(actor);
        }
    }

    async run(): Promise<void> {
        try {
            // Reset all instance variables when we run a script. This is necessary
            // since the cutscenes are singletons that get reused if they are run
            // a second time.
            this.activeOperations = [];
            this.cameraPanOperation = null;
            this.fadeOperation = null;
            this.waitForClickOperation = null;
            this.fadeLevel = 0;
            this.stashedAllies = null;
            this.stashedEnemies = null;
            this.skipped = false;
            this.finished = false;
            this.pausedForTutorial = false;
            this.messageBox = null;
            getState().cutscene = this;
            setContext('cutscene');
            await this.runScript();
            this.endScene();
        } catch (e) {
            if (e && e.message) {
                console.error(e);
            }
        }
    }
    async runScript(): Promise<void> {

    }

    async endScene(): Promise<void> {
        try {
            this.finished = true;
            const cutsceneKey = _.findKey(cutscenes, scene => scene === this);
            if (cutsceneKey && this.shouldSaveSceneCompleted()) {
                getState().savedState.completedCutscenes[cutsceneKey] = true;
                saveGame();
            } else if (!cutsceneKey) {
                console.error('Could not find key for cutscene');
            }
            await this.runEndScript();
            getState().cutscene = null;
            await this.setupNextScene();
        } catch (e) {
            if (e && e.message) {
                console.error(e);
            }
        }
    }
    shouldSaveSceneCompleted(): boolean {
        return true;
    }
    async runEndScript(): Promise<void> {

    }
    async setupNextScene(): Promise<void> {
        setContext('field');
        updateNPCs();
    }

    async skip(): Promise<void> {
        // Cannot skip the final sequence, which transitions to the next context.
        if (this.finished || this.skipped) {
            return;
        }
        this.skipped = true;
        for(const operation of this.activeOperations) {
            operation.reject();
        }
        this.activeOperations = [];
        if (this.cameraPanOperation) {
            this.cameraPanOperation.reject();
            this.cameraPanOperation = null;
        }
        if (this.fadeOperation) {
            this.fadeOperation.reject();
            this.fadeOperation = null;
        }
        if (this.waitForClickOperation) {
            this.waitForClickOperation.reject();
            this.waitForClickOperation = null;
        }
        await this.fadeOut();
        this.endScene();
    }

    throwErrorIfSkipped() {
        if (this.skipped) {
            throw new Error('Cutscene is skipped');
        }
    }

    cleanupScene(): void {
        // This will eventually clean up effects and anything else as well.
        for (const actor of this.actors) {
            if (actor.dialogueBox) {
                actor.dialogueBox.remove();
            }
            // The move action overrides the actor speed setting, so fix it here.
            recomputeStat(actor.variableObject, 'speed');
        }
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
        return new Promise((resolve, reject) => {
            const operation = {
                cutscene: this,
                done: false,
                resolve,
                reject,
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
        return new Promise((resolve, reject) => {
            const operation = {
                cutscene: this,
                done: false,
                resolve,
                reject,
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
        return new Promise((resolve, reject) => {
            const operation = {
                area: this.area,
                initialX: this.area.cameraX,
                time: 0,
                done: false,
                resolve,
                reject,
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
        return new Promise((resolve, reject) => {
            const operation = {
                done: false,
                resolve,
                reject,
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
        return new Promise((resolve, reject) => {
            const operation = {
                done: false,
                resolve,
                reject,
                update() {
                }
            };
            this.waitForClickOperation = operation;
        });
    }

    async waitForMessage(message: string): Promise<void> {
        this.messageBox = new MessageBox();
        this.messageBox.message = message;
        this.messageBox.start(this.area);
        this.messageBox.waitForInput = true;
        await this.waitForClick();
        // If the text is finished, remove the message box and proceed.
        if (this.messageBox.isTextFinished()) {
            this.messageBox.remove();
            this.messageBox = null;
            return;
        }
        // If the text is not finished yet, reveal it all, and then wait.
        this.messageBox.finish();
        await this.waitForClick();
        this.messageBox.remove();
        this.messageBox = null;
    }


    pause(milliseconds: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), milliseconds);
            // Although this doesn't use update, we need to include this
            // so this operation can be skipped.
            this.activeOperations.push({
                done: false,
                resolve,
                reject,
                update() {
                }
            })
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
        return new Promise((resolve, reject) => {
            const operation = {
                done: false,
                resolve,
                reject,
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
        if (this.messageBox) {
            this.messageBox.update();
        }
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
        if (this.pausedForTutorial) {
            return;
        }
        for (const actor of this.actors) {
            this.updateActor(actor);
        }
        if (this.area) {
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
            for (const layer of this.area.layers) {
                for (const object of layer.objects) {
                    object.update?.();
                }
            }
        }
    }

    updateActor(actor: Actor) {
        moveActor(actor, true);
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
        if (this.isTutorial) {
            drawActionShortcuts(context, getState().selectedCharacter);
        }
    }

    handleKeyInput(keyCode: number): void {
        // No default implementation, could add something for skipping cutscene.
    }
}
