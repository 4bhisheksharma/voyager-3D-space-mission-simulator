import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CELESTIAL_BODIES } from '../../utils/celestialBodies';
import { getPlanetOrbitCurve } from '../../utils/astronomy';
import { useSimulation } from '../../context/SimulationContext';

export const PlanetaryOrbits: React.FC<{ jd: number }> = ({ jd }) => {
  const { showPlanetaryOrbits } = useSimulation();

  const orbitLines = useMemo(() => {
    if (!showPlanetaryOrbits) return [];

    return CELESTIAL_BODIES.filter(b => b.id !== 'sun').map(body => {
      const curvePoints = getPlanetOrbitCurve(body.id, jd, 180);
      const points = curvePoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return {
        id: body.id,
        geometry,
        color: body.color
      };
    });
  }, [showPlanetaryOrbits, jd]);

  if (!showPlanetaryOrbits) return null;

  return (
    <group name="planetary-orbits">
      {orbitLines.map(orbit => (
        <lineLoop key={orbit.id} geometry={orbit.geometry}>
          <lineBasicMaterial
            color={orbit.color}
            transparent
            opacity={0.22}
            linewidth={1}
          />
        </lineLoop>
      ))}
    </group>
  );
};
