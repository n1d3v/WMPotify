import { setTintColor } from "./tinting";

const configWindow = document.createElement('div');
let tabs = null;
let currentTab = 0;

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
        <section class="wmpotify-config-tab-content" data-tab-title="About">
            <span style="color: lightgray;">WMPotify for Spicetify by Ingan121</span><br>
            <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
        </section>
    `;

    configWindow.querySelector('#wmpotify-config-close').addEventListener('click', close);
    configWindow.querySelector('#wmpotify-config-apply').addEventListener('click', apply);
    tabs = configWindow.querySelectorAll('.wmpotify-config-tab-content');
    elements.title = configWindow.querySelector('#wmpotify-config-title');
    elements.hue = configWindow.querySelector('#wmpotify-config-hue');
    elements.sat = configWindow.querySelector('#wmpotify-config-sat');
    elements.hue.addEventListener('input', onColorChange);
    elements.sat.addEventListener('input', onColorChange);
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
    if (configWindow.style.display === 'block') {
        close();
        return;
    }
    configWindow.style.display = 'block';
    if (localStorage.wmpotifyTintColor) {
        const [hue, sat] = localStorage.wmpotifyTintColor.split(',');
        elements.hue.value = parseInt(hue) + 180;
        elements.sat.value = parseInt(sat) * 121 / 100;
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
    setTintColor(hue, sat);
    localStorage.wmpotifyTintColor = hue + ',' + sat;
}

function resetColor() {
    elements.hue.value = 180;
    elements.sat.value = 121;
    setTintColor();
    delete localStorage.wmpotifyTintColor;
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

export default Config = {
    init,
    open,
    close,
    openTab,
    prevTab,
    nextTab,
    apply,
    isOpen: () => configWindow.style.display === 'block'
};