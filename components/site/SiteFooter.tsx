import Link from "next/link";

import { Container } from "@/components/site/Container";
import { brand } from "@/lib/brand";

const columns = [
  {
    title: "Начать",
    links: [
      { href: "/start/idea", label: "У меня есть идея" },
      { href: "/niches", label: "Каталог направлений" },
      { href: "/start/advisor", label: "Помогите выбрать" },
      { href: "/example", label: "Пример карточки" },
    ],
  },
  {
    title: "Продукт",
    links: [
      { href: "/pro", label: "PRO-доступ" },
      { href: "/free", label: "Бесплатный мини-маршрут" },
      { href: "/partners", label: "Партнёрам" },
      { href: "/feedback", label: "Обратная связь" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Условия" },
      { href: "/en", label: "English" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper-sunk/50 pb-[env(safe-area-inset-bottom)]">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.2em]">{brand.company}</p>
          <p className="mt-3 font-display text-lg leading-snug">{brand.product}</p>
          <p className="mt-3 text-sm text-muted">
            Помогаем сделать первый проверяемый шаг. Не обещаем доход и не выдаём гипотезу за доказанный спрос.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-semibold text-ink">{column.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted hover:text-teal">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="border-t border-rule py-5 text-xs text-subtle">
        © {new Date().getFullYear()} {brand.company}. Вопросы и ошибки —{" "}
        <Link className="link" href="/feedback">
          через форму обратной связи
        </Link>
        .
      </Container>
    </footer>
  );
}
