// Flight layer: aircraft drawn on a canvas, moved smoothly between data updates
// by dead reckoning (ground speed + track), with tap-to-select.
import { destination, intermediate } from './geo.js';

// Airliner silhouette pointing north, roughly 20 units long.
const PLANE = new Path2D(
  'M0 -10C0.8 -10 1.3 -9.2 1.3 -8.2L1.3 -2.8L9.5 1.6L9.5 3.4L1.3 0.9L1.3 6.2L3.6 7.9L3.6 9.4' +
  'L0 8.4L-3.6 9.4L-3.6 7.9L-1.3 6.2L-1.3 0.9L-9.5 3.4L-9.5 1.6L-1.3 -2.8L-1.3 -8.2C-1.3 -9.2 -0.8 -10 0 -10Z'
);
const AMBER = '#FFB81C';
const MAX_EXTRAPOLATE_S = 45;
const TRAIL_POINTS = 60;

export class FlightLayer {
  constructor(map) {
    this.map = map;
    this.flights = new Map();
    this.visible = true;
    this.selectedId = null;
    this.onSelect = () => {};

    const pane = map.createPane('flightPane');
    pane.style.zIndex = 590; // under city labels (markerPane is 600)
    pane.style.pointerEvents = 'none';
    this.canvas = L.DomUtil.create('canvas', 'flight-canvas', pane);
    this.ctx = this.canvas.getContext('2d');
    this.screen = [];

    map.on('zoomstart', () => this.canvas.classList.add('is-hidden'));
    map.on('moveend resize', () => this._reset());
    this._reset();
  }

  setVisible(v) {
    this.visible = v;
    if (!v) this.ctx.clearRect(0, 0, this.W, this.H);
  }

  // list: normalized flights; receivedAt: ms timestamp the positions refer to.
  setData(list, receivedAt) {
    const seen = new Set();
    for (const f of list) {
      seen.add(f.id);
      const prev = this.flights.get(f.id);
      const trail = prev ? prev.trail : [];
      const last = trail[trail.length - 1];
      if (!last || last[0] !== f.lat || last[1] !== f.lon) trail.push([f.lat, f.lon]);
      if (trail.length > TRAIL_POINTS) trail.shift();
      this.flights.set(f.id, { ...f, trail, t0: receivedAt - (f.seenPos || 0) * 1000 });
    }
    for (const id of [...this.flights.keys()]) {
      if (!seen.has(id)) this.flights.delete(id);
    }
    if (this.selectedId && !this.flights.has(this.selectedId)) this.select(null);
  }

  clear() {
    this.flights.clear();
    this.select(null);
  }

  get(id) {
    return this.flights.get(id);
  }

  select(id) {
    this.selectedId = id;
    this.onSelect(id ? this.flights.get(id) : null);
  }

  // Extrapolated position for "now".
  position(f, now) {
    if (f.onGround || !f.gs) return [f.lat, f.lon];
    const dt = Math.min(MAX_EXTRAPOLATE_S, Math.max(0, (now - f.t0) / 1000));
    return destination(f.lat, f.lon, f.track || 0, (f.gs * 1.852 * dt) / 3600);
  }

  _reset() {
    const size = this.map.getSize();
    this.W = size.x;
    this.H = size.y;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.origin = this.map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, this.origin);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.canvas.classList.remove('is-hidden');
  }

  frame(now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this.screen.length = 0;
    if (!this.visible) return;

    const map = this.map;
    const zoom = map.getZoom();
    const size = zoom < 4 ? 0.5 : zoom <= 5 ? 0.66 : zoom <= 6.5 ? 0.8 : 0.95;
    const showLabels = zoom >= 7;
    const ox = this.origin.x;
    const oy = this.origin.y;
    const pad = 20;
    let selected = null;

    ctx.font = '600 11px "Barlow Semi Condensed", system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    for (const f of this.flights.values()) {
      const [lat, lon] = this.position(f, now);
      const lp = map.latLngToLayerPoint([lat, lon]);
      const x = lp.x - ox;
      const y = lp.y - oy;
      if (x < -pad || y < -pad || x > this.W + pad || y > this.H + pad) continue;
      this.screen.push({ id: f.id, lp });
      if (f.id === this.selectedId) { selected = { f, x, y, lat, lon }; continue; }
      this._plane(x, y, f.track || 0, size, f.onGround ? '#9FB3C2' : AMBER, 'rgba(20,14,0,0.55)');
      if (showLabels && f.callsign) {
        ctx.fillStyle = 'rgba(234,242,247,0.9)';
        ctx.fillText(f.callsign, x + 11, y + 1);
      }
    }

    if (selected) {
      const { f, x, y, lat, lon } = selected;
      const toScreen = ([pl, pn]) => {
        const p = map.latLngToLayerPoint([pl, pn]);
        return [p.x - ox, p.y - oy];
      };
      const polyline = (points) => {
        ctx.beginPath();
        points.map(toScreen).forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.stroke();
      };
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (f.origin && f.dest) {
        // Simulated flights know their route: flown part solid, remaining part dashed.
        const flown = [], ahead = [];
        for (let i = 0; i <= 24; i++) {
          flown.push(intermediate(f.origin[0], f.origin[1], lat, lon, i / 24));
          ahead.push(intermediate(lat, lon, f.dest[0], f.dest[1], i / 24));
        }
        ctx.strokeStyle = 'rgba(255,184,28,0.9)';
        ctx.lineWidth = 2;
        polyline(flown);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(234,242,247,0.7)';
        ctx.lineWidth = 1.5;
        polyline(ahead);
        ctx.setLineDash([]);
      } else {
        // Live flights: the positions reported since the plane was first seen.
        ctx.strokeStyle = 'rgba(255,184,28,0.9)';
        ctx.lineWidth = 2;
        polyline([...f.trail, [lat, lon]]);
      }

      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,184,28,0.18)';
      ctx.fill();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      this._plane(x, y, f.track || 0, 1.05, '#FFFFFF', AMBER);
    }
  }

  _plane(x, y, track, scale, fill, stroke) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((track * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.4 / scale;
    ctx.stroke(PLANE);
    ctx.fill(PLANE);
    ctx.restore();
  }

  // Nearest aircraft within a finger's reach of a container point, or null.
  hitTest(containerPoint, radius = 22) {
    let best = null;
    let bestD = radius * radius;
    for (const s of this.screen) {
      const cp = this.map.layerPointToContainerPoint(s.lp);
      const d = (cp.x - containerPoint.x) ** 2 + (cp.y - containerPoint.y) ** 2;
      if (d < bestD) { bestD = d; best = s.id; }
    }
    return best;
  }
}

// ---------------------------------------------------------------------------
// Live source: an ADS-B "point" query through your own CORS proxy.
// The proxy forwards /point/{lat}/{lon}/{radius_nm} to api.adsb.lol/v2/point/...

export async function fetchLiveFlights(proxyBase, lat, lon, radiusNm, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `${proxyBase}/point/${lat.toFixed(2)}/${lon.toFixed(2)}/${Math.round(radiusNm)}`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.ac || data.aircraft || []).map(normalizeAdsb).filter(Boolean);
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAdsb(a) {
  if (typeof a.lat !== 'number' || typeof a.lon !== 'number') return null;
  const onGround = a.alt_baro === 'ground';
  const alt = onGround ? 0 : (typeof a.alt_baro === 'number' ? a.alt_baro : a.alt_geom);
  const callsign = (a.flight || '').trim();
  return {
    id: a.hex,
    callsign: callsign || a.r || a.hex.toUpperCase(),
    reg: a.r || null,
    type: a.t || null,
    lat: a.lat,
    lon: a.lon,
    track: a.track ?? a.true_heading ?? a.mag_heading ?? 0,
    gs: a.gs ?? 0,
    alt: alt ?? null,
    vrate: a.baro_rate ?? a.geom_rate ?? null,
    squawk: a.squawk || null,
    onGround,
    seenPos: a.seen_pos ?? 0,
    from: null,
    to: null,
  };
}
