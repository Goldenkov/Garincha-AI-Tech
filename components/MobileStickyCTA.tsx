import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";

export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/78 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-24px_80px_rgba(8,145,178,0.2)] backdrop-blur-2xl sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <span className="h-px w-4 bg-cyan-200/70" aria-hidden="true" />
            Ранний доступ
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-400">Без оплаты сейчас</p>
        </div>
        <ButtonLink
          href="/#lead"
          size="lg"
          className="group min-h-12 flex-[1.35] overflow-hidden px-4 text-sm shadow-[0_0_34px_rgba(103,232,249,0.42)]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
          <span className="relative flex items-center justify-center">
            Забронировать за {siteConfig.price}
            <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </span>
        </ButtonLink>
      </div>
    </div>
  );
}
