// Core astronomical calculation library
// Ported from the Python Streamlit app with improvements

export interface CelestialPosition {
  longitude: number;
  latitude?: number;
  distance?: number;
  constellation?: string;
}

export interface MoonPhaseData {
  phase: number; // 0-1
  illumination: number;
  phaseName: string;
  emoji: string;
  age: number; // days
}

export interface PlanetVisibility {
  name: string;
  altitude: number;
  azimuth: number;
  visible: boolean;
  magnitude: number;
  constellation: string;
  riseTime?: string;
  setTime?: string;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  civilDawn: Date;
  civilDusk: Date;
  nauticalDawn: Date;
  nauticalDusk: Date;
  astronomicalDawn: Date;
  astronomicalDusk: Date;
  solarNoon: Date;
  dayLength: number; // hours
}

// Convert date to Julian Day Number
export function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    d +
    B -
    1524.5
  );
}

// Normalize angle to 0-360
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Radians to degrees
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Calculate Lahiri Ayanamsa for a given year
export function getLahiriAyanamsa(year: number): number {
  return 23.856 + (year - 2000) * 0.01397;
}

// Calculate Sun's ecliptic longitude
export function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = normalizeAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = toRad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  return normalizeAngle(L0 + C);
}

// Calculate Moon's ecliptic longitude (simplified)
export function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalizeAngle(
    218.3165 + 481267.8813 * T
  );
  const D = normalizeAngle(
    297.8502 + 445267.1115 * T
  );
  const M = normalizeAngle(
    357.5291 + 35999.0503 * T
  );
  const Mp = normalizeAngle(
    134.9634 + 477198.8676 * T
  );
  const F = normalizeAngle(
    93.272 + 483202.0175 * T
  );

  let lon = L;
  lon += 6.289 * Math.sin(toRad(Mp));
  lon += 1.274 * Math.sin(toRad(2 * D - Mp));
  lon += 0.658 * Math.sin(toRad(2 * D));
  lon += 0.214 * Math.sin(toRad(2 * Mp));
  lon -= 0.186 * Math.sin(toRad(M));
  lon -= 0.114 * Math.sin(toRad(2 * F));

  return normalizeAngle(lon);
}

// Calculate moon phase
export function getMoonPhase(date: Date): MoonPhaseData {
  const jd = toJulianDay(date);
  const sunLon = getSunLongitude(jd);
  const moonLon = getMoonLongitude(jd);
  let elongation = normalizeAngle(moonLon - sunLon);
  const phase = elongation / 360;
  const illumination = (1 - Math.cos(toRad(elongation))) / 2;

  // Synodic month ~29.53 days
  const age = phase * 29.53;

  let phaseName: string;
  let emoji: string;

  if (phase < 0.0625) {
    phaseName = "New Moon";
    emoji = "🌑";
  } else if (phase < 0.1875) {
    phaseName = "Waxing Crescent";
    emoji = "🌒";
  } else if (phase < 0.3125) {
    phaseName = "First Quarter";
    emoji = "🌓";
  } else if (phase < 0.4375) {
    phaseName = "Waxing Gibbous";
    emoji = "🌔";
  } else if (phase < 0.5625) {
    phaseName = "Full Moon";
    emoji = "🌕";
  } else if (phase < 0.6875) {
    phaseName = "Waning Gibbous";
    emoji = "🌖";
  } else if (phase < 0.8125) {
    phaseName = "Last Quarter";
    emoji = "🌗";
  } else if (phase < 0.9375) {
    phaseName = "Waning Crescent";
    emoji = "🌘";
  } else {
    phaseName = "New Moon";
    emoji = "🌑";
  }

  return { phase, illumination, phaseName, emoji, age };
}

// Get planetary longitude (simplified Keplerian elements)
export function getPlanetLongitude(
  planetName: string,
  jd: number
): number {
  const T = (jd - 2451545.0) / 36525.0;
  const dayOfYear = (jd - 2451545.0);

  const periods: Record<string, number> = {
    Mercury: 87.969,
    Venus: 224.701,
    Mars: 686.98,
    Jupiter: 4332.59,
    Saturn: 10759.22,
  };

  const offsets: Record<string, number> = {
    Mercury: 174.796,
    Venus: 50.416,
    Mars: 19.373,
    Jupiter: 20.02,
    Saturn: 317.02,
  };

  const period = periods[planetName] || 365.25;
  const offset = offsets[planetName] || 0;

  return normalizeAngle(offset + (360 / period) * dayOfYear);
}

// Determine zodiac sign from ecliptic longitude
export function getZodiacSign(longitude: number): {
  sign: string;
  symbol: string;
  element: string;
  degree: number;
} {
  const signs = [
    { sign: "Aries", symbol: "♈", element: "Fire" },
    { sign: "Taurus", symbol: "♉", element: "Earth" },
    { sign: "Gemini", symbol: "♊", element: "Air" },
    { sign: "Cancer", symbol: "♋", element: "Water" },
    { sign: "Leo", symbol: "♌", element: "Fire" },
    { sign: "Virgo", symbol: "♍", element: "Earth" },
    { sign: "Libra", symbol: "♎", element: "Air" },
    { sign: "Scorpio", symbol: "♏", element: "Water" },
    { sign: "Sagittarius", symbol: "♐", element: "Fire" },
    { sign: "Capricorn", symbol: "♑", element: "Earth" },
    { sign: "Aquarius", symbol: "♒", element: "Air" },
    { sign: "Pisces", symbol: "♓", element: "Water" },
  ];

  const normalLon = normalizeAngle(longitude);
  const idx = Math.floor(normalLon / 30);
  const degree = normalLon % 30;

  return { ...signs[idx], degree };
}

// Calculate altitude of a celestial object
export function calculateAltitude(
  declination: number,
  latitude: number,
  hourAngle: number
): number {
  const decRad = toRad(declination);
  const latRad = toRad(latitude);
  const haRad = toRad(hourAngle);

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);

  return toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));
}

// Calculate sun times for a given date and location
export function calculateSunTimes(
  date: Date,
  latitude: number,
  longitude: number
): SunTimes {
  const jd = toJulianDay(date);
  const n = jd - 2451545.0 + 0.0008;
  const Jstar = n - longitude / 360;
  const M = normalizeAngle(357.5291 + 0.98560028 * Jstar);
  const Mrad = toRad(M);
  const C =
    1.9148 * Math.sin(Mrad) +
    0.02 * Math.sin(2 * Mrad) +
    0.0003 * Math.sin(3 * Mrad);
  const lambda = normalizeAngle(M + C + 180 + 102.9372);
  const lambdaRad = toRad(lambda);

  const sinDec = Math.sin(lambdaRad) * Math.sin(toRad(23.44));
  const cosDec = Math.cos(Math.asin(sinDec));
  const declination = toDeg(Math.asin(sinDec));

  const Jtransit =
    2451545.0 +
    Jstar +
    0.0053 * Math.sin(Mrad) -
    0.0069 * Math.sin(2 * lambdaRad);

  function getHourAngle(elevation: number): number {
    const latRad = toRad(latitude);
    const cosH =
      (Math.sin(toRad(elevation)) - Math.sin(latRad) * sinDec) /
      (Math.cos(latRad) * cosDec);
    if (cosH > 1 || cosH < -1) return NaN;
    return toDeg(Math.acos(cosH));
  }

  const sunriseHA = getHourAngle(-0.833);
  const civilHA = getHourAngle(-6);
  const nauticalHA = getHourAngle(-12);
  const astroHA = getHourAngle(-18);

  function jdToDate(jdVal: number): Date {
    const d = new Date((jdVal - 2440587.5) * 86400000);
    return d;
  }

  const solarNoonJD = Jtransit;
  const sunriseJD = Jtransit - sunriseHA / 360;
  const sunsetJD = Jtransit + sunriseHA / 360;

  return {
    sunrise: jdToDate(sunriseJD),
    sunset: jdToDate(sunsetJD),
    civilDawn: jdToDate(Jtransit - civilHA / 360),
    civilDusk: jdToDate(Jtransit + civilHA / 360),
    nauticalDawn: jdToDate(Jtransit - nauticalHA / 360),
    nauticalDusk: jdToDate(Jtransit + nauticalHA / 360),
    astronomicalDawn: jdToDate(Jtransit - astroHA / 360),
    astronomicalDusk: jdToDate(Jtransit + astroHA / 360),
    solarNoon: jdToDate(solarNoonJD),
    dayLength: (2 * sunriseHA) / 15,
  };
}

// Calculate light travel time to a celestial object
export function lightTravelTime(distanceLightYears: number): {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  description: string;
} {
  const totalSeconds = distanceLightYears * 365.25 * 24 * 3600;
  const years = Math.floor(distanceLightYears);
  const remainingDays = (distanceLightYears - years) * 365.25;
  const days = Math.floor(remainingDays);
  const remainingHours = (remainingDays - days) * 24;
  const hours = Math.floor(remainingHours);
  const remainingMinutes = (remainingHours - hours) * 60;
  const minutes = Math.floor(remainingMinutes);
  const seconds = Math.floor((remainingMinutes - minutes) * 60);

  let description: string;
  if (distanceLightYears < 0.0001) {
    description = `${(distanceLightYears * 365.25 * 24 * 60).toFixed(1)} light-minutes`;
  } else if (distanceLightYears < 0.01) {
    description = `${(distanceLightYears * 365.25 * 24).toFixed(1)} light-hours`;
  } else if (distanceLightYears < 1) {
    description = `${(distanceLightYears * 365.25).toFixed(0)} light-days`;
  } else if (distanceLightYears < 1000) {
    description = `${distanceLightYears.toFixed(1)} light-years`;
  } else if (distanceLightYears < 1000000) {
    description = `${(distanceLightYears / 1000).toFixed(1)} thousand light-years`;
  } else {
    description = `${(distanceLightYears / 1000000).toFixed(1)} million light-years`;
  }

  return { years, days, hours, minutes, seconds, description };
}

// Generate a procedural exoplanet
export function generateExoplanet(seed: number): {
  name: string;
  starType: string;
  starTemp: number;
  orbitalPeriod: number;
  radius: number;
  mass: number;
  equilibriumTemp: number;
  distance: number;
  type: string;
  habitable: boolean;
  atmosphere: string[];
} {
  // Seeded pseudo-random
  function seededRandom(): number {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const starTypes = [
    { type: "M", prob: 0.76, temp: [2400, 3700] },
    { type: "K", prob: 0.12, temp: [3700, 5200] },
    { type: "G", prob: 0.08, temp: [5200, 6000] },
    { type: "F", prob: 0.03, temp: [6000, 7500] },
    { type: "A", prob: 0.01, temp: [7500, 10000] },
  ];

  let r = seededRandom();
  let cumProb = 0;
  let star = starTypes[0];
  for (const st of starTypes) {
    cumProb += st.prob;
    if (r < cumProb) {
      star = st;
      break;
    }
  }

  const starTemp =
    star.temp[0] + seededRandom() * (star.temp[1] - star.temp[0]);
  const orbitalPeriod = Math.exp(
    seededRandom() * 8 + 0.5
  ); // 1.6 to ~3000 days
  const radius = seededRandom() < 0.6
    ? 0.5 + seededRandom() * 3 // super-Earth range
    : 3 + seededRandom() * 20; // gas giant range
  const mass =
    radius < 2
      ? Math.pow(radius, 3.5) * (0.5 + seededRandom())
      : Math.pow(radius, 2) * (0.5 + seededRandom() * 2);
  const distance = Math.exp(seededRandom() * 6 + 3); // 20 to ~8000 ly

  // Equilibrium temperature from star temp and orbital period
  const luminosity = Math.pow(starTemp / 5778, 4);
  const sma = Math.pow(orbitalPeriod / 365.25, 2 / 3) * Math.pow(luminosity, 0.25);
  const eqTemp = starTemp * Math.pow(luminosity, 0.25) / Math.pow(sma * 2, 0.5) * 0.25;

  const habitable = eqTemp > 200 && eqTemp < 320 && radius < 2.5;

  let type: string;
  if (radius < 1) type = "Sub-Earth";
  else if (radius < 1.6) type = "Earth-like";
  else if (radius < 2.5) type = "Super-Earth";
  else if (radius < 6) type = "Mini-Neptune";
  else if (radius < 15) type = "Neptune-like";
  else type = "Gas Giant";

  const atmosphere: string[] = [];
  if (type === "Earth-like" || type === "Super-Earth") {
    if (seededRandom() > 0.3) atmosphere.push("N2");
    if (seededRandom() > 0.4) atmosphere.push("CO2");
    if (seededRandom() > 0.5) atmosphere.push("H2O");
    if (habitable && seededRandom() > 0.7) atmosphere.push("O2");
  } else if (type === "Gas Giant" || type === "Neptune-like" || type === "Mini-Neptune") {
    atmosphere.push("H2", "He");
    if (seededRandom() > 0.5) atmosphere.push("CH4");
    if (seededRandom() > 0.7) atmosphere.push("NH3");
  }

  const prefixes = ["Kepler", "TOI", "K2", "TRAPPIST", "HD", "GJ", "WASP", "HAT-P"];
  const prefix = prefixes[Math.floor(seededRandom() * prefixes.length)];
  const num = Math.floor(seededRandom() * 9000) + 100;
  const letter = String.fromCharCode(98 + Math.floor(seededRandom() * 5));
  const name = `${prefix}-${num}${letter}`;

  return {
    name,
    starType: star.type,
    starTemp: Math.round(starTemp),
    orbitalPeriod: Math.round(orbitalPeriod * 10) / 10,
    radius: Math.round(radius * 100) / 100,
    mass: Math.round(mass * 100) / 100,
    equilibriumTemp: Math.round(eqTemp),
    distance: Math.round(distance),
    type,
    habitable,
    atmosphere,
  };
}

// Calculate constellation for a given ecliptic longitude (simplified)
export function getConstellation(longitude: number): string {
  const constellations = [
    { name: "Pisces", start: 0 },
    { name: "Aries", start: 25 },
    { name: "Taurus", start: 50 },
    { name: "Gemini", start: 90 },
    { name: "Cancer", start: 120 },
    { name: "Leo", start: 140 },
    { name: "Virgo", start: 175 },
    { name: "Libra", start: 215 },
    { name: "Scorpius", start: 240 },
    { name: "Sagittarius", start: 265 },
    { name: "Capricornus", start: 300 },
    { name: "Aquarius", start: 330 },
  ];

  const lon = normalizeAngle(longitude);
  for (let i = constellations.length - 1; i >= 0; i--) {
    if (lon >= constellations[i].start) return constellations[i].name;
  }
  return "Pisces";
}

// Format time nicely
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Format date nicely
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
