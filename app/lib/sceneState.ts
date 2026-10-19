/** One bridge between the page and the globe. GSAP writes, the scene reads, every frame. */
export const scene = {
  scrollY: 0,
  velocity: 0,
  px: 0,
  py: 0,
  tilt: true,
  phone: false,
  still: false,
  time: 0,
  shot: "" as string,
  loader: 0, // 0–1: the loader arc draws Lagos → Berlin
  fill: 0, // globe fade-in after load
  /** calculator route (Send section); `aim` tweens 0→1 when it changes */
  send: { from: "lagos", to: "berlin", amount: "₦15,750,000" },
};

/** The calculator's route changes rarely; the 3D re-aims when it does. */
type RouteListener = (r: { from: string; to: string }) => void;
let routeListeners: RouteListener[] = [];
export function setRoute(from: string, to: string) {
  scene.send.from = from;
  scene.send.to = to;
  routeListeners.forEach((f) => f({ from, to }));
}
export function onRoute(f: RouteListener) {
  routeListeners.push(f);
  return () => void (routeListeners = routeListeners.filter((x) => x !== f));
}

/** HTML elements the canvas positions over 3D points every frame. */
export const overlay = {
  chip: null as HTMLElement | null,
  chipAmount: null as HTMLElement | null,
  chipState: null as HTMLElement | null,
  layerLabels: [] as (HTMLElement | null)[],
  pinFrom: null as HTMLElement | null,
  pinTo: null as HTMLElement | null,
  timer: [] as (HTMLElement | null)[],
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
