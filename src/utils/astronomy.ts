import { TrajectoryPoint } from '../types/simulation';

export const AU_TO_KM = 149597870.7;
export const SPEED_OF_LIGHT_KMS = 299792.458;

// 1 Light Day in metric and astronomical units
// Speed of light * 86,400 seconds = 25,902,068,371.2 km (~173.1446 AU)
export const ONE_LIGHT_DAY_KM = 86400 * SPEED_OF_LIGHT_KMS;
export const ONE_LIGHT_DAY_AU = ONE_LIGHT_DAY_KM / AU_TO_KM;
export const VOYAGER1_ONE_LIGHT_DAY_MS = Date.UTC(2026, 9, 27, 0, 0, 0); // 2026-10-27T00:00:00Z (Crossing 1 light day from Earth)

// Verified NASA historical launch timestamps
export const VOYAGER1_LAUNCH_MS = Date.UTC(1977, 8, 5, 12, 56, 0); // 1977-09-05T12:56:00Z (Cape Canaveral SLC-41)
export const VOYAGER2_LAUNCH_MS = Date.UTC(1977, 7, 20, 14, 29, 0); // 1977-08-20T14:29:00Z (Cape Canaveral SLC-41)

// NASA JPL Keplerian Elements for Approximate Positions of Major Planets (1800 - 2050 AD)
// [a0, e0, I0, L0, w_bar0, node0, a_rate, e_rate, I_rate, L_rate, w_bar_rate, node_rate]
// Rates are per Julian century (36525 days)
interface KeplerianCoefficients {
  a: number; e: number; I: number; L: number; w_bar: number; node: number;
  a_rate: number; e_rate: number; I_rate: number; L_rate: number; w_bar_rate: number; node_rate: number;
}

const PLANETARY_ELEMENTS: Record<string, KeplerianCoefficients> = {
  mercury: {
    a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.25032350, w_bar: 77.45779628, node: 48.33076593,
    a_rate: 0.00000037, e_rate: 0.00001906, I_rate: -0.00594749, L_rate: 149472.67411175, w_bar_rate: 0.16047689, node_rate: -0.12534081
  },
  venus: {
    a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.97909950, w_bar: 131.60246718, node: 76.67984255,
    a_rate: 0.00000460, e_rate: -0.00004107, I_rate: -0.00078890, L_rate: 58517.81538729, w_bar_rate: 0.00268329, node_rate: -0.27769418
  },
  earth: {
    a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, w_bar: 102.93768193, node: 0.0,
    a_rate: 0.00000562, e_rate: -0.00004392, I_rate: -0.01294668, L_rate: 35999.37244981, w_bar_rate: 0.32327364, node_rate: 0.0
  },
  mars: {
    a: 1.52371034, e: 0.09339410, I: 1.84969142, L: -4.55343205, w_bar: -23.94362959, node: 49.55953891,
    a_rate: 0.00001847, e_rate: 0.00007882, I_rate: -0.00813131, L_rate: 19140.30268499, w_bar_rate: 0.44441088, node_rate: -0.29257343
  },
  jupiter: {
    a: 5.20288700, e: 0.04838624, I: 1.30439695, L: 34.39644051, w_bar: 14.72847983, node: 100.47390909,
    a_rate: -0.00011607, e_rate: -0.00013253, I_rate: -0.00183714, L_rate: 3034.74612775, w_bar_rate: 0.21252668, node_rate: 0.20469106
  },
  saturn: {
    a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, w_bar: 92.59887831, node: 113.66242448,
    a_rate: -0.00125060, e_rate: -0.00050991, I_rate: 0.00193609, L_rate: 1222.49362201, w_bar_rate: -0.41897216, node_rate: -0.28867794
  },
  uranus: {
    a: 19.18916464, e: 0.04725744, I: 0.77263783, L: 313.23810451, w_bar: 170.95427630, node: 74.01692503,
    a_rate: -0.00196176, e_rate: -0.00004397, I_rate: -0.00242939, L_rate: 428.48202785, w_bar_rate: 0.40805280, node_rate: 0.04240589
  },
  neptune: {
    a: 30.06992276, e: 0.00859048, I: 1.77004347, L: -55.12002969, w_bar: 44.96476224, node: 131.78422574,
    a_rate: 0.00026291, e_rate: 0.00005105, I_rate: 0.00035372, L_rate: 218.45945325, w_bar_rate: -0.32241464, node_rate: -0.00508664
  }
};

/**
 * Convert Unix timestamp (milliseconds) to Julian Date.
 */
export function unixMsToJulianDate(unixMs: number): number {
  return 2440587.5 + unixMs / 86400000.0;
}

/**
 * Convert Julian Date to Unix timestamp (milliseconds).
 */
export function julianDateToUnixMs(jd: number): number {
  return (jd - 2440587.5) * 86400000.0;
}

/**
 * Compute the 3D position of a planet at a specific Julian Date.
 * Returns coordinates mapped directly into Three.js space:
 * [x, y, z] in Astronomical Units (AU).
 * Note: x = y_ecl, y = z_ecl (perpendicular to ecliptic, UP), z = x_ecl.
 */
export function getPlanetPositionAU(planetName: string, jd: number): [number, number, number] {
  const key = planetName.toLowerCase();
  if (key === 'sun') {
    return [0, 0, 0];
  }
  
  const el = PLANETARY_ELEMENTS[key];
  if (!el) {
    return [0, 0, 0];
  }

  // T: number of Julian centuries since J2000.0 (JD 2451545.0)
  const T = (jd - 2451545.0) / 36525.0;

  const a = el.a + el.a_rate * T;
  const e = el.e + el.e_rate * T;
  const I = (el.I + el.I_rate * T) * (Math.PI / 180.0);
  const L = ((el.L + el.L_rate * T) % 360.0) * (Math.PI / 180.0);
  const w_bar = ((el.w_bar + el.w_bar_rate * T) % 360.0) * (Math.PI / 180.0);
  const node = ((el.node + el.node_rate * T) % 360.0) * (Math.PI / 180.0);

  const w = w_bar - node; // Argument of perihelion
  let M = (L - w_bar) % (2.0 * Math.PI);
  if (M < 0) M += 2.0 * Math.PI;

  // Solve Kepler's equation for Eccentric Anomaly E via Newton-Raphson
  let E = M + e * Math.sin(M);
  for (let iter = 0; iter < 10; iter++) {
    const dE = (M - (E - e * Math.sin(E))) / (1.0 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-8) break;
  }

  // Position in orbital plane
  const x_prime = a * (Math.cos(E) - e);
  const y_prime = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);

  // Rotate orbital plane to J2000 Ecliptic plane
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosI = Math.cos(I);
  const sinI = Math.sin(I);

  const x_ecl = (cosW * cosNode - sinW * sinNode * cosI) * x_prime +
                (-sinW * cosNode - cosW * sinNode * cosI) * y_prime;
  const y_ecl = (cosW * sinNode + sinW * cosNode * cosI) * x_prime +
                (-sinW * sinNode + cosW * cosNode * cosI) * y_prime;
  const z_ecl = (sinW * sinI) * x_prime + (cosW * sinI) * y_prime;

  // Map into Three.js coordinates:
  // x_three = y_ecl
  // y_three = z_ecl (North ecliptic pole is UP)
  // z_three = x_ecl
  return [y_ecl, z_ecl, x_ecl];
}

/**
 * Generate a complete closed orbit curve (array of 3D AU points) for a planet.
 */
export function getPlanetOrbitCurve(planetName: string, jdReference: number, numPoints: number = 180): [number, number, number][] {
  const points: [number, number, number][] = [];
  const key = planetName.toLowerCase();
  const el = PLANETARY_ELEMENTS[key];
  if (!el) return points;

  // Approximate orbital period in years: P = a^(3/2)
  const a = el.a;
  const periodYears = Math.pow(a, 1.5);
  const periodDays = periodYears * 365.25;

  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const jd = jdReference + fraction * periodDays;
    points.push(getPlanetPositionAU(planetName, jd));
  }
  return points;
}

/**
 * Binary search to find the interpolated TrajectoryPoint at time tMs.
 */
export function interpolateTrajectory(points: TrajectoryPoint[], tMs: number): TrajectoryPoint | null {
  if (!points || points.length === 0) return null;
  if (tMs <= points[0].t) return points[0];
  if (tMs >= points[points.length - 1].t) return points[points.length - 1];

  let low = 0;
  let high = points.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (points[mid].t === tMs) {
      return points[mid];
    } else if (points[mid].t < tMs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // low is the index of the first element greater than tMs
  // high is low - 1
  const p0 = points[high];
  const p1 = points[low];

  if (!p0 || !p1) return points[0];

  const span = p1.t - p0.t;
  const alpha = span > 0 ? (tMs - p0.t) / span : 0;

  const x = p0.x + alpha * (p1.x - p0.x);
  const y = p0.y + alpha * (p1.y - p0.y);
  const z = p0.z + alpha * (p1.z - p0.z);
  const dist = p0.dist + alpha * (p1.dist - p0.dist);
  const speed = p0.speed + alpha * (p1.speed - p0.speed);

  return { t: tMs, x, y, z, dist, speed };
}

/**
 * Calculate Euclidean distance between two 3D points.
 */
export function distance3D(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate one-way light travel time for a given distance in AU.
 * Returns formatted string: e.g. "23 hrs 14 mins"
 */
export function getLightTimeFormatted(distAU: number): string {
  const distKm = distAU * AU_TO_KM;
  const totalSeconds = distKm / SPEED_OF_LIGHT_KMS;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format Mission Elapsed Time (MET) since launch.
 */
export function getMissionElapsedTime(launchDateStr: string, currentDateMs: number): string {
  const launchMs = new Date(launchDateStr).getTime();
  const diffMs = currentDateMs - launchMs;

  if (diffMs < 0) {
    return 'T-minus ' + formatDuration(Math.abs(diffMs));
  }
  return formatDuration(diffMs);
}

function formatDuration(ms: number): string {
  const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365.25);
  const days = Math.floor(totalDays % 365.25);
  return `${years}y ${days}d`;
}

/**
 * Computes the safe, scientifically accurate rendered position for Voyager 1 or 2.
 * Resolves the visual collision with Earth's mesh during launch and pre-launch periods:
 * - Pre-launch: Crafts are docked safely on Earth's surface at Cape Canaveral.
 * - Departure: Spacecraft is cleanly elevated along its hyperbolic departure escape asymptote
 *   outside Earth's visual radius (0.012 AU) to eliminate mesh clipping.
 */
export function getSafeSpacecraftPosition(
  id: 'voyager1' | 'voyager2',
  rawPt: TrajectoryPoint | null,
  currentTimeMs: number
): { position: [number, number, number]; isPreLaunch: boolean } {
  const isV1 = id === 'voyager1';
  const launchMs = isV1 ? VOYAGER1_LAUNCH_MS : VOYAGER2_LAUNCH_MS;
  const jd = unixMsToJulianDate(currentTimeMs);
  const earthPos = getPlanetPositionAU('earth', jd);
  const earthVisualRadius = 0.012; // Earth visual radius in AU

  // 1. Pre-launch state: poised at Earth launch pad (Cape Canaveral)
  if (currentTimeMs < launchMs) {
    return {
      position: [
        earthPos[0] + 0.002,
        earthPos[1] + earthVisualRadius + 0.003,
        earthPos[2] + 0.003
      ],
      isPreLaunch: true
    };
  }

  if (!rawPt) {
    return { position: earthPos, isPreLaunch: false };
  }

  // 2. Post-launch: check if still inside or too close to Earth's visual sphere
  const dx = rawPt.x - earthPos[0];
  const dy = rawPt.y - earthPos[1];
  const dz = rawPt.z - earthPos[2];
  const distToEarth = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const minClearanceAU = earthVisualRadius + 0.008; // 0.020 AU (~3 million km, clear of Earth's sphere)

  if (distToEarth < minClearanceAU) {
    // Departure vector direction (along actual escape trajectory)
    let u: [number, number, number] = [0.35, 0.2, 0.91]; // Default escape asymptote
    if (distToEarth > 0.0001) {
      u = [dx / distToEarth, dy / distToEarth, dz / distToEarth];
    }
    return {
      position: [
        earthPos[0] + u[0] * minClearanceAU,
        earthPos[1] + u[1] * minClearanceAU,
        earthPos[2] + u[2] * minClearanceAU
      ],
      isPreLaunch: false
    };
  }

  // 3. Free flight in interplanetary/interstellar space
  return {
    position: [rawPt.x, rawPt.y, rawPt.z],
    isPreLaunch: false
  };
}

export interface OneLightDayStageInfo {
  progressThreshold: number;
  distAU: number;
  lightHours: number;
  sector: string;
  subtitle: string;
  description: string;
}

export const ONE_LIGHT_DAY_STAGES: OneLightDayStageInfo[] = [
  {
    progressThreshold: 0.0,
    distAU: 0.15,
    lightHours: 0.02,
    sector: 'Solar Corona & The Sun',
    subtitle: 'Central Star (Sol) • Departure Origin (0.0 AU)',
    description: 'The journey begins at our home star. Nuclear fusion in the solar core radiates photons that will take 24 full hours to reach Voyager 1.'
  },
  {
    progressThreshold: 0.12,
    distAU: 1.00,
    lightHours: 0.138, // 8.3 minutes
    sector: 'Earth & Inner Solar System',
    subtitle: 'Earth Orbital Crossing • 8.3 Light Minutes (1.00 AU)',
    description: 'Passing the orbit of Earth. Radio signals transmitted from NASA Deep Space Network begin their 25.9-billion-kilometer race across the cosmos.'
  },
  {
    progressThreshold: 0.22,
    distAU: 2.70,
    lightHours: 0.375, // 22.5 minutes
    sector: 'The Asteroid Belt',
    subtitle: 'Main Belt Realm • 22.5 Light Minutes (2.70 AU)',
    description: 'Crossing between Mars and Jupiter through the field of rocky remnants left behind from the birth of the solar system 4.6 billion years ago.'
  },
  {
    progressThreshold: 0.35,
    distAU: 5.20,
    lightHours: 0.722, // 43.3 minutes
    sector: 'Jovian System (Jupiter)',
    subtitle: 'King of Planets • 43.3 Light Minutes (5.20 AU)',
    description: 'Passing Jupiter\'s orbit, where Voyager 1 used a powerful gravity assist in March 1979 to fling itself toward Saturn and discover volcanic activity on Io.'
  },
  {
    progressThreshold: 0.48,
    distAU: 9.54,
    lightHours: 1.325, // 1 hr 19 min
    sector: 'Cronian System (Saturn)',
    subtitle: 'Ringed Wonder • 1.32 Light Hours (9.54 AU)',
    description: 'Where Voyager 1 skimmed past moon Titan in November 1980 and slingshot northward 35 degrees out of the ecliptic plane into deep space.'
  },
  {
    progressThreshold: 0.60,
    distAU: 19.2,
    lightHours: 2.66,
    sector: 'Uranus Orbital Sphere',
    subtitle: 'Outer Gas Margin • 2.66 Light Hours (19.2 AU)',
    description: 'Climbing far above the planetary disc into the quiet outer reaches of the Sun\'s gravitational domain.'
  },
  {
    progressThreshold: 0.70,
    distAU: 30.1,
    lightHours: 4.18,
    sector: 'Neptune & Kuiper Belt Margin',
    subtitle: 'The Outermost Planet • 4.18 Light Hours (30.1 AU)',
    description: 'Passing the orbital distance of Neptune. The sunlight here is 900 times dimmer than on Earth as we enter the realm of icy dwarf planets.'
  },
  {
    progressThreshold: 0.82,
    distAU: 94.0,
    lightHours: 13.05,
    sector: 'The Termination Shock',
    subtitle: 'Solar Wind Boundary • 13.05 Light Hours (94.0 AU)',
    description: 'Voyager 1 crossed here on December 16, 2004, where the supersonic solar wind abruptly slammed into interstellar gas and slowed down to subsonic speeds.'
  },
  {
    progressThreshold: 0.90,
    distAU: 121.6,
    lightHours: 16.88,
    sector: 'The Heliopause',
    subtitle: 'Interstellar Threshold • 16.88 Light Hours (121.6 AU)',
    description: 'On August 25, 2012, Voyager 1 became the first human craft to enter interstellar space, leaving behind the magnetic bubble of the Sun.'
  },
  {
    progressThreshold: 0.98,
    distAU: 172.68,
    lightHours: 24.00,
    sector: '1 Light Day Horizon (24.00h)',
    subtitle: 'Interstellar Voyager 1 • 24 Light Hours (173.14 AU from Earth)',
    description: 'Voyager 1 reaches 1 light day from Earth. Light or radio waves traveling at 300,000 km/s take a full 24 hours to reach the spacecraft across 25.9 billion kilometers.'
  }
];

export function getOneLightDayFlightState(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  
  // Piecewise smooth interpolation across progress milestones
  let distAU = 0.15;
  for (let i = 0; i < ONE_LIGHT_DAY_STAGES.length - 1; i++) {
    const s0 = ONE_LIGHT_DAY_STAGES[i];
    const s1 = ONE_LIGHT_DAY_STAGES[i + 1];
    if (p >= s0.progressThreshold && p <= s1.progressThreshold) {
      const span = s1.progressThreshold - s0.progressThreshold;
      const t = span > 0 ? (p - s0.progressThreshold) / span : 0;
      // Smooth Hermite easing for silky speed curves
      const ease = t * t * (3 - 2 * t);
      distAU = s0.distAU + ease * (s1.distAU - s0.distAU);
      break;
    }
  }
  if (p >= ONE_LIGHT_DAY_STAGES[ONE_LIGHT_DAY_STAGES.length - 1].progressThreshold) {
    distAU = ONE_LIGHT_DAY_STAGES[ONE_LIGHT_DAY_STAGES.length - 1].distAU;
  }

  // Active sector info
  let activeStage = ONE_LIGHT_DAY_STAGES[0];
  for (let i = ONE_LIGHT_DAY_STAGES.length - 1; i >= 0; i--) {
    if (p >= ONE_LIGHT_DAY_STAGES[i].progressThreshold - 0.005) {
      activeStage = ONE_LIGHT_DAY_STAGES[i];
      break;
    }
  }

  const distKm = distAU * AU_TO_KM;
  const lightSeconds = distKm / SPEED_OF_LIGHT_KMS;
  const lightHours = lightSeconds / 3600;

  // Format light travel time
  const hrs = Math.floor(lightSeconds / 3600);
  const mins = Math.floor((lightSeconds % 3600) / 60);
  const secs = Math.floor(lightSeconds % 60);

  const formattedLightTime = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

  return {
    distAU,
    distKm,
    lightSeconds,
    lightHours,
    formattedLightTime,
    stage: activeStage
  };
}

