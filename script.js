class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        if (this.currentOperand === '-' || this.currentOperand === '-0') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') {
            if (operation === '-') {
                this.currentOperand = '-';
                return;
            }
        }

        if (this.currentOperand === '' || this.currentOperand === '-') return;

        if (operation === '%') {
            this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
            this.updateDisplay();
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    computation = "Error";
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        if (computation === "Error") {
            this.currentOperand = "Error";
        } else {
            // Round to avoid floating point issues like 0.1 + 0.2 = 0.30000000000000004
            computation = Math.round(computation * 10000000000) / 10000000000;
            this.currentOperand = computation.toString();
        }

        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        if (number === "Error") return "Error";
        if (number === "-") return "-";

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }

        // Add animation class
        this.currentOperandTextElement.classList.remove('animate-pop');
        // Trigger reflow
        void this.currentOperandTextElement.offsetWidth;
        this.currentOperandTextElement.classList.add('animate-pop');

        // Adjust font size based on length
        const length = this.currentOperandTextElement.innerText.length;
        if (length > 12) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else if (length > 9) {
            this.currentOperandTextElement.style.fontSize = '2.2rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '3rem';
        }
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const keys = document.querySelectorAll('.key');
let isDarkTheme = true;

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

keys.forEach(key => {
    key.addEventListener('click', (e) => {
        // Add ripple effect
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        key.appendChild(ripple);
        setTimeout(() => {
            ripple.remove();
        }, 600);

        // Handle button logic
        if (key.dataset.number !== undefined) {
            calculator.appendNumber(key.innerText);
            calculator.updateDisplay();
        }

        if (key.dataset.action === 'operator') {
            calculator.chooseOperation(key.innerText);
            calculator.updateDisplay();
        }

        if (key.dataset.action === 'calculate') {
            calculator.compute();
            calculator.updateDisplay();
        }

        if (key.dataset.action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
        }

        if (key.dataset.action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        }

        if (key.dataset.action === 'theme') {
            isDarkTheme = !isDarkTheme;
            document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
            key.innerText = isDarkTheme ? '🌙' : '☀️';
        }
    });
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9 || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        calculator.chooseOperation(op);
        calculator.updateDisplay();
    }
    if (e.key === '%') {
        calculator.chooseOperation('%');
        calculator.updateDisplay();
    }
});
