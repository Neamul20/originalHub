// seller.js – seller dashboard logic

async function loadSellerDashboard() {
  if (!Auth.isRole('seller', 'admin')) {
    document.getElementById('seller-content')?.insertAdjacentHTML('beforeend',
      '<div class="alert alert-danger">You must be an approved seller to access this page. <a href="/">Go home</a></div>');
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
    <div class="stat-card"><div class="stat-card-value">${published}</div><div class="stat-card-label">Published</div></div>
    <div class="stat-card"><div class="stat-card-value">${pending}</div><div class="stat-card-label">Pending Review</div></div>
    <div class="stat-card"><div class="stat-card-value">${draft}</div><div class="stat-card-label">Drafts</div></div>
    <div class="stat-card"><div class="stat-card-value">${dash.unread_messages}</div><div class="stat-card-label">Unread Messages</div></div>
    <div class="stat-card"><div class="stat-card-value">${dash.sold_this_month}</div><div class="stat-card-label">Sold This Month</div></div>`;
}

function renderSellerProducts(products) {
  const el = document.getElementById('seller-products-table');
  if (!el) return;
  if (!products.length) {
    el.innerHTML = '<p style="color:var(--text-muted)">No products yet. <a href="#" onclick="showAddProduct()">Add your first product</a>.</p>';
    return;
  }
  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Image</th><th>Title</th><th>Price</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.thumbnail ? `<img src="${escHtml(p.thumbnail)}" style="width:50px;height:40px;object-fit:cover;border-radius:4px">` : '—'}</td>
              <td>${escHtml(p.title)}</td>
              <td>${formatPrice(p.price)}</td>
              <td>${statusBadge(p.status)}${p.status === 'rejected' && p.rejection_reason ? `<br><small style="color:var(--danger);font-size:.75rem">Reason: ${escHtml(p.rejection_reason)}</small>` : ''}</td>
              <td>${p.views}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-outline btn-sm" onclick="editProduct(${p.id})">Edit</button>
                ${p.status === 'published' ? `<button class="btn btn-sm" style="background:#6366f1;color:#fff" onclick="markSold(${p.id})">Mark Sold</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
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
  modal.innerHTML = `
    <div class="modal" style="max-width:640px">
      <div class="modal-header">
        <span>${editingProductId ? 'Edit Product' : 'Add New Product'}</span>
        <button class="modal-close" onclick="document.getElementById('product-modal').classList.add('hidden')">✕</button>
      </div>
      <div class="modal-body">
        <form id="product-form" onsubmit="submitProduct(event)" enctype="multipart/form-data">
          <div class="form-group">
            <label>Title <span class="form-hint">(max 100 chars)</span></label>
            <input name="title" maxlength="100" required value="${escHtml(p.title || '')}">
          </div>
          <div class="form-group">
            <label>Description <span class="form-hint">(min 50 chars)</span></label>
            <textarea name="description" required minlength="50">${escHtml(p.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Price (BDT)</label>
            <input name="price" type="number" min="0" step="0.01" required value="${p.price || ''}">
          </div>
          <div class="form-group">
            <label>Category</label>
            <select name="category">
              <option value="">Select…</option>
              ${cfg.CATEGORIES ? cfg.CATEGORIES.map(c => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('') : ''}
            </select>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input name="location" value="${escHtml(p.location || '')}">
          </div>
          <div class="form-group">
            <label>Handmade Proof <span class="form-hint">(describe how you made this)</span></label>
            <textarea name="handmade_proof_text" required>${escHtml(p.handmade_proof_text || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Images <span class="form-hint">(up to ${cfg.MAX_PRODUCT_IMAGES || 5}, JPEG/PNG/WebP, max ${cfg.MAX_IMAGE_SIZE_MB || 5}MB each)</span></label>
            <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp">
          </div>
          <div id="product-form-error" class="error-msg"></div>
          <div class="modal-footer" style="padding:0;border:none;margin-top:.5rem">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('product-modal').classList.add('hidden')">Cancel</button>
            <button type="submit" class="btn btn-primary">${editingProductId ? 'Update' : 'Submit for Review'}</button>
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
    toast(editingProductId ? 'Product updated. Pending re-review.' : 'Product submitted for review!');
    loadSellerDashboard();
  } catch (err) {
    errEl.textContent = err.message;
    submitBtn.disabled = false;
  }
}

async function markSold(productId) {
  if (!confirm('Mark this product as sold?')) return;
  try {
    await apiFetch(`/products/${productId}/sold`, { method: 'PUT' });
    toast('Marked as sold');
    loadSellerDashboard();
  } catch (err) { toast(err.message, 'danger'); }
}

async function deleteProduct(productId) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await apiFetch(`/products/${productId}`, { method: 'DELETE' });
    toast('Product deleted');
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
    shop_name:       form.shop_name.value,
    bio:             form.bio.value,
    location:        form.location.value,
    phone_number:    form.phone_number.value,
    handmade_promise: form.handmade_promise.value,
  };
  try {
    await apiFetch('/seller/apply', { method: 'POST', body: JSON.stringify(body) });
    toast('Application submitted! We will review it shortly.');
    form.closest('.card').innerHTML = '<div class="alert alert-success">Application submitted. Please wait for admin approval.</div>';
  } catch (err) {
    errEl.textContent = err.message;
  }
}
