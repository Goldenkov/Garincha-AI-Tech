import { quickStartSteps } from "@/lib/business-reboot-content";

export function QuickStartTimeline() {
  return (
    <div className="relative rounded-[2rem] border border-white/10 bg-[#0b1020] p-5 sm:p-7">
      <div className="absolute bottom-8 left-10 top-20 hidden w-px bg-gradient-to-b from-cyan-300/70 via-violet-300/40 to-transparent sm:block" />
      <div className="space-y-4">
        {quickStartSteps.map((step, index) => (
          <div key={step.title} className="grid gap-4 rounded-3xl border border-white/10 bg-[#080d1a] p-5 sm:grid-cols-[auto_1fr]">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-sm font-semibold text-cyan-100">
              {(index + 1).toString().padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
