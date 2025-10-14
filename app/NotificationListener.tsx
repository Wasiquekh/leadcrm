"use client";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase-config";

const APP_BASE_URL = "http://localhost:3000"; // Or use process.env.APP_BASE_URL

const NotificationListener = () => {
  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log("📩 Notification received:", payload);

      const { notification, data } = payload;

      const title = notification?.title || "No Title";
      const body = notification?.body || "No Body";

      // Determine lead ID: single or bulk
      const leadId = data?.lead_id || data?.sample_lead_id || null;

      // Construct URL only if leadId exists
      const notificationUrl = leadId
        ? `${APP_BASE_URL}/leadsdetails?id=${encodeURIComponent(leadId)}`
        : null;

      // Show alert for testing (optional)
      alert(`${title}\n${body}`);

      // Open lead details in a new tab if URL exists
      if (notificationUrl) {
        window.open(notificationUrl, "_blank");
      }
    });
  }, []);

  return null;
};

export default NotificationListener;
