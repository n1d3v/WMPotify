'use strict';

const SidebarManager = {
    widthManager: new MutationObserver(() => {
        if (Spicetify.Platform.History.location.pathname !== '/wmpotify-standalone-libx') {
            // 1.2.53 changed --panel-width to --right-sidebar-width
            const rightSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--right-sidebar-width");
            if (rightSidebarWidth) {
                SidebarManager.widthManager.disconnect();
                document.documentElement.style.setProperty("--panel-width", rightSidebarWidth);
                SidebarManager.widthManager.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
            }
            return;
        }
        // Prevent Spotify from wrongly setting the panel width CSS variable
        // Spotify thinks full LibX is open as a left sidebar and there's not much space left
        // Thus reducing the right sidebar width
        // So just get the real width and set it back
        SidebarManager.widthManager.disconnect();
        const rightSidebar = document.querySelector('.Root__right-sidebar aside');
        document.documentElement.style.setProperty("--panel-width", rightSidebar ? rightSidebar.offsetWidth : 8);
        const rightSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue("--right-sidebar-width");
        if (rightSidebarWidth) {
            document.documentElement.style.setProperty("--right-sidebar-width", rightSidebar ? rightSidebar.offsetWidth : 8);
        }
        SidebarManager.widthManager.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }),

    init() {
        SidebarManager.widthManager.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }
};

export default SidebarManager;