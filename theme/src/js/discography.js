'use strict';

import PageManager from "./PageManager";

export async function initDiscographyPage(wait) {
    //console.log(document.querySelector('.main-view-container__scroll-node-child main').innerHTML);
    const section = document.querySelector('section[data-testid="artist-page"]');
    if (!section) {
        if (wait) {
            await PageManager.waitForPageRender();
            initDiscographyPage(false);
        }
        return;
    }

    await waitForFullRender(section);

    if (section.querySelector('.artist-artistDiscography-cardGrid')) {
        // Not yet!
        return;
    }

    const artistName = section.querySelector('.artist-artistDiscography-topBar a').textContent;
    const artistUrl = section.dataset.testUri;

    const headers = section.querySelectorAll('.artist-artistDiscography-headerContainer');
    for (const header of headers) {
        if (document.querySelector('.artist-artistDiscography-headerTitle + div a')) {
            continue;
        }
        const headerImage = header.querySelector('.main-entityHeader-image');
        if (!headerImage) {
            continue;
        }
        headerImage.addEventListener('dblclick', () => {
            header.querySelector('.artist-artistDiscography-headerButtons div button').click();
        });
        headerImage.addEventListener('contextmenu', async (event) => {
            header.querySelector('.artist-artistDiscography-headerButtons > button:last-child').click();
            event.preventDefault();
            event.stopPropagation();
            await waitForContextMenu();
            const menu = document.querySelector('[data-tippy-root]');
            menu.dataset.wmpotifyForceTransform = true;
            menu.style.setProperty('--tippy-force-transform', `translate(${event.clientX}px, ${event.clientY}px)`);
        });
        const link = document.createElement('a');
        link.href = artistUrl;
        link.textContent = artistName;
        header.querySelector('.artist-artistDiscography-headerTitle + div').appendChild(link);
    }

    const trackLists = section.querySelectorAll('.artist-artistDiscography-tracklist');
    for (const trackList of trackLists) {
        if (trackList.querySelector('.wmpotify-discography-trackList-header')) {
            continue;
        }
        const albumName = trackList.querySelector('[role="grid"]');
        if (!albumName) {
            continue;
        }
        const albumTitle = albumName.getAttribute('aria-label');
        const trackListHeader = document.createElement('div');
        trackListHeader.className = 'wmpotify-discography-trackList-header';
        trackListHeader.textContent = albumTitle;
        trackList.insertAdjacentElement('afterbegin', trackListHeader);
        // const rootlist = trackList.querySelector('.main-rootlist-wrapper');
        // //rootlist.style.height = parseInt(rootlist.style.height) / 2 + 48 + 'px';
        // //rootlist.style.setProperty('--row-height', '16px');
        // //rootlist.style.setProperty('--child-cnt', rootlist.querySelectorAll('.main-trackList-trackListRow').length);
        // //console.log(rootlist.innerHTML);
        // const reactPropsKey = Object.keys(rootlist).find(key => key.startsWith("__reactProps$"));
        // reactPropsKey && (rootlist[reactPropsKey].style['--row-height'] = '16px');
        // reactPropsKey && (rootlist[reactPropsKey].style['height'] = parseInt(rootlist[reactPropsKey].style['height']) / 2 + 'px');
        // rootlist.style.height = parseInt(rootlist.style.height) / 2 + 'px';
        // rootlist.style.setProperty('--row-height', '16px');
        // //rootlist.parentElement.style.height = parseInt(rootlist.style.height) / 2 + 48 + 'px';
        // initRootlist(rootlist);
    }

    const observer = new MutationObserver(() => {
        initDiscographyPage(false);
        observer.disconnect();
    });
    observer.observe(section.querySelector('[data-testid="infinite-scroll-list"]'), { childList: true });
}

// async function initRootlist(rootlist) {
//     await waitForChildren(rootlist, '.main-trackList-trackListRow');
//     // rootlist.style.height = parseInt(rootlist.style.height) / 2 + 48 + 'px';
//     // rootlist.style.setProperty('--row-height', '16px');
//     // const reactPropsKey = Object.keys(rootlist).find(key => key.startsWith("__reactProps$"));
//     // reactPropsKey && (rootlist[reactPropsKey].style['--row-height'] = '16px');
//     // reactPropsKey && (rootlist[reactPropsKey].style['height'] = parseInt(rootlist[reactPropsKey].style['height']) / 2 + 48 + 'px');
//     // rootlist.parentElement.style.height = parseInt(rootlist.style.height) / 2 + 48 + 'px';
//     //console.log(rootlist.innerHTML);
//     //rootlist.style.marginBottom = (parseInt(rootlist.style.height) / 2) * -1 + 'px';
// }

function waitForFullRender(section) {
    if (!section.querySelector('.artist-artistDiscography-tracklist')) {
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                if (section.querySelector('.artist-artistDiscography-tracklist')) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(section, { childList: true, subtree: true });
        });
    }
}

function waitForContextMenu() {
    return new Promise(resolve => {
        const observer = new MutationObserver(() => {
            const menu = document.querySelector('[data-tippy-root]');
            if (menu) {
                observer.disconnect();
                resolve();
            }
        });
        observer.observe(document.body, { childList: true });
    });
}

function waitForChildren(element, selector) {
    if (!element.querySelector(selector)) {
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                if (element.querySelector(selector)) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(element, { childList: true, subtree: true });
        });
    }
}