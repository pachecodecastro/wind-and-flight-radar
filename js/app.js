import { CONFIG } from './config.js';
import { SCALES, cssGradient } from './colors.js';
import { makeGrid, windFrom } from './field.js';
import { compassPoint, distanceKm, wrapLon } from './geo.js';
import { CITIES } from './cities.js';
import { loadBasemap } from './basemap.js';
import { fetchLiveField, fetchCityForecasts, makeDemoField } from './weather.js';
import { WindLayer } from './wind-layer.js';
import { FlightLayer, fetchLiveFlights } from './flights.js';
import { FlightSimulator, airportName, aircraftName } from './flights-sim.js';

const STANDALONE = !!window.__STANDALONE__;
const FORCE_DEMO = (() => {
  try { return new URLSearchParams(location.search).has('demo'); } catch { return false; }
})();
const PLAY_RATE = 3; // forecast hours per second while playing
const LIVE_RETRY_MS = 120000; // after a failure, wait this long before trying Open-Meteo again
const LIVE_MIN_GAP_MS = 35000; // spacing between grid requests, keeps us inside 600 calls/minute

const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const state = {
  mode: 'wind',
  t: 0,
  playing: false,
  field: null,
  weatherSource: null,
  lastLiveAttempt: 0,
  cityData: null,
  flightsOn: true,
  flightSource: null,
  liveFailures: 0,
};

// ---------------------------------------------------------------------------
// Map

const map = L.map('map', {
  zoomControl: false,
  attributionControl: false,
  minZoom: 3,
  maxZoom: 9,
  zoomSnap: 0.5,
  worldCopyJump: false,
  maxBounds: [[-85, -200], [85, 200]],
  maxBoundsViscosity: 0.8,
});
if (map.getSize().x < 600) map.setView(CONFIG.startPhone.center, CONFIG.startPhone.zoom);
else map.fitBounds(CONFIG.startBounds);

const wind = new WindLayer(map);
const flights = new FlightLayer(map);
let sim = null;

// ---------------------------------------------------------------------------
// Weather

function viewBounds(pad = 0.1) {
  const b = map.getBounds().pad(pad);
  return {
    south: Math.max(-80, b.getSouth()),
    north: Math.min(80, b.getNorth()),
    west: Math.max(-180, b.getWest()),
    east: Math.min(180, b.getEast()),
  };
}

function needsNewField() {
  const f = state.field;
  if (!f) return true;
  const v = viewBounds(0);
  const fb = f.bounds;
  const outside = v.south < fb.south || v.north > fb.north || v.west < fb.west || v.east > fb.east;
  const tooCoarse = f.source === 'live' && makeGrid(viewBounds(), CONFIG.maxGridPoints).step < f.grid.step / 1.9;
  return outside || tooCoarse;
}

let loadingWeather = false;
let deferredLoad = null;
async function loadWeather() {
  if (loadingWeather) return;
  const tryLive = !FORCE_DEMO && (state.weatherSource !== 'demo' || Date.now() - state.lastLiveAttempt > LIVE_RETRY_MS);
  const wait = state.lastLiveAttempt + LIVE_MIN_GAP_MS - Date.now();
  if (tryLive && state.field && wait > 0) {
    // Keep showing the current field and fetch the new area a little later.
    clearTimeout(deferredLoad);
    deferredLoad = setTimeout(() => { if (needsNewField()) loadWeather(); }, wait);
    return;
  }
  loadingWeather = true;
  const bounds = viewBounds();
  let field = null;
  if (tryLive) {
    state.lastLiveAttempt = Date.now();
    try {
      field = await fetchLiveField(bounds, CONFIG);
      if (!state.cityData) state.cityData = await fetchCityForecasts(CITIES, CONFIG).catch(() => null);
    } catch (err) {
      console.info('Open-Meteo indisponível, a usar dados de demonstração:', err.message);
    }
  }
  if (!field) field = makeDemoField(bounds, CONFIG);
  state.field = field;
  state.weatherSource = field.source;
  if (field.source === 'demo') state.cityData = null;
  wind.setField(field);
  buildDayTicks();
  applyTime();
  updateStatus();
  loadingWeather = false;
}

let moveTimer = null;
map.on('moveend', () => {
  updateCities();
  clearTimeout(moveTimer);
  moveTimer = setTimeout(() => { if (needsNewField()) loadWeather(); }, 500);
});

// ---------------------------------------------------------------------------
// Cities

const cityLayer = L.layerGroup().addTo(map);
for (const c of CITIES) {
  c.marker = L.marker([c.lat, c.lon], {
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: 'city-icon',
      iconSize: null,
      html: `<div class="city"><i></i><span class="city-name">${c.name}</span><span class="city-val"></span></div>`,
    }),
  });
}

function cityValue(c, idx) {
  const d = state.cityData?.[idx];
  if (d) {
    const last = d.temp.length - 1;
    const tc = Math.min(last, Math.max(0, state.t));
    const t0 = Math.floor(tc), t1 = Math.min(last, t0 + 1), f = tc - t0;
    const lerp = (a) => (a[t0] ?? NaN) * (1 - f) + (a[t1] ?? NaN) * f;
    return state.mode === 'wind' ? lerp(d.speed) : lerp(d.temp);
  }
  const s = wind.sampleAt(c.lat, c.lon);
  if (!s) return NaN;
  return state.mode === 'wind' ? Math.hypot(s.u, s.v) : s.temp;
}

function updateCities() {
  const zoom = map.getZoom();
  CITIES.forEach((c, idx) => {
    const show = zoom >= c.minZoom;
    if (show && !cityLayer.hasLayer(c.marker)) cityLayer.addLayer(c.marker);
    if (!show && cityLayer.hasLayer(c.marker)) cityLayer.removeLayer(c.marker);
    if (!show) return;
    const el = c.marker.getElement()?.querySelector('.city-val');
    if (!el) return;
    const v = cityValue(c, idx);
    el.textContent = Number.isFinite(v) ? (state.mode === 'wind' ? nf.format(v) : `${nf.format(v)}°`) : '–';
  });
}

// ---------------------------------------------------------------------------
// Timeline and legend

const slider = $('time-slider');

function fieldTime(i) {
  const times = state.field?.times;
  if (!times) return Date.now();
  const k = Math.min(times.length - 1, Math.max(0, Math.floor(i)));
  return times[k];
}

function applyTime(force = true) {
  if (force || Math.abs(state.t - wind.t) >= 0.05) wind.setTime(state.t);
  const i = Math.floor(state.t);
  if (Number(slider.value) !== i) slider.value = String(i);
  const d = new Date(fieldTime(i));
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  $('time-day').textContent = sameDay ? 'hoje' : `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  $('time-hour').textContent = `${String(d.getHours()).padStart(2, '0')}:00`;
  $('time-rel').textContent = i === 0 ? 'agora' : `daqui a ${i} h`;
  slider.setAttribute('aria-valuetext', `${$('time-day').textContent}, ${$('time-hour').textContent}`);
  updateCities();
}

function buildDayTicks() {
  const times = state.field.times;
  slider.max = String(times.length - 1);
  const box = $('day-ticks');
  box.textContent = '';
  times.forEach((ms, i) => {
    const d = new Date(ms);
    if (i === 0 || d.getHours() !== 0) return;
    const tick = document.createElement('span');
    tick.style.left = `${(i / (times.length - 1)) * 100}%`;
    tick.textContent = WEEKDAYS[d.getDay()];
    box.appendChild(tick);
  });
}

function updateLegend() {
  const scale = SCALES[state.mode];
  $('legend-bar').style.background = cssGradient(scale);
  const ticks = $('legend-ticks');
  ticks.textContent = '';
  scale.ticks.forEach((v, i) => {
    const s = document.createElement('span');
    s.style.left = `${((v - scale.min) / (scale.max - scale.min)) * 100}%`;
    s.textContent = i === scale.ticks.length - 1 ? `${v} ${scale.unit}` : String(v);
    ticks.appendChild(s);
  });
}

slider.addEventListener('input', () => {
  setPlaying(false);
  state.t = Number(slider.value);
  applyTime();
});

function setPlaying(on) {
  state.playing = on;
  const btn = $('btn-play');
  btn.classList.toggle('is-playing', on);
  btn.setAttribute('aria-label', on ? 'Pausar a previsão' : 'Reproduzir a previsão');
}
$('btn-play').addEventListener('click', () => {
  if (!state.field) return;
  if (!state.playing && state.t >= state.field.times.length - 1) state.t = 0;
  setPlaying(!state.playing);
});

// ---------------------------------------------------------------------------
// Layer controls

document.querySelectorAll('.segmented [data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.mode = btn.dataset.mode;
    document.querySelectorAll('.segmented [data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
    wind.setMode(state.mode);
    updateLegend();
    updateCities();
  });
});

$('btn-flights').addEventListener('click', (e) => {
  state.flightsOn = !state.flightsOn;
  e.currentTarget.setAttribute('aria-pressed', String(state.flightsOn));
  flights.setVisible(state.flightsOn);
  if (!state.flightsOn) closeSheet();
  updateStatus();
});

// ---------------------------------------------------------------------------
// Flights

function startFlights() {
  if (CONFIG.flightsProxy && !FORCE_DEMO) {
    state.flightSource = 'live';
    pollLiveFlights();
  } else {
    startSimulation();
  }
}

function startSimulation() {
  sim = new FlightSimulator();
  flights.clear();
  flights.setData(sim.snapshot(), Date.now());
  state.flightSource = 'sim';
  updateStatus();
}

let warnedRadius = false;
async function pollLiveFlights() {
  if (state.flightSource !== 'live') return;
  if (state.flightsOn && !document.hidden) {
    const c = map.getCenter();
    const ne = map.getBounds().getNorthEast();
    const viewNm = distanceKm(c.lat, c.lng, ne.lat, ne.lng) / 1.852;
    const radius = Math.min(250, Math.ceil(viewNm));
    if (viewNm > 250 && !warnedRadius) {
      warnedRadius = true;
      toast('Os voos ao vivo aparecem num raio de 460 km do centro do mapa');
    }
    try {
      const list = await fetchLiveFlights(CONFIG.flightsProxy, c.lat, wrapLon(c.lng), radius, CONFIG.requestTimeoutMs);
      flights.setData(list, Date.now());
      refreshSheet();
      state.liveFailures = 0;
    } catch (err) {
      state.liveFailures += 1;
      console.info('Proxy de voos indisponível:', err.message);
      if (state.liveFailures >= 3) {
        toast('Sem ligação ao serviço de voos. A mostrar voos simulados.');
        startSimulation();
        return;
      }
    }
    updateStatus();
  }
  setTimeout(pollLiveFlights, CONFIG.flightsRefreshMs);
}

// ---------------------------------------------------------------------------
// Flight details sheet

const sheet = $('sheet');

function fmtAlt(ft) {
  if (ft == null) return ['–', ''];
  return [`${nf.format(ft)} ft`, `${nf.format(ft * 0.3048)} m`];
}

function renderSheet(f) {
  if (!f) return;
  $('f-callsign').textContent = f.callsign;
  const typeName = aircraftName(f.type);
  $('f-sub').textContent = f.from && f.to
    ? `${airportName(f.from)} → ${airportName(f.to)}`
    : typeName || 'Aeronave sem tipo indicado';
  const [altA, altB] = f.onGround ? ['No solo', ''] : fmtAlt(f.alt);
  $('f-alt').innerHTML = `${altA}<small>${altB}</small>`;
  $('f-gs').innerHTML = `${nf.format(f.gs)} kt<small>${nf.format(f.gs * 1.852)} km/h</small>`;
  $('f-trk').innerHTML = `${String(Math.round(f.track) % 360).padStart(3, '0')}°<small>${compassPoint(f.track)}</small>`;
  const vr = f.vrate;
  const vrText = vr == null ? '–' : `${vr > 0 ? '+' : ''}${nf.format(vr)} ft/min`;
  const vrNote = vr == null ? '' : vr > 250 ? 'a subir' : vr < -250 ? 'a descer' : 'nivelado';
  $('f-vr').innerHTML = `${vrText}<small>${vrNote}</small>`;
  $('f-type').innerHTML = `${f.type || '–'}<small>${f.reg || (typeName && typeName !== f.type ? typeName : '')}</small>`;
  $('f-sq').innerHTML = `${f.squawk || '–'}<small>${f.simulated ? '' : `ICAO ${String(f.id).toUpperCase()}`}</small>`;
  $('f-source').textContent = f.simulated
    ? 'Voo simulado para demonstração. Rotas e companhias plausíveis, posições inventadas.'
    : 'Dados ADS-B ao vivo da rede adsb.lol. Origem e destino não fazem parte destes dados.';
}

function refreshSheet() {
  if (flights.selectedId) renderSheet(flights.get(flights.selectedId));
}

flights.onSelect = (f) => {
  if (f) {
    renderSheet(f);
    sheet.hidden = false;
    document.body.classList.add('has-sheet');
  } else {
    sheet.hidden = true;
    document.body.classList.remove('has-sheet');
  }
};

function closeSheet() {
  if (flights.selectedId) flights.select(null);
}
$('sheet-close').addEventListener('click', closeSheet);

// ---------------------------------------------------------------------------
// Tap on the map: aircraft first, otherwise the weather at that point.

map.on('click', (e) => {
  if (state.flightsOn) {
    const id = flights.hitTest(e.containerPoint);
    if (id) {
      map.closePopup();
      flights.select(id);
      return;
    }
  }
  closeSheet();
  const lat = e.latlng.lat;
  const lon = wrapLon(e.latlng.lng);
  const s = wind.sampleAt(lat, lon);
  const coord = `${nf1.format(Math.abs(lat))}° ${lat >= 0 ? 'N' : 'S'}, ${nf1.format(Math.abs(lon))}° ${lon >= 0 ? 'E' : 'O'}`;
  let body;
  if (s) {
    const speed = Math.hypot(s.u, s.v);
    const from = windFrom(s.u, s.v);
    body = `<p class="pt-vals"><span><b>${nf.format(speed)}</b> km/h</span><span>de ${compassPoint(from)}</span><span><b>${nf.format(s.temp)}</b> °C</span></p>`;
  } else {
    body = '<p class="pt-empty">Sem dados para este ponto. Aproxima-te da zona colorida.</p>';
  }
  L.popup({ className: 'pt-popup', closeButton: false, offset: [0, -4], autoPan: false })
    .setLatLng(e.latlng)
    .setContent(`<p class="pt-coord">${coord}</p>${body}`)
    .openOn(map);
});

// ---------------------------------------------------------------------------
// Status, toast, info, locate

function updateStatus() {
  const parts = [];
  if (state.weatherSource === 'live') parts.push('<span><i class="dot live"></i>Previsão ao vivo</span>');
  else if (state.weatherSource === 'demo') parts.push('<span><i class="dot demo"></i>Previsão de demonstração</span>');
  else parts.push('<span>A carregar a previsão</span>');
  if (state.flightsOn) {
    if (state.flightSource === 'live') parts.push(`<span><i class="dot ${state.liveFailures ? 'warn' : 'live'}"></i>Voos ao vivo</span>`);
    else if (state.flightSource === 'sim') parts.push('<span><i class="dot demo"></i>Voos simulados</span>');
  }
  $('status').innerHTML = parts.join(' ');

  const demoNotes = [];
  if (state.weatherSource === 'demo') demoNotes.push('a previsão mostrada é um campo de vento sintético (uma depressão no Atlântico), porque a Open-Meteo não está acessível daqui');
  if (state.flightSource === 'sim') demoNotes.push('os aviões são simulados, porque não está configurado um proxy para os dados ADS-B');
  $('info-mode').textContent = demoNotes.length
    ? `Neste momento ${demoNotes.join(', e ')}. A barra de cima indica sempre o que é real e o que é demonstração.`
    : 'Neste momento todos os dados são reais.';
}

let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 4200);
}

const info = $('info');
let lastFocus = null;
function openInfo() {
  lastFocus = document.activeElement;
  info.hidden = false;
  $('info-close').focus();
}
function closeInfo() {
  info.hidden = true;
  lastFocus?.focus?.();
}
$('btn-info').addEventListener('click', openInfo);
$('info-close').addEventListener('click', closeInfo);
info.addEventListener('click', (e) => { if (e.target === info) closeInfo(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!info.hidden) closeInfo();
  else closeSheet();
});
$('info-author').textContent = `${CONFIG.author}, ${CONFIG.authorSite}`;
$('info-repo').href = CONFIG.repoUrl;

const locateBtn = $('btn-locate');
if (STANDALONE || !('geolocation' in navigator)) {
  locateBtn.hidden = true;
} else {
  locateBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 7, { duration: 1.2 }),
      () => toast('Não foi possível obter a tua localização'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
}

// ---------------------------------------------------------------------------
// Animation loop

let lastFrame = performance.now();
let lastSimTick = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (document.hidden) return;

  if (state.playing && state.field) {
    state.t += dt * PLAY_RATE;
    if (state.t > state.field.times.length - 1) state.t = 0;
    applyTime(false);
  }
  wind.frame();
  if (sim && state.flightsOn && now - lastSimTick > 1000) {
    lastSimTick = now;
    sim.tick(now);
    flights.setData(sim.snapshot(), Date.now());
    refreshSheet();
  }
  flights.frame(Date.now());
}

// ---------------------------------------------------------------------------
// Start

updateLegend();
updateStatus();
loadBasemap(map).catch((err) => console.warn('Mapa base indisponível:', err));
loadWeather();
startFlights();
requestAnimationFrame(loop);

if (!STANDALONE && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Handy when poking around in the browser console.
window.rdv = { map, wind, flights, state };
