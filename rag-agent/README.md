# /rag-agent — продуктовый раздел Profy Conveyor

Прототип wizard'а сборки RAG-агента. Локально потыкабельный — без бэкенда, всё через `localStorage`.

## Запуск

```bash
python3 -m http.server 8000 --directory site/
```

Открыть: <http://localhost:8000/rag-agent/>

## Структура

```
site/rag-agent/
├── index.html                    # Landing с 3 CTA + промо-кейсы
├── wizard/
│   ├── index.html                # Бриф (11 полей)
│   ├── embedding.html            # Embedding-quiz
│   ├── retrieval.html            # Retrieval-quiz
│   ├── memory.html               # Memory-quiz
│   ├── channels.html             # Channels-quiz
│   ├── data.html                 # Data-quiz
│   └── result.html               # Финал — стек / Markdown / Техзадание
├── cases/
│   ├── jur-agency/               # Полный эталонный кейс
│   ├── auto-service/             # Полный кейс
│   ├── medical-clinic/           # Заглушка «Скоро будет»
│   ├── b2b-saas/                 # Заглушка
│   ├── corporate/                # Заглушка
│   └── edu-saas/                 # Заглушка
├── assets/
│   ├── styles.css                # Дизайн-система
│   ├── shared.js                 # Общие утилиты + state
│   ├── catalog.js                # Каталог стретчей + scoring + автоблоки
│   ├── brief.js                  # 11 полей брифа
│   ├── quizzes.js                # 5 квизов (14 вопросов)
│   ├── warnings.js               # Триггеры warnings
│   ├── cases.js                  # Преднастроенные шаблоны кейсов
│   └── preview.js                # Рендер sticky preview sidebar
└── README.md
```

## Что внутри прототипа

- 11-полевой бриф (geo / legal_form / data_residency / infra_level / budget / stage / lang / kb_size / update_frequency / project_type / users_scale)
- 5 квизов: Embedding (1Q) → Retrieval (4Q) → Memory (4Q) → Channels (2Q) → Data (3Q)
- 4 автоблока: Storage / Sec / Ops / Chat Model
- Live-preview sticky sidebar справа
- Финал: «Получившийся стек» (лидер + альтернативы) + warnings + Markdown / Техзадание
- 6 учебных кейсов (2 полных, 4 заглушки)
- Кнопка «Скопировать опросник для клиента»

## State

Всё в `localStorage`:

```
rag-agent-projects: [{ id, name, brief, answers, source, createdAt }]
rag-agent-active-project: "<id>"
```

## Что НЕ реализовано

- Реальные ссылки на задачи школы (заглушки `href="#"`)
- Google Drive ссылки на корпуса (заглушки)
- Backend / multi-device sync
- Деплой
