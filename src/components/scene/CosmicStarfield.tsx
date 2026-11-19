import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const CosmicStarfield: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // Multi-spectral astronomical foreground stars (Class O, B, A, G, M)
  const { starGeometry, dustGeometry } = useMemo(() => {
    // 1. Spectral Stars
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const spectralPalette = [
      new THREE.Color('#93c5fd'), // Class B (Electric Blue)
      new THREE.Color('#38bdf8'), // Class O (Cyan Blue)
      new THREE.Color('#ffffff'), // Class A (Pure White)
      new THREE.Color('#f8fafc'), // Class F (White-Yellow)
      new THREE.Color('#fde047'), // Class G (Solar Golden)
      new THREE.Color('#fca5a5')  // Class M (Red-Orange Giant)
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 180 + Math.random() * 320;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    sGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // 2. Cosmic Galactic Dust Lane
    const dustCount = 800;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const dustPalette = [
      new THREE.Color('#1e1b4b'), // Deep Indigo
      new THREE.Color('#312e81'), // Cosmic Violet
      new THREE.Color('#0c4a6e'), // Dark Cyan Nebula
      new THREE.Color('#172554')  // Deep Space Blue
    ];

    for (let i = 0; i < dustCount; i++) {
      // Concentrated along a diagonal galactic plane
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const r = 220 + Math.random() * 260;
      const height = (Math.random() - 0.5) * 60;

      dustPositions[i * 3] = r * Math.cos(angle);
      dustPositions[i * 3 + 1] = height + r * 0.35 * Math.sin(angle);
      dustPositions[i * 3 + 2] = r * Math.sin(angle);

      const color = dustPalette[Math.floor(Math.random() * dustPalette.length)];
      dustColors[i * 3] = color.r;
      dustColors[i * 3 + 1] = color.g;
      dustColors[i * 3 + 2] = color.b;
    }

    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    return { starGeometry: sGeo, dustGeometry: dGeo };
  }, []);

  // Subtle slow cosmic rotation
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.003;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.0015;
    }
  });

  return (
    <group>
      {/* 1. Distant Starfield Dome */}
      <Stars
        radius={450}
        depth={80}
        count={5500}
        factor={3.5}
        saturation={0.4}
        fade
        speed={0.15}
      />

      {/* 2. Multi-Spectral Foreground Astronomical Stars */}
      <points ref={pointsRef} geometry={starGeometry}>
        <pointsMaterial
          size={2.2}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Soft Cosmic Dust / Nebula Glow */}
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          size={14.0}
          vertexColors
          transparent
          opacity={0.25}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
