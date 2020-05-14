import { getArea } from 'app/adventure';
import { setContext } from 'app/context';
import { cutsceneFadeBox } from 'app/dom';
import { drawArea } from 'app/drawArea';
import { ADVENTURE_WIDTH, ADVENTURE_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { getState } from 'app/state';
import { saveGame } from 'app/saveGame';

import { Area, GameContext } from 'app/types';

function pause(milliseconds: number): Promise<void> {
    return new Promise((accept) => {
        setTimeout(() => accept(), milliseconds);
    });
}

interface Operation {
    update: () => void,
    done: boolean,
}

export class IntroScene {

    static key = 'intro';

    area: Area;

    activeOperations: Operation[] = [];
    previousContext: GameContext;

    cameraPanOperation: Operation;
    fadeOperation: Operation;

    // 0 = no fade, 1 = black screen.
    fadeLevel: number = 0;

    async run() {
        getState().cutscene = this;
        this.previousContext = setContext('cutscene');
        this.area = getArea('guild', 'guildYard');
        this.area.cameraX = this.area.width - ADVENTURE_WIDTH;
        this.fadeLevel = 1;
        // This pause is to wait for the black bars to fade in fully before fading the scene in.
        await pause(500);
        await this.fadeIn();
        await pause(1000);
        await this.panCamera(0, 1000);
        await pause(500);
        await this.panCamera(this.area.width - ADVENTURE_WIDTH, 500);
        await pause(500);
        this.endScene();
    }

    async endScene() {
        await this.fadeOut();
        this.area = getState().selectedCharacter.hero.area;
        await this.fadeIn();
        setContext(this.previousContext);
        getState().savedState.completedCutscenes[IntroScene.key] = true;
        saveGame();
    }

    async fadeIn(): Promise<void> {
        return new Promise(accept => {
            const operation = {
                cutscene: this,
                done: false,
                update() {
                    this.cutscene.fadeLevel = Math.max(0, this.cutscene.fadeLevel - 0.05);
                    if (this.cutscene.fadeLevel === 0) {
                        this.done = true;
                        accept();
                    }
                }
            };
            this.fadeOperation = operation;
        });
    }

    async fadeOut(): Promise<void> {
        return new Promise(accept => {
            const operation = {
                cutscene: this,
                done: false,
                update() {
                    this.cutscene.fadeLevel = Math.min(1, this.cutscene.fadeLevel + 0.05);
                    if (this.cutscene.fadeLevel === 1) {
                        this.done = true;
                        accept();
                    }
                }
            };
            this.fadeOperation = operation;
        });
    }

    async panCamera(targetX: number, milliseconds: number): Promise<void> {
        return new Promise(accept => {
            const operation = {
                area: this.area,
                initialX: this.area.cameraX,
                time: 0,
                done: false,
                update() {
                    this.time += FRAME_LENGTH;
                    // TODO: Change this to a cubic interpolation.
                    this.area.cameraX = Math.round(this.initialX + this.time / milliseconds * (targetX - this.initialX));
                    if (this.time >= milliseconds) {
                        this.area.cameraX = targetX;
                        this.done = true;
                        accept();
                    }
                }
            };
            this.cameraPanOperation = operation;
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
