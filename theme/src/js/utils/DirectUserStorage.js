'use strict';

// Spicetify LocalStorageAPI but without immediate effect

const DirectUserStorage = {
    getItem(key) {
        const username = Spicetify._platform?.initialUser?.username;
        const res = localStorage.getItem(username + ":" + key);
        if (isNaN(res)) {
            return res;
        } else {
            return parseFloat(res);
        }
    },
    setItem(key, value) {
        const username = Spicetify._platform?.initialUser?.username;
        localStorage.setItem(username + ":" + key, value);
    },
    removeItem(key) {
        const username = Spicetify._platform?.initialUser?.username;
        localStorage.removeItem(username + ":" + key);
    }
}

export default DirectUserStorage;