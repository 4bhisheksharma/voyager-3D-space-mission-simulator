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
  const { setSelectedSpacecraft, setCameraTarget, setIsFollowingSpacecraft, showCelestialLabels } = useSimulation();

  // Load NASA VTAD 3D model
  const { scene } = useGLTF('/models/voyager.glb');
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Enable shadows and ensure materials react to lighting
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

  // Orient high-gain antenna back towards Earth/Sun (origin [0,0,0])
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

  return (
    <group ref={groupRef} position={[point.x, point.y, point.z]}>
      {/* Spacecraft fill lighting to ensure PBR materials are clearly visible in deep space */}
      <pointLight color="#ffffff" intensity={1.5} distance={2} decay={1} />

      {/* 3D Spacecraft Model - completely unobstructed (no spheres covering it!) */}
      <group onClick={handleClick} className="cursor-pointer">
        <primitive
          object={clonedScene}
          scale={[0.015, 0.015, 0.015]}
          rotation={[0, Math.PI, 0]}
        />

        {/* Minimal targeting ring visible only when selected */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.085, 32]} />
            <meshBasicMaterial color={accentColor} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Sleek, Minimal Monospace HUD Tag */}
      {showCelestialLabels && (
        <Html
          position={[0, 0.1, 0]}
          center
          distanceFactor={18}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            onClick={handleClick}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded backdrop-blur-xs border transition-all pointer-events-auto cursor-pointer ${
              isSelected
                ? 'bg-black/90 border-white/30 text-white shadow-sm'
                : 'bg-black/75 border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">{name}</span>
            <span className="text-[9px] font-mono text-slate-400">
              {point.dist.toFixed(1)} AU
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
