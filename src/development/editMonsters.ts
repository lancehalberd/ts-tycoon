import { addMonstersFromAreaDefinition } from 'app/adventure';
import {
    isPointOverAreaTarget,
    getCurrentArea,
} from 'app/content/areas';
import { getMonsterDefinitionAreaEntity, makeMonster, monsters } from 'app/content/monsters';
import { zones } from 'app/content/zones';
import {
    boundZPosition,
    deleteSelectedObject,
    moveLocationDefinition,
    refreshPropertyPanel,
} from 'app/development/editArea';
import { MAX_Z, MIN_Z } from 'app/gameConstants';
import { getBasicAttack } from 'app/performAttack';
import { getState } from 'app/state';
import { abbreviate, fixedDigits, percent } from 'app/utils/formatters';

import {
    Area, AreaDefinition, AreaObject, AreaObjectTarget, EditorProperty,
    MenuOption, Monster, MonsterDefinition, PropertyRow,
} from 'app/types';


export class MonsterDefinitionAreaObject implements AreaObject {
    area: Area;
    index: number;
    key: string;
    constructor(area: Area, index: number) {
        this.key = `monster-${index}`;
        this.area = area;
        this.index = index;
    }
    getAreaTarget(): AreaObjectTarget {
        const areaDefinition = zones[this.area.zoneKey][this.area.key];
        const monsterDefinition: MonsterDefinition = areaDefinition.monsters[this.index];
        return {
            targetType: 'object',
            object: this,
            ...getMonsterDefinitionAreaEntity(this.area, monsterDefinition),
        };
    }
    isPointOver(x: number, y: number): boolean {
        return isPointOverAreaTarget(this.getAreaTarget(), x, y);
    }
}

export function getMonsterContextMenu(definition: MonsterDefinition): MenuOption[] {
    const monsterData = monsters[definition.key];
    const name = monsterData.name || definition.key;
    return [
        {},
        {
            label: 'Delete ' + name,
            onSelect() {
                deleteSelectedObject();
            }
        },
    ];
}

export function refreshEnemies() {
    const hero = getState().selectedCharacter.hero;
    const area = hero.area;
    if (area.zoneKey !== 'guild' || !getState().savedState.unlockedGuildAreas[area.key]) {
        addMonstersFromAreaDefinition(area);
        // The above call replaces the enemies array, so we need to reassign it to the character.
        hero.enemies = area.enemies;
    } else {
        hero.enemies = area.enemies = [];
    }
    refreshPropertyPanel();
}

export function getMonsterTypeMenuItems(callback: (monsterKey: string) => void): MenuOption[] {
    return Object.keys(monsters).map(monsterKey => ({
        getLabel() {
            return monsters[monsterKey].name || monsterKey;
        },
        onSelect() {
            callback(monsterKey);
        }
    }));
}

export function getMonsterProperties(definition: MonsterDefinition, area: Area): (EditorProperty<any> | PropertyRow | string)[] {
    const monster: Monster =  makeMonster(area, definition.key, definition.level, [], definition.rarity);
    let attack = getBasicAttack(monster);
    const props: (EditorProperty<any> | PropertyRow | string)[] = [];
    props.push(`Lvl ${monster.stats.level} ${monster.name}`);
    props.push([{
        name: 'level',
        value: monster.stats.level,
        onChange: (level: number) => {
            if (isNaN(level) || level < 1) {
                return monster.stats.level;
            }
            definition.level = Math.round(level);
            refreshEnemies();
        },
    }, {
        name: 'type',
        value: definition.key,
        values: Object.keys(monsters),
        onChange: (key: string) => {
            definition.key = key;
            refreshEnemies();
        },
    }]);
    props.push([{
        name: 'x',
        value: definition.location.x,
        onChange: (x: number) => {
            if (isNaN(x) || x < 0 || x > getCurrentArea().width) {
                return definition.location.x;
            }
            definition.location.x = Math.round(x);
            refreshEnemies();
        },
    }, {
        name: 'z',
        value: definition.location.z,
        onChange: (z: number) => {
            if (isNaN(z) || z < MIN_Z || z > MAX_Z) {
                return definition.location.z;
            }
            definition.location.z = Math.round(z);
            refreshEnemies();
        },
    }]);
    props.push([{
        name: 'flipped',
        value: definition.location.flipped || false,
        onChange: (flipped: boolean) => {
            definition.location.flipped = flipped;
            refreshEnemies();
        },
    }, {
        name: 'isTarget',
        value: definition.isTarget || false,
        onChange: (isTarget: boolean) => {
            definition.isTarget = isTarget;
            refreshEnemies();
        },
    }]);
    props.push([{
        name: 'key',
        value: definition.triggerKey || '',
        onChange: (key: string) => {
            definition.triggerKey = key;
            refreshEnemies();
        },
    }, {
        name: 'isTriggered',
        value: definition.isTriggered || false,
        onChange: (isTriggered: boolean) => {
            definition.isTriggered = isTriggered;
            refreshEnemies();
        },
    }]);
    props.push([{
        name: 'Max Health',
        value: monster.stats.maxHealth,
    },{
        name: 'MPow',
        value: fix(monster.stats.magicPower),
    }]);
    props.push([{
        name: 'Phys',
        value: fix(attack.stats.minPhysicalDamage) + '-' + fix(attack.stats.maxPhysicalDamage),
    },{
        name: 'Mag',
        value: fix(attack.stats.minMagicDamage) + '-' + fix(attack.stats.maxMagicDamage),
    }]);
    props.push([{
        name: 'AtkSpd',
        value: fix(attack.stats.attackSpeed),
    },{
        name: 'Range',
        value: fix(attack.stats.range),
    },{
        name: 'Speed',
        value: fix(monster.stats.speed),
    }]);
    props.push([{
        name: 'Crt%',
        value: percent(attack.stats.critChance),
    },{
        name: 'Dam*',
        value: fix(1 + attack.stats.critDamage),
    },{
        name: 'Acc*',
        value: fix(1 + attack.stats.critAccuracy),
    }]);
    props.push([{
        name: 'Armor',
        value: fix(monster.stats.armor),
    },{
        name: 'MRes',
        value: fix(monster.stats.magicResist),
    }]);
    props.push([{
        name: 'PBlock',
        value: fix(monster.stats.block),
    },{
        name: 'MBlock',
        value: fix(monster.stats.magicBlock),
    }]);
    return props;
}

function fix(number: number, digits: number = 1): string {
    return abbreviate(fixedDigits(number, digits));
}

export function moveMonsterDefinition(definition: MonsterDefinition, dx: number, dy: number): void {
    moveLocationDefinition(definition.location, dx, 0, -2 * dy);
    boundZPosition(definition.location, getMonsterDefinitionAreaEntity(getCurrentArea(), definition).d);
    refreshEnemies();
}

