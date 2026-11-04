/**
 * GOODSPRINGS — UI helpers (async / Supabase)
 */

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return d; }
}

function setActiveNav() {
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
}

async function updateMeta() {
  try {
    const m = await GS.getMeta();
    document.querySelectorAll('[data-meta]').forEach(el => {
      const key = el.getAttribute('data-meta');
      if (m[key] !== undefined) el.textContent = m[key];
    });
  } catch (e) { console.error(e); }
}

function showConfigWarning() {
  if (typeof GS !== 'undefined' && GS.isConfigured && !GS.isConfigured()) {
    const bar = document.createElement('div');
    bar.className = 'config-warning';
    bar.setAttribute('role', 'status');
    bar.textContent = '> АРХИВ НЕДОСТУПЕН. Подключение к муниципальной базе не настроено. Обратитесь к администрации.';
    document.body.prepend(bar);
  }
}

async function renderNewsFull(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = await GS.getNews();
  if (!list.length) {
    el.innerHTML = '<div class="empty">Новостей пока нет. Администрация скоро опубликует первые сообщения.</div>';
    return;
  }
  el.innerHTML = list.map(n => `
    <article class="paper" style="margin-bottom:20px;">
      <div class="paper-header">
        <span>${esc(n.title)}</span>
        <span style="font-size:0.8rem;opacity:0.8;">${esc(n.date)} · ${esc(n.author || 'Администрация')}</span>
      </div>
      <div class="paper-body" style="white-space:pre-wrap;">${esc(n.content)}</div>
    </article>
  `).join('');
}

async function renderBoard(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = (await GS.getBoard()).filter(x => x.status !== 'hidden');
  if (!list.length) {
    el.innerHTML = '<div class="empty">Объявлений пока нет. Будьте первым — разместите своё на доске.</div>';
    return;
  }
  el.innerHTML = `<div class="cards">${list.map(b => `
    <div class="card">
      <div class="card-body">
        <div class="card-meta">${esc(b.category || 'Разное')} · ${esc(b.date)} · ${esc(b.author)}</div>
        <div class="card-title">${esc(b.title)}</div>
        <div class="card-text">${esc(b.content)}</div>
      </div>
    </div>
  `).join('')}</div>`;
}

async function renderHousing(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = await GS.getHousing();
  if (!list.length) {
    el.innerHTML = '<div class="empty">Информация о свободных домах пока не внесена.</div>';
    return;
  }
  el.innerHTML = `<div class="cards">${list.map(h => {
    const st = h.status === 'free' ? 'status-free' : h.status === 'busy' ? 'status-busy' : 'status-repair';
    const stText = h.status === 'free' ? 'Свободен' : h.status === 'busy' ? 'Занят' : 'На ремонте';
    return `<div class="card">
      <div class="card-img">[ ФОТО ДОМА ]</div>
      <div class="card-body">
        <div class="card-title">${esc(h.title)}</div>
        <div class="card-meta">${esc(h.condition || '')} ${h.price ? '· ' + esc(h.price) : ''}</div>
        <div class="card-text">${esc(h.description)}</div>
        <span class="card-status ${st}">${stText}</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}

async function renderJobs(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = await GS.getJobs();
  if (!list.length) {
    el.innerHTML = '<div class="empty">Открытых вакансий пока нет.</div>';
    return;
  }
  el.innerHTML = `<div class="cards">${list.map(j => `
    <div class="card"><div class="card-body">
      <div class="card-title">${esc(j.title)}</div>
      <div class="card-meta">${esc(j.department || 'Общее')}</div>
      <div class="card-text">${esc(j.description)}</div>
      ${j.requirements ? `<p style="margin-top:10px;font-size:0.85rem;opacity:0.8"><strong>Требования:</strong> ${esc(j.requirements)}</p>` : ''}
    </div></div>
  `).join('')}</div>`;
}

async function renderEvents(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = await GS.getEvents();
  if (!list.length) {
    el.innerHTML = '<div class="empty">Ближайших мероприятий пока не запланировано.</div>';
    return;
  }
  el.innerHTML = `<div class="cards">${list.map(e => `
    <div class="card"><div class="card-body">
      <div class="card-meta">${esc(e.date)} · ${esc(e.place || 'Гудспрингс')}</div>
      <div class="card-title">${esc(e.title)}</div>
      <div class="card-text">${esc(e.description)}</div>
      <span class="card-status ${e.status === 'open' ? 'status-open' : 'status-closed'}">${esc(e.status === 'open' ? 'Открыто' : e.status || '')}</span>
    </div></div>
  `).join('')}</div>`;
}

async function renderProposals(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="empty">Загрузка…</div>';
  const list = await GS.getProposals();
  if (!list.length) {
    el.innerHTML = '<div class="empty">Предложений пока нет.</div>';
    return;
  }
  const statusMap = { pending: 'На рассмотрении', approved: 'Одобрено', rejected: 'Отклонено', done: 'Реализовано' };
  el.innerHTML = list.map(p => `
    <div class="paper" style="margin-bottom:16px;">
      <div class="paper-header">
        <span>${esc(p.title)}</span>
        <span style="font-size:0.8rem;">${statusMap[p.status] || p.status} · ${esc(p.date)}</span>
      </div>
      <div class="paper-body">
        <p style="margin-bottom:8px;opacity:0.8;font-size:0.9rem;">От: ${esc(p.author)}</p>
        <div style="white-space:pre-wrap;">${esc(p.content)}</div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  showConfigWarning();
  updateMeta();
});
