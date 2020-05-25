import { GuildGate } from 'app/content/areas';
import { getZone } from 'app/content/zones';
import { getArea } from 'app/adventure';
import { ActiveMission, Character, MissionParameters, Zone } from 'app/types';

const allMissions: MissionParameters[] = [
    {
        key: 'mission1',
        name: 'Clear the Outpost',
        zoneKey: 'mission1',
        areaKey: 'villageWest',
        type: 'clearZone',
        introKey: 'mission1Intro',
        outroKey: 'mission1Outro',
    },
    {
        key: 'mission2',
        name: 'Defeat the Gremlin Bulls',
        zoneKey: 'mission2',
        areaKey: 'forestClearing',
        type: 'defeatTarget',
        introKey: 'mission2Intro',
        // outroKey: 'mission2Intro',
    }
];

export const missions: {[key: string]: MissionParameters} = {};
for (const mission of allMissions) {
    missions[mission.key] = mission;
}

export function getMission(missionKey: string): MissionParameters {
    const mission = missions[missionKey];
    if (!mission) {
        console.log('No mission with key', missionKey);
        debugger;
    }
    return mission;
}

// This creates and populates all the areas for the mission.
export function setupMission(character: Character, missionKey: string): ActiveMission {
    const parameters = getMission(missionKey);
    const zone = getZone(parameters.zoneKey);
    let totalEnemies = 0;
    let totalTargets = 0;
    for (let areaKey in zone) {
        totalEnemies += getArea(parameters.zoneKey, areaKey, true).enemies.length;
        totalTargets += getArea(parameters.zoneKey, areaKey, true).enemies.filter(e => e.isTarget).length;
    }
    character.mission = {
        parameters,
        zone,
        character,
        totalEnemies,
        defeatedEnemies: 0,
        totalTargets,
        defeatedTargets: 0,
        time: 0,
        // This timer is used for showing the start/completed/failed animations.
        animationTime: 0,
        started: false,
        completed: false,
        failed: false,
    };
    return character.mission;
}

export function startMission(missionKey: string): void {

}

export function setGuildGateMission(missionKey: string): void {
    const guildYard = getArea('guild', 'guildYard');
    if (!missionKey) {
        (guildYard.objectsByKey.guildGate as GuildGate).clearMission();
    } else {
        (guildYard.objectsByKey.guildGate as GuildGate).setMission(missionKey);
    }
}

export function getEnemiesRemaining(mission: ActiveMission): number {
    let enemiesRemaining = 0;
    for (let areaKey in mission.zone) {
        enemiesRemaining += getArea(mission.parameters.zoneKey, areaKey).enemies.filter(actor => !actor.owner).length;
    }
    return enemiesRemaining;
}
