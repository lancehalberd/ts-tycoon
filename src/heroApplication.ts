import { enterArea } from 'app/adventure';
import { newCharacter, refreshStatsPanel, setSelectedCharacter, updateHero } from 'app/character';
import { updateTrophy } from 'app/content/achievements';
import { HeroApplication } from 'app/content/areas';
import { characterClasses } from 'app/content/jobs';
import { handleChildEvent, query, queryAll, tagElement } from 'app/dom';
import { drawBoardBackground, drawBoardJewels } from 'app/drawBoard';
import { jewelInventoryState, updateJewelUnderMouse } from 'app/jewelInventory';
import { drawImage } from 'app/images';
import { inventoryState } from 'app/inventory';
import { updateRetireButtons } from 'app/main';
import { gain, hidePointsPreview, previewPointsChange, points, spend } from 'app/points';
import { saveGame } from 'app/saveGame';
import { getState, guildYardEntrance } from 'app/state';
import { drawFrame } from 'app/utils/animations';
import Random from 'app/utils/Random';

import { Applicant, JobKey } from 'app/types';

export const jobRanks: JobKey[][] = [
    ['juggler', 'blackbelt', 'priest'],
    ['corsair', 'paladin', 'dancer'],
    ['ranger', 'warrior', 'wizard'],
    ['assassin', 'darkknight', 'bard'],
    ['sniper', 'samurai', 'sorcerer'],
    ['ninja', 'enhancer', 'sage'],
    //['master', 'fool'],
];

export function createNewHeroApplicant(jobKey: JobKey = null) {
    const { savedState } = getState();
    const fameRoll = Math.round(savedState.fame / 3 + Math.random() * savedState.fame * 5 / 6);
    if (!jobKey) {
        // Log is base e, so we need to divide by log(10) to get log10 value.
        const maxRank = Math.min(Math.log(fameRoll) / Math.log(10), jobRanks.length);
        const jobRank = Math.floor(Math.random() * maxRank);
        jobKey = Random.element(jobRanks[jobRank]);
    }
    const applicant = {
        ...newCharacter(characterClasses[jobKey]),
        fame: fameRoll,
        applicationAge: 0,
    };
    updateHero(applicant.hero);
    return applicant;
}

const applicationElement: HTMLElement = query('.js-heroApplication');
const seekNewApplicantButton = query('.js-seekNewApplicant');
const hireApplicantButton = query('.js-hireApplicant');
let displayedApplication: HeroApplication = null;

export function showHeroApplication(application: HeroApplication) {
    displayedApplication = application;
    const character = application.applicant;
    const boardCanvas = applicationElement.querySelector('.js-applicationSkillCanvas') as HTMLCanvasElement;
    const statsElement = applicationElement.querySelector('.js-stats') as HTMLElement;
    refreshStatsPanel(character, statsElement);
    statsElement.querySelector('.js-dexterityGrowth').innerHTML = '';
    statsElement.querySelector('.js-strengthGrowth').innerHTML = '';
    statsElement.querySelector('.js-intelligenceGrowth').innerHTML = '';
    for (let i = 0; i < character.hero.job.dexterityBonus; i++) {
        statsElement.querySelector('.js-dexterityGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    for (let i = 0; i < character.hero.job.strengthBonus; i++) {
        statsElement.querySelector('.js-strengthGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    for (let i = 0; i < character.hero.job.intelligenceBonus; i++) {
        statsElement.querySelector('.js-intelligenceGrowth').append(tagElement('div', 'statGrowthFill'));
    }
    //character.boardCanvas = boardCanvas;
    const applicantPreviewContext = (applicationElement.querySelector('.js-previewCanvas') as HTMLCanvasElement).getContext("2d");
    applicantPreviewContext.imageSmoothingEnabled = false;
    applicantPreviewContext.clearRect(0, 0, 64, 128);
    applicantPreviewContext.globalAlpha = 1;
    character.hero.job.iconSource.render(applicantPreviewContext, {x: 0, y: 0, w: 32, h: 32});
    applicantPreviewContext.globalAlpha = .6;
    const frame = character.hero.source.idleAnimation.frames[0];
    drawFrame(applicantPreviewContext, frame, {x: 40 - frame.w, y: 20, w: frame.w * 2, h: frame.h * 2});
    //drawBoardBackground(boardCanvas.getContext('2d'), character.board);
    drawBoardJewels(character, boardCanvas);
    applicationElement.style.display = '';
    updateHireButtons();
}

export function increaseAgeOfApplications() {
    for (const application of HeroApplication.instances) {
        if (!application || !application.applicant) return;
        application.applicant.applicationAge++;
    }
    updateHireButtons();
}

export function updateHireButtons() {
    const { applicant } = (displayedApplication || {});
    if (!applicant) {
        return;
    }
    applicationElement.querySelector('.js-hirePrice').innerHTML =
        points('coins', getApplicationCost(applicant));
    const newApplicationCost = getNewApplicationCost(applicant);
    applicationElement.querySelector('.js-seekPrice').innerHTML =
        newApplicationCost ? points('coins', newApplicationCost) : ' Free!';
}

function getApplicationCost(applicant: Applicant) {
    return Math.max(100, Math.round(applicant.fame * 100 * Math.max(.01, applicant.fame / getState().savedState.fame)));
}

function getNewApplicationCost(applicant: Applicant) {
    return Math.max(0, Math.round(getApplicationCost(applicant)* (10 - applicant.applicationAge) / 100));
}

hireApplicantButton.onclick = function (button) {
    const state = getState();
    if (state.characters.length >= 8) return;
    if (state.characters.length >= state.guildStats.maxHeroes) return;
    const character = displayedApplication.applicant;
    if (!spend('coins', getApplicationCost(character))) {
        return;
    }
    hireCharacter(character);
    displayedApplication.setApplicant(createNewHeroApplicant());
    updateRetireButtons();
    saveGame();
}
hireApplicantButton.onmouseover = function (button) {
    previewPointsChange('coins', -getApplicationCost(displayedApplication.applicant));
}
hireApplicantButton.onmouseout = function () {
    hidePointsPreview();
}
seekNewApplicantButton.onclick = function () {
    if (!spend('coins', getNewApplicationCost(displayedApplication.applicant))) {
        return;
    }
    displayedApplication.setApplicant(createNewHeroApplicant());
    showHeroApplication(displayedApplication);
    saveGame();
}
seekNewApplicantButton.onmouseover = function () {
    previewPointsChange('coins', -getNewApplicationCost(displayedApplication.applicant));
}
seekNewApplicantButton.onmouseout = function () {
    hidePointsPreview();
}

export function hireCharacter(applicant: Applicant) {
    const state = getState();
    if (state.characters.length > 0 && state.characters.length >= state.guildStats.maxHeroes) {
        return;
    }
    gain('fame', applicant.fame);
    state.characters.push(applicant);
    // Update the adventurer because it may not have guild bonuses applied to it yet.
    updateHero(applicant.hero);
    enterArea(applicant.hero, guildYardEntrance);
    updateTrophy('level-' + applicant.hero.job.key, applicant.hero.level);
    query('.js-charactersBox').appendChild(applicant.characterCanvas);
    hideHeroApplication();
    setSelectedCharacter(applicant);
}

export function hideHeroApplication() {
    applicationElement.style.display = 'none';
}


handleChildEvent('mousemove', document.body, '.js-applicationSkillCanvas', function (targetJewelsCanvas) {
    if (jewelInventoryState.draggedJewel || inventoryState.dragHelper || jewelInventoryState.draggingBoardJewel) {
        return;
    }
    updateJewelUnderMouse(targetJewelsCanvas, displayedApplication.applicant);
});
