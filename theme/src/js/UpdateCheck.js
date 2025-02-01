'use strict';

import WindhawkComm from "./WindhawkComm";

const ver = '1.0b2';

export async function checkUpdates(wmpvis) {
    const isMarketplaceDist = !!document.querySelector('style.marketplaceUserCSS');
    const cteAvailable = WindhawkComm.available();
    const cteVer = WindhawkComm.getModule()?.version;

    const res = await fetch('https://www.ingan121.com/wmpotify/latest.txt');
    const latest = await res.text();
    const wmpotifyLatest = latest.match('wmpotify=(.*)')[1];
    const wmpvisLatest = latest.match('wmpvis=(.*)')[1];
    const cteLatest = latest.match('cte=(.*)')[1];

    if (!wmpvis && !isMarketplaceDist && ver !== wmpotifyLatest) {
        // todo
    }

    if (wmpvis && wmpvis !== wmpvisLatest) {
        // todo
    }

    if (cteAvailable && cteVer !== cteLatest) {
        // todo
    }
}