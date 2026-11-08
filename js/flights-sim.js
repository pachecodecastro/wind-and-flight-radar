// Flight simulation used when no live proxy is configured. Aircraft fly great-circle
// routes between real airports with a simple climb, cruise and descent profile.
// The interface labels this data as simulated everywhere it appears.
import { distanceKm, intermediate, bearingDeg } from './geo.js';

const AIRPORTS = {
  LIS: ['Lisboa', 38.774, -9.134], OPO: ['Porto', 41.248, -8.681], FAO: ['Faro', 37.014, -7.966],
  FNC: ['Funchal', 32.697, -16.774], PDL: ['Ponta Delgada', 37.742, -25.698],
  MAD: ['Madrid', 40.472, -3.561], BCN: ['Barcelona', 41.297, 2.078], AGP: ['Málaga', 36.675, -4.499],
  SVQ: ['Sevilha', 37.418, -5.893], BIO: ['Bilbau', 43.301, -2.911], LPA: ['Gran Canária', 27.932, -15.387],
  TFS: ['Tenerife Sul', 28.044, -16.573], CMN: ['Casablanca', 33.367, -7.59], RAK: ['Marraquexe', 31.607, -8.036],
  LHR: ['Londres Heathrow', 51.47, -0.454], LGW: ['Londres Gatwick', 51.153, -0.182], DUB: ['Dublin', 53.421, -6.27],
  CDG: ['Paris Charles de Gaulle', 49.009, 2.548], ORY: ['Paris Orly', 48.723, 2.379], AMS: ['Amesterdão', 52.31, 4.768],
  FRA: ['Frankfurt', 50.037, 8.562], MUC: ['Munique', 48.354, 11.786], ZRH: ['Zurique', 47.458, 8.555],
  GVA: ['Genebra', 46.238, 6.109], FCO: ['Roma', 41.8, 12.239], NCE: ['Nice', 43.658, 7.216],
  BOD: ['Bordéus', 44.828, -0.716], BRU: ['Bruxelas', 50.901, 4.484], MAN: ['Manchester', 53.354, -2.275],
  JFK: ['Nova Iorque JFK', 40.641, -73.778], EWR: ['Newark', 40.69, -74.174], BOS: ['Boston', 42.366, -71.01],
  YYZ: ['Toronto', 43.677, -79.63], MIA: ['Miami', 25.793, -80.29], GRU: ['São Paulo', -23.432, -46.469],
  GIG: ['Rio de Janeiro', -22.809, -43.244], REC: ['Recife', -8.126, -34.923], SID: ['Sal', 16.741, -22.949],
  DSS: ['Dacar', 14.67, -17.073], LAD: ['Luanda', -8.858, 13.231],
};

const AIRLINES = [
  { code: 'TAP', weight: 9, hubs: ['LIS', 'OPO'], dests: ['FAO', 'FNC', 'PDL', 'MAD', 'BCN', 'LHR', 'CDG', 'ORY', 'AMS', 'FRA', 'MUC', 'ZRH', 'GVA', 'FCO', 'NCE', 'BRU', 'DUB', 'MAN', 'CMN', 'SID', 'DSS'], types: ['A20N', 'A21N', 'A320', 'A321', 'E195'] },
  { code: 'TAP', weight: 4, hubs: ['LIS'], dests: ['JFK', 'EWR', 'BOS', 'YYZ', 'MIA', 'GRU', 'GIG', 'REC', 'LAD'], types: ['A339', 'A332', 'A21N'] },
  { code: 'RYR', weight: 8, hubs: ['OPO', 'LIS', 'FAO', 'MAD', 'BCN', 'AGP', 'SVQ', 'DUB', 'MAN'], dests: ['LGW', 'MAN', 'DUB', 'BRU', 'FCO', 'BOD', 'CDG', 'TFS', 'LPA', 'FAO', 'AGP', 'RAK'], types: ['B738', 'B38M'] },
  { code: 'EZY', weight: 5, hubs: ['LGW', 'MAN', 'GVA', 'ORY', 'LIS', 'OPO'], dests: ['FAO', 'FNC', 'LIS', 'OPO', 'MAD', 'BCN', 'AGP', 'TFS', 'NCE', 'BOD'], types: ['A320', 'A20N', 'A21N'] },
  { code: 'IBE', weight: 4, hubs: ['MAD'], dests: ['LIS', 'OPO', 'LHR', 'CDG', 'FRA', 'FCO', 'BIO', 'LPA', 'TFS', 'CMN', 'JFK', 'BOS', 'MIA', 'GRU'], types: ['A20N', 'A21N', 'A333', 'A359'] },
  { code: 'BAW', weight: 4, hubs: ['LHR', 'LGW'], dests: ['LIS', 'OPO', 'FAO', 'FNC', 'MAD', 'BCN', 'AGP', 'SVQ', 'TFS', 'LPA', 'GIG', 'GRU'], types: ['A320', 'A20N', 'A321', 'B772'] },
  { code: 'AFR', weight: 3, hubs: ['CDG', 'ORY'], dests: ['LIS', 'OPO', 'FAO', 'MAD', 'CMN', 'RAK', 'DSS', 'GRU', 'GIG'], types: ['A320', 'A20N', 'A332', 'B77W'] },
  { code: 'KLM', weight: 2, hubs: ['AMS'], dests: ['LIS', 'OPO', 'FAO', 'MAD', 'BCN', 'AGP', 'GRU', 'GIG'], types: ['B738', 'E190', 'B789'] },
  { code: 'DLH', weight: 2, hubs: ['FRA', 'MUC'], dests: ['LIS', 'OPO', 'FAO', 'MAD', 'BCN', 'BIO', 'GRU'], types: ['A20N', 'A321', 'A359'] },
  { code: 'VLG', weight: 2, hubs: ['BCN'], dests: ['LIS', 'OPO', 'SVQ', 'BIO', 'LPA', 'TFS', 'ORY', 'FCO'], types: ['A320', 'A20N'] },
  { code: 'RAM', weight: 2, hubs: ['CMN'], dests: ['LIS', 'MAD', 'CDG', 'BRU', 'JFK', 'GRU', 'DSS'], types: ['B738', 'B788'] },
  { code: 'RZO', weight: 2, hubs: ['PDL'], dests: ['LIS', 'OPO', 'BOS', 'YYZ', 'FNC'], types: ['A20N', 'A21N'] },
  { code: 'BTI', weight: 1, hubs: ['LPA'], dests: ['TFS', 'FNC', 'RAK', 'CMN'], types: ['AT76', 'E295'] },
  { code: 'UAL', weight: 2, hubs: ['EWR'], dests: ['LIS', 'OPO', 'PDL', 'MAD', 'BCN'], types: ['B763', 'B752', 'B772'] },
  { code: 'DAL', weight: 2, hubs: ['JFK', 'BOS'], dests: ['LIS', 'OPO', 'MAD', 'BCN', 'FCO'], types: ['A332', 'A339', 'B763'] },
  { code: 'AZU', weight: 1, hubs: ['REC'], dests: ['LIS', 'OPO'], types: ['A339'] },
];

const PERF = {
  AT76: { cruise: 500, alt: 23000 }, E295: { cruise: 790, alt: 37000 },
  A332: { cruise: 880, alt: 39000 }, A333: { cruise: 880, alt: 39000 }, A339: { cruise: 885, alt: 39000 },
  A359: { cruise: 905, alt: 41000 }, B772: { cruise: 900, alt: 39000 }, B77W: { cruise: 905, alt: 39000 },
  B763: { cruise: 860, alt: 37000 }, B788: { cruise: 900, alt: 41000 }, B789: { cruise: 905, alt: 41000 },
  B752: { cruise: 850, alt: 37000 },
};
const DEFAULT_PERF = { cruise: 820, alt: 36000 };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const hex = () => Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

function pickAirline() {
  const total = AIRLINES.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of AIRLINES) { r -= a.weight; if (r <= 0) return a; }
  return AIRLINES[0];
}

export class FlightSimulator {
  constructor(count = 140) {
    this.flights = [];
    for (let i = 0; i < count; i++) this.flights.push(this._newFlight(true));
    this.last = performance.now();
  }

  _newFlight(midway) {
    let airline, a, b;
    do {
      airline = pickAirline();
      a = pick(airline.hubs);
      b = pick(airline.dests);
    } while (a === b);
    if (Math.random() < 0.5) [a, b] = [b, a];
    const [, lat1, lon1] = AIRPORTS[a];
    const [, lat2, lon2] = AIRPORTS[b];
    const type = pick(airline.types);
    const perf = PERF[type] || DEFAULT_PERF;
    const total = distanceKm(lat1, lon1, lat2, lon2);
    const cruiseAlt = perf.alt - Math.floor(Math.random() * 4) * 1000;
    return {
      id: `sim-${hex()}`,
      callsign: `${airline.code}${Math.floor(10 + Math.random() * 1980)}`,
      type,
      from: a,
      to: b,
      lat1, lon1, lat2, lon2,
      total,
      done: midway ? Math.random() * total : 0,
      cruise: perf.cruise * (0.96 + Math.random() * 0.08),
      cruiseAlt,
      squawk: String(1000 + Math.floor(Math.random() * 6777)).replace(/[89]/g, '7'),
    };
  }

  _profile(f) {
    const climbKm = 190;
    const descentKm = 230;
    const k = Math.max(0, Math.min(1, f.done / climbKm, (f.total - f.done) / descentKm));
    const alt = Math.round((f.cruiseAlt * k) / 25) * 25;
    const climbing = f.done < climbKm && f.total - f.done > descentKm;
    const descending = f.total - f.done < descentKm;
    const vrate = k >= 1 ? 0 : climbing ? 2000 : descending ? -1600 : 0;
    const speedKmh = f.cruise * (0.42 + 0.58 * Math.sqrt(k));
    return { alt, vrate, speedKmh };
  }

  tick(now) {
    const dtH = Math.min(5, (now - this.last) / 1000) / 3600;
    this.last = now;
    for (let i = 0; i < this.flights.length; i++) {
      const f = this.flights[i];
      f.done += this._profile(f).speedKmh * dtH;
      if (f.done >= f.total) this.flights[i] = this._newFlight(false);
    }
  }

  snapshot() {
    return this.flights.map((f) => {
      const frac = f.done / f.total;
      const [lat, lon] = intermediate(f.lat1, f.lon1, f.lat2, f.lon2, frac);
      const track = bearingDeg(lat, lon, f.lat2, f.lon2);
      const { alt, vrate, speedKmh } = this._profile(f);
      return {
        id: f.id,
        callsign: f.callsign,
        reg: null,
        type: f.type,
        lat, lon, track,
        gs: speedKmh / 1.852,
        alt: Math.max(alt, 1000),
        vrate,
        squawk: f.squawk,
        onGround: false,
        seenPos: 0,
        from: f.from,
        to: f.to,
        origin: [f.lat1, f.lon1],
        dest: [f.lat2, f.lon2],
        simulated: true,
      };
    });
  }
}

export function airportName(code) {
  return AIRPORTS[code]?.[0] ?? code;
}

const TYPE_NAMES = {
  A319: 'Airbus A319', A320: 'Airbus A320', A20N: 'Airbus A320neo', A321: 'Airbus A321', A21N: 'Airbus A321neo',
  A332: 'Airbus A330-200', A333: 'Airbus A330-300', A339: 'Airbus A330-900', A359: 'Airbus A350-900',
  A35K: 'Airbus A350-1000', A388: 'Airbus A380', B738: 'Boeing 737-800', B38M: 'Boeing 737 MAX 8',
  B39M: 'Boeing 737 MAX 9', B752: 'Boeing 757-200', B763: 'Boeing 767-300', B772: 'Boeing 777-200',
  B77W: 'Boeing 777-300ER', B788: 'Boeing 787-8', B789: 'Boeing 787-9', B78X: 'Boeing 787-10',
  E190: 'Embraer E190', E195: 'Embraer E195', E295: 'Embraer E195-E2', AT76: 'ATR 72-600',
  AT75: 'ATR 72-500', CRJ9: 'Bombardier CRJ900', DH8D: 'Dash 8 Q400', C56X: 'Cessna Citation Excel',
  PC12: 'Pilatus PC-12', BCS3: 'Airbus A220-300',
};

export function aircraftName(code) {
  return code ? TYPE_NAMES[code] || code : null;
}
