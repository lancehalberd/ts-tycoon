import { EquipmentSlot } from 'app/types';

// Update duration in milliseconds.
export const FRAME_LENGTH = 20;
// Minimum effective slowing coefficient from slowing effects.
export const MIN_SLOW = .5;

// How many pixels does 1 unit of range correspond to.
export const RANGE_UNIT = 10;


export const MAX_LEVEL = 100;

// Dimensions of the game in document pixels.
export const DOM_WIDTH = 960;
export const DOM_HEIGHT = 540;

// Dimensions of the map canvas in canvas pixels.
export const MAP_WIDTH = 320;
export const MAP_HEIGHT = 180;
export const MAP_LEFT = -MAP_WIDTH / 2;
export const MAP_TOP = -MAP_HEIGHT / 2;

export const WORLD_RADIUS = 300;

export const armorSlots: EquipmentSlot[] = ['body', 'feet', 'head', 'offhand', 'arms', 'legs'];
export const smallArmorSlots: EquipmentSlot[] = ['feet', 'head', 'offhand', 'arms', 'legs'];
export const accessorySlots: EquipmentSlot[] = ['back', 'ring'];
export const equipmentSlots: EquipmentSlot[] = ['weapon', 'body', 'feet', 'head', 'offhand', 'arms', 'legs', 'back', 'ring'];

export const TROPHY_SIZE = 20;

// Dimensions of the adventure canvas in canvas pixels.
export const ADVENTURE_WIDTH = 320;
export const ADVENTURE_HEIGHT = 180;
// Scale of adventure canvas pixels relative to document pixels.
export const ADVENTURE_SCALE = 3;

export const TOP_HUD_HEIGHT = 16;
export const BACKGROUND_HEIGHT = 84;
export const FIELD_HEIGHT = 64;
export const BOTTOM_HUD_HEIGHT = 32;
export const GROUND_Y = BACKGROUND_HEIGHT + (FIELD_HEIGHT + 16) / 2;
// The middle of the field is 0, so it should only go to half the field height, but
// each z unit is only half a pixel so it cancels out.
export const MAX_Z = FIELD_HEIGHT + 8;
export const MIN_Z = -MAX_Z;

export const BOTTOM_HUD_RECT = {x: 0, y: ADVENTURE_HEIGHT - BOTTOM_HUD_HEIGHT, w: ADVENTURE_WIDTH, h: BOTTOM_HUD_HEIGHT};

export const MISSION_ANIMATION_LENGTH = 2000;
