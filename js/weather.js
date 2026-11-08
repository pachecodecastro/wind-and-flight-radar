// Weather data: live grid from Open-Meteo, or a synthetic demo field when the API
// cannot be reached (offline, blocked, or rate limited).
import { makeGrid, gridBounds } from './field.js';
import { wrapLon } from './geo.js';

const API = 'https://api.open-meteo.com/v1/forecast';
const CHUNK = 100; // locations per request, keeps URLs comfortably short

async function fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function forecastUrl(lats, lons, hours) {
  const params = new URLSearchParams({
    latitude: lats.join(','),
    longitude: lons.join(','),
    hourly: 'temperature_2m,wind_speed_10m,wind_direction_10m',
    forecast_hours: String(hours),
    wind_speed_unit: 'kmh',
    timeformat: 'unixtime',
    timezone: 'GMT',
    cell_selection: 'nearest',
  });
  return `${API}?${params}`;
}

async function fetchLocations(lats, lons, cfg) {
  const requests = [];
  for (let i = 0; i < lats.length; i += CHUNK) {
    const url = forecastUrl(lats.slice(i, i + CHUNK), lons.slice(i, i + CHUNK), cfg.forecastHours);
    requests.push(fetchJson(url, cfg.requestTimeoutMs));
  }
  const parts = await Promise.all(requests);
  // A single location comes back as an object, several as an array.
  return parts.flatMap((p) => (Array.isArray(p) ? p : [p]));
}

function toUV(speed, dirFrom) {
  if (speed == null || dirFrom == null) return [NaN, NaN];
  const r = (dirFrom * Math.PI) / 180;
  return [-speed * Math.sin(r), -speed * Math.cos(r)];
}

export async function fetchLiveField(bounds, cfg) {
  const grid = makeGrid(bounds, cfg.maxGridPoints);
  const lats = [];
  const lons = [];
  for (let j = 0; j < grid.ny; j++) {
    for (let i = 0; i < grid.nx; i++) {
      lats.push(+(grid.lat0 + j * grid.step).toFixed(3));
      lons.push(+wrapLon(grid.lon0 + i * grid.step).toFixed(3));
    }
  }
  const results = await fetchLocations(lats, lons, cfg);
  if (results.length !== lats.length) throw new Error('Incomplete grid response');

  const times = results[0].hourly.time.map((s) => s * 1000);
  const n = grid.nx * grid.ny;
  const u = [], v = [], temp = [];
  for (let t = 0; t < times.length; t++) {
    u.push(new Float32Array(n));
    v.push(new Float32Array(n));
    temp.push(new Float32Array(n));
  }
  results.forEach((r, idx) => {
    const h = r.hourly;
    for (let t = 0; t < times.length; t++) {
      const [uu, vv] = toUV(h.wind_speed_10m[t], h.wind_direction_10m[t]);
      u[t][idx] = uu;
      v[t][idx] = vv;
      temp[t][idx] = h.temperature_2m[t] ?? NaN;
    }
  });
  return { source: 'live', grid, bounds: gridBounds(grid), times, u, v, temp };
}

// Point forecasts for the labelled cities (one small request).
export async function fetchCityForecasts(cities, cfg) {
  const results = await fetchLocations(cities.map((c) => c.lat), cities.map((c) => c.lon), cfg);
  return results.map((r) => ({
    times: r.hourly.time.map((s) => s * 1000),
    temp: r.hourly.temperature_2m,
    speed: r.hourly.wind_speed_10m,
    dir: r.hourly.wind_direction_10m,
  }));
}

// ---------------------------------------------------------------------------
// Demo field: an Atlantic low tracking towards the Bay of Biscay, westerlies
// to the north, trade winds to the south and a plausible November temperature
// gradient. Used only when live data is unavailable, and labelled as such.

function demoWind(lat, lon, h) {
  const k = h / 47;
  const cLat = 42.5 + 5.5 * k;
  const cLon = -24 + 17 * k;
  const coslat = Math.cos((lat * Math.PI) / 180);
  const dx = (lon - cLon) * coslat;
  const dy = lat - cLat;
  const r = Math.hypot(dx, dy) + 1e-6;
  const R = 3.2;
  const vMax = 92;
  let vt = r < R ? (vMax * r) / R : vMax * Math.pow(R / r, 0.72);
  vt *= Math.exp(-((r / 22) ** 2));
  const inflow = 0.32;
  // Counter-clockwise circulation (northern hemisphere) with inflow.
  let u = vt * (-dy / r - (inflow * dx) / r);
  let v = vt * (dx / r - (inflow * dy) / r);

  const west = 30 * Math.exp(-(((lat - 50) / 8) ** 2));
  const tradeW = Math.exp(-(((lat - 24) / 7) ** 2));
  u += west - 20 * tradeW;
  v += -13 * tradeW;

  u += 7 * Math.sin(lon * 0.31 + h * 0.09) * Math.cos(lat * 0.43);
  v += 6 * Math.cos(lon * 0.27 - h * 0.07) * Math.sin(lat * 0.38 + 1.3);
  return [u, v, cLat, cLon];
}

function demoTemp(lat, lon, h, cLat, cLon, startHourUtc) {
  let t = 23 - 0.55 * (lat - 28);
  const ex = lon - (cLon + 6);
  const ey = lat - (cLat - 3);
  t += 3.2 * Math.exp(-(ex * ex + ey * ey) / 45);
  const wx = lon - (cLon - 6);
  const wy = lat - (cLat - 2);
  t -= 2.6 * Math.exp(-(wx * wx + wy * wy) / 40);
  const hourUtc = (startHourUtc + h) % 24;
  const localSolar = (hourUtc + lon / 15 + 24) % 24;
  t += 2.4 * Math.sin(((localSolar - 9) / 24) * 2 * Math.PI);
  return t;
}

export function makeDemoField(bounds, cfg) {
  const grid = makeGrid(bounds, 1200);
  const start = new Date();
  start.setUTCMinutes(0, 0, 0);
  const hours = cfg.forecastHours;
  const times = [];
  const n = grid.nx * grid.ny;
  const u = [], v = [], temp = [];
  for (let h = 0; h < hours; h++) {
    times.push(start.getTime() + h * 3600e3);
    const U = new Float32Array(n), V = new Float32Array(n), T = new Float32Array(n);
    for (let j = 0; j < grid.ny; j++) {
      const lat = grid.lat0 + j * grid.step;
      for (let i = 0; i < grid.nx; i++) {
        const lon = grid.lon0 + i * grid.step;
        const k = j * grid.nx + i;
        const [uu, vv, cLat, cLon] = demoWind(lat, lon, h);
        U[k] = uu;
        V[k] = vv;
        T[k] = demoTemp(lat, lon, h, cLat, cLon, start.getUTCHours());
      }
    }
    u.push(U); v.push(V); temp.push(T);
  }
  return { source: 'demo', grid, bounds: gridBounds(grid), times, u, v, temp };
}
