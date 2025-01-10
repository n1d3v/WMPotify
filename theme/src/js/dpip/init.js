import { initCorporateSkin } from "./corporate";

export async function initCustomDPiP(skinName) {
    const initializer = getSkinInitializer(skinName);
    if (initializer && window.documentPictureInPicture) {
        const dpipWin = await documentPictureInPicture.requestWindow();
        if (dpipWin) {
            initializer(dpipWin);
        }
    }
}

function getSkinInitializer(skinName) {
    switch (skinName) {
        case 'corporate':
            return initCorporateSkin;
        default:
            return null;
    }
}