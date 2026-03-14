# 🎮 游戏乐园 - H5 小游戏合集

一个精美的 HTML5 小游戏合集网站，包含 6 款经典小游戏，支持桌面和移动端访问。

## 🌐 在线访问

**GitHub Pages**: https://Mr-G-2019.github.io/game

## 🎯 游戏列表

| 游戏 | 描述 | 类型 |
|------|------|------|
| 🐍 贪吃蛇 | 经典怀旧游戏，控制蛇吃食物变长 | 休闲 |
| 🧱 俄罗斯方块 | 消除方块，挑战高分 | 益智 |
| 🃏 记忆翻牌 | 考验记忆力，找出相同的牌 | 记忆 |
| 🏓 打砖块 | 控制挡板反弹球，击碎所有砖块 | 动作 |
| 🐦 飞翔小鸟 | 点击屏幕让小鸟飞翔，避开管道 | 休闲 |
| 🧩 拼图游戏 | 移动拼图块，还原完整图片 | 益智 |

## ✨ 特性

- 🎨 **精美界面** - 现代化渐变设计，视觉效果出色
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎮 **完整游戏体验** - 计分、计时、最高分记录
- 💾 **本地存储** - 自动保存游戏记录
- ⌨️ **多种控制** - 支持键盘、鼠标、触摸操作
- 🎯 **难度分级** - 拼图游戏支持 3 种难度

## 🚀 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **图形**: Canvas API
- **样式**: CSS 渐变、动画、Flexbox/Grid
- **存储**: LocalStorage

## 📁 项目结构

```
game-website/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── main.js             # 主页面逻辑
├── README.md           # 项目说明
└── games/              # 游戏目录
    ├── snake/          # 贪吃蛇
    │   ├── index.html
    │   └── snake.js
    ├── tetris/         # 俄罗斯方块
    │   ├── index.html
    │   └── tetris.js
    ├── memory/         # 记忆翻牌
    │   ├── index.html
    │   └── memory.js
    ├── breakout/       # 打砖块
    │   ├── index.html
    │   └── breakout.js
    ├── flappy/         # 飞翔小鸟
    │   ├── index.html
    │   └── flappy.js
    └── puzzle/         # 拼图游戏
        ├── index.html
        └── puzzle.js
```

## 🎮 游戏控制

### 贪吃蛇
- **方向键 / WASD**: 控制蛇的移动方向
- **空格**: 暂停/继续
- **触摸**: 屏幕按钮控制

### 俄罗斯方块
- **← → / A D**: 左右移动
- **↓ / S**: 加速下落
- **↑ / W / 空格**: 旋转
- **P**: 暂停

### 记忆翻牌
- **点击**: 翻开卡片

### 打砖块
- **← → / A D**: 移动挡板
- **鼠标**: 控制挡板位置
- **触摸**: 拖动控制

### 飞翔小鸟
- **空格 / 点击**: 飞翔

### 拼图游戏
- **点击**: 移动拼图块

## 🛠️ 本地运行

```bash
# 克隆仓库
git clone https://github.com/Mr-G-2019/game-website.git

# 进入目录
cd game-website

# 启动本地服务器
# Python 3
python -m http.server 8080

# 或 Node.js
npx serve .

# 访问 http://localhost:8080
```

## 📜 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 游戏设计灵感来自经典街机游戏
- 界面设计参考现代网页设计趋势
- 感谢开源社区的支持

---

Made with ❤️ by Mr-G-2019
