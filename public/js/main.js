// main.js – shared utilities, navbar, theme setup

// ── Apply config theme ───────────────────────────────────────────────────────
(function applyTheme() {
  if (typeof ORIGINALHUB_CONFIG === 'undefined') return;
  const r = document.documentElement.style;
  r.setProperty('--primary',    ORIGINALHUB_CONFIG.PRIMARY_COLOR);
  r.setProperty('--secondary',  ORIGINALHUB_CONFIG.SECONDARY_COLOR);
  r.setProperty('--accent',     ORIGINALHUB_CONFIG.ACCENT_COLOR);
  r.setProperty('--bg',         ORIGINALHUB_CONFIG.BACKGROUND_COLOR);
  document.title = ORIGINALHUB_CONFIG.SITE_NAME;
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = ORIGINALHUB_CONFIG.SITE_FAVICON;
})();

// ── API helper ───────────────────────────────────────────────────────────────
function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...Auth.authHeader(), ...(opts.headers || {}) };
  return fetch('/api' + path, { ...opts, headers });
}

// ── Fetch with auth, returns parsed JSON or throws ───────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await api(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Toast notifications ──────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `alert alert-${type}`;
  t.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;max-width:340px;box-shadow:0 4px 16px rgba(0,0,0,.15)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Format helpers ───────────────────────────────────────────────────────────
function formatPrice(p) { return Number(p).toLocaleString('en-BD') + ' BDT'; }
function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Navbar ───────────────────────────────────────────────────────────────────
async function renderNavbar() {
  const cfg = typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG : {};
  const logoHtml = cfg.SITE_LOGO_IMAGE
    ? `<img src="${cfg.SITE_LOGO_IMAGE}" alt="${cfg.SITE_NAME}">`
    : escHtml(cfg.SITE_LOGO_TEXT || 'OriginalHub');

  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const user = Auth.getUser();
  let rightHtml = '';

  if (user) {
    let unread = 0;
    try { const d = await apiFetch('/messages/unread/count'); unread = d.count || 0; } catch {}
    const badge = unread ? `<span class="badge">${unread}</span>` : '';
    rightHtml = `
      <a href="/messages.html">Messages${badge}</a>
      ${user.role === 'seller' || user.role === 'admin' ? '<a href="/seller-dashboard.html">My Shop</a>' : ''}
      ${user.role === 'buyer' || user.role === 'seller' ? '<a href="/buyer-dashboard.html">My Account</a>' : ''}
      ${user.role === 'admin' ? '<a href="/admin/">Admin</a>' : ''}
      <button onclick="logout()">Logout (${escHtml(user.full_name || user.email)})</button>`;
  } else {
    rightHtml = `
      <button onclick="showAuthModal('login')">Login</button>
      <button class="btn-primary" onclick="showAuthModal('register')">Register</button>`;
  }

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/" class="nav-brand">${logoHtml}</a>
      <form class="nav-search" onsubmit="navSearch(event)">
        <input type="text" id="nav-search-input" placeholder="Search handmade items…">
        <button type="submit" class="btn btn-primary btn-sm">Search</button>
      </form>
      <div class="nav-links">${rightHtml}</div>
    </div>`;
}

function navSearch(e) {
  e.preventDefault();
  const q = document.getElementById('nav-search-input').value.trim();
  if (q) window.location.href = `/browse.html?search=${encodeURIComponent(q)}`;
}

function logout() {
  Auth.clearSession();
  window.location.href = '/';
}

// ── Footer ───────────────────────────────────────────────────────────────────
function renderFooter() {
  const cfg = typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG : {};
  const footer = document.getElementById('main-footer');
  if (!footer) return;
  const socials = [
    cfg.FACEBOOK_URL  ? `<a href="${cfg.FACEBOOK_URL}"  target="_blank">Facebook</a>` : '',
    cfg.INSTAGRAM_URL ? `<a href="${cfg.INSTAGRAM_URL}" target="_blank">Instagram</a>` : '',
  ].filter(Boolean).join(' · ');
  footer.innerHTML = `
    <div class="container">
      ${socials ? `<p>${socials}</p>` : ''}
      <p><a href="/pages/about.html">About</a> · <a href="/pages/contact.html">Contact</a> · <a href="/pages/safety.html">Safety Tips</a></p>
      <p style="margin-top:.5rem">${escHtml(cfg.FOOTER_TEXT || '')}</p>
    </div>`;
}

// ── Pagination helper ─────────────────────────────────────────────────────────
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }
  let html = '';
  if (currentPage > 1) html += `<button onclick="(${onPageChange})(${currentPage - 1})">‹ Prev</button>`;
  for (let p = Math.max(1, currentPage - 2); p <= Math.min(totalPages, currentPage + 2); p++) {
    html += `<button class="${p === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${p})">${p}</button>`;
  }
  if (currentPage < totalPages) html += `<button onclick="(${onPageChange})(${currentPage + 1})">Next ›</button>`;
  el.innerHTML = html;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function statusBadge(status) {
  return `<span class="status-badge status-${status}">${status.replace('_', ' ')}</span>`;
}

// ── Init page ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.add('hidden');
    }
  });
});
