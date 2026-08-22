import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import useEmblaCarousel, { type EmblaViewportRefType } from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import type { SelectedWorkRecord } from '../../data/selectedWork';
import './SelectedWorkGallery.css';

export type SelectedWorkProject = SelectedWorkRecord & Readonly<{
  media: Readonly<{ src: string; width: number; height: number }>;
  ambientMedia: Readonly<{ src: string }>;
}>;

type Props = Readonly<{ projects: readonly SelectedWorkProject[] }>;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export function getSelectedWorkTween(distance: number) {
  const safeDistance = Number.isFinite(distance) ? Math.abs(distance) : 2;
  return {
    scale: Number(clamp(1 - safeDistance * 0.105, 0.88, 1).toFixed(3)),
    opacity: Number(clamp(1 - safeDistance * 0.46, 0.48, 1).toFixed(3)),
  };
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M18 12H6m5-5-5 5 5 5' : 'M6 12h12m-5-5 5 5-5 5';
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export default function SelectedWorkGallery({ projects }: Props) {
  const loops = projects.length >= 3;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(loops);
  const [canScrollNext, setCanScrollNext] = useState(projects.length > 1);
  const selectedIndexRef = useRef(0);
  const viewportNode = useRef<HTMLDivElement | null>(null);
  const cardNodes = useRef<HTMLElement[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    active: !reducedMotion,
    align: 'center',
    containScroll: false,
    duration: 24,
    loop: loops,
    skipSnaps: false,
  });

  const activeProject = projects[selectedIndex];

  const setViewportRef = useCallback((node: HTMLDivElement | null) => {
    viewportNode.current = node;
    (emblaRef as EmblaViewportRefType)(node);
  }, [emblaRef]);

  const updateSelection = useCallback((api: EmblaCarouselType) => {
    const nextIndex = api.selectedScrollSnap();
    selectedIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
    setCanScrollPrevious(loops || api.canScrollPrev());
    setCanScrollNext(loops || api.canScrollNext());
  }, [loops]);

  const applyDistanceTween = useCallback((api: EmblaCarouselType) => {
    if (reducedMotion) return;
    const progress = api.scrollProgress();
    const snaps = api.scrollSnapList();

    snaps.forEach((snap, index) => {
      const tween = getSelectedWorkTween((snap - progress) * snaps.length);
      const card = cardNodes.current[index];
      if (!card) return;
      card.style.setProperty('--work-scale', String(tween.scale));
      card.style.setProperty('--work-opacity', String(tween.opacity));
    });
  }, [reducedMotion]);

  useEffect(() => {
    setEnhanced(true);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener('change', updateMotionPreference);
    return () => motionQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!emblaApi || reducedMotion) return;
    const prepare = (api: EmblaCarouselType) => {
      cardNodes.current = api.slideNodes()
        .map((slide) => slide.querySelector<HTMLElement>('[data-work-card]'))
        .filter((node): node is HTMLElement => node !== null);
      updateSelection(api);
      applyDistanceTween(api);
    };
    const onScroll = (api: EmblaCarouselType) => applyDistanceTween(api);
    prepare(emblaApi);
    emblaApi.on('select', updateSelection);
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', prepare);
    return () => {
      emblaApi.off('select', updateSelection);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', prepare);
    };
  }, [applyDistanceTween, emblaApi, reducedMotion, updateSelection]);

  const scrollNatively = useCallback((index: number) => {
    const viewport = viewportNode.current;
    const slide = viewport?.querySelectorAll<HTMLElement>('[data-work-slide]')[index];
    if (!viewport || !slide) return;
    viewport.scrollTo({
      behavior: 'auto',
      left: slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2,
    });
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    setCanScrollPrevious(index > 0);
    setCanScrollNext(index < projects.length - 1);
  }, [projects.length]);

  const selectProject = useCallback((requestedIndex: number) => {
    const nextIndex = loops
      ? ((requestedIndex % projects.length) + projects.length) % projects.length
      : clamp(requestedIndex, 0, projects.length - 1);
    if (emblaApi && !reducedMotion) emblaApi.scrollTo(nextIndex);
    else scrollNatively(nextIndex);
  }, [emblaApi, loops, projects.length, reducedMotion, scrollNatively]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectProject(selectedIndexRef.current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectProject(selectedIndexRef.current + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectProject(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectProject(projects.length - 1);
    }
  };

  if (projects.length === 0) return null;

  return (
    <div
      className="selected-work-gallery"
      data-enhanced={enhanced}
      data-reduced-motion={reducedMotion}
      style={{
        '--ambient-primary': activeProject.ambient.primary,
        '--ambient-secondary': activeProject.ambient.secondary,
      } as React.CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected Aescent projects"
    >
      <div className="selected-work-gallery__ambient" aria-hidden="true">
        {projects.map((project, index) => (
          <img
            key={project.id}
            src={project.ambientMedia.src}
            alt=""
            data-active={selectedIndex === index}
          />
        ))}
      </div>

      <div
        className="selected-work-gallery__viewport"
        ref={setViewportRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="selected-work-gallery__track">
          {projects.map((project, index) => {
            const selected = selectedIndex === index;
            return (
              <article
                className="selected-work-gallery__slide"
                key={project.id}
                data-work-slide
                data-selected={selected}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${projects.length}: ${project.title}`}
                aria-hidden={enhanced && !selected ? 'true' : undefined}
              >
                <div className="selected-work-gallery__card" data-work-card>
                  <div className="selected-work-gallery__browser">
                    <div className="selected-work-gallery__browser-bar" aria-hidden="true">
                      <span className="selected-work-gallery__browser-dots"><i /><i /><i /></span>
                      <span>{project.browserLabel}</span>
                    </div>
                    <div className="selected-work-gallery__media">
                      <img
                        src={project.media.src}
                        alt={project.imageAlt}
                        width={project.media.width}
                        height={project.media.height}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                      />
                    </div>
                  </div>

                  <div className="selected-work-gallery__caption">
                    <div className="selected-work-gallery__identity">
                      <span className="selected-work-gallery__index">
                        {String(index + 1).padStart(2, '0')} <i>/</i> {String(projects.length).padStart(2, '0')}
                      </span>
                      <h3>{project.title}</h3>
                      <span className="selected-work-gallery__status">{project.statusLabel}</span>
                    </div>

                    <div className="selected-work-gallery__thesis">
                      <span>Thesis</span>
                      <p>{project.thesis}</p>
                    </div>

                    <dl className="selected-work-gallery__ledger">
                      {project.ledger.map((entry) => (
                        <div key={entry.label}>
                          <dt>{entry.label}</dt>
                          <dd>{entry.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="selected-work-gallery__action">
                      {project.href && project.actionLabel ? (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={enhanced && !selected ? -1 : undefined}
                        >
                          {project.actionLabel} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span>{project.market}</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="selected-work-gallery__controls">
        <button
          type="button"
          aria-label="Previous project"
          disabled={!canScrollPrevious}
          onClick={() => selectProject(selectedIndex - 1)}
        >
          <Arrow direction="left" />
        </button>
        <div className="selected-work-gallery__indicators" role="group" aria-label="Choose a project">
          {projects.map((project, index) => (
            <button
              type="button"
              key={project.id}
              aria-label={`Show ${project.title}`}
              aria-current={selectedIndex === index ? 'true' : undefined}
              data-selected={selectedIndex === index}
              onClick={() => selectProject(index)}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next project"
          disabled={!canScrollNext}
          onClick={() => selectProject(selectedIndex + 1)}
        >
          <Arrow direction="right" />
        </button>
      </div>

      <p className="selected-work-gallery__inquiry">
        Have a project with this level of intent? <a href="#estimator">Begin with an estimate <span aria-hidden="true">→</span></a>
      </p>
      <p className="selected-work-gallery__announcement" aria-live="polite" aria-atomic="true">
        Showing project {selectedIndex + 1} of {projects.length}: {activeProject.title}
      </p>
    </div>
  );
}
