/**
 * Section: Layout | Type: Client | Deps: phosphor icons
 */
"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";

type Theme = "system" | "light" | "dark";

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Desktop },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

const STORAGE_KEY = "theme";
const MQ = "(prefers-color-scheme: dark)";

function readStorage(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    /* ignore */
    return "system";
  }
}

function isDark(theme: Theme) {
  return theme === "dark" || (theme === "system" && window.matchMedia(MQ).matches);
}

let theme: Theme = "system";
if (typeof window !== "undefined") {
  theme = readStorage();
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return theme;
}

function getServerSnapshot() {
  return "system";
}

function applyToDom(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark(next));
  root.style.colorScheme = next === "system" ? "light dark" : next;
}

function setTransitionOrigin(origin?: HTMLElement) {
  const toggle =
    origin ??
    Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme-toggle]"),
    ).find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  if (!toggle) return;

  const rect = toggle.getBoundingClientRect();
  const root = document.documentElement;
  root.style.setProperty("--theme-origin-x", `${rect.left + rect.width / 2}px`);
  root.style.setProperty("--theme-origin-y", `${rect.top + rect.height / 2}px`);
}

function wash(callback: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (typeof doc.startViewTransition !== "function") {
    const root = document.documentElement;
    root.classList.add("theme-swap");
    callback();
    window.setTimeout(() => root.classList.remove("theme-swap"), 1100);
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    callback();
    return;
  }
  doc.startViewTransition(callback);
}

function commit(next: Theme, origin: HTMLElement) {
  theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  setTransitionOrigin(origin);
  wash(() => applyToDom(next));
  listeners.forEach((render) => render());
}

export function ThemeToggle() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyToDom(theme);
    const mq = window.matchMedia(MQ);
    const onChange = () => {
      if (theme === "system") {
        setTransitionOrigin();
        wash(() => applyToDom(theme));
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      data-theme-toggle
      className="inline-flex w-fit self-start items-center rounded-full border border-gray-200 bg-background p-0.5 dark:border-gray-800"
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={`${label} mode`}
          aria-pressed={current === value}
          onClick={(event) => commit(value, event.currentTarget)}
          className={`rounded-full p-1 transition-colors ${
            current === value
              ? "bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          }`}
        >
          <Icon size={14} weight="bold" />
        </button>
      ))}
    </div>
  );
}
