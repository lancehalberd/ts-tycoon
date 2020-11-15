import {
    areaObjectFactories,
    areaTargetToScreenTarget,
    EditableAreaObject,
    getAreaObjectTargetFromDefinition,
} from 'app/content/areas';
import { createObjectAtContextCoords, editingAreaState } from 'app/development/editArea';
import { FRAME_LENGTH } from 'app/gameConstants';
import { MessageBox } from 'app/ui/DialogueBox';

import {
    AreaObjectTarget, BaseAreaObjectDefinition,
    EditorProperty, MenuOption, PropertyRow,
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

    // This is used in the prology tutorial to cancel the message if it is currently displayed when the
    // cutscene starts.
    cancel() {
        this.displayed = true;
        if (this.messageBox) {
            this.messageBox.remove();
            this.messageBox = null;
        }
    }

    cleanup() {
        if (this.messageBox) {
            this.messageBox.remove();
            this.messageBox = null;
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
