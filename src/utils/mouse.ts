type Coords = [number, number];

let mousePosition:Coords = [400, 400];
let mouseIsDown:boolean = false;
let rightMouseDown:boolean = false;

export function isMouseDown(): boolean {
    return mouseIsDown;
}
export function isRightMouseDown(): boolean {
    return rightMouseDown;
}

export function getMousePosition(container:HTMLElement = null): Coords {
    if (container) {
        const containerRect:DOMRect = container.getBoundingClientRect();
        return [
            (mousePosition[0] - containerRect.x),
            (mousePosition[1] - containerRect.y),
        ];
    }
    return mousePosition;
}

function onMouseMove(event) {
    mousePosition = [event.pageX, event.pageY];
    console.log(mousePosition);
}
function onMouseDown(event) {
    if (event.which == 1) mouseIsDown = true;
    else if (event.which == 3) rightMouseDown = true;
}
function onMouseUp(event) {
    if (event.which == 1) mouseIsDown = false;
    else if (event.which == 3) rightMouseDown = false;
}

export function bindMouseListeners() {
    document.onmousemove = onMouseMove;
    document.onmousedown = onMouseDown;
    document.onmouseup = onMouseUp;
}

export function unbindMouseListeners() {
    document.onmousemove = null;
    document.onmousedown = null;
    document.onmouseup = null;
    // Prevent mouse from being "stuck down"
    mouseIsDown = false;
}

/*$(document).on('contextmenu', function (event) {
    mouseDown = rightMouseDown = false;
});*/

export function isMouseOverElement(element:HTMLElement):boolean {
    const rect:DOMRect = element.getBoundingClientRect();
    return mousePosition[0] >= rect.x && mousePosition[0] <= rect.x + rect.width
        && mousePosition[1] >= rect.y && mousePosition[1] <= rect.y + rect.height;
}
