import { useEffect, useRef, useState } from "react";

/** Counts up once when it scrolls into view. Final value is what pre-renders. */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1400,
  className = "",
}: {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVal(from);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const k = 1 - Math.pow(1 - p, 4);
          setVal(from + (to - from) * k);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration]);
  const text = val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
