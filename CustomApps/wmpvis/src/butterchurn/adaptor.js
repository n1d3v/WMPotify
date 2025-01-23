'use strict';

// Some codes are from https://steamcommunity.com/sharedfiles/filedetails/?id=2962616483

import butterchurn from './butterchurn.min.js';
import butterchurnExtraImages from './butterchurnExtraImages.min.js';
import butterchurnPresets from './butterchurnPresets.min.js';
import butterchurnPresetsExtra from './butterchurnPresetsExtra.min.js';
import butterchurnPresetsExtra2 from './butterchurnPresetsExtra2.min.js';
import FFT from './fft';
import { findAudioArray, uninit } from '../wmpvis';

let audioData = null;
let lastIndex = 0;

let inited = false;
let pause = false;
let randomTimer = null;
let renderTimer = null;

let visualizer = null;

const fps = 30;

const presets = Object.assign(
    {},
    butterchurnPresets.getPresets(),
    butterchurnPresetsExtra.getPresets(),
    butterchurnPresetsExtra2.getPresets()
);

export function init(canvas) {
    if (inited) {
        return;
    }

    const clientRect = canvas.getBoundingClientRect();
    canvas.width = clientRect.width;
    canvas.height = clientRect.height;

    visualizer = butterchurn.createVisualizer(null, canvas, {
        width: canvas.width,
        height: canvas.height,
        pixelRatio: window.devicePixelRatio || 1,
        textureRatio: 1
    });
    visualizer.loadExtraImages(butterchurnExtraImages.getImages());

    const fft = new FFT(96, 1024, false);

    const setVisualizerSize = () => {
        const clientRect = canvas.getBoundingClientRect();
        canvas.width = clientRect.width;
        canvas.height = clientRect.height;
        visualizer.setRendererSize(canvas.width, canvas.height);
    };

    setVisualizerSize();
    new ResizeObserver(setVisualizerSize).observe(canvas);

    let lastTime = +Date.now();

    let lastAudioArray = [];
    let newAudioArray = [];
    let interpolCycle = 1;

    const animationStep = () => {
        const currentTime = +Date.now();
        const elapsedTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        let renderTime = (Date.now() - currentTime) / 1000;

        if (!audioData || !visualizer || pause || !Spicetify.Player.isPlaying()) {
            renderTimer = setTimeout(() => {
                window.requestAnimationFrame(animationStep);
            }, (1/fps - renderTime)*1000);
            return;
        }

        const index = findAudioArray(lastIndex);
        lastAudioArray = audioData[index > 0 ? index - 1 : 0]?.slice(1) || new Array(96).fill(0);
        newAudioArray = audioData[index]?.slice(1) || new Array(96).fill(0);

        let audioArray = [];

        if(interpolCycle < (fps / 30)) {
            for(let i in newAudioArray) {
                audioArray[i] = lastAudioArray[i]+(((newAudioArray[i] - lastAudioArray[i]) / (fps / 30)) * interpolCycle)
            }

            interpolCycle++;
        }
        else {
            audioArray = newAudioArray;
        }

        visualizer.render({
            elapsedTime: elapsedTime,
            audioLevels: {
                timeByteArray: fft.timeToFrequencyDomain(audioArray),
                timeByteArrayL: fft.timeToFrequencyDomain(audioArray),
                timeByteArrayR: fft.timeToFrequencyDomain(audioArray)
            }
        });

        renderTimer = setTimeout(() => {
            window.requestAnimationFrame(animationStep);
        }, (1/fps - renderTime)*1000);
    }

    window.requestAnimationFrame(animationStep);

    if (localStorage.wmpotifyVisBCPreset) {
        ButterchurnAdaptor.setPreset(localStorage.wmpotifyVisBCPreset);
    } else {
        beginRandomTimer();
    }

    inited = true;
}

function beginRandomTimer() {
    clearInterval(randomTimer);
    randomTimer = setInterval(() => {
        const presetNames = Object.keys(presets);
        const randomPreset = presetNames[Math.floor(Math.random() * presetNames.length)];
        ButterchurnAdaptor.setPreset(randomPreset);
    }, 6000);
}

const ButterchurnAdaptor = {
    init,
    setAudioData: (data) => {
        audioData = data;
    },
    setPaused: (value) => {
        pause = value;
    },
    getPresets: () => {
        return Object.keys(presets);
    },
    setPreset: (presetName) => {
        if (presetName === null) {
            beginRandomTimer();
        } else {
            clearInterval(randomTimer);
            visualizer.loadPreset(presets[presetName]);
        }
    },
    uninit: () => {
        clearInterval(randomTimer);
        clearInterval(renderTimer);
        visualizer = null;
        inited = false;
    }
};

export default ButterchurnAdaptor;