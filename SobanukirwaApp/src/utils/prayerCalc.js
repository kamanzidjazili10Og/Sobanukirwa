function rad(d) { return d * Math.PI / 180; }
function deg(r) { return r * 180 / Math.PI; }

function julianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunPosition(jd) {
  const T = (jd - 2451545) / 36525;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M)) + (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M));
  const lambda = 280.46646 + 36000.76983 * T + 0.0003032 * T * T + C;
  const epsilon = 23.439291 - 0.0130042 * T;
  const alpha = deg(Math.atan2(Math.cos(rad(epsilon)) * Math.sin(rad(lambda)), Math.cos(rad(lambda))));
  const declination = deg(Math.asin(Math.sin(rad(epsilon)) * Math.sin(rad(lambda))));
  const equation = (M + C) - alpha;
  return { declination, equation };
}

function hourAngle(lat, decl, angle) {
  const latRad = rad(lat), declRad = rad(decl), angleRad = rad(angle);
  const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  if (cosHA > 1 || cosHA < -1) return 0;
  return deg(Math.acos(cosHA));
}

function asrHourAngle(lat, decl, factor) {
  const latRad = rad(lat), declRad = rad(decl);
  const tanArc = Math.atan(1 / (factor + Math.tan(Math.abs(latRad - declRad))));
  const cosHA = (Math.sin(tanArc) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  if (cosHA > 1 || cosHA < -1) return 0;
  return deg(Math.acos(cosHA));
}

function formatDecimalTime(hours) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function calculatePrayerTimes(lat, lng, year, month, day) {
  const jd = julianDay(year, month, day) - lng / 360;
  const fajrAngle = 18, ishaAngle = 17;
  const result = {};
  const sun = sunPosition(jd);
  const declination = sun.declination;
  const equation = sun.equation;
  const dhuhr = 12 + (lng * 4 - equation * 4) / 60;
  result.Dhuhr = formatDecimalTime(dhuhr);
  const sunriseAngle = -0.833;
  result.Sunrise = formatDecimalTime(dhuhr - hourAngle(lat, declination, sunriseAngle) / 15);
  result.Fajr = formatDecimalTime(dhuhr - hourAngle(lat, declination, fajrAngle) / 15);
  result.Asr = formatDecimalTime(dhuhr + asrHourAngle(lat, declination, 1) / 15);
  result.Maghrib = formatDecimalTime(dhuhr + hourAngle(lat, declination, sunriseAngle) / 15);
  result.Isha = formatDecimalTime(dhuhr + hourAngle(lat, declination, ishaAngle) / 15);
  return result;
}

export function calculateQiblaDirection(lat, lng) {
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const dLng = (KAABA_LNG - lng) * (Math.PI / 180);
  const lat1 = lat * (Math.PI / 180);
  const lat2 = KAABA_LAT * (Math.PI / 180);
  const y = Math.sin(dLng);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  return (qibla + 360) % 360;
}

export function calculateKaabaDistance(lat, lng) {
  const R = 6371;
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const dLat = rad(KAABA_LAT - lat);
  const dLng = rad(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat)) * Math.cos(rad(KAABA_LAT)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
