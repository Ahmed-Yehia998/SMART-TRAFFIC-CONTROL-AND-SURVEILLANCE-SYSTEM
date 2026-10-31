/**
 * App Core — Auth, Layout, Utilities, Toasts, Modals
 */

const App = (() => {
  const AUTH_KEY = 'stcs_auth';
  const SETTINGS_KEY = 'stcs_settings';

  /* ---------- Auth ---------- */
  function isAuthenticated() {
    try {
      const data = JSON.parse(localStorage.getItem(AUTH_KEY));
      return data && data.loggedIn === true;
    } catch {
      return false;
    }
  }

  function login(username, remember) {
    const data = {
      loggedIn: true,
      username,
      loginTime: Date.now(),
      remember
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY)) || {};
    } catch {
      return {};
    }
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  /* ---------- Settings ---------- */
  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
        sidebarCollapsed: false,
        notifications: true,
        soundAlerts: false,
        autoRefresh: true,
        refreshInterval: 3
      };
    } catch {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  /* ---------- Toast ---------- */
  function showToast(title, message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ---------- Modal ---------- */
  function showModal({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, danger = false }) {
    // Remove existing
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">${cancelText}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('active'));

    const close = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 250);
    };

    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.querySelector('.modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.modal-confirm').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      close();
    });
  }

  /* ---------- Time Formatting ---------- */
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatDateTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function timeAgo(ts) {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  /* ---------- Live Clock ---------- */
  function startClock(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    };
    update();
    setInterval(update, 1000);
  }

  /* ---------- Sidebar ---------- */
  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    const settings = getSettings();

    if (settings.sidebarCollapsed && window.innerWidth > 768) {
      sidebar?.classList.add('collapsed');
    }

    // Set active nav item based on current page
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href === page || (page === '' && href === 'dashboard.html')) {
        item.classList.add('active');
      }
    });

    toggle?.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar?.classList.toggle('mobile-open');
        overlay?.classList.toggle('active');
      } else {
        sidebar?.classList.toggle('collapsed');
        const s = getSettings();
        s.sidebarCollapsed = sidebar.classList.contains('collapsed');
        saveSettings(s);
      }
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });

    // Logout
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal({
          title: 'Sign Out',
          body: 'Are you sure you want to sign out of the control system?',
          confirmText: 'Sign Out',
          danger: true,
          onConfirm: logout
        });
      });
    });

    // User name
    const user = getUser();
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.username || 'Operator';
    });
  }

  /* ---------- Priority Badge Helper ---------- */
  function priorityBadge(priority) {
    return `<span class="badge badge-${priority}">${priority}</span>`;
  }

  function statusBadge(status) {
    if (status === 'online' || status === 'active' || status === 'resolved') {
      return `<span class="badge badge-success">${status}</span>`;
    }
    if (status === 'offline') {
      return `<span class="badge badge-offline">${status}</span>`;
    }
    return `<span class="badge badge-medium">${status}</span>`;
  }

  /* ---------- Loading ---------- */
  function hideLoader() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 400);
    }
  }

  /* ---------- Init shared layout ---------- */
  function initLayout() {
    if (!requireAuth()) return;
    initSidebar();
    startClock('.header-time');
    hideLoader();

    // Start simulation if not already
    TrafficSimulation.start();
  }

  return {
    isAuthenticated,
    login,
    logout,
    getUser,
    requireAuth,
    getSettings,
    saveSettings,
    showToast,
    showModal,
    formatTime,
    formatDateTime,
    timeAgo,
    startClock,
    initSidebar,
    initLayout,
    priorityBadge,
    statusBadge,
    hideLoader
  };
})();
