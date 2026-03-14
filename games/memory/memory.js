const gameGrid = document.getElementById('gameGrid');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const bestElement = document.getElementById('best');
const startBtn = document.getElementById('startBtn');

// 卡片图案
const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎨', '🎭', '🎪', '🎬'];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = null;
let seconds = 0;
let isGameActive = false;
let bestTime = localStorage.getItem('memoryBestTime');

if (bestTime) {
    bestElement.textContent = formatTime(parseInt(bestTime));
}

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.innerHTML = `<span class="card-content">${emoji}</span>`;
    card.addEventListener('click', () => flipCard(card));
    return card;
}

function flipCard(card) {
    if (!isGameActive || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        flippedCards.length >= 2) {
        return;
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        moves++;
        movesElement.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.emoji === card2.dataset.emoji;
    
    if (match) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            matchedPairs++;
            
            if (matchedPairs === EMOJIS.length) {
                endGame();
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        timeElement.textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function endGame() {
    isGameActive = false;
    stopTimer();
    
    if (!bestTime || seconds < parseInt(bestTime)) {
        bestTime = seconds;
        localStorage.setItem('memoryBestTime', bestTime);
        bestElement.textContent = formatTime(bestTime);
    }
    
    setTimeout(() => {
        alert(`🎉 恭喜完成！\n步数: ${moves}\n时间: ${formatTime(seconds)}`);
    }, 500);
}

function startGame() {
    // 重置游戏状态
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isGameActive = true;
    
    movesElement.textContent = moves;
    timeElement.textContent = '00:00';
    stopTimer();
    
    // 清空游戏区域
    gameGrid.innerHTML = '';
    
    // 创建卡片对
    const cardPairs = [...EMOJIS, ...EMOJIS];
    shuffle(cardPairs);
    
    // 创建卡片元素
    cardPairs.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        cards.push(card);
        gameGrid.appendChild(card);
    });
    
    // 开始计时
    startTimer();
    
    startBtn.textContent = '重新开始';
}

startBtn.addEventListener('click', startGame);

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        startGame();
    }
});
