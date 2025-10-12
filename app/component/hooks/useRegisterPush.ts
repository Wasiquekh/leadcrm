"use client";
import { useEffect, useRef } from "react";
//import AxiosProvider from "@/app/component/utils/AxiosProvider";
import AxiosProvider from "@/provider/AxiosProvider";
import { fetchFcmToken, onForegroundMessage } from "@/provider/firebaseClient";
//import { fetchFcmToken, onForegroundMessage } from "@/app/provider/firebaseClient";

const LS_KEY = "fcm_token_v1";

export function useRegisterPush(shouldRegister: boolean) {
  const registered = useRef(false);

  useEffect(() => {
    if (!shouldRegister || registered.current) return;
    (async () => {
      try {
        const token = await fetchFcmToken();
        if (!token) return;

        const last = localStorage.getItem(LS_KEY);
        if (last !== token) {
          await AxiosProvider.post("/register-fcm", { fcmtoken: token });
          localStorage.setItem(LS_KEY, token);
        }
        registered.current = true;

        onForegroundMessage((payload) => {
          // optional toast or console
          console.log("Foreground FCM:", payload);
        });
      } catch (err) {
        console.error("Register push error:", err);
      }
    })();
  }, [shouldRegister]);
}
