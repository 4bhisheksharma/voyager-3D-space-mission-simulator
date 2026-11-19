import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SpacecraftId, TrajectoryPoint } from '../../types/simulation';
import { useSimulation } from '../../context/SimulationContext';
import { getSafeSpacecraftPosition } from '../../utils/astronomy';

interface VoyagerCraftProps {
  id: SpacecraftId;
  point: TrajectoryPoint | null;
  isSelected: boolean;
}

export const VoyagerCraft: React.FC<VoyagerCraftProps> = ({ id, point, isSelected }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    setSelectedSpacecraft, 
    setCameraTarget, 
    setIsFollowingSpacecraft, 
    showCelestialLabels, 
    cameraTarget,
    currentTimeMs,
    isModalOpen,
    isCinematicTour
  } = useSimulation();

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

  // Compute collision-safe rendered position (elevated outside Earth mesh during launch & docked at pad during pre-launch)
  const { position, isPreLaunch } = useMemo(() => {
    return getSafeSpacecraftPosition(id, point, currentTimeMs);
  }, [id, point, currentTimeMs]);

  // Orient high-gain dish back towards Earth/Sun (origin [0,0,0])
  useFrame(() => {
    if (!groupRef.current) return;
    if (isPreLaunch) {
      // Point upward from Earth surface
      groupRef.current.rotation.set(0, 0, 0);
    } else {
      groupRef.current.lookAt(0, 0, 0);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setSelectedSpacecraft(id);
    setCameraTarget(id);
    setIsFollowingSpacecraft(true);
  };

  const isFocused = cameraTarget === id;

  return (
    <group ref={groupRef} position={position}>
      {/* Fill lighting to illuminate the 3D model in deep space */}
      <pointLight color="#ffffff" intensity={2.0} distance={3} decay={1} />

      {/* 3D Spacecraft Model - visible in flight, or pre-launch only when specifically focused */}
      <group onClick={handleClick} visible={!isPreLaunch || isFocused}>
        <primitive
          object={clonedScene}
          scale={isPreLaunch ? [0.006, 0.006, 0.006] : [0.015, 0.015, 0.015]}
          rotation={[0, Math.PI, 0]}
        />

        {/* Minimal targeting ring when selected - only when in flight, never obscuring Earth pre-launch */}
        {isSelected && !isPreLaunch && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.064, 32]} />
            <meshBasicMaterial color={accentColor} side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* 
        Fixed screen-pixel label without distanceFactor:
        Never blows up when zooming in! 
        Hidden when focused on this craft, pre-launch, or when any dialog is open.
      */}
      {showCelestialLabels && !isFocused && !isPreLaunch && !isModalOpen && !isCinematicTour && (
        <Html
          position={[0, 0.08, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            onClick={handleClick}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 border border-white/10 text-zinc-300 pointer-events-auto cursor-pointer shadow-lg whitespace-nowrap"
          >
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">{name}</span>
            {isPreLaunch ? (
              <span className="text-[9px] font-mono text-emerald-400/90 font-medium">
                PRE-LAUNCH
              </span>
            ) : point && (
              <span className="text-[9px] font-mono text-zinc-400">
                {point.dist.toFixed(0)} AU
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
