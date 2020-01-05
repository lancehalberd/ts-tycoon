// Utilities for dealing with different types of points: fame, divinity, coins and anima.
import { bodyDiv, query, queryAll, tag, titleDiv } from 'app/dom';
import { getState } from 'app/state';
import { abbreviate } from 'app/utils/formatters';
import { updateReforgeButton } from 'app/equipmentCrafting';
import { updateHireButtons } from 'app/heroApplication';

export type PointsType = 'anima' | 'coins' | 'divinity' | 'fame';
// Cost is an amount of coins or a map of points types to amounts.
type Cost = number | {[key in PointsType]?: number};

const pointsMap = {
    'anima': 'Anima',
    'coins': 'Coins',
    'divinity': 'Divinity',
    'fame': 'Fame',
};

export function points(type: PointsType, value: number) {
    if (type === 'coins') {
        return tag('span', 'inline-points', tag('span', 'icon coin') + ' ' + tag('span', 'value '+ pointsMap[type], abbreviate(value)));
    }
    return tag('span', 'inline-points', tag('span', 'icon anima') + ' ' + tag('span', 'value '+ pointsMap[type], abbreviate(value)));
}

// By default costs are assumed to be coins, but can be specified as any combination of points like {'coins': 10, 'anima': 100}
export function canAffordCost(cost: Cost): boolean {
    const { savedState } = getState();
    if (typeof cost === 'number') return cost <= savedState.coins;
    for (let points in cost) {
        if (cost[points] > savedState[points]) return false;
    }
    return true;
}
export function previewCost(cost: Cost) {
    if (typeof cost === 'number') return previewPointsChange('coins', -cost);
    for (var points in cost) previewPointsChange(points as PointsType, -cost[points]);
}
export function attemptToApplyCost(cost: Cost) {
    if (!canAffordCost(cost)) return false;
    if (typeof cost === 'number') return spend('coins', cost);
    for (var points in cost) spend(points as PointsType, cost[points]);
    return true;
}
export function costHelpText(cost: Cost) {
    if (typeof cost === 'number') return points('coins', cost);
    var parts = [];
    for (var pointsKey in cost) parts.push(points(pointsKey as PointsType, cost[pointsKey]));
    return parts.join(' and ');
}
/*
<div class="points js-coinsContainer" helpText>
    <div class="pointsIcon"><span class="icon coin"></span></div>
    <div class="pointsColumn">
        <span class="js-global-coins coin">1000</span>
        <br/>
        <span class="js-amount" style="display: none;">-200</span>
        <hr class="js-bottomLine bottomLine" style="display: none;">
        <span class="js-balance coin" style="display: none;">800</span>
    </div>
</div>
*/
export function previewPointsChange(pointsType: PointsType, amount: number) {
    if (amount === 0) return;
    const pointsSpan = query('.js-global-' + pointsType);
    const pointsColumn = pointsSpan.parentElement;
    const amountSpan = pointsColumn.querySelector('.js-amount');
    pointsColumn.classList.add('showChange');
    amountSpan.classList.toggle('cost', amount < 0);
    if (amount < 0) amountSpan.textContent = '-' + abbreviate(-amount);
    else amountSpan.textContent = '+' + abbreviate(amount);

    const gameState = getState();

    let balance = (pointsType === 'divinity')
        ? gameState.selectedCharacter.divinity + amount
        : gameState.savedState[pointsType] + amount;
    const balanceSpan = pointsColumn.querySelector('.js-balance');
    balanceSpan.classList.toggle('cost', balance < 0);
    if (balance < 0) balanceSpan.textContent = '-' + abbreviate(-balance);
    else balanceSpan.textContent = abbreviate(balance);
}
export function hidePointsPreview() {
    for (const previewColumn of queryAll('.pointsColumn.showChange')) {
        previewColumn.classList.remove('showChange');
    }
}
export function gain(pointsType: PointsType, amount: number): void {
    const gameState = getState();
    gameState.savedState[pointsType] += amount;
    changedPoints(pointsType);
}
export function spend(pointsType: PointsType, amount: number): boolean {
    const gameState = getState();
    if (amount > gameState.savedState[pointsType]) return false;
    gameState.savedState[pointsType] -= amount;
    changedPoints(pointsType);
    return true;
}
export function changedPoints(pointsType) {
    capPoints();
    const { savedState } = getState();
    if (pointsType == 'fame') updateHireButtons();
    else updateReforgeButton();
    query('.js-global-' + pointsType).textContent = abbreviate(savedState[pointsType]);
}

function capPoints() {
    const gameState = getState();
    gameState.savedState.coins = Math.min(gameState.savedState.coins, gameState.guildStats.maxCoins);
    gameState.savedState.anima = Math.min(gameState.savedState.anima, gameState.guildStats.maxAnima);
}

