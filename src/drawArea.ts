import { returnToGuild, returnToMap } from 'app/adventure';
import { getSprite } from 'app/content/actors';
import { areaTargetToScreenTarget, areaTypes } from 'app/content/areas';
import { effectAnimations } from 'app/content/effectAnimations';
import { upgradeButton } from 'app/content/upgradeButton';
import { editingMapState } from 'app/development/editLevel'
import { editingAreaState } from 'app/development/editArea';
import { createCanvas } from 'app/dom';
import { getHoverAction, getSelectedAction } from 'app/render/drawActionShortcuts';
import {
    ADVENTURE_HEIGHT, ADVENTURE_WIDTH, BACKGROUND_HEIGHT, BOTTOM_HUD_HEIGHT, FIELD_HEIGHT,
    FRAME_LENGTH, GROUND_Y, MIN_SLOW, RANGE_UNIT
} from 'app/gameConstants';
import { getCanvasCoords, getTargetLocation } from 'app/main';
import {
    drawImage, drawWhiteOutlinedFrame, drawTintedFrame,
    prepareTintedImage, requireImage,
} from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { drawActorEffects, drawActorShadow } from 'app/render/drawActor';
import { getState } from 'app/state';
import { canUseSkillOnTarget } from 'app/useSkill';
import { drawFrame, getFrame } from 'app/utils/animations';
import { arrMod, isPointInShortRect, rectangle, toR } from 'app/utils/index';

import { ActionData, Actor, ActorEffect, FrameAnimation, Area, AreaObject, AreaType } from 'app/types';

export const bufferCanvas: HTMLCanvasElement = createCanvas(ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
export const bufferContext = bufferCanvas.getContext('2d');
bufferContext.imageSmoothingEnabled = false;
// document.body.append(bufferCanvas);

export function getGlobalHud() {
    return [
        returnToMapButton,
        upgradeButton,
    ];
}
export function drawHud(context: CanvasRenderingContext2D) {
    for (const element of getGlobalHud()) {
        if (element.isVisible && !element.isVisible()) continue;
        element.render(context);
    }
}

export function drawOnGround(context: CanvasRenderingContext2D, render: (context: CanvasRenderingContext2D) => void) {
    bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    render(bufferContext);
    drawImage(context, bufferCanvas,
        rectangle(0, BACKGROUND_HEIGHT, bufferCanvas.width, FIELD_HEIGHT),
        rectangle(0, BACKGROUND_HEIGHT, bufferCanvas.width, FIELD_HEIGHT)
    );
}

export function drawArea(context: CanvasRenderingContext2D, area: Area) {
    // Rather than replace all the cameraX update logic, we just override the value here.
    if (editingAreaState.isEditing) {
        area.cameraX = editingAreaState.cameraX;
    }
    const cameraX = area.cameraX;
    context.clearRect(0, 0, ADVENTURE_WIDTH, ADVENTURE_HEIGHT);
    const areaTypeKey: string = area.areaType;
    const areaType: AreaType = areaTypes[areaTypeKey] || areaTypes.field;
    areaType.drawFloor(context, area);
    const allSprites: {
        z?: number,
        drawGround?: Function,
        getAreaTarget?: Function,
        render?: Function,
    }[] = [
        ...area.allies,
        ...area.enemies,
        ...area.objects,
        ...area.projectiles,
        ...area.treasurePopups,
        ...area.effects
    ];
    const allActors = area.allies.concat(area.enemies);
    const fairy = getSprite();
    // Usually fairy is not in the list of enemies/allies so she doesn't effect combat,
    // but during cutscenes she will be in the list of allies.
    if (fairy.area === area && allSprites.indexOf(fairy) < 0) {
        allSprites.push(fairy);
        allActors.push(fairy);
    }
    // Draw effects that appear underneath sprites. Do not sort these, rather, just draw them in
    // the order they are present in the arrays.
    for (const sprite of allSprites) {
        sprite.drawGround?.(context);
    }

    for (const actor of allActors) {
        drawActorShadow(context, actor);
        drawActorGroundEffects(context, actor);
    }
    drawActionTargetCircle(context);
    areaType.drawBackground(context, area);
    drawLeftWall(context, area);
    drawRightWall(context, area);
    if (area.wallDecorations) {
        for (const object of area.wallDecorations) object.render(context);
    }
    const sortedSprites = allSprites.slice().sort(function (spriteA, spriteB) {
        const A = spriteA.getAreaTarget ? spriteA.getAreaTarget().z : (spriteA.z || 0);
        const B = spriteB.getAreaTarget ? spriteB.getAreaTarget().z : (spriteB.z || 0);
        return B - A;
    });
    for (const sprite of sortedSprites) {
        if (sprite.render) {
            sprite.render(context);
        }
    }
    //for (var effect of ifdefor(area.effects, [])) effect.render(context, effect);
    // Draw actor lifebar/status effects on top of effects/projectiles
    allActors.forEach(actor => drawActorEffects(context, actor));
    // Draw text popups such as damage dealt, item points gained, and so on.
    for (const textPopup of (area.textPopups || [])) {
        context.fillStyle = (textPopup.color|| "red");
        const scale = Math.max(0, Math.min(1.5, (textPopup.duration || 0) / 10));
        context.font = 'bold ' + Math.round(scale * (textPopup.fontSize || 20)) + "px 'Cormorant SC', Georgia, serif";
        context.textAlign = 'center'
        context.fillText(textPopup.value, textPopup.x - cameraX, GROUND_Y - textPopup.y - textPopup.z / 2);
    }
    if (areaType.drawForeground) {
        areaType.drawForeground(context, area);
    }
}
function drawRune(context: CanvasRenderingContext2D, actor: Actor, animation: FrameAnimation, frameIndex: number) {
    context.save();
        context.translate((actor.x - actor.area.cameraX), GROUND_Y - actor.z / 2);
        const frame = animation.frames[frameIndex];
        const size = [frame.w, frame.h];
        drawFrame(context, frame, {x: -size[0] / 2, y: -size[1] / 2, w: size[0], h: size[1]});
    context.restore();
}
function drawActorGroundEffects(context: CanvasRenderingContext2D, actor: Actor) {
    const usedEffects = new Set();
    for (const effect of actor.allEffects) {
        const base = effect.base as {drawGround?: Function};
        if (!base.drawGround) continue;
        // Don't draw the same effect animation twice on the same character.
        if (usedEffects.has(base)) continue;
        usedEffects.add(base);
        base.drawGround(context, actor);
    }
    if (!actor.pull && !actor.stunned && !actor.isDead && actor.skillInUse && actor.recoveryTime === 0) {
        if (actor.skillInUse.variableObject.tags['spell']) {
            const castAnimation = effectAnimations.cast;
            const castFrame = Math.floor(actor.preparationTime / actor.skillInUse.totalPreparationTime * castAnimation.frames.length);
            if (castFrame < castAnimation.frames.length) {
                drawOnGround(context, groundContext => {
                    drawRune(groundContext, actor, castAnimation, castFrame);
                });
            }
        }
    }
    // Draw skill warnings for scary avoidable attacks.
    if (actor.skillInUse &&
        actor.area.enemies.indexOf(actor) >= 0 &&
        // Don't bother showing warnings if the prep time isn't at least 0.5 seconds.
        actor.skillInUse.totalPreparationTime >= 0.5
    ) {
        const data: ActionData = actor.skillInUse.source.action;
        // Draw a line from the actor to the target for skills that
        // target a direction like 'recklessCharge'.
        if (actor.skillInUse.variableObject.tags.targetsDirection) {
            const source = areaTargetToScreenTarget(actor);
            const target = areaTargetToScreenTarget(actor.skillTarget);
            context.strokeStyle = 'red';
            context.lineWidth = actor.d;
            context.save();
                context.globalAlpha = 0.3;
                context.beginPath();
                context.moveTo(source.x + source.w / 2, source.y + source.h);
                context.lineTo(target.x + target.w / 2, target.y + target.h);
                context.stroke();
            context.restore();
            const p = Math.min(1, actor.preparationTime / actor.skillInUse.totalPreparationTime);
            context.lineWidth = actor.d * p;
            context.beginPath();
            context.moveTo(source.x + source.w / 2, source.y + source.h);
            context.lineTo(target.x + target.w / 2, target.y + target.h);
            context.stroke();
        }
    }
}
export function drawMinimap(context: CanvasRenderingContext2D, area: Area) {
    const height = 3;
    const width = ADVENTURE_WIDTH - 20;
    const numberOfAreas = area.areas.size;
    let areaIndex = 0;
    let i = 0;
    let y = ADVENTURE_HEIGHT - BOTTOM_HUD_HEIGHT / 2;
    let x = 10;
    for (const [key, mapArea] of area.areas) {
        if (mapArea === area) {
            areaIndex = i + 1;
            break;
        }
        i++;
    }
    drawBar(context, x, y, width, height, 'white', 'white', areaIndex / numberOfAreas);
    i = 0;
    area.areas.forEach(mapArea => {
        const centerX = x + (i + 1) * width / area.areas.size;
        const centerY = y + height / 2;
        context.fillStyle = 'white';
        context.beginPath();
            context.arc(centerX, centerY, 11, 0, 2 * Math.PI);
        context.fill();
        i++;
    });
    context.fillStyle = 'orange';
    context.fillRect(x + 1, y + 1, (width - 2) * (areaIndex / numberOfAreas) - 5, height - 2);
    i = 0;
    area.areas.forEach(mapArea => {
        const centerX = x + (i + 1) * width / numberOfAreas;
        const centerY = y + height / 2;
        if (i < areaIndex) {
            context.fillStyle = 'orange';
            context.beginPath();
            context.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            context.fill();
        }
        const areaCompleted = !(mapArea.enemies || []).length;
        mapArea.drawMinimapIcon(context, areaCompleted, centerX, centerY);
        i++;
    });
}

function drawHudElement(context, element) {
    if (getCanvasPopupTarget() === element) {
        drawWhiteOutlinedFrame(context, element.frame, element);
    } else if (element.flashColor) {
        drawTintedFrame(context,
            {...element.frame, color: element.flashColor, amount: .5 + .2 * Math.sin(Date.now() / 150)},
            element
        );
    } else {
        drawFrame(context, element.frame, element);
    }
}

const returnToMapButton = {
    frame: {'image': requireImage('gfx/worldIcon.png'), x: 0, y: 0, w: 72, h: 72},
    isVisible() {
        const character = getState().selectedCharacter;
        return character.context === 'field' && character.hero.area?.zoneKey !== 'guild';
    },
    isPointOver(x, y) {
        return isPointInShortRect(x, y, this);
    },
    render(context) {
        const character = getState().selectedCharacter;
        if (!character.hero.area?.zoneKey) {
            this.flashColor = getState().selectedCharacter.hero.levelInstance.completed ? 'white' : null;
        } else {
            this.flashColor = null;
        }
        drawHudElement(context, this);
    },
    x: ADVENTURE_HEIGHT - 25, y: 8, w: 18, h: 18,
    helpMethod() {
        const character = getState().selectedCharacter;
        if (!character.hero.area?.zoneKey) {
            return 'Return to Map';
        }
        return 'Return to Guild';
    },
    onClick() {
        const character = getState().selectedCharacter;
        if (!character.hero.area?.zoneKey) {
            character.replay = false;
            returnToMap(character);
        } else {
            returnToGuild(character);
        }
    },
};

export function drawBar(context, x, y, w, h, background, color, percent) {
    x = x | 0;
    y = y | 0;
    // Since this is used for health bars, I want to use ceil so that the bar
    // is never empty unless the value is actually 0.
    w = Math.ceil(w);
    h = h | 0;
    percent = Math.max(0, Math.min(1, percent));
    if (background) {
        context.fillStyle = background;
        context.fillRect(x, y, w, h);
    }
    context.fillStyle = color;
    context.fillRect(x + 1, y + 1, Math.floor((w - 2) * percent), h - 2);
}

export function drawGroundCircle(context: CanvasRenderingContext2D, area: Area, x, z, radius) {
    const centerY = GROUND_Y - z / 2;
    const centerX = x - area.cameraX;
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
    drawOnGround(targetContext, context => {
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

function drawRightWall(context: CanvasRenderingContext2D, area: Area) {
    if (!area.rightWall) {
        return;
    }
    const frame = getFrame(area.rightWall, area.time);
    if (area.cameraX + 320 < area.width - frame.w) {
        return;
    }
    const target = {
        ...frame,
        x: area.width - area.cameraX - frame.w,
        y: 0,
    }
    drawFrame(context, frame, target);
}

function drawLeftWall(context: CanvasRenderingContext2D, area: Area) {
    if (!area.leftWall) {
        return;
    }
    const frame = getFrame(area.leftWall, area.time);
    if (area.cameraX > frame.w) {
        return;
    }
    context.save();
        context.translate(frame.w - area.cameraX, 0);
        context.scale(-1, 1);
        drawFrame(context, frame, {...frame, x: 0, y: 0});
    context.restore();
}
