/* ═══════════════════════════════════════════════════════════════
   赛博朋克生日贺卡 - 主程序
   script.js
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   【配置区】所有可自定义参数 - 修改这里即可定制贺卡
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
    // ═══ 1. 朋友名字 ═══
    friendName: "叉烧",

    // ═══ 2. 祝福语列表 (每条占一行) ═══
    wishes: [
        "SYSTEM ALERT: 检测到超可爱的生物！",
        "今日任务：享受被爱包围的一天",
        "BUG修复完成：所有忧伤已清除",
        "新成就解锁：成为世界上最幸福的人",
        "愿你的每一天都像今天的蛋糕一样甜",
        "内存警告：快乐值已溢出！",
        "系统提示：值得拥有最好的一切",
        "HAPPY BIRTHDAY! 生日快乐呀！"
    ],

    // ═══ 3. 弹幕祝福语（多元化内容池） ═══
    danmakuMessages: [
        // === 中文祝福 ===
        "🎂 生日快乐",
        "✨ 永远18岁",
        "💖 健康幸福",
        "🌟 梦想成真",
        "🎉 开心每一天",
        "💫 好运连连",
        "🎁 心想事成",
        "💝 被爱包围",
        "🏆 最棒的自己",
        "🌈 精彩人生",
        "🥳 永远年轻",
        "💐 前程似锦",
        "🎈 万事胜意",
        "🌸 平安喜乐",
        "💎 闪闪发光",

        // === 英文赛博风 ===
        "HAPPY BIRTHDAY",
        "YOU ARE AMAZING",
        "SHINE BRIGHT",
        "DREAM BIG",
        "BE YOURSELF",
        "NEON VIBES",
        "CYBER QUEEN",
        "GLOW UP",

        // === 极客/代码风 ===
        "01010110 生日",
        ">> ACCESS GRANTED",
        "[BOOT] LOVE.exe",
        "const joy = ∞",
        "// TODO: happiness",
        "ping: <3",
        "404: sad NOT found",
        "while(true) smile",

        // === 大表情 ===
        "🎂",
        "💖",
        "✨",
        "🎉",
        "🌟",
        "🎁",
        "🥳",
        "💫",

        // === 装饰符号 ===
        "═══════════════",
        "★ · ★ · ★ · ★",
        ">>><<<",
        "▼▲▼▲▼▲",
        "┏━┓┏━┓"
    ],

    // ═══ 4. 照片画廊列表 ═══
    // 替换示例: [{src: 'photo1.jpg', alt: '我们的合照1'}, ...]
    galleryImages: [
        { src: '', alt: '照片 1' },  // 【此处替换为照片1的URL或本地路径】
        { src: '', alt: '照片 2' },  // 【此处替换为照片2的URL或本地路径】
        { src: '', alt: '照片 3' }   // 【此处替换为照片3的URL或本地路径】
    ],

    // ═══ 5. 动画参数 ═══
    typewriterSpeed: 80,        // 打字速度 (ms/字)
    particleCount: 50,          // 粒子数量
    glitchEnabled: true,        // Glitch效果开关
    scanlineEnabled: true,      // 扫描线开关
    particlesEnabled: true,     // 粒子背景开关

    // ═══ 6. Matrix彩蛋触发次数 ═══
    matrixClickRequired: 5
};

/* ─────────────────────────────────────────────────────────────
   全局变量
   ───────────────────────────────────────────────────────────── */
let mouseX = 0, mouseY = 0;
let particles = [];
let currentGalleryIndex = 0;
let titleClickCount = 0;
let isUnlocked = false;
let currentProgress = 0;
let animationId = null;
let matrixAnimationId = null;

/* 祝福语打字机动画本次会话是否已播放过 */
let wishesTypedOnce = false;

/* 从太空回忆录返回时使用：跳过开机加载动画，直接回到主界面 */
const SKIP_BOOT_KEY = 'birthday.skipBoot';

/**
 * 标记“即将进入太空回忆录”，返回时据此跳过开机动画
 */
function setSkipBootFlag() {
    try { sessionStorage.setItem(SKIP_BOOT_KEY, '1'); } catch (err) { /* 隐私模式下忽略 */ }
}

/**
 * 读取并清除标记，返回本次是否需要跳过开机动画
 */
function consumeSkipBootFlag() {
    try {
        const flagged = sessionStorage.getItem(SKIP_BOOT_KEY) === '1';
        sessionStorage.removeItem(SKIP_BOOT_KEY);
        return flagged;
    } catch (err) {
        return false;
    }
}

/* ─────────────────────────────────────────────────────────────
   DOM元素引用
   ───────────────────────────────────────────────────────────── */
const elements = {
    bootScreen: document.getElementById('boot-screen'),
    bootTexts: document.getElementById('boot-texts'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    pressKey: document.getElementById('press-key'),
    mainContent: document.getElementById('main-content'),
    mainTitle: document.getElementById('main-title'),
    wishesContainer: document.getElementById('wishes-container'),
    btnGallery: document.getElementById('btn-gallery'),
    btnDanmaku: document.getElementById('btn-danmaku'),
    btnMilktea: document.getElementById('btn-milktea'),
    galleryModal: document.getElementById('gallery-modal'),
    galleryImage: document.getElementById('gallery-image'),
    galleryPrev: document.getElementById('gallery-prev'),
    galleryNext: document.getElementById('gallery-next'),
    galleryClose: document.getElementById('gallery-close'),
    milkteaModal: document.getElementById('milktea-modal'),
    milkteaClose: document.getElementById('milktea-close'),
    danmakuContainer: document.getElementById('danmaku-container'),
    particleCanvas: document.getElementById('particle-canvas'),
    matrixCanvas: document.getElementById('matrix-canvas'),
    scanlines: document.getElementById('scanlines')
};

/* ─────────────────────────────────────────────────────────────
   【阶段1】启动加载动画
   ───────────────────────────────────────────────────────────── */
const bootMessages = [
    { text: 'INITIALIZING SECRET GIFT SYSTEM...', status: 'OK' },
    { text: 'DECRYPTING BIRTHDAY ARCHIVE...', status: 'OK' },
    { text: 'LOADING PERSONAL MEMORY PACKAGE...', status: 'OK' },
    { text: 'BYPASSING FIREWALL PROTOCOL...', status: 'OK' },
    { text: 'COMPILING JOY.exe v2026.10.22', status: 'OK' },
    { text: 'CHECKING USER CREDENTIALS...', status: 'OK' },
    { text: 'RENDERING NEON BIRTHDAY ANIMATION...', status: 'OK' },
    { text: 'LOADING LOVE.dll ........... [100%]', status: 'DONE' },
    { text: 'SYSTEM READY. WELCOME, USER.', status: 'GRANTED' }
];

/**
 * 生成时间戳字符串 (模拟真实终端日志)
 */
function getTimestamp() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `[${h}:${m}:${s}.${ms}]`;
}

/**
 * 使用 requestAnimationFrame 实现真正流畅的打字效果
 * 相比 setTimeout 的优势：与浏览器刷新率同步，不会卡顿
 */
function typewriterEffect(text, speed = 50, onCharTyped = null) {
    return new Promise(resolve => {
        // 准备容器结构：时间戳 + 前缀 + 文本 + 光标
        const line = document.createElement('div');
        line.className = 'boot-text';
        line.innerHTML = `<span class="timestamp">${getTimestamp()}</span><span class="line-prefix">$</span><span class="text-content"></span>`;
        elements.bootTexts.appendChild(line);

        // 触发动画（先添加到DOM，再加 visible 触发淡入）
        requestAnimationFrame(() => {
            line.classList.add('visible');
        });

        const textContent = line.querySelector('.text-content');
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        textContent.appendChild(cursor);

        let charIndex = 0;
        let lastTime = 0;

        function typeStep(currentTime) {
            if (!lastTime) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;

            // 每speed毫秒输入一个字符
            if (deltaTime >= speed) {
                if (charIndex < text.length) {
                    // 在光标位置前插入字符
                    const char = text.charAt(charIndex);
                    const charNode = document.createTextNode(char);
                    textContent.insertBefore(charNode, cursor);
                    charIndex++;
                    lastTime = currentTime;

                    // 每输入一个字符，触发回调（用于同步进度条等）
                    if (onCharTyped) {
                        onCharTyped(charIndex, text.length);
                    }

                    // 保持光标可见（避免在动画过程中光标意外消失）
                    cursor.style.animationPlayState = 'running';
                } else {
                    // 打字完成，移除光标
                    cursor.remove();
                    resolve();
                    return;
                }
            }

            requestAnimationFrame(typeStep);
        }

        requestAnimationFrame(typeStep);
    });
}

/**
 * 启动进度条（字符驱动版）
 * 进度 = 已输入字符数 / 总字符数
 * 做到"字输入完，进度条也满"的完美同步
 */
function updateProgressByChar(typedChars, totalChars) {
    // 字符越少，每字推进越多；字符总数推进到 100%
    const percent = totalChars > 0 ? (typedChars / totalChars) * 100 : 0;
    currentProgress = percent;
    elements.progressFill.style.width = percent.toFixed(2) + '%';
    elements.progressText.textContent = Math.floor(percent) + '%';
}

/**
 * 启动序列主函数
 * 进度条和打字机完美同步：每输入一个字，进度条推进一格
 * 字全部打完，进度条刚好 100%
 */
async function runBootSequence() {
    const baseSpeed = Math.max(20, CONFIG.typewriterSpeed * 0.7);
    const lineDelay = 200; // 行间停顿

    // 1. 预计算总字符数（启动序列所有文字的字数总和）
    const totalChars = bootMessages.reduce((sum, msg) => sum + msg.text.length, 0);
    let typedChars = 0;

    // 2. 起始缓冲
    await sleep(200);

    // 3. 逐行输出启动日志
    for (let i = 0; i < bootMessages.length; i++) {
        const message = bootMessages[i];

        // 打字输出当前行（每个字符都同步更新进度条）
        await typewriterEffect(message.text, baseSpeed, () => {
            typedChars++;
            updateProgressByChar(typedChars, totalChars);
        });

        // 添加状态标签
        const line = elements.bootTexts.lastElementChild;
        if (line && message.status) {
            const statusSpan = document.createElement('span');
            statusSpan.className = 'status';
            statusSpan.textContent = ` [${message.status}]`;
            line.querySelector('.text-content').appendChild(statusSpan);
        }

        // 行间停顿（最后一行打字完成时，进度条已 100%）
        await sleep(lineDelay);
    }

    // 4. 最终进度条闪动
    elements.progressFill.style.boxShadow = '0 0 30px var(--neon-pink)';
    await sleep(300);
    elements.progressFill.style.boxShadow = '0 0 20px var(--neon-cyan)';

    // 5. 显示点击提示
    elements.pressKey.classList.remove('hidden');
}

/**
 * 工具函数：延时
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─────────────────────────────────────────────────────────────
   【阶段2】解锁并显示主内容
   ───────────────────────────────────────────────────────────── */
/**
 * 从太空回忆录返回：跳过开机加载动画，直接显示主界面
 * 保留一点点淡入效果，让返回过程不至于生硬
 */
async function showMainContentDirectly() {
    if (isUnlocked) return;
    isUnlocked = true;

    // 立刻移除启动页（不用等它淡出，避免和主界面叠在一起）
    elements.bootScreen.classList.add('hidden');
    elements.bootScreen.style.display = 'none';

    // 显示主内容
    elements.mainContent.classList.add('visible');

    // 更新标题
    elements.mainTitle.textContent = `生日快乐呀！${CONFIG.friendName}`;

    // 逐行显示祝福语
    await showWishes();
}

/**
 * 点击解锁，触发解锁动画
 */
async function unlockAndShow() {
    if (isUnlocked) return;
    isUnlocked = true;

    // 屏幕故障闪烁
    document.body.classList.add('glitch-flash');
    await sleep(300);
    document.body.classList.remove('glitch-flash');

    // 隐藏启动页
    elements.bootScreen.classList.add('hidden');

    // 显示主内容
    elements.mainContent.classList.add('visible');

    // 更新标题
    elements.mainTitle.textContent = `生日快乐呀！${CONFIG.friendName}`;

    // 逐行显示祝福语
    await showWishes();
}

/**
 * 使用 requestAnimationFrame 实现流畅的祝福语打字效果
 */
function typewriterWish(text, speed = 60) {
    return new Promise(resolve => {
        const wishLine = document.createElement('div');
        wishLine.className = 'wish-line';
        wishLine.innerHTML = '<span class="text-content"></span>';
        elements.wishesContainer.appendChild(wishLine);

        const textContent = wishLine.querySelector('.text-content');
        const cursor = document.createElement('span');
        cursor.className = 'cursor-small';
        textContent.appendChild(cursor);

        let charIndex = 0;
        let lastTime = 0;

        function typeStep(currentTime) {
            if (!lastTime) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= speed) {
                if (charIndex < text.length) {
                    const char = text.charAt(charIndex);
                    textContent.insertBefore(document.createTextNode(char), cursor);
                    charIndex++;
                    lastTime = currentTime;
                } else {
                    // 完成，移除光标
                    cursor.remove();
                    resolve();
                    return;
                }
            }

            requestAnimationFrame(typeStep);
        }

        requestAnimationFrame(typeStep);
    });
}

/**
 * 祝福语只在本次会话的第一次加载时播放打字机动画，
 * 再次进入（从太空回忆录返回、刷新页面）直接整段显示。
 */
const WISHES_TYPED_KEY = 'birthday.wishesTyped';

/**
 * 本次会话是否已经播放过祝福语打字动画
 */
function hasTypedWishes() {
    try { return sessionStorage.getItem(WISHES_TYPED_KEY) === '1'; } catch (err) { return false; }
}

function markWishesTyped() {
    try { sessionStorage.setItem(WISHES_TYPED_KEY, '1'); } catch (err) { /* 隐私模式下忽略 */ }
}

async function showWishes() {
    // 已经打过字了：直接整段渲染，不再动画
    if (wishesTypedOnce) {
        renderWishesInstantly();
        return;
    }

    const speed = Math.max(30, CONFIG.typewriterSpeed * 0.6);

    for (let i = 0; i < CONFIG.wishes.length; i++) {
        // 先淡入行容器
        const wishLine = elements.wishesContainer.lastElementChild;
        if (wishLine) {
            requestAnimationFrame(() => wishLine.classList.add('visible'));
        }

        // 打字效果
        await typewriterWish(CONFIG.wishes[i], speed);

        // 行间短暂停顿
        await sleep(180);
    }

    wishesTypedOnce = true;
    markWishesTyped();
}

/**
 * 直接把所有祝福语一次性渲染出来（无打字机效果）
 */
function renderWishesInstantly() {
    elements.wishesContainer.innerHTML = '';

    CONFIG.wishes.forEach((wish) => {
        const line = document.createElement('div');
        line.className = 'wish-line visible';
        line.innerHTML = '<span class="text-content"></span>';
        line.querySelector('.text-content').textContent = wish;
        elements.wishesContainer.appendChild(line);
    });
}

/* ─────────────────────────────────────────────────────────────
   【交互功能】图片画廊
   ───────────────────────────────────────────────────────────── */
/**
 * 打开记忆相册 - 跳转到独立的太空回忆录页面
 */
function openGallery() {
    setSkipBootFlag();
    window.location.href = 'space-memory.html';
}

/**
 * 关闭画廊
 */
function closeGallery() {
    elements.galleryModal.classList.remove('visible');
}

/**
 * 打开奶茶祝福弹窗
 */
function openMilktea() {
    if (!elements.milkteaModal) return;
    elements.milkteaModal.classList.add('visible');
}

/**
 * 关闭奶茶祝福弹窗
 */
function closeMilktea() {
    if (!elements.milkteaModal) return;
    elements.milkteaModal.classList.remove('visible');
}

/**
 * 更新画廊当前图片
 */
function updateGalleryImage() {
    const image = CONFIG.galleryImages[currentGalleryIndex];
    const container = elements.galleryImage;

    if (image.src) {
        container.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
    } else {
        // SVG占位符
        container.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#0d0d1a"/>
                <circle cx="100" cy="80" r="40" fill="#22d3ee" opacity="0.3"/>
                <rect x="50" y="130" width="100" height="50" rx="5" fill="#ff4dd2" opacity="0.3"/>
                <text x="100" y="195" text-anchor="middle" fill="#a78bfa" font-size="12" font-family="monospace">
                    [照片 ${currentGalleryIndex + 1}/${CONFIG.galleryImages.length}]
                </text>
            </svg>
        `;
    }
}

/**
 * 上一张图片
 */
function prevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + CONFIG.galleryImages.length) % CONFIG.galleryImages.length;
    updateGalleryImage();
}

/**
 * 下一张图片
 */
function nextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % CONFIG.galleryImages.length;
    updateGalleryImage();
}

/* ─────────────────────────────────────────────────────────────
   【交互功能】弹幕效果
   ───────────────────────────────────────────────────────────── */
/**
 * 弹幕样式配置
 * 全部使用无边框、纯发光或纯字效的样式，避免方框抢眼
 */
const DANMAKU_STYLES = [
    { className: 'danmaku-style-default',   weight: 40 },  // 默认霓虹
    { className: 'danmaku-style-emoji',     weight: 18 },  // 大表情
    { className: 'danmaku-style-gradient',  weight: 18 },  // 渐变光带
    { className: 'danmaku-style-glitch',    weight: 14 },  // 故障风
    { className: 'danmaku-style-huge',      weight: 10 }   // 巨型字
];

const DANMAKU_COLORS = [
    '#22d3ee', // 青
    '#ff4dd2', // 粉
    '#a78bfa', // 紫
    '#00ff9f', // 绿
    '#fbbf24', // 黄
    '#f472b6', // 浅粉
    '#60a5fa', // 蓝
    '#34d399'  // 翠绿
];

/**
 * 按权重随机选择弹幕样式
 */
function pickRandomStyle() {
    const totalWeight = DANMAKU_STYLES.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const style of DANMAKU_STYLES) {
        rand -= style.weight;
        if (rand <= 0) return style.className;
    }
    return DANMAKU_STYLES[0].className;
}

/**
 * 弹幕轨道锁：同一垂直位置在同一时刻只能有一条弹幕
 * 防止横向飞行的弹幕在同一轨道上前后重叠
 */
const TRACK_COUNT = 12;
const TRACK_HEIGHT = 100 / TRACK_COUNT;     // 每条轨道高度 ~8.33%
const TRACK_PADDING_MS = 300;               // 额外缓冲（条与条之间留 0.3s 空白）
const trackLockedUntil = new Array(TRACK_COUNT).fill(0);

// 各样式的动画时长（ms），用于精确锁定轨道
const STYLE_DURATION = {
    'danmaku-style-default':  10000,
    'danmaku-style-emoji':     8000,
    'danmaku-style-gradient': 12000,
    'danmaku-style-glitch':    9000,
    'danmaku-style-huge':     14000
};

// 垂直上升弹幕的 X 轴轨道锁：5 个槽位，水平方向不重叠
const VERTICAL_TRACKS = 5;
const VERTICAL_X_MIN = 10;
const VERTICAL_X_MAX = 80;
const VERTICAL_TRACK_WIDTH = (VERTICAL_X_MAX - VERTICAL_X_MIN) / VERTICAL_TRACKS;
const VERTICAL_DURATION = 5000; // 与 danmaku-rise 动画时长一致
const verticalLockedUntil = new Array(VERTICAL_TRACKS).fill(0);

function getAvailableVerticalTrack() {
    const now = Date.now();
    for (let i = 0; i < VERTICAL_TRACKS; i++) {
        if (verticalLockedUntil[i] <= now) return i;
    }
    return -1;
}

/**
 * 寻找当前可用的轨道
 * @returns {number} 轨道下标；返回 -1 表示全部被占
 */
function getAvailableTrack() {
    const now = Date.now();
    for (let i = 0; i < TRACK_COUNT; i++) {
        if (trackLockedUntil[i] <= now) return i;
    }
    return -1;
}

/**
 * 寻找最早释放的轨道（用于全部被占时的回退策略）
 */
function getEarliestFreeTrack() {
    let minIdx = 0;
    for (let i = 1; i < TRACK_COUNT; i++) {
        if (trackLockedUntil[i] < trackLockedUntil[minIdx]) minIdx = i;
    }
    return minIdx;
}

/**
 * 创建单条弹幕
 */
function createDanmakuItem() {
    const container = elements.danmakuContainer;
    const item = document.createElement('div');

    // 随机选择样式和颜色
    const styleClass = pickRandomStyle();
    const color = DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)];
    const text = CONFIG.danmakuMessages[Math.floor(Math.random() * CONFIG.danmakuMessages.length)];

    item.className = `danmaku-item ${styleClass}`;
    item.textContent = text;
    item.style.color = color;

    // 找到未被占用的轨道；全占则等最早释放的那条
    let track = getAvailableTrack();
    if (track === -1) {
        track = getEarliestFreeTrack();
        const waitMs = Math.max(0, trackLockedUntil[track] - Date.now() + 50);
        setTimeout(createDanmakuItem, waitMs);
        return;
    }
    item.style.top = (track * TRACK_HEIGHT) + '%';
    // 锁定该轨道，精确时长 = 该样式动画时长 + 缓冲
    const lockMs = (STYLE_DURATION[styleClass] || 10000) + TRACK_PADDING_MS;
    trackLockedUntil[track] = Date.now() + lockMs;

    // 巨型字和emoji：50% 概率垂直上升式（从屏幕底部），需占用 X 槽位
    if (styleClass === 'danmaku-style-emoji' || styleClass === 'danmaku-style-huge') {
        const vTrack = getAvailableVerticalTrack();
        if (vTrack !== -1 && Math.random() < 0.5) {
            // 占用该 X 槽位
            verticalLockedUntil[vTrack] = Date.now() + VERTICAL_DURATION + TRACK_PADDING_MS;
            const leftPct = VERTICAL_X_MIN + vTrack * VERTICAL_TRACK_WIDTH + VERTICAL_TRACK_WIDTH / 2;
            item.style.top = 'auto';
            item.style.bottom = '10%';
            item.style.left = leftPct + '%';
            item.style.animation = 'danmaku-rise ' + VERTICAL_DURATION + 'ms ease-out forwards';
        } else {
            // 无空槽位或随机数走横向：仍走横向，但垂直位置取低一些的轨道避免遮挡
            item.style.top = (track * TRACK_HEIGHT) + '%';
        }
    }

    // 渐变和故障风有时反方向
    if ((styleClass === 'danmaku-style-gradient' || styleClass === 'danmaku-style-glitch') && Math.random() < 0.3) {
        const originalTransform = item.style.transform || '';
        item.style.transform = 'scaleX(-1)';
    }

    container.appendChild(item);

    // 动画结束后清理（给到充足时间，远大于最长动画时长）
    const duration = 15000;
    setTimeout(() => {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 800);
    }, duration);
}

/**
 * 生成弹幕雨：分层 + 持续 + 多样
 * 节奏：每条之间留更多间隙，整体更舒缓、不扎堆
 */
function spawnDanmaku() {
    // 第一波：12 条弹幕散开放出（每条 350ms 间隔，比之前的 80ms 慢 4 倍）
    const burstCount = 12;
    for (let i = 0; i < burstCount; i++) {
        setTimeout(createDanmakuItem, i * 350 + Math.random() * 200);
    }

    // 第二波：8 条持续补充（每条 1500ms 间隔，让弹幕不密集）
    let supplementCount = 0;
    const supplementInterval = setInterval(() => {
        createDanmakuItem();
        supplementCount++;
        if (supplementCount >= 8) {
            clearInterval(supplementInterval);
        }
    }, 1500);
}

/* ─────────────────────────────────────────────────────────────
   【隐藏彩蛋】Matrix数字雨
   ───────────────────────────────────────────────────────────── */
/**
 * Matrix特效触发检测
 */
function handleTitleClick() {
    titleClickCount++;
    if (titleClickCount >= CONFIG.matrixClickRequired) {
        triggerMatrix();
        titleClickCount = 0;
    }

    // 重置计数器（3秒内没达到次数则重置）
    setTimeout(() => {
        if (titleClickCount < CONFIG.matrixClickRequired) {
            titleClickCount = 0;
        }
    }, 3000);
}

/**
 * 触发Matrix数字雨特效
 */
function triggerMatrix() {
    const canvas = elements.matrixCanvas;
    const ctx = canvas.getContext('2d');

    // 全屏显示
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.add('active');

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];

    // 初始化雨滴位置
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
    }

    function drawMatrix() {
        // 半透明黑色背景，实现拖尾效果
        ctx.fillStyle = 'rgba(8, 8, 18, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff9f';
        ctx.font = fontSize + 'px JetBrains Mono, monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // 渐变颜色
            const green = Math.floor(Math.random() * 255);
            ctx.fillStyle = `rgb(0, ${200 + green / 3}, ${100 + green / 5})`;
            ctx.fillText(char, x, y);

            // 随机重置
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        matrixAnimationId = requestAnimationFrame(drawMatrix);
    }

    drawMatrix();

    // 5秒后停止
    setTimeout(() => {
        canvas.classList.remove('active');
        cancelAnimationFrame(matrixAnimationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
}

/* ─────────────────────────────────────────────────────────────
   【背景粒子系统】
   ───────────────────────────────────────────────────────────── */
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = ['#22d3ee', '#ff4dd2', '#a78bfa'][Math.floor(Math.random() * 3)];
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
        // 鼠标吸引效果
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
            this.x += dx * 0.02;
            this.y += dy * 0.02;
        }

        // 移动
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测
        if (this.x < 0 || this.x > window.innerWidth ||
            this.y < 0 || this.y > window.innerHeight) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * 初始化粒子系统
 */
function initParticles() {
    const canvas = elements.particleCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 创建粒子
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
    }

    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/**
 * 窗口大小变化时调整canvas
 */
function handleResize() {
    const canvas = elements.particleCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/* ─────────────────────────────────────────────────────────────
   【鼠标跟踪】
   ───────────────────────────────────────────────────────────── */
function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

/* ─────────────────────────────────────────────────────────────
   【特效开关控制】
   ───────────────────────────────────────────────────────────── */
function applyConfig() {
    // 扫描线开关
    elements.scanlines.style.display = CONFIG.scanlineEnabled ? 'block' : 'none';

    // 更新CSS变量
    document.documentElement.style.setProperty('--typewriter-speed', CONFIG.typewriterSpeed + 'ms');
}

/* ─────────────────────────────────────────────────────────────
   【事件绑定】
   ───────────────────────────────────────────────────────────── */
function bindEvents() {
    // 解锁事件
    document.addEventListener('click', (e) => {
        if (!isUnlocked && !elements.pressKey.classList.contains('hidden')) {
            unlockAndShow();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!isUnlocked && !elements.pressKey.classList.contains('hidden')) {
            unlockAndShow();
        }
    });

    // 按钮事件
    elements.btnGallery.addEventListener('click', openGallery);
    elements.btnDanmaku.addEventListener('click', spawnDanmaku);
    if (elements.btnMilktea) elements.btnMilktea.addEventListener('click', openMilktea);

    // 画廊事件
    elements.galleryPrev.addEventListener('click', prevImage);
    elements.galleryNext.addEventListener('click', nextImage);
    elements.galleryClose.addEventListener('click', closeGallery);

    // 画廊点击背景关闭
    elements.galleryModal.addEventListener('click', (e) => {
        if (e.target === elements.galleryModal) {
            closeGallery();
        }
    });

    // 奶茶弹窗事件
    if (elements.milkteaClose) elements.milkteaClose.addEventListener('click', closeMilktea);
    if (elements.milkteaModal) {
        elements.milkteaModal.addEventListener('click', (e) => {
            if (e.target === elements.milkteaModal) closeMilktea();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.milkteaModal && elements.milkteaModal.classList.contains('visible')) {
            closeMilktea();
        }
    });

    // 标题彩蛋
    elements.mainTitle.addEventListener('click', handleTitleClick);

    // 鼠标跟踪
    document.addEventListener('mousemove', handleMouseMove);

    // 窗口大小变化
    window.addEventListener('resize', handleResize);
}

/* ─────────────────────────────────────────────────────────────
   【初始化】
   ───────────────────────────────────────────────────────────── */
function init() {
    // 应用配置
    applyConfig();

    // 绑定事件
    bindEvents();

    // 初始化粒子系统
    if (CONFIG.particlesEnabled) {
        initParticles();
    }

    // 祝福语打字动画本次会话只播一次
    wishesTypedOnce = hasTypedWishes();

    // 从太空回忆录返回时：跳过开机加载动画，直接显示主界面
    if (consumeSkipBootFlag()) {
        showMainContentDirectly();
        return;
    }

    // 启动加载序列
    runBootSequence();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 从 bfcache 恢复（浏览器后退回到本页）时，保持已解锁状态
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // bfcache 恢复时标记不会被消费，这里清掉，避免之后误跳过开机动画
        try { sessionStorage.removeItem(SKIP_BOOT_KEY); } catch (err) { /* 忽略 */ }
        isUnlocked = true;
        elements.bootScreen.classList.add('hidden');
        elements.mainContent.classList.add('visible');
    }
});
