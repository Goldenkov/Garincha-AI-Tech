import type { Metadata } from "next";

import { PublicForm } from "@/components/forms/PublicForm";
import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Обратная связь",
  description: "Расскажите, что было понятно, где вы застряли и чего не хватило.",
};

export default function FeedbackPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Обратная связь"
        title="Где было понятно, а где вы застряли?"
        lede="Короткие честные ответы помогают нам убрать лишнее и дописать недостающее. Также сюда можно написать об ошибке или запросить удаление данных."
      />
      <Container>
        <div className="max-w-[40rem]">
          <PublicForm
            endpoint="/api/feedback"
            successHref="/thanks?type=feedback"
            submitLabel="Отправить отзыв"
            consent={false}
            fields={[
              { name: "rating", label: "Насколько полезно, от 1 до 10", type: "rating", required: true },
              { name: "clear", label: "Что было понятно и полезно", type: "textarea" },
              { name: "stuck", label: "Где застряли или что смутило", type: "textarea" },
              { name: "missing", label: "Чего не хватило", type: "textarea" },
              { name: "result", label: "Что получилось сделать", type: "textarea" },
              { name: "niche", label: "Направление", type: "text", maxLength: 200 },
              { name: "name", label: "Имя", type: "text", autoComplete: "given-name", maxLength: 120 },
            ]}
          />
        </div>
      </Container>
    </main>
  );
}
