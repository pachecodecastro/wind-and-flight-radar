// Settings for Rosa dos Ventos. Edit these before deploying.
export const CONFIG = {
  // Base URL of your flights proxy (see worker/flights-proxy.js), without a trailing slash.
  // Example: 'https://rdv-flights.your-account.workers.dev'
  // Leave empty to run the flight layer as a clearly labelled simulation.
  flightsProxy: '',

  // Initial view: [[south, west], [north, east]]
  startBounds: [[27, -30], [52, 8]],
  // On phones the dock covers the bottom of the map, so the center sits a little south.
  startPhone: { center: [35.5, -11.5], zoom: 4 },

  // Forecast window shown on the timeline, in hours from now.
  forecastHours: 48,

  // Upper bound on grid points requested from Open-Meteo per view. Each point
  // counts as one call against the free tier (600 per minute, 10 000 per day),
  // so the app also waits 35 s between grid requests.
  maxGridPoints: 300,

  flightsRefreshMs: 8000,
  requestTimeoutMs: 9000,

  repoUrl: 'https://github.com/pachecodecastro/wind-and-flight-radar',
  author: 'Tiago Castro',
  authorSite: 'Quinto Ponto Cardeal',
};
