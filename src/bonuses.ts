import { recomputeActorTags } from 'app/character';
import { allActorVariables, allGuildVariables, allRoundedVariables, commonActionVariables } from 'app/content/variables';
import { evaluateValue } from 'app/evaluate';
import { getState } from 'app/state';
import { removeElementFromArray } from 'app/utils/index';

import {
    Actor, Bonus, Bonuses, BonusOperator, BonusSource, BonusValue,
    EffectVariableObject, Tags, VariableObject, VariableObjectBase,
} from 'app/types';

import {  } from 'app/types';

const operations = {'*': true, '+': true, '-': true, '%': true, '$': true, '&': true};

// Parses a hash key+value like {"+melee:damage": 25} into a fully defined bonus object.
function parseBonus(bonusKeyString: string, value: BonusValue): Bonus {
    if (typeof bonusKeyString !== 'string') {
        console.log('Expected string for bonusKeyString, found:');
        console.log(bonusKeyString);
        throw Error('bonusKeyString must be a string');
    }
    const operator = bonusKeyString[0] as BonusOperator;
    const tags = bonusKeyString.substr(1).split(':');
    const stat = tags.pop();
    let stats: string[];
    // There are a few statKeys that effect multiple values on the object.
    if (stat === 'damage') {
        stats = ['minPhysicalDamage', 'maxPhysicalDamage', 'minMagicDamage', 'maxMagicDamage'];
    } else if (stat === 'physicalDamage') {
        stats = ['minPhysicalDamage', 'maxPhysicalDamage'];
    } else if (stat === 'magicDamage') {
        stats = ['minMagicDamage', 'maxMagicDamage'];
    } else if (stat === 'weaponDamage') {
        stats = ['minWeaponPhysicalDamage', 'maxWeaponPhysicalDamage', 'minWeaponMagicDamage', 'maxWeaponMagicDamage'];
    } else if (stat === 'weaponPhysicalDamage') {
        stats = ['minWeaponPhysicalDamage', 'maxWeaponPhysicalDamage'];
    } else if (stat === 'weaponMagicDamage') {
        stats = ['minWeaponMagicDamage', 'maxWeaponMagicDamage'];
    } else {
        stats = [stat];
    }
    const statDependencies = getStatDependencies(value, {});
    const shortHand = operator + tags.join(':') + ':' + stat + ':' + value;
    return { operator, tags, stats, value, statDependencies, shortHand };
}
function getStatDependencies(bonusValue: BonusValue, dependencies) {
    if (typeof bonusValue === 'number') return dependencies;
    if (typeof bonusValue === 'string') {
        if (bonusValue[0] !== '{') return dependencies; // this is just a string.
        dependencies[bonusValue.substring(1, bonusValue.length - 1)] = true;
        return dependencies
    }
    if (!bonusValue) throw Error('bonusValue was null or undefined');
    if (Array.isArray(bonusValue)) {
        switch (bonusValue.length) {
            case 1:
                return getStatDependencies(bonusValue[0], dependencies);
            case 2: // Unary operators like ['-', '{intelligence}']
                return getStatDependencies(bonusValue[1], dependencies);
            case 3: // Binary operators like [20, '+', '{strength}']
                dependencies = getStatDependencies(bonusValue[0], dependencies);
                return getStatDependencies(bonusValue[2], dependencies);
            default:
                console.log(bonusValue);
                throw new Error('bonusValue formula must have exactly 2 or 3 entries');
        }
    }
    return dependencies;
}
function parseBonuses(bonusSource: BonusSource): Bonus[] {
    if (bonusSource.parsedBonuses) return bonusSource.parsedBonuses; // Use memoized value if available. Otherwise, populate memoized value below.
    bonusSource.parsedBonuses = [];
    for (const bonusKeyString of Object.keys(bonusSource.bonuses)) {
        const bonus = parseBonus(bonusKeyString, bonusSource.bonuses[bonusKeyString]);
        bonusSource.parsedBonuses.push(bonus);
    }
    return bonusSource.parsedBonuses;
}

export function createVariableObject(baseObject: VariableObjectBase, coreObject: VariableObject = null): VariableObject {
    if (!baseObject) throw new Error('No base object provided for new variable object');
    if (!baseObject.variableObjectType) throw new Error('variableObjectType was not set on a variable object base object');
    // this doesn't really make sense for the guild stats object,
    // but I don't think this is causing any issues at the moment.
    // if (!coreObject) throw new Error('No coreObject was provided for a new variable object. This must be provided for some implicit bonuses to work correctly, like range: {weaponRange} on attacks.');
    const object: VariableObject = {
        type: baseObject.variableObjectType,
        base: baseObject,
        core: coreObject,
        tags: {},
        bonusSources: [],
        bonusesByTag: {},
        bonusesDependingOn: {},
        allBonuses: [],
        dirtyStats: {},
        operations: {},
        stats: {},
        variableChildren: [],
    } as VariableObject;
    object.core = object.core || object;
    for (const tag of (object.base.tags || [])) {
        object.tags[tag] = true;
    }
    switch (object.type){
        case 'actor':
            for (const actorStat of Object.keys(allActorVariables)) {
                object.dirtyStats[actorStat] = true;
            }
            break;
        case 'action':
            for (const actionStat of Object.keys(commonActionVariables)) {
                object.dirtyStats[actionStat] = true;
            }
            break;
        case 'effect':
            object.bonuses = {};
            for (const effectStat of ['duration', 'area', 'maxStacks']) {
                object.dirtyStats[effectStat] = true;
            }
            break;
        case 'guild':
            for (const guildStat of Object.keys(allGuildVariables)) {
                object.dirtyStats[guildStat] = true;
            }
            break;
    }
    if (object.base.bonuses) {
        addBonusSourceToObject(object, object.base as BonusSource,
            // Trigger computation so that implicit bonus will set stats it defines as targetable.
            // Otherwise bonuses that target stats on the implicitBonuses but are not otherwise
            // commonly defined stats won't apply since they check if that stat is null on the object.
            true,
            // Setting isImplicit to true will apply all bonuses, without checking if they are valid
            // for the object. Implicit bonuses are only defined if they are intended to be used on
            // the object. They also indicate that the stat should be targetable on this object in general.
            // Finally, isImplicit prevents these bonuses from being applied to children. Implicit bonuses
            // are intended only to be used as the basic stats for the object.
            true,
        );
    }
    return object;
}

export function addBonusSourceToObject(
    object: VariableObject,
    bonusSource: BonusSource,
    triggerComputation = false,
    isImplicit = false
) {
    if (!bonusSource) debugger;
    if (!bonusSource.bonuses) return;
    // Nonimplicit bonuses apply recursively to all the children of this object (actions of actors, buffs on actions, bonuses on buffs, etc).
    if (!isImplicit) {
        for (const variableChild of object.variableChildren) {
            addBonusSourceToObject(variableChild, bonusSource, triggerComputation);
        }
        object.bonusSources.push(bonusSource);
    }
    const bonuses = parseBonuses(bonusSource);
    for (const bonus of bonuses) {
        // Don't bother adding dependencies or tag information to bonuses that do not
        // even apply to this kind of object.
        if (!isImplicit && !doesStatApplyToObject(bonus.stats[0], object)) continue;
        for (const tag of bonus.tags) {
            object.bonusesByTag[tag] = object.bonusesByTag[tag] || [];
            object.bonusesByTag[tag].push(bonus);
        }
        for (const dependencyString of Object.keys(bonus.statDependencies)) {
            if (dependencyString.indexOf('this.') === 0) {
                const stat = dependencyString.substring(5);
                object.bonusesDependingOn[stat] = object.bonusesDependingOn[stat] || [];
                object.bonusesDependingOn[stat].push({object, bonus});
            } else {
                const stat = dependencyString;
                const dependencySource = object.core;
                dependencySource.bonusesDependingOn[stat] = dependencySource.bonusesDependingOn[stat] || [];
                dependencySource.bonusesDependingOn[stat].push({object, bonus});
            }
        }
        addBonusToObject(object, bonus, isImplicit);
    }
    if (triggerComputation) {
        recomputeDirtyStats(object);
    }
}

export function removeBonusSourceFromObject(
    object: VariableObject,
    bonusSource: BonusSource,
    triggerComputation = false,
) {
    if (!bonusSource.bonuses) return;
    // Bonuses apply recursively to all the children of this object (actions of actors, buffs on actions, bonuses on buffs, etc).
    for (const variableChild of object.variableChildren) {
        removeBonusSourceFromObject(variableChild, bonusSource, triggerComputation);
    }
    const sourceIndex = object.bonusSources.indexOf(bonusSource);
    if (sourceIndex < 0) {
        console.log('tried to remove bonusSource that was not found on object:');
        console.log(bonusSource);
        console.log(object);
        throw Error('Attempted to remove a bonus source from an object that it was not present on.');
    }
    object.bonusSources.splice(sourceIndex, 1);
    const bonuses = parseBonuses(bonusSource);
    for (const bonus of bonuses) {
        // Don't bother adding dependencies or tag information to bonuses that do not
        // even apply to this kind of object.
        if (!doesStatApplyToObject(bonus.stats[0], object)) continue;
        for (const tag of bonus.tags) {
            const index = object.bonusesByTag[tag].indexOf(bonus);
            object.bonusesByTag[tag].splice(index, 1);
        }
        for (const dependencyString of Object.keys(bonus.statDependencies)) {
            if (dependencyString.indexOf('this.') === 0) {
                const stat = dependencyString.substring(5);
                for (let i = 0; i <  object.bonusesDependingOn[stat].length; i++) {
                    const dependency = object.bonusesDependingOn[stat][i];
                    if (dependency.object === object && dependency.bonus === bonus) {
                        object.bonusesDependingOn[stat].splice(i, 1);
                        break;
                    }
                }
            } else {
                const stat = dependencyString;
                const dependencySource = object.core;
                for (let i = 0; i < dependencySource.bonusesDependingOn[stat].length; i++) {
                    const dependency = dependencySource.bonusesDependingOn[stat][i];
                    if (dependency.object === object && dependency.bonus === bonus) {
                        dependencySource.bonusesDependingOn[stat].splice(i, 1);
                        break;
                    }
                }
            }
        }
        removeBonusFromObject(object, bonus);
    }
    if (triggerComputation) {
        recomputeDirtyStats(object);
    }
}

function addBonusToObject(object: VariableObject, bonus: Bonus, isImplicit = false) {
    // Ignore this bonus for this object if the stat doesn't apply to it.
    if (!isImplicit && !doesStatApplyToObject(bonus.stats[0], object)) return;
    // Do nothing if bonus tags are not all present on the object.
    if (!object.tags)console.log(object);
    for (const tag of bonus.tags) if (!object.tags[tag]) return;
    object.allBonuses.push(bonus);
    // Useful log for tracking occurences of particular bonuses.
    // console.log(new Error('Adding ' + bonus.shortHand + ' ' + countInstancesOfElementInArray(object.allBonuses, bonus)));
    const value = evaluateValue(object.core, bonus.value, object);
    for (const statKey of bonus.stats) {
        object.operations[statKey] = object.operations[statKey] || {'stat': statKey};
        const statOps = object.operations[statKey];
        //console.log([bonus.operator, bonus.tags.join(':'), statKey, JSON.stringify(bonus.value), value]);
        switch (bonus.operator) {
            case '+':
                statOps['+'] = (statOps['+'] || 0) + value;
                //statOps['+'] = ifdefor(statOps['+'], []);
                //statOps['+'].push(value);
                break;
            case '-':
                statOps['+'] = (statOps['+'] || 0) - value;
                //statOps['+'] = ifdefor(statOps['+'], []);
                //statOps['+'].push(-value);
                break;
            case '&':
                statOps['&'] = (statOps['&'] || 0) + value;
                break;
            case '%':
                statOps['%'] = (statOps['%'] || 1) + value;
                break;
            case '*':
                statOps['*'] = statOps['*'] || [];
                statOps['*'].push(value);
                break;
            case '$':
                statOps['$'] = statOps['$'] || [];
                statOps['$'].push(value);
                break;
        }
        object.dirtyStats[statKey] = true;
    }
}

function removeBonusFromObject(object: VariableObject, bonus: Bonus) {
    // Ignore this bonus for this object if the stat doesn't apply to it.
    if (!doesStatApplyToObject(bonus.stats[0], object)) return;
    // Do nothing if bonus tags are not all present on the object.
    for (const tag of bonus.tags) if (!object.tags[tag]) return;
    // Passing true here will throw an error if a bonus is removed that wasn't present.
    // This is good to do as this may cause bonuses to double up if it happens.
    removeElementFromArray(object.allBonuses, bonus, true);
    // Useful log for tracking occurences of particular bonuses.
    // console.log(new Error('Removing ' + bonus.shortHand + ' ' + countInstancesOfElementInArray(object.allBonuses, bonus)));
    const value = evaluateValue(object.core, bonus.value, object);
    for (const statKey of bonus.stats) {
        object.operations[statKey] = object.operations[statKey] || {'stat': statKey};
        const statOps = object.operations[statKey];
        //console.log([operator, tags.join(':'), statKey, bonus.value, value]);
        switch (bonus.operator) {
            case '+':
                statOps['+'] = (statOps['+'] || 0) - value;
                //var index = statOps['+'].indexOf(value);
                //statOps['+'].splice(index, 1);
                break;
            case '-':
                statOps['+'] = (statOps['+'] || 0) + value;
                //var index = statOps['+'].indexOf(-value);
                //statOps['+'].splice(index, 1);
                break;
            case '&':
                statOps['&'] = (statOps['&'] || 0) - value;
                break;
            case '%':
                statOps['%'] = (statOps['%'] || 1) - value;
                break;
            case '*':
                statOps['*'].splice(statOps['*'].indexOf(value), 1);
                break;
            case '$':
                statOps['$'].splice(statOps['$'].indexOf(value), 1);
                break;
        }
        object.dirtyStats[statKey] = true;
    }
}

function doesStatApplyToObject(stat: string, object: VariableObject) {
    switch (object.base.variableObjectType) {
        case 'actor':
            return allActorVariables[stat];
        case 'action':
            return ![undefined, null].includes(object.stats[stat]) || commonActionVariables[stat];
        case 'effect':
            return stat === 'duration' || stat === 'area' || stat === 'maxStacks' || operations[stat.charAt(0)];
        case 'guild':
            return allGuildVariables[stat];
        case 'trigger':
            return false;
        default:
            throw new Error('Unexpected object base variableObjectType: ' + object.base.variableObjectType);
    }
}

export function recomputeDirtyStats(object: VariableObject) {
    for (const statKey of Object.keys(object.dirtyStats)) {
        recomputeStat(object, statKey);
    }
    for (const variableChild of object.variableChildren) {
        recomputeDirtyStats(variableChild);
    }
}

export function recomputeStat(object: VariableObject, statKey: string) {
    //console.log('recomputing ', statKey, object);
    const statOps = object.operations[statKey] || {'stat': statKey};
    let newValue: any = 0;
    // Special values override all of the normal arithmetic for stats.
    if ((statOps['$'] || []).length) {
        newValue = statOps['$'][statOps['$'].length - 1];
        // If this value is a baseObject for a variable object, set it as a new
        // variable obejct with the value as its base instead.
        if (newValue.variableObjectType) {
            if (object.bonusSources.length > 100) {
                throw new Error('too many bonus sources on object');
            }
            newValue = createVariableObject(newValue, object.core);
        }
    } else {
        //console.log(statOps);
        newValue = newValue + (statOps['+'] || 0);
        //for (var sum of ifdefor(statOps['+'], [])) {
        //    newValue += sum;
        //}
        newValue *= (statOps['%'] || 1);
        for (const factor of (statOps['*'] || [])) {
            newValue *= factor;
        }
        newValue += (statOps['&'] || 0);
        if (allRoundedVariables[statKey]) {
            newValue = Math.round(newValue);
        }
    }
    setStat(object, statKey, newValue);
    //console.log(object.stats[statKey]);
}
export function setStat(object: VariableObject, statKey: string, newValue: any) {
    //console.log('setting stat', statKey, newValue);
    object.dirtyStats[statKey] = null;
    // Set a hard cap of 1e12 for all computed values.
    if (typeof newValue === 'number' && newValue > 1e12) {
        newValue = 1e12;
    }
    const oldValue = object.stats[statKey];
    if (oldValue === newValue) return;
    // If the old value was a variable child, remove it since it is either gone or
    // going to be replaced by a new version of the variable child.
    try {
        // This will throw an exception if object.stats[statKey] is null because
        // typeof null is 'object'. I'm not fixing this though because this
        // should never be null, so it is informative to have this exception
        // when that happens.
        if (typeof oldValue === 'object' && oldValue.base) {
            const index = object.variableChildren.indexOf(oldValue);
            if (index < 0) {
                console.log(oldValue);
                console.log(object.variableChildren);
                throw Error("Variable child was not found on parent object.");
            }
            object.variableChildren.splice(index, 1);
        }
    } catch (e) {
        debugger;
    }
    // Remove all bonuses depending on the old value of this stat, if any.
    for (const dependency of (object.bonusesDependingOn[statKey] || [])) {
        removeBonusFromObject(dependency.object, dependency.bonus);
    }
    object.stats[statKey] = newValue;
    if (object.type === 'effect' && operations[statKey[0]]) {
        object.bonuses[statKey] = newValue;
    }
    // If the new value is a variable object, add it to variable children.
    if (typeof newValue === 'object' && newValue.base) {
        addVariableChildToObject(object, newValue, true);
    }
    // Now that the stat is updated, add all bonuses back that depend on this stat.
    for (const dependency of (object.bonusesDependingOn[statKey] || [])) {
        addBonusToObject(dependency.object, dependency.bonus);
    }
    // Changing the value of setRange changes the tags for the actor, so we need to trigger
    // and update here.
    if (statKey === 'setRange' && (oldValue || newValue)) {
        if (object.base.variableObjectType !== 'actor') {
            throw Error('Cannot apply "setRange" stat to type ' + object.base.variableObjectType);
        }
        updateTags(object, recomputeActorTags(object.base.actor), true);
    }
    // Recompute stat dependencies only after we've finished actually updating
    // applicable bonuses. Otherwise we might make too many updates or apply
    // updates in an incorrect order, such as attempting to remove the same bonus
    // again before it has been added back yet.
    for (const dependency of (object.bonusesDependingOn[statKey] || [])) {
        for (const dependentStat of dependency.bonus.stats) {
            recomputeStat(dependency.object, dependentStat);
        }
    }
}

export function addVariableChildToObject(parentObject: VariableObject, child: VariableObject, triggerComputation = false) {
    parentObject.variableChildren.push(child);
    child.tags = recomputeChildTags(parentObject, child);
    for (const bonusSource of parentObject.bonusSources) {
        addBonusSourceToObject(child, bonusSource);
    }
    if (triggerComputation) {
        recomputeDirtyStats(child);
    }
}
export function applyParentToVariableChild(parentObject: VariableObject, child: VariableObject) {
    child.tags = recomputeChildTags(parentObject, child);
    for (const bonusSource of parentObject.bonusSources) {
        addBonusSourceToObject(child, bonusSource);
    }
    recomputeDirtyStats(child);
}

// Adding and removing tags from an object is not a reversible procedure since
// the previous state is not tracked. Therefore when something changes to update
// a tag (typically equiping an item on a character), we have to recompute the new
// set of tags for the actor from scratch and similarly for each action/buff/etc.
// Once the new set is determined, this method can be called to adjust all bonuses
// appropriately.
export function updateTags(object: VariableObject, newTags: Tags, triggerComputation = false) {
    const lostTags = [];
    for (const oldTag of Object.keys(object.tags)) {
        if (!newTags[oldTag]) lostTags.push(oldTag);
    }
    for (const lostTag of lostTags) {
        for (const lostBonus of (object.bonusesByTag[lostTag] || [])) {
            // console.log("losing bonus from " + lostTag + " " + lostBonus.shortHand);
            removeBonusFromObject(object, lostBonus);
        }
    }
    const addedTags = [];
    for (const newTag of Object.keys(newTags)) {
        if (!object.tags[newTag]) addedTags.push(newTag);
    }
    // The new tags must be set after removing old bonuses, but before adding new bonuses,
    // since those methods will expect the tags to match in order to apply.
    object.tags = newTags;
    for (const addedTag of addedTags) {
        for (const addedBonus of (object.bonusesByTag[addedTag] || [])) {
            // console.log("gaining bonus from " + addedTag + " " + addedBonus.shortHand);
            addBonusToObject(object, addedBonus);
        }
    }
    for (const variableChild of object.variableChildren) {
        updateTags(variableChild, recomputeChildTags(object, variableChild), false);
    }
    if (triggerComputation) {
        recomputeDirtyStats(object);
    }
}

function recomputeChildTags(parentObject: VariableObject, child: VariableObject) {
    const tags = {};
    for (const tag of (child.base.tags || [])) {
        tags[tag] = true;
    }
    // Child objects inherit tags from parent objects.
    for (let parentTag in parentObject.tags) {
        // melee and ranged tags are exclusive. If a child has one set, it should
        // not inherit the opposite one from the parent.
        if (parentTag === 'melee' && tags['ranged']) continue;
        if (parentTag === 'ranged' && tags['melee']) continue;
        // If we want to prevent a child from inheriting other tags, we could
        // check if it is explicitly set to false.
        tags[parentTag] = true;
    }
    // Each object exclusively uses its variableObjectType as a tag. Unset all other possible values and then set its tag.
    tags['actor'] = null;
    tags['action'] = null;
    tags['effect'] = null;
    tags['guild'] = null;
    tags['trigger'] = null;
    tags[child.base.variableObjectType] = true;
    return tags;
}
