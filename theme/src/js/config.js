'use strict';

import { setTintColor } from "./tinting";
import WindhawkComm from "./WindhawkComm";

const configWindow = document.createElement('div');
let tabs = null;
let currentTab = 0;
let speedApplyTimer = null;

const elements = {
    title: null,
    hue: null,
    sat: null,
}

function init() {
    if (document.getElementById('wmpotify-config')) {
        return;
    }

    const mainView = document.querySelector('.Root__main-view');

    configWindow.id = 'wmpotify-config';
    configWindow.innerHTML = `
        <div id="wmpotify-config-topborder" class="wmpotify-tintable"></div>
        <button id="wmpotify-config-prev"></button>
        <button id="wmpotify-config-next"></button>
        <p id="wmpotify-config-title">Color Chooser</p>
        <button id="wmpotify-config-close"></button>
        <section class="wmpotify-config-tab-content" data-tab-title="Color Chooser" style="display: block;">
            <a href="#" id="wmpotify-config-color-reset">Reset</a><br>
            <label>Hue</label><br>
            <input type="range" id="wmpotify-config-hue" class="wmpotify-aero no-track" min="0" max="360" step="1" value="180"><br>
            <label>Saturation</label><br>
            <input type="range" id="wmpotify-config-sat" class="wmpotify-aero no-track" min="0" max="354" step="1" value="121"><br>
            <input type="checkbox" id="wmpotify-config-tint-playerbar" class="wmpotify-aero">
            <label for="wmpotify-config-tint-playerbar">Apply color to the now playing bar buttons</label>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="General">
            <label for="wmpotify-config-style">Style</label>
            <select id="wmpotify-config-style" class="wmpotify-aero">
                <option value="auto">Auto</option>
                <option value="xp">XP</option>
                <option value="aero">Aero</option>
                <option value="basic">Basic</option>
            </select><br>
            <label for="wmpotify-config-title-style">Title style</label>
            <select id="wmpotify-config-title-style" class="wmpotify-aero">
                <option value="auto">Auto</option>
                <option value="native">Native</option>
                <option value="custom">Custom</option>
                <option value="spotify">Spotify</option>
                <option value="keepmenu">Keep Menu</option>
            </select><br>
            <input type="checkbox" id="wmpotify-config-show-libx" class="wmpotify-aero">
            <label for="wmpotify-config-show-libx">Show Your Library X on the left sidebar</label><br>
            <button id="wmpotify-config-apply" class="wmpotify-aero">Apply</button>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="Play speed settings" data-wh-speedmod-required="true">
            <a href="#" id="wmpotify-config-speed-slow">Slow</a>
            <a href="#" id="wmpotify-config-speed-normal">Normal</a>
            <a href="#" id="wmpotify-config-speed-fast">Fast</a><br>
            <input type="range" id="wmpotify-config-speed" class="wmpotify-aero" min="0.5" max="2.0" step="0.1" value="1"><br>
            Play speed: <span id="wmpotify-config-speed-value">1.0</span>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="About">
            <div id="wmpotify-about-logo"></div>
            <p id="wmpotify-about-title">WMPotify</p><br>
            <p>A Windows Media Player 11 inspired Spicetify theme for Spotify</p>
            <p>Version: Pre-alpha</p>
            <p>Made by Ingan121 - <a href="https://www.ingan121.com/" target="_blank">www.ingan121.com</a></p>
            <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
        </section>
    `;

    configWindow.querySelector('#wmpotify-config-close').addEventListener('click', close);
    configWindow.querySelector('#wmpotify-config-apply').addEventListener('click', apply);
    if (!WindhawkComm.query()?.speedModSupported) {
        configWindow.querySelector('[data-wh-speedmod-required=true]').remove();
    } else {
        elements.speed = configWindow.querySelector('#wmpotify-config-speed');
        elements.speedValue = configWindow.querySelector('#wmpotify-config-speed-value');
        elements.speed.addEventListener('pointerup', onSpeedChange);
        configWindow.querySelector('#wmpotify-config-speed-slow').addEventListener('click', setSpeed.bind(null, 0.5));
        configWindow.querySelector('#wmpotify-config-speed-normal').addEventListener('click', setSpeed.bind(null, 1));
        configWindow.querySelector('#wmpotify-config-speed-fast').addEventListener('click', setSpeed.bind(null, 1.4));
        const playbackSpeed = WindhawkComm.query()?.playbackSpeed || 1;
        elements.speedValue.textContent = Number.isInteger(playbackSpeed) ? playbackSpeed + '.0' : playbackSpeed;
        elements.speedValue.addEventListener('click', () => {
            setSpeed(parseFloat(prompt('Enter a playback speed (0.5 - 5.0)', playbackSpeed)));
        });
    }
    tabs = configWindow.querySelectorAll('.wmpotify-config-tab-content');
    elements.title = configWindow.querySelector('#wmpotify-config-title');
    elements.hue = configWindow.querySelector('#wmpotify-config-hue');
    elements.sat = configWindow.querySelector('#wmpotify-config-sat');
    elements.tintPb = configWindow.querySelector('#wmpotify-config-tint-playerbar');
    elements.hue.addEventListener('input', onColorChange);
    elements.sat.addEventListener('input', onColorChange);
    elements.tintPb.addEventListener('change', onColorChange);
    configWindow.querySelector('#wmpotify-config-color-reset').addEventListener('click', resetColor);
    configWindow.querySelector('#wmpotify-config-prev').addEventListener('click', prevTab);
    configWindow.querySelector('#wmpotify-config-next').addEventListener('click', nextTab);

    if (localStorage.wmpotifyStyle) {
        configWindow.querySelector('#wmpotify-config-style').value = localStorage.wmpotifyStyle;
    }
    const titleStyleSelector = configWindow.querySelector('#wmpotify-config-title-style');
    if (!navigator.userAgent.includes('Windows')) {
        titleStyleSelector.querySelector('option[value=keepmenu]').remove();
    }
    if (navigator.userAgent.includes('Linux')) {
        titleStyleSelector.querySelector('option[value=spotify]').remove();
    }
    if (localStorage.wmpotifyTitleStyle) {
        titleStyleSelector.value = localStorage.wmpotifyTitleStyle;
    }
    if (localStorage.wmpotifyShowLibX) {
        configWindow.querySelector('#wmpotify-config-show-libx').checked = true;
    }
    
    mainView.appendChild(configWindow);
}

function open() {
    if (!tabs) {
        return;
    }
    if (document.body.dataset.wmpotifyLibPageOpen) {
        // Close standalone LibX and go to home / NowPlaying to show the config panel
        // As standalone LibX page hides the main area
        if (Spicetify.Config.custom_apps.includes('wmpvis')) {
            document.querySelector("#wmpotify-tabs-container button[data-identifier='now-playing']")?.click();
        } else {
            document.querySelector("#wmpotify-tabs-container button[data-identifier='home']")?.click();
        }
    } else if (configWindow.style.display === 'block') {
        close();
        return;
    }
    configWindow.style.display = 'block';
    if (localStorage.wmpotifyTintColor) {
        const [hue, sat, tintPb] = localStorage.wmpotifyTintColor.split(',');
        elements.hue.value = parseInt(hue) + 180;
        elements.sat.value = parseInt(sat) * 121 / 100;
        if (tintPb) {
            elements.tintPb.checked = true;
        }
    }
}

function close() {
    configWindow.style.display = 'none';
}

function openTab(index) {
    if (!tabs) {
        return;
    }
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        tab.style.display = i === index ? 'block' : 'none';
    }
    currentTab = index;
    elements.title.textContent = tabs[index].dataset.tabTitle;
}

function prevTab() {
    openTab((currentTab - 1 + tabs.length) % tabs.length);
}

function nextTab() {
    openTab((currentTab + 1) % tabs.length);
}

function onColorChange() {
    const hue = elements.hue.value - 180;
    const sat = elements.sat.value * 100 / 121;
    setTintColor(hue, sat, elements.tintPb.checked);
    localStorage.wmpotifyTintColor = hue + ',' + sat + ',' + (elements.tintPb.checked ? '1' : '');
}

function resetColor() {
    elements.hue.value = 180;
    elements.sat.value = 121;
    setTintColor();
    delete localStorage.wmpotifyTintColor;
}

function onSpeedChange() {
    elements.speedValue.textContent = Number.isInteger(parseFloat(elements.speed.value)) ? elements.speed.value + '.0' : elements.speed.value;
    if (speedApplyTimer) {
        clearTimeout(speedApplyTimer);
    }
    speedApplyTimer = setTimeout(() => {
        setSpeed(elements.speed.value);
        speedApplyTimer = null;
    }, 500);
}

function setSpeed(speed) {
    if (Spicetify.Platform.ConnectAPI.state.connectionStatus === 'connected') {
        Spicetify.showNotification('Cannot change playback speed while playing from another device');
        return;
    }
    speed = parseFloat(speed);
    const prevSpeed = WindhawkComm.query().playbackSpeed || 1;
    if (speed === prevSpeed) {
        return;
    }
    elements.speed.value = speed;
    elements.speedValue.textContent = Number.isInteger(speed) ? speed + '.0' : speed;
    WindhawkComm.setPlaybackSpeed(speed);
}

function apply() {
    const style = configWindow.querySelector('#wmpotify-config-style').value;
    const titleStyle = configWindow.querySelector('#wmpotify-config-title-style').value;
    const showLibX = configWindow.querySelector('#wmpotify-config-show-libx').checked;
    if (style !== 'auto') {
        localStorage.wmpotifyStyle = style;
    } else {
        delete localStorage.wmpotifyStyle;
    }
    if (titleStyle !== 'auto') {
        localStorage.wmpotifyTitleStyle = titleStyle;
    } else {
        delete localStorage.wmpotifyTitleStyle;
    }
    if (showLibX) {
        localStorage.wmpotifyShowLibX = true;
    } else {
        delete localStorage.wmpotifyShowLibX;
    }
    location.reload();
}

const Config = {
    init,
    open,
    close,
    openTab,
    prevTab,
    nextTab,
    apply,
    isOpen: () => configWindow.style.display === 'block'
};

export default Config;