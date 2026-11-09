import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { EntryRows } from "@/components/start/EntryRows";

export const metadata: Metadata = {
  title: "С чего начать",
  description: "Три способа начать: своя идея, каталог направлений или подбор по короткому профилю.",
};

export default function StartPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Начните со своей точки"
        title="Откуда вы стартуете?"
        lede="Любой путь ведёт к одной карточке гипотезы и плану первой проверки спроса. Черновик работает без регистрации."
      />
      <Container>
        <EntryRows detailed />
        <p className="mt-10 max-w-[52ch] text-[0.95rem] text-muted">
          Уже есть работающий бизнес и нужно упаковать запуск?{" "}
          <Link href="/projects?new=existing" className="link">
            Начать с действующего бизнеса
          </Link>{" "}
          — карточка гипотезы не обязательна.
        </p>
      </Container>
    </main>
  );
}
