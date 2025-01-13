let windhawkModule = null;
let supportedCommands = [];
let lastDpi = 1;

export default WindhawkComm = {
    init() {
        return testWindhawk();
    },

    query() {
        if (windhawkModule) {
            const res = windhawkModule.query();
            if (res) {
                res.supportedCommands = supportedCommands;
                return res;
            }
        }
        return null;
    },

    extendFrame(left, top, right, bottom) {
        if (windhawkModule && supportedCommands.includes("ExtendFrame")) {
            [left, top, right, bottom] = [left, top, right, bottom].map(v => Math.round(v * window.devicePixelRatio));
            if (lastDpi > 1) { // Fix for Windows DPI scaling
                [left, top] = [left && left - 1, top && top - 1];
                [right, bottom] = [right && right - 1, bottom && bottom - 1];
            }
            windhawkModule.executeCommand(`/WH:ExtendFrame:${left}:${top}:${right}:${bottom}`);
        }
    },

    minimize() {
        if (windhawkModule && supportedCommands.includes("Minimize")) {
            windhawkModule.executeCommand("/WH:Minimize");
        }
    },

    maximizeRestore() {
        if (windhawkModule && supportedCommands.includes("MaximizeRestore")) {
            windhawkModule.executeCommand("/WH:MaximizeRestore");
        }
    },

    close() {
        if (windhawkModule && supportedCommands.includes("Close")) {
            windhawkModule.executeCommand("/WH:Close");
        }
    },

    setLayered(layered, alpha, color) {
        layered = layered ? 1 : 0;
        // color: RRGGBB hex
        if (windhawkModule) {
            const args = [layered];
            if (alpha) {
                args.push(alpha);
            }
            if (color) {
                args.push(color);
            }
            windhawkModule.executeCommand('/WH:SetLayered:' + args.join(':'));
        }
    },

    setBackdrop(backdropType) { // mica, acrylic, tabbed
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:SetBackdrop:${backdropType}`);
        }
    },

    resizeTo(width, height) { // Ignores min/max size
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:ResizeTo:${width}:${height}`);
        }
    },

    setMinSize(width, height) {
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:SetMinSize:${width}:${height}`);
        }
    },

    setTopMost(topMost) {
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:SetTopMost:${topMost ? 1 : 0}`);
        }
    },

    setTitle(title) {
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:SetTitle:${title}`);
        }
    },

    lockTitle(lock) {
        if (windhawkModule) {
            windhawkModule.executeCommand(`/WH:LockTitle:${lock ? 1 : 0}`);
        }
    },

    openSpotifyMenu() {
        if (windhawkModule) {
            windhawkModule.executeCommand("/WH:OpenSpotifyMenu");
        }
    },

    available() {
        return !!windhawkModule;
    },

    getSupportedCommands() {
        return supportedCommands;
    }
}

function testWindhawk() {
    if (!navigator.userAgent.includes("Windows")) {
        return;
    }
    try {
        windhawkModule = window._getSpotifyModule("ctewh");
        lastDpi = windhawkModule.query().dpi / 96;
        supportedCommands = windhawkModule.supportedCommands;
        const { version, initialOptions } = windhawkModule;
        console.log(`CEF/Spotify Tweaks Windhawk mod available, Version: ${version}`);
        window.addEventListener("resize", () => {
            lastDpi = windhawkModule.query().dpi / 96;
        });
        return { version, initialOptions, supportedCommands };
    } catch (e) {
        // query fails if the main browser process has unloaded the mod and thus closed the pipe
        // Sandboxed renderer processes won't respond to the Windhawk's uninit request so it'll keep loaded and will continue hooking _getSpotifyModule
        windhawkModule = null;
        console.log("Windhawk mod not available");
    }
}