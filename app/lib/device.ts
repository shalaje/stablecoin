/**
 * Experience tier, decided once on the client:
 *  - "full":   desktop GPU → live scene, pinned How it works, Lenis
 *  - "mobile": touch / narrow → lighter live scene for hero + problem, stacked cards elsewhere
 *  - "still":  prefers-reduced-motion → the live speaker, but no rotation, fall or settle
 *  - "poster": no WebGL or a software renderer → poster images only
 * Pre-rendered HTML always ships the poster/stacked layout, so it is complete without JS.
 */
export type Tier = "pending" | "full" | "mobile" | "still" | "poster";

let cached: Tier | null = null;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectTier(): Tier {
  if (cached) return cached;
  const q = new URLSearchParams(window.location.search);
  const forced = q.get("tier");
  if (forced === "full" || forced === "mobile" || forced === "poster" || forced === "still") return (cached = forced);
  const reduce = prefersReducedMotion();

  let renderer = "";
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (cached = "poster");
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return (cached = "poster");
  }
  // Software rasterisers cannot hold frame rate: posters instead of a stuttering scene.
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return (cached = "poster");

  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
  if (weak) return (cached = "poster");

  // reduced motion keeps the real speaker, but still: no rotation, no fall
  if (reduce) return (cached = "still");
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 1024;
  return (cached = coarse || narrow ? "mobile" : "full");
}
