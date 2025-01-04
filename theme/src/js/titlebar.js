import ControlManager from "./ControlManager";
import WindhawkComm from "./WindhawkComm";

export async function createTitlebar(mode) {
    const whStatus = await WindhawkComm.query();

    switch (mode) {
        case 'native':
            ControlManager.setControlHeight(0);
            break;
        case 'custom':
            ControlManager.setControlHeight(0);
        case 'keepmenu':
            const titleButtons = document.createElement('div');
            titleButtons.id = 'wmpotify-title-buttons';
            if (window.SpotEx && whStatus && whStatus.supportedCommands.includes('Minimize')) {
                const minimizeButton = document.createElement('button');
                minimizeButton.id = 'wmpotify-minimize-button';
                minimizeButton.addEventListener('click', () => {
                    if (window.SpotEx) {
                        SpotEx.updateWindow({ state: 'minimized' });
                    } else {
                        WindhawkComm.minimize();
                    }
                });
                titleButtons.appendChild(minimizeButton);
                const maximizeButton = document.createElement('button');
                maximizeButton.id = 'wmpotify-maximize-button';
                maximizeButton.addEventListener('click', async () => {
                    if (window.SpotEx) {
                        if ((await SpotEx.getWindow()).state === 'maximized') {
                            SpotEx.updateWindow({ state: 'normal' });
                        } else {
                            SpotEx.updateWindow({ state: 'maximized' });
                        }
                    } else {
                        WindhawkComm.maximizeRestore();
                    }
                });
                titleButtons.appendChild(maximizeButton);
                window.addEventListener('resize', async () => {
                    if (window.SpotEx) {
                        if ((await SpotEx.getWindow()).state === 'maximized') {
                            maximizeButton.dataset.maximized = true;
                        } else {
                            delete maximizeButton.dataset.maximized;
                        }
                    } else {
                        if (await WindhawkComm.query()?.isMaximized) {
                            maximizeButton.dataset.maximized = true;
                        } else {
                            delete maximizeButton.dataset.maximized;
                        }
                    }
                });
            }
            const closeButton = document.createElement('button');
            closeButton.id = 'wmpotify-close-button';
            closeButton.addEventListener('click', () => {
                if (whStatus && whStatus.supportedCommands.includes('Close')) {
                    WindhawkComm.close();
                } else {
                    window.close();
                }
            });
            titleButtons.appendChild(closeButton);
        case 'spotify':
            const titleBar = document.createElement('div');
            titleBar.id = 'wmpotify-title-bar';
            const titleIcon = document.createElement('div');
            titleIcon.id = 'wmpotify-title-icon';
            titleIcon.addEventListener('dblclick', () => {
                window.close();
            });
            titleBar.appendChild(titleIcon);
            const titleText = document.createElement('span');
            titleText.id = 'wmpotify-title-text';
            titleText.textContent = await Spicetify.AppTitle.get();
            titleBar.appendChild(titleText);
            if (mode === 'custom' || mode === 'keepmenu') {
                titleBar.appendChild(titleButtons);
            }
            if (mode === 'keepmenu' || mode === 'spotify') {
                ControlManager.setControlHeight(25);
            }
            document.body.appendChild(titleBar);
            Spicetify.AppTitle.sub((title) => {
                titleText.textContent = title;
            });
            break;
    }
}