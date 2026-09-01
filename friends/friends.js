(() => {
    'use strict';

    const grid = document.getElementById('friendsGrid');
    if (!grid) return;

    const colors = ['friend-red', 'friend-blue', 'friend-white', 'friend-yellow'];
    const sizes = ['size-lg', 'size-wide', 'size-sm', 'size-tall', 'size-wide', 'size-sm', 'size-tall'];

    async function renderFriends() {
        try {
            const response = await fetch('friends.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const friends = Array.isArray(data.friends) ? data.friends : [];
            grid.replaceChildren();

            friends.forEach((friend, index) => {
                const link = document.createElement('a');
                link.className = `friend-card ${colors[index % colors.length]} ${sizes[index % sizes.length]} no-loader`;
                link.href = friend.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.setAttribute('aria-label', `${friend.name}（在新窗口打开）`);

                const name = document.createElement('div');
                name.className = 'friend-name';
                name.textContent = friend.name;
                link.appendChild(name);
                grid.appendChild(link);
            });

            if (!friends.length) {
                grid.innerHTML = '<p class="friends-state">友链整理中。</p>';
            }
        } catch (error) {
            console.error('友链加载失败', error);
            grid.innerHTML = '<p class="friends-state">友链暂时无法加载，请稍后重试。</p>';
        }
    }

    renderFriends();
})();
