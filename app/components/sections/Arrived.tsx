import { Reveal } from "../ui/Reveal";

export function Arrived() {
  return (
    <section data-key="arrived" aria-labelledby="arr-title" className="relative flex min-h-[90svh] items-end pb-24 lg:items-center lg:pb-0">
      <Reveal className="site text-center">
        <p className="text-label text-mist">Arrived</p>
        <h2 id="arr-title" className="mt-5">
          <span className="tnum block font-mono text-[clamp(48px,2.6rem+4.6vw,96px)] font-medium leading-none tracking-[-0.03em] text-arrived">€9,214.50</span>
          <span className="text-h3 mt-4 block">arrived in Berlin. 4.2 seconds.</span>
        </h2>
        <p className="mt-4 text-[15px] text-mist">Sent as ₦15,750,000 from Lagos. Fee included. <span className="font-mono text-[11px] uppercase tracking-[0.04em]">Concept figures</span></p>
      </Reveal>
    </section>
  );
}
