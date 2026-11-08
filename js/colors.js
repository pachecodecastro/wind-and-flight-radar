// Color scales for the wind and temperature layers.
export const SCALES = {
  wind: {
    key: 'wind',
    label: 'Vento',
    unit: 'km/h',
    min: 0,
    max: 110,
    ticks: [0, 20, 40, 60, 80, 100],
    stops: [
      [0, '#2B4C9B'], [10, '#2E77B8'], [20, '#2FA3B5'], [30, '#36B37E'],
      [40, '#8CC63E'], [50, '#F2D43A'], [60, '#F59E2E'], [75, '#E8502F'],
      [90, '#C21E5B'], [110, '#8E2A99'],
    ],
  },
  temp: {
    key: 'temp',
    label: 'Temperatura',
    unit: '°C',
    min: -10,
    max: 44,
    ticks: [-10, 0, 10, 20, 30, 40],
    stops: [
      [-10, '#5B3FA0'], [0, '#3A6FC2'], [8, '#33A6C9'], [14, '#3DBB8A'],
      [20, '#B6D33C'], [26, '#F5C935'], [32, '#EF7A2E'], [38, '#D63A3A'],
      [44, '#8E1F4A'],
    ],
  },
};

const LUT_SIZE = 256;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Precomputed RGB lookup table, so per-pixel coloring is a single array read.
export function buildLut(scale) {
  const lut = new Uint8ClampedArray(LUT_SIZE * 3);
  const stops = scale.stops.map(([v, c]) => [v, hexToRgb(c)]);
  for (let i = 0; i < LUT_SIZE; i++) {
    const v = scale.min + ((scale.max - scale.min) * i) / (LUT_SIZE - 1);
    let k = 0;
    while (k < stops.length - 2 && v > stops[k + 1][0]) k++;
    const [v0, c0] = stops[k];
    const [v1, c1] = stops[k + 1];
    const f = Math.max(0, Math.min(1, (v - v0) / (v1 - v0)));
    for (let j = 0; j < 3; j++) lut[i * 3 + j] = c0[j] + (c1[j] - c0[j]) * f;
  }
  return lut;
}

export function lutIndex(scale, v) {
  const i = Math.round(((v - scale.min) / (scale.max - scale.min)) * (LUT_SIZE - 1));
  return i < 0 ? 0 : i >= LUT_SIZE ? LUT_SIZE - 1 : i;
}

export function cssGradient(scale) {
  const span = scale.max - scale.min;
  const parts = scale.stops.map(([v, c]) => `${c} ${(((v - scale.min) / span) * 100).toFixed(1)}%`);
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}
