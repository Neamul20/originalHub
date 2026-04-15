// auth.js – token management and auth state helpers
const AUTH_KEY = 'oh_token';
const USER_KEY = 'oh_user';

const Auth = {
  getToken() { return localStorage.getItem(AUTH_KEY); },
  getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.getToken(); },
  isRole(...roles) { const u = this.getUser(); return u && roles.includes(u.role); },

  setSession(token, user) {
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  authHeader() {
    const t = this.getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  },

  async fetchMe() {
    if (!this.isLoggedIn()) return null;
    try {
      const res = await api('/auth/me');
      const user = await res.json();
      if (res.ok) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
      this.clearSession();
      return null;
    } catch { return null; }
  },
};

// ── Login modal ─────────────────────────────────────────────────────────────
function showAuthModal(tab = 'login') {
  let modal = document.getElementById('auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span id="auth-modal-title">Login</span>
          <button class="modal-close" onclick="closeAuthModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <button class="tab-btn" data-tab="login" onclick="switchAuthTab('login')">Login</button>
            <button class="tab-btn" data-tab="register" onclick="switchAuthTab('register')">Register</button>
            <button class="tab-btn" data-tab="forgot" onclick="switchAuthTab('forgot')">Forgot Password</button>
          </div>

          <!-- Login -->
          <div class="tab-panel" id="auth-tab-login">
            <form onsubmit="submitLogin(event)">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="login-email" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="login-password" required>
              </div>
              <div id="login-error" class="error-msg"></div>
              <button type="submit" class="btn btn-primary" style="width:100%">Login</button>
            </form>
          </div>

          <!-- Register -->
          <div class="tab-panel" id="auth-tab-register">
            <form onsubmit="submitRegister(event)">
              <div class="form-group">
                <label>I want to join as</label>
                <div style="display:flex;gap:.75rem;margin-top:.25rem">
                  <label style="flex:1;cursor:pointer">
                    <input type="radio" name="reg-role" id="reg-role-buyer" value="buyer" checked onchange="toggleSellerFields()" style="margin-right:.4rem">
                    <strong>Buyer</strong> – browse &amp; buy
                  </label>
                  <label style="flex:1;cursor:pointer">
                    <input type="radio" name="reg-role" id="reg-role-seller" value="seller" onchange="toggleSellerFields()" style="margin-right:.4rem">
                    <strong>Seller</strong> – sell handmade
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="reg-name" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="reg-email" required>
              </div>
              <div class="form-group">
                <label>Password <span class="form-hint">(min 8 characters)</span></label>
                <input type="password" id="reg-password" required minlength="8">
              </div>
              <!-- Seller-only fields -->
              <div id="seller-reg-fields" style="display:none">
                <div class="form-group">
                  <label>Shop Name</label>
                  <input type="text" id="reg-shop-name" maxlength="100">
                </div>
                <div class="form-group">
                  <label>Bio <span class="form-hint">(tell buyers about yourself)</span></label>
                  <textarea id="reg-bio" rows="2"></textarea>
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input type="text" id="reg-location">
                </div>
                <div class="form-group">
                  <label>Handmade Promise <span class="form-hint">(describe what you make)</span></label>
                  <textarea id="reg-handmade-promise" rows="2"></textarea>
                </div>
                <div class="alert alert-warning" style="font-size:.82rem;padding:.5rem .75rem;margin-bottom:.5rem">
                  Your seller account will be reviewed by an admin before you can list products.
                </div>
              </div>
              <div id="reg-error" class="error-msg"></div>
              <button type="submit" class="btn btn-primary" style="width:100%" id="reg-submit-btn">Create Account</button>
            </form>
          </div>

          <!-- Forgot Password -->
          <div class="tab-panel" id="auth-tab-forgot">
            <form onsubmit="submitForgot(event)">
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="forgot-email" required>
              </div>
              <div id="forgot-msg" class="alert" style="display:none"></div>
              <button type="submit" class="btn btn-primary" style="width:100%">Send Reset Link</button>
            </form>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.classList.remove('hidden');
  switchAuthTab(tab);
}

function closeAuthModal() {
  const m = document.getElementById('auth-modal');
  if (m) m.classList.add('hidden');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('[id^="auth-tab-"]').forEach(p => {
    p.classList.toggle('active', p.id === `auth-tab-${tab}`);
  });
  document.getElementById('auth-modal-title').textContent =
    tab === 'login' ? 'Login' : tab === 'register' ? 'Create Account' : 'Forgot Password';
}

async function submitLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: document.getElementById('login-email').value, password: document.getElementById('login-password').value }),
  });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.error || 'Login failed'; return; }
  Auth.setSession(data.token, data.user);
  closeAuthModal();
  window.location.reload();
}

function toggleSellerFields() {
  const isSeller = document.getElementById('reg-role-seller')?.checked;
  const fields = document.getElementById('seller-reg-fields');
  const btn = document.getElementById('reg-submit-btn');
  if (fields) fields.style.display = isSeller ? '' : 'none';
  if (btn) btn.textContent = isSeller ? 'Apply as Seller' : 'Create Account';

  const shopInput = document.getElementById('reg-shop-name');
  const promiseInput = document.getElementById('reg-handmade-promise');
  if (shopInput) shopInput.required = isSeller;
  if (promiseInput) promiseInput.required = isSeller;
}

async function submitRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';
  const isSeller = document.getElementById('reg-role-seller')?.checked;

  const body = {
    full_name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
  };

  if (isSeller) {
    body.intent = 'seller';
    body.shop_name = document.getElementById('reg-shop-name').value;
    body.bio = document.getElementById('reg-bio').value;
    body.location = document.getElementById('reg-location').value;
    body.handmade_promise = document.getElementById('reg-handmade-promise').value;
  }

  const res = await api('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.error || 'Registration failed'; return; }
  Auth.setSession(data.token, data.user);
  closeAuthModal();
  if (isSeller) {
    toast('Account created! Your seller application is under review.');
  }
  window.location.reload();
}

async function submitForgot(e) {
  e.preventDefault();
  const msgEl = document.getElementById('forgot-msg');
  msgEl.style.display = 'none';
  const res = await api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: document.getElementById('forgot-email').value }),
  });
  const data = await res.json();
  msgEl.className = 'alert alert-' + (res.ok ? 'success' : 'danger');
  msgEl.textContent = data.message || data.error;
  msgEl.style.display = '';
}
