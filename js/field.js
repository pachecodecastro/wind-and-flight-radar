// A regular lat/lon grid holding hourly wind (u, v in km/h) and temperature (°C).
//
// field = {
//   source: 'live' | 'demo',
//   grid:   { lat0, lon0, step, nx, ny },
//   times:  [ms, ...]                      one entry per hour
//   u, v, temp: [Float32Array(nx*ny), ...] one array per hour, row-major from (lat0, lon0)
// }

const STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8];

// Pick the finest grid step that keeps the point count under maxPoints.
export function makeGrid(bounds, maxPoints) {
  const south = Math.max(-80, bounds.south);
  const north = Math.min(80, bounds.north);
  const west = bounds.west;
  const east = bounds.east;
  let step = STEPS[STEPS.length - 1];
  for (const s of STEPS) {
    const nx = Math.ceil((east - west) / s) + 2;
    const ny = Math.ceil((north - south) / s) + 2;
    if (nx * ny <= maxPoints) { step = s; break; }
  }
  const lat0 = Math.floor(south / step) * step;
  const lon0 = Math.floor(west / step) * step;
  const ny = Math.ceil((north - lat0) / step) + 1;
  const nx = Math.ceil((east - lon0) / step) + 1;
  return { lat0, lon0, step, nx, ny };
}

export function gridBounds(grid) {
  return {
    south: grid.lat0,
    west: grid.lon0,
    north: grid.lat0 + (grid.ny - 1) * grid.step,
    east: grid.lon0 + (grid.nx - 1) * grid.step,
  };
}

// Bilinear in space, linear in time. Writes [u, v, temp] into out and returns
// true, or returns false when the point is outside the grid or has no data.
export function sampleInto(field, lat, lon, t, out) {
  const g = field.grid;
  const fx = (lon - g.lon0) / g.step;
  const fy = (lat - g.lat0) / g.step;
  if (fx < 0 || fy < 0 || fx > g.nx - 1 || fy > g.ny - 1) return false;
  const x0 = Math.min(g.nx - 2, Math.floor(fx));
  const y0 = Math.min(g.ny - 2, Math.floor(fy));
  const dx = fx - x0;
  const dy = fy - y0;
  const i00 = y0 * g.nx + x0;
  const i10 = i00 + 1;
  const i01 = i00 + g.nx;
  const i11 = i01 + 1;
  const w00 = (1 - dx) * (1 - dy);
  const w10 = dx * (1 - dy);
  const w01 = (1 - dx) * dy;
  const w11 = dx * dy;

  const last = field.times.length - 1;
  const tc = t < 0 ? 0 : t > last ? last : t;
  const t0 = Math.floor(tc);
  const t1 = Math.min(last, t0 + 1);
  const ft = tc - t0;

  const U0 = field.u[t0], V0 = field.v[t0], T0 = field.temp[t0];
  const U1 = field.u[t1], V1 = field.v[t1], T1 = field.temp[t1];

  const u = (1 - ft) * (U0[i00] * w00 + U0[i10] * w10 + U0[i01] * w01 + U0[i11] * w11) +
    ft * (U1[i00] * w00 + U1[i10] * w10 + U1[i01] * w01 + U1[i11] * w11);
  const v = (1 - ft) * (V0[i00] * w00 + V0[i10] * w10 + V0[i01] * w01 + V0[i11] * w11) +
    ft * (V1[i00] * w00 + V1[i10] * w10 + V1[i01] * w01 + V1[i11] * w11);
  const temp = (1 - ft) * (T0[i00] * w00 + T0[i10] * w10 + T0[i01] * w01 + T0[i11] * w11) +
    ft * (T1[i00] * w00 + T1[i10] * w10 + T1[i01] * w01 + T1[i11] * w11);

  if (Number.isNaN(u) || Number.isNaN(v)) return false;
  out[0] = u;
  out[1] = v;
  out[2] = temp;
  return true;
}

// Meteorological convention: direction the wind blows FROM, in degrees.
export function windFrom(u, v) {
  return (Math.atan2(-u, -v) * 180 / Math.PI + 360) % 360;
}
