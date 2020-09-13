import { initializeActorForAdventure } from 'app/actor';
import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
    drawFrameToAreaTarget,
} from 'app/content/areas';
import { cutscenes } from 'app/content/cutscenes';
import { generateEndlessZone } from 'app/content/endlessZone';
import { getMission, setupMission } from 'app/content/missions';
import { zones } from 'app/content/zones';
import { bodyDiv, createCanvas, titleDiv, } from 'app/dom';
import { drawArea } from 'app/drawArea';
import { ADVENTURE_WIDTH, BACKGROUND_HEIGHT, FRAME_LENGTH } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';
import { r } from 'app/utils/index';

import {
    Area, AreaObject, AreaObjectTarget, BaseAreaObjectDefinition, Character, Exit,
    Frame, FrameAnimation, Hero,
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

export class EndlessGate extends EditableAreaObject {

    endlessArea: Area;
    animationTime: number = -1;

    update() {
        // Animation runs forward/backward depending on whether there is an active mission.
        const portal = getState().selectedCharacter?.endlessAreaPortal;
        const portalMatches = this.endlessArea?.zoneKey === portal?.zoneKey
            && this.endlessArea?.key === portal?.areaKey;
        if (portal && portalMatches) {
            // Portal is opening if the current character has a portal and the portal points to the correct area.
            this.animationTime = Math.max(this.animationTime + FRAME_LENGTH, 0);
        } else {
            // Otherwise the portal is closing.
            this.animationTime = Math.min(this.animationTime - FRAME_LENGTH, portalAnimation.duration);
            // If the portal is completely closed, we can clear the current area or change it to match
            // the current character's portal.
            if (this.animationTime <= 0) {
                if (!portal) {
                    this.endlessArea = null;
                } else if (portal && !portalMatches) {
                    // Update the area displayed if it isn't the correct one.
                    this.setEndlessArea(getState().selectedCharacter);
                }
            }
        }
    }

    getFrame(): Frame {
        return getFrame(gateAnimation, this.area.time);
    }

    onInteract(hero: Hero) {
        if (hero.character.endlessAreaPortal) {
            initializeActorForAdventure(hero);
            enterArea(hero, hero.character.endlessAreaPortal);
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
        } else if (getState().selectedCharacter?.endlessAreaPortal) {
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

    setEndlessArea(character: Character): void {
        const [endless, level, radius, thetaI] = character.endlessAreaPortal.zoneKey.split(':').map(Number);
        // Use the existing instance of this endless zone if it is currently on the character, otherwise
        // just generate a new instance.
        const endlessZone = character.endlessZone?.key ===  character.endlessAreaPortal.zoneKey
            ? character.endlessZone
            : generateEndlessZone(
                character.endlessSeed,
                { thetaI, radius, level }
            );
        const area = endlessZone.areas[character.endlessAreaPortal.areaKey];
        // If we change the generator, the same area may not exist, or the coordinates may be
        // off the right edge of the area. In this case just scrap the portal, we may not even save
        // portals across sessions eventually.
        if (!area || character.endlessAreaPortal.x > area.width - 32) {
            character.endlessAreaPortal = null;
            return;
        }
        this.endlessArea = area;
        area.cameraX = Math.max(0, character.endlessAreaPortal.x - ADVENTURE_WIDTH / 2);
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
    helpMethod(): string {
        const portal = getState().selectedCharacter?.endlessAreaPortal;
        if (!portal) {
            return;
        }
        const [endless, level, radius, thetaI] = portal.zoneKey.split(':').map(Number);
        return titleDiv(`Lvl ${level} Area`) + bodyDiv(`${radius} miles out`);
    }
}
areaObjectFactories.endlessGate = EndlessGate;
