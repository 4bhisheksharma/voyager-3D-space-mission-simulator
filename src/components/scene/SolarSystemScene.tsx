import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { unixMsToJulianDate } from '../../utils/astronomy';
import { CELESTIAL_BODIES } from '../../utils/celestialBodies';
import { PlanetMesh } from '../planets/PlanetMesh';
import { PlanetaryOrbits } from '../planets/PlanetaryOrbits';
import { VoyagerCraft } from '../spacecraft/VoyagerCraft';
import { TrajectoryPath } from '../trajectory/TrajectoryPath';
import { HeliosphereBoundaries } from './HeliosphereBoundaries';
import { CameraController } from './CameraController';

export const SolarSystemScene: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const {
    currentTimeMs,
    voyager1Data,
    voyager2Data,
    v1Current,
    v2Current,
    v1TravelledPath,
    v2TravelledPath,
    showVoyager1Trajectory,
    showVoyager2Trajectory,
    selectedSpacecraft,
    events
  } = useSimulation();

  const jd = useMemo(() => unixMsToJulianDate(currentTimeMs), [currentTimeMs]);

  return (
    <div className="w-full h-full relative bg-[#020617] overflow-hidden">
      <Canvas
        camera={{ position: [0, 50, 75], fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#020617']} />

        {/* Ambient lighting for space visibility */}
        <ambientLight intensity={0.25} />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={0.5}
          maxDistance={1200}
          zoomSpeed={1.2}
          rotateSpeed={0.8}
        />

        {/* Camera lerp controller */}
        <CameraController controlsRef={controlsRef} jd={jd} />

        {/* Deep space starfield */}
        <Stars
          radius={500}
          depth={150}
          count={7000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />

        {/* Ecliptic Plane Grid (subtle cosmic reference) */}
        <gridHelper
          args={[300, 60, '#1e293b', '#0f172a']}
          position={[0, -0.01, 0]}
        />

        {/* Concentric Distance Rings & Heliosphere Boundary Shells */}
        <HeliosphereBoundaries />

        {/* Planetary Orbits (ellipses) */}
        <PlanetaryOrbits jd={jd} />

        {/* Sun and Planets */}
        {CELESTIAL_BODIES.map(body => (
          <PlanetMesh key={body.id} body={body} jd={jd} />
        ))}

        {/* Voyager 1 & 2 Trajectories */}
        <TrajectoryPath
          id="voyager1"
          fullData={voyager1Data}
          travelledPath={v1TravelledPath}
          visible={showVoyager1Trajectory}
          events={events}
        />

        <TrajectoryPath
          id="voyager2"
          fullData={voyager2Data}
          travelledPath={v2TravelledPath}
          visible={showVoyager2Trajectory}
          events={events}
        />

        {/* Voyager Spacecraft 3D Models */}
        {showVoyager1Trajectory && (
          <VoyagerCraft
            id="voyager1"
            point={v1Current}
            isSelected={selectedSpacecraft === 'voyager1'}
          />
        )}

        {showVoyager2Trajectory && (
          <VoyagerCraft
            id="voyager2"
            point={v2Current}
            isSelected={selectedSpacecraft === 'voyager2'}
          />
        )}
      </Canvas>
    </div>
  );
};

