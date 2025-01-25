'use strict';

import ControlManager from './ControlManager';
import { setTintColor } from './tinting';
import { createTitlebar } from './titlebar';
import { setupTopbar } from './topbar';
import { setupPlayerbar } from './playerbar';
import Config from './config';
import SidebarManager from './SidebarManager';
import { initQueuePanel } from './queue';
import WindhawkComm from './WindhawkComm';
import PageManager from './PageManager';

const elementsRequired = [
    '.Root__globalNav',
    '.main-globalNav-historyButtons',
    '.main-globalNav-searchSection',
    '.main-globalNav-searchContainer > button',
    '.main-globalNav-searchContainer div form button',
    '.main-globalNav-searchContainer div form input[type="search"]',
    '.main-topBar-topbarContentRight > .main-actionButtons > button',
    '.main-topBar-topbarContentRight > button:last-child',
    '.Root__main-view',
    '.main-view-container__scroll-node-child main',
    '.main-nowPlayingBar-nowPlayingBar',
    '.player-controls__left',
    '.player-controls__buttons button[data-testid="control-button-repeat"]',
    '.player-controls__buttons button[data-testid="control-button-playpause"]',
    '.player-controls__right',
    '.playback-bar [class*=encore-text]',
    '.volume-bar',
    '.volume-bar__icon-button',
    '.volume-bar .progress-bar',
    '.main-nowPlayingBar-left',
    '.Root__right-sidebar > div > div[class]',
];

let style = 'xp';
let titleStyle = 'spotify';

function earlyInit() {
    if (!localStorage.wmpotifyShowLibX) {
        document.body.dataset.hideLibx = true;
    }

    WindhawkComm.init();

    const whStatus = WindhawkComm.query();

    // Supported: native, custom, spotify, keepmenu
    // native: Use the native title bar (requires Linux or Windows with my Windhawk mod) Assumes native title bar is available and removes any custom title bar in the client area
    // custom: Use custom title bar implemented by this theme, install Spotify API Extender (SpotEx) or Windhawk mod for minimize/maximize buttons
    // spotify: Use Spotify's window controls (default on unmodded Spotify client on Windows/macOS, unavailable on Linux)
    // keepmenu: Use custom window controls but keep the space for Spotify's menu (useful when only controls are hidden with the WH mod, Windows only)
    // Default: native if native title bar is available, custom if SpotEx or WH mod is available, spotify otherwise
    if (localStorage.wmpotifyTitleStyle && ['native', 'custom', 'spotify', 'keepmenu'].includes(localStorage.wmpotifyTitleStyle)) {
        titleStyle = localStorage.wmpotifyTitleStyle;
    } else {
        console.log('WMPotify EarlyInit:', window.SpotEx, whStatus);
        if (window.outerHeight - window.innerHeight > 0 || whStatus?.options?.showframe || navigator.userAgent.includes('Linux')) {
            titleStyle = 'native';
        } else if (window.SpotEx || whStatus) {
            if (whStatus?.options?.showmenu && !whStatus.options.showcontrols) {
                titleStyle = 'keepmenu';
            } else {
                titleStyle = 'custom';
            }
        }
    }
    if (titleStyle === 'keepmenu' && !navigator.userAgent.includes('Windows')) {
        titleStyle = 'spotify';
    }
    if (titleStyle === 'spotify' && navigator.userAgent.includes('Linux')) {
        titleStyle = 'native';
    }
    document.documentElement.dataset.wmpotifyTitleStyle = titleStyle;

    if (whStatus && !localStorage.wmpotifyStyle && titleStyle === 'native' && whStatus.isThemingEnabled) {
        if (whStatus.options.transparentrendering && whStatus.isDwmEnabled) {
            style = 'aero';
        } else if (!whStatus.isDwmEnabled) {
            style = 'basic';
        }
    }

    // Supported: xp, aero, basic
    if (localStorage.wmpotifyStyle && ['xp', 'aero', 'basic'].includes(localStorage.wmpotifyStyle)) {
        style = localStorage.wmpotifyStyle;
    }
    WindhawkComm.setMinSize(358, titleStyle === 'native' ? 60 : 90); // mini mode
    WindhawkComm.setBackdrop('mica'); // win11
    switch (style) {
        case 'xp':
            WindhawkComm.extendFrame(0, 0, 0, 0);
            break;
        case 'aero':
            WindhawkComm.extendFrame(0, 0, 0, 60);
            break;
        case 'basic':
            WindhawkComm.extendFrame(0, 0, 0, 0);
            if (document.hasFocus()) {
                document.body.style.backgroundColor = '#b9d1ea';
            } else {
                document.body.style.backgroundColor = '#d7e4f2';
            }
            window.addEventListener('focus', () => {
                document.body.style.backgroundColor = '#b9d1ea';
            });
            window.addEventListener('blur', () => {
                document.body.style.backgroundColor = '#d7e4f2';
            });
            break;
    }
    document.documentElement.dataset.wmpotifyStyle = style;

    window.addEventListener('resize', () => {
        if (style === 'aero') {
            if (window.innerHeight < 62) {
                WindhawkComm.extendFrame(-1, -1, -1, -1);
            } else {
                WindhawkComm.extendFrame(0, 0, 0, 60);
            }
        }
        WindhawkComm.setMinSize(358, titleStyle === 'native' ? 60 : 90);
    });

    if (localStorage.wmpotifyFont) {
        document.documentElement.style.setProperty('--ui-font', localStorage.wmpotifyFont);
    }
}

earlyInit();

async function init() {
    await createTitlebar(titleStyle);

    if (!localStorage.wmpotifyShowLibX) {
        Spicetify.Platform.LocalStorageAPI.setItem("ylx-sidebar-state", 1);
    }

    if (localStorage.wmpotifyTintColor) {
        const [hue, sat, tintPb] = localStorage.wmpotifyTintColor.split(',');
        setTintColor(hue, sat, tintPb);
    }

    ControlManager.init();
    PageManager.init();
    SidebarManager.init();

    Config.init();
    new Spicetify.Menu.Item('WMPotify Properties', false, Config.open).register();

    setupTopbar();
    setupPlayerbar();

    initQueuePanel();
    new MutationObserver(initQueuePanel).observe(
        // Right panel has varying structure in different versions
        document.querySelector('.XOawmCGZcQx4cesyNfVO') || // Seems same on .52-.56 but may change in future
        document.querySelector('.Root__right-sidebar > div > div[class]:first-child') ||
        document.querySelector('.Root__right-sidebar div[class]') // Works on .45-.52
    , { childList: true });
}

function isReady() {
    return window.Spicetify?.CosmosAsync &&
        window.Spicetify.Platform?.PlayerAPI &&
        window.Spicetify.AppTitle &&
        window.Spicetify.Player?.origin?._state &&
        window.Spicetify.Menu &&
        window.Spicetify.Platform.History?.listen &&
        window.Spicetify.Platform.LocalStorageAPI &&
        window.Spicetify.Platform.Translations &&
        elementsRequired.every(selector => document.querySelector(selector));
}

window.addEventListener('load', () => {
    let cnt = 0;
    const interval = setInterval(async () => {
        if (isReady()) {
            clearInterval(interval);
            try {
                await init();
            } catch (e) {
                (window.Spicetify?.showNotification || window.alert)('[WMPotify] An error occurred during initialization. Please check the console for more information.');
                console.error('WMPotify: Error during init:', e);
            }
            console.log('WMPotify: Theme loaded');
        } else if (cnt++ > 80) {
            (window.Spicetify?.showNotification || window.alert)('[WMPotify] Theme loading failed. Please refresh the page to try again. Please make sure you have compatible Spoitfy version.');
            clearInterval(interval);
            const missing = [];
            for (const selector of elementsRequired) {
                if (!document.querySelector(selector)) {
                    missing.push(selector);
                }
            }
            console.log('WMPotify: Missing elements:', missing);
        }
    }, 100);
});

document.addEventListener('scroll', function () {
    document.documentElement.scrollTo(0, 0);
});
