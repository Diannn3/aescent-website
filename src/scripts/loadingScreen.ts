export const LOADING_SCREEN_DURATION = 2000;

export function initLoadingScreen() {
  const loader = document.querySelector<HTMLElement>('[data-loading-screen]');
  if (!loader) return;

  const reveal = () => {
    document.body.classList.remove('is-loading');
    loader.classList.add('is-complete');
    window.setTimeout(() => loader.remove(), 320);
  };

  window.setTimeout(reveal, LOADING_SCREEN_DURATION);
}
