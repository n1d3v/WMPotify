import ControlManager from './ControlManager';
import { setTintColor } from './tinting';
import { createTitlebar } from './titlebar';
import { setupTopbar } from './topbar';
import { setupPlayerbar, updatePlayPauseButton } from './playerbar';
import Config from './config';
import { initQueuePanel } from './queue';
import WindhawkComm from './WindhawkComm';
globalThis.WindhawkComm = WindhawkComm;

const elementsRequired = [
    '.Root__globalNav',
    '.main-globalNav-historyButtons',
    '.main-globalNav-searchSection',
    '.main-globalNav-searchContainer > button',
    '.main-globalNav-searchContainer div form button',
    '.main-topBar-searchBar',
    '.custom-navlinks-scrollable_container div[role="presentation"] > button',
    '.main-topBar-topbarContentRight > .main-actionButtons > button',
    '.main-topBar-topbarContentRight > button:last-child',
    '.Root__main-view',
    '.main-view-container__scroll-node-child main',
    '.player-controls__left',
    '.player-controls__buttons button[data-testid="control-button-skip-back"]',
    '.player-controls__buttons button[data-testid="control-button-repeat"]',
    '.player-controls__buttons button[data-testid="control-button-playpause"]',
    '.player-controls__right',
    '.playback-bar .encore-text',
    '.volume-bar',
    '.volume-bar__icon-button',
    '.volume-bar .progress-bar',
    '.main-nowPlayingBar-left',
    '.Root__right-sidebar div[class]',
];

let availableWhCommands = [];
let titleStyle = 'spotify';

async function earlyInit() {
    if (!localStorage.wmpotifyShowLibX) {
        document.body.dataset.hideLibx = true;
    }

    await WindhawkComm.init();

    const whStatus = await WindhawkComm.query();
    if (whStatus) {
        availableWhCommands = whStatus.supportedCommands;
        if (!localStorage.wmpotifyStyle) {
            if (availableWhCommands.includes('ExtendFrame')) {
                localStorage.wmpotifyStyle = 'aero';
            }
        }
    }

    // Supported: xp, aero, basic
    switch (localStorage.wmpotifyStyle) {
        case 'xp':
        case undefined:
            await WindhawkComm.extendFrame(0, 0, 0, 0);
            break;
        case 'aero':
            await WindhawkComm.extendFrame(0, 0, 0, 60);
            break;
        case 'basic':
            await WindhawkComm.extendFrame(0, 0, 0, 0);
            if (document.hasFocus()) {
                document.body.style.backgroundColor = 'var(--active-title)';
            } else {
                document.body.style.backgroundColor = 'var(--inactive-title)';
            }
            window.addEventListener('focus', () => {
                document.body.style.backgroundColor = 'var(--active-title)';
            });
            window.addEventListener('blur', () => {
                document.body.style.backgroundColor = 'var(--inactive-title)';
            });
            break;
        default:
            document.body.style.backgroundColor = localStorage.wmpotifyStyle;
    }
    document.documentElement.dataset.wmpotifyStyle = localStorage.wmpotifyStyle || 'xp';

    // Supported: native, custom, spotify, keepmenu
    // native: Use the native title bar (requires Linux or Windows with my Windhawk mod) Assumes native title bar is available and removes any custom title bar in the client area
    // custom: Use custom title bar implemented by this theme, install Spotify API Extender (SpotEx) or Windhawk mod for minimize/maximize buttons
    // spotify: Use Spotify's window controls (default on unmodded Spotify client on Windows/macOS, unavailable on Linux)
    // keepmenu: Use custom window controls but keep the space for Spotify's menu (useful when only controls are hidden with the WH mod, Windows only)
    // Default: native if native title bar is available, custom if SpotEx or WH mod is available, spotify otherwise
    if (localStorage.wmpotifyTitleStyle && ['native', 'custom', 'spotify', 'keepmenu'].includes(localStorage.wmpotifyTitleStyle)) {
        titleStyle = localStorage.wmpotifyTitleStyle;
    } else {
        if (window.outerHeight - window.innerHeight > 0) {
            titleStyle = 'native';
        } else if (window.SpotEx || availableWhCommands.includes('Minimize')) {
            if (!whStatus.showframe && whStatus.showmenu && !whStatus.showcontrols) {
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
}

earlyInit();

async function init() {
    await createTitlebar(titleStyle);

    if (localStorage.wmpotifyTintColor) {
        const [hue, sat] = localStorage.wmpotifyTintColor.split(',');
        setTintColor(hue, sat);
    }

    ControlManager.init();

    setupTopbar();

    Config.init();
    new Spicetify.Menu.Item('WMPotify Properties', false, Config.open).register();

    setupPlayerbar();
    new MutationObserver(updatePlayPauseButton).observe(document.querySelector('.main-view-container__scroll-node-child main'), { childList: true });

    initQueuePanel();
    new MutationObserver(initQueuePanel).observe(document.querySelector('.Root__right-sidebar div[class]'), { childList: true });
}

function isReady() {
    return window.Spicetify &&
        window.Spicetify.CosmosAsync &&
        window.Spicetify.Platform?.PlayerAPI &&
        window.Spicetify.AppTitle &&
        window.Spicetify.Player?.origin?._state &&
        window.Spicetify.Menu &&
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
                alert('[WMPotify] An error occurred during initialization. Please check the console for more information.');
                console.error('WMPotify: Error during init:', e);
            }
            console.log('WMPotify: Theme loaded');
        } else if (cnt++ > 80) {
            alert('[WMPotify] Theme loading failed. Please refresh the page to try again. Please make sure you have compatible Spoitfy version and have global navbar enabled.');
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