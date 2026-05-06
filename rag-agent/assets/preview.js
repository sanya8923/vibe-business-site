/* RAG-Agent — рендер sticky preview sidebar.
   Зависит от: shared.js, brief.js, quizzes.js, catalog.js */

(function () {
  'use strict';

  function renderPreview(project) {
    if (!project) {
      return renderEmptyPreview();
    }
    const brief = project.brief || {};
    const answers = project.answers || {};
    const stack = window.RagCatalog.computeStretches(brief, answers);
    const progress = window.RagShared.getProjectProgress(project);

    const html = [];
    html.push(renderSummary(project, progress));
    html.push(renderBriefAccordion(brief));
    html.push(renderInfraSection());
    html.push(renderAutoblocks(stack));
    html.push(renderCategorySection(stack.embedding));
    html.push(renderCategorySection(stack.retrieval));
    html.push(renderCategorySection(stack.memory));
    html.push(renderCategorySection(stack.channels));
    html.push(renderCategorySection(stack.data));
    return html.join('\n');
  }

  function renderEmptyPreview() {
    return `
      <div class="preview-section">
        <div class="preview-section-title">План пуст</div>
        <div class="stretch-empty">Создай проект и пройди бриф — здесь появится живая сборка.</div>
      </div>`;
  }

  function renderSummary(project, progress) {
    const totalQuizzes = 5;
    return `
      <div class="preview-section">
        <div class="preview-section-title">Проект</div>
        <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:4px;">${esc(project.name)}</div>
        <div style="font-size:11.5px;color:var(--muted);">
          ${progress.briefDone ? '✓ Бриф ' : '◯ Бриф '}
          · ${progress.quizzesDone}/${totalQuizzes} квизов
        </div>
      </div>`;
  }

  function renderBriefAccordion(brief) {
    const filled = Object.keys(brief).length;
    const fields = window.RagBrief.BRIEF_FIELDS;
    const items = Object.values(fields).map(f => {
      const v = brief[f.id];
      const label = v ? window.RagBrief.getBriefValueLabel(f.id, v) : '—';
      return `<li><strong>${esc(shortBriefLabel(f))}:</strong> ${esc(label)}</li>`;
    }).join('');

    return `
      <div class="preview-section">
        <div class="accordion" data-accordion>
          <button class="accordion-head" type="button" data-accordion-toggle>
            <span>Бриф · ${filled}/11</span>
            <span class="accordion-arrow">▾</span>
          </button>
          <div class="accordion-body">
            <ul class="brief-list">${items}</ul>
          </div>
        </div>
      </div>`;
  }

  function renderInfraSection() {
    return `
      <div class="preview-section">
        <div class="preview-section-title">Базовая инфра</div>
        <div class="stretch-card">
          <div class="stretch-card-name">n8n + Postgres + Telegram</div>
          <div class="stretch-card-desc">Self-hosted n8n, Postgres под Memory/State, Telegram-канал по умолчанию.</div>
        </div>
      </div>`;
  }

  function renderAutoblocks(stack) {
    return [
      renderCategorySection(stack.chat,    'Chat Model'),
      renderCategorySection(stack.storage, 'Vector Storage'),
      renderCategorySection(stack.sec,     'Безопасность'),
      renderOpsSection(stack.ops)
    ].join('\n');
  }

  function renderCategorySection(catResult, overrideTitle) {
    if (!catResult) return '';
    const meta = window.RagCatalog.CATEGORY_META[catResult.category] || {};
    const leaders = catResult.leader || [];
    const alts = catResult.alternatives || [];

    const total = leaders.length + alts.length;
    if (total === 0) {
      return `
        <div class="preview-section">
          <div class="preview-section-title">${esc(overrideTitle || meta.title || catResult.category)}</div>
          <div class="stretch-empty">Пройди соответствующий квиз — стретчи появятся.</div>
        </div>`;
    }

    const leaderHtml = leaders.map(id => stretchCard(id, 'leader')).join('');
    const altHtml = alts.map(id => stretchCard(id, 'alternative')).join('');

    return `
      <div class="preview-section">
        <div class="preview-section-title">${esc(overrideTitle || meta.title || catResult.category)} <span class="count">${total}</span></div>
        ${leaderHtml}${altHtml}
      </div>`;
  }

  function renderOpsSection(ops) {
    if (!ops || !ops.items || !ops.items.length) {
      return `
        <div class="preview-section">
          <div class="preview-section-title">Эксплуатация (Ops)</div>
          <div class="stretch-empty">Дополнительных Ops-задач не требуется.</div>
        </div>`;
    }
    const items = ops.items.map(it => `
      <div class="stretch-card ${it.required ? 'leader' : ''}">
        <div class="stretch-card-name">
          ${esc(it.title)}
          <span class="stretch-card-tag ${it.required ? '' : 'alt'}">${it.required ? 'Обяз.' : 'Реком.'}</span>
        </div>
        <div class="stretch-card-desc">${esc(it.why)}</div>
      </div>`).join('');
    return `
      <div class="preview-section">
        <div class="preview-section-title">Эксплуатация (Ops) <span class="count">${ops.items.length}</span></div>
        ${items}
      </div>`;
  }

  function stretchCard(id, kind) {
    const s = window.RagCatalog.getStretch(id);
    if (!s) return '';
    const tagText = kind === 'leader' ? '🏆 Лидер' : 'Альт.';
    const tagClass = kind === 'leader' ? '' : 'alt';
    return `
      <div class="stretch-card ${kind} appearing" data-stretch-id="${esc(id)}">
        <div class="stretch-card-name">
          ${esc(s.name)}
          <span class="stretch-card-tag ${tagClass}">${tagText}</span>
        </div>
        <div class="stretch-card-desc">${esc(s.short)}</div>
      </div>`;
  }

  function shortBriefLabel(f) {
    // приводим длинный label к короткому через первое слово после номера
    const m = (f.label || '').match(/^\d+\.\s*([^—\.\?]+)/);
    return m ? m[1].trim() : (f.id);
  }

  function esc(t) {
    return window.RagShared.escapeHtml(t);
  }

  // ─── Bootstrapping accordion behaviour ────────────────────
  function bindAccordions(root) {
    (root || document).querySelectorAll('[data-accordion-toggle]').forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', e => {
        e.preventDefault();
        const acc = btn.closest('[data-accordion]');
        if (acc) acc.classList.toggle('open');
      });
    });
  }

  window.RagPreview = { renderPreview, bindAccordions };
})();
