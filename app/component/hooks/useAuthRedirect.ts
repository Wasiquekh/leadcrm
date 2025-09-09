"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StorageManager from "../../../provider/StorageManager";
import { isTokenExpired } from "../utils/authUtils";

const storage = new StorageManager();

/**
 * Returns true while checking; false once done.
 * NOTE: Never clears StorageManager or localStorage (per your request).
 */
export const useAuthRedirect = (): boolean => {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read token from StorageManager; keep LS values intact.
    const token =
      (storage.getAccessToken && storage.getAccessToken()) ||
      localStorage.getItem("authToken") || // fallback only
      localStorage.getItem("accessToken"); // fallback only

    let invalid = !token || token === "null" || token.trim() === "";

    if (!invalid) {
      try {
        invalid = isTokenExpired(token);
      } catch {
        // if parsing fails, treat as invalid (still do not clear storage)
        invalid = true;
      }
    }

    if (invalid) {
      // Do NOT clear storage; just redirect.
      router.replace("/"); // change to "/login" if your login route is that
      setChecking(false);
      return;
    }

    setChecking(false);
  }, [router]);

  return checking;
};
