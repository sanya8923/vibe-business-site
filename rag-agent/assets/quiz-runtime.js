/* RAG-Agent — общий runtime для всех 5 квизов.
   Принимает quizId, рендерит вопросы, сохраняет ответы, обновляет sidebar.
   Зависит от: shared / brief / quizzes / catalog / preview / wizard-ui */

(function () {
  'use strict';

  function start(quizId) {
    const proj = window.RagWizardUI.ensureActiveProject();
    if (!window.RagShared.isBriefDone(proj.brief)) {
      window.location.href = '/rag-agent/wizard/';
      return;
    }
    window.RagShared.setCurrentStep(proj.id, quizId);
    runQuiz(quizId);
    setupLayout();
    window.RagWizardUI.refreshSidebar();
  }

  function runQuiz(quizId) {
    const $sel = document.getElementById('project-selector-slot');
    const $progress = document.getElementById('progress-slot');
    const $app = document.getElementById('quiz-app');

    function render() {
      const p = window.RagShared.getActiveProject();
      window.RagWizardUI.renderProjectSelector($sel);
      $progress.innerHTML = window.RagWizardUI.renderProgress(quizId, p);
      renderQuestions(p);
    }

    function renderQuestions(project) {
      const visible = window.RagQuizzes.getVisibleQuestions(quizId, project.brief, project.answers);
      const quizMeta = window.RagQuizzes.QUIZZES[quizId];
      const totalVisible = visible.length;

      const questionsHtml = visible.map((q, idx) => renderQuestion(q, project, idx, totalVisible)).join('');

      const quizOrderIdx = window.RagShared.QUIZ_ORDER.indexOf(quizId);
      const isFirst = quizOrderIdx === 0;
      const isLast = quizOrderIdx === window.RagShared.QUIZ_ORDER.length - 1;
      const prevHref = isFirst
        ? '/rag-agent/wizard/'
        : '/rag-agent/wizard/' + window.RagShared.QUIZ_ORDER[quizOrderIdx - 1] + '.html';
      const nextHref = isLast
        ? '/rag-agent/wizard/result.html'
        : '/rag-agent/wizard/' + window.RagShared.QUIZ_ORDER[quizOrderIdx + 1] + '.html';
      const nextLabel = isLast ? 'Перейти к финалу →' : 'Дальше →';

      // Шаг N из 7 (бриф = 1, embedding = 2, ...)
      const stepNum = quizOrderIdx + 2;
      const totalSteps = 7;
      const stepLabel = window.RagShared.STEP_LABELS[quizId] || quizMeta.title;

      // Все ли видимые вопросы отвечены?
      const allDone = visible.every(q => isAnswered(q, project));

      $app.innerHTML = `
        <section class="wz-hero">
          <span class="wz-hero-eyebrow"><span class="wz-hero-dot"></span>Шаг ${stepNum} из ${totalSteps} · ${esc(stepLabel)}</span>
          <h1 class="wz-hero-h1">${esc(quizMeta.title)}</h1>
          ${quizMeta.intro ? `<p class="wz-hero-lead">${esc(quizMeta.intro)}</p>` : ''}
        </section>

        ${questionsHtml}

        <div class="quiz-actions" style="margin-top:24px;">
          <a class="btn btn-ghost" href="${prevHref}">← Назад</a>
          <div class="flex gap-12">
            <button class="btn btn-ghost" data-action="copy-brief" type="button">Скопировать опросник для клиента</button>
            <a class="btn btn-primary" href="${nextHref}" ${allDone ? '' : 'data-incomplete="1"'}>${esc(nextLabel)}</a>
          </div>
        </div>`;

      bindOptions(project);
      bindNextGuard();
    }

    function renderQuestion(q, project, idx, total) {
      const ans = (project.answers && project.answers[quizId] && project.answers[quizId][q.id]);
      const visibleOpts = window.RagQuizzes.getVisibleOptions(q, project.brief);

      const optionsHtml = visibleOpts.map(opt => {
        const isChecked = q.type === 'checkbox'
          ? (Array.isArray(ans) && ans.includes(opt.key))
          : (ans === opt.key);
        const hintHtml = opt.hint ? `<div class="option-hint">${esc(opt.hint)}</div>` : '';
        return `
          <label class="option ${isChecked ? 'selected' : ''}" data-quiz="${esc(quizId)}" data-q="${esc(q.id)}" data-key="${esc(opt.key)}" data-type="${esc(q.type)}">
            <input type="${q.type === 'checkbox' ? 'checkbox' : 'radio'}" name="${esc(quizId + '-' + q.id)}" value="${esc(opt.key)}" ${isChecked ? 'checked' : ''}>
            <span class="option-marker ${q.type === 'checkbox' ? 'checkbox' : 'radio'}"></span>
            <span class="option-letter">${esc(opt.key.length > 3 ? '✓' : opt.key)}</span>
            <div class="option-body">
              <div class="option-text">${opt.text}</div>
              ${hintHtml}
            </div>
          </label>`;
      }).join('');

      const eyebrowText = total > 1 ? `Вопрос ${idx + 1} из ${total}` : 'Вопрос';
      const typeBadge = q.type === 'checkbox' ? ' · можно несколько' : '';

      return `
        <section class="brief-section" data-question="${esc(q.id)}">
          <header class="brief-section-head">
            <span class="brief-section-eyebrow"><span class="brief-section-dot"></span>${esc(eyebrowText)}${typeBadge}</span>
            <h2 class="brief-section-h2">${esc(q.title)}</h2>
          </header>
          <div class="brief-fields">
            <div class="brief-field">
              ${q.hint ? `<div class="brief-field-hint">${esc(q.hint)}</div>` : ''}
              <div class="options">${optionsHtml}</div>
            </div>
          </div>
        </section>`;
    }

    function isAnswered(q, project) {
      const ans = project.answers && project.answers[quizId] && project.answers[quizId][q.id];
      if (q.type === 'checkbox') return Array.isArray(ans) && ans.length > 0;
      return ans !== undefined && ans !== null && ans !== '';
    }

    function bindOptions(project) {
      $app.querySelectorAll('.option[data-quiz]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          const proj = window.RagShared.getActiveProject();
          const qId = el.dataset.q;
          const key = el.dataset.key;
          const type = el.dataset.type;
          const stretchesBefore = window.RagCatalog.computeStretches(proj.brief, proj.answers);

          if (type === 'checkbox') {
            const cur = (proj.answers && proj.answers[quizId] && Array.isArray(proj.answers[quizId][qId]))
              ? proj.answers[quizId][qId].slice()
              : [];
            const idx = cur.indexOf(key);
            if (idx === -1) cur.push(key);
            else cur.splice(idx, 1);
            window.RagShared.updateAnswer(proj.id, quizId, qId, cur);
          } else {
            window.RagShared.updateAnswer(proj.id, quizId, qId, key);
          }

          render();
          window.RagWizardUI.refreshSidebar();
          showStretchDelta(stretchesBefore);
        });
      });
    }

    function bindNextGuard() {
      const next = $app.querySelector('a.btn-primary[data-incomplete]');
      if (next) {
        next.addEventListener('click', e => {
          e.preventDefault();
          window.RagShared.showToast('Ответь на все вопросы прежде чем идти дальше', 'warn');
        });
      }
    }

    function showStretchDelta(before) {
      const after = window.RagCatalog.computeStretches(window.RagShared.getActiveProject().brief, window.RagShared.getActiveProject().answers);
      const diffActivated = [];
      const diffDeactivated = [];
      Object.keys(after).forEach(cat => {
        const beforeIds = new Set([...(before[cat]?.leader || []), ...(before[cat]?.alternatives || [])]);
        const afterIds = new Set([...(after[cat]?.leader || []), ...(after[cat]?.alternatives || [])]);
        afterIds.forEach(id => { if (!beforeIds.has(id)) diffActivated.push(id); });
        beforeIds.forEach(id => { if (!afterIds.has(id)) diffDeactivated.push(id); });
      });
      if (diffActivated.length === 1) {
        const s = window.RagCatalog.getStretch(diffActivated[0]);
        if (s) window.RagShared.showToast('✓ Активирован: ' + s.name);
      } else if (diffActivated.length > 1) {
        window.RagShared.showToast('✓ Активировано: ' + diffActivated.length + ' стретчей');
      } else if (diffDeactivated.length === 1) {
        const s = window.RagCatalog.getStretch(diffDeactivated[0]);
        if (s) window.RagShared.showToast('— Убран: ' + s.name);
      }
    }

    function esc(t) { return window.RagShared.escapeHtml(t); }

    window.RagWizardUI.bindProjectSelector($sel, () => {
      window.RagWizardUI.refreshSidebar();
      render();
    });
    window.RagWizardUI.setupCopyBriefAction();
    render();
  }

  function setupLayout() {
    window.RagWizardUI.setupPlanUI();
  }

  window.RagQuizRuntime = { start };
})();
