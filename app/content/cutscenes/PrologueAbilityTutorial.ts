import { getArea, triggerTargets } from 'app/adventure';
import { addFixedAbilities, setSelectedCharacter, updateHero } from 'app/character';
import { abilities } from 'app/content/abilities';
import { FloorTrigger, Message  } from 'app/content/areas';
import Cutscene from 'app/content/cutscenes/Cutscene';
import { setContext } from 'app/context';
import { getMysteriousSage } from 'app/development/testCharacters/special';
import { mainCanvas } from 'app/dom';
import { ADVENTURE_SCALE, ADVENTURE_WIDTH, ADVENTURE_HEIGHT } from 'app/gameConstants';
import { getCanvasPopupTarget, showMainCanvasToolTip } from 'app/popup';
import { activateAction, drawActionShortcut, getAbilityPopupTarget } from 'app/render/drawActionShortcuts';
import { getState } from 'app/state';
import { MessageBox } from 'app/ui/DialogueBox';
import { getMousePosition } from 'app/utils/mouse';

import { Hero, Monster } from 'app/types';

export default class PrologueAbilityTutorial extends Cutscene {
    // Lone wolf on the right
    wolfA: Monster;
    // Top wolf on the left
    wolfB: Monster;
    // Bottom wolf on the left
    wolfC: Monster;
    hero: Hero;
    isTutorial = true;
    freezePromiseAccept: () => void;
    freezeFadeLevel: number;

    async runScript() {
        this.freezePromiseAccept = null;
        this.freezeFadeLevel = 0;
        this.pausedForTutorial = false;
        this.hero = getState().selectedCharacter.hero;
        let tunnel = getArea('prologue', 'tunnel2');
        const findMonster = (key: string): Monster => {
            for (const enemy of tunnel.enemies) {
                if (enemy.type === 'monster' && enemy.definition?.triggerKey === key) {
                    return enemy;
                }
            }
        };
        // If we aren't in the correct area (started cutscene using debugger)
        // Just fade out, move the hero/sprite to an appropriate spot in the guild foyer and fade in.
        if (this.hero.area !== tunnel) {
            tunnel = getArea('prologue', 'tunnel2', true);
            await this.fadeOut();
            this.hero.character.context = 'field';
            const sage = getMysteriousSage();
            sage.hero.heading = [1, 0, 0];
            setSelectedCharacter(sage);
            // Changing character messes up the context, so we need to set it back to cutscene.
            setContext('cutscene');
            this.hero = sage.hero;
            this.hero.area = tunnel;

            // Make sure the intro message for the area isn't played during this cutscene.
            const introMessage = tunnel.objectsByKey.message as Message;
            introMessage.cancel();

            // Make sure the switch is already triggered so we don't retrigger it after the cutscene.
            const floorTrigger = tunnel.objectsByKey.floorTrigger as FloorTrigger;
            floorTrigger.switchOn = true;
            const floorTriggerX = floorTrigger.getAreaTarget().x;

            // Place the hero on top of the floor trigger.
            this.hero.x = floorTriggerX;
            this.hero.z = 0;
            // We need to trigger the wolves or they won't be spawned in the area yet.
            triggerTargets(tunnel, ['snowWolfA', 'snowWolfB', 'snowWolfC'], null, true);
            this.wolfA = findMonster('snowWolfA');
            this.wolfB = findMonster('snowWolfB');
            this.wolfC = findMonster('snowWolfC');
            this.setArea(tunnel);
            tunnel.cameraX = this.hero.x - 200;
            this.setActors([this.hero, this.wolfA, this.wolfB, this.wolfC]);
            await this.fadeIn();
        } else {
            this.wolfA = findMonster('snowWolfA');
            this.wolfB = findMonster('snowWolfB');
            this.wolfC = findMonster('snowWolfC');
            this.setArea(tunnel);
            this.setActors([this.hero, this.wolfA, this.wolfB, this.wolfC]);
        }
        this.moveActor(this.hero, {x: this.hero.x + 30, z: this.hero.z}, 40);
        this.moveActor(this.wolfA, {x: this.hero.x + 30, z: this.hero.z}, 80);
        this.moveActor(this.wolfB, {x: this.hero.x - 30, z: this.hero.z + 30}, 110);
        this.moveActor(this.wolfC, {x: this.hero.x - 30, z: this.hero.z - 30}, 110);
        await this.pause(1000);
        this.hero.heading[0] = -1;
        this.pausedForTutorial = true;
        await this.waitForMessage('Use powerful spells and skills when you are in a tough spot');
        addFixedAbilities(this.hero.character, [ abilities.freeze ]);
        const health = this.hero.health;
        updateHero(this.hero);
        this.hero.health = health;
        this.messageBox = new MessageBox();
        this.messageBox.message = 'Click on the skill icon for the "freeze" spell or press 2 to activate it.';
        this.messageBox.start(this.area);
        this.messageBox.waitForInput = true;
        await new Promise(accept => {
            this.freezePromiseAccept = accept;
        });
        this.pausedForTutorial = false;
        // Emphasize the freeze skill.
        // End cutscene once the user has used the Freeze skill.
        this.messageBox.remove();
        this.messageBox = null;
    }

    async runEndScript() {
        const hero = this.hero;
        this.cleanupScene();
        this.restoreArea();
        // In case the hero was moved around in the cutscene, make sure they are properly inserted into their area.
        if (hero.area.allies.indexOf(hero) < 0) {
            hero.area.allies.push(hero);
        }
        hero.allies = hero.area.allies;
        hero.enemies = hero.area.enemies;
    }

    update() {
        super.update();
        if (this.pausedForTutorial) {
            this.freezeFadeLevel = Math.min(1, this.freezeFadeLevel + 0.1);
        }

        if (this.freezePromiseAccept) {
            // If the mouse is over the freeze action, set it as the hover target + show tooltip.
            const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
            const abilityTarget = getAbilityPopupTarget(x, y);
            if (this.hero.character.actionShortcuts[1] === abilityTarget) {
                showMainCanvasToolTip(abilityTarget);
            }
        }
    }

    render(context: CanvasRenderingContext2D) {
        super.render(context);
        if (this.pausedForTutorial) {
            if (this.freezeFadeLevel <= 0) {
                return;
            }

            {
                context.save();
                context.globalAlpha = this.freezeFadeLevel * 0.6;
                context.fillStyle = '#666';
                context.fillRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
                context.restore();
            }

            if (this.freezePromiseAccept) {
                drawActionShortcut(context, this.hero.character.actionShortcuts[1], this.hero);
            }
        }
    }

    // Special handling for using the freeze spell shortcut key when prompting the user to do so.
    handleKeyInput(keyCode: number): void {
        if (this.freezePromiseAccept) {
            if (this.hero.character.actionShortcuts[1].keyIndicator.keyCode === keyCode) {
                activateAction(this.hero.character.actionShortcuts[1].action);
                this.freezePromiseAccept();
            }
        }
    }

    // Special handling for selecting the freeze spell when prompting the user to do so.
    handleClick(x: number, y: number): void {
        super.handleClick(x, y);
        if (this.freezePromiseAccept) {
            if (getCanvasPopupTarget() === this.hero.character.actionShortcuts[1]) {
                activateAction(this.hero.character.actionShortcuts[1].action);
                this.freezePromiseAccept();
            }
        }
    }
}
