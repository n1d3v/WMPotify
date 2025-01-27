export function formatTime(milliseconds, padFirst) {
    if (!milliseconds || isNaN(milliseconds)) {
        return '00:00';
    }
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = String(seconds % 60).padStart(2, '0');
    if (minutes < 60) {
        if (padFirst) {
            minutes = String(minutes).padStart(2, '0');
        }
        return `${minutes}:${seconds}`;
    }
    let hours = Math.floor(minutes / 60);
    minutes = String(minutes % 60).padStart(2, '0');
    if (padFirst) {
        hours = String(hours).padStart(2, '0');
    }
    return `${hours}:${minutes}:${seconds}`;
}

export function promptModal(title, message, text, hint) {
    return new Promise((resolve, reject) => {
        const modalContent = document.createElement('div');
        modalContent.id = 'wmpotify-prompt-modal';
        const msgElem = document.createElement('p');
        msgElem.textContent = message;
        modalContent.appendChild(msgElem);
        const input = document.createElement('input');
        input.classList.add('wmpotify-aero');
        input.type = 'text';
        input.value = text;
        input.placeholder = hint;
        input.style.width = '100%';
        modalContent.appendChild(input);
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('wmpotify-modal-bottom-buttons');
        const okButton = document.createElement('button');
        okButton.classList.add('wmpotify-aero');
        okButton.textContent = 'OK';
        okButton.addEventListener('click', () => {
            resolve(input.value);
            Spicetify.PopupModal.hide();
        });
        buttonContainer.appendChild(okButton);
        const cancelButton = document.createElement('button');
        cancelButton.classList.add('wmpotify-aero');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            resolve(null);
            Spicetify.PopupModal.hide();
        });
        buttonContainer.appendChild(cancelButton);
        modalContent.appendChild(buttonContainer);
        Spicetify.PopupModal.display({ title: title, content: modalContent });
        const observer = new MutationObserver(() => {
            if (!document.contains(modalContent)) {
                observer.disconnect();
                resolve(null);
            }
        });
        observer.observe(document.body, { childList: true });
    });
}
