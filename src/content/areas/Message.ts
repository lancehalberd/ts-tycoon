import { damageActor } from 'app/actor';
import { messageCharacter } from 'app/adventure';
import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    drawFrameToAreaTarget,
    EditableAreaObject,
    getAreaObjectTargetFromDefinition,
    getLayer,
} from 'app/content/areas';
import { map } from 'app/content/mapData';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { refreshObjectDefinition } from 'app/development/editObjects';
import { bodyDiv, titleDiv } from 'app/dom';
import { FRAME_LENGTH, MAX_Z } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getState } from 'app/state';
import { MessageBox } from 'app/ui/DialogueBox';
import { createAnimation, drawFrame, frameAnimation, getFrame } from 'app/utils/animations';

import {
    Area, AreaObject, AreaObjectTarget, AreaTarget, BaseAreaObjectDefinition,
    EditorProperty, Exit, Frame, FrameAnimation, Hero,
    LootGenerator, MenuOption, PropertyRow, ShortRectangle, TreasureChestDefinition,
} from 'app/types';

export interface MessageDefinition extends BaseAreaObjectDefinition {
    // Individual messages to display
    messages: string[],
    // How long to persist text after it is displayed.
    duration: number,
    // How long to wait between messages, if there is more than one.
    delay: number,
}

export class Message extends EditableAreaObject {
    definition: MessageDefinition;
    displayed = false;
    // The message isn't actually on the field, so disable collision detection.
    isSolid = false;
    messageBox: MessageBox;
    time: number = 0;

    onTrigger() {
        if (!this.displayed) {
            this.displayed = true;
            this.messageBox = new MessageBox();
            this.messageBox.message = this.definition.messages[0];
            this.messageBox.start(this.area);
            this.messageBox.duration = this.definition.duration || 2000;
        }
    }

    update() {
        this.time += FRAME_LENGTH;
        if (this.messageBox) {
            this.messageBox.update();
            // Cleanup the messageBox if it has finished displaying.
            if (!this.messageBox.domElement) {
                this.messageBox = null;
            }
        } else if (!this.displayed && this.definition.delay && this.time > this.definition.delay) {
            this.onTrigger();
        }
    }

    // This is just used by the editor.
    getAreaTarget(): AreaObjectTarget {
        if (!this._areaTarget) {
            this._areaTarget = getAreaObjectTargetFromDefinition(this, {
                x: 0, w: 100, y: 0, h: 20, d: 0
            }, this.definition);
            this._areaTarget.shapeType = this.shapeType;
        }
        return this._areaTarget;
    }

    // Rendering the text itself is managed by the MessageBox element, which
    // displays in the dom. This renders a target for editing.
    render(context: CanvasRenderingContext2D): void {
        if (editingAreaState.isEditing) {
            const r = areaTargetToScreenTarget(this.getAreaTarget());
            context.fillStyle = 'blue';
            context.fillRect(r.x, r.y, r.w, r.h);
            context.fillStyle = 'white';
            context.textAlign = 'left'
            context.textBaseline = 'top';
            context.font = '10px sans-serif';
            context.fillText(this.definition.messages[0], r.x + 2, r.y + 2, r.w - 4);
        }
    }

    static getCreateMenu(): MenuOption {
        return {
            getLabel: () => 'Message',
            onSelect() {
                createObjectAtContextCoords({
                    type: 'message',
                    messages: ['A God Speaks'],
                    delay: 1000,
                });
            }
        };
    }

    static getProperties(object: Message): (EditorProperty<any> | PropertyRow | string)[] {
        const props = [];
        props.push({
            name: 'Text',
            value: object.definition.messages[0],
            onChange: (message: string) => {
                object.definition.messages[0] = message;
            },
        });
        props.push({
            name: 'Delay',
            value: object.definition.delay || 0,
            onChange: (delay: number) => {
                if (isNaN(delay)) {
                    return object.definition.delay;
                }
                object.definition.delay = delay;
            },
        });
        return props;
    }
}
areaObjectFactories.message = Message;
