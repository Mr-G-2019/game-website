// 平滑滚动
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 更新活动状态
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// 滚动时更新导航
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// 游戏模态框
const modal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const modalTitle = document.getElementById('modalTitle');

const gameNames = {
    'snake': '贪吃蛇',
    'tetris': '俄罗斯方块',
    'memory': '记忆翻牌',
    'breakout': '打砖块',
    'flappy': '飞翔小鸟',
    'puzzle': '拼图游戏'
};

function openGame(gameId) {
    modalTitle.textContent = gameNames[gameId] || '游戏';
    gameFrame.src = `games/${gameId}/index.html`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGame() {
    modal.classList.remove('active');
    gameFrame.src = '';
    document.body.style.overflow = '';
}

// 点击模态框背景关闭
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeGame();
    }
});

// ESC 键关闭
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeGame();
    }
});

// 添加卡片点击效果
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// 页面加载动画
window.addEventListener('load', () => {
    document.querySelectorAll('.game-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = '';
        }, index * 100);
    });
});
