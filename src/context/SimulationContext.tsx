import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  SimulationState, 
  TrajectoryPoint, 
  MissionEvent, 
  SpacecraftId, 
  CameraFocusTarget, 
  ScaleMode,
  TourStage
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

export const CINEMATIC_TOUR_STAGES: TourStage[] = [
  {
    id: 'launch',
    title: 'Earth Departure & Launch',
    subtitle: 'Cape Canaveral SLC-41 • August 20, 1977',
    dateStr: '1977-08-20T14:29:00Z',
    timeMs: new Date('1977-08-20T14:29:00Z').getTime(),
    target: 'earth',
    craft: 'voyager2',
    durationSec: 14,
    description: 'Voyager 2 embarks on a rare once-in-176-years geometric alignment of Jupiter, Saturn, Uranus, and Neptune, launched atop a Titan IIIE-Centaur rocket into deep space.'
  },
  {
    id: 'jupiter',
    title: 'Jupiter Slingshot & Io Volcanism',
    subtitle: 'Closest Approach 277,000 km • March 5, 1979',
    dateStr: '1979-03-05T12:05:00Z',
    timeMs: new Date('1979-03-05T12:05:00Z').getTime(),
    target: 'jupiter',
    craft: 'voyager1',
    durationSec: 16,
    description: 'Voyager 1 achieves closest approach to Jupiter, discovering active sulfur volcanoes on moon Io—the first active extraterrestrial volcanism ever witnessed—and doubling probe velocity via gravity assist.'
  },
  {
    id: 'saturn',
    title: 'Saturn & Titan Closest Encounter',
    subtitle: 'Closest Approach 124,000 km • November 12, 1980',
    dateStr: '1980-11-12T23:46:00Z',
    timeMs: new Date('1980-11-12T23:46:00Z').getTime(),
    target: 'saturn',
    craft: 'voyager1',
    durationSec: 16,
    description: 'Voyager 1 skims 6,490 km over smog-shrouded moon Titan, probing its dense nitrogen atmosphere and liquid hydrocarbon potential, before slingshotting northward out of the ecliptic plane.'
  },
  {
    id: 'uranus',
    title: 'Uranus Historic Encounter',
    subtitle: 'Voyager 2 Solo Odyssey • January 24, 1986',
    dateStr: '1986-01-24T17:59:00Z',
    timeMs: new Date('1986-01-24T17:59:00Z').getTime(),
    target: 'uranus',
    craft: 'voyager2',
    durationSec: 16,
    description: 'The ONLY spacecraft in human history to visit Uranus. Voyager 2 braves the cold aquamarine realm, discovering 10 new moons, 2 rings, and an extreme 59-degree tilted magnetic field.'
  },
  {
    id: 'neptune',
    title: 'Neptune & Triton Cryovolcanoes',
    subtitle: 'Voyager 2 Solo Odyssey • August 25, 1989',
    dateStr: '1989-08-25T03:56:00Z',
    timeMs: new Date('1989-08-25T03:56:00Z').getTime(),
    target: 'neptune',
    craft: 'voyager2',
    durationSec: 16,
    description: 'Passing just 4,950 km above Neptune\'s azure atmosphere, Voyager 2 images the Great Dark Spot and discovers active liquid-nitrogen geysers on moon Triton, completing the planetary Grand Tour.'
  },
  {
    id: 'pale-blue-dot',
    title: 'The "Pale Blue Dot" Family Portrait',
    subtitle: '6.06 Billion km (40.5 AU) • February 14, 1990',
    dateStr: '1990-02-14T00:00:00Z',
    timeMs: new Date('1990-02-14T00:00:00Z').getTime(),
    target: 'voyager1',
    craft: 'voyager1',
    durationSec: 16,
    description: 'Conceived by Carl Sagan, Voyager 1 turns its cameras back across the abyss to capture Earth as a fragile speck of blue dust suspended in a sunbeam, before its cameras are turned off forever.'
  },
  {
    id: 'heliopause',
    title: 'Crossing into Interstellar Space',
    subtitle: '121.6 AU from the Sun • August 25, 2012',
    dateStr: '2012-08-25T00:00:00Z',
    timeMs: new Date('2012-08-25T00:00:00Z').getTime(),
    target: 'voyager1',
    craft: 'voyager1',
    durationSec: 16,
    description: 'Voyager 1 punches through the heliopause into true interstellar space—the first human-made artifact to leave the Sun\'s magnetic bubble, registering the roar of galactic cosmic rays.'
  },
  {
    id: 'present',
    title: 'Deep Interstellar Journey into Eternity',
    subtitle: '166+ AU from Earth • Present Day',
    dateStr: '2026-11-18T00:00:00Z',
    timeMs: new Date('2026-11-18T00:00:00Z').getTime(),
    target: 'voyager1',
    craft: 'voyager1',
    durationSec: 18,
    description: 'Continuing across the stars carrying the Golden Record, both Voyagers transmit daily telemetry back to Earth via NASA Deep Space Network, destined to outlive our solar system.'
  }
];

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

  // Dialog / Modal visibility state (suppresses 3D labels when open)
  setIsModalOpen: (open: boolean) => void;
  registerModal: (id: string, isOpen: boolean) => void;

  // Cinematic Tour Controls
  tourStages: TourStage[];
  startCinematicTour: () => void;
  stopCinematicTour: () => void;
  nextTourStage: () => void;
  prevTourStage: () => void;
  setTourStage: (index: number) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

const STORAGE_KEY = 'voyager_simulator_preferences_v1';

interface UserSavedPreferences {
  optimizationMode?: boolean;
  showVoyager1Trajectory?: boolean;
  showVoyager2Trajectory?: boolean;
  showPlanetaryOrbits?: boolean;
  showHeliosphereBoundaries?: boolean;
  showEventMarkers?: boolean;
  showCelestialLabels?: boolean;
  selectedSpacecraft?: SpacecraftId;
}

const loadPreferences = (): UserSavedPreferences => {
  try {
    if (typeof window === 'undefined') return {};
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : {};
  } catch (err) {
    return {};
  }
};

const savePreferences = (prefs: UserSavedPreferences) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    // Ignore quota or disabled storage errors
  }
};

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPrefs = useMemo(() => loadPreferences(), []);

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

  // Selection & Camera (persisted preferences)
  const [selectedSpacecraft, setSelectedSpacecraft] = useState<SpacecraftId>(
    initialPrefs.selectedSpacecraft ?? 'voyager1'
  );
  const [cameraTarget, setCameraTarget] = useState<CameraFocusTarget>('overview');
  const [isFollowingSpacecraft, setIsFollowingSpacecraft] = useState<boolean>(false);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('enhanced');

  // Optimization mode (remembered via localStorage)
  const [optimizationMode, setOptimizationMode] = useState<boolean>(
    initialPrefs.optimizationMode ?? false
  );
  const toggleOptimizationMode = useCallback(() => setOptimizationMode(o => !o), []);

  // Visual toggles (remembered via localStorage)
  const [showVoyager1Trajectory, setShowVoyager1Trajectory] = useState<boolean>(
    initialPrefs.showVoyager1Trajectory ?? true
  );
  const [showVoyager2Trajectory, setShowVoyager2Trajectory] = useState<boolean>(
    initialPrefs.showVoyager2Trajectory ?? true
  );
  const [showPlanetaryOrbits, setShowPlanetaryOrbits] = useState<boolean>(
    initialPrefs.showPlanetaryOrbits ?? true
  );
  const [showHeliosphereBoundaries, setShowHeliosphereBoundaries] = useState<boolean>(
    initialPrefs.showHeliosphereBoundaries ?? true
  );
  const [showEventMarkers, setShowEventMarkers] = useState<boolean>(
    initialPrefs.showEventMarkers ?? true
  );
  const [showCelestialLabels, setShowCelestialLabels] = useState<boolean>(
    initialPrefs.showCelestialLabels ?? true
  );
  const [selectedEvent, setSelectedEvent] = useState<MissionEvent | null>(null);

  // Automatically save preferences to localStorage whenever changed
  useEffect(() => {
    savePreferences({
      optimizationMode,
      showVoyager1Trajectory,
      showVoyager2Trajectory,
      showPlanetaryOrbits,
      showHeliosphereBoundaries,
      showEventMarkers,
      showCelestialLabels,
      selectedSpacecraft
    });
  }, [
    optimizationMode,
    showVoyager1Trajectory,
    showVoyager2Trajectory,
    showPlanetaryOrbits,
    showHeliosphereBoundaries,
    showEventMarkers,
    showCelestialLabels,
    selectedSpacecraft
  ]);

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

  // Pre-sampled static trajectory coordinate tuples (allocated ONCE upon dataset load)
  const v1SampledTuples = useMemo(() => {
    if (voyager1Data.length === 0) return [];
    const step = Math.max(1, Math.floor(voyager1Data.length / 800));
    const list: { t: number; pos: [number, number, number] }[] = [];
    for (let i = 0; i < voyager1Data.length; i += step) {
      const pt = voyager1Data[i];
      list.push({ t: pt.t, pos: [pt.x, pt.y, pt.z] });
    }
    return list;
  }, [voyager1Data]);

  const v2SampledTuples = useMemo(() => {
    if (voyager2Data.length === 0) return [];
    const step = Math.max(1, Math.floor(voyager2Data.length / 800));
    const list: { t: number; pos: [number, number, number] }[] = [];
    for (let i = 0; i < voyager2Data.length; i += step) {
      const pt = voyager2Data[i];
      list.push({ t: pt.t, pos: [pt.x, pt.y, pt.z] });
    }
    return list;
  }, [voyager2Data]);

  // Fast slice & append: reuses pre-allocated coordinate tuples with zero new vector allocations
  const v1TravelledPath = useMemo<[number, number, number][]>(() => {
    if (v1SampledTuples.length === 0 || !v1Current) return [];
    let low = 0, high = v1SampledTuples.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (v1SampledTuples[mid].t <= currentTimeMs) low = mid + 1;
      else high = mid - 1;
    }
    const pts = v1SampledTuples.slice(0, low).map(item => item.pos);
    pts.push([v1Current.x, v1Current.y, v1Current.z]);
    return pts;
  }, [v1SampledTuples, v1Current, currentTimeMs]);

  const v2TravelledPath = useMemo<[number, number, number][]>(() => {
    if (v2SampledTuples.length === 0 || !v2Current) return [];
    let low = 0, high = v2SampledTuples.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (v2SampledTuples[mid].t <= currentTimeMs) low = mid + 1;
      else high = mid - 1;
    }
    const pts = v2SampledTuples.slice(0, low).map(item => item.pos);
    pts.push([v2Current.x, v2Current.y, v2Current.z]);
    return pts;
  }, [v2SampledTuples, v2Current, currentTimeMs]);

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

  // Dialog / Modal visibility state (suppresses 3D labels when open)
  const [modalStack, setModalStack] = useState<Set<string>>(new Set());
  const [isModalOpenManual, setIsModalOpenManual] = useState<boolean>(false);

  const registerModal = useCallback((id: string, isOpen: boolean) => {
    setModalStack(prev => {
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const setIsModalOpen = useCallback((open: boolean) => {
    setIsModalOpenManual(open);
  }, []);

  const isModalOpen = modalStack.size > 0 || isModalOpenManual;

  // Cinematic Tour State
  const [isCinematicTour, setIsCinematicTour] = useState<boolean>(false);
  const [tourStageIndex, setTourStageIndex] = useState<number>(0);

  const applyTourStage = useCallback((index: number) => {
    const stage = CINEMATIC_TOUR_STAGES[index];
    if (!stage) return;
    setIsPlaying(false);
    setCurrentTimeMs(stage.timeMs);
    setSelectedSpacecraft(stage.craft);
    setCameraTarget(stage.target);
    setIsFollowingSpacecraft(stage.target === 'voyager1' || stage.target === 'voyager2');
  }, []);

  const startCinematicTour = useCallback(() => {
    setIsCinematicTour(true);
    setTourStageIndex(0);
    applyTourStage(0);
  }, [applyTourStage]);

  const stopCinematicTour = useCallback(() => {
    setIsCinematicTour(false);
  }, []);

  const setTourStage = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(CINEMATIC_TOUR_STAGES.length - 1, index));
    setTourStageIndex(clamped);
    applyTourStage(clamped);
  }, [applyTourStage]);

  const nextTourStage = useCallback(() => {
    setTourStageIndex(prev => {
      const next = (prev + 1) % CINEMATIC_TOUR_STAGES.length;
      applyTourStage(next);
      return next;
    });
  }, [applyTourStage]);

  const prevTourStage = useCallback(() => {
    setTourStageIndex(prev => {
      const next = (prev - 1 + CINEMATIC_TOUR_STAGES.length) % CINEMATIC_TOUR_STAGES.length;
      applyTourStage(next);
      return next;
    });
  }, [applyTourStage]);

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
    isModalOpen,
    setIsModalOpen,
    registerModal,
    isCinematicTour,
    tourStageIndex,
    tourStages: CINEMATIC_TOUR_STAGES,
    startCinematicTour,
    stopCinematicTour,
    nextTourStage,
    prevTourStage,
    setTourStage,
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

