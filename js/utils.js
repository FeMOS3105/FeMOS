/* ================================================================
   FeMOS utils.js — Shared Utility Library
   Pure functions — no DOM dependencies
================================================================ */

'use strict';

const Utils = (() => {

  /* ── ID Generation ── */
  const ID = {
    /** Short random ID (9 chars) */
    short() {
      return Math.random().toString(36).slice(2, 6) +
             Date.now().toString(36).slice(-4);
    },

    /** Session ID */
    session() {
      return 'sess_' + this.short() + this.short();
    },

    /**
     * Generate FeMOS Unique ID
     * Format: FEMOS-[UNI]-[CAMPUS]-[YEAR]-[SEQ6]
     */
    femsUID(uniCode = 'MUST', campusCode = 'MC') {
      const year = new Date().getFullYear();
      const seq  = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
      return `FEMOS-${uniCode.toUpperCase()}-${campusCode.toUpperCase()}-${year}-${seq}`;
    },
  };

  /* ── Date / Time ── */
  const DateTime = {
    /** Format date: 'HH:MM', 'DD/Mo', 'DD/Mo/YYYY HH:MM' */
    format(date, pattern = 'HH:MM') {
      const d   = date instanceof Date ? date : new Date(date);
      const pad = n => String(n).padStart(2, '0');
      return pattern
        .replace('YYYY', d.getFullYear())
        .replace('Mo',   pad(d.getMonth() + 1))
        .replace('DD',   pad(d.getDate()))
        .replace('HH',   pad(d.getHours()))
        .replace('MM',   pad(d.getMinutes()))
        .replace('SS',   pad(d.getSeconds()));
    },

    /** Human-readable "time ago" */
    timeAgo(ts) {
      const secs = Math.floor((Date.now() - ts) / 1000);
      if (secs < 60)    return 'Just now';
      if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
      if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
      if (secs < 604800)return `${Math.floor(secs / 86400)}d ago`;
      return this.format(new Date(ts), 'DD/Mo/YYYY');
    },

    /** Elapsed time MM:SS from a start timestamp */
    elapsed(startTs) {
      const ms = Date.now() - startTs;
      const m  = Math.floor(ms / 60000);
      const s  = Math.floor((ms % 60000) / 1000);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    /** Today's greeting based on hour */
    greeting() {
      const h = new Date().getHours();
      if (h < 5)  return 'Good night,';
      if (h < 12) return 'Good morning,';
      if (h < 17) return 'Good afternoon,';
      if (h < 21) return 'Good evening,';
      return 'Good night,';
    },

    /** Current time string HH:MM */
    now() {
      return this.format(new Date(), 'HH:MM');
    },
  };

  /* ── String helpers ── */
  const Str = {
    /** Get initials from full name (max 2 chars) */
    initials(name = '') {
      return (name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('') || '?';
    },

    /** Capitalize first letter of each word */
    titleCase(str = '') {
      return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    },

    /** Truncate text with ellipsis */
    truncate(str = '', maxLen = 80) {
      return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
    },

    /** Sanitize HTML to prevent XSS */
    escape(str = '') {
      const el = document.createElement('div');
      el.textContent = str;
      return el.innerHTML;
    },
  };

  /* ── Validation ── */
  const Validate = {
    email(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    },

    phone(val) {
      return /^(\+255|0)[67]\d{8}$/.test(val.replace(/\s/g, ''));
    },

    password(val) {
      return val && val.length >= 6;
    },

    name(val) {
      return val && val.trim().split(' ').filter(Boolean).length >= 1;
    },

    regNo(val) {
      // At least 5 chars
      return val && val.trim().length >= 5;
    },
  };

  /* ── Color palette ── */
  const AVATAR_COLORS = [
    { id: 0, from: '#4FC3F7', to: '#29B6F6', class: 'av-1' },
    { id: 1, from: '#7E57C2', to: '#29B6F6', class: 'av-2' },
    { id: 2, from: '#26A69A', to: '#4FC3F7', class: 'av-3' },
    { id: 3, from: '#FFB74D', to: '#FF8A65', class: 'av-4' },
    { id: 4, from: '#EF5350', to: '#7E57C2', class: 'av-5' },
    { id: 5, from: '#29B6F6', to: '#5C6BC0', class: 'av-6' },
    { id: 6, from: '#EF5350', to: '#FFB74D', class: 'av-7' },
    { id: 7, from: '#4FC3F7', to: '#7E57C2', class: 'av-8' },
  ];

  const AVATAR_EMOJIS = [
    '👤','👩','👨','🧑',
    '👩‍💻','👨‍💻','👩‍🏫','👨‍🏫',
    '🧑‍🎓','👮','🧑‍💼','🧑‍🔧',
    '👩‍🔬','👨‍🔬','🎓','🌟',
  ];

  function avatarGradient(colorId = 0) {
    const c = AVATAR_COLORS[colorId] || AVATAR_COLORS[0];
    return `linear-gradient(135deg, ${c.from}, ${c.to})`;
  }

  /* ── DOM helpers ── */
  const DOM = {
    /** Get element by ID */
    id(id) { return document.getElementById(id); },

    /** Query selector */
    q(sel, ctx = document)  { return ctx.querySelector(sel); },
    qa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; },

    /** Show / hide */
    show(el)    { if (el) el.classList.remove('hidden'); },
    hide(el)    { if (el) el.classList.add('hidden'); },
    toggle(el, cond) { if (el) el.classList.toggle('hidden', !cond); },

    /** Set text content safely */
    setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text ?? '';
    },

    /** Set inner HTML (use only with sanitized data) */
    setHTML(id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    },

    /** Add/remove class */
    addClass(el, cls)    { if (el) el.classList.add(cls); },
    removeClass(el, cls) { if (el) el.classList.remove(cls); },

    /** Create element */
    create(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k.startsWith('data-')) el.setAttribute(k, v);
        else el[k] = v;
      });
      children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child) el.appendChild(child);
      });
      return el;
    },
  };

  /* ── Device & Platform ── */
  const Device = {
    _fp: null,

    async fingerprint() {
      if (this._fp) return this._fp;
      const cached = DB.LS.get('device_fp');
      if (cached) { this._fp = cached; return this._fp; }

      const signals = [
        navigator.userAgent,
        navigator.language,
        `${screen.width}x${screen.height}`,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || '',
        navigator.deviceMemory || '',
        navigator.platform || '',
      ].join('|');

      let hash = 0;
      for (let i = 0; i < signals.length; i++) {
        hash = ((hash << 5) - hash) + signals.charCodeAt(i);
        hash |= 0;
      }

      this._fp = 'fp_' + Math.abs(hash).toString(36);
      DB.LS.set('device_fp', this._fp);
      return this._fp;
    },

    isMobile() {
      return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    supportsNotifications() {
      return 'Notification' in window;
    },

    supportsNFC() {
      return 'NDEFReader' in window;
    },

    supportsGeolocation() {
      return 'geolocation' in navigator;
    },

    vibrate(pattern = [10]) {
      if (navigator.vibrate) navigator.vibrate(pattern);
    },
  };

  /* ── Geolocation ── */
  const Geo = {
    _cache: null,
    _cacheTs: 0,
    CACHE_TTL: 30000,

    async getPosition() {
      if (this._cache && (Date.now() - this._cacheTs) < this.CACHE_TTL) {
        return this._cache;
      }
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not available in this browser'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            this._cache = {
              lat:      pos.coords.latitude,
              lng:      pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              ts:       Date.now(),
            };
            this._cacheTs = Date.now();
            resolve(this._cache);
          },
          err => reject(err),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
      });
    },

    /** Haversine distance in meters */
    distance(lat1, lng1, lat2, lng2) {
      const R    = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a    = Math.sin(dLat / 2) ** 2 +
                   Math.cos(lat1 * Math.PI / 180) *
                   Math.cos(lat2 * Math.PI / 180) *
                   Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    isWithin(userLat, userLng, targetLat, targetLng, radiusM = 60) {
      return this.distance(userLat, userLng, targetLat, targetLng) <= radiusM;
    },
  };

  /* ── QR Token ── */
  const QR = {
    /** Generate a 30-second rotating token bound to a session */
    genToken(sessionId) {
      const window30 = Math.floor(Date.now() / 30000);
      const raw      = `FEMOS|${sessionId}|${window30}`;
      return btoa(raw);
    },

    /** Verify a scanned token */
    verifyToken(token, sessionId) {
      try {
        const decoded = atob(token);
        const [prefix, sid, tsStr] = decoded.split('|');
        const ts  = parseInt(tsStr, 10);
        const now = Math.floor(Date.now() / 30000);
        return prefix === 'FEMOS' && sid === sessionId && Math.abs(ts - now) <= 1;
      } catch {
        return false;
      }
    },

    /** Draw a pseudo-QR on canvas (production: use qrcode.js library) */
    drawOnCanvas(canvas, data, opts = {}) {
      if (!canvas) return;
      const ctx     = canvas.getContext('2d');
      const size    = canvas.width;
      const isDark  = document.documentElement.getAttribute('data-theme') !== 'light';
      const bg      = isDark ? '#101F3A' : '#FFFFFF';
      const fg      = isDark ? '#F0F4FF' : '#080F1E';
      const accent  = '#29B6F6';
      const modules = opts.modules || 23;
      const cell    = size / modules;

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      let seed = 0;
      for (let i = 0; i < data.length; i++) {
        seed = ((seed << 5) - seed) + data.charCodeAt(i);
        seed |= 0;
      }

      let rng = Math.abs(seed);
      ctx.fillStyle = fg;

      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF;
          const on     = (rng >>> 0) % 3 !== 0;
          const finder = (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
          if (!finder && on) {
            ctx.fillRect(c * cell + 0.5, r * cell + 0.5, cell - 1, cell - 1);
          }
        }
      }

      // Finder patterns
      [[0, 0], [0, modules - 7], [modules - 7, 0]].forEach(([dr, dc]) => {
        ctx.fillStyle = fg;
        ctx.fillRect(dc * cell, dr * cell, 7 * cell, 7 * cell);
        ctx.fillStyle = bg;
        ctx.fillRect((dc + 1) * cell, (dr + 1) * cell, 5 * cell, 5 * cell);
        ctx.fillStyle = accent;
        ctx.fillRect((dc + 2) * cell, (dr + 2) * cell, 3 * cell, 3 * cell);
      });

      // Center label
      const cx = size / 2, cy = size / 2;
      const lw = size * 0.22;
      ctx.fillStyle = bg;
      ctx.fillRect(cx - lw / 2 - 2, cy - lw / 2 - 2, lw + 4, lw + 4);
      ctx.fillStyle = accent;
      ctx.font      = `bold ${Math.round(size * 0.075)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FeMOS', cx, cy);
    },
  };

  /* ── Attendance ── */
  const AttCalc = {
    PRESENT_MINS:  15,
    LATE_MINS:     30,

    getStatus(signInTs, sessionStartTs) {
      const mins = (signInTs - sessionStartTs) / 60000;
      if (mins <= this.PRESENT_MINS) return 'present';
      if (mins <= this.LATE_MINS)    return 'late';
      return 'partial';
    },

    STATUS: {
      present:      { label: 'Present',    tagClass: 'tag-green'  },
      late:         { label: 'Late',       tagClass: 'tag-amber'  },
      partial:      { label: 'Partial',    tagClass: 'tag-amber'  },
      'left-early': { label: 'Left Early', tagClass: 'tag-purple' },
      absent:       { label: 'Absent',     tagClass: 'tag-red'    },
      fraud:        { label: 'Flagged',    tagClass: 'tag-red'    },
    },

    summary(list) {
      const out = { present: 0, late: 0, partial: 0, 'left-early': 0, absent: 0, fraud: 0 };
      list.forEach(r => { out[r.status] = (out[r.status] || 0) + 1; });
      return out;
    },
  };

  return {
    ID,
    DateTime,
    Str,
    Validate,
    AVATAR_COLORS,
    AVATAR_EMOJIS,
    avatarGradient,
    DOM,
    Device,
    Geo,
    QR,
    AttCalc,
  };

})();

window.Utils = Utils;
