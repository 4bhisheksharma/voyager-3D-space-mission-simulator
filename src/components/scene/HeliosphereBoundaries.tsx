import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSimulation } from '../../context/SimulationContext';

export const HeliosphereBoundaries: React.FC = () => {
  const { showHeliosphereBoundaries } = useSimulation();

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
        const delta = Math.max(0.004, ring.radius * 0.0015);
        return (
          <group key={ring.radius}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ring.radius - delta, ring.radius + delta, 128]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={ring.radius >= 94 ? 0.16 : 0.05}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Minimal distance mark - fixed screen size */}
            <Html
              position={[ring.radius, 0, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <span className="text-[8px] font-mono tracking-widest text-white/30 whitespace-nowrap pl-1">
                {ring.label}
              </span>
            </Html>
          </group>
        );
      })}

      {/* Heliopause Boundary Outer Bubble */}
      <mesh scale={[120, 90, 110]} rotation={[0, 0.2, 0]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.02}
          wireframe
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
