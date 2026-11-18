import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  SimulationState, 
  TrajectoryPoint, 
  MissionEvent, 
  SpacecraftId, 
  CameraFocusTarget, 
  ScaleMode 
} from '../types/simulation';
import { 
  interpolateTrajectory, 
  unixMsToJulianDate, 
  getPlanetPositionAU, 
  distance3D, 
  AU_TO_KM 
} from '../utils/astronomy';
import { CELESTIAL_BODIES } from '../utils/celestialBodies';

// Presets for playback speeds in simulated seconds per real second
export const SPEED_PRESETS = [
  { label: 'Realtime (1×)', value: 1 },
  { label: '1 Day/s', value: 86400 },
  { label: '7 Days/s', value: 604800 },
  { label: '1 Month/s', value: 2592000 },
  { label: '3 Months/s', value: 7776000 },
  { label: '1 Year/s', value: 31536000 },
  { label: '3 Years/s', value: 94608000 }
];

export const VOYAGER1_LAUNCH_MS = new Date('1977-09-05T12:56:00Z').getTime();
export const VOYAGER2_LAUNCH_MS = new Date('1977-08-20T14:29:00Z').getTime();
export const PRESENT_DAY_MS = new Date('2026-11-18T00:00:00Z').getTime();
export const END_MISSION_DATA_MS = new Date('2220-12-25T00:00:00Z').getTime();

interface SimulationContextType extends SimulationState {
  // Trajectory datasets
  voyager1Data: TrajectoryPoint[];
  voyager2Data: TrajectoryPoint[];
  events: MissionEvent[];
  isLoadingData: boolean;

  // Real-time calculated values
  v1Current: TrajectoryPoint | null;
  v2Current: TrajectoryPoint | null;
  v1TravelledPath: [number, number, number][];
  v2TravelledPath: [number, number, number][];
  closestPlanetV1: { name: string; distanceKm: number } | null;
  closestPlanetV2: { name: string; distanceKm: number } | null;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 1 | -1) => void;
  seekToTime: (timeMs: number) => void;
  stepDays: (days: number) => void;
  resetToStart: () => void;
  jumpToPresent: () => void;
  jumpToEvent: (event: MissionEvent) => void;
  
  // Selection and Camera controls
  setSelectedSpacecraft: (id: SpacecraftId) => void;
  setCameraTarget: (target: CameraFocusTarget) => void;
  setIsFollowingSpacecraft: (follow: boolean) => void;
  setScaleMode: (mode: ScaleMode) => void;
  
  // Optimization
  optimizationMode: boolean;
  toggleOptimizationMode: () => void;

  // Toggle visibility
  toggleVoyager1Trajectory: () => void;
  toggleVoyager2Trajectory: () => void;
  togglePlanetaryOrbits: () => void;
  toggleHeliosphereBoundaries: () => void;
  toggleEventMarkers: () => void;
  toggleCelestialLabels: () => void;
  setSelectedEvent: (event: MissionEvent | null) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Datasets
  const [voyager1Data, setVoyager1Data] = useState<TrajectoryPoint[]>([]);
  const [voyager2Data, setVoyager2Data] = useState<TrajectoryPoint[]>([]);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Time state (default start at Voyager 2 launch, 1977-08-20)
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(VOYAGER2_LAUNCH_MS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2592000); // Default 1 month / sec
  const [playbackDirection, setPlaybackDirection] = useState<1 | -1>(1);

  // Selection & Camera
  const [selectedSpacecraft, setSelectedSpacecraft] = useState<SpacecraftId>('voyager1');
  const [cameraTarget, setCameraTarget] = useState<CameraFocusTarget>('overview');
  const [isFollowingSpacecraft, setIsFollowingSpacecraft] = useState<boolean>(false);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('enhanced');

  // Optimization mode
  const [optimizationMode, setOptimizationMode] = useState<boolean>(false);
  const toggleOptimizationMode = useCallback(() => setOptimizationMode(o => !o), []);

  // Visual toggles
  const [showVoyager1Trajectory, setShowVoyager1Trajectory] = useState<boolean>(true);
  const [showVoyager2Trajectory, setShowVoyager2Trajectory] = useState<boolean>(true);
  const [showPlanetaryOrbits, setShowPlanetaryOrbits] = useState<boolean>(true);
  const [showHeliosphereBoundaries, setShowHeliosphereBoundaries] = useState<boolean>(true);
  const [showEventMarkers, setShowEventMarkers] = useState<boolean>(true);
  const [showCelestialLabels, setShowCelestialLabels] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<MissionEvent | null>(null);

  // Load telemetry datasets and mission events
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [v1Res, v2Res, evRes] = await Promise.all([
          fetch('/data/voyager1.json'),
          fetch('/data/voyager2.json'),
          fetch('/data/events.json')
        ]);
        const v1Json = await v1Res.json();
        const v2Json = await v2Res.json();
        const evJson = await evRes.json();

        if (isMounted) {
          setVoyager1Data(v1Json);
          setVoyager2Data(v2Json);
          setEvents(evJson);
          setIsLoadingData(false);
        }
      } catch (err) {
        console.error('Failed to load Voyager simulation datasets:', err);
        if (isMounted) setIsLoadingData(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Animation frame loop for continuous, smooth simulation playback
  const lastFrameTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    lastFrameTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastFrameTimeRef.current) / 1000.0;
      lastFrameTimeRef.current = now;

      // advance simulated time based on speed and direction
      const stepMs = deltaSec * playbackSpeed * 1000 * playbackDirection;
      setCurrentTimeMs(prev => {
        const next = prev + stepMs;
        if (next > END_MISSION_DATA_MS) {
          setIsPlaying(false);
          return END_MISSION_DATA_MS;
        }
        if (next < VOYAGER2_LAUNCH_MS) {
          setIsPlaying(false);
          return VOYAGER2_LAUNCH_MS;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, playbackDirection]);

  // Current interpolated spacecraft points
  const v1Current = useMemo(() => {
    if (voyager1Data.length === 0) return null;
    return interpolateTrajectory(voyager1Data, currentTimeMs);
  }, [voyager1Data, currentTimeMs]);

  const v2Current = useMemo(() => {
    if (voyager2Data.length === 0) return null;
    return interpolateTrajectory(voyager2Data, currentTimeMs);
  }, [voyager2Data, currentTimeMs]);

  // Travelled path up to current time (downsampled for fast 60fps WebGL line rendering)
  const v1TravelledPath = useMemo<[number, number, number][]>(() => {
    if (voyager1Data.length === 0 || !v1Current) return [];
    const pts: [number, number, number][] = [];
    const step = Math.max(1, Math.floor(voyager1Data.length / 1000));
    for (let i = 0; i < voyager1Data.length; i += step) {
      const pt = voyager1Data[i];
      if (pt.t > currentTimeMs) break;
      pts.push([pt.x, pt.y, pt.z]);
    }
    // Always include current exact head position
    pts.push([v1Current.x, v1Current.y, v1Current.z]);
    return pts;
  }, [voyager1Data, v1Current, currentTimeMs]);

  const v2TravelledPath = useMemo<[number, number, number][]>(() => {
    if (voyager2Data.length === 0 || !v2Current) return [];
    const pts: [number, number, number][] = [];
    const step = Math.max(1, Math.floor(voyager2Data.length / 1000));
    for (let i = 0; i < voyager2Data.length; i += step) {
      const pt = voyager2Data[i];
      if (pt.t > currentTimeMs) break;
      pts.push([pt.x, pt.y, pt.z]);
    }
    // Always include current exact head position
    pts.push([v2Current.x, v2Current.y, v2Current.z]);
    return pts;
  }, [voyager2Data, v2Current, currentTimeMs]);

  // Calculate closest planet to each spacecraft at current time
  const jd = useMemo(() => unixMsToJulianDate(currentTimeMs), [currentTimeMs]);

  const closestPlanetV1 = useMemo(() => {
    if (!v1Current) return null;
    let closest: { name: string; distanceKm: number } | null = null;
    let minAU = Infinity;
    const vPos: [number, number, number] = [v1Current.x, v1Current.y, v1Current.z];

    for (const body of CELESTIAL_BODIES) {
      if (body.id === 'sun') continue;
      const pPos = getPlanetPositionAU(body.id, jd);
      const d = distance3D(vPos, pPos);
      if (d < minAU) {
        minAU = d;
        closest = { name: body.name, distanceKm: d * AU_TO_KM };
      }
    }
    return closest;
  }, [v1Current, jd]);

  const closestPlanetV2 = useMemo(() => {
    if (!v2Current) return null;
    let closest: { name: string; distanceKm: number } | null = null;
    let minAU = Infinity;
    const vPos: [number, number, number] = [v2Current.x, v2Current.y, v2Current.z];

    for (const body of CELESTIAL_BODIES) {
      if (body.id === 'sun') continue;
      const pPos = getPlanetPositionAU(body.id, jd);
      const d = distance3D(vPos, pPos);
      if (d < minAU) {
        minAU = d;
        closest = { name: body.name, distanceKm: d * AU_TO_KM };
      }
    }
    return closest;
  }, [v2Current, jd]);

  // Actions
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  const setSpeed = useCallback((s: number) => setPlaybackSpeed(s), []);
  const setDirection = useCallback((d: 1 | -1) => setPlaybackDirection(d), []);
  
  const seekToTime = useCallback((timeMs: number) => {
    const clamped = Math.max(VOYAGER2_LAUNCH_MS, Math.min(END_MISSION_DATA_MS, timeMs));
    setCurrentTimeMs(clamped);
  }, []);

  const stepDays = useCallback((days: number) => {
    setCurrentTimeMs(prev => {
      const next = prev + days * 86400000;
      return Math.max(VOYAGER2_LAUNCH_MS, Math.min(END_MISSION_DATA_MS, next));
    });
  }, []);

  const resetToStart = useCallback(() => {
    setIsPlaying(false);
    setCurrentTimeMs(VOYAGER2_LAUNCH_MS);
    setCameraTarget('overview');
    setIsFollowingSpacecraft(false);
  }, []);

  const jumpToPresent = useCallback(() => {
    setIsPlaying(false);
    setCurrentTimeMs(PRESENT_DAY_MS);
  }, []);

  const jumpToEvent = useCallback((event: MissionEvent) => {
    const evTime = new Date(event.date).getTime();
    setCurrentTimeMs(evTime);
    setSelectedSpacecraft(event.spacecraft);
    setSelectedEvent(event);
    
    // Switch camera focus to target planet or spacecraft
    if (event.targetPlanet) {
      const pId = event.targetPlanet.toLowerCase() as CameraFocusTarget;
      setCameraTarget(pId);
      setIsFollowingSpacecraft(false);
    } else {
      setCameraTarget(event.spacecraft);
      setIsFollowingSpacecraft(true);
    }
  }, []);

  const toggleVoyager1Trajectory = useCallback(() => setShowVoyager1Trajectory(v => !v), []);
  const toggleVoyager2Trajectory = useCallback(() => setShowVoyager2Trajectory(v => !v), []);
  const togglePlanetaryOrbits = useCallback(() => setShowPlanetaryOrbits(v => !v), []);
  const toggleHeliosphereBoundaries = useCallback(() => setShowHeliosphereBoundaries(v => !v), []);
  const toggleEventMarkers = useCallback(() => setShowEventMarkers(v => !v), []);
  const toggleCelestialLabels = useCallback(() => setShowCelestialLabels(v => !v), []);

  const value = {
    voyager1Data,
    voyager2Data,
    events,
    isLoadingData,
    currentTimeMs,
    isPlaying,
    playbackSpeed,
    playbackDirection,
    minTimeMs: VOYAGER2_LAUNCH_MS,
    maxTimeMs: END_MISSION_DATA_MS,
    selectedSpacecraft,
    cameraTarget,
    isFollowingSpacecraft,
    scaleMode,
    optimizationMode,
    showVoyager1Trajectory,
    showVoyager2Trajectory,
    showPlanetaryOrbits,
    showHeliosphereBoundaries,
    showEventMarkers,
    showCelestialLabels,
    selectedEvent,
    v1Current,
    v2Current,
    v1TravelledPath,
    v2TravelledPath,
    closestPlanetV1,
    closestPlanetV2,
    play,
    pause,
    togglePlay,
    setSpeed,
    setDirection,
    seekToTime,
    stepDays,
    resetToStart,
    jumpToPresent,
    jumpToEvent,
    setSelectedSpacecraft,
    setCameraTarget,
    setIsFollowingSpacecraft,
    setScaleMode,
    toggleVoyager1Trajectory,
    toggleVoyager2Trajectory,
    togglePlanetaryOrbits,
    toggleHeliosphereBoundaries,
    toggleEventMarkers,
    toggleCelestialLabels,
    toggleOptimizationMode,
    setSelectedEvent
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

