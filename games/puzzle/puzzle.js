const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

// 游戏配置
let gridSize = 3;
let tileSize = canvas.width / gridSize;
let tiles = [];
let emptyTile = { row: 0, col: 0 };
let moves = 0;
let timer = null;
let seconds = 0;
let isGameActive = false;
let image = null;
let imageLoaded = false;

// 生成渐变色图案
function generatePattern() {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 400;
    patternCanvas.height = 400;
    const pCtx = patternCanvas.getContext('2d');
    
    // 背景渐变
    const gradient = pCtx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0, 0, 400, 400);
    
    // 绘制几何图案
    pCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    pCtx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
        pCtx.beginPath();
        pCtx.arc(200, 200, i * 25, 0, Math.PI * 2);
        pCtx.stroke();
    }
    
    // 绘制方块
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
                pCtx.fillStyle = 'rgba(255,255,255,0.1)';
                pCtx.fillRect(i * 80, j * 80, 80, 80);
            }
        }
    }
    
    // 添加数字
    pCtx.fillStyle = 'rgba(255,255,255,0.8)';
    pCtx.font = 'bold 30px Arial';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const num = row * gridSize + col + 1;
            if (num < gridSize * gridSize) {
                pCtx.fillText(
                    num,
                    col * (400 / gridSize) + (400 / gridSize) / 2,
                    row * (400 / gridSize) + (400 / gridSize) / 2
                );
            }
        }
    }
    
    return patternCanvas;
}

// 初始化游戏
function initGame() {
    tiles = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (row === gridSize - 1 && col === gridSize - 1) {
                emptyTile = { row, col };
            }
            tiles.push({
                row: row,
                col: col,
                correctRow: row,
                correctCol: col,
                isEmpty: row === gridSize - 1 && col === gridSize - 1
            });
        }
    }
}

// 打乱拼图
function shufflePuzzle() {
    // 确保可解：从完成状态开始，进行随机有效移动
    const shuffleMoves = gridSize === 3 ? 100 : gridSize === 4 ? 200 : 300;
    let lastMove = null;
    
    for (let i = 0; i < shuffleMoves; i++) {
        const neighbors = getNeighbors(emptyTile.row, emptyTile.col);
        const validNeighbors = neighbors.filter(n => 
            !(lastMove && n.row === lastMove.row && n.col === lastMove.col)
        );
        
        if (validNeighbors.length > 0) {
            const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            lastMove = { ...emptyTile };
            swapTiles(randomNeighbor.row, randomNeighbor.col, false);
        }
    }
}

// 获取相邻方块
function getNeighbors(row, col) {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    
    return neighbors;
}

// 交换方块
function swapTiles(row, col, countMove = true) {
    const tileIndex = tiles.findIndex(t => t.row === row && t.col === col);
    const emptyIndex = tiles.findIndex(t => t.isEmpty);
    
    if (tileIndex !== -1 && emptyIndex !== -1) {
        // 交换位置
        const tempRow = tiles[tileIndex].row;
        const tempCol = tiles[tileIndex].col;
        tiles[tileIndex].row = tiles[emptyIndex].row;
        tiles[tileIndex].col = tiles[emptyIndex].col;
        tiles[emptyIndex].row = tempRow;
        tiles[emptyIndex].col = tempCol;
        
        emptyTile = { row: tempRow, col: tempCol };
        
        if (countMove) {
            moves++;
            movesElement.textContent = moves;
        }
        
        draw();
        
        if (countMove && checkWin()) {
            endGame();
        }
    }
}

// 检查是否可移动
function canMove(row, col) {
    return (Math.abs(row - emptyTile.row) + Math.abs(col - emptyTile.col)) === 1;
}

// 绘制游戏
function draw() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    tileSize = canvas.width / gridSize;
    
    tiles.forEach(tile => {
        if (!tile.isEmpty) {
            // 绘制图片片段
            ctx.drawImage(
                image,
                tile.correctCol * (400 / gridSize),
                tile.correctRow * (400 / gridSize),
                400 / gridSize,
                400 / gridSize,
                tile.col * tileSize + 1,
                tile.row * tileSize + 1,
                tileSize - 2,
                tileSize - 2
            );
            
            // 边框
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                tile.col * tileSize,
                tile.row * tileSize,
                tileSize,
                tileSize
            );
        } else {
            // 空白格
            ctx.fillStyle = '#1a1a3e';
            ctx.fillRect(
                tile.col * tileSize,
                tile.row * tileSize,
                tileSize,
                tileSize
            );
        }
    });
}

// 检查获胜
function checkWin() {
    return tiles.every(tile => 
        tile.row === tile.correctRow && tile.col === tile.correctCol
    );
}

// 格式化时间
function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// 开始计时
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        timeElement.textContent = formatTime(seconds);
    }, 1000);
}

// 停止计时
function stopTimer() {
    clearInterval(timer);
}

// 游戏结束
function endGame() {
    isGameActive = false;
    stopTimer();
    
    // 显示完整图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 完成!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`步数: ${moves} | 时间: ${formatTime(seconds)}`, canvas.width / 2, canvas.height / 2 + 30);
}

// 开始游戏
function startGame() {
    moves = 0;
    seconds = 0;
    movesElement.textContent = moves;
    timeElement.textContent = '00:00';
    stopTimer();
    
    image = generatePattern();
    imageLoaded = true;
    
    // 绘制预览
    previewCtx.drawImage(image, 0, 0, 150, 150);
    
    initGame();
    shufflePuzzle();
    draw();
    
    isGameActive = true;
    startTimer();
}

// 点击处理
canvas.addEventListener('click', (e) => {
    if (!isGameActive) {
        if (!imageLoaded) startGame();
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    
    if (canMove(row, col)) {
        swapTiles(row, col);
    }
});

// 难度选择
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gridSize = parseInt(btn.dataset.size);
        isGameActive = false;
        stopTimer();
        imageLoaded = false;
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        previewCtx.clearRect(0, 0, 150, 150);
        moves = 0;
        seconds = 0;
        movesElement.textContent = moves;
        timeElement.textContent = '00:00';
    });
});

startBtn.addEventListener('click', startGame);
shuffleBtn.addEventListener('click', () => {
    if (isGameActive) {
        shufflePuzzle();
        draw();
    }
});

// 初始状态
ctx.fillStyle = '#0f0f23';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('点击"开始游戏"开始', canvas.width / 2, canvas.height / 2);
