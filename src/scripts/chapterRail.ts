import { canProgrammaticallyNavigate, clampProgress, portfolioChapters, resolveActiveChapter, shouldSyncActive, type ScrollDirection } from './chapterNavigation';

declare global {
  interface Window {
    __aescentChapterRailCleanup?: () => void;
  }
}

const RAIL_BREAKPOINT = '(min-width: 64rem)';
const FOCUS_RATIO = 0.45;
const HEADER_OFFSET = -96;

export function initChapterRail() {
  window.__aescentChapterRailCleanup?.();

  const rail = document.querySelector<HTMLElement>('[data-chapter-rail]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const chapterElements = portfolioChapters.flatMap((chapter) => {
    const element = document.getElementById(chapter.id);
    return element ? [{ chapter, element }] : [];
  });

  if (!rail || !chapterElements.length) return;

  const desktopRail = window.matchMedia(RAIL_BREAKPOINT);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
  const currentNumber = rail.querySelector<HTMLElement>('[data-chapter-current]');
  const mobileStatus = document.querySelector<HTMLElement>('[data-chapter-status]');
  let activeId: string | undefined;
  let hasInitialized = false;
  let direction: ScrollDirection = 'down';
  let lastScrollY = window.scrollY;
  let rafId = 0;
  let hashTimer = 0;

  const setRailVisibility = (id: string | undefined) => {
    const visible = Boolean(id) && desktopRail.matches;
    rail.classList.toggle('is-hidden', !visible);
    rail.setAttribute('aria-hidden', String(!visible));
    header?.classList.toggle('has-chapter-rail', visible);
  };

  const syncActiveState = (id: string | undefined, syncHash = true) => {
    if (!shouldSyncActive(activeId, id, hasInitialized)) return;
    hasInitialized = true;
    activeId = id;
    const chapter = portfolioChapters.find((item) => item.id === id);

    links.forEach((link) => {
      const active = link.dataset.chapterId === id;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    currentNumber?.replaceChildren(document.createTextNode(chapter?.number ?? '00'));
    if (mobileStatus) mobileStatus.textContent = chapter ? `${chapter.number} / ${String(portfolioChapters.length).padStart(2, '0')}` : '';
    setRailVisibility(id);

    window.clearTimeout(hashTimer);
    if (syncHash && chapter) {
      hashTimer = window.setTimeout(() => {
        if (window.location.hash !== `#${chapter.id}`) history.replaceState(null, '', `#${chapter.id}`);
      }, 200);
    }
  };

  const updateActiveChapter = (syncHash = true) => {
    const focusLine = window.innerHeight * FOCUS_RATIO;
    const bounds = chapterElements.map(({ chapter, element }) => {
      const rect = element.getBoundingClientRect();
      return { id: chapter.id, top: rect.top, bottom: rect.bottom };
    });

    if (bounds[0].top > focusLine) {
      syncActiveState(undefined, false);
      return;
    }
    syncActiveState(resolveActiveChapter(bounds, focusLine, direction), syncHash);
  };

  const updateProgress = () => {
    rafId = 0;
    const scrollY = window.scrollY;
    direction = scrollY >= lastScrollY ? 'down' : 'up';
    lastScrollY = scrollY;
    rail.style.setProperty('--page-progress', String(clampProgress(scrollY, document.documentElement.scrollHeight, window.innerHeight)));
  };

  const onScroll = () => {
    if (!rafId) rafId = window.requestAnimationFrame(updateProgress);
  };

  const observer = new IntersectionObserver(() => updateActiveChapter(), {
    root: null,
    rootMargin: '-35% 0px -55% 0px',
    threshold: [0, 0.1, 0.25, 0.5],
  });
  chapterElements.forEach(({ element }) => observer.observe(element));

  const scrollToChapter = (id: string, focusHeading = false) => {
    const chapter = chapterElements.find((item) => item.chapter.id === id);
    if (!chapter) return;
    const targetY = Math.max(0, chapter.element.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET);

    const focus = () => {
      if (!focusHeading) return;
      const heading = document.getElementById(chapter.chapter.headingId);
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    };

    const scrollNatively = () => {
      window.scrollTo({ top: targetY, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      if (focusHeading) window.setTimeout(focus, reducedMotion.matches ? 0 : 350);
    };

    const lenis = window.__aescentLenis;
    if (lenis && !reducedMotion.matches) {
      const startingScrollY = window.scrollY;
      lenis.scrollTo(chapter.element, { offset: HEADER_OFFSET, duration: 1.05, onComplete: focus });
      window.setTimeout(() => {
        if (Math.abs(window.scrollY - startingScrollY) < 4) scrollNatively();
      }, 180);
      return;
    }

    scrollNatively();
  };

  const onChapterClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('[data-chapter-link]');
    const id = link?.dataset.chapterId;
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!link || !id || !canProgrammaticallyNavigate(desktopRail.matches, reducedMotion.matches, hasModifier)) return;

    event.preventDefault();
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    scrollToChapter(id, event.detail === 0);
  };

  const onHistoryNavigation = () => {
    const id = window.location.hash.slice(1);
    if (portfolioChapters.some((chapter) => chapter.id === id)) scrollToChapter(id);
  };

  const onBreakpointChange = () => {
    setRailVisibility(activeId);
    updateProgress();
  };

  links.forEach((link) => link.addEventListener('click', onChapterClick));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', onHistoryNavigation);
  window.addEventListener('popstate', onHistoryNavigation);
  desktopRail.addEventListener('change', onBreakpointChange);
  document.fonts?.ready.then(() => updateActiveChapter(false));

  updateProgress();
  window.requestAnimationFrame(() => {
    if (window.location.hash) onHistoryNavigation();
    updateActiveChapter(false);
  });

  const cleanup = () => {
    observer.disconnect();
    window.cancelAnimationFrame(rafId);
    window.clearTimeout(hashTimer);
    links.forEach((link) => link.removeEventListener('click', onChapterClick));
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('hashchange', onHistoryNavigation);
    window.removeEventListener('popstate', onHistoryNavigation);
    desktopRail.removeEventListener('change', onBreakpointChange);
    header?.classList.remove('has-chapter-rail');
  };

  window.__aescentChapterRailCleanup = cleanup;
  window.addEventListener('pagehide', cleanup, { once: true });
}
