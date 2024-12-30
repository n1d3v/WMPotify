export function initQueuePanel() {
    if (!document.querySelector('#queue-panel') ||
        document.querySelector('#wmpotify-queue-toolbar') ||
        document.querySelectorAll('div[data-encore-id="tabPanel"]').length > 2
    ) {
        return;
    }

    const top = document.querySelector('#Desktop_PanelContainer_Id > div > div:first-child > div:first-child');
    const belowSeparator = document.querySelector('#Desktop_PanelContainer_Id > div > div:nth-child(2)');

    const queueToolbar = document.createElement('div');
    queueToolbar.id = 'wmpotify-queue-toolbar';

    const playlistButton = document.createElement('button');
    playlistButton.id = 'wmpotify-queue-playlist-button';
    playlistButton.classList.add('wmpotify-toolbar-button');
    playlistButton.addEventListener('click', () => {
        window.open(Spicetify.Player.data.context.uri);
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

    const topPanel = document.createElement('div');
    topPanel.id = 'wmpotify-queue-npv';
    const albumArt = document.createElement('img');
    albumArt.id = 'wmpotify-queue-album-art';
    albumArt.src = document.querySelector('.main-nowPlayingWidget-coverArt .cover-art img')?.src || '';
    topPanel.appendChild(albumArt);
    const songTitle = document.createElement('div');
    songTitle.id = 'wmpotify-queue-song-title';
    songTitle.textContent = document.querySelector('.main-trackInfo-name')?.textContent || '';
    topPanel.appendChild(songTitle);
    top.insertAdjacentElement('afterbegin', topPanel);

    Spicetify.Player.addEventListener('songchange', () => {
        playlistButton.textContent = Spicetify.Player.data?.context?.metadata?.context_description || 'Now Playing';
        playlistButton.innerHTML += '<span class="expandMark">⏷</span>';
        albumArt.src = Spicetify.Player.data?.item?.album?.images?.[0]?.url?.replace('spotify:image:', 'https://i.scdn.co/image/') || '';
        songTitle.textContent = Spicetify.Player.data?.item?.name || '';
    });
}