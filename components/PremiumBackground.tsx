export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[var(--gg-bg-deep)]" />
      <div className="absolute inset-0 bg-premium-mesh" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
    </div>
  );
}
