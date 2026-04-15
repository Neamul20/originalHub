// seller.js – seller dashboard logic

const $t = (key, vars) => typeof I18n !== 'undefined' ? I18n.t(key, vars) : key;

async function loadSellerDashboard() {
  if (!Auth.isRole('seller', 'admin')) {
    document.getElementById('seller-content')?.insertAdjacentHTML('beforeend',
      `<div class="alert alert-danger">${$t('seller.no_access')} <a href="/">${$t('seller.go_home')}</a></div>`);
    return;
  }

  try {
    const [dash, products] = await Promise.all([
      apiFetch('/seller/dashboard'),
      apiFetch('/products/mine/list'),
    ]);

    renderSellerStats(dash);
    renderSellerProducts(products);
  } catch (err) {
    toast(err.message, 'danger');
  }
}

function renderSellerStats(dash) {
  const el = document.getElementById('seller-stats');
  if (!el) return;
  const published  = dash.products.find(p => p.status === 'published')?.count || 0;
  const pending    = dash.products.find(p => p.status === 'pending_review')?.count || 0;
  const draft      = dash.products.find(p => p.status === 'draft')?.count || 0;
  el.innerHTML = `
    <div class="stat-card"><div class="stat-card-value">${published}</div><div class="stat-card-label">${$t('seller.stat.published')}</div></div>
    <div class="stat-card"><div class="stat-card-value">${pending}</div><div class="stat-card-label">${$t('seller.stat.pending')}</div></div>
    <div class="stat-card"><div class="stat-card-value">${draft}</div><div class="stat-card-label">${$t('seller.stat.drafts')}</div></div>
    <div class="stat-card"><div class="stat-card-value">${dash.unread_messages}</div><div class="stat-card-label">${$t('seller.stat.unread')}</div></div>
    <div class="stat-card"><div class="stat-card-value">${dash.sold_this_month}</div><div class="stat-card-label">${$t('seller.stat.sold')}</div></div>`;
}

function renderSellerProducts(products) {
  const el = document.getElementById('seller-products-table');
  if (!el) return;
  if (!products.length) {
    el.innerHTML = `<p style="color:var(--text-muted)">${$t('seller.no_products')} <a href="#" onclick="showAddProduct()">${$t('seller.add_first')}</a>.</p>`;
    return;
  }
  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>${$t('seller.col.image')}</th>
          <th>${$t('seller.col.title')}</th>
          <th>${$t('seller.col.price')}</th>
          <th>${$t('seller.col.status')}</th>
          <th>${$t('seller.col.views')}</th>
          <th>${$t('seller.col.actions')}</th>
        </tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.thumbnail ? `<img src="${escHtml(p.thumbnail)}" style="width:50px;height:40px;object-fit:cover;border-radius:4px">` : '—'}</td>
              <td>${escHtml(p.title)}</td>
              <td>${formatPrice(p.price)}</td>
              <td>${statusBadge(p.status)}${p.status === 'rejected' && p.rejection_reason ? `<br><small style="color:var(--danger);font-size:.75rem">${$t('seller.rejection_reason')}${escHtml(p.rejection_reason)}</small>` : ''}</td>
              <td>${p.views}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-outline btn-sm" onclick="editProduct(${p.id})">${$t('seller.btn.edit')}</button>
                ${p.status === 'published' ? `<button class="btn btn-sm" style="background:#6366f1;color:#fff" onclick="markSold(${p.id})">${$t('seller.btn.mark_sold')}</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">${$t('seller.btn.delete')}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Add / Edit Product Modal ──────────────────────────────────────────────────
let editingProductId = null;

function showAddProduct() {
  editingProductId = null;
  openProductModal({});
}

async function editProduct(id) {
  try {
    const p = await apiFetch(`/products/mine/${id}`);
    editingProductId = id;
    openProductModal(p);
  } catch (err) { toast(err.message, 'danger'); }
}

function openProductModal(p) {
  const cfg = typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG : {};
  let modal = document.getElementById('product-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'product-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  const imagesHint = $t('seller.form.images_hint', {
    max: cfg.MAX_PRODUCT_IMAGES || 5,
    size: cfg.MAX_IMAGE_SIZE_MB || 5,
  });
  modal.innerHTML = `
    <div class="modal" style="max-width:640px">
      <div class="modal-header">
        <span>${editingProductId ? $t('seller.modal.edit') : $t('seller.modal.add')}</span>
        <button class="modal-close" onclick="document.getElementById('product-modal').classList.add('hidden')">✕</button>
      </div>
      <div class="modal-body">
        <form id="product-form" onsubmit="submitProduct(event)" enctype="multipart/form-data">
          <div class="form-group">
            <label>${$t('seller.form.title')} <span class="form-hint">${$t('seller.form.title_hint')}</span></label>
            <input name="title" maxlength="100" required value="${escHtml(p.title || '')}">
          </div>
          <div class="form-group">
            <label>${$t('seller.form.description')} <span class="form-hint">${$t('seller.form.description_hint')}</span></label>
            <textarea name="description" required minlength="50">${escHtml(p.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label>${$t('seller.form.price')}</label>
            <input name="price" type="number" min="0" step="0.01" required value="${p.price || ''}">
          </div>
          <div class="form-group">
            <label>${$t('seller.form.category')}</label>
            <select name="category">
              <option value="">${$t('seller.form.category_select')}</option>
              ${cfg.CATEGORIES ? cfg.CATEGORIES.map(c => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('') : ''}
            </select>
          </div>
          <div class="form-group">
            <label>${$t('seller.form.location')}</label>
            <input name="location" value="${escHtml(p.location || '')}">
          </div>
          <div class="form-group">
            <label>${$t('seller.form.handmade_proof')} <span class="form-hint">${$t('seller.form.handmade_proof_hint')}</span></label>
            <textarea name="handmade_proof_text" required>${escHtml(p.handmade_proof_text || '')}</textarea>
          </div>
          <div class="form-group">
            <label>${$t('seller.form.images')} <span class="form-hint">(${imagesHint})</span></label>
            <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp">
          </div>
          <div id="product-form-error" class="error-msg"></div>
          <div class="modal-footer" style="padding:0;border:none;margin-top:.5rem">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('product-modal').classList.add('hidden')">${$t('seller.btn.cancel')}</button>
            <button type="submit" class="btn btn-primary">${editingProductId ? $t('seller.btn.update') : $t('seller.btn.submit_review')}</button>
          </div>
        </form>
      </div>
    </div>`;
  modal.classList.remove('hidden');
}

async function submitProduct(e) {
  e.preventDefault();
  const errEl = document.getElementById('product-form-error');
  errEl.textContent = '';
  const form = document.getElementById('product-form');
  const fd = new FormData(form);
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;

  try {
    const url = editingProductId ? `/products/${editingProductId}` : '/products';
    const method = editingProductId ? 'PUT' : 'POST';
    const res = await fetch('/api' + url, {
      method,
      headers: Auth.authHeader(),
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed'; submitBtn.disabled = false; return; }
    document.getElementById('product-modal').classList.add('hidden');
    toast(editingProductId ? $t('seller.updated') : $t('seller.submitted'));
    loadSellerDashboard();
  } catch (err) {
    errEl.textContent = err.message;
    submitBtn.disabled = false;
  }
}

async function markSold(productId) {
  if (!confirm($t('seller.mark_sold_confirm'))) return;
  try {
    await apiFetch(`/products/${productId}/sold`, { method: 'PUT' });
    toast($t('seller.marked_sold'));
    loadSellerDashboard();
  } catch (err) { toast(err.message, 'danger'); }
}

async function deleteProduct(productId) {
  if (!confirm($t('seller.delete_confirm'))) return;
  try {
    await apiFetch(`/products/${productId}`, { method: 'DELETE' });
    toast($t('seller.deleted'));
    loadSellerDashboard();
  } catch (err) { toast(err.message, 'danger'); }
}

// ── Seller application form ───────────────────────────────────────────────────
async function submitSellerApplication(e) {
  e.preventDefault();
  const errEl = document.getElementById('apply-error');
  errEl.textContent = '';
  const form = e.target;
  const body = {
    shop_name:        form.shop_name.value,
    bio:              form.bio.value,
    location:         form.location.value,
    phone_number:     form.phone_number.value,
    handmade_promise: form.handmade_promise.value,
  };
  try {
    await apiFetch('/seller/apply', { method: 'POST', body: JSON.stringify(body) });
    toast($t('seller.apply.submit'));
    form.closest('.card').innerHTML = `<div class="alert alert-success">${$t('seller.apply.submitted_notice')}</div>`;
  } catch (err) {
    errEl.textContent = err.message;
  }
}
