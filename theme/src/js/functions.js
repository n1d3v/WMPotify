export function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = String(seconds % 60).padStart(2, '0');
    if (minutes < 60) {
        return `${minutes}:${seconds}`;
    }
    const hours = Math.floor(minutes / 60);
    minutes = String(minutes % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}