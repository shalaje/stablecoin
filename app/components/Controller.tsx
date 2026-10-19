import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTier } from "~/lib/experience";
import { keys, measureKeys, sectionAt } from "~/lib/keys";
import { overlay, scene } from "~/lib/sceneState";
import { scrollToId } from "~/lib/scroll";

const CHAPTERS: Record<string, string> = { send: "Send", journey: "Journey", arrived: "Journey", network: "Network", dashboard: "Dashboard", trust: "Trust" };

/**
 * The master timeline (one ScrollTrigger, scrub 1) plus everything that hangs off the same
 * clock: keyframe measuring, the chapter pill, the payment chip layer and the phone send bar.
 */
export function Controller() {
  const tier = useTier();
  const [chapter, setChapter] = useState("");
  const [bar, setBar] = useState(false);

  useEffect(() => {
    if (tier === "pending") return;
    const onRefresh = () => measureKeys();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    measureKeys();
    const tw = gsap.to(scene, {
      scrollY: () => keys.max,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => (scene.velocity = s.getVelocity()) },
    });
    let last = "";
    let lastBar = false;
    const tick = () => {
      const ch = CHAPTERS[sectionAt(scene.scrollY)] ?? "";
      if (ch !== last) setChapter((last = ch));
      const b = window.scrollY > innerHeight * 0.8 && sectionAt(scene.scrollY) !== "send" && !document.documentElement.classList.contains("at-footer");
      if (b !== lastBar) setBar((lastBar = b));
    };
    gsap.ticker.add(tick);
    const t = setTimeout(() => ScrollTrigger.refresh(), 700);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      clearTimeout(t);
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [tier]);

  const live = tier === "full" || tier === "mobile";

  return (
    <>
      {/* the payment chip: one HTML element that rides the 3D arc */}
      {live && (
        <div className="chip-layer pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
          <div ref={(el) => void (overlay.chip = el)} className="chip absolute left-0 top-0 opacity-0 will-change-transform">
            <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)]">
              <div className="flex items-center gap-2.5 rounded-full border border-signal/70 bg-abyss/85 py-1.5 pl-2 pr-3.5 backdrop-blur">
                <span className="chip-dot size-2 rounded-full bg-signal" />
                <span className="flex flex-col leading-tight">
                  <span ref={(el) => void (overlay.chipAmount = el)} className="chip-amount tnum font-mono text-[13px] text-paper">₦15,750,000</span>
                  <span ref={(el) => void (overlay.chipState = el)} className="font-mono text-[10px] uppercase tracking-[0.04em] text-mist">Ready in Lagos</span>
                </span>
              </div>
              <span className="mx-auto block h-3.5 w-px bg-signal/70" />
            </div>
          </div>
          {["Convert", "Settle", "Pay out"].map((n, i) => (
            <div key={n} ref={(el) => void (overlay.layerLabels[i] = el)} className="absolute left-0 top-0 opacity-0 will-change-transform">
              <span className="layer-label ml-[118px] inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-abyss/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-mist">
                0{i + 1} · {n}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 hidden justify-center lg:flex" aria-hidden>
        <div className={`flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-abyss/80 px-4 text-paper backdrop-blur transition-[opacity,transform] duration-300 ease-[var(--ease)] ${chapter ? "opacity-100" : "translate-y-3 opacity-0"}`}>
          <span className="size-1.5 rounded-full bg-signal" />
          <span className="text-[14px] font-medium">{chapter || " "}</span>
        </div>
      </div>

      {/* phones: a sticky Send money bar, as the reference apps keep their main action in reach */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-abyss/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 ease-[var(--ease)] lg:hidden ${bar ? "" : "translate-y-full"}`}>
        <div className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] uppercase tracking-[0.04em] text-mist">{chapter || "Arcway"} · concept</span>
          <a href="#send" onClick={(e) => void (scrollToId("send") && e.preventDefault())} className="inline-flex h-11 items-center rounded-btn bg-signal px-5 text-[15px] font-medium text-paper">
            Send money
          </a>
        </div>
      </div>
    </>
  );
}
