export interface PortfolioChapter {
  id: string;
  number: string;
  shortLabel: string;
  label: string;
  headingId: string;
}

export interface ChapterBounds {
  id: string;
  top: number;
  bottom: number;
}

export type ScrollDirection = 'up' | 'down';

export const portfolioChapters: readonly PortfolioChapter[] = [
  { id: 'philosophy', number: '01', shortLabel: 'Philosophy', label: 'Anti-Vibecode Philosophy', headingId: 'manifesto-title' },
  { id: 'work', number: '02', shortLabel: 'Work', label: 'Selected Work', headingId: 'work-title' },
  { id: 'capabilities', number: '03', shortLabel: 'Capabilities', label: 'Studio Capabilities', headingId: 'capabilities-title' },
  { id: 'process', number: '04', shortLabel: 'Process', label: 'Design Process', headingId: 'process-title' },
  { id: 'estimator', number: '05', shortLabel: 'Estimate', label: 'Project Estimator', headingId: 'estimator-title' },
  { id: 'contact', number: '06', shortLabel: 'Begin', label: 'Begin a Project', headingId: 'closing-title' },
];

export function clampProgress(scrollY: number, documentHeight: number, viewportHeight: number) {
  const range = documentHeight - viewportHeight;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / range));
}

export function shouldSyncActive(previous: string | undefined, next: string | undefined, hasInitialized: boolean) {
  return !hasInitialized || previous !== next;
}

export function canProgrammaticallyNavigate(isDesktop: boolean, prefersReducedMotion: boolean, hasModifier: boolean) {
  return isDesktop && !prefersReducedMotion && !hasModifier;
}

export function resolveActiveChapter(
  chapters: readonly ChapterBounds[],
  focusLine: number,
  direction: ScrollDirection,
) {
  if (!chapters.length) return undefined;

  const containingFocus = chapters.filter((chapter) => chapter.top <= focusLine && chapter.bottom >= focusLine);
  const candidates = containingFocus.length ? containingFocus : chapters;

  return candidates.reduce((winner, candidate) => {
    const winnerDistance = Math.min(Math.abs(winner.top - focusLine), Math.abs(winner.bottom - focusLine));
    const candidateDistance = Math.min(Math.abs(candidate.top - focusLine), Math.abs(candidate.bottom - focusLine));

    if (candidateDistance < winnerDistance) return candidate;
    if (candidateDistance > winnerDistance) return winner;
    return direction === 'down' ? candidate : winner;
  }).id;
}
