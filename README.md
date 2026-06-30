# Vibe Business — сайт + прототип платформы automate.at

Один репозиторий, две вещи внутри: **боевой статический сайт компании** и **прототип платформы
Automate At** (в разработке). Без сборки — чистый HTML/CSS/JS, деплой через GitHub Pages.

**URL:** `vibe-business.space` · **GitHub:** `sanya8923/vibe-business-site`

---

## Что здесь

### 1. Боевой сайт — лендинги
| Путь | Страница |
|------|----------|
| `index.html` | Главная — Vibe Business (AI-автоматизация) |
| `school/` | Лендинг школы Profy Conveyor |
| `agency/` | Лендинг агентства |
| `bot-zavod/` | Лендинг продукта Bot Zavod |
| `CNAME` · `robots.txt` · `.nojekyll` | Домен, индексация, отключение Jekyll |

### 2. Платформа automate.at — прототип (в разработке)
`automate-at/` — прототип личного кабинета платформы **Automate At** (следующий этап Profy Conveyor:
обучение автоматизации на n8n). Vanilla HTML/CSS/JS, деплоится на `/automate-at/`. **Архитектура и
концепция неокончательны.**
- `automate-at/PLAN.md` — концепция и карта 23 экранов. Два пути обучения: **тренажёр** (модули M0–M11)
  + **каталог продуктов** (готовые AI-решения). Пути переплетаются.
- Подпапки-экраны: `dashboard/`, `courses/`, `tasks/`, `library/`, `knowledge/`, `products/`,
  `billing/`, `settings/`, `my/`, `_articles/`.
- `automate-at-ref/` — референс-дизайн (jsx-макеты Dashboard / ModuleDetail).
- `automate-at.zip` — архивный снимок прототипа.

### 3. Preview учебных задач (опубликованные)
- `p/<hash>/` — обфусцированные preview-страницы задач (напр. `M-HttpV2-03 · preview · Automate At`,
  внутри `index.html` + `screenshots/`). Публикуются скиллом `vb_module-tasks` на vibe-business.space;
  имя папки — хеш (обфускация прямого доступа).
- `_preview/` — preview отдельных задач (AI-01-*).

### 4. Демо / прототипы продуктовых разделов
- `rag-agent/` — прототип wizard'а сборки RAG-агента (локально, через `localStorage`). Его
  `assets/styles.css` — **общая стилевая база**, её импортирует прототип `automate-at/`.
- `embedding-quiz/` — демо-квиз по эмбеддингам.
- `research/` — служебный артефакт (research), к сайту не относится.

---

## Деплой

Push в `main` → GitHub Pages публикует автоматически. Сборки нет.
Это **отдельный git-репозиторий** (`vibe-business-site`), не субмодуль основного — коммить и пушить
изнутри `site/`.
