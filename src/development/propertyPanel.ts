import { tagElement } from 'app/dom';

import { EditorProperty, PropertyRow } from 'app/types';

let propertyPanelElement = null;


export function displayPropertyPanel(properties: (EditorProperty | PropertyRow | string)[]): void {
    hidePropertyPanel();
    const lines = [];
    for (const property of properties) {
        if (Array.isArray(property)) {
            lines.push(renderPropertyRow(property));
        } else {
            lines.push(renderPropertyRow([property]));
        }
    }
    propertyPanelElement = tagElement('div', 'pp-container', lines.join(''));
    document.body.append(propertyPanelElement);
}

export function hidePropertyPanel() {
    if (propertyPanelElement) {
        propertyPanelElement.remove();
    }
}

function renderPropertyRow(row: PropertyRow): string {
    return `<div class="pp-row">${row.map(property => renderProperty(property)).join('')}</div>`
}

function renderProperty(property: EditorProperty | string): string {
    if (typeof(property) === 'string') {
        return `<span class="pp-property">${property}</span>`;
    }
    return `<span class="pp-property">${property.name}: ${property.value}</span>`;
}
