import { enterArea } from 'app/adventure';
import { newCharacter, refreshStatsPanel, setSelectedCharacter, updateAdventurer } from 'app/character';
import { updateTrophy } from 'app/content/achievements';
import { guildYardEntrance } from 'app/content/guild';
import { characterClasses } from 'app/content/jobs';
import { handleChildEvent, query, queryAll, tagElement } from 'app/dom';
import { drawBoardJewels } from 'app/drawBoard';
import { drawImage } from 'app/images';
import { unlockMapLevel } from 'app/map';
import { updateRetireButtons } from 'app/main';
import { gain, hidePointsPreview, previewPointsChange, points, spend } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState } from 'app/state';
import Random from 'app/utils/Random';

const jobRanks = [
    ['juggler', 'blackbelt', 'priest'],
    ['corsair', 'paladin', 'dancer'],
    ['ranger', 'warrior', 'wizard'],
    ['assassin', 'darkknight', 'bard'],
    ['sniper', 'samurai', 'sorcerer'],
    ['ninja', 'enhancer', 'sage'],
    //['master', 'fool'],
];

export function createNewHeroApplicant(jobKey = null) {
    const { savedState } = getState();
    const fameRoll = Math.round(savedState.fame / 3 + Math.random() * savedState.fame * 5 / 6);
    if (!jobKey) {
        // Log is base e, so we need to divide by log(10) to get log10 value.
        const maxRank = Math.min(Math.log(fameRoll) / Math.log(10), jobRanks.length);
        const jobRank = Math.floor(Math.random() * maxRank);
        jobKey = Random.element(jobRanks[jobRank]);
    }
    const character = newCharacter(characterClasses[jobKey]);
    character.fame = fameRoll;
    character.applicationAge = 0;
    updateAdventurer(character.adventurer);
    return character;
}

function setHeroApplication(applicationElement: HTMLElement, application) {
    const character = application.character;
    const jewelsCanvas = applicationElement.querySelector('.js-applicationSkillCanvas');
    const statsElement = applicationElement.querySelector('.js-stats') as HTMLElement;
    refreshStatsPanel(character, statsElement);
    statsElement.querySelector('.js-dexterityGrowth').innerHTML = '';
    statsElement.querySelector('.js-strengthGrowth').innerHTML = '';
    statsElement.querySelector('.js-intelligenceGrowth').innerHTML = '';
    for (let i = 0; i < character.adventurer.job.dexterityBonus; i++) {
        statsElement.querySelector('.js-dexterityGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    for (let i = 0; i < character.adventurer.job.strengthBonus; i++) {
        statsElement.querySelector('.js-strengthGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    for (let i = 0; i < character.adventurer.job.intelligenceBonus; i++) {
        statsElement.querySelector('.js-intelligenceGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    character.jewelsCanvas = jewelsCanvas;
    updateHireButtonsForApplication(applicationElement);
    const applicantPreviewContext = applicationElement.querySelector('.js-previewCanvas')[0].getContext("2d");
    applicantPreviewContext.imageSmoothingEnabled = false;
    applicantPreviewContext.clearRect(0, 0, 64, 128);
    applicantPreviewContext.globalAlpha = 1;
    const jobSource = character.adventurer.job.iconSource;
    drawImage(applicantPreviewContext, jobSource.image, jobSource, {'left': 0, 'top': 0, 'width': 32, 'height': 32});
    applicantPreviewContext.globalAlpha = .6;
    applicantPreviewContext.drawImage(character.adventurer.personCanvas, character.adventurer.source.walkFrames[0] * 96, 0, 96, 64, -64, 0, 192, 128);
    drawBoardJewels(character, jewelsCanvas);
}

export function increaseAgeOfApplications() {
    queryAll('.js-heroApplication').forEach(function (applicationPanel) {
        //TODO
        const application: any = {};//applicationPanel.data('application');
        if (!application || !application.character) return;
        application.character.applicationAge++;
        updateHireButtonsForApplication(applicationPanel);
    });
}

export function updateHireButtons() {
    queryAll('.js-heroApplication').forEach(updateHireButtonsForApplication);
}
function updateHireButtonsForApplication(applicationElement) {
    const application = applicationElement.data('application');
    if (!application || !application.character) return;
    applicationElement.querySelector('.js-hirePrice').html(points('coins', getApplicationCost(application.character)));
    const newApplicationCost = getNewApplicationCost(application.character);
    applicationElement.querySelector('.js-seekPrice').html(newApplicationCost ? points('coins', newApplicationCost) : ' Free!');
}

function getApplicationCost(character) {
    return Math.max(100, Math.round(character.fame * 100 * Math.max(.01, character.fame / getState().savedState.fame)));
}

function getNewApplicationCost(character) {
    return Math.max(0, Math.round(getApplicationCost(character)* (10 - character.applicationAge) / 100));
}

handleChildEvent('click', document.body, '.js-hireApplicant', function (button) {
    const state = getState();
    if (state.characters.length >= 8) return;
    if (state.characters.length >= state.guildStats.maxHeroes) return;
    const applicationElement = button.closest('.js-heroApplication');
    const application = applicationElement.data('application');
    const character = application.character;
    if (!spend('coins', getApplicationCost(character))) {
        return;
    }
    hireCharacter(character);
    application.character = createNewHeroApplicant();
    updateRetireButtons();
    saveGame();
});
handleChildEvent('mouseover', document.body, '.js-hireApplicant', function (button) {
    const applicationElement = button.closest('.js-heroApplication');
    const application = applicationElement.data('application');
    previewPointsChange('coins', -getApplicationCost(application.character));
});
handleChildEvent('mouseout', document.body, '.js-hireApplicant', function () {
    hidePointsPreview();
});
handleChildEvent('click', document.body, '.js-seekNewApplicant', function (button) {
    const applicationElement = button.closest('.js-heroApplication');
    const application = applicationElement.data('application');
    if (!spend('coins', getNewApplicationCost(application.character))) {
        return;
    }
    application.character = createNewHeroApplicant();
    setHeroApplication(applicationElement, application);
    saveGame();
});
handleChildEvent('mouseover', document.body, '.js-seekNewApplicant', function (button) {
    const applicationElement = button.closest('.js-heroApplication');
    const application = applicationElement.data('application');
    previewPointsChange('coins', -getNewApplicationCost(application.character));
});
handleChildEvent('mouseout', document.body, '.js-seekNewApplicant', function () {
    hidePointsPreview();
});
function hireHeroHelpMethod($button) {
    const state = getState();
    if (state.characters.length >= state.guildStats.maxHeroes) return 'You do not have enough beds to hire another hero. Dismiss a hero or explore the guild for more beds.';
    return 'Hire this hero. The more famous your guild is, the cheaper it is to hire heroes.';
}

//TODO
//$('.js-hireApplicant').data('helpMethod', hireHeroHelpMethod);

function hireCharacter(character) {
    const state = getState();
    if (state.characters.length > 0 && state.characters.length >= state.guildStats.maxHeroes) return;
    unlockMapLevel(character.currentLevelKey);
    gain('fame', character.fame);
    state.characters.push(character);
    // Update the adventurer because it may not have guild bonuses applied to it yet.
    updateAdventurer(character.hero);
    enterArea(character.hero, guildYardEntrance);
    updateTrophy('level-' + character.hero.job.key, character.hero.level);
    query('.js-charactersBox').appendChild(character.characterCanvas);
    hideHeroApplication();
    setSelectedCharacter(character);
}

const heroApplicationElement: HTMLElement = query('.js-heroApplication');
export function showApplication(actor) {
    setHeroApplication(heroApplicationElement, this);
    heroApplicationElement.style.display = '';
}
export function hideHeroApplication() {
    heroApplicationElement.style.display = 'none';
}
