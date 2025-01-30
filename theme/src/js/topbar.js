'use strict';

import Strings from './strings';
import { MadMenu, createMadMenu } from './MadMenu';
import WindhawkComm from './WindhawkComm';

let tabsContainer;
let tabs = [];
let overflowButton;

const tabNameSubstitutes = {
    'Friend Activity': 'Friends',
}

export function setupTopbar() {
    const topbar = document.querySelector('.Root__globalNav');
    tabsContainer = document.createElement('div');
    tabsContainer.id = 'wmpotify-tabs-container';
    topbar.insertBefore(tabsContainer, topbar.querySelector('.main-globalNav-searchSection'));

    let nowPlayingButton = document.querySelector('.custom-navlinks-scrollable_container div[role="presentation"] > button:has(#wmpotify-nowplaying-icon)');
    if (!nowPlayingButton) {
        nowPlayingButton = document.createElement('button');
        nowPlayingButton.addEventListener('click', () => {
            if (Spicetify.Config.custom_apps.includes('wmpvis')) {
                // Somehow Spicetify didn't create CustomApps buttons but it's still installed
                Spicetify.Platform.History.push({ pathname: '/wmpvis' });
            } else {
                const dialogContent = document.createElement('div');
                dialogContent.id = 'wmpotify-wmpvis-install-dialog';
                dialogContent.innerHTML = `
                    <p>${Strings['WMPVIS_INSTALL_DESC']}</p><br>
                    <img src="https://raw.githubusercontent.com/Ingan121/WMPotify/refs/heads/master/screenshots/wmpvis_aero_2.png" alt="WMPotify NowPlaying screenshot"><br><br>
                    <p>${Strings['WMPVIS_INSTALL_STEPS']}</p><br>
                    <ol>
                        <li>1. ${Strings['WMPVIS_INSTALL_STEP1']}</li>
                        <div class="wmpotify-code-container">
                            <button id="wmpotify-copy-code">
                                ${/* https://icons.getbootstrap.com/icons/copy/ */ ''}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                                </svg>
                            </button>
                            <code>
                            ${navigator.userAgent.includes('Windows') ?
                                'powershell -command "iex ""& { $(iwr -useb \'<a href="https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.ps1">https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.ps1</a>\') } -Install @(\'wmpvis\')"""' :
                                'export SKIP_THEME=true; curl -fsSL <a href="https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.sh">https://raw.githubusercontent.com/Ingan121/WMPotify/master/installer/install.sh</a> | sh'
                            }
                            </code>
                        </div>
                        <li>2. ${Strings[navigator.userAgent.includes('Windows') ? 'WMPVIS_INSTALL_STEP2' : 'WMPVIS_INSTALL_STEP2_UNIX']}</li>
                        <li>3. ${Strings['WMPVIS_INSTALL_STEP3']}</li>
                    </ol><br>
                    <p>${Strings.getString('WMPVIS_INSTALL_MORE_INFO', `<a href="https://github.com/Ingan121/WMPotify">${Strings['UI_CLICK_HERE']}</a>`)}</p>
                    <p>${Strings.getString('WMPVIS_INSTALL_HIDE', `<a href="javascript:localStorage.wmpotifyNoWmpvis=true;document.querySelector('#wmpotify-tabs-container button[data-identifier=now-playing]').dataset.hidden=true;Spicetify.PopupModal.hide();window.dispatchEvent(new Event('resize'))">${Strings['UI_CLICK_HERE']}</a>`)}</p>
                `;
                Spicetify.PopupModal.display({
                    title: Strings['WMPVIS_INSTALL_TITLE'],
                    content: dialogContent
                });
                document.querySelector('#wmpotify-copy-code').addEventListener('click', () => {
                    const command = document.querySelector('#wmpotify-wmpvis-install-dialog code').textContent.trim();
                    Spicetify.Platform.ClipboardAPI.copy(command);
                });
            }
        });
        if (localStorage.wmpotifyNoWmpvis && !Spicetify.Config.custom_apps.includes('wmpvis')) {
            nowPlayingButton.dataset.hidden = true;
        }
    }
    nowPlayingButton.setAttribute('aria-label', Strings['TAB_NOW_PLAYING']);
    nowPlayingButton.dataset.identifier = 'now-playing';
    addTab(nowPlayingButton);
    const homeButton = document.querySelector('.main-globalNav-searchContainer > button');
    homeButton.dataset.identifier = 'home';
    addTab(homeButton);
    const searchButton = document.querySelector('.main-globalNav-searchContainer div form button');
    searchButton.dataset.identifier = 'search';
    searchButton.addEventListener('click', (event) => {
        // This button behave differently from version to version
        // So just open the search page directly
        Spicetify.Platform.History.push({ pathname: '/search' });
        event.preventDefault();
        event.stopPropagation();
    });
    addTab(searchButton);
    const libraryButton = document.createElement('button');
    libraryButton.id = 'wmpotify-library-button';
    libraryButton.dataset.identifier = 'library';
    libraryButton.setAttribute('aria-label', Strings['TAB_LIBRARY']);
    libraryButton.addEventListener('click', () => {
        Spicetify.Platform.History.push({ pathname: '/wmpotify-standalone-libx', });
    });
    addTab(libraryButton);
    tabs = [nowPlayingButton, homeButton, searchButton, libraryButton];
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
    overflowButton = document.createElement('button');
    overflowButton.id = 'wmpotify-tabs-overflow-button';
    overflowButton.addEventListener('click', () => {
        menu.openMenu('wmpotifyTab', { top: '0', left: overflowButton.getBoundingClientRect().left + 'px' });
    });
    tabsContainer.appendChild(overflowButton);
    handleTabOverflow();
    setTimeout(handleTabOverflow, 1000);
    window.addEventListener('resize', handleTabOverflow);
    document.addEventListener('fullscreenchange', handleTabOverflow);

    const accountButton = document.querySelector('.main-topBar-topbarContentRight > button:last-child');
    const accountLabel = document.createElement('span');
    accountLabel.textContent = accountButton.getAttribute('aria-label');
    accountLabel.classList.add('wmpotify-user-label');
    accountButton.appendChild(accountLabel);

    const searchContainer = document.createElement('div');
    searchContainer.id = 'wmpotify-search-container';
    const searchBarWrapper = document.createElement('div');
    searchBarWrapper.id = 'wmpotify-search-wrapper';
    const searchBar = document.querySelector('.main-globalNav-searchContainer div form input[type="search"]');
    searchBarWrapper.appendChild(searchBar);
    const searchClearButton = document.createElement('button');
    searchClearButton.id = 'wmpotify-search-clear-button';
    searchClearButton.setAttribute('aria-label', 'Clear search');
    searchClearButton.addEventListener('click', () => {
        searchBar.value = '';
        searchBar.focus();
        Spicetify.Platform.History.push({ pathname: '/search' });
    });
    searchBarWrapper.appendChild(searchClearButton);
    searchContainer.appendChild(searchBarWrapper);
    topbar.appendChild(searchContainer);

    topbar.addEventListener('pointerdown', (event) => {
        if (event.button === 2 && !event.target.closest('input')) {
            WindhawkComm.openSpotifyMenu();
        }
    });

    const rightSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--right-sidebar-width");
    if (rightSidebarWidth) {
        document.documentElement.style.setProperty("--panel-width", rightSidebarWidth);
    }
}

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