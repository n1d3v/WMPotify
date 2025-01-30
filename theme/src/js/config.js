'use strict';

import Strings from "./strings";
import { promptModal } from "./functions";
import FontDetective from "./FontDetective";
import { setTintColor } from "./tinting";
import WindhawkComm from "./WindhawkComm";
import WindowManager from "./WindowManager";

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

    const whStatus = WindhawkComm.query();
    const mainView = document.querySelector('.Root__main-view');

    configWindow.id = 'wmpotify-config';
    configWindow.innerHTML = `
        <div id="wmpotify-config-topborder" class="wmpotify-tintable"></div>
        <button id="wmpotify-config-prev"></button>
        <button id="wmpotify-config-next"></button>
        <p id="wmpotify-config-title">${Strings['CONF_COLOR_TITLE']}</p>
        <button id="wmpotify-config-close"></button>
        <section class="wmpotify-config-tab-content" data-tab-title="${Strings['CONF_COLOR_TITLE']}" style="display: block;">
            <section class="field-row">
                <a href="#" id="wmpotify-config-color-reset">${Strings['UI_RESET']}</a>
                <input type="checkbox" id="wmpotify-config-tint-playerbar" class="wmpotify-aero">
                <label for="wmpotify-config-tint-playerbar">${Strings['CONF_COLOR_TINTPB']}</label>
            </section>
            <label>${Strings['CONF_COLOR_HUE']}</label><br>
            <input type="range" id="wmpotify-config-hue" class="wmpotify-aero no-track" min="0" max="360" step="1" value="180"><br>
            <label>${Strings['CONF_COLOR_SAT']}</label><br>
            <input type="range" id="wmpotify-config-sat" class="wmpotify-aero no-track" min="0" max="354" step="1" value="121"><br>
        </section>
        <section class="wmpotify-config-tab-content" data-tab-title="${Strings['CONF_GENERAL_TITLE']}">
            <label for="wmpotify-config-style">${Strings['CONF_GENERAL_STYLE']}</label>
            <select id="wmpotify-config-style" class="wmpotify-aero">
                <option value="auto">${Strings['UI_AUTO']}</option>
                <option value="xp">XP</option>
                <option value="aero">Aero</option>
                <option value="basic">Basic</option>
            </select>
            <label for="wmpotify-config-title-style">${Strings['CONF_GENERAL_TITLE_STYLE']}</label>
            <select id="wmpotify-config-title-style" class="wmpotify-aero">
                <option value="auto">${Strings['UI_AUTO']}</option>
                <option value="native">${Strings['CONF_GENERAL_TITLE_STYLE_NATIVE']}</option>
                <option value="custom">${Strings['CONF_GENERAL_TITLE_STYLE_CUSTOM']}</option>
                <option value="spotify">Spotify</option>
                <option value="keepmenu">${Strings['CONF_GENERAL_TITLE_STYLE_KEEPMENU']}</option>
            </select>
            <button id="wmpotify-config-apply" class="wmpotify-aero">${Strings['CONF_GENERAL_APPLY']}</button><br>
            <label for="wmpotify-config-font">${Strings['CONF_GENERAL_FONT']}</label>
            <select id="wmpotify-config-font" class="wmpotify-aero">
                <option value="custom">${Strings['UI_CUSTOM']}</option>
            </select><br>
            <label for="wmpotify-config-topmost">${Strings['CONF_GENERAL_TOPMOST']}</label>
            <select id="wmpotify-config-topmost" class="wmpotify-aero" disabled>
                <option value="always">${Strings['CONF_GENERAL_TOPMOST_ALWAYS']}</option>
                <option value="minimode">${Strings['CONF_GENERAL_TOPMOST_MINIMODE']}</option>
                <option value="never" selected>${Strings['CONF_GENERAL_TOPMOST_NEVER']}</option>
            </select>
            <label for="wmpotify-config-backdrop">${Strings['CONF_GENERAL_BACKDROP']}</label>
            <select id="wmpotify-config-backdrop" class="wmpotify-aero" disabled>
                <option value="none" selected>${Strings['CONF_GENERAL_BACKDROP_NONE']}</option>
                <option value="mica">Mica</option>
                <option value="acrylic">${Strings['CONF_GENERAL_BACKDROP_ACRYLIC']}</option>
                <option value="tabbed">${Strings['CONF_GENERAL_BACKDROP_TABBED']}</option>
            </select><br>
            <input type="checkbox" id="wmpotify-config-show-libx" class="wmpotify-aero">
            <label for="wmpotify-config-show-libx">${Strings['CONF_GENERAL_SHOW_LIBX']}</label><br>
            <span id="wmpotify-config-wh-message">${Strings['CONF_GENERAL_WH_MESSAGE']}</span>
        </section>
        ${whStatus?.speedModSupported ? `
        <section class="wmpotify-config-tab-content" data-tab-title="${Strings['CONF_SPEED_TITLE']}" data-wh-speedmod-required="true">
            <a href="#" id="wmpotify-config-speed-slow">${Strings['CONF_SPEED_SLOW']}</a>
            <a href="#" id="wmpotify-config-speed-normal">${Strings['CONF_SPEED_NORMAL']}</a>
            <a href="#" id="wmpotify-config-speed-fast">${Strings['CONF_SPEED_FAST']}</a><br>
            <input type="range" id="wmpotify-config-speed" class="wmpotify-aero" min="0.5" max="2.0" step="0.1" value="1"><br>
            ${Strings['CONF_SPEED_CURRENT_LABEL']}: <span id="wmpotify-config-speed-value">1.0</span>
        </section>
        ` : ''}
        <section class="wmpotify-config-tab-content" data-tab-title="${Strings['CONF_ABOUT_TITLE']}">
            <div id="wmpotify-about-logo"></div>
            <p id="wmpotify-about-title">WMPotify</p><br>
            <p>${Strings['CONF_ABOUT_DESC']}</p>
            <p>${Strings['CONF_ABOUT_VERSION']}: 1.0 Beta 1<span id="wmpotify-about-ctewh-ver"></span></p>
            <p>${Strings['CONF_ABOUT_AUTHOR']} - <a href="https://www.ingan121.com/" target="_blank">www.ingan121.com</a></p>
            <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
        </section>
    `;

    tabs = configWindow.querySelectorAll('.wmpotify-config-tab-content');
    elements.topborder = configWindow.querySelector('#wmpotify-config-topborder');
    elements.title = configWindow.querySelector('#wmpotify-config-title');
    elements.hue = configWindow.querySelector('#wmpotify-config-hue');
    elements.sat = configWindow.querySelector('#wmpotify-config-sat');
    elements.tintPb = configWindow.querySelector('#wmpotify-config-tint-playerbar');
    elements.fontSelector = configWindow.querySelector('#wmpotify-config-font');
    elements.fontCustom = configWindow.querySelector('#wmpotify-config-font option');
    elements.topmost = configWindow.querySelector('#wmpotify-config-topmost');
    elements.backdrop = configWindow.querySelector('#wmpotify-config-backdrop');
    elements.showLibX = configWindow.querySelector('#wmpotify-config-show-libx');
    elements.whMessage = configWindow.querySelector('#wmpotify-config-wh-message');
    elements.whVer = configWindow.querySelector('#wmpotify-about-ctewh-ver');

    configWindow.style.height = localStorage.wmpotifyConfigHeight || '';

    elements.fontSelector.addEventListener('change', async () => {
        if (elements.fontSelector.value === 'custom') {
            const fontName = await promptModal(Strings['CONF_GENERAL_CUSTOM_FONT_DLG_TITLE'], Strings['CONF_GENERAL_CUSTOM_FONT_MSG'], '', localStorage.wmpotifyFont || 'Segoe UI');
            if (!fontName) {
                elements.fontSelector.value = localStorage.wmpotifyFont || 'Segoe UI';
                return;
            }
            elements.fontCustom.textContent = fontName;
            localStorage.wmpotifyFont = fontName;
        } else {
            elements.fontCustom.textContent = Strings['UI_CUSTOM'];
            localStorage.wmpotifyFont = elements.fontSelector.value;
        }
        document.documentElement.style.setProperty('--ui-font', localStorage.wmpotifyFont);
    });
    elements.showLibX.addEventListener('change', () => {
        if (elements.showLibX.checked) {
            localStorage.wmpotifyShowLibX = true;
            delete document.body.dataset.hideLibx;
        } else {
            delete localStorage.wmpotifyShowLibX;
            document.body.dataset.hideLibx = true;
            Spicetify.Platform.LocalStorageAPI.setItem("ylx-sidebar-state", 1);
        }
    });
    configWindow.querySelector('#wmpotify-config-close').addEventListener('click', close);
    configWindow.querySelector('#wmpotify-config-apply').addEventListener('click', apply);
    const isWin11 = Spicetify.Platform.PlatformData.os_version.split('.')[2] >= 22000;
    if (whStatus) {
        elements.topmost.disabled = false;
        elements.topmost.value = localStorage.wmpotifyTopMost || 'never';
        elements.topmost.addEventListener('change', () => {
            localStorage.wmpotifyTopMost = elements.topmost.value;
            if (elements.topmost.value === 'always' || 
                (elements.topmost.value === 'minimode' && WindowManager.isMiniMode())) {
                WindhawkComm.setTopMost(true);
            } else {
                WindhawkComm.setTopMost(false);
            }
        });

        if (isWin11) {
            elements.backdrop.disabled = false;
            elements.backdrop.value = localStorage.wmpotifyBackdrop || 'mica';
            elements.backdrop.addEventListener('change', () => {
                localStorage.wmpotifyBackdrop = elements.backdrop.value;
                WindhawkComm.setBackdrop(elements.backdrop.value);
            });
        }

        elements.whMessage.style.display = 'none';
        elements.whVer.textContent = ', ' + Strings.getString('CONF_ABOUT_CTEWH_VERSION', WindhawkComm.getModule().version);

        if (whStatus.speedModSupported) {
            elements.speed = configWindow.querySelector('#wmpotify-config-speed');
            elements.speedValue = configWindow.querySelector('#wmpotify-config-speed-value');
            elements.speed.addEventListener('pointerup', onSpeedChange);
            configWindow.querySelector('#wmpotify-config-speed-slow').addEventListener('click', setSpeed.bind(null, 0.5));
            configWindow.querySelector('#wmpotify-config-speed-normal').addEventListener('click', setSpeed.bind(null, 1));
            configWindow.querySelector('#wmpotify-config-speed-fast').addEventListener('click', setSpeed.bind(null, 1.4));
            const playbackSpeed = whStatus.playbackSpeed || 1;
            elements.speedValue.textContent = Number.isInteger(playbackSpeed) ? playbackSpeed + '.0' : playbackSpeed;
            elements.speedValue.addEventListener('click', async () => {
                const speed = await promptModal(Strings['CONF_SPEED_CUSTOM_DLG_TITLE'], Strings['CONF_SPEED_CUSTOM_MSG'], playbackSpeed.toString(), '1.0');
                if (speed) {
                    setSpeed(speed);
                }
            });
        }
    }
    if (!isWin11) {
        elements.backdrop.style.display = 'none';
        elements.backdrop.previousElementSibling.style.display = 'none';
    }
    if (!navigator.userAgent.includes('Windows')) {
        elements.topmost.style.display = 'none';
        elements.topmost.previousElementSibling.style.display = 'none';
        elements.whMessage.style.display = 'none';
    }
    elements.hue.addEventListener('input', onColorChange);
    elements.sat.addEventListener('input', onColorChange);
    elements.tintPb.addEventListener('change', onColorChange);
    configWindow.querySelector('#wmpotify-config-color-reset').addEventListener('click', resetColor);
    configWindow.querySelector('#wmpotify-config-prev').addEventListener('click', prevTab);
    configWindow.querySelector('#wmpotify-config-next').addEventListener('click', nextTab);

    FontDetective.each(font => {
        const option = document.createElement("option");
        option.textContent = font.name;
        option.value = font.name;
        if (font.name === (localStorage.wmpotifyFont || 'Segoe UI')) {
            option.selected = true;
        }
        if (font.name === 'Segoe UI') {
            elements.fontSelector.insertBefore(option, elements.fontSelector.firstChild);
        } else {
            elements.fontSelector.insertBefore(option, elements.fontCustom);
        }
    });

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

    let offset = 0, isDown = false;

    elements.topborder.addEventListener('pointerdown', function () {
        isDown = true;
        offset = configWindow.getBoundingClientRect().bottom;
        document.body.style.cursor = 'ns-resize';
    }, true);

    document.addEventListener('pointerup', function () {
        isDown = false;
        document.body.style.cursor = '';
        localStorage.wmpotifyConfigHeight = configWindow.style.height;
    }, true);

    document.addEventListener('pointermove', function (event) {
        if (isDown) {
            configWindow.style.height = offset - event.clientY + 'px';
        }
    }, true);

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
            Spicetify.Platform.History.push({ pathname: '/wmpvis' });
        } else {
            Spicetify.Platform.History.push({ pathname: '/' });
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
        Spicetify.showNotification(Strings['CONF_SPEED_NO_CONNECT_MSG']);
        return;
    }
    speed = parseFloat(speed);
    const prevSpeed = WindhawkComm.query().playbackSpeed || 1;
    if (speed === prevSpeed) {
        return;
    }
    elements.speed.value = speed;
    elements.speedValue.textContent = Number.isInteger(speed) ? speed + '.0' : speed;
    try {
        WindhawkComm.setPlaybackSpeed(speed);
    } catch (e) {
        Spicetify.showNotification(e.message);
    }
}

function apply() {
    const style = configWindow.querySelector('#wmpotify-config-style').value;
    const titleStyle = configWindow.querySelector('#wmpotify-config-title-style').value;
    const showLibX = elements.showLibX.checked;
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