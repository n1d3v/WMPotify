function getTintedBackgroundColor(hue, sat) {
    this.canvas = this.canvas || document.createElement('canvas');
    this.canvas.width = 1;
    this.canvas.height = 1;
    this.context = this.context || this.canvas.getContext('2d');
    this.context.fillStyle = '#EEF3FA';
    this.context.filter = `hue-rotate(${hue}deg) saturate(${sat}%)`;
    this.context.fillRect(0, 0, 1, 1);
    return 'rgba(' + this.context.getImageData(0, 0, 1, 1).data + ')';
}

export function setTintColor(hue, sat, tintPb) {
    if (!hue && !sat) {
        document.documentElement.style.setProperty('--spice-main', '#EEF3FA');
        document.documentElement.style.removeProperty('--wmpotify-tint-hue');
        document.documentElement.style.removeProperty('--wmpotify-tint-sat');
        return;
    }
    const playerBar = document.querySelector('.main-nowPlayingBar-nowPlayingBar');
    if (playerBar) {
        if (tintPb) {
            playerBar.classList.add('tinted');
        } else {
            playerBar.classList.remove('tinted');
        }
    }
    document.documentElement.style.setProperty('--spice-main', getTintedBackgroundColor(hue, sat));
    document.documentElement.style.setProperty('--wmpotify-tint-hue', hue + 'deg');
    document.documentElement.style.setProperty('--wmpotify-tint-sat', sat / 100);
}