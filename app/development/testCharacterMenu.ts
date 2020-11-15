import { initializeActorForAdventure } from 'app/actor';
import { enterArea, leaveCurrentArea } from 'app/adventure';
import { setSelectedCharacter } from 'app/character';
import mission1 from 'app/development/testCharacters/mission1';
import mission2 from 'app/development/testCharacters/mission2';
import level10 from 'app/development/testCharacters/level10';
import special from 'app/development/testCharacters/special';
import { exportCharacter, importCharacter } from 'app/saveGame';
import { getState } from 'app/state';

import { MenuOption, SavedCharacter } from 'app/types';

const allTestCharacters = {
    mission1, mission2, level10, special,
};

function pasteCharacterToClipBoard(character) {
    navigator.clipboard.writeText(JSON.stringify(exportCharacter(character)))
}

function setTestCharacter(savedCharacter: SavedCharacter): void {
    try {
        const hero = getState().selectedCharacter.hero;
        const importedCharacter = importCharacter(savedCharacter);
        const area = hero.area;
        enterArea(importedCharacter.hero,
            {x: hero.x, z: hero.z, areaKey: area.key, zoneKey: area.zoneKey}
        );
        importedCharacter.hero.heading = [...hero.heading];
        importedCharacter.mission = hero.character.mission;
        hero.character.mission = null;
        leaveCurrentArea(hero);
        hero.character.context = 'map';
        initializeActorForAdventure(importedCharacter.hero);
        setSelectedCharacter(importedCharacter);
    } catch (e) {
        console.error('Failed to import character');
        console.error(e.message);
    }
}

export function getTestCharacterMenu(): MenuOption[] {
    const character = getState().selectedCharacter;
    return [
        {
            label: 'Test Characters...',
            getChildren() {
                return [
                    {
                        label: 'Export to Clipboard',
                        onSelect() {
                            pasteCharacterToClipBoard(character);
                        }
                    },
                    {
                        label: 'Import from Clipboard',
                        async onSelect() {
                            try {
                                const contents = await navigator.clipboard.readText();
                                const savedCharacter: SavedCharacter = JSON.parse(contents);
                                setTestCharacter(savedCharacter);
                            } catch (e) {
                                console.error('Failed to parse character');
                                console.error(e.message);
                            }
                        }
                    },
                    ...Object.keys(allTestCharacters).map(key => ({
                        label: key,
                        getChildren() {
                            return allTestCharacters[key].map((char: SavedCharacter) => ({
                                label: `Lvl ${char.hero.level} ${char.hero.jobKey}`,
                                onSelect() {
                                    setTestCharacter(char);
                                }
                            }));
                        }
                    }))
                ];
            }
        }
    ];
}
