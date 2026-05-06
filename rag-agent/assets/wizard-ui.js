/* RAG-Agent — общий UI слой wizard'а: project selector, progress, sidebar binding,
   sales-tool кнопка. Зависит от shared / brief / quizzes / catalog / cases / preview. */

(function () {
  'use strict';

  function ensureActiveProject() {
    let proj = window.RagShared.getActiveProject();
    if (!proj) {
      const n = window.RagShared.getNextProjectNum();
      proj = window.RagShared.createProject('Клиент ' + n);
      window.RagShared.bumpNextProjectNum();
    }
    return proj;
  }

  function renderProjectSelector(target) {
    const projects = window.RagShared.getProjects();
    const activeId = window.RagShared.getActiveProjectId();
    if (!target) return;

    target.innerHTML = `
      <div class="project-selector">
        <label for="ps-select">Клиент:</label>
        <select id="ps-select">
          ${projects.map(p => `<option value="${esc(p.id)}" ${p.id === activeId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-ghost btn-sm" data-action="rename-project" type="button">✎</button>
        <button class="btn btn-ghost btn-sm" data-action="new-project" type="button">＋ Новый клиент</button>
        ${projects.length > 1 ? `<button class="btn btn-ghost btn-sm" data-action="delete-project" type="button">Удалить</button>` : ''}
      </div>`;
  }

  function bindProjectSelector(target, onChange) {
    if (!target) return;
    target.addEventListener('change', e => {
      if (e.target && e.target.id === 'ps-select') {
        window.RagShared.setActiveProjectId(e.target.value);
        if (typeof onChange === 'function') onChange();
      }
    });
    target.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'new-project') {
        const suggestedNum = window.RagShared.getNextProjectNum();
        const name = prompt('Имя нового клиента?', 'Клиент ' + suggestedNum);
        if (name) {
          window.RagShared.createProject(name);
          window.RagShared.bumpNextProjectNum();
          if (typeof onChange === 'function') onChange();
        }
      } else if (action === 'rename-project') {
        const proj = window.RagShared.getActiveProject();
        if (!proj) return;
        const name = prompt('Новое имя клиента?', proj.name);
        if (name) {
          window.RagShared.updateProject(proj.id, { name });
          if (typeof onChange === 'function') onChange();
        }
      } else if (action === 'delete-project') {
        const proj = window.RagShared.getActiveProject();
        if (!proj) return;
        if (confirm('Удалить клиента «' + proj.name + '»? Действие нельзя отменить.')) {
          window.RagShared.deleteProject(proj.id);
          if (typeof onChange === 'function') onChange();
        }
      }
    });
  }

  // ─── Progress (top of wizard) ────────────────────────────
  const STEPS = [
    { id: 'brief', label: 'Опрос' },
    { id: 'embedding', label: 'Поиск по смыслу' },
    { id: 'retrieval', label: 'Стратегия поиска' },
    { id: 'memory', label: 'Память' },
    { id: 'channels', label: 'Каналы' },
    { id: 'data', label: 'Источники' },
    { id: 'completed', label: 'Финал' }
  ];

  function renderProgress(currentStep, project) {
    const project_progress = window.RagShared.getProjectProgress(project);
    const stepIdx = STEPS.findIndex(s => s.id === currentStep);
    const total = STEPS.length;
    const pct = total > 1 ? Math.round((stepIdx / (total - 1)) * 100) : 0;
    const stepLabel = (STEPS[stepIdx] && STEPS[stepIdx].label) || currentStep;

    function isStepDone(s) {
      if (s.id === 'brief') return project_progress.briefDone;
      if (s.id === 'completed') return false;
      return window.RagShared.isQuizDone(project, s.id);
    }

    const parts = [];
    STEPS.forEach((s, i) => {
      if (i > 0) {
        const lineDone = isStepDone(STEPS[i - 1]);
        parts.push(`<span class="progress-stepper-line${lineDone ? ' done' : ''}"></span>`);
      }
      const isCurrent = s.id === currentStep;
      const isDone = isStepDone(s);
      const cls = ['progress-stepper-step'];
      if (isCurrent) cls.push('current');
      else if (isDone) cls.push('done');
      const href = window.RagShared.STEP_HREFS[s.id] || '#';
      const dotInner = isDone
        ? '<span class="progress-stepper-check">✓</span>'
        : `<span class="progress-stepper-num">${i + 1}</span>`;
      parts.push(`<a class="${cls.join(' ')}" href="${href}"><span class="progress-stepper-dot">${dotInner}</span><span class="progress-stepper-label">${esc(s.label)}</span></a>`);
    });

    return `
      <div class="progress">
        <div class="progress-meta">
          <span>Шаг ${stepIdx + 1} из ${total}<strong>${esc(stepLabel)}</strong></span>
          <span>${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>
        <div class="progress-stepper">${parts.join('')}</div>
      </div>`;
  }

  // ─── Plan FAB + slide-over sheet (унифицирован: desktop+mobile) ─────
  function injectPlanUI() {
    if (document.getElementById('plan-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'plan-fab';
    fab.className = 'plan-fab';
    fab.type = 'button';
    fab.innerHTML = `
      <span class="plan-fab-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="20" y2="6"></line>
          <line x1="8" y1="12" x2="20" y2="12"></line>
          <line x1="8" y1="18" x2="20" y2="18"></line>
          <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"></circle>
          <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"></circle>
          <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"></circle>
        </svg>
      </span>
      <span class="plan-fab-label">План</span>
      <span class="plan-fab-count" id="plan-fab-count">0</span>`;
    document.body.appendChild(fab);

    const sheet = document.createElement('div');
    sheet.id = 'plan-sheet';
    sheet.className = 'plan-sheet';
    sheet.innerHTML = `
      <div class="plan-sheet-backdrop" data-sheet-close></div>
      <aside class="plan-sheet-panel" role="dialog" aria-modal="true" aria-label="План клиента">
        <header class="plan-sheet-head">
          <div class="plan-sheet-head-text">
            <span class="plan-sheet-eyebrow">Текущая сборка</span>
            <h3 class="plan-sheet-title">План клиента</h3>
          </div>
          <button class="plan-sheet-close" data-sheet-close type="button" aria-label="Закрыть">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>
          </button>
        </header>
        <div class="plan-sheet-body" id="plan-sheet-body"></div>
      </aside>`;
    document.body.appendChild(sheet);

    fab.addEventListener('click', () => openPlanSheet());
    sheet.addEventListener('click', e => {
      if (e.target.closest('[data-sheet-close]')) closePlanSheet();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sheet.classList.contains('show')) closePlanSheet();
    });
  }

  function openPlanSheet() {
    const sheet = document.getElementById('plan-sheet');
    if (!sheet) return;
    refreshPlan();
    sheet.classList.add('show');
    document.body.classList.add('no-scroll');
  }

  function closePlanSheet() {
    const sheet = document.getElementById('plan-sheet');
    if (!sheet) return;
    sheet.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }

  function refreshPlan() {
    const body = document.getElementById('plan-sheet-body');
    const proj = window.RagShared.getActiveProject();
    if (body && proj) {
      body.innerHTML = window.RagPreview.renderPreview(proj);
      window.RagPreview.bindAccordions(body);
    }
    updatePlanFabCount();
  }

  function updatePlanFabCount() {
    const proj = window.RagShared.getActiveProject();
    const countEl = document.getElementById('plan-fab-count');
    if (!countEl || !proj) return;
    const stack = window.RagCatalog.computeStretches(proj.brief || {}, proj.answers || {});
    let total = 0;
    Object.values(stack).forEach(c => {
      if (c && Array.isArray(c.leader)) total += c.leader.length;
      if (c && Array.isArray(c.alternatives)) total += c.alternatives.length;
      if (c && Array.isArray(c.items)) total += c.items.length;
    });
    countEl.textContent = total;
    const fab = document.getElementById('plan-fab');
    if (fab) fab.classList.toggle('is-empty', total === 0);
  }

  function setupPlanUI() {
    injectPlanUI();
    refreshPlan();
  }

  // Aliases для обратной совместимости с quiz-runtime.js / другими местами
  const refreshSidebar = refreshPlan;
  const updateMobileToggleCount = updatePlanFabCount;
  const setupMobileSheet = setupPlanUI;

  function setupCopyBriefAction() {
    document.addEventListener('click', e => {
      if (e.target.matches('[data-action="copy-brief"]')) {
        openCopyBriefModal();
      }
    });
  }

  function openCopyBriefModal() {
    const text = window.RagBrief.getBriefForClient();
    window.RagShared.openModal({
      title: 'Опросник для клиента',
      bodyHtml: `
        <p style="color:var(--muted);margin-bottom:12px;font-size:13px;">
          Скопируй этот текст и отправь клиенту.
          Когда получишь ответы — заполнишь бриф здесь и продолжишь сборку.
        </p>
        <textarea readonly>${esc(text)}</textarea>`,
      footHtml: `
        <button class="btn btn-ghost" data-modal-close type="button">Закрыть</button>
        <button class="btn btn-primary" id="cb-copy-btn" type="button">Скопировать</button>`,
      onOpen: () => {
        const btn = document.getElementById('cb-copy-btn');
        btn.addEventListener('click', async () => {
          const ok = await window.RagShared.copyToClipboard(text);
          window.RagShared.showToast(ok ? 'Скопировано в буфер ✓' : 'Не удалось скопировать');
        });
      }
    });
  }

  function esc(t) { return window.RagShared.escapeHtml(t); }

  window.RagWizardUI = {
    ensureActiveProject,
    renderProjectSelector,
    bindProjectSelector,
    renderProgress,
    refreshPlan,
    updatePlanFabCount,
    setupPlanUI,
    openPlanSheet,
    closePlanSheet,
    // legacy aliases
    refreshSidebar,
    updateMobileToggleCount,
    setupMobileSheet,
    setupCopyBriefAction,
    openCopyBriefModal,
    STEPS
  };
})();
