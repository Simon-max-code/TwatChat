/* ============================================================
   TwatChat — twat-auth.js
   Real auth — connected to Render backend
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   STORAGE KEYS
   ────────────────────────────────────────────── */
const STORAGE_KEY_TOKEN = 'twatchat_token';
const STORAGE_KEY_USER  = 'twatchat_user';

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
  } catch { return null; }
}

function loadToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName  || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f)      return f.slice(0, 2).toUpperCase();
  return 'U';
}

function calcStrengthAuth(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/* ──────────────────────────────────────────────
   DOM REFS
   ────────────────────────────────────────────── */

const authGate         = document.getElementById('authGate');
const authPanel        = document.getElementById('authPanel');
const authTabBtns      = document.querySelectorAll('.auth-tab');
const authTabSlider    = document.getElementById('authTabSlider');

// Signup
const signupForm          = document.getElementById('signupForm');
const signupFirstName     = document.getElementById('signupFirstName');
const signupLastName      = document.getElementById('signupLastName');
const signupEmail         = document.getElementById('signupEmail');
const signupPassword      = document.getElementById('signupPassword');
const signupConfirmPw     = document.getElementById('signupConfirmPassword');
const signupTerms         = document.getElementById('signupTerms');
const signupError         = document.getElementById('signupError');
const signupSubmit        = document.getElementById('signupSubmit');
const signupSpinner       = document.getElementById('signupSpinner');
const signupStrengthFill  = document.getElementById('signupStrengthFill');
const signupStrengthLabel = document.getElementById('signupStrengthLabel');

// Login
const loginForm          = document.getElementById('loginForm');
const loginEmail         = document.getElementById('loginEmail');
const loginPassword      = document.getElementById('loginPassword');
const loginError         = document.getElementById('loginError');
const loginSubmit        = document.getElementById('loginSubmit');
const loginSpinner       = document.getElementById('loginSpinner');
const loginAvatarPreview = document.getElementById('loginAvatarPreview');
const forgotPasswordBtn  = document.getElementById('forgotPasswordBtn');

/* ──────────────────────────────────────────────
   TAB SWITCHING
   ────────────────────────────────────────────── */

let currentAuthForm = 'signup';

function switchAuthTab(target) {
  currentAuthForm = target;
  authTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.form === target));
  authTabSlider.classList.toggle('slide-right', target === 'login');
  signupForm.classList.toggle('active', target === 'signup');
  loginForm.classList.toggle('active',  target === 'login');
  const form = target === 'signup' ? signupForm : loginForm;
  form.style.animation = 'none';
  requestAnimationFrame(() => { form.style.animation = ''; });
  clearAuthErrors();
}

authTabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchAuthTab(btn.dataset.form));
});

document.querySelectorAll('.auth-switch-btn').forEach(btn => {
  btn.addEventListener('click', () => switchAuthTab(btn.dataset.switch));
});

/* ──────────────────────────────────────────────
   PASSWORD VISIBILITY TOGGLES
   ────────────────────────────────────────────── */

document.addEventListener('click', e => {
  const btn = e.target.closest('.auth-pw-toggle');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.color = input.type === 'text' ? 'var(--cyan)' : '';
});

/* ──────────────────────────────────────────────
   STRENGTH METER
   ────────────────────────────────────────────── */

signupPassword.addEventListener('input', () => {
  const pw = signupPassword.value;
  if (!pw) {
    signupStrengthFill.style.width = '0%';
    signupStrengthLabel.textContent = '';
    return;
  }
  const s      = calcStrengthAuth(pw);
  const pct    = (s / 5) * 100;
  const colors = ['#ef4444','#f97316','#eab308','#22d3a5','#00d4ff'];
  const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
  signupStrengthFill.style.width      = pct + '%';
  signupStrengthFill.style.background = colors[Math.min(s - 1, 4)];
  signupStrengthLabel.textContent     = labels[Math.min(s - 1, 4)];
});

/* ──────────────────────────────────────────────
   LOGIN: live avatar preview
   ────────────────────────────────────────────── */

loginEmail.addEventListener('input', () => {
  const email  = loginEmail.value.trim();
  const stored = loadUser();
  if (stored && stored.email === email) {
    loginAvatarPreview.className  = 'auth-form-hero-avatar has-initial ' + (stored.avatarClass || 'av-0');
    loginAvatarPreview.textContent = stored.initials || '⬡';
  } else {
    loginAvatarPreview.className  = 'auth-form-hero-avatar';
    loginAvatarPreview.textContent = '⬡';
  }
});

/* ──────────────────────────────────────────────
   ERROR HELPERS
   ────────────────────────────────────────────── */

function showAuthError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAuthErrors() {
  signupError.classList.add('hidden');
  loginError.classList.add('hidden');
}

/* ──────────────────────────────────────────────
   UI HELPERS
   ────────────────────────────────────────────── */

function setSubmitLoading(btn, spinner, loading) {
  btn.disabled = loading;
  const text = btn.querySelector('.auth-submit-text');
  if (loading) {
    text.style.opacity = '0.5';
    spinner.classList.remove('hidden');
  } else {
    text.style.opacity = '';
    spinner.classList.add('hidden');
  }
}

/* ──────────────────────────────────────────────
   SIGNUP SUBMIT — hits real API
   ────────────────────────────────────────────── */

signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthErrors();

  const firstName = signupFirstName.value.trim();
  const lastName  = signupLastName.value.trim();
  const email     = signupEmail.value.trim().toLowerCase();
  const phone     = document.getElementById('signupPhone').value.trim();
  const password  = signupPassword.value;
  const confirmPw = signupConfirmPw.value;
  const termsOk   = signupTerms.checked;

  // Client-side validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthError(signupError, 'Please enter a valid email address.');
    return;
  }
  if (!password) {
    showAuthError(signupError, 'Password is required.');
    return;
  }
  if (calcStrengthAuth(password) < 2) {
    showAuthError(signupError, 'Your password is too weak. Use at least 8 characters with letters and numbers.');
    return;
  }
  if (password !== confirmPw) {
    showAuthError(signupError, 'Passwords do not match.');
    return;
  }
  if (!termsOk) {
    showAuthError(signupError, 'Please accept the Terms of Service to continue.');
    return;
  }

  setSubmitLoading(signupSubmit, signupSpinner, true);

  try {
    // ── Hit real API ──────────────────────────────────────
    const data = await authAPI.register({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    saveSession(data.token, data.user);
    unlockApp(data.user, 'Welcome to TwatChat! 🎉');

  } catch (err) {
    showAuthError(signupError, err.message || 'Registration failed. Please try again.');
  } finally {
    setSubmitLoading(signupSubmit, signupSpinner, false);
  }
});

/* ──────────────────────────────────────────────
   LOGIN SUBMIT — hits real API
   ────────────────────────────────────────────── */

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthErrors();

  const email    = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  if (!email || !password) {
    showAuthError(loginError, 'Please enter your email and password.');
    return;
  }

  setSubmitLoading(loginSubmit, loginSpinner, true);

  try {
    // ── Hit real API ──────────────────────────────────────
    const data = await authAPI.login({ email, password });

    saveSession(data.token, data.user);
    unlockApp(data.user, `Welcome back, ${data.user.firstName || data.user.displayName}!`);

  } catch (err) {
    showAuthError(loginError, err.message || 'Login failed. Please try again.');
  } finally {
    setSubmitLoading(loginSubmit, loginSpinner, false);
  }
});

/* ──────────────────────────────────────────────
   FORGOT PASSWORD
   ────────────────────────────────────────────── */

forgotPasswordBtn.addEventListener('click', () => {
  if (typeof showGlobalToast === 'function') {
    showGlobalToast('Password reset coming soon', 'success');
  }
});

/* ──────────────────────────────────────────────
   NAV GUARD
   ────────────────────────────────────────────── */

function installNavGuard() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      if (!authGate.classList.contains('hidden')) {
        e.stopImmediatePropagation();
        shakePanelHint();
      }
    }, true);
  });
}

function shakePanelHint() {
  authPanel.style.animation = 'none';
  requestAnimationFrame(() => {
    authPanel.style.animation = 'authShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
  });
}

(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes authShake {
      0%, 100% { transform: translateX(0); }
      15%       { transform: translateX(-8px); }
      30%       { transform: translateX(7px); }
      45%       { transform: translateX(-5px); }
      60%       { transform: translateX(4px); }
      75%       { transform: translateX(-2px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────
   UNLOCK APP
   ────────────────────────────────────────────── */

function unlockApp(user, toastMsg) {
  authGate.classList.add('auth-gate--exit');
  setTimeout(() => {
    authGate.classList.add('hidden');
    authGate.classList.remove('auth-gate--exit');
    applyUserToUI(user);
    document.body.classList.add('app-unlocked');
    if (typeof showGlobalToast === 'function') {
      setTimeout(() => showGlobalToast(toastMsg, 'success'), 200);
    }
  }, 520);
}

/* ──────────────────────────────────────────────
   APPLY USER DATA TO UI
   ────────────────────────────────────────────── */

function applyUserToUI(user) {
  const initials    = user.initials    || getInitials(user.firstName, user.lastName);
  const displayName = user.displayName || user.email;
  const avatarClass = user.avatarClass || 'av-0';
  const tag         = '@' + (user.firstName || displayName).toLowerCase().replace(/\s+/g, '');

  const topbarAvatar = document.getElementById('topbarAvatar');
  const topbarName   = document.getElementById('topbarName');
  if (topbarAvatar) {
    topbarAvatar.textContent = initials;
    topbarAvatar.className   = `user-avatar self-avatar ${avatarClass}`;
  }
  if (topbarName) topbarName.textContent = displayName;

  const settingsAv = document.getElementById('settingsAvatar');
  if (settingsAv) {
    settingsAv.textContent = initials;
    settingsAv.className   = `profile-avatar ${avatarClass}`;
  }

  const profileDisplayName = document.getElementById('profileDisplayName');
  if (profileDisplayName) profileDisplayName.textContent = tag;

  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) profileEmail.textContent = user.email;
}

/* ──────────────────────────────────────────────
   SIGN OUT
   ────────────────────────────────────────────── */

function signOut() {
  clearSession();
  document.body.classList.remove('app-unlocked');
  signupForm.reset();
  loginForm.reset();
  signupStrengthFill.style.width  = '0%';
  signupStrengthLabel.textContent = '';
  loginAvatarPreview.className    = 'auth-form-hero-avatar';
  loginAvatarPreview.textContent  = '⬡';
  clearAuthErrors();

  const stored = loadUser();
  switchAuthTab(stored ? 'login' : 'signup');

  authGate.classList.remove('hidden');
  authGate.classList.remove('auth-gate--exit');
}

const signOutRow = document.getElementById('signOutRow');
if (signOutRow) signOutRow.addEventListener('click', signOut);

/* ──────────────────────────────────────────────
   INIT — check token on page load
   ────────────────────────────────────────────── */

async function authInit() {
  installNavGuard();

  const token = loadToken();
  const user  = loadUser();

  if (token && user) {
    // Verify token is still valid with backend
    try {
      const data = await authAPI.getMe();
      // Token valid — update stored user with fresh data
      saveSession(token, data.user);
      authGate.classList.add('hidden');
      applyUserToUI(data.user);
      document.body.classList.add('app-unlocked');
    } catch (err) {
      // Token expired or invalid — force re-login
      clearSession();
      switchAuthTab('login');
    }
    return;
  }

  // No session — show correct tab
  switchAuthTab(user ? 'login' : 'signup');
}

authInit();