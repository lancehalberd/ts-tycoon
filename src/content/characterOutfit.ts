
// import JobKey from 'app/types';
// import Random.element()

/*
TODO: merge this file into bigger project
remove JobKey definition and include import line
*/

type JobKey = 'fool' |
    'blackbelt' | 'warrior' | 'samurai' |
    'juggler' | 'ranger' | 'sniper' |
    'priest' | 'wizard' | 'sorcerer' |
    'corsair' | 'assassin' | 'ninja' |
    'dancer' | 'bard' | 'sage' |
    'paladin' | 'darkknight' | 'enhancer' |
    'master';

interface ClothesColors {
    bandanaColor?: string,
    shoeColor: string,
    shortsColor: string,
    shirtColor: string,
    scarfColor: string,
}

const forestCostume = {
        bandanaColor: null,
        shoeColor: '#81746c',
        shortsColor: '#994539',
        shirtColor: '#475732',
        scarfColor: '#cdc6a5',
}; // ranger
const sportyCostume = {
        bandanaColor: '#d8cbc7',
        shoeColor: '#34b233',
        shortsColor: '#000000',
        shirtColor: '#4aacd3',
        scarfColor: '#f4660e',
}; // master
const raspberryCostume = {
        bandanaColor: null,
        shoeColor: '#003049',
        shortsColor: '#06bee1',
        shirtColor: '#d12a98',
        scarfColor: '#fcbf49',
}; // fool
const happyCostume = {
        bandanaColor: null,
        shoeColor: '#e2414c',
        shortsColor: '#f76c6c',
        shirtColor: '#d8c90e',
        scarfColor: '#a5ca23',
}; // fool
const skyCostume = {
        bandanaColor: '#c3d6f2',
        shoeColor: '#789cce',
        shortsColor: '#c6bcf2',
        shirtColor: '#000092',
        scarfColor: '#3bcbdc',
}; // priest
const tropicalIslandCostume = {
        bandanaColor: null,
        shoeColor: '#2f97c1',
        shortsColor: '#31d1e0',
        shirtColor: '#077c28',
        scarfColor: '#f2ea60',
}; // fool
const partyCostume = {
        bandanaColor: '#1be7ff',
        scarfColor: '#6eeb83',
        shirtColor: '#e4ff1a',
        shoeColor: '#ffb800',
        shortsColor: '#ff5714',
}; // juggler
const seaBreezeCostume = {
        bandanaColor: '#c3f73a',
        scarfColor: '#95e06c',
        shirtColor: '#68b684',
        shoeColor: '#094d92',
        shortsColor: '#1c1018',
}; // sage
const pastelDreamCostume = {
        bandanaColor: '#d4afb9',
        scarfColor: '#d1cfe2',
        shirtColor: '#9cadce',
        shoeColor: '#7ec4cf',
        shortsColor: '#52b2cf',
}; // bard
const roseBushCostume = {
        bandanaColor: null,
        scarfColor: '#5e0035',
        shirtColor: '#950952',
        shoeColor: '#023618',
        shortsColor: '#005c69',
}; // assassin
const silverKnightCostume = {
        bandanaColor: null,
        scarfColor: '#554640',
        shirtColor: '#cde6f5',
        shoeColor: '#8da7be',
        shortsColor: '#707078',
}; // paladin
const tennisProCostume = {
        bandanaColor: '#031d44',
        scarfColor: '#04395e',
        shirtColor: '#70a288',
        shoeColor: '#dab785',
        shortsColor: '#d5896f',
}; // corsair
const fieldsOfIrisCostume = {
        bandanaColor: '#b3c2f2',
        scarfColor: '#735cdd',
        shirtColor: '#9000b3',
        shoeColor: '#7e007b',
        shortsColor: '#37000a',
}; // dancer
const desertCamoCostume = {
        bandanaColor: null,
        scarfColor: '#9da9a0',
        shirtColor: '#654c4f',
        shoeColor: '#b26e63',
        shortsColor: '#cec075',
}; // sniper
const oceanWavesCostume = {
        bandanaColor: '#011627',
        scarfColor: '#fdfffc',
        shirtColor: '#53a2be',
        shoeColor: '#132e32',
        shortsColor: '#176087',
}; // wizard
const elfinCostume = {
        bandanaColor: '#daddd8',
        scarfColor: '#c7d59f',
        shirtColor: '#b7ce63',
        shoeColor: '#8fb339',
        shortsColor: '#4b5842',
}; // ranger
const salmonSeaCostume = {
        bandanaColor: '#fffaff',
        scarfColor: '#3e92cc',
        shirtColor: '#0a2463',
        shoeColor: '#1e1b18',
        shortsColor: '#d8315b',
}; // enhancer
const trackAndFieldCostume = {
        bandanaColor: '#221d23',
        scarfColor: '#4f3824',
        shirtColor: '#d1603d',
        shoeColor: '#ddb967',
        shortsColor: '#d0e37f',
}; // juggler
const brightBrunchCostume = {
        bandanaColor: null,
        scarfColor: '#ef767a',
        shirtColor: '#456990',
        shoeColor: '#49dcb1',
        shortsColor: '#eeb868',
}; // bard
const gryffindorCostume = {
        bandanaColor: null,
        scarfColor: '#ffc07f',
        shirtColor: '#a5402d',
        shoeColor: '#f15156',
        shortsColor: '#721121',
}; // blackbelt
const stormySkyCostume = {
        bandanaColor: null,
        scarfColor: '#d5dcf9',
        shirtColor: '#443627',
        shoeColor: '#725e54',
        shortsColor: '#a7b0ca',
}; // darkknight
const magicalCostume = {
        bandanaColor: null,
        scarfColor: '#c95d63',
        shirtColor: '#ae8799',
        shoeColor: '#717ec3',
        shortsColor: '#496ddb',
}; // sorcerer
const deepForestShadeCostume = {
        bandanaColor: null,
        scarfColor: '#516856',
        shirtColor: '#263833',
        shoeColor: '#0b1111',
        shortsColor: '#030405',
}; // ninja
const deepRoyaltyCostume = {
        bandanaColor: '#bc9703',
        scarfColor: '#6d1107',
        shirtColor: '#3a0028',
        shoeColor: '#0a5655',
        shortsColor: '#013459',
}; // samurai
const mutedStrengthCostume = {
        bandanaColor: null,
        scarfColor: '#c57b57',
        shirtColor: '#251605',
        shoeColor: '#f7dba7',
        shortsColor: '#9cafb7',
}; // warrior
const azureGloryCostume = {
        bandanaColor: '#a0ddff',
        scarfColor: '#758ecd',
        shirtColor: '#c1cefe',
        shoeColor: '#7189ff',
        shortsColor: '#624cab',
}; // sorcerer
const savannahCostume = {
        bandanaColor: '#a7cecb',
        scarfColor: '#8ba6a9',
        shirtColor: '#75704e',
        shoeColor: '#cacc90',
        shortsColor: '#f4ebbe',
}; // assassin
const pastelPirateCostume = {
        bandanaColor: '#dab6c4',
        scarfColor: '#7b886f',
        shirtColor: '#b4dc7f',
        shoeColor: '#feffa5',
        shortsColor: '#ffa0ac',
}; // corsair
const safetyOrangeSkiesCostume = {
        bandanaColor: '#a8dcd1',
        scarfColor: '#65def1',
        shirtColor: '#dce2c8',
        shoeColor: '#f96900',
        shortsColor: '#f17f29',
}; // master
const orchidTeaCostume = {
        bandanaColor: '#493657',
        scarfColor: '#ce7da5',
        shirtColor: '#bee5bf',
        shoeColor: '#dff3e3',
        shortsColor: '#ffd1ba',
}; // bard
const sunnySideUpCostume = {
        bandanaColor: '#2d3047',
        scarfColor: '#e84855',
        shirtColor: '#fffd82',
        shoeColor: '#1b998b',
        shortsColor: '#ff9b71',
}; // juggler

const jobColors: {[key in JobKey]: ClothesColors[]} = {
    fool: [raspberryCostume, tropicalIslandCostume, happyCostume],
    // Strength
    blackbelt: [gryffindorCostume],
    warrior: [mutedStrengthCostume],
    samurai: [deepRoyaltyCostume],
    // Dexterity
    juggler: [partyCostume, sunnySideUpCostume],
    ranger: [forestCostume],
    sniper: [desertCamoCostume],
    // Intelligence
    priest: [skyCostume],
    wizard: [oceanWavesCostume],
    sorcerer: [magicalCostume, azureGloryCostume],
    // Strength+Dexterity
    corsair: [tennisProCostume],
    assassin: [roseBushCostume, savannahCostume],
    ninja: [deepForestShadeCostume],
    // Dexterity+Intelligence
    dancer: [fieldsOfIrisCostume],
    bard: [pastelDreamCostume, brightBrunchCostume, orchidTeaCostume],
    sage: [seaBreezeCostume],
    // Intelligence+Strength
    paladin: [silverKnightCostume],
    darkknight: [stormySkyCostume],
    enhancer: [salmonSeaCostume],
    // All
    master: [safetyOrangeSkiesCostume, sportyCostume],
};
/* for testing in browser
let jobTestColors = {};

jobTestColors = {
    fool: [raspberryCostume, tropicalIslandCostume, happyCostume],
    // Strength
    blackbelt: [gryffindorCostume],
    warrior: [mutedStrengthCostume],
    samurai: [deepRoyaltyCostume],
    // Dexterity
    juggler: [partyCostume, sunnySideUpCostume],
    ranger: [forestCostume],
    sniper: [desertCamoCostume],
    // Intelligence
    priest: [skyCostume],
    wizard: [oceanWavesCostume],
    sorcerer: [magicalCostume, azureGloryCostume],
    // Strength+Dexterity
    corsair: [tennisProCostume],
    assassin: [roseBushCostume, savannahCostume],
    ninja: [deepForestShadeCostume],
    // Dexterity+Intelligence
    dancer: [fieldsOfIrisCostume],
    bard: [pastelDreamCostume, brightBrunchCostume, orchidTeaCostume],
    sage: [seaBreezeCostume],
    // Intelligence+Strength
    paladin: [silverKnightCostume],
    darkknight: [stormySkyCostume],
    enhancer: [salmonSeaCostume],
    // All
    master: [safetyOrangeSkiesCostume, sportyCostume],
};
*/

export function createHeroOutfitColors(jobKey: JobKey) {
    return Random.element(jobColors[jobKey]);
}
