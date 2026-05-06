/* RAG-Agent — brand icons & colors для карточек технологий.
   Используется в result.js при рендере rec-card.
   Каждая запись: { icon: SVG-content, bg: '#hex' }.
   Если bg = '#fff' — лого многоцветный (нужно белый фон чтобы цвета бренда были видны).
   Если bg = brand-color — glyph моноцветный (currentColor = white). */

(function () {
  'use strict';

  // ─── Glyph-блоки (общие для нескольких ID одного бренда) ───
  const G = {
    openai: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.82a5.99 5.99 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.99 5.99 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.99 5.99 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07Zm-9.02 12.61a4.48 4.48 0 0 1-2.87-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5ZM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65ZM2.34 7.9A4.49 4.49 0 0 1 4.7 5.92v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79a4.5 4.5 0 0 1-1.64-6.13Zm16.6 3.85L13.1 8.36 15.12 7.2a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.67Zm2-3.02-.14-.08-4.77-2.79a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66ZM8.3 13.86l-2.02-1.16a.08.08 0 0 1-.04-.06V7.04a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68Zm1.1-2.36 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5Z"/></svg>',

    anthropic: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.3 4h-3.6L19.2 20H22.8L17.3 4ZM7.4 4 2 20h3.5l1.1-3.6h6.7L14.4 20h3.5L12.5 4H7.4Zm-.4 9.5L9.7 7l2.7 6.5H7Z"/></svg>',

    google: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.2c0-.7-.1-1.4-.2-2H12v4h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.7Z"/><path d="M12 22c2.7 0 5-.9 6.7-2.5l-3.3-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H2.6v2.6A10 10 0 0 0 12 22Z"/><path d="M6.2 13.8a6 6 0 0 1 0-3.8V7.5H2.6a10 10 0 0 0 0 9l3.6-2.7Z"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 4.6A10 10 0 0 0 2.6 7.5l3.6 2.7C7 7.8 9.3 6 12 6Z"/></svg>',

    gemini: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.4 6.4 5.6 11.6 12 12-6.4.4-11.6 5.6-12 12-.4-6.4-5.6-11.6-12-12C6.4 11.6 11.6 6.4 12 0Z"/></svg>',

    gigachat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Zm0 3.5a6.5 6.5 0 0 0-6.4 5.4l4-2.4 5 3-5 3 4.7 2.8a6.5 6.5 0 1 0-2.3-11.8Z"/></svg>',

    yandex: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 4 9.7 14.6V20H6.4v-5.4L1.5 4h3.6l3 7.4 3-7.4h3.4Zm5.5 0v16h-3.3V4H20Z"/></svg>',

    mistral: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="3.5" height="20"/><rect x="9" y="2" width="3.5" height="3.5"/><rect x="9" y="15" width="3.5" height="3.5"/><rect x="9" y="8.5" width="3.5" height="3.5"/><rect x="16" y="2" width="3.5" height="20"/></svg>',

    deepseek: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10c0-1.5-.3-2.9-.9-4.2-.4 1-1.4 1.7-2.6 1.7a2.8 2.8 0 0 1-2.8-2.8c0-1 .5-2 1.4-2.5A10 10 0 0 0 12 2Zm-3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>',

    cohere: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.7 14a4.3 4.3 0 0 1 0-8.6h7.7a.8.8 0 0 1 0 1.6H9.7a2.7 2.7 0 0 0 0 5.4h2a.8.8 0 0 1 0 1.6Zm-3.7 4.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm14 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>',

    voyage: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12 12 22 2 12l3-3 7 7 7-7 3 3Z"/></svg>',

    postgres: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 2 5.5 4.5 5.5 6.5S6 10 6 12s-1 3-1 5.5S7 22 11 22h2c4 0 6-2 6-4.5s-1-3.5-1-5.5 1-3.5 1-5.5S17 2 12 2Zm0 4a4 4 0 0 1 4 4v1c0 1.5-.5 2.5-1.5 2.5s-1.5-1-1.5-2.5V10a1 1 0 0 0-2 0v1c0 1.5-.5 2.5-1.5 2.5S8 12.5 8 11v-1a4 4 0 0 1 4-4Zm-1.5 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>',

    qdrant: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6L12 11.5 5.5 7.9 12 4.3Zm-7 5.5 6 3.4v6.7l-6-3.3V9.8Zm14 0v6.8l-6 3.3v-6.7l6-3.4Z"/></svg>',

    huggingface: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="11" r="1.2" fill="#0F172A"/><circle cx="15" cy="11" r="1.2" fill="#0F172A"/><path d="M8 14.5c.8 1.5 2.3 2.5 4 2.5s3.2-1 4-2.5" stroke="#0F172A" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',

    vercel: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 22 21H2L12 3Z"/></svg>',

    zep: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14v3l-9.5 10H19v3H5v-3l9.5-10H5V4Z"/></svg>',

    mem0: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h2.5L7 16l3-9.5h2L15 16l1.5-10H19v14h-2V11l-2.5 9h-2L10 11l-2.5 9h-2L3 6Z"/></svg>',

    supermemory: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 3 7l3 1.5L12 5l6 3.5L21 7l-9-5ZM3 9.5V17l9 5 9-5V9.5l-9 5-9-5Z"/></svg>',

    letta: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h3.5v13H17v3H5V4Z"/></svg>',

    graphiti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="7.7" y1="7.5" x2="10.3" y2="16.5"/><line x1="16.3" y1="7.5" x2="13.7" y2="16.5"/><line x1="8.5" y1="6" x2="15.5" y2="6"/></svg>',

    docling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',

    aws: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 7v8l3.5 2v-8L5 7Zm9.5-2L11 7v10l3.5 2 4.5-2.6V7.6L14.5 5Zm0 2.4 3 1.7v6L14.5 17l-3-1.7V9.1l3-1.7Z"/></svg>',

    sec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',

    eval: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/><polyline points="14 6 6 14"/></svg>',

    consent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>',

    autodelete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="17" cy="14" r="2.5" fill="currentColor"/></svg>',

    forget: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',

    export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',

    adminedit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><polygon points="18.5 2.5 21.5 5.5 12 15 8 16 9 12 18.5 2.5"/></svg>',

    adminui: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',

    hybrid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',

    multiquery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 5v14M8 5l8 6M8 19l8-6"/></svg>',

    metafilter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/></svg>',

    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',

    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',

    bucket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>',

    ops: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',

    gdrive: '<svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>',

    telegram: '<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z"/></svg>',

    vk: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M25.54 34.5801C14.6 34.5801 8.3601 27.0801 8.1001 14.6001H13.5801C13.7601 23.7601 17.8 27.6401 21 28.4401V14.6001H26.1602V22.5001C29.3202 22.1601 32.6398 18.5601 33.7598 14.6001H38.9199C38.0599 19.4801 34.4599 23.0801 31.8999 24.5601C34.4599 25.7601 38.5601 28.9001 40.1201 34.5801H34.4399C33.2199 30.7801 30.1802 27.8401 26.1602 27.4401V34.5801H25.54Z" fill="currentColor"/></svg>',

    max: '<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M21.47 41.88c-4.11 0-6.02-.6-9.34-3-2.1 2.7-8.75 4.81-9.04 1.2 0-2.71-.6-5-1.28-7.5C1 29.5.08 26.07.08 21.1.08 9.23 9.82.3 21.36.3c11.55 0 20.6 9.37 20.6 20.91a20.6 20.6 0 0 1-20.49 20.67m.17-31.32c-5.62-.29-10 3.6-10.97 9.7-.8 5.05.62 11.2 1.83 11.52.58.14 2.04-1.04 2.95-1.95a10.4 10.4 0 0 0 5.08 1.81 10.7 10.7 0 0 0 11.19-9.97 10.7 10.7 0 0 0-10.08-11.1Z" clip-rule="evenodd"/></svg>',

    fallback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>'
  };

  // ─── ID → { icon, bg } ─────────────────────────────────────
  const STRETCH_ICONS = {
    // Channels
    'S-Channels-Telegram':       { icon: G.telegram, bg: '#229ED9' },
    'S-Channels-WebWidget':      { icon: G.chat,     bg: '#2A6CFF' },
    'S-Channels-VK':             { icon: G.vk,       bg: '#0077FF' },
    'S-Channels-MAX':            { icon: G.max,      bg: '#0F172A' },
    'S-Channels-Landing':        { icon: G.vercel,   bg: '#000000' },

    // Embedding
    'S-Embed-OpenAI-Small':      { icon: G.openai,   bg: '#0A0A0A' },
    'S-Embed-Cohere':            { icon: G.cohere,   bg: '#39594D' },
    'S-Embed-Voyage':            { icon: G.voyage,   bg: '#1E293B' },
    'S-Embed-Voyage-Domain':     { icon: G.voyage,   bg: '#1E293B' },
    'S-Embed-Gemini':            { icon: G.gemini,   bg: '#1A73E8' },
    'S-Embed-GigaChat':          { icon: G.gigachat, bg: '#21A038' },
    'S-Embed-BGE-Selfhost':      { icon: G.huggingface, bg: '#FFD21E' },

    // Retrieval
    'S-Retrieval-Hybrid':        { icon: G.hybrid,     bg: '#6366F1' },
    'S-Retrieval-Rerank':        { icon: G.cohere,     bg: '#39594D' },
    'S-Retrieval-Rerank-BGE':    { icon: G.huggingface, bg: '#FFD21E' },
    'S-Retrieval-MultiQuery':    { icon: G.multiquery, bg: '#8B5CF6' },
    'S-Retrieval-MetaFilter':    { icon: G.metafilter, bg: '#0EA5E9' },
    'S-Retrieval-Eval':          { icon: G.eval,       bg: '#00C9A7' },

    // Memory backend
    'S-Mem-Profile':             { icon: G.postgres,    bg: '#336791' },
    'S-Mem-pgvector':            { icon: G.postgres,    bg: '#336791' },
    'S-Mem-Mem0':                { icon: G.mem0,        bg: '#FF6B35' },
    'S-Mem-Supermemory':         { icon: G.supermemory, bg: '#7C3AED' },
    'S-Mem-Graphiti':            { icon: G.graphiti,    bg: '#0F766E' },
    'S-Mem-Letta':               { icon: G.letta,       bg: '#DC2626' },
    'S-Mem-Zep-Cloud':           { icon: G.zep,         bg: '#10B981' },
    'S-Mem-Responses':           { icon: G.openai,      bg: '#0A0A0A' },
    'S-Mem-Anthropic-Tool':      { icon: G.anthropic,   bg: '#D97757' },

    // Memory GDPR
    'S-Mem-Consent':             { icon: G.consent,    bg: '#10B981' },
    'S-Mem-AutoDelete':          { icon: G.autodelete, bg: '#F59E0B' },
    'S-Mem-Forget':              { icon: G.forget,     bg: '#DC2626' },
    'S-Mem-Export':              { icon: G.export,     bg: '#3B82F6' },
    'S-Mem-AdminEdit':           { icon: G.adminedit,  bg: '#6366F1' },
    'S-Mem-AdminUI':             { icon: G.adminui,    bg: '#8B5CF6' },

    // Data sources
    'S-Data-Source-GoogleDrive': { icon: G.gdrive,  bg: '#FFFFFF' },
    'S-Data-Source-S3':          { icon: G.aws,     bg: '#FF9900' },
    'S-Data-Source-WebScraping': { icon: G.web,     bg: '#3B82F6' },

    // Data OCR
    'S-Data-OCR-Yandex':         { icon: G.yandex,  bg: '#FC3F1D' },
    'S-Data-OCR-Mistral':        { icon: G.mistral, bg: '#FF7000' },
    'S-Data-OCR-Docling':        { icon: G.docling, bg: '#0EA5E9' },

    // Data Vision
    'S-Data-Vision-YandexGPT':   { icon: G.yandex,   bg: '#FC3F1D' },
    'S-Data-Vision-GigaChat':    { icon: G.gigachat, bg: '#21A038' },
    'S-Data-Vision-Mistral':     { icon: G.mistral,  bg: '#FF7000' },
    'S-Data-Vision-Gemini':      { icon: G.gemini,   bg: '#1A73E8' },

    // Data Eval
    'S-Data-Parse-Eval':         { icon: G.eval, bg: '#00C9A7' },

    // Sec
    'S-Sec-Base':                { icon: G.sec,  bg: '#475569' },
    'S-Sec-OpenGuardrails-RU':   { icon: G.sec,  bg: '#0F766E' },
    'S-Sec-Eval':                { icon: G.eval, bg: '#00C9A7' },

    // Storage
    'Storage-pgvector':          { icon: G.postgres, bg: '#336791' },
    'S-Storage-Qdrant':          { icon: G.qdrant,   bg: '#DC382D' },

    // Chat Model
    'Chat-GigaChat':             { icon: G.gigachat,    bg: '#21A038' },
    'Chat-YandexGPT':            { icon: G.yandex,      bg: '#FC3F1D' },
    'Chat-DeepSeek':             { icon: G.deepseek,    bg: '#4D6BFE' },
    'Chat-GPT-4.1-mini':         { icon: G.openai,      bg: '#0A0A0A' },
    'Chat-GPT-4.1':              { icon: G.openai,      bg: '#0A0A0A' },
    'Chat-Claude':               { icon: G.anthropic,   bg: '#D97757' },
    'Chat-Gemini':               { icon: G.gemini,      bg: '#1A73E8' },
    'Chat-OSS':                  { icon: G.huggingface, bg: '#FFD21E' }
  };

  function getStretchIcon(id) {
    return STRETCH_ICONS[id] || { icon: G.fallback, bg: '#475569' };
  }

  window.RagBrandIcons = { getStretchIcon, STRETCH_ICONS };
})();
