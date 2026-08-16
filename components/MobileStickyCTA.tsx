import { ButtonLink } from "@/components/ui/button";
import { businessRebootConfig } from "@/lib/business-reboot-content";

export function MobileStickyCTA() {
  return (
    <div className="gg-mobile-cta fixed inset-x-0 bottom-0 z-40 border-t border-white/10 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2 min-[380px]:gap-3">
        <div className="hidden min-w-0 flex-1 min-[380px]:block">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            <span className="h-px w-4 bg-cyan-200/70" aria-hidden="true" />
            Ранний доступ
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-400">Без оплаты сейчас</p>
        </div>
        <ButtonLink
          href="/#lead"
          size="lg"
          className="min-h-12 min-w-0 flex-1 px-3 text-sm shadow-[0_0_24px_rgba(103,232,249,0.32)] min-[380px]:flex-[1.35] min-[380px]:px-4"
        >
          PRO за {businessRebootConfig.price}
        </ButtonLink>
      </div>
    </div>
  );
}
