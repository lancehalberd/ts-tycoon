import { recomputeActorTags } from 'app/character';
import { Effect } from 'app/content/skills';
import { evaluateValue } from 'app/evaluate';
import { getState } from 'app/state';
import { removeElementFromArray } from 'app/utils/index';
import { allActorVariables, allGuildVariables, allRoundedVariables, commonActionVariables } from 'app/variables';

type BonusOperator = '+' | '-' | '%' | '*' | '/' | '&' | '$';
type BonusTag = string;
type StatVariable = string;
type BonusValue = true | number | string |
    Effect |
    [BonusValue] | [BonusOperator, BonusValue] | [BonusValue, BonusOperator, BonusValue];
type BonusDependencies = {[key in string]: true};

export interface Bonuses {
    [key: string]: BonusValue,
}

export interface BonusSource {
    bonuses: Bonuses,
}

interface Bonus {
    operator: BonusOperator,
    shortHand: string,
    statDependencies: BonusDependencies,
    stats: StatVariable,
    tags: BonusTag[],
    value: BonusValue,
}

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
    let stats;
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
function getStatDependencies(bonusValue, dependencies) {
    if (typeof bonusValue === 'number') return dependencies;
    if (typeof bonusValue === 'string') {
        if (bonusValue[0] !== '{') return dependencies; // this is just a string.
        dependencies[bonusValue.substring(1, bonusValue.length - 1)] = true;
        return dependencies
    }
    if (!bonusValue) throw Error('bonusValue was null or undefined');
    if (bonusValue.constructor !== Array) return dependencies;
    switch (bonusValue.length) {
        case 1:
            return getStatDependencies(bonusValue[0], dependencies);
            break;
        case 2: // Unary operators like ['-', '{intelligence}']
            return getStatDependencies(bonusValue[1], dependencies);
            break;
        case 3: // Binary operators like [20, '+', '{strength}']
            dependencies = getStatDependencies(bonusValue[0], dependencies);
            return getStatDependencies(bonusValue[2], dependencies);
        default:
            console.log(bonusValue);
            throw new Error('bonusValue formula must have exactly 2 or 3 entries, found ' + bonusValue.length);
    }
    return dependencies;
}
function parseBonuses(bonusSource) {
    if (bonusSource.parsedBonuses) return bonusSource.parsedBonuses; // Use memoized value if available. Otherwise, populate memoized value below.
    bonusSource.parsedBonuses = [];
    for (var bonusKeyString of Object.keys(bonusSource.bonuses)) {
        var bonus = parseBonus(bonusKeyString, bonusSource.bonuses[bonusKeyString]);
        bonusSource.parsedBonuses.push(bonus);
    }
    return bonusSource.parsedBonuses;
}
export function initializeVariableObject(object, baseObject, actor) {
    if (!baseObject) throw new Error('No base object provided for new variable object');
    if (!baseObject.variableObjectType) throw new Error('variableObjectType was not set on a variable object base object');
    // this doesn't really make sense for the guild stats object, but I don't think this is causing any issues at the moment.
    if (!actor) throw new Error('No actor was provided for a new variable object. This must be provided for some implicit bonuses to work correctly, like range: {weaponRange} on attacks.');
    object.actor = actor;
    object.base = baseObject;
    object.tags = {};
    for (const tag of (object.base.tags || [])) {
        object.tags[tag] = true;
    }
    object.bonusSources = [];
    object.bonusesByTag = {};
    object.bonusesDependingOn = {};
    object.allBonuses = [];
    object.dirtyStats = {};
    switch (baseObject.variableObjectType){
        case 'actor':
            for (var actorStat of Object.keys(allActorVariables)) {
                object.dirtyStats[actorStat] = true;
            }
            break;
        case 'action':
            for (var actionStat of Object.keys(commonActionVariables)) {
                object.dirtyStats[actionStat] = true;
            }
            break;
        case 'effect':
            object.bonuses = {};
            for (var effectStat of ['duration', 'area', 'maxStacks']) {
                object.dirtyStats[effectStat] = true;
            }
            break;
        case 'guild':
            for (var guildStat of Object.keys(allGuildVariables)) {
                object.dirtyStats[guildStat] = true;
            }
            break;
    }
    object.variableChildren = [];
    if (object.base.bonuses) {

        addBonusSourceToObject(object, object.base,
            // Trigger computation so that implicit bonus will set stats it defines as targetable.
            // Otherwise bonuses that target stats on the implicitBonuses but are not otherwise
            // commonly defined stats won't apply since they check if that stat is null on the object.
            true,
            // Setting isImplicit to true will apply all bonuses, without checking if they are valid
            // for the object. Implicit bonuses are only defined if they are intended to be used on
            // the object. They also indicate that the stat should be targetable on this object in general.
            // Finally, isImplicit prevents these bonuses from being applied to children. Implicit bonuses
            // are intended only to be used as the basic stats for the object.
            true);
    }
    return object;
}
export function addBonusSourceToObject(object, bonusSource, triggerComputation = false, isImplicit = false) {
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
        for (var dependencyString of Object.keys(bonus.statDependencies)) {
            if (dependencyString.indexOf('this.') === 0) {
                const stat = dependencyString.substring(5);
                object.bonusesDependingOn[stat] = object.bonusesDependingOn[stat] || [];
                object.bonusesDependingOn[stat].push({object, bonus});
            } else {
                const stat = dependencyString;
                const dependencySource = object.actor || object;
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
export function removeBonusSourceFromObject(object, bonusSource, triggerComputation = false) {
    if (!bonusSource.bonuses) return;
    // Bonuses apply recursively to all the children of this object (actions of actors, buffs on actions, bonuses on buffs, etc).
    for (var variableChild of object.variableChildren) {
        removeBonusSourceFromObject(variableChild, bonusSource, triggerComputation);
    }
    const sourceIndex = object.bonusSources.indexOf(bonusSource);
    if (index < 0) {
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
            var index = object.bonusesByTag[tag].indexOf(bonus);
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
                const dependencySource = object.actor || object;
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
function addBonusToObject(object, bonus, isImplicit = false) {
    // Ignore this bonus for this object if the stat doesn't apply to it.
    if (!isImplicit && !doesStatApplyToObject(bonus.stats[0], object)) return;
    // Do nothing if bonus tags are not all present on the object.
    if (!object.tags)console.log(object);
    for (var tag of bonus.tags) if (!object.tags[tag]) return;
    object.allBonuses.push(bonus);
    // Useful log for tracking occurences of particular bonuses.
    // console.log(new Error('Adding ' + bonus.shortHand + ' ' + countInstancesOfElementInArray(object.allBonuses, bonus)));
    var value = evaluateValue(object.actor || object, bonus.value, object);
    for (var statKey of bonus.stats) {
        var statOps = object[statKey + 'Ops'] = object[statKey + 'Ops'] || {'stat': statKey};
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
function removeBonusFromObject(object, bonus) {
    // Ignore this bonus for this object if the stat doesn't apply to it.
    if (!doesStatApplyToObject(bonus.stats[0], object)) return;
    // Do nothing if bonus tags are not all present on the object.
    for (var tag of bonus.tags) if (!object.tags[tag]) return;
    // Passing true here will throw an error if a bonus is removed that wasn't present.
    // This is good to do as this may cause bonuses to double up if it happens.
    removeElementFromArray(object.allBonuses, bonus, true);
    // Useful log for tracking occurences of particular bonuses.
    // console.log(new Error('Removing ' + bonus.shortHand + ' ' + countInstancesOfElementInArray(object.allBonuses, bonus)));
    var value = evaluateValue(object.actor || object, bonus.value, object);
    for (var statKey of bonus.stats) {
        var statOps = object[statKey + 'Ops'] = object[statKey + 'Ops'] || {'stat': statKey};
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
                var index = statOps['*'].indexOf(value);
                statOps['*'].splice(index, 1);
                break;
            case '$':
                var index = statOps['$'].indexOf(value);
                statOps['$'].splice(index, 1);
                break;
        }
        object.dirtyStats[statKey] = true;
    }
}
var operations = {'*': true, '+': true, '-': true, '%': true, '$': true, '&': true};
function doesStatApplyToObject(stat, object) {
    switch (object.base.variableObjectType) {
        case 'actor':
            return allActorVariables[stat];
        case 'action':
            return ![undefined, null].includes(object[stat]) || commonActionVariables[stat];
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
export function recomputeDirtyStats(object) {
    for (var statKey of Object.keys(object.dirtyStats)) {
        recomputeStat(object, statKey);
    }
    for (var variableChild of object.variableChildren) {
        recomputeDirtyStats(variableChild);
    }
}
function recomputeStat(object, statKey) {
    const statOps = object[statKey + 'Ops'] || {'stat': statKey};
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
            newValue = initializeVariableObject({}, newValue, object.actor);
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
    //console.log(object[statKey]);
}
function setStat(object, statKey, newValue) {
    delete object.dirtyStats[statKey];
    // Set a hard cap of 1e12 for all computed values.
    if (typeof newValue === 'number' && newValue > 1e12) {
        newValue = 1e12;
    }
    const oldValue = object[statKey];
    if (oldValue === newValue) return;
    // If the old value was a variable child, remove it since it is either gone or
    // going to be replaced by a new version of the variable child.
    try {
        // This will throw an exception if object[statKey] is null because
        // typeof null is 'object'. I'm not fixing this though because this
        // should never be null, so it is informative to have this exception
        // when that happens.
        if (typeof object[statKey] === 'object' && object[statKey].base) {
            const index = object.variableChildren.indexOf(object[statKey]);
            if (index < 0) {
                console.log(object[statKey]);
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
    object[statKey] = newValue;
    if (object.base.variableObjectType === 'effect' && operations[statKey[0]]) {
        object.bonuses[statKey] = newValue;
    }
    // If the new value is a variable object, add it to variable children.
    if (typeof object[statKey] === 'object' && object[statKey].base) {
        addVariableChildToObject(object, object[statKey], true);
    }
    // Now that the stat is updated, add all bonuses back that depend on this stat.
    for (const dependency of (object.bonusesDependingOn[statKey] || [])) {
        addBonusToObject(dependency.object, dependency.bonus);
    }
    // Changing the value of setRange changes the tags for the actor, so we need to trigger
    // and update here.
    if (statKey === 'setRange' && (oldValue || newValue)) {
        if (object.actor !== object) {
            console.log(object);
            throw new Error('setRange was set on a non-actor');
        }
        updateTags(object, recomputeActorTags(object), true);
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

function findVariableChildForBaseObject(parentObject, baseObject) {
    for (const variableChild of parentObject.variableChildren) {
        if (variableChild.base === baseObject) return variableChild;
    }
    throw Error("Variable child was not found for given base object");
}

function addVariableChildToObject(parentObject, child, triggerComputation = false) {
    parentObject.variableChildren.push(child);
    child.tags = recomputeChildTags(parentObject, child);
    for (const bonusSource of parentObject.bonusSources) {
        addBonusSourceToObject(child, bonusSource);
    }
    if (triggerComputation) {
        recomputeDirtyStats(child);
    }
}
export function applyParentToVariableChild(parentObject, child) {
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
function updateTags(object, newTags, triggerComputation = false) {
    var lostTags = [];
    for (const oldTag of Object.keys(object.tags)) {
        if (!newTags[oldTag]) lostTags.push(oldTag);
    }
    for (const lostTag of lostTags) {
        for (const lostBonus of (object.bonusesByTag[lostTag] || [])) {
            // console.log("losing bonus from " + lostTag + " " + lostBonus.shortHand);
            removeBonusFromObject(object, lostBonus);
        }
    }
    var addedTags = [];
    for (const newTag of Object.keys(newTags)) {
        if (!object.tags[newTag]) addedTags.push(newTag);
    }
    // The new tags must be set after removing old bonuses, but before adding new bonuses,
    // since those methods will expect the tags to match in order to apply.
    object.tags = newTags;
    for (var addedTag of addedTags) {
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

function recomputeChildTags(parentObject, child) {
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
    delete tags['actor'];
    delete tags['action'];
    delete tags['effect'];
    delete tags['guild'];
    delete tags['trigger'];
    tags[child.base.variableObjectType] = true;
    return tags;
}

/*
These methods were designed with an old version of updateTags and don't work with
the new version. Probably we don't need them, but I'm keeping them around for a bit
just in case I want to ressurect them.
function addTagToObject(object, tag, triggerComputation) {
    if (object.tags[tag]) return;
    var newTags = copy(object.tags);
    newTags[tag] = true;
    if (tag === 'melee') delete newTags['ranged'];
    if (tag === 'ranged') delete newTags['melee'];
    updateTags(object, newTags, false);
    for (var variableChild of object.variableChildren) {
        addTagToObject(variableChild, tag, false);
    }
    if (triggerComputation) {
        recomputeDirtyStats(object);
    }
}

function removeTagFromObject(object, tag, triggerComputation) {
    if (!object.tags[tag]) return;
    var newTags = copy(object.tags);
    delete newTags[tag];
    // Everything is either melee or ranged. If neither is set, default to melee.
    if (!newTags.melee && !newTags.ranged) newTags.melee = true;
    updateTags(object, newTags, false);
    for (var variableChild of object.variableChildren) {
        removeTagFromObject(variableChild, tag, false);
    }
    if (triggerComputation) {
        recomputeDirtyStats(object);
    }
}*/