import { returnToGuild, returnToMap } from 'app/adventure';
import { upgradeButton } from 'app/ui/upgradeButton';
import { ADVENTURE_HEIGHT, ADVENTURE_WIDTH } from 'app/gameConstants';
import { requireImage } from 'app/images';
import { getCanvasPopupTarget } from 'app/popup';
import { drawHudFrameButton } from 'app/render/drawHud';
import { saveGame } from 'app/saveGame';
import { endlessPortalEntrance, getState } from 'app/state';
import { getJewelCraftingButtons } from 'app/ui/jewelCrafting';
import { createAnimation, drawFrame } from 'app/utils/animations';
import { isPointInShortRect } from 'app/utils/index';

import { HudButton, HudFrameButton } from 'app/types';

export function getGlobalHud(): HudButton[] {
    return [
        returnToMapButton,
        upgradeButton,
        ...getJewelCraftingButtons(),
    ];
}

const [rightArrow, leftArrow, rightArrowHover, leftArrowHover] = createAnimation('gfx2/hud/arrows.png', {w: 20, h: 20}, {cols: 4}).frames;

export const leftArrowButton: HudFrameButton = {
    frame: leftArrow,
    target: { x: 4, y: ADVENTURE_HEIGHT - leftArrow.h - 4, w: leftArrow.w, h: leftArrow.h},
    isPointOver(this: HudFrameButton, x, y) {
        return isPointInShortRect(x, y, this.target);
    },
    render(this: HudFrameButton, context) {
        const frame = (getCanvasPopupTarget() === this) ? leftArrowHover : leftArrow;
        drawFrame(context, frame, this.target);
    }
};
export const rightArrowButton: HudFrameButton = {
    frame: rightArrow,
    target: { x: ADVENTURE_WIDTH - 4 - rightArrow.w, y: ADVENTURE_HEIGHT - rightArrow.h - 4, w: rightArrow.w, h: rightArrow.h},
    isPointOver(this: HudFrameButton, x, y) {
        return isPointInShortRect(x, y, this.target);
    },
    render(this: HudFrameButton, context) {
        const frame = (getCanvasPopupTarget() === this) ? rightArrowHover : rightArrow;
        drawFrame(context, frame, this.target);
    }
};

const returnToMapButton: HudFrameButton = {
    frame: {'image': requireImage('gfx/worldIcon.png'), x: 0, y: 0, w: 72, h: 72},
    target: {x: ADVENTURE_HEIGHT - 25, y: 8, w: 18, h: 18},
    isVisible(this: HudFrameButton) {
        const character = getState().selectedCharacter;
        return character.context === 'field' && character.hero.area?.zoneKey !== 'guild';
    },
    isPointOver(this: HudFrameButton, x, y) {
        return isPointInShortRect(x, y, this.target);
    },
    render(this: HudFrameButton, context) {
        const character = getState().selectedCharacter;
        if (!character.hero.area?.zoneKey) {
            this.flashColor = getState().selectedCharacter.hero.levelInstance.completed ? 'white' : null;
        } else {
            this.flashColor = null;
        }
        drawHudFrameButton(context, this);
    },
    helpMethod(this: HudFrameButton) {
        const character = getState().selectedCharacter;
        if (!character.hero.area?.zoneKey) {
            return 'Return to Map';
        }
        return 'Return to Guild';
    },
    onClick(this: HudFrameButton) {
        const character = getState().selectedCharacter;
        const hero = character.hero;
        if (!hero.area?.zoneKey) {
            character.replay = false;
            returnToMap(character);
        } else if (character.endlessZone && character.endlessZone.key === hero.area.zoneKey) {
            character.endlessAreaPortal = {
                zoneKey: hero.area.zoneKey,
                areaKey: hero.area.key,
                // Constrain portal to the interior of the area.
                x: Math.max(32, Math.min(hero.area.width - 32, hero.x)),
                z: hero.z,
            };
            saveGame();
            returnToGuild(character, endlessPortalEntrance);
        } else {
            returnToGuild(character);
        }
    },
};