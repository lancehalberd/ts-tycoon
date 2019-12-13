import { abbreviate } from 'app/utils/formatters';
import { tag } from 'app/dom';
import { bonusSourceHelpText } from 'app/helpText';

export function evaluateValue(coreObject, value, localObject) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string' && value.charAt(0) === '{') {
        if (value.indexOf('this.') >= 0) {
            return localObject[value.substring(6, value.length - 1)] || 0;
        }
        var statKey = value.substring(1, value.length - 1);
        // console.log(statKey + ':' + coreObject[statKey]);
        return coreObject[statKey] || 0;
    }
    // If this is an object, just return it for further processing.
    if (value.constructor !== Array) {
        return value;
    }
    var formula = value;
    if (!formula || !formula.length) {
        throw new Error('Expected "formula" to be an array, but value is: ' + formula);
    }
    var originalFormula = formula.slice();
    formula = formula.slice();

    if (formula.length == 1) {
        value = evaluateValue(coreObject, formula.shift(), localObject);
    } else if (formula.length == 2 && formula[0] === '-') {
        formula.shift()
        value = -1 * evaluateValue(coreObject, formula.shift(), localObject);
    } else {
        value = evaluateValue(coreObject, formula.shift(), localObject);
    }
    if (formula.length > 1) {
        var operator = formula.shift();
        var operand = evaluateValue(coreObject, formula.shift(), localObject);
        //console.log([value, operator, operand]);
        if (operator == '+') {
            value += operand;
        } else if (operator == '-') {
            value -= operand;
        } else if (operator == '*') {
            value *= operand;
        } else if (operator == '/') {
            if (operand === 0) value = 0;
            else value /= operand;
        }
    }
    return value;
}
export function evaluateForDisplay(value, coreObject, localObject) {
    if (typeof value === 'undefined') {
        throw new Error('value was undefined');
    }
    if (!coreObject && coreObject !== null) {
        throw new Error('Forgot to pass coreObject to evaluateForDisplay.');
    }
    if (typeof value === 'number') {
        return abbreviate(value);
    }
    if (typeof value === 'string' && value.charAt(0) === '{') {
        return tag('span', 'formulaStat', value.substring(1, value.length - 1));
    }
    if (typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }
    if (value.constructor !== Array) {
        if (value.bonuses) {
            return bonusSourceHelpText(value, coreObject, localObject);
        }
        return value;
    }
    const fullFormula = value;
    if (!fullFormula || !fullFormula.length) {
        throw new Error('Expected "formula" to be an array, but value is: ' + JSON.stringify(fullFormula));
    }
    const formula = [...fullFormula];
    if (formula.length === 1) {
        value = evaluateForDisplay(formula.shift(), null, localObject);
    } else if (formula.length == 2 && formula[0] === '-') {
        formula.shift();
        value = '-' + evaluateForDisplay(formula.shift(), null, localObject);
    } else {
        value = evaluateForDisplay(formula.shift(), null, localObject);
    }
    if (formula.length > 1) {
        value = '(' + value + ' '+ mapOperand(formula.shift()) + ' ' + evaluateForDisplay(formula.shift(), null, localObject) +')';
    }
    if (coreObject) {
        value += ' ' + tag('span', 'formulaStat', '[=' +  evaluateValue(coreObject, fullFormula, localObject).format(2) +  ']');
    }
    return value;
}

// Change shorthand operands to display versions.
function mapOperand(operand) {
    switch (operand) {
        case '/': return '÷';
        case '*': return '×';
        default: return operand;
    }
}
