import { useEffect, useRef } from "react";
import gsap from "gsap";
import { scrollToId } from "~/lib/scroll";
import { Button } from "../ui/Button";

/** Live-looking counter: concept volume moved today, ticking its last digits on the shared clock. */
function Ticker() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = Date.now();
    const base = 41288113.27;
    const tick = () => {
      const v = base + ((Date.now() - start) / 1000) * 1873.41;
      if (ref.current) ref.current.textContent = `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return <span ref={ref} className="tnum">$41,288,113.27</span>;
}

export function Hero() {
  return (
    <section data-key="hero" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col justify-end pb-14 pt-[44svh] lg:justify-center lg:pt-24">
      <div className="site grid grid-cols-12">
        <div className="col-span-12 lg:col-span-6">
          <p className="text-label flex items-center gap-2 text-mist">
            <span className="live-dot size-1.5 rounded-full bg-arrived" />
            Moved on Arcway today <span className="font-mono text-paper"><Ticker /></span>
            <span className="opacity-60">· concept</span>
          </p>
          <h1 id="hero-title" className="text-display mt-6 max-w-[11ch]">
            Send money like you send a message.
          </h1>
          <p className="text-body measure mt-6 text-mist">
            Pay suppliers, contractors and customers in 60 countries in seconds. Arcway moves it over stablecoins and pays out in local
            currency. Nobody touches crypto.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button to="/developers#keys" arrow>
              Open an account
            </Button>
            <Button variant="secondary" href="#journey" onClick={(e) => void (scrollToId("journey") && e.preventDefault())}>
              Follow a payment
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
