import { AreaObject, AreaObjectDefinition, MenuOption } from 'app/types'

// This gets added to where each object type is defined, for example in AreaDoor or CoinChest.
export const areaObjectFactories: {[key in string]: {
    createFromDefinition: (objectDefinition: AreaObjectDefinition) => AreaObject,
    getCreateMenu?: () => MenuOption,
}} = {};
