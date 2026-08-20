(function () {
  var SALT = "femos-enc-v1";
  var DB_KEY = "femosDataKey";

  async function getDerivedKey(uid) {
    var enc = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(uid),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode(SALT), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function ensureDataKey(uid) {
    var existing = sessionStorage.getItem(DB_KEY);
    if (existing) return existing;
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    var raw = btoa(String.fromCharCode.apply(null, arr));
    sessionStorage.setItem(DB_KEY, raw);
    var enc = new TextEncoder();
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var aesKey = await getDerivedKey(uid);
    var cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      enc.encode(raw)
    );
    return btoa(String.fromCharCode.apply(null, iv)) + "." + btoa(String.fromCharCode.apply(null, new Uint8Array(cipher)));
  }

  async function retrieveDataKey(uid, wrapped) {
    var parts = wrapped.split(".");
    var iv = new Uint8Array(atob(parts[0]).split("").map(function (c) { return c.charCodeAt(0); }));
    var data = new Uint8Array(atob(parts[1]).split("").map(function (c) { return c.charCodeAt(0); }));
    var aesKey = await getDerivedKey(uid);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, aesKey, data);
    return new TextDecoder().decode(plain);
  }

  async function encryptData(uid, plaintext) {
    if (!plaintext || !uid) return plaintext;
    var keyB64 = sessionStorage.getItem(DB_KEY);
    if (!keyB64) {
      var raw = new Uint8Array(16);
      crypto.getRandomValues(raw);
      keyB64 = btoa(String.fromCharCode.apply(null, raw));
      sessionStorage.setItem(DB_KEY, keyB64);
    }
    var rawBytes = new Uint8Array(atob(keyB64).split("").map(function (c) { return c.charCodeAt(0); }));
    var enc = new TextEncoder();
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await crypto.subtle.importKey("raw", rawBytes, { name: "AES-GCM" }, false, ["encrypt"]);
    var cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(String(plaintext)));
    return "enc:" + btoa(String.fromCharCode.apply(null, iv)) + "." + btoa(String.fromCharCode.apply(null, new Uint8Array(cipher)));
  }

  async function decryptData(uid, ciphertext) {
    if (!ciphertext || !uid) return ciphertext;
    if (typeof ciphertext === "string" && ciphertext.indexOf("enc:") !== 0) return ciphertext;
    var wrapped = ciphertext.slice(4);
    var parts = wrapped.split(".");
    var iv = new Uint8Array(atob(parts[0]).split("").map(function (c) { return c.charCodeAt(0); }));
    var data = new Uint8Array(atob(parts[1]).split("").map(function (c) { return c.charCodeAt(0); }));
    var keyB64 = sessionStorage.getItem(DB_KEY);
    if (!keyB64) throw new Error("No data key in session");
    var rawBytes = new Uint8Array(atob(keyB64).split("").map(function (c) { return c.charCodeAt(0); }));
    var key = await crypto.subtle.importKey("raw", rawBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    return new TextDecoder().decode(plain);
  }

  async function encryptFields(uid, obj, fields) {
    var out = Object.assign({}, obj);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (out[f]) out[f] = await encryptData(uid, out[f]);
    }
    return out;
  }

  async function decryptFields(uid, obj, fields) {
    var out = Object.assign({}, obj);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (out[f]) out[f] = await decryptData(uid, out[f]);
    }
    return out;
  }

  window.FeMOSEncrypt = {
    encrypt: encryptData,
    decrypt: decryptData,
    encryptFields: encryptFields,
    decryptFields: decryptFields
  };
})();
