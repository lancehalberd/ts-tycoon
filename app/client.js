"use strict";
exports.__esModule = true;
var gameConstants_1 = require("app/gameConstants");
var update_1 = require("app/update");
var render_1 = require("app/render");
setInterval(update_1.update, gameConstants_1.FRAME_LENGTH);
function renderLoop() {
    try {
        window.requestAnimationFrame(renderLoop);
        render_1.render();
    }
    catch (e) {
        console.log(e);
        debugger;
    }
}
renderLoop();
