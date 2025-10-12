"use client";
import { useContext } from "react";
import { AppContext } from "@/app/AppContext";
import { useRegisterPush } from "@/app/component/hooks/useRegisterPush";

export default function PushInitializer() {
  const ctx = useContext(AppContext);
  const shouldRegister = !!ctx?.isLoggedIn;
  useRegisterPush(shouldRegister);
  return null;
}
