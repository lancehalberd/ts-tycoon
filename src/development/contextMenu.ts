import { tagElement } from 'app/dom';
import { getEditingContextMenu } from 'app/development/editArea';
import { getState } from 'app/state';

import { MenuOption } from 'app/types';

interface ContextMenuState {
    contextMenuElement?: HTMLElement,
}
export const contextMenuState: ContextMenuState = {
    contextMenuElement: null,
}

export function getContextMenu() {
    return [
        ...getEditingContextMenu(),
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
        const label = option.getLabel ? option.getLabel() : ' ';
        const optionElement = tagElement('div', 'contextOption', label);
        optionElement.onclick = function () {
            if (option.onSelect) {
                option.onSelect();
                hideContextMenu();
            }
        }
        // If this gets slow, we could render children only as they are needed.
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
