// Small spherical-geometry helpers (degrees in, degrees out).
const R_KM = 6371;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export function distanceKm(lat1, lon1, lat2, lon2) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function bearingDeg(lat1, lon1, lat2, lon2) {
  const y = Math.sin(rad(lon2 - lon1)) * Math.cos(rad(lat2));
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lon2 - lon1));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

// Point reached after traveling distKm from (lat, lon) on the given bearing.
export function destination(lat, lon, bearing, distKm) {
  const d = distKm / R_KM;
  const b = rad(bearing);
  const p1 = rad(lat);
  const l1 = rad(lon);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [deg(p2), ((deg(l2) + 540) % 360) - 180];
}

// Point at fraction f (0..1) along the great circle between two points.
export function intermediate(lat1, lon1, lat2, lon2, f) {
  const p1 = rad(lat1), l1 = rad(lon1), p2 = rad(lat2), l2 = rad(lon2);
  const d = distanceKm(lat1, lon1, lat2, lon2) / R_KM;
  if (d === 0) return [lat1, lon1];
  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
  const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
  const z = A * Math.sin(p1) + B * Math.sin(p2);
  return [deg(Math.atan2(z, Math.hypot(x, y))), deg(Math.atan2(y, x))];
}

const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];

// Portuguese compass point for a bearing (O = oeste).
export function compassPoint(bearing) {
  return POINTS[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16];
}

export function wrapLon(lon) {
  return ((lon + 540) % 360) - 180;
}
