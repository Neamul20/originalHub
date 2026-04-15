// products.js – browse, search, filter, product detail

let currentPage = 1;
let currentFilters = {};

async function loadProducts(page = 1) {
  currentPage = page;
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  const params = new URLSearchParams({ page, ...currentFilters });
  try {
    const data = await apiFetch('/products?' + params.toString());
    renderProductGrid(data.products);
    renderPagination('pagination', data.page, data.pages, loadProducts);
    const info = document.getElementById('results-info');
    if (info) info.textContent = `${data.total} item${data.total !== 1 ? 's' : ''} found`;
  } catch (err) {
    grid.innerHTML = `<p class="error-msg">Failed to load products: ${err.message}</p>`;
  }
}

function renderProductGrid(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:3rem">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(p => {
    const imgHtml = p.thumbnail
      ? `<img class="product-card-img" src="${escHtml(p.thumbnail)}" alt="${escHtml(p.title)}" loading="lazy">`
      : `<div class="product-card-img-placeholder">🖼️</div>`;
    return `
      <div class="product-card" onclick="window.location='/product.html?id=${p.id}'">
        ${imgHtml}
        <div class="product-card-body">
          <div class="product-card-title">${escHtml(p.title)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
          <div class="product-card-meta">
            ${escHtml(p.shop_name || '')}${p.location ? ' · ' + escHtml(p.location) : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}

function applyFilters() {
  const cfg = typeof ORIGINALHUB_CONFIG !== 'undefined' ? ORIGINALHUB_CONFIG : {};
  currentFilters = {};
  const search  = document.getElementById('filter-search')?.value?.trim();
  const category = document.getElementById('filter-category')?.value;
  const minPrice = document.getElementById('filter-min-price')?.value;
  const maxPrice = document.getElementById('filter-max-price')?.value;
  const location = document.getElementById('filter-location')?.value?.trim();

  if (search)   currentFilters.search   = search;
  if (category) currentFilters.category = category;
  if (minPrice) currentFilters.min_price = minPrice;
  if (maxPrice) currentFilters.max_price = maxPrice;
  if (location) currentFilters.location  = location;
  loadProducts(1);
}

// ── Product detail page ──────────────────────────────────────────────────────
async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const p = await apiFetch(`/products/${id}`);
    renderProductDetail(p);
  } catch (err) {
    document.getElementById('product-detail')?.insertAdjacentHTML('beforeend',
      `<p class="error-msg">Product not found or no longer available.</p>`);
  }
}

function renderProductDetail(p) {
  const el = document.getElementById('product-detail');
  if (!el) return;

  const images = p.images || [];
  const mainImg = images[0]?.image_url || '';
  const thumbs = images.map((img, i) =>
    `<img class="gallery-thumb${i === 0 ? ' active' : ''}" src="${escHtml(img.image_url)}" onclick="switchMainImg(this)">`
  ).join('');

  const isFavorited = false;
  const user = Auth.getUser();
  const msgBtn = user
    ? `<button class="btn btn-primary btn-lg" onclick="startChat(${p.seller_user_id}, ${p.id})">💬 Message Seller</button>`
    : `<button class="btn btn-primary btn-lg" onclick="showAuthModal('login')">💬 Message Seller</button>`;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start" class="product-detail-grid">
      <!-- Gallery -->
      <div>
        ${mainImg ? `<img id="main-img" class="gallery-main" src="${escHtml(mainImg)}" alt="${escHtml(p.title)}">` : '<div class="gallery-main" style="background:#f0e8df;display:flex;align-items:center;justify-content:center;font-size:4rem">🖼️</div>'}
        <div class="gallery-thumbs">${thumbs}</div>
      </div>

      <!-- Info -->
      <div>
        <h1 style="margin-bottom:.5rem">${escHtml(p.title)}</h1>
        <div style="font-size:1.8rem;font-weight:700;color:var(--primary);margin-bottom:.5rem">${formatPrice(p.price)}</div>
        <div style="font-size:.9rem;color:var(--text-muted);margin-bottom:1rem">
          Sold by <a href="/seller.html?id=${p.seller_user_id}">${escHtml(p.shop_name)}</a>
          ${p.location ? ' · ' + escHtml(p.location) : ''}
        </div>
        ${p.category ? `<div style="margin-bottom:.75rem"><span class="status-badge" style="background:#f0e8df;color:var(--accent)">${escHtml(p.category)}</span></div>` : ''}

        <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.5rem">
          ${msgBtn}
          <button class="btn btn-outline" id="fav-btn" onclick="toggleFavorite(${p.id})" ${!user ? 'title="Login to save"' : ''}>♡ Save</button>
        </div>

        <div class="card" style="margin-bottom:1rem">
          <div class="card-header">Description</div>
          <div class="card-body" style="white-space:pre-wrap">${escHtml(p.description)}</div>
        </div>
        <div class="card" style="margin-bottom:1rem">
          <div class="card-header">✋ Handmade Proof</div>
          <div class="card-body" style="white-space:pre-wrap">${escHtml(p.handmade_proof_text)}</div>
        </div>
        <details style="margin-bottom:1rem">
          <summary style="cursor:pointer;color:var(--text-muted);font-size:.9rem">Report this listing</summary>
          <div style="margin-top:.75rem">
            <select id="report-reason" class="form-control" style="margin-bottom:.5rem;width:auto">
              <option value="">Select reason…</option>
              <option>Not handmade</option><option>Fake listing</option><option>Spam</option><option>Other</option>
            </select>
            <button class="btn btn-danger btn-sm" onclick="submitReport(${p.id})">Submit Report</button>
          </div>
        </details>
      </div>
    </div>
    <style>
      @media(max-width:700px){.product-detail-grid{grid-template-columns:1fr !important}}
    </style>`;

  // Check favorite state
  if (user) checkFavorite(p.id);
}

function switchMainImg(thumb) {
  document.getElementById('main-img').src = thumb.src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

async function checkFavorite(productId) {
  try {
    const d = await apiFetch(`/buyer/favorites/${productId}/check`);
    const btn = document.getElementById('fav-btn');
    if (btn) btn.textContent = d.favorited ? '♥ Saved' : '♡ Save';
  } catch {}
}

async function toggleFavorite(productId) {
  if (!Auth.isLoggedIn()) { showAuthModal('login'); return; }
  try {
    const d = await apiFetch(`/buyer/favorites/${productId}/check`);
    if (d.favorited) {
      await apiFetch(`/buyer/favorites/${productId}`, { method: 'DELETE' });
      document.getElementById('fav-btn').textContent = '♡ Save';
    } else {
      await apiFetch(`/buyer/favorites/${productId}`, { method: 'POST' });
      document.getElementById('fav-btn').textContent = '♥ Saved';
    }
  } catch (err) { toast(err.message, 'danger'); }
}

async function submitReport(productId) {
  const reason = document.getElementById('report-reason')?.value;
  if (!reason) { toast('Please select a reason', 'warning'); return; }
  if (!Auth.isLoggedIn()) { showAuthModal('login'); return; }
  try {
    await apiFetch('/reports', { method: 'POST', body: JSON.stringify({ product_id: productId, reason }) });
    toast('Report submitted. Thank you.');
  } catch (err) { toast(err.message, 'danger'); }
}

function startChat(sellerId, productId) {
  window.location.href = `/messages.html?product=${productId}&user=${sellerId}`;
}

// ── Category filter pills ─────────────────────────────────────────────────────
function renderCategoryFilter() {
  const el = document.getElementById('category-select');
  if (!el || typeof ORIGINALHUB_CONFIG === 'undefined') return;
  el.innerHTML = '<option value="">All Categories</option>' +
    ORIGINALHUB_CONFIG.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
}
