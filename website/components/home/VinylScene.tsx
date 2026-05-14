"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Mesh } from "three";

/**
 * A slowly-rotating vinyl record. This is the single focused 3D moment on
 * the page — used next to the Audio Mode section to reinforce the "listen"
 * idea without dragging the viewer into a 3D-everywhere experience.
 *
 * - The disc is matte black with a warm amber label (brand accent).
 * - It floats and rotates on its Y axis and tilts slightly toward the
 *   cursor via R3F's <Float>.
 * - Lighting is restrained: a soft warm fill + a single rim light.
 *
 * No DOM interactivity, no controls — purely decorative. Pointer-events
 * are disabled on the canvas in the parent so the disc never steals
 * scroll/clicks.
 */
function Disc() {
  const groupRef = useRef<Mesh>(null);

  useFrame((_, dt) => {
    // Continuous slow rotation — like a record on a turntable.
    if (groupRef.current) groupRef.current.rotation.z -= dt * 0.4;
  });

  return (
    <group rotation={[Math.PI / 2.4, 0, 0]}>
      <mesh ref={groupRef as never} castShadow receiveShadow>
        {/* Main disc body */}
        <cylinderGeometry args={[2.6, 2.6, 0.05, 96]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.55}
          metalness={0.2}
        />
      </mesh>

      {/* Subtle concentric grooves rendered as thin rings. Six is enough
          to read as "vinyl" without becoming a moiré mess. */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0.028, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.05 + i * 0.22, 1.06 + i * 0.22, 96]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Warm amber center label */}
      <mesh position={[0, 0.029, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 64]} />
        <meshStandardMaterial
          color="#fca929"
          roughness={0.4}
          metalness={0.1}
          emissive="#fca929"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Inner spindle hole */}
      <mesh position={[0, 0.031, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

export default function VinylScene() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.6, 4.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={1.1}
          color="#fff3dd"
        />
        {/* Cool rim light from the back for separation from cream bg */}
        <directionalLight
          position={[-3, 2, -2]}
          intensity={0.35}
          color="#cfd4ff"
        />
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.5}>
            <Disc />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
