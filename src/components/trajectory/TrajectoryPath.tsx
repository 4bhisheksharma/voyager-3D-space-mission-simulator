import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
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

  const isV1 = id === 'voyager1';
  const primaryColor = isV1 ? '#10b981' : '#f59e0b';
  const faintColor = isV1 ? '#064e3b' : '#78350f';

  // Full future/overall trajectory line (downsampled for fast rendering)
  const fullGeometry = useMemo(() => {
    if (!visible || fullData.length === 0) return null;
    const pts: THREE.Vector3[] = [];
    const step = Math.max(1, Math.floor(fullData.length / 800));
    for (let i = 0; i < fullData.length; i += step) {
      pts.push(new THREE.Vector3(fullData[i].x, fullData[i].y, fullData[i].z));
    }
    // Include the very last point
    const last = fullData[fullData.length - 1];
    pts.push(new THREE.Vector3(last.x, last.y, last.z));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [visible, fullData]);

  // Travelled path geometry (up to current simulation date)
  const travelledGeometry = useMemo(() => {
    if (!visible || travelledPath.length < 2) return null;
    const pts = travelledPath.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [visible, travelledPath]);

  // Three.js Line objects to prevent JSX SVG conflicts
  const fullLine = useMemo(() => {
    if (!fullGeometry) return null;
    const mat = new THREE.LineBasicMaterial({
      color: faintColor,
      transparent: true,
      opacity: 0.35,
      linewidth: 1
    });
    return new THREE.Line(fullGeometry, mat);
  }, [fullGeometry, faintColor]);

  const travelledLine = useMemo(() => {
    if (!travelledGeometry) return null;
    const mat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    return new THREE.Line(travelledGeometry, mat);
  }, [travelledGeometry, primaryColor]);

  // Event marker 3D coordinates along this spacecraft's trajectory
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
      {/* 1. Full historical trajectory line (faint guide) */}
      {fullLine && <primitive object={fullLine} />}

      {/* 2. Progressively travelled path (bright glowing path) */}
      {travelledLine && <primitive object={travelledLine} />}

      {/* 3. Event markers along trajectory */}
      {showEventMarkers &&
        spacecraftEvents.map(({ event, position }) => {
          const isSelected = selectedEvent?.id === event.id;
          return (
            <group key={event.id} position={position}>
              {/* 3D Pin sphere */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToEvent(event);
                }}
              >
                <sphereGeometry args={[isSelected ? 0.35 : 0.22, 16, 16]} />
                <meshBasicMaterial
                  color={isSelected ? '#38bdf8' : primaryColor}
                  wireframe={false}
                />
              </mesh>

              {/* Glowing halo ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.45, 16]} />
                <meshBasicMaterial
                  color={primaryColor}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={isSelected ? 0.9 : 0.4}
                />
              </mesh>

              {/* Marker HTML Label on hover/select */}
              <Html
                position={[0, 0.45, 0]}
                center
                distanceFactor={38}
                style={{ pointerEvents: 'auto' }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToEvent(event);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all shadow-md cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-bold ring-2 ring-sky-300'
                      : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <span className="font-semibold">{event.short}</span>
                </button>
              </Html>
            </group>
          );
        })}
    </group>
  );
};
