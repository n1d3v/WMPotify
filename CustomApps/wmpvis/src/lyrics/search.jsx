// search.js for ModernActiveDesktop Visualizer Lyrics
// Made by Ingan121
// Licensed under the MIT License
// SPDX-License-Identifier: MIT

'use strict';

import React from "react";
import MadVisLyrics, { headers } from "./main";

const SearchDialog = React.memo(({ artist, title, albumTitle }) => {
    return <>
        <style>
            {`
            .main-trackCreditsModal-container {
                min-width: 520px;
            }

            .main-trackCreditsModal-mainSection {
                overflow: hidden;
            }

            .field-row {
                display: flex;
                align-items: center;
            }

            [class^="field-row"] + [class^="field-row"] {
                margin-top: var(--grouped-element-spacing);
            }

            .field-row > * + * {
                margin-left: var(--grouped-element-spacing);
            }

            .wmpvis-lyrics-row {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-bottom: 5px;
            }

            .wmpvis-lyrics-row label {
                flex: 0 0 auto;
                margin-right: 10px;
            }

            .wmpvis-lyrics-row input {
                flex: 1;
            }

            .wmpvis-lyrics-row button {
                flex: 0 0 auto;
            }

            .wmpvis-lyrics-advancedSearch {
                display: none;
            }

            .wmpvis-lyrics-searchBar {
                flex-grow: 1;
                color: black;
            }

            #wmpvis-lyrics-searchBtnAdvanced {
                margin-left: 6px;
            }

            #wmpvis-lyrics-searchResults {
                width: 100%;
                margin: 5px 0;
            }

            label[for="wmpvis-lyrics-addOverrideChkBox"] {
                margin-bottom: 4px;
            }

            #wmpvis-lyrics-addOverrideChkBox:disabled + label + br + mad-string {
                color: var(--button-shadow);
                text-shadow: 1px 1px 0 var(--button-hilight);
            }

            .wmpvis-lyrics-bottomButtons {
                margin-top: 8px;
                justify-content: flex-end;
            }

            button.wmpotify-aero {
                color: black;
                min-height: 23px;
                min-width: 75px;
                padding: 0 12px;
                text-align: center;
            }
            `}
        </style>
        <div style={{ fontSize: '11px' }}>
            <section class="field-row wmpvis-lyrics-normalSearch">
                <label for="wmpvis-lyrics-searchBar">Search lyrics:</label>
                <input id="wmpvis-lyrics-searchBar" type="text" class="wmpvis-lyrics-searchBar wmpotify-aero" defaultValue={(artist + ' ' + title + ' ' + albumTitle).trim()} />
                <button id="wmpvis-lyrics-searchBtn" class="wmpotify-aero" accesskey="s"><u>S</u>earch</button>
            </section>
            <section class="wmpvis-lyrics-row wmpvis-lyrics-advancedSearch">
                <label for="wmpvis-lyrics-artistBar">Artist:</label>
                <input id="wmpvis-lyrics-artistBar" type="text" class="wmpvis-lyrics-searchBar wmpotify-aero" defaultValue={artist} />
                <button id="wmpvis-lyrics-searchBtnAdvanced" class="wmpotify-aero" accesskey="s"><u>S</u>earch</button>
            </section>
            <section class="wmpvis-lyrics-row wmpvis-lyrics-advancedSearch">
                <label for="wmpvis-lyrics-titleBar">Title:</label>
                <input id="wmpvis-lyrics-titleBar" type="text" class="wmpvis-lyrics-searchBar wmpotify-aero" defaultValue={title} />
            </section>
            <section class="wmpvis-lyrics-row wmpvis-lyrics-advancedSearch">
                <label for="wmpvis-lyrics-albumBar">Album:</label>
                <input id="wmpvis-lyrics-albumBar" type="text" class="wmpvis-lyrics-searchBar wmpotify-aero" defaultValue={albumTitle} />
            </section>
            <select id="wmpvis-lyrics-searchResults" class="wmpotify-aero" disabled></select>
            <input id="wmpvis-lyrics-addOverrideChkBox" type="checkbox" name="addOverride" class="wmpotify-aero" />
            <label for="wmpvis-lyrics-addOverrideChkBox">Always use this lyrics for this song</label><br />
            Click Lyrics -&gt; Load Lyrics to remove the override.<br />
            <section class="wmpvis-lyrics-bottomButtons field-row">
                <button id="wmpvis-lyrics-okBtn" class="wmpotify-aero">OK</button>
                <button id="wmpvis-lyrics-cancelBtn" class="wmpotify-aero">Cancel</button>
                <button id="wmpvis-lyrics-applyBtn" class="wmpotify-aero"><u>A</u>pply</button>
                <button id="wmpvis-lyrics-advancedBtn" class="wmpotify-aero">A<u>d</u>vanced &gt;&gt;</button>
            </section>
        </div>
    </>
});

export function openSearchDialog(artist, title, albumTitle, currentId) {
    Spicetify.PopupModal.display({
        title: 'Search Lyrics',
        content: <SearchDialog artist={artist} title={title} albumTitle={albumTitle} currentId={currentId} />,
    })

    init(currentId);
}

async function init(currentId) {
    const normalSearchSection = document.querySelector('.wmpvis-lyrics-normalSearch');
    const advancedSections = document.querySelectorAll('.wmpvis-lyrics-advancedSearch');
    const advancedSearchLabels = document.querySelectorAll('.wmpvis-lyrics-advancedSearch label');

    const artistBar = document.getElementById('wmpvis-lyrics-artistBar');
    const titleBar = document.getElementById('wmpvis-lyrics-titleBar');
    const albumBar = document.getElementById('wmpvis-lyrics-albumBar');
    const searchBar = document.getElementById('wmpvis-lyrics-searchBar');
    const searchBtn = document.getElementById('wmpvis-lyrics-searchBtn');
    const searchBtnAdvanced = document.getElementById('wmpvis-lyrics-searchBtnAdvanced');
    const searchResults = document.getElementById('wmpvis-lyrics-searchResults');
    const addOverrideChkBox = document.getElementById('wmpvis-lyrics-addOverrideChkBox');

    const okBtn = document.getElementById('wmpvis-lyrics-okBtn');
    const cancelBtn = document.getElementById('wmpvis-lyrics-cancelBtn');
    const applyBtn = document.getElementById('wmpvis-lyrics-applyBtn');
    const advancedBtn = document.getElementById('wmpvis-lyrics-advancedBtn');

    let advancedMode = false;

    searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            search();
        }
    });
    [artistBar, titleBar, albumBar].forEach((input) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                advancedSearch();
            }
        });
    });

    searchBtn.addEventListener('click', search);
    searchBtnAdvanced.addEventListener('click', advancedSearch);

    advancedBtn.addEventListener('click', () => {
        advancedMode = !advancedMode;
        advancedBtn.innerHTML = advancedMode ? 'Advanced <<' : 'Advanced >>';
        if (advancedMode) {
            normalSearchSection.style.display = 'none';
            for (const section of advancedSections) {
                section.style.display = 'flex';
            }
            calcLabelWidth();
        } else {
            normalSearchSection.style.display = 'flex';
            for (const section of advancedSections) {
                section.style.display = 'none';
            }
        }
    });

    if (searchBar.value) {
        search();
    } else {
        // No music loaded
        addOverrideChkBox.disabled = true;
        searchResults.innerHTML = '<option value="">Enter the artist and title of the song you want to search for.</option>';
    }

    async function search() {
        searchResults.disabled = true;
        searchResults.innerHTML = '<option value="">Searching...</option>';

        const response = await fetch(`https://lrclib.net/api/search?q=${searchBar.value}`, {
            method: 'GET',
            headers: headers
        });
        const result = await response.json();

        processResults(result);
    }

    async function advancedSearch() {
        searchResults.disabled = true;
        searchResults.innerHTML = '<option value="">Searching...</option>';

        const response = await fetch(`https://lrclib.net/api/search?artist_name=${artistBar.value}&track_name=${titleBar.value}&album_name=${albumBar.value}`, {
            method: 'GET',
            headers: headers
        });
        const result = await response.json();

        processResults(result);
    }

    function processResults(result) {
        if (result.length === 0) {
            searchResults.innerHTML = '<option value="">No lyrics found.</option>';
            searchResults.disabled = true;
            return;
        }

        searchResults.disabled = false;
        searchResults.innerText = '';
        let currentIdFound = false;
        for (const item of result) {
            if (!item.syncedLyrics && !item.plainLyrics) {
                continue;
            }
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.artistName + ' - ' + item.trackName + ' (' + item.albumName + ')';
            if (localStorage.madesktopDebugMode) {
                option.textContent = '[' + item.id + '] ' + option.textContent;
            }
            searchResults.appendChild(option);
            if (currentId === item.id) {
                searchResults.value = item.id.toString();
                currentIdFound = true;
            }
        }
        if (searchResults.options.length === 0) {
            // Everything is instrumental!
            searchResults.innerHTML = '<option value="">No lyrics found.</option>';
            searchResults.disabled = true;
            return;
        }
        if (!currentIdFound) {
            searchResults.selectedIndex = 0;
        }
    }

    function calcLabelWidth() {
        const widths = [];
        for (const label of advancedSearchLabels) {
            widths.push(getTextWidth(label.textContent, getComputedStyle(label).getPropertyValue("font")));
        }
        const width = Math.max(...widths);
        for (const label of advancedSearchLabels) {
            label.style.width = width + 'px';
        }
    }

    function apply() {
        MadVisLyrics.loadLyrics(searchResults.value, addOverrideChkBox.checked);
    };

    okBtn.addEventListener('click', () => {
        apply();
        Spicetify.PopupModal.hide();
    });

    cancelBtn.addEventListener('click', () => {
        Spicetify.PopupModal.hide();
    });

    applyBtn.addEventListener('click', () => {
        apply();
    });
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}