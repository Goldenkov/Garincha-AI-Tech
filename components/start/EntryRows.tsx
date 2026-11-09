import Link from "next/link";

import { cn } from "@/lib/utils";

export const entries = [
  { href: "/start/idea", title: "У меня есть идея", text: "Опишите её своими словами — соберём карточку гипотезы." },
  { href: "/niches", title: "Выбрать из каталога", text: "Готовые направления с порогом входа, рисками и первым тестом." },
  { href: "/start/advisor", title: "Помогите выбрать", text: "Короткий профиль — до трёх вариантов с объяснением." },
];

export function EntryRows({ className, detailed = false }: { className?: string; detailed?: boolean }) {
  return (
    <ul className={cn("grid border-y border-rule md:grid-cols-3", className)}>
      {entries.map((entry, index) => (
        <li key={entry.href} className={cn("border-rule max-md:border-b max-md:last:border-b-0", index > 0 && "md:border-l")}>
          <Link href={entry.href} className={cn("entry-row h-full md:px-6", index === 0 && "md:pl-1")}>
            <span>
              <span className="block">{entry.title}</span>
              {detailed ? <span className="mt-1.5 block text-[0.95rem] font-normal leading-snug text-muted">{entry.text}</span> : null}
            </span>
            <span className="entry-arrow text-xl" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
