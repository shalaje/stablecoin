import { useEffect, useRef } from "react";
import gsap from "gsap";
import { registerGsap } from "~/lib/scroll";
import { Reveal } from "../ui/Reveal";

const ROWS = [
  { to: "Kraft Logistik GmbH", where: "Berlin", amt: "€9,214.50", from: "₦15,750,000", state: "arrived", time: "4.2 s", hi: true },
  { to: "Mwangi Textiles", where: "Nairobi", amt: "KSh 1,284,500", from: "$9,930.00", state: "flight", time: "—" },
  { to: "Lumen Studio Ltd", where: "London", amt: "£4,120.00", from: "€4,830.00", state: "arrived", time: "3.8 s" },
  { to: "Casa Ortega", where: "Mexico City", amt: "MX$61,900.00", from: "$3,400.00", state: "arrived", time: "5.1 s" },
  { to: "Contractors · 42 payees", where: "Manila", amt: "₱1,902,300", from: "$32,910.00", state: "flight", time: "—" },
];
const BALANCES = [
  ["USD", "$184,203.12"],
  ["EUR", "€62,940.55"],
  ["NGN", "₦48,120,000"],
  ["KES", "KSh 3,410,800"],
];

function Pill({ s }: { s: string }) {
  return s === "arrived" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3FBF3] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[#0B6B50]"><span className="size-1.5 rounded-full bg-arrived" />Arrived</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8ECFF] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-signal"><span className="live-dot size-1.5 rounded-full bg-signal" />In flight</span>
  );
}

/** The globe dims to 30%; the dashboard tilts in front of it as you scroll. */
export function Dashboard() {
  const card = useRef<HTMLDivElement>(null);
  const sec = useRef<HTMLElement>(null);
  useEffect(() => {
    registerGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tw = gsap.fromTo(card.current, { rotateX: 18, y: 60, scale: 0.94 }, { rotateX: 0, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: sec.current, start: "top bottom", end: "top 20%", scrub: 1 } });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);
  return (
    <section ref={sec} id="dashboard" data-key="dashboard" aria-labelledby="dash-title" className="relative section-pad">
      <div className="site">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="text-label text-mist">Dashboard</p>
            <h2 id="dash-title" className="text-h2 mt-4">Every payment, every balance, one screen.</h2>
          </div>
          <p className="text-body measure text-mist lg:col-span-5 lg:col-start-8">Hold balances in dollars, euros and local currencies. See each payment from send to arrival, with the timestamp of every step.</p>
        </Reveal>
        <div className="mt-12 [perspective:1400px] md:mt-16">
          <div ref={card} className="origin-top rounded-card bg-paper p-3 text-ink shadow-[0_60px_120px_-40px_rgba(0,0,0,0.7)] md:p-4" role="img" aria-label="Dashboard mock-up: balances in USD, EUR, NGN and KES, and a payments list including €9,214.50 arrived in Berlin in 4.2 seconds. Concept data.">
            <div className="flex items-center justify-between border-b border-line px-2 pb-3">
              <span className="text-[15px] font-semibold">Payments</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted">Concept data</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {BALANCES.map(([c, v]) => (
                <div key={c} className="rounded-[12px] border border-line p-3">
                  <p className="text-label text-muted">{c} balance</p>
                  <p className="tnum mt-2 font-mono text-[18px] font-medium md:text-[22px]">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 overflow-x-auto rounded-[12px] border border-line">
              <table className="w-full min-w-[620px] text-left text-[14px]">
                <thead className="text-label text-muted">
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 font-normal">Recipient</th>
                    <th className="px-4 py-3 font-normal">Sent</th>
                    <th className="px-4 py-3 font-normal">Received</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.to} className={`border-b border-line last:border-0 ${r.hi ? "bg-[#F1FDF8]" : ""}`}>
                      <td className="px-4 py-3"><span className="block font-medium">{r.to}</span><span className="text-[12.5px] text-muted">{r.where}</span></td>
                      <td className="tnum px-4 py-3 font-mono text-muted">{r.from}</td>
                      <td className="tnum px-4 py-3 font-mono">{r.amt}</td>
                      <td className="px-4 py-3"><Pill s={r.state} /></td>
                      <td className="tnum px-4 py-3 font-mono text-muted">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Multi-currency balances", "Keep USD, EUR and local currency side by side; convert only when you pay."],
            ["Every step timestamped", "Converted, settled, paid out: each with its own time and reference."],
            ["Bulk payouts", "Upload a CSV or call the API to pay 400 contractors in one go."],
          ].map(([h, b]) => (
            <li key={h} className="border-t border-white/15 pt-4">
              <h3 className="text-[17px] font-medium">{h}</h3>
              <p className="mt-1.5 text-[15px] text-mist">{b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
