'use strict';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const mpSchemeUpdateObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);

            const hasMarketplaceCSS = (nodes) => nodes.some(node => 
                node.nodeType === Node.ELEMENT_NODE && 
                node.matches('.marketplaceCSS.marketplaceScheme')
            );

            if (hasMarketplaceCSS(addedNodes)) {
                if (Spicetify.Config.color_scheme === 'dark') {
                    document.documentElement.dataset.wmpotifyDarkMode = true;
                } else {
                    delete document.documentElement.dataset.wmpotifyDarkMode;
                }
            }
        }
    }
});

function updateSystemDarkMode(event) {
    if (event.matches) {
        document.documentElement.dataset.wmpotifyDarkMode = true;
    } else {
        delete document.documentElement.dataset.wmpotifyDarkMode;
    }
}

const ThemeManager = {
    addSystemDarkModeListener: function () {
        darkQuery.addEventListener('change', updateSystemDarkMode);
    },
    removeSystemDarkModeListener: function () {
        darkQuery.removeEventListener('change', updateSystemDarkMode);
    },
    addMarketplaceSchemeObserver: function () {
        mpSchemeUpdateObserver.observe(document.body, { childList: true });
    },
    removeMarketplaceSchemeObserver: function () {
        mpSchemeUpdateObserver.disconnect();
    }
}

export default ThemeManager;