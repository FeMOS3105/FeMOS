/* ================================================================
   FeMOS app.js — Global App Controller
   Loaded on every page: toast · confirm · theme · clock · SW
================================================================ */

'use strict';

const App = (() => {

  /* ── Theme ── */
  const Theme = {
    _key: 'femos_theme',

    get() {
      return localStorage.getItem(this._key) || 'dark';
    },

    set(theme) {
      localStorage.setItem(this._key, theme);
      document.documentElement.setAttribute('data-theme', theme);
      this._syncUI(theme);
    },

    toggle() {
      const next = this.get() === 'dark' ? 'light' : 'dark';
      this.set(next);
      Toast.show({
        icon:  next === 'dark' ? '🌙' : '☀️',
        title: next === 'dark' ? 'Dark mode' : 'Light mode',
      });
      if (navigator.vibrate) navigator.vibrate([12]);
    },

    init() {
      const t = this.get();
      document.documentElement.setAttribute('data-theme', t);
      this._syncUI(t);
    },

    _syncUI(theme) {
      const isDark = theme === 'dark';
      // Sync all toggle buttons
      document.querySelectorAll('[data-theme-toggle]').forEach(el => {
        if (el.tagName === 'INPUT') el.checked = isDark;
        else el.classList.toggle('on', isDark);
      });
      // Sync label text
      document.querySelectorAll('[data-theme-label]').forEach(el => {
        el.textContent = isDark ? 'Dark mode' : 'Light mode';
      });
      // Sync icons
      document.querySelectorAll('[data-theme-icon]').forEach(el => {
        el.textContent = isDark ? '🌙' : '☀️';
      });
    },
  };

  /* ── Clock ── */
  const Clock = {
    _interval: null,

    start() {
      this._tick();
      this._interval = setInterval(() => this._tick(), 10000);
    },

    stop() {
      clearInterval(this._interval);
    },

    _tick() {
      const now = new Date();
      const h   = String(now.getHours()).padStart(2, '0');
      const m   = String(now.getMinutes()).padStart(2, '0');
      document.querySelectorAll('[data-live-clock]').forEach(el => {
        el.textContent = `${h}:${m}`;
      });
    },
  };

  /* ── Toast ── */
  const Toast = {
    _portal: null,

    _getPortal() {
      if (this._portal) return this._portal;
      this._portal = document.getElementById('toast-portal');
      if (!this._portal) {
        this._portal = document.createElement('div');
        this._portal.id = 'toast-portal';
        document.body.appendChild(this._portal);
      }
      return this._portal;
    },

    /**
     * Show a toast notification
     * @param {object|string} opts - { icon, title, desc, type } or plain string
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     */
    show(opts, type = 'success') {
      if (typeof opts === 'string') opts = { title: opts, icon: type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅' };

      const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      const icon  = opts.icon || ICONS[opts.type || type] || '✅';

      const el = document.createElement('div');
      el.className = `toast ${opts.type || type}`;
      el.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-body">
          <div class="toast-title">${Utils.Str.escape(opts.title || '')}</div>
          ${opts.desc ? `<div class="toast-desc">${Utils.Str.escape(opts.desc)}</div>` : ''}
        </div>
      `;

      this._getPortal().appendChild(el);
      setTimeout(() => el.remove(), 3500);
    },

    success(title, desc)   { this.show({ title, desc, type: 'success', icon: '✅' }); },
    error(title, desc)     { this.show({ title, desc, type: 'error',   icon: '❌' }); },
    warning(title, desc)   { this.show({ title, desc, type: 'warning', icon: '⚠️' }); },
    info(title, desc)      { this.show({ title, desc, type: 'info',    icon: 'ℹ️' }); },
  };

  /* ── Confirm Dialog ── */
  const Confirm = {
    _cb: null,

    show({ emoji = '⚠️', title, desc, okLabel = 'Thibitisha', okClass = 'btn-danger', cb }) {
      const dialog = document.getElementById('confirm-dialog');
      if (!dialog) return;

      Utils.DOM.setText('confirm-emoji', emoji);
      Utils.DOM.setText('confirm-title', title);
      Utils.DOM.setText('confirm-desc',  desc);

      const okBtn = document.getElementById('confirm-ok');
      if (okBtn) {
        okBtn.textContent = okLabel;
        okBtn.className   = `btn ${okClass}`;
      }

      this._cb = cb;
      dialog.classList.add('open');
      if (navigator.vibrate) navigator.vibrate([10]);
    },

    _confirm() {
      const dialog = document.getElementById('confirm-dialog');
      if (dialog) dialog.classList.remove('open');
      if (this._cb) { this._cb(); this._cb = null; }
    },

    _cancel() {
      const dialog = document.getElementById('confirm-dialog');
      if (dialog) dialog.classList.remove('open');
      this._cb = null;
    },

    init() {
      const dialog = document.getElementById('confirm-dialog');
      if (!dialog) return;

      document.getElementById('confirm-ok')?.addEventListener('click', () => this._confirm());
      document.getElementById('confirm-cancel')?.addEventListener('click', () => this._cancel());
      dialog.addEventListener('click', e => {
        if (e.target === dialog) this._cancel();
      });
    },
  };

  /* ── Modal ── */
  const Modal = {
    open(id) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (navigator.vibrate) navigator.vibrate([8]);
      }
    },

    close(id) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('open');
        document.body.style.overflow = '';
      }
    },

    init() {
      // Close modal on overlay click
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
          if (e.target === overlay) this.close(overlay.id);
        });
      });

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.open').forEach(el => {
            this.close(el.id);
          });
        }
      });
    },
  };

  /* ── Network status ── */
  const Network = {
    init() {
      const update = () => {
        const online = navigator.onLine;
        document.querySelectorAll('[data-network-status]').forEach(el => {
          el.textContent = online ? '●●●●' : '○○○○';
          el.style.color = online ? '' : 'var(--clr-warning)';
        });
        if (!online) {
          Toast.warning('Offline', 'FeMOS inaendelea kufanya kazi bila intaneti');
        }
      };

      window.addEventListener('online',  () => {
        update();
        Toast.success('Mtandao umerejea', 'Data inasync sasa');
      });
      window.addEventListener('offline', update);
    },
  };

  /* ── Service Worker ── */
  async function registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        // Detect base path
        const base = window.location.pathname.includes('/pages/')
          ? '../sw.js'
          : 'sw.js';
        await navigator.serviceWorker.register(base);
        console.log('[FeMOS] Service Worker registered');
      } catch (e) {
        console.warn('[FeMOS] SW registration failed:', e);
      }
    }
  }

  /* ── Keyboard shortcuts ── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        Theme.toggle();
      }
    });
  }

  /* ── Status bar clock display ── */
  function updateStatusBar() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    document.querySelectorAll('.status-bar .time').forEach(el => {
      el.textContent = `${h}:${m}`;
    });
  }

  /* ── INIT — called on every page ── */
  async function init() {
    // 1. Theme
    Theme.init();

    // 2. Clock
    Clock.start();

    // 3. Confirm dialog
    Confirm.init();

    // 4. Modals
    Modal.init();

    // 5. Network
    Network.init();

    // 6. Keyboard
    initKeyboard();

    // 7. Service Worker (non-blocking)
    registerSW();

    // 8. Theme toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.addEventListener('click', () => Theme.toggle());
    });

    console.log('%c⚡ FeMOS v1.0', 'color:#00D4FF;font-weight:800;font-size:13px;');
  }

  return {
    init,
    Theme,
    Clock,
    Toast,
    Confirm,
    Modal,
    Network,
  };

})();

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
