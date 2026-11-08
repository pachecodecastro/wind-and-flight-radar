// Builds dist/rosa-dos-ventos.html: the whole app in one file (scripts, styles and
// map data inlined). Useful for hosts that serve a single page, or for sharing a demo.
// Usage: npm install && npm run build:standalone
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');
const inlineScript = (code) => `<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`;

const bundle = await build({
  entryPoints: [new URL('js/app.js', root).pathname],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2020'],
});
const appJs = bundle.outputFiles[0].text;

const [html, appCss, leafletCss, leafletJs, topojsonJs, basemap, icon] = await Promise.all([
  read('index.html'),
  read('css/style.css'),
  read('vendor/leaflet/leaflet.css'),
  read('vendor/leaflet/leaflet.js'),
  read('vendor/topojson-client.min.js'),
  read('data/countries-50m.json'),
  read('icons/icon.svg'),
]);

const iconUri = `data:image/svg+xml,${encodeURIComponent(icon)}`;
let out = html
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${iconUri}">`)
  .replace('<link rel="stylesheet" href="vendor/leaflet/leaflet.css">', () => `<style>${leafletCss}</style>`)
  .replace('<link rel="stylesheet" href="css/style.css">', () => `<style>${appCss}</style>`)
  .replace('<script src="vendor/leaflet/leaflet.js"></script>', () => inlineScript(leafletJs))
  .replace('<script src="vendor/topojson-client.min.js"></script>', () => inlineScript(topojsonJs))
  .replace('<script type="module" src="js/app.js"></script>', () =>
    inlineScript(`window.__STANDALONE__=true;window.__BASEMAP__=${basemap};`) + '\n' + inlineScript(appJs));

for (const leftover of ['src="vendor/', 'href="css/', 'src="js/']) {
  if (out.includes(leftover)) throw new Error(`Not inlined: ${leftover}`);
}

await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/rosa-dos-ventos.html', root), out);
console.log(`dist/rosa-dos-ventos.html  ${(out.length / 1024).toFixed(0)} KB`);
