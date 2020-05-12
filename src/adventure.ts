import { pause, updateAdventureButtons } from 'app/adventureButtons';
import { getEndlessLevel, showAreaMenu } from 'app/areaMenu';
import {
    addVariableChildToObject,
    recomputeDirtyStats, removeBonusSourceFromObject, setStat,
} from 'app/bonuses';
import {
    baseDivinity, damageActor, healActor,
    initializeActorForAdventure, refreshStatsPanel
} from 'app/character';
import { createAreaFromDefinition, getPositionFromLocationDefinition } from 'app/content/areas';
import { addAreaFurnitureBonuses } from 'app/content/furniture';
import { instantiateLevel } from 'app/content/levels';
import { map } from 'app/content/mapData';
import { getMonsterDefinitionAreaEntity, makeMonster } from 'app/content/monsters';
import { zones } from 'app/content/zones';
import { setContext, showContext } from 'app/context';
import { editingMapState, stopTestingLevel } from 'app/development/editLevel';
import { editingAreaState } from 'app/development/editArea';
import { query } from 'app/dom';
import { drawBoardBackground } from 'app/drawBoard';
import { expireTimedEffects } from 'app/effects';
import { unlockItemLevel } from 'app/equipmentCrafting';
import { ADVENTURE_WIDTH, FRAME_LENGTH, MIN_SLOW, MIN_Z, MAX_Z, RANGE_UNIT } from 'app/gameConstants';
import { increaseAgeOfApplications } from 'app/heroApplication';
import { animaLootDrop, coinsLootDrop } from 'app/loot';
import { setActorInteractionTarget } from 'app/main';
import { unlockMapLevel } from 'app/map';
import { moveActor } from 'app/moveActor';
import { updateActorAnimationFrame } from 'app/render/drawActor';
import { appendTextPopup, applyAttackToTarget, findActionByTag, getBasicAttack, performAttackProper } from 'app/performAttack';
import { gain } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState, guildYardEntrance } from 'app/state';
import {
    canUseReaction, canUseSkillOnTarget, gainReflectionBarrier,
    isTargetInRangeOfSkill,
    prepareToUseSkillOnTarget, shouldUseSkillOnTarget, useReaction, useSkill
} from 'app/useSkill';
import { abbreviate } from 'app/utils/formatters';
import { ifdefor } from 'app/utils/index';
import { isMouseDown } from 'app/utils/mouse';
import { playSound } from 'app/utils/sounds';

import {
    Actor, Area, AreaDefinition, AreaEntity, AreaTarget, BonusSource, Character, Exit, Frame,
    Hero, Level, LevelData, LevelDifficulty, MonsterData, MonsterSpawn, Target,
    ZoneType,
} from 'app/types';


export function limitZ(zValue: number, radius: number = 0): number {
    return Math.max(MIN_Z + radius, Math.min(MAX_Z - radius, zValue));
}
export function startLevel(character: Character, index: string) {
    if (!map[index]) {
        throw new Error('No level found for ' + index);
    }

    if (character.currentLevelKey !== index) {
        character.board.boardPreview = null;
        drawBoardBackground(character.boardContext, character.board);
    }
    const hero = character.hero;
    hero.heading = [1, 0, 0];
    character.currentLevelKey = index;
    const levelCompleted = !!character.divinityScores[index];
    const difficultyCompleted = !!(character.levelTimes[index] || {})[character.levelDifficulty];
    leaveCurrentArea(hero, true);
    // Can't bring minions with you into new areas.
    (hero.minions || []).forEach(removeActor);
    hero.boundEffects = [];
    // Effects don't persist accross areas.
    removeAdventureEffects(hero);
    if (character.levelDifficulty === 'endless') {
        hero.levelInstance = instantiateLevel(map[index], character.levelDifficulty, difficultyCompleted, getEndlessLevel(character, map[index]));
    } else {
        hero.levelInstance = instantiateLevel(map[index], character.levelDifficulty, difficultyCompleted);
    }
    for (const action of hero.actions.concat(hero.reactions)) action.readyAt = 0;
    enterArea(hero, hero.levelInstance.entrance);
    if (getState().selectedCharacter === character) {
        updateAdventureButtons();
    }
    saveGame();
}

const activeAreas: {[key: string]: Area} = {};
export function getArea(zoneKey: ZoneType, areaKey: string): Area {
    const fullKey = `${zoneKey}:${areaKey}`;
    if (activeAreas[fullKey]) {
        return activeAreas[fullKey];
    }
    if (!zones[zoneKey]) {
        console.log('Missing zone', zoneKey);
        debugger;
        return;
    }
    if (!zones[zoneKey][areaKey]) {
        console.log('Missing area', areaKey, zones[zoneKey]);
        // debugger;
        return;
    }
    const area: Area = activeAreas[fullKey] = createAreaFromDefinition(areaKey, zones[zoneKey][areaKey]);
    addMonstersFromAreaDefinition(area);
    return area;
}

export function addMonstersFromAreaDefinition(area: Area) {
    const areaDefinition: AreaDefinition = zones[area.zoneKey][area.key];
    const monsters: MonsterSpawn[] =(areaDefinition.monsters || []).map(monster => {
        return {
            ...monster,
            location: getPositionFromLocationDefinition(area, getMonsterDefinitionAreaEntity(area, monster), monster.location),
            // By default monsters face left, but they can be flipped to face right.
            heading: [monster.location.flipped ? 1 : -1, 0, 0],
        };
    });
    addMonstersToArea(area, monsters);
}

export function enterArea(actor: Actor, {x, z, areaKey, objectKey, zoneKey}: Exit) {
    if (areaKey === 'worldMap' && actor.type === 'hero') {
        returnToMap(actor.character);
        return;
    }
    zoneKey = zoneKey || ((actor.owner || actor).area ? (actor.owner || actor).area.zoneKey : null);
    let area: Area;
    if (!zoneKey) {
        const levelInstance: Level = (actor.owner || actor).levelInstance;
        if (!levelInstance) {
            console.log('Warning, could not determine what zone to enter.');
            debugger;
            return;
        }
        area = levelInstance.areas.get(areaKey);
    } else {
        area = getArea(zoneKey, areaKey);
    }
    leaveCurrentArea(actor);
    const state = getState();

    if (area.zoneKey === 'guild') {
        // Heal+restore cooldowns on switching guild areas.
        initializeActorForAdventure(actor);
        actor.actions.concat(actor.reactions).forEach(function (action) {
            action.readyAt = 0;
        });
        if (actor.type === 'hero') {
            const character = actor.character;
            character.context = 'guild'
            character.currentLevelKey = 'guild';
            if (character === state.selectedCharacter) {
                updateAdventureButtons();
                showContext('guild');
            }
        }
        if (!state.savedState.unlockedGuildAreas[area.key]) {
            // If no allies are in a locked guild area, refresh the monsters.
            if (!area.allies.length) {
                addMonstersFromAreaDefinition(area);
            }
        } else {
            // If the area is unlocked, make sure we don't include any enemies.
            area.enemies = [];
        }
    }
    // This can be uncommented to allow minions to follow you through areas.
    (actor.minions || []).forEach(minion => enterArea(minion, {x:x + actor.heading[0] * 10, z: z - 90, areaKey}));
    // Any effects bound to the hero should be added to the area they have entered.
    (actor.boundEffects || []).forEach(effect => {
        area.effects.push(effect);
    });
    actor.area = area;
    if (objectKey) {
        const object = area.objectsByKey[objectKey];
        if (!object) {
            console.log('missing object', objectKey);
        } else {
            const target = object.getAreaTarget();
            z = target.z;
            if (target.x < 100) {
                x = target.x + 32;
            } else if (target.x > area.width - 100) {
                x = target.x - 32;
            } else {
                x = target.x;
                z = target.z - 32;
            }
        }
    }
    actor.x = x;
    actor.y = 0;
    actor.z = z;
    if (state.selectedCharacter && actor === state.selectedCharacter.hero) {
        area.cameraX = Math.round(Math.max(0, Math.min(area.width - ADVENTURE_WIDTH, actor.x - ADVENTURE_WIDTH / 2)));
    }
    editingAreaState.cameraX = area.cameraX;
    editingAreaState.selectedObject = null;
    editingAreaState.selectedMonsterIndex = null;
    if (isNaN(actor.x) || isNaN(actor.z)) {
        debugger;
    }
    area.allies.push(actor);
    actor.allies = area.allies;
    actor.enemies = area.enemies;
    if (actor.type === 'hero') {
        actor.activity = {type: 'none'};
    }
}
export function addMonstersToArea(
    area: Area,
    monsters: MonsterSpawn[],
    extraBonuses: BonusSource[] = [],
    specifiedRarity = 0
) {
    area.enemies = [];
    for (const monsterData of (monsters || [])) {
        const bonusSources = [...(monsterData.bonusSources || []), ...extraBonuses];
        const rarity = monsterData.rarity || specifiedRarity;
        const newMonster = makeMonster(area, monsterData.key, monsterData.level, bonusSources, rarity);
        newMonster.heading = monsterData.heading;
        newMonster.x = monsterData.location.x;
        newMonster.y = monsterData.location.y;
        newMonster.z = monsterData.location.z;
        newMonster.area = area;
        initializeActorForAdventure(newMonster);
        newMonster.time = 0;
        newMonster.allies = newMonster.area.enemies;
        newMonster.enemies = newMonster.area.allies;
        newMonster.allies.push(newMonster);
    }
}
function checkIfActorDied(actor: Actor) {
    const area = actor.area;
    // The actor who has stopped time cannot die while the effect is in place.
    if (area.timeStopEffect && area.timeStopEffect.actor === actor) return;
    // Actor has not died if they are already dead, have postiive health, cannot die or are currently being pulled.
    if (actor.isDead || actor.health > 0 || actor.pull) return;
    // If the actor is about to die, check to activate their temporal shield if they have one.
    const stopTimeAction = findActionByTag(actor.reactions, 'stopTime');
    if (stopTimeAction && canUseReaction(actor, stopTimeAction, null)) {
        useReaction(actor, stopTimeAction, null);
        return;
    }
    // The actor has actually died, mark them as such and begin their death FrameAnimation and drop spoils.
    actor.isDead = true;
    actor.timeOfDeath = actor.time;
    // Call on death effects for monsters that have them.
    if (actor.type === 'monster' && actor.base.onDeath) {
        actor.base.onDeath(actor);
    }
    // Each enemy that is a main character should gain experience when this actor dies.
    actor.enemies.forEach(enemy => enemy.type === 'hero' && defeatedEnemy(enemy, actor));
}

function timeStopLoop(area: Area) {
    if (!area.timeStopEffect) return false;
    var actor = area.timeStopEffect.actor;
    var delta = FRAME_LENGTH / 1000;
    actor.time += delta;
    actor.temporalShield -= delta;
    if (actor.temporalShield <= 0 || actor.health / actor.maxHealth > .5) {
        area.timeStopEffect = null;
        return false;
    }
    processStatusEffects(actor);
    // The enemies of the time stopper can still die. This wil stop their life
    // bars from going negative.
    for (var i = 0; i < actor.enemies.length; i++) {
        var enemy = actor.enemies[i];
        checkIfActorDied(enemy);
    }
    expireTimedEffects(actor);
    runActorLoop(actor);
    moveActor(actor);
    capHealth(actor);
    updateActorAnimationFrame(actor);
    return true;
}
export function actorCanOverHeal(actor: Actor) {
    return (actor.stats.overHeal > 0)
        || (actor.stats.overHealReflection > 0 && actor.reflectBarrier < actor.maxReflectBarrier);
}
function capHealth(actor: Actor) {
    if (actor.targetHealth < actor.health) {
        // Life is lost at a rate dictated by the actors tenacity.
        var healthLostPerFrame = actor.stats.maxHealth * FRAME_LENGTH / (actor.stats.tenacity * 1000);
        // Lost health each frame until actor.health === actor.targetHealth.
        actor.health = Math.max(actor.targetHealth, actor.health - healthLostPerFrame);
    } else actor.health = actor.targetHealth; //Life gained is immediately applied
    // Apply overhealing if the actor is over their health cap and possesses overhealing.
    var excessHealth = actor.health - actor.stats.maxHealth;
    if (actor.stats.overHeal && excessHealth > 0) {
        setStat(actor.variableObject, 'bonusMaxHealth', (actor.stats.bonusMaxHealth || 0) + actor.stats.overHeal * excessHealth);
    }
    if (actor.stats.overHealReflection && excessHealth > 0) {
        gainReflectionBarrier(actor, actor.stats.overHealReflection * excessHealth);
    }
    actor.health = Math.min(actor.stats.maxHealth, Math.max(0, actor.health));
    actor.percentHealth = actor.health / actor.stats.maxHealth;
    actor.targetHealth = Math.min(actor.stats.maxHealth, actor.targetHealth);
    if (!actor.enemies.length && actor.stats.bonusMaxHealth) {
        actor.stats.bonusMaxHealth *= .99;
    }
    actor.percentTargetHealth = actor.targetHealth / actor.stats.maxHealth;
}
// Remove bound effects from an area. Called when the actor dies or leaves the area.
export function removeBoundEffects(actor: Actor, area: Area, finishEffect = false) {
    (actor.boundEffects || []).forEach(effect => {
        const index = area.effects.indexOf(effect);
        if (index >= 0) area.effects.splice(index, 1);
        if (finishEffect && effect.finish) effect.finish();
    });
}
export function removeActor(actor: Actor) {
    if (actor.owner) {
        const minionIndex = actor.owner.minions.indexOf(actor);
        if (minionIndex >= 0) actor.owner.minions.splice(minionIndex, 1);
    }
    if (actor.area) removeBoundEffects(actor, actor.area, true);
    const index = actor.allies.indexOf(actor);
    // When a character with minions exits to the world map, this method is called on minions
    // after they are already removed from the area, so they won't be in the list of allies already.
    if (index < 0) return;
    actor.allies.splice(index, 1);
    if (actor.type === 'hero') {
        const character = actor.character;
        const area = actor.area;
        if (area.zoneKey) {
            removeAdventureEffects(actor);
            enterArea(actor, actor.escapeExit || guildYardEntrance);
            return;
        }
        const level = actor.levelInstance;
        if (level.levelDifficulty === 'endless') {
            const currentEndlessLevel = getEndlessLevel(character, map[character.currentLevelKey]);
            character.levelTimes[character.currentLevelKey][level.levelDifficulty] = currentEndlessLevel - 1;
        }
        returnToMap(actor.character);
        if (actor.character === getState().selectedCharacter &&
            !actor.character.replay && !editingMapState.testingLevel
        ) {
            showAreaMenu();
        }
    }
}

function unlockGuildArea(guildArea: Area) {
    getState().savedState.unlockedGuildAreas[guildArea.key] = true;
    // Now that the guild area is unlocked the furniture bonuses should apply.
    addAreaFurnitureBonuses(guildArea, true);
    saveGame();
}


export function updateArea(area: Area) {
    if (area.zoneKey === 'guild' && !getState().savedState.unlockedGuildAreas[area.key] && !area.enemies.length && area.allies.some(actor => !actor.isDead)) {
        unlockGuildArea(area);
    }
    if (timeStopLoop(area)) {
        return;
    }
    const delta = FRAME_LENGTH / 1000;
    let everybody = area.allies.concat(area.enemies);
    // Advance subjective time of area and each actor.
    area.time += delta;
    // Speed up time for actors when no enemies are around to heal+reduce cool downs
    // after each area is cleared of monsters. Could make this something that the
    // player can toggle on, but it will hurt dark knight when I reduce max health
    // bonus when no monsters are around.
    //var multiplier = area.enemies.length ? 1 : 10;
    for (const actor of everybody) actor.time += delta;// * multiplier;
    everybody.forEach(processStatusEffects);
    for (const enemy of area.enemies) {
        checkIfActorDied(enemy);
        expireTimedEffects(enemy);
    }
    for (const ally of area.allies) {
        checkIfActorDied(ally);
        expireTimedEffects(ally);
    }
    for (const object of area.objects) {
        if (object.update) {
            object.update();
        }
    }
    area.allies.forEach(runActorLoop);
    area.enemies.forEach(runActorLoop);
    // A skill may have removed an actor from one of the allies/enemies array, so remake everybody.
    everybody = area.allies.concat(area.enemies);
    everybody.forEach(moveActor);
    // This may have changed if actors left the area.
    everybody = area.allies.concat(area.enemies);
    for (let i = 0; i < area.projectiles.length; i++) {
        area.projectiles[i].update();
        if (area.projectiles[i].done) area.projectiles.splice(i--, 1);
    }
    for (let i = 0; i < area.effects.length; i++) {
        const effect = area.effects[i];
        effect.update();
        // If the effect was removed from the array already (when a song follows its owner between areas)
        // we need to decrement i to not skip the next effect.
        if (effect !== area.effects[i]) {
            i--;
        } else {
            if (area.effects[i].done) area.effects.splice(i--, 1);
        }
    }
    for (let i = 0; i < area.treasurePopups.length; i++) {
        area.treasurePopups[i].update(area.treasurePopups[i]);
        if (area.treasurePopups[i].done) area.treasurePopups.splice(i--, 1);
    }
    for (let i = 0; i < area.textPopups.length; i++) {
        const textPopup = area.textPopups[i];
        textPopup.y += ifdefor(textPopup.vy, -1);
        textPopup.x += (textPopup.vx || 0);
        textPopup.duration = ifdefor(textPopup.duration, 35);
        textPopup.vy += ifdefor(textPopup.gravity, -.5);
        if (textPopup.duration-- < 0) area.textPopups.splice(i--, 1);
    }
    everybody.forEach(function (actor) {
        if (actor.timeOfDeath < actor.time - 1) {
            removeActor(actor);
            return;
        }
        capHealth(actor);
    });
    everybody.forEach(updateActorAnimationFrame);
}
function processStatusEffects(target: Actor) {
    if (target.isDead ) return;
    const delta = FRAME_LENGTH / 1000;
    // Apply DOT, movement effects and other things that happen to targets here.
    // Target becomes 50% less slow over 1 second, or loses .1 slow over one second, whichever is faster.
    if (target.slow) {
        target.slow = Math.max(0, Math.min(target.slow - .5 * target.slow * delta, target.slow - .1 * delta));
    }
    healActor(target, (target.stats.healthRegen || 0) * delta);
    damageActor(target, (target.stats.damageOverTime || 0) * delta);
    if (target.pull && target.dominoAttackStats) {
        for (let i = 0; i < target.allies.length; i++) {
            const ally = target.allies[i];
            if (ally === target || ally.x < target.x || target.x + target.w < ally.x) continue;
            applyAttackToTarget(target.dominoAttackStats, ally);
            target.dominoAttackStats = null;
            target.pull = null;
            target.stunned = Math.max(target.time + .3, target.stunned);
            break;
        }
    }
    if (target.pull && (target.pull.delay || 0) < target.time) {
        if (!target.pull.duration) {
            target.pull.duration = target.pull.time - target.time;
        }
        if (target.pull.attackStats) {
            performAttackProper(target.pull.attackStats, target);
            target.pull.attackStats = null;
        }
        const timeLeft = (target.pull.time - target.time);
        const radius = target.pull.duration / 2
        const parabolaValue = (radius**2 - (timeLeft - radius)**2) / (radius ** 2);
        target.pull.z = limitZ(target.pull.z);
        if (timeLeft > 0) {
            const dx = (target.pull.x - target.x) * Math.min(1, delta / timeLeft);
            const dz = (target.pull.z - target.z) * Math.min(1, delta / timeLeft);
            const dr = (0 - target.rotation) * Math.min(1, delta / timeLeft);
            target.rotation += dr;
            const damage = target.pull.damage * Math.min(1, delta / timeLeft);
            target.pull.damage -= damage;
            target.x += dx;
            target.z += dz;
            const baseY = (target.type === 'monster') && target.baseY || 0;
            const dy = target.pull.y || 0 - baseY;
            target.y = baseY + dy * parabolaValue;
            damageActor(target, damage);
        } else {
            target.rotation = 0;
            target.x = target.pull.x;
            target.z = target.pull.z;
            target.y = (target.type === 'monster') && target.baseY || 0;
            damageActor(target, target.pull.damage);
            if (target.pull.action) {
                prepareToUseSkillOnTarget(target, target.pull.action, target.pull.target);
                target.pull.action.totalPreparationTime = 0;
            }
            target.pull = null;
        }
        // End the pull if the target hits something.
        for (const object of target.area.objects) {
            if (object.isSolid === false || !object.getAreaTarget) continue;
            const distance = getDistanceOverlap(target, object.getAreaTarget());
            if (distance <= -8) {
                target.pull = null;
                target.y = (target.type === 'monster') && target.baseY || 0;
                target.rotation = 0;
                break;
            }
        }
    }
    if (target.stunned && target.stunned <= target.time) {
        target.stunned = null;
    }
}
export function getAllInRange(x: number, range: number, targets: Actor[]) {
    const targetsInRange = [];
    for (let i = 0; i < targets.length; i++) {
        if (Math.abs(targets[i].x - x) <= range * RANGE_UNIT) {
            targetsInRange.push(targets[i]);
        }
    }
    return targetsInRange
}
function runActorLoop(actor: Actor) {
    const area = actor.area;
    if (actor.isDead || actor.stunned || actor.pull || actor.chargeEffect) {
        actor.skillInUse = null;
        return;
    }
    if (actor.skillInUse) {
        const actionDelta = FRAME_LENGTH / 1000 * Math.max(MIN_SLOW, 1 - actor.slow);
        if (actor.preparationTime <= actor.skillInUse.totalPreparationTime) {
            actor.preparationTime += actionDelta;
            if (actor.preparationTime >= actor.skillInUse.totalPreparationTime) {
                actor.preparationTime++; // make sure this is strictly greater than totalPreparation time.
                useSkill(actor);
            }
            return;
        } else if (actor.recoveryTime < actor.totalRecoveryTime) {
            actor.recoveryTime += actionDelta;
            return;
        } else {
            actor.skillInUse = null;
            if (actor.type === 'hero' && actor.character.paused && !isMouseDown()) {
                actor.activity = {type: 'none'};
            }
        }
    }
    if (actor.type === 'hero' && actor.activity.type !== 'none') {
        switch (actor.activity.type) {
            case 'attack':
                if (actor.activity.target.isDead) {
                    actor.activity = {type: 'none'};
                } else {
                    const target = actor.activity.target;
                    // If the actor is in manual mode, only do auto attacks.
                    if (actor.character && actor.character.paused) {
                        const basicAttack = getBasicAttack(actor);
                        if (!basicAttack) {
                            actor.activity = {type: 'none'};
                            break;
                        }
                        if (!canUseSkillOnTarget(actor, basicAttack, target)) break;
                        if (!isTargetInRangeOfSkill(actor, basicAttack, target)) break;
                        prepareToUseSkillOnTarget(actor, basicAttack, target);
                    } else {
                        checkToUseSkillOnTarget(actor, target);
                    }
                }
                break;
            case 'action':
                const action = actor.activity.action;
                const target = actor.activity.target;
                // console.log([actor, action, target]);
                // console.log('valid target? ' + canUseSkillOnTarget(actor, action, target));
                if (!canUseSkillOnTarget(actor, action, target)) {
                    actor.activity = {type: 'none'};
                    break;
                }
                // console.log('in range? ' + isTargetInRangeOfSkill(actor, action, target));
                if (!isTargetInRangeOfSkill(actor, action, target)) break;
                prepareToUseSkillOnTarget(actor, action, target);
                actor.activity = {type: 'none'};
                break;
        }
        return;
    } else if (actor.type === 'hero' && actorShouldAutoplay(actor) && !actor.enemies.filter(enemy => enemy.targetHealth >= 0).length) {
        const character = actor.character;
        // Code for intracting with chest/shrine at the end of level and leaving the area.
        // Might want to sort these by X coord at some point.
        /*const sortedObjects = [...area.objects, ...area.wallDecorations];
        sortedObjects.sort((A, B) => {
            return B.getAreaTarget().x - A.getAreaTarget().x;
        })*/
        for (const object of [...area.objects, ...area.wallDecorations]) {
            if (!object.getAreaTarget || !object.shouldInteract || !object.shouldInteract(actor)) {
                continue;
            }
            const objectTarget = object.getAreaTarget();
            if (objectTarget.x < actor.x + 100
                || actor.consideredObjects.has(object)
                || (object.isEnabled && !object.isEnabled())
            ) {
                continue;
            }
            // The AI only considers each object once.
            actor.consideredObjects.add(object);
            setActorInteractionTarget(actor, objectTarget);
            break;
        }
    }
    // Manual control doesn't use the auto targeting logic.
    if (actor.type === 'hero' && actor.character.paused) {
        return;
    }
    const targets: Actor[] = [];
    for (const ally of actor.allies) {
        ally.priority = getDistance(actor, ally) - 1000;
        targets.push(ally);
    }
    for (const enemy of actor.enemies) {
        enemy.priority = getDistance(actor, enemy);
        // actor.skillTarget will hold the last target the actor tried to use a skill on.
        // This lines causes the actor to prefer to continue attacking the same enemy continuously
        // even if they aren't the closest target any longer.
        if (enemy === actor.skillTarget) enemy.priority -= 100;
        targets.push(enemy);
    }
    // The main purpose of this is to prevent pulled actors from passing through their enemies.
    // Character is assumed to not be blocked each frame
    // Target the enemy closest to you, not necessarily the one previously targeted.
    targets.sort(function (A, B) {
        return A.priority - B.priority;
    });
    for (const target of targets) {
        if (checkToUseSkillOnTarget(actor, target)) {
            break;
        }
    }
    actor.cloaked = (actor.stats.cloaking && !actor.skillInUse);
}
function checkToUseSkillOnTarget(actor: Actor, target: Actor) {
    const autoplay = actorShouldAutoplay(actor);
    for(const action of ifdefor(actor.actions, [])) {
        // Only basic attacks will be used by your hero when you manually control them.
        if (!autoplay && !action.variableObject.tags['basic'] && actor.type === 'hero' &&
            // If the player has set this skill to auto, then it will be used automatically during manual control.
            !actor.character.autoActions[action.base.key]
        ) {
            continue;
        }
        // If the skill has been set to manual, it won't be used during autoplay.
        if (autoplay && actor.type === 'hero' && actor.character.manualActions[action.base.key]) {
            continue;
        }
        if (!canUseSkillOnTarget(actor, action, target)) {
            // console.log("cannot use skill");
            continue;
        }
        if (!isTargetInRangeOfSkill(actor, action, target)) {
            continue;
        }
        if (!shouldUseSkillOnTarget(actor, action, target)) {
            continue;
        }
        prepareToUseSkillOnTarget(actor, action, target);
        return true;
    }
    return false;
}

export function actorShouldAutoplay(actor: Actor) {
    if (actor.type !== 'hero') {
        return true; // Only character heroes can be manually controlled.
    }
    return !actor.character.activeShrine
        && actor.area && !actor.area.zoneKey
        && (actor.character.autoplay || (actor.character !== getState().selectedCharacter && actor.enemies.length));
}

// The distance functions assume objects are circular in the x/z plane and are calculating
// only distance within that plane, ignoring the height of objects and their y positions.
export function getDistance(spriteA: AreaEntity, spriteB: AreaEntity) {
    const distance = getDistanceOverlap(spriteA, spriteB);
    return Math.max(0, distance);
}
export function getDistanceOverlap(spriteA: AreaEntity, spriteB: AreaEntity) {
    const dx = spriteA.x - spriteB.x;
    const dz = spriteA.z - spriteB.z;
    const distance = Math.sqrt(dx*dx + dz*dz) - ((spriteA.w || 0) + (spriteB.w || 0)) / 2;
    if (isNaN(distance)) {
        console.log(JSON.stringify(['A:', spriteA.x, spriteA.y, spriteA.z, spriteA.w]));
        console.log(JSON.stringify(['B:', spriteB.x, spriteB.y, spriteB.z, spriteB.w]));
        debugger;
    }
    return distance;
}
export function getDistanceBetweenPointsSquared(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;
    return dx*dx + dy*dy + dz*dz;
}

function defeatedEnemy(hero: Hero, enemy: Actor) {
    if (hero.health <= 0) {
        return;
    }
    const loot = [];
    if (enemy.stats.coins) loot.push(coinsLootDrop(enemy.stats.coins));
    if (enemy.stats.anima) loot.push(animaLootDrop(enemy.stats.anima));
    loot.forEach(function (loot, index) {
        loot.gainLoot(hero);
        loot.addTreasurePopup(hero, enemy.x + index * 20, enemy.h, index * 10);
        // If the last enemy is defeated in the boss area, the level is completed.
    });
    if (hero.area.isBossArea && hero.enemies.every(enemy => enemy.isDead)) {
        // hero.time is set to 0 at the start of the level by initializeActorForAdventure.
        completeLevel(hero);
    }
}

export function completeLevel(hero: Hero, completionTime = 0) {
    const state = getState();
    const character = hero.character;
    completionTime = completionTime || hero.time;
    const levelInstance = hero.levelInstance;
    levelInstance.completed = true;
    // If the character beat the last adventure open to them, unlock the next one
    const level = map[character.currentLevelKey];
    increaseAgeOfApplications();
    const oldDivinityScore = ifdefor(character.divinityScores[character.currentLevelKey], 0);
    if (oldDivinityScore === 0) {
        character.fame += level.level;
        gain('fame', level.level);
        // Unlock the next areas.
        const levelData = map[character.currentLevelKey];
        state.savedState.completedLevels[character.currentLevelKey] = true;
        levelData.unlocks.forEach(function (levelKey) {
            unlockMapLevel(levelKey);
        });
    }
    let newDivinityScore;
    const currentEndlessLevel = getEndlessLevel(character, level);
    if (levelInstance.levelDifficulty === 'endless') {
        newDivinityScore = Math.max(10, Math.round(baseDivinity(currentEndlessLevel)));
    } else {
        const difficultyBonus = difficultyBonusMap[levelInstance.levelDifficulty];
        let timeBonus = .8;
        if (completionTime <= getGoldTimeLimit(level, levelInstance.levelDifficulty)) timeBonus = 1.2;
        else if (completionTime <= getSilverTimeLimit(level, levelInstance.levelDifficulty)) timeBonus = 1;
        newDivinityScore = Math.max(10, Math.round(difficultyBonus * timeBonus * baseDivinity(level.level)));
    }
    const gainedDivinity = newDivinityScore - oldDivinityScore;
    if (gainedDivinity > 0) {
        character.divinity += gainedDivinity;
        const textPopup = {value:'+' + abbreviate(gainedDivinity) + ' Divinity', x: hero.x, y: hero.h, z: hero.z, color: 'gold', fontSize: 15, 'vx': 0, 'vy': 1, 'gravity': .1};
        appendTextPopup(hero.area, textPopup, true);
    }
    character.divinityScores[character.currentLevelKey] = Math.max(oldDivinityScore, newDivinityScore);
    // Initialize level times for this level if not yet set.
    character.levelTimes[character.currentLevelKey] = character.levelTimes[character.currentLevelKey] || {};
    if (levelInstance.levelDifficulty === 'endless') {
        unlockItemLevel(currentEndlessLevel + 1);
        character.levelTimes[character.currentLevelKey][levelInstance.levelDifficulty] = currentEndlessLevel + 5;
    } else {
        unlockItemLevel(level.level + 1);
        const oldTime = character.levelTimes[character.currentLevelKey][levelInstance.levelDifficulty] || 99999;
        character.levelTimes[character.currentLevelKey][levelInstance.levelDifficulty] = Math.min(completionTime, oldTime);
    }
    saveGame();
}

export function messageCharacter(character: Character, text: string) {
    const hero = character.hero;
    appendTextPopup(hero.area, {'value': text, 'duration': 70, 'x': hero.x + 32, y: hero.h, z: hero.z, color: 'white', fontSize: 15, 'vx': 0, 'vy': .5, 'gravity': .05}, true);
}

export function returnToMap(character: Character) {
    //character.hero.levelInstance = null
    removeAdventureEffects(character.hero);
    character.hero.goalTarget = null;
    character.activeShrine = null;
    leaveCurrentArea(character.hero, true);
    // Can't bring minions with you to the world map.
    (character.hero.minions || []).forEach(removeActor);
    character.hero.boundEffects = [];
    updateAdventureButtons();
    if (character.autoplay && character.replay) {
        startLevel(character, character.currentLevelKey);
    } else if (editingMapState.testingLevel) {
        stopTestingLevel();
    } else if (getState().selectedCharacter === character) {
        setContext('map');
        refreshStatsPanel(character, query('.js-characterColumn .js-stats'));
    } else {
        character.context = 'map';
    }
}

export function leaveCurrentArea(actor: Actor, leavingZone = false) {
    if (!actor.area) {
        return;
    }
    // If the current area is a safe guild area, it becomes the actors 'escape exit',
    // where they will respawn next if they die.
    if (actor.type === 'hero' && actor.area.zoneKey === 'guild' && !actor.area.enemies.length) {
        actor.escapeExit = {x: actor.x, z: actor.z, areaKey: actor.area.key, zoneKey: 'guild'};
    }
    var allyIndex = actor.area.allies.indexOf(actor);
    if (allyIndex >= 0) actor.area.allies.splice(allyIndex, 1);
    (actor.minions || []).forEach(minion => leaveCurrentArea(minion, leavingZone));
    removeBoundEffects(actor, actor.area, leavingZone);
    actor.area = null;
}

export const difficultyBonusMap = {easy: 0.8, normal: 1, hard: 1.5, challenge: 2};
export function getGoldTimeLimit(level: LevelData, difficulty: LevelDifficulty): number {
    var sections = Math.max(level.events.length,  5 * Math.sqrt(level.level)) + 1;
    return difficultyBonusMap[difficulty] * sections * (5 + level.level / 2);
}
export function getSilverTimeLimit(level: LevelData, difficulty: LevelDifficulty): number {
    var sections = Math.max(level.events.length,  5 * Math.sqrt(level.level)) + 1;
    return difficultyBonusMap[difficulty] * sections * (10 + level.level);
}

export function playAreaSound(sound: any, area: Area) {
    if (getState().selectedCharacter.hero.area !== area ) return;
    playSound(sound);
}

function removeAdventureEffects(actor: Actor) {
    setStat(actor.variableObject, 'bonusMaxHealth', 0);
    while (actor.allEffects.length) removeBonusSourceFromObject(actor.variableObject, actor.allEffects.pop(), false);
    initializeActorForAdventure(actor);
    recomputeDirtyStats(actor.variableObject);
}
