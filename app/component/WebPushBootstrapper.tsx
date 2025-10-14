// // app/component/WebPushBootstrapper.tsx
// "use client";

// import { useEffect } from "react";
// import {
//   setupFirebase,
//   getFcmTokenOnce,
//   bindForegroundListener,
// } from "@/provider/firebaseClient";
// import AxiosProvider from "@/provider/AxiosProvider"; // axios instance (no `new`)

// export default function WebPushBootstrapper() {
//   useEffect(() => {
//     // 1) Register the service worker for background notifications
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker
//         .register("/firebase-messaging-sw.js", { scope: "/" })
//         .then(() => console.log("[SW] registered"))
//         .catch(console.error);
//     }

//     // 2) Init Firebase Messaging, bind foreground listener, get & register token
//     (async () => {
//       const messaging = await setupFirebase();
//       if (!messaging) {
//         console.warn("FCM not supported in this browser");
//         return;
//       }

//       // send foreground messages as window events
//       bindForegroundListener();

//       // avoid requesting a new token if we already stored one
//       let token = localStorage.getItem("fcmtoken");
//       if (!token) {
//         try {
//           token = await getFcmTokenOnce();
//           if (token) localStorage.setItem("fcmtoken", token);
//         } catch (err) {
//           console.error("[FCM] failed to get token", err);
//         }
//       }

//       // register token with backend using your AxiosProvider base URL
//       if (token) {
//         try {
//           const res = await AxiosProvider.post("/register-fcm", {
//             fcmtoken: token,
//           });
//           console.log("[FCM] token registered with backend:", res?.data);
//         } catch (e) {
//           console.error("[FCM] backend registration failed", e);
//         }
//       } else {
//         console.log("[FCM] no token (permission denied or unsupported)");
//       }
//     })();
//   }, []);

//   return null;
// }
