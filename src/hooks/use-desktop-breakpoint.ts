/**
 * Hook: useDesktopBreakpoint | Type: Client
 * Mirrors Tailwind's default lg breakpoint for conditional mounting.
 */
"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useDesktopBreakpoint() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
