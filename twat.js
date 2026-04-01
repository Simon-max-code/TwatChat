/* ============================================================
   TwatChat — script.js
   All frontend logic: data, rendering, interactions
   ============================================================ */

'use strict';

// ============================================================
// DUMMY DATA
// ============================================================

const USERS = [
  {
    id: 1,
    name: 'Golden Amu',
    initials: 'GA',
    avatarClass: 'av-0',
    online: true,
    unread: 3,
    lastTime: '10:42',
    messages: [
      { from: 'them', text: 'Hey! Did you check out the new design system?', time: '10:30' },
      { from: 'me',   text: 'Yeah, it\'s looking really clean. Love the token structure.', time: '10:31' },
      { from: 'them', text: 'Right? The dark mode tokens are 🔥', time: '10:33' },
      { from: 'me',   text: 'Sent you the PR link — can you review when you get a chance?', time: '10:35' },
      { from: 'them', text: 'On it. Give me 20 minutes.', time: '10:36' },
      { from: 'them', text: 'Also quick question — are we using Syne for the headings?', time: '10:41' },
      { from: 'them', text: 'Need to update the Figma file if so', time: '10:42' },
    ],
  },
  {
    id: 2,
    name: 'Omni Amu',
    initials: 'OA',
    avatarClass: 'av-1',
    online: true,
    unread: 1,
    lastTime: '09:58',
    messages: [
      { from: 'me',   text: 'Hey, you joining the standup?', time: '09:45' },
      { from: 'them', text: 'Already in. You\'re late 😂', time: '09:46' },
      { from: 'me',   text: 'lmaooo two minutes doesn\'t count', time: '09:47' },
      { from: 'them', text: 'The CI pipeline broke again btw', time: '09:55' },
      { from: 'me',   text: 'Of course it did. Same env issue?', time: '09:56' },
      { from: 'them', text: 'Nah, looks like the Docker image cache got wiped', time: '09:58' },
    ],
  },
  {
    id: 3,
    name: 'Brutally Gay',
    initials: 'BG',
    avatarClass: 'av-2',
    online: false,
    unread: 0,
    lastTime: 'Yesterday',
    messages: [
      { from: 'them', text: 'Can you send me the wireframes when ready?', time: 'Yesterday' },
      { from: 'me',   text: 'Just exported them — check your email!', time: 'Yesterday' },
      { from: 'them', text: 'Got them, thanks! These look amazing 😍', time: 'Yesterday' },
      { from: 'me',   text: 'Glad you like it! Let me know if anything needs tweaking.', time: 'Yesterday' },
      { from: 'them', text: 'The hero section might need a bit more breathing room but otherwise perfect', time: 'Yesterday' },
    ],
  },
  {
    id: 4,
    name: 'Aunty Linda',
    initials: 'AL',
    avatarClass: 'av-3',
    online: true,
    unread: 7,
    lastTime: '11:05',
    messages: [
      { from: 'them', text: 'The client wants a demo by Friday 😬', time: '11:00' },
      { from: 'me',   text: 'That\'s in 3 days... what\'s the scope?', time: '11:01' },
      { from: 'them', text: 'Login flow, dashboard overview, and the reporting module', time: '11:02' },
      { from: 'them', text: 'Basically the whole thing lol', time: '11:02' },
      { from: 'me',   text: 'Ok let\'s triage — what\'s the MVP of the MVP?', time: '11:03' },
      { from: 'them', text: 'Dashboard is the must-have. Rest can be mocked.', time: '11:04' },
      { from: 'them', text: 'Let\'s hop on a call?', time: '11:05' },
    ],
  },
  {
    id: 5,
    name: 'Evil Spawn',
    initials: 'ES',
    avatarClass: 'av-4',
    online: false,
    unread: 0,
    lastTime: 'Mon',
    messages: [
      { from: 'me',   text: 'Did the deployment go through?', time: 'Mon' },
      { from: 'them', text: 'Yep! Prod is green 🟢', time: 'Mon' },
      { from: 'me',   text: 'Smooth! Great work on the migration script.', time: 'Mon' },
      { from: 'them', text: 'Thanks! Couldn\'t have done it without the runbook you wrote', time: 'Mon' },
      { from: 'me',   text: 'Teamwork makes the dream work 🙌', time: 'Mon' },
    ],
  },
  {
    id: 6,
    name: 'Sirsimon',
    initials: 'Ss',
    avatarClass: 'av-5',
    online: true,
    unread: 2,
    lastTime: '08:30',
    messages: [
      { from: 'them', text: 'Morning! Coffee first, then code ☕', time: '08:15' },
      { from: 'me',   text: 'Always. What are you working on today?', time: '08:17' },
      { from: 'them', text: 'Finally tackling that auth refactor. Wish me luck.', time: '08:20' },
      { from: 'me',   text: 'You\'ve got this. The old code was... character-building.', time: '08:22' },
      { from: 'them', text: 'Haha "character-building" is generous', time: '08:25' },
      { from: 'them', text: 'Hey can you review the new token refresh logic later?', time: '08:30' },
    ],
  },
];

// ============================================================
// STATE
// ============================================================

let activeUserId = null;   // ID of currently open chat
let typingTimer   = null;  // Timeout reference for typing simulation

// ============================================================
// DOM REFS
// ============================================================

const chatListEl      = document.getElementById('chatList');
const searchInput     = document.getElementById('searchInput');
const emptyState      = document.getElementById('emptyState');
const activeChat      = document.getElementById('activeChat');
const messagesArea    = document.getElementById('messagesArea');
const chatHeaderAvatar= document.getElementById('chatHeaderAvatar');
const chatHeaderName  = document.getElementById('chatHeaderName');
const chatHeaderStatus= document.getElementById('chatHeaderStatus');
const typingIndicator = document.getElementById('typingIndicator');
const typingName      = document.getElementById('typingName');
const msgInput        = document.getElementById('msgInput');
const sendBtn         = document.getElementById('sendBtn');
const backBtn         = document.getElementById('backBtn');
const sidebar         = document.getElementById('sidebar');
const navTabs         = document.querySelectorAll('.nav-tab');

// ============================================================
// HELPERS
// ============================================================

/** Returns formatted time string (HH:MM) */
function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/** Scroll the messages area to the bottom */
function scrollToBottom(smooth = true) {
  messagesArea.scrollTo({
    top: messagesArea.scrollHeight,
    behavior: smooth ? 'smooth' : 'instant',
  });
}

/** Get user by ID */
function getUserById(id) {
  return USERS.find(u => u.id === id);
}

// ============================================================
// RENDER: SIDEBAR CHAT LIST
// ============================================================

function renderChatList(filter = '') {
  chatListEl.innerHTML = '';
  const lower = filter.toLowerCase();

  const filtered = USERS.filter(u => u.name.toLowerCase().includes(lower));

  if (!filtered.length) {
    chatListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px;">No chats found</p>`;
    return;
  }

  filtered.forEach(user => {
    const lastMsg = user.messages[user.messages.length - 1];
    const preview = lastMsg ? lastMsg.text : 'No messages yet';

    const item = document.createElement('div');
    item.className = 'chat-item' + (user.id === activeUserId ? ' active' : '');
    item.dataset.id = user.id;

    item.innerHTML = `
      <div class="ci-avatar-wrap">
        <div class="ci-avatar ${user.avatarClass}">${user.initials}</div>
        <span class="ci-status ${user.online ? 'online' : 'offline'}"></span>
      </div>
      <div class="ci-content">
        <div class="ci-top">
          <span class="ci-name">${user.name}</span>
          <span class="ci-time">${user.lastTime}</span>
        </div>
        <div class="ci-bottom">
          <span class="ci-preview">${preview}</span>
          ${user.unread > 0 ? `<span class="ci-badge">${user.unread}</span>` : ''}
        </div>
      </div>
    `;

    item.addEventListener('click', () => openChat(user.id));
    chatListEl.appendChild(item);
  });
}

// ============================================================
// RENDER: MESSAGES
// ============================================================

function renderMessages(user) {
  messagesArea.innerHTML = '';

  // Date divider at top
  const divider = document.createElement('div');
  divider.className = 'date-divider';
  divider.innerHTML = '<span>Today</span>';
  messagesArea.appendChild(divider);

  let prevFrom = null;

  user.messages.forEach((msg, idx) => {
    const isGap = prevFrom !== msg.from && idx > 0;
    renderBubble(msg, user, isGap, false);
    prevFrom = msg.from;
  });

  scrollToBottom(false);
}

/**
 * Render a single message bubble into the messages area.
 * @param {object} msg    - { from, text, time }
 * @param {object} user   - the user object (for avatar)
 * @param {boolean} gap   - add gap-above spacing
 * @param {boolean} smooth - smooth scroll
 */
function renderBubble(msg, user, gap = false, smooth = true) {
  const isSent = msg.from === 'me';
  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}${gap ? ' gap-above' : ''}`;

  // Avatar (only shown on received messages; hidden for consecutive)
  const avatarHidden = !gap && !isSent && messagesArea.lastElementChild?.classList.contains('message');
  div.innerHTML = `
    <div class="msg-avatar ${isSent ? 'av-0' : user.avatarClass} ${!isSent && !gap ? 'hidden-avatar' : ''}">
      ${isSent ? 'Y' : user.initials}
    </div>
    <div class="msg-body">
      <div class="msg-bubble">${escapeHTML(msg.text)}</div>
      <span class="msg-time">${msg.time}</span>
    </div>
  `;

  messagesArea.appendChild(div);
  if (smooth) scrollToBottom(true);
}

/** Basic HTML escaping to prevent XSS */
function escapeHTML(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ============================================================
// OPEN CHAT
// ============================================================

function openChat(userId) {
  const user = getUserById(userId);
  if (!user) return;

  // Clear previous typing timer
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');

  activeUserId = userId;

  // Clear unread badge
  user.unread = 0;

  // Update sidebar active state
  renderChatList(searchInput.value);

  // Update chat header
  chatHeaderAvatar.className = `chat-header-avatar ${user.avatarClass}`;
  chatHeaderAvatar.textContent = user.initials;
  chatHeaderName.textContent = user.name;
  chatHeaderStatus.textContent = user.online ? '● Online' : '● Offline';
  chatHeaderStatus.className = 'chat-header-status' + (user.online ? ' is-online' : '');

  // Show chat, hide empty state
  emptyState.classList.add('hidden');
  activeChat.classList.remove('hidden');

  // Render messages
  renderMessages(user);

  // On mobile: slide sidebar away
  sidebar.classList.add('hidden-mobile');

  // Trigger fake typing if user is online
  if (user.online) {
    scheduleFakeReply(user);
  }

  // Focus input
  msgInput.focus();
}

// ============================================================
// SEND MESSAGE
// ============================================================

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || activeUserId === null) return;

  const user = getUserById(activeUserId);
  const msg = { from: 'me', text, time: now() };

  // Push to user's message history
  user.messages.push(msg);
  user.lastTime = now();

  // Determine if gap needed (last msg was from 'them')
  const prevMsg = user.messages[user.messages.length - 2];
  const gap = prevMsg && prevMsg.from !== 'me';

  // Render bubble
  renderBubble(msg, user, gap, true);

  // Update sidebar preview
  renderChatList(searchInput.value);

  // Clear input
  msgInput.value = '';

  // If user is online, simulate reply
  if (user.online) {
    scheduleFakeReply(user);
  }
}

// ============================================================
// FAKE TYPING + AUTO-REPLY SIMULATION
// ============================================================

const FAKE_REPLIES = [
  "Sounds good to me!",
  "Let me check that and get back to you.",
  "Yeah, totally agree on that.",
  "Haha good point 😄",
  "Can we sync on this tomorrow?",
  "That makes sense, I'll take a look.",
  "Nice! Sending over the file now.",
  "Wait, really? That's wild.",
  "On it 👍",
  "I'll ping you when it's done.",
  "Sure, no problem!",
  "Hmm let me think about that…",
  "For sure, sounds like a plan.",
  "Can't right now, in a meeting. BRB.",
  "That's exactly what I was thinking.",
];

function scheduleFakeReply(user) {
  // Only simulate if this user is actively open
  if (user.id !== activeUserId) return;

  clearTimeout(typingTimer);

  // Show typing indicator after a short delay
  const typingDelay = 1200 + Math.random() * 1400;

  typingTimer = setTimeout(() => {
    if (user.id !== activeUserId) return;

    // Show typing
    typingName.textContent = user.name.split(' ')[0];
    typingIndicator.classList.remove('hidden');
    scrollToBottom(true);

    // Send reply after typing duration
    const replyDelay = 1500 + Math.random() * 1500;
    typingTimer = setTimeout(() => {
      if (user.id !== activeUserId) return;

      typingIndicator.classList.add('hidden');

      const replyText = FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
      const replyMsg = { from: 'them', text: replyText, time: now() };
      user.messages.push(replyMsg);
      user.lastTime = now();

      const prevMsg = user.messages[user.messages.length - 2];
      const gap = prevMsg && prevMsg.from !== 'them';

      renderBubble(replyMsg, user, gap, true);
      renderChatList(searchInput.value);

    }, replyDelay);

  }, typingDelay);
}

// ============================================================
// BOTTOM NAV — TAB SWITCHING
// ============================================================
// ── NEW ──
function switchTab(targetViewId, clickedTab) {
  navTabs.forEach(t => t.classList.remove('active'));
  clickedTab.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(targetViewId);
  if (targetView) targetView.classList.add('active');

  // On mobile: if switching AWAY from chats, hide sidebar so the view is reachable
  // If switching TO chats and no chat is open, show sidebar
  if (window.innerWidth <= 680) {
    if (targetViewId !== 'view-chats') {
      sidebar.classList.add('hidden-mobile');
    } else {
      // Only restore sidebar if no chat is actively open
      if (activeUserId === null) {
        sidebar.classList.remove('hidden-mobile');
      }
    }
  }
}
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const viewId = tab.dataset.view;
    switchTab(viewId, tab);
  });
});

// ============================================================
// SIDEBAR SEARCH
// ============================================================

searchInput.addEventListener('input', () => {
  renderChatList(searchInput.value);
});

// ============================================================
// SEND BUTTON + ENTER KEY
// ============================================================

sendBtn.addEventListener('click', sendMessage);

msgInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ============================================================
// BACK BUTTON (mobile)
// ============================================================

backBtn.addEventListener('click', () => {
  sidebar.classList.remove('hidden-mobile');
  activeUserId = null;
  emptyState.classList.remove('hidden');
  activeChat.classList.add('hidden');
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');
  // Deactivate all chat items
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
});

// ============================================================
// INIT
// ============================================================

function init() {
  renderChatList();
}

init();
// ============================================================
// SETTINGS PAGE LOGIC
// ============================================================

// ── Password strength ──────────────────────────────────────

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

function updateStrengthUI(pw) {
  const fill  = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  if (!fill || !label) return;
  if (!pw) { fill.style.width = '0%'; label.textContent = ''; return; }
  const s = calcStrength(pw);
  const pct   = (s / 5) * 100;
  const colors = ['#ef4444','#f97316','#eab308','#22d3a5','#00d4ff'];
  const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
  fill.style.width = pct + '%';
  fill.style.background = colors[Math.min(s - 1, 4)] || '#ef4444';
  label.textContent = pw ? (labels[Math.min(s - 1, 4)] || 'Very weak') : '';
}

const newPwInput = document.getElementById('newPw');
if (newPwInput) {
  newPwInput.addEventListener('input', () => updateStrengthUI(newPwInput.value));
}

// ── Password visibility toggles ───────────────────────────

document.addEventListener('click', e => {
  const btn = e.target.closest('.pw-toggle');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.color = input.type === 'text' ? 'var(--cyan)' : '';
});

// ── Expandable: Change Password ────────────────────────────

const changePassRow  = document.getElementById('changePassRow');
const changePassBody = document.getElementById('changePassBody');

if (changePassRow) {
  changePassRow.addEventListener('click', () => {
    const open = changePassBody.classList.toggle('open');
    changePassRow.classList.toggle('open', open);
    if (!open) resetPasswordForm();
  });
}

function resetPasswordForm() {
  ['currentPw','newPw','confirmPw'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  updateStrengthUI('');
  showInlineToast('', '', false);
}

// ── Save password ──────────────────────────────────────────

const savePwBtn    = document.getElementById('savePwBtn');
const cancelPwBtn  = document.getElementById('cancelPwBtn');

if (savePwBtn) {
  savePwBtn.addEventListener('click', () => {
    const cur  = document.getElementById('currentPw').value;
    const nw   = document.getElementById('newPw').value;
    const conf = document.getElementById('confirmPw').value;

    if (!cur || !nw || !conf) {
      showInlineToast('pwToast', 'Please fill all fields', 'error'); return;
    }
    if (nw !== conf) {
      showInlineToast('pwToast', 'Passwords do not match', 'error'); return;
    }
    if (calcStrength(nw) < 2) {
      showInlineToast('pwToast', 'Password too weak — add numbers & symbols', 'error'); return;
    }
    // Simulate API call
    savePwBtn.textContent = 'Updating…';
    savePwBtn.disabled = true;
    setTimeout(() => {
      savePwBtn.textContent = 'Update Password';
      savePwBtn.disabled = false;
      showInlineToast('pwToast', '✓ Password updated successfully', 'success');
      setTimeout(() => {
        changePassBody.classList.remove('open');
        changePassRow.classList.remove('open');
        resetPasswordForm();
      }, 1600);
    }, 900);
  });
}

if (cancelPwBtn) {
  cancelPwBtn.addEventListener('click', () => {
    changePassBody.classList.remove('open');
    changePassRow.classList.remove('open');
    resetPasswordForm();
  });
}

function showInlineToast(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!msg) { el.classList.add('hidden'); return; }
  el.textContent = msg;
  el.className = 'inline-toast ' + type;
}

// ── Delete Account ─────────────────────────────────────────

const deleteAccountRow = document.getElementById('deleteAccountRow');
const deleteModal      = document.getElementById('deleteModal');
const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

if (deleteAccountRow) {
  deleteAccountRow.addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
    setTimeout(() => document.getElementById('deleteConfirmPw')?.focus(), 200);
  });
}
if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    document.getElementById('deleteConfirmPw').value = '';
  });
}
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', () => {
    const pw = document.getElementById('deleteConfirmPw').value;
    if (!pw) {
      document.getElementById('deleteConfirmPw').focus();
      document.getElementById('deleteConfirmPw').style.borderColor = '#f87171';
      return;
    }
    confirmDeleteBtn.textContent = 'Deleting…';
    confirmDeleteBtn.disabled = true;
    setTimeout(() => {
      deleteModal.classList.add('hidden');
      showGlobalToast('Account deleted — goodbye.', 'error');
      confirmDeleteBtn.textContent = 'Yes, Delete Everything';
      confirmDeleteBtn.disabled = false;
    }, 1200);
  });
}

// Close modal on overlay click
if (deleteModal) {
  deleteModal.addEventListener('click', e => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
      document.getElementById('deleteConfirmPw').value = '';
    }
  });
}

// ── Toggles ────────────────────────────────────────────────

function setupToggle(id, onMsg, offMsg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', () => {
    showGlobalToast(el.checked ? onMsg : offMsg, 'success');
  });
}

setupToggle('notifToggle',      'Notifications enabled',     'Notifications disabled');
setupToggle('onlineStatusToggle','Online status visible',    'Online status hidden');
setupToggle('searchableToggle', 'Searchable by usertag',    'Hidden from search');
setupToggle('hiddenToggle',     'Hidden from discovery',    'Visible in discovery');

// ── Theme switcher ─────────────────────────────────────────

const themeSwitcher  = document.getElementById('themeSwitcher');
const themeSubLabel  = document.getElementById('themeSubLabel');

if (themeSwitcher) {
  themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      themeSwitcher.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.theme;
      themeSubLabel.textContent = t === 'dark' ? 'Dark mode active' : 'Light mode active';
      showGlobalToast(t === 'dark' ? 'Dark theme applied' : 'Light theme applied', 'success');
      // Placeholder: real theme toggle would swap CSS variables
    });
  });
}

// ── Avatar picker ──────────────────────────────────────────

const avatarEditBtn  = document.getElementById('avatarEditBtn');
const avatarModal    = document.getElementById('avatarModal');
const cancelAvatarBtn= document.getElementById('cancelAvatarBtn');
const saveAvatarBtn  = document.getElementById('saveAvatarBtn');
const avatarInput    = document.getElementById('avatarInput');
const settingsAvatar = document.getElementById('settingsAvatar');
const selfAvatar     = document.querySelector('.self-avatar');

let pendingAvatarClass = 'av-0';
let pendingAvatarImg   = null;

if (avatarEditBtn) {
  avatarEditBtn.addEventListener('click', () => {
    avatarModal.classList.remove('hidden');
  });
}

if (avatarModal) {
  avatarModal.querySelectorAll('.ap-option[data-class]').forEach(opt => {
    opt.addEventListener('click', () => {
      avatarModal.querySelectorAll('.ap-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      pendingAvatarClass = opt.dataset.class;
      pendingAvatarImg   = null;
    });
  });

  const uploadBtn = document.getElementById('uploadAvatarBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => avatarInput.click());
  }

  avatarInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingAvatarImg = ev.target.result;
      avatarModal.querySelectorAll('.ap-option').forEach(o => o.classList.remove('active'));
      uploadBtn.classList.add('active');
      const swatch = uploadBtn.querySelector('.ap-swatch');
      swatch.innerHTML = `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    };
    reader.readAsDataURL(file);
  });
}

if (cancelAvatarBtn) {
  cancelAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
}

if (saveAvatarBtn) {
  saveAvatarBtn.addEventListener('click', () => {
    if (pendingAvatarImg) {
      settingsAvatar.innerHTML = `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      if (selfAvatar) { selfAvatar.innerHTML = settingsAvatar.innerHTML; selfAvatar.className = 'user-avatar self-avatar'; }
    } else {
      const cl = ['av-0','av-1','av-2','av-3','av-4','av-5'];
      settingsAvatar.className = `profile-avatar ${pendingAvatarClass}`;
      settingsAvatar.textContent = 'Y';
      if (selfAvatar) { selfAvatar.className = `user-avatar self-avatar ${pendingAvatarClass}`; selfAvatar.textContent = 'Y'; }
    }
    avatarModal.classList.add('hidden');
    showGlobalToast('Avatar updated', 'success');
  });
}

if (avatarModal) {
  avatarModal.addEventListener('click', e => {
    if (e.target === avatarModal) avatarModal.classList.add('hidden');
  });
}

// ── Global toast ───────────────────────────────────────────

let toastTimeout = null;
function showGlobalToast(msg, type = 'success') {
  const el = document.getElementById('globalToast');
  if (!el) return;
  clearTimeout(toastTimeout);
  el.textContent = msg;
  el.className = `global-toast ${type}`;
  toastTimeout = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ── Keyboard: close modals on Escape ──────────────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.getElementById('deleteModal')?.classList.add('hidden');
  document.getElementById('avatarModal')?.classList.add('hidden');
});












// ============================================================
// FRIEND PROFILE MODAL
// ============================================================
 
const profileModal     = document.getElementById('profileModal');
const profileModalBox  = document.getElementById('profileModalBox');
const profileModalClose= document.getElementById('profileModalClose');
const pmAvatar         = document.getElementById('pmAvatar');
const pmAvatarRing     = document.getElementById('pmAvatarRing');
const pmGlow           = document.getElementById('pmGlow');
const profileModalTag  = document.getElementById('profileModalTag');
const pmCopyBtn        = document.getElementById('pmCopyBtn');
const pmCopyLabel      = document.querySelector('.pm-copy-label');
const pmMessageBtn     = document.getElementById('pmMessageBtn');
 
// Glow colours that match each avatar gradient
const GLOW_COLORS = {
  'av-0': '#00d4ff',
  'av-1': '#a855f7',
  'av-2': '#f43f5e',
  'av-3': '#fbbf24',
  'av-4': '#22d3a5',
  'av-5': '#fb923c',
};
 
function openProfileModal(user) {
  // Populate avatar
  pmAvatar.className = `pm-avatar ${user.avatarClass}`;
  pmAvatar.textContent = user.initials;
 
  // Populate usertag
  profileModalTag.textContent = user.usertag;
 
  // Colour the glow to match avatar
  const glowColor = GLOW_COLORS[user.avatarClass] || '#00d4ff';
  pmGlow.style.background = glowColor;
 
  // Wire message button to open chat and close modal
  pmMessageBtn.onclick = () => {
    closeProfileModal();
    // Switch to chats view if not already there
    const chatsTab = document.querySelector('[data-view="view-chats"]');
    if (chatsTab) chatsTab.click();
    // Small delay so view transition completes first
    setTimeout(() => openChat(user.id), 60);
  };
 
  // Reset copy button
  resetCopyBtn();
 
  // Show
  profileModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
 
function closeProfileModal() {
  profileModal.classList.add('hidden');
  document.body.style.overflow = '';
}
 
function resetCopyBtn() {
  if (!pmCopyLabel) return;
  pmCopyLabel.textContent = 'Copy';
  pmCopyBtn.classList.remove('copied');
}
 
// ── Trigger: click on a sidebar avatar ────────────────────
// We delegate from chatList since items are dynamically rendered
chatListEl.addEventListener('click', e => {
  const avatarWrap = e.target.closest('.ci-avatar-wrap');
  if (!avatarWrap) return;
  const chatItem = avatarWrap.closest('.chat-item');
  if (!chatItem) return;
  e.stopPropagation(); // Don't also open the chat
  const user = getUserById(Number(chatItem.dataset.id));
  if (user) openProfileModal(user);
});
 
// ── Trigger: click on the in-chat header avatar ────────────
const chatHeaderAvatarEl = document.getElementById('chatHeaderAvatar');
if (chatHeaderAvatarEl) {
  chatHeaderAvatarEl.addEventListener('click', () => {
    if (activeUserId === null) return;
    const user = getUserById(activeUserId);
    if (user) openProfileModal(user);
  });
  chatHeaderAvatarEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      chatHeaderAvatarEl.click();
    }
  });
}
 
// ── Close: button ──────────────────────────────────────────
if (profileModalClose) {
  profileModalClose.addEventListener('click', closeProfileModal);
}
 
// ── Close: click outside ───────────────────────────────────
if (profileModal) {
  profileModal.addEventListener('click', e => {
    if (e.target === profileModal) closeProfileModal();
  });
}
 
// ── Close: Escape key ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !profileModal.classList.contains('hidden')) {
    closeProfileModal();
  }
});
 
// ── Copy usertag ───────────────────────────────────────────
if (pmCopyBtn) {
  pmCopyBtn.addEventListener('click', () => {
    const tag = profileModalTag.textContent;
    if (!tag) return;
    navigator.clipboard.writeText(tag).then(() => {
      pmCopyLabel.textContent = 'Copied!';
      pmCopyBtn.classList.add('copied');
      setTimeout(resetCopyBtn, 2000);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      pmCopyLabel.textContent = 'Copied!';
      pmCopyBtn.classList.add('copied');
      setTimeout(resetCopyBtn, 2000);
    });
  });
}
 