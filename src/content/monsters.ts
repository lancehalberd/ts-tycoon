import { isPointOverActor } from 'app/actor';
import { createVariableObject, addBonusSourceToObject, recomputeDirtyStats } from 'app/bonuses';
import { actorHelpText, addActions, coreStatBonusSource, personFrames, recomputeActorTags } from 'app/character';
import { abilities, leapAndAct } from 'app/content/abilities';
import { getPositionFromLocationDefinition } from 'app/content/areas';
import { itemsByKey } from 'app/content/equipment/index';
import { map } from 'app/content/mapData';
import { createCanvas } from 'app/dom';
import { ParticleEffect } from 'app/effects';
import { makeAffix } from 'app/enchanting';
import { ADVENTURE_WIDTH, GROUND_Y, equipmentSlots } from 'app/gameConstants';
import { drawCompositeTintedFrame, requireImage } from 'app/images';
import { makeItem } from 'app/inventory';
import { drawActor } from 'app/render/drawActor';
import { createAnimation } from 'app/utils/animations';
import { ifdefor } from 'app/utils/index';
import Random from 'app/utils/Random';

import {
    Ability, Actor, ActorSource, ActorStats, Affix, AffixData,
    Area, AreaEntity, Bonuses, BonusSource, Equipment, EquipmentSlot,
    Frame, FrameAnimation, FrameDimensions, FrameRectangle,
    Monster, MonsterData, MonsterDefinition,
} from 'app/types';

export const enchantedMonsterBonuses: BonusSource = { 'bonuses': {
    '*maxHealth': 1.5, '*tenacity': 2, '*weaponDamage': 1.5, '*coins': 2, '*anima': 3,
    '$tint': '#af0', '$tintMinAlpha': 0.2, '$tintMaxAlpha': 0.5, '$lifeBarColor': '#af0',
}};
export const imbuedMonsterBonuses: BonusSource = {'bonuses': {
    '*maxHealth': 2, '*tenacity': 4, '*weaponDamage': 2, '*coins': 6, '*anima': 10,
    '$tint': '#c6f', '$tintMinAlpha': 0.2, '$tintMaxAlpha': 0.5, '$lifeBarColor': '#c6f',
}};
export const easyBonuses: BonusSource = {'bonuses': {
    '*maxHealth': .8, '*strength': .8, '*dexterity': .8, '*intelligence': .8, '*speed': .8,
    '*weaponDamage': .8, '*attackSpeed': .8, '*armor': .8, '*evasion': .8, '*block': .8, '*magicBlock': .8,
    '*coins': .8, '*anima': .8,
}};
export const hardBonuses: BonusSource = {'bonuses': {
    '*maxHealth': 1.3, '*strength': 1.3, '*dexterity': 1.3, '*intelligence': 1.3, '*speed': 1.3,
    '*weaponDamage': 1.3, '*attackSpeed': 1.3, '*armor': 1.3, '*evasion': 1.3, '*block': 1.3, '*magicBlock': 1.3,
    '*coins': 1.5, '*anima': 1.5,
}};

// To make bosses intimidating, give them lots of health and damage, but to keep them from being overwhelming,
// scale down their health regen, attack speed and critical multiplier.
export const bossMonsterBonuses: BonusSource = {'bonuses': {
    '*maxHealth': [2.5, '+', ['{level}', '/', 2]], '*tenacity': 5,
    '*weaponDamage': 2, '*attackSpeed': .75, '*critDamage': .5, '*critChance': .5, '*magicPower': 2,
    '*evasion': .5,
    '*healthRegen': [1, '/', [1.5, '+', ['{level}', '/', 2]]], '+coins': 2, '*coins': 4, '+anima': 1, '*anima': 4,
    '$uncontrollable': 'Cannot be controlled.', '$tint': 'red', '$tintMinAlpha': 0.2, '$tintMaxAlpha': 0.5,
}};
const monsterPrefixes: AffixData[][] = [
    [
        {'name': 'Hawkeye', 'bonuses': {'+accuracy': [5, 10]}},
        {'name': 'Giant', 'bonuses': {'*maxHealth': 2, '*scale': 1.3}}
    ],
    [
        {'name': 'Eldritch', 'bonuses': {'+weaponMagicDamage': [1, 2], '*weaponMagicDamage': [2, 3]}}
    ],
    [
        {'name': 'Telekenetic', 'bonuses': {'+range': [3, 5]}}
    ],
    [
        {'name': 'Frenzied', 'bonuses': {'*speed': [15, 20, 10], '*attackSpeed': [15, 20, 10]}}
    ],
    [
        {'name': 'Lethal', 'bonuses': {'+critChance': [10, 20, 100], '+critDamage': [20, 50, 100], '+critAccuracy': [20, 50, 100]}}
    ]
];
const monsterSuffixes: AffixData[][] = [
    [
        {'name': 'Frost', 'bonuses': {'+slowOnHit': [1, 2, 10]}},
        {'name': 'Confusion', 'bonuses': {'+damageOnMiss': [2, 3]}}
    ],
    [
        {'name': 'Healing', 'bonuses': {'+healthRegen': [1, 2]}}
    ],
    [
        {'name': 'Shadows', 'bonuses': {'+evasion': [3, 5]}}
    ],
    [
        {'name': 'Stealth', 'bonuses': {'$cloaking': true}}
    ]
];

export function makeMonster(
    area: Area,
    monsterData,
    level,
    extraSkills: (Ability | BonusSource)[],
    specifiedRarity: number = null,
): Monster {
    extraSkills = extraSkills || [];
    let baseMonster: MonsterData;
    if (typeof(monsterData) == 'string') {
        baseMonster = monsters[monsterData];
        if (!baseMonster) {
            throw new Error('Invalid monster key ' + monsterData);
        }
    } else if (typeof(monsterData) == 'object') {
        baseMonster = monsters[monsterData.key];
        if (monsterData.bonuses) {
            extraSkills.push({'bonuses': monsterData.bonuses});
        }
    }
    if (!baseMonster) {
        console.log(baseMonster);
        console.log(monsterData);
        throw new Error('could not determine base monster type');
    }
    const monster: Monster = {
        targetType: 'actor',
        area,
        type: 'monster',
        x: 0, y: 0, z: 0,
        w: 0, h: 0, d: 0,
        level,
        name: baseMonster.name,
        slow: 0,
        equipment: {},
        attackCooldown: 0,
        prefixes: [],
        suffixes: [],
        extraSkills,
        aggroRadius: ADVENTURE_WIDTH * 3 / 4,
        percentHealth: 1,
        percentTargetHealth: 1,
        helpMethod: actorHelpText,
        isPointOver: isPointOverActor,
        heading: [-1, 0, 0],
        base: baseMonster,
        source: baseMonster.source,
        stationary: baseMonster.stationary,
        noBasicAttack: baseMonster.noBasicAttack,
        baseY: 0, // baseMonster.source.y || 0,
        allEffects: [],
        minionBonusSources: [],
        idleFrame: 0,
        walkFrame: 0,
        // This will get set in updateMonster.
        // It can change if the monsters gains/loses affixes.
        image: null,
        render: drawActor,
    };

    const rarity = (specifiedRarity !== null)
        ? specifiedRarity
        : ((Math.random() < .25) ? (Math.random() * (level - 1) * .6) : 0);
    if (rarity < 1) {

    } else if (rarity < 3) {
        if (Math.random() > .5) addMonsterPrefix(monster);
        else addMonsterSuffix(monster);
    } else if (rarity < 10) {
        addMonsterPrefix(monster);
        addMonsterSuffix(monster);
    } else if (rarity < 20) {
        addMonsterPrefix(monster);
        addMonsterSuffix(monster);
        if (Math.random() > .5) addMonsterPrefix(monster);
        else addMonsterSuffix(monster);
    } else {
        addMonsterPrefix(monster);
        addMonsterSuffix(monster);
        addMonsterPrefix(monster);
        addMonsterSuffix(monster);
    }
    updateMonster(monster);
    return monster;
}
function addMonsterPrefix(monster: Monster) {
    const alreadyUsed = monster.prefixes.map(affix => affix.base);
    monster.prefixes.push(makeAffix(Random.element(matchingMonsterAffixes(monsterPrefixes, monster, alreadyUsed))));
}
function addMonsterSuffix(monster: Monster) {
    const alreadyUsed = monster.suffixes.map(affix => affix.base);
    monster.suffixes.push(makeAffix(Random.element(matchingMonsterAffixes(monsterSuffixes, monster, alreadyUsed))));
}
function matchingMonsterAffixes(list: AffixData[][], monster: Monster, alreadyUsed: AffixData[]) {
    const choices = [];
    for (let level = 0; level < monster.level && level < list.length; level++) {
        for (const affix of list[level]) {
            if (!alreadyUsed.includes(affix)) {
                choices.push(affix);
            }
        }
    }
    return choices;
}
export function updateMonster(monster: Monster) {
    // Clear the character's bonuses and graphics.
    const variableObject = createVariableObject(monster.base);
    monster.variableObject = variableObject;
    monster.stats = variableObject.stats as ActorStats;
    monster.actions = [];
    monster.reactions = [];
    monster.onHitEffects = [];
    monster.onCritEffects = [];
    monster.onMissEffects = [];
    monster.variableObject.tags = recomputeActorTags(monster);
    addBonusSourceToObject(variableObject, {'bonuses': monster.base.implicitBonuses}, false);
    addBonusSourceToObject(variableObject, {'bonuses': getMonsterBonuses(monster)}, false);
    addBonusSourceToObject(variableObject, coreStatBonusSource, false);
    var enchantments = monster.prefixes.length + monster.suffixes.length;
    //if (monster.base.source.walkAnimation.frames[0].image.normal) monster.image = monster.base.source.walkAnimation.frames[0].image.normal;
    //else monster.image = monster.base.source.walkAnimation.frames[0].image;
    // Storing image on actors prevents us from being able to use different images for different animations.
    monster.image = monster.base.source.walkAnimation.frames[0].image;
    if (enchantments > 2) {
        addBonusSourceToObject(variableObject, imbuedMonsterBonuses, false);
    } else if (enchantments) {
        addBonusSourceToObject(variableObject, enchantedMonsterBonuses, false);
    }
    for (const ability of [...(monster.extraSkills || []), ...(monster.base.abilities || [])]) {
        addBonusSourceToObject(variableObject, ability, false);
        addActions(monster, ability);
    }
    monster.prefixes.forEach(function (affix) {
        addBonusSourceToObject(variableObject, affix, false);
        //addActions(monster, affix);
    });
    monster.suffixes.forEach(function (affix) {
        addBonusSourceToObject(variableObject, affix, false);
        //addActions(monster, affix);
    });
    // Add the character's current equipment to bonuses and graphics
    equipmentSlots.forEach(function (type) {
        const equipment = monster.equipment[type];
        if (!equipment) {
            return;
        }
        addBonusSourceToObject(variableObject, equipment.base, false);
        addActions(monster, equipment.base);
        equipment.prefixes.forEach(function (affix) {
            addBonusSourceToObject(variableObject, affix, false);
            //addActions(monster, affix);
        })
        equipment.suffixes.forEach(function (affix) {
            addBonusSourceToObject(variableObject, affix, false);
            //addActions(monster, affix);
        })
    });
    if (!monster.noBasicAttack) addActions(monster, abilities.basicAttack);
    recomputeDirtyStats(variableObject);
    //console.log(monster);
}

export const monsters:{[key:string]: MonsterData} = {};
function addMonster(key: string, data: Partial<MonsterData> & {name: string}, parent: MonsterData = null) {
    if (parent) {
        for (let property in parent) {
            switch (property) {
                case 'abilities':
                    data.abilities = [...parent.abilities, ...(data.abilities || [])];
                    break;
                case 'implicitBonuses':
                    data.implicitBonuses = {...parent.implicitBonuses, ...(data.implicitBonuses || {})};
                    break;
                default:
                    data[property] = ifdefor(data[property], parent[property]);
            }
        }
    }
    monsters[key] = {
        source: null,
        abilities: [],
        ...data,
        variableObjectType: 'actor',
        key,
    };
}
function getMonsterBonuses(monster: Monster): Bonuses {
    const growth = monster.level - 1;
    const levelCoefficient = Math.pow(1.07, monster.level);
    return {
        // Health scales linearly to level 10, then 10% a level.
        '+maxHealth': (10 + 25 * growth),
        '+tenacity': 1 + growth / 100,
        '+level': monster.level,
        '+levelCoefficient': levelCoefficient,
        '+range': 1,
        '+minWeaponPhysicalDamage': Math.round(.9 * (5 + 5 * growth)) * levelCoefficient,
        '+maxWeaponPhysicalDamage': Math.round(1.1 * (5 + 5 * growth)) * levelCoefficient,
        '+minWeaponMagicDamage': Math.round(.9 * (1 + 1.5 * growth)) * levelCoefficient,
        '+maxWeaponMagicDamage': Math.round(1.1 * (1 + 1.5 * growth)) * levelCoefficient,
        '+critChance': .05,
        '+critDamage': .5,
        '+critAccuracy': 1,
        '+attackSpeed': 1 + .02 * growth,
        '+speed': 60 + growth / 3,
        '+accuracy': 4 + 5 * growth,
        '+evasion': 1 + growth,
        '+block': 1.5 * growth,
        '+magicBlock': .75 * growth,
        '+armor': 1.5 * growth,
        '+magicResist': .001 * growth,
        '+strength': 5 * growth,
        '+intelligence': 5 * growth,
        '+dexterity': 5 * growth,
        '*magicPower': .5,
        '+coins': Random.range(1, Math.floor((growth + 1) * Math.pow(1.15, growth + 1) * 4)),
        '+anima': Random.range(1, Math.floor((growth + 1) * Math.pow(1.15, growth + 1)))
    };
}
const monsterShadow = createAnimation(
    requireImage('gfx2/enemies/monstershadow.png'), {w: 36, h: 36, content: {x: 14, y: 33, w: 19, h: 3}},
);
const airMonsterShadow = createAnimation(
    requireImage('gfx2/enemies/monsterflyshadow.png'), {w: 36, h: 36, content: {x: 12, y: 33, w: 12, h: 3}},
);
function completeMonsterSource(source: Partial<ActorSource> & {walkAnimation: FrameAnimation}, shadowAnimation: FrameAnimation = monsterShadow): ActorSource {
    const attackPreparationAnimation = source.attackPreparationAnimation || source.walkAnimation;
    const attackRecoveryAnimation = source.attackRecoveryAnimation || {
        ...attackPreparationAnimation,
        frames: attackPreparationAnimation.frames.slice().reverse(),
    };
    return {
        ...source,
        idleAnimation: source.idleAnimation || source.walkAnimation,
        hurtAnimation: source.hurtAnimation || source.idleAnimation || source.walkAnimation,
        deathAnimation: source.deathAnimation || source.hurtAnimation || source.idleAnimation || source.walkAnimation,
        attackPreparationAnimation,
        attackRecoveryAnimation,
        spellPreparationAnimation: source.spellPreparationAnimation || attackPreparationAnimation,
        spellRecoveryAnimation: source.spellRecoveryAnimation || attackRecoveryAnimation,
        shadowAnimation,
    };
}
function createMonsterSource(image: HTMLImageElement | HTMLCanvasElement, dimensions: FrameDimensions, shadowAnimation: FrameAnimation = monsterShadow ): ActorSource {
    const hurtAnimation = createAnimation(image, dimensions, {cols: 7, frameMap: [6]});
    return {
        idleAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [0]}),
        walkAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [0, 1, 2, 1]}),
        attackPreparationAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [3, 4]}),
        attackRecoveryAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [5]}),
        spellPreparationAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [3, 4]}),
        spellRecoveryAnimation: createAnimation(image, dimensions, {cols: 7, frameMap: [5]}),
        deathAnimation: hurtAnimation,
        hurtAnimation,
        shadowAnimation,
    };
}
function createSkeletonMonsterSource(image: HTMLImageElement | HTMLCanvasElement, dimensions: FrameDimensions ): ActorSource {
    const actorSource = createMonsterSource(image, dimensions);
    actorSource.walkAnimation = createAnimation(image, dimensions, {cols: 7, frameMap: [0, 1, 0, 2]});
    return actorSource;
}
function createTintedImage(image: HTMLImageElement | HTMLCanvasElement, rectangle: FrameRectangle, color: string) {
    const canvas = createCanvas(rectangle.w, rectangle.h);
    const context = canvas.getContext('2d');
    drawCompositeTintedFrame(context,
        {...rectangle, image, color, y: rectangle.h},
        {...rectangle, image},
        {...rectangle, x: 0, y: 0}
    );
    return canvas;
}
const frameRectangle = {x: 0, y: 0, w: 36, h: 36, d: 8};
const skeletonDimensions: FrameDimensions = {w: 36, h: 36, content: {x: 6, y: 0, w: 12, h: 36, d: 8}};
const gremlinSheet = requireImage('gfx2/enemies/gremlinsheet.png');
const skeletonSheet = requireImage('gfx2/enemies/skeletonunarmedsheet.png');
const skeletonDeathSheet = requireImage('gfx2/enemies/skeletondeathsheet.png');
let plainSkeletonDeathParts: FrameAnimation[];
function addSkeletonExplosion(skeleton: Monster) {
    const scale = skeleton.stats.scale || 1;
    const frame = skeleton.frame;
    const content = frame.content || {...frame, x: 0, y: 0};
    // Calculate the top of the skeleton frame.
    // Remember skeleton.x is the middle of the content box for the skeleton in area coords.
    // And skeleton.y is the bottom of the content box in area coords.
    const left = (skeleton.heading[0] < 0 ?
        skeleton.x - (frame.w - content.x - content.w / 2) * scale :
        skeleton.x - content.w * scale / 2 - content.x * scale) - skeleton.area.cameraX;
    const top = GROUND_Y - skeleton.y - skeleton.z / 2 - content.h * scale - content.y * scale;
    for (let i = 0; i < plainSkeletonDeathParts.length; i++) {
        const animation = plainSkeletonDeathParts[i];
        const vx = -3 + i + Math.random() / 2;
        const partFrame = animation.frames[0];
        const partContent = partFrame.content || {...partFrame, x: 0, y: 0};
        // The skeleton death sprite currently has the opposite orientation of the skeleton.
        const flipped = !(skeleton.heading[0] < 0);
        // Logging for rendering issues.
        /*if (i === 0) {
            console.log('skeleton.left', skeleton.left);
            console.log({left, flipped, scale});
            console.log(partFrame);
            console.log('x', left + ((flipped ? partFrame.w - partContent.x - partContent.w : partContent.x ) + partContent.w / 2) * scale);
        }*/
        skeleton.area.effects.push(new ParticleEffect({
            animation,
            scale,
            // Normally the center of the content is left+content.x + content.w / 2,
            // where content.x is the distance from the left side of the frame to the content rectangle.
            // For flipped graphics, this needs to be the right side of the frame to the right side of the rectangle
            // which is frame.w - (content.x + content.w).
            x: left + ((flipped ? partFrame.w - partContent.x - partContent.w : partContent.x ) + partContent.w / 2) * scale,
            y: top + (partContent.y + partContent.h / 2) * scale,
            vx,
            vy: -10 + Math.abs(vx),
            vr: Math.random() * Math.PI / 3 - Math.PI / 6,
            flipped,
        }));
    }
}

export function initializeMonsters() {
    const caterpillarSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/caterpillar.png', {w: 48, h: 64, content: {x: 0, y: 40, w: 64, h: 24, d: 8}},
            {cols: 4},
        )
    });
    const gnomeSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/gnome.png', {w: 32, h: 64, content: {x: 0, y: 26, w: 32, h: 38, d: 8}},
            {cols: 4},
        ),
        flipped: true
    });
    const butterflySource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/yellowButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [1, 2, 3, 4, 5, 6, 4, 2, 0]},
        ),
        attackPreparationAnimation: createAnimation('gfx/yellowButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [7, 10, 11]},
        ),
        deathAnimation: createAnimation('gfx/yellowButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [7, 8, 9, 9]},
        )
    }, airMonsterShadow);
    const monarchSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/monarchButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [1, 2, 3, 4, 5, 6, 4, 2, 0]},
        ),
        attackPreparationAnimation: createAnimation(
            'gfx/monarchButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [7, 10, 11]},
        ),
        deathAnimation: createAnimation(
            'gfx/monarchButterfly.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [7, 8, 9, 9]},
        ),
    }, airMonsterShadow);
    const turtleSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/turtle.png', {w: 64, h: 64, d: 8},
            {cols: 5, rows: 2, frameMap: [0, 1, 2, 3]},
        ),
        attackPreparationAnimation: createAnimation('gfx/turtle.png', {w: 64, h: 64, d: 8},
            {cols: 5, rows: 2, frameMap: [5, 6]},
        ),
        deathAnimation: createAnimation('gfx/turtle.png', {w: 64, h: 64, d: 8},
            {cols: 5, rows: 2, frameMap: [5, 7, 8, 9]},
        ),
    });
    const skeletonGiantSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/skeletonGiant.png', {w: 48, h: 64, d: 8},
            {cols: 7},
        ),
    });
    const dragonSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/dragon.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [0, 1, 2, 3]},
        ),
        attackPreparationAnimation: createAnimation('gfx/dragon.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [4, 5, 6]},
        ),
        deathAnimation: createAnimation('gfx/dragon.png', {w: 64, h: 64, content: {x: 0, y: 0, w: 48, h: 64, d: 8}},
            {cols: 7, rows: 2, frameMap: [7, 8, 9]},
        ),
    });
    // Missing y: 30 to make this monster "flying" maybe set it on the actor itself?
    const batDimensions = {w: 36, h: 36, content: {x: 12, y: 0, w: 12, h: 36, d: 8}};
    const batSource = createMonsterSource(requireImage('gfx2/enemies/batsheet.png'), batDimensions, airMonsterShadow);
    const plainSkeletonSheet = createTintedImage(skeletonSheet, {x: 0, y: 0, w: 252, h: 36, d: 8}, 'white');
    const skeletonSource = createSkeletonMonsterSource(plainSkeletonSheet, skeletonDimensions);
    const plainSkeletonDeathSheet = createTintedImage(skeletonDeathSheet, {x: 0, y: 0, w: 252, h: 36, d: 8}, 'white');
    // TODO: Add content rectangles to these so we can make them spin at some point.
    plainSkeletonDeathParts = [
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 24, y: 0, w: 10, h: 12, d: 8}}, {x: 0, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 18, y: 14, w: 9, h: 10, d: 8}}, {x: 1, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 21, y: 21, w: 8, h: 7, d: 8}}, {x: 2, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 13, y: 15, w: 7, h: 8, d: 8}}, {x: 3, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 29, y: 16, w: 6, h: 13, d: 8}}, {x: 4, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 25, y: 30, w: 7, h: 6, d: 8}}, {x: 5, cols: 1}),
        createAnimation(plainSkeletonDeathSheet, {...frameRectangle, content: {x: 12, y: 25, w: 10, h: 7, d: 8}}, {x: 6, cols: 1}),
    ];

    const skeletonSwordSource = createMonsterSource(requireImage('gfx2/enemies/skeletonswordsheet.png'), skeletonDimensions);
    const gremlinRectangle = {x: 0, y: 0, w: 36, h: 36, content: {x: 0, y: 20, w: 21, h: 16, d: 8}};
    const orangeGremlinSheet = createTintedImage(gremlinSheet, {x: 0, y: 0, w: 252, h: 36, d: 8}, 'orange');
    const gremlinSource = createMonsterSource(orangeGremlinSheet, gremlinRectangle);
    const spiderSource = completeMonsterSource({
        walkAnimation: createAnimation(
            requireImage('gfx/spider.png'), {w: 48, h: 48, content: {x: 0, y: 10, w: 48, h: 38, d: 8}},
            {cols: 10, rows: 2, frameMap: [4, 5, 6, 7, 8, 9]},
        ),
        attackPreparationAnimation: createAnimation(
            requireImage('gfx/spider.png'), {w: 48, h: 48, content: {x: 0, y: 10, w: 48, h: 38, d: 8}},
            {cols: 10, rows: 2, frameMap: [0, 1, 2, 3]},
        ),
        deathAnimation: createAnimation(
            requireImage('gfx/spider.png'), {w: 48, h: 48, content: {x: 0, y: 10, w: 48, h: 38, d: 8}},
            {cols: 10, rows: 2, frameMap: [10, 11, 12, 13]},
        ),
    });
    const wolfSource = completeMonsterSource({
        walkAnimation: createAnimation('gfx/wolf.png', {w: 64, h: 32, d: 8},
            {cols: 7, rows: 2, frameMap:[0, 1, 2, 3]},
        ),
        attackPreparationAnimation: createAnimation('gfx/wolf.png', {w: 64, h: 32, d: 8},
            {cols: 7, rows: 2, frameMap: [6, 4, 5, 0]},
        ),
        deathAnimation: createAnimation('gfx/wolf.png', {w: 64, h: 32, d: 8},
            {cols: 7, rows: 2, frameMap: [0, 7, 8, 9]},
        ),
    });

    addMonster('dummy', {
        'name': 'Dummy', 'source': caterpillarSource,
        'implicitBonuses': {}
    });
    addMonster('gremlin', {
        'name': 'Gremlin', 'source': gremlinSource, 'implicitBonuses': {}
    });
    addMonster('turtle', {
        'name': 'Turtle', 'source': turtleSource, 'fpsMultiplier': 2,
        'implicitBonuses': {}
    });
    addMonster('spider', {
        'name': 'Spider', 'source': spiderSource,
        'implicitBonuses': {'*evasion': 1.2, '*accuracy': .8, '*weaponDamage': 1.2, '+range': .5, '*speed': 1.3, '*scale': .75},
        'abilities': [abilities.poison]
    });
    addMonster('jumpingSpider', {
        'name': 'Jumping Spider', 'source': spiderSource,
        'implicitBonuses': {'*evasion': 1.2, '*accuracy': .8, '*weaponDamage': 1.4, '*speed': 1.5, '*scale': .75},
        'abilities': [abilities.blinkStrike]
    });
    addMonster('wolf', {
        'name': 'Wolf', 'source': wolfSource,
        'implicitBonuses': {'+weaponRange': 1, '*maxHealth': 1.5, '*weaponDamage': 1.2, 'weaponMagicDamage': 0, '*accuracy': 1.5, '+critChance': .1, '*speed': 1.5, '*scale': .75}
    });
    addMonster('alphaWolf', {
        'name': 'Alpha Wolf', 'source': wolfSource,
        'implicitBonuses': {'*maxHealth': 2, '*scale': .8},
        'abilities': [abilities.attackSong]
    }, monsters.wolf);
    addMonster('packLeader', {
        'name': 'Pack Leader', 'source': wolfSource,
        'implicitBonuses': {'+weaponRange': 2},
        'abilities': [abilities.majorDexterity, abilities.majorStrength, abilities.majorIntelligence,
                      abilities.howl, abilities.howl, abilities.attackSong, abilities.defenseSong, abilities.sicem, abilities.howlSingAttack]
    }, monsters.alphaWolf);
    // Should be tinted white.
    addMonster('snowWolf', {'name': 'Snow Wolf',
            abilities: [leapAndAct('freeze'), abilities.freeze, abilities.minorIntelligence, abilities.sage]}, monsters.wolf);
    addMonster('frostBite', {name: 'Frost Bite', abilities: [abilities.secondWind, abilities.wizard]}, monsters.snowWolf);
    addMonster('giantSpider', {
        'name': 'Giant Spider', 'source': spiderSource,
        'implicitBonuses': {'+weaponRange': 12, '*evasion': .8, '*accuracy': .8, '*weaponDamage': 1.4, '+critChance': .25, '*scale': 1.15},
        'tags': ['ranged'],
        'abilities': [abilities.net, abilities.dodge, abilities.acrobatics, abilities.reflect, abilities.dodgeNetReflect, abilities.poison]
    });
    addMonster('bat', {
        'name': 'Bat', 'source': batSource,
        'implicitBonuses': {'*evasion': 1.2, '*accuracy': 1.2, '*weaponDamage': .6, '*speed': 2}
    });
    addMonster('vampireBat', {
        'name': 'Vampire Bat', 'source': batSource,
        'implicitBonuses': {'*evasion': 1.2, '*accuracy': 1.2, '*weaponDamage': .8, '*speed': 2, '*scale': 1.25},
        'abilities': [abilities.darkknight, abilities.distract, abilities.drainLife]
    });
    addMonster('caterpillar', {
        'name': 'Caterpillar', 'source': caterpillarSource,
        'implicitBonuses': {'*weaponMagicDamage': 0, '+weaponDamage': 1,
                            '*block': .5, '+magicBlock': 6, '*magicBlock': 2, '+magicResist': .66,
                            '*speed': 0.7}
    });
    addMonster('spongeyCaterpillar', {
        'name': 'Armorpede', 'source': caterpillarSource,
        'implicitBonuses': {'*weaponMagicDamage': 0, '*weaponDamage': 0.5, '*maxHealth': 3,
                            '*armor': 1.5, '+magicBlock': 6, '*magicBlock': 2, '+magicResist': 0.75,
                            '*speed': 0.7},
        'abilities': [abilities.vitality, abilities.majorStrength]
    });
    addMonster('stealthyCaterpillar', {
        'name': 'The Very Stealthy Caterpillar', 'source': caterpillarSource,
        'implicitBonuses': {'*weaponMagicDamage': 0, '*maxHealth': .5, '*scale': .15, '+scale': [40, '*', ['{bonusMaxHealth}', '/', '{maxHealth}']],
                            '*block': .5, '+magicBlock': 4, '*magicBlock': 2, '+magicResist': .5, '*healthRegen': 5,
                            '*speed': [.5, '+', [2, '*', ['{bonusMaxHealth}', '/', '{maxHealth}']]]},
        'abilities': [abilities.stealth, abilities.darkknight, abilities.darkknight]
    });
    // Gnomes are vulnerable to magic damage, strong against physical damage, and deal ranged magic damage.
    // Designed to favor mage classes.
    addMonster('gnome', {'name': 'Gnome', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 4, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6}, 'tags': ['ranged']
    });
    addMonster('gnomecromancer', {'name': 'Gnomecromancer', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 6, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6},
        'abilities': [abilities.summonSkeleton, abilities.summoner, abilities.darkknight, abilities.consume, abilities.consumeRange], 'tags': ['ranged']
    });
    addMonster('necrognomekhan', {'name': 'Necrognomekhan', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 6, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '+scale': [2, '*', ['{bonusMaxHealth}', '/', '{maxHealth}']],
                            '*cooldown': [.1, '+', ['{bonusMaxHealth}', '/', '{maxHealth}']],
                            '*weaponDamage': [1, '+', ['{bonusMaxHealth}', '/', '{maxHealth}']],
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6},
        'abilities': [abilities.summonSkeleton, abilities.summoner, abilities.darkknight, abilities.consume, abilities.consumeRange, abilities.consumeRatio], 'tags': ['ranged']
    });
    addMonster('gnomeCleric', {'name': 'Gnome Cleric', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 4, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '*intelligence': 2,
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6},
        'abilities': [abilities.spellAOE, abilities.protect, abilities.heal, abilities.minorIntelligence], 'tags': ['ranged']
    });
    addMonster('gnomeMage', {'name': 'Gnome Mage', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 4, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6},
        'abilities': [abilities.fireball, abilities.wizard], 'tags': ['ranged']
    });
    addMonster('gnomeWizard', {'name': 'Gnome Wizard', 'source': gnomeSource, 'fpsMultiplier': 1.5,
        'implicitBonuses': {'+weaponRange': 4, '*attackSpeed': 1, '+weaponMagicDamage': 4, '*weaponMagicDamage': 1.3,
                            '+block': 4, '+armor': 4, '*armor': 1.5, '*block': 1.5, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': .6},
        'abilities': [abilities.fireball, abilities.freeze, abilities.wizard], 'tags': ['ranged']
    });
    addMonster('skeleton', {'name': 'Skeleton', 'source': skeletonSource,
        // Fast to counter ranged heroes, low range+damage + fast attacks to be weak to armored heroes.
        'implicitBonuses': {'+weaponRange': -.5, '+accuracy': 2, '*attackSpeed': 2, '*weaponMagicDamage': 0,
                            '*evasion': 1.3, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': 1.5},
        'abilities': [abilities.sideStep],
        onDeath: addSkeletonExplosion,
    });
    addMonster('skeletalBuccaneer', {'name': 'Skeletal Buccaneer', 'source': skeletonSource,
        // Deflect to counter ranged champions.
        'implicitBonuses': {'+weaponRange': -.5, '*minPhysicalDamage': .4, '*maxPhysicalDamage': .4, '+accuracy': 2, '*attackSpeed': 2, '*weaponMagicDamage': 0,
                            '*block': 0, '+armor': 2, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': 1, 'scale': 1.5},
        'abilities': [abilities.deflect, abilities.deflectDamage, abilities.sage, abilities.majorDexterity],
        onDeath: addSkeletonExplosion,
    });
    addMonster('undeadPaladin', {'name': 'Undead Paladin', 'source': skeletonSource,
        // Deflect to counter ranged champions.
        'implicitBonuses': {'*minPhysicalDamage': .4, '*maxPhysicalDamage': .4, '+accuracy': 2, '*attackSpeed': 2,
                            '*block': 1.5, '+armor': 2, '*magicBlock': 1.5, '*magicResist': 0.1,
                            '*speed': 1, '*scale': 1.5},
        'abilities': [abilities.reflect, abilities.majorIntelligence, abilities.aegis, abilities.heal],
        onDeath: addSkeletonExplosion,
    });
    addMonster('undeadWarrior', {'name': 'Undead Warrior', 'source': skeletonSwordSource,
        // Fast to counter ranged heroes, low range+damage + fast attacks to be weak to armored heroes.
        'implicitBonuses': {'+weaponRange': -.5, '*minPhysicalDamage': .4, '*maxPhysicalDamage': .4, '+accuracy': 2, '*attackSpeed': 2, '*weaponMagicDamage': 0,
                            '*block': 0, '+armor': 2, '*magicBlock': 0.1, '*magicResist': 0.1,
                            '*speed': 1.5},
        'abilities': [abilities.blinkStrike, abilities.soulStrike, abilities.majorStrength, abilities.vitality],
        onDeath: addSkeletonExplosion,
    });
    //console.log(JSON.stringify(makeMonster('skeleton', 1)));
    addMonster('butterfly', {'name': 'Butterfly', 'source': butterflySource, 'fpsMultiplier': 4,
        'implicitBonuses': {'*maxHealth': 1.5, '+weaponRange': 4, '+critChance': .05, '+critDamage': .1, '+critAccuracy': .5, '*accuracy': 2,
                            '*weaponMagicDamage': .4, '*weaponDamage': .8,
                            '*block': 0, '*armor': .5, '*magicBlock': 1.5, '*magicResist': 0.1,
                            '*speed': .8}, 'tags': ['ranged']
    });
    addMonster('battlefly', {'name': 'Battlefly', 'source': butterflySource, 'fpsMultiplier': 4,
        'implicitBonuses': {'*maxHealth': 2, '+weaponRange': 5, '+critChance': .05, '+critDamage': .1, '+critAccuracy': .5, '*accuracy': 2,
                            '*weaponMagicDamage': 0,
                            '*block': 0, '*armor': .5, '*magicBlock': 1.5, '*magicResist': 0.1,
                            '*speed': .8}, 'tags': ['ranged'],
        'abilities': [abilities.powerShot, abilities.powerShotKnockback]
    });
    addMonster('motherfly', {'name': 'Motherfly', 'source': monarchSource, 'fpsMultiplier': 4,
        'implicitBonuses': {'+maxHealth': 20, '*maxHealth': 3, '+weaponRange': 5, '+critChance': .05, '+critDamage': .1, '+critAccuracy': .5, '*accuracy': 2,
                            '*minPhysicalDamage': .8, '*maxPhysicalDamage': .8, '*attackSpeed': .5, '*weaponMagicDamage': .5,
                            '*block': 0, '*armor': .5, '*magicBlock': 1.5, '*magicResist': 0.1,
                            '*speed': .8}, 'tags': ['ranged'],
        'abilities': [abilities.summonCaterpillar, abilities.summoner]
    });
    addMonster('lightningBug', {'name': 'Lightning Bug', 'source': butterflySource, 'fpsMultiplier': 4,
        'implicitBonuses': {'*maxHealth': 1.5, '+weaponRange': 4, '+critChance': .05, '+critDamage': .1, '+critAccuracy': .5, '*accuracy': 2,
                            '*minPhysicalDamage': .8, '*maxPhysicalDamage': .8, '*attackSpeed': .5, '*weaponMagicDamage': .5,
                            '*block': 0, '*armor': .5, '*magicBlock': 1.5, '*magicResist': 0.1,
                            '*speed': .8}, 'tags': ['ranged'],
        'abilities': [abilities.storm]
    });
    addMonster('giantSkeleton', {'name': 'Skelegiant', 'source': skeletonGiantSource,
        'implicitBonuses': {'*maxHealth': 2, '+critDamage': .5, '*weaponMagicDamage': 0, '*accuracy': 2,
                            '*evasion': .5, '*block': 0, '*armor': .5, '*magicBlock': 0.1, '*magicResist': 0.1}
    });
    addMonster('skeletonOgre', {'name': 'Skeleton Ogre', 'source': skeletonGiantSource,
        'implicitBonuses': {'*maxHealth': 3, '+critDamage': .5, '*weaponMagicDamage': 0, '*accuracy': 2,
                            '*evasion': .5, '*block': 0, '*armor': .5, '*magicBlock': 0.1, '*magicResist': 0.1},
        'abilities': [abilities.hook, abilities.hookRange, abilities.hookStun, abilities.dodge, abilities.acrobatics, abilities.acrobatics, abilities.dodgeHook, abilities.deflect]
    });
    addMonster('butcher', {'name': 'Butcher', 'source': skeletonGiantSource,
        'implicitBonuses': {'*maxHealth': 3, '+critDamage': .5, '*weaponMagicDamage': 0, '*accuracy': 2,
                            '*evasion': .5, '*block': 0, '*armor': .5, '*magicBlock': 0.1, '*magicResist': 0.1},
        'abilities': [abilities.hook]
    });
    addMonster('frostGiant', {'name': 'Frost Giant', 'source': skeletonGiantSource,
        'implicitBonuses': {'*maxHealth': 2, '+critDamage': .5, '*weaponMagicDamage': 0, '*accuracy': 2,
                            '*evasion': .5, '*block': 0, '*armor': .5, '*magicBlock': 0.1, '*magicResist': 0.1},
        'abilities': [abilities.freeze]
    });
    addMonster('dragon', {'name': 'Dragon', 'source': dragonSource, 'stationary': true, // speed still effects animation
        'implicitBonuses': {'*maxHealth': 1.6, '+weaponRange': 12, '+critChance': .15, '*accuracy': 2,
                            '*evasion': .5, '*block': 0, '*armor': .5, '*magicBlock': 2, '+magicResist': .5,
                            '*speed': 2, '*scale': 2}, 'tags': ['ranged'],
        'abilities': [abilities.fireball, abilities.sideStep]
    });
}

export function getMonsterDefinitionAreaEntity(this: void, area: Area, monsterDefinition: MonsterDefinition): AreaEntity {
    const data: MonsterData = monsters[monsterDefinition.key];
    const frame: Frame = data.source.idleAnimation.frames[0];
    let {w, h, d} = (frame.content || frame);
    d = d || frame.d || frame.w;
    return {
        area,
        ...getPositionFromLocationDefinition(area, {w, h, d}, monsterDefinition.location),
        w, h, d,
    };
}

if (window.location.search.substr(1) === 'test') {
    map['testLevelData'] = {
        name: "Test Area", description: "Area for testing monsters", background: "cave", unlocks: [], coords: [-443,-152,-375],
        minMonstersPerArea: 2, maxMonstersPerArea: 2,
        testArea: true,
        level: 2,
        enemySkills: [],
        monsters: ['snowWolf'],
        events: [
            ['frostBite'],
        ]
    };
}

