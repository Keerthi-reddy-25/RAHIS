/* ============================================
   Shared Utilities & Theme Management
   ============================================ */

const App = {
  // ── Theme Management ──
  initTheme() {
    const saved = localStorage.getItem('habitiq-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeIcons(saved);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('habitiq-theme', next);
    this.updateThemeIcons(next);
  },

  updateThemeIcons(theme) {
    // Icons handled purely via CSS transitions
  },

  // ── Auth Guard ──
  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  getCurrentUser() {
    return localStorage.getItem('habitiq-currentUser');
  },

  logout() {
    localStorage.removeItem('habitiq-currentUser');
    window.location.href = 'login.html';
  },

  // ── Toast Notifications ──
  showToast(message, icon = '✨') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ── Message Display ──
  showMessage(elementId, text, type = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `message message-${type} show`;
    if (type === 'success') {
      setTimeout(() => { el.classList.remove('show'); }, 3000);
    }
  },

  hideMessage(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.remove('show');
  },

  // ── Data Helpers ──
  getUsers() {
    return JSON.parse(localStorage.getItem('habitiq-users') || '{}');
  },

  saveUsers(users) {
    localStorage.setItem('habitiq-users', JSON.stringify(users));
  },

  getHabitData(username) {
    const all = JSON.parse(localStorage.getItem('habitiq-habits') || '{}');
    return all[username] || [];
  },

  saveHabitEntry(username, entry) {
    const all = JSON.parse(localStorage.getItem('habitiq-habits') || '{}');
    if (!all[username]) all[username] = [];
    // Replace today's entry if it exists
    const todayKey = new Date().toISOString().split('T')[0];
    const idx = all[username].findIndex(e => e.date === todayKey);
    if (idx >= 0) {
      all[username][idx] = entry;
    } else {
      all[username].push(entry);
    }
    localStorage.setItem('habitiq-habits', JSON.stringify(all));
  },

  getStreak(username) {
    const data = this.getHabitData(username);
    if (data.length === 0) return 0;

    // Sort descending
    const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const entryDate = new Date(sorted[i].date);
      entryDate.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);

      if (entryDate.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  },

  // ── Format Helpers ──
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  },

  // ── Initialization ──
  init() {
    this.initTheme();

    // Bind theme toggle
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Bind logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Set active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      }
    });
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => App.init());
