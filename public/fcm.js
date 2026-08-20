/* ===== Firebase Cloud Messaging Module ===== */
/* Requires: firebase-app-compat.js, firebase-auth-compat.js, firebase-messaging-compat.js */
/* Call initFCM(user) after auth state is confirmed */
(function () {
  var messaging = null;
  var VAPID_KEY = "BEHBBOkBHmml4skMa9uYDX_fu7yGm9Zqj0GKEnguIpdhoh5AaNgNF4FZRgLM_bIHO29AasKZidpe1vhLePtrAoc";

  window.initFCM = async function (user) {
    if (!user || !firebase.messaging) return;
    try {
      messaging = firebase.messaging();

      /* --- Request permission if not yet granted --- */
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission !== "granted") return;

      /* --- Get FCM token --- */
      var token = await messaging.getToken({ vapidKey: VAPID_KEY });
      if (!token) return;

      /* --- Save token to user's Firestore document --- */
      await db.collection("users").doc(user.uid).set({
        fcmToken: token,
        fcmTokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      /* --- Listen for token refresh --- */
      messaging.onTokenRefresh(async function () {
        try {
          var newToken = await messaging.getToken({ vapidKey: VAPID_KEY });
          if (newToken) {
            await db.collection("users").doc(user.uid).set({
              fcmToken: newToken,
              fcmTokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          }
        } catch (e) {}
      });

      /* --- Listen for foreground messages --- */
      messaging.onMessage(function (payload) {
        var title = (payload.notification && payload.notification.title) || "FeMOS";
        var body = (payload.notification && payload.notification.body) || "";
        var url = (payload.data && payload.data.url) || "/dashboard.html";
        if (typeof showLocalNotification === "function") {
          showLocalNotification(title, body, url);
        }
      });
    } catch (e) {
      /* FCM init failed silently — app still works via onSnapshot */
    }
  };

  /* --- Remove token on logout --- */
  window.removeFCMToken = async function (user) {
    if (!user) return;
    try {
      await db.collection("users").doc(user.uid).set({
        fcmToken: null,
        fcmTokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (e) {}
  };
})();
