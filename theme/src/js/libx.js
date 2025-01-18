'use strict';

export function initCustomLibX() {
    if (document.querySelector('#wmpotify-libx-sidebar')) {
        return;
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'wmpotify-libx-sidebar';
    document.querySelector('.main-yourLibraryX-libraryItemContainer').insertAdjacentElement('afterbegin', sidebar);

    sidebar.innerHTML = `
        <button id="wmpotify-libx-sidebar-playlists" class="wmpotify-libx-sidebar-item">Playlists</button>
        <div class="wmpotify-libx-sidebar-downlevel"></div>
        <button id="wmpotify-libx-sidebar-albums" class="wmpotify-libx-sidebar-item">Albums</button>
        <button id="wmpotify-libx-sidebar-artists" class="wmpotify-libx-sidebar-item">Artists</button>
    `;

    const playlistsButton = sidebar.querySelector('#wmpotify-libx-sidebar-playlists');
    const albumsButton = sidebar.querySelector('#wmpotify-libx-sidebar-albums');
    const artistsButton = sidebar.querySelector('#wmpotify-libx-sidebar-artists');
}