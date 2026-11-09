"use client";

import { useEffect, useRef } from "react";

import { exampleHypothesis } from "@/lib/example";

const steps = [
  {
    title: "Идея становится гипотезой",
    text: "Мысль как есть раскладывается на поля: кто клиент, какую задачу решаете, как зарабатываете.",
  },
  {
    title: "Главное видно сразу",
    text: "Клиент и задача выделены. Непроверенное предположение так и подписано.",
  },
  {
    title: "Предположение связано с проверкой",
    text: "Самое рискованное допущение становится тестом: кого спросить, сколько людей, какой ответ считать сигналом.",
  },
  {
    title: "Следующий шаг и честный выбор",
    text: "После проверки решаете сами: продолжать, изменить гипотезу или остановиться — до вложений.",
  },
];

const labels = ["idea", "card", "focus", "check", "action"] as const;

/**
 * Flagship scroll scene. The server markup is the final composition, so without JavaScript or with
 * reduced motion everything is readable at once. Motion only plays the story backwards from there.
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const q = gsap.utils.selector(section);
      const captions = q<HTMLElement>("[data-step]");
      const rail = q<HTMLElement>("[data-rail-fill]")[0];
      const setActive = (phase: number) => {
        captions.forEach((caption, index) => caption.toggleAttribute("data-active", index === Math.max(phase, 1) - 1));
        section.dataset.phase = String(phase);
      };

      const build = () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1 } });
        tl.addLabel("idea", 0)
          .from(q("[data-layer=idea]"), { xPercent: 9, yPercent: 14, rotate: 2.5, scale: 1.05, opacity: 1 }, 0)
          .from(q("[data-layer=card]"), { autoAlpha: 0, yPercent: 8, rotate: 3, scaleY: 0.9, transformOrigin: "50% 0%" }, 0.2)
          .addLabel("card", 1.2)
          .from(q("[data-hl]"), { scaleX: 0, transformOrigin: "0% 50%", stagger: 0.35, duration: 0.6 }, "card")
          .from(q("[data-hl-label]"), { color: "var(--color-ink)", stagger: 0.35, duration: 0.6 }, "card")
          .addLabel("focus", 2.4)
          .from(q("[data-layer=check]"), { autoAlpha: 0, y: 14, duration: 0.6 }, "focus+=0.2")
          .from(q("[data-link]"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.6, ease: "none" }, "focus")
          .addLabel("check", 3.6)
          .from(q("[data-layer=action]"), { autoAlpha: 0, yPercent: 30, duration: 0.6 }, "check")
          .from(q("[data-choice]"), { autoAlpha: 0, y: 8, stagger: 0.15, duration: 0.4 }, "check+=0.35")
          .addLabel("action", 4.8);
        return tl;
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        section.dataset.motion = "scrub";
        const tl = build();
        const header = document.querySelector("header");
        const pinTarget = q<HTMLElement>("[data-pin]")[0];
        ScrollTrigger.create({
          trigger: pinTarget,
          start: () => `top ${header?.getBoundingClientRect().height ?? 0}px`,
          end: () => `+=${Math.round(window.innerHeight * 2)}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: tl,
          onUpdate: (self) => {
            const time = self.progress * tl.duration();
            const phase = labels.reduce((acc, label, index) => (time >= tl.labels[label] - 0.15 ? index : acc), 0);
            setActive(phase);
            if (rail) rail.style.transform = `scaleY(${self.progress})`;
          },
        });
        setActive(0);
        return () => {
          delete section.dataset.motion;
          delete section.dataset.phase;
          captions.forEach((caption) => caption.removeAttribute("data-active"));
          if (rail) rail.style.transform = "";
        };
      });

      mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)", () => {
        section.dataset.motion = "steps";
        const tl = build().pause(0);
        const go = (phase: number) => {
          setActive(phase);
          tl.tweenTo(labels[phase], { duration: 0.55, ease: "power2.out", overwrite: true });
        };
        captions.forEach((caption, index) => {
          ScrollTrigger.create({
            trigger: caption,
            start: "top 82%",
            end: "bottom 82%",
            onEnter: () => go(index + 1),
            onEnterBack: () => go(index + 1),
            onLeaveBack: index === 0 ? () => go(0) : undefined,
          });
        });
        setActive(0);
        return () => {
          delete section.dataset.motion;
          delete section.dataset.phase;
          captions.forEach((caption) => caption.removeAttribute("data-active"));
        };
      });

      cleanup = () => mm.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={sectionRef} id="how" aria-labelledby="how-title" className="how-scene border-t border-rule">
      <div data-pin className="how-pin">
        <div className="how-grid mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-12">
          <div className="how-copy">
            <p className="eyebrow">Как это работает</p>
            <h2 id="how-title" className="title mt-3 max-w-[20ch]">
              От мысли «а что, если…» до первого теста
            </h2>
            <div className="relative mt-8 lg:mt-10">
              <div aria-hidden="true" className="how-rail absolute left-[0.7rem] top-2 bottom-2 w-px bg-rule max-lg:hidden">
                <div data-rail-fill className="h-full w-full origin-top bg-teal" />
              </div>
              <ol className="space-y-0 lg:space-y-5">
                {steps.map((step, index) => (
                  <li key={step.title} data-step className="how-step lg:pl-12">
                    <p className="flex items-baseline gap-3 font-display text-[1.25rem] font-medium leading-snug lg:block">
                      <span className="how-step-index text-sm font-sans font-semibold text-teal lg:absolute lg:left-0 lg:mt-1 lg:flex lg:size-6 lg:items-center lg:justify-center lg:rounded-full lg:bg-paper lg:text-xs lg:ring-1 lg:ring-rule">
                        {index + 1}
                      </span>
                      {step.title}
                    </p>
                    <p className="mt-1.5 max-w-[44ch] text-[0.98rem] leading-relaxed text-ink-soft">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="how-stage-wrap">
            <SceneStage />
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneStage() {
  const rows = [
    { label: "Для кого", text: exampleHypothesis.targetCustomer, risky: false },
    { label: "Задача клиента", text: exampleHypothesis.customerProblem, risky: false },
    { label: "Предположение", text: exampleHypothesis.assumptions[1], risky: true },
  ];
  return (
    <div className="how-stage" aria-hidden="true">
      <div className="stage-inner">
      <div data-layer="idea" className="stage-idea">
        <p className="stage-note-label">Заметка</p>
        <p className="stage-note">{exampleHypothesis.ideaNote}</p>
        <span className="stage-scribble" />
        <span className="stage-scribble stage-scribble-short" />
      </div>

      <div data-layer="card" className="stage-card">
        <p className="stage-card-kicker">Карточка гипотезы · пример</p>
        <p className="stage-card-title">{exampleHypothesis.title}</p>
        <dl className="stage-rows">
          {rows.map((row) => (
            <div key={row.label} className="stage-row" data-risky={row.risky || undefined}>
              <dt data-hl-label>{row.label}</dt>
              <dd>
                <span data-hl className="stage-hl" />
                <span className="relative">{row.text}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="stage-status">○ Спрос ещё не проверен</p>
      </div>

      <div data-layer="check" className="stage-check">
        <span data-link className="stage-link" />
        <p className="stage-check-kicker">Проверка спроса</p>
        <p className="stage-check-main">{exampleHypothesis.validation.count} интервью</p>
        <p className="stage-check-text">Сигнал «да»: {exampleHypothesis.validation.successSignal.toLowerCase()}</p>
      </div>

      <div data-layer="action" className="stage-action">
        <p className="stage-action-title">Следующий шаг: 5 интервью за 14 дней</p>
        <div className="stage-choices">
          <span data-choice>Продолжать</span>
          <span data-choice>Изменить гипотезу</span>
          <span data-choice>Остановиться</span>
        </div>
      </div>
      </div>
    </div>
  );
}
