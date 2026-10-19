import { useState } from "react";
import { Link } from "react-router";
import { Reveal } from "../ui/Reveal";

export const CODE = `import Arcway from "@arcway/node";

const arcway = new Arcway(process.env.ARCWAY_KEY);

const payment = await arcway.payments.create({
  amount: 15_750_000,
  from: "NGN",
  to: { currency: "EUR", iban: "DE89 3704 0044 0532 0130 00" },
  reference: "INV-2026-0419",
});
// payment.status → "converting" → "settling" → "paying_out" → "arrived"`;

export function CodeBlock({ code = CODE }: { code?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-card bg-[#0B1122] text-[#D6DCEB]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[12px] text-mist">payment.ts</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="rounded-full border border-white/15 px-3 py-1 font-mono text-[12px] hover:border-white/40"
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] md:p-5"><code>{code}</code></pre>
    </div>
  );
}

export function DevelopersStrip() {
  return (
    <section id="developers" data-key="developers" aria-labelledby="dev-title" className="relative z-10 bg-paper text-ink section-pad">
      <div className="site grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <Reveal className="order-2 lg:order-1 lg:col-span-7">
          <CodeBlock />
        </Reveal>
        <Reveal className="order-1 lg:order-2 lg:col-span-4 lg:col-start-9" delay={100}>
          <p className="text-label text-muted">Developers</p>
          <h2 id="dev-title" className="text-h2 mt-4">Ten lines to your first payout.</h2>
          <p className="text-body mt-5 text-muted">One API for quotes, payments and webhooks. Every state change arrives as an event, so your books update themselves.</p>
          <Link to="/developers" className="mt-8 inline-flex h-12 items-center gap-2 rounded-btn bg-signal px-5 font-medium text-paper hover:bg-[#4560FF]">Read the docs <span aria-hidden>→</span></Link>
        </Reveal>
      </div>
    </section>
  );
}
