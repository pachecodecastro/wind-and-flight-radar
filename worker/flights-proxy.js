// Cloudflare Worker that lets the browser read live aircraft from adsb.lol.
// adsb.lol sends no CORS headers, so a page on GitHub Pages cannot call it directly.
//
//   GET /point/{lat}/{lon}/{radius_nm}  ->  https://api.adsb.lol/v2/point/{lat}/{lon}/{radius_nm}
//
// Optional variable ALLOWED_ORIGINS (comma separated), for example
//   https://quintopontocardeal.org,https://pachecodecastro.github.io
// limits which sites the browser will accept answers for. It is a courtesy filter,
// not authentication: scripts outside a browser can still call the Worker.

const UPSTREAM = 'https://api.adsb.lol/v2/point';
const MAX_RADIUS_NM = 250;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const allowOrigin = allowed.length === 0 ? '*' : allowed.includes(origin) ? origin : null;
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin || 'null',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return reply({ error: 'Only GET is supported' }, 405, cors);
    if (!allowOrigin) return reply({ error: 'Origin not allowed' }, 403, cors);

    const m = new URL(request.url).pathname.match(/^\/point\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/(\d+)\/?$/);
    if (!m) return reply({ error: 'Use /point/{lat}/{lon}/{radius_nm}' }, 400, cors);
    const lat = Number(m[1]);
    const lon = Number(m[2]);
    const radius = Math.min(MAX_RADIUS_NM, Math.max(1, Number(m[3])));
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return reply({ error: 'Coordinates out of range' }, 400, cors);

    let upstream;
    try {
      upstream = await fetch(`${UPSTREAM}/${lat.toFixed(2)}/${lon.toFixed(2)}/${radius}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'wind-and-flight-radar proxy (+https://github.com/pachecodecastro/wind-and-flight-radar)',
        },
      });
    } catch {
      return reply({ error: 'adsb.lol unreachable' }, 502, cors);
    }
    if (!upstream.ok) return reply({ error: `adsb.lol answered ${upstream.status}` }, 502, cors);

    return new Response(upstream.body, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=5' },
    });
  },
};

function reply(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
