import { rectangleCenter } from 'app/utils/index';

export function query(className): HTMLElement {
    return document.querySelector(className);
}

export function queryAll(className): NodeListOf<HTMLElement> {
    return document.querySelectorAll(className);
}

export const mainCanvas:HTMLCanvasElement = query('.js-mainCanvas') as HTMLCanvasElement;
window['mainCanvas'] = mainCanvas;
export const mainContext = mainCanvas.getContext('2d');
mainContext.imageSmoothingEnabled = false;
window['mainContext'] = mainContext;

export const jewelsCanvas:HTMLCanvasElement = query('.js-skillCanvas') as HTMLCanvasElement;
export const jewelsContext = jewelsCanvas.getContext("2d");

export const previewCanvas:HTMLCanvasElement = query('.js-characterColumn .js-previewCanvas') as HTMLCanvasElement;
export const previewContext = previewCanvas.getContext("2d")
previewContext.imageSmoothingEnabled = false;

export const craftingCanvas:HTMLCanvasElement = query('.js-craftingCanvas') as HTMLCanvasElement;
export const craftingContext = craftingCanvas.getContext('2d');

export function createCanvas(width, height, classes = ''):HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.className = classes;
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export const jewelInventoryContainer:HTMLElement = query('.js-jewelInventory');
export const craftingOptionsContainer:HTMLElement = query('.js-craftingSelectOptions');
export const mouseContainer:HTMLElement = query('.js-mouseContainer');
export const mainContent: HTMLElement = query('.js-gameContent');
export const cutsceneFadeBox: HTMLElement = query('.js-cutsceneFadeBox');

export function tag(type: string, classes: string = '', content: string | number = '') {
    return '<' + type + ' class="' + classes + '">' + content + '</' + type + '>';
}
export function tagElement(type: string, classes: string = '', content: string | number = ''):HTMLElement {
    const element:HTMLElement = document.createElement(type);
    element.className = classes || '';
    element.innerHTML = '' + (content || '');
    return element;
}

export const divider = tag('div', 'centered medium', tag('div', 'divider'));
export function titleDiv(titleMarkup) {
    return titleMarkup && tag('div', 'title', titleMarkup);
}
export function bodyDiv(bodyMarkup) {
    return bodyMarkup && tag('div', 'body', bodyMarkup)
};

export function findEmptyElement(elements: NodeListOf<HTMLElement>): HTMLElement {
    return [...elements].find(element => element.innerHTML === '');
}

export function getClosestElement(element: HTMLElement, elements: Array<HTMLElement>, threshold: number): HTMLElement {
    let closestElement = null;
    let closestDistanceSquared = threshold * threshold;
    const center = rectangleCenter(element.getBoundingClientRect());
    elements.forEach(element => {
        const elementCenter = rectangleCenter(element.getBoundingClientRect());
        const d2 = (center[0] - elementCenter[0]) ** 2 + (center[1] - elementCenter[1]) ** 2;
        if (d2 <= closestDistanceSquared) {
            closestDistanceSquared = d2;
            closestElement = element;
        }
    });
    return closestElement;
}

export function toggleElements(elements: NodeListOf<HTMLElement>, show: boolean) {
    elements.forEach(element => element.style.display = show ? '' : 'none');
}

export function handleChildEvent(
    eventType: string,
    container: HTMLElement,
    selector: string,
    handler: (HTMLElement, Event) => any,
) {
    container.addEventListener(eventType, event => {
        const element: HTMLElement = event.target as HTMLElement;
        const matchedElement = element.closest(selector);
        if (matchedElement) {
            return handler(matchedElement, event);
        }
    });
}

export function getElementIndex(element: HTMLElement) {
    return [...element.parentElement.children].indexOf(element);
}
