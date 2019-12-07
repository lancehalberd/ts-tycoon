import { makeFrames, requireImage, undoFrames } from 'app/images';

export const effectAnimations ={
    explosion: {image: requireImage('gfx/effects/explosion.png'),
        frames: makeFrames(5, [96, 96], [0, 0], 0, 3),
        endFrames: makeFrames(7, [96, 96], [5 * 96, 0], 0, 3),
        // The graphic doesn't fill the frame, so it must be scaled this much to match a given size.
        scale: 1.5},
    heal: {image: requireImage('gfx/effects/heal.png'), frames: makeFrames(6, [64, 64], [0, 0], 0, 3)},
    song: {image: requireImage('gfx/effects/musicNote.png'), frames: makeFrames(15, [30, 60])},
    cast: {image: requireImage('gfx/effects/greenRune.png'), frames: makeFrames(4, [64, 32], [0, 16])},
    blueRune: {image: requireImage('gfx/effects/blueRune.png'), frames: makeFrames(4, [64, 32], [0, 16])},
    freeze: [
        {image: requireImage('gfx/effects/freeze.png'), frames: undoFrames(makeFrames(4, [64, 58], [0, 0]))},
        {image: requireImage('gfx/effects/freeze.png'), frames: undoFrames(makeFrames(4, [64, 58], [0, 64]))},
        {image: requireImage('gfx/effects/freeze.png'), frames: undoFrames(makeFrames(4, [64, 58], [0, 128]))}
    ],
};
