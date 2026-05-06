/* RAG-Agent — рендер финала: получившийся стек, warnings, Markdown / Техзадание.
   Зависит от: shared / brief / quizzes / catalog / cases / preview / warnings / wizard-ui */

(function () {
  'use strict';

  const STACK_ORDER = ['chat', 'embedding', 'retrieval', 'memory', 'channels', 'data', 'storage', 'sec', 'ops'];

  function start() {
    const proj = window.RagShared.getActiveProject();
    if (!proj) {
      document.getElementById('result-app').innerHTML = `
        <div class="placeholder-page">
          <h1>Нет активного проекта</h1>
          <p>Создай проект и пройди бриф, чтобы увидеть финальную сборку.</p>
          <a class="btn btn-primary" href="/rag-agent/wizard/">Начать сборку</a>
        </div>`;
      return;
    }
    if (!window.RagShared.isBriefDone(proj.brief)) {
      window.location.href = '/rag-agent/wizard/';
      return;
    }
    window.RagShared.setCurrentStep(proj.id, 'completed');
    render();
  }

  function render() {
    const proj = window.RagShared.getActiveProject();
    const brief = proj.brief || {};
    const answers = proj.answers || {};
    const stack = window.RagCatalog.computeStretches(brief, answers);
    const warnings = window.RagWarnings.computeWarnings(brief, answers, stack);

    const $sel = document.getElementById('project-selector-slot');
    window.RagWizardUI.renderProjectSelector($sel);
    window.RagWizardUI.bindProjectSelector($sel, () => start());

    const isFromCase = (proj.source || '').startsWith('case:');
    const caseSlug = isFromCase ? proj.source.split(':')[1] : null;
    const caseInfo = caseSlug ? window.RagCases.getCase(caseSlug) : null;

    document.getElementById('result-app').innerHTML = `
      ${isFromCase && caseInfo ? `
        <div class="continue-banner" style="margin-bottom:24px;">
          <div class="continue-banner-text">
            Это шаблон кейса <strong>«${esc(caseInfo.title)}»</strong>. Можешь поменять любой ответ — wizard пересчитает стек.
          </div>
          <div class="continue-banner-actions">
            <a class="btn btn-ghost btn-sm" href="/rag-agent/cases/${esc(caseSlug)}/">К описанию кейса</a>
          </div>
        </div>` : ''}

      <div class="result-head screen">
        <span class="label">Финал</span>
        <h1>Готово! Вот рекомендация для <em>${esc(proj.name)}</em></h1>
        <p>Накопленный стек собран по брифу и ответам. Что-то можно поменять — вернись к нужному квизу или брифу.</p>
      </div>

      <div class="result-cta-row">
        <a class="btn btn-ghost" href="/rag-agent/wizard/data.html">← Изменить ответы</a>
        <button class="btn btn-ghost" data-action="copy-brief" type="button">Скопировать опросник</button>
        <button class="btn btn-teal" data-action="new-project" type="button">Создать ещё одного клиента</button>
      </div>

      ${renderWarnings(warnings)}

      <div class="result-block">
        <div class="result-block-title">Получившийся стек</div>
        <div class="stack-grid">
          ${STACK_ORDER.map(cat => renderStackCategory(stack[cat])).join('')}
        </div>
      </div>

      <div class="result-block">
        <div class="result-block-title">Действия</div>
        <div class="tabs">
          <button class="tab active" data-tab="md" type="button">📋 Markdown</button>
          <button class="tab" data-tab="tz" type="button">📝 Техзадание</button>
        </div>
        <div class="tab-content active" data-tab-content="md">
          <div class="action-row" style="margin-bottom:12px;">
            <button class="btn btn-primary" data-copy="md" type="button">Скопировать Markdown</button>
            <span class="muted" style="font-size:12.5px;align-self:center;">— подходит для отправки клиенту / партнёру</span>
          </div>
          <textarea class="output-textarea" id="md-output" readonly>${esc(generateMarkdown(proj, stack, warnings))}</textarea>
        </div>
        <div class="tab-content" data-tab-content="tz">
          <div class="action-row" style="margin-bottom:12px;">
            <button class="btn btn-primary" data-copy="tz" type="button">Скопировать ТЗ</button>
            <span class="muted" style="font-size:12.5px;align-self:center;">— по M-модулям и задачам школы</span>
          </div>
          <textarea class="output-textarea" id="tz-output" readonly>${esc(generateTz(proj, stack, warnings))}</textarea>
        </div>
      </div>
    `;

    bindActions();
  }

  // ─── Stack rendering ─────────────────────────────────────
  function renderStackCategory(catResult) {
    if (!catResult) return '';
    if (catResult.category === 'ops') return renderOpsCategory(catResult);
    const meta = window.RagCatalog.CATEGORY_META[catResult.category] || {};
    const leaders = catResult.leader || [];
    const alts = catResult.alternatives || [];

    if (leaders.length === 0 && alts.length === 0) {
      return `
        <div class="stack-category">
          <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon || '·')}</span> ${esc(meta.title || catResult.category)}</div>
          <div class="stack-empty">Стретчей не активировано — базовая инфраструктура справится.</div>
        </div>`;
    }

    const leaderHtml = leaders.map(id => stackLeaderCard(id)).join('');
    const altHtml = alts.length ? `
      <div class="stack-alternatives">
        <div style="font-family:var(--fm);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:6px 0 4px;">Альтернативы</div>
        ${alts.map(id => stackAltCard(id)).join('')}
      </div>` : '';

    return `
      <div class="stack-category">
        <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon || '·')}</span> ${esc(meta.title || catResult.category)}</div>
        ${leaderHtml}${altHtml}
        ${catResult.rationale ? `<div class="stack-leader-rationale">${esc(catResult.rationale)}</div>` : ''}
      </div>`;
  }

  function renderOpsCategory(ops) {
    const meta = window.RagCatalog.CATEGORY_META.ops;
    if (!ops.items || !ops.items.length) {
      return `
        <div class="stack-category">
          <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon)}</span> ${esc(meta.title)}</div>
          <div class="stack-empty">Дополнительных Ops-задач не требуется. Базового запуска достаточно.</div>
        </div>`;
    }
    const itemsHtml = ops.items.map(it => `
      <div class="${it.required ? 'stack-leader' : 'stack-alternatives'}">
        <div class="${it.required ? 'stack-leader-name' : 'stack-alt-name'}">
          ${esc(it.title)}
          <span class="${it.required ? 'stack-leader-tag' : 'stack-alt-tag'}">${it.required ? 'Обязательно' : 'Рекоменд.'}</span>
        </div>
        <div class="${it.required ? 'stack-leader-desc' : 'stack-alt-desc'}">${esc(it.why)}</div>
      </div>`).join('');
    return `
      <div class="stack-category">
        <div class="stack-category-title"><span class="stack-category-icon">${esc(meta.icon)}</span> ${esc(meta.title)}</div>
        ${itemsHtml}
      </div>`;
  }

  function stackLeaderCard(id) {
    const s = window.RagCatalog.getStretch(id);
    if (!s) return '';
    return `
      <div class="stack-leader">
        <div class="stack-leader-name">${esc(s.name)} <span class="stack-leader-tag">🏆 Лидер</span></div>
        <div class="stack-leader-desc">${esc(s.short)}</div>
      </div>`;
  }

  function stackAltCard(id) {
    const s = window.RagCatalog.getStretch(id);
    if (!s) return '';
    return `
      <div>
        <div class="stack-alt-name">${esc(s.name)} <span class="stack-alt-tag">Альт.</span></div>
        <div class="stack-alt-desc">${esc(s.short)}</div>
      </div>`;
  }

  // ─── Warnings ──────────────────────────────────────────────
  function renderWarnings(warnings) {
    if (!warnings || !warnings.length) return '';
    const items = warnings.map(w => `
      <li class="warning-banner-item">
        <strong>${esc(w.title)}.</strong> ${w.body}
        ${w.action ? `<div class="warn-action">${esc(w.action)}</div>` : ''}
        ${w.focusField ? `<div style="margin-top:4px;"><a class="btn btn-ghost btn-sm" href="/rag-agent/wizard/?focus=${esc(w.focusField)}">Изменить бриф</a></div>` : ''}
      </li>`).join('');
    return `
      <div class="result-block warning-banner">
        <div class="warning-banner-title">⚠️ Имей в виду</div>
        <ul class="warning-banner-list">${items}</ul>
      </div>`;
  }

  // ─── Markdown / TZ generation ──────────────────────────────
  function generateMarkdown(proj, stack, warnings) {
    const brief = proj.brief || {};
    const lines = [];
    lines.push(`# RAG-агент для «${proj.name}»`);
    lines.push('');
    lines.push('## Бриф клиента');
    lines.push('');
    Object.values(window.RagBrief.BRIEF_FIELDS).forEach(f => {
      const v = brief[f.id];
      lines.push(`- **${shortLabel(f)}:** ${window.RagBrief.getBriefValueLabel(f.id, v)}`);
    });
    lines.push('');
    lines.push('## Получившийся стек');
    lines.push('');
    STACK_ORDER.forEach(cat => {
      lines.push(...stackCategoryToMd(stack[cat]));
    });
    if (warnings && warnings.length) {
      lines.push('');
      lines.push('## ⚠️ Имей в виду');
      lines.push('');
      warnings.forEach(w => {
        lines.push(`- **${w.title}.** ${stripHtml(w.body)}`);
        if (w.action) lines.push(`  - ${stripHtml(w.action)}`);
      });
    }
    lines.push('');
    lines.push('## Следующие шаги');
    lines.push('');
    lines.push('1. Согласуй с клиентом бриф и список технологий.');
    lines.push('2. Подключи учётные записи к выбранным managed-сервисам (API ключи).');
    lines.push('3. Разверни базовый стек: n8n + Postgres + Telegram.');
    lines.push('4. Поэтапно подключай стретчи, начиная с категории с наибольшим количеством активаций.');
    lines.push('5. После production-готовности подключи Eval-стретчи и проверь регресс.');
    return lines.join('\n');
  }

  function stackCategoryToMd(catResult) {
    if (!catResult) return [];
    const meta = window.RagCatalog.CATEGORY_META[catResult.category] || {};
    const out = [`### ${meta.icon || ''} ${meta.title || catResult.category}`, ''];
    if (catResult.category === 'ops') {
      if (!catResult.items || !catResult.items.length) {
        out.push('- Дополнительных Ops-задач не требуется.');
        out.push('');
        return out;
      }
      catResult.items.forEach(it => {
        out.push(`- **${it.required ? 'Обязательно' : 'Рекоменд.'}:** ${it.title} — ${it.why}`);
      });
      out.push('');
      return out;
    }
    const leaders = catResult.leader || [];
    const alts = catResult.alternatives || [];
    if (leaders.length === 0 && alts.length === 0) {
      out.push('- Стретчей не активировано — базовая инфраструктура справится.');
      out.push('');
      return out;
    }
    leaders.forEach(id => {
      const s = window.RagCatalog.getStretch(id);
      if (s) out.push(`- 🏆 **Лидер:** ${s.name} — ${s.short}`);
    });
    alts.forEach(id => {
      const s = window.RagCatalog.getStretch(id);
      if (s) out.push(`- ⚙️ Альт.: ${s.name} — ${s.short}`);
    });
    if (catResult.rationale) {
      out.push('');
      out.push('  _' + catResult.rationale + '_');
    }
    out.push('');
    return out;
  }

  function generateTz(proj, stack, warnings) {
    const lines = [];
    lines.push(`# Техническое задание — RAG-агент «${proj.name}»`);
    lines.push('');
    lines.push('## Этапы по M-модулям курса');
    lines.push('');
    lines.push('### 1. M0 — Основы n8n');
    lines.push('- Поднять школьный n8n / VPS с n8n.');
    lines.push('- Настроить Telegram-бот, Chat Trigger, базовый AI Agent.');
    lines.push('');
    lines.push('### 2. M4 — Базы данных');
    lines.push('- Настроить Postgres + Postgres Chat Memory subnode.');
    lines.push('- Создать Data Tables под whitelist (Sec) и логи sec_log.');
    lines.push('');
    lines.push('### 3. M6 — AI Agent + Memory');
    lines.push('- Подключить Memory subnode согласно лидеру категории Memory.');
    lines.push('- При выборе backend — следовать матрице Q1.1 × Q3.');
    lines.push('');
    lines.push('### 4. M8 — RAG');
    lines.push('- Vector Storage = ' + stretchName(stack.storage.leader[0]) + ' (автоблок).');
    lines.push('- Embedding = ' + stretchName(stack.embedding.leader[0]) + '.');
    Object.values(stack.retrieval.leader).forEach(id => {
      const s = window.RagCatalog.getStretch(id);
      if (s) lines.push('- Retrieval-стретч: ' + s.name + ' — ' + s.short);
    });
    lines.push('');
    lines.push('### 5. M-Guardrails');
    lines.push('- База Sec — 8 слоёв из M-Guard-09 (всегда).');
    stack.sec.leader.filter(id => id !== 'S-Sec-Base').forEach(id => {
      const s = window.RagCatalog.getStretch(id);
      if (s) lines.push('- Sec-стретч: ' + s.name);
    });
    lines.push('');
    lines.push('### 6. M-Eval (если production)');
    if (proj.brief.stage === 'B') {
      lines.push('- Включены Eval-стретчи: golden questions, regression-проверки.');
    } else {
      lines.push('- На MVP можно пропустить, но рекомендуется собрать golden set заранее.');
    }
    lines.push('');
    lines.push('### 7. AI-01 (финальная сборка)');
    lines.push('- Channels: Telegram (база) + ' + (stack.channels.leader.map(id => stretchName(id)).join(', ') || 'нет дополнительных стретчей'));
    lines.push('- Data sources: ' + (stack.data.leader.map(id => stretchName(id)).join(', ') || 'ручная загрузка через чат'));
    lines.push('');
    if (warnings && warnings.length) {
      lines.push('### ⚠️ Внимание перед запуском');
      warnings.forEach(w => {
        lines.push(`- **${w.title}** — ${stripHtml(w.body)}`);
      });
      lines.push('');
    }
    lines.push('### Ссылки на задачи школы');
    lines.push('_(будут добавлены, когда задачи будут опубликованы в Plane)_');
    return lines.join('\n');
  }

  function stretchName(id) {
    const s = window.RagCatalog.getStretch(id);
    return s ? s.name : id || '—';
  }

  function shortLabel(f) {
    const m = (f.label || '').match(/^\d+\.\s*([^—\.\?]+)/);
    return m ? m[1].trim() : f.id;
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  // ─── Actions ───────────────────────────────────────────────
  function bindActions() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.dataset.tab;
        const content = document.querySelector('[data-tab-content="' + id + '"]');
        if (content) content.classList.add('active');
      });
    });
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.copy;
        const ta = document.getElementById(id + '-output');
        if (!ta) return;
        const ok = await window.RagShared.copyToClipboard(ta.value);
        window.RagShared.showToast(ok ? 'Скопировано в буфер ✓' : 'Не удалось скопировать');
      });
    });
    document.addEventListener('click', e => {
      if (e.target.matches('[data-action="copy-brief"]')) {
        window.RagWizardUI.openCopyBriefModal();
      } else if (e.target.matches('[data-action="new-project"]')) {
        const name = prompt('Имя нового клиента?', 'Клиент ' + (window.RagShared.getProjects().length + 1));
        if (name) {
          window.RagShared.createProject(name);
          window.location.href = '/rag-agent/wizard/';
        }
      }
    });
  }

  function esc(t) { return window.RagShared.escapeHtml(t); }

  window.RagResult = { start };
})();
