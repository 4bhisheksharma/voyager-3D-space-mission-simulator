export interface TrajectoryPoint {
  t: number;      // Unix timestamp in ms
  x: number;      // AU in Three.js coordinate system (Celestia Y)
  y: number;      // AU in Three.js coordinate system (Celestia Z / normal to ecliptic)
  z: number;      // AU in Three.js coordinate system (Celestia X)
  dist: number;   // Distance from Sun in AU
  speed: number;  // Velocity in km/s
}

export type SpacecraftId = 'voyager1' | 'voyager2';

export interface MissionEvent {
  id: string;
  spacecraft: SpacecraftId;
  date: string;          // ISO string
  title: string;
  short: string;
  category: 'launch' | 'encounter' | 'boundary' | 'interstellar' | 'photo' | 'milestone';
  description: string;
  targetPlanet?: string;
  encounterDistanceKm?: number;
  distanceAU: number;
}

export interface CelestialBodyData {
  id: string;
  name: string;
  radiusKm: number;
  color: string;
  emissive?: string;
  orbitRadiusAU: number;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  axialTiltDeg: number;
  rotationPeriodHours: number;
  description: string;
  textureType: 'sun' | 'earth' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'mars' | 'mercury' | 'venus';
  modelPath?: string;
  modelScaleFactor: number;
}

export type CameraFocusTarget = 
  | 'overview' 
  | 'inner_solar_system' 
  | 'sun' 
  | 'mercury'
  | 'venus'
  | 'earth' 
  | 'mars'
  | 'jupiter' 
  | 'saturn' 
  | 'uranus' 
  | 'neptune' 
  | 'voyager1' 
  | 'voyager2'
  | 'free';

export type ScaleMode = 'astronomical' | 'enhanced';

export interface TourStage {
  id: string;
  title: string;
  subtitle: string;
  dateStr: string;
  timeMs: number;
  target: CameraFocusTarget;
  craft: SpacecraftId;
  durationSec: number;
  description: string;
}

export interface SimulationState {
  // Time controls
  currentTimeMs: number;     // Current simulation date in Unix ms
  isPlaying: boolean;
  playbackSpeed: number;     // Multiplier (e.g. 86400 = 1 day per real second)
  playbackDirection: 1 | -1; // 1 = forward, -1 = reverse
  minTimeMs: number;         // 1977-08-20 (Voyager 2 launch)
  maxTimeMs: number;         // 2220-12-25 (End of dataset)
  
  // Selection & Camera
  selectedSpacecraft: SpacecraftId;
  cameraTarget: CameraFocusTarget;
  isFollowingSpacecraft: boolean;
  
  // Optimization mode (only Sun, Earth, Voyagers load 3D GLB models; others use procedural shaders)
  optimizationMode: boolean;
  
  // Visual Toggles
  showVoyager1Trajectory: boolean;
  showVoyager2Trajectory: boolean;
  showPlanetaryOrbits: boolean;
  showHeliosphereBoundaries: boolean;
  showEventMarkers: boolean;
  showCelestialLabels: boolean;
  
  // Active Event
  selectedEvent: MissionEvent | null;

  // Dialog / Modal visibility state (hides 3D labels when any dialog is open)
  isModalOpen: boolean;

  // Cinematic Tour Mode
  isCinematicTour: boolean;
  tourStageIndex: number;
}
