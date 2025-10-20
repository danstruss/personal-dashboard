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
  setupWeather();
  updateFocusFromNotes();
}

document.addEventListener('DOMContentLoaded', init);

// --- Weather widget ---
function setupWeather() {
  const keyFromAttr = document.body.getAttribute('data-weather-api-key') || '';
  const storageKey = 'dashboard:weather:key';
  const apiKey = localStorage.getItem(storageKey) || keyFromAttr || '';

  const elLoading = document.getElementById('weatherLoading');
  const elError = document.getElementById('weatherError');
  const elMain = document.getElementById('weatherMain');
  const elLoc = document.getElementById('weatherLocation');
  const elDesc = document.getElementById('weatherDesc');
  const elTemp = document.getElementById('weatherTemp');
  const elIcon = document.getElementById('weatherIcon');

  const btnSet = document.getElementById('setWeatherKey');
  const btnRefresh = document.getElementById('refreshWeather');

  async function refresh() {
    elError.hidden = true;
    elMain.hidden = true;
    elLoading.hidden = false;

    const key = localStorage.getItem(storageKey) || '';
    if (!key) {
      elLoading.hidden = true;
      elError.hidden = false;
      elError.textContent = 'No API key set. Click "Set API Key" to configure.';
      return;
    }

    try {
      // Use WeatherAPI (weatherapi.com) current weather endpoint
      const base = 'https://api.weatherapi.com/v1/current.json';
      // default to London; WeatherAPI accepts either city name or "lat,lon" for q
      let qUrl = `${base}?key=${encodeURIComponent(key)}&aqi=no&q=London`;
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          const id = setTimeout(() => reject(new Error('geolocation timeout')), 5000);
          navigator.geolocation.getCurrentPosition(p => { clearTimeout(id); resolve(p); }, err => { clearTimeout(id); reject(err); }, {maximumAge:600000,timeout:5000});
        }).catch(() => null);
        if (pos && pos.coords) {
          const {latitude, longitude} = pos.coords;
          qUrl = `${base}?key=${encodeURIComponent(key)}&aqi=no&q=${latitude},${longitude}`;
        }
      }

      const res = await fetch(qUrl);
      if (!res.ok) throw new Error('Weather fetch failed: ' + res.status);
      const data = await res.json();

      const name = (data.location && data.location.name) ? `${data.location.name}${data.location.region ? ', ' + data.location.region : ''}` : (data.location && data.location.country) || 'Unknown';
      const desc = (data.current && data.current.condition && data.current.condition.text) || '';
      const temp = Math.round((data.current && typeof data.current.temp_c === 'number') ? data.current.temp_c : NaN);
      let icon = (data.current && data.current.condition && data.current.condition.icon) || '';

      elLoc.textContent = name;
      elDesc.textContent = desc;
      elTemp.textContent = Number.isFinite(temp) ? `${temp}°C` : '--°C';
      if (icon) {
        // WeatherAPI returns icons like "//cdn.weatherapi.com/…" — ensure https:
        if (icon.startsWith('//')) icon = 'https:' + icon;
        elIcon.src = icon;
        elIcon.alt = desc || 'weather icon';
        elIcon.hidden = false;
      } else {
        elIcon.hidden = true;
      }

      elLoading.hidden = true;
      elMain.hidden = false;
    } catch (err) {
      console.error(err);
      elLoading.hidden = true;
      elMain.hidden = true;
      elError.hidden = false;
      elError.textContent = 'Could not load weather. ' + (err.message || '');
    }
  }

  btnSet.addEventListener('click', () => {
    const val = prompt('Enter OpenWeatherMap API key (get one at https://openweathermap.org):', localStorage.getItem(storageKey) || '');
    if (val === null) return;
    if (val.trim()) {
      localStorage.setItem(storageKey, val.trim());
    } else {
      localStorage.removeItem(storageKey);
    }
    refresh();
  });

  btnRefresh.addEventListener('click', refresh);

  // initial
  refresh();
}
