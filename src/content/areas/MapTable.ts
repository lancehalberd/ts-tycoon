import {
    areaObjectFactories, drawFrameToAreaTarget,
    EditableAreaObject,
} from 'app/content/areas';
import { addFurnitureBonuses, removeFurnitureBonuses } from 'app/content/furniture';
import { setContext } from 'app/context';
import { editingAreaState } from 'app/development/editArea';
import { bodyDiv, titleDiv } from 'app/dom';
import { requireImage } from 'app/images';
import { isKeyDown, KEY } from 'app/keyCommands';
import { getCanvasPopupTarget, removePopup } from 'app/popup';
import { getState } from 'app/state';
import { createAnimation, frame, getFrame, drawFrame, frameAnimation } from 'app/utils/animations';

import {
    EditorProperty, Frame, FrameAnimation, FrameDimensions, Hero,
    PropertyRow,UpgradeableObject, UpgradeableObjectDefinition, UpgradeableObjectTier,
} from 'app/types';

const geometry: FrameDimensions = {w: 40, h: 50, content: {x: 5, y: 22, w: 31, h: 26, d: 22}};
const tableAnimation = createAnimation('gfx2/objects/maptable.png', geometry, {cols: 1});
const globeAnimation = createAnimation('gfx2/objects/maptable.png', {w: 40, h: 50, content: {x: 3, y: 22, w: 31, h: 26, d: 22}}, {x: 1, cols: 1});
const magicGlobeAnimation = createAnimation('gfx2/objects/maptable.png', {w: 40, h: 50, content: {x: 4, y: 22, w: 31, h: 26, d: 22}}, {x: 2, cols: 2});
const glowAnimation = createAnimation('gfx2/objects/mapglow.png', geometry, {cols: 3, duration: 15, frameMap: [0, 1, 2, 1]});


interface MapTableTier extends UpgradeableObjectTier {
    animation: FrameAnimation,
}

const mapTableTiers: MapTableTier[] = [
    {
        'name': 'Map Table', 'upgradeCost': 500, animation: tableAnimation,
        'bonuses': {'+mapLevel': 1},
    },
    {
        'name': 'Globe', 'upgradeCost': 10000, animation: globeAnimation,
        'bonuses': {'+mapLevel': 2},
    },
    {
        'name': 'Ancient Map Device', 'upgradeCost': 150000, 'requires': 'workshop', animation: magicGlobeAnimation,
        'bonuses': {'+mapLevel': 3},
    },
];

export function openWorldMap() {
    setContext('map');
}

export class MapTable extends EditableAreaObject implements UpgradeableObject {
    level: number = 1;
    definition: UpgradeableObjectDefinition;

    applyDefinition(definition: UpgradeableObjectDefinition): this {
        this._areaTarget = null;
        this.definition = definition;
        if (definition.level > this.level) {
            this.level = definition.level;
        }
        return this;
    }

    getFrame(): Frame {
        return getFrame(this.getCurrentTier().animation, this.area.time * 1000);
    }
    onInteract(hero: Hero): void {
        openWorldMap();
    }

    getCurrentTier() {
        return mapTableTiers[this.level - 1];
    }
    getNextTier() {
        return mapTableTiers[this.level];
    }

    helpMethod() {
        return titleDiv(this.getCurrentTier().name) + bodyDiv('View available Shrine Quests');
    }
    getActiveBonusSources() {
        return [this.getCurrentTier()];
    }

    render(context: CanvasRenderingContext2D) {
        let frame = this.getFrame();
        const isEditing = editingAreaState.selectedObject === this;
        drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, drawFrame, isEditing && isKeyDown(KEY.SHIFT));
        // Draw a glow over the map when it is under the mouse.
        if (getCanvasPopupTarget() === this) {
            frame = getFrame(glowAnimation, this.area.time * 1000);
            drawFrameToAreaTarget(context, this.getAreaTarget(), {...frame, flipped: this.definition.flipped}, drawFrame, isEditing && isKeyDown(KEY.SHIFT));
        }
    }

    static getProperties(object: MapTable): (EditorProperty<any> | PropertyRow | string)[] {
        const definition = object.definition;
        const props = [];
        props.push({
            name: 'level',
            value: definition.level || 1,
            values: [1, 2, 3],
            onChange: (level: number) => {
                definition.level = level;
                // We also have to set the level directly on the object because
                // the definition won't override it if it is already higher.
                if (getState().savedState.unlockedGuildAreas[object.area.key]) {
                    removeFurnitureBonuses(object);
                    object.level = level;
                    addFurnitureBonuses(object, true);
                } else {
                    object.level = level;
                }
            },
        });
        return props;
    }
}
areaObjectFactories.mapTable = MapTable;
