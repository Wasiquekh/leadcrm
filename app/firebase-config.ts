import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration

export const firebaseConfig = {
  apiKey: "AIzaSyDq8IQ89z1cW4UCdnoDmH0xrf0AefyF6vI", // Replace with your Firebase API Key
  authDomain: "manage-lead-crm.firebaseapp.com", // Replace with your Firebase Auth domain
  projectId: "manage-lead-crm", // Replace with your Firebase Project ID
  storageBucket: "manage-lead-crm.firebasestorage.app", // Replace with your Firebase storage bucket
  messagingSenderId: "710494034011", // Replace with your Sender ID
  appId: "1:710494034011:web:86a614c36a3d8e6154c77e", // Replace with your App ID
  measurementId: "G-J71349ZJQ0", // Replace with your Measurement ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };


// Initialize App Check
// export const appCheck = (() => {
//   if (typeof window !== "undefined") {
//     return initializeAppCheck(app, {
//       provider: new ReCaptchaV3Provider("6LeNlSAqAAAAAGbgvmjfMsR2zwWpGCFL4RqDg9uE"),
//       isTokenAutoRefreshEnabled: true,
//     });
//   }
//   return null;
// })();

// Initialize Analytics
export const analytics = (() => {
  if (typeof window !== "undefined") {
    return getAnalytics(app);
  }
  return null;
})();
export { app, };
