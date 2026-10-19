/**
 * Scroll → scene. Keyframes are tied to real section boundaries (re-measured on every
 * ScrollTrigger refresh). Each key names a camera shot plus a few numbers; the journey
 * segment is special: its local progress drives the camera spline, the arc and the timer.
 */
export type Shot = "hero" | "send" | "journey" | "land" | "pullback" | "horizon" | "line";
export type KeyVals = { dim: number; rate: number; spin: number };
type Def = { key: string; at: "start" | "end"; shot: Shot } & KeyVals;

export const DEFS: Def[] = [
  { key: "hero", at: "start", shot: "hero", dim: 1, rate: 0.02, spin: 1 },
  { key: "send", at: "start", shot: "send", dim: 1, rate: 0.01, spin: 0 },
  { key: "send", at: "end", shot: "send", dim: 1, rate: 0.01, spin: 0 },
  { key: "journey", at: "start", shot: "journey", dim: 1, rate: 0, spin: 0 },
  { key: "journey", at: "end", shot: "land", dim: 1, rate: 0, spin: 0 },
  { key: "arrived", at: "end", shot: "land", dim: 1, rate: 0, spin: 0 },
  { key: "network", at: "start", shot: "pullback", dim: 1, rate: 0.35, spin: 0.6 },
  { key: "network", at: "end", shot: "horizon", dim: 1, rate: 1, spin: 0.6 },
  { key: "dashboard", at: "start", shot: "horizon", dim: 0.3, rate: 0, spin: 0.3 },
  { key: "footer", at: "start", shot: "line", dim: 0.6, rate: 0, spin: 0.2 },
];

export type Key = { y: number; shot: Shot; key: string } & KeyVals;
export const keys = { list: [] as Key[], max: 1 };

const topOf = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

export function measureKeys() {
  const vh = window.innerHeight;
  const list: Key[] = [];
  for (const d of DEFS) {
    const el = document.querySelector(`[data-key="${d.key}"]`);
    if (!el) continue;
    const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement! : el;
    const pinned = spacer !== el;
    let y: number;
    if (d.key === "hero") y = 0;
    else if (d.at === "start") y = pinned ? topOf(spacer) : topOf(el) - vh * 0.55;
    else y = pinned ? topOf(spacer) + (spacer as HTMLElement).offsetHeight - vh : topOf(el) + (el as HTMLElement).offsetHeight - vh * 0.6;
    list.push({ y: Math.max(0, y), shot: d.shot, key: d.key, dim: d.dim, rate: d.rate, spin: d.spin });
  }
  list.sort((a, b) => a.y - b.y);
  keys.list = list;
  keys.max = Math.max(1, document.documentElement.scrollHeight - vh);
}

/** The two keys around a scroll position and the progress between them. */
export function segment(y: number) {
  const k = keys.list;
  if (!k.length) return null;
  if (y <= k[0].y) return { a: k[0], b: k[0], t: 0 };
  for (let i = 0; i < k.length - 1; i++) if (y <= k[i + 1].y) return { a: k[i], b: k[i + 1], t: k[i + 1].y === k[i].y ? 1 : (y - k[i].y) / (k[i + 1].y - k[i].y) };
  const last = k[k.length - 1];
  return { a: last, b: last, t: 1 };
}

/** Journey progress 0–1, straight from scroll, so scrolling back rewinds the payment. */
export function journeyProgress(y: number) {
  const a = keys.list.find((k) => k.key === "journey" && k.shot === "journey");
  const b = keys.list.find((k) => k.key === "journey" && k.shot === "land");
  if (!a || !b) return 0;
  return Math.min(1, Math.max(0, (y - a.y) / Math.max(1, b.y - a.y)));
}

export function sectionAt(y: number) {
  let cur = "";
  for (const k of keys.list) if (y >= k.y) cur = k.key;
  return cur;
}
