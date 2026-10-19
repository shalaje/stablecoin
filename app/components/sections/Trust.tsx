import { Reveal } from "../ui/Reveal";

const ICON = {
  licence: <path d="M14 6h20l6 6v30H14z M34 6v6h6 M20 22h14 M20 28h14 M20 34h8" />,
  audit: <path d="M8 40h32 M12 40V22 M20 40V16 M28 40V24 M36 40V12 M10 18l10-8 8 6 10-8" />,
  reserve: <path d="M24 6 8 14v4h32v-4z M12 18v18 M20 18v18 M28 18v18 M36 18v18 M6 40h36" />,
  security: <path d="M24 5 9 11v11c0 9 6.5 16.5 15 20 8.5-3.5 15-11 15-20V11z M17 23l5 5 9-10" />,
};
const CARDS = [
  { icon: "licence", title: "Licensed partners", body: "Money is held and paid out through regulated banking partners in each corridor." },
  { icon: "audit", title: "Audited every month", body: "Reserves and flows are checked by an independent auditor, with reports published." },
  { icon: "reserve", title: "Reserves held 1:1", body: "Every stablecoin in transit is backed one to one by cash and short-term bonds." },
  { icon: "security", title: "Bank-grade security", body: "Hardware-backed keys, SSO, roles and approvals, and a full audit log." },
] as const;

export function Trust() {
  return (
    <section id="trust" data-key="trust" aria-labelledby="trust-title" className="relative z-10 bg-paper text-ink section-pad">
      <div className="site">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-muted">Trust and compliance</p>
            <h2 id="trust-title" className="text-h2 mt-4">Fast, and boring where it matters.</h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted lg:col-span-5 lg:text-right">Concept claims for a fictional company · no real licences implied</p>
        </Reveal>
        <ul className="no-bar -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {CARDS.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 90} className="w-[78%] shrink-0 snap-start md:w-auto">
              <article className="h-full rounded-card border border-line bg-white p-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
                  {ICON[c.icon]}
                </svg>
                <h3 className="text-h3 mt-8">{c.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
