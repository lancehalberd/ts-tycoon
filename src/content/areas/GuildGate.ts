import { initializeActorForAdventure } from 'app/actor';
import { enterArea, getArea } from 'app/adventure';
import {
    EditableAreaObject,
    areaObjectFactories,
} from 'app/content/areas';
import { cutscenes } from 'app/content/cutscenes';
import { getMission, setupMission } from 'app/content/missions';
import { zones } from 'app/content/zones';
import { createCanvas } from 'app/dom';
import { drawArea } from 'app/drawArea';
import { BACKGROUND_HEIGHT } from 'app/gameConstants';
import { requireImage } from 'app/images';
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

export class GuildGate extends EditableAreaObject {

    missionKey: string;

    getFrame(): Frame {
        return {image: gateCanvas, x: 0, y: 0, w: PORTAL_WIDTH, h: PORTAL_HEIGHT, d: 0};
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

    clearMission(): void {
        this.missionKey = null;
        gateContext.clearRect(0, 0, PORTAL_WIDTH, PORTAL_HEIGHT);
    }
    setMission(missionKey: string): void {
        this.missionKey = missionKey;
        const missionParameters = getMission(this.missionKey);
        const area = getArea(missionParameters.zoneKey, missionParameters.areaKey);
        area.cameraX = 0;
        gateContext.save();
            gateContext.scale(0.5, 0.5);
            gateContext.translate(0, -BACKGROUND_HEIGHT / 2);
            drawArea(gateContext, area);
        gateContext.restore();
    }
}
areaObjectFactories.guildGate = GuildGate;
