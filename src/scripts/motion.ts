import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    __aescentCleanup?: () => void;
    __aescentLenis?: Lenis;
  }
}

export function initMotion() {
  window.__aescentCleanup?.();
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopMotion = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const cleanups: Array<() => void> = [];

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  cleanups.push(() => window.removeEventListener('scroll', updateHeader));

  let lenis: Lenis | undefined;
  let ticker: ((time: number) => void) | undefined;

  if (!reduceMotion && desktopMotion) {
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: { offset: -84 },
    });
    lenis.on('scroll', ScrollTrigger.update);
    ticker = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    window.__aescentLenis = lenis;
  }

  const context = gsap.context(() => {
    if (reduceMotion) {
      gsap.set('[data-reveal], [data-reveal-line] > span', { clearProps: 'all', opacity: 1 });
      return;
    }

    gsap.fromTo('[data-reveal-line] > span',
      { yPercent: 110, rotate: 2 },
      { yPercent: 0, rotate: 0, duration: 1.25, ease: 'power4.out', stagger: 0.08, delay: 0.15 },
    );

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.fromTo(element,
        { y: desktopMotion ? 70 : 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: desktopMotion ? 1.1 : 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        },
      );
    });

    if (desktopMotion) {
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
        const amount = Number(element.dataset.parallax ?? 12);
        gsap.fromTo(element, { yPercent: -amount }, {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        });
      });

      gsap.to('[data-manifesto-index]', {
        yPercent: 90,
        ease: 'none',
        scrollTrigger: { trigger: '#philosophy', start: 'top 70%', end: 'bottom 30%', scrub: 1 },
      });

      gsap.to('[data-work-image]', {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: '[data-work-visual]', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });

      const card = document.querySelector<HTMLElement>('[data-tilt-card]');
      if (card) {
        const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3.out' });
        const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3.out' });
        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 7);
          rotateX(((event.clientY - rect.top) / rect.height - 0.5) * -7);
        };
        const onLeave = () => { rotateX(0); rotateY(0); };
        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('pointermove', onMove);
          card.removeEventListener('pointerleave', onLeave);
        });
      }
    }
  });

  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });

  const cleanup = () => {
    context.revert();
    cleanups.forEach((fn) => fn());
    if (ticker) gsap.ticker.remove(ticker);
    lenis?.destroy();
    delete window.__aescentLenis;
    window.removeEventListener('load', refresh);
  };

  window.__aescentCleanup = cleanup;
  window.addEventListener('pagehide', cleanup, { once: true });
}
