'use strict';

const canvas = document.createElement('canvas');
canvas.width = 1;
canvas.height = 1;
const context = canvas.getContext('2d');

function getTintedBackgroundColor(hue, sat) {
    context.fillStyle = document.documentElement.dataset.wmpotifyDarkMode ? '#222222' : '#EEF3FA';
    context.filter = `hue-rotate(${hue}deg) saturate(${sat}%)`;
    context.fillRect(0, 0, 1, 1);
    return 'rgba(' + context.getImageData(0, 0, 1, 1).data + ')';
}

export function setTintColor(hue, sat, tintPb) {
    if (!hue && !sat) {
        document.documentElement.style.setProperty('--spice-main', '#EEF3FA');
        document.documentElement.style.removeProperty('--wmpotify-tint-hue');
        document.documentElement.style.removeProperty('--wmpotify-tint-sat');
        return;
    }
    const playerBar = document.querySelector('.main-nowPlayingBar-nowPlayingBar');
    if (playerBar) {
        if (tintPb) {
            playerBar.classList.add('tinted');
        } else {
            playerBar.classList.remove('tinted');
        }
    }
    document.documentElement.style.setProperty('--spice-main', getTintedBackgroundColor(hue, sat));
    document.documentElement.style.setProperty('--wmpotify-tint-hue', hue + 'deg');
    document.documentElement.style.setProperty('--wmpotify-tint-sat', sat / 100);
}