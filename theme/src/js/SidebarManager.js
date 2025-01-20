'use strict';

const widthObserver = new MutationObserver(updateSidebarWidth);

const SidebarManager = {
    init() {
        widthObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    },
    updateSidebarWidth,
};

function updateSidebarWidth() {
    if (Spicetify.Platform.History.location.pathname !== '/wmpotify-standalone-libx') {
        return;
    }
    // Prevent Spotify from wrongly setting the panel width CSS variable
    // Spotify thinks full LibX is open as a left sidebar and there's not much space left
    // Thus reducing the right sidebar width
    // So just get the real width and set it back
    widthObserver.disconnect();
    const rightSidebar = document.querySelector('.Root__right-sidebar aside');
    document.documentElement.style.setProperty("--right-sidebar-width", rightSidebar ? rightSidebar.offsetWidth : 8);
    widthObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
}

export default SidebarManager;