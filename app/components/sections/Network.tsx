import { Counter } from "../ui/Counter";
import { Reveal } from "../ui/Reveal";

const STATS = [
  { to: 64, label: "Countries" },
  { to: 38, label: "Currencies" },
  { to: 140, suffix: "+", label: "Payout methods" },
  { to: 4.2, decimals: 1, suffix: " s", label: "Median arrival" },
];

export function Network() {
  return (
    <section id="network" data-key="network" aria-labelledby="net-title" className="relative min-h-[150svh] section-pad">
      <div className="site sticky top-[16svh]">
        <Reveal className="mx-auto max-w-[40rem] text-center">
          <p className="text-label text-mist">Network</p>
          <h2 id="net-title" className="text-h2 mt-4">Thousands of payments, all landing.</h2>
        </Reveal>
        <dl className="mx-auto mt-12 grid max-w-[60rem] grid-cols-2 gap-y-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <dd className="font-mono text-[40px] font-medium leading-none md:text-[52px]">
                <Counter to={s.to} decimals={s.decimals ?? 0} suffix={s.suffix ?? ""} className="tnum" />
              </dd>
              <dt className="text-label mt-3 text-mist">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-mist/70">Concept figures</p>
      </div>
    </section>
  );
}
