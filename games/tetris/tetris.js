const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// 方块形状定义
const SHAPES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,1,0],[0,1,1]], // S
    [[0,1,1],[1,1,0]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

const COLORS = [
    '#00f0f0', // I - cyan
    '#f0f000', // O - yellow
    '#a000f0', // T - purple
    '#00f000', // S - green
    '#f00000', // Z - red
    '#0000f0', // J - blue
    '#f0a000'  // L - orange
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let dropCounter = 0;
let lastTime = 0;

// 创建新方块
function createPiece() {
    const typeId = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[typeId],
        color: COLORS[typeId],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[typeId][0].length / 2),
        y: 0,
        typeId: typeId
    };
}

// 绘制方块
function drawBlock(ctx, x, y, color, size = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeRect(x * size, y * size, size, size);
    
    // 高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x * size, y * size, size, 3);
    ctx.fillRect(x * size, y * size, 3, size);
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            });
        });
        
        // 绘制阴影（预览落点）
        let ghostY = currentPiece.y;
        while (isValidMove(currentPiece.shape, currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        ctx.globalAlpha = 0.3;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, ghostY + y, currentPiece.color);
                }
            });
        });
        ctx.globalAlpha = 1;
    }
    
    // 绘制下一个方块
    nextCtx.fillStyle = '#0f0f23';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(nextCtx, offsetX + x, offsetY + y, nextPiece.color, 30);
                }
            });
        });
    }
}

// 碰撞检测
function isValidMove(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                if (newY >= 0 && board[newY][newX]) return false;
            }
        }
    }
    return true;
}

// 旋转方块
function rotate(piece) {
    const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    return rotated;
}

// 固定方块
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                if (boardY >= 0) {
                    board[boardY][currentPiece.x + x] = currentPiece.color;
                }
            }
        });
    });
}

// 清除完整行
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += [0, 100, 300, 600, 1000][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
    }
}

// 游戏主循环
function update(time = 0) {
    if (isPaused || isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    const dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    if (dropCounter > dropInterval) {
        if (isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createPiece();
            if (!isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
                gameOver();
                return;
            }
        }
        dropCounter = 0;
    }
    
    draw();
    gameLoop = requestAnimationFrame(update);
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    startBtn.textContent = '重新开始';
}

// 开始游戏
function startGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    isGameOver = false;
    isPaused = false;
    dropCounter = 0;
    lastTime = 0;
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    if (gameLoop) cancelAnimationFrame(gameLoop);
    update();
    startBtn.textContent = '重新开始';
}

// 暂停/继续
function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    if (!isPaused) {
        lastTime = performance.now();
        update();
    }
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (isGameOver || !currentPiece) return;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (isValidMove(currentPiece.shape, currentPiece.x - 1, currentPiece.y)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (isValidMove(currentPiece.shape, currentPiece.x + 1, currentPiece.y)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
                score += 1;
                scoreElement.textContent = score;
            }
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
            e.preventDefault();
            const rotated = rotate(currentPiece);
            if (isValidMove(rotated, currentPiece.x, currentPiece.y)) {
                currentPiece.shape = rotated;
            } else if (isValidMove(rotated, currentPiece.x - 1, currentPiece.y)) {
                currentPiece.shape = rotated;
                currentPiece.x--;
            } else if (isValidMove(rotated, currentPiece.x + 1, currentPiece.y)) {
                currentPiece.shape = rotated;
                currentPiece.x++;
            }
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
    draw();
});

// 移动端控制
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isGameOver || !currentPiece) return;
        const action = btn.dataset.action;
        
        switch(action) {
            case 'left':
                if (isValidMove(currentPiece.shape, currentPiece.x - 1, currentPiece.y)) {
                    currentPiece.x--;
                }
                break;
            case 'right':
                if (isValidMove(currentPiece.shape, currentPiece.x + 1, currentPiece.y)) {
                    currentPiece.x++;
                }
                break;
            case 'down':
                if (isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
                    currentPiece.y++;
                    score += 1;
                    scoreElement.textContent = score;
                }
                break;
            case 'rotate':
                const rotated = rotate(currentPiece);
                if (isValidMove(rotated, currentPiece.x, currentPiece.y)) {
                    currentPiece.shape = rotated;
                }
                break;
        }
        draw();
    });
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// 初始绘制
draw();
