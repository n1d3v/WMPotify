const body = `
<div id="topbar">
    <div id="topbar-right">
        <button id="lyrics-button" class="topbar-button"></button>
        <button id="return-button" class="topbar-button"></button>
        <button id="close-button" class="topbar-button"></button>
    </div>
</div>
<div id="main">
    <div id="visualizer"></div>
    <div id="album-art"></div>
    <div id="lyrics"></div>
</div>
<div id="playerbar">
    <div id="info">
        <div id="status-icon"></div>
        <div id="info-text">
    </div>
    <div id="controls">
        <input id="seek-bar" type="range" min="0" max="100" value="0" step="1">
        <button id="playpause-button"></button>
        <button id="stop-button"></button>
        <button id="previous-button"></button>
        <button id="next-button"></button>
        <button id="mute-button"></button>
        <input id="volume-bar" type="range" min="0" max="100" value="100" step="1">
    </div>
</div>
`;

export function initCorporateSkin(dpipWin) {
    dpipWin.document.title = "Spotify";
    dpipWin.document.body.innerHTML = body;

    const favicon = dpipWin.document.createElement("link");
    favicon.rel = "icon";
    favicon.href = getComputedStyle(document.documentElement).getPropertyValue('--logo-16').slice(5, -2);
    dpipWin.document.head.appendChild(favicon);

    const style = document.querySelector('link.userCSS[href*="user.css"]');
    if (style) {
        dpipWin.document.head.appendChild(style.cloneNode());
    }
}