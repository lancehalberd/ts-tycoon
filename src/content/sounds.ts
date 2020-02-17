import { requireSound } from 'app/utils/sounds';

let soundsToLoad = 0;
export function preloadSounds() {
    [
        // Original sounds using bfxr
        {key: 'strum', source: 'sounds/bfxr/strum.wav', volume: 10},
        {key: 'freeze', source: 'sounds/bfxr/freeze.wav', volume: 10},
        // See credits.html for: Pack: Melee Attack by Unfa.
        {key: 'melee1', source: 'sounds/unfa/melee1.flac', offset: '200', volume: 10},
        {key: 'melee2', source: 'sounds/unfa/melee2.flac'},
        {key: 'melee3', source: 'sounds/unfa/melee3.flac'},
        // See credits.html for: Negative Magic Spell by Iwan Gabovitch.
        {key: 'fireball', source: 'sounds/fireball.flac'},
        // See credits.html for: Pack: Sword Sounds by 32cheeseman32.
        {key: 'arrow', source: 'sounds/cheeseman/arrow.wav', volume: 50},
        {key: 'sword', source: 'sounds/cheeseman/sword.wav'},
        {key: 'arrowHit', source: 'sounds/cheeseman/arrowHit.wav', offset: '300:100'},
        // See credits.html for: Laser Fire by dklon.
        {key: 'laser', source: 'sounds/laser.wav'},
        // See credits.html for: mobbrobb.
        {key: 'map', source: 'music/mobbrobb/map.mp3', volume: 0.5},
    ].forEach(soundSource => {
        soundsToLoad++;
        requireSound(soundSource, () => soundsToLoad--);
    });
};

export function areSoundsPreloaded() {
    return soundsToLoad <= 0;
}

export const attackSounds = {
    unarmed: 'melee1',
    fist: 'melee1',
    staff: 'melee1',
    bow: 'arrow',
    throwing: 'arrow',
    axe: 'sword',
    polearm: 'sword',
    dagger: 'sword',
    sword: 'sword',
    greatsword: 'sword',
    wand: 'wand',
};

export const attackHitSounds = {
    bow: 'arrowHit',
    throwing: 'arrowHit',
};
