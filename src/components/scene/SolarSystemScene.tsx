import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
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
        <color attach="background" args={['#010308']} />

        {/* Ambient & Hemisphere Lighting for clean PBR material rendering */}
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#1e293b', '#020617', 0.4]} />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.07}
          minDistance={0.02}
          maxDistance={800}
          zoomSpeed={1.2}
          rotateSpeed={0.7}
        />

        {/* Camera lerp controller */}
        <CameraController controlsRef={controlsRef} jd={jd} />

        {/* Starfield */}
        <Stars
          radius={400}
          depth={100}
          count={5000}
          factor={3}
          saturation={0.2}
          fade
          speed={0.2}
        />

        {/* Subtle Ecliptic Reference Plane */}
        <gridHelper
          args={[200, 50, '#1e293b', '#0b1120']}
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
