(function () {
  /* ===== Service Worker ===== */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  }

  /* ===== Notifications ===== */
  window._femosNotify = { permission: typeof Notification !== "undefined" ? Notification.permission : "denied" };

  window.requestNotifyPermission = function () {
    if (typeof Notification === "undefined") return Promise.resolve("denied");
    if (Notification.permission === "granted") { window._femosNotify.permission = "granted"; return Promise.resolve("granted"); }
    if (Notification.permission === "denied") return Promise.resolve("denied");
    return Notification.requestPermission().then(function (p) { window._femosNotify.permission = p; return p; });
  };

  window.showLocalNotification = function (title, body, url) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    var tag = "femos-" + Date.now();
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function (reg) {
          reg.showNotification(title, {
            body: body,
            icon: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
            badge: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
            vibrate: [200, 100, 200],
            tag: tag,
            data: url || "/dashboard.html",
          });
        });
      } else if (typeof Notification !== "undefined") {
        new Notification(title, { body: body, icon: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png", tag: tag });
      }
    } catch (e) {}
  };

  /* ===== Install Button ===== */
  var INSTALL_KEY = "femos-installed";

  function isInstalled() {
    return localStorage.getItem(INSTALL_KEY) === "true" || window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  window._deferredPrompt = null;

  function createInstallBtn() {
    if (isInstalled()) return;
    if (document.getElementById("pwaInstallBtn")) return;

    var btn = document.createElement("button");
    btn.id = "pwaInstallBtn";
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Install FeMOS</span>';
    btn.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:10000;display:flex;align-items:center;gap:8px;padding:14px 22px;border:none;border-radius:14px;background:linear-gradient(135deg,#2ea8ee,#155fd1);color:#fff;font-weight:700;font-size:0.88rem;font-family:'Segoe UI',system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 28px rgba(21,95,209,0.4);transition:all 0.3s ease;animation:pwaSlideIn 0.4s ease;";
    btn.addEventListener("mouseenter", function () { btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = "0 12px 36px rgba(21,95,209,0.5)"; });
    btn.addEventListener("mouseleave", function () { btn.style.transform = "translateY(0)"; btn.style.boxShadow = "0 8px 28px rgba(21,95,209,0.4)"; });

    btn.addEventListener("click", function () {
      if (!window._deferredPrompt) {
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Use your browser menu to install</span>';
        setTimeout(function () { btn.remove(); }, 3000);
        return;
      }
      window._deferredPrompt.prompt();
      window._deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === "accepted") {
          localStorage.setItem(INSTALL_KEY, "true");
          btn.style.opacity = "0";
          btn.style.transform = "translateY(20px)";
          setTimeout(function () { btn.remove(); }, 300);
        }
        window._deferredPrompt = null;
      });
    });

    document.body.appendChild(btn);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window._deferredPrompt = e;
    if (!isInstalled()) createInstallBtn();
  });

  window.addEventListener("appinstalled", function () {
    localStorage.setItem(INSTALL_KEY, "true");
    var btn = document.getElementById("pwaInstallBtn");
    if (btn) btn.remove();
  });

  if (!isInstalled()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { setTimeout(createInstallBtn, 1500); });
    } else {
      setTimeout(createInstallBtn, 1500);
    }
  }
})();
