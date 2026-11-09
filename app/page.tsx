import Link from "next/link";

import { HeroCard } from "@/components/landing/HeroCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Reveals } from "@/components/landing/Reveals";
import { Container } from "@/components/site/Container";
import { EntryRows } from "@/components/start/EntryRows";
import { catalogNiches } from "@/lib/catalog";
import { businessModelIds, businessModels } from "@/lib/domain/business-models";

const faq = [
  {
    q: "Это гарантирует, что бизнес получится?",
    a: "Нет. Мы помогаем быстро сформулировать гипотезу и проверить спрос до вложений. Результат зависит от рынка, вашего предложения и действий. Подтверждённая гипотеза — это решение проверять, а не доказательство спроса.",
  },
  {
    q: "Нужна ли регистрация?",
    a: "Каталог, пример и черновик своей идеи доступны без регистрации. Аккаунт по email нужен, чтобы сохранить проект на сервере и вернуться к нему с любого устройства. Черновик переносится в аккаунт только после вашего согласия.",
  },
  {
    q: "Где здесь AI?",
    a: "Там, где он реально помогает: подсказать формулировки и предложить до трёх направлений по вашему профилю — только когда вы сами нажмёте кнопку. Если AI недоступен, вы спокойно продолжаете вручную.",
  },
  {
    q: "Что даёт PRO?",
    a: "После первой проверки спроса открываются миссии запуска: упаковка предложения, контент, скрипты, ответы на возражения, квиз, структура страницы и пакет первого запуска. Первые два шага бесплатны.",
  },
  {
    q: "Какие направления поддерживаются?",
    a: "Сейчас — три модели: услуги, торговля и производство на заказ. Это сознательное ограничение: для них мы можем дать честный и проверяемый маршрут.",
  },
];

export default function HomePage() {
  const featured = catalogNiches.slice(0, 6);
  return (
    <main>
      <section aria-labelledby="hero-title">
        <Container className="grid items-center gap-12 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pb-16 lg:pt-16">
          <div>
            <p className="eyebrow">Бизнес Перезагрузка с AI</p>
            <h1 id="hero-title" className="display mt-5 max-w-[12ch]">
              Большая идея. Первый реальный шаг.
            </h1>
            <p className="lede mt-6 max-w-[34ch]">От выбора направления до плана проверки спроса — шаг за шагом.</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/start" className="btn btn-primary btn-lg min-w-[13rem]">
                Выбрать идею
              </Link>
              <Link href="/example" className="link py-2 text-[1.05rem] font-medium">
                Посмотреть пример
              </Link>
            </div>
          </div>
          <HeroCard />
        </Container>
      </section>

      <section aria-labelledby="entry-title" className="pb-16">
        <Container>
          <h2 id="entry-title" className="subtitle !text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)]">
            Начните со своей точки
          </h2>
          <EntryRows className="mt-5" />
        </Container>
      </section>

      <HowItWorks />

      <section aria-labelledby="models-title" className="border-t border-rule py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Каталог направлений</p>
              <h2 id="models-title" className="title mt-3" data-reveal="mask">
                Три модели, с которых можно начать
              </h2>
              <p className="prose-body mt-5 max-w-[42ch]">
                Мы сознательно поддерживаем только услуги, торговлю и производство на заказ — для них маршрут проверки понятен и честен.
              </p>
              <Link href="/niches" className="btn btn-secondary mt-8">
                Открыть каталог
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3">
              {businessModelIds.map((id) => (
                <div key={id} className="bg-paper-raised p-6" data-reveal>
                  <p className="font-display text-xl font-medium">{businessModels[id].title}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{businessModels[id].short}</p>
                  <p className="mt-4 text-sm text-muted">{businessModels[id].howItEarns}</p>
                </div>
              ))}
            </div>
          </div>
          <ul className="mt-12 grid gap-x-8 border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((niche) => (
              <li key={niche.id} className="border-b border-rule">
                <Link href={`/niches/${niche.id}`} className="entry-row !min-h-[3.5rem] !text-base">
                  <span>{niche.title}</span>
                  <span className="entry-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="honest-title" className="border-t border-rule bg-paper-sunk/60 py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Без иллюзий</p>
            <h2 id="honest-title" className="title mt-3" data-reveal="mask">
              Гипотеза — это ещё не бизнес
            </h2>
            <p className="prose-body mt-5 max-w-[46ch]">
              Мы не выдаём догадку за факт. Всё, что не подтверждено, подписано как предположение. Первые деньги и время уходят не на запуск, а на
              проверку: поговорить с людьми, показать предложение, собрать заявки.
            </p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            {[
              ["Бесплатно", "Каталог, пример, карточка гипотезы, первая проверка спроса и разведка рынка — с сохранением в аккаунте."],
              ["PRO", "Миссии запуска после проверки: оффер, контент, скрипты, возражения, квиз, страница и пакет первого запуска."],
              ["Ваши данные", "Проекты хранятся на сервере и доступны только вам. Мы не продаём и не публикуем ваши данные."],
              ["Без обещаний", "Никаких процентов успеха и гарантированного дохода. Только понятные шаги и критерии решения."],
            ].map(([title, text]) => (
              <div key={title} className="border-t-2 border-ink pt-4" data-reveal>
                <dt className="font-display text-lg font-medium">{title}</dt>
                <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-labelledby="faq-title" className="border-t border-rule py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="faq-title" className="title" data-reveal="mask">
            Частые вопросы
          </h2>
          <div className="border-t border-rule">
            {faq.map((item) => (
              <details key={item.q} className="group border-b border-rule">
                <summary className="flex min-h-[3.75rem] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.05rem] font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden="true" className="text-xl text-teal transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="prose-body max-w-[60ch] pb-6">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="final-title" className="pb-8 pt-4">
        <Container>
          <div className="rounded-md bg-ink px-6 py-14 text-paper sm:px-12 sm:py-16" data-reveal="scale">
            <h2 id="final-title" className="title max-w-[20ch] text-paper">
              Начните с одной идеи — и одного честного теста
            </h2>
            <p className="mt-4 max-w-[46ch] text-paper/80">Черновик можно собрать без регистрации. Сохранить и продолжить — с аккаунтом по email.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/start" className="btn btn-lg bg-paper text-ink hover:bg-white">
                Выбрать идею
              </Link>
              <Link href="/example" className="btn btn-lg border-paper/40 text-paper hover:border-paper">
                Посмотреть пример
              </Link>
            </div>
          </div>
        </Container>
      </section>
      <Reveals />
    </main>
  );
}
