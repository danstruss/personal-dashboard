const $ = sel => document.querySelector(sel);

function startClock() {
  const el = $('#clock');
  function tick() {
    const d = new Date();
    const s = d.toLocaleTimeString();
    el.textContent = s;
  }
  tick();
  setInterval(tick, 1000);
}

function setupTheme() {
  const toggle = $('#themeToggle');
  const stored = localStorage.getItem('dashboard:theme');
  if (stored === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.checked = true;
  }
  toggle.addEventListener('change', e => {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('dashboard:theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('dashboard:theme', 'light');
    }
  });
}

function setupNotes() {
  const area = $('#notes');
  const saveBtn = $('#saveNotes');
  const clearBtn = $('#clearNotes');

  const KEY = 'dashboard:notes';
  const saved = localStorage.getItem(KEY);
  if (saved) area.value = saved;

  saveBtn.addEventListener('click', () => {
    localStorage.setItem(KEY, area.value);
    updateFocusFromNotes();
  });

  clearBtn.addEventListener('click', () => {
    area.value = '';
    localStorage.removeItem(KEY);
    updateFocusFromNotes();
  });
}

function updateFocusFromNotes() {
  const area = $('#notes');
  const focus = $('#focusText');
  const firstLine = area.value.split(/\r?\n/).map(s => s.trim()).find(Boolean);
  focus.textContent = firstLine || 'Add a short focus for today in the Notes area.';
}

function setupSearch() {
  const form = $('#searchForm');
  const input = $('#searchInput');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    // if it looks like a URL, go there directly
    const isUrl = /^(https?:\/\/)|(^[\w-]+\.[\w.-]+)(:\d+)?(\/|$)/i.test(q);
    let url;
    if (isUrl) {
      url = q.match(/^https?:\/\//) ? q : 'https://' + q;
    } else {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    }
    window.open(url, '_blank');
  });
}

function init() {
  startClock();
  setupTheme();
  setupNotes();
  setupSearch();
  updateFocusFromNotes();
}

document.addEventListener('DOMContentLoaded', init);
