import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData } from '../../types/simulation';
import { getPlanetPositionAU } from '../../utils/astronomy';
import { getPlanetTexture, getRingsTexture } from '../../utils/planetTextures';
import { useSimulation } from '../../context/SimulationContext';
import { PlanetGLBModel } from './PlanetGLBModel';
import { AtmosphereGlow } from './AtmosphereGlow';
import { SolarAtmosphere } from './SolarAtmosphere';

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

  // Scientifically calibrated celestial body proportions (body diameters in AU)
  // Perfectly balanced so gas giants are majestic, terrestrial planets are distinguishable,
  // and no body ever obscures solar orbits or neighboring paths.
  const targetDiameter = useMemo(() => {
    switch (body.id) {
      case 'sun': return 0.110;      // Radiant central star (leaves >0.33 AU clear space before Mercury)
      case 'mercury': return 0.012;  // Smallest terrestrial world (0.5x Earth)
      case 'venus': return 0.022;    // Sister terrestrial planet (0.92x Earth)
      case 'earth': return 0.024;    // Terrestrial reference base
      case 'mars': return 0.016;     // Red planet (0.67x Earth)
      case 'jupiter': return 0.092;  // Majestic gas giant king (3.83x Earth)
      case 'saturn': return 0.075;   // Ringed gas giant body (3.12x Earth; rings span ~0.147 AU)
      case 'uranus': return 0.050;   // Ice giant body (2.08x Earth; rings span ~0.110 AU)
      case 'neptune': return 0.048;  // Ice giant (2.00x Earth)
      default: return 0.025;
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

            {/* Radiant Solar Atmosphere & Corona */}
            <SolarAtmosphere visualRadius={visualRadius} />
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

            {/* Luminous Planetary Atmosphere Scattering Halos */}
            {body.id === 'earth' && (
              <AtmosphereGlow radius={visualRadius} color="#38bdf8" scale={1.08} power={2.8} intensity={1.15} />
            )}
            {body.id === 'venus' && (
              <AtmosphereGlow radius={visualRadius} color="#fde047" scale={1.06} power={3.4} intensity={0.7} />
            )}
            {body.id === 'jupiter' && (
              <AtmosphereGlow radius={visualRadius} color="#fbbf24" scale={1.035} power={3.8} intensity={0.55} />
            )}
            {body.id === 'saturn' && (
              <AtmosphereGlow radius={visualRadius} color="#fef08a" scale={1.035} power={3.8} intensity={0.5} />
            )}
            {body.id === 'uranus' && (
              <AtmosphereGlow radius={visualRadius} color="#22d3ee" scale={1.06} power={3.0} intensity={0.8} />
            )}
            {body.id === 'neptune' && (
              <AtmosphereGlow radius={visualRadius} color="#60a5fa" scale={1.06} power={3.0} intensity={0.85} />
            )}
            {body.id === 'mars' && (
              <AtmosphereGlow radius={visualRadius} color="#fb7185" scale={1.04} power={4.5} intensity={0.4} />
            )}

            {/* Minimal selection ring */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry
                  args={[
                    visualRadius * (body.hasRings ? 2.1 : 1.35),
                    visualRadius * (body.hasRings ? 2.16 : 1.41),
                    48
                  ]}
                />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.8} />
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
          position={[0, visualRadius * (body.hasRings ? 2.1 : 1.3) + 0.015, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div className="px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono tracking-wider text-zinc-300 whitespace-nowrap">
            <span className="opacity-90">{body.name.toUpperCase()}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
