import { ADVENTURE_HEIGHT, ADVENTURE_WIDTH, BACKGROUND_HEIGHT, BOTTOM_HUD_HEIGHT, MISSION_ANIMATION_LENGTH } from 'app/gameConstants';

import { ActiveMission } from 'app/types';

export function drawMissionHUD(context: CanvasRenderingContext2D, mission: ActiveMission) {
    if (mission.parameters.type === 'dream') {
        return;
    }
    context.fillStyle = 'white';
    context.fillRect(0, ADVENTURE_HEIGHT - BOTTOM_HUD_HEIGHT, ADVENTURE_WIDTH, BOTTOM_HUD_HEIGHT);
    context.fillStyle = 'black';
    context.fillRect(2, ADVENTURE_HEIGHT - BOTTOM_HUD_HEIGHT + 2, ADVENTURE_WIDTH - 4, BOTTOM_HUD_HEIGHT - 4);

    context.font = "12px sans-serif";
    context.fillStyle = 'white';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    const y = ADVENTURE_HEIGHT - BOTTOM_HUD_HEIGHT / 2;
    if (mission.parameters.type === 'clearZone') {
        context.fillText(`Targets: ${mission.defeatedEnemies} / ${mission.totalEnemies}`, 150, y);
    } else if (mission.parameters.type === 'defeatTarget') {
        context.fillText(`Targets: ${mission.defeatedTargets} / ${mission.totalTargets}`, 150, y);
    }
    if (mission.parameters.timeLimit > 0) {
        let secondsLeft = Math.max(0, Math.floor((mission.parameters.timeLimit - mission.time) / 1000));
        let minutesLeft = Math.floor(secondsLeft / 60);
        secondsLeft %= 60;
        const secondsString = secondsLeft < 10 ? `0${secondsLeft}` : `${secondsLeft}`;
        context.fillText(`Time: ${minutesLeft}:${secondsString}`, 250, y);
    }

    context.font = "16px sans-serif";
    context.fillStyle = 'white';
    context.textAlign = 'center';
    if (!mission.started) {
        // Fade text in and out at start of mission.
        const timeFromEnd = MISSION_ANIMATION_LENGTH - mission.animationTime;
        context.save();
            context.globalAlpha = Math.min(1, mission.animationTime / 500, timeFromEnd / 500);
            context.restore();
        context.fillText(`${mission.parameters.name}`, ADVENTURE_WIDTH / 2, BACKGROUND_HEIGHT / 2);
        if (mission.animationTime % 1000 >= 500) {
            context.fillText(`START`, ADVENTURE_WIDTH / 2, BACKGROUND_HEIGHT / 2 + 20);
        }
    } else if (mission.completed) {
        context.save();
            context.globalAlpha = Math.min(1, mission.animationTime / 500);
            context.fillText(`Mission Complete!`, ADVENTURE_WIDTH / 2, BACKGROUND_HEIGHT / 2);
        context.restore();
    } else if (mission.failed) {
        context.fillStyle = '#A44';
        context.save();
            context.globalAlpha = Math.min(1, mission.animationTime / 500);
            context.fillText(`Mission Failed!`, ADVENTURE_WIDTH / 2, BACKGROUND_HEIGHT / 2);
        context.restore();
    }
}
