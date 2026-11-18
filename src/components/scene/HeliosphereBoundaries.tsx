import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSimulation } from '../../context/SimulationContext';

export const HeliosphereBoundaries: React.FC = () => {
  const { showHeliosphereBoundaries } = useSimulation();

  // Distance concentric rings in AU
  const distanceRings = useMemo(() => [
    { radius: 1, label: '1 AU (Earth)', color: '#3b82f6' },
    { radius: 5.2, label: '5.2 AU (Jupiter)', color: '#ca8a04' },
    { radius: 9.5, label: '9.5 AU (Saturn)', color: '#eab308' },
    { radius: 19.2, label: '19.2 AU (Uranus)', color: '#06b6d4' },
    { radius: 30.1, label: '30.1 AU (Neptune)', color: '#3b82f6' },
    { radius: 50, label: '50 AU (Kuiper Belt Edge)', color: '#a855f7' },
    { radius: 94, label: '94 AU (Termination Shock)', color: '#f59e0b' },
    { radius: 120, label: '120 AU (Heliopause / Interstellar Boundary)', color: '#ef4444' },
    { radius: 150, label: '150 AU (Interstellar Space)', color: '#00f5d4' }
  ], []);

  if (!showHeliosphereBoundaries) return null;

  return (
    <group name="heliosphere-boundaries">
      {/* Concentric distance rings on ecliptic plane */}
      {distanceRings.map(ring => (
        <group key={ring.radius}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ring.radius - 0.08, ring.radius + 0.08, 96]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={ring.radius >= 94 ? 0.45 : 0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Distance Tag at +X axis */}
          <Html
            position={[ring.radius, 0, 0]}
            distanceFactor={55}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div className="text-[9px] font-mono tracking-widest text-slate-400 whitespace-nowrap bg-slate-950/70 px-1 py-0.5 rounded border border-slate-800">
              {ring.label}
            </div>
          </Html>
        </group>
      ))}

      {/* 3D Heliopause Transparent Shell (Visualizing the cosmic bubble of our Solar System) */}
      <mesh scale={[120, 90, 110]} rotation={[0, 0.2, 0]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#f43f5e"
          transparent
          opacity={0.035}
          wireframe
          side={THREE.BackSide}
        />
      </mesh>

      {/* Termination Shock Inner Shell */}
      <mesh scale={[94, 75, 88]} rotation={[0, 0.2, 0]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.03}
          wireframe
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};
