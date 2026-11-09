import type { Metadata } from "next";

import { PublicForm } from "@/components/forms/PublicForm";
import { Container } from "@/components/site/Container";
import { PageIntro } from "@/components/site/PageIntro";
import { partnerFormatOptions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Партнёрам",
  description: "Для авторов каналов, сообществ и экспертов, чья аудитория думает о своём деле.",
};

const principles = [
  ["Честное обещание", "Рассказываем о сервисе как об инструменте проверки идеи — без обещаний дохода."],
  ["Подходящая аудитория", "Люди, которые хотят начать услуги, торговлю или производство на заказ."],
  ["Прозрачные условия", "Формат и вознаграждение согласуем лично после знакомства с аудиторией."],
];

export default function PartnersPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Партнёрам"
        title="Помогите своей аудитории сделать первый проверяемый шаг"
        lede="Если вы ведёте канал, сообщество или консультируете начинающих предпринимателей — давайте познакомимся."
      />
      <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <dl className="space-y-6">
          {principles.map(([title, text]) => (
            <div key={title} className="border-t-2 border-ink pt-4">
              <dt className="font-display text-lg font-medium">{title}</dt>
              <dd className="prose-body mt-1.5">{text}</dd>
            </div>
          ))}
        </dl>
        <div className="max-w-[40rem]">
          <h2 className="subtitle">Расскажите об аудитории</h2>
          <div className="mt-6">
            <PublicForm
              endpoint="/api/partners"
              successHref="/thanks?type=partner"
              submitLabel="Отправить заявку"
              fields={[
                { name: "name", label: "Имя", type: "text", required: true, autoComplete: "name", maxLength: 120 },
                { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", maxLength: 254 },
                { name: "telegram", label: "Telegram", type: "text", maxLength: 64, hint: "Например, @username" },
                { name: "channelUrl", label: "Ссылка на канал или сообщество", type: "url", required: true, maxLength: 500 },
                { name: "audienceSize", label: "Размер аудитории", type: "text", required: true, maxLength: 100 },
                { name: "cooperationFormat", label: "Формат сотрудничества", type: "select", required: true, options: partnerFormatOptions },
              ]}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
