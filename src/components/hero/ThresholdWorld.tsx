import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  MathUtils,
  MeshStandardMaterial,
  Shape,
  Vector3,
} from 'three';

import {
  PANEL_DEFINITIONS,
  requiresSceneRefresh,
  SCENE_PALETTE,
  sampleSceneState,
  type PanelDefinition,
  type SceneQuality,
} from './sceneConfig';

gsap.registerPlugin(ScrollTrigger);

interface ThresholdWorldProps {
  quality: SceneQuality;
  visible: boolean;
}

interface PanelProps {
  definition: PanelDefinition;
  quality: SceneQuality;
  ivory: MeshStandardMaterial;
  dark: MeshStandardMaterial;
  edge: LineBasicMaterial;
}

function ArchitecturalPanel({ definition, quality, ivory, dark, edge }: PanelProps) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    definition.points.forEach(([x, y], pointIndex) => {
      if (pointIndex === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return new ExtrudeGeometry(shape, {
      depth: quality === 'mobile' ? 0.18 : 0.34,
      bevelEnabled: true,
      bevelSegments: quality === 'desktop' ? 2 : 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 1,
    });
  }, [definition, quality]);
  const edges = useMemo(() => new EdgesGeometry(geometry, 24), [geometry]);

  useEffect(() => () => {
    geometry.dispose();
    edges.dispose();
  }, [edges, geometry]);

  return (
    <group
      userData={{ spreadDirection: definition.spreadDirection }}
      position-z={definition.depthOffset}
    >
      <mesh geometry={geometry} material={[ivory, dark]} />
      <lineSegments geometry={edges} material={edge} position-z={0.012} />
    </group>
  );
}

export default function ThresholdWorld({ quality, visible }: ThresholdWorldProps) {
  const structure = useRef<Group>(null);
  const gateLeft = useRef<Group>(null);
  const gateRight = useRef<Group>(null);
  const progress = useRef(0);
  const renderedProgress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const renderedPointer = useRef({ x: 0, y: 0 });
  const previousQuality = useRef<SceneQuality>(quality);
  const cameraTarget = useMemo(() => new Vector3(), []);
  const { camera, gl, invalidate } = useThree();

  const materials = useMemo(() => ({
    ivory: new MeshStandardMaterial({ color: SCENE_PALETTE.ivory, roughness: 0.58, metalness: 0.08, transparent: true }),
    dark: new MeshStandardMaterial({ color: '#11110f', roughness: 0.32, metalness: 0.72, transparent: true }),
    edge: new LineBasicMaterial({ color: SCENE_PALETTE.edge, transparent: true, opacity: 0.72 }),
    gold: new MeshStandardMaterial({ color: SCENE_PALETTE.gold, roughness: 0.24, metalness: 0.68, transparent: true }),
  }), []);

  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);

  useEffect(() => {
    if (quality === 'static') {
      progress.current = 0;
      invalidate();
      return;
    }
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (!hero) return;
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: quality === 'desktop' ? 0.75 : 0.3,
      onUpdate: (self) => {
        progress.current = quality === 'mobile' ? self.progress * 0.64 : self.progress;
        if (visible) invalidate();
      },
    });
    return () => trigger.kill();
  }, [invalidate, quality, visible]);

  useEffect(() => {
    if (quality !== 'desktop') return;
    const canvas = gl.domElement;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      pointer.current.y = MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      if (visible) invalidate();
    };
    const resetPointer = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      if (visible) invalidate();
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', resetPointer);
    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', resetPointer);
    };
  }, [gl, invalidate, quality, visible]);

  useEffect(() => {
    if (visible && requiresSceneRefresh(previousQuality.current, quality)) invalidate();
    previousQuality.current = quality;
  }, [invalidate, quality, visible]);

  useEffect(() => {
    if (visible) invalidate();
  }, [invalidate, visible]);

  useFrame((_, delta) => {
    if (!visible || !structure.current) return;
    const progressDamping = 1 - Math.exp(-delta * 8.5);
    const pointerDamping = 1 - Math.exp(-delta * 7);
    renderedProgress.current = MathUtils.lerp(renderedProgress.current, progress.current, progressDamping);
    renderedPointer.current.x = MathUtils.lerp(renderedPointer.current.x, pointer.current.x, pointerDamping);
    renderedPointer.current.y = MathUtils.lerp(renderedPointer.current.y, pointer.current.y, pointerDamping);

    const state = sampleSceneState(renderedProgress.current);
    const pointerLimit = MathUtils.degToRad(3);
    structure.current.rotation.y = state.structureYaw + renderedPointer.current.x * pointerLimit;
    structure.current.rotation.x = renderedPointer.current.y * -pointerLimit * 0.55;
    structure.current.children.forEach((child) => {
      const direction = Number(child.userData.spreadDirection ?? 0);
      if (direction) child.position.x = direction * state.spread;
    });

    if (gateLeft.current && gateRight.current) {
      gateLeft.current.position.x = -0.13 - state.gateOpen * 0.48;
      gateRight.current.position.x = 0.13 + state.gateOpen * 0.48;
      gateLeft.current.position.z = 0.08 + state.gateOpen * 0.3;
      gateRight.current.position.z = 0.08 + state.gateOpen * 0.3;
    }

    materials.ivory.opacity = state.opacity;
    materials.dark.opacity = state.opacity;
    materials.gold.opacity = state.opacity;
    materials.edge.opacity = state.opacity * 0.72;
    camera.position.set(...state.camera);
    camera.position.x += renderedPointer.current.x * 0.12;
    camera.position.y += renderedPointer.current.y * -0.08;
    cameraTarget.set(...state.target);
    camera.lookAt(cameraTarget);

    const unsettled = Math.abs(renderedProgress.current - progress.current) > 0.0005
      || Math.abs(renderedPointer.current.x - pointer.current.x) > 0.0005
      || Math.abs(renderedPointer.current.y - pointer.current.y) > 0.0005;
    if (unsettled) invalidate();
  });

  return (
    <>
      <color attach="background" args={[SCENE_PALETTE.ink]} />
      <fog attach="fog" args={[SCENE_PALETTE.ink, 7.5, 13.5]} />
      <ambientLight intensity={0.72} color={SCENE_PALETTE.ivory} />
      <directionalLight position={[-3.5, 4.5, 5]} intensity={3.8} color={SCENE_PALETTE.ivory} />
      <pointLight position={[3.5, -0.8, 3.2]} intensity={42} distance={10} decay={2} color={SCENE_PALETTE.gold} />

      <group ref={structure} position={[quality === 'mobile' ? 0 : 1.78, 0.12, 0]} scale={quality === 'mobile' ? 0.86 : 0.88}>
        {PANEL_DEFINITIONS.map((definition, index) => (
          <ArchitecturalPanel
            key={index}
            definition={definition}
            quality={quality}
            ivory={materials.ivory}
            dark={materials.dark}
            edge={materials.edge}
          />
        ))}
        <group ref={gateLeft}>
          <mesh material={materials.gold} position={[-0.065, -1.43, 0.22]}>
            <boxGeometry args={[0.13, 1.58, 0.28]} />
          </mesh>
        </group>
        <group ref={gateRight}>
          <mesh material={materials.gold} position={[0.065, -1.43, 0.22]}>
            <boxGeometry args={[0.13, 1.58, 0.28]} />
          </mesh>
        </group>
      </group>

      <mesh position={[0, -2.28, -0.3]} rotation={[-Math.PI / 2, 0, 0]} material={materials.dark}>
        <planeGeometry args={[18, 18]} />
      </mesh>
    </>
  );
}
