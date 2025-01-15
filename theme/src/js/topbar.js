import { MadMenu, createMadMenu } from './MadMenu';
import WindhawkComm from './WindhawkComm';

let tabsContainer;
let tabs = [];
let overflowButton;

const tabNameSubstitutes = {
    'Your Library': 'Library',
    'Friend Activity': 'Friends',
}

export function setupTopbar() {
    const topbar = document.querySelector('.Root__globalNav');
    tabsContainer = document.createElement('div');
    tabsContainer.id = 'wmpotify-tabs-container';
    topbar.insertBefore(tabsContainer, topbar.querySelector('.main-globalNav-searchSection'));

    const homeButton = document.querySelector('.main-globalNav-searchContainer > button');
    addTab(homeButton);
    const searchButton = document.querySelector('.main-globalNav-searchContainer div form button');
    searchButton.addEventListener('click', (event) => {
        // This button behave differently from version to version
        // So just open the search page directly
        window.open('spotify:search');
        event.preventDefault();
        event.stopPropagation();
    });
    addTab(searchButton);
    const libraryButton = document.createElement('button');
    libraryButton.id = 'wmpotify-library-button';
    libraryButton.setAttribute('aria-label', 'Library');
    libraryButton.addEventListener('click', () => {
        Spicetify.Platform.History.push({ pathname: '/wmpotify-standalone-libx', });
    });
    Spicetify.Platform.History.listen(handleLocChange);
    handleLocChange(Spicetify.Platform.History.location);
    addTab(libraryButton);
    tabs = [homeButton, searchButton, libraryButton];
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

    topbar.addEventListener('pointerdown', (event) => {
        if (event.button === 2 && !event.target.closest('input')) {
            WindhawkComm.openSpotifyMenu();
        }
    });

    const rightSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--right-sidebar-width");
    if (rightSidebarWidth) {
        document.documentElement.style.setProperty("--panel-width", rightSidebarWidth);
    }
    const widthLocker = new MutationObserver(() => {
        if (Spicetify.Platform.History.location.pathname !== '/wmpotify-standalone-libx') {
            // 1.2.53 changed --panel-width to --right-sidebar-width
            const rightSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--right-sidebar-width");
            if (rightSidebarWidth) {
                widthLocker.disconnect();
                document.documentElement.style.setProperty("--panel-width", rightSidebarWidth);
                widthLocker.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
            }
            return;
        }
        // Prevent Spotify from wrongly setting the panel width CSS variable
        // Spotify thinks full LibX is open as a left sidebar and there's not much space left
        // Thus reducing the right sidebar width
        // So just get the real width and set it back
        widthLocker.disconnect();
        const rightSidebar = document.querySelector('.Root__right-sidebar aside');
        document.documentElement.style.setProperty("--panel-width", rightSidebar ? rightSidebar.offsetWidth : 8);
        document.documentElement.style.setProperty("--right-sidebar-width", rightSidebar ? rightSidebar.offsetWidth : 8);
        widthLocker.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    });
    widthLocker.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
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

function handleLocChange(location) {
    const username = Spicetify._platform.initialUser.username;
    if (location.pathname === '/wmpotify-standalone-libx') {
        document.body.dataset.wmpotifyLibPageOpen = true;

        const origSidebarState = parseInt(localStorage.getItem(username + ":ylx-sidebar-state"));
        const origSidebarWidth = parseInt(localStorage.getItem(username + ":ylx-expanded-state-nav-bar-width"));
        Spicetify.Platform.LocalStorageAPI.setItem("ylx-sidebar-state", 2);
        Spicetify.Platform.LocalStorageAPI.setItem("ylx-expanded-state-nav-bar-width", 0);
        localStorage.setItem(username + ":ylx-sidebar-state", origSidebarState); // make the previous setItem temporary
        localStorage.setItem(username + ":ylx-expanded-state-nav-bar-width", origSidebarWidth);
    } else if (document.body.dataset.wmpotifyLibPageOpen) {
        delete document.body.dataset.wmpotifyLibPageOpen;

        if (localStorage.wmpotifyShowLibX) {
            const origSidebarState = localStorage.getItem(username + ":ylx-sidebar-state");
            localStorage.removeItem(username + ":ylx-sidebar-state"); // Spicetify LocalStorageAPI does nothing if setting to same value
            const origSidebarWidth = localStorage.getItem(username + ":ylx-expanded-state-nav-bar-width");
            localStorage.removeItem(username + ":ylx-expanded-state-nav-bar-width");
            Spicetify.Platform.LocalStorageAPI.setItem("ylx-sidebar-state", parseInt(origSidebarState));
            Spicetify.Platform.LocalStorageAPI.setItem("ylx-expanded-state-nav-bar-width", parseInt(origSidebarWidth));
        } else {
            Spicetify.Platform.LocalStorageAPI.setItem("ylx-sidebar-state", 1); // collapsed
        }
    }
}