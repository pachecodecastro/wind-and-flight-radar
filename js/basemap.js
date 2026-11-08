// Vector basemap from Natural Earth (via world-atlas TopoJSON). No tile server:
// land is a flat fill under the color field, coastlines and borders sit above it.
export async function loadBasemap(map) {
  let topo = window.__BASEMAP__;
  if (!topo) {
    const res = await fetch('data/countries-50m.json');
    topo = await res.json();
  }
  const land = topojson.feature(topo, topo.objects.land);
  const coast = topojson.mesh(topo, topo.objects.land);
  const borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);

  map.createPane('landPane').style.zIndex = 200;
  map.createPane('linesPane').style.zIndex = 300;
  for (const name of ['landPane', 'linesPane']) map.getPane(name).style.pointerEvents = 'none';

  L.geoJSON(land, {
    pane: 'landPane',
    renderer: L.canvas({ pane: 'landPane', padding: 0.4 }),
    interactive: false,
    style: { stroke: false, fill: true, fillColor: '#1C3D55', fillOpacity: 1 },
  }).addTo(map);

  const lines = L.canvas({ pane: 'linesPane', padding: 0.4 });
  L.geoJSON(borders, {
    pane: 'linesPane', renderer: lines, interactive: false,
    style: { color: '#071521', weight: 0.8, opacity: 0.5, dashArray: '3 3' },
  }).addTo(map);
  L.geoJSON(coast, {
    pane: 'linesPane', renderer: lines, interactive: false,
    style: { color: '#071521', weight: 1.1, opacity: 0.85 },
  }).addTo(map);
}
