import * as _ from 'lodash';
import { updateActorDimensions } from 'app/adventure';
import { updateAdventureButtons } from 'app/adventureButtons';
import {
    addBonusSourceToObject, addVariableChildToObject,
    createVariableObject,
    recomputeDirtyStats, removeBonusSourceFromObject,
    setStat,
} from 'app/bonuses';
import { abilities } from 'app/content/abilities';
import { updateTrophy } from 'app/content/achievements';
import { characterClasses } from 'app/content/jobs';
import { updateSkillConfirmationButtons } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { setupActorSource } from 'app/content/monsters';
import { showContext } from 'app/context';
import {
    bodyDiv, createCanvas, jewelsCanvas, query, tag,
    titleDiv
} from 'app/dom';
import { CRAFTED_NORMAL } from 'app/equipmentCrafting';
import { drawBoardBackground } from 'app/drawBoard';
import { bonusSourceHelpText } from 'app/helpText';
import { equipmentSlots } from 'app/gameConstants';
import { images } from 'app/images';
import {
    equipItemProper, makeItem,
    updateEquipableItems, updateOffhandDisplay,
} from 'app/inventory';
import { equipJewel, jewelInventoryState } from 'app/jewelInventory';
import { convertShapeDataToShape, makeFixedJewel, updateJewelBonuses } from 'app/jewels';
import { smallJewelLoot } from 'app/loot';
import { centerMapOnLevel } from 'app/map';
import { findActionByTag, getBasicAttack, updateDamageInfo } from 'app/performAttack';
import { gain } from 'app/points';
import { getCanvasPopupTarget } from 'app/popup';
import { getState } from 'app/state';
import { getTargetCameraX } from 'app/update';
import { abbreviate } from 'app/utils/formatters';
import { ifdefor, rectangle, removeElementFromArray } from 'app/utils/index';
import { centerShapesInRectangle, Polygon } from 'app/utils/polygon';
import Random from 'app/utils/Random';

import {
    Ability, Action, ActionStats, Actor, ActorStats,
    Board, BoardData, Character,
    Effect, Equipment, EquipmentData, Hero,
    Job, Monster, Tags, VariableObject
} from 'app/types';
import { Bonuses, BonusSource } from 'app/types/bonuses';
import { Item } from 'app/types/items';

export const personFrames = 5;
const clothes = [1, 3];
const hair = [clothes[1] + 1, clothes[1] + 4];
const names = ['Chris', 'Leon', 'Hillary', 'Michelle', 'Rob', 'Reuben', 'Kingston', 'Silver', 'Blaise'];


// All actors receive these bonuses, which give various benefits based on the core stats:
// dexterity, strength, and intelligence. Bonuses for bonusMaxHealth and healthRegen are included
// here but they could probably be added separately. BonusMaxHealth is used to track
// overhealing which increases maxHealth for the duration of one adventure, and healthRegen
// is the passive healthRegen that all actors are given.
export const coreStatBonusSource: BonusSource = {'bonuses': {
    '%evasion': [.002, '*', '{dexterity}'],
    '%attackSpeed': [.002, '*', '{dexterity}'],
    '+ranged:weaponPhysicalDamage': ['{dexterity}', '/', 10],
    '%maxHealth': [.002, '*', '{strength}'],
    '%weaponPhysicalDamage': [.002, '*', '{strength}'],
    '+melee:weaponPhysicalDamage': ['{strength}', '/', 10],
    '%block': [.002, '*', '{intelligence}'],
    '%magicBlock': [.002, '*', '{intelligence}'],
    '%accuracy': [.002, '*', '{intelligence}'],
    '+magic:weaponMagicDamage': ['{intelligence}', '/', 10],
    // Note that magicResist/evasion/accuracy don't need to scale to keep up with exponential max health/damage, but block, magic block and armor do.
    '*maxHealth': '{levelCoefficient}',
    '*armor': '{levelCoefficient}',
    '*block': '{levelCoefficient}',
    '*magicBlock': '{levelCoefficient}',
    '&maxHealth': '{bonusMaxHealth}',
    '*healthRegen': '{levelCoefficient}',
    '+healthRegen': [['{maxHealth}', '/', 50], '/', '{levelCoefficient}'],
    '+magicPower': [['{intelligence}', '*', '{levelCoefficient}'], '+', [['{minWeaponMagicDamage}', '+' ,'{maxWeaponMagicDamage}'], '*', 3]],
    '+minPhysicalDamage': '{minWeaponPhysicalDamage}',
    '+maxPhysicalDamage': '{maxWeaponPhysicalDamage}',
    '+minMagicDamage': '{minWeaponMagicDamage}',
    '+maxMagicDamage': '{maxWeaponMagicDamage}',
    // All sprites are drawn at half size at the moment.
    '+scale': 2,
    '$lifeBarColor': 'red'
}};

export function initializeActorForAdventure(actor: Actor) {
    actor.isActor = true;
    setStat(actor.variableObject, 'bonusMaxHealth', 0);
    setActorHealth(actor, actor.stats.maxHealth);
    actor.maxReflectBarrier = actor.reflectBarrier = 0;
    actor.stunned = 0;
    actor.pull = null;
    actor.chargeEffect = null;
    actor.time = 0;
    actor.isDead = false;
    actor.timeOfDeath = undefined;
    actor.skillInUse = null;
    actor.slow = 0;
    actor.rotation = 0;
    actor.activity = null;
    actor.imprintedSpell = null;
    actor.minions = actor.minions || [];
    actor.boundEffects = actor.boundEffects || [];
    // actor.heading = [1, 0, 0];
    var stopTimeAction = findActionByTag(actor.reactions, 'stopTime');
    actor.temporalShield = actor.maxTemporalShield = (stopTimeAction ? stopTimeAction.stats.duration : 0);
    updateActorDimensions(actor);
}
export function refreshStatsPanel(
    character = getState().selectedCharacter,
    statsPanelElement: HTMLElement = query('.js-characterColumn .js-stats')
) {
    const hero = character.hero;
    statsPanelElement.querySelector('.js-playerName').textContent = hero.job.name + ' ' + hero.name;
    statsPanelElement.querySelector('.js-playerLevel').textContent = '' + hero.level;
    statsPanelElement.querySelector('.js-fame').textContent = character.fame.toFixed(1);
    statsPanelElement.querySelector('.js-dexterity').textContent = hero.stats.dexterity.toFixed(0);
    statsPanelElement.querySelector('.js-strength').textContent = hero.stats.strength.toFixed(0);
    statsPanelElement.querySelector('.js-intelligence').textContent = hero.stats.intelligence.toFixed(0);
    query('.js-global-divinity').textContent = abbreviate(character.divinity);
    statsPanelElement.querySelector('.js-maxHealth').textContent = abbreviate(hero.stats.maxHealth, 0);
    if (hero.actions.length) {
        statsPanelElement.querySelector('.js-range').textContent = getBasicAttack(hero).stats.range.toFixed(2);
    }
    statsPanelElement.querySelector('.js-speed').textContent = hero.stats.speed.toFixed(1);
    statsPanelElement.querySelector('.js-healthRegen').textContent = hero.stats.healthRegen.toFixed(1);
    updateDamageInfo(character, statsPanelElement);
}
export function newCharacter(job: Job): Character {
    const hero = makeAdventurerFromJob(job, 1, job.startingEquipment || {});
    setActorHealth(hero, hero.stats.maxHealth);
    const characterCanvas = createCanvas(40, 20);
    const characterContext = characterCanvas.getContext('2d');
    characterCanvas.classList.add('js-character', 'character');
    const boardCanvas = createCanvas(jewelsCanvas.width, jewelsCanvas.height);
    const boardContext = boardCanvas.getContext('2d');
    const abilityKey = abilities[job.key] ? job.key : 'heal';
    hero.abilities.push(abilities[abilityKey]);
    //TODO
    // .attr('helptext', '').data('helpMethod', () => actorHelpText(hero))
    //    .data('character', character);
    const character: Character = {
        adventurer: hero,
        context: 'guild',
        autoplay: false,
        hero,
        characterCanvas,
        characterContext,
        boardCanvas,
        boardContext,
        gameSpeed: 1,
        replay: false,
        divinityScores: {},
        levelTimes: {},
        divinity: 0,
        currentLevelKey: 'guild',
        fame: 1,
        autoActions: {},
        manualActions: {},
        board: null,
        time: Date.now(),
    };
    hero.character = character;
    character.board = readBoardFromData(job.startingBoard, character, abilities[abilityKey], true)
    /*if (window.location.search.substr(1) === 'test') {
        for (let i = 0; i < (window.testAbilities || []).length; i++) {
            hero.abilities.push(window.testAbilities[i]);
            console.log(abilityHelpText(testAbilities[i], hero));
        }
    }*/
    centerShapesInRectangle(character.board.fixed.map(j => j.shape).concat(character.board.spaces), rectangle(0, 0, character.boardCanvas.width, character.boardCanvas.height));
    drawBoardBackground(character.boardContext, character.board);
    for (const loot of (job.jewelLoot || [smallJewelLoot, smallJewelLoot, smallJewelLoot])) {
        // Technically this gives the player the jewel, which we don't want to do for characters
        // generated that they don't control, but it immediately assigns it to the character,
        // so as long as this doesn't fail, that should not matter.
        jewelInventoryState.draggedJewel = loot.generateLootDrop().gainLoot(hero);
        jewelInventoryState.draggedJewel.shape.setCenterPosition(jewelsCanvas.width / 2, jewelsCanvas.width / 2);
        if (!equipJewel(character, false, false)) {
            console.log("Failed to place jewel on starting board.");
        }
    }
    jewelInventoryState.draggedJewel = null;
    jewelInventoryState.overJewel = null;
    return character;
}
export function makeAdventurerFromData({
        jobKey,
        level,
        name,
        hairOffset,
        skinColorOffset = Random.range(0, 2),
}): Hero {
    const personCanvas = createCanvas(personFrames * 96, 64);
    const personContext = personCanvas.getContext("2d");
    personContext.imageSmoothingEnabled = false;
    const hero: Hero = {
        targetType: 'actor',
        type: 'hero',
        character: null,
        isActor: true,
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0,
        equipment: {},
        job: characterClasses[jobKey],
        source: setupActorSource({
            width: 96,
            height: 64,
            yCenter: 44, // Measured from the top of the source
            yOffset: 14, // Measured from the top of the source
            actualHeight: 45,
            xOffset: 39,
            actualWidth: 18,
            attackY: 19, // Measured from the bottom of the source
            walkFrames: [0, 1, 0, 2],
            attackPreparationFrames: [0, 3, 4],
            attackRecoveryFrames: [4, 3]
        }),
        unlockedAbilities: {},
        abilities: [],
        minions: [],
        name,
        hairOffset: hairOffset % 6,
        skinColorOffset: ifdefor(skinColorOffset) % 3,
        level,
        image: personCanvas,
        personCanvas,
        personContext,
        attackCooldown: 0,
        percentHealth: 1,
        percentTargetHealth: 1,
        helpMethod: actorHelpText,
        heading: [1, 0, 0], // Character moves left to right by default.
    };
    hero.variableObject = createVariableObject({'variableObjectType': 'actor'});
    hero.stats = hero.variableObject.stats as ActorStats;
    equipmentSlots.forEach(function (type) {
        hero.equipment[type] = null;
    });
    return hero;
}
export function makeAdventurerFromJob(job: Job, level: number, equipment: EquipmentData): Hero {
    const hero = makeAdventurerFromData({
        jobKey: job.key,
        level,
        name: Random.element(names),
        hairOffset: Random.range(0, 6),
        skinColorOffset: Random.range(0, 2),
    });
    const state = getState();
    for (const item of Object.values(equipment)) {
        state.savedState.craftedItems[item.key] = (state.savedState.craftedItems[item.key] || 0) | CRAFTED_NORMAL;
        equipItemProper(hero, makeItem(item, 1), false);
    }
    updateAdventurer(hero);
    return hero;
}
export function readBoardFromData(boardData: BoardData, character, ability: Ability, confirmed = false): Board {
    return {
        fixed: boardData.fixed.map(convertShapeDataToShape)
            .map(function(fixedJewelData: Polygon) {
                const fixedJewel = makeFixedJewel(fixedJewelData, character, ability);
                fixedJewel.confirmed = confirmed;
                return fixedJewel;
            }),
        spaces: boardData.fixed.concat(boardData.spaces).map(convertShapeDataToShape),
        jewels: []
    };
}
function addAction(actor: Actor, source: Ability, baseAction: any): Action {
    const variableObject = createVariableObject(baseAction, actor.variableObject);
    const action: Action = {
        actor,
        readyAt: 0,
        variableObject,
        stats: variableObject.stats as ActionStats,
        source,
        base: baseAction,
    }
    addVariableChildToObject(actor.variableObject, variableObject);
    return action;
}
export function addActions(actor: Actor, source: Ability) {
    let variableObject: VariableObject;
    const parent: VariableObject = actor.variableObject;
    if (source.onHitEffect) {
        actor.onHitEffects.push(addAction(actor, source, source.onHitEffect));
    }
    if (source.onCritEffect) {
        actor.onCritEffects.push(addAction(actor, source, source.onCritEffect));
    }
    if (source.onMissEffect) {
        actor.onMissEffects.push(addAction(actor, source, source.onMissEffect));
    }
    if (source.action) {
        actor.actions.push(addAction(actor, source, source.action));
    }
    if (source.reaction) {
        actor.reactions.push(addAction(actor, source, source.reaction));
    }
    if (source.minionBonuses) {
        actor.minionBonusSources.push({bonuses: source.minionBonuses});
    }
}
export function removeActions(actor: Actor, source: Ability) {
    if (source.onHitEffect) {
        const action: Action = _.find(actor.onHitEffects, {source});
        removeElementFromArray(actor.onHitEffects, action);
        removeElementFromArray(actor.variableObject.variableChildren, action.variableObject);
    }
    if (source.onCritEffect) {
        const action: Action = _.find(actor.onCritEffects, {source});
        removeElementFromArray(actor.onCritEffects, action);
        removeElementFromArray(actor.variableObject.variableChildren, action.variableObject);
    }
    if (source.onMissEffect) {
        const action: Action = _.find(actor.onMissEffects, {source});
        removeElementFromArray(actor.onMissEffects, action);
        removeElementFromArray(actor.variableObject.variableChildren, action.variableObject);
    }
    if (source.action) {
        const action: Action = _.find(actor.actions, {source});
        removeElementFromArray(actor.actions, action);
        removeElementFromArray(actor.variableObject.variableChildren, action.variableObject);
    }
    if (source.reaction) {
        const action: Action = _.find(actor.reactions, {source});
        removeElementFromArray(actor.reactions, action);
        removeElementFromArray(actor.variableObject.variableChildren, action.variableObject);
    }
    if (source.minionBonuses) {
        const bonusSource: BonusSource =
            _.find(actor.minionBonusSources, {bonuses: source.minionBonuses});
        removeElementFromArray(actor.minionBonusSources, bonusSource);
    }
}

export function updateAdventurer(adventurer: Hero) {
    // Clear the character's bonuses and graphics.
    adventurer.variableObject = createVariableObject({variableObjectType: 'actor'});
    adventurer.actions = [];
    adventurer.reactions = [];
    adventurer.onHitEffects = [];
    adventurer.onCritEffects = [];
    adventurer.onMissEffects = [];
    adventurer.allEffects = [];
    adventurer.minionBonusSources = [];
    const levelCoefficient = Math.pow(1.05, adventurer.level);
    const adventurerBonuses: Bonuses = {
        '+level': adventurer.level,
        '+maxHealth': 50 + 20 * (adventurer.level + adventurer.job.dexterityBonus + adventurer.job.strengthBonus + adventurer.job.intelligenceBonus),
        '+tenacity': 4 + 2 * adventurer.level / 100,
        '+levelCoefficient': levelCoefficient,
        '+accuracy': 4 + 2 * adventurer.level,
        '+evasion': adventurer.level,
        '+block': adventurer.level,
        '+magicBlock': adventurer.level / 2,
        '+dexterity': adventurer.level * adventurer.job.dexterityBonus,
        '+strength': adventurer.level * adventurer.job.strengthBonus,
        '+intelligence': adventurer.level * adventurer.job.intelligenceBonus,
        '+critDamage': .5,
        '+critAccuracy': .5,
        '+speed': 250,
        '+weaponless:accuracy': 1 + 2 * adventurer.level,
        '+weaponless:minPhysicalDamage': 1 + adventurer.level,
        '+weaponless:maxPhysicalDamage': 2 + adventurer.level,
        '+weaponless:weaponRange': .5,
        // You are weaponless if you have no weapon equipped.
        '+weaponless:attackSpeed': .5,
        // You are unarmed if you have no weapon or offhand equipped.
        '+unarmed:attackSpeed': .5,
        '+weaponless:critChance': .01
    };
    adventurer.variableObject.tags = recomputeActorTags(adventurer);
    updateAdventurerGraphics(adventurer);
    addActions(adventurer, abilities.basicAttack);
    adventurer.abilities.forEach(function (ability) {
        addActions(adventurer, ability);
        if (ability.bonuses) {
            addBonusSourceToObject(adventurer.variableObject, ability);
        }
    });
    if (adventurer.character) {
        updateJewelBonuses(adventurer.character);
        addBonusSourceToObject(adventurer.variableObject, adventurer.character.jewelBonuses);
    }
    // Add the adventurer's current equipment to bonuses and graphics
    equipmentSlots.forEach(function (type) {
        const equipment = adventurer.equipment[type];
        if (!equipment) {
            return;
        }
        addActions(adventurer, equipment.base);
        addBonusSourceToObject(adventurer.variableObject, equipment.base);
        equipment.prefixes.forEach(function (affix) {
            addActions(adventurer, affix);
            addBonusSourceToObject(adventurer.variableObject, affix);
        });
        equipment.suffixes.forEach(function (affix) {
            addActions(adventurer, affix);
            addBonusSourceToObject(adventurer.variableObject, affix);
        });
    });
    addBonusSourceToObject(adventurer.variableObject, {'bonuses': adventurerBonuses});
    addBonusSourceToObject(adventurer.variableObject, coreStatBonusSource);
    for (const bonusSource of getState().guildBonusSources) {
        addBonusSourceToObject(adventurer.variableObject, bonusSource);
    }
    recomputeDirtyStats(adventurer.variableObject);
    //console.log(adventurer);
}
export function updateAdventurerGraphics(adventurer) {
    var sectionWidth = personFrames * 96;
    var hat = adventurer.equipment.head;
    var hideHair = hat ? ifdefor(hat.base.hideHair, false) : false;
    adventurer.personContext.clearRect(0, 0, sectionWidth, 64);
    var skinColorYOffset = adventurer.skinColorOffset;
    var hairYOffset = adventurer.hairOffset;
    for (var frame = 0; frame < personFrames; frame++) {
        // Draw the person legs then body then hair then under garment then leg gear then body gear.
        adventurer.personContext.drawImage(images['gfx/personSprite.png'], frame * 96 + 64, skinColorYOffset * 64 , 32, 64, frame * 96 + 32, 0, 32, 64); //legs
        adventurer.personContext.drawImage(images['gfx/personSprite.png'], frame * 96, skinColorYOffset * 64 , 32, 64, frame * 96 + 32, 0, 32, 64); //body
        if (!hideHair) {
            adventurer.personContext.drawImage(images['gfx/hair.png'], frame * 96, hairYOffset * 64, 32, 64, frame * 96 + 32, 0, 32, 64); //hair
        }
        // To avoid drawing 'naked' characters, draw an undergarment (black dress?) if they
        // don't have both a pants and a shirt on.
        if ((!adventurer.equipment.body || !adventurer.equipment.body.base.source)
                || (!adventurer.equipment.legs || !adventurer.equipment.legs.base.source)) {
            adventurer.personContext.drawImage(images['gfx/equipment.png'], frame * 96, 8 * 64 , 32, 64, frame * 96 + 32, 0, 32, 64); //undergarment
        }
        // leg + body gear
        for (var subX of [64, 0]) {
            equipmentSlots.forEach(function (type) {
                var equipment = adventurer.equipment[type];
                if (!equipment || !equipment.base.source) return;
                var source = equipment.base.source;
                if (source.xOffset !== subX) return;
                adventurer.personContext.drawImage(images['gfx/equipment.png'], frame * 96 + source.xOffset, source.yOffset, 32, 64, frame * 96 + 32, 0, 32, 64);
            });
        }
        // Draw the weapon under the arm
        var weapon = adventurer.equipment.weapon;
        if (weapon && weapon.base.source) {
            var source = weapon.base.source;
            adventurer.personContext.drawImage(images['gfx/weapons.png'], frame * 96, source.yOffset, 96, 64, frame * 96, 0, 96, 64);
        }
        // Draw the person arm then arm gear
        adventurer.personContext.drawImage(images['gfx/personSprite.png'], frame * 96 + 32, skinColorYOffset * 64 , 32, 64, frame * 96 + 32, 0, 32, 64); // arm
        //arm gear
        equipmentSlots.forEach(function (type) {
            var equipment = adventurer.equipment[type];
            if (!equipment || !equipment.base.source) return;
            var source = equipment.base.source;
            if (source.xOffset !== 32) return; // don't draw this if it isn't arm gear
            adventurer.personContext.drawImage(images['gfx/equipment.png'], frame * 96 + source.xOffset, source.yOffset, 32, 64, frame * 96 + 32, 0, 32, 64);
        });
    }
}
export function recomputeActorTags(actor: Actor): Tags {
    const tags = {'actor': true};
    if (actor.equipment) {
        if (!actor.equipment.weapon) {
            // Fighting unarmed is considered using a fist weapon.
            tags['fist'] = true;
            tags['melee'] = true;
            tags['weaponless'] = true;
            // You gain the unarmed tag if both hands are free.
            if (!actor.equipment.offhand) {
                tags['unarmed'] = true;
            }
        } else {
            tags[actor.equipment.weapon.base.type] = true;
            for (const tag of Object.keys(ifdefor(actor.equipment.weapon.base.tags, {}))) {
                tags[tag] = true;
            }
            // You gain the noOffhand tag if offhand is empty and you are using a one handed weapon.
            if (!actor.equipment.offhand && !tags['twoHanded']) {
                tags['noOffhand'] = true;
            }
        }
        if (actor.equipment.offhand) {
            tags[actor.equipment.offhand.base.type] = true;
            for (const tag of Object.keys(ifdefor(actor.equipment.offhand.base.tags, {}))) {
                tags[tag] = true;
            }
        }
    }

    if (actor.type === 'monster' && actor.base && actor.base.tags) {
        for (const tag of (actor.base.tags || [])) tags[tag] = true;
        if (tags['ranged']) delete tags['melee'];
        else tags['melee'] = true;
    }
    if (actor.stats.setRange) {
        if (actor.stats.setRange === 'ranged') {
            tags['ranged'] = true;
            delete tags['melee'];
        } else {
            tags['melee'] = true;
            delete tags['ranged'];
        }
    }
    return tags as Tags;
}
export function actorHelpText(actor: Actor) {
    var name = actor.name;
    if (actor.type === 'hero') {
        name = actor.job.name + ' ' + name;
    }
    var prefixNames = [];
    var suffixNames = [];
    for (var prefix of ifdefor(actor.prefixes, [])) prefixNames.push(prefix.base.name);
    for (var suffix of ifdefor(actor.suffixes, [])) suffixNames.push(suffix.base.name);
    if (prefixNames.length) name = prefixNames.join(', ') + ' ' + name;
    if (suffixNames.length) name = name + ' of ' + suffixNames.join(' and ');
    var title = 'Lvl ' + actor.level + ' ' + name;
    var sections = ['Health: ' + abbreviate(Math.ceil(actor.health)) +
        '/' + abbreviate(Math.ceil(actor.stats.maxHealth))];
    if (actor.temporalShield > 0) {
        sections.push('Temporal Shield: ' + actor.temporalShield.toFixed(1) + 's');
    }
    if (actor.reflectBarrier > 0) {
        sections.push('Reflect: ' + abbreviate(actor.reflectBarrier.toFixed(0)));
    }
    (actor.prefixes || []).forEach(function (affix) {
        sections.push(bonusSourceHelpText(affix, actor));
    });
    (actor.suffixes || []).forEach(function (affix) {
        sections.push(bonusSourceHelpText(affix, actor));
    });
    const countMap = {};
    (actor.allEffects || []).forEach(function (effect) {
        var effectText = bonusSourceHelpText(effect, actor);
        countMap[effectText] = (countMap[effectText] || 0) + 1;
    });
    for (let text in countMap) {
        if (countMap[text] > 1) text += tag('div', 'effectCounter', 'x' + countMap[text]);
        sections.push(tag('div', 'effectText', text));
    }
    return titleDiv(title) + sections.map(bodyDiv).join('');
}
export function gainLevel(hero: Hero) {
    hero.level++;
    updateTrophy('level-' + hero.job.key, hero.level);
    hero.character.fame += hero.level;
    gain('fame', hero.level);
    // We need to update the hero from scratch here because we cannot
    // remove their bonuses based on their level since no reference is stored to it.
    // One way to avoid this in the future would be to store this as a single bonus
    // that uses the character level as input. Then if we called setStat(hero, 'level', hero.level + 1);
    // All the other stats would be updated as a result. A similar approach could be used to set the base monster bonuses.
    // The formulate for monster health is too complicated for the bonus system to support at the moment though.
    updateAdventurer(hero);
    refreshStatsPanel();
    updateEquipableItems();
    // Enable the skipShrines option only once an hero levels the first time.
    getState().savedState.skipShrinesEnabled = true;
    query('.js-shrineButton').style.display = '';
}
export function damageActor(actor: Actor, damage: number) {
    actor.targetHealth -= damage;
}
export function healActor(actor: Actor, healAmount: number) {
    actor.targetHealth += healAmount;
}
export function setActorHealth(actor: Actor, health: number) {
    actor.targetHealth = actor.health = health;
    actor.percentHealth = actor.percentTargetHealth = health / actor.stats.maxHealth;
}

function divinityToLevelUp(currentLevel: number): number {
    return Math.ceil(baseDivinity(currentLevel)*(1 + (currentLevel - 1) / 10));
}
export function baseDivinity(level: number): number {
    return 10 * Math.pow(1.25, level - 1);
}

export function totalCostForNextLevel(character: Character, level: {level: number}): number {
    let totalDivinityCost = divinityToLevelUp(character.adventurer.level);
    if (character.adventurer.level > 1) {
        // Could add a cost coefficient to make certain skills more expensive/cheaper
        totalDivinityCost += Math.ceil(baseDivinity(level.level));
    }
    return Math.ceil((1 - (character.adventurer.stats.reducedDivinityCost || 0)) * totalDivinityCost);
}
export function setSelectedCharacter(character: Character) {
    const state = getState();
    state.selectedCharacter = character;
    // For debug purposes, put selected hero on window.Hero.
    window['Hero'] = character.hero;
    const hero = character.hero;
    // update the equipment displayed.
    equipmentSlots.forEach(function (type) {
        //detach any existing item
        query('.js-equipment .js-' + type + ' .js-item').remove();
        const equipment = hero.equipment[type];
        if (equipment) {
            query('.js-equipment .js-' + type).append(equipment.domElement);
        }
        query('.js-equipment .js-' + type + ' .js-placeholder').style.display = equipment ? 'none' : '';
    });
    // update stats panel.
    refreshStatsPanel(character, query('.js-characterColumn .js-stats'));
    updateOffhandDisplay();
    // update controls:
    character.boardCanvas = jewelsCanvas;
    const jewelBonusContainer = query('.js-jewelBonuses .js-content');
    jewelBonusContainer.innerText = bonusSourceHelpText(character.jewelBonuses, character.hero);
    centerMapOnLevel(map[character.currentLevelKey]);
    updateAdventureButtons();
    updateSkillConfirmationButtons();
    updateEquipableItems();
    //character.$characterCanvas.after($('.js-divinityPoints'));
    query('.js-charactersBox').appendChild(character.characterCanvas);
    showContext(character.context);
    // Immediately show the desired camera position so the camera doesn't have to
    // catch up on showing the area (the camera isn't updated when the character isn't selected).
    if (hero.area) {
        hero.area.cameraX = getTargetCameraX(hero);
    }
}

export function recomputeAllCharacterDirtyStats() {
    const state = getState();
    recomputeDirtyStats(state.guildVariableObject);
    for (const { hero } of state.characters) {
        recomputeDirtyStats(hero.variableObject);
    }
}
