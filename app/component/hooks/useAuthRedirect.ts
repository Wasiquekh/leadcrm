"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "../utils/authUtils";

export const useAuthRedirect = (): boolean => {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (
      !token ||
      token === "null" ||
      token.trim() === "" ||
      isTokenExpired(token)
    ) {
      localStorage.clear();
      router.replace("/");
    } else {
      setChecking(false); // ✅ Only mark done if valid
    }
  }, [router]);
  return checking; // <-- REQUIRED
};
