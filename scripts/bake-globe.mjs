// Bakes the globe's land dots at build time: a sunflower (Fibonacci) spiral of evenly spaced
// points, kept only where the Natural Earth land mask (public domain, via world-atlas) says
// there is land. Output: Int16 lat/lon pairs (× 300) — tiny, and nothing to compute in the browser.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url)));
const land = feature(topo, topo.objects.land);

function bake(n) {
  const out = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = ((((i * golden * 180) / Math.PI) % 360) + 540) % 360 - 180;
    if (lat < -60) continue; // skip Antarctica: it only reads as noise from these angles
    if (geoContains(land, [lon, lat])) out.push(Math.round(lat * 300), Math.round(lon * 150));
  }
  return Int16Array.from(out);
}

mkdirSync(new URL("../public/globe/", import.meta.url), { recursive: true });
for (const [name, n] of [["dots-desktop", 64000], ["dots-phone", 28000]]) {
  const t0 = Date.now();
  const a = bake(n);
  writeFileSync(new URL(`../public/globe/${name}.bin`, import.meta.url), Buffer.from(a.buffer));
  console.log(name, a.length / 2, "dots", `${(a.byteLength / 1024).toFixed(0)} KB`, `${Date.now() - t0} ms`);
}
