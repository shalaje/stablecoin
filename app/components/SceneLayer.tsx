import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTier } from "~/lib/experience";
import { scene } from "~/lib/sceneState";

const Stage = lazy(() => import("~/three/Stage"));

/**
 * The single persistent canvas behind the page. Scene sections are transparent and tagged
 * [data-scene]; everything else is opaque paper that covers it, and the clock stops driving
 * the renderer while no scene section is on screen.
 *
 * Loading is drawn, not hidden: the speaker appears as a thin line drawing of its parts while
 * a mono counter runs, then fills into the render.
 */
export function SceneLayer({ poster = "/posters/hero.webp", idle = false }: { poster?: string; idle?: boolean }) {
  const tier = useTier();
  const live = tier === "full" || tier === "mobile";
  const [mountStage, setMountStage] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [pct, setPct] = useState(0);
  const counter = useRef({ v: 0 });


  useEffect(() => {
    if (!live) return;
    scene.fill = 0;
    // stage 1: the 3D chunk downloads (counter eases toward 70%)
    const tw = gsap.to(counter.current, { v: 70, duration: 2.2, ease: "power2.out", onUpdate: () => (setPct(Math.round(counter.current.v)), (scene.loader = counter.current.v / 100)) });
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const go = () => setMountStage(true);
    const id = ric ? ric(go, { timeout: 900 }) : window.setTimeout(go, 250);
    return () => {
      tw.kill();
      if (!ric) clearTimeout(id);
    };
  }, [live]);

  // stage 2: first frames drawn → counter to 100, then ink fills to matte
  useEffect(() => {
    if (!ready) return;
    gsap.to(counter.current, { v: 100, duration: 0.6, ease: "power1.out", overwrite: true, onUpdate: () => (setPct(Math.round(counter.current.v)), (scene.loader = counter.current.v / 100)) });
    const shot = new URLSearchParams(location.search).get("shot");
    if (shot) {
      scene.fill = 1;
      scene.loader = 0;
      return;
    }
    gsap.to(scene, { fill: 1, duration: 1.2, delay: 0.5, ease: "power2.inOut" });
  }, [ready]);

  useEffect(() => {
    if (!live) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    if (!els.length) return;
    const on = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? on.add(e.target) : on.delete(e.target);
        setActive(on.size > 0);
      },
      { rootMargin: "10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [live, tier]);

  const done = pct >= 100;
  return (
    <div id="stage" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100svh] bg-abyss" aria-hidden>
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[600ms]"
        style={{ opacity: live && mountStage ? 0 : 1 }}
        decoding="async"
      />
      {live && mountStage && (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Stage lite={tier === "mobile"} active={active} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
      {live && (
        <div className={`overlay absolute bottom-6 left-6 font-mono text-[12px] uppercase tracking-[0.06em] text-mist transition-opacity duration-700 ${done ? "opacity-0 delay-[1600ms]" : "opacity-100"}`}>
          <span className="mr-3">Lagos → Berlin</span>
          <span className="tabular-nums text-paper">{String(pct).padStart(3, "0")}%</span>
          <span className="mt-2 block h-px w-full bg-white/15">
            <span className="block h-px bg-signal" style={{ width: `${pct}%` }} />
          </span>
        </div>
      )}
    </div>
  );
}
