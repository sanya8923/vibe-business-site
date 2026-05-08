# Библиотека inline-статей школы Profy Conveyor

Каждая inline-статья — переиспользуемый expandable-блок (`<details class="aa-inline-article">`), который вставляется в задачу там, где он логически нужен. Цель: одна тема — одно объяснение, переиспользуется во всех задачах.

---

## Правила использования

1. **Перед написанием задачи** проверь индекс — возможно, нужная инструкция уже есть.
2. **Не дублируй** объяснения между задачами. Если объяснил один раз — добавь сюда и переиспользуй.
3. **Универсальность**: статьи не привязываются к продукту/каналу/конкретному API-ключу. Конкретику (`Cohere API`, `c01-kb-agent`) выноси в текст задачи, в саму статью пиши через placeholder (`<имя_credential>`, `<student_id>-kb-agent`).
4. **Имена workflow** в задачах указываются точно (`WF1: Chat Trigger Ingestion Pipeline`), чтобы можно было ссылаться. Если в задаче ученик создаёт workflow — обязательно даём ему имя.

---

## Конвенции

- **slug** — короткий идентификатор (`n8n-credential-header-auth`).
- **reuse: HIGH** — используется в 3+ задачах. Кандидат на вынос в `<slug>.html` фрагмент с подгрузкой через JS fetch.
- **reuse: MEDIUM** — 2 задачи. Пока inline-копия.
- **reuse: LOW** — узкоспецифичная, одна задача. Inline.
- **Время чтения**: ~1 мин = 150 слов, ~2 мин = 300, ~3 мин = 450.

---

## Опубликованные статьи

### Категория: n8n Core Concepts

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `n8n-add-first-node` | Как добавить свою первую ноду в n8n | M0-01 | HIGH |
| `n8n-open-chat` | Как открыть чат в n8n | M0-01 | HIGH |
| `n8n-read-node` | Прежде чем собирать — научись читать ноду | M5-01 | HIGH |
| `n8n-first-trigger` | Как создать свой первый триггер в n8n | M5-01 | MEDIUM |
| `n8n-binary-data` | Что такое binary в n8n | M5-01 | HIGH |
| `n8n-subnode-concept` | Что такое sub-нода и как её заменить | AI-01/S-Embed-Cohere | HIGH |

### Категория: Credentials и API

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `n8n-credential-header-auth` | Как добавить Header Auth credential в n8n | AI-01/S-Embed-Cohere | HIGH |
| `my-credentials-in-platform` | Раздел «Мои Credentials» в личном кабинете школы | AI-01/S-Embed-Cohere | HIGH |
| `n8n-http-request-import-from-curl` | Как быстро настроить HTTP Request ноду через Import from cURL | AI-01/S-Embed-Cohere | HIGH — переиспользуется в любой задаче с внешним API |

### Категория: Qdrant

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `qdrant-overview` | Что такое Qdrant и как с ним работать в n8n | AI-01/S-Embed-Cohere | HIGH |
| `qdrant-collection-naming` | Правила именования Qdrant-коллекций в школе | AI-01/S-Embed-Cohere | HIGH |
| `qdrant-dimensions-incompatible` | Почему нельзя смешивать векторы разной размерности | AI-01/S-Embed-Cohere | MEDIUM |

### Категория: AI / LLM сервисы

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `cohere-overview-and-models` | Cohere — что это, какие модели, зачем разный input_type | AI-01/S-Embed-Cohere | MEDIUM |
| `n8n-whisper` | Что такое Whisper | M5-01 | MEDIUM |

### Категория: Архитектура агентов

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `datatable-config-concept` | Что такое конфиг продукта в DataTable и зачем он нужен | AI-01/S-Embed-Cohere | HIGH — любая задача с конфигом в DataTable |

### Категория: Telegram

| slug | Заголовок | Где используется | Reuse |
|------|-----------|------------------|-------|
| `n8n-telegram-botfather` | Как создать бота в Telegram через BotFather | M5-01 | HIGH |

### Категория: Узкоспецифичные (LOW reuse)

| slug | Заголовок | Где используется |
|------|-----------|------------------|
| `n8n-get-file-settings` | Как выглядят настройки Get File в интерфейсе | M5-01 |
| `n8n-send-message-settings` | Как выглядят настройки Send Message в интерфейсе | M5-01 |

---

## Статьи в плане

| slug | Заголовок | Приоритет |
|------|-----------|-----------|
| `n8n-community-node-install` | Как установить community node в n8n | HIGH (S-Mem-Mem0, S-Channels-MAX) |
| `litellm-proxy-concept` | Что такое LiteLLM-прокси и как школа его использует | HIGH (school_token стретчи) |
| `voyage-api-registration` | Регистрация в Voyage AI | LOW (S-Embed-Voyage) |
| `mem0-registration` | Регистрация в Mem0 | LOW (S-Mem-Mem0) |

---

## Формат inline-статьи (HTML)

```html
<details class="aa-inline-article" data-article-slug="SLUG">
  <summary>
    <span class="aa-inline-article-icon">🔑</span>
    <span class="aa-inline-article-title">Заголовок</span>
    <span class="aa-inline-article-hint">статья · ~N мин</span>
    <span class="aa-inline-article-arrow" aria-hidden="true">▾</span>
  </summary>
  <div class="aa-inline-article-body">
    <div class="aa-md-body">
      <!-- контент -->
    </div>
  </div>
</details>
```

## Правила содержимого

- Заголовок — конкретный вопрос или действие, не тема.
- Скриншоты — реальный `<img>` из n8n / интерфейса сервиса.
- HIGH reuse статьи должны иметь идентичный контент во всех задачах (копипаста синхронизируется).
- Не упоминать «последняя модель», «свежая версия» — устареет.
- Не привязывать к конкретной задаче-носителю («как мы делали в M5-01») — статья переживёт ребрендинг задач.
