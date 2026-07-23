document.addEventListener('DOMContentLoaded', () => {
    const uiElements = {
        diceOptions: document.querySelectorAll('.dice-option'),
        diceCount: document.getElementById('dice-count'),
        formulaInput: document.getElementById('formula-input'),
        rollButton: document.getElementById('roll-button'),
        rawResults: document.getElementById('raw-results'),
        totalValue: document.getElementById('total-value'),
        finalResult: document.getElementById('final-result')
    };

    const handleDiceSelection = (event) => {
        uiElements.diceOptions.forEach(btn => btn.classList.remove('active'));
        // 確保點選到內部 SVG 時，也能正確抓取到 button 元素
        const button = event.target.closest('.dice-option');
        if (button) {
            button.classList.add('active');
        }
    };

    const rollDice = (sides, count) => {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }
        return results;
    };

    const calculateFormula = (total, formula) => {
        if (!formula.trim()) {
            return total;
        }

        try {
            const parsedFormula = formula.toLowerCase()
                .replace(/[^0-9x\+\-\*\/\(\)\.]/g, '')
                .replace(/(\d)x/g, '$1*x')
                .replace(/x/g, total);

            if (!parsedFormula) {
                return total;
            }

            const result = new Function(`return ${parsedFormula}`)();

            if (!isFinite(result) || isNaN(result)) {
                throw new Error('Invalid calculation');
            }

            return result;
        } catch (error) {
            return '公式錯誤，請檢查輸入格式';
        }
    };

    const handleRoll = () => {
        const activeDice = document.querySelector('.dice-option.active');
        if (!activeDice) return;

        const sides = parseInt(activeDice.dataset.sides, 10);
        const count = parseInt(uiElements.diceCount.value, 10);
        const formula = uiElements.formulaInput.value;

        if (isNaN(count) || count < 1) {
            uiElements.finalResult.textContent = '請輸入大於 0 的有效擲骰數量';
            return;
        }

        const results = rollDice(sides, count);
        const total = results.reduce((sum, current) => sum + current, 0);
        const finalValue = calculateFormula(total, formula);

        uiElements.rawResults.textContent = results.join(', ');
        uiElements.totalValue.textContent = total;
        uiElements.finalResult.textContent = finalValue;
    };

    uiElements.diceOptions.forEach(option => {
        option.addEventListener('click', handleDiceSelection);
    });
    uiElements.rollButton.addEventListener('click', handleRoll);
});