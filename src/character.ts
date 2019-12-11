import { updateActorDimensions } from 'app/adventure';
import { updateAdventureButtons } from 'app/adventureButtons';
import {
    addBonusSourceToObject, addVariableChildToObject,
    findVariableChildForBaseObject,
    initializeVariableObject,
    recomputeDirtyStats, removeBonusSourceFromObject
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

import { Actor, Board, BoardData, Character, Equipment, EquipmentData, Job, Tags } from 'app/types';
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
    setActorHealth(actor, actor.maxHealth);
    actor.maxReflectBarrier = actor.reflectBarrier = 0;
    actor.bonusMaxHealth = 0;
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
    actor.temporalShield = actor.maxTemporalShield = (stopTimeAction ? stopTimeAction.duration : 0);
    updateActorDimensions(actor);
}
export function refreshStatsPanel(
    character = getState().selectedCharacter,
    statsPanelElement: HTMLElement = query('.js-characterColumn .js-stats')
) {
    const adventurer = character.adventurer;
    statsPanelElement.querySelector('.js-playerName').textContent = adventurer.job.name + ' ' + adventurer.name;
    statsPanelElement.querySelector('.js-playerLevel').textContent = '' + adventurer.level;
    statsPanelElement.querySelector('.js-fame').textContent = character.fame.toFixed(1);
    statsPanelElement.querySelector('.js-dexterity').textContent = adventurer.dexterity.toFixed(0);
    statsPanelElement.querySelector('.js-strength').textContent = adventurer.strength.toFixed(0);
    statsPanelElement.querySelector('.js-intelligence').textContent = adventurer.intelligence.toFixed(0);
    query('.js-global-divinity').textContent = abbreviate(character.divinity);
    statsPanelElement.querySelector('.js-maxHealth').textContent = abbreviate(adventurer.maxHealth, 0);
    if (adventurer.actions.length) {
        statsPanelElement.querySelector('.js-range').textContent = getBasicAttack(adventurer).range.toFixed(2);
    }
    statsPanelElement.querySelector('.js-speed').textContent = adventurer.speed.toFixed(1);
    statsPanelElement.querySelector('.js-healthRegen').textContent = adventurer.healthRegen.toFixed(1);
    updateDamageInfo(character, statsPanelElement);
}
export function newCharacter(job: Job): Character {
    const hero = makeAdventurerFromJob(job, 1, job.startingEquipment || {});
    setActorHealth(hero, hero.maxHealth);
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
export function makeAdventurerFromData(adventurerData): Actor {
    const personCanvas = createCanvas(personFrames * 96, 64);
    const personContext = personCanvas.getContext("2d");
    personContext.imageSmoothingEnabled = false;
    const adventurer: Actor = {
        'x': 0,
        'y': 0,
        'z': 0,
        'equipment': {},
        'job': characterClasses[adventurerData.jobKey],
        'source': setupActorSource({
            'width': 96,
            'height': 64,
            'yCenter': 44, // Measured from the top of the source
            'yOffset': 14, // Measured from the top of the source
            'actualHeight': 45,
            'xOffset': 39,
            'actualWidth': 18,
            'attackY': 19, // Measured from the bottom of the source
            'walkFrames': [0, 1, 0, 2],
            'attackPreparationFrames': [0, 3, 4],
            'attackRecoveryFrames': [4, 3]
        }),
        'unlockedAbilities': {},
        'abilities': [],
        'name': adventurerData.name,
        'hairOffset': adventurerData.hairOffset % 6,
        'skinColorOffset': ifdefor(adventurerData.skinColorOffset, Random.range(0, 2)) % 3,
        'level': adventurerData.level,
        'image': personCanvas,
        personCanvas,
        personContext,
        'attackCooldown': 0,
        'percentHealth': 1,
        'percentTargetHealth': 1,
        'helpMethod': actorHelpText,
        character: null,
        heading: [1, 0, 0], // Character moves left to right by default.
        bonusMaxHealth: 0,
        // Will be set when bonuses are calculated.
        maxHealth: 0,
    };
    initializeVariableObject(adventurer, {'variableObjectType': 'actor'}, adventurer);
    equipmentSlots.forEach(function (type) {
        adventurer.equipment[type] = null;
    });
    return adventurer;
}
export function makeAdventurerFromJob(job: Job, level: number, equipment: EquipmentData): Actor {
    const adventurer = makeAdventurerFromData({
        'jobKey': job.key,
        level,
        'name': Random.element(names),
        'hairOffset': Random.range(0, 6),
        'skinColorOffset': Random.range(0, 2),
        equipment,
    });
    const state = getState();
    for (const item of Object.values(equipment)) {
        state.savedState.craftedItems[item.key] = (state.savedState.craftedItems[item.key] || 0) | CRAFTED_NORMAL;
        equipItemProper(adventurer, makeItem(item, 1), false);
    }
    updateAdventurer(adventurer);
    return adventurer;
}
export function readBoardFromData(boardData: BoardData, character, ability, confirmed = false): Board {
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

export function addActions(actor, source) {
    var effect, action;
    if (source.onHitEffect) {
        effect = initializeVariableObject({}, source.onHitEffect, actor);
        effect.ability = source;
        actor.onHitEffects.push(effect);
        addVariableChildToObject(actor, effect);
    }
    if (source.onCritEffect) {
        effect = initializeVariableObject({}, source.onCritEffect, actor);
        effect.ability = source;
        actor.onCritEffects.push(effect);
        addVariableChildToObject(actor, effect);
    }
    if (source.onMissEffect) {
        effect = initializeVariableObject({}, source.onMissEffect, actor);
        effect.ability = source;
        actor.onMissEffects.push(effect);
        addVariableChildToObject(actor, effect);
    }
    if (source.action) {
        action = initializeVariableObject({}, source.action, actor);
        action.ability = source;
        actor.actions.push(action);
        addVariableChildToObject(actor, action);
    }
    if (source.reaction) {
        action = initializeVariableObject({}, source.reaction, actor);
        action.ability = source;
        actor.reactions.push(action);
        addVariableChildToObject(actor, action);
    }
    if (source.minionBonuses) {
        actor.minionBonusSources.push({'bonuses': source.minionBonuses});
    }
}
export function removeActions(actor, source) {
    var variableChild;
    if (ifdefor(source.onHitEffect)) {
        variableChild = findVariableChildForBaseObject(actor, source.onHitEffect);
        removeElementFromArray(actor.onHitEffects, variableChild);
        removeElementFromArray(actor.variableChildren, variableChild);
    }
    if (ifdefor(source.onCritEffect)) {
        variableChild = findVariableChildForBaseObject(actor, source.onCritEffect);
        removeElementFromArray(actor.onCritEffects, variableChild);
        removeElementFromArray(actor.variableChildren, variableChild);
    }
    if (ifdefor(source.action)) {
        variableChild = findVariableChildForBaseObject(actor, source.action);
        removeElementFromArray(actor.actions, variableChild);
        removeElementFromArray(actor.variableChildren, variableChild);
    }
    if (ifdefor(source.reaction)) {
        variableChild = findVariableChildForBaseObject(actor, source.reaction);
        removeElementFromArray(actor.reactions, variableChild);
        removeElementFromArray(actor.variableChildren, variableChild);
    }
    if (ifdefor(source.minionBonuses)) {
        for (var bonusSource of actor.minionBonusSources) {
            if (bonusSource.bonuses === source.minionBonuses) {
                removeElementFromArray(actor.minionBonusSources, bonusSource);
            }
        }
    }
}
export function updateAdventurer(adventurer) {
    // Clear the character's bonuses and graphics.
    initializeVariableObject(adventurer, {'variableObjectType': 'actor'}, adventurer);
    for (var stat of Object.keys(adventurer)) {
        if (stat.indexOf('Ops') === stat.length - 3) {
            delete adventurer[stat];
        }
    }
    adventurer.actions = [];
    adventurer.reactions = [];
    adventurer.onHitEffects = [];
    adventurer.onCritEffects = [];
    adventurer.onMissEffects = [];
    adventurer.allEffects = [];
    adventurer.minionBonusSources = [];
    const levelCoefficient = Math.pow(1.05, adventurer.level);
    const adventurerBonuses: Bonuses = {
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
    adventurer.tags = recomputeActorTags(adventurer);
    updateAdventurerGraphics(adventurer);
    addActions(adventurer, abilities.basicAttack);
    adventurer.abilities.forEach(function (ability) {
        addActions(adventurer, ability);
        if (ability.bonuses) addBonusSourceToObject(adventurer, ability);
    });
    if (adventurer.character) {
        updateJewelBonuses(adventurer.character);
        addBonusSourceToObject(adventurer, adventurer.character.jewelBonuses);
    }
    // Add the adventurer's current equipment to bonuses and graphics
    equipmentSlots.forEach(function (type) {
        var equipment = adventurer.equipment[type];
        if (!equipment) {
            return;
        }
        addActions(adventurer, equipment.base);
        addBonusSourceToObject(adventurer, equipment.base);
        equipment.prefixes.forEach(function (affix) {
            addActions(adventurer, affix);
            addBonusSourceToObject(adventurer, affix);
        });
        equipment.suffixes.forEach(function (affix) {
            addActions(adventurer, affix);
            addBonusSourceToObject(adventurer, affix);
        });
    });
    addBonusSourceToObject(adventurer, {'bonuses': adventurerBonuses});
    addBonusSourceToObject(adventurer, coreStatBonusSource);
    for (const bonusSource of getState().guildBonusSources) {
        addBonusSourceToObject(adventurer, bonusSource);
    }
    recomputeDirtyStats(adventurer);
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
    if (actor.base && actor.base.tags) {
        for (const tag of ifdefor(actor.base.tags, [])) tags[tag] = true;
        if (tags['ranged']) delete tags['melee'];
        else tags['melee'] = true;
    }
    if (actor.setRange) {
        if (actor.setRange === 'ranged') {
            tags['ranged'] = true;
            delete tags['melee'];
        } else {
            tags['melee'] = true;
            delete tags['ranged'];
        }
    }
    return tags;
}
export function actorHelpText(actor) {
    var name = actor.name;
    if (actor.job) {
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
        '/' + abbreviate(Math.ceil(actor.maxHealth))];
    if (actor.temporalShield > 0) {
        sections.push('Temporal Shield: ' + actor.temporalShield.format(1) + 's');
    }
    if (actor.reflectBarrier > 0) {
        sections.push('Reflect: ' + abbreviate(actor.reflectBarrier.format(0)));
    }
    ifdefor(actor.prefixes, []).forEach(function (affix) {
        sections.push(bonusSourceHelpText(affix, actor));
    });
    ifdefor(actor.suffixes, []).forEach(function (affix) {
        sections.push(bonusSourceHelpText(affix, actor));
    });
    var countMap = {};
    ifdefor(actor.allEffects, []).forEach(function (effect) {
        var effectText = bonusSourceHelpText(effect, actor);
        countMap[effectText] = ifdefor(countMap[effectText], 0) + 1;
    });
    for (var text in countMap) {
        if (countMap[text] > 1) text += tag('div', 'effectCounter', 'x' + countMap[text]);
        sections.push(tag('div', 'effectText', text));
    }
    return titleDiv(title) + sections.map(bodyDiv).join('');
}
export function gainLevel(adventurer) {
    adventurer.level++;
    updateTrophy('level-' + adventurer.job.key, adventurer.level);
    adventurer.fame += adventurer.level;
    gain('fame', adventurer.level);
    // We need to update the adventurer from scratch here because we cannot
    // remove their bonuses based on their level since no reference is stored to it.
    // One way to avoid this in the future would be to store this as a single bonus
    // that uses the character level as input. Then if we called setStat(adventurer, 'level', adventurer.level + 1);
    // All the other stats would be updated as a result. A similar approach could be used to set the base monster bonuses.
    // The formulate for monster health is too complicated for the bonus system to support at the moment though.
    updateAdventurer(adventurer);
    refreshStatsPanel();
    updateEquipableItems();
    // Enable the skipShrines option only once an adventurer levels the first time.
    getState().savedState.skipShrinesEnabled = true;
    query('.js-shrineButton').style.display = '';
}
export function damageActor(actor, damage) {
    actor.targetHealth -= damage;
}
export function healActor(actor, healAmount) {
    actor.targetHealth += healAmount;
}
export function setActorHealth(actor, health) {
    actor.targetHealth = actor.health = health;
    actor.percentHealth = actor.percentTargetHealth = health / actor.maxHealth;
}

function divinityToLevelUp(currentLevel) {
    return Math.ceil(baseDivinity(currentLevel)*(1 + (currentLevel - 1) / 10));
}
export function baseDivinity(level) {
    return 10 * Math.pow(1.25, level - 1);
}

export function totalCostForNextLevel(character: Character, level): number {
    let totalDivinityCost = divinityToLevelUp(character.adventurer.level);
    if (character.adventurer.level > 1) {
        totalDivinityCost += Math.ceil((level.skill.costCoefficient || 1) * baseDivinity(level.level));
    }
    return Math.ceil((1 - (character.adventurer.reducedDivinityCost || 0)) * totalDivinityCost);
}
export function setSelectedCharacter(character) {
    const state = getState();
    state.selectedCharacter = character;
    // For debug purposes, put selected hero on window.Hero.
    window['Hero'] = state.selectedCharacter.hero;
    var adventurer = character.adventurer;
    // update the equipment displayed.
    equipmentSlots.forEach(function (type) {
        //detach any existing item
        query('.js-equipment .js-' + type + ' .js-item').remove();
        const equipment: Item = adventurer.equipment[type];
        if (equipment) {
            query('.js-equipment .js-' + type).append(equipment.domElement);
        }
        query('.js-equipment .js-' + type + ' .js-placeholder').style.display = equipment ? 'none' : '';
    });
    // update stats panel.
    refreshStatsPanel(character, query('.js-characterColumn .js-stats'));
    updateOffhandDisplay();
    // update controls:
    //TODO
    //$('.js-jewelBoard .js-skillCanvas').data('character', character);
    character.jewelsCanvas = query('.js-jewelBoard .js-skillCanvas');
    const jewelBonusContainer = query('.js-jewelBonuses .js-content');
    jewelBonusContainer.innerText = bonusSourceHelpText(character.jewelBonuses, character.adventurer);
    centerMapOnLevel(map[character.currentLevelKey]);
    updateAdventureButtons();
    updateSkillConfirmationButtons();
    updateEquipableItems();
    //character.$characterCanvas.after($('.js-divinityPoints'));
    query('.js-charactersBox').appendChild(character.characterCanvas);
    showContext(character.context);
    // Immediately show the desired camera position so the camera doesn't have to
    // catch up on showing the area (the camera isn't updated when the character isn't selected).
    var actor = character.adventurer;
    if (actor.area) actor.area.cameraX = getTargetCameraX(actor);
}

export function recomputeAllCharacterDirtyStats() {
    const state = getState();
    recomputeDirtyStats(state.guildStats);
    for (const character of state.characters) recomputeDirtyStats(character.adventurer);
}
