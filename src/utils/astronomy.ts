import { TrajectoryPoint } from '../types/simulation';

export const AU_TO_KM = 149597870.7;
export const SPEED_OF_LIGHT_KMS = 299792.458;

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

