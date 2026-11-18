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
    description: 'The G-type main-sequence star at the center of the Solar System. Its gravitational field anchors all planetary orbits and its solar wind defines the heliosphere.',
    textureType: 'sun'
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
    textureType: 'mercury'
  },
  {
    id: 'venus',
    name: 'Venus',
    radiusKm: 6051.8,
    color: '#E3BB76',
    orbitRadiusAU: 0.723,
    axialTiltDeg: 177.36,
    rotationPeriodHours: 5832.5,
    description: 'Terrestrial planet with dense CO2 atmosphere.',
    textureType: 'venus'
  },
  {
    id: 'earth',
    name: 'Earth',
    radiusKm: 6371,
    color: '#2B82C9',
    orbitRadiusAU: 1.0,
    axialTiltDeg: 23.44,
    rotationPeriodHours: 23.93,
    description: 'Home planet of humanity and the launch cradle for both Voyager 1 and Voyager 2 in August and September 1977.',
    textureType: 'earth'
  },
  {
    id: 'mars',
    name: 'Mars',
    radiusKm: 3389.5,
    color: '#D14828',
    orbitRadiusAU: 1.524,
    axialTiltDeg: 25.19,
    rotationPeriodHours: 24.62,
    description: 'The Red Planet, fourth planet from the Sun.',
    textureType: 'mars'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radiusKm: 69911,
    color: '#C88B3A',
    orbitRadiusAU: 5.203,
    axialTiltDeg: 3.13,
    rotationPeriodHours: 9.93,
    description: 'The largest planet in the Solar System. Both Voyagers utilized Jupiter’s colossal gravitational field as a slingshot to gain orbital velocity and reach the outer planets.',
    textureType: 'jupiter'
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
    description: 'Famous for its prominent ring system. Voyager 1 made a close flyby of Titan and Saturn in 1980, while Voyager 2 used Saturn’s gravity in 1981 to redirect toward Uranus and Neptune.',
    textureType: 'saturn'
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
    description: 'An ice giant with an extreme 98-degree axial tilt. Voyager 2 remains the only spacecraft ever to visit Uranus (January 1986), discovering 10 new moons and 2 new rings.',
    textureType: 'uranus'
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
    description: 'The most distant major planet in the Solar System. Voyager 2 remains the only spacecraft to explore Neptune (August 1989), flying 4,950 km above its north pole and discovering nitrogen geysers on Triton.',
    textureType: 'neptune'
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
    description: 'Circumstellar disc extending beyond Neptune populated by icy bodies, dwarf planets, and cometary nuclei.'
  },
  {
    name: 'Termination Shock',
    minAU: 84.0,
    maxAU: 94.0,
    color: '#eab308',
    description: 'The boundary where solar wind particles decelerate abruptly from supersonic (300-800 km/s) to subsonic speeds. Voyager 1 crossed in 2004; Voyager 2 crossed in 2007.'
  },
  {
    name: 'Heliosheath',
    minAU: 94.0,
    maxAU: 121.0,
    color: '#f97316',
    description: 'The turbulent outer region of the heliosphere where solar wind collides with interstellar gas.'
  },
  {
    name: 'Heliopause (Interstellar Boundary)',
    minAU: 120.0,
    maxAU: 123.0,
    color: '#ef4444',
    description: 'The outermost theoretical boundary of the heliosphere where solar pressure balances the interstellar medium. Voyager 1 entered interstellar space in 2012; Voyager 2 in 2018.'
  },
  {
    name: 'Interstellar Space',
    minAU: 123.0,
    maxAU: 1000.0,
    color: '#06b6d4',
    description: 'True interstellar space beyond the influence of the Sun’s plasma. Both probes are now actively traversing this realm.'
  }
];
