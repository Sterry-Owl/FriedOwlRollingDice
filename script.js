document.addEventListener('DOMContentLoaded', () => {
    // 集中管理 DOM 元素，避免全域變數汙染與重複尋找 DOM 節點
    document.addEventListener('DOMContentLoaded', () => {
        // 集中管理 DOM 元素
        const uiElements = {
            diceOptions: document.querySelectorAll('.dice-option'), // 改為選取所有骰子選項按鈕
            diceCount: document.getElementById('dice-count'),
            formulaInput: document.getElementById('formula-input'),
            rollButton: document.getElementById('roll-button'),
            rawResults: document.getElementById('raw-results'),
            totalValue: document.getElementById('total-value'),
            finalResult: document.getElementById('final-result')
        };

        /**
         * 處理骰子選項點擊事件，切換 active 狀態
         * @param {Event} event 點擊事件物件
         */
        const handleDiceSelection = (event) => {
            // 移除所有按鈕的 active 狀態
            uiElements.diceOptions.forEach(btn => btn.classList.remove('active'));
            // 為當前點擊的按鈕加入 active 狀態
            event.currentTarget.classList.add('active');
        };

        /**
         * 執行擲骰邏輯
         * @param {number} sides 骰子面數
         * @param {number} count 擲骰數量
         * @returns {number[]} 每次擲骰結果的陣列
         */
        const rollDice = (sides, count) => {
            const results = [];
            for (let i = 0; i < count; i++) {
                results.push(Math.floor(Math.random() * sides) + 1);
            }
            return results;
        };

        /**
         * 解析並計算使用者輸入的公式
         * @param {number} total 擲骰總值 (變數 x 的實際數值)
         * @param {string} formula 原始公式字串
         * @returns {number|string} 計算結果，若公式無效則回傳錯誤訊息
         */
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

        /**
         * 處理按鈕點擊後的整體運算與介面更新流程
         */
        const handleRoll = () => {
            // 動態取得當前具有 active 樣式的按鈕，並讀取其 data-sides 數值
            const activeDice = document.querySelector('.dice-option.active');
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

        // 綁定事件監聽器
        uiElements.diceOptions.forEach(option => {
            option.addEventListener('click', handleDiceSelection);
        });
        uiElements.rollButton.addEventListener('click', handleRoll);
    });