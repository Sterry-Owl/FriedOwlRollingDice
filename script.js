document.addEventListener('DOMContentLoaded', () => {
    // 集中管理 DOM 元素
    const uiElements = {
        diceOptions: document.querySelectorAll('.dice-option'),
        diceTrack: document.getElementById('dice-track'),
        btnPrevDice: document.getElementById('btn-prev-dice'),
        btnNextDice: document.getElementById('btn-next-dice'),
        
        displayCount: document.getElementById('display-count'),
        btnMinusCount: document.getElementById('btn-minus-count'),
        btnPlusCount: document.getElementById('btn-plus-count'),
        
        displayMod: document.getElementById('display-mod'),
        btnMinusMod: document.getElementById('btn-minus-mod'),
        btnPlusMod: document.getElementById('btn-plus-mod'),
        
        rollButton: document.getElementById('roll-button'),
        animationContainer: document.getElementById('animation-container'),
        finalResult: document.getElementById('final-result')
    };

    // 狀態管理物件
    const state = {
        diceIndex: 1,      
        diceCount: 1,      
        modifier: 0,       
        isRolling: false   
    };

    /**
     * 更新輪播介面顯示
     */
    const updateCarouselUI = () => {
        uiElements.diceOptions.forEach((option, index) => {
            option.classList.toggle('active', index === state.diceIndex);
        });
        const offset = (1 - state.diceIndex) * 33.333;
        uiElements.diceTrack.style.transform = `translateX(${offset}%)`;
    };

    /**
     * 處理骰子切換邏輯 (支援方向位移與直接指定索引)
     * @param {number} target 傳入 +1/-1 代表相對位移，傳入大於 1 的數值或 0 代表絕對索引
     */
    const changeDice = (target) => {
        if (state.isRolling) return;
        const maxIndex = uiElements.diceOptions.length - 1;
        
        // 判斷傳入的是方向變動值還是直接指定的索引值
        if (target === 1 || target === -1) {
            state.diceIndex += target;
        } else {
            state.diceIndex = target;
        }
        
        if (state.diceIndex < 0) state.diceIndex = 0;
        if (state.diceIndex > maxIndex) state.diceIndex = maxIndex;
        
        updateCarouselUI();
    };

    /**
     * 更新計數器狀態與介面
     */
    const updateStepper = (type, delta) => {
        if (state.isRolling) return;
        
        if (type === 'count') {
            state.diceCount = Math.max(1, Math.min(100, state.diceCount + delta));
            uiElements.displayCount.textContent = state.diceCount;
        } else if (type === 'modifier') {
            state.modifier = Math.max(-100, Math.min(100, state.modifier + delta));
            const displayStr = state.modifier > 0 ? `+${state.modifier}` : state.modifier;
            uiElements.displayMod.textContent = displayStr;
        }
    };

    /**
     * 執行擲骰運算與動畫延遲顯示
     */
    const handleRoll = (event) => {
        if (event) event.preventDefault();
        if (state.isRolling) return;
        
        state.isRolling = true;
        uiElements.rollButton.style.opacity = '0.5';
        uiElements.rollButton.style.cursor = 'not-allowed';

        const activeOption = uiElements.diceOptions[state.diceIndex];
        const sides = parseInt(activeOption.dataset.sides, 10);

        // 重置結果文本與動畫區塊
        uiElements.finalResult.textContent = '-';
        uiElements.animationContainer.innerHTML = '';
        
        // 取得基礎的 SVG 模型
        const baseSvg = activeOption.querySelector('svg');
        
        // 計算動畫顯示的骰子數量 (最多 5 顆)
        const renderCount = Math.min(state.diceCount, 5);
        const resultNodes = []; // 儲存個別數值節點以便稍後寫入

        // 動態生成骰子與數值的 DOM 結構
        for (let i = 0; i < renderCount; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'dice-result-wrapper';
            
            const animatedSvg = baseSvg.cloneNode(true);
            animatedSvg.classList.add('animating-dice');
            
            // 隨機生成動畫參數，達成無限多樣的物理視覺效果
            const duration = (0.5 + Math.random() * 0.3).toFixed(2);       // 0.5s ~ 0.8s
            const startY = -70 - Math.random() * 50;                       // -70px ~ -120px
            const midY = 5 + Math.random() * 15;                           // 5px ~ 20px
            const turns = (1 + Math.random() * 2) * (Math.random() < 0.5 ? 1 : -1); // 隨機正反向，1~3圈
            const rotEnd = Math.floor(turns * 360);
            const rotMid = Math.floor(rotEnd / 2);
            const blurAmt = (1 + Math.random() * 3).toFixed(1);            // 1px ~ 4px 的動態模糊
            
            // 透過 CSS 變數即時注入動畫屬性
            animatedSvg.style.setProperty('--roll-duration', `${duration}s`);
            animatedSvg.style.setProperty('--start-y', `${startY}px`);
            animatedSvg.style.setProperty('--mid-y', `${midY}px`);
            animatedSvg.style.setProperty('--rot-mid', `${rotMid}deg`);
            animatedSvg.style.setProperty('--rot-end', `${rotEnd}deg`);
            animatedSvg.style.setProperty('--blur-amt', `${blurAmt}px`);
            animatedSvg.style.animationDelay = `${i * 0.08}s`; // 錯開每顆骰子的起始時間
            
            const resultText = document.createElement('span');
            resultText.className = 'individual-result';
            resultText.textContent = '-';
            
            wrapper.appendChild(animatedSvg);
            wrapper.appendChild(resultText);
            uiElements.animationContainer.appendChild(wrapper);
            
            resultNodes.push(resultText);
        }

        // 縮短延遲時間配合 CSS 動畫長度 (600ms + 最大延遲 200ms)
        setTimeout(() => {
            const results = [];
            for (let i = 0; i < state.diceCount; i++) {
                results.push(Math.floor(Math.random() * sides) + 1);
            }
            
            // 將前 5 顆的結果寫入畫面，並加入 D100 特殊判定
            for (let i = 0; i < renderCount; i++) {
                let displayStr = results[i].toString();
                
                if (sides === 100) {
                    if (results[i] <= 5) displayStr += ' (大成功)';
                    else if (results[i] >= 96) displayStr += ' (大失敗)';
                }
                
                resultNodes[i].textContent = displayStr;
                resultNodes[i].style.opacity = '1';
            }
            
            const total = results.reduce((sum, current) => sum + current, 0);
            const finalValue = total + state.modifier;
            let finalDisplayStr = finalValue.toString();

            // 若僅投擲單顆 100 面骰，將大成功/大失敗同步顯示於最終結果
            if (state.diceCount === 1 && sides === 100) {
                if (results[0] <= 5) finalDisplayStr += ' (大成功)';
                else if (results[0] >= 96) finalDisplayStr += ' (大失敗)';
            }

            // 更新最終結果介面
            uiElements.finalResult.textContent = finalDisplayStr;

            // 解除鎖定狀態
            state.isRolling = false;
            uiElements.rollButton.style.opacity = '1';
            uiElements.rollButton.style.cursor = 'pointer';
        }, 900);

    // 綁定箭頭按鈕事件
    uiElements.btnPrevDice.addEventListener('click', () => changeDice(-1));
    uiElements.btnNextDice.addEventListener('click', () => changeDice(1));
    
    // 綁定各別骰子的點擊事件 (修復無法直接點選之 Bug)
    uiElements.diceOptions.forEach((option, index) => {
        option.addEventListener('click', () => changeDice(index));
    });
    
    uiElements.btnMinusCount.addEventListener('click', () => updateStepper('count', -1));
    uiElements.btnPlusCount.addEventListener('click', () => updateStepper('count', 1));
    
    uiElements.btnMinusMod.addEventListener('click', () => updateStepper('modifier', -1));
    uiElements.btnPlusMod.addEventListener('click', () => updateStepper('modifier', 1));
    
    uiElements.rollButton.addEventListener('click', handleRoll);

    // 初始化介面狀態
    updateCarouselUI();
});
