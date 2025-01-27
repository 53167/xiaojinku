document.addEventListener('DOMContentLoaded', function() {
    const fallingItemContainer = document.getElementById('game-area');
    let position = -50; // Initial position above the viewport
    let speed = 2; // Initial speed of falling
    const startGameBtn = document.getElementById('start-game-btn');
    const welcomePage = document.getElementById('welcome-page');
    const gamePage = document.getElementById('game-page');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const popup = document.getElementById('popup');
    const retryBtn = document.getElementById('retry-btn');
    let score = 0;
    let fallingItems = [];
    let gameInterval;
    let fallRequestId; // 添加一个变量来存储 requestAnimationFrame 的 ID
    let gameOver = false; // 添加一个变量来控制游戏是否结束
    let startTime; // 添加一个变量来记录游戏开始时间
    let elapsedTime; // 添加一个变量来记录经过的时间

    // Array of falling item images
    const fallingItemImages = ['yuanbao.png', 'hongbao.png', 'fudai.png', 'jintiao.png', 'zhuanshi.png', 'zhihongbao.png', 'dahongbao.png', 'bomb.png'];

    function createFallingItem() {
        const fallingItem = document.createElement('div');
        fallingItem.classList.add('falling-item');
        fallingItemContainer.appendChild(fallingItem);
        fallingItems.push({ element: fallingItem, position: -50 });
    }

    function fall() {
        updateSpeed(); // 更新速度
        fallingItems.forEach(item => {
            item.position += speed;
            item.element.style.top = item.position + 'px';

            if (item.position >= window.innerHeight) {
                resetFallingItem(item);
            }

            // Collision detection
            const playerRect = player.getBoundingClientRect();
            const fallingItemRect = item.element.getBoundingClientRect();

            if (isColliding(playerRect, fallingItemRect)) {
                handleCollision(item);
            }
        });

        fallRequestId = requestAnimationFrame(fall);
    }

    function resetFallingItem(item) {
        item.position = -50;
        item.element.style.top = item.position + 'px';
        const randomImage = fallingItemImages[Math.floor(Math.random() * fallingItemImages.length)];
        item.element.style.backgroundImage = `url(image/${randomImage})`;
        const randomLeft = Math.random() * (window.innerWidth - item.element.offsetWidth);
        item.element.style.left = randomLeft + 'px';
    }

    function isColliding(rect1, rect2, isBomb) {
        // 缩小碰撞检测区域
        const collisionPadding = isBomb ? 3 : 20; // 如果是炸弹，使用更小的碰撞内边距；否则使用20px
        const rect1Adjusted = {
            left: rect1.left + collisionPadding,
            right: rect1.right - collisionPadding,
            top: rect1.top + collisionPadding,
            bottom: rect1.bottom - collisionPadding
        };
        const rect2Adjusted = {
            left: rect2.left + collisionPadding,
            right: rect2.right - collisionPadding,
            top: rect2.top + collisionPadding,
            bottom: rect2.bottom - collisionPadding
        };

        return rect1Adjusted.left < rect2Adjusted.right &&
               rect1Adjusted.right > rect2Adjusted.left &&
               rect1Adjusted.top < rect2Adjusted.bottom &&
               rect1Adjusted.bottom > rect2Adjusted.top;
    }

    function handleCollision(item) {
        if (gameOver) return; // 如果游戏结束，不再处理碰撞

        const currentImage = item.element.style.backgroundImage.split('/').pop().split('"')[0];
        let points = 0; // 初始化积分
        const isBomb = currentImage === 'bomb.png'; // 判断是否为炸弹

        switch (currentImage) {
            case 'yuanbao.png':
                points = 10;
                break;
            case 'hongbao.png':
                points = 20;
                break;
            case 'fudai.png':
                points = 30;
                break;
            case 'jintiao.png':
                points = 40;
                break;
            case 'zhuanshi.png':
                points = 40;
                break;
            case 'zhihongbao.png':
                points = 50;
                break;
            case 'dahongbao.png':
                points = 50;
                break;
            case 'bomb.png':
                playSound('bomb-sound');
                endGame();
                return;
            default:
                points = 0;
        }

        playSound(isBomb ? 'bomb-sound' : 'music1'); // 根据是否为炸弹播放不同的音效
        score += points;
        scoreDisplay.textContent = (score / 10000).toFixed(2); // 更新分数显示，单位为万
        resetFallingItem(item);
    }

    function playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    function startGame() {
        welcomePage.style.display = 'none'; // 隐藏欢迎页
        gamePage.style.display = 'block'; // 显示游戏页
        score = 0;
        scoreDisplay.textContent = (score / 10000).toFixed(2); // 更新分数显示，单位为万
        fallingItems.forEach(item => item.element.remove());
        fallingItems = [];
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) { // 修改生成掉落物的数量为1到5之间
            createFallingItem();
        }
        // 初始化每个掉落物的位置
        fallingItems.forEach(item => resetFallingItem(item));
        speed = 1; // 重置掉落物速度
        startTime = Date.now(); // 记录游戏开始时间
        fall(); // 开始掉落物的动画
    }

    // 定义键盘事件处理函数
    function handleKeyDown(event) {
        if (event.key === 'ArrowLeft') {
            movePlayer(-10); // 向左移动
        } else if (event.key === 'ArrowRight') {
            movePlayer(10); // 向右移动
        }
    }

    // 定义触摸开始事件处理函数
    function handleTouchStart(event) {
        startX = event.touches[0].clientX;
    }

    // 定义触摸结束事件处理函数
    function handleTouchEnd(event) {
        const endX = event.changedTouches[0].clientX;
        if (endX < startX) {
            movePlayer(-10); // 向左移动
        } else if (endX > startX) {
            movePlayer(10); // 向右移动
        }
    }


    function endGame() {
        cancelAnimationFrame(fallRequestId); // 取消 requestAnimationFrame
        fallingItems.forEach(item => item.element.style.top = '-50px'); // Reset falling items position
        popup.style.display = 'block'; // 显示结算弹窗
        finalScoreDisplay.textContent = (score / 10000).toFixed(2); // 更新最终分数显示，单位为万
        gameOver = true; // 设置游戏结束标志


        // 删除键盘事件监听器
        document.removeEventListener('keydown', handleKeyDown);

        // 删除触摸事件监听器
        gamePage.removeEventListener('touchstart', handleTouchStart);
        gamePage.removeEventListener('touchend', handleTouchEnd);

        fallRequestId = null; // 重置 fallRequestId
    }

    // 添加点击事件监听器
    startGameBtn.addEventListener('click', startGame);

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 添加触摸事件监听器
    let startX = 0;
    gamePage.addEventListener('touchstart', handleTouchStart);
    gamePage.addEventListener('touchend', handleTouchEnd);

    function movePlayer(offset) {
        let currentLeft = parseInt(window.getComputedStyle(player).left, 10);
        let newLeft = currentLeft + offset;
        const playerWidth = player.offsetWidth; // 获取 player 的实际宽度
        const maxLeft = window.innerWidth - playerWidth; // 最大左侧位置
        const minLeft = -playerWidth / 3; // 最小左侧位置，允许三分之一超出屏幕

        if (newLeft >= minLeft && newLeft <= maxLeft + playerWidth / 3) { // 确保 player 的宽度在移动时不会超出游戏区域
            player.style.left = newLeft + 'px';
        }
    }

    // 添加再来！按钮事件监听器
    retryBtn.addEventListener('click', function() {
        popup.style.display = 'none'; // 隐藏结算弹窗
        startGame(); // 重新开始游戏

        // 重新添加键盘事件监听器
        document.addEventListener('keydown', handleKeyDown);

        // 重新添加触摸事件监听器
        gamePage.addEventListener('touchstart', handleTouchStart);
        gamePage.addEventListener('touchend', handleTouchEnd);

        gameOver = false; // 重置游戏结束标志
        speed = 1; // 重置掉落物速度
        startTime = Date.now(); // 重新记录游戏开始时间
    });

    // 更新速度函数
    function updateSpeed() {
        elapsedTime = (Date.now() - startTime) / 1000; // 计算经过的时间（秒）
        speed = 1 + elapsedTime * 0.1; // 根据时间增加速度
        if (speed > 20) { // 设置速度上限值为20
            speed = 20;
        }

        // 增加掉落物数量的逻辑
        const maxFallingItems = 20;
        const currentFallingItems = fallingItems.length;
        const timeBasedFallingItems = Math.floor(elapsedTime / 5) + 1; // 每5秒增加一个掉落物

        if (currentFallingItems < maxFallingItems && timeBasedFallingItems > currentFallingItems) {
            const additionalItems = Math.floor(Math.random() * 2) + 1; // 每次增加1到2个掉落物
            for (let i = 0; i < additionalItems && currentFallingItems + i < maxFallingItems; i++) {
                createFallingItem();
            }
        }
    }
});
