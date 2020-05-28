import { initializeActorForAdventure } from 'app/actor';
import { makePersonFromData, updateHero } from 'app/character';
import { itemsByKey } from 'app/content/equipment/index';
import { makeMonster, monsters } from 'app/content/monsters';
import { equipItemProper, makeItem } from 'app/inventory';

import {
    Ability, Actor, ActorSource, ActorStats, Affix, AffixData,
    Area, AreaEntity, Bonuses, BonusSource, Equipment, EquipmentSlot,
    Frame, FrameAnimation, FrameDimensions, FrameRectangle,
    Monster, MonsterData, MonsterDefinition, Person
} from 'app/types';

const ruthvenColors = {
    bandanaColor: null,
    scarfColor: 'red',
    shirtColor: 'black',
    shoeColor: '#622',
    shortsColor: '#333',
    skinColor: '#FFCC99',
    hairColor: 'white',
}

let ruthven: Person;
export function getAshleyRuthven(): Actor {
    if (!ruthven) {
        ruthven = makePersonFromData({jobKey: 'priest', level: 1, name: 'Ashley Ruthven', colors: ruthvenColors});
        // Help distinguish Ruthven by removing his idle animation.
        ruthven.source.idleAnimation.frames = [ruthven.source.idleAnimation.frames[0]];
        equipItemProper(ruthven, makeItem(itemsByKey.plaincloak, 1), false);
        // This does setup that only needs to be udpated when equipment/bonuses change.
        updateHero(ruthven);
        // This does setup for entering an area.
        initializeActorForAdventure(ruthven);
        ruthven.helpMethod = npcHelpMethod;
    }
    return ruthven;
}

let sprite: Actor;
export function getSprite(): Actor {
    if (!sprite) {
        sprite = makeMonster(null, monsters.fairy, 1, [], 0);
        sprite.name = 'Sprite';
        sprite.y = 24;
        sprite.helpMethod = npcHelpMethod;
    }
    return sprite;
}

let guildSpirit: Actor;
export function getGuildSpirit(): Actor {
    if (!guildSpirit) {
        guildSpirit = makeMonster(null, monsters.skeleton, 1, [], 0);
        guildSpirit.name = 'Guild Spirit';
        guildSpirit.helpMethod = npcHelpMethod;
    }
    return guildSpirit;
}

function npcHelpMethod(this: Actor): string {
    return this.name;
}
