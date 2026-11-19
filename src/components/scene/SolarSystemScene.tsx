import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSimulation } from '../../context/SimulationContext';
import { unixMsToJulianDate } from '../../utils/astronomy';
import { CELESTIAL_BODIES } from '../../utils/celestialBodies';
import { PlanetMesh } from '../planets/PlanetMesh';
import { PlanetaryOrbits } from '../planets/PlanetaryOrbits';
import { VoyagerCraft } from '../spacecraft/VoyagerCraft';
import { TrajectoryPath } from '../trajectory/TrajectoryPath';
import { HeliosphereBoundaries } from './HeliosphereBoundaries';
import { CameraController } from './CameraController';
import { CosmicStarfield } from './CosmicStarfield';

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
    <div className="w-full h-full relative bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 35, 55], fov: 42, near: 0.005, far: 3000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#01030a']} />

        {/* 
          Astronomical Lighting:
          Subtle ambient so celestial night-sides have realistic shadow depth,
          allowing the radiant Sun point-light to create dramatic spherical 3D shading.
        */}
        <ambientLight intensity={0.14} />
        <hemisphereLight args={['#0f172a', '#020617', 0.16]} />

        {/* Orbit Controls with Free Roam, Cursor Zoom & Pan */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.07}
          minDistance={0.02}
          maxDistance={800}
          zoomSpeed={1.2}
          rotateSpeed={0.7}
          zoomToCursor={true}
          screenSpacePanning={true}
          enablePan={true}
        />

        {/* Camera lerp controller */}
        <CameraController controlsRef={controlsRef} jd={jd} />

        {/* Deep Cosmic Starfield & Nebula Atmosphere */}
        <CosmicStarfield />

        {/* Subtle Ecliptic Reference Plane */}
        <gridHelper
          args={[200, 50, '#1e293b', '#070d19']}
          position={[0, -0.005, 0]}
        />

        {/* Distance Rings & Boundaries */}
        <HeliosphereBoundaries />

        {/* Planetary Orbits */}
        <PlanetaryOrbits jd={jd} />

        {/* Sun & Planets */}
        {CELESTIAL_BODIES.map(body => (
          <PlanetMesh key={body.id} body={body} jd={jd} />
        ))}

        {/* Voyager Trajectories */}
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

        {/* Voyager 3D Spacecraft Models */}
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
