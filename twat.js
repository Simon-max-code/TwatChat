/* ============================================================
   TwatChat — script.js
   All frontend logic: data, rendering, interactions
   ============================================================ */

'use strict';

// ============================================================
// DUMMY DATA — individual users
// ============================================================

const USERS = [
  {
    id: 1,
    name: 'Golden Amu',
    initials: 'GA',
    usertag: '@golden.amu',
    avatarClass: 'av-0',
    online: true,
    unread: 3,
    lastTime: '10:42',
    messages: [
      { from: 'them', text: 'Hey! Did you check out the new design system?', time: '10:30' },
      { from: 'me',   text: "Yeah, it's looking really clean. Love the token structure.", time: '10:31' },
      { from: 'them', text: 'Right? The dark mode tokens are fire', time: '10:33' },
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
    usertag: '@omni.amu',
    avatarClass: 'av-1',
    online: true,
    unread: 1,
    lastTime: '09:58',
    messages: [
      { from: 'me',   text: 'Hey, you joining the standup?', time: '09:45' },
      { from: 'them', text: "Already in. You're late haha", time: '09:46' },
      { from: 'me',   text: "lmaooo two minutes doesn't count", time: '09:47' },
      { from: 'them', text: 'The CI pipeline broke again btw', time: '09:55' },
      { from: 'me',   text: 'Of course it did. Same env issue?', time: '09:56' },
      { from: 'them', text: 'Nah, looks like the Docker image cache got wiped', time: '09:58' },
    ],
  },
  {
    id: 3,
    name: 'Brutally Gay',
    initials: 'BG',
    usertag: '@brutally.gay',
    avatarClass: 'av-2',
    online: false,
    unread: 0,
    lastTime: 'Yesterday',
    messages: [
      { from: 'them', text: 'Can you send me the wireframes when ready?', time: 'Yesterday' },
      { from: 'me',   text: 'Just exported them — check your email!', time: 'Yesterday' },
      { from: 'them', text: 'Got them, thanks! These look amazing', time: 'Yesterday' },
      { from: 'me',   text: 'Glad you like it! Let me know if anything needs tweaking.', time: 'Yesterday' },
      { from: 'them', text: 'The hero section might need a bit more breathing room but otherwise perfect', time: 'Yesterday' },
    ],
  },
  {
    id: 4,
    name: 'Aunty Linda',
    initials: 'AL',
    usertag: '@aunty.linda',
    avatarClass: 'av-3',
    online: true,
    unread: 7,
    lastTime: '11:05',
    messages: [
      { from: 'them', text: 'The client wants a demo by Friday', time: '11:00' },
      { from: 'me',   text: "That's in 3 days... what's the scope?", time: '11:01' },
      { from: 'them', text: 'Login flow, dashboard overview, and the reporting module', time: '11:02' },
      { from: 'them', text: 'Basically the whole thing lol', time: '11:02' },
      { from: 'me',   text: "Ok let's triage — what's the MVP of the MVP?", time: '11:03' },
      { from: 'them', text: 'Dashboard is the must-have. Rest can be mocked.', time: '11:04' },
      { from: 'them', text: "Let's hop on a call?", time: '11:05' },
    ],
  },
  {
    id: 5,
    name: 'Evil Spawn',
    initials: 'ES',
    usertag: '@evil.spawn',
    avatarClass: 'av-4',
    online: false,
    unread: 0,
    lastTime: 'Mon',
    messages: [
      { from: 'me',   text: 'Did the deployment go through?', time: 'Mon' },
      { from: 'them', text: 'Yep! Prod is green', time: 'Mon' },
      { from: 'me',   text: 'Smooth! Great work on the migration script.', time: 'Mon' },
      { from: 'them', text: "Thanks! Couldn't have done it without the runbook you wrote", time: 'Mon' },
      { from: 'me',   text: 'Teamwork makes the dream work', time: 'Mon' },
    ],
  },
  {
    id: 6,
    name: 'Sirsimon',
    initials: 'Ss',
    usertag: '@sirsimon',
    avatarClass: 'av-5',
    online: true,
    unread: 2,
    lastTime: '08:30',
    messages: [
      { from: 'them', text: 'Morning! Coffee first, then code', time: '08:15' },
      { from: 'me',   text: 'Always. What are you working on today?', time: '08:17' },
      { from: 'them', text: 'Finally tackling that auth refactor. Wish me luck.', time: '08:20' },
      { from: 'me',   text: "You've got this. The old code was... character-building.", time: '08:22' },
      { from: 'them', text: 'Haha "character-building" is generous', time: '08:25' },
      { from: 'them', text: 'Hey can you review the new token refresh logic later?', time: '08:30' },
    ],
  },
];

// ============================================================
// GROUP CHATS — seed data
// Message shape: { from: userId | 'me', senderId: userId | null, text, time }
// ============================================================

let GROUP_CHATS = [
  {
    id: 'g-1',
    type: 'group',
    name: 'Design Squad',
    initials: 'DS',
    participants: [1, 2, 4],
    unread: 2,
    lastTime: '11:10',
    messages: [
      { from: 1,    senderId: 1,    text: 'Morning everyone! Ready for the design review?', time: '11:00' },
      { from: 2,    senderId: 2,    text: 'On my second coffee, almost human', time: '11:02' },
      { from: 'me', senderId: null, text: 'Sharing my screen in 5', time: '11:05' },
      { from: 4,    senderId: 4,    text: 'Got the Figma link, joining now!', time: '11:08' },
      { from: 1,    senderId: 1,    text: 'The new component library is looking great', time: '11:10' },
    ],
  },
  {
    id: 'g-2',
    type: 'group',
    name: 'The Crew',
    initials: 'TC',
    participants: [2, 5, 6],
    unread: 0,
    lastTime: 'Yesterday',
    messages: [
      { from: 6,    senderId: 6,    text: 'Weekend plans?', time: 'Yesterday' },
      { from: 2,    senderId: 2,    text: 'Nothing yet, probably gaming', time: 'Yesterday' },
      { from: 5,    senderId: 5,    text: 'I might be free Saturday', time: 'Yesterday' },
      { from: 'me', senderId: null, text: 'Saturday works for me too', time: 'Yesterday' },
    ],
  },
];

// ============================================================
// STATE
// ============================================================

// activeChat: { id: number | 'g-N' | null, type: 'dm' | 'group' | null }
let activeChat     = { id: null, type: null };
let typingTimer    = null;
let groupIdCounter = GROUP_CHATS.length; // increments on each new group

// ============================================================
// DOM REFS
// ============================================================

const chatListEl       = document.getElementById('chatList');
const searchInput      = document.getElementById('searchInput');
const emptyState       = document.getElementById('emptyState');
const activeChatEl     = document.getElementById('activeChat');
const messagesArea     = document.getElementById('messagesArea');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderName   = document.getElementById('chatHeaderName');
const chatHeaderStatus = document.getElementById('chatHeaderStatus');
const typingIndicator  = document.getElementById('typingIndicator');
const typingName       = document.getElementById('typingName');
const msgInput         = document.getElementById('msgInput');
const sendBtn          = document.getElementById('sendBtn');
const backBtn          = document.getElementById('backBtn');
const sidebar          = document.getElementById('sidebar');
const navTabs          = document.querySelectorAll('.nav-tab');
const newGroupBtn      = document.getElementById('newGroupBtn');

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
  return GROUP_CHATS.find(g => g.id === id);
}

function groupInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Maps a participant to a consistent colour class index
function senderColorClass(userId, participants) {
  const idx = participants.indexOf(userId);
  return `sc-${Math.max(0, idx) % 6}`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// RENDER: UNIFIED SIDEBAR LIST (DMs + Groups)
// ============================================================

function renderChatList(filter = '') {
  chatListEl.innerHTML = '';
  const lower = filter.toLowerCase();

  // ── DM entries ──
  USERS
    .filter(u => u.name.toLowerCase().includes(lower))
    .forEach(user => {
      const lastMsg = user.messages[user.messages.length - 1];
      const preview = lastMsg ? lastMsg.text : 'No messages yet';
      const isActive = activeChat.type === 'dm' && activeChat.id === user.id;

      const item = document.createElement('div');
      item.className = 'chat-item' + (isActive ? ' active' : '');
      item.dataset.id   = user.id;
      item.dataset.type = 'dm';

      item.innerHTML = `
        <div class="ci-avatar-wrap">
          <div class="ci-avatar ${user.avatarClass}">${user.initials}</div>
          <span class="ci-status ${user.online ? 'online' : 'offline'}"></span>
        </div>
        <div class="ci-content">
          <div class="ci-top">
            <span class="ci-name">${escapeHTML(user.name)}</span>
            <span class="ci-time">${user.lastTime}</span>
          </div>
          <div class="ci-bottom">
            <span class="ci-preview">${escapeHTML(preview)}</span>
            ${user.unread > 0 ? `<span class="ci-badge">${user.unread}</span>` : ''}
          </div>
        </div>
      `;

      // Avatar click → profile modal  |  row click → open DM
      item.querySelector('.ci-avatar-wrap').addEventListener('click', e => {
        e.stopPropagation();
        openProfileModal(user);
      });
      item.addEventListener('click', () => openDM(user.id));
      chatListEl.appendChild(item);
    });

  // ── Group entries ──
  GROUP_CHATS
    .filter(g => g.name.toLowerCase().includes(lower))
    .forEach(group => {
      const lastMsg = group.messages[group.messages.length - 1];
      let preview = 'No messages yet';
      if (lastMsg) {
        const prefix = lastMsg.from === 'me'
          ? 'You'
          : (getUserById(lastMsg.from)?.name.split(' ')[0] ?? '');
        preview = prefix ? `${prefix}: ${lastMsg.text}` : lastMsg.text;
      }

      const isActive = activeChat.type === 'group' && activeChat.id === group.id;
      const item = document.createElement('div');
      item.className = 'chat-item' + (isActive ? ' active' : '');
      item.dataset.id   = group.id;
      item.dataset.type = 'group';

      item.innerHTML = `
        <div class="ci-avatar-wrap">
          <div class="ci-avatar group-av">${escapeHTML(group.initials)}</div>
        </div>
        <div class="ci-content">
          <div class="ci-top">
            <span class="ci-name">
              ${escapeHTML(group.name)}
              <span class="ci-group-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="8" height="8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                GROUP
              </span>
            </span>
            <span class="ci-time">${group.lastTime}</span>
          </div>
          <div class="ci-bottom">
            <span class="ci-preview">${escapeHTML(preview)}</span>
            ${group.unread > 0 ? `<span class="ci-badge">${group.unread}</span>` : ''}
          </div>
        </div>
      `;

      item.addEventListener('click', () => openGroupChat(group.id));
      chatListEl.appendChild(item);
    });

  if (!chatListEl.children.length) {
    chatListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px;">No chats found</p>`;
  }
}

// ============================================================
// RENDER: DM MESSAGES
// ============================================================

function renderDMMessages(user) {
  messagesArea.innerHTML = '';
  const divider = document.createElement('div');
  divider.className = 'date-divider';
  divider.innerHTML = '<span>Today</span>';
  messagesArea.appendChild(divider);

  let prevFrom = null;
  user.messages.forEach((msg, idx) => {
    const isGap = prevFrom !== msg.from && idx > 0;
    renderDMBubble(msg, user, isGap, false);
    prevFrom = msg.from;
  });
  scrollToBottom(false);
}

function renderDMBubble(msg, user, gap = false, smooth = true) {
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
// RENDER: GROUP MESSAGES
// ============================================================

function renderGroupMessages(group) {
  messagesArea.innerHTML = '';
  const divider = document.createElement('div');
  divider.className = 'date-divider';
  divider.innerHTML = '<span>Today</span>';
  messagesArea.appendChild(divider);

  let prevFrom = null;
  group.messages.forEach((msg, idx) => {
    const isGap = prevFrom !== msg.from && idx > 0;
    renderGroupBubble(msg, group, isGap, false);
    prevFrom = msg.from;
  });
  scrollToBottom(false);
}

function renderGroupBubble(msg, group, gap = false, smooth = true) {
  const isSent = msg.from === 'me';
  const sender = isSent ? null : getUserById(msg.senderId);

  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}${gap ? ' gap-above' : ''}`;

  const avatarClass  = isSent ? 'av-0' : (sender ? sender.avatarClass : 'av-0');
  const avatarHidden = (!isSent && !gap) ? 'hidden-avatar' : '';
  const avatarText   = isSent ? 'Y' : (sender ? sender.initials : '?');

  // Sender name label — only on received messages when sender changes
  const colorClass  = sender ? senderColorClass(sender.id, group.participants) : '';
  const senderLabel = (!isSent && gap && sender)
    ? `<span class="msg-sender-label ${colorClass}">${escapeHTML(sender.name.split(' ')[0])}</span>`
    : '';

  div.innerHTML = `
    <div class="msg-avatar ${avatarClass} ${avatarHidden}">${avatarText}</div>
    <div class="msg-body">
      ${senderLabel}
      <div class="msg-bubble">${escapeHTML(msg.text)}</div>
      <span class="msg-time">${msg.time}</span>
    </div>
  `;

  messagesArea.appendChild(div);
  if (smooth) scrollToBottom(true);
}

// ============================================================
// OPEN DM CHAT
// ============================================================

function openDM(userId) {
  const user = getUserById(userId);
  if (!user) return;

  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');

  activeChat = { id: userId, type: 'dm' };
  user.unread = 0;
  renderChatList(searchInput.value);

  chatHeaderAvatar.className = `chat-header-avatar ${user.avatarClass}`;
  chatHeaderAvatar.textContent = user.initials;
  chatHeaderName.textContent = user.name;
  chatHeaderStatus.textContent = user.online ? '● Online' : '● Offline';
  chatHeaderStatus.className = 'chat-header-status' + (user.online ? ' is-online' : '');

  emptyState.classList.add('hidden');
  activeChatEl.classList.remove('hidden');
  renderDMMessages(user);
  sidebar.classList.add('hidden-mobile');

  if (user.online) scheduleFakeReply(user);
  msgInput.focus();
}

// ============================================================
// OPEN GROUP CHAT
// ============================================================

function openGroupChat(groupId) {
  const group = getGroupById(groupId);
  if (!group) return;

  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');

  activeChat = { id: groupId, type: 'group' };
  group.unread = 0;
  renderChatList(searchInput.value);

  chatHeaderAvatar.className = 'chat-header-avatar group-av';
  chatHeaderAvatar.textContent = group.initials;
  chatHeaderName.textContent = group.name;
  const memberCount = group.participants.length + 1; // +1 = you
  chatHeaderStatus.textContent = `⬡ ${memberCount} members`;
  chatHeaderStatus.className = 'chat-header-status group-status';

  emptyState.classList.add('hidden');
  activeChatEl.classList.remove('hidden');
  renderGroupMessages(group);
  sidebar.classList.add('hidden-mobile');

  scheduleGroupReply(group);
  msgInput.focus();
}

// ============================================================
// SEND MESSAGE — routes to DM or group handler
// ============================================================

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || activeChat.id === null) return;
  msgInput.value = '';
  const t = now();

  if (activeChat.type === 'dm') {
    const user = getUserById(activeChat.id);
    if (!user) return;

    const msg = { from: 'me', text, time: t };
    user.messages.push(msg);
    user.lastTime = t;

    const prev = user.messages[user.messages.length - 2];
    renderDMBubble(msg, user, prev && prev.from !== 'me', true);
    renderChatList(searchInput.value);
    if (user.online) scheduleFakeReply(user);

  } else if (activeChat.type === 'group') {
    const group = getGroupById(activeChat.id);
    if (!group) return;

    const msg = { from: 'me', senderId: null, text, time: t };
    group.messages.push(msg);
    group.lastTime = t;

    const prev = group.messages[group.messages.length - 2];
    renderGroupBubble(msg, group, prev && prev.from !== 'me', true);
    renderChatList(searchInput.value);
    scheduleGroupReply(group);
  }
}

// ============================================================
// FAKE REPLY — DM
// ============================================================

const FAKE_REPLIES = [
  "Sounds good to me!",
  "Let me check that and get back to you.",
  "Yeah, totally agree on that.",
  "Haha good point",
  "Can we sync on this tomorrow?",
  "That makes sense, I'll take a look.",
  "Nice! Sending over the file now.",
  "Wait, really? That's wild.",
  "On it",
  "I'll ping you when it's done.",
  "Sure, no problem!",
  "Hmm let me think about that…",
  "For sure, sounds like a plan.",
  "Can't right now, in a meeting. BRB.",
  "That's exactly what I was thinking.",
];

function scheduleFakeReply(user) {
  if (activeChat.type !== 'dm' || activeChat.id !== user.id) return;
  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    if (activeChat.type !== 'dm' || activeChat.id !== user.id) return;
    typingName.textContent = user.name.split(' ')[0];
    typingIndicator.classList.remove('hidden');
    scrollToBottom(true);

    typingTimer = setTimeout(() => {
      if (activeChat.type !== 'dm' || activeChat.id !== user.id) return;
      typingIndicator.classList.add('hidden');

      const replyMsg = { from: 'them', text: FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)], time: now() };
      user.messages.push(replyMsg);
      user.lastTime = now();

      const prev = user.messages[user.messages.length - 2];
      renderDMBubble(replyMsg, user, prev && prev.from !== 'them', true);
      renderChatList(searchInput.value);
    }, 1500 + Math.random() * 1500);

  }, 1200 + Math.random() * 1400);
}

// ============================================================
// FAKE REPLY — GROUP
// Picks a random online participant, shows typing, fires reply
// ============================================================

const GROUP_REPLIES = [
  "Agreed, let's go with that.",
  "Anyone else seeing this bug?",
  "Can we revisit this after the call?",
  "Great idea!",
  "I'll take care of it.",
  "Linking the doc now",
  "That's the one, yes!",
  "Give me a few mins, on another call.",
  "Looks solid to me",
  "Wait what did I miss?",
  "lmao same",
  "Just pushed the fix",
  "Who's running the retro today?",
  "On it! ETA 10 mins.",
  "Can someone share their screen?",
];

function scheduleGroupReply(group) {
  if (activeChat.type !== 'group' || activeChat.id !== group.id) return;
  clearTimeout(typingTimer);

  // Prefer online participants; fall back to any
  const online = group.participants.filter(id => getUserById(id)?.online);
  const pool   = online.length ? online : group.participants;
  const senderId = pool[Math.floor(Math.random() * pool.length)];
  const sender   = getUserById(senderId);
  if (!sender) return;

  typingTimer = setTimeout(() => {
    if (activeChat.type !== 'group' || activeChat.id !== group.id) return;
    typingName.textContent = sender.name.split(' ')[0];
    typingIndicator.classList.remove('hidden');
    scrollToBottom(true);

    typingTimer = setTimeout(() => {
      if (activeChat.type !== 'group' || activeChat.id !== group.id) return;
      typingIndicator.classList.add('hidden');

      const replyMsg = {
        from: senderId,
        senderId,
        text: GROUP_REPLIES[Math.floor(Math.random() * GROUP_REPLIES.length)],
        time: now(),
      };
      group.messages.push(replyMsg);
      group.lastTime = now();

      const prev = group.messages[group.messages.length - 2];
      renderGroupBubble(replyMsg, group, prev && prev.from !== senderId, true);
      renderChatList(searchInput.value);
    }, 1400 + Math.random() * 1600);

  }, 1000 + Math.random() * 2000);
}

// ============================================================
// CREATE GROUP MODAL
// ============================================================

const groupModal       = document.getElementById('groupModal');
const groupModalClose  = document.getElementById('groupModalClose');
const groupModalCancel = document.getElementById('groupModalCancel');
const groupModalCreate = document.getElementById('groupModalCreate');
const groupNameInput   = document.getElementById('groupNameInput');
const gmMemberList     = document.getElementById('gmMemberList');
const gmChips          = document.getElementById('gmChips');
const gmCount          = document.getElementById('gmCount');

let selectedMembers = new Set();

function openGroupModal() {
  selectedMembers.clear();
  groupNameInput.value = '';
  groupNameInput.style.borderColor = '';
  renderMemberList();
  renderChips();
  updateCreateBtn();
  groupModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => groupNameInput.focus(), 150);
}

function closeGroupModal() {
  groupModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderMemberList() {
  gmMemberList.innerHTML = '';
  USERS.forEach(user => {
    const selected = selectedMembers.has(user.id);
    const row = document.createElement('div');
    row.className = 'gm-member-row' + (selected ? ' selected' : '');

    row.innerHTML = `
      <div class="gm-member-av ${user.avatarClass}">${user.initials}</div>
      <span class="gm-member-name">${escapeHTML(user.name)}</span>
      <div class="gm-member-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    `;

    row.addEventListener('click', () => toggleMember(user.id));
    gmMemberList.appendChild(row);
  });
}

function toggleMember(userId) {
  if (selectedMembers.has(userId)) {
    selectedMembers.delete(userId);
  } else {
    selectedMembers.add(userId);
  }
  renderMemberList();
  renderChips();
  updateCreateBtn();
}

function renderChips() {
  gmChips.innerHTML = '';
  gmCount.textContent = `${selectedMembers.size} selected`;

  selectedMembers.forEach(userId => {
    const user = getUserById(userId);
    if (!user) return;

    const chip = document.createElement('div');
    chip.className = 'gm-chip';
    chip.innerHTML = `
      <div class="gm-chip-av ${user.avatarClass}">${user.initials}</div>
      <span>${escapeHTML(user.name.split(' ')[0])}</span>
      <button class="gm-chip-remove" title="Remove ${escapeHTML(user.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    chip.querySelector('.gm-chip-remove').addEventListener('click', () => toggleMember(userId));
    gmChips.appendChild(chip);
  });
}

function updateCreateBtn() {
  groupModalCreate.disabled = selectedMembers.size < 1;
}

function createGroup() {
  const name = groupNameInput.value.trim();
  if (!name) {
    groupNameInput.focus();
    groupNameInput.style.borderColor = '#f87171';
    setTimeout(() => { groupNameInput.style.borderColor = ''; }, 1600);
    return;
  }
  if (selectedMembers.size < 1) return;

  groupIdCounter++;
  const id = `g-${groupIdCounter}`;

  const newGroup = {
    id,
    type: 'group',
    name,
    initials: groupInitials(name),
    participants: [...selectedMembers],
    unread: 0,
    lastTime: now(),
    messages: [],
  };

  GROUP_CHATS.unshift(newGroup);
  closeGroupModal();
  renderChatList(searchInput.value);
  openGroupChat(id);
}

// ── Group modal wiring ─────────────────────────────────────

newGroupBtn.addEventListener('click', openGroupModal);
groupModalClose.addEventListener('click', closeGroupModal);
groupModalCancel.addEventListener('click', closeGroupModal);
groupModalCreate.addEventListener('click', createGroup);
groupNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createGroup(); });
groupModal.addEventListener('click', e => { if (e.target === groupModal) closeGroupModal(); });

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
      if (activeChat.id === null) sidebar.classList.remove('hidden-mobile');
    }
  }
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.view, tab));
});

// ============================================================
// SIDEBAR SEARCH
// ============================================================

searchInput.addEventListener('input', () => renderChatList(searchInput.value));

// ============================================================
// SEND BUTTON + ENTER KEY
// ============================================================

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ============================================================
// BACK BUTTON (mobile)
// ============================================================

backBtn.addEventListener('click', () => {
  sidebar.classList.remove('hidden-mobile');
  activeChat = { id: null, type: null };
  emptyState.classList.remove('hidden');
  activeChatEl.classList.add('hidden');
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
});

// ============================================================
// FRIEND PROFILE MODAL (DM chats only)
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
  if (!profileModal) return;
  pmAvatar.className = `pm-avatar ${user.avatarClass}`;
  pmAvatar.textContent = user.initials;
  profileModalTag.textContent = user.usertag || `@${user.name.toLowerCase().replace(/\s+/g, '.')}`;
  pmGlow.style.background = GLOW_COLORS[user.avatarClass] || '#00d4ff';

  pmMessageBtn.onclick = () => {
    closeProfileModal();
    const chatsTab = document.querySelector('[data-view="view-chats"]');
    if (chatsTab) chatsTab.click();
    setTimeout(() => openDM(user.id), 60);
  };

  resetCopyBtn();
  profileModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  if (!profileModal) return;
  profileModal.classList.add('hidden');
  document.body.style.overflow = '';
}

function resetCopyBtn() {
  if (!pmCopyLabel) return;
  pmCopyLabel.textContent = 'Copy';
  pmCopyBtn.classList.remove('copied');
}

if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
if (profileModal) {
  profileModal.addEventListener('click', e => { if (e.target === profileModal) closeProfileModal(); });
}

// Header avatar: open profile for DM, do nothing for group
const chatHeaderAvatarEl = document.getElementById('chatHeaderAvatar');
if (chatHeaderAvatarEl) {
  chatHeaderAvatarEl.addEventListener('click', () => {
    if (activeChat.type !== 'dm' || activeChat.id === null) return;
    const user = getUserById(activeChat.id);
    if (user) openProfileModal(user);
  });
  chatHeaderAvatarEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chatHeaderAvatarEl.click(); }
  });
}

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

// ── Global Escape key — closes any open modal ──────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeProfileModal();
  closeGroupModal();
});

// ============================================================
// INIT
// ============================================================

function init() {
  renderChatList();
}

init();