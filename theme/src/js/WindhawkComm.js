let windhawkModule = null;
let lastDpi = 1;

export default WindhawkComm = {
    init() {
        return testWindhawk();
    },

    query() {
        if (windhawkModule) {
            return windhawkModule.query();
        }
        return null;
    },

    // (int, int, int, int)
    // To disable: (0, 0, 0, 0)
    // To extend to full window: (-1, -1, -1, -1)
    extendFrame(left, top, right, bottom) {
        if (windhawkModule?.extendFrame) {
            [left, top, right, bottom] = [left, top, right, bottom].map(v => Math.round(v * window.devicePixelRatio));
            if (lastDpi > 1) { // Fix for Windows DPI scaling
                [left, top] = [left && left - 1, top && top - 1];
                [right, bottom] = [right && right - 1, bottom && bottom - 1];
            }
            windhawkModule.extendFrame(left, top, right, bottom);
        }
    },

    minimize() {
        if (windhawkModule?.minimize) {
            windhawkModule.minimize();
        }
    },

    maximizeRestore() {
        if (windhawkModule?.maximizeRestore) {
            windhawkModule.maximizeRestore();
        }
    },

    close() {
        if (windhawkModule?.close) {
            windhawkModule.close();
        }
    },

    // (bool, optional int 0-255, optional string)
    // color: RRGGBB hex
    setLayered(layered, alpha, color) {
        if (windhawkModule?.setLayered) {
            windhawkModule.setLayered(layered, alpha, color);
        }
    },

    // (string - mica, acrylic, tabbed)
    setBackdrop(backdropType) {
        if (windhawkModule?.setBackdrop) {
            windhawkModule.setBackdrop(backdropType);
        }
    },

    // (int, int)
    // Ignores min/max size
    resizeTo(width, height) {
        if (windhawkModule?.resizeTo) {
            windhawkModule.resizeTo(width, height);
        }
    },

    // (int, int)
    setMinSize(width, height) {
        if (windhawkModule?.setMinSize) {
            windhawkModule.setMinSize(width, height);
        }
    },

    // (bool)
    setTopMost(topMost) {
        if (windhawkModule?.setTopMost) {
            windhawkModule.setTopMost(topMost);
        }
    },

    // (string - max 255 characters)
    setTitle(title) {
        if (windhawkModule?.setTitle) {
            windhawkModule.setTitle(title);
        }
    },

    // (bool)
    lockTitle(lock) {
        if (windhawkModule?.lockTitle) {
            windhawkModule.lockTitle(lock);
        }
    },

    openSpotifyMenu() {
        if (windhawkModule?.openSpotifyMenu) {
            windhawkModule.openSpotifyMenu();
        }
    },

    // (double - 1.0 is normal speed, must be between 0.5 and 5.0)
    // Win64 only
    setPlaybackSpeed(speed) {
        if (windhawkModule?.setPlaybackSpeed) {
            windhawkModule.setPlaybackSpeed(parseFloat(speed));
        }
    },

    available() {
        return !!windhawkModule;
    },

    getModule() {
        return windhawkModule;
    }
}

function testWindhawk() {
    if (!navigator.userAgent.includes("Windows")) {
        return;
    }
    try {
        windhawkModule = window._getSpotifyModule("ctewh");
        lastDpi = windhawkModule.query().dpi / 96;
        const { version, initialOptions } = windhawkModule;
        console.log(`CEF/Spotify Tweaks Windhawk mod available, Version: ${version}`);
        window.addEventListener("resize", () => {
            lastDpi = windhawkModule.query().dpi / 96;
        });
        return { version, initialOptions };
    } catch (e) {
        // query fails if the main browser process has unloaded the mod and thus closed the pipe
        // Sandboxed renderer processes won't respond to the Windhawk's uninit request so it'll keep loaded and will continue hooking _getSpotifyModule
        windhawkModule = null;
        console.log("Windhawk mod not available");
    }
}