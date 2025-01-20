'use strict';

import { formatTime } from './functions';
import WindhawkComm from './WindhawkComm';

let playPauseButton, volumeButton, volumeBarProgress, timeTexts, timeTextMode, timeText;
let longPressTimer = null;
let titleSet = false;

export function setupPlayerbar() {
    const playerBar = document.querySelector('.main-nowPlayingBar-nowPlayingBar');

    playPauseButton = document.querySelector(".player-controls__buttons button[data-testid='control-button-playpause']");
    Spicetify.Player.addEventListener("onplaypause", updatePlayPauseButton);
    new MutationObserver(updatePlayPauseButton).observe(playPauseButton, { attributes: true, attributeFilter: ['aria-label'] });

    setupTrackInfoWidget();
    new MutationObserver(setupTrackInfoWidget).observe(document.querySelector('.main-nowPlayingBar-left'), { childList: true });

    const playerControlsLeft = document.querySelector('.player-controls__left');
    const prevButton = document.querySelector('.player-controls__buttons button[data-testid="control-button-skip-back"]');
    const nextButton = document.querySelector('.player-controls__buttons button[data-testid="control-button-skip-forward"]');
    const repeatButton = document.querySelector('.player-controls__buttons button[data-testid="control-button-repeat"]');
    playerControlsLeft.insertBefore(repeatButton, prevButton);

    const whStatus = WindhawkComm.query();
    if (whStatus?.speedModSupported && whStatus.immediateSpeedChange) {
        nextButton.addEventListener('pointerdown', () => {
            // Speed control won't work when using Spotify Connect (playing on another device)
            if (nextButton.disabled || Spicetify.Platform.ConnectAPI.state.connectionStatus === 'connected') {
                return;
            }
            longPressTimer = setTimeout(() => {
                nextButton.dataset.fastForward = true;
                WindhawkComm.setPlaybackSpeed(5);
                Spicetify.Player.play();
            }, 1000);
        });
        nextButton.addEventListener('click', (event) => {
            clearTimeout(longPressTimer);
            if (nextButton.dataset.fastForward) {
                delete nextButton.dataset.fastForward;
                WindhawkComm.setPlaybackSpeed(1);
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

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
    volumeButton = volumeBar.querySelector('.volume-bar__icon-button');
    volumeBarProgress = volumeBar.querySelector('.progress-bar');
    updateVolumeIcon();
    new MutationObserver(updateVolumeIcon).observe(volumeBarProgress, { attributes: true, attributeFilter: ['style'] });
    playerControlsRight.appendChild(volumeBar);

    const volSlider = document.querySelector('.volume-bar__slider-container');
    const volPopup = volSlider.children[0];
    volSlider.addEventListener('click', () => {
        if (window.innerWidth < 750) {
            volPopup.dataset.visible = true;
            const autoClose = setTimeout(() => {
                delete volPopup.dataset.visible;
            }, 5000);
            volPopup.addEventListener('pointerup', () => {
                clearTimeout(autoClose);
                setTimeout(() => {
                    delete volPopup.dataset.visible;
                }, 100);
            }, { once: true });
        }
    });

    timeTexts = document.querySelectorAll('.playback-bar .encore-text'); // 0: elapsed, 1: total (both in HH:MM:SS format)
    const timeTextContainer = document.createElement('div');
    timeTextContainer.classList.add('wmpotify-time-text-container');
    timeText = document.createElement('span');
    timeText.classList.add('wmpotify-time-text');
    timeTextMode = parseInt(localStorage.wmpotifyTimeTextMode || 0); // 0: remaining, 1: elapsed, 2: elapsed / total
    updateTimeText();
    timeText.dataset.mode = timeTextMode;
    timeText.addEventListener('click', () => {
        timeTextMode = (timeTextMode + 1) % 3;
        timeText.dataset.mode = timeTextMode;
        localStorage.wmpotifyTimeTextMode = timeTextMode;
    });
    timeTextContainer.appendChild(timeText);
    playerBar.insertAdjacentElement('afterbegin', timeTextContainer);
    Spicetify.Player.addEventListener("onprogress", updateTimeText);

    const titlebar = document.querySelector('#wmpotify-title-bar');
    const titleButtons = document.querySelector('#wmpotify-title-buttons');
    if (titlebar) {
        updateTimeTextMiniMode();
        window.addEventListener('resize', updateTimeTextMiniMode);
    }

    if (whStatus) {
        const pipButton = document.querySelector('.main-nowPlayingBar-extraControls button[data-testid="pip-toggle-button"]');
        if (pipButton) {
            pipButton.addEventListener('click', (event) => {
                if (window.innerWidth < 360 && window.innerHeight < 262) {
                    const lastSize = localStorage.wmpotifyPreMiniModeSize?.split(',');
                    if (lastSize && lastSize.length === 2) {
                        window.resizeTo(parseInt(lastSize[0]), parseInt(lastSize[1]));
                    }
                } else {
                    localStorage.wmpotifyPreMiniModeSize = [window.innerWidth, window.innerHeight];
                    WindhawkComm.resizeTo(358, 60);
                }
                event.preventDefault();
                event.stopPropagation();
            });
        }
    }

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

    function updateTimeTextMiniMode() {
        if (window.innerWidth < 750) {
            if (!titlebar.contains(timeText)) {
                if (titleButtons) {
                    titlebar.insertBefore(timeText, titleButtons);
                } else {
                    titlebar.appendChild(timeText);
                }
            }
        } else {
            if (!playerBar.contains(timeText)) {
                timeTextContainer.appendChild(timeText);
            }
        }
    }
}

async function setupTrackInfoWidget() {
    console.log('setupTrackInfoWidget');
    updatePlayPauseButton();
    const isCustomTitlebar = !!document.querySelector('#wmpotify-title-bar');
    const whAvailable = WindhawkComm.available();
    const origDefaultTitle = await Spicetify.AppTitle.get();
    const titlebarText = document.querySelector('#wmpotify-title-text');

    const trackInfoWidget = document.querySelector('.main-nowPlayingWidget-trackInfo');
    if (!trackInfoWidget || document.querySelector('.wmpotify-track-info')) {
        return;
    }
    const trackInfoText = document.createElement('p');
    trackInfoText.classList.add('wmpotify-track-info');
    trackInfoText.textContent = document.querySelector('.main-trackInfo-name')?.textContent || '';
    trackInfoWidget.appendChild(trackInfoText);
    if (window.innerWidth < 420 && window.innerHeight < (isCustomTitlebar ? 92 : 62)) {
        if (isCustomTitlebar) {
            titlebarText.textContent = trackInfoText.textContent;
        } else if (whAvailable) {
            WindhawkComm.setTitle(trackInfoText.textContent);
        }
        titleSet = true;
    }

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

        // Mini mode
        if (window.innerWidth < 420 && window.innerHeight < (isCustomTitlebar ? 92 : 62)) {
            if (isCustomTitlebar) {
                titlebarText.textContent = trackInfoText.textContent;
            } else if (whAvailable) {
                WindhawkComm.lockTitle(true);
                WindhawkComm.setTitle(trackInfoText.textContent);
            }
            titleSet = true;
        } else {
            if (titleSet) {
                titleSet = false;
                if (isCustomTitlebar) {
                    titlebarText.textContent = origDefaultTitle;
                }
                WindhawkComm.lockTitle(false);
                if (Spicetify.Player.isPlaying()) {
                    WindhawkComm.setTitle(trackInfo.artist_name + ' - ' + trackInfo.title);
                } else {
                    WindhawkComm.setTitle(origDefaultTitle);
                }
            }
        }
    }, 3000);
    Spicetify.Player.addEventListener("songchange", () => {
        trackInfoCurrent = 0;
        trackInfoText.textContent = Spicetify.Player.data?.item.metadata.title;
        if (window.innerWidth < 420 && window.innerHeight < (isCustomTitlebar ? 92 : 62)) {
            if (isCustomTitlebar) {
                titlebarText.textContent = trackInfoText.textContent;
            } else if (whAvailable) {
                WindhawkComm.setTitle(trackInfoText.textContent);
            }
            titleSet = true;
        }
    });
}

export function updatePlayPauseButton() {
    playPauseButton?.classList.toggle('playing', Spicetify.Player.isPlaying());
    const currentPlaylistPage = document.querySelector(`.playlist-playlist-playlist[data-test-uri="${Spicetify.Player.data?.context?.uri}"]`);
    if (currentPlaylistPage) {
        currentPlaylistPage.classList.toggle('playing', Spicetify.Player.isPlaying());
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