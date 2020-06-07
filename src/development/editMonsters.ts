import { addMonstersFromAreaDefinition } from 'app/adventure';
import {
    isPointOverAreaTarget,
} from 'app/content/areas';
import { getMonsterDefinitionAreaEntity, makeMonster, monsters } from 'app/content/monsters';
import { zones } from 'app/content/zones';
import {
    deleteSelectedObject,
    refreshPropertyPanel,
} from 'app/development/editArea';
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
    constructor(area: Area, index: number) {
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
        {
            label: 'Change type...',
            getChildren() {
                return getMonsterTypeMenuItems(monsterKey => {
                    definition.key = monsterKey;
                    refreshEnemies();
                });
            }
        },
        {
            label: 'Set level...',
            getChildren() {
                return [
                    ...[-10, -5, -3, -1, 1, 3, 5, 10].map(n => definition.level + n).filter(n => n >= 1 && n <= 100).map(level => ({
                        label: 'Level ' + level,
                        onSelect() {
                            definition.level = level;
                            refreshEnemies();
                        }
                    })),
                    {
                        label: 'Custom...',
                        onSelect() {
                            const level = parseInt(prompt('Enter level'));
                            if (level >= 1 && level <= 100) {
                                definition.level = level;
                                refreshEnemies();
                            }
                        }
                    },
               ];
            }
        },
        {
            label: definition.isTarget ? 'Remove From Targets' : 'Add to Targets',
            onSelect() {
                definition.isTarget = !definition.isTarget;
                refreshEnemies();
            }
        },
        {
            label: 'Flip ' + name,
            onSelect() {
                definition.location.flipped = !definition.location.flipped;
                refreshEnemies();
            }
        },
        {},
        {
            label: 'Delete ' + name,
            onSelect() {
                deleteSelectedObject();
            }
        },
    ]
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

