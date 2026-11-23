import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useSimulation } from '../../context/SimulationContext';
import { getOneLightDayFlightState } from '../../utils/astronomy';

export const OneLightDayBeam: React.FC = () => {
  const { isOneLightDaySimulation, oneLightDayProgress, v1Current } = useSimulation();
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Target coordinates for Voyager 1 at 1 Light Day
  const v1Pos = useMemo<[number, number, number]>(() => {
    if (v1Current) return [v1Current.x, v1Current.y, v1Current.z];
    return [-137.386967, 99.292922, -32.233514];
  }, [v1Current]);

  const dirU = useMemo(() => {
    return new THREE.Vector3(...v1Pos).normalize();
  }, [v1Pos]);

  const flightState = useMemo(() => {
    return getOneLightDayFlightState(oneLightDayProgress);
  }, [oneLightDayProgress]);

  // Current photon wavefront position
  const currentPos = useMemo<[number, number, number]>(() => {
    const v = dirU.clone().multiplyScalar(flightState.distAU);
    return [v.x, v.y, v.z];
  }, [dirU, flightState.distAU]);

  // Beam points from Sun to current light wavefront
  const activeBeamPoints = useMemo<[number, number, number][]>(() => {
    return [
      [0, 0, 0],
      currentPos
    ];
  }, [currentPos]);

  // Projected path points from current position to Voyager 1
  const remainingBeamPoints = useMemo<[number, number, number][]>(() => {
    return [
      currentPos,
      v1Pos
    ];
  }, [currentPos, v1Pos]);

  // Pulse animation in useFrame
  useFrame((_, delta) => {
    if (pulseRef.current) {
      pulseRef.current.rotation.y += delta * 1.5;
      const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.18;
      pulseRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
    }
  });

  if (!isOneLightDaySimulation) return null;

  return (
    <group name="one-light-day-beam-group">
      {/* 1. Radiant Photon Wavefront Beam (from Sun to current position) */}
      <Line
        points={activeBeamPoints}
        color="#38bdf8"
        lineWidth={3.5}
        transparent
        opacity={0.88}
      />

      {/* 2. Secondary Golden Energy Core */}
      <Line
        points={activeBeamPoints}
        color="#fbbf24"
        lineWidth={1.5}
        transparent
        opacity={0.95}
      />

      {/* 3. Projected Forward Trajectory Ray (faint guide to Voyager 1) */}
      <Line
        points={remainingBeamPoints}
        color="#38bdf8"
        lineWidth={1}
        transparent
        opacity={0.22}
        dashed
        dashScale={50}
        dashSize={1}
        gapSize={0.5}
      />

      {/* 4. Traveling Light Wavefront Pulse */}
      <group position={currentPos}>
        {/* Core Photon Glow */}
        <mesh ref={pulseRef}>
          <sphereGeometry args={[Math.max(0.04, Math.min(0.6, flightState.distAU * 0.008 + 0.03)), 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
        </mesh>

        {/* Outer Wavefront Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            Math.max(0.08, Math.min(1.2, flightState.distAU * 0.012 + 0.05)),
            Math.max(0.10, Math.min(1.3, flightState.distAU * 0.013 + 0.07)),
            32
          ]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. Destination Marker at Voyager 1 (1 Light Day) */}
      <group position={v1Pos}>
        {/* Subtle Target Sphere */}
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.4} />
        </mesh>

        {/* 3D Label */}
        <Html
          position={[0, 0.15, 0]}
          center
          distanceFactor={1.8}
          zIndexRange={[10, 0]}
        >
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className="px-2.5 py-1 rounded-md bg-zinc-950/90 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 font-semibold shadow-lg backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>VOYAGER 1 • 1 LIGHT DAY HORIZON</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 bg-black/75 px-1.5 rounded mt-0.5">
              24.00h Light Travel Time • 25.9B km
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};
