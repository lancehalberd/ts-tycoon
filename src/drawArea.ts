import { returnToMap } from 'app/adventure';
import { areaTypes } from 'app/content/areaTypes';
import { effectAnimations } from 'app/content/effectAnimations';
import { drawLeftWall, drawRightWall } from 'app/content/guild'
import { upgradeButton } from 'app/content/upgradeButton';
import { editingMapState } from 'app/development/editLevel'
import { createCanvas, mainCanvas, mainContext } from 'app/dom';
import { getHoverAction, getSelectedAction } from 'app/drawSkills';
import {
    ADVENTURE_HEIGHT, BACKGROUND_HEIGHT, FIELD_HEIGHT,
    FRAME_LENGTH, GROUND_Y, MIN_SLOW, RANGE_UNIT
} from 'app/gameConstants';
import { getCanvasCoords, getTargetLocation } from 'app/main';
import {
    drawImage, drawOutlinedImage, drawTintedImage,
    prepareTintedImage, requireImage,
} from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { drawActor, drawActorEffects, drawActorShadow } from 'app/render/drawActor';
import { getState } from 'app/state';
import { canUseSkillOnTarget } from 'app/useSkill';
import { drawFrame } from 'app/utils/animations';
import { arrMod, rectangle, toR } from 'app/utils/index';

import { Actor, ActorEffect, Animation, Area, AreaType } from 'app/types';

export const bufferCanvas: HTMLCanvasElement = createCanvas(mainCanvas.width, mainCanvas.height);
export const bufferContext = bufferCanvas.getContext('2d');
bufferContext.imageSmoothingEnabled = false;
const tileWidth = 60;
// document.body.append(bufferCanvas);

export function getGlobalHud() {
    return [
        returnToMapButton,
        upgradeButton,
    ];
}
export function drawHud() {
    for (const element of getGlobalHud()) {
        if (element.isVisible && !element.isVisible()) continue;
        element.render();
    }
}

export function drawOnGround(render: (context: CanvasRenderingContext2D) => void) {
    bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    render(bufferContext);
    drawImage(mainContext, bufferCanvas,
        rectangle(0, BACKGROUND_HEIGHT, bufferCanvas.width, FIELD_HEIGHT),
        rectangle(0, BACKGROUND_HEIGHT, bufferCanvas.width, FIELD_HEIGHT)
    );
}

export function drawArea(area: Area) {
    const context = mainContext;
    const cameraX = area.cameraX;
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    const backgroundKey = area.backgroundPatterns[0];
    const areaType: AreaType = areaTypes[backgroundKey] || areaTypes.field;
    areaType.drawFloor(context, area);
    const allSprites: ({
        targetType?: string,
        z?: number,
        render?: Function,
        drawGround?: Function,
    })[] = [
        ...area.allies,
        ...area.enemies,
        ...area.objects,
        ...area.projectiles,
        ...area.treasurePopups,
        ...area.effects
    ];
    // Draw effects that appear underneath sprites. Do not sort these, rather, just draw them in
    // the order they are present in the arrays.
    for (const sprite of allSprites) if (sprite.drawGround) sprite.drawGround(area);
    for (const actor of area.allies.concat(area.enemies)) {
        drawActorShadow(context, actor);
        drawActorGroundEffects(actor);
    }
    drawActionTargetCircle(context);
    areaType.drawBackground(context, area);
    if (area.leftWall) drawLeftWall(context, area);
    if (area.rightWall) drawRightWall(context, area);
    if (area.wallDecorations) {
        for (const object of area.wallDecorations) object.render(area);
    }
    const sortedSprites = allSprites.slice().sort(function (spriteA, spriteB) {
        return (spriteB.z || 0) - (spriteA.z || 0);
    });
    for (const sprite of sortedSprites) {
        if (sprite.render) sprite.render(area);
        else if (sprite.targetType === 'actor') drawActor(context, sprite as Actor);
    }
    //for (var effect of ifdefor(area.effects, [])) effect.render(area);
    // Draw actor lifebar/status effects on top of effects/projectiles
    area.allies.concat(area.enemies).forEach(actor => drawActorEffects(context, actor));
    // Draw text popups such as damage dealt, item points gained, and so on.
    for (const textPopup of (area.textPopups || [])) {
        context.fillStyle = (textPopup.color|| "red");
        const scale = Math.max(0, Math.min(1.5, (textPopup.duration || 0) / 10));
        context.font = 'bold ' + Math.round(scale * (textPopup.fontSize || 20)) + "px 'Cormorant SC', Georgia, serif";
        context.textAlign = 'center'
        context.fillText(textPopup.value, textPopup.x - cameraX, GROUND_Y - textPopup.y - textPopup.z / 2);
    }
    if (area.areas) drawMinimap(area);
}
function drawRune(context: CanvasRenderingContext2D, actor: Actor, animation: Animation, frameIndex: number) {
    context.save();
    context.translate((actor.x - actor.area.cameraX), GROUND_Y - actor.z / 2);
    const frame = animation.frames[frameIndex];
    const size = [frame.w, frame.h];
    drawFrame(context, frame, {x: -size[0] / 2, y: -size[1] / 2, w: size[0], h: size[1]});
    context.restore();
}
function drawActorGroundEffects(actor: Actor) {
    const usedEffects = new Set();
    for (const effect of actor.allEffects) {
        const base = effect.base as {drawGround?: Function};
        if (!base.drawGround) continue;
        // Don't draw the same effect animation twice on the same character.
        if (usedEffects.has(base)) continue;
        usedEffects.add(base);
        base.drawGround(actor);
    }
    if (!actor.pull && !actor.stunned && !actor.isDead && actor.skillInUse && actor.recoveryTime === 0) {
        if (actor.skillInUse.variableObject.tags['spell']) {
            const castAnimation = effectAnimations.cast;
            const castFrame = Math.floor(actor.preparationTime / actor.skillInUse.totalPreparationTime * castAnimation.frames.length);
            if (castFrame < castAnimation.frames.length) {
                drawOnGround((context) => {
                    drawRune(context, actor, castAnimation, castFrame);
                });
            }
        }
    }
}
function drawMinimap(area: Area) {
    var y = 600 - 30;
    var height = 6;
    var x = 10;
    var width = 750;
    var context = mainContext;
    var areaIndex = 0;
    var numberOfAreas = area.areas.size;
    var i = 0;
    area.areas.forEach(mapArea => {
        if (mapArea === area) areaIndex = i + 1;
        i++;
    });
    drawBar(context, x, y, width, height, 'white', 'white', areaIndex / numberOfAreas);
    var i = 0;
    area.areas.forEach(mapArea => {
        var centerX = x + (i + 1) * width / area.areas.size;
        var centerY = y + height / 2;
        context.fillStyle = 'white';
        context.beginPath();
            context.arc(centerX, centerY, 11, 0, 2 * Math.PI);
        context.fill();
        i++;
    });
    context.fillStyle = 'orange';
    context.fillRect(x + 1, y + 1, (width - 2) * (areaIndex / numberOfAreas) - 10, height - 2);
    i = 0;
    area.areas.forEach(mapArea => {
        var centerX = x + (i + 1) * width / numberOfAreas;
        var centerY = y + height / 2;
        if (i < areaIndex) {
            context.fillStyle = 'orange';
            context.beginPath();
            context.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            context.fill();
        }
        var areaCompleted = !(mapArea.enemies || []).length;
        mapArea.drawMinimapIcon(context, areaCompleted, centerX, centerY);
        i++;
    });
}

function drawHudElement(element) {
    if (getCanvasPopupTarget() === element) {
        drawOutlinedImage(mainContext, element.source.image, '#fff', 1, element.source, element);
    } else if (element.flashColor) {
        drawTintedImage(mainContext, element.source.image, element.flashColor, .5 + .2 * Math.sin(Date.now() / 150),
            toR(element.source), toR(element)
        );
    } else drawImage(mainContext, element.source.image, element.source, element);
}

const returnToMapButton = {
    source: {'image': requireImage('gfx/worldIcon.png'), left: 0, top: 0, width: 72, height: 72},
    isVisible() {
        return getState().selectedCharacter.context === 'adventure';
    },
    render() {
        this.flashColor = getState().selectedCharacter.hero.levelInstance.completed ? 'white' : null;
        drawHudElement(this);
    },
    top: ADVENTURE_HEIGHT - 25, left: 8, width: 18, height: 18, 'helpText': 'Return to Map', onClick() {
        const state = getState();
        state.selectedCharacter.replay = false;
        returnToMap(state.selectedCharacter);
}};

export function drawBar(context, x, y, width, height, background, color, percent) {
    percent = Math.max(0, Math.min(1, percent));
    if (background) {
        context.fillStyle = background;
        context.fillRect(x, y, width, height);
    }
    context.fillStyle = color;
    context.fillRect(x + 1, y + 1, Math.floor((width - 2) * percent), height - 2);
}


export function drawGroundCircle(context, area: Area, x, z, radius) {
    var centerY = GROUND_Y - z / 2;
    var centerX = x - area.cameraX;
    context.save();
    context.translate(centerX, centerY);
    context.scale(1, .5);
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.restore();
}
function drawTargetCircle(context, area: Area, x, z, radius, alpha) {
    drawGroundCircle(context, area, x, z, radius * RANGE_UNIT);
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = '#0FF';
    context.fill();
    context.globalAlpha = 1;
    context.lineWidth = 2;
    context.strokeStyle = '#0FF';
    context.stroke();
    context.restore();
}

function drawActionTargetCircle(targetContext) {
    let action = getHoverAction();
    if (!action) action = getSelectedAction();
    if (!action) {
        const hero = getState().selectedCharacter.hero;
        action = hero.activity.type === 'action' ? hero.activity.action : null;
    }
    if (!action) return;
    drawOnGround(context => {
        var area = editingMapState.editingLevelInstance || action.actor.area;
        if (action.stats.range) drawTargetCircle(context, area, action.actor.x, action.actor.z, action.stats.range + 1, .1);
        else if (action.stats.area) drawTargetCircle(context, area, action.actor.x, action.actor.z, action.stats.area, .1);
        else drawTargetCircle(context, area, action.actor.x, action.actor.z, 1, .1);
        const canvasCoords = getCanvasCoords();
        if (!canvasCoords) {
            return;
        }
        const targetLocation = getTargetLocation(area, canvasCoords[0], canvasCoords[1]);
        //console.log([targetLocation, targetLocation && canUseSkillOnTarget(action.actor, action, targetLocation)]);
        if (targetLocation && canUseSkillOnTarget(action.actor, action, targetLocation)) {
            drawTargetCircle(context, area, targetLocation.x, targetLocation.z, action.stats.area || .5, .3);
        }
    });
    //var context = bufferContext;
    //context.clearRect(0,0, bufferCanvas.width, bufferCanvas.height);
    //drawImage(targetContext, bufferCanvas, rectangle(0, 300, bufferCanvas.width, 180), rectangle(0, 300, bufferCanvas.width, 180));
}
