import { useEffect, useRef } from "react";

/** Section reveal (600–900 ms, brand easing). Content is visible without JS. */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  as?: "div" | "li" | "figure" | "section";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as React.Ref<never>} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, n }: { children: React.ReactNode; n?: string }) {
  return (
    <p className="text-label flex items-center gap-3 text-muted">
      {n && <span className="text-pulse">{n}</span>}
      <span>{children}</span>
    </p>
  );
}
