'use strict';

import WindhawkComm from "./WindhawkComm";

let fullscreenHideControlTimer = null;

function toggleMiniMode() {
    if (!WindhawkComm.available()) {
        return;
    }
    if (window.innerWidth < 360 && window.innerHeight < 262) {
        const lastSize = localStorage.wmpotifyPreMiniModeSize?.split(',');
        if (lastSize && lastSize.length === 2) {
            window.resizeTo(parseInt(lastSize[0]), parseInt(lastSize[1]));
        }
    } else {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        localStorage.wmpotifyPreMiniModeSize = [window.innerWidth, window.innerHeight];
        WindhawkComm.resizeTo(358, 60);
    }
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        exitFullscreen();
    } else {
        if (Spicetify.Config.custom_apps.includes('wmpvis')) {
            Spicetify.Platform.History.push('/wmpvis');
        } else {
            if (lyricsButton) {
                lyricsButton.click();
            }
        }
        document.documentElement.requestFullscreen();
        document.body.classList.add('wmpotify-playerbar-visible');
        setTimeout(() => {
            document.addEventListener('pointermove', fullscreenMouseMoveListener);
            fullscreenMouseMoveListener();
        }, 200);
    }
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            exitFullscreen();
        }
    }, { once: true });
    // Somehow fullscreenchange event doesn't fire when exiting fullscreen with Esc key in Spotify
    document.addEventListener('resize', () => {
        exitFullscreen();
    }, { once: true });
}

function fullscreenMouseMoveListener() {
    if (!document.fullscreenElement) {
        exitFullscreen();
        return;
    }
    document.body.classList.add('wmpotify-playerbar-visible');
    clearTimeout(fullscreenHideControlTimer);
    fullscreenHideControlTimer = setTimeout(() => {
        document.body.classList.remove('wmpotify-playerbar-visible');
    }, 2000);
}

function exitFullscreen() {
    document.body.classList.remove('wmpotify-playerbar-visible');
    document.removeEventListener('pointermove', fullscreenMouseMoveListener);
}

const WindowManager = {
    toggleMiniMode,
    toggleFullscreen
}

export default WindowManager;