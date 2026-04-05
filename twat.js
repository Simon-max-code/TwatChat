/* ============================================================
   TwatChat — twat.js
   All frontend logic wired to real backend + Socket.io
   ============================================================ */

'use strict';

const BACKEND_URL = 'https://twatchat-backend.onrender.com';

// ============================================================
// SOCKET.IO — connect after auth
// ============================================================

let socket = null;

function connectSocket(user) {
  if (socket && socket.connected) return;

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    socket.emit('presence:online', { userId: user._id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  // ── Incoming new message ───────────────────────────────
  socket.on('message:new', ({ message, chatId }) => {
    if (chatId === activeChatId) {
      appendMessage(message);
    }
    refreshChatList();
  });

  // ── Presence updates ───────────────────────────────────
  socket.on('presence:update', ({ userId, isOnline }) => {
    updateUserPresence(userId, isOnline);
  });

  // ── Typing indicator ───────────────────────────────────
  socket.on('typing:update', ({ chatId, userName, isTyping }) => {
    if (chatId !== activeChatId) return;
    if (isTyping) {
      typingName.textContent = userName;
      typingIndicator.classList.remove('hidden');
      scrollToBottom(true);
    } else {
      typingIndicator.classList.add('hidden');
    }
  });

  // ── Chat updated (unread badge) ────────────────────────
  socket.on('chat:updated', () => {
    refreshChatList();
  });

  // ── Message deleted ────────────────────────────────────
  socket.on('message:deleted', ({ msgId }) => {
    const el = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (el) el.remove();
  });
}

// ============================================================
// STATE
// ============================================================

let activeChatId      = null;
let activeIsGroup     = false;
let activeSidebarTab  = 'dms';
let typingTimer       = null;
let allUsers          = [];   // cached from GET /api/users
let allChats          = [];   // cached from GET /api/chats
let selectedGroupIcon = '🚀';
let selectedMemberIds = new Set();
let currentPage       = 1;
let hasMoreMessages   = false;

// ============================================================
// DOM REFS
// ============================================================

const bottomNav      = document.querySelector('.bottom-nav');
const chatListEl     = document.getElementById('chatList');
const groupListEl    = document.getElementById('groupList');
const searchInput    = document.getElementById('searchInput');
const emptyState     = document.getElementById('emptyState');
const activeChat     = document.getElementById('activeChat');
const messagesArea   = document.getElementById('messagesArea');
const chatHeaderAvatar      = document.getElementById('chatHeaderAvatar');
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
const tabDMs           = document.getElementById('tabDMs');
const tabGroups        = document.getElementById('tabGroups');
const newGroupBtn      = document.getElementById('newGroupBtn');

// ============================================================
// NAV HELPERS
// ============================================================

function hideNav() {
  if (!bottomNav || window.innerWidth > 680) return;
  bottomNav.style.transform = 'translateX(-50%) translateY(calc(100% + 26px))';
  bottomNav.style.opacity   = '0';
  bottomNav.style.pointerEvents = 'none';
}

function showNav() {
  if (!bottomNav) return;
  bottomNav.style.transform = 'translateX(-50%) translateY(0)';
  bottomNav.style.opacity   = '1';
  bottomNav.style.pointerEvents = '';
}

// ============================================================
// HELPERS
// ============================================================

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d    = new Date(dateStr);
  const today = new Date();
  const diff  = today - d;
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return d.toLocaleDateString('en', { weekday: 'short' });
  return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

function escapeHTML(str = '') {
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function scrollToBottom(smooth = true) {
  messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}

function getMe() {
  try { return JSON.parse(localStorage.getItem('twatchat_user')); } catch { return null; }
}

function getDMPartner(chat) {
  const me = getMe();
  return chat.members.find(m => m._id !== me._id) || chat.members[0];
}

// ============================================================
// SIDEBAR TABS
// ============================================================

function switchSidebarTab(tab) {
  activeSidebarTab = tab;
  tabDMs.classList.toggle('active',    tab === 'dms');
  tabGroups.classList.toggle('active', tab === 'groups');
  chatListEl.classList.toggle('hidden',  tab !== 'dms');
  groupListEl.classList.toggle('hidden', tab !== 'groups');
  newGroupBtn.style.opacity      = tab === 'groups' ? '1' : '0.4';
  newGroupBtn.style.pointerEvents = tab === 'groups' ? 'all' : 'none';
}

tabDMs.addEventListener('click',    () => switchSidebarTab('dms'));
tabGroups.addEventListener('click', () => switchSidebarTab('groups'));

// ============================================================
// LOAD + RENDER SIDEBAR
// ============================================================

async function loadAndRenderSidebar() {
  try {
    const [usersData, chatsData] = await Promise.all([
      usersAPI.getAll(),
      chatsAPI.getAll(),
    ]);

    allUsers = usersData.users || [];
    allChats = chatsData.chats || [];

    renderChatList();
    renderGroupList();
  } catch (err) {
    console.error('Sidebar load error:', err.message);
  }
}

async function refreshChatList() {
  try {
    const data = await chatsAPI.getAll();
    allChats = data.chats || [];
    renderChatList();
    renderGroupList();
  } catch (err) {
    console.error('Refresh error:', err.message);
  }
}

// ============================================================
// RENDER DM LIST
// ============================================================

function renderChatList(filter = '') {
  chatListEl.innerHTML = '';
  const me    = getMe();
  const lower = filter.toLowerCase();

  const dms = allChats.filter(c => {
    if (c.isGroup) return false;
    const partner = getDMPartner(c);
    return (partner?.displayName || '').toLowerCase().includes(lower);
  });

  if (!dms.length) {
    chatListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px;">No chats yet</p>`;
    return;
  }

  dms.forEach(chat => {
    const partner  = getDMPartner(chat);
    const lastMsg  = chat.lastMessage;
    const preview  = lastMsg
      ? (lastMsg.sender?._id === me?._id ? `You: ${lastMsg.text}` : lastMsg.text)
      : 'No messages yet';
    const unread   = chat.unreadCounts?.[me?._id] || 0;
    const time     = formatTime(chat.updatedAt);
    const isActive = chat._id === activeChatId;

    const item = document.createElement('div');
    item.className = `chat-item${isActive ? ' active' : ''}`;
    item.dataset.id = chat._id;
    item.innerHTML = `
      <div class="ci-avatar-wrap">
        <div class="ci-avatar ${partner?.avatarClass || 'av-0'}">${partner?.initials || '?'}</div>
        <span class="ci-status ${partner?.isOnline ? 'online' : 'offline'}"></span>
      </div>
      <div class="ci-content">
        <div class="ci-top">
          <span class="ci-name">${escapeHTML(partner?.displayName || 'Unknown')}</span>
          <span class="ci-time">${time}</span>
        </div>
        <div class="ci-bottom">
          <span class="ci-preview">${escapeHTML(preview)}</span>
          ${unread > 0 ? `<span class="ci-badge">${unread}</span>` : ''}
        </div>
      </div>
    `;
    item.addEventListener('click', () => openChat(chat._id));
    chatListEl.appendChild(item);
  });
}

// ============================================================
// RENDER GROUP LIST
// ============================================================

function renderGroupList(filter = '') {
  groupListEl.innerHTML = '';
  const me    = getMe();
  const lower = filter.toLowerCase();

  const groups = allChats.filter(c => {
    if (!c.isGroup) return false;
    return c.name.toLowerCase().includes(lower);
  });

  if (!groups.length) {
    groupListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px;">No groups yet</p>`;
    return;
  }

  groups.forEach(chat => {
    const lastMsg  = chat.lastMessage;
    const preview  = lastMsg
      ? `${lastMsg.sender?._id === me?._id ? 'You' : lastMsg.sender?.displayName?.split(' ')[0] || ''}: ${lastMsg.text}`
      : 'No messages yet';
    const unread   = chat.unreadCounts?.[me?._id] || 0;
    const time     = formatTime(chat.updatedAt);
    const isActive = chat._id === activeChatId;
    const avatars  = buildGroupAvatarMini(chat);

    const item = document.createElement('div');
    item.className = `chat-item group-chat-item${isActive ? ' active' : ''}`;
    item.dataset.gid = chat._id;
    item.innerHTML = `
      <div class="ci-avatar-wrap">
        <div class="group-avatar-stack sm">${avatars}</div>
        <span class="group-icon-badge">${chat.icon || '🚀'}</span>
      </div>
      <div class="ci-content">
        <div class="ci-top">
          <span class="ci-name">${escapeHTML(chat.name)}</span>
          <span class="ci-time">${time}</span>
        </div>
        <div class="ci-bottom">
          <span class="ci-preview">${escapeHTML(preview)}</span>
          ${unread > 0 ? `<span class="ci-badge">${unread}</span>` : ''}
        </div>
      </div>
    `;
    item.addEventListener('click', () => openChat(chat._id));
    groupListEl.appendChild(item);
  });
}

function buildGroupAvatarMini(chat) {
  return (chat.members || []).slice(0, 3).map((m, i) =>
    `<div class="gam-avatar ${m.avatarClass || 'av-0'}" style="z-index:${3-i}">${m.initials || '?'}</div>`
  ).join('');
}

// ============================================================
// OPEN CHAT (DM or Group)
// ============================================================

async function openChat(chatId) {
  try {
    closeChatContextMenu();
    closeMsgSearchBar();
    clearTimeout(typingTimer);
    typingIndicator.classList.add('hidden');

    // Find chat in cache first
    let chat = allChats.find(c => c._id === chatId);
    if (!chat) {
      const data = await chatsAPI.getOne(chatId);
      chat = data.chat;
    }

    activeChatId  = chatId;
    activeIsGroup = chat.isGroup;

    // Join socket room
    if (socket) socket.emit('chat:join', { chatId });

    // ── Update header ─────────────────────────────────────
    if (!chat.isGroup) {
      const partner = getDMPartner(chat);
      chatHeaderAvatar.className   = `chat-header-avatar ${partner?.avatarClass || 'av-0'}`;
      chatHeaderAvatar.textContent = partner?.initials || '?';
      chatHeaderAvatar.classList.remove('hidden');
      chatHeaderGroupAvatar.classList.add('hidden');
      chatHeaderName.textContent   = partner?.displayName || 'Unknown';
      chatHeaderStatus.textContent = partner?.isOnline ? '● Online' : '● Offline';
      chatHeaderStatus.className   = `chat-header-status${partner?.isOnline ? ' is-online' : ''}`;
      groupInfoBtn.classList.add('hidden');
      moreOptionsBtn.classList.remove('hidden');
    } else {
      chatHeaderAvatar.classList.add('hidden');
      chatHeaderGroupAvatar.classList.remove('hidden');
      chatHeaderGroupAvatarInner.innerHTML = buildGroupAvatarMini(chat);
      chatHeaderName.textContent   = `${chat.icon || '🚀'} ${chat.name}`;
      chatHeaderStatus.textContent = `${chat.members.length} members`;
      chatHeaderStatus.className   = 'chat-header-status';
      groupInfoBtn.classList.remove('hidden');
      moreOptionsBtn.classList.add('hidden');
    }

    emptyState.classList.add('hidden');
    activeChat.classList.remove('hidden');
    sidebar.classList.add('hidden-mobile');
    hideNav();

    // ── Load messages ─────────────────────────────────────
    currentPage = 1;
    await loadMessages(chatId, 1, false);

    // Re-render sidebar to clear unread badge
    renderChatList();
    renderGroupList();

    msgInput.focus();
  } catch (err) {
    console.error('openChat error:', err.message);
    showGlobalToast('Could not open chat', 'error');
  }
}

// ── Open DM by userId (create if doesn't exist) ───────────
async function openDMWithUser(userId) {
  try {
    const data = await chatsAPI.createDM(userId);
    const chat = data.chat;

    // Add to cache if not already there
    if (!allChats.find(c => c._id === chat._id)) {
      allChats.unshift(chat);
    }

    await openChat(chat._id);
  } catch (err) {
    console.error('openDMWithUser error:', err.message);
    showGlobalToast('Could not open DM', 'error');
  }
}

// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages(chatId, page = 1, prepend = false) {
  try {
    const data = await messagesAPI.getAll(chatId, page);
    const msgs = data.messages || [];
    hasMoreMessages = data.pagination?.hasMore || false;

    if (!prepend) {
      messagesArea.innerHTML = '';
      const divider = document.createElement('div');
      divider.className = 'date-divider';
      divider.innerHTML = '<span>Today</span>';
      messagesArea.appendChild(divider);
    }

    const me = getMe();
    msgs.forEach((msg, idx) => {
      const prevMsg = msgs[idx - 1];
      const gap = !prevMsg || prevMsg.sender?._id !== msg.sender?._id;
      appendMessage(msg, gap, false);
    });

    if (!prepend) scrollToBottom(false);

  } catch (err) {
    console.error('loadMessages error:', err.message);
  }
}

// ============================================================
// RENDER A SINGLE MESSAGE BUBBLE
// ============================================================

function appendMessage(msg, gap = true, smooth = true) {
  const me    = getMe();
  const isSent = msg.sender?._id === me?._id;
  const chat  = allChats.find(c => c._id === (activeChatId));

  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}${gap ? ' gap-above' : ''}`;
  div.dataset.msgId = msg._id;

  let senderNameHTML = '';
  if (!isSent && chat?.isGroup && gap) {
    senderNameHTML = `<span class="msg-sender-name">${escapeHTML(msg.sender?.displayName || '')}</span>`;
  }

  div.innerHTML = `
    <div class="msg-avatar ${isSent ? 'av-0' : (msg.sender?.avatarClass || 'av-0')} ${!gap ? 'hidden-avatar' : ''}">
      ${isSent ? (me?.initials || 'Y') : (msg.sender?.initials || '?')}
    </div>
    <div class="msg-body">
      ${senderNameHTML}
      <div class="msg-bubble">${escapeHTML(msg.text)}</div>
      <span class="msg-time">${formatTime(msg.createdAt)}</span>
    </div>
  `;

  messagesArea.appendChild(div);
  if (smooth) scrollToBottom(true);
}

// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || !activeChatId) return;

  msgInput.value = '';

  // Stop typing indicator
  if (socket) socket.emit('typing:stop', { chatId: activeChatId, userId: getMe()?._id });

  try {
    await messagesAPI.send(activeChatId, text);
    // Message will arrive via socket event message:new
    // Also refresh sidebar
    refreshChatList();
  } catch (err) {
    console.error('sendMessage error:', err.message);
    showGlobalToast('Failed to send message', 'error');
    msgInput.value = text; // restore text on failure
  }
}

// ============================================================
// TYPING INDICATOR — emit to socket
// ============================================================

msgInput.addEventListener('input', () => {
  if (!activeChatId || !socket) return;
  const me = getMe();

  socket.emit('typing:start', {
    chatId:   activeChatId,
    userId:   me?._id,
    userName: me?.firstName || me?.displayName || 'Someone',
  });

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing:stop', { chatId: activeChatId, userId: me?._id });
  }, 2000);
});

// ============================================================
// PRESENCE UPDATE
// ============================================================

function updateUserPresence(userId, isOnline) {
  // Update cached users
  allUsers = allUsers.map(u =>
    u._id === userId ? { ...u, isOnline } : u
  );

  // Update cached chats
  allChats = allChats.map(chat => ({
    ...chat,
    members: chat.members.map(m =>
      m._id === userId ? { ...m, isOnline } : m
    ),
  }));

  // Update chat header if this user is the active DM partner
  if (activeChatId && !activeIsGroup) {
    const chat    = allChats.find(c => c._id === activeChatId);
    const partner = chat ? getDMPartner(chat) : null;
    if (partner?._id === userId) {
      chatHeaderStatus.textContent = isOnline ? '● Online' : '● Offline';
      chatHeaderStatus.className   = `chat-header-status${isOnline ? ' is-online' : ''}`;
    }
  }

  renderChatList();
}

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
// BACK BUTTON
// ============================================================

backBtn.addEventListener('click', () => {
  if (socket && activeChatId) {
    socket.emit('chat:leave', { chatId: activeChatId });
  }
  showNav();
  sidebar.classList.remove('hidden-mobile');
  activeChatId = null;
  emptyState.classList.remove('hidden');
  activeChat.classList.add('hidden');
  clearTimeout(typingTimer);
  typingIndicator.classList.add('hidden');
  closeChatContextMenu();
  closeMsgSearchBar();
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
});

// ============================================================
// SEARCH
// ============================================================

searchInput.addEventListener('input', () => {
  if (activeSidebarTab === 'dms') renderChatList(searchInput.value);
  else renderGroupList(searchInput.value);
});

// ============================================================
// BOTTOM NAV
// ============================================================

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(tab.dataset.view);
    if (target) target.classList.add('active');

    if (window.innerWidth <= 680) {
      if (tab.dataset.view !== 'view-chats') {
        sidebar.classList.add('hidden-mobile');
      } else if (!activeChatId) {
        sidebar.classList.remove('hidden-mobile');
      }
    }
  });
});

// ============================================================
// GROUP INFO BUTTON
// ============================================================

groupInfoBtn.addEventListener('click', () => {
  const chat = allChats.find(c => c._id === activeChatId);
  if (chat) openGroupInfoModal(chat);
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
  newGroupName.value    = '';
  selectedGroupIcon     = '🚀';
  selectedMemberIds     = new Set();

  groupIconPicker.querySelectorAll('.gip-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.icon === '🚀');
  });

  memberSelector.innerHTML = '';
  allUsers.forEach(user => {
    const chip = document.createElement('button');
    chip.className    = 'member-chip';
    chip.dataset.uid  = user._id;
    chip.innerHTML    = `
      <div class="mc-avatar ${user.avatarClass || 'av-0'}">${user.initials || '?'}</div>
      <span>${user.displayName?.split(' ')[0] || user.email}</span>
    `;
    chip.addEventListener('click', () => toggleMember(user._id, chip));
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
    const user = allUsers.find(u => u._id === uid);
    if (!user) return;
    const tag = document.createElement('div');
    tag.className = 'sm-tag';
    tag.innerHTML = `
      <div class="sm-avatar ${user.avatarClass || 'av-0'}">${user.initials || '?'}</div>
      <span>${user.displayName?.split(' ')[0] || user.email}</span>
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

createGroupBtn.addEventListener('click', async () => {
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

  try {
    createGroupBtn.disabled     = true;
    createGroupBtn.textContent  = 'Creating…';

    const data = await chatsAPI.createGroup({
      name,
      icon:      selectedGroupIcon,
      memberIds: [...selectedMemberIds],
    });

    allChats.unshift(data.chat);
    closeNewGroupModal();
    showGlobalToast(`"${name}" created`, 'success');
    switchSidebarTab('groups');
    renderGroupList();
    await openChat(data.chat._id);

  } catch (err) {
    showGlobalToast(err.message || 'Failed to create group', 'error');
  } finally {
    createGroupBtn.disabled    = false;
    createGroupBtn.textContent = 'Create chatroom';
  }
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

function openGroupInfoModal(chat) {
  const me = getMe();
  giAvatar.innerHTML = buildGroupAvatarMini(chat) + `<span class="gi-icon-badge">${chat.icon || '🚀'}</span>`;
  giAvatar.className = 'gi-avatar group-avatar-stack lg';

  const glowColor = GI_GLOW_COLORS[chat.members.length % GI_GLOW_COLORS.length];
  giGlow.style.background = glowColor;

  giName.textContent = `${chat.icon || '🚀'} ${chat.name}`;
  giMeta.textContent = `${chat.members.length} members`;

  giMembers.innerHTML = '';
  chat.members.forEach(member => {
    const isMe = member._id === me?._id;
    const row  = document.createElement('div');
    row.className = 'gi-member-row';
    row.innerHTML = `
      <div class="gi-member-avatar ${member.avatarClass || 'av-0'}">${member.initials || '?'}</div>
      <div class="gi-member-info">
        <span class="gi-member-name">${escapeHTML(member.displayName || '')}${isMe ? ' (You)' : ''}</span>
        <span class="gi-member-tag">${member.email || ''}</span>
      </div>
      <span class="gi-online-dot ${member.isOnline ? 'online' : 'offline'}"></span>
    `;
    if (!isMe) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        closeGroupInfoModal();
        openProfileModal(member);
      });
    }
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

giLeaveBtn.addEventListener('click', async () => {
  const chat = allChats.find(c => c._id === activeChatId);
  if (!chat) return;

  try {
    await chatsAPI.leaveGroup(activeChatId);
    allChats = allChats.filter(c => c._id !== activeChatId);
    closeGroupInfoModal();
    renderGroupList();
    activeChatId = null;
    emptyState.classList.remove('hidden');
    activeChat.classList.add('hidden');
    showNav();
    showGlobalToast(`Left "${chat.name}"`, 'error');
  } catch (err) {
    showGlobalToast(err.message || 'Failed to leave group', 'error');
  }
});

// ============================================================
// SETTINGS PAGE
// ============================================================

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function updateStrengthUI(pw) {
  const fill  = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  if (!fill || !label) return;
  if (!pw) { fill.style.width = '0%'; label.textContent = ''; return; }
  const s      = calcStrength(pw);
  const colors = ['#ef4444','#f97316','#eab308','#22d3a5','#00d4ff'];
  const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
  fill.style.width      = (s / 5 * 100) + '%';
  fill.style.background = colors[Math.min(s - 1, 4)] || '#ef4444';
  label.textContent     = pw ? (labels[Math.min(s - 1, 4)] || 'Very weak') : '';
}

const newPwInput = document.getElementById('newPw');
if (newPwInput) newPwInput.addEventListener('input', () => updateStrengthUI(newPwInput.value));

document.addEventListener('click', e => {
  const btn = e.target.closest('.pw-toggle');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.target);
  if (!input) return;
  input.type  = input.type === 'password' ? 'text' : 'password';
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
  showInlineToast('pwToast', '', '');
}

const savePwBtn   = document.getElementById('savePwBtn');
const cancelPwBtn = document.getElementById('cancelPwBtn');

if (savePwBtn) {
  savePwBtn.addEventListener('click', async () => {
    const cur  = document.getElementById('currentPw').value;
    const nw   = document.getElementById('newPw').value;
    const conf = document.getElementById('confirmPw').value;

    if (!cur || !nw || !conf) { showInlineToast('pwToast', 'Please fill all fields', 'error'); return; }
    if (nw !== conf)          { showInlineToast('pwToast', 'Passwords do not match', 'error'); return; }
    if (calcStrength(nw) < 2) { showInlineToast('pwToast', 'Password too weak', 'error'); return; }

    savePwBtn.textContent = 'Updating…';
    savePwBtn.disabled    = true;

    try {
      await authAPI.updatePassword({ currentPassword: cur, newPassword: nw });
      showInlineToast('pwToast', '✓ Password updated successfully', 'success');
      setTimeout(() => {
        changePassBody.classList.remove('open');
        changePassRow.classList.remove('open');
        resetPasswordForm();
      }, 1600);
    } catch (err) {
      showInlineToast('pwToast', err.message || 'Update failed', 'error');
    } finally {
      savePwBtn.textContent = 'Update Password';
      savePwBtn.disabled    = false;
    }
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
  el.className   = 'inline-toast ' + type;
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
  confirmDeleteBtn.addEventListener('click', async () => {
    const pw = document.getElementById('deleteConfirmPw').value;
    if (!pw) {
      document.getElementById('deleteConfirmPw').style.borderColor = '#f87171';
      return;
    }
    confirmDeleteBtn.textContent = 'Deleting…';
    confirmDeleteBtn.disabled    = true;

    try {
      await usersAPI.deleteAccount();
      deleteModal.classList.add('hidden');
      showGlobalToast('Account deleted — goodbye.', 'error');
      setTimeout(() => {
        localStorage.clear();
        location.reload();
      }, 1500);
    } catch (err) {
      showGlobalToast(err.message || 'Delete failed', 'error');
    } finally {
      confirmDeleteBtn.textContent = 'Yes, Delete Everything';
      confirmDeleteBtn.disabled    = false;
    }
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
  el.addEventListener('change', async () => {
    showGlobalToast(el.checked ? onMsg : offMsg, 'success');
    try {
      await usersAPI.updateProfile({
        settings: { [id.replace('Toggle','').toLowerCase()]: el.checked }
      });
    } catch (_) {}
  });
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
      themeSubLabel.textContent = btn.dataset.theme === 'dark' ? 'Dark mode active' : 'Light mode active';
      showGlobalToast(btn.dataset.theme === 'dark' ? 'Dark theme applied' : 'Light theme applied', 'success');
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
      uploadBtn.querySelector('.ap-swatch').innerHTML =
        `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    };
    reader.readAsDataURL(file);
  });
}

if (cancelAvatarBtn) cancelAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));

if (saveAvatarBtn) {
  saveAvatarBtn.addEventListener('click', async () => {
    try {
      if (pendingAvatarImg) {
        settingsAvatar.innerHTML = `<img src="${pendingAvatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        if (selfAvatar) { selfAvatar.innerHTML = settingsAvatar.innerHTML; selfAvatar.className = 'user-avatar self-avatar'; }
      } else {
        settingsAvatar.className   = `profile-avatar ${pendingAvatarClass}`;
        settingsAvatar.textContent = getMe()?.initials || 'Y';
        if (selfAvatar) {
          selfAvatar.className   = `user-avatar self-avatar ${pendingAvatarClass}`;
          selfAvatar.textContent = getMe()?.initials || 'Y';
        }
        await usersAPI.updateProfile({ avatarClass: pendingAvatarClass });
      }
      avatarModal.classList.add('hidden');
      showGlobalToast('Avatar updated', 'success');
    } catch (err) {
      showGlobalToast('Failed to save avatar', 'error');
    }
  });
}

if (avatarModal) avatarModal.addEventListener('click', e => {
  if (e.target === avatarModal) avatarModal.classList.add('hidden');
});

// ============================================================
// GLOBAL TOAST
// ============================================================

let toastTimeout = null;
function showGlobalToast(msg, type = 'success') {
  const el = document.getElementById('globalToast');
  if (!el) return;
  clearTimeout(toastTimeout);
  el.textContent = msg;
  el.className   = `global-toast ${type}`;
  toastTimeout   = setTimeout(() => el.classList.add('hidden'), 2800);
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
  'av-0':'#00d4ff','av-1':'#a855f7','av-2':'#f43f5e',
  'av-3':'#fbbf24','av-4':'#22d3a5','av-5':'#fb923c',
};

function openProfileModal(user) {
  pmAvatar.className    = `pm-avatar ${user.avatarClass || 'av-0'}`;
  pmAvatar.textContent  = user.initials || '?';
  profileModalTag.textContent = '@' + (user.displayName || user.email || 'user').toLowerCase().replace(/\s+/g,'');
  pmGlow.style.background     = GLOW_COLORS[user.avatarClass] || '#00d4ff';

  pmMessageBtn.onclick = () => {
    closeProfileModal();
    const chatsTab = document.querySelector('[data-view="view-chats"]');
    if (chatsTab) chatsTab.click();
    switchSidebarTab('dms');
    setTimeout(() => openDMWithUser(user._id), 60);
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

chatListEl.addEventListener('click', e => {
  const avatarWrap = e.target.closest('.ci-avatar-wrap');
  if (!avatarWrap) return;
  const chatItem = avatarWrap.closest('.chat-item');
  if (!chatItem || chatItem.classList.contains('group-chat-item')) return;
  e.stopPropagation();
  const chatId = chatItem.dataset.id;
  const chat   = allChats.find(c => c._id === chatId);
  if (!chat) return;
  const partner = getDMPartner(chat);
  if (partner) openProfileModal(partner);
});

const chatHeaderAvatarEl = document.getElementById('chatHeaderAvatar');
if (chatHeaderAvatarEl) {
  chatHeaderAvatarEl.addEventListener('click', () => {
    if (!activeChatId || activeIsGroup) return;
    const chat    = allChats.find(c => c._id === activeChatId);
    const partner = chat ? getDMPartner(chat) : null;
    if (partner) openProfileModal(partner);
  });
}

if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
if (profileModal) profileModal.addEventListener('click', e => {
  if (e.target === profileModal) closeProfileModal();
});

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
// 3-DOT CONTEXT MENU
// ============================================================

const chatHeaderActions = document.querySelector('.chat-header-actions');
const menuWrap = document.createElement('div');
menuWrap.className = 'hdr-menu-wrap';
const moreOptionsBtn = chatHeaderActions.querySelector('.hdr-btn[title="More options"]');
chatHeaderActions.removeChild(moreOptionsBtn);
menuWrap.appendChild(moreOptionsBtn);

const contextMenu = document.createElement('div');
contextMenu.className = 'chat-context-menu hidden';
contextMenu.id = 'chatContextMenu';
contextMenu.innerHTML = `
  <div class="ccm-item" id="ccmSearch">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    Search Messages
  </div>
  <div class="ccm-divider"></div>
  <div class="ccm-item" id="ccmMute">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    Mute Notifications
    <span class="ccm-badge" id="ccmMuteBadge">Off</span>
  </div>
  <div class="ccm-divider"></div>
  <div class="ccm-item danger" id="ccmClear">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
    Clear Chat
  </div>
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

// ── In-chat search bar ─────────────────────────────────────
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button class="msg-search-nav-btn" id="msgSearchNext" title="Next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
  <button class="msg-search-close" id="msgSearchClose" title="Close search">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
`;
const chatHeader = document.getElementById('chatHeader');
chatHeader.insertAdjacentElement('afterend', msgSearchBar);

let msgSearchMatches = [];
let msgSearchCursor  = -1;
const msgSearchInput      = document.getElementById('msgSearchInput');
const msgSearchCountLabel = document.getElementById('msgSearchCountLabel');
const msgSearchPrev       = document.getElementById('msgSearchPrev');
const msgSearchNext       = document.getElementById('msgSearchNext');
const msgSearchClose      = document.getElementById('msgSearchClose');

function openChatContextMenu() {
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
  msgSearchMatches     = [];
  msgSearchCursor      = -1;
  msgSearchCountLabel.textContent = '';
}

moreOptionsBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (!activeChatId || activeIsGroup) return;
  contextMenu.classList.contains('hidden') ? openChatContextMenu() : closeChatContextMenu();
});

document.addEventListener('click', e => {
  if (!contextMenu.classList.contains('hidden') && !menuWrap.contains(e.target)) {
    closeChatContextMenu();
  }
});

document.getElementById('ccmSearch').addEventListener('click', () => {
  closeChatContextMenu();
  msgSearchBar.classList.add('visible');
  setTimeout(() => msgSearchInput.focus(), 60);
});

msgSearchInput.addEventListener('input',   () => runMsgSearch(msgSearchInput.value.trim()));
msgSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); navigateMsgSearch(e.shiftKey ? -1 : 1); }
  if (e.key === 'Escape') closeMsgSearchBar();
});
msgSearchPrev.addEventListener('click',  () => navigateMsgSearch(-1));
msgSearchNext.addEventListener('click',  () => navigateMsgSearch(1));
msgSearchClose.addEventListener('click', closeMsgSearchBar);

function runMsgSearch(query) {
  clearMsgSearchHighlights();
  msgSearchMatches = [];
  msgSearchCursor  = -1;
  if (!query) { msgSearchCountLabel.textContent = ''; return; }
  const lower = query.toLowerCase();
  messagesArea.querySelectorAll('.message').forEach(msgEl => {
    const bubble = msgEl.querySelector('.msg-bubble');
    if (!bubble) return;
    const text = bubble.textContent || '';
    if (text.toLowerCase().includes(lower)) {
      msgEl.classList.remove('search-hidden');
      msgEl.classList.add('search-match');
      bubble.innerHTML = highlightText(escapeHTML(text), escapeHTML(query));
      msgSearchMatches.push(msgEl);
    } else {
      msgEl.classList.add('search-hidden');
    }
  });
  if (msgSearchMatches.length) { msgSearchCursor = 0; scrollToMatch(0); }
  updateSearchCountLabel();
}

function highlightText(safeText, safeQuery) {
  const regex = new RegExp(safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return safeText.replace(regex, m => `<mark>${m}</mark>`);
}

function clearMsgSearchHighlights() {
  messagesArea.querySelectorAll('.message').forEach(msgEl => {
    msgEl.classList.remove('search-hidden', 'search-match');
    const bubble = msgEl.querySelector('.msg-bubble');
    if (bubble && bubble.querySelector('mark')) bubble.innerHTML = bubble.textContent || '';
  });
}

function navigateMsgSearch(direction) {
  if (!msgSearchMatches.length) return;
  msgSearchCursor = (msgSearchCursor + direction + msgSearchMatches.length) % msgSearchMatches.length;
  scrollToMatch(msgSearchCursor);
  updateSearchCountLabel();
}

function scrollToMatch(idx) {
  msgSearchMatches.forEach(el => el.style.outline = '');
  const target = msgSearchMatches[idx];
  if (!target) return;
  target.style.outline       = '2px solid var(--cyan)';
  target.style.outlineOffset = '3px';
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function updateSearchCountLabel() {
  msgSearchCountLabel.textContent = msgSearchMatches.length
    ? `${msgSearchCursor + 1} / ${msgSearchMatches.length}`
    : 'No results';
}

document.getElementById('ccmMute').addEventListener('click', () => {
  closeChatContextMenu();
  showGlobalToast('Mute coming soon', 'success');
});

document.getElementById('ccmClear').addEventListener('click', async () => {
  if (!activeChatId) return;
  closeChatContextMenu();
  try {
    await messagesAPI.clearChat(activeChatId);
    messagesArea.innerHTML = '';
    showGlobalToast('Chat cleared', 'success');
  } catch (err) {
    showGlobalToast('Failed to clear chat', 'error');
  }
});

document.getElementById('ccmDelete').addEventListener('click', async () => {
  if (!activeChatId) return;
  closeChatContextMenu();
  try {
    await chatsAPI.deleteChat(activeChatId);
    allChats  = allChats.filter(c => c._id !== activeChatId);
    activeChatId = null;
    emptyState.classList.remove('hidden');
    activeChat.classList.add('hidden');
    sidebar.classList.remove('hidden-mobile');
    showNav();
    renderChatList();
    showGlobalToast('Chat deleted', 'success');
  } catch (err) {
    showGlobalToast('Failed to delete chat', 'error');
  }
});

// ============================================================
// INIT
// ============================================================

async function init() {
  const user = getMe();
  if (!user) return; // auth not done yet — twat-auth.js handles redirect

  // Connect socket
  connectSocket(user);

  // Load sidebar data
  switchSidebarTab('dms');
  await loadAndRenderSidebar();

  newGroupBtn.style.opacity      = '0.4';
  newGroupBtn.style.pointerEvents = 'none';
}

// Called by twat-auth.js after login/register or session restore
window.onAppUnlocked = function (user) {
  connectSocket(user);
  loadAndRenderSidebar();
};

init();