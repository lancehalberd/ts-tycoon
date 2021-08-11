import { createAnimation } from 'app/utils/animations';

const [
    cape,
    cloak,
    quiver,
    scabbard,
    ironBand,
    goldBand,
    rubyRing,
    woolShirt,
    clothTunic,
    lamellar,

    sandals,
    leatherShoes,
    bambooSabatons,
    mittens,
    leatherBracelets,
    bambooVambraces,
    strawHat,
    leatherCap,
    oversizedHelmet,
    shorts,

    leatherKilt,
    bambooSkirt,
    woodenBoard,
    woodenBowl,
    hatchet,
    gladius,
    pugio,
    rock,
    stick,
    ball,

    primitiveBow,
    balsaStaff,
    pickaxe,
    copperClaymore,
] = createAnimation('gfx2/hud/items.png', {w: 16, h: 16}, {cols: 34}).frames;

export const equipmentIcons = {
    cape,
    cloak,
    quiver,
    scabbard,
    ironBand,
    goldBand,
    rubyRing,
    woolShirt,
    clothTunic,
    lamellar,

    sandals,
    leatherShoes,
    bambooSabatons,
    mittens,
    leatherBracelets,
    bambooVambraces,
    strawHat,
    leatherCap,
    oversizedHelmet,
    shorts,

    leatherKilt,
    bambooSkirt,
    woodenBoard,
    woodenBowl,
    hatchet,
    gladius,
    pugio,
    rock,
    stick,
    ball,

    primitiveBow,
    balsaStaff,
    pickaxe,
    copperClaymore,
};