"use client";
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDq8IQ89z1cW4UCdnoDmH0xrf0AefyF6vI", // Replace with your Firebase API Key
  authDomain: "manage-lead-crm.firebaseapp.com", // Replace with your Firebase Auth domain
  projectId: "manage-lead-crm", // Replace with your Firebase Project ID
  storageBucket: "manage-lead-crm.firebasestorage.app", // Replace with your Firebase storage bucket
  messagingSenderId: "710494034011", // Replace with your Sender ID
  appId: "1:710494034011:web:86a614c36a3d8e6154c77e", // Replace with your App ID
  measurementId: "G-J71349ZJQ0", // Replace with your Measurement ID
});

// const app = initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background notification received:", payload);

  const { notification, data } = payload;
  const title = notification?.title || "No Title";
  const body = notification?.body || "No Body";

  // Show notification using the Notification API
  self.registration.showNotification(title, {
    body,
    icon: "/path/to/icon.png", // Optional icon
  });

  // Handle the notification click event
  self.addEventListener("notificationclick", (event) => {
    const notificationUrl = data?.lead_id
      ? `https://localhost:3000/leadsdetails?id=${encodeURIComponent(
          data?.lead_id
        )}`
      : "/";

    event.notification.close(); // Close the notification
    event.waitUntil(clients.openWindow(notificationUrl)); // Open the link in a new window
  });
});
