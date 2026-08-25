'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPointer } from '@/hooks/usePointer';

/**
 * Ambient roasted beans drifting in front of the hero.
 *
 * Deliberately small in scope: one InstancedMesh, one draw call, no shadows,
 * no environment map, no post-processing. Fog pulls the far beans into the
 * page background so the field reads as depth rather than as objects.
 */

const COUNT = 26;
const SPREAD = { x: 14, y: 8, z: 7 };
/** Keep the field out of the centre, where the headline sits. */
const CLEAR_ZONE = { x: 3.4, y: 1.7 };

type Seed = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  spin: THREE.Vector3;
  drift: number;
  phase: number;
  scale: number;
};

function makeSeeds(): Seed[] {
  // Deterministic pseudo-random so the field is identical every mount —
  // hydration-safe and reproducible.
  let seed = 0x5eed;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return Array.from({ length: COUNT }, () => {
    const depth = random();

    let x = (random() - 0.5) * SPREAD.x;
    const y = (random() - 0.5) * SPREAD.y;
    // Push anything that lands behind the headline out to the wings.
    if (Math.abs(x) < CLEAR_ZONE.x && Math.abs(y) < CLEAR_ZONE.y) {
      x = (x < 0 ? -1 : 1) * (CLEAR_ZONE.x + random() * 2.6);
    }

    return {
      position: new THREE.Vector3(x, y, -depth * SPREAD.z - 1.2),
      rotation: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
      spin: new THREE.Vector3(
        (random() - 0.5) * 0.16,
        (random() - 0.5) * 0.2,
        (random() - 0.5) * 0.12
      ),
      drift: 0.1 + random() * 0.22,
      phase: random() * Math.PI * 2,
      // Roughly 14-26px on a 900px-tall viewport: ambient, never objects.
      scale: 0.042 + (1 - depth) * 0.072,
    };
  });
}

function Beans() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(makeSeeds, []);

  // A coffee bean is close enough to a squashed ellipsoid at this scale.
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 20, 14);
    geo.scale(1, 0.66, 0.8);
    return geo;
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh) return;

    const time = state.clock.elapsedTime;
    const clamped = Math.min(delta, 0.05);

    for (let i = 0; i < seeds.length; i += 1) {
      const seed = seeds[i]!;

      seed.rotation.x += seed.spin.x * clamped;
      seed.rotation.y += seed.spin.y * clamped;
      seed.rotation.z += seed.spin.z * clamped;

      dummy.position.set(
        seed.position.x + Math.sin(time * seed.drift + seed.phase) * 0.5,
        seed.position.y + Math.cos(time * seed.drift * 0.8 + seed.phase) * 0.38,
        seed.position.z
      );
      dummy.rotation.copy(seed.rotation);
      dummy.scale.setScalar(seed.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // The whole field answers the pointer, one layer slower than the type.
    if (group) {
      const pointer = getPointer();
      group.position.x += (pointer.nx * 0.42 - group.position.x) * 0.035;
      group.position.y += (-pointer.ny * 0.28 - group.position.y) * 0.035;
      group.rotation.z += (pointer.nx * 0.03 - group.rotation.z) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]} frustumCulled={false}>
        <meshStandardMaterial color="#2b1a10" roughness={0.7} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

export function BeanField({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 42 }}
        style={{ pointerEvents: 'none' }}
      >
        <fog attach="fog" args={['#0a0705', 5, 13]} />
        <ambientLight intensity={0.35} color="#7a5626" />
        {/* Warm key from the upper right, matching the photography's light. */}
        <directionalLight position={[4, 5, 4]} intensity={1.9} color="#e7b269" />
        <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#c08a3e" />
        <Beans />
      </Canvas>
    </div>
  );
}
