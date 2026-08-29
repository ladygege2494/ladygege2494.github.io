(() => {
    'use strict';

    const projectGrid = document.getElementById('projectGrid');
    const projectFilters = document.getElementById('projectFilters');
    const lightbox = document.getElementById('portfolioLightbox');
    const lightboxImage = lightbox?.querySelector('img');
    const lightboxCaption = lightbox?.querySelector('p');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    const categoryLabels = {
        '科研项目': '科研',
        '软件项目': '软件',
        '硬件项目': '硬件',
        '其他项目': '其他'
    };

    function openLightbox(src, title) {
        if (!lightbox || !lightboxImage || !lightboxCaption) return;
        lightboxImage.src = src;
        lightboxImage.alt = title;
        lightboxCaption.textContent = title;
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
    }

    function closeLightbox() {
        if (lightbox?.open) lightbox.close();
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });

    function friendlyLinkLabel(link) {
        const label = String(link.label || '').trim();
        if (label && label !== '查看链接' && !/^https?:/i.test(label)) return label.replace(/[：:]$/, '');
        const url = String(link.url || '');
        if (url.includes('github.com')) return '项目仓库';
        if (url.includes('arxiv.org')) return '论文链接';
        if (url.includes('modelscope.cn')) return '在线体验';
        return '查看链接';
    }

    function createProjectMedia(project) {
        const media = document.createElement('div');
        media.className = 'project-media';
        const images = Array.isArray(project.images) ? project.images : [];
        if (!images.length) {
            const placeholder = document.createElement('div');
            placeholder.className = 'project-placeholder';
            placeholder.textContent = String(project.title || '作品').slice(0, 1);
            media.appendChild(placeholder);
            return media;
        }

        let currentIndex = 0;
        const image = document.createElement('img');
        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = images[0].src;
        image.alt = images[0].alt || project.title;
        image.addEventListener('click', () => openLightbox(image.src, project.title));
        media.appendChild(image);

        if (images.length > 1) {
            const count = document.createElement('span');
            count.className = 'carousel-count';
            const controls = document.createElement('div');
            controls.className = 'carousel-controls';
            const previous = document.createElement('button');
            const next = document.createElement('button');
            previous.type = next.type = 'button';
            previous.setAttribute('aria-label', '上一张图片');
            next.setAttribute('aria-label', '下一张图片');
            previous.textContent = '←';
            next.textContent = '→';

            const update = () => {
                image.src = images[currentIndex].src;
                image.alt = images[currentIndex].alt || project.title;
                count.textContent = `${currentIndex + 1} / ${images.length}`;
            };
            previous.addEventListener('click', event => {
                event.stopPropagation();
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                update();
            });
            next.addEventListener('click', event => {
                event.stopPropagation();
                currentIndex = (currentIndex + 1) % images.length;
                update();
            });
            controls.append(previous, next);
            media.append(count, controls);
            update();
        }
        return media;
    }

    function createProjectCard(project, index) {
        const article = document.createElement('article');
        article.className = 'project-card';
        article.dataset.category = project.category;
        article.appendChild(createProjectMedia(project));

        const body = document.createElement('div');
        body.className = 'project-body';
        const meta = document.createElement('div');
        meta.className = 'project-meta';
        const category = document.createElement('span');
        category.className = 'project-category';
        category.textContent = categoryLabels[project.category] || project.category || '项目';
        const number = document.createElement('span');
        number.className = 'project-number';
        number.textContent = String(index + 1).padStart(2, '0');
        meta.append(category, number);

        const title = document.createElement('h3');
        title.textContent = project.title;
        body.append(meta, title);

        if (project.description) {
            const description = document.createElement('p');
            description.className = 'project-description';
            description.textContent = project.description;
            body.appendChild(description);
            if (project.description.length > 155) {
                description.classList.add('is-clamped');
                const expand = document.createElement('button');
                expand.className = 'expand-button';
                expand.type = 'button';
                expand.textContent = '展开介绍';
                expand.addEventListener('click', () => {
                    const clamped = description.classList.toggle('is-clamped');
                    expand.textContent = clamped ? '展开介绍' : '收起介绍';
                });
                body.appendChild(expand);
            }
        }

        if (project.incomplete) {
            const note = document.createElement('p');
            note.className = 'incomplete-note';
            note.textContent = '项目资料整理中';
            body.appendChild(note);
        }

        if (Array.isArray(project.links) && project.links.length) {
            const links = document.createElement('div');
            links.className = 'project-links';
            project.links.forEach(link => {
                const anchor = document.createElement('a');
                anchor.className = 'project-link';
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.textContent = friendlyLinkLabel(link);
                links.appendChild(anchor);
            });
            body.appendChild(links);
        }
        article.appendChild(body);
        return article;
    }

    function renderFilters(projects) {
        const categories = [...new Set(projects.map(project => project.category).filter(Boolean))];
        const choices = [{ value: 'all', label: `全部 ${projects.length}` }, ...categories.map(value => ({
            value,
            label: `${categoryLabels[value] || value} ${projects.filter(project => project.category === value).length}`
        }))];

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = `filter-button${index === 0 ? ' is-active' : ''}`;
            button.type = 'button';
            button.textContent = choice.label;
            button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
            button.addEventListener('click', () => {
                projectFilters.querySelectorAll('button').forEach(item => {
                    item.classList.toggle('is-active', item === button);
                    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                });
                projectGrid.querySelectorAll('.project-card').forEach(card => {
                    card.hidden = choice.value !== 'all' && card.dataset.category !== choice.value;
                });
            });
            projectFilters.appendChild(button);
        });
    }

    function renderProjects(projects) {
        projectGrid.replaceChildren();
        projects.forEach((project, index) => projectGrid.appendChild(createProjectCard(project, index)));
        renderFilters(projects);
        document.getElementById('projectCount').textContent = projects.length;
        document.getElementById('categoryCount').textContent = new Set(projects.map(project => project.category)).size;
    }

    function renderImageGallery(section, entries) {
        const container = document.getElementById(`${section}Gallery`);
        const empty = document.getElementById(`${section}Empty`);
        if (!container || !empty || !entries.length) return;
        empty.hidden = true;
        entries.forEach(entry => {
            const figure = document.createElement('figure');
            figure.className = 'gallery-item';
            const image = document.createElement('img');
            image.src = entry.src;
            image.alt = entry.title;
            image.loading = 'lazy';
            image.decoding = 'async';
            const caption = document.createElement('figcaption');
            caption.textContent = entry.title;
            figure.addEventListener('click', () => openLightbox(image.src, entry.title));
            figure.append(image, caption);
            container.appendChild(figure);
        });
    }

    function renderVideoGallery(entries) {
        const container = document.getElementById('videoGallery');
        const empty = document.getElementById('videoEmpty');
        if (!container || !empty || !entries.length) return;
        empty.hidden = true;
        entries.forEach(entry => {
            const article = document.createElement('article');
            article.className = 'video-card';
            const video = document.createElement('video');
            video.src = entry.src;
            video.controls = true;
            video.preload = 'metadata';
            video.playsInline = true;
            const title = document.createElement('h4');
            title.textContent = entry.title;
            article.append(video, title);
            container.appendChild(article);
        });
    }

    function renderGallery(gallery) {
        const design = Array.isArray(gallery.design) ? gallery.design : [];
        const photography = Array.isArray(gallery.photography) ? gallery.photography : [];
        const video = Array.isArray(gallery.video) ? gallery.video : [];
        renderImageGallery('design', design);
        renderImageGallery('photography', photography);
        renderVideoGallery(video);
        document.getElementById('visualCount').textContent = design.length + photography.length + video.length;
    }

    async function loadPortfolio() {
        try {
            const [projectResponse, galleryResponse] = await Promise.all([
                fetch('projects.json', { cache: 'no-store' }),
                fetch('gallery.json', { cache: 'no-store' })
            ]);
            if (!projectResponse.ok || !galleryResponse.ok) throw new Error('作品数据加载失败');
            const projectData = await projectResponse.json();
            const galleryData = await galleryResponse.json();
            renderProjects(Array.isArray(projectData.projects) ? projectData.projects : []);
            renderGallery(galleryData || {});
        } catch (error) {
            console.error(error);
            projectGrid.innerHTML = '<div class="error-state">作品数据暂时无法加载，请稍后重试。</div>';
            ['projectCount', 'categoryCount', 'visualCount'].forEach(id => {
                document.getElementById(id).textContent = '0';
            });
        }
    }

    loadPortfolio();
})();
