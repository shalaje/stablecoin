import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

let lenis: Lenis | null = null;
let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Smooth scroll on desktop only. One clock: Lenis is stepped by GSAP's ticker and
 * every Lenis scroll event updates ScrollTrigger, so pins and scrubs never drift.
 */
export async function startLenis() {
  registerGsap();
  if (lenis) return lenis;
  const { default: LenisCtor } = await import("lenis");
  lenis = new LenisCtor({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function tick(time: number) {
  lenis?.raf(time * 1000);
}

export function stopLenis() {
  gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

/** Scroll to a homepage section by id, through Lenis when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
  return true;
}
