/* ================================================================
   FeMOS db.js — IndexedDB Engine
   Offline-first local database layer
   All async, Promise-based, with graceful fallback to localStorage
================================================================ */

'use strict';

const DB = (() => {

  const DB_NAME    = 'FeMOS_DB';
  const DB_VERSION = 1;
  let   _db        = null;

  /* ── Schema ── */
  const STORES = {
    users:         { keyPath: 'id' },
    sessions:      { keyPath: 'id' },
    attendance:    { keyPath: 'id' },
    announcements: { keyPath: 'id' },
    sync_queue:    { keyPath: 'id', autoIncrement: true },
    settings:      { keyPath: 'key' },
  };

  /* ── Open / Init ── */
  function open() {
    return new Promise((resolve, reject) => {
      if (_db) { resolve(_db); return; }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const db = e.target.result;
        Object.entries(STORES).forEach(([name, opts]) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, opts);
          }
        });
      };

      req.onsuccess = e => {
        _db = e.target.result;
        _db.onerror = ev => console.error('[DB] Error:', ev.target.error);
        resolve(_db);
      };

      req.onerror   = () => reject(req.error);
      req.onblocked = () => reject(new Error('DB blocked — close other tabs'));
    });
  }

  /* ── Generic CRUD ── */
  async function put(storeName, value) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  async function get(storeName, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  }

  async function getAll(storeName) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  }

  async function del(storeName, key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  }

  async function clearStore(storeName) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  }

  /* ── Settings shorthand (key-value) ── */
  const Settings = {
    async set(key, value) {
      return put('settings', { key, value, updatedAt: Date.now() });
    },
    async get(key, fallback = null) {
      const row = await get('settings', key);
      return row ? row.value : fallback;
    },
    async remove(key) { return del('settings', key); },
  };

  /* ── localStorage fallback (simple KV) ── */
  const LS = {
    _p: 'femos_',
    set(k, v) {
      try { localStorage.setItem(this._p + k, JSON.stringify(v)); return true; }
      catch { return false; }
    },
    get(k, fallback = null) {
      try {
        const raw = localStorage.getItem(this._p + k);
        return raw !== null ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    remove(k) { try { localStorage.removeItem(this._p + k); } catch {} },
    clear() {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this._p))
        .forEach(k => localStorage.removeItem(k));
    },
  };

  /* ── Sync Queue ── */
  const SyncQueue = {
    async push(operation) {
      return put('sync_queue', {
        ...operation,
        queuedAt: Date.now(),
        retries: 0,
      });
    },
    async getAll()    { return getAll('sync_queue'); },
    async remove(id)  { return del('sync_queue', id); },
    async clear()     { return clearStore('sync_queue'); },
  };

  return {
    open,
    put,
    get,
    getAll,
    del,
    clearStore,
    Settings,
    LS,
    SyncQueue,
  };

})();

window.DB = DB;
