import { tagElement } from 'app/dom';

import { EditorProperty, PropertyRow } from 'app/types';

let propertyPanelElement = null;
let propertiesByName: {[key: string]: EditorProperty<any>} = {};


export function displayPropertyPanel(properties: (EditorProperty<any> | PropertyRow | string)[]): void {
    hidePropertyPanel();
    propertiesByName = {};
    const lines = [];
    for (const property of properties) {
        if (Array.isArray(property)) {
            lines.push(renderPropertyRow(property));
        } else {
            lines.push(renderPropertyRow([property]));
        }
    }
    propertyPanelElement = tagElement('div', 'pp-container', lines.join(''));
    /*propertyPanelElement.addEventListener('click', (event: MouseEvent) => {
        console.log('click');
        console.log(event.target);
    });*/
    propertyPanelElement.addEventListener('change', (event: InputEvent) => {
        const input = (event.target as HTMLElement).closest('input')
            || (event.target as HTMLElement).closest('select');
        const property = input && propertiesByName[input.name];
        if (property) {
            if (isStringProperty(property) && property.onChange) {
                // If there is a validation error, onChange will return
                // the value to set the input to.
                const newValue = property.onChange(input.value);
                if (newValue) {
                    input.value = newValue;
                }
            } else if (isNumberProperty(property) && property.onChange) {
                // If there is a validation error, onChange will return
                // the value to set the input to.
                const newValue = property.onChange(parseInt(input.value, 10));
                if (newValue) {
                    input.value = `${newValue}`;
                }
            } else if (isBooleanProperty(property) && property.onChange) {
                property.onChange((input as HTMLInputElement).checked);
            }
        }
    });
    propertyPanelElement.addEventListener('click', (event: InputEvent) => {
        const button = (event.target as HTMLElement).closest('button');
        const property = button && propertiesByName[button.name];
        if (property && property.onClick) {
            property.onClick();
        }
    });
    document.body.append(propertyPanelElement);
}

export function hidePropertyPanel() {
    if (propertyPanelElement) {
        propertyPanelElement.remove();
        propertyPanelElement = null;
    }
}

function renderPropertyRow(row: PropertyRow): string {
    return `<div class="pp-row">${row.map(property => renderProperty(property)).join('')}</div>`
}

function isStringProperty(property: EditorProperty<any>): property is EditorProperty<string> {
    return typeof(property.value) === 'string';
}
function isNumberProperty(property: EditorProperty<any>): property is EditorProperty<number> {
    return typeof(property.value) === 'number';
}
function isBooleanProperty(property: EditorProperty<any>): property is EditorProperty<boolean> {
    return typeof(property.value) === 'boolean';
}

function renderProperty(property: EditorProperty<any> | string): string {
    if (typeof(property) === 'string') {
        return `<span class="pp-property">${property}</span>`;
    }
    if (property.onChange) {
        propertiesByName[property.name] = property;
        if (isStringProperty(property)) {
            if (property.values) {
                return `<span class="pp-property">${property.name} <select name="${property.name}">`
                    + property.values.map(val => `
                        <option ${val === property.value ? 'selected' : ''}>
                            ${val}
                        </option>`)
                    + '</select></span>';
            }
            return `<span class="pp-property">${property.name} <input value="${property.value}" name="${property.name}" /></span>`;
        } else if (isNumberProperty(property)) {
            if (property.values) {
                return `<span class="pp-property">${property.name} <select name="${property.name}">`
                    + property.values.map(val => `
                        <option ${val === property.value ? 'selected' : ''}>
                            ${val}
                        </option>`)
                    + '</select></span>';
            }
            return `<span class="pp-property">${property.name} <input type="number" value="${property.value}" name="${property.name}" /></span>`;
        } else if (isBooleanProperty(property)) {
            return `<span class="pp-property">
                        ${property.name}
                        <input type="checkbox" ${property.value ? 'checked' : ''} name="${property.name}" />
                    </span>`;
        }
    } else if (property.onClick) {
        propertiesByName[property.name] = property;
        return `<span class="pp-property"><button name="${property.name}">${property.name}</button></span>`;
    }
    return `<span class="pp-property">${property.name}: ${property.value}</span>`;
}
