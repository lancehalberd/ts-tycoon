import { initializeActorForAdventure } from 'app/actor';
import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    drawFrameToAreaTarget,
} from 'app/content/areas';
import { cutscenes } from 'app/content/cutscenes';
import { getMission, setupMission } from 'app/content/missions';
import { zones } from 'app/content/zones';
import { createCanvas } from 'app/dom';
import { drawArea } from 'app/drawArea';
import { BACKGROUND_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    FrameAnimation, Area, AreaObject, BaseAreaObjectDefinition, AreaObjectTarget, Exit, Frame, Hero,
    MissionParameters, ShortRectangle,
} from 'app/types';

const PORTAL_WIDTH = 35;
const PORTAL_HEIGHT = 50;
const gateCanvas = createCanvas(PORTAL_WIDTH, PORTAL_HEIGHT);
const gateContext = gateCanvas.getContext('2d');

const gateAnimation = createAnimation('gfx2/objects/portalsheet.png',
    {w: 64, h: 64, d: 16}, {x: 4, cols: 1});

const portalAnimation = createAnimation('gfx2/objects/portalsheet.png',
    {w: 64, h: 64, d: 16}, {x: 1, cols: 3});

export class GuildGate extends EditableAreaObject {

    missionKey: string;
    animationTime: number = -1;

    update() {
        // Animation runs forward/backward depending on whether there is an active mission.
        if (this.missionKey) {
            this.animationTime += FRAME_LENGTH;
        } else {
            this.animationTime -= FRAME_LENGTH;
        }
    }

    getFrame(): Frame {
        return getFrame(gateAnimation, this.area.time);
        }

    onInteract(hero: Hero) {
        if (this.missionKey) {
            const mission = setupMission(hero.character, this.missionKey);
            if (mission.parameters.introKey && !getState().savedState.completedCutscenes[mission.parameters.introKey]) {
                const cutscene = cutscenes[mission.parameters.introKey];
                if (cutscene) {
                    cutscene.run();
                    return;
                } else {
                    console.error(`Missing cutscene '${mission.parameters.introKey}'`);
                    debugger;
                }
            }
            initializeActorForAdventure(hero);
            enterArea(hero, {zoneKey: mission.parameters.zoneKey, areaKey: mission.parameters.areaKey, x: 60, z: 0});
        }
    }

    render(context: CanvasRenderingContext2D): void {
        // Draw the target location behind the gate graphics.
        const areaTarget = this.getAreaTarget();
        if (this.animationTime >= 0 && this.animationTime < portalAnimation.duration) {
            drawFrameToAreaTarget(
                context,
                areaTarget,
                {...getFrame(portalAnimation, this.animationTime), flipped: this.definition.flipped},
                drawFrame,
                false
            );
        } else if (this.missionKey) {
            const canvasFrame = {image: gateCanvas, x: 0, y: 0, w: 64, h: 64, content: {x: -14, y: -8, w: 64, h: 64, d: 0}};
            // Draw the portal target location if there is a mission and the portal animation is finished.
            drawFrameToAreaTarget(
                context,
                areaTarget,
                {...canvasFrame, flipped: this.definition.flipped},
                drawFrame,
                false
            );
            context.save();
                context.globalAlpha = (getCanvasPopupTarget() === this) ? 0.6 :  0.2 + 0.1 * Math.sin(2 * this.area.time);
                drawFrameToAreaTarget(
                    context,
                    areaTarget,
                    {...portalAnimation.frames[2], flipped: this.definition.flipped},
                    drawFrame,
                    false
                );
            context.restore();
        }
        // Draw the gate on top of the portal scene to cover up the corners.
        const gateFrame = getFrame(gateAnimation, this.area.time * 1000);
        drawFrameToAreaTarget(
            context,
            areaTarget,
            {...gateFrame, flipped: this.definition.flipped},
            drawFrame,
            false
        );
    }

    clearMission(): void {
        if (this.missionKey && getState().selectedCharacter.hero.area === this.area) {
            // Start the portal animation at the end. It will play backward to show the portal closing.
            this.animationTime = portalAnimation.duration;
        } else {
            // Don't play the animation if it happens off screen.
            this.animationTime = -1;
        }
        this.missionKey = null;
        gateContext.clearRect(0, 0, PORTAL_WIDTH, PORTAL_HEIGHT);
    }
    setMission(missionKey: string): void {
        this.missionKey = missionKey;
        const missionParameters = getMission(this.missionKey);
        const area = getArea(missionParameters.zoneKey, missionParameters.areaKey);
        area.cameraX = 0;
        gateContext.save();
            //gateContext.scale(0.5, 0.5);
            gateContext.translate(-30, -3 * BACKGROUND_HEIGHT / 4);
            drawArea(gateContext, area);
        gateContext.restore();
        if (getState().selectedCharacter.hero.area === this.area) {
            this.animationTime = 0;
        } else {
            // Don't play the animation if it happens off screen.
            this.animationTime = portalAnimation.duration;
        }
    }
}
areaObjectFactories.guildGate = GuildGate;
