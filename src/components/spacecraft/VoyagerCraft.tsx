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
  const beaconRef = useRef<THREE.Mesh>(null);
  const { setSelectedSpacecraft, setCameraTarget, setIsFollowingSpacecraft, showCelestialLabels } = useSimulation();

  // Load NASA 3D model
  const { scene } = useGLTF('/models/voyager.glb');
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const isV1 = id === 'voyager1';
  const name = isV1 ? 'Voyager 1' : 'Voyager 2';
  const primaryColor = isV1 ? '#10b981' : '#f59e0b';
  const secondaryColor = isV1 ? '#00f5d4' : '#ffbe0b';

  // Orientation: align high-gain dish back towards Earth / Sun origin
  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !point) return;

    // Pulse the beacon locator
    if (beaconRef.current) {
      const s = 1.0 + 0.25 * Math.sin(clock.getElapsedTime() * 4.0);
      beaconRef.current.scale.set(s, s, s);
    }

    // Orient dish towards origin [0,0,0] where Earth/Sun is
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
      {/* Clickable hit area and locator beacon */}
      <group onClick={handleClick}>
        {/* Detailed NASA 3D Model */}
        {/* Scale model to be visible yet proportionate */}
        <primitive
          object={clonedScene}
          scale={[0.08, 0.08, 0.08]}
          rotation={[0, Math.PI, 0]}
        />

        {/* Pulsing Locator Beacon for deep space visibility */}
        <mesh ref={beaconRef}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner core dot */}
        <mesh>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>

        {/* Target Reticle when selected */}
        {isSelected && (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.48, 32]} />
              <meshBasicMaterial color={secondaryColor} side={THREE.DoubleSide} transparent opacity={0.85} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.65, 0.67, 4]} />
              <meshBasicMaterial color={primaryColor} side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          </group>
        )}
      </group>

      {/* Real-time HTML HUD label */}
      {showCelestialLabels && (
        <Html
          position={[0, 0.5, 0]}
          center
          distanceFactor={30}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            onClick={handleClick}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded backdrop-blur-md border shadow-lg transition-all ${
              isSelected
                ? 'bg-slate-900/90 border-emerald-400/80 shadow-emerald-500/20'
                : 'bg-slate-950/80 border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider font-mono">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: primaryColor }}
              />
              <span style={{ color: primaryColor }}>{name.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-300">
              <span>{point.dist.toFixed(1)} AU</span>
              <span className="text-slate-500">|</span>
              <span>{point.speed.toFixed(1)} km/s</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
