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
        link: 'media/index.html'
    },
    tech: {
        text: '技术笔记记录我的学习历程和技术思考，涵盖前端、后端、算法等多个领域。',
        link: 'tech/index.html'
    },
    art: {
        text: '文艺笔记是我对电影、书籍、艺术的感悟和思考，记录那些触动心灵的时刻。',
        link: 'art/index.html'
    },
    business: {
        text: '商业笔记分享我对商业、产品、创业的观察和思考，探索商业世界的逻辑。',
        link: 'business/index.html'
    },
    portfolio: {
        text: '作品集展示我的项目作品，包括设计、开发、创意等多个方面的实践成果。',
        link: 'portfolio/index.html'
    },
    journey: {
        text: '记录个人生活与成长感悟，分享一路走来的点滴。',
        link: 'journey/index.html'
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
    initSiteStats();
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

// ========== 站点运行时间 ==========
function initSiteStats() {
    const ageElement = document.getElementById('siteAgeDays');
    if (!ageElement) return;

    const siteCreatedAt = new Date('2026-01-21T00:00:00+08:00');
    const elapsedDays = Math.max(0, Math.floor((Date.now() - siteCreatedAt.getTime()) / 86400000));
    ageElement.textContent = elapsedDays.toLocaleString('zh-CN');
}

// ========== 打字效果 ==========
function initTypingEffect() {
    const typingText = document.getElementById('typingText');
    const texts = ['Hello! I am Awesome!', 'Welcome to My Nook!'];
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

// 滚轮累积量，用于惯性检测
let wheelAccumulation = 0;
const wheelThreshold = 50; // 降低阈值，让滚动更灵敏

function handleWheel(e) {
    // 只有首页才拦截滚动
    if (!document.body.classList.contains('home-body')) return;
    
    if (isScrolling) return;
    
    e.preventDefault();
    
    // 累积滚动量
    wheelAccumulation += e.deltaY;
    
    // 清零计时器，如果一段时间没有滚动则重置累积
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        wheelAccumulation = 0;
    }, 150); // 缩短重置时间，增加惯性感
    
    // 判断是否达到阈值
    if (Math.abs(wheelAccumulation) >= wheelThreshold) {
        if (wheelAccumulation > 0) {
            // 向下滚动 - 使用瀑布流动画
            scrollToSectionWithAnimation(currentSection + 1);
        } else {
            // 向上滚动 - 使用瀑布流动画
            scrollToSectionWithAnimation(currentSection - 1);
        }
        wheelAccumulation = 0;
    }
}

function handleTouchSwipe() {
    // 只有首页才拦截触摸
    if (!document.body.classList.contains('home-body')) return;
    
    if (isScrolling) return;
    
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
            // 向上滑动 - 使用瀑布流动画
            scrollToSectionWithAnimation(currentSection + 1);
        } else {
            // 向下滑动 - 使用瀑布流动画
            scrollToSectionWithAnimation(currentSection - 1);
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

// ========== 全站搜索 ==========
const searchIndexes = [
    { name: '技术笔记', base: '/notes/tech/' },
    { name: '商业笔记', base: '/notes/business/' },
    { name: '文艺笔记', base: '/notes/art/' },
    { name: '一路走来', base: '/notes/journey/' }
];

const nativeSearchDocuments = [
    { section: '网站', title: 'GegeNook 主页', text: '不拘一格 个人网站 首页', url: '/' },
    { section: '网站', title: '友链', text: '友情链接 友链申请 评论', url: '/friends/' },
    { section: '网站', title: '关于', text: '关于我 联系方式 个人介绍', url: '/about/' },
    { section: '网站', title: '自媒体', text: '公众号 B站 内容创作', url: '/media/' },
    { section: '网站', title: '作品集', text: '项目 设计 开发 作品', url: '/portfolio/' },
    { section: '分区', title: '技术笔记', text: '工程 技术 课程 计算机 数学 物理', url: '/tech/' },
    { section: '分区', title: '文艺笔记', text: '电影 文学 艺术 音乐 哲学 文化', url: '/art/' },
    { section: '分区', title: '商业笔记', text: '商业 投资 经济 商业模式', url: '/business/' },
    { section: '分区', title: '一路走来', text: '生活 成长 随想 时刻 健康', url: '/journey/' }
];

let searchDocumentsPromise = null;

function plainSearchText(value) {
    const withoutTags = String(value || '').replace(/<[^>]*>/g, ' ');
    if (typeof DOMParser === 'undefined') return withoutTags;
    const parsed = new DOMParser().parseFromString(withoutTags, 'text/html');
    return parsed.documentElement.textContent || '';
}

function normalizeSearchText(value) {
    return plainSearchText(value).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function loadSearchDocuments() {
    if (searchDocumentsPromise) return searchDocumentsPromise;

    searchDocumentsPromise = Promise.allSettled(searchIndexes.map(async source => {
        const response = await fetch(`${source.base}search/search_index.json?v=20260827-2`);
        if (!response.ok) throw new Error(`${source.name}搜索索引加载失败`);
        const data = await response.json();
        return (data.docs || []).map(doc => ({
            ...doc,
            section: source.name,
            url: new URL(doc.location || '.', `${window.location.origin}${source.base}`).href
        }));
    })).then(groups => {
        const remoteDocuments = groups
            .filter(group => group.status === 'fulfilled')
            .flatMap(group => group.value);
        if (!remoteDocuments.length) throw new Error('所有文章搜索索引均加载失败');
        return [...nativeSearchDocuments.map(doc => ({
            ...doc,
            url: new URL(doc.url, window.location.origin).href
        })), ...remoteDocuments];
    });

    return searchDocumentsPromise;
}

function searchDocuments(documents, query) {
    const phrase = normalizeSearchText(query);
    const tokens = phrase.split(/[\s,，。；;：:！？!?、]+/).filter(Boolean);
    const seen = new Set();

    return documents.map(doc => {
        const title = normalizeSearchText(doc.title);
        const text = normalizeSearchText(doc.text);
        if (!tokens.every(token => title.includes(token) || text.includes(token))) return null;

        let score = 0;
        if (title === phrase) score += 240;
        if (title.startsWith(phrase)) score += 120;
        if (title.includes(phrase)) score += 90;
        if (text.includes(phrase)) score += 36;
        tokens.forEach(token => {
            if (title.includes(token)) score += 30;
            if (text.includes(token)) score += 8;
        });
        return { ...doc, score };
    }).filter(Boolean)
        .sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title), 'zh-CN'))
        .filter(doc => {
            const key = `${doc.url}|${doc.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function renderSearchResults(container, results, query) {
    container.replaceChildren();

    const summary = document.createElement('div');
    summary.className = 'search-results-summary';
    summary.textContent = results.length ? `找到 ${results.length} 条与“${query}”相关的内容` : `没有找到“${query}”`;
    container.appendChild(summary);

    results.slice(0, 40).forEach(result => {
        const link = document.createElement('a');
        link.className = 'search-result-item no-loader';
        link.href = result.url;
        link.setAttribute('role', 'option');

        const meta = document.createElement('span');
        meta.className = 'search-result-section';
        meta.textContent = result.section;

        const title = document.createElement('strong');
        title.textContent = result.title || '未命名页面';

        const excerpt = document.createElement('span');
        excerpt.className = 'search-result-excerpt';
        const normalized = plainSearchText(result.text).replace(/\s+/g, ' ').trim();
        const index = normalizeSearchText(normalized).indexOf(normalizeSearchText(query));
        const start = index < 0 ? 0 : Math.max(0, index - 45);
        excerpt.textContent = normalized.slice(start, start + 140);

        link.append(meta, title, excerpt);
        container.appendChild(link);
    });
}

function initSearchBox() {
    const searchBtn = document.getElementById('searchBtn');
    const searchBox = document.getElementById('searchBox');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.setAttribute('aria-live', 'polite');
    searchResults.setAttribute('role', 'listbox');
    if (searchBox) searchBox.appendChild(searchResults);
    let debounceTimer;

    if (searchInput) {
        searchInput.placeholder = '输入关键词，实时搜索全部文章…';
        searchInput.setAttribute('autocomplete', 'off');
        searchInput.setAttribute('aria-label', '全站搜索');
    }

    if (searchBtn) {
        searchBtn.setAttribute('role', 'button');
        searchBtn.setAttribute('tabindex', '0');
        searchBtn.setAttribute('aria-controls', 'searchBox');
        searchBtn.setAttribute('aria-expanded', 'false');
    }

    if (searchClose) searchClose.setAttribute('aria-label', '关闭搜索');

    const closeSearch = () => {
        searchBox?.classList.remove('active', 'has-results');
        searchBtn?.setAttribute('aria-expanded', 'false');
        searchResults.replaceChildren();
    };

    const openSearch = () => {
        searchBox?.classList.add('active');
        searchBtn?.setAttribute('aria-expanded', 'true');
        setTimeout(() => searchInput?.focus(), 180);
    };

    const toggleSearch = () => {
        if (searchBox?.classList.contains('active')) closeSearch();
        else openSearch();
    };

    const runSearch = async () => {
        const query = searchInput?.value.trim() || '';
        if (!query) {
            searchBox?.classList.remove('has-results');
            searchResults.replaceChildren();
            return;
        }

        searchBox.classList.add('has-results');
        searchResults.textContent = '正在检索四个知识库和网站页面…';
        try {
            const documents = await loadSearchDocuments();
            renderSearchResults(searchResults, searchDocuments(documents, query), query);
        } catch (error) {
            searchResults.textContent = '搜索索引暂时无法加载，请稍后重试。';
            console.error(error);
            searchDocumentsPromise = null;
        }
    };
    
    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', toggleSearch);
        searchBtn.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleSearch();
            }
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', function() {
            closeSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSearch, 180);
        });

        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                clearTimeout(debounceTimer);
                runSearch();
            } else if (event.key === 'Escape') {
                closeSearch();
            } else if (event.key === 'ArrowDown') {
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    event.preventDefault();
                    firstResult.focus();
                }
            }
        });
    }

    searchResults.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) return;
        const links = [...searchResults.querySelectorAll('.search-result-item')];
        const currentIndex = links.indexOf(document.activeElement);
        if (event.key === 'Escape') {
            closeSearch();
            return;
        }
        event.preventDefault();
        const nextIndex = event.key === 'ArrowDown'
            ? Math.min(links.length - 1, currentIndex + 1)
            : Math.max(0, currentIndex - 1);
        links[nextIndex]?.focus();
    });

    document.addEventListener('keydown', event => {
        const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k';
        if (isShortcut) {
            event.preventDefault();
            openSearch();
        } else if (event.key === 'Escape' && searchBox?.classList.contains('active')) {
            closeSearch();
        }
    });
}

// ========== 气泡动画 ==========
function initBubbles() {
    const bubblesContainer = document.getElementById('bubblesContainer');
    if (!bubblesContainer) return;

    const tags = ['电影', '技术产品', '终身学习', '与人连接', '长期主义' ,'创造', '探索'];
    
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
    const tags = ['微电子', '影迷', '终身学习', '技术产品', '阅读', '与人连接', '创作', '探索'];
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

// ========== 蒙德里安风格瀑布流页面切换动画 ==========
function scrollToSectionWithAnimation(sectionNum) {
    // 边界检查
    if (sectionNum < 1 || sectionNum > 2) {
        return; // 不超出范围
    }

    const pageTransition = document.getElementById('pageTransition');
    if (!pageTransition) {
        scrollToSection(sectionNum);
        return;
    }

    if (isScrolling) return; // 防止重复触发
    isScrolling = true;

    const prevSection = currentSection;
    currentSection = sectionNum;

    // 清空之前的方格（重要：每次都重新生成）
    pageTransition.innerHTML = '';
    pageTransition.classList.add('active');

    // 生成蒙德里安风格方格
    const colors = ['#e30512', '#facd01', '#044ea2', '#fff'];
    const blockCount = 40; // 方格数量
    const screenWidth = window.innerWidth;

    for (let i = 0; i < blockCount; i++) {
        const block = document.createElement('div');
        block.className = 'mondrian-block-anim';
        
        // 随机尺寸
        const width = 60 + Math.random() * 120;
        const height = 80 + Math.random() * 150;
        
        // 随机水平位置
        const left = Math.random() * (screenWidth - width);
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        block.style.width = width + 'px';
        block.style.height = height + 'px';
        block.style.left = left + 'px';
        block.style.background = color;
        if (color === '#fff') {
            block.style.background = '#fff';
        }
        
        // 随机旋转
        const rotate = -15 + Math.random() * 30;
        block.style.setProperty('--rotate', rotate + 'deg');
        
        // 延迟下落
        const delay = Math.random() * 0.3;
        block.style.animationDelay = delay + 's';
        
        pageTransition.appendChild(block);
        
        // 立即触发动画
        requestAnimationFrame(() => {
            block.classList.add('falling');
        });
    }

    // 同步执行页面切换和动画
    const section1 = document.getElementById('section1');
    const targetSection = document.getElementById(`section${sectionNum}`);
    
    // 添加幕布效果
    if (section1 && currentSection === 2 && prevSection === 1) {
        section1.classList.add('slide-up');
    } else if (section1 && currentSection === 1) {
        section1.classList.remove('slide-up');
    }
    
    // 立即开始页面滚动（与动画同步）
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // 动画结束后清理并重置状态
    setTimeout(() => {
        pageTransition.classList.remove('active');
        // 延迟清空，避免闪烁
        setTimeout(() => {
            pageTransition.innerHTML = '';
        }, 100);
        isScrolling = false;
    }, 1000); // 缩短到1秒，让切换更流畅
}
