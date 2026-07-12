import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';

import ThresholdWorld from './ThresholdWorld';
import { resolveSceneQuality, SCENE_PALETTE, type SceneQuality } from './sceneConfig';

interface BoundaryProps { children: ReactNode }
interface BoundaryState { failed: boolean }

class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Aescent Threshold fell back to the static brand mark.', error, info.componentStack);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function AescentThreshold() {
  const shell = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<SceneQuality>('static');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateQuality = () => setQuality(resolveSceneQuality(window.innerWidth, reducedMotion.matches));
    updateQuality();
    window.addEventListener('resize', updateQuality, { passive: true });
    reducedMotion.addEventListener('change', updateQuality);
    return () => {
      window.removeEventListener('resize', updateQuality);
      reducedMotion.removeEventListener('change', updateQuality);
    };
  }, []);

  useEffect(() => {
    if (!shell.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden), { rootMargin: '10%' });
    const onVisibilityChange = () => {
      const rect = shell.current?.getBoundingClientRect();
      setVisible(!document.hidden && Boolean(rect && rect.bottom > 0 && rect.top < window.innerHeight));
    };
    observer.observe(shell.current);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div ref={shell} className="threshold-react-root" aria-hidden="true">
      <SceneBoundary>
        <Canvas
          camera={{ fov: quality === 'mobile' ? 38 : 34, near: 0.1, far: 40, position: [0, 0.08, 8.6] }}
          dpr={quality === 'desktop' ? [1, 1.5] : 1}
          frameloop="demand"
          gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(SCENE_PALETTE.ink, 1);
            requestAnimationFrame(() => {
              shell.current?.closest('[data-hero-scene]')?.classList.add('is-ready');
            });
          }}
        >
          <ThresholdWorld quality={quality} visible={visible} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
