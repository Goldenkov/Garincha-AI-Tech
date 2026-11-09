import { Container } from "@/components/site/Container";

export function StorageDown() {
  return (
    <main>
      <Container className="py-16">
        <h1 className="title">Хранилище временно недоступно</h1>
        <p className="lede mt-4 max-w-[46ch]">
          Мы не смогли загрузить ваши проекты. Данные не потеряны — попробуйте обновить страницу через минуту.
        </p>
        <a href="" className="btn btn-primary mt-8">
          Обновить
        </a>
      </Container>
    </main>
  );
}
