document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    const history = document.getElementById('history');
    let previousValue = null;
    let currentOperation = null;
    let equalPressed = false;
    let calculationHistory = '';
    let calc = null;
    let operationSign = null;
    let memoryValue = null;
    let memoryValuePressed = null;

    const historyElement = document.getElementById('history');

    historyElement.addEventListener('contextmenu', function(e) {
        e.preventDefault();

        if (navigator.clipboard) {
            navigator.clipboard.writeText(historyElement.innerText)
                .then(() => console.log('Transaction history copied to clipboard'))
                .catch(err => console.error('Error when copying transaction history: ', err));
        } else {
            console.error('Browser does not support Clipboard API');
        }
    });

    document.querySelectorAll('button, .memory p').forEach(button => {
        const id = button.id;
        const value = button.innerText;

        button.addEventListener('click', function() {
            if (equalPressed && !isNaN(parseFloat(value))) {
                output.innerText = '';
                calculationHistory = '';
                calc = '';
                equalPressed = false;
            }

            if (!isNaN(parseFloat(value))) {
                if (output.innerText === '0') {
                    output.innerText = value;
                    calc = value;
                } else {
                    output.innerText += value;
                    calc += value;
                }
                calculationHistory = output.innerText;
            }

            switch (id) {
                case 'c':
                    output.innerText = '0';
                    history.innerText = '...';
                    calc = '';
                    previousValue = null;
                    currentOperation = null;
                    break;
                case 'plus':
                case 'minus':
                case 'multiply':
                case 'divide':
                    operationSign = value;
                    previousValue = parseFloat(calc);
                    currentOperation = id;
                    output.innerText += value;
                    if (equalPressed) {
                        calculationHistory = output.innerText;
                        equalPressed = false;
                    } else {
                        calculationHistory += output.innerText;
                    }
                    calculationHistory += output.innerText;
                    calc = '';
                    break;
                case 'equal':
                    calculate();
                    equalPressed = true;
                    break;
                case 'dot':
                    if (!output.innerText.includes('.')) {
                        output.innerText += '.';
                        calc += '.';
                    }
                    break;
                case 'plus-minus':
                    if (calc && !isNaN(parseFloat(calc))) {
                        calc = (parseFloat(calc) * -1).toString();
                        output.innerText = calc;
                    }
                    break;
                case 'backspace':
                    if (['+', '-', '×', '÷', '%'].includes(output.innerText.charAt(output.innerText.length - 1))) {
                        currentOperation = null;
                    }
                    output.innerText = output.innerText.slice(0, -1);
                    if (calc.length > 0) {
                        calc = calc.slice(0, -1);
                    } else {
                        calc = output.innerText;
                    }
                    break;
                case 'percent':
                    if (calc && !isNaN(parseFloat(calc)) && previousValue !== null) {
                        output.innerText += value;
                        switch (currentOperation) {
                            case 'plus':
                            case 'minus':
                                calc = (previousValue * parseFloat(calc) / 100).toString();
                                break;
                            case 'multiply':
                            case 'divide':
                                calc = (parseFloat(calc) / 100).toString();
                                break;
                            default:
                                break;
                        }
                    } else if (calc && !isNaN(parseFloat(calc))) {
                        previousValue = parseFloat(calc);
                        currentOperation = id;
                        calculationHistory = output.innerText;
                        output.innerText += value;
                        calc = (parseFloat(calc) / 100).toString();
                    }
                    calculationHistory += value;
                    break;
                case 'power':
                    previousValue = parseFloat(calc);
                    currentOperation = id;
                    if (equalPressed) {
                        output.innerText = calc + '^';
                        calculationHistory = output.innerText;
                        equalPressed = false;
                    } else {
                        output.innerText += '^';
                    }
                    calc = '';
                    break;
                case 'sqrt':
                    if (calc && !isNaN(parseFloat(calc)) && previousValue !== null) {
                        output.innerText = previousValue + operationSign + value.charAt(0) + calc;
                        calculationHistory = output.innerText;
                        calc = Math.sqrt(parseFloat(calc)).toString();
                    } else if (calc && !isNaN(parseFloat(calc))) {
                        previousValue = parseFloat(calc);
                        currentOperation = id;
                        output.innerText = value.charAt(0) + calc;
                        calculationHistory = output.innerText;
                        calc = Math.sqrt(parseFloat(calc)).toString();
                    }
                    break;
                case 'module':
                    if (calc && !isNaN(parseFloat(calc)) && previousValue !== null) {
                        output.innerText = previousValue + operationSign + '|' + calc + '|';
                        calculationHistory = output.innerText;
                        calc = Math.abs(parseFloat(calc)).toString();
                    } else if (calc && !isNaN(parseFloat(calc))) {
                        previousValue = parseFloat(calc);
                        currentOperation = id;
                        output.innerText = '|' + calc + '|';
                        calculationHistory = output.innerText;
                        calc = Math.abs(parseFloat(calc)).toString();
                    }
                    break;
                case 'ms':
                    memoryValue = parseFloat(output.innerText);
                    memoryValuePressed = memoryValue;
                    break;
                case 'mc':
                    memoryValue = null;
                    break;
                case 'mr':
                    if (memoryValue !== null) {
                        calc = memoryValue.toString();
                        calculationHistory = output.innerText + calc;
                        output.innerText = calc;
                        console.log(memoryValue);
                    } else
                        console.log("Memory is empty");
                    break;
                case 'm-plus':
                    if (memoryValue !== null) {
                        memoryValue += memoryValuePressed;
                        console.log(memoryValue);
                    } else {
                        memoryValue = parseFloat(output.innerText);
                    }
                    break;
                case 'm-minus':
                    if (memoryValue !== null) {
                        memoryValue -= memoryValuePressed;
                        console.log(memoryValue);
                    } else {
                        memoryValue = parseFloat(output.innerText);
                    }
                    break;
                default:
                    break;
            }
        });
    });

    function convertBase(value, fromBase, toBase) {
        return parseInt(value, fromBase).toString(toBase);
    }

    document.querySelectorAll('p').forEach(p => {
        const id = p.id;

        p.addEventListener('click', function() {
            switch (id) {
                case 'convert':
                    const type = prompt('Enter type of conversion (length, weight, area):');
                    const from = prompt('Enter unit to convert from:');
                    const to = prompt('Enter unit to convert to:');
                    const value = parseFloat(prompt('Enter value to convert:'));
                    let result;

                    if (type === 'length') {
                        if (from === 'cm' && to === 'm') {
                            result = value / 100;
                        } else if (from === 'm' && to === 'km') {
                            result = value / 1000;
                        } else if (from === 'cm' && to === 'km') {
                            result = value / 100000;
                        } else if (from === 'm' && to === 'cm') {
                            result = value * 100;
                        } else if (from === 'km' && to === 'm') {
                            result = value * 1000;
                        }
                    } else if (type === 'weight') {
                        if (from === 'g' && to === 'kg') {
                            result = value / 1000;
                        } else if (from === 'kg' && to === 'tonne') {
                            result = value / 1000;
                        }
                    } else if (type === 'area') {
                        if (from === 'sqcm' && to === 'sqm') {
                            result = value / 10000;
                        } else if (from === 'sqm' && to === 'sqkm') {
                            result = value / 1000000;
                        } else if (from === 'sqm' && to === 'hectare') {
                            result = value / 10000;
                        }
                    }

                    if (result !== undefined) {
                        output.innerText = result;
                        calc = result.toString();
                    } else {
                        output.innerText = 'Invalid conversion';
                    }
                    break;
                default:
                    break;
            }
        });
    });

    document.getElementById('system').addEventListener('click', function() {
        const fromBase = prompt('Enter the starting number system (2 for binary, 10 for decimal, 16 for hexadecimal):');
        const toBase = prompt('Enter the number system you want to convert to (2 for binary, 10 for decimal, 16 for hexadecimal):');
        const value = prompt('Enter the value to convert:');

        if ((fromBase === '2' || fromBase === '10' || fromBase === '16') && (toBase === '2' || toBase === '10' || toBase === '16')) {
            const result = convertBase(value, parseInt(fromBase), parseInt(toBase));
            output.innerText = result;
            console.log('Value ' + value + ' in the number system ' + fromBase + ' equals ' + result + ' in the number system ' + toBase);
        } else {
            console.log('Invalid number system value. Please enter 2, 10 or 16.');
        }
    });

    function calculate() {
        if (previousValue !== null && currentOperation !== null && calc !== null) {
            switch (currentOperation) {
                case 'plus':
                    previousValue = parseFloat(previousValue) + parseFloat(calc);
                    output.innerText = previousValue;
                    break;
                case 'minus':
                    previousValue = parseFloat(previousValue) - parseFloat(calc);
                    output.innerText = previousValue;
                    break;
                case 'multiply':
                    previousValue = parseFloat(previousValue) * parseFloat(calc);
                    output.innerText = previousValue;
                    break;
                case 'divide':
                    previousValue = parseFloat(previousValue) / parseFloat(calc);
                    output.innerText = previousValue;
                    break;
                case 'power':
                    previousValue = Math.pow(parseFloat(previousValue), parseFloat(calc));
                    output.innerText = previousValue;
                    break;
                case 'percent':
                    output.innerText = calc;
                    break;
                case 'module':
                    output.innerText = calc;
                    break;
                case 'sqrt':
                    output.innerText = calc;
                    break;
                case 'mr':
                    output.innerText = calc;
                    break;
                case 'm-plus':
                    output.innerText = calc;
                    break;
                case 'm-minus':
                    output.innerText = calc;
                    break;
                default:
                    break;
            }
            history.innerText = calculationHistory + ' = ' + output.innerText;
            currentOperation = null;
            calc = output.innerText;
        }
    }
});