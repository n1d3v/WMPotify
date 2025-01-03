import { MadMenu, createMadMenu } from './MadMenu';
import ControlManager from './ControlManager';
import { initQueuePanel } from './queue';
import { formatTime } from './functions';
import Config from './config';
import { setTintColor } from './tinting';

(function() {
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

    const tabNameSubstitutes = {
        'Your Library': 'Library',
        'Friend Activity': 'Friends',
    }

    async function init() {
        if (!localStorage.wmpotifyShowLibX) {
            document.body.dataset.hideLibx = true;
        }

        // Supported: xp, aero, basic
        switch (localStorage.wmpotifyStyle) {
            case 'xp':
            case 'aero':
                break;
            case undefined:
                localStorage.wmpotifyStyle = 'xp';
                break;
            case 'basic':
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
        // custom: Use custom title bar implemented by this theme, install Spotify API Extender for minimize/maximize buttons
        // spotify: Use Spotify's window controls (default on unmodded Spotify client on Windows/macOS, unavailable on Linux)
        // keepmenu: Use custom window controls but keep the space for Spotify's menu (useful when only controls are hidden with the WH mod, Windows only)
        // Default: native if native title bar is available, custom if SpotEx is installed, spotify otherwise
        let titleStyle = 'spotify';
        if (localStorage.wmpotifyTitleStyle && ['native', 'custom', 'spotify', 'keepmenu'].includes(localStorage.wmpotifyTitleStyle)) {
            titleStyle = localStorage.wmpotifyTitleStyle;
        } else {
            if (window.outerHeight - window.innerHeight > 0) {
                titleStyle = 'native';
            } else if (window.SpotEx) {
                titleStyle = 'custom';
            }
        }
        if (titleStyle === 'keepmenu' && !navigator.userAgent.includes('Windows')) {
            titleStyle = 'spotify';
        }
        if (titleStyle === 'spotify' && navigator.userAgent.includes('Linux')) {
            titleStyle = 'native';
        }
        document.documentElement.dataset.wmpotifyTitleStyle = titleStyle;
        switch (titleStyle) {
            case 'native':
                ControlManager.setControlHeight(0);
                break;
            case 'custom':
                ControlManager.setControlHeight(0);
            case 'keepmenu':
                const titleButtons = document.createElement('div');
                titleButtons.id = 'wmpotify-title-buttons';
                if (window.SpotEx) {
                    const minimizeButton = document.createElement('button');
                    minimizeButton.id = 'wmpotify-minimize-button';
                    minimizeButton.addEventListener('click', () => {
                        SpotEx.updateWindow({ state: 'minimized' });
                    });
                    titleButtons.appendChild(minimizeButton);
                    const maximizeButton = document.createElement('button');
                    maximizeButton.id = 'wmpotify-maximize-button';
                    maximizeButton.addEventListener('click', async () => {
                        if ((await SpotEx.getWindow()).state === 'maximized') {
                            SpotEx.updateWindow({ state: 'normal' });
                        } else {
                            SpotEx.updateWindow({ state: 'maximized' });
                        }
                    });
                    titleButtons.appendChild(maximizeButton);
                    window.addEventListener('resize', async () => {
                        if ((await SpotEx.getWindow()).state === 'maximized') {
                            maximizeButton.dataset.maximized = true;
                        } else {
                            delete maximizeButton.dataset.maximized;
                        }
                    });
                }
                const closeButton = document.createElement('button');
                closeButton.id = 'wmpotify-close-button';
                closeButton.addEventListener('click', () => {
                    window.close();
                });
                titleButtons.appendChild(closeButton);
            case 'spotify':
                const titleBar = document.createElement('div');
                titleBar.id = 'wmpotify-title-bar';
                const titleIcon = document.createElement('div');
                titleIcon.id = 'wmpotify-title-icon';
                titleIcon.addEventListener('dblclick', () => {
                    window.close();
                });
                document.body.appendChild(titleIcon); // Put it outside the title bar to prevent it from being tinted
                const titleText = document.createElement('span');
                titleText.id = 'wmpotify-title-text';
                titleText.textContent = await Spicetify.AppTitle.get();
                titleBar.appendChild(titleText);
                if (titleStyle === 'custom' || titleStyle === 'keepmenu') {
                    titleBar.appendChild(titleButtons);
                }
                if (titleStyle === 'keepmenu' || titleStyle === 'spotify') {
                    ControlManager.setControlHeight(25);
                }
                document.body.appendChild(titleBar);
                Spicetify.AppTitle.sub((title) => {
                    titleText.textContent = title;
                });
                break;
        }

        if (localStorage.wmpotifyTintColor) {
            const [hue, sat] = localStorage.wmpotifyTintColor.split(',');
            setTintColor(hue, sat);
        }

        ControlManager.init();

        const topbar = document.querySelector('.Root__globalNav');
        const tabsContainer = document.createElement('div');
        tabsContainer.id = 'wmpotify-tabs-container';
        topbar.insertBefore(tabsContainer, topbar.querySelector('.main-globalNav-searchSection'));

        const homeButton = document.querySelector('.main-globalNav-searchContainer > button');
        addTab(homeButton);
        const searchButton = document.querySelector('.main-globalNav-searchContainer div form button');
        addTab(searchButton);
        const tabs = [homeButton, searchButton];
        const customAppButtons = document.querySelectorAll('.custom-navlinks-scrollable_container div[role="presentation"] > button');
        for (const btn of customAppButtons) {
            addTab(btn);
            tabs.push(btn);
        }
        const rightButtons = document.querySelectorAll('.main-topBar-topbarContentRight > .main-actionButtons > button');
        for (const btn of rightButtons) {
            addTab(btn);
            tabs.push(btn);
        }
        const menuItems = [];
        for (const tab of tabs) {
            menuItems.push({
                text: tab.querySelector('.wmpotify-tab-label').textContent,
                click: () => tab.click(),
            });
        }
        createMadMenu('wmpotifyTab', menuItems);
        const menu = new MadMenu(['wmpotifyTab']);
        const overflowButton = document.createElement('button');
        overflowButton.id = 'wmpotify-tabs-overflow-button';
        overflowButton.addEventListener('click', () => {
            menu.openMenu('wmpotifyTab', { top: '0', left: overflowButton.getBoundingClientRect().left + 'px' });
        });
        tabsContainer.appendChild(overflowButton);
        handleTabOverflow();
        setTimeout(handleTabOverflow, 1000);
        window.addEventListener('resize', handleTabOverflow);

        const accountButton = document.querySelector('.main-topBar-topbarContentRight > button:last-child');
        const accountLabel = document.createElement('span');
        accountLabel.textContent = accountButton.getAttribute('aria-label');
        accountLabel.classList.add('wmpotify-user-label');
        accountButton.appendChild(accountLabel);

        const searchContainer = document.createElement('div');
        searchContainer.id = 'wmpotify-search-container';
        const searchBarWrapper = document.createElement('div');
        searchBarWrapper.id = 'wmpotify-search-wrapper';
        const searchBar = document.querySelector('.main-topBar-searchBar');
        searchBarWrapper.appendChild(searchBar);
        const searchClearButton = document.createElement('button');
        searchClearButton.id = 'wmpotify-search-clear-button';
        searchClearButton.setAttribute('aria-label', 'Clear search');
        searchClearButton.addEventListener('click', () => {
            searchBar.value = '';
            searchBar.focus();
            window.open('spotify:search');
        });
        searchBarWrapper.appendChild(searchClearButton);
        searchContainer.appendChild(searchBarWrapper);
        topbar.appendChild(searchContainer);

        Config.init();
        new Spicetify.Menu.Item('WMPotify Properties', false, Config.open).register();

        const playPauseButton = document.querySelector(".player-controls__buttons button[data-testid='control-button-playpause']");
        Spicetify.Player.addEventListener("onplaypause", updatePlayPauseButton);
        new MutationObserver(updatePlayPauseButton).observe(playPauseButton, { attributes: true, attributeFilter: ['aria-label'] });

        setupTrackInfoWidget();
        new MutationObserver(setupTrackInfoWidget).observe(document.querySelector('.main-nowPlayingBar-left'), { childList: true });

        const playerControlsLeft = document.querySelector('.player-controls__left');
        const prevButton = document.querySelector('.player-controls__buttons button[data-testid="control-button-skip-back"]');
        const repeatButton = document.querySelector('.player-controls__buttons button[data-testid="control-button-repeat"]');
        playerControlsLeft.insertBefore(repeatButton, prevButton);

        const stopButton = document.createElement('button');
        stopButton.setAttribute('aria-label', 'Stop');
        stopButton.id = 'wmpotify-stop-button';
        stopButton.addEventListener('click', () => {
            Spicetify.Platform.PlayerAPI.clearQueue();
            Spicetify.Player.playUri("");
        });
        playerControlsLeft.insertBefore(stopButton, prevButton);

        const playerControlsRight = document.querySelector('.player-controls__right');
        const volumeBar = document.querySelector('.volume-bar');
        const volumeButton = volumeBar.querySelector('.volume-bar__icon-button');
        const volumeBarProgress = volumeBar.querySelector('.progress-bar');
        updateVolumeIcon();
        new MutationObserver(updateVolumeIcon).observe(volumeBarProgress, { attributes: true, attributeFilter: ['style'] });
        playerControlsRight.appendChild(volumeBar);

        const timeTexts = document.querySelectorAll('.playback-bar .encore-text'); // 0: elapsed, 1: total (both in HH:MM:SS format)
        const timeTextContainer = document.createElement('div');
        timeTextContainer.classList.add('wmpotify-time-text-container');
        const timeText = document.createElement('span');
        timeText.classList.add('wmpotify-time-text');
        let timeTextMode = parseInt(localStorage.wmpotifyTimeTextMode || 0); // 0: remaining, 1: elapsed, 2: elapsed / total
        updateTimeText();
        timeText.dataset.mode = timeTextMode;
        timeText.addEventListener('click', () => {
            timeTextMode = (timeTextMode + 1) % 3;
            timeText.dataset.mode = timeTextMode;
            localStorage.wmpotifyTimeTextMode = timeTextMode;
        });
        timeTextContainer.appendChild(timeText);
        playerControlsLeft.insertAdjacentElement('afterbegin', timeTextContainer);
        Spicetify.Player.addEventListener("onprogress", updateTimeText);

        // Shuffle button is often removed and re-added, so we need this to keep it in place
        const observer = new MutationObserver(() => {
            const childLength = playerControlsLeft.children.length;
            if (childLength === 4) {
                return;
            }
            observer.disconnect();
            playerControlsLeft.insertBefore(playerControlsLeft.children[childLength - 2], repeatButton);
            observer.observe(playerControlsLeft, { childList: true });
        });
        observer.observe(playerControlsLeft, { childList: true });

        initQueuePanel();
        new MutationObserver(initQueuePanel).observe(document.querySelector('.Root__right-sidebar div[class]'), { childList: true });

        function addTab(btn) {
            tabsContainer.appendChild(btn);
            const label = document.createElement('span');
            const name = btn.getAttribute('aria-label');
            label.textContent = tabNameSubstitutes[name] || name;
            label.classList.add('wmpotify-tab-label');
            btn.appendChild(label);
        }

        function handleTabOverflow() {
            const leftAreaWidth = document.querySelector('.main-globalNav-historyButtons').getBoundingClientRect().right;
            const rightAreaWidth = window.innerWidth - document.querySelector('.main-topBar-topbarContentRight').getBoundingClientRect().left;
            const extra = 160;

            let hiddenTabs = 0;
            while (window.innerWidth - leftAreaWidth - rightAreaWidth - extra < tabsContainer.getBoundingClientRect().width && hiddenTabs < tabs.length) {
                tabs[tabs.length - 1 - hiddenTabs++].dataset.hidden = true;
            }
            hiddenTabs = document.querySelectorAll('#wmpotify-tabs-container button[data-hidden]').length;
            while (hiddenTabs > 0 && window.innerWidth - leftAreaWidth - rightAreaWidth - extra > tabsContainer.getBoundingClientRect().width) {
                delete tabs[tabs.length - hiddenTabs--].dataset.hidden;
            }

            overflowButton.style.display = hiddenTabs > 0 ? 'block' : '';
        }
        globalThis.handleTabOverflow = handleTabOverflow;

        function setupTrackInfoWidget() {
            updatePlayPauseButton();
            const trackInfoWidget = document.querySelector('.main-nowPlayingWidget-trackInfo');
            if (!trackInfoWidget || document.querySelector('.wmpotify-track-info')) {
                return;
            }
            const trackInfoText = document.createElement('p');
            trackInfoText.classList.add('wmpotify-track-info');
            trackInfoText.textContent = document.querySelector('.main-trackInfo-name')?.textContent || '';
            trackInfoWidget.appendChild(trackInfoText);

            let trackInfoCurrent = 1; // 0: title, 1: artist, 2: album
            setInterval(() => {
                if (!Spicetify.Player.isPlaying()) {
                    return;
                }
                const trackInfo = Spicetify.Player.data?.item.metadata;
                if (!trackInfo) {
                    return;
                }
                if (trackInfoCurrent === 0) {
                    trackInfoText.textContent = trackInfo.title;
                } else if (trackInfoCurrent === 1) {
                    trackInfoText.textContent = trackInfo.artist_name;
                } else if (trackInfoCurrent === 2) {
                    trackInfoText.textContent = trackInfo.album_title;
                }
                trackInfoCurrent = (trackInfoCurrent + 1) % 3;
            }, 3000);
            Spicetify.Player.addEventListener("songchange", () => {
                trackInfoCurrent = 0;
                trackInfoText.textContent = Spicetify.Player.data?.item.metadata.title;
            });
        }

        function updatePlayPauseButton() {
            if (Spicetify.Player.isPlaying()) {
                playPauseButton.classList.add('playing');
            } else {
                playPauseButton.classList.remove('playing');
            }
        }

        function updateVolumeIcon() {
            const volume = getComputedStyle(volumeBarProgress).getPropertyValue('--progress-bar-transform').replace('%', '') / 100;
            if (volume === 0) {
                volumeButton.dataset.vol = 'muted';
            } else if (volume <= 0.3) {
                volumeButton.dataset.vol = 'low';
            } else if (volume <= 0.6) {
                volumeButton.dataset.vol = 'mid';
            } else {
                volumeButton.dataset.vol = 'high';
            }
        }

        function updateTimeText() {
            switch (timeTextMode) {
                case 0:
                    {
                        const remaining = Spicetify.Player.data?.item?.metadata?.duration - Spicetify.Player.getProgress();
                        timeText.textContent = formatTime(remaining, true);
                    }
                    break;
                case 1:
                    {
                        let elapsed = timeTexts[0].textContent;
                        if (elapsed.length === 4 || elapsed.length === 7) { // idk if there's a hour-long song
                            elapsed = '0' + elapsed;
                        }
                        timeText.textContent = elapsed;
                    }
                    break;
                case 2:
                    {
                        let elapsed = timeTexts[0].textContent;
                        if (elapsed.length === 4 || elapsed.length === 7) {
                            elapsed = '0' + elapsed;
                        }
                        let total = timeTexts[1].textContent;
                        if (total.length === 4 || total.length === 7) {
                            total = '0' + total;
                        }
                        timeText.textContent = `${elapsed} / ${total}`;
                    }
                    break;
            }
        }
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
        const interval = setInterval(() => {
            if (isReady()) {
                init();
                console.log('WMPotify: Theme loaded');
                clearInterval(interval);
            } else if (cnt++ > 100) {
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
})();