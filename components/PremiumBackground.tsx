export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-premium-mesh opacity-90" />
      <div className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-[120px]" />
      <div className="absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-[110px]" />
      <div className="absolute -right-40 top-20 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/10 blur-[110px]" />
      <div className="absolute inset-0 bg-hero-grid bg-[length:56px_56px] opacity-[0.16] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div className="premium-noise absolute inset-0 opacity-[0.075]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
    </div>
  );
}
