import { selectTrophy } from 'app/content/achievements';
import { characterClasses } from 'app/content/jobs';
import { bodyDiv, divider, titleDiv } from 'app/dom';
import { TROPHY_SIZE } from 'app/gameConstants';
import { bonusSourceHelpText } from 'app/helpText';
import { drawWhiteOutlinedFrame, drawSolidTintedFrame, drawCompositeTintedFrame } from 'app/images';
import { getCanvasCoords } from 'app/main';
import { getState } from 'app/state';

import { Bonuses, Color, Frame, JobKey, ShortRectangle } from 'app/types';

interface AchievementBonus {
    target: number,
    bonuses: Bonuses,
}

export default class JobAchievement {
    jobKey: JobKey;
    title: string;
    level: number;
    value: number;
    // These coordinates get set during drawTrophySelection.
    frame: Frame;
    tintFrame: Frame;
    bonusesArray: AchievementBonus[];
    // These fields track where the trophy is displayed if it is displayed.
    areaKey?: string;
    objectKey?: string;
    constructor(jobKey: JobKey, bonuses: [Bonuses, Bonuses, Bonuses, Bonuses]) {
        const job = characterClasses[jobKey];
        this.jobKey = jobKey;
        this.title = job.name + ' Trophy';
        this.level = 0;
        this.value = 0;
        const image = characterClasses[this.jobKey].achievementImage;
        this.frame = {
            image, x: 41, y: 0, w: 40, h: 40,
        };
        this.tintFrame = {
            image, x: 0, y: 0, w: 40, h: 40,
        }
        this.bonusesArray = [
            {target: 2, bonuses: bonuses[0]},
            {target: 10, bonuses: bonuses[1]},
            {target: 30, bonuses: bonuses[2]},
            {target: 60, bonuses: bonuses[3]},
        ];
    }
    render(context: CanvasRenderingContext2D, target: ShortRectangle) {
        const jobTrophyImage = characterClasses[this.jobKey].achievementImage;
        if (this.level === 0 ) {
            drawSolidTintedFrame(context, {...this.tintFrame, color: '#666'}, target);
            //context.save();
            //drawSolidTintedImage(context, jobTrophyImage, , {'left': 0, 'top': 0, 'width': 40, 'height': 40}, target);
            //context.restore();
            return;
        }
        let color: Color;
        if (this.level === 5) {
            // glow based on cursor distance
            var g = '30';
            const canvasCoords = getCanvasCoords();
            if (canvasCoords) {
                var dx = canvasCoords[0] - (target.x + target.w / 2);
                var dy = canvasCoords[1] - (target.y + target.h / 2);
                g = Math.max(48, Math.round(112 - Math.max(0, (dx * dx + dy * dy) / 100 - 20))).toString(16);
            }
            // glow in time
            //var g = Math.round(64 + 32 * (1 + Math.sin(now() / 400)) / 2).toString(16);
            if (g.length < 2) g = '0' + g;
            color ='#FF' + g + 'FF';
        } else {
            color = ['#C22', '#F84', '#CCD', '#FC0', '#F4F'][this.level - 1];
        }
        drawCompositeTintedFrame(context, {...this.tintFrame, color}, this.frame, target);
        /*drawSolidTintedFrame(context, , target);
        drawSolidTintedImage(context, jobTrophyImage, color, {'left': 0, 'top': 0, 'width': 40, 'height': 40}, target);
        drawImage(context, jobTrophyImage, {'left': 41, 'top': 0, 'width': 40, 'height': 40}, target);*/
    }
    helpMethod() {
        if (this.value === 0) return titleDiv('Mysterious Trophy') + bodyDiv('???');
        const state = getState();
        const parts = [];
        for (let i = 0; i < this.bonusesArray.length; i++) {
            const textColor = (this.level > i) ? 'white' : '#888';
            const levelData = this.bonusesArray[i];
            const levelText = '<div style="color: ' + textColor + ';">Level ' + levelData.target + ':<div>'
                + bonusSourceHelpText(levelData, state.selectedCharacter.hero)
                + '</div></div>';
            parts.push(levelText);
        }
        return titleDiv(this.title) + bodyDiv('Highest Level: ' + this.value + divider + parts.join('<br />'));
    }
    onClick() {
        selectTrophy(this, getState().selectedCharacter);
    }
}
