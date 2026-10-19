/** Cities, currencies and the maths that puts them on a unit globe. No three.js here. */
export type City = { id: string; name: string; lat: number; lon: number; currency: string };

export const CITIES: City[] = [
  { id: "lagos", name: "Lagos", lat: 6.52, lon: 3.38, currency: "NGN" },
  { id: "berlin", name: "Berlin", lat: 52.52, lon: 13.4, currency: "EUR" },
  { id: "nairobi", name: "Nairobi", lat: -1.29, lon: 36.82, currency: "KES" },
  { id: "accra", name: "Accra", lat: 5.6, lon: -0.19, currency: "GHS" },
  { id: "london", name: "London", lat: 51.51, lon: -0.13, currency: "GBP" },
  { id: "newyork", name: "New York", lat: 40.71, lon: -74.0, currency: "USD" },
  { id: "mexico", name: "Mexico City", lat: 19.43, lon: -99.13, currency: "MXN" },
  { id: "saopaulo", name: "São Paulo", lat: -23.55, lon: -46.63, currency: "BRL" },
  { id: "mumbai", name: "Mumbai", lat: 19.08, lon: 72.88, currency: "INR" },
  { id: "manila", name: "Manila", lat: 14.6, lon: 120.98, currency: "PHP" },
  { id: "dubai", name: "Dubai", lat: 25.2, lon: 55.27, currency: "AED" },
  { id: "joburg", name: "Johannesburg", lat: -26.2, lon: 28.05, currency: "ZAR" },
];
// extra endpoints for the network arcs (no currency picker entry)
export const HUBS: [number, number][] = [
  [35.68, 139.69], [1.35, 103.82], [-33.87, 151.21], [48.86, 2.35], [40.42, -3.7], [41.9, 12.5], [52.37, 4.9],
  [59.33, 18.07], [55.75, 37.62], [30.04, 31.24], [33.57, -7.59], [14.72, -17.47], [-4.32, 15.31], [9.03, 38.74],
  [24.71, 46.68], [31.52, 74.36], [13.76, 100.5], [-6.21, 106.85], [37.57, 126.98], [22.32, 114.17], [43.65, -79.38],
  [34.05, -118.24], [41.88, -87.63], [25.76, -80.19], [4.71, -74.07], [-12.05, -77.04], [-34.6, -58.38], [-33.45, -70.67],
  [19.43, -99.13], [45.5, -73.57], [60.17, 24.94], [50.08, 14.44], [47.5, 19.04], [44.43, 26.1], [38.72, -9.14],
];

export const byCurrency = (code: string) => CITIES.find((c) => c.currency === code)!;
export const LAGOS = CITIES[0];
export const BERLIN = CITIES[1];

/** Unit vector for lat/lon (y up, lon 0 facing +z). */
export function vec(lat: number, lon: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  return [Math.cos(phi) * Math.sin(lam), Math.sin(phi), Math.cos(phi) * Math.cos(lam)];
}

/** Point along the great circle a→b at t, lifted into an arc (in globe radii). */
export function arcPoint(a: [number, number, number], b: [number, number, number], t: number, lift: number): [number, number, number] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const s = Math.sin(om) || 1;
  const k0 = Math.sin((1 - t) * om) / s;
  const k1 = Math.sin(t * om) / s;
  const r = 1 + lift * Math.sin(Math.PI * t);
  return [(a[0] * k0 + b[0] * k1) * r, (a[1] * k0 + b[1] * k1) * r, (a[2] * k0 + b[2] * k1) * r];
}
export function arcLift(a: [number, number, number], b: [number, number, number]) {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return 0.08 + Math.acos(Math.min(1, Math.max(-1, dot))) * 0.18;
}
