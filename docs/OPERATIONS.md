# Эксплуатация

Документ для владельца и того, кто будет поддерживать сервис. Всё, что требует денег, доступа или юридического решения, помечено **Решение владельца**.

## Из чего состоит сервис

| Часть | Что делает | Где живёт |
| --- | --- | --- |
| Next.js (`output: standalone`) | Страницы, API, проверка сессии в `proxy.ts` | Docker-контейнер из `Dockerfile`, `docker-compose.production.yml` (один экземпляр) |
| Supabase Auth (GoTrue) | Вход по коду из письма, сессии | Тот же проект Supabase |
| Supabase Postgres + PostgREST | Проекты, гипотезы, шаги, PRO-доступ, заявки | Тот же проект Supabase |
| SMTP | Письма с кодом входа | Настраивается в Supabase Auth |
| Telegram (необязательно) | Уведомления о заявках | Бот владельца |
| AI-провайдер (необязательно) | Подбор направлений по кнопке | Любой OpenAI-совместимый API |

Приложение не использует ничего, кроме REST API Supabase (Auth + PostgREST), поэтому подходит и облачный Supabase, и self-hosted Supabase на своём сервере.

## Хранилище и регион

**Решение владельца.** Сервис хранит email пользователей и их проекты — это персональные данные. Аудитория русскоязычная; если среди пользователей граждане РФ, закон 152-ФЗ требует, чтобы первичная запись и хранение их персональных данных шли в базах на территории РФ. Облачный Supabase таких регионов не предлагает. Варианты:

1. **Self-hosted Supabase на российском сервере** (тот же VPS, где работает `docker-compose.production.yml`, или отдельный). Без подписки Supabase; нужны резервные копии (см. ниже) и обновления.
2. **Облачный Supabase в регионе EU (Frankfurt, `eu-central-1`)** — если аудитория не из РФ или юрист подтвердил допустимость.

До решения код не привязан к провайдеру. В политике конфиденциальности (`lib/content.ts → privacySections`) провайдер и регион помечены как «уточняется» — обновите текст после выбора. Проверьте выбор с юристом.

## Переменные окружения

Полный список — в `.env.example`. Секреты только на сервере: `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `AI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`. В клиентский бандл не попадает ни один из них (проверяется поиском по `.next/static`, см. README).

В production `SUPABASE_URL` и `AI_BASE_URL` должны быть `https://` — иначе интеграция считается не настроенной (вход и проекты показывают «временно недоступно», формы отвечают 503).

## Миграции

Миграции лежат в `supabase/migrations` и применяются по порядку:

| Файл | Что делает | Характер |
| --- | --- | --- |
| `20260504000000_base_submissions.sql` | Таблицы заявок, `access_codes`, RLS | Исходная схема (бывший `supabase/schema.sql`) |
| `20261109100000_niche_discovery_projects.sql` | Проекты, профили, версии гипотез, шаги, артефакты, аудит, права PRO, `ai_usage`, ключи идемпотентности, RPC | Только добавляет объекты; ничего не удаляет и не переписывает |
| `20261109180000_ai_quota_reservations.sql` | Атомарное резервирование AI-квоты: функции `reserve_ai_call` / `finish_ai_call` (только `service_role`), колонка `ai_usage.finished_at`, статус `reserved` | Добавляет колонку и функции, расширяет список статусов |

Применение:

```bash
# облачный проект
supabase link --project-ref <ref>
supabase db push            # покажет список миграций и спросит подтверждение

# self-hosted / любой Postgres с ролями Supabase
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261109100000_niche_discovery_projects.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261109180000_ai_quota_reservations.sql
```

Перед применением на рабочей базе — сделайте резервную копию (ниже).

### Откат миграции 20261109100000

Миграция аддитивна, поэтому первый шаг отката — **откат приложения**: разверните предыдущий коммит (`a072579`). Старый код не обращается к новым таблицам и продолжает работать. Учтите, что старая версия использует общий PRO-код (`PRO_ACCESS_CODE`) и подписанные cookie — их нужно будет снова задать.

Если нужно убрать объекты из базы, сначала откатите `20261109180000` (ниже), затем — эту миграцию. Данные **не удаляются**, а переносятся в отдельную схему:

```sql
begin;
create schema if not exists rollback_20261109;
alter table public.ai_usage              set schema rollback_20261109;
alter table public.entitlements          set schema rollback_20261109;
alter table public.audit_events          set schema rollback_20261109;
alter table public.startup_artifacts     set schema rollback_20261109;
alter table public.startup_step_progress set schema rollback_20261109;
alter table public.startup_hypotheses    set schema rollback_20261109;
alter table public.startup_profiles      set schema rollback_20261109;
alter table public.startups              set schema rollback_20261109;
alter table public.journey_steps         set schema rollback_20261109;
revoke all on schema rollback_20261109 from public, anon, authenticated;
-- RPC — это код, их можно пересоздать повторным применением миграции.
drop function if exists public.create_startup(text, text, jsonb, jsonb),
  public.update_startup_profile(uuid, jsonb),
  public.save_hypothesis_draft(uuid, jsonb, timestamptz),
  public.discard_hypothesis_revision(uuid),
  public.request_hypothesis_confirmation(uuid),
  public.approve_hypothesis(uuid),
  public.save_step_result(uuid, text, jsonb, integer),
  public.complete_step(uuid, text),
  public.archive_startup(uuid),
  public.rename_startup(uuid, text),
  public.redeem_access_code(text),
  public.my_pro_status(),
  public._step_gate(rollback_20261109.startups, rollback_20261109.journey_steps),
  public._write_profile(uuid, uuid, jsonb),
  public._apply_hypothesis_fields(rollback_20261109.startup_hypotheses, jsonb),
  public._hypothesis_change_kind(rollback_20261109.startup_hypotheses, rollback_20261109.startup_hypotheses),
  public._hypothesis_missing_fields(rollback_20261109.startup_hypotheses),
  public._text_list(jsonb, text, integer),
  public._text_field(jsonb, text, integer),
  public.has_active_pro(uuid),
  public._owned_startup(uuid),
  public._require_user();
commit;
```

Скрипт проверен на локальном стеке в транзакции с `rollback` вместо `commit` (2026-11-09): 9 таблиц перенесены, новых функций в `public` не осталось, ошибок нет.

Добавленные колонки (`access_codes.plan/max_uses/use_count/entitlement_days/note`, `idempotency_key` в заявках) безвредны для старого кода и остаются на месте. Возврат вперёд: `alter table rollback_20261109.<table> set schema public;` для каждой таблицы и повторное создание функций из файла миграции (блоки `create or replace function` и `grant`).

### Откат миграции 20261109180000

Достаточно откатить приложение: предыдущая версия записывает `ai_usage` обычной вставкой, и расширенный список статусов ей не мешает. Колонка `finished_at` и строки со статусом `reserved` остаются (это учёт расходов, их не трогаем). Если нужно убрать функции:

```sql
drop function if exists public.reserve_ai_call(uuid, text, integer, integer),
  public.finish_ai_call(bigint, text, integer, integer);
```

Возврат вперёд — повторно применить файл миграции (он идемпотентен: `if not exists`, `create or replace`). Проверено на локальном стеке: повторное применение и удаление функций (в транзакции с `rollback`) проходят без ошибок, обычная вставка старой версией после удаления работает.

## Резервные копии и восстановление

Копировать нужно **схемы `public`, `auth` и `extensions` вместе**: политики RLS ссылаются на `auth.uid()`, а аккаунты лежат в `auth.users`. Копия одной `public` не восстанавливается корректно (проверено).

```bash
# резервная копия (ежедневно, хранить 14–30 дней, вне сервера с базой)
pg_dump "$DATABASE_URL" -n public -n auth -n extensions --no-owner -Fc -f backup-$(date +%F).dump

# восстановление в пустой проект Supabase / свежий self-hosted стек
pg_restore -d "$TARGET_DATABASE_URL" --no-owner backup-YYYY-MM-DD.dump
```

Ожидаемые предупреждения при восстановлении в Supabase: «schema public already exists» и «permission denied to change default privileges» — данные и политики восстанавливаются. Проверка после восстановления: число строк в `public.startups`, `public.startup_hypotheses`, `auth.users`, `public.entitlements` совпадает с источником; вход по коду работает.

Последняя проверка (локальный стек, 2026-11-09): дамп → восстановление в отдельную базу, все пять счётчиков совпали, 8 политик RLS на месте.

**Решение владельца:** облачный Supabase делает ежедневные копии на платных тарифах (PITR — отдельная опция); на бесплатном тарифе и в self-hosted нужен собственный `pg_dump` по расписанию (cron + хранение во внешнем хранилище). Раз в квартал восстанавливайте копию в тестовый проект.

## Доступы и администрирование

- В приложении нет админ-панели. Администрирование — консоль Supabase (или `psql` на своём сервере) и скрипт `scripts/access-codes.mjs`.
- **MFA для администраторов:** включите двухфакторную аутентификацию для всех аккаунтов организации Supabase (Account → Security) и вход на сервер только по SSH-ключам. **Решение владельца** — это настройки аккаунтов, не кода.
- Сервисный ключ (`SUPABASE_SERVICE_ROLE_KEY`) используется только для: записи заявок, учёта лимитов AI и скрипта кодов. Пользовательские данные приложение читает и пишет **токеном пользователя**, поэтому RLS и проверки в RPC работают всегда.
- Пользователь не может писать в таблицы напрямую (нет прав INSERT/UPDATE/DELETE), только через RPC с проверкой владельца. Чужой UUID → «не найдено» (проверяется интеграционными тестами).

## PRO-доступ: выдача и отзыв

Коды персональные, в базе хранится только SHA-256. Скрипт запускается вручную владельцем:

```bash
node --env-file=.env.local scripts/access-codes.mjs issue --days 365 --note "заказ 1042"   # код показывается один раз
node --env-file=.env.local scripts/access-codes.mjs revoke-code <code-id> --reason "возврат"
node --env-file=.env.local scripts/access-codes.mjs revoke-user <user-uuid> --reason "возврат"
```

Срок действия задаётся при выпуске (`--days`), отзыв срабатывает сразу — сервер проверяет право на каждом запросе к PRO-шагу.

## Ограничения частоты и граница доверия к X-Forwarded-For

Лимиты (`lib/server/rate-limit.ts`) хранятся в памяти процесса — это корректно для текущей схемы с одним контейнером. При горизонтальном масштабировании нужен общий счётчик (например, Redis) — иначе лимит умножается на число экземпляров. Лимиты входа дополнительно задаёт Supabase Auth (`[auth.rate_limit]` в `supabase/config.toml`; в облаке — в настройках проекта).

Адрес клиента для лимитов берётся только из `X-Forwarded-For`, записанного доверенным прокси:

- `TRUSTED_PROXY_HOPS` — сколько обратных прокси стоит перед приложением. Адрес берётся на этом расстоянии от правого края цепочки; всё левее написал клиент. `X-Real-IP` и `Forwarded` не читаются.
- `0` (по умолчанию) — заголовок не читается вовсе, все запросы делят один общий лимит. Это безопасно при прямом доступе, но строго: в production без прокси в журнале появится предупреждение `[rate-limit] client address not trusted`.
- Рабочая схема: `docker-compose.production.yml` слушает только `127.0.0.1:3200`, перед ним nginx из [`deploy/nginx/business-rebootai.ru.conf`](../deploy/nginx/business-rebootai.ru.conf), в compose задано `TRUSTED_PROXY_HOPS=1`. nginx **перезаписывает** `X-Forwarded-For` адресом TCP-соединения (`$remote_addr`) и очищает `X-Real-IP`/`Forwarded`, так что подмена заголовков клиентом не доходит до приложения.
- IPv6-адреса группируются по /64: смена адреса внутри одной сети не даёт нового лимита.
- CDN перед nginx: не увеличивайте `TRUSTED_PROXY_HOPS`, а восстановите адрес в nginx (`set_real_ip_from` для диапазонов CDN + `real_ip_header`), пример — в комментарии конфигурации.
- Нельзя публиковать порт приложения наружу (`0.0.0.0:3200`) при `TRUSTED_PROXY_HOPS=1`: тогда клиент сам пишет последний элемент цепочки.

Проверено 2026-11-09: образ из `Dockerfile` с окружением compose + nginx с этой конфигурацией; 6 заявок с одного адреса с разными поддельными `X-Forwarded-For`/`X-Real-IP` → шестая получает 429, запрос с другого адреса проходит.

## Доставка заявок

- Успех (200) — только если заявку подтвердила база **или** Telegram.
- Повтор с тем же ключом идемпотентности: база отвечает «дубликат» (уникальный индекс), а для Telegram приложение помнит результат по ключу. Одновременные повторы ждут одну и ту же попытку; подтверждённое сообщение не отправляется второй раз.
- Telegram не поддерживает идемпотентность. Если ответ не получен (таймаут, сетевая ошибка, 5xx), сообщение могло дойти — пользователь видит «Не удалось подтвердить, что заявка дошла», а не «отправлено». Повтор отправляет сообщение ещё раз с пометкой «возможен дубль». Это доставка «хотя бы один раз», не «ровно один раз».
- В каждом сообщении есть «Номер заявки» (первые 8 символов ключа) — по нему копии сопоставляются вручную.
- Память о Telegram-отправках живёт в процессе 24 часа. После перезапуска контейнера или при нескольких экземплярах повтор старой заявки может прийти в Telegram ещё раз (в базе дубля не будет).

## Журналы

В журналы не пишутся тела заявок, email, коды входа и токены. Ошибки доставки логируются как `[submission:<table>] ...` без содержимого. Действия с проектами пишутся в `public.audit_events` (владелец видит только свои).

## AI-советник

Выключен, пока не заданы `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` и `AI_DAILY_GLOBAL_LIMIT > 0`. Дневной лимит на пользователя — `AI_DAILY_LIMIT_PER_USER` (по умолчанию 5), сутки считаются по UTC.

Учёт бюджета:

1. **До** вызова провайдера приложение резервирует единицу квоты функцией `reserve_ai_call`: под транзакционной advisory-блокировкой она считает использованное за сутки (на пользователя и всего) и вставляет строку `reserved`. Параллельные запросы не могут пройти проверку одновременно — при лимите 1 из четырёх одновременных запросов к провайдеру уходит один (интеграционный тест `tests/integration/ai-quota.test.ts`).
2. После ответа `finish_ai_call` записывает исход и токены.
3. Не удалось зарезервировать (база недоступна) — провайдер **не вызывается**, пользователь получает подбор по правилам.
4. Не удалось записать исход — резерв остаётся `reserved` и продолжает считаться израсходованным. Ошибки учёта всегда ведут к меньшему расходу, а не к большему.
5. Каждая попытка (успех, таймаут, ошибка провайдера, невалидный ответ) расходует единицу.

При ошибке, превышении лимита или невалидном ответе модели пользователь получает подбор по правилам с пояснением. **Решение владельца:** провайдер и бюджет — это расходы, они не включены.
