import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SpacecraftId, TrajectoryPoint } from '../../types/simulation';
import { useSimulation } from '../../context/SimulationContext';

interface VoyagerCraftProps {
  id: SpacecraftId;
  point: TrajectoryPoint | null;
  isSelected: boolean;
}

export const VoyagerCraft: React.FC<VoyagerCraftProps> = ({ id, point, isSelected }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { setSelectedSpacecraft, setCameraTarget, setIsFollowingSpacecraft, showCelestialLabels, cameraTarget } = useSimulation();

  // Load NASA VTAD 3D model
  const { scene } = useGLTF('/models/voyager.glb');
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const isV1 = id === 'voyager1';
  const name = isV1 ? 'Voyager 1' : 'Voyager 2';
  const accentColor = isV1 ? '#34d399' : '#fbbf24';

  // Orient high-gain dish back towards Earth/Sun (origin [0,0,0])
  useFrame(() => {
    if (!groupRef.current || !point) return;
    groupRef.current.lookAt(0, 0, 0);
  });

  if (!point) return null;

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedSpacecraft(id);
    setCameraTarget(id);
    setIsFollowingSpacecraft(true);
  };

  const isFocused = cameraTarget === id;

  return (
    <group ref={groupRef} position={[point.x, point.y, point.z]}>
      {/* Fill lighting to illuminate the 3D model in deep space */}
      <pointLight color="#ffffff" intensity={2.0} distance={3} decay={1} />

      {/* 3D Spacecraft Model - completely unobstructed */}
      <group onClick={handleClick}>
        <primitive
          object={clonedScene}
          scale={[0.015, 0.015, 0.015]}
          rotation={[0, Math.PI, 0]}
        />

        {/* Minimal targeting ring when selected */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.064, 32]} />
            <meshBasicMaterial color={accentColor} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* 
        CRITICAL FIX: 
        Notice: distanceFactor is OMITTED so label maintains a fixed, non-scaling screen pixel size!
        When the user is focused on the spacecraft (isFocused), we hide the label completely
        so it NEVER blocks the 3D model view!
      */}
      {showCelestialLabels && !isFocused && (
        <Html
          position={[0, 0.08, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            onClick={handleClick}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-slate-300 pointer-events-auto cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">{name}</span>
            <span className="text-[9px] font-mono text-slate-400">
              {point.dist.toFixed(0)} AU
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
