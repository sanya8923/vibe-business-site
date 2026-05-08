# Библиотека inline-статей AI-01

Каждая статья — expandable `<details class="aa-inline-article">` блок внутри задачи.
Статьи с **reuse: HIGH** вынести в отдельные `.html` фрагменты и включать через JS fetch при масштабировании.

---

## Зарегистрированные статьи

| slug | Заголовок | Где используется | Reuse |
|------|-----------|-----------------|-------|
| `n8n-credential-header-auth` | Пошаговая инструкция: добавить Header Auth credential в n8n | S-Embed-Cohere (шаг 0.4) | HIGH — любой стретч с own_api_key |
| `qdrant-dimensions-incompatible` | Почему нельзя смешивать векторы разной размерности | S-Embed-Cohere (шаг 1) | MEDIUM — любой embedding-switch |
| `n8n-subnode-concept` | Что такое sub-нода и как она работает внутри Qdrant Insert | S-Embed-Cohere (шаг 2) | HIGH — любой стретч с заменой sub-ноды |
| `cohere-input-type-explained` | Зачем Input Type разный в WF1 и WF2 | S-Embed-Cohere (шаг 3) | LOW — только Cohere |
| `n8n-telegram-botfather` | Как создать бота в Telegram через BotFather | M5-01 (шаг 1) | HIGH — любой Telegram-стретч |

---

## Статьи в плане (нужны для будущих стретчей)

| slug | Заголовок | Приоритет |
|------|-----------|-----------|
| `qdrant-delete-collection` | Как удалить и пересоздать Qdrant-коллекцию | HIGH (S-Embed-Voyage, S-Embed-BGE) |
| `n8n-community-node-install` | Как установить community node в n8n | HIGH (S-Mem-Mem0, S-Channels-MAX) |
| `litellm-proxy-concept` | Что такое LiteLLM-прокси и как школа его использует | HIGH (все school_token стретчи) |
| `cohere-dashboard-usage` | Как следить за usage в Cohere dashboard | MEDIUM (S-Embed-Cohere) |
| `voyage-api-registration` | Регистрация в Voyage AI и получение API key | LOW (S-Embed-Voyage) |
| `mem0-registration` | Регистрация в Mem0 и получение API key | LOW (S-Mem-Mem0) |
| `n8n-http-request-basics` | HTTP Request нода: метод, URL, auth, body | MEDIUM (стретчи без native ноды) |
| `qdrant-school-credentials` | Где взять Qdrant master ключ (школьная инфра) | HIGH (все стретчи с Qdrant) |

---

## Формат статьи

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

## Правила

- Заголовок — конкретный вопрос или действие, не тема
- Время чтения: ~1 мин = 150 слов, ~2 мин = 300 слов, ~3 мин = 450 слов
- Скриншоты — `aa-inline-article-screenshot is-placeholder` до готовности, потом реальный `<img>`
- HIGH reuse статьи должны иметь одинаковый контент во всех задачах (копипаста → единый фрагмент)
