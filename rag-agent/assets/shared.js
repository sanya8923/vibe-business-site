/* RAG-Agent — общие утилиты и работа с localStorage.
   Зависимостей нет, должен подключаться первым. */

(function () {
  'use strict';

  const STORAGE_KEY = 'rag-agent-projects';
  const ACTIVE_KEY = 'rag-agent-active-project';

  // ─── Project model ────────────────────────────────────────
  function uid() {
    return 'proj_' + Math.random().toString(36).slice(2, 9);
  }

  function emptyProject(name) {
    return {
      id: uid(),
      name: name || 'Клиент',
      source: null, // 'case:jur-agency' if from case template
      createdAt: new Date().toISOString(),
      brief: {},
      answers: {
        embedding: {},
        retrieval: {},
        memory: {},
        channels: {},
        data: {}
      },
      currentStep: 'brief'
    };
  }

  function getProjects() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('getProjects: failed', err);
      return [];
    }
  }

  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects || []));
  }

  function getActiveProjectId() {
    return localStorage.getItem(ACTIVE_KEY);
  }

  function setActiveProjectId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  function getActiveProject() {
    const id = getActiveProjectId();
    if (!id) return null;
    return getProjects().find(p => p.id === id) || null;
  }

  function createProject(name, opts) {
    const projects = getProjects();
    const proj = emptyProject(name);
    if (opts && opts.source) proj.source = opts.source;
    if (opts && opts.brief) proj.brief = Object.assign({}, opts.brief);
    if (opts && opts.answers) proj.answers = JSON.parse(JSON.stringify(opts.answers));
    if (opts && opts.currentStep) proj.currentStep = opts.currentStep;
    projects.push(proj);
    saveProjects(projects);
    setActiveProjectId(proj.id);
    return proj;
  }

  function deleteProject(id) {
    const projects = getProjects().filter(p => p.id !== id);
    saveProjects(projects);
    if (getActiveProjectId() === id) {
      setActiveProjectId(projects.length ? projects[0].id : null);
    }
  }

  function updateProject(id, patch) {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    projects[idx] = Object.assign({}, projects[idx], patch);
    saveProjects(projects);
    return projects[idx];
  }

  function updateBrief(id, partialBrief) {
    const proj = getProjects().find(p => p.id === id);
    if (!proj) return null;
    proj.brief = Object.assign({}, proj.brief, partialBrief);
    return updateProject(id, { brief: proj.brief });
  }

  function updateAnswer(id, quizId, qId, value) {
    const proj = getProjects().find(p => p.id === id);
    if (!proj) return null;
    if (!proj.answers) proj.answers = {};
    if (!proj.answers[quizId]) proj.answers[quizId] = {};
    proj.answers[quizId][qId] = value;
    return updateProject(id, { answers: proj.answers });
  }

  function setCurrentStep(id, step) {
    return updateProject(id, { currentStep: step });
  }

  function getProjectProgress(project) {
    if (!project) return { briefDone: false, quizzesDone: 0, currentStep: 'brief' };
    const briefDone = isBriefDone(project.brief);
    const quizzesDone = ['embedding', 'retrieval', 'memory', 'channels', 'data']
      .filter(q => isQuizDone(project, q)).length;
    return {
      briefDone,
      quizzesDone,
      currentStep: project.currentStep || (briefDone ? 'embedding' : 'brief')
    };
  }

  function isBriefDone(brief) {
    if (!brief) return false;
    const required = ['geo', 'legal_form', 'data_residency', 'infra_level',
      'budget_tier', 'stage', 'lang', 'kb_size', 'update_frequency',
      'project_type', 'users_scale'];
    return required.every(k => brief[k] !== undefined && brief[k] !== null && brief[k] !== '');
  }

  function isQuizDone(project, quizId) {
    if (!project || !project.answers || !project.answers[quizId]) return false;
    const answers = project.answers[quizId];
    return Object.keys(answers).length > 0;
  }

  // ─── DOM utils ────────────────────────────────────────────
  function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── Toast ────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(message, type) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('show'));
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ─── Modal ────────────────────────────────────────────────
  function openModal(opts) {
    closeModal();
    const root = document.getElementById('modal-root') || (() => {
      const m = document.createElement('div');
      m.id = 'modal-root';
      document.body.appendChild(m);
      return m;
    })();
    const title = opts.title || '';
    const bodyHtml = opts.bodyHtml || '';
    const footHtml = opts.footHtml || '';

    root.innerHTML = `
      <div class="modal-backdrop" data-modal-backdrop>
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head">
            <h3>${escapeHtml(title)}</h3>
            <button class="modal-close" data-modal-close aria-label="Закрыть">&times;</button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
        </div>
      </div>`;

    root.addEventListener('click', _modalClickHandler);
    document.addEventListener('keydown', _escHandler);
    if (typeof opts.onOpen === 'function') opts.onOpen(root);
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.removeEventListener('click', _modalClickHandler);
    document.removeEventListener('keydown', _escHandler);
    root.innerHTML = '';
  }

  function _modalClickHandler(e) {
    if (e.target.matches('[data-modal-close]') || e.target.matches('[data-modal-backdrop]')) {
      closeModal();
    }
  }

  function _escHandler(e) {
    if (e.key === 'Escape') closeModal();
  }

  // ─── Clipboard ────────────────────────────────────────────
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // fallback below
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (err) {
      console.warn('copyToClipboard fallback failed', err);
      return false;
    }
  }

  // ─── URL helpers ──────────────────────────────────────────
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ─── Routing helpers ──────────────────────────────────────
  // Step name (slug) → human label
  const STEP_LABELS = {
    brief: 'Бриф клиента',
    embedding: 'Поиск по смыслу',
    retrieval: 'Стратегия поиска',
    memory: 'Память бота',
    channels: 'Каналы',
    data: 'Источники документов',
    completed: 'Готово'
  };

  // Step → href (root-relative)
  const STEP_HREFS = {
    brief: '/rag-agent/wizard/',
    embedding: '/rag-agent/wizard/embedding.html',
    retrieval: '/rag-agent/wizard/retrieval.html',
    memory: '/rag-agent/wizard/memory.html',
    channels: '/rag-agent/wizard/channels.html',
    data: '/rag-agent/wizard/data.html',
    completed: '/rag-agent/wizard/result.html'
  };

  const QUIZ_ORDER = ['embedding', 'retrieval', 'memory', 'channels', 'data'];

  function nextStep(current) {
    if (current === 'brief') return 'embedding';
    const idx = QUIZ_ORDER.indexOf(current);
    if (idx === -1) return 'embedding';
    return idx === QUIZ_ORDER.length - 1 ? 'completed' : QUIZ_ORDER[idx + 1];
  }

  function prevStep(current) {
    if (current === 'brief') return 'brief';
    if (current === 'embedding') return 'brief';
    const idx = QUIZ_ORDER.indexOf(current);
    if (idx <= 0) return 'brief';
    return QUIZ_ORDER[idx - 1];
  }

  // ─── Header injection (logo + nav) ────────────────────────
  function ensureHeader() {
    if (document.querySelector('.site-header, .aa-page-header')) return;
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container-wide">
        <div class="site-header-inner">
          <a href="/rag-agent/" class="logo">profy<span>_</span>conveyor · rag-agent</a>
          <nav class="site-nav">
            <a href="/rag-agent/">Главная</a>
            <a href="/rag-agent/wizard/">Wizard</a>
            <a href="/rag-agent/cases/jur-agency/">Кейсы</a>
          </nav>
        </div>
      </div>`;
    document.body.insertBefore(header, document.body.firstChild);
  }

  function ensureFooter() {
    if (document.querySelector('.site-footer, .aa-page-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container-wide">
        Profy Conveyor — школа n8n-автоматизации и AI-агентов
      </div>`;
    document.body.appendChild(footer);
  }

  // ─── Public API ───────────────────────────────────────────
  window.RagShared = {
    // state
    getProjects, saveProjects, getActiveProject, getActiveProjectId,
    setActiveProjectId, createProject, deleteProject, updateProject,
    updateBrief, updateAnswer, setCurrentStep,
    getProjectProgress, isBriefDone, isQuizDone,
    // ui
    showToast, openModal, closeModal,
    copyToClipboard, escapeHtml,
    // routing
    STEP_LABELS, STEP_HREFS, QUIZ_ORDER,
    nextStep, prevStep,
    getQueryParam,
    // dom
    ensureHeader, ensureFooter
  };

  // Auto-inject layout pieces
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { ensureHeader(); ensureFooter(); });
  } else {
    ensureHeader();
    ensureFooter();
  }
})();
