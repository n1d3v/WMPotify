'use strict';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function updateSystemDarkMode(event) {
    if (event.matches) {
        document.documentElement.dataset.wmpotifyDarkMode = true;
    } else {
        delete document.documentElement.dataset.wmpotifyDarkMode;
    }
}

const ThemeManager = {
    addDarkModeListener: function () {
        darkQuery.addEventListener('change', updateSystemDarkMode);
    },
    removeDarkModeListener: function () {
        darkQuery.removeEventListener('change', updateSystemDarkMode);
    }
}

export default ThemeManager;