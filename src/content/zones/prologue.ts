import { zones } from 'app/content/zones';

import { AreaDefinition } from 'app/types';

export const prologue = 'prologue';

const entrance: AreaDefinition = {
    type: 'forest',
    width: 500,
    objects: {
    },
    backgroundObjects: {
    },
};

zones.prologue = {
    entrance,
};
