// spotify.js for ModernActiveDesktop Visualizer Lyrics
// Made by Ingan121
// Licensed under the MIT License
// SPDX-License-Identifier: MIT

'use strict';

export async function getSpotifyNowPlaying(lang) {
    try {
        if (!lang && Spicetify.Player.data) {
            return Spicetify.Player.data;
        }
        const headers = {
            'Authorization': 'Bearer ' + Spicetify.Platform.AuthorizationAPI.getState().token.accessToken
        }
        if (lang) {
            headers['Accept-Language'] = lang;
        }
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            method: 'GET',
            headers: headers
        });
        if (response.status === 200) {
            const json = await response.json();
            return json;
        } else {
            return {
                item: null,
                errorCode: response.status
            };
        }
    } catch (error) {
        console.error(error);
        return {
            item: null,
            errorCode: -1
        }
    }
}
