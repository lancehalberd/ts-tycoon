const arm = 1;
const hand = 1;
const body = 0;
const head = 0;
const feet = 2;
const legs = 2;

// equipmentSource function must be declared before the contents of: armor.js, weapons.js, accessories.js
function equipmentSource(column, row) {
    return {'xOffset': column * 32, 'yOffset': row * 64}
}
export const equipmentSources = {
    // Pirate <3
    'strawHat': equipmentSource(head, 2),
    'vest': equipmentSource(body, 3),
    'shorts': equipmentSource(legs, 2),
    'sandals': equipmentSource(feet, 3),
    // Knight
    'heavyHelmet': equipmentSource(head, 1),
    'heavyShirt': equipmentSource(body, 0),
    'heavySleeves': equipmentSource(arm, 0),
    'heavyPants': equipmentSource(legs, 0),
    'heavyBoots': equipmentSource(feet, 1),
    // Wizard
    'wizardHat': equipmentSource(head, 9),
    'wizardRobe': equipmentSource(body, 10),
    'wizardSleeves': equipmentSource(arm, 10),
    'wizardPants': equipmentSource(legs, 9),
    'wizardSandals': equipmentSource(feet, 10),
    // Peter Pan
    'featherCap': equipmentSource(head, 12),
    'leatherVest': equipmentSource(body, 13),
    'leatherLongGloves': equipmentSource(arm, 12),
    'leatherPants': equipmentSource(legs, 12),
    'leatherBoots': equipmentSource(feet, 13),
    // Chainmail
    'chainmailHelm': equipmentSource(head, 17),
    'chainmailShirt': equipmentSource(body, 18),
    'chainmailSleeves': equipmentSource(arm, 18),
    'chainmailSkirt': equipmentSource(legs, 17),
    'chainmailGloves': equipmentSource(hand, 17),
    // Robes
    'blueRobe': equipmentSource(body, 6),
    'purpleRobe': equipmentSource(body, 7),
    // Other Hats
    'devilHelmet': equipmentSource(head, 4),
    'oversizedHelmet': equipmentSource(head, 5),
    'hood': equipmentSource(head, 14),
    // Other Shoes
    'redShoes': equipmentSource(feet, 5),
    // Other Gloves
    'leatherGloves': equipmentSource(hand, 6),
    // Accesories
    'bracelet': equipmentSource(hand, 1),
    'ring': equipmentSource(hand, 11),
};
