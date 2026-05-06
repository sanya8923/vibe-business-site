/* RAG-Agent — runtime для страницы учебного кейса.
   Принимает slug, рендерит 9 блоков по template из use_cases_design.md */

(function () {
  'use strict';

  function start(slug) {
    const c = window.RagCases.getCase(slug);
    const $app = document.getElementById('case-app');
    if (!c) {
      $app.innerHTML = `
        <section class="wz-hero">
          <div class="wz-hero-eyebrow"><span class="wz-hero-dot"></span> Учебный кейс</div>
          <h1 class="wz-hero-h1">Кейс не найден</h1>
          <p class="wz-hero-lead">Проверь адрес или вернись на главную.</p>
        </section>
        <div style="margin-top:24px;"><a class="btn btn-ghost" href="/rag-agent/">← На главную</a></div>`;
      return;
    }
    if (c.placeholder) {
      $app.innerHTML = `
        <section class="wz-hero">
          <div class="wz-hero-eyebrow"><span class="wz-hero-dot"></span> Учебный кейс · в работе</div>
          <h1 class="wz-hero-h1">${esc(c.emoji)} ${esc(c.title)}</h1>
          <p class="wz-hero-lead">Кейс готовится. ${esc(c.cardDesc || '')}</p>
        </section>
        <section class="brief-section">
          <div class="brief-section-head">
            <span class="brief-section-eyebrow"><span class="brief-section-dot"></span> Что уже готово</span>
            <h2 class="brief-section-h2">Уже доступны Юр.агентство и Автосервис</h2>
          </div>
          <p class="muted" style="margin-bottom:20px;">Открой готовый кейс, чтобы посмотреть полный пример: бриф, сценарий, корпус, стек и стоимость теста.</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a class="btn btn-primary" href="/rag-agent/cases/jur-agency/">Открыть Юр.агентство →</a>
            <a class="btn btn-ghost" href="/rag-agent/cases/auto-service/">Открыть Автосервис →</a>
            <a class="btn btn-ghost" href="/rag-agent/">← На главную</a>
          </div>
        </section>`;
      return;
    }
    renderFull(c);
  }

  function renderFull(c) {
    const stack = window.RagCatalog.computeStretches(c.brief, c.answers);
    const warnings = window.RagWarnings.computeWarnings(c.brief, c.answers, stack);

    const existing = window.RagShared.getProjects().find(p => p.source === 'case:' + c.slug);

    document.getElementById('case-app').innerHTML = `
      <section class="wz-hero">
        <div class="wz-hero-eyebrow"><span class="wz-hero-dot"></span> Учебный кейс</div>
        <h1 class="wz-hero-h1">${esc(c.emoji)} ${esc(c.title)}</h1>
        <p class="wz-hero-lead">${esc(c.tagline)}</p>
      </section>

      ${section('02', 'Профиль клиента', `<p class="case-text">${esc(c.profile)}</p>`)}

      ${section('03', 'Бриф проекта', `
        <div class="brief-chips">
          ${(c.keyChips || []).map(ch => `
            <div class="brief-chip">
              <div class="brief-chip-label">${esc(ch.label)}</div>
              <div class="brief-chip-value">${esc(ch.value)}</div>
            </div>`).join('')}
        </div>
        <div class="accordion" data-accordion>
          <button class="accordion-head" type="button" data-accordion-toggle>
            <span>Показать все 11 полей брифа</span>
            <span class="accordion-arrow">▾</span>
          </button>
          <div class="accordion-body">
            <ul class="brief-list">
              ${Object.values(window.RagBrief.BRIEF_FIELDS).map(f => `
                <li><strong>${esc(shortBrief(f))}:</strong> ${esc(window.RagBrief.getBriefValueLabel(f.id, c.brief[f.id]))}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      `)}

      ${section('04', 'Сценарий', `
        <div class="case-subhead">Что агент должен уметь</div>
        <ul class="scenario-list">
          ${(c.scenario || []).map(s => `<li>${esc(s)}</li>`).join('')}
        </ul>
        <div class="case-subhead">3 типичных диалога</div>
        ${(c.dialogs || []).map(d => `
          <div class="dialog-block">
            <div class="dialog-title">${esc(d.title)}</div>
            ${d.turns.map(t => `
              <div class="dialog-line ${t.who}">
                <span class="who">${esc(t.emoji || '')}</span>
                <div class="body">${t.body}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      `)}

      ${section('05', 'Корпус документов', `
        <div class="corpus-card">
          <p style="margin-bottom:10px;color:var(--muted);font-size:13.5px;">Всего: ${esc(c.corpus.total || '—')}</p>
          <ul class="brief-list" style="margin-bottom:14px;">
            ${(c.corpus.items || []).map(it => `<li><strong>${esc(it.name)}:</strong> ${esc(it.count)}</li>`).join('')}
          </ul>
          <a class="btn btn-ghost btn-sm" href="${esc(c.corpus.url || '#')}" target="_blank">📁 Открыть корпус в Google Drive →</a>
          <div class="muted" style="font-size:12px;margin-top:8px;">Ссылка добавится когда корпус будет загружен.</div>
        </div>
      `)}

      ${section('06', 'Получившийся стек', `
        <p class="case-text muted" style="margin-bottom: 0;">
          Каждая категория — это отдельный слой агента. В каждой ниже первая карточка с лайм-подсветкой — лидер #1, остальные — альтернативы.
        </p>
      `)}

      ${window.RagResult.renderWarnings(warnings)}

      ${(window.RagResult.STACK_ORDER).map(cat => window.RagResult.renderCategorySection(stack[cat])).join('')}

      ${section('07', 'Стоимость теста', `
        <div class="cost-card">
          <div class="cost-card-row"><span class="muted">💵 Стоимость прогона</span><strong>${esc(c.cost.test)}</strong></div>
          <div class="cost-card-row"><span class="muted">📊 Тестовый объём</span><strong>${esc(c.cost.testVolume)}</strong></div>
        </div>
      `)}

      ${section('08', 'Связь с курсом', `
        <p class="case-text muted" style="margin-bottom:14px;">Чтобы собрать production-готовый продукт под этот кейс — пройди модули в таком порядке:</p>
        <ol class="module-list">
          ${(c.modules || []).map(m => `<li><strong>${esc(m.id)}</strong> · ${esc(m.title)}${m.desc ? ' — <span class="muted">' + esc(m.desc) + '</span>' : ''}</li>`).join('')}
        </ol>
      `)}

      ${section('09', 'Применить как шаблон', `
        <div class="case-cta-inner">
          ${existing ? `
            <h3>У тебя уже есть проект «${esc(existing.name)}»</h3>
            <p>Откроем финальный экран с готовым стеком.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a class="btn btn-primary" href="/rag-agent/wizard/result.html" data-action="open-existing" data-id="${esc(existing.id)}">Открыть финал →</a>
              <button class="btn btn-ghost" data-action="apply-case" data-slug="${esc(c.slug)}" type="button">Создать ещё один</button>
            </div>
          ` : `
            <h3>📋 Создать проект из шаблона</h3>
            <p>Создаст проект «${esc(c.title)} (шаблон)» с предзаполненным брифом и ответами квизов. Сразу попадёшь в финал и увидишь готовый стек.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button class="btn btn-primary" data-action="apply-case" data-slug="${esc(c.slug)}" type="button">Применить как шаблон →</button>
            </div>
          `}
        </div>
      `)}

      <div style="margin: 28px 0 40px;">
        <a class="btn btn-ghost" href="/rag-agent/">← На главную</a>
      </div>
    `;

    bindActions();
    window.RagPreview.bindAccordions(document);
  }

  function section(num, title, bodyHtml) {
    return `
      <section class="brief-section">
        <div class="brief-section-head">
          <span class="brief-section-eyebrow"><span class="brief-section-dot"></span> Блок ${esc(num)}</span>
          <h2 class="brief-section-h2">${esc(title)}</h2>
        </div>
        ${bodyHtml}
      </section>
    `;
  }

  function bindActions() {
    document.addEventListener('click', e => {
      const applyBtn = e.target.closest('[data-action="apply-case"]');
      if (applyBtn) {
        const slug = applyBtn.dataset.slug;
        const proj = window.RagCases.applyCase(slug);
        if (proj) {
          window.RagShared.showToast('Шаблон применён ✓');
          setTimeout(() => { window.location.href = '/rag-agent/wizard/result.html'; }, 350);
        }
        return;
      }
      const openBtn = e.target.closest('[data-action="open-existing"]');
      if (openBtn) {
        const id = openBtn.dataset.id;
        if (id) window.RagShared.setActiveProjectId(id);
        return;
      }
      const stretchBtn = e.target.closest('[data-stretch]');
      if (stretchBtn) {
        e.preventDefault();
        const id = stretchBtn.dataset.stretch;
        const s = window.RagCatalog.getStretch(id);
        window.RagShared.showToast(
          s ? `Инструкция «${s.name}» — в разработке` : 'Инструкция в разработке'
        );
      }
    });
  }

  function shortBrief(f) {
    const m = (f.label || '').match(/^\d+\.\s*([^—\.\?]+)/);
    return m ? m[1].trim() : f.id;
  }

  function esc(t) { return window.RagShared.escapeHtml(t); }

  window.RagCaseRuntime = { start };
})();
