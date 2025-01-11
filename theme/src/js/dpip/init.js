import { init as initCorporateSkin, body as corporateBody  } from "./corporate";

export async function initCustomDPiP(skinName) {
    const { init, body } = getSkinInitializer(skinName);
    if (init && body && window.documentPictureInPicture) {
        const dpipWin = await documentPictureInPicture.requestWindow();
        if (dpipWin) {
            dpipWin.document.title = "Spotify";
            dpipWin.document.body.innerHTML = body;

            const favicon = dpipWin.document.createElement("link");
            favicon.rel = "icon";
            favicon.href = getComputedStyle(document.documentElement).getPropertyValue('--logo-16').slice(5, -2);
            dpipWin.document.head.appendChild(favicon);

            const style = document.querySelector('link.userCSS[href*="user.css"]');
            if (style) {
                dpipWin.document.head.appendChild(style.cloneNode());
            }

            init(dpipWin);
        }
    }
}

function getSkinInitializer(skinName) {
    switch (skinName) {
        case 'corporate':
            return { init: initCorporateSkin, body: corporateBody };
        default:
            return null;
    }
}