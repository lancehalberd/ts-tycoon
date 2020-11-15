import {
    AreaObject, AreaObjectDefinition, EditorProperty,
    MenuOption, PropertyRow,
} from 'app/types'

// This gets added to where each object type is defined, for example in AreaDoor or CoinChest.
export const areaObjectFactories: {[key in string]: {
    createFromDefinition: (objectDefinition: AreaObjectDefinition) => AreaObject,
    getCreateMenu?: () => MenuOption,
    getEditMenu?: (object: AreaObject) => MenuOption[],
    getProperties?: (object: AreaObject) => (EditorProperty<any> | PropertyRow | string)[],
}} = {};
