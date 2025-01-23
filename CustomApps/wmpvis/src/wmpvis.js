// wmpvis.js for ModernActiveDesktop Visualizer
// Made by Ingan121
// Licensed under the MIT License
// SPDX-License-Identifier: MIT

'use strict';

import ButterchurnAdaptor from './butterchurn/adaptor';
import { spAudioDataToFrequencies } from './spadapter';

let albumArt = null;
let visBar = null;
let visTop = null;
let visBC = null;
let visBarCtx = null;
let visTopCtx = null;
let debugView = null;

let audioData = null;

let idle = false;

let visConfig = {};

const arraySize = 96;
const arraySizeReduced = 49;

const fps = 30;
let interval;

const lastAud = new Array(arraySize).fill(0);
const lastBar = new Array(arraySizeReduced).fill(0);
const lastTop = new Array(arraySizeReduced).fill(0);
const topSpeed = new Array(arraySizeReduced).fill(0);

let lastIndex = 0;

export function findAudioArray(near) {
    if (!audioData) {
        return -1;
    }

    const current = Spicetify.Player.getProgress() / 1000;
    let index = near;

    if (index < 0) {
        index = 0;
    } else if (index >= audioData.length) {
        index = audioData.length - 1;
    }

    if (current < audioData[index][0]) {
        index = 0;
    }

    while (index < audioData.length - 1 && audioData[index + 1][0] < current) {
        index++;
    }

    debugView.innerText = index;

    return index;
}

async function wallpaperAudioListener() {
    if (!visBar || !visTop || !debugView) {
        uninit();
        return;
    }

    if (visConfig.type !== 'bars') {
        return;
    }

    const index = findAudioArray(lastIndex);
    let audioArray = audioData[index]?.slice(1) || new Array(arraySize).fill(0);
    const same = index === lastIndex;
    if (same) {
        audioArray = new Array(arraySize).fill(0);
    }
    lastIndex = index;

    // Optimization
    if (idle) {
        if (audioArray[Math.round(Math.random() * (arraySize - 1))] <= 0.0001) {
            return;
        }
        idle = false;
    }
    
    for (let i = 0; i < audioArray.length - 2; i += 2) {
        audioArray[i / 2] = (audioArray[i] + audioArray[i + 1]) / 2;
    }
    audioArray[arraySizeReduced - 2] = audioArray[arraySize - 2];
    audioArray[arraySizeReduced - 1] = audioArray[arraySize - 1];

    // Clear the canvas
    visBarCtx.clearRect(0, 0, visBar.width, visBar.height);

    // Render bars along the full width of the canvas
    const barWidth = visConfig.barWidth || Math.max(Math.round(1.0 / arraySizeReduced * visBar.width), 6);
    const gap = 1;

    visBarCtx.fillStyle = visConfig.barColor;
    visTopCtx.fillStyle = visConfig.topColor;

    let leftMargin = 0;
    if (barWidth * arraySizeReduced < visBar.width) {
        leftMargin = Math.round((visBar.width - barWidth * arraySizeReduced) / 2);
    }
    let allZero = true;
    for (var i = 0; i < audioArray.length; ++i) {
        if (i === 64 && visConfig.channelSeparation === 3) {
            break;
        }
        // Create an audio bar with its hight depending on the audio volume level of the current frequency
        const height = Math.round(visBar.height * Math.min(audioArray[i], 1) * visConfig.primaryScale);
        if (height > lastBar[i]) {
            lastBar[i] = height;
            visBarCtx.fillRect(leftMargin + barWidth * i, visBar.height - height, barWidth - gap, height);
        } else {
            lastBar[i] -= visConfig.decSpeed;
            const diff = audioArray[i] - lastAud[i];
            if (diff > 0.1) {
                lastBar[i] += Math.round(360 * diff * visConfig.diffScale);
                if (lastBar[i] > visBar.height) {
                    lastBar[i] = visBar.height;
                }
            }
            visBarCtx.fillRect(leftMargin + barWidth * i, visBar.height - lastBar[i], barWidth - gap, lastBar[i]);
        }
        const topPos = visTop.height - Math.round(lastBar[i]) - 1;
        if (topPos < lastTop[i]) {
            lastTop[i] = topPos;
            visTopCtx.fillRect(leftMargin + barWidth * i, topPos, barWidth - gap, 1);
            topSpeed[i] = 0;
            allZero = false;
        } else if (lastTop[i] < visTop.height - 1) {
            visTopCtx.clearRect(leftMargin + barWidth * i, 0, barWidth - gap, visTop.height);
            if (topSpeed[i] > 38) {
                lastTop[i] += 5 * Math.round(visConfig.decSpeed / 3);
            } else if (topSpeed[i] > 26) {
                lastTop[i] += 4 * Math.round(visConfig.decSpeed / 3);
                topSpeed[i] += 1;
            } else if (topSpeed[i] > 18) {
                lastTop[i] += 3 * Math.round(visConfig.decSpeed / 3);
                topSpeed[i] += 1;
            } else if (topSpeed[i] > 10) {
                lastTop[i] += 2 * Math.round(visConfig.decSpeed / 3);
                topSpeed[i] += 1;
            } else {
                topSpeed[i] += 1 + Math.round(visConfig.decSpeed / 3);
            }
            visTopCtx.fillRect(leftMargin + barWidth * i, lastTop[i], barWidth - gap, 1);
            allZero = false;
        }
        lastAud[i] = audioArray[i];
    }
    if (allZero) {
        idle = true;
    }
}

function updateSize() {
    const clientRect = visBar.getBoundingClientRect();
    visBar.height = clientRect.height;
    visBar.width = clientRect.width;
    visTop.height = visBar.height;
    visTop.width = visBar.width;
    idle = false;
}

export function updateVisConfig() {
    visConfig = {
        type: localStorage.wmpotifyVisType || 'bars',
        barColor: localStorage.wmpotifyVisBarColor || '#a4eb0c',
        topColor: localStorage.wmpotifyVisTopColor || '#dfeaf7',
        barWidth: parseInt(localStorage.wmpotifyVisBarWidth || 6),
        decSpeed: parseFloat(localStorage.wmpotifyVisDecSpeed || 2),
        primaryScale: parseFloat(localStorage.wmpotifyVisPrimaryScale || 1.0),
        diffScale: parseFloat(localStorage.wmpotifyVisDiffScale || 0.07)
    };
    visTopCtx.clearRect(0, 0, visTop.width, visTop.height);
    idle = false;

    if (visConfig.type === 'milkdrop') {
        ButterchurnAdaptor.init(visBC);
        ButterchurnAdaptor.setPaused(false);
    } else {
        ButterchurnAdaptor.setPaused(true);
    }
}

async function setupListeners() {
    console.log('Setting up listeners');
    try {
        audioData = await spAudioDataToFrequencies();
    } catch {
        // Retry after 1 second
        setTimeout(setupListeners, 1000);
        return;
    }
    Spicetify.Player.addEventListener('songchange', async () => {
        audioData = await spAudioDataToFrequencies();
        lastIndex = 0;
        albumArt.src = Spicetify.Player.data?.item?.album?.images?.[0]?.url?.replace('spotify:image:', 'https://i.scdn.co/image/');
    });
    ButterchurnAdaptor.setAudioData(audioData);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(wallpaperAudioListener, 1000 / fps);
}

window.addEventListener('resize', updateSize);

export async function init(elemRefs) {
    console.log('Initializing wmpvis');
    albumArt = elemRefs.albumArt.current;
    visBar = elemRefs.visBar.current;
    visTop = elemRefs.visTop.current;
    visBC = elemRefs.visBC.current;
    debugView = elemRefs.debug.current;

    visBarCtx = visBar.getContext('2d');
    visTopCtx = visTop.getContext('2d');

    updateSize();
    lastTop.fill(visTop.height);
    setupListeners();
    updateVisConfig();
    new ResizeObserver(updateSize).observe(visBar);

    albumArt.src = document.querySelector('.main-nowPlayingWidget-coverArt .cover-art img')?.src;

    if (visConfig.type === 'milkdrop') {
        ButterchurnAdaptor.init(visBC);
    }
}

export function uninit() {
    if (interval) {
        clearInterval(interval);
    }
    ButterchurnAdaptor.uninit();
}