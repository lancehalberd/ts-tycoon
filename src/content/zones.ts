import { AreaDefinition, AreaObjectDefinition, Zone, Zones, ZoneType } from 'app/types';

import { zones } from 'app/content/zones/zoneHash';

export * from 'app/content/zones/zoneHash';
// All zones need to be imported here as they are not otherwise referenced in the code directly.
export * from 'app/content/zones/guild';

// Set zoneKey in each areaDefinition.
for (let zoneKey in zones) {
    const zone: Zone = zones[zoneKey];
    for (let areaKey in zone) {
        const areaDefinition: AreaDefinition = zone[areaKey];
        areaDefinition.zoneKey = zoneKey as ZoneType;
    }
}

export function serializeZone(zoneKey: ZoneType): string {
    const lines: string[] = [
        "import { zones } from 'app/content/zones';",
        "",
        "import { AreaDefinition } from 'app/types';",
        "",
    ];
    for (let areaKey in zones[zoneKey]) {
        lines.push(
            `export const ${areaKey}: AreaDefinition = `
            + serializeAreaDefinition(zones[zoneKey][areaKey])
            + ";"
        );
        lines.push('');
    }
    lines.push(`zones.${zoneKey} = {`);
    for (let areaKey in zones[zoneKey]) {
        lines.push(`    ${areaKey},`);
    }
    lines.push(`};`);
    lines.push('');
    return lines.join("\n");
}

function addProperty(lines: string[], areaDefinition: AreaDefinition, key: string, defaultValue: any = null): void {
    let value = areaDefinition[key];
    if (typeof value === undefined) {
        value = defaultValue;
    }
    if (value === null) {
        return;
    }
    if (typeof value === 'string') {
        lines.push(`    ${key}: '${value}',`);
    }
    if (typeof value === 'number') {
        lines.push(`    ${key}: ${value},`);
    }
    if (typeof value === 'object') {
        lines.push(`    ${key}: {`);
        for (let objectKey in value) {
            lines.push(`        ${objectKey}: ` + serializeObjectDefinition(value[objectKey]) + ',');
        }
        lines.push(`    },`);
    }
}

function serializeAreaDefinition(areaDefinition: AreaDefinition): string {
    const lines: string[] = ['{'];
    addProperty(lines, areaDefinition, 'type');
    addProperty(lines, areaDefinition, 'width');
    addProperty(lines, areaDefinition, 'leftWallType');
    addProperty(lines, areaDefinition, 'rightWallType');
    addProperty(lines, areaDefinition, 'seed');
    addProperty(lines, areaDefinition, 'objects');
    addProperty(lines, areaDefinition, 'wallDecorations');
    if (areaDefinition.monsters && areaDefinition.monsters.length) {
        lines.push('    monsters: [');
        for (const monster of areaDefinition.monsters) {
            lines.push(`        {key: '${monster.key}', level: ${monster.level}, location: [${monster.location.join(', ')}]},`);
        }
        lines.push('    ],')
    }
    lines.push('}');
    return lines.join("\n");
}

function serializeObjectDefinition(definition: AreaObjectDefinition): string {
    const lines = ['{'];
    lines.push(`            type: '${definition.type}',`);
    if (definition.xAlign && definition.xAlign !== 'left') {
        lines.push(`            xAlign: '${definition.xAlign}',`);
    }
    if (definition.x) {
        lines.push(`            x: ${definition.x},`);
    }
    if (definition.yAlign && definition.yAlign !== 'bottom') {
        lines.push(`            yAlign: '${definition.yAlign}',`);
    }
    if (definition.y) {
        lines.push(`            y: ${definition.y},`);
    }
    if (definition.zAlign && definition.zAlign !== 'middle') {
        lines.push(`            zAlign: '${definition.zAlign}',`);
    }
    if (definition.z) {
        lines.push(`            z: ${definition.z},`);
    }
    if (definition.flipped) {
        lines.push(`            flipped: ${definition.flipped},`);
    }
    // All additional fields are included last.
    for (let key in definition) {
        if (['type', 'x', 'y', 'z', 'xAlign', 'yAlign', 'zAlign', 'flipped'].includes(key)) {
            continue;
        }
        lines.push(`            ${key}: ${JSON.stringify(definition[key])},`);
    }
    lines.push('        }');
    return lines.join("\n");
}
