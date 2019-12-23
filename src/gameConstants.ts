import { EquipmentSlot } from 'app/types';

// Update duration in milliseconds.
export const FRAME_LENGTH = 20;
// Minimum effective slowing coefficient from slowing effects.
export const MIN_SLOW = .5;
// Min and max z positions in areas.
export const MIN_Z = -180;
export const MAX_Z = 180;
// Indicates where the ground is. This will be replaced once we allow a range of y values for the ground.
export const GROUND_Y = 390;


export const MAX_LEVEL = 100;

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;
export const MAP_LEFT = -MAP_WIDTH / 2;
export const MAP_TOP = -MAP_HEIGHT / 2;

export const WORLD_RADIUS = 600;

export const armorSlots: EquipmentSlot[] = ['body', 'feet', 'head', 'offhand', 'arms', 'legs'];
export const smallArmorSlots: EquipmentSlot[] = ['feet', 'head', 'offhand', 'arms', 'legs'];
export const accessorySlots: EquipmentSlot[] = ['back', 'ring'];
export const equipmentSlots: EquipmentSlot[] = ['weapon', 'body', 'feet', 'head', 'offhand', 'arms', 'legs', 'back', 'ring'];

export const TROPHY_SIZE = 50;
