"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  SRGBColorSpace,
  TextureLoader
} from "three";

type Props = {
  running: boolean;
  onReady: () => void;
  onUnavailable: () => void;
};

const ATMOSPHERE_VERTEX = [
  "varying vec3 vNormal;",
  "varying vec3 vView;",
  "void main() {",
  "vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);",
  "vNormal = normalize(normalMatrix * normal);",
  "vView = normalize(-viewPosition.xyz);",
  "gl_Position = projectionMatrix * viewPosition;",
  "}"
].join("\n");

const ATMOSPHERE_FRAGMENT = [
  "varying vec3 vNormal;",
  "varying vec3 vView;",
  "void main() {",
  "float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.2);",
  "gl_FragColor = vec4(0.67, 0.36, 0.99, rim * 0.78);",
  "}"
].join("\n");

function StarParticles({ mobile }: { mobile: boolean }) {
  const geometry = useMemo(() => {
    const count = mobile ? 24 : 96;
    const points = new Float32Array(count * 3);
    // Deterministic coordinates make static QA frames reproducible.
    for (let i = 0; i < count; i++) {
      const azimuth = i * 2.399963229728653;
      const height = ((i * 17) % count) / Math.max(1, count - 1) * 2 - 1;
      const radius = 2.15 + (i % 9) / 13;
      points[i * 3] = Math.cos(azimuth) * Math.sqrt(1 - height * height) * radius;
      points[i * 3 + 1] = height * radius;
      points[i * 3 + 2] = Math.sin(azimuth) * Math.sqrt(1 - height * height) * radius;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(points, 3));
    return result;
  }, [mobile]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#bc88fc" size={0.016} sizeAttenuation depthWrite={false} transparent opacity={0.8} />
    </points>
  );
}

function Planet({ running, mobile, onReady }: { running: boolean; mobile: boolean; onReady: () => void }) {
  const earth = useRef<Mesh>(null);
  const ringOne = useRef<Group>(null);
  const ringTwo = useRef<Group>(null);
  const texturePath = mobile ? "/design/scene/earth-surface-1024.webp" : "/design/scene/earth-surface-2048.webp";
  const textures = useLoader(TextureLoader, [
    texturePath,
    "/design/scene/earth-emissive-2048.webp"
  ]);
  const surface = textures[0]!;
  const emission = textures[1]!;

  useEffect(() => {
    surface.colorSpace = SRGBColorSpace;
    emission.colorSpace = SRGBColorSpace;
    surface.needsUpdate = true;
    emission.needsUpdate = true;
    onReady();
  }, [surface, emission, onReady]);

  useFrame((_, delta) => {
    if (!running) return;
    const dt = Math.min(delta, 0.05);
    if (earth.current) earth.current.rotation.y += dt * 2 * Math.PI / 72;
    if (ringOne.current) ringOne.current.rotation.z += dt * 2 * Math.PI / 28;
    if (ringTwo.current) ringTwo.current.rotation.z -= dt * 2 * Math.PI / 42;
  });

  return (
    <group scale={1.23}>
      <group rotation={[0, 0, 23.4 * Math.PI / 180]}>
        <mesh ref={earth} rotation={[0, -0.5, 0]}>
          <sphereGeometry args={[1, mobile ? 40 : 64, mobile ? 24 : 32]} />
          <meshStandardMaterial
            map={surface}
            emissiveMap={emission}
            emissive="#7d38bb"
            emissiveIntensity={0.6}
            roughness={0.84}
            metalness={0.08}
          />
        </mesh>
      </group>
      <mesh scale={1.038}>
        <sphereGeometry args={[1, mobile ? 40 : 64, mobile ? 24 : 32]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <group rotation={[0.8, 0, -0.45]}>
        <group ref={ringOne}>
          <mesh>
            <torusGeometry args={[1.38, 0.006, 4, mobile ? 72 : 120]} />
            <meshBasicMaterial color="#a954fa" transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh position={[1.38, 0, 0]}>
            <sphereGeometry args={[0.03, 12, 8]} />
            <meshBasicMaterial color="#f6dcff" />
          </mesh>
        </group>
      </group>
      <group rotation={[1.4, 0, 0.35]}>
        <group ref={ringTwo}>
          <mesh>
            <torusGeometry args={[1.56, 0.005, 4, mobile ? 72 : 120]} />
            <meshBasicMaterial color="#7139f7" transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh position={[-1.56, 0, 0]}>
            <sphereGeometry args={[0.026, 12, 8]} />
            <meshBasicMaterial color="#d7b4ff" />
          </mesh>
        </group>
      </group>
      <StarParticles mobile={mobile} />
    </group>
  );
}

export function HeroEarth({ running, onReady, onUnavailable }: Props) {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  return (
    <div className="hero-earth-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.25 : 1.5]}
        camera={{ position: [0, 0.2, 5.8], fov: 35, near: 0.1, far: 20 }}
        frameloop={running ? "always" : "demand"}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onUnavailable();
          }, { once: true });
        }}
      >
        <ambientLight color="#8070ae" intensity={1.4} />
        <directionalLight position={[-3, 3, 4]} color="#d3b8ff" intensity={3.2} />
        <directionalLight position={[3, -1, -2]} color="#a62bff" intensity={3} />
        <Suspense fallback={null}>
          <Planet running={running} mobile={mobile} onReady={() => readyRef.current()} />
        </Suspense>
      </Canvas>
    </div>
  );
}
