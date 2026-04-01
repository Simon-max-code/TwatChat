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

function switchTab(targetViewId, clickedTab) {
  // Update nav tabs
  navTabs.forEach(t => t.classList.remove('active'));
  clickedTab.classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(targetViewId);
  if (targetView) targetView.classList.add('active');
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