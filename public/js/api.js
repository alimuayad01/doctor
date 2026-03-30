const API_BASE = '/api';

// Auth helpers
const getToken = () => localStorage.getItem('tabibi_token');
const getUser = () => {
  const u = localStorage.getItem('tabibi_user');
  return u ? JSON.parse(u) : null;
};
const setAuth = (token, user) => {
  localStorage.setItem('tabibi_token', token);
  localStorage.setItem('tabibi_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('tabibi_token');
  localStorage.removeItem('tabibi_user');
};

// Fetch wrapper
const api = async (method, endpoint, data = null, isFormData = false) => {
  const token = getToken();
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = isFormData ? data : JSON.stringify(data);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'حدث خطأ');
    return json;
  } catch (err) {
    throw err;
  }
};

// Toast notification system
const showToast = (message, type = 'info', duration = 3500) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-20px)'; setTimeout(() => toast.remove(), 300); }, duration);
};

// Star rating component
const createStarRating = (containerId, onRate) => {
  const el = document.getElementById(containerId);
  if (!el) return;
  let selected = 0;
  el.className = 'star-rating';
  el.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.innerHTML = '★';
    star.addEventListener('click', () => { selected = i; updateStars(); if (onRate) onRate(i); });
    star.addEventListener('mouseover', () => highlight(i));
    star.addEventListener('mouseout', () => updateStars());
    el.appendChild(star);
  }
  const highlight = (n) => { el.querySelectorAll('.star').forEach((s, idx) => s.classList.toggle('filled', idx < n)); };
  const updateStars = () => { el.querySelectorAll('.star').forEach((s, idx) => s.classList.toggle('filled', idx < selected)); };
  return () => selected;
};

// Redirect if not logged in
const requireAuth = (redirectTo = '/login.html') => {
  if (!getToken()) { window.location.href = redirectTo; return false; }
  return true;
};

// Redirect if logged in (for login/register pages)
const redirectIfLoggedIn = () => {
  const user = getUser();
  if (user && getToken()) {
    const dashboards = { doctor: '/dashboard-doctor.html', institution: '/dashboard-institution.html', patient: '/dashboard-patient.html' };
    window.location.href = dashboards[user.role] || '/dashboard-patient.html';
    return true;
  }
  return false;
};

// Format date in Arabic
const formatDateAr = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Render stars
const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) stars += '★';
    else if (i === full && half) stars += '½';
    else stars += '☆';
  }
  return `<span class="stars">${stars}</span>`;
};

// Status badges
const statusBadge = (status) => {
  const map = {
    confirmed: { label: 'مؤكد', cls: 'badge-success' },
    pending: { label: 'قيد الانتظار', cls: 'badge-warning' },
    cancelled: { label: 'ملغي', cls: 'badge-danger' },
    completed: { label: 'مكتمل', cls: 'badge-primary' },
    no_show: { label: 'لم يحضر', cls: 'badge-danger' },
    ready: { label: 'جاهز', cls: 'badge-success' },
    processing: { label: 'قيد المعالجة', cls: 'badge-warning' },
    delivered: { label: 'تم الاستلام', cls: 'badge-primary' },
  };
  const s = map[status] || { label: status, cls: 'badge-primary' };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
};
