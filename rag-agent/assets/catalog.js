/* RAG-Agent — каталог стретчей + автоблоки + scoring.
   Source of truth: memory/project_ai01_*_category_design.md, *_autoblock.md */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // Каталог стретчей
  // ─────────────────────────────────────────────────────────
  const STRETCHES = {
    // Embedding
    'S-Embed-OpenAI-Small':   { id: 'S-Embed-OpenAI-Small',   category: 'embedding', name: 'text-embedding-3-small',     short: 'Базовая дешёвая модель OpenAI для смыслового поиска.',     mode: 'managed cloud' },
    'S-Embed-Cohere':         { id: 'S-Embed-Cohere',         category: 'embedding', name: 'Cohere Embed v3',           short: 'Понимает большие документы целиком (до ~30 страниц текста за раз) и работает на 100+ языках.', mode: 'managed cloud' },
    'S-Embed-Voyage':         { id: 'S-Embed-Voyage',         category: 'embedding', name: 'Voyage AI',                  short: 'Лучшее качество для длинных документов.',                  mode: 'managed cloud' },
    'S-Embed-Voyage-Domain':  { id: 'S-Embed-Voyage-Domain',  category: 'embedding', name: 'Voyage Domain (law/finance)', short: 'Специализация под юр./фин. английские тексты.',           mode: 'managed cloud' },
    'S-Embed-Gemini':         { id: 'S-Embed-Gemini',         category: 'embedding', name: 'Gemini Embedding 2',         short: 'Мультимодальность text + image + video + audio.',         mode: 'managed cloud' },
    'S-Embed-GigaChat':       { id: 'S-Embed-GigaChat',       category: 'embedding', name: 'GigaChat Embeddings',        short: 'РФ-managed под ФЗ-152, оптимизирован для русского.',       mode: 'managed cloud' },
    'S-Embed-BGE-Selfhost':   { id: 'S-Embed-BGE-Selfhost',   category: 'embedding', name: 'bge-m3 self-host',           short: 'Open-source модель на CPU/GPU клиента.',                   mode: 'self-host' },

    // Retrieval
    'S-Retrieval-Hybrid':     { id: 'S-Retrieval-Hybrid',     category: 'retrieval', name: 'Гибридный поиск (smart + keyword)',         short: 'Объединяет два поиска: «по смыслу» (находит близкие по теме фрагменты) и «по точному совпадению слов» (находит артикулы, номера договоров, шифры). Результаты обоих способов умно склеиваются — ничего не теряется.', mode: 'self-host' },
    'S-Retrieval-Rerank':     { id: 'S-Retrieval-Rerank',     category: 'retrieval', name: 'S-Retrieval-Rerank',         short: 'Cohere Rerank поверх top-50 → top-5 точных. Для крупной KB обязательно.', mode: 'managed cloud' },
    'S-Retrieval-Rerank-BGE': { id: 'S-Retrieval-Rerank-BGE', category: 'retrieval', name: 'bge-reranker self-host',     short: 'Self-host альтернатива Cohere для KB с ПДн / экономии.',   mode: 'self-host' },
    'S-Retrieval-MultiQuery': { id: 'S-Retrieval-MultiQuery', category: 'retrieval', name: 'S-Retrieval-MultiQuery',     short: 'LLM генерирует 3–5 переформулировок запроса параллельно.', mode: 'managed cloud' },
    'S-Retrieval-MetaFilter': { id: 'S-Retrieval-MetaFilter', category: 'retrieval', name: 'S-Retrieval-MetaFilter',     short: 'Фильтры по типу/дате/источнику + temporal-aware retrieval.', mode: 'self-host' },
    'S-Retrieval-Eval':       { id: 'S-Retrieval-Eval',       category: 'retrieval', name: 'S-Retrieval-Eval',           short: 'Golden set 50 вопросов + n8n Evaluation, 4 метрики через LLM-as-judge.', mode: 'self-host' },

    // Memory backend (9)
    'S-Mem-Profile':          { id: 'S-Mem-Profile',          category: 'memory',    name: 'Профиль клиента в Postgres', short: 'Хранит факты о клиенте (имя, контакты, предпочтения) в обычной таблице базы данных. Postgres — это стандарт индустрии: бесплатный, надёжный, его используют миллионы компаний (включая Apple, Reddit, Spotify). Подходит для большинства проектов.', mode: 'self-host' },
    'S-Mem-Mem0':             { id: 'S-Mem-Mem0',             category: 'memory',    name: 'Mem0',                       short: 'Готовый облачный сервис памяти для AI-агентов. Подключается одной нодой в n8n — не нужно строить хранилище самому.', mode: 'managed cloud' },
    'S-Mem-Supermemory':      { id: 'S-Mem-Supermemory',      category: 'memory',    name: 'Supermemory',                short: 'Managed memory с готовым admin UI.',                       mode: 'managed cloud' },
    'S-Mem-pgvector':         { id: 'S-Mem-pgvector',         category: 'memory',    name: 'pgvector в Postgres',        short: 'Сами строим semantic memory поверх pgvector.',             mode: 'self-host' },
    'S-Mem-Graphiti':         { id: 'S-Mem-Graphiti',         category: 'memory',    name: 'Graphiti',                   short: 'Temporal knowledge graph для истории взаимодействий.',     mode: 'self-host' },
    'S-Mem-Letta':            { id: 'S-Mem-Letta',            category: 'memory',    name: 'Letta',                      short: 'Автономный агент сам управляет своей памятью.',            mode: 'self-host' },
    'S-Mem-Zep-Cloud':        { id: 'S-Mem-Zep-Cloud',        category: 'memory',    name: 'Zep Cloud',                  short: 'Managed temporal memory + knowledge graph.',                mode: 'managed cloud' },
    'S-Mem-Responses':        { id: 'S-Mem-Responses',        category: 'memory',    name: 'OpenAI Responses API',       short: 'Память на стороне OpenAI, простейший setup.',              mode: 'managed cloud' },
    'S-Mem-Anthropic-Tool':   { id: 'S-Mem-Anthropic-Tool',   category: 'memory',    name: 'Anthropic Memory Tool',      short: 'Память на стороне Anthropic.',                              mode: 'managed cloud' },

    // Memory GDPR (6)
    'S-Mem-Consent':          { id: 'S-Mem-Consent',          category: 'memory',    name: 'Согласие на обработку персональных данных', short: 'В начале первого разговора агент спрашивает у клиента согласие на обработку персональных данных и сохраняет ответ.', mode: 'self-host' },
    'S-Mem-AutoDelete':       { id: 'S-Mem-AutoDelete',       category: 'memory',    name: 'Автоудаление старых данных', short: 'По расписанию (например, раз в сутки) система проходит по базе и удаляет данные, которые хранятся дольше установленного срока.', mode: 'self-host' },
    'S-Mem-Forget':           { id: 'S-Mem-Forget',           category: 'memory',    name: 'Команда «забыть меня»',      short: 'Клиент пишет агенту специальную команду — все его данные удаляются из памяти.', mode: 'self-host' },
    'S-Mem-Export':           { id: 'S-Mem-Export',           category: 'memory',    name: 'Экспорт истории по запросу клиента', short: 'Клиент пишет команду — получает на email все свои данные, которые агент хранит.', mode: 'self-host' },
    'S-Mem-AdminEdit':        { id: 'S-Mem-AdminEdit',        category: 'memory',    name: 'Ручная правка памяти администратором', short: 'Админ может зайти и поправить любые данные в памяти клиентов: исправить имя, добавить факт, удалить ошибочную запись.', mode: 'self-host' },
    'S-Mem-AdminUI':          { id: 'S-Mem-AdminUI',          category: 'memory',    name: 'AdminUI',                    short: 'Готовый интерфейс админа для управления памятью.',         mode: 'managed cloud' },

    // Channels
    'S-Channels-Telegram':    { id: 'S-Channels-Telegram',    category: 'channels',  name: 'Telegram',                   short: 'Самый массовый IT-канал в РФ — ~65 млн пользователей в день через VPN.', mode: 'self-host' },
    'S-Channels-WebWidget':   { id: 'S-Channels-WebWidget',   category: 'channels',  name: 'WebWidget',                  short: 'Чат-виджет на сайте клиента.',                              mode: 'self-host' },
    'S-Channels-Landing':     { id: 'S-Channels-Landing',     category: 'channels',  name: 'Лендинг для агента',         short: 'Простой одностраничный сайт под агента — собираем через AI-кодеры (Codex CLI / Claude Code), деплоим на Vercel и привязываем домен. Сюда же встраивается WebWidget с чатом.', mode: 'managed cloud' },
    'S-Channels-VK':          { id: 'S-Channels-VK',          category: 'channels',  name: 'VK-сообщество',              short: 'Native ноды n8n + VK Callback API.',                        mode: 'self-host' },
    'S-Channels-MAX':         { id: 'S-Channels-MAX',         category: 'channels',  name: 'MAX',                         short: 'Community-нода n8n-nodes-max. Только ООО/ИП РФ.',           mode: 'self-host' },

    // Data sources (3)
    'S-Data-Source-GoogleDrive': { id: 'S-Data-Source-GoogleDrive', category: 'data', name: 'Google Drive Trigger',       short: 'Авто-pull новых файлов из папки клиента.',                  mode: 'managed cloud' },
    'S-Data-Source-S3':       { id: 'S-Data-Source-S3',       category: 'data',     name: 'S3 / MinIO',                  short: 'Pull из bucket клиента.',                                   mode: 'self-host' },
    'S-Data-Source-WebScraping': { id: 'S-Data-Source-WebScraping', category: 'data', name: 'WebScraping',                short: 'Schedule + HTTP Request + HTML Extract.',                   mode: 'self-host' },

    // Data OCR (3)
    'S-Data-OCR-Yandex':      { id: 'S-Data-OCR-Yandex',      category: 'data',     name: 'Yandex Vision OCR',           short: 'РФ managed, специализация на рукописи. ФЗ-152 ОК.',          mode: 'managed cloud' },
    'S-Data-OCR-Mistral':     { id: 'S-Data-OCR-Mistral',     category: 'data',     name: 'Mistral OCR',                  short: 'Простой managed (нативная нода n8n). ЕС-инфра.',            mode: 'managed cloud' },
    'S-Data-OCR-Docling':     { id: 'S-Data-OCR-Docling',     category: 'data',     name: 'Docling self-host',            short: 'Self-host OCR, лучшее качество таблиц (97.9%).',             mode: 'self-host' },

    // Data Vision (4)
    'S-Data-Vision-YandexGPT':{ id: 'S-Data-Vision-YandexGPT', category: 'data',     name: 'YandexGPT Vision',            short: 'РФ-managed. Описывает картинки/схемы.',                      mode: 'managed cloud' },
    'S-Data-Vision-GigaChat': { id: 'S-Data-Vision-GigaChat',  category: 'data',     name: 'GigaChat Vision',             short: 'РФ-managed multimodal от Сбера.',                            mode: 'managed cloud' },
    'S-Data-Vision-Mistral':  { id: 'S-Data-Vision-Mistral',   category: 'data',     name: 'Mistral Pixtral',             short: 'Облачная модель, которая «смотрит» на картинки и схемы и описывает их текстом — для загрузки в базу знаний.', mode: 'managed cloud' },
    'S-Data-Vision-Gemini':   { id: 'S-Data-Vision-Gemini',    category: 'data',     name: 'Gemini Flash',                short: 'Самый дешёвый managed Vision (~$0.17/1000 стр).',            mode: 'managed cloud' },

    // Data Eval (1)
    'S-Data-Parse-Eval':      { id: 'S-Data-Parse-Eval',      category: 'data',     name: 'S-Data-Parse-Eval',           short: 'Golden chunks + проверка качества извлечения.',              mode: 'self-host' },

    // Sec
    'S-Sec-Base':             { id: 'S-Sec-Base',             category: 'sec',      name: 'Sec база (8 слоёв)',          short: 'Identity / Rate limit / Length / Unicode / Guardrails / MaxIter / Sanitize / Log.', mode: 'self-host' },
    'S-Sec-OpenGuardrails-RU':{ id: 'S-Sec-OpenGuardrails-RU', category: 'sec',     name: 'OpenGuardrails-RU',           short: 'F1 0.92 на русском (vs native 0.78). Cloud free tier или self-host.', mode: 'managed cloud' },
    'S-Sec-Eval':             { id: 'S-Sec-Eval',             category: 'sec',      name: 'S-Sec-Eval',                  short: 'Regression test защиты — 15 attack payloads + 5 легитимных.', mode: 'self-host' },

    // Storage
    'Storage-pgvector':       { id: 'Storage-pgvector',       category: 'storage',  name: 'Postgres + pgvector',         short: 'Дефолт каталога. Реляционные данные + vector search в одной БД.', mode: 'self-host' },
    'S-Storage-Qdrant':       { id: 'S-Storage-Qdrant',       category: 'storage',  name: 'Qdrant',                      short: 'Стретч для hyper-scale (100k+ документов или 1k+ запросов в день).', mode: 'self-host' },

    // Chat Model
    'Chat-GigaChat':          { id: 'Chat-GigaChat',          category: 'chat',     name: 'GigaChat',                    short: 'РФ-managed под ФЗ-152.',                                     mode: 'managed cloud' },
    'Chat-YandexGPT':         { id: 'Chat-YandexGPT',         category: 'chat',     name: 'YandexGPT',                   short: 'РФ-managed альтернатива GigaChat.',                          mode: 'managed cloud' },
    'Chat-DeepSeek':          { id: 'Chat-DeepSeek',          category: 'chat',     name: 'DeepSeek',                    short: 'Дешёвая облачная AI-модель. Хорошо понимает и русский, и английский.', mode: 'managed cloud' },
    'Chat-GPT-4.1-mini':      { id: 'Chat-GPT-4.1-mini',      category: 'chat',     name: 'GPT-4.1-mini',                short: 'Стандартный production-вариант OpenAI.',                     mode: 'managed cloud' },
    'Chat-GPT-4.1':           { id: 'Chat-GPT-4.1',           category: 'chat',     name: 'GPT-4.1',                     short: 'Топ-модель OpenAI.',                                          mode: 'managed cloud' },
    'Chat-Claude':            { id: 'Chat-Claude',            category: 'chat',     name: 'Claude Sonnet',                short: 'Топ-модель Anthropic.',                                       mode: 'managed cloud' },
    'Chat-Gemini':            { id: 'Chat-Gemini',            category: 'chat',     name: 'Gemini Pro',                   short: 'Топ-модель Google.',                                          mode: 'managed cloud' },
    'Chat-OSS':               { id: 'Chat-OSS',               category: 'chat',     name: 'Qwen3 / Llama3 self-host',     short: 'Self-host LLM на собственном GPU-сервере (on-prem).',         mode: 'self-host' }
  };

  // ─────────────────────────────────────────────────────────
  // Категории и метаданные
  // ─────────────────────────────────────────────────────────
  const CATEGORY_META = {
    embedding:  { icon: '🧠', title: 'Поиск по смыслу (Embedding)' },
    retrieval:  { icon: '🔍', title: 'Стратегия поиска (Retrieval)' },
    memory:     { icon: '💾', title: 'Память (Memory)' },
    channels:   { icon: '📡', title: 'Каналы' },
    data:       { icon: '📂', title: 'Источники документов (Data)' },
    storage:    { icon: '🗄️', title: 'Vector Storage' },
    sec:        { icon: '🛡️', title: 'Безопасность (Sec)' },
    ops:        { icon: '⚙️', title: 'Эксплуатация (Ops)' },
    chat:       { icon: '💬', title: 'Chat Model' }
  };

  // ─────────────────────────────────────────────────────────
  // Автоблок: Storage
  // ─────────────────────────────────────────────────────────
  function computeStorage(brief) {
    const leader = ['Storage-pgvector'];
    const alternatives = [];
    const rationale = ['Дефолт каталога. Postgres+pgvector хорош для подавляющего большинства проектов и даёт JOIN-ы со структурированными данными бесплатно.'];

    if (brief.kb_size === 'D' || brief.users_scale === 'D') {
      alternatives.push('S-Storage-Qdrant');
      rationale.push('Qdrant подключается как стретч из-за крупной базы (100k+ документов) или высокой нагрузки (тысячи в день).');
    }
    return { category: 'storage', leader, alternatives, rationale: rationale.join(' ') };
  }

  // ─────────────────────────────────────────────────────────
  // Автоблок: Sec
  // ─────────────────────────────────────────────────────────
  function computeSec(brief) {
    const leader = ['S-Sec-Base'];
    const alternatives = [];
    const rationaleParts = ['База Sec из 8 слоёв активна всегда (Identity / Rate Limit / Length / Unicode / Guardrails / MaxIter / Sanitize / Log).'];

    const isRuLang = ['B', 'C', 'D', 'E'].includes(brief.lang); // не EN-only
    const isRfData = brief.data_residency === 'B' || brief.data_residency === 'C';
    const isProduction = brief.stage === 'B';

    // OpenGuardrails-RU: при RU + ФЗ-152 — даже на MVP
    if (isRuLang && isRfData) {
      leader.push('S-Sec-OpenGuardrails-RU');
      rationaleParts.push('OpenGuardrails-RU обязателен: русский язык + ФЗ-152 — native Guardrails F1=0.78 недостаточно для реальных ПД.');
    } else if (isRuLang && isProduction) {
      leader.push('S-Sec-OpenGuardrails-RU');
      rationaleParts.push('OpenGuardrails-RU добавлен на production для качественной защиты на русском.');
    }

    // Sec-Eval — на production
    if (isProduction) {
      leader.push('S-Sec-Eval');
      rationaleParts.push('Sec-Eval включён автоматически — на production важна regression-проверка защиты.');
    }

    return { category: 'sec', leader, alternatives, rationale: rationaleParts.join(' ') };
  }

  // ─────────────────────────────────────────────────────────
  // Автоблок: Chat Model
  // ─────────────────────────────────────────────────────────
  function computeChatModel(brief) {
    const leader = [];
    const alternatives = [];
    let rationale = '';

    const isRu = ['B', 'C', 'E'].includes(brief.lang);
    const isMulti = brief.lang === 'D';
    const lowBudget = brief.budget_tier === 'A';

    if (brief.data_residency === 'C') {
      leader.push('Chat-OSS');
      rationale = 'On-premise — только self-host LLM (Qwen3 / Llama3) на собственном GPU-сервере.';
    } else if (brief.data_residency === 'B') {
      leader.push('Chat-GigaChat');
      alternatives.push('Chat-YandexGPT');
      rationale = 'ФЗ-152 — Chat Model видит запросы клиентов (ПД), нужен РФ-managed. GigaChat по умолчанию, YandexGPT — альтернатива.';
    } else {
      // data_residency=A
      if (isMulti) {
        leader.push('Chat-GPT-4.1');
        alternatives.push('Chat-Claude');
        rationale = 'Три и больше языков — нужна топ-модель с лучшей поддержкой многоязычности. GPT-4.1 / Claude.';
      } else if (lowBudget) {
        leader.push('Chat-DeepSeek');
        rationale = 'Малый бюджет — DeepSeek. Хорошо работает с русским и английским, очень дешёвый.';
      } else {
        leader.push('Chat-GPT-4.1-mini');
        if (isRu) {
          alternatives.push('Chat-GPT-4.1', 'Chat-Claude');
          rationale = 'GPT-4.1-mini — стандартный production-вариант. Для качественнее — GPT-4.1 / Claude.';
        } else {
          alternatives.push('Chat-Claude', 'Chat-Gemini');
          rationale = 'GPT-4.1-mini — стандартный production-вариант. Альтернативы — Claude / Gemini.';
        }
      }
    }

    return { category: 'chat', leader, alternatives, rationale };
  }

  // ─────────────────────────────────────────────────────────
  // Автоблок: Ops (чек-лист)
  // ─────────────────────────────────────────────────────────
  function computeOps(brief, answers) {
    const items = [];
    const uf = brief.update_frequency;
    const us = brief.users_scale;
    const ks = brief.kb_size;

    // (a) Reindex / Freshness
    if (['B', 'C', 'D'].includes(uf)) {
      const mode = uf === 'B' ? 'вручную' : (uf === 'C' ? 'по расписанию (например, раз в день)' : 'сразу при изменении документа');
      items.push({
        id: 'ops-reindex',
        required: true,
        title: 'Обновление базы знаний — режим: ' + mode,
        why: 'База обновляется ' + (uf === 'B' ? 'раз в месяц или квартал' : uf === 'C' ? 'раз в неделю' : 'каждый день') + ', значит агенту нужно периодически перечитывать документы, чтобы отвечать по свежей информации.'
      });
    }

    // (b) Rate limits
    if (['C', 'D'].includes(us) || ['C', 'D'].includes(ks) || uf === 'D') {
      items.push({
        id: 'ops-rate-limits',
        required: true,
        title: 'Защита от перегрузки и автоповторы при ошибках',
        why: 'Много пользователей или большая база — без защиты внешние сервисы начнут возвращать ошибки и часть запросов потеряется. Решение: посылать запросы пачками, при ошибке ждать и повторять.'
      });
    }

    // (c1) Embedding cache
    if (['C', 'D'].includes(uf) || ['C', 'D'].includes(ks)) {
      items.push({
        id: 'ops-embedding-cache',
        required: false,
        title: 'Кеш для уже обработанных документов',
        why: 'Когда база обновляется, не обрабатываем заново всё — пропускаем то, что не изменилось. Экономит деньги и время на повторной обработке.'
      });
    }

    // (c2) Response cache
    if (['A', 'B'].includes(brief.budget_tier) && ['A', 'B'].includes(uf)) {
      items.push({
        id: 'ops-response-cache',
        required: false,
        title: 'Кеш частых ответов (FAQ)',
        why: 'Если несколько клиентов задают один и тот же вопрос — берём готовый ответ из кеша, а не платим за новый запрос к AI. Экономит деньги.'
      });
    }

    // (d) Drift monitoring
    if (brief.stage === 'B' && ['C', 'D'].includes(us)) {
      items.push({
        id: 'ops-drift',
        required: false,
        title: 'Мониторинг качества ответов',
        why: 'Раз в неделю система автоматически прогоняет 50–100 заранее заготовленных вопросов и сравнивает ответы агента с эталонами. Если качество просело — придёт алерт.'
      });
    }

    return { category: 'ops', items };
  }

  // ─────────────────────────────────────────────────────────
  // Embedding scoring
  // ─────────────────────────────────────────────────────────
  function computeEmbeddingStretches(brief, answers) {
    const a = (answers.embedding && answers.embedding.q1) || [];
    const isRu = ['B', 'C', 'D', 'E'].includes(brief.lang);
    const isRf = brief.data_residency === 'B' || brief.data_residency === 'C';
    const onPrem = brief.data_residency === 'C';

    const leader = [];
    const alternatives = [];
    const rationaleParts = [];

    // Лидер базовой embedding модели
    if (onPrem) {
      leader.push('S-Embed-BGE-Selfhost');
      rationaleParts.push('On-premise — единственный путь — self-host bge-m3.');
    } else if (isRf || (isRu && a.length === 0)) {
      leader.push('S-Embed-GigaChat');
      rationaleParts.push('РФ-managed embeddings под ФЗ-152 / для русского — GigaChat.');
      alternatives.push('S-Embed-BGE-Selfhost');
    } else {
      // data_residency=A
      leader.push('S-Embed-OpenAI-Small');
      rationaleParts.push('Базовая дешёвая модель OpenAI — лучший дефолт под облачный сценарий.');
    }

    // Активация по выбранным типам контента
    if (a.includes('B')) {
      // длинные документы — Voyage / Cohere длинный контекст
      if (!onPrem) {
        if (!leader.includes('S-Embed-Cohere') && !leader.includes('S-Embed-Voyage')) {
          alternatives.push('S-Embed-Cohere', 'S-Embed-Voyage');
          rationaleParts.push('Длинные документы — Cohere v3 / Voyage с контекстом 32k+ ловят смысл всего фрагмента.');
        }
      }
    }
    if (a.includes('C')) {
      // мультимодал
      if (!onPrem) {
        alternatives.push('S-Embed-Gemini');
        rationaleParts.push('Изображения в KB — Gemini Embedding 2 умеет text + image + video.');
      }
    }
    if (a.includes('D')) {
      // domain-specific
      if (brief.lang === 'A') {
        // только английский
        alternatives.push('S-Embed-Voyage-Domain');
        rationaleParts.push('Domain-specific тексты EN — Voyage law/finance модели.');
      } else if (isRu) {
        // RU/multilang — НЕ Voyage. Лидер GigaChat + warning отдельный
        if (!leader.includes('S-Embed-GigaChat')) {
          alternatives.push('S-Embed-GigaChat');
        }
        rationaleParts.push('Domain-specific RU — Voyage обучена на западных юрисдикциях, бесполезна для РФ-права. Лидер GigaChat + Hybrid Search для точного поиска по статьям/кодам.');
      }
    }

    return {
      category: 'embedding',
      leader: dedupe(leader),
      alternatives: dedupe(alternatives.filter(a => !leader.includes(a))),
      rationale: rationaleParts.join(' ')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Retrieval scoring
  // ─────────────────────────────────────────────────────────
  function computeRetrievalStretches(brief, answers) {
    const r = answers.retrieval || {};
    const leader = [];
    const alternatives = [];
    const rationaleParts = [];

    if (r.q1 === 'A') {
      leader.push('S-Retrieval-Hybrid');
      rationaleParts.push('Точные термины/коды — Hybrid (vector + BM25) ловит их 1-в-1.');
    }
    if (r.q2 === 'A') {
      const isRfPdn = brief.data_residency === 'B' || brief.data_residency === 'C';
      if (isRfPdn) {
        leader.push('S-Retrieval-Rerank-BGE');
        alternatives.push('S-Retrieval-Rerank');
        rationaleParts.push('Rerank — bge-reranker self-host (KB с ПДн).');
      } else {
        leader.push('S-Retrieval-Rerank');
        alternatives.push('S-Retrieval-Rerank-BGE');
        rationaleParts.push('Rerank — Cohere managed (готовый API, лучший для типового случая).');
      }
    }
    if (r.q3 === 'A') {
      leader.push('S-Retrieval-MultiQuery');
      rationaleParts.push('Многоязычные / разнообразные формулировки — MultiQuery сгенерирует 3–5 вариантов одного запроса.');
    }
    if (r.q4 === 'A') {
      leader.push('S-Retrieval-MetaFilter');
      rationaleParts.push('Нужны фильтры по типу/дате — MetaFilter добавляет meta-фильтры в поиск.');
    }
    // Auto eval на production
    if (brief.stage === 'B') {
      leader.push('S-Retrieval-Eval');
      rationaleParts.push('Production — Eval включён автоматически, замеряем recall/precision/faithfulness.');
    }

    return {
      category: 'retrieval',
      leader: dedupe(leader),
      alternatives: dedupe(alternatives.filter(a => !leader.includes(a))),
      rationale: rationaleParts.join(' ')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Memory scoring (с матрицей Q1.1 × Q3)
  // ─────────────────────────────────────────────────────────
  function computeMemoryStretches(brief, answers) {
    const m = answers.memory || {};
    const leader = [];
    const alternatives = [];
    const rationaleParts = [];

    const isRf = brief.data_residency === 'B' || brief.data_residency === 'C';
    const lowBudget = brief.budget_tier === 'A';

    if (m.q1 === 'B') {
      leader.push('S-Mem-Letta');
      rationaleParts.push('Q1=B — автономный агент управляет памятью сам, лидер S-Mem-Letta.');
    } else if (m.q1 === 'C') {
      // Встроенная — выбираем по data_residency / budget
      if (isRf) {
        // встроенные = OpenAI/Anthropic — оба не РФ. Предупреждаем
        leader.push('S-Mem-Responses');
        alternatives.push('S-Mem-Anthropic-Tool');
        rationaleParts.push('Q1=C — встроенная память AI-платформы (OpenAI Responses / Anthropic). При ФЗ-152 — внимательно к ПД.');
      } else {
        leader.push('S-Mem-Responses');
        alternatives.push('S-Mem-Anthropic-Tool');
        rationaleParts.push('Q1=C — встроенная память AI-платформы. Самый простой вариант, но привязка к вендору.');
      }
    } else if (m.q1 === 'A') {
      // Матрица Q1.1 × Q3
      const types = m.q1_1 || [];
      const scale = m.q3 || 'A';

      types.forEach(t => {
        if (t === 'profile' || t === 'long_facts') {
          if (scale === 'A') {
            leader.push('S-Mem-Profile');
          } else if (scale === 'B') {
            if (isRf) {
              leader.push('S-Mem-Profile');
              alternatives.push('S-Mem-pgvector');
              rationaleParts.push('Q1.1×Q3 — managed Mem0/Supermemory зарубежные, под ФЗ-152 идём на Profile + pgvector self-host.');
            } else if (lowBudget) {
              leader.push('S-Mem-Profile');
              alternatives.push('S-Mem-Mem0');
            } else {
              leader.push('S-Mem-Mem0');
              alternatives.push('S-Mem-Supermemory', 'S-Mem-Profile');
            }
          } else if (scale === 'C') {
            if (t === 'long_facts') {
              if (isRf) {
                leader.push('S-Mem-pgvector');
                alternatives.push('S-Mem-Graphiti');
              } else {
                leader.push('S-Mem-pgvector');
                alternatives.push('S-Mem-Graphiti');
              }
            } else {
              leader.push('S-Mem-pgvector');
            }
          }
        } else if (t === 'history') {
          if (isRf) {
            leader.push('S-Mem-Graphiti');
            rationaleParts.push('История изменений + ФЗ-152 — Graphiti self-host (Zep-Cloud зарубежный).');
          } else if (scale === 'A') {
            leader.push('S-Mem-Zep-Cloud');
          } else {
            leader.push('S-Mem-Graphiti');
            alternatives.push('S-Mem-Zep-Cloud');
          }
        }
      });

      if (types.length === 0) {
        // Только история сообщений — базовая Postgres Chat Memory (ноль стретчей)
        rationaleParts.push('Только история последних сообщений — базовая Postgres Chat Memory без стретчей.');
      } else {
        rationaleParts.push('Memory собрана по матрице Q1.1 (тип данных) × Q3 (масштаб).');
      }
    }

    // GDPR-стретчи (Q2)
    const gdpr = m.q2 || [];
    const gdprMap = {
      consent: 'S-Mem-Consent',
      autodelete: 'S-Mem-AutoDelete',
      forget: 'S-Mem-Forget',
      export: 'S-Mem-Export',
      admin_edit: 'S-Mem-AdminEdit',
      admin_ui: 'S-Mem-AdminUI'
    };
    gdpr.forEach(k => {
      if (gdprMap[k]) leader.push(gdprMap[k]);
    });
    if (gdpr.length) rationaleParts.push('GDPR-стретчи активированы по выбранным механизмам управления данными.');

    return {
      category: 'memory',
      leader: dedupe(leader),
      alternatives: dedupe(alternatives.filter(a => !leader.includes(a))),
      rationale: rationaleParts.join(' ')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Channels scoring
  // ─────────────────────────────────────────────────────────
  function computeChannelsStretches(brief, answers) {
    const c = answers.channels || {};
    const q1 = c.q1 || [];
    const leader = [];
    const alternatives = [];
    const rationaleParts = [];

    if (q1.includes('telegram')) {
      leader.push('S-Channels-Telegram');
      rationaleParts.push('Telegram — массовый IT-канал, ~65 млн RU/день через VPN.');
    }
    if (q1.includes('webwidget')) {
      leader.push('S-Channels-WebWidget');
      rationaleParts.push('WebWidget — встраивание чата в сайт.');
    }
    if (q1.includes('vk') && brief.geo === 'A') {
      leader.push('S-Channels-VK');
      rationaleParts.push('VK — массовый B2C канал для РФ.');
    }
    if (q1.includes('max') && brief.geo === 'A') {
      const okLegal = brief.legal_form === 'A' || brief.legal_form === 'B';
      if (okLegal) {
        leader.push('S-Channels-MAX');
        rationaleParts.push('MAX — гос/около-гос канал, ООО/ИП РФ ОК.');
      } else {
        // не активируется автоматом, но даём alternative
        alternatives.push('S-Channels-MAX');
        rationaleParts.push('MAX доступен только ООО/ИП РФ — для текущей юр.формы будет warning.');
      }
    }
    // Условный landing (Q2=B)
    if (q1.includes('webwidget') && c.q2 === 'B') {
      leader.push('S-Channels-Landing');
      rationaleParts.push('Сайта нет — добавляем S-Channels-Landing (Codex CLI + Vercel + домен).');
    }

    if (leader.length === 0 && q1.length === 0) {
      rationaleParts.push('Внимание: ни одного канала не выбрано — агент не сможет общаться с пользователями.');
    }

    return {
      category: 'channels',
      leader: dedupe(leader),
      alternatives: dedupe(alternatives.filter(a => !leader.includes(a))),
      rationale: rationaleParts.join(' ')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Data scoring
  // ─────────────────────────────────────────────────────────
  function computeDataStretches(brief, answers) {
    const d = answers.data || {};
    const q1 = d.q1 || [];
    const q2 = d.q2 || [];
    const leader = [];
    const alternatives = [];
    const rationaleParts = [];

    // Источники
    if (q1.includes('gdrive')) {
      leader.push('S-Data-Source-GoogleDrive');
      rationaleParts.push('Google Drive Trigger авто-pull-ит файлы из папки клиента.');
    }
    if (q1.includes('s3')) {
      leader.push('S-Data-Source-S3');
      rationaleParts.push('S3/MinIO Trigger — для клиентов с собственной инфрой.');
    }
    if (q1.includes('web')) {
      leader.push('S-Data-Source-WebScraping');
      rationaleParts.push('WebScraping — Schedule + HTTP Request + HTML Extract.');
    }

    const needOcr = q2.includes('scan') || q2.includes('handwriting') || q2.includes('tables');
    const needVision = q2.includes('vision');
    const isRf = brief.data_residency === 'B' || brief.data_residency === 'C';
    const onPrem = brief.data_residency === 'C';

    if (needOcr) {
      if (onPrem) {
        leader.push('S-Data-OCR-Docling');
        rationaleParts.push('On-premise OCR — Docling self-host.');
      } else if (isRf) {
        leader.push('S-Data-OCR-Yandex');
        alternatives.push('S-Data-OCR-Docling');
        rationaleParts.push('OCR под ФЗ-152 — Yandex Vision OCR (managed). Альтернатива — Docling self-host для экономии при больших объёмах.');
      } else {
        leader.push('S-Data-OCR-Mistral');
        alternatives.push('S-Data-OCR-Yandex', 'S-Data-OCR-Docling');
        rationaleParts.push('OCR — Mistral (нативная нода n8n, простой managed). Альтернативы: Yandex / Docling.');
      }
    }

    if (needVision) {
      if (isRf) {
        leader.push('S-Data-Vision-YandexGPT');
        alternatives.push('S-Data-Vision-GigaChat');
        rationaleParts.push('Vision LLM под ФЗ-152 — YandexGPT Vision / GigaChat Vision.');
      } else {
        // Парный к Mistral OCR если выбран
        if (leader.includes('S-Data-OCR-Mistral')) {
          leader.push('S-Data-Vision-Mistral');
          alternatives.push('S-Data-Vision-Gemini');
          rationaleParts.push('Vision LLM — Mistral Pixtral (парный с OCR Mistral).');
        } else {
          leader.push('S-Data-Vision-Gemini');
          alternatives.push('S-Data-Vision-Mistral');
          rationaleParts.push('Vision LLM — Gemini Flash (самый дешёвый managed).');
        }
      }
    }

    if (brief.stage === 'B') {
      leader.push('S-Data-Parse-Eval');
      rationaleParts.push('Production — Parse-Eval включён автоматически.');
    }

    return {
      category: 'data',
      leader: dedupe(leader),
      alternatives: dedupe(alternatives.filter(a => !leader.includes(a))),
      rationale: rationaleParts.join(' ')
    };
  }

  // ─────────────────────────────────────────────────────────
  // Главный entry: computeStretches
  // ─────────────────────────────────────────────────────────
  function computeStretches(brief, answers) {
    brief = brief || {};
    answers = answers || {};
    return {
      embedding:  computeEmbeddingStretches(brief, answers),
      retrieval:  computeRetrievalStretches(brief, answers),
      memory:     computeMemoryStretches(brief, answers),
      channels:   computeChannelsStretches(brief, answers),
      data:       computeDataStretches(brief, answers),
      storage:    computeStorage(brief),
      sec:        computeSec(brief),
      chat:       computeChatModel(brief),
      ops:        computeOps(brief, answers)
    };
  }

  // ─────────────────────────────────────────────────────────
  // Утилиты
  // ─────────────────────────────────────────────────────────
  function dedupe(arr) {
    return Array.from(new Set(arr || []));
  }

  function getStretch(id) {
    return STRETCHES[id] || null;
  }

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────
  window.RagCatalog = {
    STRETCHES, CATEGORY_META,
    computeStretches,
    computeStorage, computeSec, computeOps, computeChatModel,
    computeEmbeddingStretches, computeRetrievalStretches,
    computeMemoryStretches, computeChannelsStretches, computeDataStretches,
    getStretch
  };
})();
