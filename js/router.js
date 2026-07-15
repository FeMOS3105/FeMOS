/* ================================================================
   FeMOS router.js — Client-Side Router
   File-based navigation between HTML pages
================================================================ */

'use strict';

const Router = (() => {

  const _history = [];
  let   _current = null;

  /* ── Navigate to another HTML page ── */
  function go(path, params = {}) {
    // Build query string from params
    const qs = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';

    // Avoid double-navigation
    const target = path + qs;
    if (window.location.pathname.endsWith(path) && !qs) return;

    _history.push(window.location.href);
    window.location.href = target;
  }

  /* ── Navigate back ── */
  function back() {
    if (_history.length > 0) {
      window.history.back();
    } else {
      go('index.html');
    }
  }

  /* ── Get query param ── */
  function param(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  /* ── Get all params as object ── */
  function params() {
    const result = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      result[k] = v;
    });
    return result;
  }

  /* ── Auth guard — redirect if not logged in ── */
  function requireAuth(redirectTo = '../pages/login.html') {
    if (!Auth.Session.isValid()) {
      window.location.replace(redirectTo);
      return false;
    }
    return true;
  }

  /* ── Auth guard — redirect if already logged in ── */
  function requireGuest(redirectTo = 'home.html') {
    if (Auth.Session.isValid()) {
      window.location.replace(redirectTo);
      return false;
    }
    return true;
  }

  /* ── Get current page name ── */
  function currentPage() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1].replace('.html', '');
  }

  /* ── Resolve paths relative to pages/ directory ── */
  const PAGES = {
    splash:        '../index.html',
    login:         'login.html',
    register:      'register.html',
    profileSetup:  'profile-setup.html',
    pending:       'pending.html',
    approved:      'approved.html',
    home:          'home.html',
    attendance:    'attendance.html',
    attHistory:    'att-history.html',
    announcements: 'announcements.html',
    compose:       'compose.html',
    profile:       'profile.html',
    approvals:     'approvals.html',
  };

  return {
    go,
    back,
    param,
    params,
    requireAuth,
    requireGuest,
    currentPage,
    PAGES,
  };

})();

window.Router = Router;
