// app/component/MiniBell.tsx
"use client";

import { useEffect, useState } from "react";

export default function MiniBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onMsg = () => setCount((c) => c + 1);
    window.addEventListener("fcm-message", onMsg);
    return () => window.removeEventListener("fcm-message", onMsg);
  }, []);

  return (
    <button
      type="button"
      aria-label="Notifications"
      className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
      onClick={() => setCount(0)} // click to clear (simple UX)
    >
      <span>🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-xs flex items-center justify-center rounded-full bg-red-600 text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
