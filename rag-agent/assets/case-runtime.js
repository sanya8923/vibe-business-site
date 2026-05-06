/* RAG-Agent — runtime для страницы учебного кейса.
   Принимает slug, рендерит 9 блоков по template из use_cases_design.md */

(function () {
  'use strict';

  function start(slug) {
    const c = window.RagCases.getCase(slug);
    const $app = document.getElementById('case-app');
    if (!c) {
      $app.innerHTML = `
        <div class="placeholder-page">
          <h1>Кейс не найден</h1>
          <a class="btn btn-primary" href="/rag-agent/">← На главную</a>
        </div>`;
      return;
    }
    if (c.placeholder) {
      $app.innerHTML = `
        <div class="placeholder-page">
          <div style="font-size:64px;margin-bottom:12px;">${esc(c.emoji)}</div>
          <h1>${esc(c.title)}</h1>
          <p class="muted">Кейс готовится. ${esc(c.cardDesc || '')}</p>
          <p class="muted" style="margin-top:14px;">
            Уже готовы — Юр.агентство и Автосервис.
          </p>
          <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a class="btn btn-ghost" href="/rag-agent/">← На главную</a>
            <a class="btn btn-primary" href="/rag-agent/cases/jur-agency/">Открыть Юр.агентство</a>
          </div>
        </div>`;
      return;
    }
    renderFull(c);
  }

  function renderFull(c) {
    const stack = window.RagCatalog.computeStretches(c.brief, c.answers);
    const warnings = window.RagWarnings.computeWarnings(c.brief, c.answers, stack);

    const existing = window.RagShared.getProjects().find(p => p.source === 'case:' + c.slug);

    document.getElementById('case-app').innerHTML = `
      <div class="case-header">
        <span class="label">Учебный кейс</span>
        <h1>${esc(c.emoji)} ${esc(c.title)}</h1>
        <p class="case-tagline">${esc(c.tagline)}</p>
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">02</span> Профиль клиента</h2>
        <p>${esc(c.profile)}</p>
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">03</span> Бриф проекта</h2>
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
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">04</span> Сценарий</h2>
        <div style="font-family:var(--fm);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">Что бот должен уметь</div>
        <ul class="scenario-list">
          ${(c.scenario || []).map(s => `<li>${esc(s)}</li>`).join('')}
        </ul>
        <div style="font-family:var(--fm);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;">3 типичных диалога</div>
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
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">05</span> Корпус документов</h2>
        <div class="corpus-card">
          <p style="margin-bottom:10px;color:var(--muted);font-size:13.5px;">Всего: ${esc(c.corpus.total || '—')}</p>
          <ul class="brief-list" style="margin-bottom:14px;">
            ${(c.corpus.items || []).map(it => `<li><strong>${esc(it.name)}:</strong> ${esc(it.count)}</li>`).join('')}
          </ul>
          <a class="btn btn-ghost btn-sm" href="${esc(c.corpus.url || '#')}" target="_blank">📁 Открыть корпус в Google Drive →</a>
          <div class="muted" style="font-size:12px;margin-top:8px;">Ссылка добавится когда корпус будет загружен.</div>
        </div>
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">06</span> Получившийся стек</h2>
        <div class="stack-grid">
          ${['chat','embedding','retrieval','memory','channels','data','storage','sec','ops'].map(cat => stackCategory(stack[cat])).join('')}
        </div>
        ${warnings.length ? `
          <div class="warning-banner" style="margin-top:18px;">
            <div class="warning-banner-title">⚠️ Имей в виду</div>
            <ul class="warning-banner-list">
              ${warnings.map(w => `
                <li class="warning-banner-item">
                  <strong>${esc(w.title)}.</strong> ${w.body}
                </li>`).join('')}
            </ul>
          </div>` : ''}
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">07</span> Стоимость теста</h2>
        <div class="cost-card">
          <div class="cost-card-row"><span class="muted">💵 Стоимость прогона</span><strong>${esc(c.cost.test)}</strong></div>
          <div class="cost-card-row"><span class="muted">📊 Тестовый объём</span><strong>${esc(c.cost.testVolume)}</strong></div>
        </div>
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">08</span> Связь с курсом</h2>
        <p class="muted">Чтобы собрать production-готовый продукт под этот кейс — пройди модули в таком порядке:</p>
        <ol class="module-list">
          ${(c.modules || []).map(m => `<li><strong>${esc(m.id)}</strong> · ${esc(m.title)}${m.desc ? ' — <span class="muted">' + esc(m.desc) + '</span>' : ''}</li>`).join('')}
        </ol>
      </div>

      <div class="case-block">
        <h2><span class="case-block-num">09</span> CTA</h2>
        <div class="case-cta">
          ${existing ? `
            <h3>У тебя уже есть проект «${esc(existing.name)}»</h3>
            <p>Откроем финальный экран с готовым стеком.</p>
            <a class="btn btn-primary" href="/rag-agent/wizard/result.html" data-action="open-existing" data-id="${esc(existing.id)}">Открыть финал →</a>
            <button class="btn btn-ghost" data-action="apply-case" data-slug="${esc(c.slug)}" type="button" style="margin-left:8px;">Создать ещё один</button>
          ` : `
            <h3>📋 Применить как шаблон</h3>
            <p>Создаст проект «${esc(c.title)} (шаблон)» с предзаполненным брифом и ответами квизов. Сразу попадёшь в финал и увидишь готовый стек.</p>
            <button class="btn btn-primary" data-action="apply-case" data-slug="${esc(c.slug)}" type="button">Применить как шаблон →</button>
          `}
        </div>
      </div>

      <div style="margin-top:36px;">
        <a class="btn btn-ghost" href="/rag-agent/">← На главную</a>
      </div>
    `;

    bindActions();
    window.RagPreview.bindAccordions(document);
  }

  function stackCategory(catResult) {
    if (!catResult) return '';
    if (catResult.category === 'ops') return opsCard(catResult);
    const meta = window.RagCatalog.CATEGORY_META[catResult.category] || {};
    const leaders = catResult.leader || [];
    const alts = catResult.alternatives || [];
    if (!leaders.length && !alts.length) {
      return `
        <div class="stack-category">
          <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon || '·')}</span> ${esc(meta.title)}</div>
          <div class="stack-empty">Стретчей не активировано — базовая инфраструктура справится.</div>
        </div>`;
    }
    return `
      <div class="stack-category">
        <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon || '·')}</span> ${esc(meta.title)}</div>
        ${leaders.map(id => leaderCard(id)).join('')}
        ${alts.length ? `
          <div class="stack-alternatives">
            <div style="font-family:var(--fm);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:6px 0 4px;">Альтернативы</div>
            ${alts.map(id => altCard(id)).join('')}
          </div>` : ''}
        ${catResult.rationale ? `<div class="stack-leader-rationale">${esc(catResult.rationale)}</div>` : ''}
      </div>`;
  }

  function opsCard(ops) {
    const meta = window.RagCatalog.CATEGORY_META.ops;
    if (!ops.items || !ops.items.length) {
      return `
        <div class="stack-category">
          <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon)}</span> ${esc(meta.title)}</div>
          <div class="stack-empty">Дополнительных Ops-задач не требуется.</div>
        </div>`;
    }
    return `
      <div class="stack-category">
        <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon)}</span> ${esc(meta.title)}</div>
        ${ops.items.map(it => `
          <div class="${it.required ? 'stack-leader' : ''}" style="${it.required ? '' : 'margin-top:8px;'}">
            <div class="${it.required ? 'stack-leader-name' : 'stack-alt-name'}">${esc(it.title)} <span class="${it.required ? 'stack-leader-tag' : 'stack-alt-tag'}">${it.required ? 'Обяз.' : 'Реком.'}</span></div>
            <div class="${it.required ? 'stack-leader-desc' : 'stack-alt-desc'}">${esc(it.why)}</div>
          </div>`).join('')}
      </div>`;
  }

  function leaderCard(id) {
    const s = window.RagCatalog.getStretch(id);
    if (!s) return '';
    return `
      <div class="stack-leader">
        <div class="stack-leader-name">${esc(s.name)} <span class="stack-leader-tag">🏆 Лидер</span></div>
        <div class="stack-leader-desc">${esc(s.short)}</div>
      </div>`;
  }

  function altCard(id) {
    const s = window.RagCatalog.getStretch(id);
    if (!s) return '';
    return `
      <div>
        <div class="stack-alt-name">${esc(s.name)} <span class="stack-alt-tag">Альт.</span></div>
        <div class="stack-alt-desc">${esc(s.short)}</div>
      </div>`;
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
      }
      const openBtn = e.target.closest('[data-action="open-existing"]');
      if (openBtn) {
        const id = openBtn.dataset.id;
        if (id) window.RagShared.setActiveProjectId(id);
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
