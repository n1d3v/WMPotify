'use strict';

import { formatTime } from "./functions";
import { createMadMenu, MadMenu } from "./MadMenu";

export function initQueuePanel() {
    if (!document.querySelector('#queue-panel') ||
        document.querySelector('#wmpotify-queue-toolbar') ||
        document.querySelectorAll('div[data-encore-id="tabPanel"]').length > 2
    ) {
        return;
    }

    const panel = document.querySelector('#Desktop_PanelContainer_Id');
    panel.classList.add('spotify-queue-panel');
    const top = document.querySelector('#Desktop_PanelContainer_Id > div > div:first-child > div:first-child');
    const belowSeparator = document.querySelector('#Desktop_PanelContainer_Id > div > div:nth-child(2)');
    belowSeparator.id = 'spotify-queue-panel-content';

    const queueToolbar = document.createElement('div');
    queueToolbar.id = 'wmpotify-queue-toolbar';

    const playlistButton = document.createElement('button');
    playlistButton.id = 'wmpotify-queue-playlist-button';
    playlistButton.classList.add('wmpotify-toolbar-button');
    playlistButton.addEventListener('click', () => {
        const url = Spicetify.Player.data?.context?.uri;
        if (url) {
            window.open(url);
        }
    });
    playlistButton.textContent = document.querySelector('#queue-panel div[data-flip-id*="section-header-"] a')?.textContent || 'Now Playing';
    playlistButton.innerHTML += '<span class="expandMark">⏷</span>';
    queueToolbar.appendChild(playlistButton);

    const clearButton = document.createElement('button');
    clearButton.id = 'wmpotify-queue-clear-button';
    clearButton.classList.add('wmpotify-toolbar-button');
    clearButton.addEventListener('click', () => {
        Spicetify.Platform.PlayerAPI.clearQueue();
        Spicetify.Player.playUri("");
    });

    queueToolbar.appendChild(clearButton);
    belowSeparator.insertAdjacentElement('afterbegin', queueToolbar);

    const placeholderImage = getComputedStyle(document.documentElement).getPropertyValue('--album-art-placeholder').trim().slice(5, -2);
    const topPanel = document.createElement('div');
    topPanel.id = 'wmpotify-queue-npv';
    const albumArt = document.createElement('img');
    albumArt.id = 'wmpotify-queue-album-art';
    albumArt.src = document.querySelector('.main-nowPlayingWidget-coverArt .cover-art img')?.src || placeholderImage;
    topPanel.appendChild(albumArt);
    const songTitle = document.createElement('div');
    songTitle.id = 'wmpotify-queue-song-title';
    songTitle.textContent = document.querySelector('.main-trackInfo-name')?.textContent || 'No items';
    topPanel.appendChild(songTitle);
    top.insertAdjacentElement('afterbegin', topPanel);

    onQueuePanelInit();
    new MutationObserver(onQueuePanelInit).observe(document.querySelector('#queue-panel'), { childList: true });

    const tabs = document.querySelectorAll('#Desktop_PanelContainer_Id div[role="tablist"] button');
    let menuItems = [];
    let menuObj;
    for (const tab of tabs) {
        menuItems.push({
            text: tab.textContent,
            click: function () {
                for (const menuItem of menuObj.menuItems) {
                    menuItem.classList.remove('activeStyle');
                }
                this.classList.add('activeStyle');
                tab.click()
            }
        });
    }
    menuItems[0].classList = ['activeStyle'];
    document.querySelector('#wmpotifyQueueTabMenuBg')?.remove();
    menuObj = createMadMenu('wmpotifyQueueTab', menuItems);
    const menu = new MadMenu(['wmpotifyQueueTab']);
    panel.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menu.openMenu('wmpotifyQueueTab', { left: e.clientX + 'px', top: e.clientY + 'px' });
    });

    Spicetify.Player.addEventListener('songchange', () => {
        playlistButton.textContent = Spicetify.Player.data?.context?.metadata?.context_description || 'Now Playing';
        playlistButton.innerHTML += '<span class="expandMark">⏷</span>';
        albumArt.src = Spicetify.Player.data?.item?.album?.images?.[0]?.url?.replace('spotify:image:', 'https://i.scdn.co/image/') || placeholderImage;
        songTitle.textContent = Spicetify.Player.data?.item?.name || 'No items';
    });
}

function onQueuePanelInit() {
    const panelContent = document.querySelectorAll('#queue-panel ul')[1];
    if (panelContent) {
        processQueueItems();
        new MutationObserver(processQueueItems).observe(panelContent, { childList: true });
    }
}

function processQueueItems() {
    if (!document.querySelector('#queue-panel') || !Spicetify.Queue) {
        return;
    }
    const queueItems = document.querySelectorAll('#queue-panel li .HeaderArea');
    for (let i = 0; i < queueItems.length; i++) {
        const queueItem = queueItems[i];
        if (queueItem.querySelector('.wmpotify-queue-duration')) {
            continue;
        }
        const duration = i === 0 ?
            Spicetify.Queue.track?.contextTrack?.metadata?.duration :
            Spicetify.Queue.nextTracks?.[i - 1]?.contextTrack?.metadata?.duration;
        if (!duration) {
            continue;
        }
        const durationElement = document.createElement('span');
        durationElement.classList.add('wmpotify-queue-duration');
        durationElement.textContent = formatTime(duration);
        queueItem.appendChild(durationElement);
    }
}