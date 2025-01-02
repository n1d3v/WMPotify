export function formatTime(milliseconds, padFirst) {
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