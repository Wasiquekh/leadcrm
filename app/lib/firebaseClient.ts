"use client";
import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
} from "firebase/messaging";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let messagingRef: Messaging | null = null;

export async function initMessaging(): Promise<Messaging | null> {
  const ok = await isSupported().catch(() => false);
  if (!ok) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  messagingRef = getMessaging(app);
  return messagingRef;
}

export async function getFcmTokenOnce(): Promise<string | null> {
  const m = messagingRef ?? (await initMessaging());
  if (!m) return null;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;
  try {
    const token = await getToken(m, { vapidKey });
    return token || null;
  } catch (e) {
    console.error("getToken failed", e);
    return null;
  }
}

// Foreground bridge → your UI can listen for "fcm-message"
export function bindForegroundToWindowEvent() {
  if (!messagingRef) return;
  onMessage(messagingRef, (payload) => {
    window.dispatchEvent(new CustomEvent("fcm-message", { detail: payload }));
  });
}
