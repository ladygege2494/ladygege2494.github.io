(() => {
    'use strict';

    const groupsRoot = document.getElementById('friendsGroups');
    const countElement = document.getElementById('friendsCount');
    if (!groupsRoot) return;

    function createFriendCard(friend) {
        const link = document.createElement('a');
        link.className = 'friend-tile no-loader';
        link.href = friend.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${friend.name}（在新窗口打开）`);

        const name = document.createElement('span');
        name.className = 'friend-tile-name';
        name.textContent = friend.name;

        const arrow = document.createElement('span');
        arrow.className = 'friend-tile-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';

        link.append(name, arrow);
        return link;
    }

    async function renderFriends() {
        try {
            const response = await fetch('friends.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const legacyFriends = Array.isArray(data.friends) ? data.friends : [];
            const groups = Array.isArray(data.groups) && data.groups.length
                ? data.groups
                : [{ title: '朋友们', friends: legacyFriends }];
            const validGroups = groups.filter(group =>
                group && typeof group.title === 'string' && Array.isArray(group.friends) && group.friends.length
            );
            const total = validGroups.reduce((sum, group) => sum + group.friends.length, 0);

            groupsRoot.replaceChildren();
            if (countElement) countElement.textContent = String(total);

            validGroups.forEach((group, groupIndex) => {
                const section = document.createElement('section');
                section.className = 'friend-group';
                section.setAttribute('aria-labelledby', `friend-group-${groupIndex}`);

                const header = document.createElement('header');
                header.className = 'friend-group-header';

                const marker = document.createElement('span');
                marker.className = 'friend-group-marker';
                marker.setAttribute('aria-hidden', 'true');
                marker.textContent = String(groupIndex + 1).padStart(2, '0');

                const title = document.createElement('h2');
                title.id = `friend-group-${groupIndex}`;
                title.textContent = group.title;

                const count = document.createElement('span');
                count.className = 'friend-group-count';
                count.textContent = `${group.friends.length} 个站点`;

                const cards = document.createElement('div');
                cards.className = 'friend-tiles';
                group.friends.forEach(friend => cards.appendChild(createFriendCard(friend)));

                header.append(marker, title, count);
                section.append(header, cards);
                groupsRoot.appendChild(section);
            });

            if (!validGroups.length) {
                groupsRoot.innerHTML = '<p class="friends-state">友链整理中。</p>';
            }
        } catch (error) {
            console.error('友链加载失败', error);
            groupsRoot.innerHTML = '<p class="friends-state">友链暂时无法加载，请稍后重试。</p>';
        }
    }

    renderFriends();
})();
