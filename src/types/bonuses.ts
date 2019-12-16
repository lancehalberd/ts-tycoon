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

export interface BonusSource extends Partial<Ability> {
    // We often include things that could have bonuses but don't.
    // For those we just ignore them.
    // bonuses?: Bonuses,
    // This will get cached on the bonus source.
    parsedBonuses?: Bonus[],
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
    variableObjectType: string,
    tags?: string[],
    bonuses?: Bonuses,
    actor?: Actor,
}
export interface VariableObject {
    core: VariableObject,
    base: VariableObjectBase,
    tags: Tags,
    bonusSources: BonusSource[],
    bonusesByTag: {[key: string]: Bonus[]},
    bonusesDependingOn: {[key: string]: {object: VariableObject, bonus: Bonus}[]},
    allBonuses: Bonus[],
    dirtyStats: {[key: string]: true},
    variableChildren: VariableObject[],
    // This only gets set on effects
    bonuses?: Bonuses,
    operations: any,
    stats: ActionStats | ActorStats | GuildStats,
}

export interface ActorStats {
    level?: number,
    levelCoefficient?: number
    dexterity?: number,
    strength?: number,
    intelligence?: number,
    maxHealth?: number,
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
    buff?: any,
    debuff?: any,
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
    instantCooldown?: boolean,
    pullsTarget?: boolean,
    undodgeable?: boolean,
    dodge?: boolean,
    healthSacrifice?: number,
    // Specifically for fireball.
    explode?: number,
}

export interface GuildStats {
    maxAnima?: number,
    maxCoins?: number,
    maxHeroes?: number,
    hasMap?: boolean,
    hasItemCrafting?: boolean,
    hasJewelCrafting?: boolean,
}
