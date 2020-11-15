import { initializeActorForAdventure } from 'app/actor';
import { addFixedAbilities, newCharacter, updateHero } from 'app/character';
import { abilities } from 'app/content/abilities';
import { itemsByKey } from 'app/content/equipment/index';
import { characterClasses } from 'app/content/jobs';
import { equipItemProper, makeItem } from 'app/inventory';
import { exportCharacter } from 'app/saveGame';

import { Character } from 'app/types';

export function getMysteriousSage(): Character {
    const sage = newCharacter(characterClasses.sage);
    const hero = sage.hero;
    hero.name = '???';
    hero.level = 30;
    hero.colors = {
        bandanaColor: null,
        earColor: '#FFCC99',
        eyeColor: 'blue',
        scarfColor: 'red',
        shirtColor: 'black',
        shoeColor: 'black',
        shortsColor: '#800',
        skinColor: '#FFCC99',
        hairColor: 'black',
    };
    // Remove default gear.
    hero.equipment.weapon = null;
    hero.equipment.body = null;
    equipItemProper(hero, makeItem(itemsByKey.oakquarterstaff, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.cashmererobe, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.silkslippers, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.silkgloves, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.silkhood, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.silktights, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.heavyamulet, 30), false);
    equipItemProper(hero, makeItem(itemsByKey.orichalcumband, 30), false);
    addFixedAbilities(sage, [ abilities.heal ]);
    // abilities.fireball, abilities.freeze,
    // This does setup that only needs to be udpated when equipment/bonuses change.
    updateHero(hero);
    // This does setup for entering an area.
    initializeActorForAdventure(hero);
    return sage;
}

export function initializeSpecialCharacters() {
    specialCharacters.push(exportCharacter(getMysteriousSage()));
}

const specialCharacters = [];
export default specialCharacters;
