import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { NAV } from "~/lib/site";
import { getLenis, scrollToId } from "~/lib/scroll";
import { Logo } from "./ui/Logo";
import { Button } from "./ui/Button";

/** Sticky nav: hides on scroll down, returns on scroll up. Burger on mobile, CTA always visible. */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last.current;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 120);
        last.current = y;
      }
      setSolid(y > 40);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (hash: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (onHome) {
      e.preventDefault();
      // let the menu close (and Lenis restart) before scrolling
      requestAnimationFrame(() => scrollToId(hash));
    } else {
      e.preventDefault();
      navigate(`/#${hash}`);
    }
  };

  return (
    <header
      className={`on-dark fixed inset-x-0 top-0 z-50 text-paper transition-colors duration-500 transition-transform duration-300 ease-[var(--ease)] ${
        hidden && !open ? "-translate-y-full" : ""
      }`}
    >
      <div
        className={`border-b transition-colors duration-300 ${
          solid || open ? "border-white/10 bg-abyss/80 backdrop-blur-md" : "border-transparent"
        }`}
      >
        <nav aria-label="Main" className="site flex h-16 items-center justify-between gap-6">
          <Link to="/" aria-label="Arcway home" className="text-current" onClick={() => onHome && window.scrollTo({ top: 0 })}>
            <Logo />
          </Link>
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <li key={n.label}>
                <a href={n.to ?? `/#${n.hash}`} onClick={n.to ? undefined : go(n.hash!)} className="text-[15px] opacity-70 transition-opacity duration-150 hover:opacity-100">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Button to="/developers#keys" className="!h-10 !px-4 text-[15px]">
              Open an account
            </Button>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-current lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-4" aria-hidden>
                <span className={`absolute left-0 block h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 block h-px w-4 bg-current transition-opacity duration-150 ${open ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 block h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </nav>
      </div>
      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100svh-64px)] overflow-y-auto border-b border-white/10 bg-abyss text-paper lg:hidden"
      >
        <ul className="site flex flex-col pt-6">
          {NAV.map((n, i) => (
            <li key={n.label} className="border-b border-white/10">
              <a href={n.to ?? `/#${n.hash}`} onClick={n.to ? undefined : go(n.hash!)} className="flex items-center justify-between py-5 text-h3">
                {n.label}
                <span className="text-label text-muted">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="site text-label mt-8 text-muted">Arcway is a design concept by Nova Digital Studio.</p>
      </div>
    </header>
  );
}
