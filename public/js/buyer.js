// buyer.js – buyer dashboard: favorites, conversations, account settings

const _t = (key, vars) => typeof I18n !== 'undefined' ? I18n.t(key, vars) : key;

async function loadBuyerDashboard() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/';
    return;
  }
  const tab = new URLSearchParams(window.location.search).get('tab') || 'favorites';
  switchBuyerTab(tab);
}

function switchBuyerTab(tab) {
  document.querySelectorAll('.buyer-tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.buyer-tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === `buyer-tab-${tab}`)
  );

  if (tab === 'favorites')      loadFavorites();
  else if (tab === 'messages')  loadBuyerThreads();
  else if (tab === 'reports')   loadMyReports();
  else if (tab === 'settings')  loadAccountSettings();
}

// ── Favorites ────────────────────────────────────────────────────────────────
async function loadFavorites() {
  const el = document.getElementById('favorites-list');
  if (!el) return;
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const favs = await apiFetch('/buyer/favorites');
    if (!favs.length) { el.innerHTML = `<p style="color:var(--text-muted)">${_t('buyer.no_favorites')}</p>`; return; }
    el.innerHTML = `<div class="product-grid">${favs.map(p => `
      <div class="product-card" onclick="window.location='/product.html?id=${p.id}'">
        ${p.thumbnail ? `<img class="product-card-img" src="${escHtml(p.thumbnail)}" alt="${escHtml(p.title)}" loading="lazy">` : '<div class="product-card-img-placeholder">🖼️</div>'}
        <div class="product-card-body">
          <div class="product-card-title">${escHtml(p.title)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
          <div class="product-card-meta">${escHtml(p.shop_name || '')}</div>
          ${p.status !== 'published' ? `<div class="error-msg" style="font-size:.78rem">${_t('product.not_available')}</div>` : ''}
          <button class="btn btn-danger btn-sm" style="margin-top:.5rem" onclick="event.stopPropagation();removeFavorite(${p.id},this)">${_t('product.remove')}</button>
        </div>
      </div>`).join('')}</div>`;
  } catch (err) { el.innerHTML = `<p class="error-msg">${err.message}</p>`; }
}

async function removeFavorite(productId, btn) {
  btn.disabled = true;
  try {
    await apiFetch(`/buyer/favorites/${productId}`, { method: 'DELETE' });
    btn.closest('.product-card').remove();
    toast(_t('buyer.removed_favorite'));
  } catch (err) { toast(err.message, 'danger'); btn.disabled = false; }
}

// ── Buyer conversation list ──────────────────────────────────────────────────
async function loadBuyerThreads() {
  const el = document.getElementById('buyer-threads');
  if (!el) return;
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const threads = await apiFetch('/messages/threads');
    if (!threads.length) { el.innerHTML = `<p style="color:var(--text-muted)">${_t('buyer.no_conversations')}</p>`; return; }
    el.innerHTML = threads.map(t => `
      <div class="card" style="margin-bottom:.75rem;cursor:pointer" onclick="window.location='/messages.html?product=${t.product_id}&user=${t.other_user_id}'">
        <div class="card-body" style="display:flex;gap:1rem;align-items:center">
          <div style="flex:1">
            <strong>${escHtml(t.other_user_name || 'User')}</strong>
            <div style="font-size:.85rem;color:var(--text-muted)">${escHtml(t.product_title || '')}</div>
            <div style="font-size:.82rem;color:var(--text-muted);margin-top:.2rem">${escHtml(t.last_message || '')}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:.78rem;color:var(--text-muted)">${timeAgo(t.last_message_at)}</div>
            ${parseInt(t.unread_count) > 0 ? `<span class="badge">${t.unread_count}</span>` : ''}
          </div>
        </div>
      </div>`).join('');
  } catch (err) { el.innerHTML = `<p class="error-msg">${err.message}</p>`; }
}

// ── My reports ───────────────────────────────────────────────────────────────
async function loadMyReports() {
  const el = document.getElementById('my-reports');
  if (!el) return;
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const reports = await apiFetch('/reports/mine');
    if (!reports.length) { el.innerHTML = `<p style="color:var(--text-muted)">${_t('buyer.no_reports')}</p>`; return; }
    el.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>${_t('buyer.reports.product')}</th><th>${_t('buyer.reports.reason')}</th><th>${_t('buyer.reports.status')}</th><th>${_t('buyer.reports.date')}</th></tr></thead>
      <tbody>${reports.map(r => `
        <tr>
          <td>${escHtml(r.product_title || '—')}</td>
          <td>${escHtml(r.reason)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>`).join('')}
      </tbody></table></div>`;
  } catch (err) { el.innerHTML = `<p class="error-msg">${err.message}</p>`; }
}

// ── Account settings ──────────────────────────────────────────────────────────
async function loadAccountSettings() {
  const el = document.getElementById('account-settings');
  if (!el) return;
  const user = await Auth.fetchMe();
  if (!user) return;

  el.innerHTML = `
    <div class="card" style="max-width:480px">
      <div class="card-header">${_t('buyer.profile')}</div>
      <div class="card-body">
        <form onsubmit="saveProfile(event)">
          <div class="form-group">
            <label>${_t('buyer.full_name')}</label>
            <input id="settings-name" value="${escHtml(user.full_name || '')}">
          </div>
          <div class="form-group">
            <label>${_t('buyer.phone')}</label>
            <input id="settings-phone" value="${escHtml(user.phone_number || '')}">
          </div>
          <div id="profile-msg" class="alert" style="display:none"></div>
          <button type="submit" class="btn btn-primary">${_t('buyer.save_changes')}</button>
        </form>
      </div>
    </div>
    <div class="card" style="max-width:480px;margin-top:1.5rem">
      <div class="card-header">${_t('buyer.change_password')}</div>
      <div class="card-body">
        <form onsubmit="changePassword(event)">
          <div class="form-group">
            <label>${_t('buyer.current_password')}</label>
            <input type="password" id="cur-pwd">
          </div>
          <div class="form-group">
            <label>${_t('buyer.new_password')}</label>
            <input type="password" id="new-pwd" minlength="8">
          </div>
          <div id="pwd-msg" class="alert" style="display:none"></div>
          <button type="submit" class="btn btn-primary">${_t('buyer.update_password')}</button>
        </form>
      </div>
    </div>
    ${user.role === 'buyer' ? `
    <div class="card" style="max-width:480px;margin-top:1.5rem">
      <div class="card-header">${_t('buyer.become_seller')}</div>
      <div class="card-body">
        <p style="margin-bottom:1rem;color:var(--text-muted)">${_t('buyer.become_seller_desc')}</p>
        <a href="/apply-seller.html" class="btn btn-outline">${_t('buyer.apply_to_sell')}</a>
      </div>
    </div>` : ''}`;
}

async function saveProfile(e) {
  e.preventDefault();
  const msgEl = document.getElementById('profile-msg');
  try {
    await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name: document.getElementById('settings-name').value, phone_number: document.getElementById('settings-phone').value }),
    });
    msgEl.className = 'alert alert-success';
    msgEl.textContent = _t('buyer.profile_updated');
    msgEl.style.display = '';
  } catch (err) {
    msgEl.className = 'alert alert-danger';
    msgEl.textContent = err.message;
    msgEl.style.display = '';
  }
}

async function changePassword(e) {
  e.preventDefault();
  const msgEl = document.getElementById('pwd-msg');
  try {
    await apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: document.getElementById('cur-pwd').value, new_password: document.getElementById('new-pwd').value }),
    });
    msgEl.className = 'alert alert-success';
    msgEl.textContent = _t('buyer.password_updated');
    msgEl.style.display = '';
    document.getElementById('cur-pwd').value = '';
    document.getElementById('new-pwd').value = '';
  } catch (err) {
    msgEl.className = 'alert alert-danger';
    msgEl.textContent = err.message;
    msgEl.style.display = '';
  }
}
