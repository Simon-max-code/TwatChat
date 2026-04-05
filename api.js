/* ============================================================
   TwatChat — api.js
   Base API config — all fetch calls go through here
   ============================================================ */

'use strict';

const BASE_URL = 'https://twatchat-backend.onrender.com/api';

// ── Get token from localStorage ────────────────────────────
const getToken = () => localStorage.getItem('twatchat_token');

// ── Base fetch wrapper ─────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ── Auth API ───────────────────────────────────────────────
const authAPI = {
  register: (body) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  login: (body) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  getMe: () => request('/auth/me'),

  updatePassword: (body) => request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
};

// ── Users API ──────────────────────────────────────────────
const usersAPI = {
  getAll: (search = '') => request(`/users${search ? `?search=${search}` : ''}`),

  getOne: (id) => request(`/users/${id}`),

  updateProfile: (body) => request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  deleteAccount: () => request('/users/me', { method: 'DELETE' }),
};

// ── Chats API ──────────────────────────────────────────────
const chatsAPI = {
  getAll: () => request('/chats'),

  getOne: (chatId) => request(`/chats/${chatId}`),

  createDM: (userId) => request('/chats', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),

  deleteChat: (chatId) => request(`/chats/${chatId}`, { method: 'DELETE' }),

  createGroup: (body) => request('/chats/group', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  updateGroup: (chatId, body) => request(`/chats/group/${chatId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  leaveGroup: (chatId) => request(`/chats/group/${chatId}/leave`, {
    method: 'DELETE',
  }),
};

// ── Messages API ───────────────────────────────────────────
const messagesAPI = {
  getAll: (chatId, page = 1) => request(`/chats/${chatId}/messages?page=${page}&limit=40`),

  send: (chatId, text) => request(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),

  deleteOne: (chatId, msgId) => request(`/chats/${chatId}/messages/${msgId}`, {
    method: 'DELETE',
  }),

  clearChat: (chatId) => request(`/chats/${chatId}/messages`, { method: 'DELETE' }),
};