import { useState } from "react";
import type { Route } from "./+types/developers";
import { pageMeta } from "~/lib/site";
import { ExperienceProvider } from "~/lib/experience";
import { Nav } from "~/components/Nav";
import { Footer } from "~/components/Footer";
import { CodeBlock } from "~/components/sections/Developers";

export const meta: Route.MetaFunction = () =>
  pageMeta("Developers · Arcway (concept)", "One API for quotes, cross-border payments and webhooks. Payment states, a code sample and sandbox keys. A design concept by Nova Digital Studio.", "/developers");

const STATES = [
  ["created", "Quote locked for 30 seconds; the payment is accepted.", "payment.created"],
  ["converting", "Local currency in, converted to USDC at the locked rate.", "payment.converting"],
  ["settling", "Moving on-chain; final after one confirmation.", "payment.settling"],
  ["paying_out", "Converted to the recipient's currency and sent on local rails.", "payment.paying_out"],
  ["arrived", "Funds are in the recipient's account. Median 4.2 s (concept).", "payment.arrived"],
];

const CURL = `curl https://api.arcway.example/v1/quotes \\
  -H "Authorization: Bearer $ARCWAY_KEY" \\
  -d amount=15750000 -d from=NGN -d to=EUR

# → { "rate": 0.000585, "fee": "55125.00 NGN",
#     "receive": "9214.50 EUR", "expires_in": 30 }`;

function KeysForm() {
  const [state, setState] = useState<"idle" | "sent">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr("Enter a valid work email.");
    setErr("");
    await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email }) }).catch(() => {});
    setState("sent");
  }
  if (state === "sent")
    return (
      <div role="status" className="rounded-card border border-line bg-white p-6">
        <p className="text-h3">Check your inbox.</p>
        <p className="mt-2 text-[15px] text-muted">Sandbox keys would arrive in a minute. This is a concept, so no real keys are issued.</p>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-line bg-white p-6">
      <label htmlFor="k-email" className="text-label text-muted">Work email</label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input id="k-email" name="email" type="email" autoComplete="email" aria-invalid={!!err} aria-describedby="k-err" className={`h-12 min-w-0 flex-1 rounded-btn border px-4 text-[16px] outline-none focus:border-signal ${err ? "border-[#C8372D]" : "border-line"}`} />
        <button type="submit" className="h-12 rounded-btn bg-signal px-5 font-medium text-paper hover:bg-[#4560FF]">Get API keys</button>
      </div>
      <p id="k-err" role="alert" className="mt-2 min-h-5 text-[13px] text-[#C8372D]">{err}</p>
      <p className="text-[13px] text-muted">Sandbox first: fake money, real API. Concept only.</p>
    </form>
  );
}

export default function Developers() {
  return (
    <ExperienceProvider smooth={false}>
      <Nav />
      <main id="main" className="bg-paper text-ink">
        <section className="bg-abyss pb-20 pt-32 text-paper">
          <div className="site grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="text-label text-mist">Developers</p>
              <h1 className="text-display mt-5 max-w-[12ch]">An API for money that moves.</h1>
              <p className="text-body measure mt-6 text-mist">Quotes, payments, payouts and webhooks. Every state change is an event, so you never poll.</p>
            </div>
            <div className="lg:col-span-6"><CodeBlock code={CURL} /></div>
          </div>
        </section>
        <section id="states" className="section-pad">
          <div className="site grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-label text-muted">Payment states</p>
              <h2 className="text-h2 mt-4">Five states, in order, every time.</h2>
            </div>
            <ol className="lg:col-span-7 lg:col-start-6">
              {STATES.map(([s, d, ev], i) => (
                <li key={s} className="grid grid-cols-[32px_1fr] gap-4 border-t border-line py-5 md:grid-cols-[32px_160px_1fr_auto]">
                  <span className="font-mono text-[12px] text-muted">0{i + 1}</span>
                  <span className={`font-mono text-[15px] ${s === "arrived" ? "text-[#0B8A66]" : "text-signal"}`}>{s}</span>
                  <span className="col-start-2 text-[15px] text-muted md:col-start-3">{d}</span>
                  <code className="col-start-2 font-mono text-[12px] text-muted md:col-start-4">{ev}</code>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="pb-24">
          <div className="site grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7"><CodeBlock /></div>
            <div id="keys" className="lg:col-span-4 lg:col-start-9">
              <p className="text-label text-muted">Get started</p>
              <h2 className="text-h3 mt-3">Sandbox keys in a minute.</h2>
              <div className="mt-6"><KeysForm /></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </ExperienceProvider>
  );
}
