let windhawkAvailable = false;
let supportedCommands = [];

export default WindhawkComm = {
    async init() {
        await testWindhawk();
    },

    async query() {
        if (windhawkAvailable) {
            await writeClipboard("/WH:Query");
            const clipboard = await readClipboard();
            try {
                return JSON.parse(clipboard);
            } catch (e) {
                // mod unloaded while running?
                windhawkAvailable = false;
                console.error(e);
            }
        }
        return null;
    },

    async extendFrame(left, top, right, bottom) {
        if (windhawkAvailable && supportedCommands.includes("ExtendFrame")) {
            await writeClipboard(`/WH:ExtendFrame:${left}:${top}:${right}:${bottom}`);
        }
    },

    async minimize() {
        if (windhawkAvailable && supportedCommands.includes("Minimize")) {
            await writeClipboard("/WH:Minimize");
        }
    },

    async maximizeRestore() {
        if (windhawkAvailable && supportedCommands.includes("MaximizeRestore")) {
            await writeClipboard("/WH:MaximizeRestore");
        }
    },

    async close() {
        if (windhawkAvailable && supportedCommands.includes("Close")) {
            await writeClipboard("/WH:Close");
        }
    },

    async setLayered(layered, alpha, color) {
        layered = layered ? 1 : 0;
        // color: RRGGBB hex
        if (windhawkAvailable) {
            const args = [layered];
            if (alpha) {
                args.push(alpha);
            }
            if (color) {
                args.push(color);
            }
            await writeClipboard('/WH:SetLayered:' + args.join(':'));
        }
    },

    async setBackdrop(backdropType) { // mica, acrylic, tabbed
        if (windhawkAvailable) {
            await writeClipboard(`/WH:SetBackdrop:${backdropType}`);
        }
    },

    async resizeTo(width, height) { // Ignores min/max size
        if (windhawkAvailable) {
            await writeClipboard(`/WH:ResizeTo:${width}:${height}`);
        }
    },

    async setMinSize(width, height) {
        if (windhawkAvailable) {
            await writeClipboard(`/WH:SetMinSize:${width}:${height}`);
        }
    },

    available() {
        return windhawkAvailable;
    },

    getSupportedCommands() {
        return supportedCommands;
    }
}

async function testWindhawk() {
    if (!navigator.userAgent.includes("Windows")) {
        return;
    }
    const origClipboardContent = await readClipboard();
    await writeClipboard("/WH:Query");
    try {
        const clipboardContent = await readClipboard();
        const parsed = JSON.parse(clipboardContent);
        if (parsed && parsed.type === "CTEWHQueryResponse") {
            windhawkAvailable = true;
            supportedCommands = parsed.supportedCommands;
            console.log("Windhawk available");
            return parsed;
        } else {
            await writeClipboard(origClipboardContent);
        }
    } catch (e) {
        await writeClipboard(origClipboardContent);
    }
    console.log("Windhawk not available");
}

async function writeClipboard(data) {
    return new Promise((resolve, reject) => {
        window.sendCosmosRequest({
            request: JSON.stringify({
                headers: {},
                body: data,
                method: "PUT",
                uri: "sp://desktop/v1/clipboard"
            }),
            persistent: false,
            onSuccess: () => {
                resolve();
            },
            onFailure: (error) => {
                reject(error);
            }
        });
    });
}

async function readClipboard() {
    return new Promise((resolve, reject) => {
        window.sendCosmosRequest({
            request: JSON.stringify({
                headers: {},
                body: "",
                method: "GET",
                uri: "sp://desktop/v1/clipboard"
            }),
            persistent: false,
            onSuccess: (value) => {
                try {
                    const val = JSON.parse(JSON.parse(value).body).data;
                    resolve(val);
                } catch (e) {
                    reject(e);
                }
            },
            onFailure: (error) => {
                reject(error);
            }
        });
    });
}