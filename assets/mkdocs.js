(() => {
    const getUtterancesTheme = () =>
        document.body.getAttribute('data-md-color-scheme') === 'slate'
            ? 'github-dark'
            : 'github-light';

    const syncUtterancesTheme = () => {
        const frame = document.querySelector('.utterances-frame');
        if (!frame?.contentWindow) return;
        frame.contentWindow.postMessage(
            { type: 'set-theme', theme: getUtterancesTheme() },
            'https://utteranc.es'
        );
    };

    const observer = new MutationObserver(syncUtterancesTheme);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-md-color-scheme']
    });

    window.addEventListener('message', event => {
        if (event.origin === 'https://utteranc.es') syncUtterancesTheme();
    });
})();
