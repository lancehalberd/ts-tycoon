import { difficultyBonusMap } from 'app/adventure';
import { baseDivinity, totalCostForNextLevel } from 'app/character';
import { abilities, getAbilityIconSource } from 'app/content/abilities';
import { closedChestSource, openChestSource } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { editingMapState } from 'app/development/editLevel';
import { mainContext } from 'app/dom';
import { MAP_LEFT, MAP_TOP, MAP_WIDTH, MAP_HEIGHT, WORLD_RADIUS } from 'app/gameConstants';
import { drawAbilityIcon, drawImage, requireImage } from 'app/images';
import { mapLocation, mapState } from 'app/map';
import { shrineSource } from 'app/render';
import { drawTextureMap } from 'app/render/drawTextureMap';
import { getState } from 'app/state';
import { abbreviate } from 'app/utils/formatters';
import { rectangle, shrinkRectangle } from 'app/utils/index';
import Vector from 'app/utils/Vector';
import { worldCamera } from 'app/WorldCamera';

import { FullRectangle, LevelData, Rectangle } from 'app/types';

const lineColors = ['#0ff', '#08f', '#00f', '#80f', '#f0f', '#f08', '#f00','#f80','#ff0','#8f0','#0f0', '#0f8'];
const mapTexture = requireImage('gfx/squareMap.bmp');

const checkSource = {image: requireImage('gfx/militaryIcons.png'), left: 68, top: 90, width: 16, height: 16};
const bronzeSource = {...checkSource, left: 102, top: 40};
const silverSource = {...checkSource, left: 85, top: 40};
const goldSource = {...checkSource, left: 68, top: 40};

export function drawMap(): void {
    const context = mainContext;
    context.fillStyle = '#fea';
    context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    const visibleRectangle = rectangle(MAP_LEFT - 20, MAP_TOP - 20, MAP_WIDTH + 40, MAP_HEIGHT + 50);
    worldCamera.position = mapLocation.position.normalize(WORLD_RADIUS * 2);
    worldCamera.forward = worldCamera.position.normalize(-1);
    worldCamera.fixRightAndUp();
    worldCamera.updateRotationMatrix();
    const renderedLines = [];
    const latitudes = [];
    for (let rho = 0; rho < Math.PI + .1; rho += Math.PI / 10) {
        latitudes.push(rho);
    }
    // Poles look bad so add one more point just before the poles on both ends.
    latitudes.splice(1, 0, Math.PI / 50);
    latitudes.splice(latitudes.length - 1, 0, Math.PI  - Math.PI / 50);
    for (let theta = 0; theta < Math.PI * 2 + .1; theta += Math.PI / 6) {
        const renderedLine = [];
        for (const rho of latitudes) {
            const z = Math.cos(rho) * WORLD_RADIUS;
            const r = Math.sin(rho) * WORLD_RADIUS;
            const x = Math.cos(theta - 4 * Math.PI / 6) * r;
            const y = Math.sin(theta - 4 * Math.PI / 6) * r;
            const visible = (new Vector([x, y, z]).dotProduct(worldCamera.forward) <= 0);
            const newPoint = {visible, x: 0, y: 0, u: 0, v: 0};
            renderedLine.push(newPoint);
            //console.log([theta / Math.PI, rho / Math.PI, x,y,z]);
            if (!visible) continue;
            const point = worldCamera.projectPoint([x, y, z]);
            newPoint.x = point[0] - MAP_LEFT;
            newPoint.y = point[1] - MAP_TOP;
            newPoint.u = 800 - Math.round(800 * (theta) / (2 * Math.PI));
            newPoint.v = 400 - Math.round(400 * rho / Math.PI);
        }
        renderedLines.push(renderedLine);
    }
    for (let i = 0; i < renderedLines.length - 1; i++) {
        const lineA = renderedLines[i];
        const lineB = renderedLines[i + 1];
        for (let j = 1; j < lineA.length - 1; j++) {
            let A = lineB[j ];
            let B = lineB[j - 1];
            let C = lineA[j];
            if (A.visible && B.visible && C.visible) {
                drawTextureMap(context, mapTexture, [A, B, C]);
            }
            A = lineB[j];
            B = lineA[j];
            C = lineA[j + 1];
            if (A.visible && B.visible && C.visible) {
                drawTextureMap(context, mapTexture, [A, B, C]);
            }
        }
    }
    for (let i = 0; i < renderedLines.length - 1; i++) {
        let lastPoint;
        const line = renderedLines[i];
        context.beginPath();
        context.strokeStyle = lineColors[lineColors.length - i - 1];
        for (let j = 0; j < line.length; j++) {
            const point = line[j];
            if (!point.visible) {
                lastPoint = null;
                continue;
            }
            if (lastPoint) context.lineTo(point.x, point.y);
            else context.moveTo(point.x, point.y);
            lastPoint = point;
        }
        context.stroke();
    }
    if (editingMapState.editingMap) {
        context.strokeStyle = '#000';
        context.globalAlpha = .5;
        context.beginPath();
        for (let rho = Math.PI / 10; rho < Math.PI; rho += Math.PI / 10) {
            let lastPoint;
            for (let theta = 0; theta < Math.PI * 2 + .1; theta += Math.PI / 6) {
                const z = Math.cos(rho) * WORLD_RADIUS;
                const r = Math.sin(rho) * WORLD_RADIUS;
                const x = Math.cos(theta) * r;
                const y = Math.sin(theta) * r;
                //console.log(point);
                if (new Vector([x, y, z]).dotProduct(worldCamera.forward) > 0) {
                    lastPoint = null;
                    continue;
                }
                const point = worldCamera.projectPoint([x, y, z]);
                if (lastPoint) {
                    context.lineTo(point[0] - MAP_LEFT, point[1] - MAP_TOP);
                } else {
                    lastPoint = point;
                    context.moveTo(point[0] - MAP_LEFT, point[1] - MAP_TOP);
                }
            }
        }
        context.stroke();
        context.globalAlpha = 1;
    }
    mapState.visibleNodes = {};
    const state = getState();
    for (let levelKey in map) {
        const levelData: LevelData = map[levelKey];
        if (!editingMapState.editingMap && !levelData.isGuildArea && !state.visibleLevels[levelKey]) {
            continue;
        }
        if (new Vector(levelData.coords).dotProduct(worldCamera.forward) <= 0) {
            const projectedPoint = worldCamera.projectPoint(levelData.coords);
            levelData.left = projectedPoint[0] - 20 - MAP_LEFT;
            levelData.top = projectedPoint[1] - 20 - MAP_TOP;
            mapState.visibleNodes[levelKey] = levelData;
            const skill = abilities[levelData.skill];
            if (skill) {
                levelData.shrine = {
                    ...rectangle(levelData.left - 20, levelData.top - 20, 40, 40),
                    targetType: 'shrine',
                    level: levelData,
                };
            }
        } else {
            // Put nodes on the reverse of the sphere
            levelData.left = levelData.top = 4000;
        }
        levelData.width = levelData.height = 40;
    }
    mapState.movedMap = false;
    // Draw lines connecting connected nodes.
    context.save();
    if (!editingMapState.editingMap) {
        context.strokeStyle = 'black';
        context.setLineDash([8, 12]);
        context.lineWidth = 1;
        context.globalAlpha = .5;
    } else {
        context.lineWidth = 5;
    }
    const { editingMap, selectedMapNodes } = editingMapState;
    const { visibleNodes } = mapState;
    for (let levelKey in visibleNodes) {
        const levelData = visibleNodes[levelKey];
        for (const nextLevelKey of (levelData.unlocks, [])) {
            if ((editingMap || (state.visibleLevels[levelKey] && state.visibleLevels[nextLevelKey])) && (visibleNodes[levelKey] && visibleNodes[nextLevelKey])) {
                const nextLevelData: LevelData = map[nextLevelKey];
                context.beginPath();
                // Draw a triangle while editing the map so it is obvious which levels are unlocked by completing a level.
                if (editingMap) {
                    context.strokeStyle = 'white';
                    if (editingMap && (selectedMapNodes.indexOf(levelData) >= 0 || selectedMapNodes.indexOf(nextLevelData) >= 0)) {
                        context.strokeStyle = '#f00';
                    }
                    drawMapArrow(context, levelData as FullRectangle, nextLevelData as FullRectangle);
                } else {
                    drawMapPath(context, levelData as FullRectangle, nextLevelData as FullRectangle);
                    context.moveTo(levelData.left + levelData.width / 2, levelData.top + levelData.height / 2);
                    context.lineTo(nextLevelData.left + nextLevelData.width / 2, nextLevelData.top + nextLevelData.height / 2);
                    context.stroke();
                }
            }
        }
    }
    context.restore();
    // Draw ovals for each node.
    for (let levelKey in visibleNodes) {
        const levelData = visibleNodes[levelKey];
        context.fillStyle = 'white';
        if (editingMap && selectedMapNodes.indexOf(levelData) >= 0) {
            context.fillStyle = '#f00';
        }
        context.beginPath();
        context.save();
        context.translate(levelData.left + levelData.width / 2, levelData.top + levelData.height / 2);
        context.scale(1, .5);
        context.arc(0, 0, 22, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }
    // Draw treasure chests on each node.
    for (let levelKey in visibleNodes) {
        const levelData = visibleNodes[levelKey];
        if (editingMap) {
            const source = closedChestSource;
            drawImage(context, source.image, source.source, rectangle(levelData.left + levelData.width / 2 - 16, levelData.top + levelData.height / 2 - 18, 32, 32));
            context.fillStyle = new Vector(levelData.coords).dotProduct(worldCamera.forward) >= 0 ? 'red' : 'black';
            context.fillRect(levelData.left - 30, levelData.top + 19, 100, 15);
            context.fillStyle = 'white';
            context.font = '10px sans-serif';
            context.textAlign = 'center'
            context.textBaseline = 'middle';
            //context.fillText(levelData.coords.map(function (number) { return number.toFixed(0);}).join(', '), levelData.left + 20, levelData.top + 45);
            context.fillText((levelData.level || '') + ' ' + levelData.name, levelData.left + 20, levelData.top + 27);
            if (levelData.skill) {
                context.fillStyle = new Vector(levelData.coords).dotProduct(worldCamera.forward) >= 0 ? 'red' : 'black';
                context.fillRect(levelData.left - 30, levelData.top + 34, 100, 15);
                context.fillStyle = 'white';
                context.fillText(levelData.skill, levelData.left + 20, levelData.top + 41);
            }
            var skill = abilities[levelData.skill];
            // For some reason this was: getAbilityIconSource(skill, shrineSource)
            if (skill) {
                drawAbilityIcon(context, getAbilityIconSource(skill), levelData.shrine);
            }
            continue;
        }

        var skill = abilities[levelData.skill];
        if (skill) {
            // Draw the shrine only if the level grants a skill.
            context.save();
            var skillLearned = state.selectedCharacter.adventurer.unlockedAbilities[skill.key];
            var canAffordSkill = state.selectedCharacter.divinity >= totalCostForNextLevel(state.selectedCharacter, levelData);
            // Draw she shrine partially tansparent if the character needs more divinity to learn this skill.
            if (!skillLearned && !canAffordSkill) context.globalAlpha = .5;
            else context.globalAlpha = 1;
            drawAbilityIcon(context, getAbilityIconSource(skill), levelData.shrine);
            // If the character has learned the ability for this level, draw a check mark on the shrine.
            context.globalAlpha = 1;
            if (skillLearned) drawImage(context, checkSource.image, checkSource, shrinkRectangle(levelData.shrine, 8));
            context.restore();
        }
        if (state.selectedCharacter.currentLevelKey === levelKey) {
            context.save();
            context.translate(levelData.left + 25, levelData.top - 40);
            context.drawImage(state.selectedCharacter.adventurer.personCanvas, state.selectedCharacter.adventurer.source.walkFrames[1] * 96, 0 , 96, 64, -32, 0, 96, 64);
            context.restore();
        }

        const times = state.selectedCharacter.levelTimes[levelKey] || {};
        var source = (times['easy'] && times['normal'] && times['hard']) ? openChestSource : closedChestSource;
        drawImage(context, source.image, source.source, rectangle(levelData.left + levelData.width / 2 - 16, levelData.top + levelData.height / 2 - 18, 32, 32));

        context.save();
        context.fillStyle = 'black';
        context.globalAlpha = .3;
        context.fillRect(levelData.left + 9, levelData.top + 19, 22, 15);
        context.restore();

        context.fillStyle = '#fff';
        context.font = 'bold 16px sans-serif';
        context.textAlign = 'center'
        context.textBaseline = 'middle';
        context.fillText('' + (levelData.level || ''), levelData.left + 20, levelData.top + 26);
        const divinityScore = (state.selectedCharacter.divinityScores[levelKey] || 0);
        if (divinityScore > 0) {
            context.fillStyle = 'black';
            context.fillRect(levelData.left, levelData.top + 34, 40, 15);
            context.fillStyle = 'white';
            context.font = '10px sans-serif';
            context.textAlign = 'center'
            context.fillText(abbreviate(divinityScore), levelData.left + 20, levelData.top + 42);
            let source = bronzeSource;
            if (divinityScore >= Math.round(difficultyBonusMap.hard * 1.2 * baseDivinity(levelData.level))) {
                source = goldSource;
            } else if (divinityScore >= Math.round(baseDivinity(levelData.level))) {
                source = silverSource;
            }
            context.drawImage(source.image, source.left, source.top, source.width, source.height,
                              levelData.left - 10, levelData.top + 34, 16, 16);
        }
    }
    const { arrowTargetLeft, arrowTargetTop, clickedMapNode } = editingMapState;
    if (mapState.draggedMap &&
        arrowTargetLeft !== null &&
        arrowTargetTop !== null &&
        clickedMapNode
    ) {
        //if (clickedMapNode.x === arrowTargetX && clickedMapNode.y === arrowTargetY) return;
        context.save();
        context.lineWidth = 5;
        context.strokeStyle = '#0f0';
        drawMapArrow(context, clickedMapNode, {'left': arrowTargetLeft, 'top': arrowTargetTop, 'width': 0, 'height': 0});
        context.restore();
    }
}

function drawMapArrow(context: CanvasRenderingContext2D, targetA: FullRectangle, targetB: FullRectangle) {
    const sx = targetA.left + targetA.width / 2;
    const sy = targetA.top + targetA.height / 2;
    const tx = targetB.left + targetB.width / 2;
    const ty = targetB.top + targetB.height / 2;
    const v = [tx - sx, ty - sy];
    const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    v[0] /= mag;
    v[1] /= mag;
    context.beginPath();
    context.moveTo(sx, sy);
    context.lineTo(tx - v[0] * 17, ty - v[1] * 17);
    context.moveTo(tx - v[0] * 20, ty - v[1] * 20);
    context.lineTo(tx - v[0] * 30 - v[1] * 5, ty - v[1] * 30 + v[0] * 5);
    context.lineTo(tx - v[0] * 30 + v[1] * 5, ty - v[1] * 30 - v[0] * 5);
    context.lineTo(tx - v[0] * 20, ty - v[1] * 20);
    context.stroke();
}
function drawMapPath(context: CanvasRenderingContext2D, targetA: FullRectangle, targetB: FullRectangle) {
    const sx = targetA.left + targetA.width / 2;
    const sy = targetA.top + targetA.height / 2;
    const tx = targetB.left + targetB.width / 2;
    const ty = targetB.top + targetB.height / 2;
    context.beginPath();
    context.moveTo(sx, sy);
    context.lineTo(tx, ty);
    context.stroke();
}

