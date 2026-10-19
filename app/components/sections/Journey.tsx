import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTier } from "~/lib/experience";
import { journeyProgress } from "~/lib/keys";
import { overlay, scene } from "~/lib/sceneState";

const STEPS = [
  { n: "01", title: "Convert", line: "Naira in, dollars out: converted to USDC at a locked rate.", at: 0.05 },
  { n: "02", title: "Settle", line: "Moves on-chain, final in seconds, visible end to end.", at: 0.36 },
  { n: "03", title: "Pay out", line: "Lands as euros in a Berlin bank account, by SEPA Instant.", at: 0.86 },
];

/** Pinned: one payment, Lagos to Berlin. Steps, timer and 3D all read the same progress. */
export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const tier = useTier();
  const [step, setStep] = useState(-1);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (tier === "pending") return;
    const st = ScrollTrigger.create({ trigger: ref.current, start: "top top", end: "+=320%", pin: true, anticipatePin: 1 });
    let last = -2;
    const tick = () => {
      const p = journeyProgress(scene.scrollY);
      const s = p <= 0 ? -1 : p < STEPS[1].at ? 0 : p < STEPS[2].at ? 1 : 2;
      if (s !== last) setStep((last = s));
      STEPS.forEach((x, i) => {
        const end = STEPS[i + 1]?.at ?? 1;
        const k = Math.min(1, Math.max(0, (p - x.at) / (end - x.at)));
        const el = bars.current[i];
        if (el) el.style.transform = `scaleX(${k.toFixed(4)})`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [tier]);

  return (
    <section ref={ref} id="journey" data-key="journey" aria-labelledby="journey-title" className="relative h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] bg-gradient-to-r from-abyss/90 via-abyss/50 to-transparent lg:block" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-abyss via-abyss/80 to-transparent lg:hidden" aria-hidden />
      <div className="site relative grid h-full grid-cols-12 content-end pb-20 lg:content-center lg:pb-0">
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-label text-mist">One payment · Lagos → Berlin</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[13px]">
              <span className="size-1.5 rounded-full bg-signal" />
              <span ref={(el) => void (overlay.timer[0] = el)} className="tnum">0.0 s</span>
            </span>
          </div>
          <h2 id="journey-title" className="text-h2 mt-4 max-w-[12ch]">Three steps. About four seconds.</h2>
          <ol className="mt-8 border-t border-white/15">
            {STEPS.map((s, i) => (
              <li key={s.n} className="border-b border-white/15 py-4" aria-current={step === i ? "step" : undefined}>
                <p className={`flex items-baseline gap-3 transition-colors duration-300 ${step === i ? "text-paper" : "text-mist/70"}`}>
                  <span className="font-mono text-[11px]">{s.n}</span>
                  <span className={`font-medium transition-all duration-300 ${step === i ? "text-[22px]" : "text-[17px]"}`}>{s.title}</span>
                </p>
                <p className={`pl-7 pt-1 text-[15px] text-mist transition-opacity duration-300 ${step === i ? "opacity-100" : "opacity-50"}`}>{s.line}</p>
                <span className="mt-3 block h-px w-full bg-white/10" aria-hidden>
                  <span ref={(el) => void (bars.current[i] = el)} className="block h-px w-full origin-left scale-x-0 bg-signal" />
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.04em] text-mist/70">Concept amount and timing</p>
        </div>
      </div>
      <p className="sr-only">The payment rises from Lagos through three glass layers, Convert, Settle and Pay out, then travels as a blue arc over the globe and lands in Berlin as €9,214.50, 4.2 seconds after it left.</p>
    </section>
  );
}
