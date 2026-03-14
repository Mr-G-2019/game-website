const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

// 游戏配置
const GRAVITY = 0.25;
const JUMP = -5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 120;
const PIPE_GAP = 120;
const PIPE_WIDTH = 50;

// 游戏状态
let bird = { x: 50, y: 150, velocity: 0, radius: 12 };
let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let frame = 0;
let isGameRunning = false;
let animationId = null;

highScoreElement.textContent = highScore;

// 绘制背景
function drawBackground() {
    // 天空渐变已在CSS中设置
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    
    // 云朵
    for (let i = 0; i < 5; i++) {
        const x = (frame * 0.5 + i * 80) % (canvas.width + 100) - 50;
        const y = 50 + i * 30;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 20, y - 10, 25, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制小鸟
function drawBird() {
    // 身体
    ctx.fillStyle = '#f4d03f';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + 7, bird.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(bird.x + 8, bird.y + 2);
    ctx.lineTo(bird.x + 18, bird.y + 5);
    ctx.lineTo(bird.x + 8, bird.y + 8);
    ctx.fill();
    
    // 翅膀
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(bird.x - 5, bird.y + 2, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制管道
function drawPipes() {
    ctx.fillStyle = '#73bf2e';
    
    pipes.forEach(pipe => {
        // 上管道
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#a0de6e';
        ctx.fillRect(pipe.x + 5, 0, 5, pipe.topHeight);
        ctx.fillStyle = '#5a9c1c';
        ctx.fillRect(pipe.x + PIPE_WIDTH - 10, 0, 5, pipe.topHeight);
        
        // 上管道口
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, PIPE_WIDTH + 6, 20);
        
        // 下管道
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
        ctx.fillStyle = '#a0de6e';
        ctx.fillRect(pipe.x + 5, canvas.height - pipe.bottomHeight, 5, pipe.bottomHeight);
        ctx.fillStyle = '#5a9c1c';
        ctx.fillRect(pipe.x + PIPE_WIDTH - 10, canvas.height - pipe.bottomHeight, 5, pipe.bottomHeight);
        
        // 下管道口
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(pipe.x - 3, canvas.height - pipe.bottomHeight, PIPE_WIDTH + 6, 20);
    });
}

// 生成管道
function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomHeight: canvas.height - topHeight - PIPE_GAP,
        passed: false
    });
}

// 碰撞检测
function checkCollision() {
    // 地面和天花板碰撞
    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
        return true;
    }
    
    // 管道碰撞
    for (let pipe of pipes) {
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + PIPE_WIDTH) {
            if (bird.y - bird.radius < pipe.topHeight || 
                bird.y + bird.radius > canvas.height - pipe.bottomHeight) {
                return true;
            }
        }
    }
    
    return false;
}

// 更新游戏状态
function update() {
    if (!isGameRunning) return;
    
    frame++;
    
    // 更新小鸟
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    
    // 生成管道
    if (frame % PIPE_SPAWN_RATE === 0) {
        spawnPipe();
    }
    
    // 更新管道
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;
        
        // 计分
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
        }
    });
    
    // 移除屏幕外管道
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
    
    // 碰撞检测
    if (checkCollision()) {
        gameOver();
    }
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawPipes();
    drawBird();
    update();
    
    if (isGameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 跳跃
function jump() {
    if (!isGameRunning) {
        startGame();
        return;
    }
    bird.velocity = JUMP;
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
    bird = { x: 50, y: 150, velocity: 0, radius: 12 };
    pipes = [];
    score = 0;
    frame = 0;
    scoreElement.textContent = score;
    
    isGameRunning = true;
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
    
    startBtn.textContent = '重新开始';
}

// 事件监听
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

startBtn.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    }
});

// 初始绘制
drawBackground();
drawBird();
