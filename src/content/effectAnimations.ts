import { makeFrames, requireImage, undoFrames } from 'app/images';
import { createAnimation } from 'app/utils/animations';

import { FrameAnimation } from 'app/types';

export const effectAnimations = {
    explosion: createAnimation('gfx/effects/explosion.png', {w: 96, h: 96}, {cols: 5}),
        //endFrames: makeFrames(7, [96, 96], [5 * 96, 0], 0, 3),
        // The graphic doesn't fill the frame, so it must be scaled this much to match a given size.
        //scale: 1.5,
    heal: createAnimation('gfx/effects/heal.png', {w: 64, h: 64}, {cols: 6}),
    song: createAnimation('gfx/effects/musicNote.png', {w: 30, h: 60}, {cols: 15}),
    cast: createAnimation('gfx/effects/greenRune.png', {w: 64, h: 32}, {cols: 4, top: 16}),
    blueRune: createAnimation('gfx/effects/blueRune.png', {w: 64, h: 32}, {cols: 4, top: 16}),
    freeze: [
        createAnimation('gfx/effects/freeze.png', {w: 64, h: 58}, {cols: 4, frameMap: [0, 1, 2, 3, 2, 1, 0]}),
        createAnimation('gfx/effects/freeze.png', {w: 64, h: 58}, {cols: 4, x: 4, frameMap: [0, 1, 2, 3, 2, 1, 0]}),
        createAnimation('gfx/effects/freeze.png', {w: 64, h: 58}, {cols: 4, x: 8, frameMap: [0, 1, 2, 3, 2, 1, 0]}),
    ],
};
