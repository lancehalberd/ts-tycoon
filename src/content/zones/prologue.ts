import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const prologue = 'prologue';

const entrance: AreaDefinition = {
    type: 'forest',
    width: 500,
    layers: [
        {
            key: 'floor', x: 0, y: 84,
            objects: [
            ],
            grid: {
                palette: 'meadowFloor', w: 16, h: 3,
                tiles: [[{x:5,y:0},{x:1,y:0},{x:4,y:0},{x:2,y:0},{x:3,y:0},{x:0,y:0},{x:5,y:0},{x:3,y:0},{x:5,y:0},{x:1,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:2,y:0},{x:5,y:0}],[{x:1,y:0},{x:1,y:0},{x:3,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:0,y:0},{x:3,y:0},{x:4,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0}],[{x:2,y:0},{x:5,y:0},{x:5,y:0},{x:2,y:0},{x:5,y:0},{x:1,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:0,y:0},{x:0,y:0},{x:4,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:0},{x:5,y:0}]],
            },
        },
        {
            key: 'background', x: 0, y: 0,
            objects: [
            ],
            grid: {
                palette: 'meadowBackground', w: 2, h: 1,
                tiles: [[{x:1,y:0},{x:0,y:0}]],
            },
        },
        {
            key: 'field', x: 0, y: 84,
            objects: [
            ],
        },
        {
            key: 'foreground', x: 0, y: 148,
            objects: [
            ],
            grid: {
                palette: 'meadowForeground', w: 4, h: 1,
                tiles: [[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]],
            },
        },
    ],
};

zones.prologue = {
    entrance,
};
