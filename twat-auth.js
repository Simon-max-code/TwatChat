/* ============================================================
   TwatChat — twat-auth.js
   Frontend-only auth gate
   - localStorage-backed session (persists across browser sessions)
   - Simulated signup/login (no backend)
   - Blocks all nav until authenticated
   - Sign out clears session and brings gate back
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   STORAGE KEYS
   ────────────────────────────────────────────── */
const STORAGE_KEY_USER    = 'twatchat_user';
const STORAGE_KEY_SESSION = 'twatchat_session';

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
  } catch { return null; }
}

function saveSession(token) {
  localStorage.setItem(STORAGE_KEY_SESSION, token);
}

function loadSession() {
  return localStorage.getItem(STORAGE_KEY_SESSION);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

function generateToken(email) {
  // Lightweight fake JWT-ish token — base64 header.payload.sig
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: email, iat: Date.now(), exp: Date.now() + 86400_000 * 30 }));
  const sig     = btoa(email + Date.now()).replace(/=/g, '');
  return `${header}.${payload}.${sig}`;
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
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))       score++;
  if (/[0-9]/.test(pw))       score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/* ──────────────────────────────────────────────
   DOM REFS — Auth Gate
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
const loginForm       = document.getElementById('loginForm');
const loginEmail      = document.getElementById('loginEmail');
const loginPassword   = document.getElementById('loginPassword');
const loginError      = document.getElementById('loginError');
const loginSubmit     = document.getElementById('loginSubmit');
const loginSpinner    = document.getElementById('loginSpinner');
const loginAvatarPreview = document.getElementById('loginAvatarPreview');
const forgotPasswordBtn  = document.getElementById('forgotPasswordBtn');

/* ──────────────────────────────────────────────
   TAB SWITCHING
   ────────────────────────────────────────────── */

let currentAuthForm = 'signup';

function switchAuthTab(target) {
  currentAuthForm = target;

  authTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.form === target));

  if (target === 'login') {
    authTabSlider.classList.add('slide-right');
  } else {
    authTabSlider.classList.remove('slide-right');
  }

  signupForm.classList.toggle('active', target === 'signup');
  loginForm.classList.toggle('active',  target === 'login');

  // Re-trigger animation
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
   PASSWORD VISIBILITY TOGGLES (auth forms)
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
   STRENGTH METER — signup
   ────────────────────────────────────────────── */

signupPassword.addEventListener('input', () => {
  const pw = signupPassword.value;
  if (!pw) {
    signupStrengthFill.style.width = '0%';
    signupStrengthLabel.textContent = '';
    return;
  }
  const s = calcStrengthAuth(pw);
  const pct    = (s / 5) * 100;
  const colors = ['#ef4444','#f97316','#eab308','#22d3a5','#00d4ff'];
  const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
  signupStrengthFill.style.width      = pct + '%';
  signupStrengthFill.style.background = colors[Math.min(s - 1, 4)];
  signupStrengthLabel.textContent     = labels[Math.min(s - 1, 4)];
});

/* ──────────────────────────────────────────────
   LOGIN: live avatar preview from email
   ────────────────────────────────────────────── */

loginEmail.addEventListener('input', () => {
  const email = loginEmail.value.trim();
  const stored = loadUser();

  if (stored && stored.email === email) {
    loginAvatarPreview.className = 'auth-form-hero-avatar has-initial ' + (stored.avatarClass || 'av-0');
    loginAvatarPreview.textContent = stored.initials || '⬡';
  } else {
    loginAvatarPreview.className = 'auth-form-hero-avatar';
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
   SIGNUP SUBMIT
   ────────────────────────────────────────────── */

signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthErrors();

  const firstName  = signupFirstName.value.trim();
  const lastName   = signupLastName.value.trim();
  const email      = signupEmail.value.trim().toLowerCase();
  const phone      = document.getElementById('signupPhone').value.trim();
  const password   = signupPassword.value;
  const confirmPw  = signupConfirmPw.value;
  const termsOk    = signupTerms.checked;

  // Validation
  if (!email) {
    showAuthError(signupError, 'Email address is required.');
    signupEmail.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthError(signupError, 'Please enter a valid email address.');
    signupEmail.focus();
    return;
  }
  if (!password) {
    showAuthError(signupError, 'Password is required.');
    signupPassword.focus();
    return;
  }
  if (calcStrengthAuth(password) < 2) {
    showAuthError(signupError, 'Your password is too weak. Use at least 8 characters with letters and numbers.');
    signupPassword.focus();
    return;
  }
  if (password !== confirmPw) {
    showAuthError(signupError, 'Passwords do not match.');
    signupConfirmPw.focus();
    return;
  }
  if (!termsOk) {
    showAuthError(signupError, 'Please accept the Terms of Service to continue.');
    return;
  }

  // Simulate async call
  setSubmitLoading(signupSubmit, signupSpinner, true);

  await fakeDelay(1200);

  const avatarClass = 'av-0';
  const initials    = getInitials(firstName, lastName);
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

  const user = {
    email,
    phone,
    firstName,
    lastName,
    displayName,
    initials,
    avatarClass,
    createdAt: new Date().toISOString(),
  };

  const token = generateToken(email);
  saveUser(user);
  saveSession(token);

  setSubmitLoading(signupSubmit, signupSpinner, false);

  unlockApp(user, 'Welcome to TwatChat! 🎉');
});

/* ──────────────────────────────────────────────
   LOGIN SUBMIT
   ────────────────────────────────────────────── */

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearAuthErrors();

  const email    = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;
  const remember = document.getElementById('loginRemember').checked;

  if (!email || !password) {
    showAuthError(loginError, 'Please enter your email and password.');
    return;
  }

  setSubmitLoading(loginSubmit, loginSpinner, true);

  await fakeDelay(1000);

  const stored = loadUser();

  if (!stored || stored.email !== email) {
    showAuthError(loginError, 'No account found with that email. Please sign up first.');
    setSubmitLoading(loginSubmit, loginSpinner, false);
    return;
  }

  // Front-end: we don't store the real password (no backend),
  // so accept any non-empty password for demo. In production,
  // this would be a server-side check.
  const token = generateToken(email);
  if (remember) {
    saveSession(token);
  }

  setSubmitLoading(loginSubmit, loginSpinner, false);

  unlockApp(stored, `Welcome back, ${stored.firstName || stored.displayName}!`);
});

/* ──────────────────────────────────────────────
   FORGOT PASSWORD
   ────────────────────────────────────────────── */

forgotPasswordBtn.addEventListener('click', () => {
  // For a frontend-only demo, just show a toast
  if (typeof showGlobalToast === 'function') {
    showGlobalToast('Password reset link sent to your email ✓', 'success');
  }
});

/* ──────────────────────────────────────────────
   UI HELPERS
   ────────────────────────────────────────────── */

function fakeDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
   NAV GUARD — block tab switching before auth
   ────────────────────────────────────────────── */

function installNavGuard() {
  const navTabEls = document.querySelectorAll('.nav-tab');

  navTabEls.forEach(tab => {
    tab.addEventListener('click', e => {
      // If auth gate is visible, intercept — but allow (it handles itself)
      if (!authGate.classList.contains('hidden')) {
        e.stopImmediatePropagation();
        // Shake the panel to hint the user
        shakePanelHint();
      }
    }, true); // capture phase — runs before twat.js handlers
  });
}

function shakePanelHint() {
  authPanel.style.animation = 'none';
  requestAnimationFrame(() => {
    authPanel.style.animation = 'authShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
  });
}

/* Shake keyframe injected dynamically */
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
  // Animate gate out
  authGate.classList.add('auth-gate--exit');

  setTimeout(() => {
    authGate.classList.add('hidden');
    authGate.classList.remove('auth-gate--exit');

    // Populate UI with user data
    applyUserToUI(user);

    // Reveal app
    document.body.classList.add('app-unlocked');

    if (typeof showGlobalToast === 'function') {
      setTimeout(() => showGlobalToast(toastMsg, 'success'), 200);
    }
  }, 520);
}

/* ──────────────────────────────────────────────
   APPLY USER DATA TO APP UI
   ────────────────────────────────────────────── */

function applyUserToUI(user) {
  const initials    = user.initials || 'U';
  const displayName = user.displayName || user.email;
  const avatarClass = user.avatarClass || 'av-0';
  const tag         = '@' + (user.firstName || displayName).toLowerCase().replace(/\s+/g, '');

  // Topbar
  const topbarAvatar = document.getElementById('topbarAvatar');
  const topbarName   = document.getElementById('topbarName');
  if (topbarAvatar) {
    topbarAvatar.textContent = initials;
    topbarAvatar.className   = `user-avatar self-avatar ${avatarClass}`;
  }
  if (topbarName) topbarName.textContent = displayName;

  // Settings page profile card
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

  // Reset forms
  signupForm.reset();
  loginForm.reset();
  signupStrengthFill.style.width = '0%';
  signupStrengthLabel.textContent = '';
  loginAvatarPreview.className = 'auth-form-hero-avatar';
  loginAvatarPreview.textContent = '⬡';
  clearAuthErrors();
  switchAuthTab('signup');

  // Check if a user exists to decide which form to show
  const stored = loadUser();
  if (stored) switchAuthTab('login');

  authGate.classList.remove('hidden');
  authGate.classList.remove('auth-gate--exit');
}

// Wire up sign-out row in settings
const signOutRow = document.getElementById('signOutRow');
if (signOutRow) {
  signOutRow.addEventListener('click', signOut);
}

/* ──────────────────────────────────────────────
   INIT — check session on page load
   ────────────────────────────────────────────── */

function authInit() {
  installNavGuard();

  const session = loadSession();
  const user    = loadUser();

  if (session && user) {
    // Already logged in — skip gate
    authGate.classList.add('hidden');
    applyUserToUI(user);
    document.body.classList.add('app-unlocked');
    return;
  }

  // First visit or logged out — show gate
  // If a user account exists but no session, go to login tab
  if (user && !session) {
    switchAuthTab('login');
  } else {
    switchAuthTab('signup');
  }
}

authInit();