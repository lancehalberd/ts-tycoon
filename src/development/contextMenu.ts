import { tagElement } from 'app/dom';
import { editingAreaState } from 'app/development/editArea';
import { getState } from 'app/state';

interface MenuOption {
    getLabel: () => string,
    onSelect: () => void,
    getChildren?: () => MenuOption[],
}

interface ContextMenuState {
    contextMenuElement?: HTMLElement,
}
export const contextMenuState: ContextMenuState = {
    contextMenuElement: null,
}

export function getContextMenu() {
    return [
        {
            getLabel() {
                return editingAreaState.isEditing ? 'Stop Editing' : 'Start Editing';
            },
            onSelect() {
                editingAreaState.isEditing = !editingAreaState.isEditing;
                if (editingAreaState.isEditing ){
                    editingAreaState.cameraX = getState().selectedCharacter.hero.area.cameraX;
                } else {
                    editingAreaState.selectedObject = null;
                }
            }
        }
    ]
}

export function showContextMenu(menu: MenuOption[], x: number, y: number): void {
    hideContextMenu();
    contextMenuState.contextMenuElement = createContextMenuElement(menu);
    document.body.append(contextMenuState.contextMenuElement);
    contextMenuState.contextMenuElement.style.left = `${x}px`;
    contextMenuState.contextMenuElement.style.top = `${y}px`;
}

export function hideContextMenu() {
    if (contextMenuState.contextMenuElement) {
        contextMenuState.contextMenuElement.remove();
    }
}

/**
    <div class="contextMenu">
        <div class="contextOption">
            Option 1
            <div class="contextMenu">
                <div class="contextOption">Sub 1</div>
            </div>
        </div>
    </div>
*/
export function createContextMenuElement(menu: MenuOption[]): HTMLElement {
    const container = tagElement('div', 'contextMenu');
    for (const option of menu) {
        const optionElement = tagElement('div', 'contextOption', option.getLabel());
        optionElement.onclick = function () {
            option.onSelect();
            hideContextMenu();
        }
        if (option.getChildren) {
            const children = option.getChildren();
            if (children && children.length) {
                optionElement.append(createContextMenuElement(children));
            }
        }
        container.append(optionElement);
    }
    return container;
}
