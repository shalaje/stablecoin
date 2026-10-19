import { useState } from "react";
import { Link } from "react-router";
import { Logo } from "./ui/Logo";

const COLS = [
  { title: "Product", links: [["Send money", "/#send"], ["How it works", "/#journey"], ["Dashboard", "/#dashboard"], ["Network", "/#network"]] },
  { title: "Developers", links: [["Docs", "/developers"], ["Payment states", "/developers#states"], ["API keys", "/developers#keys"]] },
  { title: "Company", links: [["Trust", "/#trust"], ["Pricing · soon", "/#send"], ["Legal · soon", "/#footer"]] },
];

function Newsletter() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr(true), setMsg("Enter a valid email address.");
    setErr(false);
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email }) });
      if (!r.ok) throw new Error();
      setMsg("Subscribed. One update a month.");
    } catch {
      setErr(true);
      setMsg("Could not subscribe right now.");
    }
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="nl" className="text-label text-mist">Corridor updates, monthly</label>
      <div className="mt-3 flex gap-2">
        <input id="nl" name="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={err} aria-describedby="nl-msg" className={`h-11 min-w-0 flex-1 rounded-btn border bg-white/5 px-3.5 text-[15px] text-paper outline-none placeholder:text-mist/60 focus:border-signal ${err ? "border-[#FF8A8A]" : "border-white/15"}`} />
        <button type="submit" className="h-11 rounded-btn bg-signal px-4 text-[15px] font-medium text-paper">Subscribe</button>
      </div>
      <p id="nl-msg" role="status" className={`mt-2 min-h-5 text-[13px] ${err ? "text-[#FF8A8A]" : "text-mist"}`}>{msg}</p>
    </form>
  );
}

export function Footer() {
  return (
    <footer id="footer" data-key="footer" className="on-dark relative z-10 pt-[30svh] lg:pt-[36vh]">
      <div className="site border-t border-white/10 pb-24 pt-12 lg:pb-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-[30ch] text-[17px] text-mist">If we can make money crossing the world feel this calm, imagine what we can build for your product.</p>
            <a href="https://contra.com" className="mt-4 inline-block text-[15px] text-paper underline underline-offset-4">Work with Nova Digital Studio</a>
          </div>
          <nav aria-label="Footer" className="lg:col-span-5">
            <div className="hidden grid-cols-3 gap-6 md:grid">
              {COLS.map((c) => (
                <div key={c.title}>
                  <h3 className="text-label text-mist">{c.title}</h3>
                  <ul className="mt-3 space-y-2 text-[15px]">{c.links.map(([l, h]) => <li key={l}><Link to={h} className="hover:text-arrived">{l}</Link></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10 md:hidden">
              {COLS.map((c) => (
                <details key={c.title} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-4">{c.title}<span className="text-mist transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span></summary>
                  <ul className="space-y-3 pb-5 text-mist">{c.links.map(([l, h]) => <li key={l}><Link to={h}>{l}</Link></li>)}</ul>
                </details>
              ))}
            </div>
          </nav>
          <div className="lg:col-span-3"><Newsletter /></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-5 text-[13px] text-mist md:flex-row md:justify-between">
          <p>Arcway is a design concept by <span className="text-paper">Nova Digital Studio</span>. Fictional company; all fees, timings and volumes are concept figures. No real licences are implied.</p>
          <p>© 2026</p>
        </div>
      </div>
    </footer>
  );
}
