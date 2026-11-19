import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { SpacecraftId, TrajectoryPoint, MissionEvent } from '../../types/simulation';
import { useSimulation } from '../../context/SimulationContext';
import { interpolateTrajectory } from '../../utils/astronomy';

interface TrajectoryPathProps {
  id: SpacecraftId;
  fullData: TrajectoryPoint[];
  travelledPath: [number, number, number][];
  visible: boolean;
  events: MissionEvent[];
}

export const TrajectoryPath: React.FC<TrajectoryPathProps> = ({
  id,
  fullData,
  travelledPath,
  visible,
  events
}) => {
  const { jumpToEvent, showEventMarkers, selectedEvent } = useSimulation();
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const isV1 = id === 'voyager1';
  const primaryColor = isV1 ? '#34d399' : '#fbbf24';
  const faintColor = isV1 ? '#059669' : '#d97706';

  // Full future/overall trajectory points
  const fullPoints = useMemo<[number, number, number][]>(() => {
    if (!visible || fullData.length === 0) return [];
    const pts: [number, number, number][] = [];
    const step = Math.max(1, Math.floor(fullData.length / 600));
    for (let i = 0; i < fullData.length; i += step) {
      pts.push([fullData[i].x, fullData[i].y, fullData[i].z]);
    }
    const last = fullData[fullData.length - 1];
    pts.push([last.x, last.y, last.z]);
    return pts;
  }, [visible, fullData]);

  // Event marker coordinates
  const spacecraftEvents = useMemo(() => {
    if (!visible || !showEventMarkers || fullData.length === 0) return [];

    return events
      .filter(e => e.spacecraft === id)
      .map(event => {
        const evTimeMs = new Date(event.date).getTime();
        const pt = interpolateTrajectory(fullData, evTimeMs);
        return {
          event,
          position: pt ? [pt.x, pt.y, pt.z] as [number, number, number] : null
        };
      })
      .filter((item): item is { event: MissionEvent; position: [number, number, number] } => item.position !== null);
  }, [visible, showEventMarkers, events, id, fullData]);

  if (!visible) return null;

  return (
    <group name={`trajectory-${id}`}>
      {/* 1. Full predictive trajectory guide */}
      {fullPoints.length > 1 && (
        <Line
          points={fullPoints}
          color={faintColor}
          lineWidth={1.0}
          transparent
          opacity={0.35}
        />
      )}

      {/* 2. Progressively travelled illuminated trajectory */}
      {travelledPath.length > 1 && (
        <Line
          points={travelledPath}
          color={primaryColor}
          lineWidth={2.2}
          transparent
          opacity={0.92}
        />
      )}

      {/* 3. Event markers along trajectory */}
      {showEventMarkers &&
        spacecraftEvents.map(({ event, position }) => {
          // Never render a 3D pin sphere over Earth for launch events, keeping Earth's 3D globe pristine
          const isLaunch = event.category === 'launch' || event.id.includes('launch');
          if (isLaunch) return null;

          const isSelected = selectedEvent?.id === event.id;
          const isHovered = hoveredEventId === event.id;

          return (
            <group
              key={event.id}
              position={position}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredEventId(event.id); }}
              onPointerOut={() => setHoveredEventId(null)}
            >
              {/* Sleek NASA Navigation Waypoint Pin */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToEvent(event);
                }}
              >
                <sphereGeometry args={[isSelected ? 0.007 : 0.0035, 16, 16]} />
                <meshBasicMaterial
                  color={isSelected ? '#ffffff' : primaryColor}
                />
              </mesh>

              {/* Marker Label ONLY shown on hover or when selected to prevent screen clutter */}
              {(isHovered || isSelected) && (
                <Html
                  position={[0, 0.035, 0]}
                  center
                  style={{ pointerEvents: 'auto' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToEvent(event);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? 'bg-white text-black font-semibold ring-1 ring-white'
                        : 'bg-black/90 text-zinc-200 hover:text-white border border-white/20'
                    }`}
                  >
                    <span>{event.short}</span>
                  </button>
                </Html>
              )}
            </group>
          );
        })}
    </group>
  );
};
