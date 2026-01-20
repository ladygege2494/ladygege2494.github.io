// ========== 全局变量 ==========
let currentSection = 1;
let isScrolling = false;
let scrollTimeout;
let activeBubble = null;
let mouseX = 0;
let mouseY = 0;
const bubblesData = []; // 存储气泡物理数据
let draggedBubble = null; // 当前拖拽的气泡

// 详情看板数据
const blockDetails = {
    media: {
        text: '这里是我的自媒体平台，包括公众号和B站主页。分享我的思考、创作和生活。',
        link: 'media.html'
    },
    tech: {
        text: '技术笔记记录我的学习历程和技术思考，涵盖前端、后端、算法等多个领域。',
        link: 'tech.html'
    },
    art: {
        text: '文艺笔记是我对电影、书籍、艺术的感悟和思考，记录那些触动心灵的时刻。',
        link: 'art.html'
    },
    business: {
        text: '商业笔记分享我对商业、产品、创业的观察和思考，探索商业世界的逻辑。',
        link: 'business.html'
    },
    portfolio: {
        text: '作品集展示我的项目作品，包括设计、开发、创意等多个方面的实践成果。',
        link: 'portfolio.html'
    }
};

// ========== 页面加载初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initTypingEffect();
    initScrollHandler();
    initMondrianBlocks();
    initBubbles();
    initSearchBox();
    initNavToggle();
    initBubbleModal();
    initClickEffect();
    initPageTransitions();
    initMouseTracker();
    initComments(); // 初始化评论区
    animateBubbles();
    
    // 确保页面加载时显示第一部分
    if (window.location.hash) {
        const sectionNum = parseInt(window.location.hash.replace('#section', ''));
        if (!isNaN(sectionNum)) {
            setTimeout(() => scrollToSection(sectionNum), 100);
        }
    } else {
        window.scrollTo(0, 0);
    }
});

// ========== 页面切换逻辑 ==========
function initPageTransitions() {
    const loader = document.getElementById('pageLoader');
    
    // 初始加载时隐藏（如果已处于 active）
    if (loader && loader.classList.contains('active')) {
        setTimeout(() => {
            loader.classList.remove('active');
        }, 800);
    }

    // 拦截跨页面链接跳转
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.includes('#') && 
            link.target !== '_blank' && 
            !link.href.startsWith('javascript:') &&
            !link.classList.contains('no-loader')) {
            
            if (loader) {
                e.preventDefault();
                loader.classList.add('active');
                setTimeout(() => {
                    window.location.href = link.href;
                }, 600);
            }
        }
    });
}

function initMouseTracker() {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}

function animateBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    bubblesData.forEach((b, i) => {
        if (b === draggedBubble) {
            // 拖拽中的气泡跟随鼠标，增加一点平滑感
            const targetX = mouseX;
            const targetY = mouseY;
            b.x += (targetX - b.x) * 0.2;
            b.y += (targetY - b.y) * 0.2;
            b.vx = (targetX - b.x) * 0.1;
            b.vy = (targetY - b.y) * 0.1;
        } else {
            // 自由漂浮
            b.x += b.vx;
            b.y += b.vy;

            // 边界反弹
            if (b.x < b.size / 2) { b.x = b.size / 2; b.vx *= -0.8; }
            if (b.x > width - b.size / 2) { b.x = width - b.size / 2; b.vx *= -0.8; }
            if (b.y < b.size / 2) { b.y = b.size / 2; b.vy *= -0.8; }
            if (b.y > height - b.size / 2) { b.y = height - b.size / 2; b.vy *= -0.8; }

            // 气泡间碰撞（优化碰撞检测，减少抖动）
            for (let j = i + 1; j < bubblesData.length; j++) {
                const b2 = bubblesData[j];
                const dx = b2.x - b.x;
                const dy = b2.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (b.size + b2.size) / 2;

                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);

                    // 旋转位置
                    let x1 = 0, y1 = 0;
                    let x2 = dx * cos + dy * sin;
                    let y2 = dy * cos - dx * sin;

                    // 旋转速度
                    let vx1 = b.vx * cos + b.vy * sin;
                    let vy1 = b.vy * cos - b.vx * sin;
                    let vx2 = b2.vx * cos + b2.vy * sin;
                    let vy2 = b2.vy * cos - b2.vx * sin;

                    // 碰撞反应
                    let vxTotal = vx1 - vx2;
                    vx1 = ((b.size - b2.size) * vx1 + 2 * b2.size * vx2) / (b.size + b2.size);
                    vx2 = vxTotal + vx1;

                    // 分开气泡防止重叠产生的抖动
                    const overlap = minDist - dist;
                    x1 -= (overlap * (b2.size / (b.size + b2.size))) / 2;
                    x2 += (overlap * (b.size / (b.size + b2.size))) / 2;

                    // 旋回
                    b.vx = vx1 * cos - vy1 * sin;
                    b.vy = vy1 * cos + vx1 * sin;
                    b2.vx = vx2 * cos - vy2 * sin;
                    b2.vy = vy2 * cos + vx2 * sin;
                }
            }

            // 移除之前的鼠标自动牵引强引力逻辑

            // 基础阻力，保持低速漂浮
            const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (speed > 2) {
                b.vx *= 0.99;
                b.vy *= 0.99;
            }
        }

        // 更新 DOM
        b.el.style.left = `${b.x - b.size / 2}px`;
        b.el.style.top = `${b.y - b.size / 2}px`;
    });

    requestAnimationFrame(animateBubbles);
}

// ========== 评论区功能 ==========
function initComments() {
    const loginBtn = document.getElementById('githubLoginBtn');
    const submitBtn = document.getElementById('commentSubmit');
    const textarea = document.getElementById('commentTextarea');
    const commentsList = document.getElementById('commentsList');
    const stats = document.getElementById('commentsStats');

    if (!loginBtn || !commentsList) return;

    // 加载已有评论
    const loadComments = () => {
        const comments = JSON.parse(localStorage.getItem('siteComments') || '[]');
        commentsList.innerHTML = comments.map(c => `
            <div style="background: #fff; border: 4px solid #000; padding: 20px; margin-bottom: 20px; position: relative;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px;">${c.user[0]}</div>
                    <span style="font-weight: bold;">${c.user}</span>
                    <span style="font-size: 0.8rem; color: #666;">${c.time}</span>
                </div>
                <div style="line-height: 1.6;">${c.content}</div>
            </div>
        `).join('');
        
        if (stats) {
            stats.querySelector('p').textContent = `${comments.length} 条评论`;
        }
    };

    loadComments();

    // 模拟登录
    loginBtn.addEventListener('click', () => {
        const username = prompt('请输入你的 GitHub 用户名（演示模拟）：');
        if (username) {
            localStorage.setItem('currentUser', username);
            loginBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
            textarea.disabled = false;
            textarea.placeholder = `欢迎，${username}！写下你的评论...`;
        }
    });

    // 检查登录状态
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        loginBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
        textarea.disabled = false;
        textarea.placeholder = `欢迎，${currentUser}！写下你的评论...`;
    }

    // 发表评论
    submitBtn.addEventListener('click', () => {
        const content = textarea.value.trim();
        const user = localStorage.getItem('currentUser');
        if (!content || !user) return;

        const comments = JSON.parse(localStorage.getItem('siteComments') || '[]');
        comments.unshift({
            user: user,
            content: content,
            time: new Date().toLocaleString()
        });
        localStorage.setItem('siteComments', JSON.stringify(comments));
        
        textarea.value = '';
        loadComments();
    });
}

// ========== 打字效果 ==========
function initTypingEffect() {
    const typingText = document.getElementById('typingText');
    const texts = ['hello I am awesome', 'welcome to my nook'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typeSpeed = 2000; // 停顿一下
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
}

// ========== 滚动切换处理 ==========
function initScrollHandler() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    // 鼠标滚轮事件
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // 触摸事件（移动端）
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].clientY;
        handleTouchSwipe();
    }, { passive: true });
    
    // 键盘事件
    window.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentSection - 1);
        }
    });
}

function handleWheel(e) {
    // 只有首页才拦截滚动
    if (!document.body.classList.contains('home-body')) return;
    
    if (isScrolling) return;
    
    e.preventDefault();
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
            // 向下滚动
            scrollToSection(currentSection + 1);
        } else {
            // 向上滚动
            scrollToSection(currentSection - 1);
        }
    }, 100);
}

function handleTouchSwipe() {
    // 只有首页才拦截触摸
    if (!document.body.classList.contains('home-body')) return;
    
    if (isScrolling) return;
    
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
            // 向上滑动
            scrollToSection(currentSection + 1);
        } else {
            // 向下滑动
            scrollToSection(currentSection - 1);
        }
    }
}

function scrollToSection(sectionNum) {
    if (sectionNum < 1 || sectionNum > 3) return;
    const targetSection = document.getElementById(`section${sectionNum}`);

    // 如果当前页面没有对应 section，跳转回主页并定位
    if (!targetSection) {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('active');
            setTimeout(() => {
                window.location.href = `index.html#section${sectionNum}`;
            }, 600);
        } else {
            window.location.href = `index.html#section${sectionNum}`;
        }
        return;
    }

    if (isScrolling) return;
    
    isScrolling = true;
    
    const prevSection = currentSection;
    currentSection = sectionNum;
    
    const section1 = document.getElementById('section1');
    
    // 如果从第一部分切换到第二部分，添加幕布升起效果
    if (section1 && currentSection === 2 && prevSection === 1) {
        section1.classList.add('slide-up');
    } else if (section1 && currentSection === 1) {
        section1.classList.remove('slide-up');
    }
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    setTimeout(() => {
        isScrolling = false;
    }, 800);
}

// 全局函数，供HTML调用
window.scrollToSection = scrollToSection;

// ========== 蒙德里安方块交互 ==========
function initMondrianBlocks() {
    const blocks = document.querySelectorAll('.mondrian-block[data-block]');
    
    blocks.forEach(block => {
        block.addEventListener('click', function() {
            const blockType = this.getAttribute('data-block');
            if (blockType === 'info') return; // 网站资讯不跳转
            showCardFlip(blockType, this);
        });
    });
}

function showCardFlip(blockType, clickedBlock) {
    const cardFlipContainer = document.getElementById('cardFlipContainer');
    const flipCard = document.getElementById('flipCard');
    const flipCardFront = flipCard.querySelector('.flip-card-front');
    const flipCardBack = flipCard.querySelector('.flip-card-back');
    const cardDetailText = document.getElementById('cardDetailText');
    const cardDetailLink = document.getElementById('cardDetailLink');
    
    if (!blockDetails[blockType]) return;
    
    const detail = blockDetails[blockType];
    
    // 获取方块颜色
    let cardColor = '#fff';
    if (clickedBlock.classList.contains('yellow-block')) {
        cardColor = '#FFD700';
    } else if (clickedBlock.classList.contains('blue-block')) {
        cardColor = '#0066CC';
    } else if (clickedBlock.classList.contains('red-block')) {
        cardColor = '#E60012';
    } else if (clickedBlock.classList.contains('white-block')) {
        cardColor = '#FFFFFF';
    }
    
    // 设置卡片颜色
    flipCard.style.setProperty('--card-color', cardColor);
    
    // 设置正面内容（显示标题）
    const blockTitle = clickedBlock.querySelector('h2').textContent;
    flipCardFront.innerHTML = `<h2 style="color: ${cardColor === '#FFFFFF' || cardColor === '#FFD700' ? '#000' : '#fff'}; font-size: 2.5rem;">${blockTitle}</h2>`;
    
    // 设置背面内容
    cardDetailText.textContent = detail.text;
    cardDetailLink.href = detail.link;
    
    // 设置文字颜色
    const textColor = cardColor === '#FFFFFF' || cardColor === '#FFD700' ? '#000' : '#fff';
    flipCardBack.style.color = textColor;
    cardDetailText.style.color = textColor;
    
    // 设置关闭按钮颜色
    const closeBtn = flipCardBack.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.style.color = textColor;
    }
    
    // 设置链接按钮样式
    if (cardColor === '#FFFFFF' || cardColor === '#FFD700') {
        cardDetailLink.style.background = '#000';
        cardDetailLink.style.color = '#fff';
        cardDetailLink.style.borderColor = '#000';
    } else {
        cardDetailLink.style.background = '#fff';
        cardDetailLink.style.color = cardColor;
        cardDetailLink.style.borderColor = '#fff';
    }
    
    // 显示卡片翻转容器
    cardFlipContainer.classList.add('active');
    
    // 触发翻转动画
    setTimeout(() => {
        flipCard.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
    }, 10);
}

// ========== 卡片翻转关闭 ==========
document.addEventListener('DOMContentLoaded', function() {
    const closeCardBtn = document.getElementById('closeCardBtn');
    const cardFlipContainer = document.getElementById('cardFlipContainer');
    const flipCardInner = document.querySelector('.flip-card-inner');
    
    function closeCardFlip() {
        flipCardInner.style.transform = 'rotateY(0deg)';
        setTimeout(() => {
            cardFlipContainer.classList.remove('active');
        }, 300);
    }
    
    if (closeCardBtn) {
        closeCardBtn.addEventListener('click', closeCardFlip);
    }
    
    // 点击背景关闭
    if (cardFlipContainer) {
        cardFlipContainer.addEventListener('click', function(e) {
            if (e.target === cardFlipContainer) {
                closeCardFlip();
            }
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cardFlipContainer.classList.contains('active')) {
            closeCardFlip();
        }
    });
});

// ========== 搜索框功能 ==========
function initSearchBox() {
    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', function() {
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                setTimeout(() => {
                    searchInput.focus();
                }, 300);
            }
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', function() {
            searchBox.classList.remove('active');
        });
    }
    
    // 搜索功能（可以后续扩展）
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // 这里可以添加搜索逻辑
                    console.log('搜索:', query);
                    alert('搜索功能待实现: ' + query);
                }
            }
        });
    }
}

// ========== 气泡动画 ==========
function initBubbles() {
    const bubblesContainer = document.getElementById('bubblesContainer');
    if (!bubblesContainer) return;

    const tags = ['微电子', '影迷', '终身学习', '前端开发', '设计', '阅读', '思考', '创作', '探索', '创新'];
    
    // 清除可能存在的旧数据
    bubblesData.length = 0;
    bubblesContainer.innerHTML = '';

    // 创建标签气泡
    tags.forEach((tag, index) => {
        createBubble(tag);
    });

    // 加载持久化留言
    const savedBubbles = JSON.parse(localStorage.getItem('userBubbles') || '[]');
    savedBubbles.forEach(text => {
        createBubble(text, false);
    });

    // 创建可互动空白气泡
    for (let i = 0; i < 2; i++) {
        createInteractiveBubble();
    }
}

function createBubble(tagText, autoRegen = true) {
    const bubblesContainer = document.getElementById('bubblesContainer');
    if (!bubblesContainer) return;
    const tags = ['微电子', '影迷', '终身学习', '前端开发', '设计', '阅读', '思考', '创作', '探索', '创新'];
    const tag = tagText || tags[Math.floor(Math.random() * tags.length)];
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = tag;
    bubble.style.animation = 'none'; // 禁用 CSS 动画，改用 JS 驱动
    
    const size = 80 + Math.random() * 40;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const vx = (Math.random() - 0.5) * 2;
    const vy = (Math.random() - 0.5) * 2;
    
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    
    // 拖拽支持
    bubble.addEventListener('mousedown', (e) => {
        draggedBubble = bData;
        e.stopPropagation();
    });

    window.addEventListener('mouseup', () => {
        draggedBubble = null;
    });
    
    bubblesContainer.appendChild(bubble);
    const bData = { el: bubble, x, y, vx, vy, size, tag, autoRegen };
    bubblesData.push(bData);

    return bData;
}

// 可互动气泡
function createInteractiveBubble() {
    const bData = createBubble('+', false);
    if (bData) {
        bData.el.classList.add('interactive');
        bData.el.addEventListener('click', () => {
            if (draggedBubble === bData) return; // 拖拽时不触发点击
            openBubbleModal(bData.el);
        });
    }
}

// ========== 窗口大小改变时重新计算 ==========
window.addEventListener('resize', function() {
    // 可以在这里添加响应式调整逻辑
});

// ========== 导航折叠与自动隐藏 ==========
function initNavToggle() {
    const nav = document.getElementById('globalNav');
    const hoverZone = document.getElementById('navHoverZone');
    if (!nav) return;

    // 默认折叠 (已经在 CSS 中处理，这里确保逻辑一致)
    nav.classList.add('collapsed');

    // 鼠标移动到顶部显示导航栏
    if (hoverZone) {
        hoverZone.addEventListener('mouseenter', () => {
            nav.classList.remove('collapsed');
        });
    }

    // 鼠标离开导航栏隐藏
    nav.addEventListener('mouseleave', () => {
        nav.classList.add('collapsed');
    });

    // 处理旧的 toggle 按钮逻辑（如果还需要的话）
    const toggle = document.getElementById('navToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('collapsed');
        });
    }
}

// ========== 鼠标点击特效 ==========
function initClickEffect() {
    const colors = ['#e30512', '#044ea2', '#facd01', '#ffffff'];
    
    document.addEventListener('mousedown', function(e) {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            createParticle(e.clientX, e.clientY, colors[Math.floor(Math.random() * colors.length)]);
        }
    });
}

function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    
    // 随机颜色
    particle.style.backgroundColor = color;
    if (color === '#ffffff') {
        particle.style.border = '1px solid #000';
    }
    
    // 初始位置
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    // 随机移动方向和距离
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 100;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');
    
    document.body.appendChild(particle);
    
    // 动画结束后移除
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

// ========== 气泡留言弹窗 ==========
function initBubbleModal() {
    const modal = document.getElementById('bubbleModal');
    const closeBtn = document.getElementById('bubbleModalClose');
    const cancelBtn = document.getElementById('bubbleCancel');
    const saveBtn = document.getElementById('bubbleSave');
    const input = document.getElementById('bubbleInput');

    if (!modal || !input) return;

    const closeModal = () => {
        modal.classList.remove('active');
        activeBubble = null;
        input.value = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!activeBubble) return;
            const text = input.value.trim();
            if (text) {
                activeBubble.textContent = text;
                activeBubble.classList.remove('interactive');
                
                // 持久化存储
                const savedBubbles = JSON.parse(localStorage.getItem('userBubbles') || '[]');
                savedBubbles.push(text);
                localStorage.setItem('userBubbles', JSON.stringify(savedBubbles));
            } else {
                activeBubble.textContent = '留言';
                activeBubble.classList.remove('interactive');
            }
            closeModal();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function openBubbleModal(bubbleEl) {
    const modal = document.getElementById('bubbleModal');
    const input = document.getElementById('bubbleInput');
    if (!modal || !input) return;
    activeBubble = bubbleEl;
    input.value = bubbleEl.textContent === '+' ? '' : bubbleEl.textContent;
    modal.classList.add('active');
    input.focus();
}
