/* RAG-Agent — триггеры warnings для финала.
   Source of truth: memory/feedback_warnings_in_wizard_finale.md */

(function () {
  'use strict';

  function computeWarnings(brief, answers, stack) {
    const warnings = [];
    brief = brief || {};
    stack = stack || {};

    const isRfBusiness = brief.geo === 'A' &&
      (brief.legal_form === 'A' || brief.legal_form === 'B' || brief.legal_form === 'C');
    const isCloudData = brief.data_residency === 'A';
    const isFz152 = brief.data_residency === 'B';
    const lowBudget = brief.budget_tier === 'A';

    // 1. ФЗ-152 risk: бизнес РФ + любое облако
    if (isRfBusiness && isCloudData) {
      warnings.push({
        title: 'Возможный риск ФЗ-152',
        body: 'Бизнес в РФ + «любое облако». Если бот будет обрабатывать персональные данные клиентов (имена, телефоны, документы) — есть юридический риск.',
        action: 'Рекомендуем поменять «куда могут уходить документы» на B (РФ-облако / ФЗ-152) в брифе.',
        focusField: 'data_residency'
      });
    }

    // 2. Embedding managed зарубежный + ФЗ-152 + KB с ПДн (тонкое правило)
    const embedLeaders = (stack.embedding && stack.embedding.leader) || [];
    const embedAlts = (stack.embedding && stack.embedding.alternatives) || [];
    const hasForeignEmbed =
      embedLeaders.some(id => ['S-Embed-Cohere', 'S-Embed-Voyage', 'S-Embed-Voyage-Domain', 'S-Embed-Gemini', 'S-Embed-OpenAI-Small'].includes(id)) ||
      embedAlts.some(id => ['S-Embed-Cohere', 'S-Embed-Voyage', 'S-Embed-Voyage-Domain', 'S-Embed-Gemini'].includes(id));
    if (isFz152 && hasForeignEmbed) {
      warnings.push({
        title: 'Зарубежный Embedding под ФЗ-152',
        body: 'Embedding-модели работают только с базой знаний (KB). Если в KB нет персональных данных клиентов — допустимо. Если в KB могут попасть истории клиентов / медкарты / личные дела — переключись на GigaChat embeddings.',
        action: null,
        focusField: 'data_residency'
      });
    }

    // 3. Reranker Cohere managed под ФЗ-152
    const retrievalLeaders = (stack.retrieval && stack.retrieval.leader) || [];
    if (isFz152 && retrievalLeaders.includes('S-Retrieval-Rerank')) {
      warnings.push({
        title: 'Cohere Rerank под ФЗ-152',
        body: 'Cohere managed обрабатывает тот же контент что embedding (KB). Допустимо если KB без ПДн. Если ПДн попадут в KB — выбери self-host bge-reranker (доступен на обычном VPS).',
        action: null
      });
    }

    // 4. Бюджет vs Memory backend
    const memoryLeaders = (stack.memory && stack.memory.leader) || [];
    const cloudMemory = ['S-Mem-Mem0', 'S-Mem-Supermemory', 'S-Mem-Zep-Cloud'];
    const usesCloudMemory = memoryLeaders.some(id => cloudMemory.includes(id));
    if (lowBudget && usesCloudMemory) {
      warnings.push({
        title: 'Memory cloud backend + малый бюджет',
        body: 'Выбран managed memory backend (Mem0 / Supermemory / Zep Cloud). При росте использования может выйти за $10/мес. Альтернатива — S-Mem-Profile / S-Mem-pgvector self-host (бесплатно).',
        action: 'Можно сменить лидера на self-host вручную в финале.'
      });
    }

    // 5. MAX выбран при неподходящей юр.форме
    const channelsLeaders = (stack.channels && stack.channels.leader) || [];
    const channelsAlts = (stack.channels && stack.channels.alternatives) || [];
    if ((channelsLeaders.includes('S-Channels-MAX') || channelsAlts.includes('S-Channels-MAX')) &&
      !['A', 'B'].includes(brief.legal_form)) {
      warnings.push({
        title: 'MAX недоступен для текущей юр.формы',
        body: 'Канал MAX доступен только ООО или ИП РФ. Самозанятые / физлица / нерезиденты не проходят верификацию. Перейди на ИП для подключения MAX или пропусти этот канал.',
        action: 'Сменить юр.форму в брифе или убрать MAX из квиза каналов.',
        focusField: 'legal_form'
      });
    }

    // 6. Чёрный домен domain-specific RU без specialized модели
    const eAns = (answers.embedding && answers.embedding.q1) || [];
    if (eAns.includes('D') && (brief.lang === 'B' || brief.lang === 'C' || brief.lang === 'D')) {
      warnings.push({
        title: 'Domain-specific тексты на русском',
        body: 'Voyage law/finance модели обучены на западных юрисдикциях — для РФ-права бесполезны. Лидер — GigaChat embeddings + рекомендуем подключить S-Retrieval-Hybrid (BM25 поверх vector search) для точного поиска по статьям и кодам РФ-законодательства.',
        action: null
      });
    }

    // 7. Стретч self-host + infra_level=A — ресурсы
    const ramHeavyStretches = ['S-Embed-BGE-Selfhost', 'S-Data-OCR-Docling', 'Chat-OSS', 'S-Mem-Graphiti'];
    const allLeaderIds = collectAll(stack);
    const heavyUsed = allLeaderIds.filter(id => ramHeavyStretches.includes(id));
    if (heavyUsed.length && brief.infra_level === 'A') {
      const names = heavyUsed.map(id => {
        const s = window.RagCatalog && window.RagCatalog.STRETCHES[id];
        return s ? s.name : id;
      }).join(', ');
      warnings.push({
        title: 'Self-host компоненты на обычном сервере',
        body: 'Выбраны self-host компоненты (' + names + '). Они помещаются на обычном VPS (CPU-only), но потребуют +2–4 GB RAM. Если у клиента дешёвый VPS (1 CPU / 1 GB) — может потребоваться апгрейд.',
        action: null
      });
    }

    return warnings;
  }

  function collectAll(stack) {
    const ids = [];
    Object.values(stack || {}).forEach(cat => {
      if (cat && Array.isArray(cat.leader)) ids.push(...cat.leader);
      if (cat && Array.isArray(cat.alternatives)) ids.push(...cat.alternatives);
    });
    return ids;
  }

  window.RagWarnings = { computeWarnings };
})();
