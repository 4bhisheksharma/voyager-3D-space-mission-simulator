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
  const { setCameraTarget, showCelestialLabels, scaleMode, cameraTarget } = useSimulation();

  const isSun = body.id === 'sun';
  const isSelected = cameraTarget === body.id;

  // Real-time time-dependent position in AU (Three.js space)
  const position = useMemo(() => {
    return getPlanetPositionAU(body.id, jd);
  }, [body.id, jd]);

  // Scaled visual radius
  const visualRadius = useMemo(() => {
    if (isSun) return scaleMode === 'enhanced' ? 0.8 : 0.4;
    // Enhanced visual scale for planetary bodies
    if (scaleMode === 'enhanced') {
      switch (body.id) {
        case 'mercury': return 0.12;
        case 'venus': return 0.18;
        case 'earth': return 0.20;
        case 'mars': return 0.15;
        case 'jupiter': return 0.48;
        case 'saturn': return 0.40;
        case 'uranus': return 0.28;
        case 'neptune': return 0.28;
        default: return 0.2;
      }
    }
    // Astronomical proportional scale
    return Math.max(0.05, (body.radiusKm / 69911) * 0.25);
  }, [body.id, body.radiusKm, isSun, scaleMode]);

  const texture = useMemo(() => getPlanetTexture(body.textureType), [body.textureType]);
  const ringsTexture = useMemo(() => (body.hasRings ? getRingsTexture() : null), [body.hasRings]);

  // Subtle axial rotation on each frame
  useFrame((_, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {isSun ? (
        // The Sun: radiating core with point light
        <group>
          <mesh ref={sphereRef} onClick={(e) => { e.stopPropagation(); setCameraTarget('sun'); }}>
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <meshBasicMaterial map={texture} color="#fffbeb" />
          </mesh>
          {/* Solar corona halo */}
          <mesh scale={[1.25, 1.25, 1.25]}>
            <sphereGeometry args={[visualRadius, 24, 24]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight color="#fff7ed" intensity={3.5} distance={150} decay={0.8} />
        </group>
      ) : (
        // Planets: lit by Sun
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
              roughness={0.7}
              metalness={0.1}
            />

            {/* Earth atmosphere glow */}
            {body.id === 'earth' && (
              <mesh scale={[1.08, 1.08, 1.08]}>
                <sphereGeometry args={[visualRadius, 24, 24]} />
                <meshBasicMaterial
                  color="#60a5fa"
                  transparent
                  opacity={0.25}
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
                opacity={0.85}
              />
            </mesh>
          )}

          {/* Focus indicator ring when selected */}
          {isSelected && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualRadius * 1.6, visualRadius * 1.7, 32]} />
              <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
            </mesh>
          )}
        </group>
      )}

      {/* Planet Label */}
      {showCelestialLabels && (
        <Html
          position={[0, visualRadius + 0.3, 0]}
          center
          distanceFactor={35}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 backdrop-blur-xs text-[10px] font-mono tracking-wider text-slate-200 whitespace-nowrap shadow-md">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: body.color }}
            />
            <span>{body.name.toUpperCase()}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
