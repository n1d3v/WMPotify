let windhawkModule = null;
let supportedCommands = [];

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

    available() {
        return windhawkModule;
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
        windhawkModule.query();
        supportedCommands = windhawkModule.supportedCommands;
        const { version, initialOptions } = windhawkModule;
        console.log(`CEF/Spotify Tweaks Windhawk mod available, Version: ${version}`);
        return { version, initialOptions, supportedCommands };
    } catch (e) {
        // query fails if the main browser process has unloaded the mod and thus closed the pipe
        // Sandboxed renderer processes won't respond to the Windhawk's uninit request so it'll keep loaded and will continue hooking _getSpotifyModule
        windhawkModule = null;
        console.log("Windhawk mod not available");
    }
}