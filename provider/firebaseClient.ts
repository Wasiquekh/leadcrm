// provider/firebaseClient.ts
"use client";

import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let messaging: Messaging | null = null;

/** Initialize Firebase + Messaging (safe to call multiple times) */
export async function setupFirebase(): Promise<Messaging | null> {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  return messaging;
}

/** Request browser permission and return (or cache) an FCM token */
export async function getFcmTokenOnce(): Promise<string | null> {
  const m = messaging ?? (await setupFirebase());
  if (!m) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const token = await getToken(m, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
  }).catch(() => null);

  return token ?? null;
}

/** When a foreground message arrives, emit a window event your UI can listen for */
export function bindForegroundListener() {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    window.dispatchEvent(new CustomEvent("fcm-message", { detail: payload }));
  });
}
