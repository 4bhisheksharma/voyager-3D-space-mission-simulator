import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { CELESTIAL_BODIES } from '../../utils/celestialBodies';
import { getPlanetOrbitCurve } from '../../utils/astronomy';
import { useSimulation } from '../../context/SimulationContext';

// High-visibility, luminous astronomical colors for solar system orbits
const ORBIT_COLORS: Record<string, string> = {
  mercury: '#cbd5e1', // Crisp bright silver
  venus: '#fde047',   // Luminous golden cream
  earth: '#38bdf8',   // Brilliant azure cyan
  mars: '#fb7185',    // Luminous coral red
  jupiter: '#f59e0b', // Majestic amber gold
  saturn: '#fef08a',  // Pale ring gold
  uranus: '#22d3ee',  // Aquamarine cyan
  neptune: '#60a5fa'  // Electric cobalt sapphire
};

export const PlanetaryOrbits: React.FC<{ jd: number }> = ({ jd }) => {
  const { showPlanetaryOrbits } = useSimulation();

  const orbitLines = useMemo(() => {
    if (!showPlanetaryOrbits) return [];

    return CELESTIAL_BODIES.filter(b => b.id !== 'sun').map(body => {
      // 240 curve segments for a buttery-smooth closed orbit
      const curvePoints = getPlanetOrbitCurve(body.id, jd, 240);
      const points = [...curvePoints, curvePoints[0]];
      const color = ORBIT_COLORS[body.id] || body.color || '#38bdf8';

      return {
        id: body.id,
        points,
        color
      };
    });
  }, [showPlanetaryOrbits, jd]);

  if (!showPlanetaryOrbits) return null;

  return (
    <group name="planetary-orbits">
      {orbitLines.map(orbit => (
        <group key={orbit.id}>
          {/* Antialiased visible orbit line with calibrated line width */}
          <Line
            points={orbit.points}
            color={orbit.color}
            lineWidth={1.5}
            transparent
            opacity={0.65}
          />
        </group>
      ))}
    </group>
  );
};
