/* ============================================================
   TwatChat — script.js
   All frontend logic: data, rendering, interactions
   Group chat support fully integrated
   ============================================================ */

'use strict';

const bottomNav = document.querySelector('.bottom-nav');

function hideNav() {
  if (!bottomNav) return;
  if (window.innerWidth > 680) return;
  bottomNav.style.transform = 'translateX(-50%) translateY(calc(100% + 26px))';
  bottomNav.style.opacity = '0';
  bottomNav.style.pointerEvents = 'none';
}

function showNav() {
  if (!bottomNav) return;
  bottomNav.style.transform = 'translateX(-50%) translateY(0)';
  bottomNav.style.opacity = '1';
  bottomNav.style.pointerEvents = '';
}


// ============================================================
// DUMMY DATA — USERS
// ============================================================

const USERS = [
  {
    id: 1,
    name: 'Golden Amu',
    usertag: '@goldenamu',
    initials: 'GA',
    avatarClass: 'av-0',
    online: true,
    unread: 3,
    lastTime: '10:42',
    muted: false,
    blocked: false,
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
    usertag: '@omniamu',
    initials: 'OA',
    avatarClass: 'av-1',
    online: true,
    unread: 1,
    lastTime: '09:58',
    muted: false,
    blocked: false,
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
    usertag: '@brutallygay',
    initials: 'BG',
    avatarClass: 'av-2',
    online: false,
    unread: 0,
    lastTime: 'Yesterday',
    muted: false,
    blocked: false,
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
    usertag: '@auntylinda',
    initials: 'AL',
    avatarClass: 'av-3',
    online: true,
    unread: 7,
    lastTime: '11:05',
    muted: false,
    blocked: false,
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
    usertag: '@evilspawn',
    initials: 'ES',
    avatarClass: 'av-4',
    online: false,
    unread: 0,
    lastTime: 'Mon',
    muted: false,
    blocked: false,
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
    usertag: '@sirsimon',
    initials: 'Ss',
    avatarClass: 'av-5',
    online: true,
    unread: 2,
    lastTime: '08:30',
    muted: false,
    blocked: false,
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
// DUMMY DATA — GROUPS
// ============================================================

let groupIdCounter = 100;

const GROUPS = [
  {
    id: 101,
    type: 'group',
    name: 'Design Squad',
    icon: '🎨',
    memberIds: [1, 2, 3],
    unread: 4,
    lastTime: '11:20',
    messages: [
      { senderId: 1, senderName: 'Golden Amu', text: 'Morning team! Ready for the design review?', time: '09:00' },
      { senderId: 2, senderName: 'Omni Amu',   text: 'Let\'s go! I have my slides ready.', time: '09:02' },
      { senderId: 'me', senderName: 'You',     text: 'Same. Sharing screen in 2 mins', time: '09:03' },
      { senderId: 3, senderName: 'Brutally Gay', text: 'The new button system looks incredible btw', time: '11:15' },
      { senderId: 1, senderName: 'Golden Amu', text: 'Right?! The hover states finally feel alive', time: '11:18' },
      { senderId: 2, senderName: 'Omni Amu',   text: 'Can we ship this week or do we need another review cycle?', time: '11:20' },
    ],
  },
  {
    id: 102,
    type: 'group',
    name: 'Backend Nerds',
    icon: '⚡',
    memberIds: [2, 5, 6],
    unread: 1,
    lastTime: '10:05',
    messages: [
      { senderId: 5, senderName: 'Evil Spawn',  text: 'Prod deployment done. Zero issues 🎉', time: '09:50' },
      { senderId: 'me', senderName: 'You',      text: 'Incredible. Who reviewed the DB migration?', time: '09:52' },
      { senderId: 6, senderName: 'Sirsimon',    text: 'I did, ran it against staging twice', time: '09:55' },
      { senderId: 2, senderName: 'Omni Amu',    text: 'The cache TTL change made a huge diff on latency', time: '10:05' },
    ],
  },
  {
    id: 103,
    type: 'group',
    name: 'The Chaos Crew',
    icon: '🔥',
    memberIds: [1, 3, 4, 6],
    unread: 0,
    lastTime: 'Yesterday',
    messages: [
      { senderId: 4, senderName: 'Aunty Linda', text: 'GUYS. The client just moved the deadline to MONDAY', time: 'Yesterday' },
      { senderId: 1, senderName: 'Golden Amu',  text: '😭😭😭', time: 'Yesterday' },
      { senderId: 3, senderName: 'Brutally Gay', text: 'I\'m crying', time: 'Yesterday' },
      { senderId: 'me', senderName: 'You',      text: 'Ok everyone breathe. We\'ve done worse before.', time: 'Yesterday' },
      { senderId: 6, senderName: 'Sirsimon',    text: 'True. We shipped the whole dashboard in a weekend once', time: 'Yesterday' },
      { senderId: 4, senderName: 'Aunty Linda', text: 'Fine. Let\'s do it. Calling an emergency session at 6pm', time: 'Yesterday' },
    ],
  },
];

// ============================================================
// STATE
// ============================================================

let activeUserId   = null;
let activeGroupId  = null;
let activeSidebarTab = 'dms';
let typingTimer    = null;
let selectedGroupIcon = '🚀';
let selectedMemberIds = new Set();

// ============================================================
// DOM REFS
// ============================================================

const chatListEl       = document.getElementById('chatList');
const groupListEl      = document.getElementById('groupList');
const searchInput      = document.getElementById('searchInput');
const emptyState       = document.getElementById('emptyState');
const activeChat       = document.getElementById('activeChat');
const messagesArea     = document.getElementById('messagesArea');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderGroupAvatar = document.getElementById('chatHeaderGroupAvatar');
const chatHeaderGroupAvatarInner = document.getElementById('chatHeaderGroupAvatarInner');
const chatHeaderName   = document.getElementById('chatHeaderName');
const chatHeaderStatus = document.getElementById('chatHeaderStatus');
const typingIndicator  = document.getElementById('typingIndicator');
const typingName       = document.getElementById('typingName');
const msgInput         = document.getElementById('msgInput');
const sendBtn          = document.getElementById('sendBtn');
const backBtn          = document.getElementById('backBtn');
const sidebar          = document.getElementById('sidebar');
const navTabs          = document.querySelectorAll('.nav-tab');
const groupInfoBtn     = document.getElementById('groupInfoBtn');

// Sidebar tabs
const tabDMs     = document.getElementById('tabDMs');
const tabGroups  = document.getElementById('tabGroups');
const newGroupBtn = document.getElementById('newGroupBtn');

// ============================================================
// HELPERS
// ============================================================

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function scrollToBottom(smooth = true) {
  messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}

function getUserById(id) {
  return USERS.find(u => u.id === id);
}

function getGroupById(id) {
  return GROUPS.find(g => g.id === id);
}

function escapeHTML(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ============================================================
// SIDEBAR TABS
// ============================================================

function switchSidebarTab(tab) {
  activeSidebarTab = tab;
  tabDMs.classList.toggle('active', tab === 'dms');
  tabGroups.classList.toggle('active', tab === 'groups');
  chatListEl.classList.toggle('hidden', tab !== 'dms');
  groupListEl.classList.toggle('hidden', tab !== 'groups');
  newGroupBtn.style.opacity = tab === 'groups' ? '1' : '0.4';
  newGroupBtn.style.pointerEvents = tab === 'groups' ? 'all' : 'none';
}

tabDMs.addEventListener('click', () => switchSidebarTab('dms'));
tabGroups.addEventListener('click', () => switchSidebarTab('groups'));

// ============================================================
// RENDER: DM CHAT LIST
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

    // Visual indicators for muted / blocked users
    const muteTag  = user.muted   ? `<span style="font-size:10px;color:var(--text-muted);margin-left:4px;">🔕</span>` : '';
    const blockTag = user.blocked ? `<span style="font-size:10px;color:#f87171;margin-left:4px;">🚫</span>` : '';

    item.innerHTML = `
      <div class="ci-avatar-wrap">
        <div class="ci-avatar ${user.avatarClass}">${user.initials}</div>
        <span class="ci-status ${user.online && !user.blocked ? 'online' : 'offline'}"></span>
      </div>
      <div class="ci-content">
        <div class="ci-top">
          <span class="ci-name">${user.name}${muteTag}${blockTag}</span>
          <span class="ci-time">${user.lastTime}</span>
        </div>
        <div class="ci-bottom">
          <span class="ci-preview">${user.blocked ? 'You blocked this user' : preview}</span>
          ${user.unread > 0 && !user.muted ? `<span class="ci-badge">${user.unread}</span>` : ''}
        </div>
      </div>
    `;
    item.addEventListener('click', () => openChat(user.id));
    chatListEl.appendChild(item);
  });
}

// ============================================================
// RENDER: GROUP LIST
// ============================================================

function renderGroupList(filter = '') {
  groupListEl.innerHTML = '';
  const lower = filter.toLowerCase();
  const filtered = GROUPS.filter(g => g.name.toLowerCase().includes(lower));

  if (!filtered.length) {
    groupListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px;">No groups yet</p>`;
    return;
  }

  filtered.forEach(group => {
    const lastMsg = group.messages[group.messages.length - 1];
    const preview = lastMsg ? `${lastMsg.senderId === 'me' ? 'You' : lastMsg.senderName.split(' ')[0]}: ${lastMsg.text}` : 'No messages yet';
    const memberAvatars = buildGroupAvatarMini(group, 'sm');

    const item = document.createElement('div');
    item.className = 'chat-item group-chat-item' + (group.id === activeGroupId ? ' active' : '');
    item.dataset.gid = group.id;
    item.innerHTML = `
      <div class="ci-avatar-wrap">
        <div class="group-avatar-stack sm">${memberAvatars}</div>
        <span class="group-icon-badge">${group.icon}</span>
      </div>
      <div class="ci-content">
        <div class="ci-top">
          <span class="ci-name">${escapeHTML(group.name)}</span>
          <span class="ci-time">${group.lastTime}</span>
        </div>
        <div class="ci-bottom">
          <span class="ci-preview">${escapeHTML(preview)}</span>
          ${group.unread > 0 ? `<span class="ci-badge">${group.unread}</span>` : ''}
        </div>
      </div>
    `;
    item.addEventListener('click', () => openGroupChat(group.id));
    groupListEl.appendChild(item);
  });
}

// Build the stacked avatar HTML for a group
function buildGroupAvatarMini(group, size = 'sm') {
  const members = group.memberIds.slice(0, 3).map(id => getUserById(id)).filter(Boolean);
  return members.map((u, i) =>
    `<div class="gam-avatar ${u.avatarClass}" style="z-index:${3-i}">${u.initials}</div>`
  ).join('');
}

// ============================================================
// OPEN DM CHAT
// ============================================================

function openChat(userId) {
  const user = getUserById(userId);
  if (!user) return;

  closeChatContextMenu();
  closeMsgSearchBar();
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');

  activeUserId  = userId;
  activeGroupId = null;

  user.unread = 0;

  renderChatList(searchInput.value);

  // Header — DM mode
  chatHeaderAvatar.className = `chat-header-avatar ${user.avatarClass}`;
  chatHeaderAvatar.textContent = user.initials;
  chatHeaderAvatar.classList.remove('hidden');
  chatHeaderGroupAvatar.classList.add('hidden');

  chatHeaderName.textContent = user.name;
  chatHeaderStatus.textContent = user.online ? '● Online' : '● Offline';
  chatHeaderStatus.className = 'chat-header-status' + (user.online ? ' is-online' : '');

  groupInfoBtn.classList.add('hidden');

  // Show / hide the 3-dot menu button (only for DMs)
  moreOptionsBtn.classList.remove('hidden');
  // Reset menu button state
  moreOptionsBtn.classList.remove('menu-open');

  emptyState.classList.add('hidden');
  activeChat.classList.remove('hidden');

  renderMessages(user);

  sidebar.classList.add('hidden-mobile');

  if (user.online && !user.blocked) scheduleFakeReply(user);

   hideNav();
  msgInput.focus();
}

// ============================================================
// OPEN GROUP CHAT
// ============================================================

function openGroupChat(groupId) {
  const group = getGroupById(groupId);
  if (!group) return;

  closeChatContextMenu();
  closeMsgSearchBar();
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');

  activeGroupId = groupId;
  activeUserId  = null;

  group.unread = 0;

  renderGroupList(searchInput.value);

  // Header — Group mode
  chatHeaderAvatar.classList.add('hidden');
  chatHeaderGroupAvatar.classList.remove('hidden');
  chatHeaderGroupAvatarInner.innerHTML = buildGroupAvatarMini(group, 'hdr');
  chatHeaderGroupAvatarInner.className = 'group-avatar-stack hdr';

  chatHeaderName.textContent = `${group.icon} ${group.name}`;
  const memberCount = group.memberIds.length + 1;
  chatHeaderStatus.textContent = `${memberCount} members`;
  chatHeaderStatus.className = 'chat-header-status';

  groupInfoBtn.classList.remove('hidden');

  // Hide 3-dot menu for groups (not required by spec)
  moreOptionsBtn.classList.add('hidden');
  moreOptionsBtn.classList.remove('menu-open');

  emptyState.classList.add('hidden');
  activeChat.classList.remove('hidden');

  renderGroupMessages(group);

  sidebar.classList.add('hidden-mobile');

  scheduleGroupFakeReply(group);

  hideNav();
  msgInput.focus();
}

// ============================================================
// RENDER DM MESSAGES
// ============================================================

function renderMessages(user) {
  messagesArea.innerHTML = '';

  // Blocked overlay
  const overlay = document.createElement('div');
  overlay.className = 'blocked-overlay' + (user.blocked ? ' visible' : '');
  overlay.innerHTML = `
    <div class="blocked-overlay-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    </div>
    <h4>User Blocked</h4>
    <p>You've blocked ${escapeHTML(user.name)}.<br/>Unblock from the ⋯ menu to resume messaging.</p>
  `;
  messagesArea.appendChild(overlay);

  if (!user.blocked) {
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
  }

  scrollToBottom(false);

  // Input disabled state for blocked users
  updateInputBlockedState(user);
}

function updateInputBlockedState(user) {
  const isBlocked = user && user.blocked;
  msgInput.disabled      = isBlocked;
  sendBtn.disabled       = isBlocked;
  msgInput.placeholder   = isBlocked ? 'You blocked this user' : 'Type a message…';
  msgInput.style.opacity = isBlocked ? '0.4' : '1';
  sendBtn.style.opacity  = isBlocked ? '0.3' : '1';
}

function renderBubble(msg, user, gap = false, smooth = true) {
  const isSent = msg.from === 'me';
  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}${gap ? ' gap-above' : ''}`;
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

// ============================================================
// RENDER GROUP MESSAGES
// ============================================================

function renderGroupMessages(group) {
  messagesArea.innerHTML = '';
  const divider = document.createElement('div');
  divider.className = 'date-divider';
  divider.innerHTML = '<span>Today</span>';
  messagesArea.appendChild(divider);

  let prevSender = null;
  group.messages.forEach((msg, idx) => {
    const isGap = prevSender !== msg.senderId && idx > 0;
    renderGroupBubble(msg, group, isGap, false);
    prevSender = msg.senderId;
  });
  scrollToBottom(false);
}

function renderGroupBubble(msg, group, gap = false, smooth = true) {
  const isSent = msg.senderId === 'me';
  const sender = isSent ? null : getUserById(msg.senderId);

  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}${gap ? ' gap-above' : ''}`;

  let avatarHTML = '';
  let senderNameHTML = '';

  if (!isSent) {
    const avatarClass = sender ? sender.avatarClass : 'av-0';
    const initials = sender ? sender.initials : msg.senderName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const hidden = !gap ? 'hidden-avatar' : '';
    avatarHTML = `<div class="msg-avatar ${avatarClass} ${hidden}">${initials}</div>`;
    if (gap) {
      senderNameHTML = `<span class="msg-sender-name">${escapeHTML(msg.senderName)}</span>`;
    }
  }

  div.innerHTML = `
    ${avatarHTML}
    <div class="msg-body">
      ${senderNameHTML}
      <div class="msg-bubble">${escapeHTML(msg.text)}</div>
      <span class="msg-time">${msg.time}</span>
    </div>
  `;

  if (!isSent) {
    const avatarEl = div.querySelector('.msg-avatar:not(.hidden-avatar)');
    if (avatarEl && sender) {
      avatarEl.style.cursor = 'pointer';
      avatarEl.title = sender.name;
      avatarEl.addEventListener('click', () => openProfileModal(sender));
    }
  }

  messagesArea.appendChild(div);
  if (smooth) scrollToBottom(true);
}

// ============================================================
// SEND MESSAGE
// ============================================================

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  if (activeUserId !== null) {
    sendDMMessage(text);
  } else if (activeGroupId !== null) {
    sendGroupMessage(text);
  }
}

function sendDMMessage(text) {
  const user = getUserById(activeUserId);
  if (!user || user.blocked) return;

  const msg = { from: 'me', text, time: now() };
  user.messages.push(msg);
  user.lastTime = now();

  const prevMsg = user.messages[user.messages.length - 2];
  const gap = prevMsg && prevMsg.from !== 'me';

  renderBubble(msg, user, gap, true);
  renderChatList(searchInput.value);
  msgInput.value = '';

  if (user.online) scheduleFakeReply(user);
}

function sendGroupMessage(text) {
  const group = getGroupById(activeGroupId);
  const msg = { senderId: 'me', senderName: 'You', text, time: now() };
  group.messages.push(msg);
  group.lastTime = now();

  const prevMsg = group.messages[group.messages.length - 2];
  const gap = prevMsg && prevMsg.senderId !== 'me';

  renderGroupBubble(msg, group, gap, true);
  renderGroupList(searchInput.value);
  msgInput.value = '';

  scheduleGroupFakeReply(group);
}

// ============================================================
// FAKE TYPING + AUTO-REPLY — DM
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

const GROUP_REPLIES = [
  "100% agree with that approach",
  "Let's ship it 🚀",
  "Good call, I'll update the doc",
  "lol same tbh",
  "Anyone else seeing this issue?",
  "Just pushed the fix btw",
  "OK let me check the logs real quick",
  "This looks way better now",
  "Can someone review when free?",
  "Yep that's on me, fixing now",
  "Ngl this is the best one yet",
  "Wait what happened to staging??",
];

function scheduleFakeReply(user) {
  if (user.id !== activeUserId) return;
  if (user.blocked) return;
  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    if (user.id !== activeUserId) return;
    typingName.textContent = user.name.split(' ')[0];
    typingIndicator.classList.remove('hidden');
    scrollToBottom(true);

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

      // If muted, don't show unread badge
      if (!user.muted) {
        // unread already incremented via data; sidebar re-render handles badge
      }
    }, 1500 + Math.random() * 1500);

  }, 1200 + Math.random() * 1400);
}

function scheduleGroupFakeReply(group) {
  if (group.id !== activeGroupId) return;
  clearTimeout(typingTimer);

  const onlineMembers = group.memberIds.map(id => getUserById(id)).filter(u => u && u.online);
  if (!onlineMembers.length) return;

  const randomMember = onlineMembers[Math.floor(Math.random() * onlineMembers.length)];

  typingTimer = setTimeout(() => {
    if (group.id !== activeGroupId) return;
    typingName.textContent = randomMember.name.split(' ')[0];
    typingIndicator.classList.remove('hidden');
    scrollToBottom(true);

    typingTimer = setTimeout(() => {
      if (group.id !== activeGroupId) return;
      typingIndicator.classList.add('hidden');

      const replyText = GROUP_REPLIES[Math.floor(Math.random() * GROUP_REPLIES.length)];
      const replyMsg = {
        senderId: randomMember.id,
        senderName: randomMember.name,
        text: replyText,
        time: now(),
      };
      group.messages.push(replyMsg);
      group.lastTime = now();

      const prevMsg = group.messages[group.messages.length - 2];
      const gap = prevMsg && prevMsg.senderId !== randomMember.id;

      renderGroupBubble(replyMsg, group, gap, true);
      renderGroupList(searchInput.value);
    }, 1400 + Math.random() * 1600);

  }, 1400 + Math.random() * 1600);
}

// ============================================================
// BOTTOM NAV — TAB SWITCHING
// ============================================================

function switchTab(targetViewId, clickedTab) {
  navTabs.forEach(t => t.classList.remove('active'));
  clickedTab.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(targetViewId);
  if (targetView) targetView.classList.add('active');

  if (window.innerWidth <= 680) {
    if (targetViewId !== 'view-chats') {
      sidebar.classList.add('hidden-mobile');
    } else {
      if (activeUserId === null && activeGroupId === null) {
        sidebar.classList.remove('hidden-mobile');
      }
    }
  }
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.view, tab));
});

// ============================================================
// SIDEBAR SEARCH
// ============================================================

searchInput.addEventListener('input', () => {
  if (activeSidebarTab === 'dms') {
    renderChatList(searchInput.value);
  } else {
    renderGroupList(searchInput.value);
  }
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
   showNav();
  sidebar.classList.remove('hidden-mobile');
  activeUserId  = null;
  activeGroupId = null;
  emptyState.classList.remove('hidden');
  activeChat.classList.add('hidden');
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');
  closeChatContextMenu();
  closeMsgSearchBar();
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
});

// ============================================================
// GROUP INFO BUTTON
// ============================================================

groupInfoBtn.addEventListener('click', () => {
  const group = getGroupById(activeGroupId);
  if (group) openGroupInfoModal(group);
});

// ============================================================
// NEW GROUP MODAL
// ============================================================

const newGroupModal     = document.getElementById('newGroupModal');
const newGroupName      = document.getElementById('newGroupName');
const groupIconPicker   = document.getElementById('groupIconPicker');
const memberSelector    = document.getElementById('memberSelector');
const selectedMembersEl = document.getElementById('selectedMembers');
const cancelNewGroupBtn = document.getElementById('cancelNewGroupBtn');
const createGroupBtn    = document.getElementById('createGroupBtn');

function openNewGroupModal() {
  newGroupName.value = '';
  selectedGroupIcon = '🚀';
  selectedMemberIds = new Set();

  groupIconPicker.querySelectorAll('.gip-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.icon === '🚀');
  });

  memberSelector.innerHTML = '';
  USERS.forEach(user => {
    const chip = document.createElement('button');
    chip.className = 'member-chip';
    chip.dataset.uid = user.id;
    chip.innerHTML = `
      <div class="mc-avatar ${user.avatarClass}">${user.initials}</div>
      <span>${user.name.split(' ')[0]}</span>
    `;
    chip.addEventListener('click', () => toggleMember(user.id, chip));
    memberSelector.appendChild(chip);
  });

  renderSelectedMembers();
  newGroupModal.classList.remove('hidden');
  setTimeout(() => newGroupName.focus(), 100);
}

function closeNewGroupModal() {
  newGroupModal.classList.add('hidden');
}

function toggleMember(uid, chipEl) {
  if (selectedMemberIds.has(uid)) {
    selectedMemberIds.delete(uid);
    chipEl.classList.remove('selected');
  } else {
    selectedMemberIds.add(uid);
    chipEl.classList.add('selected');
  }
  renderSelectedMembers();
}

function renderSelectedMembers() {
  selectedMembersEl.innerHTML = '';
  selectedMemberIds.forEach(uid => {
    const user = getUserById(uid);
    if (!user) return;
    const tag = document.createElement('div');
    tag.className = 'sm-tag';
    tag.innerHTML = `
      <div class="sm-avatar ${user.avatarClass}">${user.initials}</div>
      <span>${user.name.split(' ')[0]}</span>
      <button class="sm-remove" data-uid="${uid}">×</button>
    `;
    tag.querySelector('.sm-remove').addEventListener('click', () => {
      selectedMemberIds.delete(uid);
      const chip = memberSelector.querySelector(`[data-uid="${uid}"]`);
      if (chip) chip.classList.remove('selected');
      renderSelectedMembers();
    });
    selectedMembersEl.appendChild(tag);
  });
}

groupIconPicker.addEventListener('click', e => {
  const btn = e.target.closest('.gip-btn');
  if (!btn) return;
  groupIconPicker.querySelectorAll('.gip-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedGroupIcon = btn.dataset.icon;
});

cancelNewGroupBtn.addEventListener('click', closeNewGroupModal);
newGroupModal.addEventListener('click', e => {
  if (e.target === newGroupModal) closeNewGroupModal();
});

createGroupBtn.addEventListener('click', () => {
  const name = newGroupName.value.trim();
  if (!name) {
    newGroupName.style.borderColor = '#f87171';
    newGroupName.focus();
    setTimeout(() => newGroupName.style.borderColor = '', 1200);
    return;
  }
  if (selectedMemberIds.size === 0) {
    showGlobalToast('Add at least one member', 'error');
    return;
  }

  const newGroup = {
    id: ++groupIdCounter,
    type: 'group',
    name,
    icon: selectedGroupIcon,
    memberIds: [...selectedMemberIds],
    unread: 0,
    lastTime: now(),
    messages: [
      {
        senderId: 'me',
        senderName: 'You',
        text: `${selectedGroupIcon} Group created! Welcome everyone.`,
        time: now(),
      }
    ],
  };

  GROUPS.unshift(newGroup);
  closeNewGroupModal();
  showGlobalToast(`"${name}" created`, 'success');

  switchSidebarTab('groups');
  renderGroupList();
  openGroupChat(newGroup.id);
});

newGroupBtn.addEventListener('click', openNewGroupModal);

// ============================================================
// GROUP INFO MODAL
// ============================================================

const groupInfoModal = document.getElementById('groupInfoModal');
const groupInfoClose = document.getElementById('groupInfoClose');
const giAvatar       = document.getElementById('giAvatar');
const giGlow         = document.getElementById('giGlow');
const giName         = document.getElementById('giName');
const giMeta         = document.getElementById('giMeta');
const giMembers      = document.getElementById('giMembers');
const giLeaveBtn     = document.getElementById('giLeaveBtn');

const GI_GLOW_COLORS = ['#00d4ff','#a855f7','#f43f5e','#fbbf24','#22d3a5','#fb923c'];

function openGroupInfoModal(group) {
  giAvatar.innerHTML = buildGroupAvatarMini(group, 'lg');
  giAvatar.className = 'gi-avatar group-avatar-stack lg';
  giAvatar.innerHTML += `<span class="gi-icon-badge">${group.icon}</span>`;

  const glowColor = GI_GLOW_COLORS[group.id % GI_GLOW_COLORS.length];
  giGlow.style.background = glowColor;

  giName.textContent = `${group.icon} ${group.name}`;
  giMeta.textContent = `${group.memberIds.length + 1} members · Created by You`;

  giMembers.innerHTML = '';
  const youRow = document.createElement('div');
  youRow.className = 'gi-member-row';
  youRow.innerHTML = `
    <div class="gi-member-avatar av-0">Y</div>
    <div class="gi-member-info">
      <span class="gi-member-name">You</span>
      <span class="gi-member-tag" style="color:var(--cyan)">@you · Admin</span>
    </div>
    <span class="gi-online-dot online"></span>
  `;
  giMembers.appendChild(youRow);

  group.memberIds.forEach(uid => {
    const user = getUserById(uid);
    if (!user) return;
    const row = document.createElement('div');
    row.className = 'gi-member-row';
    row.innerHTML = `
      <div class="gi-member-avatar ${user.avatarClass}">${user.initials}</div>
      <div class="gi-member-info">
        <span class="gi-member-name">${user.name}</span>
        <span class="gi-member-tag">${user.usertag || '@' + user.name.toLowerCase().replace(' ','')}</span>
      </div>
      <span class="gi-online-dot ${user.online ? 'online' : 'offline'}"></span>
    `;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      closeGroupInfoModal();
      openProfileModal(user);
    });
    giMembers.appendChild(row);
  });

  groupInfoModal.classList.remove('hidden');
}

function closeGroupInfoModal() {
  groupInfoModal.classList.add('hidden');
}

groupInfoClose.addEventListener('click', closeGroupInfoModal);
groupInfoModal.addEventListener('click', e => {
  if (e.target === groupInfoModal) closeGroupInfoModal();
});

giLeaveBtn.addEventListener('click', () => {
  const group = getGroupById(activeGroupId);
  if (!group) return;
  const idx = GROUPS.indexOf(group);
  if (idx > -1) GROUPS.splice(idx, 1);
  closeGroupInfoModal();
  renderGroupList();
  activeGroupId = null;
  emptyState.classList.remove('hidden');
  activeChat.classList.add('hidden');
  showNav();
  showGlobalToast(`Left "${group.name}"`, 'error');
});

// ============================================================
// SETTINGS PAGE LOGIC
// ============================================================

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
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
if (newPwInput) newPwInput.addEventListener('input', () => updateStrengthUI(newPwInput.value));

document.addEventListener('click', e => {
  const btn = e.target.closest('.pw-toggle');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.color = input.type === 'text' ? 'var(--cyan)' : '';
});

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

const savePwBtn   = document.getElementById('savePwBtn');
const cancelPwBtn = document.getElementById('cancelPwBtn');

if (savePwBtn) {
  savePwBtn.addEventListener('click', () => {
    const cur  = document.getElementById('currentPw').value;
    const nw   = document.getElementById('newPw').value;
    const conf = document.getElementById('confirmPw').value;
    if (!cur || !nw || !conf) { showInlineToast('pwToast', 'Please fill all fields', 'error'); return; }
    if (nw !== conf)          { showInlineToast('pwToast', 'Passwords do not match', 'error'); return; }
    if (calcStrength(nw) < 2) { showInlineToast('pwToast', 'Password too weak', 'error'); return; }
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

// Delete account
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

if (deleteModal) {
  deleteModal.addEventListener('click', e => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
      document.getElementById('deleteConfirmPw').value = '';
    }
  });
}

// Toggles
function setupToggle(id, onMsg, offMsg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', () => showGlobalToast(el.checked ? onMsg : offMsg, 'success'));
}
setupToggle('notifToggle',       'Notifications enabled',  'Notifications disabled');
setupToggle('onlineStatusToggle','Online status visible',  'Online status hidden');
setupToggle('searchableToggle',  'Searchable by usertag', 'Hidden from search');
setupToggle('hiddenToggle',      'Hidden from discovery', 'Visible in discovery');

// Theme
const themeSwitcher = document.getElementById('themeSwitcher');
const themeSubLabel = document.getElementById('themeSubLabel');
if (themeSwitcher) {
  themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      themeSwitcher.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.theme;
      themeSubLabel.textContent = t === 'dark' ? 'Dark mode active' : 'Light mode active';
      showGlobalToast(t === 'dark' ? 'Dark theme applied' : 'Light theme applied', 'success');
    });
  });
}

// Avatar picker
const avatarEditBtn   = document.getElementById('avatarEditBtn');
const avatarModal     = document.getElementById('avatarModal');
const cancelAvatarBtn = document.getElementById('cancelAvatarBtn');
const saveAvatarBtn   = document.getElementById('saveAvatarBtn');
const avatarInput     = document.getElementById('avatarInput');
const settingsAvatar  = document.getElementById('settingsAvatar');
const selfAvatar      = document.querySelector('.self-avatar');

let pendingAvatarClass = 'av-0';
let pendingAvatarImg   = null;

if (avatarEditBtn) avatarEditBtn.addEventListener('click', () => avatarModal.classList.remove('hidden'));

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
  if (uploadBtn) uploadBtn.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingAvatarImg = ev.target.result;
      avatarModal.querySelectorAll('.ap-option').forEach(o => o.classList.remove('active'));
      uploadBtn.classList.add('active');
      uploadBtn.querySelector('.ap-swatch').innerHTML = `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    };
    reader.readAsDataURL(file);
  });
}

if (cancelAvatarBtn) cancelAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));

if (saveAvatarBtn) {
  saveAvatarBtn.addEventListener('click', () => {
    if (pendingAvatarImg) {
      settingsAvatar.innerHTML = `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      if (selfAvatar) { selfAvatar.innerHTML = settingsAvatar.innerHTML; selfAvatar.className = 'user-avatar self-avatar'; }
    } else {
      settingsAvatar.className = `profile-avatar ${pendingAvatarClass}`;
      settingsAvatar.textContent = 'Y';
      if (selfAvatar) { selfAvatar.className = `user-avatar self-avatar ${pendingAvatarClass}`; selfAvatar.textContent = 'Y'; }
    }
    avatarModal.classList.add('hidden');
    showGlobalToast('Avatar updated', 'success');
  });
}

if (avatarModal) avatarModal.addEventListener('click', e => { if (e.target === avatarModal) avatarModal.classList.add('hidden'); });

// ============================================================
// GLOBAL TOAST
// ============================================================

let toastTimeout = null;
function showGlobalToast(msg, type = 'success') {
  const el = document.getElementById('globalToast');
  if (!el) return;
  clearTimeout(toastTimeout);
  el.textContent = msg;
  el.className = `global-toast ${type}`;
  toastTimeout = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ============================================================
// KEYBOARD: close modals on Escape
// ============================================================

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.getElementById('deleteModal')?.classList.add('hidden');
  document.getElementById('avatarModal')?.classList.add('hidden');
  document.getElementById('profileModal')?.classList.add('hidden');
  closeNewGroupModal();
  closeGroupInfoModal();
  closeChatContextMenu();
  closeMsgSearchBar();
});

// ============================================================
// FRIEND PROFILE MODAL
// ============================================================

const profileModal      = document.getElementById('profileModal');
const profileModalClose = document.getElementById('profileModalClose');
const pmAvatar          = document.getElementById('pmAvatar');
const pmGlow            = document.getElementById('pmGlow');
const profileModalTag   = document.getElementById('profileModalTag');
const pmCopyBtn         = document.getElementById('pmCopyBtn');
const pmCopyLabel       = document.querySelector('.pm-copy-label');
const pmMessageBtn      = document.getElementById('pmMessageBtn');

const GLOW_COLORS = {
  'av-0': '#00d4ff', 'av-1': '#a855f7', 'av-2': '#f43f5e',
  'av-3': '#fbbf24', 'av-4': '#22d3a5', 'av-5': '#fb923c',
};

function openProfileModal(user) {
  pmAvatar.className = `pm-avatar ${user.avatarClass}`;
  pmAvatar.textContent = user.initials;
  profileModalTag.textContent = user.usertag || '@' + user.name.toLowerCase().replace(' ','');
  pmGlow.style.background = GLOW_COLORS[user.avatarClass] || '#00d4ff';

  pmMessageBtn.onclick = () => {
    closeProfileModal();
    const chatsTab = document.querySelector('[data-view="view-chats"]');
    if (chatsTab) chatsTab.click();
    switchSidebarTab('dms');
    setTimeout(() => openChat(user.id), 60);
  };

  resetCopyBtn();
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

// Delegate: click on sidebar DM avatar
chatListEl.addEventListener('click', e => {
  const avatarWrap = e.target.closest('.ci-avatar-wrap');
  if (!avatarWrap) return;
  const chatItem = avatarWrap.closest('.chat-item');
  if (!chatItem || chatItem.classList.contains('group-chat-item')) return;
  e.stopPropagation();
  const user = getUserById(Number(chatItem.dataset.id));
  if (user) openProfileModal(user);
});

// In-chat header avatar (DM only)
const chatHeaderAvatarEl = document.getElementById('chatHeaderAvatar');
if (chatHeaderAvatarEl) {
  chatHeaderAvatarEl.addEventListener('click', () => {
    if (activeUserId === null) return;
    const user = getUserById(activeUserId);
    if (user) openProfileModal(user);
  });
  chatHeaderAvatarEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chatHeaderAvatarEl.click(); }
  });
}

if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
if (profileModal)      profileModal.addEventListener('click', e => { if (e.target === profileModal) closeProfileModal(); });

if (pmCopyBtn) {
  pmCopyBtn.addEventListener('click', () => {
    const tag = profileModalTag.textContent;
    if (!tag) return;
    navigator.clipboard.writeText(tag).catch(() => {}).finally(() => {
      pmCopyLabel.textContent = 'Copied!';
      pmCopyBtn.classList.add('copied');
      setTimeout(resetCopyBtn, 2000);
    });
  });
}

// ============================================================
// ============================================================
// 3-DOT CONTEXT MENU — DM CHATS
// ============================================================
// ============================================================

// ── DOM: locate the existing "More options" button and wrap it ──
// The button is the last .hdr-btn inside .chat-header-actions.
// We wrap it in a .hdr-menu-wrap div so the dropdown anchors to it.

const chatHeaderActions = document.querySelector('.chat-header-actions');

// Create the wrapper
const menuWrap = document.createElement('div');
menuWrap.className = 'hdr-menu-wrap';

// Grab the existing 3-dot button (last hdr-btn child of actions)
const moreOptionsBtn = chatHeaderActions.querySelector('.hdr-btn[title="More options"]');
chatHeaderActions.removeChild(moreOptionsBtn);
menuWrap.appendChild(moreOptionsBtn);

// Build the dropdown
const contextMenu = document.createElement('div');
contextMenu.className = 'chat-context-menu hidden';
contextMenu.id = 'chatContextMenu';
contextMenu.innerHTML = `
  <!-- ① Search Messages (inline search bar) -->
  <div class="ccm-item" id="ccmSearch">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    Search Messages
  </div>

  <div class="ccm-divider"></div>

  <!-- ② Mute Notifications -->
  <div class="ccm-item" id="ccmMute">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    Mute Notifications
    <span class="ccm-badge" id="ccmMuteBadge">Off</span>
  </div>

  <div class="ccm-divider"></div>

  <!-- ③ Block User -->
  <div class="ccm-item" id="ccmBlock">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
    Block User
    <span class="ccm-badge" id="ccmBlockBadge">Off</span>
  </div>

  <div class="ccm-divider"></div>

  <!-- ④ Clear Chat -->
  <div class="ccm-item danger" id="ccmClear">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
    Clear Chat
  </div>

  <!-- ⑤ Delete Chat -->
  <div class="ccm-item danger" id="ccmDelete">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="18" y1="9" x2="6" y2="9"/>
    </svg>
    Delete Chat
  </div>
`;

menuWrap.appendChild(contextMenu);
chatHeaderActions.insertBefore(menuWrap, chatHeaderActions.firstChild);

// ── In-chat message search bar (injected below the chat header) ──
const msgSearchBar = document.createElement('div');
msgSearchBar.className = 'msg-search-bar';
msgSearchBar.id = 'msgSearchBar';
msgSearchBar.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
  <input type="text" class="msg-search-bar-input" id="msgSearchInput" placeholder="Search in conversation…" autocomplete="off" />
  <span class="msg-search-count-label" id="msgSearchCountLabel"></span>
  <div class="msg-search-nav">
    <button class="msg-search-nav-btn" id="msgSearchPrev" title="Previous">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button class="msg-search-nav-btn" id="msgSearchNext" title="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  </div>
  <button class="msg-search-close" id="msgSearchClose" title="Close search">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
`;

// Insert after the chat header (first child of activeChat)
const chatHeader = document.getElementById('chatHeader');
chatHeader.insertAdjacentElement('afterend', msgSearchBar);

// ── Search state ──
let msgSearchMatches = [];   // DOM .message elements that matched
let msgSearchCursor  = -1;   // current highlighted index

const msgSearchInput      = document.getElementById('msgSearchInput');
const msgSearchCountLabel = document.getElementById('msgSearchCountLabel');
const msgSearchPrev       = document.getElementById('msgSearchPrev');
const msgSearchNext       = document.getElementById('msgSearchNext');
const msgSearchClose      = document.getElementById('msgSearchClose');

// ── Open/Close helpers ──

function openChatContextMenu() {
  const user = getUserById(activeUserId);
  if (!user) return;

  // Sync toggle badges
  const muteBadge  = document.getElementById('ccmMuteBadge');
  const blockBadge = document.getElementById('ccmBlockBadge');

  muteBadge.textContent  = user.muted   ? 'On'  : 'Off';
  muteBadge.className    = 'ccm-badge'  + (user.muted   ? ' active'       : '');
  blockBadge.textContent = user.blocked ? 'On'  : 'Off';
  blockBadge.className   = 'ccm-badge'  + (user.blocked ? ' danger-active' : '');

  // Update block item label dynamically
  document.getElementById('ccmBlock').childNodes[2].textContent =
    user.blocked ? 'Unblock User' : 'Block User';

  contextMenu.classList.remove('hidden');
  moreOptionsBtn.classList.add('menu-open');
}

function closeChatContextMenu() {
  contextMenu.classList.add('hidden');
  moreOptionsBtn.classList.remove('menu-open');
}

function closeMsgSearchBar() {
  msgSearchBar.classList.remove('visible');
  msgSearchInput.value = '';
  clearMsgSearchHighlights();
  msgSearchMatches = [];
  msgSearchCursor  = -1;
  msgSearchCountLabel.textContent = '';
}

// ── Toggle the menu on 3-dot click ──
moreOptionsBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (activeUserId === null) return; // only for DMs
  const isOpen = !contextMenu.classList.contains('hidden');
  if (isOpen) {
    closeChatContextMenu();
  } else {
    openChatContextMenu();
  }
});

// ── Close on outside click ──
document.addEventListener('click', e => {
  if (!contextMenu.classList.contains('hidden') && !menuWrap.contains(e.target)) {
    closeChatContextMenu();
  }
});

// ============================================================
// MENU ACTION: ① Search Messages
// ============================================================

document.getElementById('ccmSearch').addEventListener('click', () => {
  closeChatContextMenu();
  msgSearchBar.classList.add('visible');
  setTimeout(() => msgSearchInput.focus(), 60);
});

// Live search as user types
msgSearchInput.addEventListener('input', () => {
  runMsgSearch(msgSearchInput.value.trim());
});

msgSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (e.shiftKey) {
      navigateMsgSearch(-1);
    } else {
      navigateMsgSearch(1);
    }
  }
  if (e.key === 'Escape') closeMsgSearchBar();
});

msgSearchPrev.addEventListener('click', () => navigateMsgSearch(-1));
msgSearchNext.addEventListener('click', () => navigateMsgSearch(1));
msgSearchClose.addEventListener('click', closeMsgSearchBar);

/**
 * Searches all rendered .msg-bubble elements for the query string.
 * Hides non-matching messages, highlights matches, scrolls to first.
 */
function runMsgSearch(query) {
  clearMsgSearchHighlights();
  msgSearchMatches = [];
  msgSearchCursor  = -1;

  if (!query) {
    msgSearchCountLabel.textContent = '';
    return;
  }

  const lower = query.toLowerCase();
  const messages = messagesArea.querySelectorAll('.message');

  messages.forEach(msgEl => {
    const bubble = msgEl.querySelector('.msg-bubble');
    if (!bubble) return;
    const text = bubble.textContent || '';

    if (text.toLowerCase().includes(lower)) {
      msgEl.classList.remove('search-hidden');
      msgEl.classList.add('search-match');
      // Highlight matching text
      bubble.innerHTML = highlightText(escapeHTML(text), escapeHTML(query));
      msgSearchMatches.push(msgEl);
    } else {
      msgEl.classList.add('search-hidden');
      msgEl.classList.remove('search-match');
    }
  });

  if (msgSearchMatches.length) {
    msgSearchCursor = 0;
    scrollToMatch(0);
    updateSearchCountLabel();
  } else {
    msgSearchCountLabel.textContent = 'No results';
  }
}

/**
 * Wraps matched text in <mark> tags for highlighting.
 */
function highlightText(safeText, safeQuery) {
  // Case-insensitive replace on the safe (HTML-escaped) text
  const regex = new RegExp(safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return safeText.replace(regex, m => `<mark>${m}</mark>`);
}

function clearMsgSearchHighlights() {
  messagesArea.querySelectorAll('.message').forEach(msgEl => {
    msgEl.classList.remove('search-hidden', 'search-match');
    const bubble = msgEl.querySelector('.msg-bubble');
    if (bubble && bubble.querySelector('mark')) {
      // Re-render plain text (strip marks)
      bubble.innerHTML = bubble.textContent || '';
    }
  });
}

function navigateMsgSearch(direction) {
  if (!msgSearchMatches.length) return;
  msgSearchCursor = (msgSearchCursor + direction + msgSearchMatches.length) % msgSearchMatches.length;
  scrollToMatch(msgSearchCursor);
  updateSearchCountLabel();
}

function scrollToMatch(idx) {
  // Remove active highlight from all
  msgSearchMatches.forEach(el => el.style.outline = '');
  const target = msgSearchMatches[idx];
  if (!target) return;
  target.style.outline = '2px solid var(--cyan)';
  target.style.outlineOffset = '3px';
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function updateSearchCountLabel() {
  if (!msgSearchMatches.length) {
    msgSearchCountLabel.textContent = 'No results';
    return;
  }
  msgSearchCountLabel.textContent = `${msgSearchCursor + 1} / ${msgSearchMatches.length}`;
}

// ============================================================
// MENU ACTION: ② Mute Notifications
// ============================================================

document.getElementById('ccmMute').addEventListener('click', () => {
  const user = getUserById(activeUserId);
  if (!user) return;

  user.muted = !user.muted;

  closeChatContextMenu();
  renderChatList(searchInput.value);
  showGlobalToast(
    user.muted ? `🔕 ${user.name} muted` : `🔔 ${user.name} unmuted`,
    'success'
  );
});

// ============================================================
// MENU ACTION: ③ Block / Unblock User
// ============================================================

document.getElementById('ccmBlock').addEventListener('click', () => {
  const user = getUserById(activeUserId);
  if (!user) return;

  user.blocked = !user.blocked;

  // If blocking, also stop any fake reply in progress
  if (user.blocked) {
    clearTimeout(typingTimer);
    typingIndicator.classList.add('hidden');
  }

  closeChatContextMenu();

  // Re-render the chat to show/hide the blocked overlay
  renderMessages(user);
  renderChatList(searchInput.value);

  showGlobalToast(
    user.blocked ? `🚫 ${user.name} blocked` : `✓ ${user.name} unblocked`,
    user.blocked ? 'error' : 'success'
  );
});

// ============================================================
// MENU ACTION: ④ Clear Chat
// ============================================================

document.getElementById('ccmClear').addEventListener('click', () => {
  const user = getUserById(activeUserId);
  if (!user) return;

  closeChatContextMenu();

  // Confirm with a quick in-place toast then clear
  showGlobalToast('Clearing chat…', 'error');

  setTimeout(() => {
    user.messages = [];
    user.lastTime = now();
    renderMessages(user);
    renderChatList(searchInput.value);
    showGlobalToast('Chat cleared', 'success');
  }, 400);
});

// ============================================================
// MENU ACTION: ⑤ Delete Chat
// ============================================================

document.getElementById('ccmDelete').addEventListener('click', () => {
  const user = getUserById(activeUserId);
  if (!user) return;

  closeChatContextMenu();

  showGlobalToast(`Deleting chat with ${user.name}…`, 'error');

  setTimeout(() => {
    // Remove user from list entirely
    const idx = USERS.indexOf(user);
    if (idx > -1) USERS.splice(idx, 1);

    // Reset the chat view
    activeUserId = null;
    clearTimeout(typingTimer);
    typingIndicator.classList.add('hidden');
    closeMsgSearchBar();
    emptyState.classList.remove('hidden');
    activeChat.classList.add('hidden');

    // On mobile, show sidebar again
    sidebar.classList.remove('hidden-mobile');
    showNav();

    renderChatList(searchInput.value);
    showGlobalToast('Chat deleted', 'success');
  }, 500);
});

// ============================================================
// INIT
// ============================================================

function init() {
  switchSidebarTab('dms');
  renderChatList();
  renderGroupList();
  newGroupBtn.style.opacity = '0.4';
  newGroupBtn.style.pointerEvents = 'none';
}

init();