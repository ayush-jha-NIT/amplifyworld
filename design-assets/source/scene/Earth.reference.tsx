'use client';
/**
 * Module 5 reference, not mounted in production. Supply running from the hero
 * controller; reduced motion/no-WebGL must render the exported fallback instead.
 */
import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Mesh, SRGBColorSpace, TextureLoader } from 'three';

function EarthMesh({ running, base }: { running: boolean; base: string }) {
  const ref = useRef<Mesh>(null);
  const [map, emissive] = useLoader(TextureLoader, [`${base}/earth-surface-2048.webp`, `${base}/earth-surface-2048.webp`]);
  useEffect(() => { map.colorSpace = SRGBColorSpace; emissive.colorSpace = SRGBColorSpace; }, [map, emissive]);
  useFrame((_, delta) => {
    if (running && ref.current) ref.current.rotation.y += Math.min(delta, .05) * 2 * Math.PI / 72;
  });
  return <group rotation={[0, 0, 23.4 * Math.PI / 180]}>
    <mesh ref={ref} rotation={[0, -.5, 0]}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshStandardMaterial map={map} emissiveMap={emissive} emissive="#b67bff" emissiveIntensity={.6} roughness={.84} metalness={.08} />
    </mesh>
  </group>;
}
export function EarthReference({ running, base = '/design/scene' }: { running: boolean; base?: string }) {
  return <Canvas camera={{ position: [0, .2, 5.8], fov: 35 }} dpr={[1, 1.5]} frameloop={running ? 'always' : 'demand'} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
    <ambientLight color="#8070ae" intensity={1.4} />
    <directionalLight position={[-3, 3, 4]} color="#d3b8ff" intensity={3.2} />
    <directionalLight position={[3, -1, -2]} color="#a62bff" intensity={3} />
    <Suspense fallback={null}><EarthMesh running={running} base={base} /></Suspense>
  </Canvas>;
}
