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
              <div id="reg-error" class="error-msg"></div>
              <button type="submit" class="btn btn-primary" style="width:100%">Create Account</button>
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

async function submitRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';
  const res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name: document.getElementById('reg-name').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value }),
  });
  const data = await res.json();
  if (!res.ok) { errEl.textContent = data.error || 'Registration failed'; return; }
  Auth.setSession(data.token, data.user);
  closeAuthModal();
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
