import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData } from '../../types/simulation';
import { getPlanetPositionAU } from '../../utils/astronomy';
import { getPlanetTexture, getRingsTexture } from '../../utils/planetTextures';
import { useSimulation } from '../../context/SimulationContext';
import { PlanetGLBModel } from './PlanetGLBModel';

interface PlanetMeshProps {
  body: CelestialBodyData;
  jd: number;
}

export const PlanetMesh: React.FC<PlanetMeshProps> = ({ body, jd }) => {
  const meshRef = useRef<THREE.Group>(null);
  const rotGroupRef = useRef<THREE.Group>(null);
  const { setCameraTarget, showCelestialLabels, cameraTarget, optimizationMode } = useSimulation();

  const isSun = body.id === 'sun';
  const isSelected = cameraTarget === body.id;

  // Real-time time-dependent position in AU (Three.js space)
  const position = useMemo(() => {
    return getPlanetPositionAU(body.id, jd);
  }, [body.id, jd]);

  // Target physical diameters in AU (carefully proportioned so inner planets don't crowd and outer planets aren't bloated)
  const targetDiameter = useMemo(() => {
    switch (body.id) {
      case 'sun': return 0.08;      // Compact luminous star core
      case 'mercury': return 0.016;  // Smallest inner planet
      case 'venus': return 0.024;
      case 'earth': return 0.026;
      case 'mars': return 0.020;
      case 'jupiter': return 0.075;  // Majestic gas giant
      case 'saturn': return 0.110;   // Planet + rings
      case 'uranus': return 0.050;   // Ice giant
      case 'neptune': return 0.045;  // Ice giant
      default: return 0.03;
    }
  }, [body.id]);

  const visualRadius = targetDiameter / 2.0;

  // In Optimization Mode: only Sun and Earth load 3D GLB models; other planets use fast procedural spheres
  const useGLB = useMemo(() => {
    if (!body.modelPath) return false;
    if (optimizationMode) {
      return body.id === 'sun' || body.id === 'earth';
    }
    return true;
  }, [body.modelPath, body.id, optimizationMode]);

  const texture = useMemo(() => getPlanetTexture(body.textureType), [body.textureType]);
  const ringsTexture = useMemo(() => (body.hasRings ? getRingsTexture() : null), [body.hasRings]);

  // Subtle axial rotation
  useFrame((_, delta) => {
    if (rotGroupRef.current) {
      rotGroupRef.current.rotation.y += delta * 0.1;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setCameraTarget(body.id as any);
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Clickable Planet Object */}
      <group
        ref={rotGroupRef}
        rotation={[THREE.MathUtils.degToRad(body.axialTiltDeg), 0, 0]}
        onClick={handleClick}
      >
        {isSun ? (
          // The Sun
          <group>
            {useGLB && body.modelPath ? (
              <Suspense
                fallback={
                  <mesh>
                    <sphereGeometry args={[visualRadius, 32, 32]} />
                    <meshBasicMaterial map={texture} color="#fffbeb" />
                  </mesh>
                }
              >
                <PlanetGLBModel
                  modelPath={body.modelPath}
                  targetDiameter={targetDiameter}
                />
              </Suspense>
            ) : (
              <mesh>
                <sphereGeometry args={[visualRadius, 32, 32]} />
                <meshBasicMaterial map={texture} color="#fffbeb" />
              </mesh>
            )}

            {/* Subtle solar corona */}
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[visualRadius, 24, 24]} />
              <meshBasicMaterial
                color="#f59e0b"
                transparent
                opacity={0.2}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <pointLight color="#fffaf0" intensity={3.0} distance={150} decay={0.6} />
          </group>
        ) : (
          // Planetary Bodies
          <group>
            {useGLB && body.modelPath ? (
              <Suspense
                fallback={
                  <mesh>
                    <sphereGeometry args={[visualRadius, 32, 32]} />
                    <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />
                  </mesh>
                }
              >
                <PlanetGLBModel
                  modelPath={body.modelPath}
                  targetDiameter={targetDiameter}
                />
              </Suspense>
            ) : (
              // Fast Procedural Textured Sphere (Optimization Mode)
              <mesh>
                <sphereGeometry args={[visualRadius, 32, 32]} />
                <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />

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

                {/* Procedural rings for Saturn when in procedural fallback */}
                {body.hasRings && ringsTexture && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry
                      args={[
                        visualRadius * 1.3,
                        visualRadius * 2.2,
                        64
                      ]}
                    />
                    <meshStandardMaterial
                      map={ringsTexture}
                      side={THREE.DoubleSide}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                )}
              </mesh>
            )}

            {/* Minimal selection ring */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[visualRadius * 1.3, visualRadius * 1.35, 32]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* 
        Fixed screen-pixel label without distanceFactor:
        Never blows up when zooming in! 
        Hidden when focused on this body so it never obscures the 3D model.
      */}
      {showCelestialLabels && !isSelected && (
        <Html
          position={[0, visualRadius + 0.03, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono tracking-wider text-zinc-300 whitespace-nowrap">
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ backgroundColor: body.color }}
            />
            <span className="opacity-90">{body.name.toUpperCase()}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
