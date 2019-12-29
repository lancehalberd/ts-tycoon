import { applyParentToVariableChild, createVariableObject } from 'app/bonuses';
import { tag, titleDiv } from 'app/dom';
import { evaluateForDisplay } from 'app/evaluate';
import { getState } from 'app/state';
import { isTwoHandedWeapon, sellValue, tagToDisplayName } from 'app/inventory';
import { points } from 'app/points';
import { fixedDigits, formatValue, properCase, percent } from 'app/utils/formatters';

import { Ability, Actor, Affix, BonusSource, Item } from 'app/types';

export function getNameWithAffixes(name: string, prefixes: Affix[], suffixes: Affix[]): string {
    const prefixNames = prefixes.map(affix => affix.base.name);
    if (prefixNames.length) name = prefixNames.join(', ') + ' ' + name;
    const suffixNames = suffixes.map(affix => affix.base.name);
    if (suffixNames.length) name = name + ' of ' + suffixNames.join(' and ');
    return name;
}

export function getItemHelpText(item: Item) {
    const sections = [];
    const state = getState();
    const actor = state.selectedCharacter.adventurer;
    // Unique items have a distinct display name that is used instead of the affix generated name.
    let title;
    if (item.displayName) title = item.displayName;
    else title = getNameWithAffixes(item.base.name, item.prefixes, item.suffixes);
    if (item.base.tags) {
        const tagParts = [];
        for (let tag in item.base.tags) {
            if (tag === 'offhand' && isTwoHandedWeapon(actor.equipment.weapon) && !actor.stats.twoToOneHanded) {
                tagParts.push('<span style="color: #c00;">' + tagToDisplayName(tag) + '</span>');
            } else {
                tagParts.push(tagToDisplayName(tag));
            }
        }
        sections.push(tagParts.join(', '));
    }

    if (item.requiredLevel > state.selectedCharacter.adventurer.level) {
        sections.push('<span style="color: #c00;">Requires level ' + item.requiredLevel + '</span>');
    } else {
        sections.push('Requires level ' + item.requiredLevel);
    }
    sections.push('Crafting level ' + item.itemLevel);
    sections.push('');
    sections.push(bonusSourceHelpText(item.base, state.selectedCharacter.adventurer));

    if (item.prefixes.length || item.suffixes.length) {
        sections.push('');
        item.prefixes.forEach(function (affix) {
            sections.push(bonusSourceHelpText(affix, state.selectedCharacter.adventurer));
        });
        item.suffixes.forEach(function (affix) {
            sections.push(bonusSourceHelpText(affix, state.selectedCharacter.adventurer));
        });
    }
    sections.push('');

    var sellValues = [points('coins', sellValue(item))];
    var total = item.prefixes.length + item.suffixes.length;
    if (total) {
        var animaValue = item.base.level * item.base.level * item.base.level;
        if (total <= 2) sellValues.push(points('anima', animaValue * total));
        else sellValues.push(points('anima', animaValue * total));
    }
    sections.push('Sell for ' + sellValues.join(' '));
    return titleDiv(title) + sections.join('<br/>');
}

const restrictionToCategoryMap = {
    'oneHanded': '1-handed Weapons',
    'twoHanded': '2-handed Weapons',
    'melee': 'Melee Weapons',
    'ranged': 'Ranged Weapons',
    'physical': 'Physical Weapons',
    'magic': 'Magic Weapons',
    'throwing': 'Throwing Weapons',
    'fist': 'Fist Weapons',
    'unarmed': 'Unarmed',
    'noOffhand': 'With No Offhand'
};
function restrictionToCategoryDisplayName(tag) {
    return restrictionToCategoryMap[tag] || properCase(tag);
}

const tagToCategoryMap = {
    'twoHanded': '2-handed Weapons',
    'oneHanded': '1-handed Weapons',
    'ranged': 'Ranged Attacks',
    'melee': 'Melee Attacks',
    'magic': 'Magic Attacks',
    'throwing': 'Throwing Weapons',
    'unarmed': 'While Unarmed',
    'fist': 'Fist Weapons',
    'noOffhand': 'With No Offhand'
};
export function tagToCategoryDisplayName(tag) {
    return tagToCategoryMap[tag] || properCase(tag);
}

export function bonusSourceHelpText(bonusSource: BonusSource, coreObject, localObject = null) {
    localObject = localObject || bonusSource;
    if (!bonusSource.bonuses) {
        console.log(bonusSource);
        throw new Error('bonusSource must have field called bonuses');
    }
    // Implicit bonuses are on: equipment, actions, effects and buffs.
    const isImplicit = bonusSource.hasImplicitBonuses;
    //console.log(isImplicit);
    //console.log(bonusSource);
    // Some stats are displayed in the helptext. In this case, we don't display
    // them a second time as implicit/regular bonuses.
    const displayedStats = {};
    // Hack to prevent effect area/duration from being displayed as non-implicit.
    // Basically we want +armor/+damage to show as non-implicit on effects, but
    // duration should be implicit, so we have to split it into both implicit
    // and non-implicit somehow.
    if (bonusSource.variableObjectType === 'effect') {
        displayedStats['+area'] = true;
        displayedStats['+duration'] = true;
    }
    const sections = [];
    const weaponRestrictions = [];
    let weaponsStyle = '';
    for (const restriction of (bonusSource.restrictions || [])) {
        let style = '';
        const state = getState();
        if (!state.selectedCharacter.hero.variableObject.tags[restriction]) {
            style = ' style="color: #c00;"';
        }
        const displayName = restrictionToCategoryDisplayName(restriction);
        if (displayName.indexOf('Weapons') >= 0) {
            if (!state.selectedCharacter.hero.variableObject.tags[restriction]) {
                weaponsStyle = ' style="color: #c00;"';
            }
            const parts = displayName.split(' ');
            parts.pop();
            weaponRestrictions.push(parts.join(' '));
        } else {
            sections.push('<u' + style + '>' + displayName + ' Only</u>');
        }
    }
    if (weaponRestrictions.length) {
        sections.push('<u' + weaponsStyle + '>' + weaponRestrictions.join(' ') + ' Weapons Only</u>');
    }
    if (bonusSource.helpText) {
        sections.push(bonusSource.helpText.replace(/\{([^\}]+)\}/g, function (match, key) {
            displayedStats[key] = true;
            if (typeof bonusSource.bonuses[key] === 'undefined') {
                console.log(bonusSource);
                throw new Error('helpText contained ' + key + ' but was not found among bonuses');
            }
            return evaluateForDisplay(bonusSource.bonuses[key], coreObject, localObject);
        }));
        //sections.push(bonusSource.helpText);
    }
    for (var bonus in bonusMap) {
        if (displayedStats[bonus]) continue;
        // If this is an implicit bonus, don't display it as a regular bonus.
        if (isImplicit && implicitBonusMap[bonus]) continue;
        var bonusText = renderBonusText(bonusMap, bonus, bonusSource, coreObject, localObject);
        if (bonusText) sections.push(bonusText);
    }
    if (isImplicit) {
        for (var bonus in implicitBonusMap) {
            // implicit bonuses marked true are displayed as part of another implicit bonus.
            if (displayedStats[bonus] || implicitBonusMap[bonus] === true) continue;
            var implicitBonusText = renderBonusText(implicitBonusMap, bonus, bonusSource, coreObject, localObject);
            if (implicitBonusText) sections.push(implicitBonusText);
        }
    }
    var tagBonusSources = {};
    Object.entries(bonusSource.bonuses).forEach(([key, value]) => {
        // Transform things like {'+bow:magic:minPhysicalDamage': 1} => 'bow:magic': {'+minPhysicalDamage': 1}
        // so that we can display per tag bonuses.
        if (key.indexOf(':') >= 0) {
            var parts = key.split(':');
            var statKey = key.charAt(0) + parts.pop();
            var tagKey = parts.join(':').substring(1);
            // console.log([key,statKey,tagKey]);
            tagBonusSources[tagKey] = tagBonusSources[tagKey] || {'bonuses': {}};
            tagBonusSources[tagKey].bonuses[statKey] = value;
        } else if (!displayedStats[key] && typeof value === 'string') {
            sections.push(value);
        }
    });
    Object.entries(tagBonusSources).forEach(([tags, tagBonusSource]) => {
        var tagBonusHelpText = bonusSourceHelpText(tagBonusSource, coreObject);
        if (tagBonusHelpText) {
            sections.push(tag('div', 'tagText', tags.split(':').map(tagToCategoryDisplayName).join(', ') + ':<br/>' + tagBonusHelpText));
        }
    });
    if (bonusSource.variableObjectType === 'effect') {
        if (bonusSource.bonuses['+area']) sections.push(renderBonusText(implicitBonusMap, '+area', bonusSource, coreObject, localObject));
        if (bonusSource.bonuses['+duration']) sections.push(renderBonusText(implicitBonusMap, '+duration', bonusSource, coreObject, localObject));

        return tag('div', 'effectText', sections.join('<br/>'));
    }
    return sections.join('<br/>');
}
export function renderBonusText(bonusMap, bonusKey, bonusSource, coreObject, localObject) {
    const rawValue = bonusSource.bonuses[bonusKey] || bonusSource.bonuses['+' + bonusKey];
    // Don't show help text like +0 accuracy or 0% increased accuracy, but do show 0x accuracy.
    if (rawValue === 0 && bonusKey.charAt(0) !== '*') return null;
    if (rawValue === null || rawValue === undefined) return null;
    const textOrFunction = bonusMap[bonusKey];
    if (typeof textOrFunction === 'function') return textOrFunction(bonusSource, coreObject);
    const text = textOrFunction;
    const matches = text.match(/(\$|\%)\d/);
    if (matches) {
        const wildcard = matches[0];
        let renderedValue = evaluateForDisplay(rawValue, coreObject, localObject);
        const digits = Number(wildcard[1]);
        if (wildcard[0] === '%') renderedValue = percent(renderedValue, digits);
        else if ('' + parseFloat(renderedValue) == renderedValue) {
            renderedValue = parseFloat(renderedValue).toFixed(digits);
        }
        return text.split(wildcard).join(renderedValue);
    }
    return text;
}
export function abilityHelpText(ability: Ability, actor: Actor) {
    const sections = [];
    if (ability.bonuses) sections.push(bonusSourceHelpText(ability, actor.variableObject));
    const action = ability.action || ability.reaction;
    if (action) {
        const actionInstance = createVariableObject(action, actor.variableObject);
        applyParentToVariableChild(actor.variableObject, actionInstance);
        // TODO: display action restrictions, if any.
        sections.push(tag('div', 'abilityText', bonusSourceHelpText(action, actor, actionInstance)));
    }
    if (ability.minionBonuses) {
        sections.push(tag('div', 'tagText', 'Minions:<br/>' + bonusSourceHelpText({'bonuses': ability.minionBonuses}, actor)));
    }
    return titleDiv(ability.name) + sections.join('<br/>');
}
export const implicitBonusMap = {
    // Gear implicits
    '+minPhysicalDamage': function (bonusSource) {
        return 'Damage: ' + formatValue(bonusSource.bonuses['+minPhysicalDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxPhysicalDamage'], 1);
    },
    '+minMagicDamage': function (bonusSource) {
        return 'Magic: ' + formatValue(bonusSource.bonuses['+minMagicDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxMagicDamage'], 1);
    },
    '+minWeaponPhysicalDamage': function (bonusSource) {
        return 'Damage: ' + formatValue(bonusSource.bonuses['+minWeaponPhysicalDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxWeaponPhysicalDamage'], 1);
    },
    '+minWeaponMagicDamage': function (bonusSource) {
        return 'Magic: ' + formatValue(bonusSource.bonuses['+minWeaponMagicDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxWeaponMagicDamage'], 1);
    },
    '+weaponRange': 'Range: $1',
    '+range': 'Range: $1',
    // Range is currently only implicit on genericActions with *range:0 so
    // targeting circles ignore their range. If this stops working for some reason
    // we could try using $range: 0 instead.
    '*range': true,
    '+attackSpeed': 'Attack Speed: $1',
    '+critChance': '%1 critical strike chance',
    '+armor': 'Armor: $1',
    '+evasion': 'Evasion: $1',
    '+block': 'Block: $1',
    '+magicBlock': 'Magic Block: $1',
    '+speed': 'Movement Speed: $1',
    '-speed': 'Movement Speed: -$1',
    // Ability implicits
    '$monsterKey': 'Summons a $',
    '+area': 'Area: $1',
    '+chance': '%1 chance',
    '+consumeRatio': 'Absorb %1 of the target\'s max health',
    '+teleport': 'Distance: $1',
    '+limit': 'Limit: $1',
    '+cooldown': 'Cooldown: $1 seconds',
    '+duration': 'Lasts $1 seconds'
};
// Use this mapping for stats that are not implicity on an item or ability.
export const bonusMap: {
    [key: string]: string | ((bonusSource: BonusSource) => string)
} = {
    '$setRange': function (bonusSource) {
        if (bonusSource.bonuses['$setRange'] === 'melee') return 'Attacks become melee';
        if (bonusSource.bonuses['$setRange'] === 'ranged') return 'Attacks become ranged';
        console.log(bonusSource);
        debugger;
        throw new Error('unexpected value ' + bonusSource.bonuses['$setRange']);
    },
    '$weaponRange': 'Weapon range is always $1',
    '*weaponRange': '$1× weapon range',
    // Offensive stats
    '+damage': '+$1 damage',
    '*damage': '$3× damage',
    '%damage': '%1 increased damage',
    '+weaponDamage': '+$1 damage',
    '*weaponDamage': '$3× damage',
    '%weaponDamage': '%1 increased damage',
    '+minPhysicalDamage': function (bonusSource) {
        return formatValue(bonusSource.bonuses['+minPhysicalDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxPhysicalDamage'], 1) + ' increased physical damage';
    },
    '+minMagicDamage': function (bonusSource) {
        return formatValue(bonusSource.bonuses['+minMagicDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxMagicDamage'], 1) + ' increased magic damage';
    },
    '+minWeaponPhysicalDamage': function (bonusSource) {
        return formatValue(bonusSource.bonuses['+minWeaponPhysicalDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxWeaponPhysicalDamage'], 1) + ' increased physical damage';
    },
    '+minWeaponMagicDamage': function (bonusSource) {
        return formatValue(bonusSource.bonuses['+minWeaponMagicDamage'], 1) + ' to ' + formatValue(bonusSource.bonuses['+maxWeaponMagicDamage'], 1) + ' increased magic damage';
    },
    '+physicalDamage': '+$1 physical damage',
    '*physicalDamage': '$3× physical damage',
    '%physicalDamage': '%1 increased physical damage',
    '+magicDamage': '+$1 magic damage',
    '*magicDamage': '$3× magic damage',
    '%magicDamage': '%1 increased magic damage',
    '+weaponPhysicalDamage': '+$1 physical damage',
    '*weaponPhysicalDamage': '$3× physical damage',
    '%weaponPhysicalDamage': '%1 increased physical damage',
    '+weaponMagicDamage': '+$1 magic damage',
    '*weaponMagicDamage': '$3× magic damage',
    '%weaponMagicDamage': '%1 increased magic damage',
    '+magicPower': '+$1 magic power',
    '*magicPower': '$1× magic power',
    '%magicPower': '%1 increased magic power',
    '+attackSpeed': '+$1 attacks per second',
    '*attackSpeed': '$1× attack speed',
    '%attackSpeed': '%1 increased attack speed',
    '+critChance': '+%1 chance to critical strike',
    '*critChance': '$1× critical chance',
    '%critChance': '%1 increased critical chance',
    '+critDamage': '+%1 critical damage',
    '*critDamage': '$1× critical damage',
    '%critDamage': '%1 increased critical damage',
    '+critAccuracy': '+%1 critical accuracy',
    '*critAccuracy': '$1× critical accuracy',
    '%critAccuracy': '%1 increased critical accuracy',
    '+range': '+$1 range',
    '*range': '$1× range',
    '+accuracy': '+$1 accuracy',
    '*accuracy': '$1× accuracy',
    '%accuracy': '%1 increased accuracy',
    // Defensive stats
    '+armor': '+$1 armor',
    '-armor': '$1 decreased armor',
    '%armor': '%1 increased armor',
    '+evasion': '+$1 evasion',
    '-evasion': '-$1 evasion',
    '*evasion': '$1× evasion',
    '%evasion': '%1 increased evasion',
    '+block': '+$1 block',
    '-block': '$1 decreased block',
    '%block': '%1 increased block',
    '+magicBlock': '+$1 magic block',
    '*magicBlock': '$1× magic block',
    '%magicBlock': '%1 increased magic block',
    '+magicResist': 'Reduces magic damage received by %1',
    '*magicResist': '$1× magic resist',
    '+maxHealth': '+$1 health',
    '*maxHealth': '$1× health',
    '%maxHealth': '%1 increased health',
    // Miscellaneous Stats
    '+dexterity': '+$1 Dexterity',
    '%dexterity': '%1 increased Dexterity',
    '+strength': '+$1 Strength',
    '%strength': '%1 increased Strength',
    '+intelligence': '+$1 Intelligence',
    '%intelligence': '%1 increased Intelligence',
    '+healthGainOnHit': 'Gain $2 health on hit',
    '*healthGainOnHit': '$1× health gained on hit',
    '+healthRegen': 'Regenerate $1 health per second',
    '*healthRegen': '$1× health regenerated per second',
    '%healthRegen': '%1 increased health regenerated per second',
    '+damageOnMiss': 'Deals $1 true damage to enemy on miss',
    '+slowOnHit': 'Slow targets by %0 on hit',
    '-speed': '$1 reduced movement speed',
    '+speed': '+$1 movement speed',
    '%speed': '%1 increased movement speed',
    '*speed': '$1× movement speed',
    '+increasedDrops': 'Gain %1 more coins and anima',
    // Ability specific bonuses
    '+area': '+$1 area offect',
    '*area': '$1× increased area of effect',
    '%area': '%1 increased area of effect',
    '*power': '$1× more effective',
    '+cooldown': 'Cooldown increased by $1 seconds',
    '-cooldown': 'Cooldown decreased by $1 seconds',
    '%cooldown': '%1 cooldown time',
    '*cooldown': '$1× cooldown time',
    '+limit': '+$0 maximum minions',
    '+armorPenetration': '+%1 armor penetration',
    '+dragDamage': '%1 of initial damage is dealth per distance dragged',
    '+dragStun': 'Target is stunned for $1 seconds per distance dragged',
    '+rangeDamage': '%1 increased damage per distance the attack travels',
    '*distance': '$1× distance',
    '+chance': '+%1 chance',
    '+cleave': '%1 splash damage to all enemies in range',
    '+cleaveRange': '+$1 range for splash damage',
    '+knockbackChance': '%1 chance to knock back enemies on hit',
    '+knockbackDistance': '+$1 knock back distance',
    '+cull': 'Instantly kill enemies with less than %1 health',
    '+castKnockBack': 'Knock nearby enemies away on spell cast',
    '+healOnCast': 'Recover %1 of your max health on spell cast',
    '+overHeal': '%1 of health gained beyond your max becomes additional max health',
    '+overHealReflection': '%1 of health gained beyond your max becomes a reflective barrier',
    '+lifeSteal': '%1 of damage dealt is gained as life',
    '+duration': '+$1s duration',
    '*duration': '$1× duration',
    '%duration': '%1 increased duration',
    '+count': '+$1 enchantment(s) stolen',
    '+weaponRange': '+$1 increased range',
    '+damageOverTime': 'Taking $1 damage per second',
    '+reducedDivinityCost': '%1 reduced divinity cost at shrines',
    '+maxAnima': '+$1 max anima',
    '+maxCoins': '+$1 max coins'
};
