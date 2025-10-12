/* eslint-disable no-undef */

// Load Firebase libraries
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js"
);

// 🔧 Initialize Firebase (same keys as in your .env)
firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
});

// 🔔 Set up background notification handler
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("📨 Received background message: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // optional: put any 96×96 px icon in /public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
