import Link from "next/link";

import { Container } from "@/components/site/Container";

export default function NotFound() {
  return (
    <main>
      <Container className="max-w-[44rem] py-20 sm:py-28">
        <p className="eyebrow">404</p>
        <h1 className="title mt-3">Страница не найдена</h1>
        <p className="lede mt-5">
          Возможно, ссылка устарела или проект принадлежит другому аккаунту. Если вы вошли не под тем email, выйдите и войдите снова.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/" className="btn btn-primary">
            На главную
          </Link>
          <Link href="/projects" className="btn btn-secondary">
            Мои проекты
          </Link>
        </div>
      </Container>
    </main>
  );
}
