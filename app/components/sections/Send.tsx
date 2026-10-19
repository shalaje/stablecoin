import { useEffect, useMemo, useState } from "react";
import { byCurrency } from "~/lib/geo";
import { CURRENCIES, FEE, money, quote } from "~/lib/money";
import { scene, setRoute } from "~/lib/sceneState";
import { scrollToId } from "~/lib/scroll";

function CurrencyField({ id, label, value, amount, onCurrency, onAmount, readOnly }: { id: string; label: string; value: string; amount: string; onCurrency: (c: string) => void; onAmount?: (v: string) => void; readOnly?: boolean }) {
  const cur = CURRENCIES.find((c) => c.code === value)!;
  return (
    <div className="rounded-[14px] border border-line bg-white px-4 py-3 focus-within:border-signal">
      <label htmlFor={`${id}-amt`} className="text-label text-muted">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <input
          id={`${id}-amt`}
          inputMode="decimal"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmount?.(e.target.value)}
          className="tnum min-w-0 flex-1 bg-transparent font-mono text-[26px] font-medium text-ink outline-none"
          aria-describedby={readOnly ? `${id}-note` : undefined}
        />
        <label className="relative">
          <span className="sr-only">{label} currency</span>
          <select value={value} onChange={(e) => onCurrency(e.target.value)} className="h-10 appearance-none rounded-full border border-line bg-paper pl-9 pr-8 font-mono text-[14px] text-ink">
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" aria-hidden>{cur.flag}</span>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted" aria-hidden>▼</span>
        </label>
      </div>
    </div>
  );
}

/** The calculator: pins light on the chosen cities and the camera re-aims when they change. */
export function Send() {
  const [amount, setAmount] = useState("15,750,000");
  const [from, setFrom] = useState("NGN");
  const [to, setTo] = useState("EUR");
  const n = Number(amount.replace(/[^0-9.]/g, "")) || 0;
  const q = useMemo(() => quote(n, from, to), [n, from, to]);

  useEffect(() => {
    if (from === to) return;
    setRoute(byCurrency(from).id, byCurrency(to).id);
  }, [from, to]);
  useEffect(() => {
    scene.send.amount = money(n, from, from === "NGN" || from === "KES" ? 0 : 2);
  }, [n, from]);

  const swapIfSame = (next: string, other: string, setOther: (c: string) => void, prev: string) => {
    if (next === other) setOther(prev);
  };

  return (
    <section id="send" data-key="send" aria-labelledby="send-title" className="relative section-pad">
      <div className="site grid grid-cols-12 phone-gap">
        <div className="col-span-12 lg:col-span-5">
          <p className="text-label text-mist">Send</p>
          <h2 id="send-title" className="text-h2 mt-4">Know what lands before you press send.</h2>
          <div className="mt-8 rounded-card bg-paper p-4 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:p-5">
            <div className="grid grid-cols-1 gap-2">
              <CurrencyField id="from" label="You send" value={from} amount={amount} onAmount={(v) => setAmount(v.replace(/[^0-9.,]/g, ""))} onCurrency={(c) => (swapIfSame(c, to, setTo, from), setFrom(c))} />
              <CurrencyField id="to" label="They receive" value={to} amount={q.received.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly onCurrency={(c) => (swapIfSame(c, from, setFrom, to), setTo(c))} />
            </div>
            <dl className="mt-4 space-y-2 px-1 text-[14px]">
              <div className="flex justify-between"><dt className="text-muted">Rate</dt><dd className="tnum font-mono">1 {from} = {q.rate.toPrecision(5)} {to}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Fee ({(FEE * 100).toFixed(2)}%)</dt><dd className="tnum font-mono">{money(q.fee, from)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Arrives</dt><dd className="font-mono">in about 4 seconds</dd></div>
            </dl>
            <button type="button" onClick={() => scrollToId("journey")} className="mt-4 h-12 w-full rounded-btn bg-signal font-medium text-paper hover:bg-[#4560FF]">
              Send {money(n, from, 0)}
            </button>
            <p id="to-note" className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-muted">Concept rates and fees · nothing is sent</p>
          </div>
        </div>
      </div>
    </section>
  );
}
