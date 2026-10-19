/** Arcway mark: an arc between two points, the landing point in mint. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden>
        <path d="M3 15C6 4 20 4 23 15" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="3" cy="15" r="2.4" fill="currentColor" />
        <circle cx="23" cy="15" r="2.4" fill="var(--arrived)" />
      </svg>
      <span className="text-[18px] font-semibold tracking-[-0.03em]">Arcway</span>
    </span>
  );
}
