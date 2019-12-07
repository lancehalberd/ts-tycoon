import { ifdefor } from 'app/utils';

type ExtendedAudio = HTMLAudioElement & {
    [key: string]: any
};

const sounds = new Map();
let numberOfSoundsLeftToLoad = 0;
let soundsMuted = false;

export function requireSound(fullSource:string):ExtendedAudio | {play: Function} {
    let source, offset, volume, customDuration;
    [source, offset, volume] = fullSource.split('+');
    if (offset) [offset, customDuration] = offset.split(':');

    if (sounds.has(source)) return sounds.get(source);
    var newSound:ExtendedAudio = new Audio(source);
    newSound.instances = new Set();
    newSound.offset = offset || 0;
    newSound.customDuration = customDuration || 0;
    newSound.defaultVolume = volume || 1;
    sounds.set(source, newSound);
    /*numberOfSoundsLeftToLoad++;
    console.log('loading: ' + source);
    newSound.oncanplaythrough = () => {
        numberOfSoundsLeftToLoad--;
        console.log('loaded: ' + source);
    };*/
    return newSound;
}

export function areAllSoundsLoaded() {
    return numberOfSoundsLeftToLoad <= 0;
}

function playSound(source, area) {
    if (soundsMuted || state.selectedCharacter.hero.area !== area ) return;
    var source, offset,volume, customDuration;
    [source, offset, volume] = source.split('+');
    if (offset) [offset, customDuration] = offset.split(':');
    const sound = requireSound(source);
    // Custom sound objects just have a play and forget method on them.
    if (!(sound instanceof Audio)) {
        sound.play();
        return;
    }
    if (sound.instances.size >= 5) return;
    const newInstance = sound.cloneNode(false) as HTMLAudioElement;
    newInstance.currentTime = (ifdefor(offset, sound.offset) || 0) / 1000;
    newInstance.volume = Math.min(1, (ifdefor(volume, sound.defaultVolume) || 1) / 50);
    newInstance.play().then(() => {
        let timeoutId;
        if (customDuration || sound.customDuration) {
            timeoutId = setTimeout(() => {
                sound.instances.delete(newInstance);
                newInstance.onended = null;
                newInstance.pause();
            }, parseInt(customDuration || sound.customDuration));
        }
        sound.instances.add(newInstance);
        newInstance.onended = () => {
            sound.instances.delete(newInstance);
            newInstance.onended = null;
            clearTimeout(timeoutId);
        }
    });
}

var previousTrack = null;
function playTrack(source) {
    if (soundsMuted) return;
    var source, offset, volume;
    [source, offset, volume] = source.split('+');
    if (previousTrack) {
        previousTrack.stop();
    }
    const sound = requireSound(source);
    if (!(sound instanceof Audio)) {
        sound.play();
        return;
    }
    sound.currentTime = ifdefor(offset, sound.offset || 0) / 1000;
    sound.volume = Math.min(1, ifdefor(volume, sound.defaultVolume || 1) / 50);
    sound.play();
    previousTrack = sound;
}

[
    // Original sounds using bfxr
    'sounds/bfxr/strum.wav+0+10', 'sounds/bfxr/freeze.wav+0+10',
    // See credits.html for: Pack: Melee Attack by Unfa.
    'sounds/unfa/melee1.flac+200+10', 'sounds/unfa/melee2.flac', 'sounds/unfa/melee3.flac',
    // See credits.html for: Negative Magic Spell by Iwan Gabovitch.
    'sounds/fireball.flac',
    // See credits.html for: Pack: Sword Sounds by 32cheeseman32.
    'sounds/cheeseman/arrow.wav+0+50', 'sounds/cheeseman/sword.wav', 'sounds/cheeseman/arrowHit.wav+300:100',
    // See credits.html for: Laser Fire by dklon.
    'sounds/laser.wav',
    // See credits.html for: mobbrobb.
    'music/mobbrobb/map.mp3+0+.5',
].forEach(requireSound);

var attackSounds = {
    unarmed: 'sounds/unfa/melee1.flac',
    fist: 'sounds/unfa/melee1.flac',
    staff: 'sounds/unfa/melee1.flac',
    bow: 'sounds/cheeseman/arrow.wav',
    throwing: 'sounds/cheeseman/arrow.wav',
    axe: 'sounds/cheeseman/sword.wav',
    polearm: 'sounds/cheeseman/sword.wav',
    dagger: 'sounds/cheeseman/sword.wav',
    sword: 'sounds/cheeseman/sword.wav',
    greatsword: 'sounds/cheeseman/sword.wav',
    wand: 'wand',
};

var attackHitSounds = {
    bow: 'sounds/cheeseman/arrowHit.wav',
    throwing: 'sounds/cheeseman/arrowHit.wav',
};

var soundTrack = {
    map: 'music/mobbrobb/map.mp3',
};


var audioContext = new AudioContext();

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
var distortionCurve = makeDistortionCurve(100);

function playBeeps(frequencies, volume, duration, {smooth=false, swell=false, taper=false, distortion=false}) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    if (smooth) oscillator.frequency.setValueCurveAtTime(frequencies, audioContext.currentTime, duration);
    else {
        for (var i = 0; i < frequencies.length; i++) {
            oscillator.frequency.setValueAtTime(frequencies[i], audioContext.currentTime + duration * i / frequencies.length);
        }
    }
    let lastNode:AudioNode = oscillator;
    if (distortion) {
        const distortionNode = audioContext.createWaveShaper();
        distortionNode.curve = distortionCurve;
        distortionNode.oversample = '4x';
        lastNode.connect(distortionNode);
        lastNode = distortionNode;
    }

    const gainNode = audioContext.createGain();
    if (swell) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + duration * .1);
    } else {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }
    if (taper) {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + duration * .9);
        // gainNode.gain.setTargetAtTime(0, audioContext.currentTime, duration / 10);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    }
    lastNode.connect(gainNode);
    lastNode = gainNode;


    lastNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

sounds.set('reflect', {
    play() {
        playBeeps([2000, 8000, 4000], .01, .1, {});
    }
});
sounds.set('wand', {
    play() {
        playBeeps([1200, 400], 0.01, .1, {smooth: true, taper: true, swell: true, distortion: true});
    }
})

