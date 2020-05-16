import { enterArea } from 'app/adventure';
import { showAreaMenu } from 'app/areaMenu';
import { addBonusSourceToObject, removeBonusSourceFromObject} from 'app/bonuses';
import { gainLevel, totalCostForNextLevel } from 'app/character';
import { abilities } from 'app/content/abilities';
import { map } from 'app/content/mapData';
import { monsters } from 'app/content/monsters';
import { setContext } from 'app/context';
import { drawBoardBackground } from 'app/drawBoard';
import {
    editingMapState,
    handleEditMapMouseDown,
    handleEditMapMouseMove,
    handleEditMapMouseUp,
    startEditingLevel,
} from 'app/development/editLevel';
import {
    handleChildEvent,
    mainCanvas,
    mouseContainer,
    query,
    tagElement,
    titleDiv,
} from 'app/dom';
import { ADVENTURE_SCALE, MAX_LEVEL, WORLD_RADIUS } from 'app/gameConstants';
import { abilityHelpText } from 'app/helpText'
import { updateAdjacentJewels, updateJewelBonuses } from 'app/jewels';
import { updateDamageInfo } from 'app/performAttack';
import { hidePointsPreview, previewPointsChange } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState, guildYardEntrance } from 'app/state';
import { isPointInRect, isPointInShortRect } from 'app/utils/index';
import { getMousePosition, isMouseDown } from 'app/utils/mouse';
import SphereVector from 'app/utils/SphereVector';
import Vector from 'app/utils/Vector';
import { worldCamera } from 'app/WorldCamera';

import { LevelData, MapTarget, ShortRectangle, Shrine } from 'app/types';

export const mapLocation = new SphereVector(WORLD_RADIUS);

let mapCenteringTarget: LevelData = null, centerInstantly = false;
export function updateMap() {
    if (mapState.draggedMap) {
        return;
    }
    if (mapCenteringTarget) {
        let differenceVector = new Vector(mapCenteringTarget.coords).subtract(mapLocation.position);
        const distance = differenceVector.magnitude();
        if (distance < 40) {
            mapCenteringTarget = null;
            return;
        }
        differenceVector = differenceVector.orthoganalize(mapLocation.position);
        // In the unlikely event differenceVector is parallel to mapLocation.position,
        // it will not be valid and we need to choose a random vector
        if (isNaN(differenceVector.getCoordinate(1))) {
            differenceVector.orthoganalize(new Vector([Math.random(), Math.random(), Math.random()]));
        }
        // This should never happen, so if it does, it probably means I did something wrong.
        if (isNaN(differenceVector.getCoordinate(1))) {
            console.log("failed to generate valid difference vector.");
            return;
        }
        differenceVector = differenceVector.normalize(5);
        const iterations = centerInstantly ? distance / 5 : distance / 50;
        for (let i = 0; i < iterations; i++) {
            mapLocation.moveByVector(differenceVector);
            // Fix the camera position each step, otherwise the up/right vectors
            // may not match what is being displayed any more.
            worldCamera.position = mapLocation.position.normalize(WORLD_RADIUS * 2);
            worldCamera.forward = worldCamera.position.normalize(-1);
            worldCamera.fixRightAndUp();
            worldCamera.updateRotationMatrix();
        }
    }
}
export function centerMapOnLevel(levelData: LevelData, instant = false) {
    centerInstantly = instant;
    mapCenteringTarget = levelData;
    mapState.movedMap = true;
}

export const mapState : {
    draggedMap: boolean,
    visibleNodes: {[key: string]: LevelData},
    currentMapTarget: MapTarget,
    mapDragX: number,
    mapDragY: number,
    movedMap: boolean,
} = {
    draggedMap: false,
    visibleNodes: {},
    currentMapTarget: null,
    mapDragX: null,
    mapDragY: null,
    movedMap: true,
};

window['mapState'] = mapState;

export function getMapPopupTarget(x: number, y: number): MapTarget {
    let newMapTarget: MapTarget;
    if (!mapState.draggedMap) {
        newMapTarget = getMapPopupTargetProper(x, y);
    }
    if (newMapTarget !== mapState.currentMapTarget) {
        const state = getState();
        var level = newMapTarget ? (newMapTarget.targetType === 'shrine' ? newMapTarget.level.level : newMapTarget.level) : undefined;
        updateDamageInfo(state.selectedCharacter, query('.js-characterColumn .js-stats'), level);
    }
    if ((mapState.currentMapTarget && mapState.currentMapTarget.targetType === 'shrine') && !(newMapTarget && newMapTarget.targetType === 'shrine')) {
        hidePointsPreview();
    }
    mapState.currentMapTarget = newMapTarget;
    mainCanvas.classList.toggle('clickable', !!mapState.currentMapTarget);
    return mapState.currentMapTarget;
}
function getMapPopupTargetProper(x: number, y: number): MapTarget {
    if (editingMapState.editingLevel) {
        return null;
    }
    const newMapTarget: MapTarget = getMapTarget(x, y);
    if (!newMapTarget) {
        return null;
    }
    if (newMapTarget.targetType === 'shrine') {
        newMapTarget.helpMethod = getMapShrineHelpText;
        const skill = abilities[newMapTarget.level.skill];
        const { selectedCharacter } = getState();
        if (!selectedCharacter.hero.unlockedAbilities[skill.key]) {
            const totalCost = totalCostForNextLevel(selectedCharacter, newMapTarget.level);
            previewPointsChange('divinity', -totalCost);
        }
    } else {
        newMapTarget.helpMethod = getMapLevelHelpText;
    }
    newMapTarget.isPointOver = isPointOverMapTarget;
    return newMapTarget;
}

function getMapLevelHelpText(this: LevelData): string {
    if (this.levelKey === 'guild') {
        return titleDiv('Guild');
    }
    if (!editingMapState.editingMap) {
        return titleDiv('Level ' + this.level + ' ' + this.name);
    }
    let helpText = '<p style="font-weight: bold">Level ' + this.level + ' ' + this.name +'(' + this.background +  ')</p><br/>';
    helpText += '<p><span style="font-weight: bold">Enemies:</span> ' +
        this.monsters.map(k => monsters[k].name).join(', ') + '</p>';
    if (this.events) {
        helpText += '<p><span style="font-weight: bold"># Events: </span> ' + this.events.length + '</p>';
        if (this.events.length) {
            helpText += '<p><span style="font-weight: bold">Boss Event: </span> ' +
                this.events[this.events.length - 1].map(k => monsters[k].name).join(', ') + '</p>';
        }
    } else {
        helpText += '<p style="font-weight: bold; color: red;">No Events!</p>';
    }
    helpText += '<p><span style="font-weight: bold">Enemy Skills:</span> ' +
        (this.enemySkills || []).map(k => abilities[k].name).join(', ') + '</p>';
    helpText += '<br/><p style="font-weight: bold">Teaches:</p>';
    const skill = abilities[this.skill];
    if (skill) {
        helpText += abilityHelpText(skill, getState().selectedCharacter.hero);
    } else {
        helpText += '<p>No Skill</p>';
    }
    return helpText;
}
function getMapShrineHelpText(this: Shrine): string {
    const state = getState();
    var skill = abilities[this.level.skill];
    var totalCost = totalCostForNextLevel(state.selectedCharacter, this.level);
    var helpText = ''
    var skillAlreadyLearned = state.selectedCharacter.hero.unlockedAbilities[skill.key];
    if (!skillAlreadyLearned && state.selectedCharacter.hero.level >= MAX_LEVEL) {
        helpText += '<p style="font-size: 12">' + state.selectedCharacter.hero.name + ' has reached the maximum level and can no longer learn new abilities.</p><br/>';
    } else if (!skillAlreadyLearned && state.selectedCharacter.divinity < totalCost) {
        helpText += '<p style="font-size: 12">' + state.selectedCharacter.hero.name + ' does not have enough divinity to learn the skill from this shrine.</p><br/>';
    }
    if (!skillAlreadyLearned) {
        helpText += '<p style="font-weight: bold">Spend ' + totalCost + ' divinity at this shrine to level up and learn:</p>' + abilityHelpText(skill, state.selectedCharacter.hero);
    } else {
        helpText += '<p style="font-size: 12px">' + state.selectedCharacter.hero.name + ' has already learned:</p>' + abilityHelpText(skill, state.selectedCharacter.hero);
    }
    return helpText;
}

export function getMapTarget(x: number, y: number): MapTarget {
    for (let levelKey in mapState.visibleNodes) {
        const levelData = mapState.visibleNodes[levelKey];
        if (!levelData.isPointOver) {
            levelData.isPointOver = isPointOverMapTarget;
        }
        if (levelData.isPointOver(x, y)) {
            return levelData as MapTarget;
        }
        if (!editingMapState.editingMap && levelData.shrine) {
            if (!levelData.shrine.isPointOver) {
                levelData.shrine.isPointOver = isPointOverMapTarget;
            }
            if (levelData.shrine.isPointOver(x, y)) {
                return levelData.shrine as MapTarget;
            }
        }
    }
    return null;
}

function isPointOverMapTarget(this: MapTarget, x: number, y: number): boolean {
    return isPointInShortRect(x, y, this as ShortRectangle);
}

// Disable context menu while editing the map because the right click is used for making nodes and edges.
mainCanvas.oncontextmenu = function (event) {
    return !editingMapState.editingMap;
};
export function handleMapMouseDown(x: number, y: number, event) {
    //console.log(camera.unprojectPoint(x + MAP_LEFT, y + MAP_TOP, WORLD_RADIUS));
    const newMapTarget = getMapTarget(x, y);
    if (editingMapState.editingMap) {
        handleEditMapMouseDown(x, y, event, newMapTarget);
    }
    if (event.which != 1) return; // Handle only left click.
    if (!editingMapState.editingMap && newMapTarget) {
        const state = getState();
        if (newMapTarget.targetType === 'shrine') {
            // Show them the area menu if they click on the shrine from a different area.
            state.selectedCharacter.selectedLevelKey = newMapTarget.level.levelKey;
            showAreaMenu();
            mapState.currentMapTarget = null;
            mainCanvas.classList.toggle('clickable', false);
            return;
        } else if (newMapTarget.levelKey === 'guild') {
            mapState.currentMapTarget = null;
            // If the character is not presently in the guild, set them in the yard entrance.
            if (state.selectedCharacter.hero.area?.zoneKey !== 'guild') {
                enterArea(state.selectedCharacter.hero, guildYardEntrance);
            }
            setContext('field');
            return;
        } else if (newMapTarget.levelKey) {
            state.selectedCharacter.selectedLevelKey = newMapTarget.levelKey;
            showAreaMenu();
            mapState.currentMapTarget = null;
            mainCanvas.classList.toggle('clickable', false);
            return;
        }
    }
    mapState.draggedMap = false;
    mapState.mapDragX = x;
    mapState.mapDragY = y;
}
document.addEventListener('mouseup', function (event) {
    if (event.which !== 1) {
        return;
    }
    const [x, y] = getMousePosition(mainCanvas, ADVENTURE_SCALE);
    mapState.mapDragX = mapState.mapDragY = null;
    if (editingMapState.editingMap) {
        handleEditMapMouseUp(x, y, event);
    }
    if (mapState.draggedMap) {
        mapState.draggedMap = false;
        return;
    }
});
document.addEventListener('mousemove', function (event) {
    if (!isMouseDown()) return;
    if (getState().selectedCharacter.context !== 'map') return;
    mapState.draggedMap = true;
    const [x, y] = getMousePosition(mouseContainer, ADVENTURE_SCALE);
    if (editingMapState.editingMap) {
        handleEditMapMouseMove(x, y, event);
    } else if (mapState.mapDragX !== null && mapState.mapDragY !== null) {
        mapLocation.moveRight((mapState.mapDragX - x));
        mapLocation.moveUp(-(mapState.mapDragY - y));
        mapState.movedMap = true;
        mapState.mapDragX = x;
        mapState.mapDragY = y;
    }
});
export function unlockMapLevel(levelKey: string) {
    getState().visibleLevels[levelKey] = true;
}

