import { CelestialBodyData } from '../types/simulation';

export const CELESTIAL_BODIES: CelestialBodyData[] = [
  {
    id: 'sun',
    name: 'Sun',
    radiusKm: 696340,
    color: '#FDB813',
    emissive: '#FF8800',
    orbitRadiusAU: 0,
    axialTiltDeg: 7.25,
    rotationPeriodHours: 609.12,
    description: 'The G-type main-sequence star at the center of the Solar System.',
    textureType: 'sun',
    modelPath: '/models/planets/sun.glb',
    modelScaleFactor: 0.005 // native radius 10.0 -> 0.05 AU
  },
  {
    id: 'mercury',
    name: 'Mercury',
    radiusKm: 2439.7,
    color: '#A5A5A5',
    orbitRadiusAU: 0.387,
    axialTiltDeg: 0.034,
    rotationPeriodHours: 1407.6,
    description: 'The smallest planet and closest to the Sun.',
    textureType: 'mercury',
    modelPath: '/models/planets/mercury.glb',
    modelScaleFactor: 0.015
  },
  {
    id: 'venus',
    name: 'Venus',
    radiusKm: 6051.8,
    color: '#E3BB76',
    orbitRadiusAU: 0.723,
    axialTiltDeg: 177.36,
    rotationPeriodHours: 5832.5,
    description: 'Terrestrial planet with dense atmosphere.',
    textureType: 'venus',
    modelPath: '/models/planets/venus.glb',
    modelScaleFactor: 0.024
  },
  {
    id: 'earth',
    name: 'Earth',
    radiusKm: 6371,
    color: '#2B82C9',
    orbitRadiusAU: 1.0,
    axialTiltDeg: 23.44,
    rotationPeriodHours: 23.93,
    description: 'Launch cradle for Voyager 1 and Voyager 2 in 1977.',
    textureType: 'earth',
    modelPath: '/models/planets/earth.glb',
    modelScaleFactor: 0.026
  },
  {
    id: 'mars',
    name: 'Mars',
    radiusKm: 3389.5,
    color: '#D14828',
    orbitRadiusAU: 1.524,
    axialTiltDeg: 25.19,
    rotationPeriodHours: 24.62,
    description: 'The fourth planet from the Sun.',
    textureType: 'mars',
    modelPath: '/models/planets/mars.glb',
    modelScaleFactor: 0.019
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radiusKm: 69911,
    color: '#C88B3A',
    orbitRadiusAU: 5.203,
    axialTiltDeg: 3.13,
    rotationPeriodHours: 9.93,
    description: 'The largest planet in the Solar System. Encountered by V1 in March 1979 and V2 in July 1979.',
    textureType: 'jupiter',
    modelPath: '/models/planets/jupitar.glb',
    modelScaleFactor: 0.068
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radiusKm: 58232,
    color: '#E4CD9E',
    orbitRadiusAU: 9.537,
    hasRings: true,
    ringInnerRadius: 1.2,
    ringOuterRadius: 2.3,
    axialTiltDeg: 26.73,
    rotationPeriodHours: 10.7,
    description: 'Ringed gas giant. Encountered by V1 in Nov 1980 and V2 in Aug 1981.',
    textureType: 'saturn',
    modelPath: '/models/planets/saturn.glb',
    modelScaleFactor: 0.058
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radiusKm: 25362,
    color: '#4b70dd',
    orbitRadiusAU: 19.19,
    hasRings: true,
    ringInnerRadius: 1.4,
    ringOuterRadius: 1.9,
    axialTiltDeg: 97.77,
    rotationPeriodHours: 17.24,
    description: 'Ice giant visited only by Voyager 2 in January 1986.',
    textureType: 'uranus',
    modelPath: '/models/planets/uranus.glb',
    modelScaleFactor: 0.00004 // native radius 1000.0 -> 0.04 AU
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radiusKm: 24622,
    color: '#274687',
    orbitRadiusAU: 30.07,
    hasRings: true,
    ringInnerRadius: 1.3,
    ringOuterRadius: 1.7,
    axialTiltDeg: 28.32,
    rotationPeriodHours: 16.11,
    description: 'Outer ice giant visited only by Voyager 2 in August 1989.',
    textureType: 'neptune',
    modelPath: '/models/planets/neptune.glb',
    modelScaleFactor: 0.040
  }
];

export interface RegionBoundary {
  name: string;
  minAU: number;
  maxAU: number;
  color: string;
  description: string;
}

export const HELIOSPHERE_REGIONS: RegionBoundary[] = [
  {
    name: 'Planetary Realm',
    minAU: 0.38,
    maxAU: 30.1,
    color: '#38bdf8',
    description: 'From Mercury out to Neptune, spanning the major planets of the Solar System.'
  },
  {
    name: 'Kuiper Belt',
    minAU: 30.0,
    maxAU: 50.0,
    color: '#a855f7',
    description: 'Circumstellar disc extending beyond Neptune populated by icy bodies and comets.'
  },
  {
    name: 'Termination Shock',
    minAU: 84.0,
    maxAU: 94.0,
    color: '#eab308',
    description: 'Boundary where supersonic solar wind abruptly decelerates to subsonic speeds.'
  },
  {
    name: 'Heliosheath',
    minAU: 94.0,
    maxAU: 121.0,
    color: '#f97316',
    description: 'Outer region of the heliosphere before the interstellar boundary.'
  },
  {
    name: 'Heliopause',
    minAU: 120.0,
    maxAU: 123.0,
    color: '#ef4444',
    description: 'Outermost boundary of the heliosphere. Voyager 1 crossed in 2012; Voyager 2 in 2018.'
  },
  {
    name: 'Interstellar Space',
    minAU: 123.0,
    maxAU: 1000.0,
    color: '#06b6d4',
    description: 'Pristine interstellar medium beyond the magnetic bubble of the Sun.'
  }
];
