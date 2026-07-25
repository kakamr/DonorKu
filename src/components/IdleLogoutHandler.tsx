"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const IDLE_LIMIT_MS = 15 * 60 * 1000; 
const WARNING_BEFORE_MS = 60 * 1000; 

export default function IdleLogoutHandler() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/login");
    }
  }, [router]);

  const resetTimers = useCallback(() => {
    setShowWarning(false);

    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_LIMIT_MS - WARNING_BEFORE_MS);
    
    idleTimer.current = setTimeout(() => {
      handleLogout();
    }, IDLE_LIMIT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimers));
    resetTimers();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimers));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [resetTimers]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <h2 className="mb-3 text-2xl font-extrabold text-black">Sesi Akan Berakhir</h2>
        <p className="mb-8 text-base text-gray-600">
          Anda tidak beraktivitas selama beberapa saat. Sesi akan otomatis keluar dalam 1 menit.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={resetTimers}
            className="flex-1 rounded-full bg-red-600 py-3 font-semibold text-white hover:brightness-105"
          >
            Tetap Login
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 rounded-full border border-gray-300 py-3 font-semibold text-black hover:bg-gray-50"
          >
            Keluar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}