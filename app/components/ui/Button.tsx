import { Link } from "react-router";

type Variant = "primary" | "secondary" | "text";
const base =
  "group inline-flex items-center justify-center gap-2 font-medium transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease)] disabled:opacity-50 disabled:pointer-events-none";
const styles: Record<Variant, string> = {
  primary: "h-12 rounded-btn bg-signal px-5 text-paper hover:bg-[#4560FF] active:translate-y-px",
  secondary:
    "h-12 rounded-btn border border-current/30 px-5 hover:border-current active:translate-y-px",
  text: "underline-offset-4 hover:underline",
};

export function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-150 ease-[var(--ease)] group-hover:translate-x-0.5">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  to,
  href,
  onClick,
  children,
  className = "",
  type = "button",
  arrow = variant === "text",
  disabled,
}: {
  variant?: Variant;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  arrow?: boolean;
  disabled?: boolean;
}) {
  const cls = `${base} ${styles[variant]} ${className}`;
  const inner = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} onClick={onClick}>
        {inner}
      </a>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
