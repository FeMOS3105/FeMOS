const CACHE_NAME = "femos-v1";
const PRECACHE = [
  "/",
  "/dashboard.html",
  "/login.html",
  "/signup.html",
  "/registration.html",
  "/theme.css",
  "/theme.js",
  "/fcm.js",
  "/reset-password.html",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("push", function (event) {
  var data = { title: "FeMOS", body: "You have a new notification." };
  if (event.data) {
    try {
      var raw = event.data.json();
      /* FCM sends notification nested under .notification */
      if (raw.notification) {
        data.title = raw.notification.title || data.title;
        data.body = raw.notification.body || data.body;
        data.tag = raw.notification.tag;
        data.url = (raw.data && raw.data.url) || "/dashboard.html";
      } else {
        data.title = raw.title || data.title;
        data.body = raw.body || data.body;
        data.tag = raw.tag;
        data.url = raw.url || "/dashboard.html";
      }
    } catch (e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
      badge: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
      vibrate: [200, 100, 200],
      tag: data.tag || "femos-notification",
      data: data.url || "/dashboard.html",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(event.notification.data || "/dashboard.html");
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data || "/dashboard.html");
    })
  );
});
