import { Ability, Actor, Color, Effect, Tags } from 'app/types';

export type BonusOperator = '+' | '-' | '%' | '*' | '/' | '&' | '$';

type BonusTag = string;
type StatVariable = string;
export type BonusValue = true | number | string |
    Effect |
    [BonusValue] | [BonusOperator, BonusValue] | [BonusValue, BonusOperator, BonusValue];
type BonusDependencies = {[key in string]: true};

export interface Bonuses {
    [key: string]: BonusValue,
}
export interface BonusesRange {
    [key: string]: true | string | number | [number, number] | [number, number, number],
}

export type VariableObjectType = 'actor' | 'action' | 'effect' | 'guild' | 'trigger';

export interface BonusSource extends Partial<Ability> {
    // We often include things that could have bonuses but don't.
    // For those we just ignore them.
    // bonuses?: Bonuses,
    // This will get cached on the bonus source.
    parsedBonuses?: Bonus[],
    hasImplicitBonuses?: boolean,
    variableObjectType?: VariableObjectType,
    restrictions?: string[],
}

export interface Bonus {
    operator: BonusOperator,
    shortHand: string,
    statDependencies: BonusDependencies,
    stats: StatVariable[],
    tags: BonusTag[],
    value: BonusValue,
}
export interface VariableObjectBase {
    variableObjectType: VariableObjectType,
    tags?: string[],
    bonuses?: Bonuses,
    actor?: Actor,
}
export interface UntypedVariableObject {
    core: VariableObject,
    base: VariableObjectBase,
    tags: Tags,
    bonusSources: BonusSource[],
    bonusesByTag: {[key: string]: Bonus[]},
    bonusesDependingOn: {[key: string]: {object: VariableObject, bonus: Bonus}[]},
    allBonuses: Bonus[],
    dirtyStats: {[key: string]: true},
    variableChildren: VariableObject[],
    operations: any,
}
export interface ActorVariableObject extends UntypedVariableObject {
    type: 'actor',
    stats: ActorStats,
}
export interface ActionVariableObject extends UntypedVariableObject {
    type: 'action',
    stats: ActionStats,
}
export interface TriggerVariableObject extends UntypedVariableObject {
    type: 'trigger',
    stats: TriggerStats,
}
export interface GuildVariableObject extends UntypedVariableObject {
    type: 'guild',
    stats: GuildStats,
}
export interface EffectVariableObject extends UntypedVariableObject {
    type: 'effect',
    stats: EffectStats,
    bonuses?: Bonuses,
}

export type VariableObject = ActorVariableObject
    | ActionVariableObject | GuildVariableObject
    | EffectVariableObject | TriggerVariableObject;

export interface ActorStats {
    level?: number,
    levelCoefficient?: number
    dexterity?: number,
    strength?: number,
    intelligence?: number,
    maxHealth?: number,
    bonusMaxHealth?: number,
    healthRegen?: number,
    tenacity?: number,
    speed?: number,
    magicPower?: number,
    // These stats are used as input into the actual range/damage stats on abilities/attacks.
    // For example spells use magicPower as input to damage, which is intelligence + average weaponMagicDamage.
    minWeaponPhysicalDamage?: number,
    maxWeaponPhysicalDamage?: number,
    minWeaponMagicDamage?: number,
    maxWeaponMagicDamage?: number,
    weaponRange?: number,
    // defensive stats
    evasion?: number,
    block?: number,
    magicBlock?: number,
    armor?: number,
    magicResist?: number,
    // special traits
    cloaking?: boolean,
    overHeal?: number,
    increasedDrops?: number,
    reducedDivinityCost?: number,
    equipmentMastery?: boolean,
    invulnerable?: boolean,
    maxBlock?: number,
    maxMagicBlock?: number,
    maxEvasion?: number,
    uncontrollable?: boolean,
    twoToOneHanded?: boolean,
    overHealReflection?: number,
    healOnCast?: number,
    castKnockBack?: number,
    // Used by Throwing Paradigm Shift which turns throwing weapons into melee weapons.
    setRange?: 'melee' | 'ranged',
    cannotAttack?: boolean,
    healingAttacks?: boolean,
    imprintSpell?: boolean,
    // tracked for debuffs that deal damage over time
    damageOverTime?: number,
    // For enemy loot and color
    coins?: number,
    anima?: number,
    lifeBarColor?: Color,
    scale?: number,
    tint?: Color,
    tintMaxAlpha?: number,
    tintMinAlpha?: number,
}

export interface ActionStats {
    accuracy?: number,
    range?: number,
    attackSpeed?: number,
    minPhysicalDamage?: number,
    maxPhysicalDamage?: number,
    minMagicDamage?: number,
    maxMagicDamage?: number,
    critChance?: number,
    critDamage?: number,
    critAccuracy?: number,
    prepTime?: number,
    recoveryTime?: number,
    // common skill stats
    cooldown?: number,
    power?: number,
    duration?: number,
    area?: number,
    buff?: EffectVariableObject,
    allyBuff?: EffectVariableObject,
    debuff?: EffectVariableObject,
    globalDebuff?: EffectVariableObject,
    // Applies to indirectly hit enemies by banish.
    otherDebuff?: EffectVariableObject,
    // various effects on hit
    poison?: number,
    damageOnMiss?: number,
    slowOnHit?: number,
    healthGainOnHit?: number,
    cleave?: number,
    cleaveRange?: number,
    knockbackChance?: number,
    knockbackDistance?: number,
    knockbackRotation?: number,
    cull?: number,
    armorPenetration?: number,
    instantCooldownChance?: number,
    // special flags
    heals?: boolean,
    magicToPhysical?: boolean,
    alwaysHits?: boolean
    chaining?: boolean,
    criticalPiercing?: boolean,
    domino?: boolean,
    doubleStrike?: boolean,
    firstStrike?: boolean,
    ignoreArmor?: boolean,
    ignoreResistance?: boolean,
    // The string pattern indicates which skills are put on cooldown, either a tag or '*' for all other skills.
    instantCooldown?: string,
    pullsTarget?: boolean,
    undodgeable?: boolean,
    dodge?: boolean,
    healthSacrifice?: number,
    // Specifically for fireball.
    explode?: number,
    chance?: number,
    teleport?: number,
    // number of prefixes to steal for plunder, for instance.
    count?: number,
    rangeDamage?: number, // hook does more damage at further range.
    lifeSteal?: number,
    stun?: number,
    dragStun?: number,
    dragDamage?: number,
    consumeRatio?: number,
    limit?: number, // For example, max summoned skeletons
    distance?: number, // Dodger distance.
    moveDuration?: number, // How fast to dodge.
    dodgeAttack?: boolean,
    stopAttack?: boolean,
    damageRatio?: number,
    purify?: boolean, // Tiggers affix removal for banish
    shockwave?: boolean,
    uses?: number, // How many times a monster can use the recovery ability.
    action?: string, // Key for a follow up action for leapAndAct
    areaCoefficient?: number,
    hitsPerSecond?: number, // Used by the storm ability.
    speedBonus?: number, // speed multiplier when charging.
}

export interface GuildStats {
    maxAnima?: number,
    maxCoins?: number,
    maxHeroes?: number,
    hasMap?: boolean,
    hasItemCrafting?: boolean,
    hasJewelCrafting?: boolean,
}

export interface EffectStats {
    area?: number,
    duration?: number | 'forever',
    maxStacks?: number,
}

export interface TriggerStats {
    debuff: EffectVariableObject,
}
