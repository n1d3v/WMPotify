const configWindow = document.createElement('div');

function init() {
    if (document.getElementById('wmpotify-config')) {
        return;
    }

    const mainView = document.querySelector('.Root__main-view');

    configWindow.id = 'wmpotify-config';
    configWindow.innerHTML = `
        <div id="wmpotify-config-topborder"></div>
        <p id="wmpotify-config-title">WMPotify Properties (WIP)</p>
        <button id="wmpotify-config-close"></button>
        <label for="wmpotify-config-style">Style</label>
        <select id="wmpotify-config-style">
            <option value="xp">XP</option>
            <option value="aero">Aero</option>
            <option value="basic">Basic</option>
        </select><br>
        <label for="wmpotify-config-title-style">Title style</label>
        <select id="wmpotify-config-title-style">
            <option value="auto">Auto</option>
            <option value="native">Native</option>
            <option value="custom">Custom</option>
            <option value="spotify">Spotify</option>
            <option value="keepmenu">Keep Menu</option>
        </select><br>
        <label for="wmpotify-config-show-libx">Show Your Library X on the left sidebar</label>
        <input type="checkbox" id="wmpotify-config-show-libx"><br>
        <button id="wmpotify-config-apply">Apply</button><br>
        <span style="color: lightgray;">WMPotify for Spicetify by Ingan121</span><br>
        <a href="https://github.com/Ingan121/WMPotify" target="_blank">GitHub</a>
    `;

    configWindow.querySelector('#wmpotify-config-close').addEventListener('click', close);
    configWindow.querySelector('#wmpotify-config-apply').addEventListener('click', apply);

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
    configWindow.style.display = 'block';
}

function close() {
    configWindow.style.display = 'none';
}

function apply() {
    const style = configWindow.querySelector('#wmpotify-config-style').value;
    const titleStyle = configWindow.querySelector('#wmpotify-config-title-style').value;
    const showLibX = configWindow.querySelector('#wmpotify-config-show-libx').checked;
    localStorage.wmpotifyStyle = style;
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
    apply,
};