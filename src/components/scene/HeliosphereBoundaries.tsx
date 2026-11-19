import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSimulation } from '../../context/SimulationContext';

export const HeliosphereBoundaries: React.FC = () => {
  const { showHeliosphereBoundaries, isModalOpen, isCinematicTour } = useSimulation();

  const distanceRings = useMemo(() => [
    { radius: 1, label: '1 AU' },
    { radius: 5.2, label: '5.2 AU' },
    { radius: 9.5, label: '9.5 AU' },
    { radius: 19.2, label: '19.2 AU' },
    { radius: 30.1, label: '30.1 AU' },
    { radius: 50, label: '50 AU' },
    { radius: 94, label: '94 AU (Termination Shock)' },
    { radius: 120, label: '120 AU (Heliopause)' }
  ], []);

  if (!showHeliosphereBoundaries) return null;

  return (
    <group name="heliosphere-boundaries">
      {/* Concentric distance rings - razor-thin scientific reference lines */}
      {distanceRings.map(ring => {
        const isBoundary = ring.radius >= 94;
        const delta = Math.max(0.005, ring.radius * 0.0018);
        return (
          <group key={ring.radius}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ring.radius - delta, ring.radius + delta, 128]} />
              <meshBasicMaterial
                color={isBoundary ? '#38bdf8' : '#ffffff'}
                transparent
                opacity={isBoundary ? 0.35 : 0.15}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Minimal distance mark - hidden when any dialog or cinematic tour is open */}
            {!isModalOpen && !isCinematicTour && (
              <Html
                position={[ring.radius, 0, 0]}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                <span className={`text-[8px] font-mono tracking-widest whitespace-nowrap pl-1 ${
                  isBoundary ? 'text-sky-300 font-semibold' : 'text-zinc-400'
                }`}>
                  {ring.label}
                </span>
              </Html>
            )}
          </group>
        );
      })}

      {/* Heliopause Boundary Outer Bubble */}
      <mesh scale={[120, 90, 110]} rotation={[0, 0.2, 0]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.05}
          wireframe
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
