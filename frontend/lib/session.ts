"use client";
import { useSyncExternalStore } from "react";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
  };
}
export function useSignedIn() {
  return useSyncExternalStore(
    subscribe,
    () => Boolean(localStorage.getItem("token")),
    () => false,
  );
}
export function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("storage"));
}
