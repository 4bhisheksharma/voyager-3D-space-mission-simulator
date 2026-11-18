import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData } from '../../types/simulation';
import { getPlanetPositionAU } from '../../utils/astronomy';
import { getPlanetTexture, getRingsTexture } from '../../utils/planetTextures';
import { useSimulation } from '../../context/SimulationContext';

interface PlanetMeshProps {
  body: CelestialBodyData;
  jd: number;
}

export const PlanetMesh: React.FC<PlanetMeshProps> = ({ body, jd }) => {
  const meshRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const { setCameraTarget, showCelestialLabels, cameraTarget } = useSimulation();

  const isSun = body.id === 'sun';
  const isSelected = cameraTarget === body.id;

  // Real-time time-dependent position in AU (Three.js space)
  const position = useMemo(() => {
    return getPlanetPositionAU(body.id, jd);
  }, [body.id, jd]);

  // Carefully tuned astronomical proportional sizes so Sun, Mercury, Venus, Earth NEVER overlap
  const visualRadius = useMemo(() => {
    switch (body.id) {
      case 'sun': return 0.05;      // Compact luminous star (leaving 0.34 AU empty space before Mercury)
      case 'mercury': return 0.015;  // 0.387 AU orbit
      case 'venus': return 0.024;    // 0.723 AU orbit
      case 'earth': return 0.026;    // 1.000 AU orbit
      case 'mars': return 0.019;     // 1.524 AU orbit
      case 'jupiter': return 0.068;  // 5.203 AU orbit
      case 'saturn': return 0.058;   // 9.537 AU orbit
      case 'uranus': return 0.040;   // 19.19 AU orbit
      case 'neptune': return 0.040;  // 30.07 AU orbit
      default: return 0.02;
    }
  }, [body.id]);

  const texture = useMemo(() => getPlanetTexture(body.textureType), [body.textureType]);
  const ringsTexture = useMemo(() => (body.hasRings ? getRingsTexture() : null), [body.hasRings]);

  // Subtle axial rotation
  useFrame((_, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {isSun ? (
        // The Sun: luminous star with natural corona
        <group>
          <mesh
            ref={sphereRef}
            onClick={(e) => { e.stopPropagation(); setCameraTarget('sun'); }}
          >
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <meshBasicMaterial map={texture} color="#fffbeb" />
          </mesh>

          {/* Delicate solar corona */}
          <mesh scale={[1.35, 1.35, 1.35]}>
            <sphereGeometry args={[visualRadius, 24, 24]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.25}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight color="#fffaf0" intensity={3.0} distance={200} decay={0.6} />
        </group>
      ) : (
        // Planets: lit by Sun + subtle fill light
        <group>
          <mesh
            ref={sphereRef}
            rotation={[THREE.MathUtils.degToRad(body.axialTiltDeg), 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setCameraTarget(body.id as any);
            }}
          >
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.65}
              metalness={0.05}
            />

            {/* Earth subtle atmospheric rim */}
            {body.id === 'earth' && (
              <mesh scale={[1.06, 1.06, 1.06]}>
                <sphereGeometry args={[visualRadius, 24, 24]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                />
              </mesh>
            )}
          </mesh>

          {/* Planetary rings for Saturn & Uranus */}
          {body.hasRings && ringsTexture && (
            <mesh
              rotation={[
                THREE.MathUtils.degToRad(body.axialTiltDeg + 90),
                0,
                0
              ]}
            >
              <ringGeometry
                args={[
                  visualRadius * (body.ringInnerRadius || 1.3),
                  visualRadius * (body.ringOuterRadius || 2.4),
                  64
                ]}
              />
              <meshStandardMaterial
                map={ringsTexture}
                side={THREE.DoubleSide}
                transparent
                opacity={0.8}
                roughness={0.8}
              />
            </mesh>
          )}

          {/* Minimal focus indicator when selected */}
          {isSelected && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualRadius * 1.5, visualRadius * 1.55, 32]} />
              <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      )}

      {/* Minimal Planet Label */}
      {showCelestialLabels && (
        <Html
          position={[0, visualRadius + 0.05, 0]}
          center
          distanceFactor={22}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 border border-white/10 text-[9px] font-mono tracking-wider text-slate-300 whitespace-nowrap shadow-xs">
            <span
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: body.color }}
            />
            <span className="opacity-90">{body.name.toUpperCase()}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
