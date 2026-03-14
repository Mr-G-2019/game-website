const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');

// 游戏配置
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 35;

// 游戏状态
let paddle = { x: canvas.width / 2 - PADDLE_WIDTH / 2, y: canvas.height - 30 };
let ball = { x: canvas.width / 2, y: canvas.height - 50, dx: 4, dy: -4 };
let bricks = [];
let score = 0;
let lives = 3;
let level = 1;
let isGameRunning = false;
let animationId = null;
let rightPressed = false;
let leftPressed = false;

// 砖块颜色
const BRICK_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

// 初始化砖块
function initBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks.push({
                x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
                y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
                status: 1,
                color: BRICK_COLORS[r % BRICK_COLORS.length]
            });
        }
    }
}

// 绘制挡板
function drawPaddle() {
    ctx.fillStyle = '#667eea';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, 3);
    ctx.shadowBlur = 0;
}

// 绘制球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#f093fb';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f093fb';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
    
    // 球内高光
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.closePath();
}

// 绘制砖块
function drawBricks() {
    bricks.forEach(brick => {
        if (brick.status === 1) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
            
            // 高光
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, 3);
            ctx.fillRect(brick.x, brick.y, 3, BRICK_HEIGHT);
            
            // 阴影
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(brick.x, brick.y + BRICK_HEIGHT - 3, BRICK_WIDTH, 3);
            ctx.fillRect(brick.x + BRICK_WIDTH - 3, brick.y, 3, BRICK_HEIGHT);
        }
    });
}

// 绘制背景
function drawBackground() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 网格效果
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// 碰撞检测
function collisionDetection() {
    bricks.forEach(brick => {
        if (brick.status === 1) {
            if (ball.x > brick.x && ball.x < brick.x + BRICK_WIDTH &&
                ball.y > brick.y && ball.y < brick.y + BRICK_HEIGHT) {
                ball.dy = -ball.dy;
                brick.status = 0;
                score += 10;
                scoreElement.textContent = score;
                
                // 检查关卡完成
                if (bricks.every(b => b.status === 0)) {
                    nextLevel();
                }
            }
        }
    });
}

// 下一关
function nextLevel() {
    level++;
    levelElement.textContent = level;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 4 + level * 0.5;
    ball.dy = -(4 + level * 0.5);
    initBricks();
}

// 更新游戏状态
function update() {
    if (!isGameRunning) return;
    
    // 挡板移动
    if (rightPressed && paddle.x < canvas.width - PADDLE_WIDTH) {
        paddle.x += 8;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 8;
    }
    
    // 球的移动
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 墙壁碰撞
    if (ball.x + ball.dx > canvas.width - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < BALL_RADIUS) {
        ball.dy = -ball.dy;
    }
    
    // 挡板碰撞
    if (ball.y + ball.dy > canvas.height - BALL_RADIUS - PADDLE_HEIGHT - 10 &&
        ball.x > paddle.x && ball.x < paddle.x + PADDLE_WIDTH) {
        // 根据击中位置改变角度
        const hitPoint = (ball.x - paddle.x) / PADDLE_WIDTH;
        ball.dx = 8 * (hitPoint - 0.5);
        ball.dy = -ball.dy;
        
        // 加速
        ball.dy *= 1.02;
    }
    
    // 掉落检测
    if (ball.y + ball.dy > canvas.height - BALL_RADIUS) {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            gameOver();
        } else {
            resetBall();
        }
    }
    
    collisionDetection();
}

// 更新生命值显示
function updateLivesDisplay() {
    livesElement.textContent = '❤️'.repeat(lives);
}

// 重置球位置
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = canvas.width / 2 - PADDLE_WIDTH / 2;
}

// 游戏主循环
function gameLoop() {
    drawBackground();
    drawBricks();
    drawPaddle();
    drawBall();
    update();
    
    if (isGameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
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
    score = 0;
    lives = 3;
    level = 1;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    updateLivesDisplay();
    
    resetBall();
    initBricks();
    
    isGameRunning = true;
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
    
    startBtn.textContent = '重新开始';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = false;
    }
});

// 鼠标控制
canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - PADDLE_WIDTH / 2;
    }
});

// 触摸控制（移动端）
canvas.addEventListener('touchmove', (e) => {
    if (!isGameRunning) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - PADDLE_WIDTH / 2;
    }
});

// 移动端按钮控制
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === 'left') leftPressed = true;
        if (action === 'right') rightPressed = true;
    });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === 'left') leftPressed = false;
        if (action === 'right') rightPressed = false;
    });
    
    btn.addEventListener('mousedown', () => {
        const action = btn.dataset.action;
        if (action === 'left') leftPressed = true;
        if (action === 'right') rightPressed = true;
    });
    
    btn.addEventListener('mouseup', () => {
        const action = btn.dataset.action;
        if (action === 'left') leftPressed = false;
        if (action === 'right') rightPressed = false;
    });
});

startBtn.addEventListener('click', startGame);

// 初始绘制
initBricks();
drawBackground();
drawBricks();
drawPaddle();
drawBall();
