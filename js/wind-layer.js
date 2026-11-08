// Color field + animated wind particles, drawn on two canvases that sit inside
// Leaflet panes. Everything is computed in screen space once per view change:
// a coarse pixel grid caches lat/lon, and the field is resampled into it, so the
// per-frame particle work never touches map projection code.
import { sampleInto } from './field.js';
import { SCALES, buildLut, lutIndex } from './colors.js';

const STEP = 5;          // screen-grid spacing in CSS pixels
const FADE = 0.92;       // trail persistence per frame
const SPEED_BUCKETS = [12, 30, 55, Infinity];
const BUCKET_ALPHA = [0.42, 0.62, 0.82, 0.98];

export class WindLayer {
  constructor(map) {
    this.map = map;
    this.field = null;
    this.t = 0;
    this.mode = 'wind';
    this.luts = { wind: buildLut(SCALES.wind), temp: buildLut(SCALES.temp) };
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.ready = false;

    for (const [name, z] of [['fieldPane', 250], ['particlePane', 450]]) {
      const pane = map.createPane(name);
      pane.style.zIndex = z;
      pane.style.pointerEvents = 'none';
    }
    this.fieldCanvas = L.DomUtil.create('canvas', 'wind-canvas wind-field', map.getPane('fieldPane'));
    this.pCanvas = L.DomUtil.create('canvas', 'wind-canvas wind-particles', map.getPane('particlePane'));
    this.fctx = this.fieldCanvas.getContext('2d');
    this.pctx = this.pCanvas.getContext('2d');
    this.off = document.createElement('canvas');
    this.offctx = this.off.getContext('2d');
    this._out = new Float32Array(3);

    map.on('zoomstart', () => this._setHidden(true));
    map.on('moveend', () => this._reset());
    map.on('resize', () => this._reset());
  }

  setField(field) {
    this.field = field;
    this._reset();
  }

  setTime(t) {
    this.t = t;
    if (!this.ready) return;
    this._resample();
    this._drawField();
    if (this.reducedMotion) this._drawStaticArrows();
  }

  setMode(mode) {
    this.mode = mode;
    if (this.ready) this._drawField();
  }

  // Values at a geographic point for the current time, or null.
  sampleAt(lat, lon) {
    if (!this.field) return null;
    const o = new Float32Array(3);
    return sampleInto(this.field, lat, lon, this.t, o) ? { u: o[0], v: o[1], temp: o[2] } : null;
  }

  _setHidden(hidden) {
    this.fieldCanvas.classList.toggle('is-hidden', hidden);
    this.pCanvas.classList.toggle('is-hidden', hidden);
  }

  _reset() {
    const map = this.map;
    const size = map.getSize();
    this.W = size.x;
    this.H = size.y;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    for (const c of [this.fieldCanvas, this.pCanvas]) {
      L.DomUtil.setPosition(c, topLeft);
      c.width = Math.round(this.W * this.dpr);
      c.height = Math.round(this.H * this.dpr);
      c.style.width = `${this.W}px`;
      c.style.height = `${this.H}px`;
    }
    this.fctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.pctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cols = Math.ceil(this.W / STEP) + 2;
    this.rows = Math.ceil(this.H / STEP) + 2;
    const n = this.cols * this.rows;
    this.lat = new Float32Array(n);
    this.lon = new Float32Array(n);
    this.gu = new Float32Array(n);
    this.gv = new Float32Array(n);
    this.gt = new Float32Array(n);
    this.gok = new Uint8Array(n);
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const ll = map.containerPointToLatLng([i * STEP, j * STEP]);
        const k = j * this.cols + i;
        this.lat[k] = ll.lat;
        this.lon[k] = ((ll.lng + 540) % 360) - 180;
      }
    }
    const zoom = map.getZoom();
    this.speedK = 0.02 * Math.pow(1.12, Math.max(-2, Math.min(5, zoom - 4)));
    this.ready = !!this.field;
    if (!this.ready) return;
    this._resample();
    this._drawField();
    this._resetParticles();
    if (this.reducedMotion) this._drawStaticArrows();
    this._setHidden(false);
  }

  _resample() {
    const f = this.field;
    const o = this._out;
    for (let k = 0; k < this.lat.length; k++) {
      if (sampleInto(f, this.lat[k], this.lon[k], this.t, o)) {
        this.gu[k] = o[0];
        this.gv[k] = o[1];
        this.gt[k] = o[2];
        this.gok[k] = 1;
      } else {
        this.gok[k] = 0;
      }
    }
  }

  _drawField() {
    const { cols, rows } = this;
    const scale = SCALES[this.mode];
    const lut = this.luts[this.mode];
    this.off.width = cols;
    this.off.height = rows;
    const img = this.offctx.createImageData(cols, rows);
    const d = img.data;
    const isWind = this.mode === 'wind';
    for (let k = 0; k < cols * rows; k++) {
      if (!this.gok[k]) { d[k * 4 + 3] = 0; continue; }
      const val = isWind ? Math.hypot(this.gu[k], this.gv[k]) : this.gt[k];
      const li = lutIndex(scale, val) * 3;
      d[k * 4] = lut[li];
      d[k * 4 + 1] = lut[li + 1];
      d[k * 4 + 2] = lut[li + 2];
      d[k * 4 + 3] = 255;
    }
    this.offctx.putImageData(img, 0, 0);
    const ctx = this.fctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Pixel (i, j) of the small image is the sample at screen (i*STEP, j*STEP).
    ctx.drawImage(this.off, -STEP / 2, -STEP / 2, cols * STEP, rows * STEP);
  }

  // Bilinear lookup in the screen grid. Returns false where there is no data.
  _vecAt(x, y, out) {
    const fx = x / STEP;
    const fy = y / STEP;
    const i = fx | 0;
    const j = fy | 0;
    if (i < 0 || j < 0 || i >= this.cols - 1 || j >= this.rows - 1) return false;
    const k = j * this.cols + i;
    const c = this.cols;
    if (!(this.gok[k] && this.gok[k + 1] && this.gok[k + c] && this.gok[k + c + 1])) return false;
    const dx = fx - i;
    const dy = fy - j;
    const a = (1 - dx) * (1 - dy), b = dx * (1 - dy), e = (1 - dx) * dy, f = dx * dy;
    out[0] = this.gu[k] * a + this.gu[k + 1] * b + this.gu[k + c] * e + this.gu[k + c + 1] * f;
    out[1] = this.gv[k] * a + this.gv[k + 1] * b + this.gv[k + c] * e + this.gv[k + c + 1] * f;
    return true;
  }

  _resetParticles() {
    const count = Math.round(Math.min(6000, Math.max(800, (this.W * this.H) / 115)));
    this.px = new Float32Array(count);
    this.py = new Float32Array(count);
    this.age = new Float32Array(count);
    this.maxAge = new Float32Array(count);
    for (let p = 0; p < count; p++) this._spawn(p, true);
    this.pctx.clearRect(0, 0, this.W, this.H);
  }

  _spawn(p, randomAge) {
    const life = 55 + Math.random() * 90;
    this.px[p] = Math.random() * this.W;
    this.py[p] = Math.random() * this.H;
    this.maxAge[p] = life;
    this.age[p] = randomAge ? Math.random() * life : 0;
  }

  // Called once per animation frame by the app loop.
  frame() {
    if (!this.ready || this.reducedMotion) return;
    const ctx = this.pctx;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = `rgba(0,0,0,${FADE})`;
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.globalCompositeOperation = 'source-over';

    const paths = SPEED_BUCKETS.map(() => new Path2D());
    const out = this._out;
    const k = this.speedK;
    for (let p = 0; p < this.px.length; p++) {
      const x = this.px[p];
      const y = this.py[p];
      if (this.age[p] > this.maxAge[p] || !this._vecAt(x, y, out)) {
        this._spawn(p, false);
        continue;
      }
      const nx = x + out[0] * k;
      const ny = y - out[1] * k;
      const speed = Math.hypot(out[0], out[1]);
      let b = 0;
      while (speed > SPEED_BUCKETS[b]) b++;
      paths[b].moveTo(x, y);
      paths[b].lineTo(nx, ny);
      this.px[p] = nx;
      this.py[p] = ny;
      this.age[p] += 1;
    }
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    for (let b = 0; b < paths.length; b++) {
      ctx.strokeStyle = `rgba(255,255,255,${BUCKET_ALPHA[b]})`;
      ctx.stroke(paths[b]);
    }
  }

  // Reduced-motion fallback: a still grid of arrows instead of moving particles.
  _drawStaticArrows() {
    const ctx = this.pctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2;
    const gap = 42;
    const out = this._out;
    for (let y = gap / 2; y < this.H; y += gap) {
      for (let x = gap / 2; x < this.W; x += gap) {
        if (!this._vecAt(x, y, out)) continue;
        const s = Math.hypot(out[0], out[1]);
        if (s < 1) continue;
        const len = Math.min(18, 5 + s * 0.22);
        const ux = out[0] / s, uy = -out[1] / s;
        const x2 = x + ux * len, y2 = y + uy * len;
        ctx.beginPath();
        ctx.moveTo(x - ux * len * 0.5, y - uy * len * 0.5);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2 - ux * 5 - uy * 3, y2 - uy * 5 + ux * 3);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - ux * 5 + uy * 3, y2 - uy * 5 - ux * 3);
        ctx.stroke();
      }
    }
  }
}
