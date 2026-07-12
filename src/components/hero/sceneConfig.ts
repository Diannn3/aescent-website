export type SceneQuality = 'desktop' | 'mobile' | 'static';

export type Vector3Tuple = [number, number, number];

export interface SceneState {
  camera: Vector3Tuple;
  target: Vector3Tuple;
  spread: number;
  gateOpen: number;
  structureYaw: number;
  opacity: number;
}

export interface PanelDefinition {
  points: ReadonlyArray<readonly [number, number]>;
  spreadDirection: number;
  depthOffset: number;
}

export const SCENE_PALETTE = {
  ink: '#050505',
  ivory: '#fbfbfb',
  gold: '#d4af37',
  edge: '#736327',
} as const;

export const PANEL_DEFINITIONS: ReadonlyArray<PanelDefinition> = [
  { points: [[-1.28, -2.2], [-1.28, 1.35], [-0.78, 1.82], [-0.2, 2.36], [-0.2, -0.52], [-0.58, -0.88], [-0.58, -1.62]], spreadDirection: -1, depthOffset: 0 },
  { points: [[0.2, -0.52], [0.2, 2.36], [0.78, 1.82], [1.28, 1.35], [1.28, -2.2], [0.58, -1.62], [0.58, -0.88]], spreadDirection: 1, depthOffset: 0 },
  { points: [[-1.86, -2.22], [-1.86, 0.62], [-1.43, 1.02], [-1.43, -1.62]], spreadDirection: -1.35, depthOffset: -0.08 },
  { points: [[1.43, -1.62], [1.43, 1.02], [1.86, 0.62], [1.86, -2.22]], spreadDirection: 1.35, depthOffset: -0.08 },
  { points: [[-2.58, -2.22], [-2.12, -1.78], [-2.12, -0.08], [-1.96, 0.06], [-1.96, -2.22]], spreadDirection: -1.7, depthOffset: -0.16 },
  { points: [[1.96, -2.22], [1.96, 0.06], [2.12, -0.08], [2.12, -1.78], [2.58, -2.22]], spreadDirection: 1.7, depthOffset: -0.16 },
] as const;

const KEYFRAMES: ReadonlyArray<readonly [number, SceneState]> = [
  [0, { camera: [0, 0.08, 8.6], target: [0, 0.05, 0], spread: 0, gateOpen: 0, structureYaw: 0, opacity: 1 }],
  [0.28, { camera: [0.18, 0.12, 8.05], target: [0, 0.02, 0], spread: 0.12, gateOpen: 0, structureYaw: -0.035, opacity: 1 }],
  [0.62, { camera: [0.92, 0.18, 6.55], target: [0, -0.04, -0.15], spread: 0.46, gateOpen: 0.56, structureYaw: -0.14, opacity: 1 }],
  [1, { camera: [0.12, 0.24, 3.72], target: [0, -0.12, -1.4], spread: 0.7, gateOpen: 1, structureYaw: -0.04, opacity: 0.16 }],
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const mixVector = (from: Vector3Tuple, to: Vector3Tuple, amount: number): Vector3Tuple => [
  mix(from[0], to[0], amount),
  mix(from[1], to[1], amount),
  mix(from[2], to[2], amount),
];

export function resolveSceneQuality(width: number, reducedMotion: boolean): SceneQuality {
  if (reducedMotion) return 'static';
  return width <= 768 ? 'mobile' : 'desktop';
}

export function requiresSceneRefresh(previous: SceneQuality, next: SceneQuality): boolean {
  return previous !== next;
}

export function sampleSceneState(progress: number): SceneState {
  const normalized = clamp(progress);
  let start = KEYFRAMES[0];
  let end = KEYFRAMES.at(-1)!;

  for (let index = 1; index < KEYFRAMES.length; index += 1) {
    if (normalized <= KEYFRAMES[index][0]) {
      start = KEYFRAMES[index - 1];
      end = KEYFRAMES[index];
      break;
    }
  }

  const span = end[0] - start[0];
  const amount = span === 0 ? 0 : (normalized - start[0]) / span;
  const from = start[1];
  const to = end[1];

  return {
    camera: mixVector(from.camera, to.camera, amount),
    target: mixVector(from.target, to.target, amount),
    spread: mix(from.spread, to.spread, amount),
    gateOpen: mix(from.gateOpen, to.gateOpen, amount),
    structureYaw: mix(from.structureYaw, to.structureYaw, amount),
    opacity: mix(from.opacity, to.opacity, amount),
  };
}
