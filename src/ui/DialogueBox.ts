import { getActorMouseTarget } from 'app/actor';
import { query, tagElement } from 'app/dom';
import { ADVENTURE_WIDTH, ADVENTURE_SCALE, DOM_WIDTH, FRAME_LENGTH } from 'app/gameConstants';
import { getElementRectangle } from 'app/utils/index';

import { Actor, Area } from 'app/types';

const textContainer = query('.js-textLayer');

export class DialogueBox {
    // Indicates number of frames used to draw each character.
    textSpeed: number = 2;
    frameCount: number = 0;
    // Letters up to this index are revealed.
    revealedTextIndex: number = 0;
    // The message to display in the box.
    message: string = '...';
    // The actor the text is attached to.
    actor: Actor;
    // How long to leave the text on screen after it finishes.
    duration: number = 2000;
    persistTimer: number = 0;
    fadeTime: number = 0;
    // If this is set, the text won't disappear until a user advances dialogue.
    waitForInput: boolean = false;
    // The element used to display this dialogue box.
    domElement: HTMLElement;
    revealedTextElement: HTMLElement;
    hiddenTextElement: HTMLElement;
    bubbleArrowElement: HTMLElement;
    promptArrowElement: HTMLElement;
    run(actor: Actor) {
        this.actor = actor;
        this.domElement = tagElement('div', 'textBubble');
        this.revealedTextElement = tagElement('span', 'revealedText');
        this.hiddenTextElement = tagElement('span', 'hiddenText', this.message);
        this.bubbleArrowElement = tagElement('div', 'arrow arrow-down');
        this.promptArrowElement = tagElement('div', 'promptArrow');
        this.domElement.append(this.revealedTextElement);
        this.domElement.append(this.hiddenTextElement);
        this.domElement.append(this.bubbleArrowElement);
        this.domElement.append(this.promptArrowElement);
        this.bubbleArrowElement.style.left = '10px';
        actor.dialogueBox = this;
        textContainer.append(this.domElement);
        this.frameCount = 0;
        this.updatePosition();
    }
    finish() {
        this.revealedTextIndex = this.message.length;
        this.hiddenTextElement.innerText = '';
        this.revealedTextElement.innerText = this.message;
    }
    // During dialogue, when someone else responds, we leave the current bubble on screen
    // but fade it out to indicate it is older dialogue.
    finishAndFade() {
        this.hiddenTextElement.innerText = '';
        this.revealedTextElement.innerText = this.message;
        this.revealedTextElement.classList.remove('revealedText');
        this.revealedTextElement.classList.add('fadedText');
    }
    remove() {
        this.actor.dialogueBox = null;
        this.domElement.remove();
    }
    updatePosition() {
        // These are in canvas coords so they need to be multiplied by ADVENTURE_SCALE.
        const {x, y} = getActorMouseTarget(this.actor);
        const {h, w} = getElementRectangle(this.domElement);
        // Force the box to be on the screen, I don't think we need to worry about the y axis.
        const left = Math.max(10, Math.min(DOM_WIDTH - 10 - w, ADVENTURE_SCALE * x));
        this.domElement.style.left = `${left}px`;
        // Attempt to move the bubble arrow near the center of the actor.
        const dx = ADVENTURE_SCALE * x - left;
        const bubbleLeft = Math.max(10, Math.min(w - 10, dx));
        this.bubbleArrowElement.style.left = `${bubbleLeft}px`;

        this.domElement.style.top = `${ADVENTURE_SCALE * y - h - 10}px`;
    }
    update() {
        this.updatePosition();
        if (this.revealedTextIndex >= this.message.length) {
            if (this.persistTimer  > this.duration && !this.waitForInput) {
                if (!this.fadeTime || this.persistTimer > this.duration + this.fadeTime) {
                    this.remove();
                } else {
                    const p = (this.persistTimer - this.duration) / this.fadeTime;
                    this.domElement.style.opacity = `${1 - p}`;
                }
            }
            // Use the persist timer to make the prompt arrow blink.
            if (this.promptArrowElement && this.waitForInput && this.persistTimer % 400 === 0) {
                if (this.promptArrowElement.style.display === 'none') {
                    this.promptArrowElement.style.display = 'block';
                } else {
                    this.promptArrowElement.style.display = 'none';
                }
            }
            this.persistTimer += FRAME_LENGTH;
            return;
        }
        this.frameCount++;
        if (this.frameCount < this.textSpeed) {
            return;
        }
        this.frameCount = 0;
        this.revealedTextIndex++;
        this.revealedTextElement.innerText = this.message.slice(0, this.revealedTextIndex);
        this.hiddenTextElement.innerText = this.message.slice(this.revealedTextIndex);

    }
    isFinished(): boolean {
        return !this.waitForInput && this.revealedTextIndex >= this.message.length;
    }
}

export class MessageBox extends DialogueBox {
    area: Area;

    start(area: Area) {
        this.area = area;
        this.domElement = tagElement('div', 'textBanner');
        this.revealedTextElement = tagElement('span', 'revealedText');
        this.hiddenTextElement = tagElement('span', 'hiddenText', this.message);
        this.domElement.append(this.revealedTextElement);
        this.domElement.append(this.hiddenTextElement);
        textContainer.append(this.domElement);
        this.frameCount = 0;
        this.fadeTime = 500;
        this.updatePosition();
    }
    remove() {
        if (this.domElement) {
            this.domElement.remove();
            this.domElement = null;
        }
    }
    updatePosition(): void {
        // The message box position doesn't change.
    }
}
