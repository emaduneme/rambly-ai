// Click-to-load YouTube embed: no YouTube scripts or cookies until someone presses play.
export function initVideo(button: HTMLButtonElement): void {
    button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1`;
        iframe.title = 'Rambly demo video';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.className = button.className;
        button.replaceWith(iframe);
        iframe.focus();
    });
}
