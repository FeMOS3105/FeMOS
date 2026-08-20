const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

exports.sendAnnouncementPush = functions.firestore
  .document("announcements/{announcementId}")
  .onCreate(async (snap, context) => {
    const ann = snap.data();
    if (!ann) return null;

    const { institutionId, courseId, level, title, body, createdByName } = ann;
    const annTitle = title || "FeMOS";
    const annBody = (body || "").substring(0, 200);

    let studentsQuery;
    if (level === "institution") {
      studentsQuery = db.collection("users")
        .where("institutionId", "==", institutionId)
        .where("courseId", "!=", null);
    } else {
      studentsQuery = db.collection("users")
        .where("institutionId", "==", institutionId)
        .where("courseId", "==", courseId);
    }

    const studentsSnap = await studentsQuery.get();
    const tokens = [];

    for (const doc of studentsSnap.docs) {
      const data = doc.data();
      if (data.fcmToken) tokens.push(data.fcmToken);
    }

    if (tokens.length === 0) return null;

    const notification = {
      title: "New Announcement: " + annTitle,
      body: annBody,
    };

    const webpush = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
        badge: "https://res.cloudinary.com/j8zmetxr/image/upload/v1784632765/FeOS_hwl9eh.png",
        vibrate: [200, 100, 200],
        tag: "femos-ann-" + context.params.announcementId,
        data: { url: "/dashboard.html" },
      },
    };

    const message = { notification, webpush, tokens };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log("FCM sent: " + response.successCount + " success, " + response.failureCount + " failed");

      /* Clean up invalid tokens */
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        if (failedTokens.length > 0) {
          const batch = db.batch();
          for (const doc of studentsSnap.docs) {
            const data = doc.data();
            if (failedTokens.includes(data.fcmToken)) {
              batch.update(doc.ref, { fcmToken: null });
            }
          }
          await batch.commit();
        }
      }
    } catch (err) {
      console.error("FCM error:", err);
    }

    return null;
  });
